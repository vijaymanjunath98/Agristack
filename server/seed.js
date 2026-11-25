import bcrypt from 'bcryptjs'

export function seedDatabaseIfEmpty(db) {
  const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get().cnt
  if (userCount > 0) return

  const defaultPass = bcrypt.hashSync('agri1234', 10)

  const insertUser = db.prepare(`
    INSERT INTO users (name, identifier, password_hash, role, state, district, taluk, village, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const farmerUser = insertUser.run('Ramesh Patel', 'farmer@agri.in', defaultPass, 'farmer', 'Madhya Pradesh', 'Sehore', 'Sehore', 'Bilkisganj', 'Active')
  const farmerUser2 = insertUser.run('Mahesh Deshmukh', '9876543210', defaultPass, 'farmer', 'Maharashtra', 'Latur', 'Ausa', 'Killari', 'Active')
  const buyerUser = insertUser.run('Annapurna Mills', 'buyer@agri.in', defaultPass, 'buyer', 'Madhya Pradesh', 'Indore', 'Indore', 'Indore Hub', 'Active')
  const agentUser = insertUser.run('Sunita Verma', 'agent@agri.in', defaultPass, 'agent', 'Madhya Pradesh', 'Sehore', 'Sehore', 'Bilkisganj', 'Approved')
  const companyUser = insertUser.run('Kaveri Agri Seeds', 'company@agri.in', defaultPass, 'company', 'Madhya Pradesh', 'Sehore', 'Sehore', 'Sehore Market', 'Active')
  const adminUser = insertUser.run('Platform Admin', 'admin@agri.in', defaultPass, 'admin', 'Madhya Pradesh', 'Bhopal', 'Huzur', 'HQ', 'Active')

  const insertFarmer = db.prepare(`
    INSERT INTO farmers (user_id, farmer_code, name, state, district, taluk, village, total_land_ha, irrigation_available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const f1 = insertFarmer.run(farmerUser.lastInsertRowid, 'FRM-1001', 'Ramesh Patel', 'Madhya Pradesh', 'Sehore', 'Sehore', 'Bilkisganj', 4.5, 'Yes')
  const f2 = insertFarmer.run(farmerUser2.lastInsertRowid, 'FRM-1002', 'Mahesh Deshmukh', 'Maharashtra', 'Latur', 'Ausa', 'Killari', 3.2, 'Partial')

  // Source 1: Government Agricultural Data (clearly marked as Demo Sample Baseline)
  const insertGov = db.prepare(`
    INSERT INTO government_crop_data (
      state, district, taluk, village, crop_name, season, year,
      cultivated_area_ha, production_qty_kg, avg_yield_kg_per_ha,
      market_price_per_qt, market_arrival_kg, weather_note, data_source, verified_status, uploaded_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const govRows = [
    ['Madhya Pradesh', 'Sehore', 'Sehore', 'Bilkisganj', 'Sharbati Wheat', 'Rabi', 2024, 120, 408000, 3400, 2650, 350000, 'Dry winter favorable for grain filling', 'Demo Historical Baseline (Not Official)', 'Verified', adminUser.lastInsertRowid],
    ['Madhya Pradesh', 'Sehore', 'Sehore', 'Bilkisganj', 'Sharbati Wheat', 'Rabi', 2025, 130, 455000, 3500, 2760, 390000, 'Normal rainfall and cool nights', 'Demo Historical Baseline (Not Official)', 'Verified', adminUser.lastInsertRowid],
    ['Madhya Pradesh', 'Sehore', 'Sehore', 'Bilkisganj', 'Desi Chana', 'Rabi', 2025, 85, 144500, 1700, 5450, 125000, 'Low moisture stress', 'Demo Historical Baseline (Not Official)', 'Verified', adminUser.lastInsertRowid],
    ['Maharashtra', 'Latur', 'Ausa', 'Killari', 'Yellow Soybean', 'Kharif', 2025, 140, 294000, 2100, 4680, 260000, 'Moderate monsoon showers', 'Demo Historical Baseline (Not Official)', 'Verified', adminUser.lastInsertRowid],
    ['Maharashtra', 'Nashik', 'Niphad', 'Lasalgaon', 'Red Onion', 'Rabi', 2025, 95, 1900000, 20000, 2280, 1700000, 'Mild humidity advisory', 'Demo Historical Baseline (Not Official)', 'Verified', adminUser.lastInsertRowid],
    ['Haryana', 'Karnal', 'Karnal', 'Taraori', '1121 Basmati Paddy', 'Kharif', 2025, 110, 462000, 4200, 3940, 410000, 'Adequate canal irrigation', 'Demo Historical Baseline (Not Official)', 'Verified', adminUser.lastInsertRowid],
    ['Madhya Pradesh', 'Sehore', 'Ashta', 'Ashta', 'Tomato', 'Rabi', 2025, 40, 960000, 24000, 1850, 880000, 'Warm afternoon sun', 'Demo Historical Baseline (Not Official)', 'Verified', adminUser.lastInsertRowid],
  ]
  for (const row of govRows) insertGov.run(...row)

  // Source 2: Farmer Crop Plans
  const insertPlan = db.prepare(`
    INSERT INTO farmer_crop_plans (
      farmer_id, crop_name, season, state, district, taluk, village,
      total_land_ha, planned_area_ha, sowing_date, expected_harvest_date,
      expected_yield_kg_per_ha, estimated_production_kg, current_growing_crop,
      current_production_kg, planned_production_kg, committed_qty_kg,
      irrigation_available, expected_price_per_qt, verified_status, data_source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const p1 = insertPlan.run(f1.lastInsertRowid, 'Sharbati Wheat', 'Rabi', 'Madhya Pradesh', 'Sehore', 'Sehore', 'Bilkisganj', 4.5, 2.5, '2026-11-10', '2027-02-20', 3600, 9000, 'Sharbati Wheat', 4500, 9000, 2000, 'Yes', 2750, 'Verified', 'Farmer Input System')
  insertPlan.run(f1.lastInsertRowid, 'Tomato', 'Rabi', 'Madhya Pradesh', 'Sehore', 'Sehore', 'Bilkisganj', 4.5, 1.5, '2026-11-15', '2027-01-25', 25000, 37500, 'Tomato', 0, 37500, 500, 'Yes', 1900, 'Verified', 'Farmer Input System')
  insertPlan.run(f2.lastInsertRowid, 'Yellow Soybean', 'Kharif', 'Maharashtra', 'Latur', 'Ausa', 'Killari', 3.2, 2.0, '2026-07-05', '2026-12-28', 2200, 4400, 'Yellow Soybean', 3500, 4400, 0, 'Partial', 4650, 'Pending Verification', 'Farmer Input System')
  insertPlan.run(f2.lastInsertRowid, 'Red Onion', 'Rabi', 'Maharashtra', 'Nashik', 'Niphad', 'Lasalgaon', 3.2, 1.2, '2026-11-12', '2027-02-10', 21000, 25200, 'Red Onion', 0, 25200, 0, 'Yes', 2300, 'Verified', 'Farmer Input System')

  // Source 3: Company / Seed Seller Sales & Inventory
  const insertSeedSale = db.prepare(`
    INSERT INTO company_seed_sales (
      seller_id, company_name, state, district, taluk, village, sales_region,
      crop_name, crop_variety, seed_type, qty_sold_kg, qty_booked_kg,
      seed_rate_kg_per_ha, estimated_area_ha, expected_sowing_season, sales_date,
      verified_status, data_source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertSeedSale.run(companyUser.lastInsertRowid, 'Kaveri Agri Seeds', 'Madhya Pradesh', 'Sehore', 'Sehore', 'Bilkisganj', 'Sehore & Vidisha Belt', 'Sharbati Wheat', 'HI-1544', 'Certified', 4200, 1200, 100, 54.0, 'Rabi', '2026-11-05', 'Verified', 'Company Seed Portal')
  insertSeedSale.run(companyUser.lastInsertRowid, 'Kaveri Agri Seeds', 'Madhya Pradesh', 'Sehore', 'Ashta', 'Ashta', 'Sehore Vegetable Cluster', 'Tomato', 'Arka Rakshak', 'Hybrid', 18, 7, 0.25, 100.0, 'Rabi', '2026-11-08', 'Verified', 'Company Seed Portal')
  insertSeedSale.run(companyUser.lastInsertRowid, 'Kaveri Agri Seeds', 'Maharashtra', 'Latur', 'Ausa', 'Killari', 'Marathwada Belt', 'Yellow Soybean', 'JS-9560', 'Certified', 3800, 900, 75, 62.7, 'Kharif', '2026-10-20', 'Verified', 'Company Seed Portal')
  insertSeedSale.run(companyUser.lastInsertRowid, 'Kaveri Agri Seeds', 'Madhya Pradesh', 'Sehore', 'Sehore', 'Bilkisganj', 'Sehore Pulse Belt', 'Desi Chana', 'JG-11', 'Foundation', 2400, 600, 80, 37.5, 'Rabi', '2026-11-10', 'Verified', 'Company Seed Portal')

  const insertInv = db.prepare(`
    INSERT INTO seed_inventory (seller_id, company_name, crop_name, crop_variety, seed_type, stock_available_kg, seed_rate_kg_per_ha, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertInv.run(companyUser.lastInsertRowid, 'Kaveri Agri Seeds', 'Sharbati Wheat', 'HI-1544', 'Certified', 8500, 100, 'Sehore Depot')
  insertInv.run(companyUser.lastInsertRowid, 'Kaveri Agri Seeds', 'Desi Chana', 'JG-11', 'Foundation', 4200, 80, 'Sehore Depot')
  insertInv.run(companyUser.lastInsertRowid, 'Kaveri Agri Seeds', 'Tomato', 'Arka Rakshak', 'Hybrid', 45, 0.25, 'Ashta Center')

  // Consumer / Buyer Demand
  const insertDemand = db.prepare(`
    INSERT INTO consumer_demand (
      buyer_id, buyer_name, crop_name, season, qty_required_kg, reserved_qty_kg,
      expected_price_per_qt, delivery_location, state, district, taluk, village,
      required_delivery_date, buyer_category, verified_status, demand_type, data_source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const d1 = insertDemand.run(buyerUser.lastInsertRowid, 'Annapurna Mills', 'Sharbati Wheat', 'Rabi', 50000, 2000, 2780, 'Indore Hub', 'Madhya Pradesh', 'Sehore', 'Sehore', 'Bilkisganj', '2027-02-28', 'Flour Mill', 'Verified', 'confirmed', 'Buyer Dashboard')
  insertDemand.run(buyerUser.lastInsertRowid, 'FreshBasket Retail', 'Tomato', 'Rabi', 15000, 500, 2000, 'Bhopal Mandi', 'Madhya Pradesh', 'Sehore', 'Ashta', 'Ashta', '2027-01-30', 'Retail Chain', 'Verified', 'confirmed', 'Buyer Dashboard')
  insertDemand.run(buyerUser.lastInsertRowid, 'Deccan Oil Processors', 'Yellow Soybean', 'Kharif', 65000, 0, 4720, 'Latur Industrial Park', 'Maharashtra', 'Latur', 'Ausa', 'Killari', '2027-01-15', 'Processor', 'Verified', 'confirmed', 'Buyer Dashboard')
  insertDemand.run(buyerUser.lastInsertRowid, 'Metro Produce Co.', 'Red Onion', 'Rabi', 120000, 0, 2350, 'Pune Wholesale', 'Maharashtra', 'Nashik', 'Niphad', 'Lasalgaon', '2027-02-15', 'Wholesale', 'Unverified', 'estimated', 'Buyer Dashboard')

  // Smart Demand Locking Order
  db.prepare(`
    INSERT INTO buyer_orders (
      demand_id, farmer_plan_id, buyer_id, buyer_name, farmer_id,
      crop_name, requested_qty_kg, reserved_qty_kg, confirmed_qty_kg, delivered_qty_kg,
      agreed_price_per_qt, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(d1.lastInsertRowid, p1.lastInsertRowid, buyerUser.lastInsertRowid, 'Annapurna Mills', f1.lastInsertRowid, 'Sharbati Wheat', 2000, 2000, 2000, 0, 2780, 'Confirmed')

  // Market Prices History
  const insertPrice = db.prepare(`
    INSERT INTO market_prices (crop_name, state, district, mandi_name, price_per_qt, arrival_qty_kg, trend, recorded_date, data_source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const priceRows = [
    ['Sharbati Wheat', 'Madhya Pradesh', 'Sehore', 'Sehore Mandi', 2620, 120000, 'up', '2026-09-15', 'Demo Market Feed'],
    ['Sharbati Wheat', 'Madhya Pradesh', 'Sehore', 'Sehore Mandi', 2690, 135000, 'up', '2026-10-15', 'Demo Market Feed'],
    ['Sharbati Wheat', 'Madhya Pradesh', 'Sehore', 'Sehore Mandi', 2760, 145000, 'up', '2026-11-20', 'Demo Market Feed'],
    ['Tomato', 'Madhya Pradesh', 'Sehore', 'Ashta Mandi', 2400, 85000, 'down', '2026-09-15', 'Demo Market Feed'],
    ['Tomato', 'Madhya Pradesh', 'Sehore', 'Ashta Mandi', 2100, 110000, 'down', '2026-10-15', 'Demo Market Feed'],
    ['Tomato', 'Madhya Pradesh', 'Sehore', 'Ashta Mandi', 1850, 150000, 'down', '2026-11-20', 'Demo Market Feed'],
    ['Yellow Soybean', 'Maharashtra', 'Latur', 'Latur Mandi', 4520, 95000, 'up', '2026-10-15', 'Demo Market Feed'],
    ['Yellow Soybean', 'Maharashtra', 'Latur', 'Latur Mandi', 4680, 90000, 'up', '2026-11-20', 'Demo Market Feed'],
    ['Desi Chana', 'Madhya Pradesh', 'Sehore', 'Sehore Mandi', 5300, 60000, 'up', '2026-10-15', 'Demo Market Feed'],
    ['Desi Chana', 'Madhya Pradesh', 'Sehore', 'Sehore Mandi', 5450, 58000, 'up', '2026-11-20', 'Demo Market Feed'],
    ['Red Onion', 'Maharashtra', 'Nashik', 'Lasalgaon Mandi', 2380, 210000, 'down', '2026-10-15', 'Demo Market Feed'],
    ['Red Onion', 'Maharashtra', 'Nashik', 'Lasalgaon Mandi', 2280, 225000, 'down', '2026-11-20', 'Demo Market Feed'],
  ]
  for (const r of priceRows) insertPrice.run(...r)

  // Agent Inspection Record
  db.prepare(`
    INSERT INTO agent_records (agent_user_id, farmer_id, farmer_plan_id, state, district, taluk, village, moisture_pct, quality_grade, verification_status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(agentUser.lastInsertRowid, f1.lastInsertRowid, p1.lastInsertRowid, 'Madhya Pradesh', 'Sehore', 'Sehore', 'Bilkisganj', 11.4, 'Grade A+', 'Verified', 'Clean golden grain, optimal moisture')

  // Upload Audit Log
  db.prepare(`
    INSERT INTO data_upload_logs (user_id, source_type, file_name, rows_processed, duplicates_skipped, missing_fields_flagged, status, action_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(adminUser.lastInsertRowid, 'Seed Initialization', 'demo_baseline.json', govRows.length, 0, 0, 'Success', 'Loaded initial clearly-labelled demo baseline dataset')
}
