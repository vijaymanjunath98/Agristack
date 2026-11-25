import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  LogOut,
  PlusCircle,
  ShoppingBag,
  Sprout,
  Store,
} from 'lucide-react'
import { api } from '../api/client'
import AnalyticsCharts from '../components/AnalyticsCharts'
import DashboardShell from '../components/DashboardShell'

const TABS = [
  { id: 'browse', label: 'Reserve Farm Crops', icon: Store },
  { id: 'post-demand', label: 'Post Crop Demand', icon: PlusCircle },
  { id: 'my-bids', label: 'Demand & Orders Tracker', icon: ShoppingBag },
  { id: 'analytics', label: 'Market Intelligence', icon: BarChart3 },
]

export default function BuyerDashboard({ user, onBackHome, onLogout, onNotify }) {
  const [activeTab, setActiveTab] = useState('browse')
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState([])
  const [demands, setDemands] = useState([])
  const [orders, setOrders] = useState([])
  const [qtyInputs, setQtyInputs] = useState({})
  const [onlyVerified, setOnlyVerified] = useState(false)

  // Post demand fields
  const [cropName, setCropName] = useState('')
  const [season, setSeason] = useState('Rabi')
  const [qtyRequiredKg, setQtyRequiredKg] = useState('')
  const [expectedPricePerQt, setExpectedPricePerQt] = useState('')
  const [deliveryLocation, setDeliveryLocation] = useState('Indore Hub')
  const [state, setState] = useState(user?.state || 'Madhya Pradesh')
  const [district, setDistrict] = useState(user?.district || 'Sehore')
  const [requiredDeliveryDate, setRequiredDeliveryDate] = useState('2027-02-15')
  const [buyerCategory, setBuyerCategory] = useState('Wholesale')
  const [demandType, setDemandType] = useState('confirmed')

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await api.consumer.dashboard()
      setPlans(res.plans || [])
      setDemands(res.demands || [])
      setOrders(res.orders || [])
    } catch (err) {
      onNotify?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDemandSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.consumer.postDemand({
        cropName,
        season,
        qtyRequiredKg: Number(qtyRequiredKg),
        expectedPricePerQt: Number(expectedPricePerQt),
        deliveryLocation,
        state,
        district,
        requiredDeliveryDate,
        buyerCategory,
        demandType,
      })
      onNotify?.(res.message)
      setCropName('')
      setQtyRequiredKg('')
      setExpectedPricePerQt('')
      await loadData()
      setActiveTab('my-bids')
    } catch (err) {
      onNotify?.(err.message)
    }
  }

  const handleReserveOrder = async (plan) => {
    const qty = Number(qtyInputs[plan.id] || 500)
    try {
      const res = await api.consumer.placeOrder({
        farmerPlanId: plan.id,
        requestedQtyKg: qty,
        agreedPricePerQt: plan.expected_price_per_qt,
      })
      onNotify?.(res.message)
      setQtyInputs((prev) => ({ ...prev, [plan.id]: '' }))
      await loadData()
    } catch (err) {
      onNotify?.(err.message)
    }
  }

  const visiblePlans = plans.filter((p) => (onlyVerified ? p.verified_status === 'Verified' : true))

  return (
    <DashboardShell
      roleBadge="Consumer & Buyer Portal"
      userLabel={`Signed in as ${user?.name || 'Annapurna Mills'}`}
      menuTitle="Buyer Menu"
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerClass="bg-green-900 text-white border-green-800"
      badgeClass="bg-yellow-300 text-green-950"
      activeTabClass="bg-green-800 text-white shadow-sm"
      bgClass="bg-green-50/40"
      onBackHome={onBackHome}
      onLogout={onLogout}
    >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-green-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-500">Available Crop Plans</p>
              <p className="mt-1 text-3xl font-extrabold text-green-800">{plans.length}</p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-500">Market Demand Requests</p>
              <p className="mt-1 text-3xl font-extrabold text-green-800">{demands.length}</p>
            </div>
            <div className="rounded-2xl border border-yellow-300 bg-yellow-100 p-5">
              <p className="text-sm font-bold text-green-900">Locked Orders</p>
              <p className="mt-1 text-3xl font-extrabold text-green-950">{orders.length}</p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm font-bold text-slate-500">Loading buyer data...</p>
          ) : (
            <>
              {activeTab === 'browse' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-extrabold text-slate-900">Farmer Crop Plans Ready to Reserve</h2>
                    <button
                      type="button"
                      onClick={() => setOnlyVerified((p) => !p)}
                      className={`rounded-xl px-4 py-2 text-sm font-bold border ${
                        onlyVerified ? 'border-green-700 bg-green-700 text-white' : 'border-green-200 bg-white text-green-900'
                      }`}
                    >
                      {onlyVerified ? 'Showing: Verified Only' : 'Showing: All Plans'}
                    </button>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    {visiblePlans.map((plan) => {
                      const remaining = plan.planned_production_kg - plan.committed_qty_kg
                      return (
                        <div key={plan.id} className="rounded-3xl border border-green-200 bg-white p-5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-slate-500">PLAN #{plan.id}</span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${
                              plan.verified_status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-900'
                            }`}>
                              {plan.verified_status === 'Verified' && <BadgeCheck className="h-3.5 w-3.5" />}
                              {plan.verified_status}
                            </span>
                          </div>
                          <h3 className="mt-3 text-xl font-extrabold text-slate-900">{plan.crop_name}</h3>
                          <p className="text-sm text-slate-600">{plan.farmer_name} • {plan.village}, {plan.district}</p>

                          <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-yellow-50 p-3 text-center text-xs border border-yellow-200">
                            <div>
                              <p className="text-slate-500">Planned</p>
                              <p className="font-extrabold">{plan.planned_production_kg} kg</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Uncommitted</p>
                              <p className="font-extrabold text-green-800">{remaining} kg</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Est. Price</p>
                              <p className="font-extrabold text-green-800">₹{plan.expected_price_per_qt}/Qt</p>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <input
                              type="number"
                              min="1"
                              max={remaining}
                              placeholder="Reserve kg (e.g. 500)"
                              value={qtyInputs[plan.id] || ''}
                              onChange={(e) => setQtyInputs((prev) => ({ ...prev, [plan.id]: e.target.value }))}
                              className="w-full rounded-xl border border-green-200 px-3.5 py-2.5 text-sm"
                            />
                            <button
                              type="button"
                              disabled={remaining <= 0}
                              onClick={() => handleReserveOrder(plan)}
                              className="shrink-0 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-50"
                            >
                              Reserve Qty
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'post-demand' && (
                <form
                  onSubmit={handleDemandSubmit}
                  className="max-w-2xl rounded-3xl border border-green-200 bg-white p-6 shadow-sm"
                >
                  <h2 className="text-2xl font-extrabold text-slate-900">Submit Consumer / Buyer Crop Demand</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Confirmed demands immediately update the central Market Demand forecast without double counting.
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 text-sm">
                    <input required value={cropName} onChange={(e) => setCropName(e.target.value)} placeholder="Crop Requested (e.g. Tomato)" className="rounded-xl border border-green-200 px-4 py-3" />
                    <select value={season} onChange={(e) => setSeason(e.target.value)} className="rounded-xl border border-green-200 bg-white px-4 py-3">
                      <option value="Rabi">Rabi</option>
                      <option value="Kharif">Kharif</option>
                      <option value="Zaid">Zaid</option>
                    </select>
                    <input required type="number" min="1" value={qtyRequiredKg} onChange={(e) => setQtyRequiredKg(e.target.value)} placeholder="Quantity Required (kg)" className="rounded-xl border border-green-200 px-4 py-3" />
                    <input required type="number" min="100" value={expectedPricePerQt} onChange={(e) => setExpectedPricePerQt(e.target.value)} placeholder="Expected Buying Price (₹/Qt)" className="rounded-xl border border-green-200 px-4 py-3" />
                    <input required value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} placeholder="Delivery Location" className="rounded-xl border border-green-200 px-4 py-3" />
                    <input required type="date" value={requiredDeliveryDate} onChange={(e) => setRequiredDeliveryDate(e.target.value)} className="rounded-xl border border-green-200 px-4 py-3" />
                    <input required value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="rounded-xl border border-green-200 px-4 py-3" />
                    <input required value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District" className="rounded-xl border border-green-200 px-4 py-3" />
                    <select value={buyerCategory} onChange={(e) => setBuyerCategory(e.target.value)} className="rounded-xl border border-green-200 bg-white px-4 py-3">
                      <option value="Wholesale">Wholesale</option>
                      <option value="Flour Mill">Flour Mill</option>
                      <option value="Retail Chain">Retail Chain</option>
                      <option value="Processor">Food Processor</option>
                    </select>
                    <select value={demandType} onChange={(e) => setDemandType(e.target.value)} className="rounded-xl border border-green-200 bg-white px-4 py-3">
                      <option value="confirmed">Confirmed Buyer Order</option>
                      <option value="estimated">Estimated Demand Request</option>
                    </select>
                  </div>

                  <button type="submit" className="mt-5 w-full rounded-2xl bg-green-800 py-3.5 text-base font-bold text-white hover:bg-green-900">
                    Publish Demand to Central Database
                  </button>
                </form>
              )}

              {activeTab === 'my-bids' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-extrabold text-slate-900">Demand &amp; Order Status</h2>
                  {orders.map((o) => (
                    <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-green-200 bg-white p-4">
                      <div>
                        <p className="text-lg font-extrabold text-slate-900">{o.crop_name} (Order #{o.id})</p>
                        <p className="text-xs text-slate-600">
                          Requested: {o.requested_qty_kg} kg • Reserved: {o.reserved_qty_kg} kg • Confirmed: {o.confirmed_qty_kg} kg • Delivered: {o.delivered_qty_kg} kg
                        </p>
                      </div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-800">
                        {o.status} @ ₹{o.agreed_price_per_qt}/Qt
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'analytics' && <AnalyticsCharts />}
            </>
          )}
    </DashboardShell>
  )
}
