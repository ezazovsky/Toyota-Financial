// types/index.ts

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin' | 'dealer'
  createdAt: Date
  updatedAt: Date
}

export interface Car {
  id: string
  make: string
  model: string
  year: number
  trim: string
  basePrice: number
  images: string[]
  specifications: {
    engine: string
    transmission: string
    fuelType: string
    mpg: {
      city: number
      highway: number
    }
    drivetrain: string
    seating: number
    bodyStyle: string
  }
  packages?: CarPackage[]
  isNew: boolean
  createdAt: Date
}

export interface CarPackage {
  id: string
  name: string
  description: string
  price: number
  features: string[]
}

export interface FinanceRequest {
  id: string
  userId: string
  carId: string
  dealershipId: string
  financeType: 'lease' | 'finance'
  creditScore: number
  annualIncome: number
  termLength: number // months
  annualMileage?: number // for leases
  downPayment: number
  monthlyPayment?: number
  status: 'pending' | 'approved' | 'rejected' | 'counter-offer' | 'accepted'
  dealerNotes?: string
  createdAt: Date
  updatedAt: Date
  offers: Offer[]
}

export interface Offer {
  id: string
  financeRequestId: string
  dealerUserId: string
  monthlyPayment: number
  downPayment: number
  termLength: number
  interestRate: number
  totalCost: number
  status: 'active' | 'expired' | 'accepted' | 'rejected'
  notes?: string
  validUntil: Date
  createdAt: Date
}

export interface Dealership {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  website?: string
  adminUserId: string
  createdAt: Date
}

export interface FinanceCalculation {
  monthlyPayment: number
  totalCost: number
  totalInterest: number
  downPayment: number
  termLength: number
  interestRate: number
}
