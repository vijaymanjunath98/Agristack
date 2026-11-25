import express from 'express'
import { getDb } from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { runAnalyticsEngine } from '../engine/analyticsEngine.js'

const router = express.Router()

function resolveFarmer(db, user) {
  let farmer = db.prepare('SELECT * FROM farmers WHERE user_id = ?').get(user.id)
  if (!farmer) {
    farmer = db.prepare('SELECT * FROM farmers ORDER BY id ASC LIMIT 1').get()
  }
  return farmer
}

router.get('/dashboard', requireAuth, requireRole('farmer', 'agent', 'admin'), (req, res) => {
  const db = getDb()
  const farmer = resolveFarmer(db, req.user)
  const plans = farmer
    ? db.prepare('SELECT * FROM farmer_crop_plans WHERE farmer_id = ? ORDER BY id DESC').all(farmer.id)
    : []
  const allPlans = db.prepare('SELECT fp.*, f.name as farmer_name, f.farmer_code FROM farmer_crop_plans fp JOIN farmers f ON fp.farmer_id = f.id ORDER BY fp.id DESC').all()
  const demands = db.prepare('SELECT * FROM consumer_demand ORDER BY id DESC').all()
  const orders = farmer
    ? db.prepare('SELECT * FROM buyer_orders WHERE farmer_id = ? ORDER BY id DESC').all(farmer.id)
    : []
  const alerts = db.prepare('SELECT * FROM price_alerts WHERE is_active = 1 ORDER BY id DESC').all()

  return res.json({
    farmer,
    plans,
    allPlans,
    demands,
    orders,
    alerts,
  })
})

router.post('/crop-plan', requireAuth, requireRole('farmer', 'agent', 'admin'), (req, res) => {
  const db = getDb()
  const farmer = resolveFarmer(db, req.user)
  if (!farmer) {
    return res.status(404).json({ error: 'Farmer profile not found.' })
  }

  const {
    cropName,
    season = 'Rabi',
    state = farmer.state,
    district = farmer.district,
    taluk = farmer.taluk,
    village = farmer.village,
    totalLandHa = farmer.total_land_ha,
    plannedAreaHa,
    sowingDate,
    expectedHarvestDate,
    expectedYieldKgPerHa,
    irrigationAvailable = farmer.irrigation_available,
    currentGrowingCrop = '',
    currentProductionKg = 0,
    expectedPricePerQt = 2500,
  } = req.body

  if (!cropName || !plannedAreaHa || !expectedYieldKgPerHa || !sowingDate || !expectedHarvestDate) {
    return res.status(400).json({
      error: 'cropName, plannedAreaHa, expectedYieldKgPerHa, sowingDate, and expectedHarvestDate are required.',
    })
  }

  const area = Number(plannedAreaHa)
  const yieldVal = Number(expectedYieldKgPerHa)
  const totalLand = Number(totalLandHa)
  if (area <= 0 || yieldVal <= 0 || area > totalLand) {
    return res.status(400).json({
      error: 'Planned area must be positive and cannot exceed total available land.',
    })
  }

  const estimatedProductionKg = Math.round(area * yieldVal)

  const info = db
    .prepare(
      `INSERT INTO farmer_crop_plans (
        farmer_id, crop_name, season, state, district, taluk, village,
        total_land_ha, planned_area_ha, sowing_date, expected_harvest_date,
        expected_yield_kg_per_ha, estimated_production_kg, current_growing_crop,
        current_production_kg, planned_production_kg, committed_qty_kg,
        irrigation_available, expected_price_per_qt, verified_status, data_source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'Pending Verification', 'Farmer Input System')`
    )
    .run(
      farmer.id,
      cropName.trim(),
      season,
      state,
      district,
      taluk,
      village,
      totalLand,
      area,
      sowingDate,
      expectedHarvestDate,
      yieldVal,
      estimatedProductionKg,
      currentGrowingCrop,
      Number(currentProductionKg) || 0,
      estimatedProductionKg,
      irrigationAvailable,
      Number(expectedPricePerQt) || 2500
    )

  runAnalyticsEngine(db)
  const created = db.prepare('SELECT * FROM farmer_crop_plans WHERE id = ?').get(info.lastInsertRowid)
  return res.status(201).json({ plan: created, message: 'Crop plan saved and production forecast updated.' })
})

