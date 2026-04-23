import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { useAuth } from '../auth/auth.jsx'

async function detectRole(token) {
  try {
    await api.myHotels({ token })
    return 'MANAGER'
  } catch (err) {
    if (err?.status !== 403) return 'HOUSEKEEPING'
  }

  try {
    await api.deleteHotel({ token, hotelId: -999999 })
  } catch (err) {
    if (err?.status === 404) return 'ADMIN'
  }

  return 'HOUSEKEEPING'
}

export function LoginPage() {
  const { portal = 'admin' } = useParams()
  const auth = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(auth.email || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const normalizedPortal = ['admin', 'manager', 'housekeeping'].includes(portal) ? portal : 'admin'
  const portalTitle = {
    admin: 'Admin Portal',
    manager: 'Manager Portal',
    housekeeping: 'Housekeeping Portal',
  }[normalizedPortal]

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.login({ email, password })
      auth.setToken(res.access_token || '')
      auth.setEmail(email)

      const resolvedRole = await detectRole(res.access_token || '')
      auth.setRole(resolvedRole)

      if (resolvedRole === 'ADMIN') navigate('/admin/hotels')
      else if (resolvedRole === 'MANAGER') navigate('/manager/hotels')
      else navigate('/housekeeping/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-blue-700 via-blue-600 to-emerald-500 p-4 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.25),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.2),transparent_40%)]" />
      <div className="relative mx-auto max-w-md">
        <div className="glass-card animate-fade-up p-7">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{portalTitle}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to access your dashboard and manage hotel operations.
            </p>
          </div>
          <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
            <Link className={`portal-chip ${normalizedPortal === 'admin' ? 'portal-chip-active' : ''}`} to="/login/admin">
              Admin
            </Link>
            <Link
              className={`portal-chip ${normalizedPortal === 'manager' ? 'portal-chip-active' : ''}`}
              to="/login/manager"
            >
              Manager
            </Link>
            <Link
              className={`portal-chip ${normalizedPortal === 'housekeeping' ? 'portal-chip-active' : ''}`}
              to="/login/housekeeping"
            >
              Housekeeping
            </Link>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 transition-all duration-300">
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                className="input-lux"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                className="input-lux"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your secure password"
              />
            </div>

            {error ? (
              <div className="animate-fade-up rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
            ) : null}

            <button disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2">
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

