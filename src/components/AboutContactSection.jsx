import { useState } from 'react'
import { CheckCircle2, Mail, MapPin, Phone, Sprout } from 'lucide-react'

export default function AboutContactSection({ onQuickEnterRole }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !message.trim()) return
    setSubmitted(true)
    setName('')
    setPhone('')
    setMessage('')
  }

  return (
    <>
      <section
        id="about-contact"
        className="border-t border-green-100 bg-gradient-to-b from-yellow-50/60 to-green-50/70 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            {/* About Us */}
            <div className="lg:col-span-6">
              <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-bold text-green-800">
                About Us
              </span>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Helping Rural Farmers Earn More With Clarity
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-700">
                AGRI.IN was created with one clear promise: <strong>Grow What the Market Needs.</strong>{' '}
                Too often, farmers plant crops without knowing buyer demand or fair rates. Our
                platform brings farmers, trusted local Village Agents, and buyers together on one
                easy-to-use website.
              </p>

              <div className="mt-7 space-y-3 rounded-2xl border border-green-200 bg-white p-5">
                <div className="flex items-center gap-3 text-base text-slate-800">
                  <Phone className="h-5 w-5 text-green-700" />
                  <span>
                    <strong>Kisan Helpline:</strong> 1800-102-AGRI (Toll Free)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-base text-slate-800">
                  <Mail className="h-5 w-5 text-green-700" />
                  <span>
                    <strong>Support Email:</strong> help@agri-in.example
                  </span>
                </div>
                <div className="flex items-center gap-3 text-base text-slate-800">
                  <MapPin className="h-5 w-5 text-green-700" />
                  <span>
                    <strong>Regional Hubs:</strong> Sehore • Latur • Karnal • Erode
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Us Form */}
            <div className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-6">
              <h3 className="text-2xl font-extrabold text-slate-900">Contact Us</h3>
              <p className="mt-1 text-base text-slate-600">
                Have a question or need help from a Village Agent? Send us a message.
              </p>

              {submitted ? (
                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-green-700" />
                  <h4 className="mt-3 text-xl font-extrabold text-green-900">
                    Message Received!
                  </h4>
                  <p className="mt-1 text-base text-slate-700">
                    Thank you for contacting AGRI.IN. A support team member will reach out soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-4 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-800"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="mt-1 w-full rounded-xl border border-green-200 px-4 py-3 text-base outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700">
                      Mobile Number or Email
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g., 98765 43210"
                      className="mt-1 w-full rounded-xl border border-green-200 px-4 py-3 text-base outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700">How Can We Help?</label>
                    <textarea
                      rows={3}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us your village or question..."
                      className="mt-1 w-full rounded-xl border border-green-200 px-4 py-3 text-base outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-green-700 px-6 py-3.5 text-base font-bold text-white shadow-sm hover:bg-green-800"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-green-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-300 text-green-950">
                <Sprout className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-white">AGRI.IN</p>
                <p className="text-xs text-green-200">Grow What the Market Needs.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onQuickEnterRole('farmer')}
                className="rounded-xl bg-green-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-green-700"
              >
                Farmer Dashboard
              </button>
              <button
                type="button"
                onClick={() => onQuickEnterRole('buyer')}
                className="rounded-xl bg-yellow-300 px-3.5 py-2 text-xs font-bold text-green-950 hover:bg-yellow-200"
              >
                Buyer Dashboard
              </button>
              <button
                type="button"
                onClick={() => onQuickEnterRole('agent')}
                className="rounded-xl bg-green-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-green-700"
              >
                Village Agent Dashboard
              </button>
              <button
                type="button"
                onClick={() => onQuickEnterRole('admin')}
                className="rounded-xl bg-green-950 px-3.5 py-2 text-xs font-bold text-yellow-200 hover:bg-green-800"
              >
                Admin Dashboard
              </button>
            </div>
          </div>

          <p className="mt-6 border-t border-green-800 pt-6 text-center text-xs text-green-300">
            © {new Date().getFullYear()} AGRI.IN — Smart Agriculture Platform (Frontend Prototype).
          </p>
        </div>
      </footer>
    </>
  )
}
