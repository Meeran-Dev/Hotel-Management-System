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
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
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
      const payload = { name, city, state, num_rooms: Number(numRooms) }
      await api.createHotel({ token: auth.token, payload })
      setName('')
      setCity('')
      setState('')
      setNumRooms('')
      setMsg('Hotel added to the directory.')
      await refresh()
    } catch (err) {
      setMsg(err.message || 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="glass-card p-6 sm:p-8">
        <h1 className="section-title text-2xl sm:text-3xl">Hotels</h1>
        <p className="section-subtitle">Create properties and maintain their profile from one place.</p>
      </div>

      <form onSubmit={create} className="glass-card p-6 sm:p-8">
        <div className="text-sm font-semibold text-slate-900">Add hotel</div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="text-xs font-medium text-slate-600">Name</label>
            <input
              className="input-lux"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">City</label>
            <input
              className="input-lux"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">State</label>
            <input
              className="input-lux"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Room capacity</label>
            <input
              className="input-lux"
              type="number"
              min={1}
              value={numRooms}
              onChange={(e) => setNumRooms(e.target.value)}
              required
            />
          </div>
          <div className="flex items-end lg:col-span-1">
            <button disabled={saving} className="btn-primary w-full" type="submit">
              {saving ? 'Adding…' : 'Add'}
            </button>
          </div>
        </div>
        {msg ? <div className="mt-4 text-sm text-slate-600">{msg}</div> : null}
      </form>

      {loading ? <div className="text-sm text-slate-600">Loading hotels…</div> : null}
      {error ? (
        <div className="rounded-xl border border-red-200/80 bg-red-50/90 p-4 text-sm text-red-700 backdrop-blur-sm">
          {error}
        </div>
      ) : null}

      <div className="glass-card divide-y divide-white/40">
        {hotels.map((h) => (
          <HotelRow key={h.hotel_id} hotel={h} token={auth.token} onChanged={refresh} />
        ))}
        {!loading && !error && hotels.length === 0 ? (
          <div className="px-5 py-8 text-sm text-slate-600">No hotels in the catalog yet.</div>
        ) : null}
      </div>
    </div>
  )
}

function HotelRow({ hotel, token, onChanged }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(String(hotel.name ?? ''))
  const [city, setCity] = useState(String(hotel.city ?? ''))
  const [state, setState] = useState(String(hotel.state ?? ''))
  const [numRooms, setNumRooms] = useState(String(hotel.num_rooms ?? ''))
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function save() {
    setMsg('')
    setLoading(true)
    try {
      const payload = { name, city, state, num_rooms: Number(numRooms) }
      await api.updateHotel({ token, hotelId: hotel.hotel_id, payload })
      setEditing(false)
      setMsg('Saved.')
      onChanged()
    } catch (err) {
      setMsg(err.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  async function remove() {
    if (!confirm(`Delete “${hotel.name}”? This cannot be undone.`)) return
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
    <div className="p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="text-base font-semibold text-slate-900">{hotel.name}</div>
          <div className="mt-1 text-sm text-slate-600">
            {hotel.city}, {hotel.state}
          </div>
          <div className="mt-2 text-xs text-slate-500">Room capacity: {hotel.num_rooms}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button
            type="button"
            className="rounded-xl border border-red-200 bg-white/50 px-3 py-2 text-sm font-medium text-red-700 backdrop-blur-sm hover:bg-red-50"
            disabled={loading}
            onClick={remove}
          >
            Delete
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="text-xs font-medium text-slate-600">Name</label>
            <input className="input-lux" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">City</label>
            <input className="input-lux" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">State</label>
            <input className="input-lux" value={state} onChange={(e) => setState(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Room capacity</label>
            <input
              className="input-lux"
              type="number"
              min={1}
              value={numRooms}
              onChange={(e) => setNumRooms(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="btn-primary w-full"
              disabled={loading}
              onClick={save}
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
