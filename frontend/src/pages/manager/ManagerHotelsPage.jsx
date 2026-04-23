import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client.js'
import { useAuth } from '../../auth/auth.jsx'

export function ManagerHotelsPage() {
  const auth = useAuth()
  const [assignments, setAssignments] = useState([])
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [roomsByHotel, setRoomsByHotel] = useState({})

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError('')
      try {
        const [my, all] = await Promise.all([
          api.myHotels({ token: auth.token }),
          api.getHotels(),
        ])
        const roomEntries = await Promise.all(
          (my || []).map(async (assignment) => [String(assignment.hotel_id), await api.getRooms({ hotelId: assignment.hotel_id })]),
        )
        const nextRooms = Object.fromEntries(roomEntries)
        if (!cancelled) {
          setAssignments(my || [])
          setHotels(all || [])
          setRoomsByHotel(nextRooms)
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load manager hotels')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [auth.token])

  const hotelsById = useMemo(() => {
    const m = new Map()
    for (const h of hotels) m.set(String(h.hotel_id), h)
    return m
  }, [hotels])

  const allAssignedRooms = useMemo(
    () => Object.values(roomsByHotel).flatMap((list) => list || []),
    [roomsByHotel],
  )
  const occupiedRooms = allAssignedRooms.filter((r) => String(r.status) === 'OCCUPIED').length
  const availableRooms = allAssignedRooms.filter((r) => String(r.status) === 'AVAILABLE').length
  const cleaningRooms = allAssignedRooms.filter((r) => String(r.status) === 'CLEANING').length

  function roomColor(status) {
    const normalized = String(status || '').toUpperCase()
    if (normalized.includes('AVAILABLE')) return 'bg-emerald-100 border-emerald-300 text-emerald-800'
    if (normalized.includes('CLEAN')) return 'bg-amber-100 border-amber-300 text-amber-800'
    return 'bg-rose-100 border-rose-300 text-rose-800'
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px,1fr]">
      <aside className="rounded-2xl bg-blue-900 p-5 text-blue-50 shadow-xl">
        <h2 className="text-lg font-semibold">Manager Panel</h2>
        <p className="mt-2 text-sm text-blue-100">Track assigned hotels and manage room inventory efficiently.</p>
        <div className="mt-6 space-y-2 text-sm">
          <div className="rounded-xl bg-blue-800/70 px-3 py-2">🏨 Assigned Hotels</div>
          <div className="rounded-xl bg-blue-800/40 px-3 py-2">📊 Performance Snapshot</div>
          <div className="rounded-xl bg-blue-800/40 px-3 py-2">🛏️ Rooms and Status</div>
        </div>
      </aside>

      <section>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">My Assigned Hotels</h1>
          <p className="mt-2 text-sm text-slate-600">Monitor occupancy, update room details and coordinate housekeeping.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-xs text-slate-500">Total Properties</p>
              <p className="mt-1 text-3xl font-semibold text-blue-600">{assignments.length}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs text-slate-500">Active Rooms</p>
              <p className="mt-1 text-3xl font-semibold text-emerald-600">{allAssignedRooms.length}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-xs text-slate-500">Pending Cleaning</p>
              <p className="mt-1 text-3xl font-semibold text-amber-500">{cleaningRooms}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-xs text-slate-500">Occupied Rooms</p>
              <p className="mt-1 text-3xl font-semibold text-blue-600">{occupiedRooms}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs text-slate-500">Available Rooms</p>
              <p className="mt-1 text-3xl font-semibold text-emerald-600">{availableRooms}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-xs text-slate-500">Cleaning Rooms</p>
              <p className="mt-1 text-3xl font-semibold text-amber-600">{cleaningRooms}</p>
            </div>
          </div>
          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-800">Room Status Grid</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {allAssignedRooms.map((room) => (
                <div key={room.room_id} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${roomColor(room.status)}`}>
                  Room #{room.room_number} · {room.status}
                </div>
              ))}
              {!allAssignedRooms.length ? (
                <div className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500">No rooms available</div>
              ) : null}
            </div>
          </div>
        </div>

        {loading ? <div className="mt-6 text-sm text-slate-600">Loading...</div> : null}
        {error ? <div className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {assignments.map((a) => {
            const hotel = hotelsById.get(String(a.hotel_id))
            return (
              <article
                key={`${a.manager_id}-${a.hotel_id}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="text-xs text-slate-500">
                  manager_id <span className="font-mono">{a.manager_id}</span> · hotel_id{' '}
                  <span className="font-mono">{a.hotel_id}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{hotel ? hotel.name : `Hotel #${a.hotel_id}`}</h3>
                <p className="mt-1 text-sm text-slate-600">{hotel ? hotel.location : null}</p>

                <div className="mt-4">
                  <Link className="btn-primary inline-flex" to={`/manager/hotels/${a.hotel_id}/rooms`}>
                    Manage Rooms
                  </Link>
                </div>
              </article>
            )
          })}
        </div>

        {!loading && !error && assignments.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            No hotels assigned yet. Ask admin to assign your manager ID.
          </div>
        ) : null}
      </section>
    </div>
  )
}

