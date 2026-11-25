import express from 'express'
import { getDb } from '../db.js'

const router = express.Router()

function applyLocationFilters(sql, params, query) {
  const { state, district, taluk, crop, season } = query
  if (state && state !== 'All') {
    sql += ' AND state = ?'
    params.push(state)
  }
  if (district && district !== 'All') {
    sql += ' AND district = ?'
    params.push(district)
  }
  if (taluk && taluk !== 'All') {
    sql += ' AND taluk = ?'
    params.push(taluk)
  }
  if (crop && crop !== 'All') {
    sql += ' AND crop_name = ?'
    params.push(crop)
  }
  if (season && season !== 'All') {
    sql += ' AND season = ?'
    params.push(season)
  }
  return { sql, params }
}

router.get('/production-forecast', (req, res) => {
  const db = getDb()
  const { taluk } = req.query
  const baseQuery =
    taluk && taluk !== 'All'
      ? 'SELECT * FROM crop_production_predictions WHERE 1=1'
      : "SELECT * FROM crop_production_predictions WHERE taluk = 'All'"
  const base = applyLocationFilters(baseQuery, [], req.query)
  const rows = db.prepare(base.sql).all(...base.params)

  const talukBase = applyLocationFilters(
    "SELECT * FROM crop_production_predictions WHERE taluk != 'All'",
    [],
    { ...req.query, taluk: 'All' }
  )
  const talukBreakdown = db.prepare(talukBase.sql).all(...talukBase.params)

  return res.json({ forecasts: rows, talukBreakdown })
})

router.get('/demand-forecast', (req, res) => {
  const db = getDb()
  const { state, district, crop, season } = req.query
  let sql = 'SELECT * FROM crop_demand_predictions WHERE 1=1'
  const params = []
  if (state && state !== 'All') { sql += ' AND state = ?'; params.push(state) }
  if (district && district !== 'All') { sql += ' AND district = ?'; params.push(district) }
  if (crop && crop !== 'All') { sql += ' AND crop_name = ?'; params.push(crop) }
  if (season && season !== 'All') { sql += ' AND season = ?'; params.push(season) }
  const rows = db.prepare(sql).all(...params)
  return res.json({ forecasts: rows })
})

router.get('/supply-demand', (req, res) => {
  const db = getDb()
  const { state, district, crop, season } = req.query
  let sql = 'SELECT * FROM supply_demand_analysis WHERE 1=1'
  const params = []
  if (state && state !== 'All') { sql += ' AND state = ?'; params.push(state) }
  if (district && district !== 'All') { sql += ' AND district = ?'; params.push(district) }
  if (crop && crop !== 'All') { sql += ' AND crop_name = ?'; params.push(crop) }
  if (season && season !== 'All') { sql += ' AND season = ?'; params.push(season) }
  const rows = db.prepare(sql).all(...params)
  return res.json({ analysis: rows })
})

router.get('/price-trends', (req, res) => {
  const db = getDb()
  const { state, district, crop } = req.query
  let sql = 'SELECT * FROM market_prices WHERE 1=1'
  const params = []
  if (state && state !== 'All') { sql += ' AND state = ?'; params.push(state) }
  if (district && district !== 'All') { sql += ' AND district = ?'; params.push(district) }
  if (crop && crop !== 'All') { sql += ' AND crop_name = ?'; params.push(crop) }
  sql += ' ORDER BY recorded_date ASC'
  const prices = db.prepare(sql).all(...params)
  return res.json({ prices })
})

router.get('/price-protection', (req, res) => {
  const db = getDb()
  const { state, district, crop } = req.query
  let sql = 'SELECT * FROM price_predictions WHERE 1=1'
  const params = []
  if (state && state !== 'All') { sql += ' AND state = ?'; params.push(state) }
  if (district && district !== 'All') { sql += ' AND district = ?'; params.push(district) }
  if (crop && crop !== 'All') { sql += ' AND crop_name = ?'; params.push(crop) }
  const predictions = db.prepare(sql).all(...params)
  const alerts = db.prepare('SELECT * FROM price_alerts WHERE is_active = 1 ORDER BY id DESC').all()
  return res.json({ predictions, alerts })
})

router.get('/forecast-90-days', (req, res) => {
  const db = getDb()
  const { state, district, crop, season } = req.query
  let sql = `
    SELECT
      p.crop_name, p.season, p.state, p.district,
      p.expected_total_kg, p.confidence_score, p.source_contribution_json,
      d.demand_30d_kg, d.demand_60d_kg, d.demand_90d_kg,
      sd.gap_kg, sd.surplus_pct, sd.shortage_pct, sd.classification, sd.explanation,
      pr.estimated_future_price_per_qt, pr.risk_indicator, pr.crash_warning
    FROM crop_production_predictions p
    LEFT JOIN crop_demand_predictions d
      ON p.crop_name = d.crop_name AND p.state = d.state AND p.district = d.district AND p.season = d.season
    LEFT JOIN supply_demand_analysis sd
      ON p.crop_name = sd.crop_name AND p.state = sd.state AND p.district = sd.district AND p.season = sd.season
    LEFT JOIN price_predictions pr
      ON p.crop_name = pr.crop_name AND p.state = pr.state AND p.district = pr.district
    WHERE p.taluk = 'All'
  `
  const params = []
  if (state && state !== 'All') { sql += ' AND p.state = ?'; params.push(state) }
  if (district && district !== 'All') { sql += ' AND p.district = ?'; params.push(district) }
  if (crop && crop !== 'All') { sql += ' AND p.crop_name = ?'; params.push(crop) }
  if (season && season !== 'All') { sql += ' AND p.season = ?'; params.push(season) }

  const rows = db.prepare(sql).all(...params).map((r) => {
    const prod30 = Math.round(r.expected_total_kg * 0.25)
    const prod60 = Math.round(r.expected_total_kg * 0.6)
    const prod90 = Math.round(r.expected_total_kg)
    const src = JSON.parse(r.source_contribution_json || '{}')
    return {
      cropName: r.crop_name,
      season: r.season,
      state: r.state,
      district: r.district,
      production30dKg: prod30,
      production60dKg: prod60,
      production90dKg: prod90,
      demand30dKg: r.demand_30d_kg || 0,
      demand60dKg: r.demand_60d_kg || 0,
      demand90dKg: r.demand_90d_kg || 0,
      expectedSurplusOrShortageKg: r.gap_kg || 0,
      classification: r.classification || 'Balanced Market',
      estimatedMarketPricePerQt: r.estimated_future_price_per_qt || 0,
      priceCrashRisk: r.risk_indicator || 'GREEN',
      recommendation:
        r.risk_indicator === 'RED'
          ? 'Lock buyer demand early or stagger harvest storage.'
          : r.shortage_pct > 10
          ? 'Strong market shortage — good crop to grow or hold for fair bids.'
          : 'Balanced outlook — monitor 30-day mandi arrivals.',
      confidencePct: Math.round((r.confidence_score || 0.5) * 100),
      dataAvailability: `${src.sourceCount || 1}/3 data sources active`,
    }
  })

  return res.json({ forecasts90Days: rows })
})

router.get('/public-overview', (_req, res) => {
  const db = getDb()
  const demands = db.prepare('SELECT * FROM consumer_demand ORDER BY id DESC LIMIT 8').all()
  const prices = db.prepare('SELECT * FROM market_prices ORDER BY recorded_date DESC LIMIT 8').all()
  const alerts = db.prepare('SELECT * FROM price_alerts WHERE is_active = 1 ORDER BY id DESC LIMIT 6').all()
  return res.json({ demands, prices, alerts })
})

export default router
