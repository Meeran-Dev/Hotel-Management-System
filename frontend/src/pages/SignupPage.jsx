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
    <div className="mx-auto max-w-md">
      <div className="glass-card p-7">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Create account</h1>
          <p className="mt-2 text-sm text-slate-600">
            Customer registration to start exploring and booking stays.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Name</label>
          <input
            className="input-lux"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            className="input-lux"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Role</label>
          <input className="input-lux bg-slate-50 text-slate-500" value="CUSTOMER" readOnly />
        </div>

        {error ? <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
        {success ? (
          <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>
        ) : null}

        <button
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Creating…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-semibold text-indigo-700 hover:text-indigo-600" to="/login">
            Login
          </Link>
        </p>
        </form>
      </div>
    </div>
  )
}

