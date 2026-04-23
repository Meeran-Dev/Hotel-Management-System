import { useEffect, useState } from 'react'
import { api } from '../../api/client.js'
import { useAuth } from '../../auth/auth.jsx'

export function AdminHotelsPage() {
  const auth = useAuth()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [numRooms, setNumRooms] = useState('')
  const [saving, setSaving] = useState(false)

  async function refresh() {
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
  }, [])

  async function create(e) {
    e.preventDefault()
    setMsg('')
    setSaving(true)
    try {
      const payload = { name, location, num_rooms: Number(numRooms) }
      await api.createHotel({ token: auth.token, payload })
      setName('')
      setLocation('')
      setNumRooms('')
      setMsg('Hotel created')
      await refresh()
    } catch (err) {
      setMsg(err.message || 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Hotels dashboard</h1>
      <p className="mt-1 text-sm text-slate-600">
        Admin endpoints:{' '}
        <code className="rounded bg-slate-100 px-1">POST /hotels/</code>,{' '}
        <code className="rounded bg-slate-100 px-1">PUT /hotels/{'{hotel_id}'}</code>,{' '}
        <code className="rounded bg-slate-100 px-1">DELETE /hotels/{'{hotel_id}'}</code>
      </p>

      <form onSubmit={create} className="mt-6 rounded-lg border bg-white p-5">
        <div className="text-sm font-semibold text-slate-900">Add hotel</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Name</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Location</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">num_rooms</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={numRooms}
              onChange={(e) => setNumRooms(e.target.value)}
              required
            />
          </div>
          <div className="flex items-end">
            <button
              disabled={saving}
              className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? 'Adding…' : 'Add'}
            </button>
          </div>
        </div>
        {msg ? <div className="mt-3 text-sm text-slate-600">{msg}</div> : null}
      </form>

      {loading ? <div className="mt-6 text-sm text-slate-600">Loading…</div> : null}
      {error ? <div className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="mt-6 divide-y overflow-hidden rounded-lg border bg-white">
        {hotels.map((h) => (
          <HotelRow key={h.hotel_id} hotel={h} token={auth.token} onChanged={refresh} />
        ))}
        {!loading && !error && hotels.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-600">No hotels found.</div>
        ) : null}
      </div>
    </div>
  )
}

function HotelRow({ hotel, token, onChanged }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(String(hotel.name ?? ''))
  const [location, setLocation] = useState(String(hotel.location ?? ''))
  const [numRooms, setNumRooms] = useState(String(hotel.num_rooms ?? ''))
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function save() {
    setMsg('')
    setLoading(true)
    try {
      const payload = { name, location, num_rooms: Number(numRooms) }
      await api.updateHotel({ token, hotelId: hotel.hotel_id, payload })
      setEditing(false)
      setMsg('Saved')
      onChanged()
    } catch (err) {
      setMsg(err.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  async function remove() {
    if (!confirm(`Delete hotel_id ${hotel.hotel_id}?`)) return
    setMsg('')
    setLoading(true)
    try {
      await api.deleteHotel({ token, hotelId: hotel.hotel_id })
      onChanged()
    } catch (err) {
      setMsg(err.message || 'Delete failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            {hotel.name}{' '}
            <span className="text-slate-500">
              (hotel_id <span className="font-mono">{hotel.hotel_id}</span>)
            </span>
          </div>
          <div className="mt-1 text-sm text-slate-600">{hotel.location}</div>
          <div className="mt-2 text-xs text-slate-500">
            num_rooms: <span className="font-mono">{hotel.num_rooms}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-slate-50"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button
            className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            disabled={loading}
            onClick={remove}
          >
            Delete
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Name</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Location</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">num_rooms</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={numRooms}
              onChange={(e) => setNumRooms(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              disabled={loading}
              onClick={save}
              type="button"
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : null}

      {msg ? <div className="mt-3 text-sm text-slate-600">{msg}</div> : null}
    </div>
  )
}

