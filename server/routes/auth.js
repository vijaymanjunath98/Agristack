import express from 'express'
import bcrypt from 'bcryptjs'
import { getDb } from '../db.js'
import { requireAuth, signToken } from '../middleware/auth.js'
import { runAnalyticsEngine } from '../engine/analyticsEngine.js'

const router = express.Router()

router.post('/register', (req, res) => {
  const db = getDb()
  const {
    name,
    identifier,
    password = 'agri1234',
    role = 'farmer',
    state = 'Madhya Pradesh',
    district = 'Sehore',
    taluk = 'Sehore',
    village = 'Sehore',
    totalLandHa = 2.5,
    irrigationAvailable = 'Yes',
  } = req.body

  if (!name || !identifier) {
    return res.status(400).json({ error: 'Name and phone/email are required.' })
  }

  const normalizedRole = role === 'consumer' ? 'buyer' : role
  const allowedRoles = ['farmer', 'buyer', 'agent', 'company', 'admin']
  if (!allowedRoles.includes(normalizedRole)) {
    return res.status(400).json({ error: 'Invalid role selected.' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE identifier = ?').get(identifier.trim())
  if (existing) {
    return res.status(409).json({ error: 'An account with this phone/email already exists.' })
  }

  const hash = bcrypt.hashSync(password, 10)
  const status = normalizedRole === 'agent' ? 'Pending Approval' : 'Active'

  const result = db
    .prepare(
      `INSERT INTO users (name, identifier, password_hash, role, state, district, taluk, village, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(name.trim(), identifier.trim(), hash, normalizedRole, state, district, taluk, village, status)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)

  if (normalizedRole === 'farmer') {
    const farmerCode = `FRM-${1000 + Number(user.id)}`
    db.prepare(
      `INSERT INTO farmers (user_id, farmer_code, name, state, district, taluk, village, total_land_ha, irrigation_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(user.id, farmerCode, user.name, state, district, taluk, village, Number(totalLandHa) || 2.5, irrigationAvailable)
    runAnalyticsEngine(db)
  }

  const token = signToken(user)
  const { password_hash: _, ...safeUser } = user
  return res.status(201).json({ token, user: safeUser })
})

router.post('/login', (req, res) => {
  const db = getDb()
  const { identifier, password } = req.body
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Phone number/email and password are required.' })
  }

  const user = db.prepare('SELECT * FROM users WHERE identifier = ?').get(identifier.trim())
  if (!user) {
    return res.status(401).json({ error: 'Account not found. Please register first.' })
  }

  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Incorrect password.' })
  }

  const token = signToken(user)
  const { password_hash: _, ...safeUser } = user
  return res.json({ token, user: safeUser })
})

router.post('/demo-login', (req, res) => {
  const db = getDb()
  const { role = 'farmer' } = req.body
  const targetRole = role === 'consumer' ? 'buyer' : role
  const user = db.prepare('SELECT * FROM users WHERE role = ? ORDER BY id ASC LIMIT 1').get(targetRole)
  if (!user) {
    return res.status(404).json({ error: `No demo user configured for role ${role}.` })
  }
  const token = signToken(user)
  const { password_hash: _, ...safeUser } = user
  return res.json({ token, user: safeUser })
})

router.get('/me', requireAuth, (req, res) => {
  const db = getDb()
  const user = db.prepare('SELECT id, name, identifier, role, state, district, taluk, village, status FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })
  return res.json({ user })
})

export default router
