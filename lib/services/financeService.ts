// lib/services/financeService.ts
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { FinanceRequest, Offer } from '@/types'

const FINANCE_REQUESTS_COLLECTION = 'financeRequests'
const OFFERS_COLLECTION = 'offers'

export class FinanceService {
  // Create a new finance request
  static async createFinanceRequest(request: Omit<FinanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'offers'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, FINANCE_REQUESTS_COLLECTION), {
        ...request,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating finance request:', error)
      throw error
    }
  }

  // Get all finance requests for admin dashboard
  static subscribeToFinanceRequests(callback: (requests: FinanceRequest[]) => void) {
    const q = query(
      collection(db, FINANCE_REQUESTS_COLLECTION),
      orderBy('createdAt', 'desc')
    )

    return onSnapshot(q, (snapshot) => {
      const requests: FinanceRequest[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        requests.push({
          id: doc.id,
          userId: data.userId,
          carId: data.carId,
          dealershipId: data.dealershipId,
          financeType: data.financeType,
          creditScore: data.creditScore,
          annualIncome: data.annualIncome,
          termLength: data.termLength,
          annualMileage: data.annualMileage,
          downPayment: data.downPayment,
          monthlyPayment: data.monthlyPayment,
          status: data.status,
          dealerNotes: data.dealerNotes,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          offers: [] // Will be loaded separately
        })
      })
      callback(requests)
    })
  }

  // Get finance requests for a specific user
  static subscribeToUserFinanceRequests(userId: string, callback: (requests: FinanceRequest[]) => void) {
    // Use simple where query and sort on client side to avoid needing composite index
    const q = query(
      collection(db, FINANCE_REQUESTS_COLLECTION),
      where('userId', '==', userId)
    )

    return onSnapshot(q, (snapshot) => {
      const requests: FinanceRequest[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        requests.push({
          id: doc.id,
          userId: data.userId,
          carId: data.carId,
          dealershipId: data.dealershipId,
          financeType: data.financeType,
          creditScore: data.creditScore,
          annualIncome: data.annualIncome,
          termLength: data.termLength,
          annualMileage: data.annualMileage,
          downPayment: data.downPayment,
          monthlyPayment: data.monthlyPayment,
          status: data.status,
          dealerNotes: data.dealerNotes,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          offers: [] // Will be loaded separately
        })
      })
      
      // Sort by createdAt on the client side (newest first)
      requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      callback(requests)
    })
  }

  // Update finance request status
  static async updateFinanceRequestStatus(
    requestId: string, 
    status: FinanceRequest['status'], 
    dealerNotes?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
      }
      
      if (dealerNotes) {
        updateData.dealerNotes = dealerNotes
      }

      await updateDoc(doc(db, FINANCE_REQUESTS_COLLECTION, requestId), updateData)
    } catch (error) {
      console.error('Error updating finance request status:', error)
      throw error
    }
  }

  // Create a counter offer
  static async createOffer(offer: Omit<Offer, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, OFFERS_COLLECTION), {
        ...offer,
        createdAt: serverTimestamp(),
      })
      
      // Update the finance request status to 'counter-offer'
      await this.updateFinanceRequestStatus(offer.financeRequestId, 'counter-offer')
      
      return docRef.id
    } catch (error) {
      console.error('Error creating offer:', error)
      throw error
    }
  }

  // Get offers for a finance request
  static subscribeToOffers(financeRequestId: string, callback: (offers: Offer[]) => void) {
    const q = query(
      collection(db, OFFERS_COLLECTION),
      where('financeRequestId', '==', financeRequestId),
      orderBy('createdAt', 'desc')
    )

    return onSnapshot(q, (snapshot) => {
      const offers: Offer[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        offers.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          validUntil: data.validUntil?.toDate() || new Date(),
        } as Offer)
      })
      callback(offers)
    })
  }

  // Get all offers for multiple finance requests (for admin)
  static subscribeToAllOffers(callback: (offers: { [requestId: string]: Offer[] }) => void) {
    const q = query(collection(db, OFFERS_COLLECTION), orderBy('createdAt', 'desc'))

    return onSnapshot(q, (snapshot) => {
      const offersByRequest: { [requestId: string]: Offer[] } = {}
      
      snapshot.forEach((doc) => {
        const data = doc.data()
        const offer: Offer = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          validUntil: data.validUntil?.toDate() || new Date(),
        } as Offer

        if (!offersByRequest[offer.financeRequestId]) {
          offersByRequest[offer.financeRequestId] = []
        }
        offersByRequest[offer.financeRequestId].push(offer)
      })
      
      callback(offersByRequest)
    })
  }

  // Update offer status (accept/reject)
  static async updateOfferStatus(offerId: string, status: Offer['status']): Promise<void> {
    try {
      await updateDoc(doc(db, OFFERS_COLLECTION, offerId), {
        status,
        updatedAt: serverTimestamp(),
      })

      // If offer is accepted, update finance request status
      if (status === 'accepted') {
        const offerDoc = await getDoc(doc(db, OFFERS_COLLECTION, offerId))
        if (offerDoc.exists()) {
          const offerData = offerDoc.data()
          await this.updateFinanceRequestStatus(offerData.financeRequestId, 'accepted')
        }
      }
    } catch (error) {
      console.error('Error updating offer status:', error)
      throw error
    }
  }

  // Get a single finance request by ID
  static async getFinanceRequest(requestId: string): Promise<FinanceRequest | null> {
    try {
      const docSnap = await getDoc(doc(db, FINANCE_REQUESTS_COLLECTION, requestId))
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          userId: data.userId,
          carId: data.carId,
          dealershipId: data.dealershipId,
          financeType: data.financeType,
          creditScore: data.creditScore,
          annualIncome: data.annualIncome,
          termLength: data.termLength,
          annualMileage: data.annualMileage,
          downPayment: data.downPayment,
          monthlyPayment: data.monthlyPayment,
          status: data.status,
          dealerNotes: data.dealerNotes,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          offers: [] // Load separately if needed
        }
      }
      return null
    } catch (error) {
      console.error('Error getting finance request:', error)
      throw error
    }
  }
}
