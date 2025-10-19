'use client'
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { User } from 'firebase/auth'
import { watchAuth } from '../../firebase/client'

type Role = 'user' | 'admin' | null

type AuthContextType = {
  user: User | null
  role: Role
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true
})

// For demo: map emails to roles. In production, store in Firestore custom claims.
const DEMO_USER_EMAIL =
  process.env.NEXT_PUBLIC_DEMO_USER_EMAIL || 'user@example.com'
const DEMO_ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || 'admin@example.com'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = watchAuth(u => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const role: Role = useMemo(() => {
    if (!user?.email) return null
    if (user.email === DEMO_ADMIN_EMAIL) return 'admin'
    if (user.email === DEMO_USER_EMAIL) return 'user'
    return 'user' // default
  }, [user])

  const value = useMemo(() => ({ user, role, loading }), [user, role, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
