import { useEffect, useState } from 'react'
import { Building2, Eye, EyeOff, Shield, ShieldCheck, ShoppingBag, Tractor, X } from 'lucide-react'
import { api, setStoredToken } from '../api/client'

const ROLE_OPTIONS = [
  { id: 'farmer', label: 'Farmer', icon: Tractor, demoId: 'farmer@agri.in' },
  { id: 'buyer', label: 'Buyer / Consumer', icon: ShoppingBag, demoId: 'buyer@agri.in' },
  { id: 'agent', label: 'Village Agent', icon: ShieldCheck, demoId: 'agent@agri.in' },
  { id: 'company', label: 'Seed Company', icon: Building2, demoId: 'company@agri.in' },
  { id: 'admin', label: 'Admin', icon: Shield, demoId: 'admin@agri.in' },
]

export default function AuthModal({ isOpen, initialMode, initialRole, onClose, onAuthenticate }) {
  const [mode, setMode] = useState(initialMode || 'login')
  const [role, setRole] = useState(initialRole || 'farmer')
  const [fullName, setFullName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [village, setVillage] = useState('Sehore')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setMode(initialMode || 'login')
    setRole(initialRole || 'farmer')
    setError('')
  }, [initialMode, initialRole, isOpen])

  if (!isOpen) return null

  const selectedMeta = ROLE_OPTIONS.find((r) => r.id === role) || ROLE_OPTIONS[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res =
        mode === 'login'
          ? await api.auth.login({ identifier, password })
          : await api.auth.register({
              name: fullName,
              identifier,
              password,
              role,
              village,
            })
      setStoredToken(res.token)
      onAuthenticate(res.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDemoLogin = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await api.auth.demoLogin(role)
      setStoredToken(res.token)
      onAuthenticate(res.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="animate-fade-in w-full max-w-lg rounded-3xl border border-green-200 bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between border-b border-green-100 pb-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-green-700">
              AGRI.IN Secure Portal Access
            </p>
            <h2 className="text-2xl font-extrabold text-slate-900">
              {mode === 'login' ? 'Sign In to Continue' : 'Create Free Account'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-green-50 hover:text-green-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-green-50 p-1.5">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-xl py-2.5 text-sm font-bold transition ${
              mode === 'login' ? 'bg-green-700 text-white shadow-sm' : 'text-green-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-xl py-2.5 text-sm font-bold transition ${
              mode === 'register' ? 'bg-green-700 text-white shadow-sm' : 'text-green-900'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-sm font-bold text-slate-700">Select Portal Role</label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ROLE_OPTIONS.map((item) => {
                const Icon = item.icon
                const active = role === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-bold transition ${
                      active
                        ? 'border-green-700 bg-yellow-50 text-green-950 shadow-sm'
                        : 'border-green-100 bg-white text-slate-700 hover:border-green-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 text-green-700" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Ramesh Patel"
                className="mt-1 w-full rounded-xl border border-green-200 px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700">Mobile Number or Email</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={`e.g., ${selectedMeta.demoId}`}
              className="mt-1 w-full rounded-xl border border-green-200 px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (demo: agri1234)"
                className="w-full rounded-xl border border-green-200 px-4 py-2.5 pr-10 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-700"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-bold text-slate-700">Village / City</label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g., Sehore, Madhya Pradesh"
                className="mt-1 w-full rounded-xl border border-green-200 px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-green-700 py-3 text-base font-bold text-white shadow-sm transition hover:bg-green-800 disabled:opacity-50"
          >
            {submitting
              ? 'Verifying...'
              : mode === 'login'
              ? `Sign In to ${selectedMeta.label}`
              : 'Register & Open Dashboard'}
          </button>
        </form>

        <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50/70 p-3 text-center">
          <p className="text-xs font-semibold text-slate-600">
            Demo credentials: <span className="font-mono font-bold text-green-900">{selectedMeta.demoId}</span> /{' '}
            <span className="font-mono font-bold text-green-900">agri1234</span>
          </p>
          <button
            type="button"
            disabled={submitting}
            onClick={handleDemoLogin}
            className="mt-2 rounded-xl border border-yellow-300 bg-yellow-200 px-4 py-2 text-xs font-extrabold text-green-950 transition hover:bg-yellow-300"
          >
            1-Click Demo Sign In as {selectedMeta.label} →
          </button>
        </div>
      </div>
    </div>
  )
}
