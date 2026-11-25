import { useEffect, useState } from 'react'
import { AlertTriangle, BarChart3, Filter, RefreshCw, ShieldCheck, TrendingUp } from 'lucide-react'
import { api } from '../api/client'

export default function AnalyticsCharts({ recommendations = [], seedSales = [] }) {
  const [filters, setFilters] = useState({
    state: 'All',
    district: 'All',
    taluk: 'All',
    crop: 'All',
    season: 'All',
    period: '90',
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState({
    production: [],
    demand: [],
    supplyDemand: [],
    priceTrends: [],
    priceProtection: [],
    forecast90: [],
  })

  const loadAnalytics = async (activeFilters) => {
    setLoading(true)
    setError('')
    try {
      const [prodRes, demRes, sdRes, ptRes, ppRes, f90Res] = await Promise.all([
        api.market.productionForecast(activeFilters),
        api.market.demandForecast(activeFilters),
        api.market.supplyDemand(activeFilters),
        api.market.priceTrends(activeFilters),
        api.market.priceProtection(activeFilters),
        api.market.forecast90Days(activeFilters),
      ])
      setData({
        production: prodRes.forecasts || [],
        demand: demRes.forecasts || [],
        supplyDemand: sdRes.analysis || [],
        priceTrends: ptRes.prices || [],
        priceProtection: ppRes.predictions || [],
        forecast90: f90Res.forecasts90Days || [],
      })
    } catch (err) {
      setError(err.message || 'Unable to load analytics data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics(filters)
  }, [filters])

  const uniqueStates = ['All', ...new Set(data.production.map((r) => r.state))]
  const uniqueDistricts = ['All', ...new Set(data.production.map((r) => r.district))]
  const uniqueCrops = ['All', ...new Set(data.production.map((r) => r.crop_name))]
  const uniqueSeasons = ['All', 'Rabi', 'Kharif', 'Zaid']

  const maxProd = Math.max(
    1,
    ...data.production.map((r) => Math.max(r.historical_baseline_kg, r.farmer_planned_kg, r.expected_total_kg))
  )
  const maxDemand = Math.max(1, ...data.demand.map((r) => r.demand_90d_kg))
  const maxSeed = Math.max(1, ...seedSales.map((s) => s.qty_sold_kg + s.qty_booked_kg))
  const maxGapAbs = Math.max(1, ...data.supplyDemand.map((s) => Math.abs(s.gap_kg)))

  // District aggregation for Chart 9
  const districtTotals = Object.entries(
    data.production.reduce((acc, r) => {
      acc[r.district] = (acc[r.district] || 0) + r.expected_total_kg
      return acc
    }, {})
  )
  const maxDistrict = Math.max(1, ...districtTotals.map(([, v]) => v))

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-green-100 pb-3">
          <div className="flex items-center gap-2 text-green-900">
            <Filter className="h-5 w-5 text-green-700" />
            <h3 className="text-lg font-extrabold">Agricultural Intelligence &amp; 10 Visual Charts</h3>
          </div>
          <button
            type="button"
            onClick={() => loadAnalytics(filters)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-green-100 px-3 py-1.5 text-xs font-bold text-green-900 hover:bg-green-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Charts
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <select
            value={filters.state}
            onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))}
            className="rounded-xl border border-green-200 bg-white px-3 py-2 text-xs font-bold"
          >
            {uniqueStates.map((s) => (
              <option key={s} value={s}>State: {s}</option>
            ))}
          </select>

          <select
            value={filters.district}
            onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
            className="rounded-xl border border-green-200 bg-white px-3 py-2 text-xs font-bold"
          >
            {uniqueDistricts.map((d) => (
              <option key={d} value={d}>District: {d}</option>
            ))}
          </select>

          <select
            value={filters.taluk}
            onChange={(e) => setFilters((f) => ({ ...f, taluk: e.target.value }))}
            className="rounded-xl border border-green-200 bg-white px-3 py-2 text-xs font-bold"
          >
            <option value="All">Taluk: All</option>
            <option value="Sehore">Taluk: Sehore</option>
            <option value="Ashta">Taluk: Ashta</option>
            <option value="Ausa">Taluk: Ausa</option>
          </select>

          <select
            value={filters.crop}
            onChange={(e) => setFilters((f) => ({ ...f, crop: e.target.value }))}
            className="rounded-xl border border-green-200 bg-white px-3 py-2 text-xs font-bold"
          >
            {uniqueCrops.map((c) => (
              <option key={c} value={c}>Crop: {c}</option>
            ))}
          </select>

          <select
            value={filters.season}
            onChange={(e) => setFilters((f) => ({ ...f, season: e.target.value }))}
            className="rounded-xl border border-green-200 bg-white px-3 py-2 text-xs font-bold"
          >
            {uniqueSeasons.map((s) => (
              <option key={s} value={s}>Season: {s}</option>
            ))}
          </select>

          <select
            value={filters.period}
            onChange={(e) => setFilters((f) => ({ ...f, period: e.target.value }))}
            className="rounded-xl border border-green-200 bg-yellow-50 px-3 py-2 text-xs font-bold text-green-950"
          >
            <option value="30">Horizon: 30 Days</option>
            <option value="60">Horizon: 60 Days</option>
            <option value="90">Horizon: 90 Days</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-green-200 bg-white p-10 text-center text-sm font-bold text-slate-500">
          Computing agricultural forecasts and charts...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Chart 1: Government Production vs Farmer Planned Production */}
          <div className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm">
            <h4 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <BarChart3 className="h-4 w-4 text-green-700" />
              1. Government Baseline vs Farmer Planned Production
            </h4>
            <div className="mt-4 space-y-3">
              {data.production.map((r) => (
                <div key={`${r.crop_name}-${r.district}`} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{r.crop_name} ({r.district})</span>
                    <span>Gov: {(r.historical_baseline_kg / 1000).toFixed(1)}t | Farmer: {(r.farmer_planned_kg / 1000).toFixed(1)}t</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    <div className="h-2.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2.5 rounded-full bg-green-700"
                        style={{ width: `${Math.min(100, (r.historical_baseline_kg / maxProd) * 100)}%` }}
                      />
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2.5 rounded-full bg-yellow-400"
                        style={{ width: `${Math.min(100, (r.farmer_planned_kg / maxProd) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Seed Sales & Estimated Planting Trends */}
          <div className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm">
            <h4 className="text-base font-extrabold text-slate-900">
              2. Seed Sales &amp; Estimated Planting Intentions
            </h4>
            <p className="text-xs text-slate-500">Early planting indicator only (not guaranteed production)</p>
            <div className="mt-4 space-y-3">
              {(seedSales.length > 0 ? seedSales : data.production).map((s, idx) => {
                const label = s.crop_variety ? `${s.crop_name} (${s.crop_variety})` : `${s.crop_name} (Seed Signal)`
                const val = s.qty_sold_kg !== undefined ? s.qty_sold_kg + s.qty_booked_kg : s.seed_indicator_kg
                const pct = s.qty_sold_kg !== undefined ? (val / maxSeed) * 100 : (val / maxProd) * 100
                return (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{label}</span>
                      <span>{val.toLocaleString()} kg {s.estimated_area_ha ? `(~${s.estimated_area_ha} ha)` : ''}</span>
                    </div>
                    <div className="mt-1 h-3 w-full rounded-full bg-yellow-50 border border-yellow-200">
                      <div className="h-3 rounded-full bg-emerald-600" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chart 3: Predicted Production vs Predicted Demand */}
          <div className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm">
            <h4 className="text-base font-extrabold text-slate-900">
              3. Predicted Production vs Predicted Demand ({filters.period}d)
            </h4>
            <div className="mt-4 space-y-3">
              {data.supplyDemand.map((sd) => {
                const dMatch = data.demand.find((d) => d.crop_name === sd.crop_name && d.district === sd.district)
                const demVal =
                  filters.period === '30'
                    ? dMatch?.demand_30d_kg || sd.predicted_demand_kg * 0.3
                    : filters.period === '60'
                    ? dMatch?.demand_60d_kg || sd.predicted_demand_kg * 0.62
                    : sd.predicted_demand_kg
                const prodVal =
                  filters.period === '30'
                    ? sd.predicted_production_kg * 0.25
                    : filters.period === '60'
                    ? sd.predicted_production_kg * 0.6
                    : sd.predicted_production_kg
                const scale = Math.max(maxProd, maxDemand, 1)
                return (
                  <div key={`${sd.crop_name}-${sd.district}`} className="text-xs">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{sd.crop_name}</span>
                      <span>Supply {(prodVal / 1000).toFixed(1)}t vs Demand {(demVal / 1000).toFixed(1)}t</span>
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <div className="h-2.5 rounded-full bg-slate-100">
                        <div className="h-2.5 rounded-full bg-green-700" style={{ width: `${Math.min(100, (prodVal / scale) * 100)}%` }} />
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100">
                        <div className="h-2.5 rounded-full bg-amber-500" style={{ width: `${Math.min(100, (demVal / scale) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chart 4 & 5: 90-Day Production & Demand Forecast */}
          <div className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm">
            <h4 className="text-base font-extrabold text-slate-900">
              4 &amp; 5. 90-Day Production &amp; Demand Horizon (30d / 60d / 90d)
            </h4>
            <div className="mt-4 space-y-3">
              {data.forecast90.map((f) => (
                <div key={`${f.cropName}-${f.district}`} className="rounded-2xl bg-green-50/60 p-3 text-xs border border-green-100">
                  <div className="flex items-center justify-between font-extrabold text-slate-900">
                    <span>{f.cropName} ({f.district})</span>
                    <span className="text-green-800">{f.confidencePct}% confidence • {f.dataAvailability}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-white p-2">
                      <p className="text-slate-500">30 Days</p>
                      <p className="font-bold text-green-800">P: {(f.production30dKg / 1000).toFixed(1)}t</p>
                      <p className="font-bold text-amber-700">D: {(f.demand30dKg / 1000).toFixed(1)}t</p>
                    </div>
                    <div className="rounded-xl bg-white p-2">
                      <p className="text-slate-500">60 Days</p>
                      <p className="font-bold text-green-800">P: {(f.production60dKg / 1000).toFixed(1)}t</p>
                      <p className="font-bold text-amber-700">D: {(f.demand60dKg / 1000).toFixed(1)}t</p>
                    </div>
                    <div className="rounded-xl bg-white p-2">
                      <p className="text-slate-500">90 Days</p>
                      <p className="font-bold text-green-800">P: {(f.production90dKg / 1000).toFixed(1)}t</p>
                      <p className="font-bold text-amber-700">D: {(f.demand90dKg / 1000).toFixed(1)}t</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 6: Historical & Predicted Market Price */}
          <div className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm">
            <h4 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <TrendingUp className="h-4 w-4 text-green-700" />
              6. Historical vs Estimated Future Market Price (₹/Qt)
            </h4>
            <p className="text-xs text-slate-500">All future prices are estimates only, not guaranteed selling prices.</p>
            <div className="mt-4 space-y-2.5">
              {data.priceProtection.map((pp) => (
                <div key={`${pp.crop_name}-${pp.district}`} className="rounded-2xl border border-green-100 bg-yellow-50/40 p-3 text-xs">
                  <div className="flex justify-between font-extrabold text-slate-900">
                    <span>{pp.crop_name}</span>
                    <span className="text-green-800">Est. Future: ₹{pp.estimated_future_price_per_qt}/Qt</span>
                  </div>
                  <div className="mt-1 flex justify-between text-slate-600">
                    <span>Min: ₹{pp.min_historical_price}</span>
                    <span>Avg: ₹{pp.avg_market_price}</span>
                    <span>Max: ₹{pp.max_historical_price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 7: Crop-wise Surplus and Shortage */}
          <div className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm">
            <h4 className="text-base font-extrabold text-slate-900">
              7. Crop-Wise Surplus &amp; Shortage Gap
            </h4>
            <div className="mt-4 space-y-3">
              {data.supplyDemand.map((sd) => {
                const isSurplus = sd.gap_kg >= 0
                const pct = Math.min(100, (Math.abs(sd.gap_kg) / maxGapAbs) * 100)
                return (
                  <div key={`${sd.crop_name}-${sd.district}`} className="text-xs">
                    <div className="flex justify-between font-bold">
                      <span>{sd.crop_name} ({sd.classification})</span>
                      <span className={isSurplus ? 'text-amber-700' : 'text-green-700'}>
                        {isSurplus ? `+${sd.surplus_pct}% Surplus` : `-${sd.shortage_pct}% Shortage`}
                      </span>
                    </div>
                    <div className="mt-1 h-3 w-full rounded-full bg-slate-100">
                      <div
                        className={`h-3 rounded-full ${isSurplus ? 'bg-amber-500' : 'bg-green-700'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chart 8: Price Protection & Crash Risk */}
          <div className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm">
            <h4 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              8. Price Protection &amp; Crash Risk Indicator
            </h4>
            <div className="mt-4 space-y-2.5">
              {data.priceProtection.map((pp) => (
                <div key={`${pp.crop_name}-${pp.district}`} className="flex items-center justify-between gap-3 rounded-2xl border border-green-100 p-3 text-xs">
                  <div>
                    <p className="font-extrabold text-slate-900">{pp.crop_name} ({pp.predicted_movement})</p>
                    <p className="text-slate-600">{pp.crash_warning}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 font-extrabold ${
                      pp.risk_indicator === 'GREEN'
                        ? 'bg-green-100 text-green-800'
                        : pp.risk_indicator === 'YELLOW'
                        ? 'bg-yellow-200 text-yellow-950'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {pp.risk_indicator}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 9 & 10: District Production & Crop Recommendation Ranking */}
          <div className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm">
            <h4 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-green-700" />
              9 &amp; 10. District Production &amp; Crop Recommendation Ranking
            </h4>
            <div className="mt-4 space-y-3">
              <p className="text-xs font-bold uppercase text-green-700">District Expected Output</p>
              {districtTotals.map(([dist, val]) => (
                <div key={dist} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{dist}</span>
                    <span>{(val / 1000).toFixed(1)} tonnes</span>
                  </div>
                  <div className="mt-1 h-2.5 rounded-full bg-slate-100">
                    <div className="h-2.5 rounded-full bg-green-700" style={{ width: `${(val / maxDistrict) * 100}%` }} />
                  </div>
                </div>
              ))}

              {recommendations.length > 0 && (
                <div className="mt-4 border-t border-green-100 pt-3">
                  <p className="text-xs font-bold uppercase text-green-700">Top Recommended Crops (Multi-Factor Score)</p>
                  <div className="mt-2 space-y-2">
                    {recommendations.map((rec, i) => (
                      <div key={rec.id || i} className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">#{i + 1} {rec.crop_name}</span>
                        <span className="rounded-lg bg-green-100 px-2 py-0.5 font-extrabold text-green-800">
                          Score {rec.score} • {rec.surplus_risk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
