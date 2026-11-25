import { ArrowRight, Building2, Check, Lock, Shield, ShieldCheck, ShoppingBag, Tractor } from 'lucide-react'
import { USER_ROLES } from '../data/mockData'

const ROLE_ICONS = {
  farmer: Tractor,
  buyer: ShoppingBag,
  agent: ShieldCheck,
}

export default function RoleCards({ onQuickEnterRole, onOpenAuth }) {
  return (
    <section id="roles" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full border border-yellow-300 bg-yellow-100 px-4 py-1 text-sm font-bold text-green-950">
            Role-Protected Portals
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Three Core Roles, One Trusted Network
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Every portal is protected with role-based login so your farm, buyer, and agent records
            stay private and accurate.
          </p>
        </div>

        <div className="mt-12 grid gap-7 lg:grid-cols-3">
          {USER_ROLES.map((role) => {
            const Icon = ROLE_ICONS[role.id]
            return (
              <div
                key={role.id}
                className={`group flex flex-col justify-between rounded-3xl border-2 p-7 shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl ${role.accentBg}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-700 text-yellow-200 shadow-sm transition group-hover:scale-105">
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className={`rounded-full px-3.5 py-1 text-xs font-extrabold ${role.badgeClass}`}>
                      {role.subtitle}
                    </span>
                  </div>

                  <h3 className="mt-5 text-2xl font-extrabold text-slate-900">
                    {role.id === 'buyer' ? 'Buyer / Consumer' : role.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-slate-700">
                    {role.description}
                  </p>

                  <ul className="mt-5 space-y-3">
                    {role.features.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-base text-slate-800">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => onQuickEnterRole(role.id)}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-base font-bold shadow-sm transition ${role.btnClass}`}
                  >
                    <Lock className="h-4 w-4 opacity-80" />
                    {role.cta}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('register', role.id)}
                    className="w-full rounded-xl py-2 text-sm font-bold text-green-800 transition hover:bg-green-50"
                  >
                    Register New {role.title} Account
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Seed Company & Admin Partner Strip */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-yellow-300 bg-yellow-50/70 p-6 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-800 text-yellow-200">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-slate-900">Seed Company Portal</h4>
                <p className="text-sm text-slate-600">
                  Report seed sales &amp; bookings as early planting-intention signals.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onQuickEnterRole('company')}
              className="rounded-2xl bg-green-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-900"
            >
              Seed Seller Login →
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-green-200 bg-green-50/60 p-6 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-yellow-300">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-slate-900">Admin Intelligence Center</h4>
                <p className="text-sm text-slate-600">
                  Upload government CSV/Excel data, verify records &amp; run forecasts.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onQuickEnterRole('admin')}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Admin Login →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
