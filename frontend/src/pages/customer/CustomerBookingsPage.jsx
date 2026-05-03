import { useEffect, useState } from 'react'
import { api } from '../../api/client.js'
import { useAuth } from '../../auth/auth.jsx'

export function CustomerBookingsPage() {
  const auth = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError('')
      try {
        const list = await api.myBookings({ token: auth.token })
        if (!cancelled) setItems(list || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load bookings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [auth.token])

  return (
    <div>
      <div className="glass-card p-6 sm:p-8">
        <h1 className="section-title">My bookings</h1>
        <p className="section-subtitle">
          Track your upcoming stays and review your booking status in one place.
        </p>
      </div>

      {loading ? <div className="mt-6 text-sm text-slate-600">Loading…</div> : null}
      {error ? <div className="mt-6 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

      <div className="glass-table-wrap mt-6">
        <div className="grid grid-cols-5 gap-2 border-b border-white/50 bg-gradient-to-r from-blue-500/15 to-sky-500/15 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 backdrop-blur-sm">
          <div>Booking</div>
          <div>Room</div>
          <div>Check-in</div>
          <div>Check-out</div>
          <div>Status</div>
        </div>
        {items.length ? (
          items.map((b) => (
            <div
              key={b.booking_id}
              className="grid grid-cols-5 gap-2 border-b border-slate-100 px-4 py-3.5 text-sm last:border-b-0"
            >
              <div className="font-mono">{b.booking_id}</div>
              <div className="font-mono">{b.room_id}</div>
              <div className="font-mono">{String(b.check_in_date)}</div>
              <div className="font-mono">{String(b.check_out_date)}</div>
              <div>
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 font-mono text-xs text-indigo-700">
                  {String(b.status)}
                </span>
              </div>
            </div>
          ))
        ) : !loading && !error ? (
          <div className="px-4 py-6 text-sm text-slate-600">No bookings yet.</div>
        ) : null}
      </div>
    </div>
  )
}

