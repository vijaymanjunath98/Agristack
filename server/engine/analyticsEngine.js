/**
 * Agricultural Data Analysis, 90-Day Forecasting, Price Protection & Crop Recommendation Engine
 *
 * Combines 3 independent sources (Government Historical Data, Farmer Crop Plans,
 * and Company Seed Sales) with deduplication, reliability weighting, and transparent formulas.
 */

const SOURCE_WEIGHTS = {
  farmer: 0.45,
  government: 0.35,
  seed: 0.20,
}

const DEFAULT_YIELD_KG_PER_HA = {
  'Sharbati Wheat': 3400,
  'Desi Chana': 1700,
  'Yellow Soybean': 2150,
  'Red Onion': 20000,
  '1121 Basmati Paddy': 4200,
  Tomato: 24000,
}

function classifyMarket(surplusPct, shortagePct, gapKg) {
  if (gapKg >= 0) {
    if (surplusPct >= 25) {
      return {
        classification: 'High Surplus Risk',
        explanation: `Predicted production exceeds expected demand by ${surplusPct.toFixed(1)}%. High risk of oversupply and downward price pressure unless stored or shifted to other crops.`,
      }
    }
    if (surplusPct >= 10) {
      return {
        classification: 'Moderate Surplus Risk',
        explanation: `Predicted production is ${surplusPct.toFixed(1)}% above demand. Moderate price softening is possible during peak harvest arrivals.`,
      }
    }
    return {
      classification: 'Balanced Market',
      explanation: `Supply and demand are closely aligned (surplus ${surplusPct.toFixed(1)}%). Prices are expected to remain stable.`,
    }
  }

  if (shortagePct >= 25) {
    return {
      classification: 'High Shortage Risk',
      explanation: `Predicted demand exceeds expected supply by ${shortagePct.toFixed(1)}%. Strong opportunity for farmers to grow this crop and lock buyer contracts early.`,
    }
  }
  if (shortagePct >= 10) {
    return {
      classification: 'Moderate Shortage',
      explanation: `Demand outpaces local supply by ${shortagePct.toFixed(1)}%. Healthy buying competition is likely.`,
    }
  }
  return {
    classification: 'Balanced Market',
    explanation: `Supply and demand are nearly balanced (shortage ${shortagePct.toFixed(1)}%).`,
  }
}

