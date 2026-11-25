import { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  LogOut,
  ShieldCheck,
  Sprout,
  Users,
} from 'lucide-react'
import { VILLAGE_FARMERS_HELPED } from '../data/mockData'

const TABS = [
  { id: 'queue', label: 'Pending Inspections', icon: ClipboardCheck },
  { id: 'farmers', label: 'Farmers I Support', icon: Users },
  { id: 'verified', label: 'Verified Reports', icon: ShieldCheck },
]

export default function VillageAgentDashboard({
  user,
  lots,
  onVerifyLot,
  onBackHome,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('queue')
  const [moistureMap, setMoistureMap] = useState({})
  const [gradeMap, setGradeMap] = useState({})

  const pendingLots = lots.filter((l) => l.status !== 'Verified')
  const verifiedLots = lots.filter((l) => l.status === 'Verified')

  return (
    <div className="min-h-screen bg-green-50/50 text-slate-900">
      {/* Village Agent Header */}
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
              <p className="text-xs text-green-100">
                Field Agent: {user?.name || 'Sunita Verma'}
              </p>
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
        {/* Agent Sidebar */}
        <aside className="lg:col-span-3">
          <div className="rounded-3xl border border-green-200 bg-white p-4 shadow-sm">
            <p className="px-3 pb-2 text-xs font-extrabold uppercase tracking-wider text-green-800">
              Agent Menu
            </p>
            <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-bold transition ${
                      active
                        ? 'bg-green-900 text-white'
                        : 'text-slate-700 hover:bg-green-50'
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

        {/* Main Content */}
        <main className="space-y-6 lg:col-span-9">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-yellow-300 bg-yellow-100 p-5">
              <p className="text-sm font-bold text-green-950">Pending Inspections</p>
              <p className="mt-1 text-3xl font-extrabold text-green-950">{pendingLots.length}</p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-500">Crops Verified</p>
              <p className="mt-1 text-3xl font-extrabold text-green-800">{verifiedLots.length}</p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-500">Farmers Assisted</p>
              <p className="mt-1 text-3xl font-extrabold text-green-800">
                {VILLAGE_FARMERS_HELPED.length}
              </p>
            </div>
          </div>

          {activeTab === 'queue' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Farm Crops Waiting for Quality Check
              </h2>
              {pendingLots.length === 0 ? (
                <div className="rounded-3xl border border-green-200 bg-white p-8 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-green-700" />
                  <p className="mt-2 text-lg font-extrabold text-slate-900">
                    All farm inspections are completed!
                  </p>
                </div>
              ) : (
                pendingLots.map((lot) => (
                  <div
                    key={lot.id}
                    className="rounded-3xl border-2 border-yellow-300 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-500">{lot.id}</span>
                        <h3 className="text-xl font-extrabold text-slate-900">{lot.crop}</h3>
                        <p className="text-sm text-slate-600">
                          Farmer: {lot.farmer} • {lot.village} • {lot.quantity} Quintals
                        </p>
                      </div>
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-extrabold text-yellow-950">
                        Needs Inspection
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <input
                        type="text"
                        placeholder="Moisture e.g. 11.5%"
                        value={moistureMap[lot.id] || ''}
                        onChange={(e) =>
                          setMoistureMap((prev) => ({ ...prev, [lot.id]: e.target.value }))
                        }
                        className="rounded-xl border border-green-200 px-4 py-3 text-sm font-semibold outline-none focus:border-green-700"
                      />
                      <select
                        value={gradeMap[lot.id] || 'Grade A'}
                        onChange={(e) =>
                          setGradeMap((prev) => ({ ...prev, [lot.id]: e.target.value }))
                        }
                        className="rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-green-700"
                      >
                        <option value="Grade A+">Grade A+</option>
                        <option value="Grade A">Grade A</option>
                        <option value="Grade B">Grade B</option>
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          onVerifyLot(
                            lot.id,
                            moistureMap[lot.id] || '11.5%',
                            gradeMap[lot.id] || 'Grade A',
                            user?.name || 'Sunita Verma'
                          )
                        }
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
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Local Farmers I Help
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {VILLAGE_FARMERS_HELPED.map((farmer) => (
                  <div
                    key={farmer.name}
                    className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm"
                  >
                    <h3 className="text-lg font-extrabold text-slate-900">{farmer.name}</h3>
                    <p className="text-sm font-semibold text-green-700">{farmer.village}</p>
                    <p className="mt-2 text-sm text-slate-600">{farmer.crops}</p>
                    <p className="mt-2 font-mono text-xs font-bold text-slate-500">
                      {farmer.phone}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'verified' && (
            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold text-slate-900">Completed Verifications</h2>
              {verifiedLots.map((lot) => (
                <div
                  key={lot.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-green-200 bg-white p-4"
                >
                  <div>
                    <p className="text-lg font-extrabold text-slate-900">{lot.crop}</p>
                    <p className="text-sm text-slate-600">
                      {lot.farmer} • {lot.village}
                    </p>
                  </div>
                  <span className="rounded-full bg-green-100 px-3.5 py-1 text-xs font-extrabold text-green-800">
                    {lot.grade} • Moisture {lot.moisture}
                  </span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
