import express from 'express'
import cors from 'cors'
import { getDb } from './db.js'
import { seedDatabaseIfEmpty } from './seed.js'
import { runAnalyticsEngine } from './engine/analyticsEngine.js'
import authRoutes from './routes/auth.js'
import farmerRoutes from './routes/farmer.js'
import governmentRoutes from './routes/government.js'
import companyRoutes from './routes/company.js'
import consumerRoutes from './routes/consumer.js'
import marketRoutes from './routes/market.js'
import agentRoutes from './routes/agent.js'
import adminRoutes from './routes/admin.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json({ limit: '5mb' }))

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// Initialize SQLite DB, demo seed data, and run initial forecasting engine
const db = getDb()
seedDatabaseIfEmpty(db)
runAnalyticsEngine(db)

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: 'sqlite', engine: 'ready' })
})

app.use('/api/auth', authRoutes)
app.use('/api/farmer', farmerRoutes)
app.use('/api/government', governmentRoutes)
app.use('/api/company', companyRoutes)
app.use('/api/consumer', consumerRoutes)
app.use('/api/market', marketRoutes)
app.use('/api/agent', agentRoutes)
app.use('/api/admin', adminRoutes)

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`AGRISTACK Backend API running at http://localhost:${PORT}`)
})
