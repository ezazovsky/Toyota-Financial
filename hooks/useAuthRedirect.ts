'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Custom hook that redirects to login if user is not authenticated
 * @param redirectTo - Optional path to redirect to (defaults to '/login')
 */
export function useAuthRedirect(redirectTo: string = '/login') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  return { user, loading, isAuthenticated: !!user }
}
