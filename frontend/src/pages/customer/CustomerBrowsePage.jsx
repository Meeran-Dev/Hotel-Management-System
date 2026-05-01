import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client.js'

const featuredHotels = [
  {
    id: 'taj',
    name: 'Taj Hotel',
    location: 'Mumbai, Maharashtra',
    price: 7900,
    rating: 4.8,
    reviews: 1245,
    phone: '+91 22 6665 3333',
    image:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'oberoi',
    name: 'Oberoi Hotel',
    location: 'Bengaluru, Karnataka',
    price: 6800,
    rating: 4.7,
    reviews: 987,
    phone: '+91 80 4555 2200',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'itc',
    name: 'ITC Grand',
    location: 'New Delhi',
    price: 6200,
    rating: 4.6,
    reviews: 876,
    phone: '+91 11 4444 1900',
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'marriott',
    name: 'Marriott',
    location: 'Hyderabad, Telangana',
    price: 5400,
    rating: 4.5,
    reviews: 741,
    phone: '+91 40 6652 2299',
    image:
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1600&q=80',
  },
]

const testimonials = [
  { name: 'Ritika S.', text: 'Amazing rooms, smooth check-in and very professional service.', rating: '★★★★★' },
  { name: 'Arjun M.', text: 'Super clean property and excellent hospitality for business travel.', rating: '★★★★★' },
  { name: 'Neha P.', text: 'Premium experience with great location and responsive support team.', rating: '★★★★☆' },
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
      const cityMatch = !search.city || (hotel.city && hotel.city.toLowerCase().includes(search.city.toLowerCase()))
      const stateMatch = !search.state || (hotel.state && hotel.state.toLowerCase().includes(search.state.toLowerCase()))
      return nameMatch && cityMatch && stateMatch
    })
  }, [hotels, search])

  function updateSearch(key, value) {
    setSearch((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1800&q=80"
          alt="Luxury hotel"
          className="h-[420px] w-full object-cover sm:h-[520px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/55 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6 sm:px-12">
          <div className="max-w-2xl animate-fade-up text-white">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
              Premium Stays Across India
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Find Your Perfect Stay</h1>
            <p className="mt-4 max-w-xl text-sm text-slate-100 sm:text-base">
              Discover luxury hotels with trusted service. No signup required for booking.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl">
        <div className="glass-card p-6">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Search Hotels</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Hotel Name"
              value={search.name}
              onChange={(e) => updateSearch('name', e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              placeholder="City"
              value={search.city}
              onChange={(e) => updateSearch('city', e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              placeholder="State"
              value={search.state}
              onChange={(e) => updateSearch('state', e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </section>

      {loading && <p className="text-center text-slate-600">Loading hotels...</p>}
      {error && <div className="mx-auto max-w-md rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredHotels.map((hotel) => (
          <article
            key={hotel.hotel_id}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <img
              src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80"
              alt={hotel.name}
              className="h-48 w-full object-cover"
            />
            <div className="p-5">
              <h3 className="text-lg font-semibold text-slate-900">{hotel.name}</h3>
              <p className="text-sm text-slate-600">{hotel.city}, {hotel.state}</p>
              <p className="text-sm text-slate-600">{hotel.num_rooms} rooms</p>
              <Link to={`/book/${hotel.hotel_id}`} className="btn-primary mt-4 w-full inline-block text-center">
                Book Now
              </Link>
            </div>
          </article>
        ))}
      </section>

      {!loading && filteredHotels.length === 0 && (
        <div className="text-center text-slate-600">No hotels found matching your search.</div>
      )}

      <footer className="rounded-3xl border border-slate-200 bg-white px-6 py-7 text-sm text-slate-600">
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          <p className="font-medium text-slate-900">Hotel Management System</p>
          <p>Luxury stays. Trusted hospitality. Direct booking support via phone.</p>
        </div>
      </footer>
    </div>
  )
}

