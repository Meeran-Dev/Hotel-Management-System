import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/auth.jsx'
import { AppShell } from './components/AppShell.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { CustomerBrowsePage } from './pages/customer/CustomerBrowsePage.jsx'
import { BookingPage } from './pages/customer/BookingPage.jsx'
import { ManagerHotelsPage } from './pages/manager/ManagerHotelsPage.jsx'
import { AdminHotelsPage } from './pages/admin/AdminHotelsPage.jsx'
import { AdminAssignManagerPage } from './pages/admin/AdminAssignManagerPage.jsx'
import { AdminCreateManagerPage } from './pages/admin/AdminCreateManagerPage.jsx'
import { HousekeepingDashboardPage } from './pages/housekeeping/HousekeepingDashboardPage.jsx'

function RequireAuth({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

function RequireRole({ role, children }) {
  const { role: currentRole } = useAuth()
  if (!currentRole) return <Navigate to="/" replace />
  if (currentRole !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<CustomerBrowsePage />} />
            <Route path="/book/:hotelId" element={<BookingPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/manager/hotels"
              element={
                <RequireAuth>
                  <RequireRole role="MANAGER">
                    <ManagerHotelsPage />
                  </RequireRole>
                </RequireAuth>
              }
            />

            <Route
              path="/admin/hotels"
              element={
                <RequireAuth>
                  <RequireRole role="ADMIN">
                    <AdminHotelsPage />
                  </RequireRole>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/assign"
              element={
                <RequireAuth>
                  <RequireRole role="ADMIN">
                    <AdminAssignManagerPage />
                  </RequireRole>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/create-manager"
              element={
                <RequireAuth>
                  <RequireRole role="ADMIN">
                    <AdminCreateManagerPage />
                  </RequireRole>
                </RequireAuth>
              }
            />
            <Route
              path="/housekeeping/dashboard"
              element={
                <RequireAuth>
                  <RequireRole role="STAFF">
                    <HousekeepingDashboardPage />
                  </RequireRole>
                </RequireAuth>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </AuthProvider>
    </BrowserRouter>
  )
}
