import { useEffect, useState } from 'react'
import { api } from '../../api/client.js'
import { useAuth } from '../../auth/auth.jsx'

function statusColor(status) {
  const s = String(status || '').toUpperCase()
  if (s.includes('AVAILABLE')) return 'bg-emerald-100 text-emerald-700'
  if (s.includes('CLEAN')) return 'bg-amber-100 text-amber-700'
  return 'bg-rose-100 text-rose-700'
}

export function HousekeepingDashboardPage() {
  const auth = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await api.getHousekeepingTasks({ token: auth.token })
        if (active) setTasks(data)
      } catch (err) {
        if (active) setTasks([])
        if (active) setError(err.message || 'Failed to load housekeeping tasks')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [auth.token])

  async function markAsCleaned(taskId) {
    try {
      await api.completeHousekeepingTask({ token: auth.token, taskId })
      setTasks((prev) => prev.filter((task) => task.task_id !== taskId))
    } catch (err) {
      setError(err.message || 'Failed to complete task')
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Housekeeping Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Review cleaning tasks and mark completed rooms as available.</p>
      </section>

      {loading ? <p className="text-sm text-slate-600">Loading cleaning tasks...</p> : null}
      {error ? <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => (
          <article
            key={task.task_id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Room #{task.room_number}</h3>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(task.status)}`}>{task.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">Type: {task.room_type}</p>
            <p className="text-sm text-slate-600">Room ID: {task.room_id}</p>
            <p className="text-sm text-slate-600">Booking ID: {task.booking_id}</p>
            <button
              className="btn-primary mt-4 w-full"
              onClick={() => markAsCleaned(task.task_id)}
              disabled={String(task.status).toUpperCase().includes('COMPLETED')}
            >
              Mark as Cleaned
            </button>
          </article>
        ))}
      </section>

      {!loading && tasks.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          No cleaning tasks pending right now.
        </div>
      ) : null}
    </div>
  )
}