router.put('/crop-plan/:id', requireAuth, requireRole('farmer', 'agent', 'admin'), (req, res) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM farmer_crop_plans WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Crop plan not found.' })

  const area = Number(req.body.plannedAreaHa ?? existing.planned_area_ha)
  const yieldVal = Number(req.body.expectedYieldKgPerHa ?? existing.expected_yield_kg_per_ha)
  const estimatedProductionKg = Math.round(area * yieldVal)

  if (estimatedProductionKg < existing.committed_qty_kg) {
    return res.status(400).json({
      error: `Cannot reduce planned production below already committed quantity (${existing.committed_qty_kg} kg).`,
    })
  }

  db.prepare(
    `UPDATE farmer_crop_plans
     SET planned_area_ha = ?, expected_yield_kg_per_ha = ?, estimated_production_kg = ?,
         planned_production_kg = ?, current_production_kg = ?, expected_price_per_qt = ?
     WHERE id = ?`
  ).run(
    area,
    yieldVal,
    estimatedProductionKg,
    estimatedProductionKg,
    Number(req.body.currentProductionKg ?? existing.current_production_kg),
    Number(req.body.expectedPricePerQt ?? existing.expected_price_per_qt),
    existing.id
  )

  runAnalyticsEngine(db)
  const updated = db.prepare('SELECT * FROM farmer_crop_plans WHERE id = ?').get(existing.id)
  return res.json({ plan: updated, message: 'Crop plan updated and analytics refreshed.' })
})

router.post('/commit-demand', requireAuth, requireRole('farmer', 'admin'), (req, res) => {
  const db = getDb()
  const { farmerPlanId, demandId, commitQtyKg } = req.body
  const qty = Number(commitQtyKg)

  if (!farmerPlanId || !demandId || !qty || qty <= 0) {
    return res.status(400).json({ error: 'farmerPlanId, demandId, and positive commitQtyKg are required.' })
  }

  const plan = db.prepare('SELECT * FROM farmer_crop_plans WHERE id = ?').get(farmerPlanId)
  const demand = db.prepare('SELECT * FROM consumer_demand WHERE id = ?').get(demandId)
  if (!plan || !demand) {
    return res.status(404).json({ error: 'Farmer plan or buyer demand not found.' })
  }

  const remainingPlanQty = plan.planned_production_kg - plan.committed_qty_kg
  if (qty > remainingPlanQty) {
    return res.status(400).json({
      error: `Overbooking prevented: only ${remainingPlanQty} kg uncommitted remaining on this crop plan.`,
    })
  }

  const remainingDemandQty = demand.qty_required_kg - demand.reserved_qty_kg
  if (qty > remainingDemandQty) {
    return res.status(400).json({
      error: `Buyer only needs ${remainingDemandQty} kg more for this request.`,
    })
  }

  db.prepare('UPDATE farmer_crop_plans SET committed_qty_kg = committed_qty_kg + ? WHERE id = ?').run(qty, plan.id)
  db.prepare('UPDATE consumer_demand SET reserved_qty_kg = reserved_qty_kg + ? WHERE id = ?').run(qty, demand.id)

  const orderInfo = db
    .prepare(
      `INSERT INTO buyer_orders (
        demand_id, farmer_plan_id, buyer_id, buyer_name, farmer_id,
        crop_name, requested_qty_kg, reserved_qty_kg, confirmed_qty_kg, delivered_qty_kg,
        agreed_price_per_qt, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'Confirmed')`
    )
    .run(
      demand.id,
      plan.id,
      demand.buyer_id,
      demand.buyer_name,
      plan.farmer_id,
      plan.crop_name,
      demand.qty_required_kg,
      qty,
      qty,
      demand.expected_price_per_qt
    )

  runAnalyticsEngine(db)
  const order = db.prepare('SELECT * FROM buyer_orders WHERE id = ?').get(orderInfo.lastInsertRowid)
  return res.status(201).json({
    order,
    remainingUncommittedKg: remainingPlanQty - qty,
    message: `Locked ${qty} kg to ${demand.buyer_name}. Remaining uncommitted: ${remainingPlanQty - qty} kg.`,
  })
})

router.get('/recommendations', requireAuth, requireRole('farmer', 'agent', 'admin'), (req, res) => {
  const db = getDb()
  const farmer = resolveFarmer(db, req.user)
  if (!farmer) return res.json({ recommendations: [] })

  const recommendations = db
    .prepare('SELECT * FROM crop_recommendations WHERE farmer_id = ? ORDER BY score DESC LIMIT 5')
    .all(farmer.id)

  return res.json({ farmer, recommendations })
})

export default router
