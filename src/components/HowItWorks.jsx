import { ClipboardList, HandCoins, TrendingUp } from 'lucide-react'
import { HOW_IT_WORKS } from '../data/mockData'

const STEP_ICONS = [TrendingUp, ClipboardList, HandCoins]

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-y border-green-100 bg-gradient-to-b from-green-50/60 to-yellow-50/50 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border-4 border-white bg-green-100 shadow-xl">
              <img
                src="/images/village-agent.jpg"
                alt="Village agent helping a farmer check crop quality on a tablet"
                className="h-[320px] w-full object-cover sm:h-[400px]"
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-bold text-green-800">
              How It Works
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Simple Steps From Farm to Fair Sale
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Even if you are new to smartphones, local Village Agents are ready to help you at
              every step.
            </p>

            <div className="mt-8 space-y-5">
              {HOW_IT_WORKS.map((item, idx) => {
                const Icon = STEP_ICONS[idx]
                return (
                  <div
                    key={item.step}
                    className="flex gap-4 rounded-2xl border border-green-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-yellow-200">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-green-700">
                        Step {item.step}
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-base text-slate-600">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
