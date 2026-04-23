import { useEffect, useState } from 'react'
import { api } from '../../api/client.js'
import { useAuth } from '../../auth/auth.jsx'

export function AdminAssignManagerPage() {
  const auth = useAuth()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const [managerId, setManagerId] = useState('')
  const [hotelId, setHotelId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError('')
      try {
        const list = await api.getHotels()
        if (!cancelled) {
          setHotels(list || [])
          if (!hotelId && list?.length) setHotelId(String(list[0].hotel_id))
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load hotels')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function assign(e) {
    e.preventDefault()
    setMsg('')
    setSaving(true)
    try {
      const res = await api.assignManager({
        token: auth.token,
        managerId: Number(managerId),
        hotelId: Number(hotelId),
      })
      setMsg(res.msg || 'Manager assigned')
    } catch (err) {
      setMsg(err.message || 'Assign failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Assign manager to hotel</h1>
      <p className="mt-1 text-sm text-slate-600">
        Endpoint:{' '}
        <code className="rounded bg-slate-100 px-1">POST /manager/assign?manager_id=&amp;hotel_id=</code>
      </p>

      <div className="mt-4 rounded-lg border bg-white p-5 text-sm text-slate-600">
        Note: the backend doesn’t expose a “list managers/users” API, so you must enter the{' '}
        <span className="font-mono">manager_id</span> manually (from your database).
      </div>

      {loading ? <div className="mt-6 text-sm text-slate-600">Loading…</div> : null}
      {error ? <div className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <form onSubmit={assign} className="mt-6 space-y-4 rounded-lg border bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">manager_id</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">hotel_id</label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={hotelId}
              onChange={(e) => setHotelId(e.target.value)}
            >
              {hotels.map((h) => (
                <option key={h.hotel_id} value={String(h.hotel_id)}>
                  {h.name} (#{h.hotel_id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {msg ? <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">{msg}</div> : null}

        <button
          disabled={saving}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? 'Assigning…' : 'Assign'}
        </button>
      </form>
    </div>
  )
}

