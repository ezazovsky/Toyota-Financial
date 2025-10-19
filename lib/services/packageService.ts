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
  carId: string
  name: string
  description: string
  price: number
  features: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreatePackageData {
  carId: string
  name: string
  description: string
  price: number
  features: string[]
  isActive?: boolean
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
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as CarPackage[]
    } catch (error) {
      console.error('Error fetching packages for car:', error)
      return []
    }
  }

  static async getAllPackages(): Promise<CarPackage[]> {
    try {
      const packagesRef = collection(db, this.COLLECTION_NAME)
      const snapshot = await getDocs(packagesRef)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as CarPackage[]
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

      const data = packageDoc.data()
      return {
        id: packageDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as CarPackage
    } catch (error) {
      console.error('Error fetching package:', error)
      return null
    }
  }

  static async createPackage(packageData: CreatePackageData): Promise<string | null> {
    try {
      const newPackage = {
        ...packageData,
        isActive: packageData.isActive ?? true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), newPackage)
      return docRef.id
    } catch (error) {
      console.error('Error creating package:', error)
      return null
    }
  }

  static async updatePackage(packageId: string, updates: Partial<CreatePackageData>): Promise<boolean> {
    try {
      const packageRef = doc(db, this.COLLECTION_NAME, packageId)
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      }

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

      const camryPackages: CreatePackageData[] = [
        {
          carId: '1',
          name: 'Premium Package',
          description: 'Leather seats, sunroof, premium audio',
          price: 2500,
          features: [
            'Leather-appointed seating',
            'Power moonroof',
            'Premium JBL audio',
            'Wireless charging'
          ]
        },
        {
          carId: '1',
          name: 'Technology Package',
          description: 'Advanced safety and tech features',
          price: 1800,
          features: [
            'Adaptive cruise control',
            '10-inch touchscreen',
            'Head-up display',
            'Blind spot monitoring'
          ]
        }
      ]

      for (const packageData of camryPackages) {
        await this.createPackage(packageData)
      }

      console.log('Successfully seeded car packages')
    } catch (error) {
      console.error('Error seeding packages:', error)
    }
  }
}
