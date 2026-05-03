import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client.js'

const testimonials = [
  {
    name: 'Ritika S.',
    text: 'Amazing rooms, smooth check-in and very professional service.',
    rating: '★★★★★',
  },
  {
    name: 'Arjun M.',
    text: 'Super clean property and excellent hospitality for business travel.',
    rating: '★★★★★',
  },
  {
    name: 'Neha P.',
    text: 'Premium experience with great location and responsive support team.',
    rating: '★★★★☆',
  },
]

export function CustomerBrowsePage() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState({ name: '', city: '', state: '' })

  useEffect(() => {
    async function loadHotels() {
      setLoading(true)
      setError('')
      try {
        const list = await api.getHotels()
        setHotels(list || [])
      } catch (err) {
        setError(err.message || 'Failed to load hotels')
      } finally {
        setLoading(false)
      }
    }
    loadHotels()
  }, [])

  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const nameMatch = !search.name || hotel.name.toLowerCase().includes(search.name.toLowerCase())
      const cityMatch =
        !search.city ||
        (hotel.city && hotel.city.toLowerCase().includes(search.city.toLowerCase()))
      const stateMatch =
        !search.state ||
        (hotel.state && hotel.state.toLowerCase().includes(search.state.toLowerCase()))
      return nameMatch && cityMatch && stateMatch
    })
  }, [hotels, search])

  function updateSearch(key, value) {
    setSearch((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl border border-white/50 shadow-[0_20px_60px_rgba(37,99,235,0.12)]">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1800&q=80"
          alt="Luxury hotel"
          className="h-[380px] w-full object-cover sm:h-[480px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/45 to-slate-900/20" />
        <div className="absolute inset-0 flex items-center px-6 sm:px-12">
          <div className="glass-banner-panel max-w-xl animate-fade-up text-white">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
                Premium stays
              </p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Find your perfect stay</h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-100/95 sm:text-base">
                Explore properties with polished service and effortless booking — designed around clarity,
                not clutter.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl">
        <div className="glass-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">Search hotels</h2>
          <p className="mt-1 text-sm text-slate-600">Filter by name or location.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Hotel name"
              value={search.name}
              onChange={(e) => updateSearch('name', e.target.value)}
              className="input-field mt-0"
            />
            <input
              type="text"
              placeholder="City"
              value={search.city}
              onChange={(e) => updateSearch('city', e.target.value)}
              className="input-field mt-0"
            />
            <input
              type="text"
              placeholder="State"
              value={search.state}
              onChange={(e) => updateSearch('state', e.target.value)}
              className="input-field mt-0"
            />
          </div>
        </div>
      </section>

      {loading && <p className="text-center text-sm text-slate-600">Loading hotels…</p>}
      {error && (
        <div className="glass-card mx-auto max-w-lg border-red-200/60 bg-red-50/70 p-4 text-center text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredHotels.map((hotel) => (
          <article key={hotel.hotel_id} className="glass-card group transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(37,99,235,0.14)]">
            <div className="relative z-10 overflow-hidden rounded-t-2xl">
              <img
                src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80"
                alt={hotel.name}
                className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/25 to-transparent" />
            </div>
            <div className="relative z-10 p-5">
              <h3 className="text-lg font-semibold text-slate-900">{hotel.name}</h3>
              <p className="text-sm text-slate-600">
                {hotel.city}, {hotel.state}
              </p>
              <p className="mt-1 text-xs text-slate-500">{hotel.num_rooms} rooms</p>
              <Link to={`/book/${hotel.hotel_id}`} className="btn-primary mt-4 block w-full text-center">
                Book now
              </Link>
            </div>
          </article>
        ))}
      </section>

      {!loading && filteredHotels.length === 0 && (
        <p className="text-center text-sm text-slate-600">No hotels match your search.</p>
      )}

      <section>
        <h2 className="mb-4 text-center text-lg font-semibold text-slate-900">Guest stories</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card p-5">
              <div className="text-amber-500">{t.rating}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">“{t.text}”</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="glass-card px-6 py-7 text-sm text-slate-600">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="font-semibold text-slate-900">Hotel Manager</p>
          <p>Luxury stays, trusted hospitality, and a booking flow that stays out of your way.</p>
        </div>
      </footer>
    </div>
  )
}
