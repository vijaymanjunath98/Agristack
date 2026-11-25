import { Flame, MapPin, PackageCheck } from 'lucide-react'

export default function MarketDemandSection({ demands, onQuickEnterRole }) {
  return (
    <section id="market-demand" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Banner with Harvest Photo */}
        <div className="grid items-center gap-8 rounded-3xl border border-green-200 bg-gradient-to-r from-green-800 to-green-700 p-6 text-white shadow-lg sm:p-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="inline-block rounded-full bg-yellow-300 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-green-950">
              Market Demand Overview
            </span>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              See What Buyers Need Before You Grow
            </h2>
            <p className="mt-3 text-base text-green-100 sm:text-lg">
              Instead of guessing which crop will sell well, check real buyer requests here. Grow
              crops with guaranteed demand and strong prices.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onQuickEnterRole('farmer')}
                className="rounded-xl bg-yellow-300 px-5 py-3 text-sm font-extrabold text-green-950 hover:bg-yellow-200"
              >
                Farmer: Plan My Crop →
              </button>
              <button
                type="button"
                onClick={() => onQuickEnterRole('buyer')}
                className="rounded-xl border border-green-400 bg-green-900/40 px-5 py-3 text-sm font-bold text-white hover:bg-green-900"
              >
                Buyer: Post New Demand
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <img
              src="/images/crop-harvest.jpg"
              alt="Fresh harvested golden wheat grains and farm produce"
              className="h-56 w-full rounded-2xl border-2 border-yellow-200/70 object-cover shadow-md sm:h-64"
            />
          </div>
        </div>

        {/* Demand Cards Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {demands.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border-2 border-green-100 bg-yellow-50/50 p-5 shadow-sm transition hover:border-green-400"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-200 px-3 py-1 text-xs font-extrabold text-green-950">
                    <Flame className="h-3.5 w-3.5 text-green-800" />
                    {item.demandLevel} Demand
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-extrabold text-slate-900">{item.crop}</h3>
                <p className="mt-1 text-sm font-semibold text-green-800">{item.buyerType}</p>

                <div className="mt-4 space-y-2 rounded-xl bg-white p-3.5 text-sm border border-green-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Needed</span>
                    <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                      <PackageCheck className="h-4 w-4 text-green-700" />
                      {item.neededQty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Target Price</span>
                    <span className="font-extrabold text-green-800">{item.targetPrice}</span>
                  </div>
                </div>
              </div>

              <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <MapPin className="h-4 w-4 text-green-700" />
                {item.region}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
