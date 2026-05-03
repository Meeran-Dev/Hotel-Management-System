import { useState } from 'react'
import { api } from '../../api/client.js'

export function AdminCreateManagerPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function create(e) {
    e.preventDefault()
    setMsg('')
    setError('')
    setSaving(true)
    try {
      await api.signup({ ...form, role: 'MANAGER' })
      setMsg('Manager account created successfully')
      setForm({ name: '', email: '', password: '' })
    } catch (err) {
      setError(err.message || 'Failed to create manager')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="glass-card p-6 sm:p-8">
        <h1 className="section-title text-2xl">Create manager</h1>
        <p className="section-subtitle">Invite a portfolio manager — they&apos;ll appear in Assign manager.</p>

        <form onSubmit={create} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              className="input-lux"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              className="input-lux"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateForm('password', e.target.value)}
              className="input-lux"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? 'Creating...' : 'Create Manager'}
          </button>
        </form>

        {msg && <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{msg}</div>}
        {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      </div>
    </div>
  )
}