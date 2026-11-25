import { useEffect, useState } from 'react'
import { CheckCircle2, Lock } from 'lucide-react'
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
import CompanyDashboard from './dashboards/CompanyDashboard'
import AdminDashboard from './dashboards/AdminDashboard'
import { api, getStoredToken, setStoredToken } from './api/client'
import { INITIAL_DEMANDS, INITIAL_WEATHER_ALERTS } from './data/mockData'

const ROLE_LABELS = {
  farmer: 'Farmer Page',
  buyer: 'Buyer / Consumer Page',
  agent: 'Village Agent Page',
  company: 'Seed Company Page',
  admin: 'Admin Page',
}

export default function App() {
  const [activeView, setActiveView] = useState('landing')
  const [currentUser, setCurrentUser] = useState(null)
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login', role: 'farmer' })
  const [demands, setDemands] = useState(INITIAL_DEMANDS)
  const [weatherAlerts] = useState(INITIAL_WEATHER_ALERTS)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => {
      setToast((current) => (current === msg ? '' : current))
    }, 4000)
  }

  useEffect(() => {
    const token = getStoredToken()
    if (token) {
      api.auth
        .me()
        .then((res) => {
          if (res.user) setCurrentUser(res.user)
        })
        .catch(() => setStoredToken(''))
    }

    api.market
      .publicOverview()
      .then((res) => {
        if (Array.isArray(res.demands) && res.demands.length > 0) {
          setDemands(
            res.demands.map((d) => ({
              id: `DEM-${d.id}`,
              crop: d.crop_name,
              neededQty: `${d.qty_required_kg.toLocaleString()} kg`,
              demandLevel: d.demand_type === 'confirmed' ? 'Confirmed' : 'Estimated',
              targetPrice: `₹${d.expected_price_per_qt} / Qt`,
              region: `${d.district}, ${d.state}`,
              buyerType: `${d.buyer_name} (${d.buyer_category})`,
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const openAuth = (mode = 'login', role = 'farmer') => {
    const normalizedRole = role === 'consumer' ? 'buyer' : role
    setAuthModal({ open: true, mode, role: normalizedRole })
  }

  // Enforces per-page authentication before opening any protected dashboard
  const requestPageAccess = (role) => {
    const normalizedRole = role === 'consumer' ? 'buyer' : role
    const hasToken = Boolean(getStoredToken())
    const isAuthorized =
      hasToken &&
      currentUser &&
      (currentUser.role === normalizedRole || currentUser.role === 'admin')

    if (isAuthorized) {
      setActiveView(normalizedRole)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setAuthModal({ open: true, mode: 'login', role: normalizedRole })
    showToast(`Please sign in to access the ${ROLE_LABELS[normalizedRole] || 'dashboard'}.`)
  }

  const handleAuthenticated = (user) => {
    setCurrentUser(user)
    setActiveView(user.role)
    setAuthModal({ open: false, mode: 'login', role: user.role })
    showToast(`Signed in as ${user.name} (${user.role})`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogout = () => {
    setStoredToken('')
    setCurrentUser(null)
    setActiveView('landing')
    showToast('You have logged out safely.')
  }

  const isAuthorizedFor = (requiredRole) =>
    Boolean(getStoredToken()) &&
    Boolean(currentUser) &&
    (currentUser.role === requiredRole || currentUser.role === 'admin')

  const renderProtectedPage = (requiredRole, component) => {
    if (isAuthorizedFor(requiredRole)) return component
    return (
      <div className="flex min-h-screen items-center justify-center bg-yellow-50/50 p-4">
        <div className="w-full max-w-md rounded-3xl border border-green-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-800">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
            Authentication Required
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            You must sign in with a valid <strong>{ROLE_LABELS[requiredRole]}</strong> account to view this page.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => openAuth('login', requiredRole)}
              className="w-full rounded-2xl bg-green-700 py-3 text-sm font-bold text-white hover:bg-green-800"
            >
              Sign In to {ROLE_LABELS[requiredRole]}
            </button>
            <button
              type="button"
              onClick={() => setActiveView('landing')}
              className="w-full rounded-2xl border border-green-200 py-3 text-sm font-bold text-slate-700 hover:bg-green-50"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {activeView === 'landing' && (
        <div className="min-h-screen bg-white text-slate-900">
          <Navbar onOpenAuth={openAuth} />
          <main>
            <Hero onOpenAuth={openAuth} onQuickEnterRole={requestPageAccess} />
            <RoleCards onQuickEnterRole={requestPageAccess} onOpenAuth={openAuth} />
            <HowItWorks />
            <MarketDemandSection demands={demands} onQuickEnterRole={requestPageAccess} />
            <LiveMarketSection />
            <WeatherAlertsSection alerts={weatherAlerts} />
            <AboutContactSection onQuickEnterRole={requestPageAccess} />
          </main>
        </div>
      )}

      {activeView === 'farmer' &&
        renderProtectedPage(
          'farmer',
          <FarmerDashboard
            user={currentUser}
            weatherAlerts={weatherAlerts}
            onBackHome={() => setActiveView('landing')}
            onLogout={handleLogout}
            onNotify={showToast}
          />
        )}

      {activeView === 'buyer' &&
        renderProtectedPage(
          'buyer',
          <BuyerDashboard
            user={currentUser}
            onBackHome={() => setActiveView('landing')}
            onLogout={handleLogout}
            onNotify={showToast}
          />
        )}

      {activeView === 'agent' &&
        renderProtectedPage(
          'agent',
          <VillageAgentDashboard
            user={currentUser}
            onBackHome={() => setActiveView('landing')}
            onLogout={handleLogout}
            onNotify={showToast}
          />
        )}

      {activeView === 'company' &&
        renderProtectedPage(
          'company',
          <CompanyDashboard
            user={currentUser}
            onBackHome={() => setActiveView('landing')}
            onLogout={handleLogout}
            onNotify={showToast}
          />
        )}

      {activeView === 'admin' &&
        renderProtectedPage(
          'admin',
          <AdminDashboard
            user={currentUser}
            onBackHome={() => setActiveView('landing')}
            onLogout={handleLogout}
            onNotify={showToast}
          />
        )}

      <AuthModal
        isOpen={authModal.open}
        initialMode={authModal.mode}
        initialRole={authModal.role}
        onClose={() => setAuthModal((prev) => ({ ...prev, open: false }))}
        onAuthenticate={handleAuthenticated}
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
