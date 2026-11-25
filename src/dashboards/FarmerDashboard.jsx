import { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  CloudSun,
  Flame,
  LogOut,
  PlusCircle,
  Sprout,
  Tractor,
  Wheat,
} from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Home Overview', icon: Tractor },
  { id: 'crops', label: 'My Crops', icon: Wheat },
  { id: 'demand', label: 'What Buyers Need', icon: Flame },
  { id: 'weather', label: 'Weather Alerts', icon: CloudSun },
]

export default function FarmerDashboard({
  user,
  lots,
  demands,
  weatherAlerts,
  onAddLot,
  onAcceptOffer,
  onBackHome,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [crop, setCrop] = useState('')
  const [village, setVillage] = useState(user?.location || 'Sehore, MP')
  const [quantity, setQuantity] = useState('')
  const [expectedPrice, setExpectedPrice] = useState('')

  const verifiedCount = lots.filter((l) => l.status === 'Verified').length
  const totalOffers = lots.reduce((sum, l) => sum + (l.offers?.length || 0), 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!crop.trim() || !village.trim() || !quantity || !expectedPrice) return
    onAddLot({
      crop: crop.trim(),
      farmer: user?.name || 'Ramesh Patel',
      village: village.trim(),
      quantity: Number(quantity),
      expectedPrice: Number(expectedPrice),
    })
    setCrop('')
    setQuantity('')
    setExpectedPrice('')
    setActiveTab('crops')
  }

  return (
    <div className="min-h-screen bg-yellow-50/40 text-slate-900">
      {/* Farmer Header */}
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
                  Farmer Portal
                </span>
              </div>
              <p className="text-xs text-green-100">Welcome, {user?.name || 'Ramesh Patel'}</p>
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
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3">
          <div className="rounded-3xl border border-green-200 bg-white p-4 shadow-sm">
            <p className="px-3 pb-2 text-xs font-extrabold uppercase tracking-wider text-green-700">
              Farmer Menu
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
                        ? 'bg-green-700 text-white shadow-sm'
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
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">My Listed Crops</p>
              <p className="mt-1 text-3xl font-extrabold text-green-800">{lots.length}</p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Verified by Agent</p>
              <p className="mt-1 text-3xl font-extrabold text-green-800">{verifiedCount}</p>
            </div>
            <div className="rounded-2xl border border-yellow-300 bg-yellow-100 p-5 shadow-sm">
              <p className="text-sm font-bold text-green-900">Buyer Offers Received</p>
              <p className="mt-1 text-3xl font-extrabold text-green-950">{totalOffers}</p>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Simple Add Crop Form */}
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm lg:col-span-6"
              >
                <div className="flex items-center gap-2 text-green-800">
                  <PlusCircle className="h-6 w-6" />
                  <h2 className="text-xl font-extrabold">Add New Crop to Sell</h2>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Fill 4 simple boxes. A local Village Agent will verify your crop.
                </p>

                <div className="mt-4 space-y-3.5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700">Crop Name</label>
                    <input
                      type="text"
                      required
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                      placeholder="e.g., Sharbati Wheat or Desi Chana"
                      className="mt-1 w-full rounded-xl border border-green-200 px-4 py-3 text-base outline-none focus:border-green-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700">Village</label>
                    <input
                      type="text"
                      required
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-green-200 px-4 py-3 text-base outline-none focus:border-green-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-slate-700">
                        Quantity (Quintals)
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="40"
                        className="mt-1 w-full rounded-xl border border-green-200 px-4 py-3 text-base outline-none focus:border-green-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700">
                        Expected ₹ / Qt
                      </label>
                      <input
                        type="number"
                        min="100"
                        required
                        value={expectedPrice}
                        onChange={(e) => setExpectedPrice(e.target.value)}
                        placeholder="2700"
                        className="mt-1 w-full rounded-xl border border-green-200 px-4 py-3 text-base outline-none focus:border-green-600"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-green-700 py-3.5 text-base font-bold text-white hover:bg-green-800"
                  >
                    Save &amp; Request Agent Check
                  </button>
                </div>
              </form>

              {/* Top Market Advice + Latest Weather */}
              <div className="space-y-4 lg:col-span-6">
                <div className="rounded-3xl border border-yellow-300 bg-yellow-100/80 p-6">
                  <h3 className="text-lg font-extrabold text-green-950">
                    What Buyers Want Most Today
                  </h3>
                  <div className="mt-3 space-y-2.5">
                    {demands.slice(0, 2).map((d) => (
                      <div key={d.id} className="rounded-2xl bg-white p-3.5 border border-yellow-200">
                        <p className="text-base font-extrabold text-slate-900">{d.crop}</p>
                        <p className="text-sm font-semibold text-green-800">
                          {d.targetPrice} • Needed: {d.neededQty}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {weatherAlerts[0] && (
                  <div className="rounded-3xl border border-green-200 bg-white p-6">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-green-700">
                      Local Weather Alert ({weatherAlerts[0].temp})
                    </p>
                    <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                      {weatherAlerts[0].region}
                    </h3>
                    <p className="mt-1 text-base text-slate-700">{weatherAlerts[0].advice}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'crops' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-slate-900">My Harvest Listings</h2>
              {lots.map((lot) => (
                <div
                  key={lot.id}
                  className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-500">{lot.id}</span>
                      <h3 className="text-xl font-extrabold text-slate-900">{lot.crop}</h3>
                      <p className="text-sm text-slate-600">
                        {lot.village} • {lot.quantity} Quintals • Expected ₹
                        {lot.expectedPrice.toLocaleString('en-IN')}/Qt
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3.5 py-1 text-xs font-extrabold ${
                        lot.status === 'Verified'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                      }`}
                    >
                      {lot.status} ({lot.grade})
                    </span>
                  </div>

                  {/* Buyer Offers */}
                  <div className="mt-4 border-t border-green-100 pt-3">
                    <p className="text-sm font-bold text-slate-700">Buyer Offers:</p>
                    {lot.offers.length === 0 ? (
                      <p className="mt-1 text-sm text-slate-500">
                        No buyer offers yet. Verified crops receive offers faster.
                      </p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {lot.offers.map((offer) => (
                          <div
                            key={offer.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-yellow-50 px-4 py-3 border border-yellow-200"
                          >
                            <span className="text-base font-bold text-slate-900">
                              {offer.buyer} offered ₹{offer.price.toLocaleString('en-IN')}/Qt
                            </span>
                            {offer.status === 'Accepted' ? (
                              <span className="inline-flex items-center gap-1 rounded-xl bg-green-700 px-3 py-1.5 text-xs font-bold text-white">
                                <CheckCircle2 className="h-4 w-4" />
                                Accepted
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onAcceptOffer(lot.id, offer.id)}
                                className="rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
                              >
                                Accept Offer
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'demand' && (
            <div className="grid gap-4 sm:grid-cols-2">
              {demands.map((d) => (
                <div key={d.id} className="rounded-3xl border border-green-200 bg-white p-5">
                  <span className="rounded-full bg-yellow-200 px-3 py-1 text-xs font-extrabold text-green-950">
                    {d.demandLevel} Demand
                  </span>
                  <h3 className="mt-3 text-xl font-extrabold text-slate-900">{d.crop}</h3>
                  <p className="mt-1 text-base font-bold text-green-800">{d.targetPrice}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Needed: {d.neededQty} • {d.region}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'weather' && (
            <div className="grid gap-4 md:grid-cols-2">
              {weatherAlerts.map((w) => (
                <div key={w.id} className="rounded-3xl border border-green-200 bg-white p-5">
                  <p className="text-xs font-extrabold uppercase text-green-700">
                    {w.level} • {w.temp}
                  </p>
                  <h3 className="mt-1 text-xl font-extrabold text-slate-900">{w.region}</h3>
                  <p className="mt-2 text-base text-slate-700">{w.advice}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
