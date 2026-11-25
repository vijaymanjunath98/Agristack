import express from 'express'
import { getDb } from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { runAnalyticsEngine } from '../engine/analyticsEngine.js'

const router = express.Router()

router.get('/analytics', requireAuth, requireRole('admin'), (_req, res) => {
  const db = getDb()
  const users = db.prepare('SELECT id, name, identifier, role, state, district, village, status, created_at FROM users ORDER BY id DESC').all()
  const govData = db.prepare('SELECT * FROM government_crop_data ORDER BY id DESC').all()
  const farmerPlans = db.prepare('SELECT fp.*, f.name as farmer_name FROM farmer_crop_plans fp JOIN farmers f ON fp.farmer_id = f.id ORDER BY fp.id DESC').all()
  const seedSales = db.prepare('SELECT * FROM company_seed_sales ORDER BY id DESC').all()
  const uploadLogs = db.prepare('SELECT * FROM data_upload_logs ORDER BY id DESC LIMIT 20').all()
  const productionForecasts = db.prepare("SELECT * FROM crop_production_predictions WHERE taluk = 'All'").all()
  const talukForecasts = db.prepare("SELECT * FROM crop_production_predictions WHERE taluk != 'All'").all()
  const demandForecasts = db.prepare('SELECT * FROM crop_demand_predictions').all()
  const supplyDemand = db.prepare('SELECT * FROM supply_demand_analysis').all()
  const priceProtection = db.prepare('SELECT * FROM price_predictions').all()
  const alerts = db.prepare('SELECT * FROM price_alerts ORDER BY id DESC').all()

  const totalDuplicatesSkipped = uploadLogs.reduce((s, l) => s + Number(l.duplicates_skipped || 0), 0)
  const totalMissingFlagged = uploadLogs.reduce((s, l) => s + Number(l.missing_fields_flagged || 0), 0)
  const dataSources = [...new Set(govData.map((g) => g.data_source))]
  const avgConfidencePct =
    productionForecasts.length > 0
      ? Math.round(
          (productionForecasts.reduce((s, p) => s + Number(p.confidence_score || 0), 0) /
            productionForecasts.length) *
            100
        )
      : 0

  return res.json({
    users,
    govData,
    farmerPlans,
    seedSales,
    uploadLogs,
    productionForecasts,
    talukForecasts,
    demandForecasts,
    supplyDemand,
    priceProtection,
    alerts,
    dataQuality: {
      totalDuplicatesSkipped,
      totalMissingFlagged,
      dataSources,
      avgConfidencePct,
      multiSourceRegions: productionForecasts.filter((p) => {
        const c = JSON.parse(p.source_contribution_json || '{}')
        return (c.sourceCount || 0) >= 2
      }).length,
    },
  })
})

router.post('/verify-record', requireAuth, requireRole('admin'), (req, res) => {
  const db = getDb()
  const { tableType, id, status = 'Verified' } = req.body
  const allowedStatus = ['Verified', 'Rejected', 'Pending Verification']
  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' })
  }

  if (tableType === 'farmer_crop_plans') {
    db.prepare('UPDATE farmer_crop_plans SET verified_status = ? WHERE id = ?').run(status, id)
  } else if (tableType === 'company_seed_sales') {
    db.prepare('UPDATE company_seed_sales SET verified_status = ? WHERE id = ?').run(status, id)
  } else {
    return res.status(400).json({ error: 'Unsupported tableType.' })
  }

  db.prepare(
    `INSERT INTO data_upload_logs (user_id, source_type, file_name, rows_processed, status, action_note)
     VALUES (?, ?, 'admin_audit', 1, ?, ?)`
  ).run(req.user.id, tableType, status, `Admin set ${tableType} #${id} to ${status}`)

  runAnalyticsEngine(db)
  return res.json({ message: `Record #${id} updated to ${status}.` })
})

router.post('/run-engine', requireAuth, requireRole('admin'), (_req, res) => {
  const db = getDb()
  runAnalyticsEngine(db)
  return res.json({ message: 'Forecasting and Price Protection engines recomputed successfully.' })
})

router.post('/users/:id/toggle', requireAuth, requireRole('admin'), (req, res) => {
  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })

  const nextStatus =
    user.status === 'Pending Approval'
      ? 'Approved'
      : user.status === 'Active' || user.status === 'Approved'
      ? 'Paused'
      : 'Active'

  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(nextStatus, user.id)
  return res.json({ id: user.id, status: nextStatus })
})

router.post('/alerts', requireAuth, requireRole('admin'), (req, res) => {
  const db = getDb()
  const { cropName = 'General', state = 'Madhya Pradesh', district = 'Sehore', riskIndicator = 'YELLOW', message, advice } = req.body
  if (!message || !advice) return res.status(400).json({ error: 'Message and advice are required.' })

  const info = db
    .prepare(
      `INSERT INTO price_alerts (crop_name, state, district, risk_indicator, message, advice, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`
    )
    .run(cropName, state, district, riskIndicator, message, advice)

  const alert = db.prepare('SELECT * FROM price_alerts WHERE id = ?').get(info.lastInsertRowid)
  return res.status(201).json({ alert })
})

export default router