export function runAnalyticsEngine(db) {
  const govRows = db.prepare('SELECT * FROM government_crop_data').all()
  const farmerPlans = db.prepare('SELECT * FROM farmer_crop_plans').all()
  const seedSales = db.prepare('SELECT * FROM company_seed_sales').all()
  const demands = db.prepare('SELECT * FROM consumer_demand').all()
  const orders = db.prepare('SELECT * FROM buyer_orders').all()
  const prices = db.prepare('SELECT * FROM market_prices ORDER BY recorded_date ASC').all()
  const farmers = db.prepare('SELECT * FROM farmers').all()

  // Clear derived prediction tables before recomputing from central database
  db.exec(`
    DELETE FROM crop_production_predictions;
    DELETE FROM crop_demand_predictions;
    DELETE FROM supply_demand_analysis;
    DELETE FROM price_predictions;
    DELETE FROM price_alerts;
    DELETE FROM crop_recommendations;
  `)

  // Discover all unique (crop_name, state, district, season) combinations
  const bucketMap = new Map()
  const addKey = (crop, state, district, season) => {
    const key = `${crop}||${state}||${district}||${season || 'Rabi'}`
    if (!bucketMap.has(key)) {
      bucketMap.set(key, { crop, state, district, season: season || 'Rabi' })
    }
  }

  for (const r of govRows) addKey(r.crop_name, r.state, r.district, r.season)
  for (const p of farmerPlans) addKey(p.crop_name, p.state, p.district, p.season)
  for (const s of seedSales) addKey(s.crop_name, s.state, s.district, s.expected_sowing_season)
  for (const d of demands) addKey(d.crop_name, d.state, d.district, d.season)

  const insertProd = db.prepare(`
    INSERT INTO crop_production_predictions (
      crop_name, season, state, district, taluk, farmer_planned_kg,
      historical_baseline_kg, seed_indicator_kg, expected_total_kg,
      estimated_area_ha, growth_pct, confidence_score, source_contribution_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertDemandPred = db.prepare(`
    INSERT INTO crop_demand_predictions (
      crop_name, season, state, district, confirmed_demand_kg,
      historical_baseline_kg, predicted_additional_kg,
      demand_30d_kg, demand_60d_kg, demand_90d_kg
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertSupplyDemand = db.prepare(`
    INSERT INTO supply_demand_analysis (
      crop_name, season, state, district, predicted_production_kg,
      predicted_demand_kg, gap_kg, surplus_pct, shortage_pct,
      classification, explanation
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertPricePred = db.prepare(`
    INSERT INTO price_predictions (
      crop_name, state, district, estimated_future_price_per_qt,
      min_historical_price, max_historical_price, avg_market_price,
      predicted_movement, fluctuation_pct, crash_warning,
      revenue_risk, risk_indicator, disclaimer
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertAlert = db.prepare(`
    INSERT INTO price_alerts (crop_name, state, district, risk_indicator, message, advice, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `)

  const supplyDemandSummaryByCrop = new Map()

  for (const bucket of bucketMap.values()) {
    const { crop, state, district, season } = bucket

    const matchingGov = govRows.filter(
      (r) => r.crop_name === crop && r.state === state && r.district === district
    )
    const matchingPlans = farmerPlans.filter(
      (p) => p.crop_name === crop && p.state === state && p.district === district
    )
    const matchingSeeds = seedSales.filter(
      (s) => s.crop_name === crop && s.state === state && s.district === district
    )
    const matchingDemands = demands.filter(
      (d) => d.crop_name === crop && d.state === state && d.district === district
    )

    // --- STEP A: ESTIMATE FUTURE PRODUCTION ---
    const farmerPlannedKg = matchingPlans.reduce(
      (sum, p) => sum + Number(p.planned_area_ha) * Number(p.expected_yield_kg_per_ha),
      0
    )
    const farmerAreaHa = matchingPlans.reduce((sum, p) => sum + Number(p.planned_area_ha), 0)

    const avgGovProdKg =
      matchingGov.length > 0
        ? matchingGov.reduce((sum, g) => sum + Number(g.production_qty_kg), 0) / matchingGov.length
        : 0
    const avgGovYield =
      matchingGov.length > 0
        ? matchingGov.reduce((sum, g) => sum + Number(g.avg_yield_kg_per_ha), 0) / matchingGov.length
        : DEFAULT_YIELD_KG_PER_HA[crop] || 3000
    const avgGovAreaHa =
      matchingGov.length > 0
        ? matchingGov.reduce((sum, g) => sum + Number(g.cultivated_area_ha), 0) / matchingGov.length
        : 0

    // Seed indicator: early planting intention only, converted using verified seed rate & avg yield
    const seedAreaHa = matchingSeeds.reduce((sum, s) => {
      const rate = Number(s.seed_rate_kg_per_ha) > 0 ? Number(s.seed_rate_kg_per_ha) : 40
      const estArea =
        Number(s.estimated_area_ha) > 0
          ? Number(s.estimated_area_ha)
          : (Number(s.qty_sold_kg) + Number(s.qty_booked_kg) * 0.65) / rate
      return sum + estArea
    }, 0)
    const seedIndicatorKg = seedAreaHa * avgGovYield

    // Weighted combination with deduplication overlap factor (prevents blind addition of overlapping farms)
    let activeWeightSum = 0
    let weightedProd = 0
    if (farmerPlannedKg > 0) {
      // Scale sample farmer input smoothly with regional baseline if historical data exists
      weightedProd += farmerPlannedKg * SOURCE_WEIGHTS.farmer
      activeWeightSum += SOURCE_WEIGHTS.farmer
    }
    if (avgGovProdKg > 0) {
      weightedProd += avgGovProdKg * SOURCE_WEIGHTS.government
      activeWeightSum += SOURCE_WEIGHTS.government
    }
    if (seedIndicatorKg > 0) {
      // Apply 0.85 overlap deduplication factor between seed sales and farmer plans
      const dedupSeedKg = farmerPlannedKg > 0 ? seedIndicatorKg * 0.85 : seedIndicatorKg
      weightedProd += dedupSeedKg * SOURCE_WEIGHTS.seed
      activeWeightSum += SOURCE_WEIGHTS.seed
    }

    const expectedTotalKg =
      activeWeightSum > 0 ? Math.round(weightedProd / activeWeightSum) : 0
    const estimatedAreaHa =
      avgGovYield > 0 ? Number((expectedTotalKg / avgGovYield).toFixed(2)) : Number((farmerAreaHa || avgGovAreaHa || seedAreaHa).toFixed(2))

    const growthPct =
      avgGovProdKg > 0
        ? Number((((expectedTotalKg - avgGovProdKg) / avgGovProdKg) * 100).toFixed(1))
        : 0

    const sourceCount =
      (farmerPlannedKg > 0 ? 1 : 0) + (avgGovProdKg > 0 ? 1 : 0) + (seedIndicatorKg > 0 ? 1 : 0)
    const confidenceScore =
      sourceCount === 3 ? 0.88 : sourceCount === 2 ? 0.72 : sourceCount === 1 ? 0.52 : 0.3

    const contribution = {
      farmerWeightPct: activeWeightSum > 0 && farmerPlannedKg > 0 ? Math.round((SOURCE_WEIGHTS.farmer / activeWeightSum) * 100) : 0,
      governmentWeightPct: activeWeightSum > 0 && avgGovProdKg > 0 ? Math.round((SOURCE_WEIGHTS.government / activeWeightSum) * 100) : 0,
      seedWeightPct: activeWeightSum > 0 && seedIndicatorKg > 0 ? Math.round((SOURCE_WEIGHTS.seed / activeWeightSum) * 100) : 0,
      sourceCount,
    }

    insertProd.run(
      crop,
      season,
      state,
      district,
      'All',
      Math.round(farmerPlannedKg),
      Math.round(avgGovProdKg),
      Math.round(seedIndicatorKg),
      expectedTotalKg,
      estimatedAreaHa,
      growthPct,
      confidenceScore,
      JSON.stringify(contribution)
    )

    // --- STEP B: PREDICT MARKET DEMAND (30 / 60 / 90 DAYS) ---
    // Separate confirmed buyer demand vs estimated demand, avoiding double counting with buyer_orders
    const confirmedDemandKg = matchingDemands
      .filter((d) => d.demand_type === 'confirmed')
      .reduce((sum, d) => sum + Number(d.qty_required_kg), 0)

    const estimatedRequestKg = matchingDemands
      .filter((d) => d.demand_type !== 'confirmed')
      .reduce((sum, d) => sum + Number(d.qty_required_kg), 0)

    const unlinkedOrdersKg = orders
      .filter((o) => o.crop_name === crop && !o.demand_id && o.status !== 'Cancelled')
      .reduce((sum, o) => sum + Number(o.requested_qty_kg), 0)

    const totalConfirmedKg = confirmedDemandKg + unlinkedOrdersKg

    const histArrivalBaselineKg =
      matchingGov.length > 0
        ? matchingGov.reduce((sum, g) => sum + Number(g.market_arrival_kg || g.production_qty_kg * 0.82), 0) / matchingGov.length
        : 0

    // Seasonal 90-day demand projection combining confirmed demand + historical baseline + additional estimated demand
    const predictedAdditionalKg = Math.round(estimatedRequestKg + histArrivalBaselineKg * 0.06)
    const demand90dKg = Math.round(
      Math.max(totalConfirmedKg + predictedAdditionalKg, histArrivalBaselineKg * 0.85 + totalConfirmedKg * 0.35)
    )
    const demand30dKg = Math.round(demand90dKg * 0.30)
    const demand60dKg = Math.round(demand90dKg * 0.62)

    insertDemandPred.run(
      crop,
      season,
      state,
      district,
      Math.round(totalConfirmedKg),
      Math.round(histArrivalBaselineKg),
      predictedAdditionalKg,
      demand30dKg,
      demand60dKg,
      demand90dKg
    )

    // --- STEP C: SUPPLY & DEMAND COMPARISON ---
    const safeDemand = demand90dKg > 0 ? demand90dKg : 1
    const gapKg = expectedTotalKg - demand90dKg
    const surplusPct = gapKg >= 0 ? Number(((gapKg / safeDemand) * 100).toFixed(1)) : 0
    const shortagePct = gapKg < 0 ? Number((((-gapKg) / safeDemand) * 100).toFixed(1)) : 0
    const { classification, explanation } = classifyMarket(surplusPct, shortagePct, gapKg)

    insertSupplyDemand.run(
      crop,
      season,
      state,
      district,
      expectedTotalKg,
      demand90dKg,
      gapKg,
      surplusPct,
      shortagePct,
      classification,
      explanation
    )

    // --- SECTION 6: PRICE PROTECTION ENGINE ---
    const cropPrices = prices.filter((p) => p.crop_name === crop)
    const govPrices = matchingGov.map((g) => Number(g.market_price_per_qt)).filter((v) => v > 0)
    const allObsPrices = [
      ...cropPrices.map((p) => Number(p.price_per_qt)),
      ...govPrices,
    ]
    const fallbackPrice =
      matchingDemands[0]?.expected_price_per_qt ||
      matchingPlans[0]?.expected_price_per_qt ||
      2500

    const minHistPrice = allObsPrices.length > 0 ? Math.min(...allObsPrices) : fallbackPrice * 0.9
    const maxHistPrice = allObsPrices.length > 0 ? Math.max(...allObsPrices) : fallbackPrice * 1.1
    const avgHistPrice =
      allObsPrices.length > 0
        ? Math.round(allObsPrices.reduce((a, b) => a + b, 0) / allObsPrices.length)
        : Math.round(fallbackPrice)

    // Price sensitivity to supply-demand gap
    let adjustmentPct = 0
    if (surplusPct >= 25) adjustmentPct = -16
    else if (surplusPct >= 10) adjustmentPct = -7
    else if (shortagePct >= 25) adjustmentPct = 14
    else if (shortagePct >= 10) adjustmentPct = 7
    else adjustmentPct = 2

    const estFuturePrice = Math.round(avgHistPrice * (1 + adjustmentPct / 100))
    const fluctuationPct = Number(
      (((maxHistPrice - minHistPrice) / (avgHistPrice || 1)) * 100).toFixed(1)
    )

    let riskIndicator = 'GREEN'
    let crashWarning = 'Low crash risk. Market supply and demand are well balanced.'
    let revenueRisk = 'Low'
    let predictedMovement = adjustmentPct > 2 ? 'Upward Trend' : adjustmentPct < -2 ? 'Downward Pressure' : 'Stable'

    if (surplusPct >= 25 || adjustmentPct <= -12) {
      riskIndicator = 'RED'
      crashWarning = `High price drop risk (${Math.abs(adjustmentPct)}% estimated decline) due to oversupply.`
      revenueRisk = 'High Revenue Risk — Consider buyer demand locking before harvest.'
    } else if (surplusPct >= 10 || fluctuationPct >= 15) {
      riskIndicator = 'YELLOW'
      crashWarning = 'Moderate price fluctuation risk during peak mandi arrivals.'
      revenueRisk = 'Moderate Revenue Risk — Monitor arrivals and lock partial supply.'
    }

    insertPricePred.run(
      crop,
      state,
      district,
      estFuturePrice,
      Math.round(minHistPrice),
      Math.round(maxHistPrice),
      avgHistPrice,
      predictedMovement,
      fluctuationPct,
      crashWarning,
      revenueRisk,
      riskIndicator,
      'Estimated price only — not a guaranteed selling price.'
    )

    if (riskIndicator === 'RED' || riskIndicator === 'YELLOW') {
      insertAlert.run(
        crop,
        state,
        district,
        riskIndicator,
        `${crop} (${district}): ${crashWarning}`,
        riskIndicator === 'RED'
          ? 'Lock confirmed buyer contracts early or stagger harvest storage.'
          : 'Watch 30-day mandi arrival volume before selling full stock.'
      )
    }

    supplyDemandSummaryByCrop.set(crop, {
      crop,
      season,
      expectedTotalKg,
      demand90dKg,
      surplusPct,
      shortagePct,
      classification,
      estFuturePrice,
      riskIndicator,
      avgGovYield,
    })
  }

  // --- SECTION 8: CROP RECOMMENDATION ENGINE (TOP 5 PER FARMER) ---
  const insertRec = db.prepare(`
    INSERT INTO crop_recommendations (
      farmer_id, crop_name, recommended_area_ha, expected_production_kg,
      predicted_demand_kg, expected_selling_price_per_qt, estimated_revenue,
      surplus_risk, score, explanation
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const candidateCrops = Array.from(supplyDemandSummaryByCrop.values())
  for (const farmer of farmers) {
    const scored = candidateCrops
      .map((item) => {
        const recommendedArea = Number(Math.min(farmer.total_land_ha * 0.6, 2.5).toFixed(2))
        const expectedProd = Math.round(recommendedArea * (item.avgGovYield || 3000))
        const expectedRev = Math.round((expectedProd / 100) * item.estFuturePrice)

        // Multi-factor score: balances demand gap, price stability (never price alone!), and surplus penalty
        const demandGapBonus = item.shortagePct * 1.4
        const surplusPenalty = item.surplusPct * 1.5
        const stabilityBonus = item.riskIndicator === 'GREEN' ? 22 : item.riskIndicator === 'YELLOW' ? 8 : -18
        const irrigationBonus = farmer.irrigation_available === 'Yes' ? 10 : 0
        const revenueFactor = Math.min(expectedRev / 15000, 20)

        const score = Number((50 + demandGapBonus - surplusPenalty + stabilityBonus + irrigationBonus + revenueFactor).toFixed(1))

        const explanation =
          item.shortagePct > 0
            ? `Strong market shortage (${item.shortagePct}%) with ${item.riskIndicator} price stability. Good demand-to-supply fit for ${farmer.district}.`
            : `Balanced regional demand with ${item.riskIndicator} price risk and reliable yield (~${Math.round(item.avgGovYield)} kg/ha).`

        return {
          farmer_id: farmer.id,
          crop_name: item.crop,
          recommended_area_ha: recommendedArea,
          expected_production_kg: expectedProd,
          predicted_demand_kg: item.demand90dKg,
          expected_selling_price_per_qt: item.estFuturePrice,
          estimated_revenue: expectedRev,
          surplus_risk: item.classification,
          score,
          explanation,
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    for (const rec of scored) {
      insertRec.run(
        rec.farmer_id,
        rec.crop_name,
        rec.recommended_area_ha,
        rec.expected_production_kg,
        rec.predicted_demand_kg,
        rec.expected_selling_price_per_qt,
        rec.estimated_revenue,
        rec.surplus_risk,
        rec.score,
        rec.explanation
      )
    }
  }
}
