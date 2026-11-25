import { CloudRain, CloudSun, Sun, ThermometerSun } from 'lucide-react'

export default function WeatherAlertsSection({ alerts }) {
  return (
    <section id="weather-alerts" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-1 text-sm font-bold text-green-900 border border-yellow-300">
            <ThermometerSun className="h-4 w-4 text-green-700" />
            Weather &amp; Climate Alerts
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Clear Weather Advice to Protect Your Crops
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Simple local forecasts so farmers know when to harvest, dry, or cover grain bags.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {alerts.map((alert) => {
            const isWarning = alert.severity === 'warning'
            const isGood = alert.severity === 'good'
            const Icon = isWarning ? CloudRain : isGood ? Sun : CloudSun

            return (
              <div
                key={alert.id}
                className={`rounded-3xl border-2 p-6 shadow-sm ${
                  isWarning
                    ? 'border-yellow-400 bg-yellow-50'
                    : isGood
                    ? 'border-green-200 bg-green-50/60'
                    : 'border-green-100 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-700 text-yellow-200">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-xl bg-white px-3 py-1 text-lg font-extrabold text-green-900 border border-green-200">
                    {alert.temp}
                  </span>
                </div>

                <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-green-800">
                  {alert.level}
                </p>
                <h3 className="mt-1 text-xl font-extrabold text-slate-900">{alert.region}</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-700">{alert.advice}</p>
                <p className="mt-4 text-xs font-semibold text-slate-500">{alert.updated}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
