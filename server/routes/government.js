import express from 'express'
import multer from 'multer'
import * as XLSX from 'xlsx'
import { getDb } from '../db.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { runAnalyticsEngine } from '../engine/analyticsEngine.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

router.get('/crop-data', (req, res) => {
  const db = getDb()
  const { state, district, taluk, crop, season } = req.query
  let sql = 'SELECT * FROM government_crop_data WHERE 1=1'
  const params = []

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

  sql += ' ORDER BY year DESC, id DESC'
  const records = db.prepare(sql).all(...params)
  return res.json({ records })
})

router.post('/upload', requireAuth, requireRole('admin'), upload.single('file'), (req, res) => {
  const db = getDb()
  let rows = []
  let fileName = 'manual-entry.json'

  if (req.file) {
    fileName = req.file.originalname
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' })
  } else if (Array.isArray(req.body.records)) {
    rows = req.body.records
    fileName = 'manual-batch.json'
  } else if (req.body.cropName) {
    rows = [req.body]
  } else {
    return res.status(400).json({ error: 'Provide a CSV/Excel file or manual government crop record.' })
  }

  let processed = 0
  let duplicates = 0
  let missingFlagged = 0

  const checkDup = db.prepare(
    `SELECT id FROM government_crop_data
     WHERE state = ? AND district = ? AND crop_name = ? AND season = ? AND year = ?`
  )
  const insertGov = db.prepare(
    `INSERT INTO government_crop_data (
      state, district, taluk, village, crop_name, season, year,
      cultivated_area_ha, production_qty_kg, avg_yield_kg_per_ha,
      market_price_per_qt, market_arrival_kg, weather_note, data_source, verified_status, uploaded_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Verified', ?)`
  )

  for (const raw of rows) {
    const state = String(raw.state || raw.State || '').trim()
    const district = String(raw.district || raw.District || '').trim()
    const taluk = String(raw.taluk || raw.Taluk || 'All').trim()
    const village = String(raw.village || raw.Village || 'All').trim()
    const cropName = String(raw.cropName || raw.crop_name || raw['Crop Name'] || '').trim()
    const season = String(raw.season || raw.Season || 'Rabi').trim()
    const year = Number(raw.year || raw.Year || 2025)
    const area = Number(raw.cultivatedAreaHa || raw.cultivated_area_ha || raw['Cultivated Area'] || 0)
    const prod = Number(raw.productionQtyKg || raw.production_qty_kg || raw['Production Quantity'] || 0)
    const yieldHa = Number(raw.avgYieldKgPerHa || raw.avg_yield_kg_per_ha || raw['Average Yield'] || (area > 0 ? prod / area : 0))
    const price = Number(raw.marketPricePerQt || raw.market_price_per_qt || raw['Market Price'] || 0)
    const arrival = Number(raw.marketArrivalKg || raw.market_arrival_kg || prod * 0.85)
    const weatherNote = String(raw.weatherNote || raw.weather_note || '').trim()
    const dataSource = String(raw.dataSource || raw.data_source || raw['Data Source'] || 'Authorized Government Upload').trim()

    if (!state || !district || !cropName || area <= 0 || prod <= 0) {
      missingFlagged += 1
      continue
    }

    const dup = checkDup.get(state, district, cropName, season, year)
    if (dup) {
      duplicates += 1
      continue
    }

    insertGov.run(
      state,
      district,
      taluk,
      village,
      cropName,
      season,
      year,
      area,
      prod,
      Math.round(yieldHa),
      price,
      Math.round(arrival),
      weatherNote,
      dataSource,
      req.user.id
    )
    processed += 1
  }

  db.prepare(
    `INSERT INTO data_upload_logs (user_id, source_type, file_name, rows_processed, duplicates_skipped, missing_fields_flagged, status, action_note)
     VALUES (?, 'Government Data', ?, ?, ?, ?, 'Success', 'Processed government dataset upload')`
  ).run(req.user.id, fileName, processed, duplicates, missingFlagged)

  if (processed > 0) {
    runAnalyticsEngine(db)
  }

  return res.status(201).json({
    processed,
    duplicatesSkipped: duplicates,
    missingFieldsFlagged: missingFlagged,
    message: `Uploaded ${processed} government records (${duplicates} duplicates skipped, ${missingFlagged} incomplete rows flagged).`,
  })
})

