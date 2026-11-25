import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import RoleCards from './components/RoleCards'
import HowItWorks from './components/HowItWorks'
import MarketDemandSection from './components/MarketDemandSection'
import LiveMarketSection from './components/LiveMarketSection'
import WeatherAlertsSection from './components/WeatherAlertsSection'
import AboutContactSection from './components/AboutContactSection'
import AuthModal from './components/AuthModal'
import FarmerDashboard from './dashboards/FarmerDashboard'
import BuyerDashboard from './dashboards/BuyerDashboard'
import VillageAgentDashboard from './dashboards/VillageAgentDashboard'
import AdminDashboard from './dashboards/AdminDashboard'
import {
  INITIAL_CROP_LOTS,
  INITIAL_DEMANDS,
  INITIAL_PLATFORM_USERS,
  INITIAL_WEATHER_ALERTS,
} from './data/mockData'

export default function App() {
  const [activeView, setActiveView] = useState('landing') // 'landing' | 'farmer' | 'buyer' | 'agent' | 'admin'
  const [currentUser, setCurrentUser] = useState(null)
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login', role: 'farmer' })

  const [lots, setLots] = useState(INITIAL_CROP_LOTS)
  const [demands, setDemands] = useState(INITIAL_DEMANDS)
  const [weatherAlerts, setWeatherAlerts] = useState(INITIAL_WEATHER_ALERTS)
  const [platformUsers, setPlatformUsers] = useState(INITIAL_PLATFORM_USERS)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => {
      setToast((current) => (current === msg ? '' : current))
    }, 3500)
  }

  const openAuth = (mode = 'login', role = 'farmer') => {
    setAuthModal({ open: true, mode, role })
  }

  const enterRoleDashboard = (role, userInfo = null) => {
    const defaultUser = {
      farmer: { name: 'Ramesh Patel', location: 'Sehore, MP' },
      buyer: { name: 'Annapurna Mills', location: 'Indore, MP' },
      agent: { name: 'Sunita Verma', location: 'Sehore Block' },
      admin: { name: 'Platform Admin', location: 'HQ' },
    }
    setCurrentUser(userInfo || defaultUser[role])
    setActiveView(role)
    setAuthModal({ open: false, mode: 'login', role })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setActiveView('landing')
    showToast('You have logged out safely.')
  }

  const handleAddLot = ({ crop, farmer, village, quantity, expectedPrice }) => {
    const newLot = {
      id: `LOT-${101 + lots.length}`,
      crop,
      farmer,
      village,
      quantity,
      expectedPrice,
      moisture: 'Pending',
      grade: 'Pending',
      status: 'Pending Inspection',
      agent: 'Assigned Soon',
      offers: [],
    }
    setLots((prev) => [newLot, ...prev])
    showToast(`${crop} listed! A Village Agent can now verify it.`)
  }

  const handleAcceptOffer = (lotId, offerId) => {
    setLots((prev) =>
      prev.map((lot) =>
        lot.id !== lotId
          ? lot
          : {
              ...lot,
              offers: lot.offers.map((o) =>
                o.id === offerId ? { ...o, status: 'Accepted' } : o
              ),
            }
      )
    )
    showToast(`Offer accepted for ${lotId}!`)
  }

  const handlePlaceBid = (lotId, buyerName, price) => {
    setLots((prev) =>
      prev.map((lot) =>
        lot.id !== lotId
          ? lot
          : {
              ...lot,
              offers: [
                ...lot.offers,
                { id: `BID-${Date.now()}`, buyer: buyerName, price, status: 'Open' },
              ],
            }
      )
    )
    showToast(`Offer of ₹${price.toLocaleString('en-IN')}/Qt sent for ${lotId}!`)
  }

  const handleAddDemand = ({ crop, neededQty, targetPrice, region, buyerType }) => {
    const newDemand = {
      id: `DEM-${201 + demands.length}`,
      crop,
      neededQty,
      demandLevel: 'High',
      targetPrice,
      region,
      buyerType,
    }
    setDemands((prev) => [newDemand, ...prev])
    showToast(`Market demand for ${crop} published!`)
  }

  const handleVerifyLot = (lotId, moisture, grade, agentName) => {
    setLots((prev) =>
      prev.map((lot) =>
        lot.id === lotId
          ? { ...lot, moisture, grade, status: 'Verified', agent: agentName }
          : lot
      )
    )
    showToast(`${lotId} verified as ${grade}!`)
  }

  const handleToggleUserStatus = (userId) => {
    setPlatformUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u
        const nextStatus =
          u.status === 'Pending Approval'
            ? 'Approved'
            : u.status === 'Active' || u.status === 'Approved'
            ? 'Paused'
            : 'Active'
        return { ...u, status: nextStatus }
      })
    )
    showToast('User status updated.')
  }

  const handleAddWeatherAlert = ({ region, level, temp, advice }) => {
    const alert = {
      id: `W-${Date.now()}`,
      region,
      level,
      severity: 'warning',
      temp,
      advice,
      updated: 'Just now',
    }
    setWeatherAlerts((prev) => [alert, ...prev])
    showToast(`Weather alert published for ${region}!`)
  }

  return (
    <>
      {activeView === 'landing' && (
        <div className="min-h-screen bg-white text-slate-900">
          <Navbar onOpenAuth={openAuth} />
          <main>
            <Hero
              onOpenAuth={openAuth}
              onQuickEnterRole={(role) => enterRoleDashboard(role)}
            />
            <RoleCards
              onQuickEnterRole={(role) => enterRoleDashboard(role)}
              onOpenAuth={openAuth}
            />
            <HowItWorks />
            <MarketDemandSection
              demands={demands}
              onQuickEnterRole={(role) => enterRoleDashboard(role)}
            />
            <LiveMarketSection />
            <WeatherAlertsSection alerts={weatherAlerts} />
            <AboutContactSection onQuickEnterRole={(role) => enterRoleDashboard(role)} />
          </main>
        </div>
      )}

      {activeView === 'farmer' && (
        <FarmerDashboard
          user={currentUser}
          lots={lots}
          demands={demands}
          weatherAlerts={weatherAlerts}
          onAddLot={handleAddLot}
          onAcceptOffer={handleAcceptOffer}
          onBackHome={() => setActiveView('landing')}
          onLogout={handleLogout}
        />
      )}

      {activeView === 'buyer' && (
        <BuyerDashboard
          user={currentUser}
          lots={lots}
          demands={demands}
          onPlaceBid={handlePlaceBid}
          onAddDemand={handleAddDemand}
          onBackHome={() => setActiveView('landing')}
          onLogout={handleLogout}
        />
      )}

      {activeView === 'agent' && (
        <VillageAgentDashboard
          user={currentUser}
          lots={lots}
          onVerifyLot={handleVerifyLot}
          onBackHome={() => setActiveView('landing')}
          onLogout={handleLogout}
        />
      )}

      {activeView === 'admin' && (
        <AdminDashboard
          user={currentUser}
          lots={lots}
          demands={demands}
          platformUsers={platformUsers}
          weatherAlerts={weatherAlerts}
          onToggleUserStatus={handleToggleUserStatus}
          onAddWeatherAlert={handleAddWeatherAlert}
          onBackHome={() => setActiveView('landing')}
          onLogout={handleLogout}
        />
      )}

      <AuthModal
        isOpen={authModal.open}
        initialMode={authModal.mode}
        initialRole={authModal.role}
        onClose={() => setAuthModal((prev) => ({ ...prev, open: false }))}
        onAuthenticate={({ role, name, location }) =>
          enterRoleDashboard(role, { name, location })
        }
      />

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl border border-yellow-300 bg-green-900 px-4 py-3 text-sm font-bold text-white shadow-xl">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-yellow-300" />
          <span>{toast}</span>
        </div>
      )}
    </>
  )
}
