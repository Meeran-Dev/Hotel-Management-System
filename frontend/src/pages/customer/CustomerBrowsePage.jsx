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
              Discover handpicked luxury hotels with trusted service, elegant rooms, and seamless support.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="section-title">Featured Hotels</h2>
            <p className="section-subtitle">Browse top properties and call directly to reserve your room.</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredHotels.map((hotel) => (
            <article
              key={hotel.id}
              className="rounded-2xl border border-slate-200 bg-white shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl"
            >
              <img src={hotel.image} alt={hotel.name} className="h-52 w-full rounded-t-2xl object-cover" />
              <div className="space-y-3 p-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{hotel.name}</h3>
                  <p className="text-sm text-slate-600">{hotel.location}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold text-blue-600">₹{hotel.price}/night</p>
                  <p className="text-amber-500">{"★".repeat(4)}☆</p>
                </div>
                <p className="text-xs text-slate-500">
                  {hotel.rating} rating · {hotel.reviews.toLocaleString()} reviews
                </p>
                <a href={`tel:${hotel.phone}`} className="btn-primary block w-full text-center">
                  📞 Book Now - Call
                </a>
                <p className="text-center text-sm font-medium text-slate-700">{hotel.phone}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg md:grid-cols-3">
        <div className="rounded-2xl bg-blue-50 p-4">
          <p className="text-2xl">🏨</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">Handpicked Hotels</h3>
          <p className="mt-1 text-sm text-slate-600">Curated premium stays in top business and leisure cities.</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-2xl">🛎️</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">Trusted Service</h3>
          <p className="mt-1 text-sm text-slate-600">24x7 support with fast response from dedicated teams.</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-4">
          <p className="text-2xl">💳</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">Flexible Booking</h3>
          <p className="mt-1 text-sm text-slate-600">Call to confirm offers, room upgrades and custom requests.</p>
        </div>
      </section>

      <section>
        <h2 className="section-title">What Guests Say</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
              <p className="text-amber-500">{item.rating}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">"{item.text}"</p>
              <p className="mt-4 text-sm font-semibold text-slate-900">{item.name}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="rounded-3xl border border-slate-200 bg-white px-6 py-7 text-sm text-slate-600">
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          <p className="font-medium text-slate-900">Hotel Management System</p>
          <p>Luxury stays. Trusted hospitality. Direct booking support via phone.</p>
        </div>
      </footer>
    </div>
  )
}

