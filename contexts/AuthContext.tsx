// contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { User } from '@/types'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role?: 'user' | 'admin' | 'dealer') => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
  isDealer: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)
      
      if (firebaseUser) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || firebaseUser.displayName || '',
              role: userData.role || 'user',
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
            })
          } else {
            // Create user document if it doesn't exist
            const newUser: Omit<User, 'id'> = {
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              role: 'user',
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              ...newUser,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
            
            setUser({ ...newUser, id: firebaseUser.uid })
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          toast.error('Error loading user data')
        }
      } else {
        setUser(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Logged in successfully!')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string, role: 'user' | 'admin' | 'dealer' = 'user') => {
    try {
      setLoading(true)
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, { displayName: name })
      
      // Create user document in Firestore
      const userData = {
        email,
        name,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData)
      
      toast.success('Account created successfully!')
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Registration failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setFirebaseUser(null)
      toast.success('Logged out successfully!')
    } catch (error: any) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
      throw error
    }
  }

  const value = {
    user,
    firebaseUser,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
    isDealer: user?.role === 'dealer',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
