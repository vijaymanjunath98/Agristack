import { ArrowDownRight, ArrowUpRight, Minus, Radio } from 'lucide-react'
import { LIVE_MARKET_RATES } from '../data/mockData'

export default function LiveMarketSection() {
  return (
    <section
      id="live-market"
      className="border-y border-green-100 bg-green-50/50 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1 text-sm font-bold text-green-800">
              <Radio className="h-4 w-4 text-green-700" />
              Live Market Status
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Today&apos;s Crop Prices &amp; Buying Activity
            </h2>
            <p className="mt-2 text-lg text-slate-600">
              Check live sample mandi rates so you always know a fair price for your harvest.
            </p>
          </div>
          <span className="rounded-xl border border-yellow-300 bg-yellow-100 px-4 py-2 text-sm font-bold text-green-950">
            Updated Daily • Sample Rates
          </span>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-green-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-green-800 text-sm font-bold text-white">
                <tr>
                  <th className="px-6 py-4">Crop Name</th>
                  <th className="px-6 py-4">Mandi / Hub</th>
                  <th className="px-6 py-4">Today&apos;s Rate</th>
                  <th className="px-6 py-4">Price Change</th>
                  <th className="px-6 py-4">Market Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100 text-base">
                {LIVE_MARKET_RATES.map((row) => (
                  <tr key={row.crop} className="hover:bg-yellow-50/50">
                    <td className="px-6 py-4 font-extrabold text-slate-900">{row.crop}</td>
                    <td className="px-6 py-4 text-slate-700">{row.mandi}</td>
                    <td className="px-6 py-4 font-extrabold text-green-800">{row.price}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                          row.trend === 'up'
                            ? 'bg-green-100 text-green-800'
                            : row.trend === 'down'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {row.trend === 'up' && <ArrowUpRight className="h-4 w-4" />}
                        {row.trend === 'down' && <ArrowDownRight className="h-4 w-4" />}
                        {row.trend === 'steady' && <Minus className="h-4 w-4" />}
                        {row.change}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-yellow-100 px-3 py-1 text-xs font-bold text-green-950">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
