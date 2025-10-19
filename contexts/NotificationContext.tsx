// contexts/NotificationContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { FinanceService } from '@/lib/services/financeService'
import { FinanceRequest } from '@/types'
import toast from 'react-hot-toast'

interface NotificationContextType {
  hasUnreadNotifications: boolean
  markAllAsRead: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth()
  const [previousRequests, setPreviousRequests] = useState<FinanceRequest[]>([])
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false)

  useEffect(() => {
    if (!user || user.role === 'admin') return

    // Subscribe to user's finance requests for real-time notifications
    const unsubscribe = FinanceService.subscribeToUserFinanceRequests(
      user.id,
      (requests) => {
        if (previousRequests.length > 0) {
          // Check for status changes
          requests.forEach((request) => {
            const previousRequest = previousRequests.find(prev => prev.id === request.id)
            
            if (previousRequest && previousRequest.status !== request.status) {
              // Status changed - show notification
              showStatusChangeNotification(request, previousRequest.status)
              setHasUnreadNotifications(true)
            }
          })
        }
        
        setPreviousRequests(requests)
      }
    )

    return () => unsubscribe()
  }, [user, previousRequests])

  const showStatusChangeNotification = (request: FinanceRequest, previousStatus: string) => {
    const getStatusMessage = (status: string) => {
      switch (status) {
        case 'approved':
          return {
            message: 'Your finance application has been approved! 🎉',
            type: 'success' as const
          }
        case 'rejected':
          return {
            message: 'Your finance application was not approved. Please contact us for more information.',
            type: 'error' as const
          }
        case 'counter-offer':
          return {
            message: 'You have received a new counter offer! Check your dashboard to review.',
            type: 'info' as const
          }
        case 'accepted':
          return {
            message: 'Your offer has been accepted! We will contact you with next steps.',
            type: 'success' as const
          }
        default:
          return {
            message: `Your application status has been updated to: ${status}`,
            type: 'info' as const
          }
      }
    }

    const { message, type } = getStatusMessage(request.status)

    if (type === 'success') {
      toast.success(message, {
        duration: 6000,
        icon: '🎉',
      })
    } else if (type === 'error') {
      toast.error(message, {
        duration: 6000,
      })
    } else {
      toast(message, {
        duration: 6000,
        icon: '📢',
      })
    }
  }

  const markAllAsRead = () => {
    setHasUnreadNotifications(false)
  }

  const value = {
    hasUnreadNotifications,
    markAllAsRead
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
