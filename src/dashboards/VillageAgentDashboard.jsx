import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  LogOut,
  ShieldCheck,
  Sprout,
  Users,
} from 'lucide-react'
import { api } from '../api/client'

const TABS = [
  { id: 'queue', label: 'Pending Inspections', icon: ClipboardCheck },
  { id: 'farmers', label: 'Registered Farmers', icon: Users },
  { id: 'verified', label: 'Verified Reports', icon: ShieldCheck },
]

export default function VillageAgentDashboard({ user, onBackHome, onLogout, onNotify }) {
  const [activeTab, setActiveTab] = useState('queue')
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState([])
  const [records, setRecords] = useState([])
  const [farmers, setFarmers] = useState([])
  const [moistureMap, setMoistureMap] = useState({})
  const [gradeMap, setGradeMap] = useState({})

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await api.agent.dashboard()
      setPlans(res.plans || [])
      setRecords(res.records || [])
      setFarmers(res.farmers || [])
    } catch (err) {
      onNotify?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleVerify = async (planId) => {
    try {
      const res = await api.agent.verifyPlan({
        farmerPlanId: planId,
        moisturePct: Number(moistureMap[planId] || 11.5),
        qualityGrade: gradeMap[planId] || 'Grade A',
        notes: 'Inspected on-site by Village Agent.',
      })
      onNotify?.(res.message)
      await loadData()
    } catch (err) {
      onNotify?.(err.message)
    }
  }

  const pendingPlans = plans.filter((p) => p.verified_status !== 'Verified')
  const verifiedPlans = plans.filter((p) => p.verified_status === 'Verified')

  return (
    <div className="min-h-screen bg-green-50/50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-green-900 bg-green-900 text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-300 text-green-950">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold">AGRI.IN</span>
                <span className="rounded-full bg-yellow-300 px-2.5 py-0.5 text-xs font-extrabold text-green-950">
                  Village Agent Portal
                </span>
              </div>
              <p className="text-xs text-green-100">Field Agent: {user?.name || 'Sunita Verma'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 rounded-xl bg-green-800 px-3.5 py-2 text-sm font-bold text-white hover:bg-green-700"
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
            <p className="px-3 pb-2 text-xs font-extrabold uppercase tracking-wider text-green-800">
              Agent Menu
            </p>
            <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col">
              {TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-bold transition ${
                      activeTab === tab.id ? 'bg-green-900 text-white' : 'text-slate-700 hover:bg-green-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        <main className="space-y-6 lg:col-span-9">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-yellow-300 bg-yellow-100 p-5">
              <p className="text-sm font-bold text-green-950">Pending Inspections</p>
              <p className="mt-1 text-3xl font-extrabold text-green-950">{pendingPlans.length}</p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-500">Verified Plans</p>
              <p className="mt-1 text-3xl font-extrabold text-green-800">{verifiedPlans.length}</p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-500">Registered Farmers</p>
              <p className="mt-1 text-3xl font-extrabold text-green-800">{farmers.length}</p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm font-bold text-slate-500">Loading agent records...</p>
          ) : (
            <>
              {activeTab === 'queue' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-extrabold text-slate-900">Farmer Crop Plans Waiting for Field Check</h2>
                  {pendingPlans.length === 0 ? (
                    <div className="rounded-3xl border border-green-200 bg-white p-8 text-center">
                      <CheckCircle2 className="mx-auto h-10 w-10 text-green-700" />
                      <p className="mt-2 text-lg font-extrabold text-slate-900">All farm inspections are completed!</p>
                    </div>
                  ) : (
                    pendingPlans.map((plan) => (
                      <div key={plan.id} className="rounded-3xl border-2 border-yellow-300 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="font-mono text-xs font-bold text-slate-500">PLAN #{plan.id} • {plan.farmer_code}</span>
                            <h3 className="text-xl font-extrabold text-slate-900">{plan.crop_name}</h3>
                            <p className="text-sm text-slate-600">
                              Farmer: {plan.farmer_name} • {plan.village}, {plan.district} • {plan.planned_production_kg} kg
                            </p>
                          </div>
                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-extrabold text-yellow-950">
                            Needs Inspection
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Moisture % (e.g. 11.5)"
                            value={moistureMap[plan.id] || ''}
                            onChange={(e) => setMoistureMap((prev) => ({ ...prev, [plan.id]: e.target.value }))}
                            className="rounded-xl border border-green-200 px-4 py-3 text-sm font-semibold"
                          />
                          <select
                            value={gradeMap[plan.id] || 'Grade A'}
                            onChange={(e) => setGradeMap((prev) => ({ ...prev, [plan.id]: e.target.value }))}
                            className="rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-semibold"
                          >
                            <option value="Grade A+">Grade A+</option>
                            <option value="Grade A">Grade A</option>
                            <option value="Grade B">Grade B</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleVerify(plan.id)}
                            className="rounded-xl bg-green-800 px-5 py-3 text-sm font-bold text-white hover:bg-green-900"
                          >
                            Approve &amp; Verify Crop
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'farmers' && (
                <div className="grid gap-4 md:grid-cols-3">
                  {farmers.map((f) => (
                    <div key={f.id} className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm">
                      <span className="font-mono text-xs font-bold text-green-700">{f.farmer_code}</span>
                      <h3 className="mt-1 text-lg font-extrabold text-slate-900">{f.name}</h3>
                      <p className="text-sm text-slate-600">{f.village}, {f.taluk}, {f.district}</p>
                      <p className="mt-2 text-xs font-bold text-slate-500">
                        Total Land: {f.total_land_ha} ha • Irrigation: {f.irrigation_available}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'verified' && (
                <div className="space-y-3">
                  <h2 className="text-2xl font-extrabold text-slate-900">Agent Verification Records ({records.length})</h2>
                  {records.map((r) => (
                    <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-green-200 bg-white p-4">
                      <div>
                        <p className="font-extrabold text-slate-900">Plan #{r.farmer_plan_id} • {r.village}, {r.district}</p>
                        <p className="text-xs text-slate-500">{r.notes} • {r.inspected_at}</p>
                      </div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-800">
                        {r.quality_grade} • Moisture {r.moisture_pct}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
