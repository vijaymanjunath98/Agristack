import { ArrowRight, CheckCircle2, LogIn, ShieldCheck, Sprout, UserPlus } from 'lucide-react'

export default function Hero({ onOpenAuth, onQuickEnterRole }) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-br from-white via-yellow-50/70 to-green-50 py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          {/* Left Content */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300 bg-yellow-100 px-4 py-1.5 text-sm font-bold text-green-900">
              <Sprout className="h-4 w-4 text-green-700" />
              <span>AGRI.IN • Smart Agriculture Platform</span>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:leading-tight">
              Grow What the <span className="text-green-700">Market Needs.</span>
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-slate-700">
              AGRI.IN is a simple, trusted platform that connects{' '}
              <strong className="text-green-800">Farmers</strong>,{' '}
              <strong className="text-green-800">Buyers</strong>, and local{' '}
              <strong className="text-green-800">Village Agents</strong>. Farmers see real crop
              demand before sowing, get weather alerts, and sell directly for fair prices.
            </p>

            {/* Primary Buttons: Login & Register */}
            <div className="mt-8 flex flex-wrap gap-3.5">
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center gap-2 rounded-2xl bg-green-700 px-6 py-4 text-base font-bold text-white shadow-md transition hover:bg-green-800"
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
                Login to Dashboard
              </button>

              <a
                href="#market-demand"
                className="inline-flex items-center gap-2 rounded-2xl border border-yellow-300 bg-yellow-100 px-5 py-4 text-base font-bold text-green-950 transition hover:bg-yellow-200"
              >
                See Market Demand
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Easy Rural Farmer Friendly Points */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2.5 rounded-xl bg-white/90 px-4 py-3 border border-green-100 shadow-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-700" />
                <span className="text-sm font-semibold text-slate-800">
                  Simple buttons &amp; large text
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-white/90 px-4 py-3 border border-green-100 shadow-sm">
                <ShieldCheck className="h-5 w-5 shrink-0 text-green-700" />
                <span className="text-sm font-semibold text-slate-800">
                  Help from local Village Agents
                </span>
              </div>
            </div>

            {/* Instant Prototype Dashboard Links */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-bold text-slate-600">Preview Dashboards:</span>
              <button
                type="button"
                onClick={() => onQuickEnterRole('farmer')}
                className="rounded-lg bg-green-100 px-3 py-1.5 font-bold text-green-900 hover:bg-green-200"
              >
                Farmer
              </button>
              <button
                type="button"
                onClick={() => onQuickEnterRole('buyer')}
                className="rounded-lg bg-yellow-100 px-3 py-1.5 font-bold text-green-950 border border-yellow-300 hover:bg-yellow-200"
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => onQuickEnterRole('agent')}
                className="rounded-lg bg-green-100 px-3 py-1.5 font-bold text-green-900 hover:bg-green-200"
              >
                Village Agent
              </button>
              <button
                type="button"
                onClick={() => onQuickEnterRole('company')}
                className="rounded-lg bg-yellow-100 px-3 py-1.5 font-bold text-green-950 border border-yellow-300 hover:bg-yellow-200"
              >
                Seed Company
              </button>
              <button
                type="button"
                onClick={() => onQuickEnterRole('admin')}
                className="rounded-lg bg-slate-100 px-3 py-1.5 font-bold text-slate-800 hover:bg-slate-200"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Right Agriculture Hero Photo */}
          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-green-100 shadow-2xl">
              <img
                src="/images/hero-farm.jpg"
                alt="Farmer smiling in a healthy green agricultural field"
                className="h-[340px] w-full object-cover sm:h-[430px]"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-yellow-200 bg-white/95 p-4 backdrop-blur shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                      Today&apos;s Top Market Need
                    </p>
                    <p className="text-base font-extrabold text-slate-900">
                      Sharbati Wheat • ₹2,650 – ₹2,850 / Quintal
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onQuickEnterRole('farmer')}
                    className="rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
                  >
                    Sell Harvest →
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
