import { useEffect, useState } from 'react'
import { api } from '../../api/client.js'
import { useAuth } from '../../auth/auth.jsx'

export function AdminAssignManagerPage() {
  const auth = useAuth()
  const [hotels, setHotels] = useState([])
  const [managers, setManagers] = useState([])
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
        const [list, mgrs] = await Promise.all([
          api.getHotels(),
          api.listManagers({ token: auth.token }),
        ])
        if (!cancelled) {
          setHotels(list || [])
          setManagers(mgrs || [])
          const h = list?.[0]?.hotel_id
          const m = mgrs?.[0]?.user_id
          if (h != null && !hotelId) setHotelId(String(h))
          if (m != null && !managerId) setManagerId(String(m))
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token])

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
      setMsg(res.msg || 'Manager assigned successfully.')
    } catch (err) {
      setMsg(err.message || 'Could not assign. This manager may already be linked to that hotel.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="glass-card p-6 sm:p-8">
        <h1 className="section-title text-2xl sm:text-3xl">Assign manager to hotel</h1>
        <p className="section-subtitle">
          Pick a manager account and hotel from the lists below — no IDs to look up elsewhere.
        </p>
      </div>

      {loading ? <div className="glass-card p-6 text-sm text-slate-600">Loading…</div> : null}
      {error ? <div className="rounded-xl border border-red-200/80 bg-red-50/90 p-4 text-sm text-red-700 backdrop-blur-sm">{error}</div> : null}

      {!loading && !error && managers.length === 0 ? (
        <div className="glass-card border-amber-200/60 bg-amber-50/50 p-5 text-sm text-amber-900">
          No manager accounts yet. Use <strong>Create manager</strong> in the navigation first.
        </div>
      ) : null}

      <form onSubmit={assign} className="glass-card space-y-5 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Manager</label>
            <select
              className="input-lux mt-1"
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              required
              disabled={managers.length === 0}
            >
              {managers.length === 0 ? (
                <option value="">No managers available</option>
              ) : (
                managers.map((m) => (
                  <option key={m.user_id} value={String(m.user_id)}>
                    {m.name} — {m.email}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Hotel</label>
            <select
              className="input-lux mt-1"
              value={hotelId}
              onChange={(e) => setHotelId(e.target.value)}
              disabled={hotels.length === 0}
            >
              {hotels.length === 0 ? (
                <option value="">No hotels yet</option>
              ) : (
                hotels.map((h) => (
                  <option key={h.hotel_id} value={String(h.hotel_id)}>
                    {h.name} · {h.city}, {h.state}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {msg ? (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-sm text-slate-700 backdrop-blur-sm">
            {msg}
          </div>
        ) : null}

        <button
          disabled={saving || hotels.length === 0 || managers.length === 0}
          className="btn-primary"
          type="submit"
        >
          {saving ? 'Assigning…' : 'Assign to hotel'}
        </button>
      </form>
    </div>
  )
}