router.post('/sync-external', requireAuth, requireRole('admin'), async (req, res) => {
  const db = getDb()
  const { apiUrl, sourceName = 'External Government API Feed', records } = req.body

  let feedRows = Array.isArray(records) ? records : []
  if (!feedRows.length && apiUrl) {
    try {
      const response = await fetch(apiUrl)
      if (!response.ok) {
        return res.status(502).json({ error: `External API returned status ${response.status}.` })
      }
      const json = await response.json()
      feedRows = Array.isArray(json) ? json : Array.isArray(json.records) ? json.records : []
    } catch (err) {
      return res.status(502).json({ error: `Failed to fetch external API: ${err.message}` })
    }
  }

  if (!feedRows.length) {
    return res.status(400).json({ error: 'No records found in external API response or payload.' })
  }

  let processed = 0
  let duplicates = 0
  let missingFlagged = 0

  const checkDup = db.prepare(
    `SELECT id FROM government_crop_data
     WHERE state = ? AND district = ? AND crop_name = ? AND season = ? AND year = ?`
  )
  const insertGov = db.prepare(
    `INSERT INTO government_crop_data (
      state, district, taluk, village, crop_name, season, year,
      cultivated_area_ha, production_qty_kg, avg_yield_kg_per_ha,
      market_price_per_qt, market_arrival_kg, weather_note, data_source, verified_status, uploaded_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Verified', ?)`
  )

  for (const raw of feedRows) {
    const state = String(raw.state || raw.State || '').trim()
    const district = String(raw.district || raw.District || '').trim()
    const taluk = String(raw.taluk || raw.Taluk || 'All').trim()
    const village = String(raw.village || raw.Village || 'All').trim()
    const cropName = String(raw.cropName || raw.crop_name || raw['Crop Name'] || '').trim()
    const season = String(raw.season || raw.Season || 'Rabi').trim()
    const year = Number(raw.year || raw.Year || 2025)
    const area = Number(raw.cultivatedAreaHa || raw.cultivated_area_ha || raw['Cultivated Area'] || 0)
    const prod = Number(raw.productionQtyKg || raw.production_qty_kg || raw['Production Quantity'] || 0)
    const yieldHa = Number(raw.avgYieldKgPerHa || raw.avg_yield_kg_per_ha || (area > 0 ? prod / area : 0))
    const price = Number(raw.marketPricePerQt || raw.market_price_per_qt || 0)
    const arrival = Number(raw.marketArrivalKg || raw.market_arrival_kg || prod * 0.85)
    const weatherNote = String(raw.weatherNote || raw.weather_note || '').trim()

    if (!state || !district || !cropName || area <= 0 || prod <= 0) {
      missingFlagged += 1
      continue
    }
    if (checkDup.get(state, district, cropName, season, year)) {
      duplicates += 1
      continue
    }
    insertGov.run(
      state, district, taluk, village, cropName, season, year,
      area, prod, Math.round(yieldHa), price, Math.round(arrival),
      weatherNote, sourceName, req.user.id
    )
    processed += 1
  }

  db.prepare(
    `INSERT INTO data_upload_logs (user_id, source_type, file_name, rows_processed, duplicates_skipped, missing_fields_flagged, status, action_note)
     VALUES (?, 'External Gov API', ?, ?, ?, ?, 'Success', ?)`
  ).run(req.user.id, apiUrl || 'external_json_payload', processed, duplicates, missingFlagged, `Synced from ${sourceName}`)

  if (processed > 0) runAnalyticsEngine(db)
  return res.status(201).json({
    processed,
    duplicatesSkipped: duplicates,
    missingFieldsFlagged: missingFlagged,
    message: `Synced ${processed} external records (${duplicates} duplicates skipped, ${missingFlagged} incomplete rows flagged).`,
  })
})

export default router
