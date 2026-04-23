import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/auth.jsx'
import { AppShell } from './components/AppShell.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { CustomerBrowsePage } from './pages/customer/CustomerBrowsePage.jsx'
import { ManagerHotelsPage } from './pages/manager/ManagerHotelsPage.jsx'
import { ManagerRoomsPage } from './pages/manager/ManagerRoomsPage.jsx'
import { AdminHotelsPage } from './pages/admin/AdminHotelsPage.jsx'
import { AdminAssignManagerPage } from './pages/admin/AdminAssignManagerPage.jsx'
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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/:portal" element={<LoginPage />} />

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
              path="/manager/hotels/:hotelId/rooms"
              element={
                <RequireAuth>
                  <RequireRole role="MANAGER">
                    <ManagerRoomsPage />
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
              path="/housekeeping/dashboard"
              element={
                <RequireAuth>
                  <RequireRole role="HOUSEKEEPING">
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
