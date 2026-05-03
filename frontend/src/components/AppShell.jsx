import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth.jsx'

function TopNavLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)]'
            : 'text-slate-700 hover:bg-white/55 hover:text-slate-900',
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
    <div className="relative min-h-screen text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-400/20 blur-[100px]" />
        <div className="absolute -right-20 top-[40%] h-80 w-80 rounded-full bg-sky-300/25 blur-[90px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-blue-600/15 blur-[80px]" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/45 bg-white/40 shadow-[0_4px_30px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5">
          <Link to="/" className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-slate-900">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 text-sm font-bold text-white shadow-[0_6px_16px_rgba(37,99,235,0.4)]">
              H
            </span>
            <span className="hidden sm:inline">Hotel Manager</span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
            <TopNavLink to="/">Browse</TopNavLink>

            {auth.token && auth.role === 'MANAGER' ? (
              <TopNavLink to="/manager/hotels">My hotels</TopNavLink>
            ) : null}

            {auth.token && auth.role === 'ADMIN' ? (
              <>
                <TopNavLink to="/admin/hotels">Hotels</TopNavLink>
                <TopNavLink to="/admin/create-manager">Create manager</TopNavLink>
                <TopNavLink to="/admin/assign">Assign manager</TopNavLink>
              </>
            ) : null}
            {auth.token && auth.role === 'STAFF' ? (
              <TopNavLink to="/housekeeping/dashboard">Housekeeping</TopNavLink>
            ) : null}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {auth.token ? (
              <>
                <span className="hidden rounded-xl border border-white/60 bg-white/45 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-md md:inline">
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
              <Link className="btn-primary" to="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:py-10">{children}</main>
    </div>
  )
}
