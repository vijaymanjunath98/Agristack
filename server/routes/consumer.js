import express from 'express'
import { getDb } from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { runAnalyticsEngine } from '../engine/analyticsEngine.js'

const router = express.Router()

router.get('/dashboard', requireAuth, requireRole('buyer', 'admin'), (req, res) => {
  const db = getDb()
  const plans = db
    .prepare(
      `SELECT fp.*, f.name as farmer_name, f.farmer_code
       FROM farmer_crop_plans fp
       JOIN farmers f ON fp.farmer_id = f.id
       ORDER BY fp.id DESC`
    )
    .all()
  const demands = db.prepare('SELECT * FROM consumer_demand ORDER BY id DESC').all()
  const orders = db.prepare('SELECT * FROM buyer_orders ORDER BY id DESC').all()
  return res.json({ plans, demands, orders })
})

router.post('/demand', requireAuth, requireRole('buyer', 'admin'), (req, res) => {
  const db = getDb()
  const {
    cropName,
    season = 'Rabi',
    qtyRequiredKg,
    expectedPricePerQt,
    deliveryLocation,
    state = req.user.state || 'Madhya Pradesh',
    district = req.user.district || 'Sehore',
    taluk = 'All',
    village = 'All',
    requiredDeliveryDate,
    buyerCategory = 'Wholesale',
    demandType = 'confirmed',
  } = req.body

  if (!cropName || !qtyRequiredKg || !expectedPricePerQt || !deliveryLocation || !requiredDeliveryDate) {
    return res.status(400).json({
      error: 'cropName, qtyRequiredKg, expectedPricePerQt, deliveryLocation, and requiredDeliveryDate are required.',
    })
  }

  const verifiedStatus = demandType === 'confirmed' ? 'Verified' : 'Unverified'

  const info = db
    .prepare(
      `INSERT INTO consumer_demand (
        buyer_id, buyer_name, crop_name, season, qty_required_kg, reserved_qty_kg,
        expected_price_per_qt, delivery_location, state, district, taluk, village,
        required_delivery_date, buyer_category, verified_status, demand_type, data_source
      ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Buyer Dashboard')`
    )
    .run(
      req.user.id,
      req.user.name,
      cropName.trim(),
      season,
      Number(qtyRequiredKg),
      Number(expectedPricePerQt),
      deliveryLocation.trim(),
      state,
      district,
      taluk,
      village,
      requiredDeliveryDate,
      buyerCategory,
      verifiedStatus,
      demandType
    )

  runAnalyticsEngine(db)
  const demand = db.prepare('SELECT * FROM consumer_demand WHERE id = ?').get(info.lastInsertRowid)
  return res.status(201).json({ demand, message: 'Consumer demand posted and market demand updated.' })
})

router.post('/orders', requireAuth, requireRole('buyer', 'admin'), (req, res) => {
  const db = getDb()
  const { farmerPlanId, requestedQtyKg, agreedPricePerQt } = req.body
  const qty = Number(requestedQtyKg)

  if (!farmerPlanId || !qty || qty <= 0) {
    return res.status(400).json({ error: 'farmerPlanId and positive requestedQtyKg are required.' })
  }

  const plan = db.prepare('SELECT * FROM farmer_crop_plans WHERE id = ?').get(farmerPlanId)
  if (!plan) return res.status(404).json({ error: 'Farmer crop plan not found.' })

  const remaining = plan.planned_production_kg - plan.committed_qty_kg
  if (qty > remaining) {
    return res.status(400).json({
      error: `Only ${remaining} kg uncommitted remaining on this crop plan.`,
    })
  }

  db.prepare('UPDATE farmer_crop_plans SET committed_qty_kg = committed_qty_kg + ? WHERE id = ?').run(qty, plan.id)

  const info = db
    .prepare(
      `INSERT INTO buyer_orders (
        demand_id, farmer_plan_id, buyer_id, buyer_name, farmer_id,
        crop_name, requested_qty_kg, reserved_qty_kg, confirmed_qty_kg, delivered_qty_kg,
        agreed_price_per_qt, status
      ) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'Reserved')`
    )
    .run(
      plan.id,
      req.user.id,
      req.user.name,
      plan.farmer_id,
      plan.crop_name,
      qty,
      qty,
      0,
      Number(agreedPricePerQt || plan.expected_price_per_qt)
    )

  runAnalyticsEngine(db)
  const order = db.prepare('SELECT * FROM buyer_orders WHERE id = ?').get(info.lastInsertRowid)
  return res.status(201).json({ order, message: 'Order reserved against farmer production plan.' })
})

router.put('/orders/:id/status', requireAuth, requireRole('buyer', 'farmer', 'admin'), (req, res) => {
  const db = getDb()
  const { status } = req.body
  const allowed = ['Reserved', 'Confirmed', 'Delivered', 'Cancelled']
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Allowed: ${allowed.join(', ')}` })
  }

  const order = db.prepare('SELECT * FROM buyer_orders WHERE id = ?').get(req.params.id)
  if (!order) return res.status(404).json({ error: 'Order not found.' })

  if (order.status === 'Cancelled' || order.status === 'Delivered') {
    return res.status(400).json({ error: `Cannot transition order from ${order.status} to ${status}.` })
  }

  let confirmedQty = order.confirmed_qty_kg
  let deliveredQty = order.delivered_qty_kg

  if (status === 'Confirmed') {
    confirmedQty = order.reserved_qty_kg
  } else if (status === 'Delivered') {
    confirmedQty = order.reserved_qty_kg
    deliveredQty = order.reserved_qty_kg
  } else if (status === 'Cancelled') {
    // Release locked commitment on farmer crop plan & consumer demand
    db.prepare('UPDATE farmer_crop_plans SET committed_qty_kg = MAX(0, committed_qty_kg - ?) WHERE id = ?').run(
      order.reserved_qty_kg,
      order.farmer_plan_id
    )
    if (order.demand_id) {
      db.prepare('UPDATE consumer_demand SET reserved_qty_kg = MAX(0, reserved_qty_kg - ?) WHERE id = ?').run(
        order.reserved_qty_kg,
        order.demand_id
      )
    }
    confirmedQty = 0
    deliveredQty = 0
  }

  db.prepare(
    `UPDATE buyer_orders SET status = ?, confirmed_qty_kg = ?, delivered_qty_kg = ? WHERE id = ?`
  ).run(status, confirmedQty, deliveredQty, order.id)

  runAnalyticsEngine(db)
  const updated = db.prepare('SELECT * FROM buyer_orders WHERE id = ?').get(order.id)
  return res.json({ order: updated, message: `Order #${order.id} updated to ${status}.` })
})

export default router
