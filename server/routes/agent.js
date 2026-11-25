import express from 'express'
import { getDb } from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { runAnalyticsEngine } from '../engine/analyticsEngine.js'

const router = express.Router()

router.get('/dashboard', requireAuth, requireRole('agent', 'admin'), (_req, res) => {
  const db = getDb()
  const plans = db
    .prepare(
      `SELECT fp.*, f.name as farmer_name, f.farmer_code
       FROM farmer_crop_plans fp
       JOIN farmers f ON fp.farmer_id = f.id
       ORDER BY fp.id DESC`
    )
    .all()
  const records = db.prepare('SELECT * FROM agent_records ORDER BY id DESC').all()
  const farmers = db.prepare('SELECT * FROM farmers ORDER BY id DESC').all()

  return res.json({ plans, records, farmers })
})

router.post('/verify', requireAuth, requireRole('agent', 'admin'), (req, res) => {
  const db = getDb()
  const { farmerPlanId, moisturePct = 11.5, qualityGrade = 'Grade A', notes = '' } = req.body

  const plan = db.prepare('SELECT * FROM farmer_crop_plans WHERE id = ?').get(farmerPlanId)
  if (!plan) return res.status(404).json({ error: 'Farmer crop plan not found.' })

  db.prepare("UPDATE farmer_crop_plans SET verified_status = 'Verified' WHERE id = ?").run(plan.id)

  db.prepare(
    `INSERT INTO agent_records (
      agent_user_id, farmer_id, farmer_plan_id, state, district, taluk, village,
      moisture_pct, quality_grade, verification_status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Verified', ?)`
  ).run(
    req.user.id,
    plan.farmer_id,
    plan.id,
    plan.state,
    plan.district,
    plan.taluk,
    plan.village,
    Number(moisturePct),
    qualityGrade,
    notes
  )

  runAnalyticsEngine(db)
  return res.json({ message: `Crop plan #${plan.id} verified as ${qualityGrade}.` })
})

export default router
