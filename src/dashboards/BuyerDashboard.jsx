import { useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  LogOut,
  PlusCircle,
  ShoppingBag,
  Sprout,
  Store,
} from 'lucide-react'

const TABS = [
  { id: 'browse', label: 'Browse Farm Crops', icon: Store },
  { id: 'post-demand', label: 'Post Crop Demand', icon: PlusCircle },
  { id: 'my-bids', label: 'My Sent Offers', icon: ShoppingBag },
]

export default function BuyerDashboard({
  user,
  lots,
  demands,
  onPlaceBid,
  onAddDemand,
  onBackHome,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('browse')
  const [bidPrices, setBidPrices] = useState({})
  const [onlyVerified, setOnlyVerified] = useState(true)

  // Post demand state
  const [crop, setCrop] = useState('')
  const [neededQty, setNeededQty] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [region, setRegion] = useState('')

  const visibleLots = lots.filter((l) => (onlyVerified ? l.status === 'Verified' : true))
  const myBids = lots.flatMap((lot) =>
    lot.offers.map((offer) => ({ ...offer, crop: lot.crop, lotId: lot.id, village: lot.village }))
  )

  const handleDemandSubmit = (e) => {
    e.preventDefault()
    if (!crop.trim() || !neededQty.trim() || !targetPrice.trim() || !region.trim()) return
    onAddDemand({
      crop: crop.trim(),
      neededQty: neededQty.trim(),
      targetPrice: targetPrice.trim(),
      region: region.trim(),
      buyerType: user?.name || 'Verified Buyer',
    })
    setCrop('')
    setNeededQty('')
    setTargetPrice('')
    setRegion('')
    setActiveTab('browse')
  }

  return (
    <div className="min-h-screen bg-green-50/40 text-slate-900">
      {/* Buyer Header */}
      <header className="sticky top-0 z-30 border-b border-yellow-300 bg-yellow-100 text-green-950 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-800 text-yellow-200">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold">AGRI.IN</span>
                <span className="rounded-full bg-green-800 px-2.5 py-0.5 text-xs font-bold text-yellow-200">
                  Buyer Portal
                </span>
              </div>
              <p className="text-xs font-semibold text-green-800">
                Signed in as {user?.name || 'Annapurna Mills'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 rounded-xl border border-green-700 bg-white px-3.5 py-2 text-sm font-bold text-green-900 hover:bg-green-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Website Home
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-xl bg-green-800 px-3.5 py-2 text-sm font-bold text-white hover:bg-green-900"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Buyer Sidebar */}
        <aside className="lg:col-span-3">
          <div className="rounded-3xl border border-green-200 bg-white p-4 shadow-sm">
            <p className="px-3 pb-2 text-xs font-extrabold uppercase tracking-wider text-green-700">
              Buyer Menu
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
                        ? 'bg-green-800 text-white'
                        : 'text-slate-700 hover:bg-yellow-50'
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
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-green-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-500">Verified Lots Ready</p>
              <p className="mt-1 text-3xl font-extrabold text-green-800">
                {lots.filter((l) => l.status === 'Verified').length}
              </p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-500">Active Crop Demands</p>
              <p className="mt-1 text-3xl font-extrabold text-green-800">{demands.length}</p>
            </div>
            <div className="rounded-2xl border border-yellow-300 bg-yellow-100 p-5">
              <p className="text-sm font-bold text-green-900">Bids Submitted</p>
              <p className="mt-1 text-3xl font-extrabold text-green-950">{myBids.length}</p>
            </div>
          </div>

          {activeTab === 'browse' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Available Farm Harvests
                </h2>
                <button
                  type="button"
                  onClick={() => setOnlyVerified((prev) => !prev)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold border ${
                    onlyVerified
                      ? 'border-green-700 bg-green-700 text-white'
                      : 'border-green-200 bg-white text-green-900'
                  }`}
                >
                  {onlyVerified ? 'Showing: Agent Verified Only' : 'Showing: All Lots'}
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {visibleLots.map((lot) => (
                  <div
                    key={lot.id}
                    className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-500">{lot.id}</span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${
                          lot.status === 'Verified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-900'
                        }`}
                      >
                        {lot.status === 'Verified' && <BadgeCheck className="h-3.5 w-3.5" />}
                        {lot.status}
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-extrabold text-slate-900">{lot.crop}</h3>
                    <p className="text-sm text-slate-600">
                      Farmer: {lot.farmer} • {lot.village}
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-yellow-50 p-3 text-center text-sm border border-yellow-200">
                      <div>
                        <p className="text-xs text-slate-500">Quantity</p>
                        <p className="font-extrabold text-slate-900">{lot.quantity} Qt</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Moisture</p>
                        <p className="font-extrabold text-slate-900">{lot.moisture}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Expected</p>
                        <p className="font-extrabold text-green-800">₹{lot.expectedPrice}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <input
                        type="number"
                        min={100}
                        placeholder={`Offer ₹/Qt (e.g. ${lot.expectedPrice + 50})`}
                        value={bidPrices[lot.id] || ''}
                        onChange={(e) =>
                          setBidPrices((prev) => ({ ...prev, [lot.id]: e.target.value }))
                        }
                        className="w-full rounded-xl border border-green-200 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-green-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const price = Number(bidPrices[lot.id] || lot.expectedPrice + 50)
                          onPlaceBid(lot.id, user?.name || 'Annapurna Mills', price)
                          setBidPrices((prev) => ({ ...prev, [lot.id]: '' }))
                        }}
                        className="shrink-0 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800"
                      >
                        Send Offer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'post-demand' && (
            <form
              onSubmit={handleDemandSubmit}
              className="max-w-xl rounded-3xl border border-green-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-2xl font-extrabold text-slate-900">
                Tell Farmers What You Need
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Your demand post appears on the AGRI.IN Market Demand section so farmers grow the
                right crop.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700">Crop Required</label>
                  <input
                    type="text"
                    required
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    placeholder="e.g., Organic Green Moong"
                    className="mt-1 w-full rounded-xl border border-green-200 px-4 py-3 text-base outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700">Quantity Needed</label>
                  <input
                    type="text"
                    required
                    value={neededQty}
                    onChange={(e) => setNeededQty(e.target.value)}
                    placeholder="e.g., 250 Quintals"
                    className="mt-1 w-full rounded-xl border border-green-200 px-4 py-3 text-base outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700">
                    Target Price Range
                  </label>
                  <input
                    type="text"
                    required
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="e.g., ₹6,400 – ₹6,800 / Qt"
                    className="mt-1 w-full rounded-xl border border-green-200 px-4 py-3 text-base outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700">Preferred Region</label>
                  <input
                    type="text"
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g., Rajasthan & Madhya Pradesh"
                    className="mt-1 w-full rounded-xl border border-green-200 px-4 py-3 text-base outline-none focus:border-green-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-green-800 py-3.5 text-base font-bold text-white hover:bg-green-900"
                >
                  Publish Market Demand
                </button>
              </div>
            </form>
          )}

          {activeTab === 'my-bids' && (
            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold text-slate-900">Active Offers &amp; Bids</h2>
              {myBids.map((bid) => (
                <div
                  key={bid.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-green-200 bg-white p-4"
                >
                  <div>
                    <p className="text-lg font-extrabold text-slate-900">{bid.crop}</p>
                    <p className="text-sm text-slate-600">
                      Lot {bid.lotId} • {bid.village}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-green-800">
                      ₹{bid.price.toLocaleString('en-IN')} / Qt
                    </p>
                    <span className="rounded-full bg-yellow-100 px-3 py-0.5 text-xs font-bold text-green-950">
                      Status: {bid.status}
                    </span>
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
