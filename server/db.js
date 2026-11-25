import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const DB_PATH = path.join(DATA_DIR, 'agristack.db')

let dbInstance = null

export function getDb() {
  if (dbInstance) return dbInstance

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  dbInstance = new DatabaseSync(DB_PATH)
  dbInstance.exec('PRAGMA foreign_keys = ON;')
  initSchema(dbInstance)
  return dbInstance
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      identifier TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('farmer', 'buyer', 'agent', 'company', 'admin')),
      state TEXT NOT NULL DEFAULT 'Madhya Pradesh',
      district TEXT NOT NULL DEFAULT 'Sehore',
      taluk TEXT NOT NULL DEFAULT 'Sehore',
      village TEXT NOT NULL DEFAULT 'Sehore',
      status TEXT NOT NULL DEFAULT 'Active',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS farmers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      farmer_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      taluk TEXT NOT NULL,
      village TEXT NOT NULL,
      total_land_ha REAL NOT NULL DEFAULT 2.0,
      irrigation_available TEXT NOT NULL DEFAULT 'Yes',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS government_crop_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      taluk TEXT NOT NULL DEFAULT 'All',
      village TEXT NOT NULL DEFAULT 'All',
      crop_name TEXT NOT NULL,
      season TEXT NOT NULL,
      year INTEGER NOT NULL,
      cultivated_area_ha REAL NOT NULL,
      production_qty_kg REAL NOT NULL,
      avg_yield_kg_per_ha REAL NOT NULL,
      market_price_per_qt REAL NOT NULL,
      market_arrival_kg REAL NOT NULL DEFAULT 0,
      weather_note TEXT DEFAULT '',
      data_source TEXT NOT NULL DEFAULT 'Demo Historical Baseline (Not Official)',
      verified_status TEXT NOT NULL DEFAULT 'Verified',
      uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS farmer_crop_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
      crop_name TEXT NOT NULL,
      season TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      taluk TEXT NOT NULL,
      village TEXT NOT NULL,
      total_land_ha REAL NOT NULL,
      planned_area_ha REAL NOT NULL,
      sowing_date TEXT NOT NULL,
      expected_harvest_date TEXT NOT NULL,
      expected_yield_kg_per_ha REAL NOT NULL,
      estimated_production_kg REAL NOT NULL,
      current_growing_crop TEXT DEFAULT '',
      current_production_kg REAL NOT NULL DEFAULT 0,
      planned_production_kg REAL NOT NULL,
      committed_qty_kg REAL NOT NULL DEFAULT 0,
      irrigation_available TEXT NOT NULL DEFAULT 'Yes',
      expected_price_per_qt REAL NOT NULL DEFAULT 2500,
      verified_status TEXT NOT NULL DEFAULT 'Pending Verification',
      data_source TEXT NOT NULL DEFAULT 'Farmer Input System',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS company_seed_sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company_name TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      taluk TEXT NOT NULL DEFAULT 'All',
      village TEXT NOT NULL DEFAULT 'All',
      sales_region TEXT NOT NULL,
      crop_name TEXT NOT NULL,
      crop_variety TEXT NOT NULL,
      seed_type TEXT NOT NULL,
      qty_sold_kg REAL NOT NULL DEFAULT 0,
      qty_booked_kg REAL NOT NULL DEFAULT 0,
      seed_rate_kg_per_ha REAL NOT NULL DEFAULT 40,
      estimated_area_ha REAL NOT NULL DEFAULT 0,
      expected_sowing_season TEXT NOT NULL,
      sales_date TEXT NOT NULL,
      verified_status TEXT NOT NULL DEFAULT 'Pending Verification',
      data_source TEXT NOT NULL DEFAULT 'Company Seed Portal',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS seed_inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company_name TEXT NOT NULL,
      crop_name TEXT NOT NULL,
      crop_variety TEXT NOT NULL,
      seed_type TEXT NOT NULL,
      stock_available_kg REAL NOT NULL DEFAULT 0,
      seed_rate_kg_per_ha REAL NOT NULL DEFAULT 40,
      location TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS consumer_demand (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      buyer_name TEXT NOT NULL,
      crop_name TEXT NOT NULL,
      season TEXT NOT NULL DEFAULT 'Rabi',
      qty_required_kg REAL NOT NULL,
      reserved_qty_kg REAL NOT NULL DEFAULT 0,
      expected_price_per_qt REAL NOT NULL,
      delivery_location TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      taluk TEXT NOT NULL DEFAULT 'All',
      village TEXT NOT NULL DEFAULT 'All',
      required_delivery_date TEXT NOT NULL,
      buyer_category TEXT NOT NULL DEFAULT 'Wholesale',
      verified_status TEXT NOT NULL DEFAULT 'Verified',
      demand_type TEXT NOT NULL DEFAULT 'confirmed' CHECK(demand_type IN ('confirmed', 'estimated')),
      data_source TEXT NOT NULL DEFAULT 'Buyer Dashboard',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS buyer_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      demand_id INTEGER REFERENCES consumer_demand(id) ON DELETE SET NULL,
      farmer_plan_id INTEGER NOT NULL REFERENCES farmer_crop_plans(id) ON DELETE CASCADE,
      buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      buyer_name TEXT NOT NULL,
      farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
      crop_name TEXT NOT NULL,
      requested_qty_kg REAL NOT NULL,
      reserved_qty_kg REAL NOT NULL DEFAULT 0,
      confirmed_qty_kg REAL NOT NULL DEFAULT 0,
      delivered_qty_kg REAL NOT NULL DEFAULT 0,
      agreed_price_per_qt REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Reserved' CHECK(status IN ('Reserved', 'Confirmed', 'Delivered', 'Cancelled')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS crop_production_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_name TEXT NOT NULL,
      season TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      taluk TEXT NOT NULL DEFAULT 'All',
      farmer_planned_kg REAL NOT NULL,
      historical_baseline_kg REAL NOT NULL,
      seed_indicator_kg REAL NOT NULL,
      expected_total_kg REAL NOT NULL,
      estimated_area_ha REAL NOT NULL,
      growth_pct REAL NOT NULL,
      confidence_score REAL NOT NULL,
      source_contribution_json TEXT NOT NULL,
      generated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS crop_demand_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_name TEXT NOT NULL,
      season TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      confirmed_demand_kg REAL NOT NULL,
      historical_baseline_kg REAL NOT NULL,
      predicted_additional_kg REAL NOT NULL,
      demand_30d_kg REAL NOT NULL,
      demand_60d_kg REAL NOT NULL,
      demand_90d_kg REAL NOT NULL,
      generated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS market_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_name TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      mandi_name TEXT NOT NULL,
      price_per_qt REAL NOT NULL,
      arrival_qty_kg REAL NOT NULL DEFAULT 0,
      trend TEXT NOT NULL DEFAULT 'steady',
      recorded_date TEXT NOT NULL,
      data_source TEXT NOT NULL DEFAULT 'Demo Market Feed'
    );

    CREATE TABLE IF NOT EXISTS price_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_name TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      estimated_future_price_per_qt REAL NOT NULL,
      min_historical_price REAL NOT NULL,
      max_historical_price REAL NOT NULL,
      avg_market_price REAL NOT NULL,
      predicted_movement TEXT NOT NULL,
      fluctuation_pct REAL NOT NULL,
      crash_warning TEXT NOT NULL,
      revenue_risk TEXT NOT NULL,
      risk_indicator TEXT NOT NULL CHECK(risk_indicator IN ('GREEN', 'YELLOW', 'RED')),
      disclaimer TEXT NOT NULL DEFAULT 'Estimated price only — not a guaranteed selling price.',
      generated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS supply_demand_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_name TEXT NOT NULL,
      season TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      predicted_production_kg REAL NOT NULL,
      predicted_demand_kg REAL NOT NULL,
      gap_kg REAL NOT NULL,
      surplus_pct REAL NOT NULL,
      shortage_pct REAL NOT NULL,
      classification TEXT NOT NULL,
      explanation TEXT NOT NULL,
      generated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS price_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_name TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      risk_indicator TEXT NOT NULL DEFAULT 'YELLOW',
      message TEXT NOT NULL,
      advice TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agent_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      farmer_id INTEGER REFERENCES farmers(id) ON DELETE SET NULL,
      farmer_plan_id INTEGER REFERENCES farmer_crop_plans(id) ON DELETE CASCADE,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      taluk TEXT NOT NULL,
      village TEXT NOT NULL,
      moisture_pct REAL NOT NULL,
      quality_grade TEXT NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'Verified',
      notes TEXT DEFAULT '',
      inspected_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS crop_recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
      crop_name TEXT NOT NULL,
      recommended_area_ha REAL NOT NULL,
      expected_production_kg REAL NOT NULL,
      predicted_demand_kg REAL NOT NULL,
      expected_selling_price_per_qt REAL NOT NULL,
      estimated_revenue REAL NOT NULL,
      surplus_risk TEXT NOT NULL,
      score REAL NOT NULL,
      explanation TEXT NOT NULL,
      generated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS data_upload_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      source_type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      rows_processed INTEGER NOT NULL DEFAULT 0,
      duplicates_skipped INTEGER NOT NULL DEFAULT 0,
      missing_fields_flagged INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Success',
      action_note TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
}
