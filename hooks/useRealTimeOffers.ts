// hooks/useRealTimeOffers.ts
import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { FinanceRequest, Offer } from '@/types'

export function useRealTimeOffers(userId: string) {
  const [financeRequests, setFinanceRequests] = useState<FinanceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Set up real-time listener for finance requests
    const financeRequestsQuery = query(
      collection(db, 'financeRequests'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      financeRequestsQuery,
      (snapshot) => {
        const requests = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as FinanceRequest
        })

        // For each request, listen to offers
        requests.forEach(request => {
          const offersQuery = query(
            collection(db, 'offers'),
            where('financeRequestId', '==', request.id),
            orderBy('createdAt', 'desc')
          )

          onSnapshot(offersQuery, (offersSnapshot) => {
            const offers = offersSnapshot.docs.map(doc => {
              const data = doc.data()
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                validUntil: data.validUntil?.toDate() || new Date(),
              } as Offer
            })

            // Update the request with its offers
            setFinanceRequests(prev =>
              prev.map(req =>
                req.id === request.id
                  ? { ...req, offers }
                  : req
              )
            )
          })
        })

        setFinanceRequests(requests)
        setLoading(false)
      },
      (error) => {
        console.error('Error listening to finance requests:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  return { financeRequests, loading }
}

// For admin/dealer real-time updates
export function useRealTimeAdminOffers() {
  const [financeRequests, setFinanceRequests] = useState<FinanceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen to all finance requests for admin
    const financeRequestsQuery = query(
      collection(db, 'financeRequests'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      financeRequestsQuery,
      (snapshot) => {
        const requests = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as FinanceRequest
        })

        // Listen to all offers
        const offersQuery = query(
          collection(db, 'offers'),
          orderBy('createdAt', 'desc')
        )

        onSnapshot(offersQuery, (offersSnapshot) => {
          const allOffers = offersSnapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              validUntil: data.validUntil?.toDate() || new Date(),
            } as Offer
          })

          // Group offers by finance request
          const requestsWithOffers = requests.map(request => ({
            ...request,
            offers: allOffers.filter(offer => offer.financeRequestId === request.id)
          }))

          setFinanceRequests(requestsWithOffers)
        })

        setLoading(false)
      },
      (error) => {
        console.error('Error listening to admin finance requests:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { financeRequests, loading }
}

// Real-time notifications hook
export function useRealTimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!userId) return

    // Listen to offer updates for notifications
    const offersQuery = query(
      collection(db, 'offers'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(offersQuery, (snapshot) => {
      const newNotifications: any[] = []
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const offer = change.doc.data() as Offer
          
          // Check if this offer is for the current user
          // You'd need to cross-reference with finance requests
          newNotifications.push({
            id: change.doc.id,
            type: 'new_offer',
            message: 'You have received a new offer',
            createdAt: offer.createdAt,
            read: false,
          })
        }
        
        if (change.type === 'modified') {
          const offer = change.doc.data() as Offer
          
          newNotifications.push({
            id: change.doc.id,
            type: 'offer_updated',
            message: 'Your offer has been updated',
            createdAt: offer.createdAt,
            read: false,
          })
        }
      })

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev])
        setUnreadCount(prev => prev + newNotifications.length)
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          newNotifications.forEach(notification => {
            new Notification('Toyota Finance Update', {
              body: notification.message,
              icon: '/favicon.ico'
            })
          })
        }
      }
    })

    return () => unsubscribe()
  }, [userId])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
    setUnreadCount(0)
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
}
