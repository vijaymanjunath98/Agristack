import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BarChart3,
  CloudRain,
  Database,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Shield,
  Sprout,
  Upload,
  Users,
} from 'lucide-react'
import { api } from '../api/client'
import AnalyticsCharts from '../components/AnalyticsCharts'
import DashboardShell from '../components/DashboardShell'

const TABS = [
  { id: 'overview', label: 'Analytics & Charts', icon: BarChart3 },
  { id: 'gov-upload', label: 'Government Data Upload', icon: Upload },
  { id: 'verify', label: 'Verify Submissions', icon: Database },
  { id: 'users', label: 'Users & Agents', icon: Users },
  { id: 'weather', label: 'Alerts & Audit Logs', icon: CloudRain },
]

export default function AdminDashboard({ user, onBackHome, onLogout, onNotify }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    users: [],
    govData: [],
    farmerPlans: [],
    seedSales: [],
    uploadLogs: [],
    alerts: [],
  })

  // Manual Government Upload state
  const [govState, setGovState] = useState('Madhya Pradesh')
  const [govDistrict, setGovDistrict] = useState('Sehore')
  const [govCrop, setGovCrop] = useState('')
  const [govSeason, setGovSeason] = useState('Rabi')
  const [govYear, setGovYear] = useState('2025')
  const [govArea, setGovArea] = useState('')
  const [govProd, setGovProd] = useState('')
  const [govPrice, setGovPrice] = useState('')
  const [govSource, setGovSource] = useState('Authorized State Agri Portal')

  // Alert state
  const [alertCrop, setAlertCrop] = useState('Tomato')
  const [alertDistrict, setAlertDistrict] = useState('Sehore')
  const [alertRisk, setAlertRisk] = useState('YELLOW')
  const [alertMsg, setAlertMsg] = useState('')
  const [alertAdvice, setAlertAdvice] = useState('')

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const res = await api.admin.analytics()
      setAnalytics(res)
    } catch (err) {
      onNotify?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  const handleRunEngine = async () => {
    try {
      const res = await api.admin.runEngine()
      onNotify?.(res.message)
      await loadAnalytics()
    } catch (err) {
      onNotify?.(err.message)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.government.uploadFile(formData)
      onNotify?.(res.message)
      await loadAnalytics()
    } catch (err) {
      onNotify?.(err.message)
    }
  }

  const handleManualGovSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.government.uploadManual({
        state: govState,
        district: govDistrict,
        cropName: govCrop,
        season: govSeason,
        year: Number(govYear),
        cultivatedAreaHa: Number(govArea),
        productionQtyKg: Number(govProd),
        marketPricePerQt: Number(govPrice),
        dataSource: govSource,
      })
      onNotify?.(res.message)
      setGovCrop('')
      setGovArea('')
      setGovProd('')
      setGovPrice('')
      await loadAnalytics()
    } catch (err) {
      onNotify?.(err.message)
    }
  }

  const handleVerifyRecord = async (tableType, id, status) => {
    try {
      const res = await api.admin.verifyRecord({ tableType, id, status })
      onNotify?.(res.message)
      await loadAnalytics()
    } catch (err) {
      onNotify?.(err.message)
    }
  }

  const handleToggleUser = async (id) => {
    try {
      await api.admin.toggleUser(id)
      onNotify?.('User status updated.')
      await loadAnalytics()
    } catch (err) {
      onNotify?.(err.message)
    }
  }

  const handleAlertSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.admin.addAlert({
        cropName: alertCrop,
        district: alertDistrict,
        riskIndicator: alertRisk,
        message: alertMsg,
        advice: alertAdvice,
      })
      onNotify?.('Price/weather alert published.')
      setAlertMsg('')
      setAlertAdvice('')
      await loadAnalytics()
    } catch (err) {
      onNotify?.(err.message)
    }
  }

  return (
    <DashboardShell
      roleBadge="Admin Intelligence Center"
      userLabel={`Operator: ${user?.name || 'Platform Admin'}`}
      menuTitle="Admin Controls"
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerClass="bg-slate-900 text-white border-green-800"
      badgeClass="bg-yellow-300 text-green-950"
      activeTabClass="bg-green-700 text-white shadow-sm"
      bgClass="bg-slate-50"
      headerActions={
        <button
          type="button"
          onClick={handleRunEngine}
          className="inline-flex items-center gap-1.5 rounded-xl bg-green-700 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-green-600"
        >
          <RefreshCw className="h-4 w-4" />
          Run Forecast Engine
        </button>
      }
      onBackHome={onBackHome}
      onLogout={onLogout}
    >
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-green-200 bg-white p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Users</p>
              <p className="mt-1 text-2xl font-extrabold text-green-800">{analytics.users.length}</p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-white p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Gov Records</p>
              <p className="mt-1 text-2xl font-extrabold text-green-800">{analytics.govData.length}</p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-white p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Farmer Plans</p>
              <p className="mt-1 text-2xl font-extrabold text-green-800">{analytics.farmerPlans.length}</p>
            </div>
            <div className="rounded-2xl border border-yellow-300 bg-yellow-100 p-4">
              <p className="text-xs font-bold uppercase text-green-950">Seed Sales</p>
              <p className="mt-1 text-2xl font-extrabold text-green-950">{analytics.seedSales.length}</p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm font-bold text-slate-500">Loading admin analytics...</p>
          ) : (
            <>
              {activeTab === 'overview' && <AnalyticsCharts seedSales={analytics.seedSales} />}

              {activeTab === 'gov-upload' && (
                <div className="grid gap-6 lg:grid-cols-12">
                  <div className="space-y-4 rounded-3xl border border-green-200 bg-white p-6 shadow-sm lg:col-span-5">
                    <h2 className="text-xl font-extrabold">Upload Government CSV / Excel</h2>
                    <p className="text-xs text-slate-600">
                      Accepts `.csv` or `.xlsx` with columns: State, District, Crop Name, Season, Year, Cultivated Area, Production Quantity, Average Yield, Market Price, Data Source.
                    </p>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="block w-full rounded-xl border border-green-200 p-2 text-xs"
                    />

                    <form onSubmit={handleManualGovSubmit} className="space-y-2.5 border-t border-green-100 pt-4 text-sm">
                      <p className="font-extrabold text-green-900">Or Enter Manual Gov Record</p>
                      <input required value={govCrop} onChange={(e) => setGovCrop(e.target.value)} placeholder="Crop Name" className="w-full rounded-xl border border-green-200 px-3 py-2" />
                      <div className="grid grid-cols-2 gap-2">
                        <input required value={govState} onChange={(e) => setGovState(e.target.value)} placeholder="State" className="rounded-xl border border-green-200 px-3 py-2" />
                        <input required value={govDistrict} onChange={(e) => setGovDistrict(e.target.value)} placeholder="District" className="rounded-xl border border-green-200 px-3 py-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select value={govSeason} onChange={(e) => setGovSeason(e.target.value)} className="rounded-xl border border-green-200 bg-white px-3 py-2">
                          <option value="Rabi">Rabi</option>
                          <option value="Kharif">Kharif</option>
                          <option value="Zaid">Zaid</option>
                        </select>
                        <input required type="number" value={govYear} onChange={(e) => setGovYear(e.target.value)} placeholder="Year" className="rounded-xl border border-green-200 px-3 py-2" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input required type="number" value={govArea} onChange={(e) => setGovArea(e.target.value)} placeholder="Area (ha)" className="rounded-xl border border-green-200 px-3 py-2" />
                        <input required type="number" value={govProd} onChange={(e) => setGovProd(e.target.value)} placeholder="Prod (kg)" className="rounded-xl border border-green-200 px-3 py-2" />
                        <input required type="number" value={govPrice} onChange={(e) => setGovPrice(e.target.value)} placeholder="Price ₹/Qt" className="rounded-xl border border-green-200 px-3 py-2" />
                      </div>
                      <input required value={govSource} onChange={(e) => setGovSource(e.target.value)} placeholder="Data Source" className="w-full rounded-xl border border-green-200 px-3 py-2" />
                      <button type="submit" className="w-full rounded-xl bg-green-700 py-2.5 font-bold text-white hover:bg-green-800">
                        Save &amp; Recompute Baseline
                      </button>
                    </form>
                  </div>

                  <div className="space-y-3 lg:col-span-7">
                    <h3 className="text-xl font-extrabold">Government Crop Records ({analytics.govData.length})</h3>
                    {analytics.govData.map((g) => (
                      <div key={g.id} className="rounded-2xl border border-green-200 bg-white p-4 text-sm">
                        <div className="flex justify-between font-extrabold">
                          <span>{g.crop_name} ({g.season} {g.year})</span>
                          <span className="text-green-800">₹{g.market_price_per_qt}/Qt</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {g.district}, {g.state} • Area: {g.cultivated_area_ha} ha • Prod: {g.production_qty_kg} kg • Source: {g.data_source}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'verify' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xl font-extrabold">Farmer Crop Plans Verification</h3>
                    {analytics.farmerPlans.map((fp) => (
                      <div key={fp.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-green-200 bg-white p-4 text-sm">
                        <div>
                          <p className="font-extrabold">{fp.crop_name} — {fp.farmer_name}</p>
                          <p className="text-xs text-slate-500">{fp.district}, {fp.state} • {fp.planned_production_kg} kg • Status: {fp.verified_status}</p>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleVerifyRecord('farmer_crop_plans', fp.id, 'Verified')} className="rounded-xl bg-green-700 px-3 py-1.5 text-xs font-bold text-white">Approve</button>
                          <button type="button" onClick={() => handleVerifyRecord('farmer_crop_plans', fp.id, 'Rejected')} className="rounded-xl bg-red-100 px-3 py-1.5 text-xs font-bold text-red-800">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-extrabold">Company Seed Sales Verification</h3>
                    {analytics.seedSales.map((ss) => (
                      <div key={ss.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-green-200 bg-white p-4 text-sm">
                        <div>
                          <p className="font-extrabold">{ss.crop_name} ({ss.crop_variety}) — {ss.company_name}</p>
                          <p className="text-xs text-slate-500">{ss.district}, {ss.state} • Sold: {ss.qty_sold_kg} kg • Status: {ss.verified_status}</p>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleVerifyRecord('company_seed_sales', ss.id, 'Verified')} className="rounded-xl bg-green-700 px-3 py-1.5 text-xs font-bold text-white">Approve</button>
                          <button type="button" onClick={() => handleVerifyRecord('company_seed_sales', ss.id, 'Rejected')} className="rounded-xl bg-red-100 px-3 py-1.5 text-xs font-bold text-red-800">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="overflow-hidden rounded-3xl border border-green-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-green-50 font-bold text-green-900">
                        <tr>
                          <th className="px-5 py-3">Name</th>
                          <th className="px-5 py-3">Role</th>
                          <th className="px-5 py-3">Location</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-green-100">
                        {analytics.users.map((u) => (
                          <tr key={u.id}>
                            <td className="px-5 py-3 font-bold">{u.name}</td>
                            <td className="px-5 py-3 uppercase text-xs font-bold">{u.role}</td>
                            <td className="px-5 py-3 text-slate-600">{u.district}, {u.state}</td>
                            <td className="px-5 py-3">{u.status}</td>
                            <td className="px-5 py-3">
                              <button type="button" onClick={() => handleToggleUser(u.id)} className="rounded-xl bg-green-700 px-3 py-1 text-xs font-bold text-white">
                                Toggle Status
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'weather' && (
                <div className="grid gap-6 lg:grid-cols-12">
                  <form onSubmit={handleAlertSubmit} className="rounded-3xl border border-green-200 bg-white p-6 lg:col-span-5 space-y-3 text-sm">
                    <h3 className="text-xl font-extrabold">Publish Price / Weather Alert</h3>
                    <input required value={alertCrop} onChange={(e) => setAlertCrop(e.target.value)} placeholder="Crop" className="w-full rounded-xl border border-green-200 px-3 py-2" />
                    <input required value={alertDistrict} onChange={(e) => setAlertDistrict(e.target.value)} placeholder="District" className="w-full rounded-xl border border-green-200 px-3 py-2" />
                    <select value={alertRisk} onChange={(e) => setAlertRisk(e.target.value)} className="w-full rounded-xl border border-green-200 bg-white px-3 py-2">
                      <option value="GREEN">GREEN</option>
                      <option value="YELLOW">YELLOW</option>
                      <option value="RED">RED</option>
                    </select>
                    <input required value={alertMsg} onChange={(e) => setAlertMsg(e.target.value)} placeholder="Alert Message" className="w-full rounded-xl border border-green-200 px-3 py-2" />
                    <textarea required rows={3} value={alertAdvice} onChange={(e) => setAlertAdvice(e.target.value)} placeholder="Farmer Advice" className="w-full rounded-xl border border-green-200 px-3 py-2" />
                    <button type="submit" className="w-full rounded-xl bg-green-700 py-2.5 font-bold text-white">Publish Alert</button>
                  </form>

                  <div className="space-y-3 lg:col-span-7">
                    <h3 className="text-xl font-extrabold">Data Upload &amp; Change Audit Trail</h3>
                    {analytics.uploadLogs.map((log) => (
                      <div key={log.id} className="rounded-2xl border border-green-200 bg-white p-3.5 text-xs">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{log.source_type} ({log.file_name})</span>
                          <span className="text-green-700">{log.status}</span>
                        </div>
                        <p className="mt-1 text-slate-600">
                          Processed: {log.rows_processed} • Duplicates Skipped: {log.duplicates_skipped} • Missing Flagged: {log.missing_fields_flagged}
                        </p>
                        <p className="text-slate-400">{log.action_note} • {log.created_at}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
    </DashboardShell>
  )
}
