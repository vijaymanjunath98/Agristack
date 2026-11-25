import { ArrowRight, CheckCircle2, Lock, LogIn, ShieldCheck, Sprout, TrendingUp, UserPlus } from 'lucide-react'

export default function Hero({ onOpenAuth, onQuickEnterRole }) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-br from-white via-yellow-50/75 to-green-50/90 py-14 sm:py-20"
    >
      <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-yellow-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-green-200/35 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300 bg-yellow-100 px-4 py-1.5 text-sm font-bold text-green-950 shadow-sm">
              <Sprout className="h-4 w-4 text-green-700" />
              <span>AGRI.IN • Smart Agricultural Intelligence</span>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:leading-[1.08]">
              Grow What the <span className="text-green-700">Market Needs.</span>
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-slate-700">
              AGRI.IN connects <strong className="text-green-800">Farmers</strong>,{' '}
              <strong className="text-green-800">Buyers &amp; Consumers</strong>,{' '}
              <strong className="text-green-800">Village Agents</strong>, and{' '}
              <strong className="text-green-800">Seed Sellers</strong>. Know 90-day crop demand,
              price crash risks, and weather alerts <em>before</em> you sow.
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center gap-2 rounded-2xl bg-green-700 px-6 py-4 text-base font-bold text-white shadow-lg shadow-green-700/20 transition hover:-translate-y-0.5 hover:bg-green-800"
              >
                <UserPlus className="h-5 w-5" />
                Register Free
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-green-700 bg-white px-6 py-4 text-base font-bold text-green-800 transition hover:bg-green-50"
              >
                <LogIn className="h-5 w-5" />
                Sign In to Portal
              </button>

              <a
                href="#market-demand"
                className="inline-flex items-center gap-2 rounded-2xl border border-yellow-300 bg-yellow-100 px-5 py-4 text-base font-bold text-green-950 transition hover:bg-yellow-200"
              >
                Market Demand
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-white/95 px-4 py-3.5 shadow-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-700" />
                <span className="text-sm font-bold text-slate-800">
                  90-Day Supply &amp; Price Forecasts
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-white/95 px-4 py-3.5 shadow-sm">
                <ShieldCheck className="h-5 w-5 shrink-0 text-green-700" />
                <span className="text-sm font-bold text-slate-800">
                  Role-Secured Portals &amp; Smart Locking
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 font-bold text-slate-600">
                <Lock className="h-3.5 w-3.5 text-green-700" />
                Protected Portals:
              </span>
              {[
                { id: 'farmer', label: 'Farmer', cls: 'bg-green-100 text-green-900 hover:bg-green-200' },
                { id: 'buyer', label: 'Buyer / Consumer', cls: 'bg-yellow-100 text-green-950 border border-yellow-300 hover:bg-yellow-200' },
                { id: 'agent', label: 'Village Agent', cls: 'bg-green-100 text-green-900 hover:bg-green-200' },
                { id: 'company', label: 'Seed Company', cls: 'bg-yellow-100 text-green-950 border border-yellow-300 hover:bg-yellow-200' },
                { id: 'admin', label: 'Admin', cls: 'bg-slate-100 text-slate-800 hover:bg-slate-200' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onQuickEnterRole(p.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${p.cls}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-green-100 shadow-2xl">
              <img
                src="/images/hero-farm.jpg"
                alt="Farmer smiling in a healthy green agricultural field"
                className="h-[360px] w-full object-cover sm:h-[450px]"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-yellow-200 bg-white/95 p-4 shadow-xl backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-800">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-green-700">
                        Live Market Signal
                      </p>
                      <p className="text-base font-extrabold text-slate-900">
                        Sharbati Wheat • Est. ₹2,650 – ₹2,850 / Qt
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onQuickEnterRole('farmer')}
                    className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-800"
                  >
                    Farmer Login →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
