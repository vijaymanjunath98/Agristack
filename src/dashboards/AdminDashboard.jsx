import { useState } from 'react'
import {
  ArrowLeft,
  CloudRain,
  LayoutDashboard,
  LogOut,
  Radio,
  Shield,
  Sprout,
  Users,
} from 'lucide-react'
import { LIVE_MARKET_RATES } from '../data/mockData'

const TABS = [
  { id: 'overview', label: 'Platform Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users & Agents', icon: Users },
  { id: 'weather', label: 'Weather Alerts', icon: CloudRain },
  { id: 'market', label: 'Live Market', icon: Radio },
]

export default function AdminDashboard({
  user,
  lots,
  demands,
  platformUsers,
  weatherAlerts,
  onToggleUserStatus,
  onAddWeatherAlert,
  onBackHome,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [region, setRegion] = useState('')
  const [level, setLevel] = useState('')
  const [temp, setTemp] = useState('')
  const [advice, setAdvice] = useState('')

  const handleWeatherSubmit = (e) => {
    e.preventDefault()
    if (!region.trim() || !level.trim() || !temp.trim() || !advice.trim()) return
    onAddWeatherAlert({
      region: region.trim(),
      level: level.trim(),
      temp: temp.trim(),
      advice: advice.trim(),
    })
    setRegion('')
    setLevel('')
    setTemp('')
    setAdvice('')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Admin Header */}
      <header className="sticky top-0 z-30 border-b border-green-800 bg-slate-900 text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-600 text-yellow-200">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold">AGRI.IN</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-300 px-2.5 py-0.5 text-xs font-extrabold text-green-950">
                  <Shield className="h-3.5 w-3.5" />
                  Admin Control Center
                </span>
              </div>
              <p className="text-xs text-slate-300">Operator: {user?.name || 'Platform Admin'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-sm font-bold text-white hover:bg-slate-700"
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
        {/* Admin Sidebar */}
        <aside className="lg:col-span-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="px-3 pb-2 text-xs font-extrabold uppercase tracking-wider text-green-700">
              Admin Controls
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
                        ? 'bg-green-700 text-white'
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
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-green-200 bg-white p-5">
              <p className="text-xs font-bold uppercase text-slate-500">Registered Users</p>
              <p className="mt-1 text-3xl font-extrabold text-green-800">{platformUsers.length}</p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-white p-5">
              <p className="text-xs font-bold uppercase text-slate-500">Crop Lots</p>
              <p className="mt-1 text-3xl font-extrabold text-green-800">{lots.length}</p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-white p-5">
              <p className="text-xs font-bold uppercase text-slate-500">Buyer Demands</p>
              <p className="mt-1 text-3xl font-extrabold text-green-800">{demands.length}</p>
            </div>
            <div className="rounded-2xl border border-yellow-300 bg-yellow-100 p-5">
              <p className="text-xs font-bold uppercase text-green-950">Weather Alerts</p>
              <p className="mt-1 text-3xl font-extrabold text-green-950">{weatherAlerts.length}</p>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Platform Health Summary
              </h2>
              <p className="mt-2 text-base text-slate-600">
                Use the Admin menu on the left to approve Village Agents, publish new regional
                weather alerts, or inspect live mandi rates across AGRI.IN.
              </p>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="overflow-hidden rounded-3xl border border-green-200 bg-white shadow-sm">
              <div className="border-b border-green-100 px-6 py-4">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Manage Farmers, Buyers &amp; Village Agents
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-green-50 font-bold text-green-900">
                    <tr>
                      <th className="px-6 py-3.5">Name</th>
                      <th className="px-6 py-3.5">Role</th>
                      <th className="px-6 py-3.5">Location</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100">
                    {platformUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 font-bold text-slate-900">{u.name}</td>
                        <td className="px-6 py-4">{u.role}</td>
                        <td className="px-6 py-4 text-slate-600">{u.location}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              u.status === 'Pending Approval'
                                ? 'bg-yellow-100 text-yellow-950'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => onToggleUserStatus(u.id)}
                            className="rounded-xl bg-green-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-800"
                          >
                            {u.status === 'Pending Approval' ? 'Approve' : 'Toggle Status'}
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
              <form
                onSubmit={handleWeatherSubmit}
                className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm lg:col-span-5"
              >
                <h2 className="text-xl font-extrabold text-slate-900">
                  Publish New Weather Alert
                </h2>
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Region e.g. Vidarbha (Nagpur)"
                    className="w-full rounded-xl border border-green-200 px-4 py-2.5 text-sm outline-none focus:border-green-600"
                  />
                  <input
                    type="text"
                    required
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    placeholder="Condition e.g. Heavy Rain Warning"
                    className="w-full rounded-xl border border-green-200 px-4 py-2.5 text-sm outline-none focus:border-green-600"
                  />
                  <input
                    type="text"
                    required
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    placeholder="Temperature e.g. 24°C"
                    className="w-full rounded-xl border border-green-200 px-4 py-2.5 text-sm outline-none focus:border-green-600"
                  />
                  <textarea
                    rows={3}
                    required
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    placeholder="Simple advice for farmers..."
                    className="w-full rounded-xl border border-green-200 px-4 py-2.5 text-sm outline-none focus:border-green-600"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-green-700 py-3 text-sm font-bold text-white hover:bg-green-800"
                  >
                    Publish Alert
                  </button>
                </div>
              </form>

              <div className="space-y-3 lg:col-span-7">
                {weatherAlerts.map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-green-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase text-green-700">
                      {alert.level} • {alert.temp}
                    </p>
                    <h3 className="text-lg font-extrabold text-slate-900">{alert.region}</h3>
                    <p className="mt-1 text-sm text-slate-600">{alert.advice}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold text-slate-900">Live Mandi Rates Monitor</h2>
              {LIVE_MARKET_RATES.map((rate) => (
                <div
                  key={rate.crop}
                  className="flex flex-wrap items-center justify-between rounded-2xl border border-green-200 bg-white p-4"
                >
                  <div>
                    <p className="text-lg font-extrabold text-slate-900">{rate.crop}</p>
                    <p className="text-sm text-slate-500">{rate.mandi}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-green-800">{rate.price}</p>
                    <p className="text-xs font-bold text-slate-600">
                      {rate.change} • {rate.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
