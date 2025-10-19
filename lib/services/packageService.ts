export interface CreatePackageData {
  carId?: string
  appliesTo: AppliesTo
  name: string
  description: string
  price: number
  features: string[]
  isActive?: boolean
  planType: 'lease' | 'finance'
  term: number
  rate: number
  downPayment: number
  mileage?: number
}
export type AppliesTo = {
  type: 'all' | 'model' | 'trim' | 'car'
  value?: string
}
// lib/services/packageService.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface CarPackage {
  id: string
  carId?: string
  appliesTo: AppliesTo
  name: string
  description: string
  price: number
  features: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  planType: 'lease' | 'finance'
  term: number
  rate: number
  downPayment: number
  mileage?: number
}

type FirestoreTimestamp = { toDate: () => Date }

// Raw shape from Firestore with some unknowns we normalize below
interface FirebasePackageRaw {
  carId?: string
  appliesTo?: AppliesTo
  name?: string
  description?: string
  price?: number
  features?: unknown
  isActive?: unknown
  createdAt?: FirestoreTimestamp | Date
  updatedAt?: FirestoreTimestamp | Date
  planType?: 'lease' | 'finance'
  term?: number
  rate?: number
  downPayment?: number
  mileage?: number
}

// Payload types for Firestore writes
type FirestoreCreatePackagePayload = {
  appliesTo: AppliesTo
  name: string
  description: string
  price: number
  features: string[]
  isActive: boolean
  planType: 'lease' | 'finance'
  term: number
  rate: number
  downPayment: number
  createdAt: ReturnType<typeof serverTimestamp>
  updatedAt: ReturnType<typeof serverTimestamp>
  carId?: string
  mileage?: number
}

type FirestoreUpdatePackagePayload =
  Partial<Omit<FirestoreCreatePackagePayload, 'createdAt'>> & {
    updatedAt: ReturnType<typeof serverTimestamp>
  }

export class PackageService {
  private static COLLECTION_NAME = 'carPackages'

  // Get all packages for a specific car
  static async getPackagesForCar(carId: string): Promise<CarPackage[]> {
    try {
      const packagesRef = collection(db, this.COLLECTION_NAME)
      const q = query(
        packagesRef,
        where('carId', '==', carId),
        where('isActive', '==', true)
      )
      const snapshot = await getDocs(q)

      return snapshot.docs.map(d => {
        const data = d.data() as FirebasePackageRaw
        return {
          id: d.id,
          ...data,
          appliesTo: data.appliesTo ?? { type: 'all' },
          features: Array.isArray(data.features)
            ? (data.features as string[])
            : [],
          isActive:
            typeof data.isActive === 'boolean'
              ? (data.isActive as boolean)
              : true,
          createdAt:
            data.createdAt &&
            typeof (data.createdAt as FirestoreTimestamp).toDate === 'function'
              ? (data.createdAt as FirestoreTimestamp).toDate()
              : (data.createdAt as Date) || new Date(),
          updatedAt:
            data.updatedAt &&
            typeof (data.updatedAt as FirestoreTimestamp).toDate === 'function'
              ? (data.updatedAt as FirestoreTimestamp).toDate()
              : (data.updatedAt as Date) || new Date()
        }
      }) as CarPackage[]
    } catch (error) {
      console.error('Error fetching packages for car:', error)
      return []
    }
  }

  static async getAllPackages(): Promise<CarPackage[]> {
    try {
      const packagesRef = collection(db, this.COLLECTION_NAME)
      const snapshot = await getDocs(packagesRef)

      return snapshot.docs.map(d => {
        const data = d.data() as FirebasePackageRaw
        return {
          id: d.id,
          ...data,
          appliesTo: data.appliesTo ?? { type: 'all' },
          features: Array.isArray(data.features)
            ? (data.features as string[])
            : [],
          isActive:
            typeof data.isActive === 'boolean'
              ? (data.isActive as boolean)
              : true,
          createdAt:
            data.createdAt &&
            typeof (data.createdAt as FirestoreTimestamp).toDate === 'function'
              ? (data.createdAt as FirestoreTimestamp).toDate()
              : (data.createdAt as Date) || new Date(),
          updatedAt:
            data.updatedAt &&
            typeof (data.updatedAt as FirestoreTimestamp).toDate === 'function'
              ? (data.updatedAt as FirestoreTimestamp).toDate()
              : (data.updatedAt as Date) || new Date()
        }
      }) as CarPackage[]
    } catch (error) {
      console.error('Error fetching all packages:', error)
      return []
    }
  }

  static async getPackageById(packageId: string): Promise<CarPackage | null> {
    try {
      const packageRef = doc(db, this.COLLECTION_NAME, packageId)
      const packageDoc = await getDoc(packageRef)

      if (!packageDoc.exists()) {
        return null
      }

      const data = packageDoc.data() as FirebasePackageRaw
      return {
        id: packageDoc.id,
        ...data,
        appliesTo: data.appliesTo ?? { type: 'all' },
        features: Array.isArray(data.features)
          ? (data.features as string[])
          : [],
        isActive:
          typeof data.isActive === 'boolean'
            ? (data.isActive as boolean)
            : true,
        createdAt:
          data.createdAt &&
          typeof (data.createdAt as FirestoreTimestamp).toDate === 'function'
            ? (data.createdAt as FirestoreTimestamp).toDate()
            : (data.createdAt as Date) || new Date(),
        updatedAt:
          data.updatedAt &&
          typeof (data.updatedAt as FirestoreTimestamp).toDate === 'function'
            ? (data.updatedAt as FirestoreTimestamp).toDate()
            : (data.updatedAt as Date) || new Date()
      } as CarPackage
    } catch (error) {
      console.error('Error fetching package:', error)
      return null
    }
  }

