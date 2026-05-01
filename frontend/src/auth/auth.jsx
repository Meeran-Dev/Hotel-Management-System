/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const LS_TOKEN = 'hms_token'
const LS_EMAIL = 'hms_email'
const LS_ROLE = 'hms_role'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(LS_TOKEN) || '')
  const [email, setEmail] = useState(() => localStorage.getItem(LS_EMAIL) || '')
  const [role, setRole] = useState(() => localStorage.getItem(LS_ROLE) || '')

  useEffect(() => {
    if (token) localStorage.setItem(LS_TOKEN, token)
    else localStorage.removeItem(LS_TOKEN)
  }, [token])

  useEffect(() => {
    if (email) localStorage.setItem(LS_EMAIL, email)
    else localStorage.removeItem(LS_EMAIL)
  }, [email])

  useEffect(() => {
    if (role) localStorage.setItem(LS_ROLE, role)
    else localStorage.removeItem(LS_ROLE)
  }, [role])

  const value = useMemo(
    () => ({
      token,
      email,
      role,
      setToken,
      setEmail,
      setRole,
      logout: () => {
        setToken('')
        setEmail('')
        setRole('')
      },
    }),
    [token, email, role],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

