import { useState } from 'react'
import { LayoutDashboard, LogIn, Menu, Sprout, UserPlus, X } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Roles', href: '#roles' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Market Demand', href: '#market-demand' },
  { label: 'Live Market', href: '#live-market' },
  { label: 'Weather', href: '#weather-alerts' },
  { label: 'Contact', href: '#about-contact' },
]

export default function Navbar({ currentUser, onOpenAuth, onOpenMyDashboard }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-green-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-700 text-yellow-200 shadow-sm transition group-hover:bg-green-800">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xl font-extrabold tracking-tight text-green-950">
              AGRI.IN
            </span>
            <span className="block text-xs font-semibold text-green-700">
              Grow What the Market Needs.
            </span>
          </div>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-slate-700 transition hover:text-green-700"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {currentUser ? (
            <button
              type="button"
              onClick={onOpenMyDashboard}
              className="inline-flex items-center gap-2 rounded-2xl bg-green-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-800"
            >
              <LayoutDashboard className="h-4 w-4 text-yellow-200" />
              {currentUser.name} ({currentUser.role})
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-green-700 bg-white px-4 py-2 text-sm font-bold text-green-800 transition hover:bg-green-50"
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center gap-2 rounded-2xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-800"
              >
                <UserPlus className="h-4 w-4" />
                Register
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-xl border border-green-200 p-2.5 text-green-800 hover:bg-green-50 lg:hidden"
          aria-label="Open menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-green-100 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-base font-semibold text-slate-700 hover:bg-green-50 hover:text-green-800"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-green-100 pt-3">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onOpenMyDashboard()
                  }}
                  className="col-span-2 rounded-xl bg-green-700 py-3 text-sm font-bold text-white"
                >
                  Open {currentUser.role} Dashboard
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onOpenAuth('login')
                    }}
                    className="rounded-xl border-2 border-green-700 bg-white py-2.5 text-sm font-bold text-green-800"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onOpenAuth('register')
                    }}
                    className="rounded-xl bg-green-700 py-2.5 text-sm font-bold text-white"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