  static async createPackage(
    packageData: CreatePackageData
  ): Promise<string | null> {
    try {
      // Omit undefined fields to satisfy Firestore constraints
      const appliesToClean: AppliesTo =
        packageData.appliesTo.value === undefined
          ? { type: packageData.appliesTo.type }
          : {
              type: packageData.appliesTo.type,
              value: packageData.appliesTo.value
            }

      // Build payload explicitly to avoid undefined fields
      const newPackage: FirestoreCreatePackagePayload = {
        appliesTo: appliesToClean,
        name: packageData.name,
        description: packageData.description,
        price: packageData.price,
        features: Array.isArray(packageData.features)
          ? packageData.features
          : [],
        isActive: packageData.isActive ?? true,
        planType: packageData.planType,
        term: packageData.term,
        rate: packageData.rate,
        downPayment: packageData.downPayment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(packageData.carId ? { carId: packageData.carId } : {}),
        ...(packageData.mileage !== undefined
          ? { mileage: packageData.mileage }
          : {})
      }

      const docRef = await addDoc(
        collection(db, this.COLLECTION_NAME),
        newPackage
      )
      return docRef.id
    } catch (error) {
      console.error('Error creating package:', error)
      return null
    }
  }

  static async updatePackage(
    packageId: string,
    updates: Partial<CreatePackageData>
  ): Promise<boolean> {
    try {
      const packageRef = doc(db, this.COLLECTION_NAME, packageId)
      // Omit undefined fields and clean appliesTo.value if undefined
      const appliesToClean = updates.appliesTo
        ? updates.appliesTo.value === undefined
          ? { type: updates.appliesTo.type }
          : {
              type: updates.appliesTo.type,
              value: updates.appliesTo.value
            }
        : undefined

      // Build update payload explicitly, only include defined fields
      const updateData: FirestoreUpdatePackagePayload = {
        updatedAt: serverTimestamp()
      }
      if (appliesToClean) updateData.appliesTo = appliesToClean
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.description !== undefined)
        updateData.description = updates.description
      if (updates.price !== undefined) updateData.price = updates.price
      if (updates.features !== undefined) updateData.features = updates.features
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive
      if (updates.planType !== undefined) updateData.planType = updates.planType
      if (updates.term !== undefined) updateData.term = updates.term
      if (updates.rate !== undefined) updateData.rate = updates.rate
      if (updates.downPayment !== undefined)
        updateData.downPayment = updates.downPayment
      if (updates.mileage !== undefined) updateData.mileage = updates.mileage
      if (updates.carId !== undefined) updateData.carId = updates.carId

      await updateDoc(packageRef, updateData)
      return true
    } catch (error) {
      console.error('Error updating package:', error)
      return false
    }
  }

  static async deletePackage(packageId: string): Promise<boolean> {
    try {
      const packageRef = doc(db, this.COLLECTION_NAME, packageId)
      await updateDoc(packageRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Error deleting package:', error)
      return false
    }
  }

  static async permanentlyDeletePackage(packageId: string): Promise<boolean> {
    try {
      const packageRef = doc(db, this.COLLECTION_NAME, packageId)
      await deleteDoc(packageRef)
      return true
    } catch (error) {
      console.error('Error permanently deleting package:', error)
      return false
    }
  }

  static async seedPackages(): Promise<void> {
    try {
      const existingPackages = await this.getAllPackages()
      if (existingPackages.length > 0) {
        console.log('Packages already exist, skipping seeding')
        return
      }

      // 5 default packages for all vehicles
      const defaultPackages: CreatePackageData[] = [
        {
          appliesTo: { type: 'all' },
          name: 'Standard Finance',
          description: '60-month finance plan with competitive rate',
          price: 0,
          features: ['60 months', 'Competitive APR', 'No prepayment penalty'],
          planType: 'finance',
          term: 60,
          rate: 3.9,
          downPayment: 2000
        },
        {
          appliesTo: { type: 'all' },
          name: 'Short-Term Finance',
          description: '36-month finance plan for faster payoff',
          price: 0,
          features: ['36 months', 'Lower total interest', 'Flexible terms'],
          planType: 'finance',
          term: 36,
          rate: 3.5,
          downPayment: 3000
        },
        {
          appliesTo: { type: 'all' },
          name: 'Standard Lease',
          description: '36-month lease, 12,000 miles/year',
          price: 0,
          features: ['36 months', '12,000 miles/year', 'Low monthly payment'],
          planType: 'lease',
          term: 36,
          rate: 2.9,
          downPayment: 1500,
          mileage: 12000
        },
        {
          appliesTo: { type: 'all' },
          name: 'High Mileage Lease',
          description:
            '36-month lease, 15,000 miles/year for high-mileage drivers',
          price: 0,
          features: [
            '36 months',
            '15,000 miles/year',
            'Flexible return options'
          ],
          planType: 'lease',
          term: 36,
          rate: 3.1,
          downPayment: 1800,
          mileage: 15000
        },
        {
          appliesTo: { type: 'all' },
          name: 'Ultra Low Payment Lease',
          description: '24-month lease, lowest monthly payment',
          price: 0,
          features: [
            '24 months',
            '10,000 miles/year',
            'Lowest monthly payment'
          ],
          planType: 'lease',
          term: 24,
          rate: 2.5,
          downPayment: 1000,
          mileage: 10000
        }
      ]

      for (const packageData of defaultPackages) {
        await this.createPackage(packageData)
      }

      console.log('Successfully seeded default car packages')
    } catch (error) {
      console.error('Error seeding packages:', error)
    }
  }
}
