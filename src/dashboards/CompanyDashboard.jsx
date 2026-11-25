import { useEffect, useState } from 'react'
import { ArrowLeft, Building2, LogOut, Package, PlusCircle, Sprout } from 'lucide-react'
import { api } from '../api/client'
import AnalyticsCharts from '../components/AnalyticsCharts'
import DashboardShell from '../components/DashboardShell'

const TABS = [
  { id: 'sales', label: 'Record Seed Sales', icon: PlusCircle },
  { id: 'inventory', label: 'Seed Inventory', icon: Package },
  { id: 'analytics', label: 'Planting Intelligence', icon: Building2 },
]

export default function CompanyDashboard({ user, onBackHome, onLogout, onNotify }) {
  const [activeTab, setActiveTab] = useState('sales')
  const [sales, setSales] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

  // Seed Sale Form
  const [cropName, setCropName] = useState('')
  const [cropVariety, setCropVariety] = useState('')
  const [seedType, setSeedType] = useState('Certified')
  const [qtySoldKg, setQtySoldKg] = useState('')
  const [qtyBookedKg, setQtyBookedKg] = useState('')
  const [seedRateKgPerHa, setSeedRateKgPerHa] = useState('40')
  const [salesRegion, setSalesRegion] = useState('Sehore & Vidisha Belt')
  const [state, setState] = useState(user?.state || 'Madhya Pradesh')
  const [district, setDistrict] = useState(user?.district || 'Sehore')
  const [expectedSowingSeason, setExpectedSowingSeason] = useState('Rabi')

  // Inventory Form
  const [invCrop, setInvCrop] = useState('')
  const [invVariety, setInvVariety] = useState('')
  const [invStock, setInvStock] = useState('')
  const [invLocation, setInvLocation] = useState('Sehore Depot')

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await api.company.dashboard()
      setSales(res.sales || [])
      setInventory(res.inventory || [])
    } catch (err) {
      onNotify?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSaleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.company.addSeedSale({
        companyName: user?.name || 'Kaveri Agri Seeds',
        state,
        district,
        salesRegion,
        cropName,
        cropVariety,
        seedType,
        qtySoldKg: Number(qtySoldKg),
        qtyBookedKg: Number(qtyBookedKg || 0),
        seedRateKgPerHa: Number(seedRateKgPerHa || 0),
        expectedSowingSeason,
      })
      onNotify?.(res.message)
      setCropName('')
      setCropVariety('')
      setQtySoldKg('')
      setQtyBookedKg('')
      await loadData()
    } catch (err) {
      onNotify?.(err.message)
    }
  }

  const handleInventorySubmit = async (e) => {
    e.preventDefault()
    try {
      await api.company.addInventory({
        companyName: user?.name || 'Kaveri Agri Seeds',
        cropName: invCrop,
        cropVariety: invVariety,
        stockAvailableKg: Number(invStock),
        location: invLocation,
      })
      onNotify?.('Seed inventory updated.')
      setInvCrop('')
      setInvVariety('')
      setInvStock('')
      await loadData()
    } catch (err) {
      onNotify?.(err.message)
    }
  }

  return (
    <DashboardShell
      roleBadge="Company & Seed Seller Portal"
      userLabel={user?.name || 'Kaveri Agri Seeds'}
      menuTitle="Seed Seller Menu"
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerClass="bg-green-900 text-white border-green-800"
      badgeClass="bg-yellow-300 text-green-950"
      activeTabClass="bg-green-800 text-white shadow-sm"
      bgClass="bg-yellow-50/40"
      onBackHome={onBackHome}
      onLogout={onLogout}
    >
          <div className="rounded-2xl border border-yellow-300 bg-yellow-100 px-4 py-3 text-sm font-semibold text-green-950">
            Note: Seed sales &amp; bookings serve as an <strong>early planting-intention indicator</strong> using verified seed rates, not guaranteed production.
          </div>

          {activeTab === 'sales' && (
            <div className="grid gap-6 lg:grid-cols-12">
              <form
                onSubmit={handleSaleSubmit}
                className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm lg:col-span-5"
              >
                <h2 className="text-xl font-extrabold text-slate-900">Enter Seed Sales &amp; Bookings</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <input
                    required
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    placeholder="Crop Name (e.g., Sharbati Wheat)"
                    className="w-full rounded-xl border border-green-200 px-3.5 py-2.5"
                  />
                  <input
                    required
                    value={cropVariety}
                    onChange={(e) => setCropVariety(e.target.value)}
                    placeholder="Crop Variety (e.g., HI-1544)"
                    className="w-full rounded-xl border border-green-200 px-3.5 py-2.5"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={seedType}
                      onChange={(e) => setSeedType(e.target.value)}
                      className="rounded-xl border border-green-200 bg-white px-3 py-2.5"
                    >
                      <option value="Certified">Certified</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Foundation">Foundation</option>
                    </select>
                    <select
                      value={expectedSowingSeason}
                      onChange={(e) => setExpectedSowingSeason(e.target.value)}
                      className="rounded-xl border border-green-200 bg-white px-3 py-2.5"
                    >
                      <option value="Rabi">Rabi</option>
                      <option value="Kharif">Kharif</option>
                      <option value="Zaid">Zaid</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      required
                      min="1"
                      value={qtySoldKg}
                      onChange={(e) => setQtySoldKg(e.target.value)}
                      placeholder="Seeds Sold (kg)"
                      className="rounded-xl border border-green-200 px-3.5 py-2.5"
                    />
                    <input
                      type="number"
                      min="0"
                      value={qtyBookedKg}
                      onChange={(e) => setQtyBookedKg(e.target.value)}
                      placeholder="Seeds Booked (kg)"
                      className="rounded-xl border border-green-200 px-3.5 py-2.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.05"
                      value={seedRateKgPerHa}
                      onChange={(e) => setSeedRateKgPerHa(e.target.value)}
                      placeholder="Seed Rate (kg/ha)"
                      className="rounded-xl border border-green-200 px-3.5 py-2.5"
                    />
                    <input
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="District"
                      className="rounded-xl border border-green-200 px-3.5 py-2.5"
                    />
                  </div>
                  <input
                    required
                    value={salesRegion}
                    onChange={(e) => setSalesRegion(e.target.value)}
                    placeholder="Sales Region"
                    className="w-full rounded-xl border border-green-200 px-3.5 py-2.5"
                  />
                  <input
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full rounded-xl border border-green-200 px-3.5 py-2.5"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-green-700 py-3 font-bold text-white hover:bg-green-800"
                  >
                    Submit Seed Sales &amp; Update Forecast
                  </button>
                </div>
              </form>

              <div className="space-y-3 lg:col-span-7">
                <h3 className="text-xl font-extrabold text-slate-900">Recorded Seed Sales ({sales.length})</h3>
                {loading ? (
                  <p className="text-sm text-slate-500">Loading seed sales...</p>
                ) : (
                  sales.map((s) => (
                    <div key={s.id} className="rounded-2xl border border-green-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-extrabold text-slate-900">
                          {s.crop_name} — {s.crop_variety} ({s.seed_type})
                        </span>
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">
                          {s.verified_status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        Sold: <strong>{s.qty_sold_kg} kg</strong> | Booked: <strong>{s.qty_booked_kg} kg</strong> | Est. Area: <strong>{s.estimated_area_ha} ha</strong>
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {s.sales_region} ({s.district}, {s.state}) • {s.expected_sowing_season} • {s.sales_date}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="grid gap-6 lg:grid-cols-12">
              <form
                onSubmit={handleInventorySubmit}
                className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm lg:col-span-5"
              >
                <h3 className="text-xl font-extrabold">Add Seed Stock</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <input required value={invCrop} onChange={(e) => setInvCrop(e.target.value)} placeholder="Crop Name" className="w-full rounded-xl border border-green-200 px-3.5 py-2.5" />
                  <input required value={invVariety} onChange={(e) => setInvVariety(e.target.value)} placeholder="Variety" className="w-full rounded-xl border border-green-200 px-3.5 py-2.5" />
                  <input required type="number" value={invStock} onChange={(e) => setInvStock(e.target.value)} placeholder="Available Stock (kg)" className="w-full rounded-xl border border-green-200 px-3.5 py-2.5" />
                  <input required value={invLocation} onChange={(e) => setInvLocation(e.target.value)} placeholder="Depot Location" className="w-full rounded-xl border border-green-200 px-3.5 py-2.5" />
                  <button type="submit" className="w-full rounded-2xl bg-green-800 py-3 font-bold text-white">Save Inventory</button>
                </div>
              </form>

              <div className="space-y-3 lg:col-span-7">
                <h3 className="text-xl font-extrabold">Current Seed Stock</h3>
                {inventory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-green-200 bg-white p-4">
                    <div>
                      <p className="font-extrabold text-slate-900">{item.crop_name} ({item.crop_variety})</p>
                      <p className="text-xs text-slate-500">{item.location} • {item.seed_type}</p>
                    </div>
                    <span className="rounded-xl bg-green-100 px-3 py-1.5 text-sm font-extrabold text-green-900">
                      {item.stock_available_kg} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && <AnalyticsCharts seedSales={sales} />}
    </DashboardShell>
  )
}
