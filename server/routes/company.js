import express from 'express'
import { getDb } from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { runAnalyticsEngine } from '../engine/analyticsEngine.js'

const router = express.Router()

router.get('/dashboard', requireAuth, requireRole('company', 'admin'), (req, res) => {
  const db = getDb()
  const sales = db.prepare('SELECT * FROM company_seed_sales ORDER BY id DESC').all()
  const inventory = db.prepare('SELECT * FROM seed_inventory ORDER BY id DESC').all()

  return res.json({
    companyName: req.user.name,
    sales,
    inventory,
    note: 'Seed sales are tracked strictly as an early planting-intention indicator, not guaranteed cultivated area or production.',
  })
})

router.post('/seed-sales', requireAuth, requireRole('company', 'admin'), (req, res) => {
  const db = getDb()
  const {
    companyName = req.user.name,
    state = req.user.state || 'Madhya Pradesh',
    district = req.user.district || 'Sehore',
    taluk = req.user.taluk || 'All',
    village = req.user.village || 'All',
    salesRegion,
    cropName,
    cropVariety,
    seedType = 'Certified',
    qtySoldKg = 0,
    qtyBookedKg = 0,
    seedRateKgPerHa = 0,
    expectedSowingSeason = 'Rabi',
    salesDate = new Date().toISOString().slice(0, 10),
  } = req.body

  if (!cropName || !cropVariety || !salesRegion) {
    return res.status(400).json({ error: 'cropName, cropVariety, and salesRegion are required.' })
  }

  const sold = Number(qtySoldKg) || 0
  const booked = Number(qtyBookedKg) || 0
  const seedRate = Number(seedRateKgPerHa) || 0

  // Only estimate area if verified seed-rate conversion data is available
  const estimatedAreaHa =
    seedRate > 0 ? Number(((sold + booked * 0.65) / seedRate).toFixed(2)) : 0

  const info = db
    .prepare(
      `INSERT INTO company_seed_sales (
        seller_id, company_name, state, district, taluk, village, sales_region,
        crop_name, crop_variety, seed_type, qty_sold_kg, qty_booked_kg,
        seed_rate_kg_per_ha, estimated_area_ha, expected_sowing_season, sales_date,
        verified_status, data_source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Verification', 'Company Seed Portal')`
    )
    .run(
      req.user.id,
      companyName,
      state,
      district,
      taluk,
      village,
      salesRegion,
      cropName.trim(),
      cropVariety.trim(),
      seedType,
      sold,
      booked,
      seedRate,
      estimatedAreaHa,
      expectedSowingSeason,
      salesDate
    )

  db.prepare(
    `INSERT INTO data_upload_logs (user_id, source_type, file_name, rows_processed, status, action_note)
     VALUES (?, 'Company Seed Sales', 'seed_portal_form', 1, 'Success', ?)`
  ).run(req.user.id, `Recorded seed sales for ${cropName} (${cropVariety})`)

  runAnalyticsEngine(db)
  const record = db.prepare('SELECT * FROM company_seed_sales WHERE id = ?').get(info.lastInsertRowid)
  return res.status(201).json({
    record,
    message: 'Seed sales saved and early planting-intention analysis updated.',
  })
})

router.post('/inventory', requireAuth, requireRole('company', 'admin'), (req, res) => {
  const db = getDb()
  const {
    companyName = req.user.name,
    cropName,
    cropVariety,
    seedType = 'Certified',
    stockAvailableKg,
    seedRateKgPerHa = 40,
    location = req.user.district || 'Sehore Depot',
  } = req.body

  if (!cropName || !cropVariety || stockAvailableKg === undefined) {
    return res.status(400).json({ error: 'cropName, cropVariety, and stockAvailableKg are required.' })
  }

  const info = db
    .prepare(
      `INSERT INTO seed_inventory (seller_id, company_name, crop_name, crop_variety, seed_type, stock_available_kg, seed_rate_kg_per_ha, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(req.user.id, companyName, cropName, cropVariety, seedType, Number(stockAvailableKg), Number(seedRateKgPerHa), location)

  const item = db.prepare('SELECT * FROM seed_inventory WHERE id = ?').get(info.lastInsertRowid)
  return res.status(201).json({ item })
})

export default router
