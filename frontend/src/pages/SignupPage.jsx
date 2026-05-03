import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

export function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await api.signup({ name, email, password, role: 'CUSTOMER' })
      setSuccess(res.msg || 'User created')
      setTimeout(() => navigate('/login'), 600)
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-4 shadow-[0_20px_60px_rgba(37,99,235,0.25)] sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.35),transparent_38%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.22),transparent_42%)]" />
      <div className="relative mx-auto max-w-md py-4">
        <div className="glass-card animate-fade-up p-7 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Create account</h1>
            <p className="mt-2 text-sm text-slate-600">
              Customer registration to start exploring and booking stays.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input className="input-lux" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input className="input-lux" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                className="input-lux"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Role</label>
              <input className="input-lux bg-white/35 text-slate-600" value="CUSTOMER" readOnly />
            </div>

            {error ? <div className="rounded-xl border border-red-200/70 bg-red-50/90 p-3 text-sm text-red-700">{error}</div> : null}
            {success ? (
              <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/90 p-3 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}

            <button disabled={loading} className="btn-primary w-full" type="submit">
              {loading ? 'Creating…' : 'Create account'}
            </button>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link className="font-semibold text-blue-700 hover:text-blue-600" to="/login">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
