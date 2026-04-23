import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth.jsx'

function TopNavLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'rounded-xl px-3 py-2 text-sm font-medium transition',
          isActive
            ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-500/20'
            : 'text-slate-700 hover:bg-white/70',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export function AppShell({ children }) {
  const auth = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5">
          <Link to="/" className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 text-sm font-bold text-white shadow-md">
              H
            </span>
            Hotel Management System
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            <TopNavLink to="/">Browse</TopNavLink>

            {auth.token && auth.role === 'MANAGER' ? (
              <TopNavLink to="/manager/hotels">My hotels</TopNavLink>
            ) : null}

            {auth.token && auth.role === 'ADMIN' ? (
              <>
                <TopNavLink to="/admin/hotels">Hotels</TopNavLink>
                <TopNavLink to="/admin/assign">Assign manager</TopNavLink>
              </>
            ) : null}
            {auth.token && auth.role === 'HOUSEKEEPING' ? (
              <TopNavLink to="/housekeeping/dashboard">Housekeeping</TopNavLink>
            ) : null}
          </nav>

          <div className="flex items-center gap-2">
            {auth.token ? (
              <>
                <span className="hidden rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 md:inline">
                  {auth.email} · {auth.role}
                </span>
                <button
                  className="btn-primary"
                  onClick={() => {
                    auth.logout()
                    navigate('/')
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn-secondary" to="/login/admin">
                  Admin Login
                </Link>
                <Link className="btn-primary" to="/login/manager">
                  Staff Login
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-10">{children}</main>
    </div>
  )
}

