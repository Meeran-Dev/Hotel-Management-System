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
    <div className="space-y-8">
      <section className="glass-card p-6 sm:p-8">
        <h1 className="section-title text-2xl sm:text-3xl">Housekeeping</h1>
        <p className="section-subtitle">
          Tasks appear after check-out — mark a room cleaned when turnover is finished.
        </p>
      </section>

      {loading ? <p className="text-sm text-slate-600">Loading cleaning tasks…</p> : null}
      {error ? (
        <div className="rounded-xl border border-red-200/80 bg-red-50/90 p-3 text-sm text-red-700 backdrop-blur-sm">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => (
          <article
            key={task.task_id}
            className="glass-card transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(37,99,235,0.12)]"
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">Room #{task.room_num}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(task.status)}`}
                >
                  {task.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">Type: {task.room_type}</p>
              <p className="text-sm text-slate-600">Notes: {task.notes || '—'}</p>
              <button
                className="btn-primary mt-5 w-full"
                type="button"
                onClick={() => markAsCleaned(task.task_id)}
                disabled={String(task.status).toUpperCase().includes('COMPLETED')}
              >
                Mark as cleaned
              </button>
            </div>
          </article>
        ))}
      </section>

      {!loading && tasks.length === 0 ? (
        <div className="glass-card p-8 text-center text-sm text-slate-600">No cleaning tasks pending right now.</div>
      ) : null}
    </div>
  )
}
