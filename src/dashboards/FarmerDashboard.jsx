import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  CloudSun,
  Flame,
  Lock,
  LogOut,
  PlusCircle,
  Sparkles,
  Sprout,
  Tractor,
  Wheat,
} from 'lucide-react'
import { api } from '../api/client'
import AnalyticsCharts from '../components/AnalyticsCharts'

const TABS = [
  { id: 'overview', label: 'Crop Plan & Estimate', icon: Tractor },
  { id: 'crops', label: 'My Plans & Locking', icon: Wheat },
  { id: 'recommendations', label: 'Top 5 Crop Advice', icon: Sparkles },
  { id: 'demand', label: 'Buyer Demands', icon: Flame },
  { id: 'analytics', label: 'Market Charts', icon: BarChart3 },
  { id: 'weather', label: 'Price & Weather Alerts', icon: CloudSun },
]

export default function FarmerDashboard({ user, weatherAlerts = [], onBackHome, onLogout, onNotify }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [farmer, setFarmer] = useState(null)
  const [plans, setPlans] = useState([])
  const [demands, setDemands] = useState([])
  const [orders, setOrders] = useState([])
  const [alerts, setAlerts] = useState([])
  const [recommendations, setRecommendations] = useState([])

  // Crop plan form fields
  const [cropName, setCropName] = useState('')
  const [season, setSeason] = useState('Rabi')
  const [state, setState] = useState(user?.state || 'Madhya Pradesh')
  const [district, setDistrict] = useState(user?.district || 'Sehore')
  const [taluk, setTaluk] = useState(user?.taluk || 'Sehore')
  const [village, setVillage] = useState(user?.village || 'Bilkisganj')
  const [totalLandHa, setTotalLandHa] = useState('4.5')
  const [plannedAreaHa, setPlannedAreaHa] = useState('2.0')
  const [sowingDate, setSowingDate] = useState('2026-11-28')
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('2027-02-28')
  const [expectedYieldKgPerHa, setExpectedYieldKgPerHa] = useState('3500')
  const [irrigationAvailable, setIrrigationAvailable] = useState('Yes')
  const [currentGrowingCrop, setCurrentGrowingCrop] = useState('')
  const [currentProductionKg, setCurrentProductionKg] = useState('0')
  const [expectedPricePerQt, setExpectedPricePerQt] = useState('2700')

  // Smart demand locking state
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [commitQtyMap, setCommitQtyMap] = useState({})

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [dashRes, recRes] = await Promise.all([
        api.farmer.dashboard(),
        api.farmer.recommendations(),
      ])
      setFarmer(dashRes.farmer)
      setPlans(dashRes.plans || [])
      setDemands(dashRes.demands || [])
      setOrders(dashRes.orders || [])
      setAlerts(dashRes.alerts || [])
      setRecommendations(recRes.recommendations || [])
      if (dashRes.plans?.[0]) {
        setSelectedPlanId(String(dashRes.plans[0].id))
      }
    } catch (err) {
      onNotify?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const autoEstimatedProdKg = Math.round(
    (Number(plannedAreaHa) || 0) * (Number(expectedYieldKgPerHa) || 0)
  )

  const handlePlanSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.farmer.createCropPlan({
        cropName,
        season,
        state,
        district,
        taluk,
        village,
        totalLandHa: Number(totalLandHa),
        plannedAreaHa: Number(plannedAreaHa),
        sowingDate,
        expectedHarvestDate,
        expectedYieldKgPerHa: Number(expectedYieldKgPerHa),
        irrigationAvailable,
        currentGrowingCrop,
        currentProductionKg: Number(currentProductionKg || 0),
        expectedPricePerQt: Number(expectedPricePerQt || 2500),
      })
      onNotify?.(res.message)
      setCropName('')
      await loadDashboard()
      setActiveTab('crops')
    } catch (err) {
      onNotify?.(err.message)
    }
  }

  const handleCommitDemand = async (demandId) => {
    const planId = Number(selectedPlanId || plans[0]?.id)
    const qty = Number(commitQtyMap[demandId] || 500)
    if (!planId) {
      onNotify?.('Please create a crop plan first before committing quantity.')
      return
    }
    try {
      const res = await api.farmer.commitDemand({
        farmerPlanId: planId,
        demandId,
        commitQtyKg: qty,
      })
      onNotify?.(res.message)
      setCommitQtyMap((prev) => ({ ...prev, [demandId]: '' }))
      await loadDashboard()
    } catch (err) {
      onNotify?.(err.message)
    }
  }

  const verifiedCount = plans.filter((p) => p.verified_status === 'Verified').length
  const totalCommittedKg = plans.reduce((s, p) => s + Number(p.committed_qty_kg || 0), 0)

  return (
    <div className="min-h-screen bg-yellow-50/40 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-green-200 bg-green-800 text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-300 text-green-950">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold">AGRI.IN</span>
                <span className="rounded-full bg-green-700 px-2.5 py-0.5 text-xs font-bold text-yellow-200">
                  Farmer Portal ({farmer?.farmer_code || 'FRM'})
                </span>
              </div>
              <p className="text-xs text-green-100">
                {farmer?.name || user?.name} • {farmer?.village || village}, {farmer?.district || district}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 rounded-xl bg-green-700 px-3.5 py-2 text-sm font-bold text-white hover:bg-green-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Website Home
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-xl bg-yellow-300 px-3.5 py-2 text-sm font-bold text-green-950 hover:bg-yellow-200"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:px-8">
        <aside className="lg:col-span-3">
          <div className="rounded-3xl border border-green-200 bg-white p-4 shadow-sm">
            <p className="px-3 pb-2 text-xs font-extrabold uppercase tracking-wider text-green-700">
              Farmer Menu
            </p>
            <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col">
              {TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                      activeTab === tab.id ? 'bg-green-700 text-white shadow-sm' : 'text-slate-700 hover:bg-green-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        <main className="space-y-6 lg:col-span-9">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-green-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-500">My Crop Plans</p>
              <p className="mt-1 text-2xl font-extrabold text-green-800">{plans.length}</p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-500">Verified Plans</p>
              <p className="mt-1 text-2xl font-extrabold text-green-800">{verifiedCount}</p>
            </div>
            <div className="rounded-2xl border border-yellow-300 bg-yellow-100 p-4 shadow-sm">
              <p className="text-xs font-bold text-green-900">Locked to Buyers</p>
              <p className="mt-1 text-2xl font-extrabold text-green-950">{totalCommittedKg} kg</p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-500">Confirmed Orders</p>
              <p className="mt-1 text-2xl font-extrabold text-green-800">{orders.length}</p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-green-200 bg-white p-8 text-center text-sm font-bold text-slate-500">
              Loading your farmer portal...
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <form
                  onSubmit={handlePlanSubmit}
                  className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center gap-2 text-green-800">
                    <PlusCircle className="h-6 w-6" />
                    <h2 className="text-xl font-extrabold">Enter Farmer Production Plan (Source 2)</h2>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Submitting your plan automatically updates regional production predictions and crop recommendations.
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                    <div>
                      <label className="block font-bold text-slate-700">Crop Selected</label>
                      <input
                        required
                        value={cropName}
                        onChange={(e) => setCropName(e.target.value)}
                        placeholder="e.g., Sharbati Wheat, Tomato"
                        className="mt-1 w-full rounded-xl border border-green-200 px-3.5 py-2.5"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700">Season</label>
                      <select
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-green-200 bg-white px-3.5 py-2.5"
                      >
                        <option value="Rabi">Rabi</option>
                        <option value="Kharif">Kharif</option>
                        <option value="Zaid">Zaid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700">Irrigation Available</label>
                      <select
                        value={irrigationAvailable}
                        onChange={(e) => setIrrigationAvailable(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-green-200 bg-white px-3.5 py-2.5"
                      >
                        <option value="Yes">Yes</option>
                        <option value="Partial">Partial</option>
                        <option value="No">Rainfed Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700">State</label>
                      <input required value={state} onChange={(e) => setState(e.target.value)} className="mt-1 w-full rounded-xl border border-green-200 px-3.5 py-2.5" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700">District</label>
                      <input required value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-1 w-full rounded-xl border border-green-200 px-3.5 py-2.5" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700">Taluk &amp; Village</label>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <input required value={taluk} onChange={(e) => setTaluk(e.target.value)} placeholder="Taluk" className="w-full rounded-xl border border-green-200 px-3 py-2.5" />
                        <input required value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Village" className="w-full rounded-xl border border-green-200 px-3 py-2.5" />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700">Total Land (ha)</label>
                      <input required type="number" step="0.1" value={totalLandHa} onChange={(e) => setTotalLandHa(e.target.value)} className="mt-1 w-full rounded-xl border border-green-200 px-3.5 py-2.5" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700">Planned Area (ha)</label>
                      <input required type="number" step="0.1" value={plannedAreaHa} onChange={(e) => setPlannedAreaHa(e.target.value)} className="mt-1 w-full rounded-xl border border-green-200 px-3.5 py-2.5" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700">Expected Yield (kg/ha)</label>
                      <input required type="number" value={expectedYieldKgPerHa} onChange={(e) => setExpectedYieldKgPerHa(e.target.value)} className="mt-1 w-full rounded-xl border border-green-200 px-3.5 py-2.5" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700">Sowing Date</label>
                      <input required type="date" value={sowingDate} onChange={(e) => setSowingDate(e.target.value)} className="mt-1 w-full rounded-xl border border-green-200 px-3.5 py-2.5" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700">Expected Harvest Date</label>
                      <input required type="date" value={expectedHarvestDate} onChange={(e) => setExpectedHarvestDate(e.target.value)} className="mt-1 w-full rounded-xl border border-green-200 px-3.5 py-2.5" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700">Expected Price (₹/Qt)</label>
                      <input required type="number" value={expectedPricePerQt} onChange={(e) => setExpectedPricePerQt(e.target.value)} className="mt-1 w-full rounded-xl border border-green-200 px-3.5 py-2.5" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700">Current Growing Crop</label>
                      <input value={currentGrowingCrop} onChange={(e) => setCurrentGrowingCrop(e.target.value)} placeholder="Optional" className="mt-1 w-full rounded-xl border border-green-200 px-3.5 py-2.5" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700">Current Production (kg)</label>
                      <input type="number" value={currentProductionKg} onChange={(e) => setCurrentProductionKg(e.target.value)} className="mt-1 w-full rounded-xl border border-green-200 px-3.5 py-2.5" />
                    </div>
                    <div className="rounded-2xl border border-yellow-300 bg-yellow-100 p-3">
                      <p className="text-xs font-bold text-green-900">Auto-Estimated Production</p>
                      <p className="text-xl font-extrabold text-green-950">
                        {autoEstimatedProdKg.toLocaleString()} kg
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-5 w-full rounded-2xl bg-green-700 py-3.5 text-base font-bold text-white shadow-sm hover:bg-green-800"
                  >
                    Submit Crop Plan &amp; Update Market Analysis
                  </button>
                </form>
              )}

              {activeTab === 'crops' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-extrabold text-slate-900">My Planned Production &amp; Smart Locking</h2>
                  {plans.map((p) => {
                    const remaining = p.planned_production_kg - p.committed_qty_kg
                    return (
                      <div key={p.id} className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="font-mono text-xs font-bold text-slate-500">PLAN #{p.id} • {p.season}</span>
                            <h3 className="text-xl font-extrabold text-slate-900">{p.crop_name}</h3>
                            <p className="text-sm text-slate-600">
                              {p.village}, {p.district} • Area: {p.planned_area_ha} ha • Harvest: {p.expected_harvest_date}
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${p.verified_status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-950'}`}>
                            {p.verified_status}
                          </span>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-green-50 p-3 text-center text-sm">
                          <div>
                            <p className="text-xs text-slate-500">Planned Output</p>
                            <p className="font-extrabold text-slate-900">{p.planned_production_kg} kg</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Committed</p>
                            <p className="font-extrabold text-amber-700">{p.committed_qty_kg} kg</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Uncommitted</p>
                            <p className="font-extrabold text-green-800">{remaining} kg</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {orders.length > 0 && (
                    <div className="rounded-3xl border border-yellow-300 bg-yellow-50/70 p-5">
                      <h3 className="text-lg font-extrabold text-green-950">Confirmed Buyer Commitments</h3>
                      <div className="mt-3 space-y-2">
                        {orders.map((o) => (
                          <div key={o.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm border border-yellow-200">
                            <span className="font-bold">{o.crop_name} → {o.buyer_name}</span>
                            <span className="font-extrabold text-green-800">{o.confirmed_qty_kg} kg @ ₹{o.agreed_price_per_qt}/Qt ({o.status})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-extrabold text-slate-900">Top 5 Recommended Crops For Your Farm</h2>
                  <p className="text-sm text-slate-600">
                    Ranked using expected demand, predicted supply, surplus risk, seasonal suitability, and estimated price (never price alone).
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {recommendations.map((rec, idx) => (
                      <div key={rec.id} className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-green-700 px-3 py-1 text-xs font-extrabold text-white">
                            Rank #{idx + 1} • Score {rec.score}
                          </span>
                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-green-950">
                            {rec.surplus_risk}
                          </span>
                        </div>
                        <h3 className="mt-3 text-xl font-extrabold text-slate-900">{rec.crop_name}</h3>
                        <p className="mt-1 text-sm text-slate-600">{rec.explanation}</p>
                        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-green-50 p-3 text-xs">
                          <div><span className="text-slate-500">Recommended Area:</span> <strong>{rec.recommended_area_ha} ha</strong></div>
                          <div><span className="text-slate-500">Est. Output:</span> <strong>{rec.expected_production_kg} kg</strong></div>
                          <div><span className="text-slate-500">Est. Price*:</span> <strong>₹{rec.expected_selling_price_per_qt}/Qt</strong></div>
                          <div><span className="text-slate-500">Est. Revenue:</span> <strong>₹{rec.estimated_revenue.toLocaleString('en-IN')}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'demand' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-2xl font-extrabold text-slate-900">Smart Demand Locking</h2>
                    {plans.length > 0 && (
                      <select
                        value={selectedPlanId}
                        onChange={(e) => setSelectedPlanId(e.target.value)}
                        className="rounded-xl border border-green-300 bg-white px-3 py-2 text-sm font-bold"
                      >
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            Plan #{p.id}: {p.crop_name} ({p.planned_production_kg - p.committed_qty_kg} kg free)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {demands.map((d) => {
                      const remainingNeed = d.qty_required_kg - d.reserved_qty_kg
                      return (
                        <div key={d.id} className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm">
                          <div className="flex justify-between">
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-extrabold text-green-950">
                              {d.demand_type.toUpperCase()} • {d.verified_status}
                            </span>
                            <span className="text-xs font-bold text-slate-500">Due {d.required_delivery_date}</span>
                          </div>
                          <h3 className="mt-3 text-xl font-extrabold text-slate-900">{d.crop_name}</h3>
                          <p className="text-sm font-semibold text-green-800">{d.buyer_name} ({d.buyer_category}) • ₹{d.expected_price_per_qt}/Qt</p>
                          <p className="mt-1 text-xs text-slate-600">
                            Requested: {d.qty_required_kg} kg • Reserved: {d.reserved_qty_kg} kg • Open: {remainingNeed} kg
                          </p>
                          <div className="mt-4 flex gap-2">
                            <input
                              type="number"
                              min="1"
                              max={remainingNeed}
                              placeholder="Commit kg (e.g. 500)"
                              value={commitQtyMap[d.id] || ''}
                              onChange={(e) => setCommitQtyMap((prev) => ({ ...prev, [d.id]: e.target.value }))}
                              className="w-full rounded-xl border border-green-200 px-3 py-2 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleCommitDemand(d.id)}
                              className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
                            >
                              <Lock className="h-4 w-4" />
                              Lock Supply
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && <AnalyticsCharts recommendations={recommendations} />}

              {activeTab === 'weather' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-extrabold text-slate-900">Price Protection &amp; Weather Alerts</h2>
                  {alerts.map((a) => (
                    <div key={a.id} className="rounded-2xl border border-yellow-300 bg-yellow-50 p-4">
                      <span className="rounded-full bg-yellow-200 px-2.5 py-0.5 text-xs font-extrabold text-green-950">{a.risk_indicator} RISK</span>
                      <p className="mt-2 font-extrabold text-slate-900">{a.message}</p>
                      <p className="text-sm text-slate-700">{a.advice}</p>
                    </div>
                  ))}
                  <div className="grid gap-4 md:grid-cols-2">
                    {weatherAlerts.map((w) => (
                      <div key={w.id} className="rounded-2xl border border-green-200 bg-white p-4">
                        <p className="text-xs font-extrabold text-green-700">{w.level} • {w.temp}</p>
                        <h3 className="text-lg font-extrabold">{w.region}</h3>
                        <p className="mt-1 text-sm text-slate-600">{w.advice}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
