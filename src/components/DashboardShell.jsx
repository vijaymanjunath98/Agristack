import { ArrowLeft, LogOut, Sprout } from 'lucide-react'

export default function DashboardShell({
  roleBadge,
  userLabel,
  menuTitle,
  tabs,
  activeTab,
  onTabChange,
  headerClass = 'bg-green-800 text-white border-green-700',
  badgeClass = 'bg-yellow-300 text-green-950',
  activeTabClass = 'bg-green-700 text-white shadow-sm',
  bgClass = 'bg-yellow-50/40',
  headerActions = null,
  onBackHome,
  onLogout,
  children,
}) {
  return (
    <div className={`min-h-screen ${bgClass} text-slate-900`}>
      <header className={`sticky top-0 z-30 border-b shadow-sm backdrop-blur ${headerClass}`}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-300 text-green-950 shadow-sm">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight">AGRI.IN</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${badgeClass}`}>
                  {roleBadge}
                </span>
              </div>
              <p className="text-xs opacity-90">{userLabel}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {headerActions}
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-sm font-bold backdrop-blur transition hover:bg-white/25"
            >
              <ArrowLeft className="h-4 w-4" />
              Website Home
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-xl bg-yellow-300 px-3.5 py-2 text-sm font-bold text-green-950 shadow-sm transition hover:bg-yellow-200"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:px-8">
        <aside className="lg:col-span-3">
          <div className="sticky top-24 rounded-3xl border border-green-200/80 bg-white p-4 shadow-sm">
            <p className="px-3 pb-2 text-xs font-extrabold uppercase tracking-wider text-green-700">
              {menuTitle}
            </p>
            <nav className="flex flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:pb-0">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange(tab.id)}
                    className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                      isActive ? activeTabClass : 'text-slate-700 hover:bg-green-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        <main className="animate-fade-in space-y-6 lg:col-span-9">{children}</main>
      </div>
    </div>
  )
}
