// lib/services/carService.ts
import { Car } from '@/types'

// Comprehensive Toyota model database with 2024-2025 lineup
export const TOYOTA_MODELS: Car[] = [
  // Sedans
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2024,
    trim: 'XLE',
    basePrice: 28900,
    images: [
      '/images/cars/camry-le-2024-1.jpg',
      '/images/cars/camry-le-2024-2.jpg',
      '/images/cars/camry-le-2024-3.jpg'
    ],
    specifications: {
      engine: '2.5L 4-Cylinder',
      transmission: '8-Speed Automatic',
      fuelType: 'Gasoline',
      mpg: { city: 32, highway: 41 },
      drivetrain: 'FWD',
      seating: 5,
      bodyStyle: 'Sedan'
    },
    packages: [
      {
        id: 'premium',
        name: 'Premium Package',
        description: 'Leather seats, sunroof, premium audio',
        price: 2500,
        features: ['Leather-appointed seating', 'Power moonroof', 'Premium JBL audio', 'Wireless charging']
      },
      {
        id: 'technology',
        name: 'Technology Package',
        description: 'Advanced safety and tech features',
        price: 1800,
        features: ['Adaptive cruise control', '10-inch touchscreen', 'Head-up display', 'Blind spot monitoring']
      }
    ],
    isNew: true,
    createdAt: new Date()
  },
  {
    id: '2',
    make: 'Toyota',
    model: 'RAV4',
    year: 2024,
    trim: 'Adventure',
    basePrice: 34500,
    images: [
      '/images/cars/rav4-adventure-2024-1.jpg',
      '/images/cars/rav4-adventure-2024-2.jpg'
    ],
    specifications: {
      engine: '2.5L 4-Cylinder',
      transmission: 'CVT',
      fuelType: 'Gasoline',
      mpg: { city: 27, highway: 35 },
      drivetrain: 'AWD',
      seating: 5,
      bodyStyle: 'SUV'
    },
    packages: [],
    isNew: true,
    createdAt: new Date()
  },
  {
    id: '3',
    make: 'Toyota',
    model: 'Prius',
    year: 2024,
    trim: 'LE',
    basePrice: 26400,
    images: ['/images/cars/prius-le-2024-1.jpg'],
    specifications: {
      engine: '1.8L Hybrid',
      transmission: 'CVT',
      fuelType: 'Hybrid',
      mpg: { city: 58, highway: 53 },
      drivetrain: 'FWD',
      seating: 5,
      bodyStyle: 'Hatchback'
    },
    packages: [],
    isNew: true,
    createdAt: new Date()
  },
  
  // Corolla Models
  {
    id: '4',
    make: 'Toyota',
    model: 'Highlander',
    year: 2024,
    trim: 'XLE',
    basePrice: 38420,
    images: ['/images/cars/highlander-xle-2024-1.jpg'],
    specifications: {
      engine: '3.5L V6',
      transmission: '8-Speed Automatic',
      fuelType: 'Gasoline',
      mpg: { city: 21, highway: 29 },
      drivetrain: 'AWD',
      seating: 8,
      bodyStyle: 'SUV'
    },
    packages: [],
    isNew: true,
    createdAt: new Date()
  },
  {
    id: '5',
    make: 'Toyota',
    model: 'Corolla',
    year: 2024,
    trim: 'LE',
    basePrice: 23200,
    images: ['/images/cars/corolla-le-2024-1.jpg'],
    specifications: {
      engine: '2.0L 4-Cylinder',
      transmission: 'CVT',
      fuelType: 'Gasoline',
      mpg: { city: 32, highway: 41 },
      drivetrain: 'FWD',
      seating: 5,
      bodyStyle: 'Sedan'
    },
    packages: [],
    isNew: true,
    createdAt: new Date()
  },

  // RAV4 Models
  {
    id: '6',
    make: 'Toyota',
    model: 'Tacoma',
    year: 2024,
    trim: 'SR5',
    basePrice: 31895,
    images: ['/images/cars/tacoma-sr5-2024-1.jpg'],
    specifications: {
      engine: '2.7L 4-Cylinder',
      transmission: '6-Speed Automatic',
      fuelType: 'Gasoline',
      mpg: { city: 20, highway: 23 },
      drivetrain: '4WD',
      seating: 5,
      bodyStyle: 'Pickup'
    },
    packages: [],
    isNew: true,
    createdAt: new Date()
  },
  {
    id: '7',
    make: 'Toyota',
    model: 'Sienna',
    year: 2024,
    trim: 'LE',
    basePrice: 36340,
    images: ['/images/cars/sienna-le-2024-1.jpg'],
    specifications: {
      engine: '2.5L Hybrid',
      transmission: 'CVT',
      fuelType: 'Hybrid',
      mpg: { city: 36, highway: 36 },
      drivetrain: 'AWD',
      seating: 8,
      bodyStyle: 'Minivan'
    },
    packages: [],
    isNew: true,
    createdAt: new Date()
  },
  {
    id: '8',
    make: 'Toyota',
    model: 'GR Supra',
    year: 2024,
    trim: '3.0',
    basePrice: 56545,
    images: ['/images/cars/gr-supra-2024-1.jpg'],
    specifications: {
      engine: '3.0L Turbo I6',
      transmission: '8-Speed Automatic',
      fuelType: 'Gasoline',
      mpg: { city: 22, highway: 30 },
      drivetrain: 'RWD',
      seating: 2,
      bodyStyle: 'Coupe'
    },
    packages: [],
    isNew: true,
    createdAt: new Date()
  }
]

export class CarService {
  // Get all available cars
  static getAllCars(): Car[] {
    return TOYOTA_MODELS
  }

  // Get car by ID
  static getCarById(carId: string): Car | null {
    return TOYOTA_MODELS.find(car => car.id === carId) || null
  }

  // Get cars by model
  static getCarsByModel(model: string): Car[] {
    return TOYOTA_MODELS.filter(car => 
      car.model.toLowerCase() === model.toLowerCase()
    )
  }

  // Get available models
  static getAvailableModels(): string[] {
    const models = [...new Set(TOYOTA_MODELS.map(car => car.model))]
    return models.sort()
  }

  // Get trims for a specific model
  static getTrimsForModel(model: string): string[] {
    const trims = TOYOTA_MODELS
      .filter(car => car.model.toLowerCase() === model.toLowerCase())
      .map(car => car.trim)
    return [...new Set(trims)].sort()
  }

  // Get cars by body style
  static getCarsByBodyStyle(bodyStyle: string): Car[] {
    return TOYOTA_MODELS.filter(car => 
      car.specifications.bodyStyle.toLowerCase() === bodyStyle.toLowerCase()
    )
  }

  // Calculate total price with packages
  static calculateTotalPrice(carId: string, packageIds: string[] = []): number {
    const car = this.getCarById(carId)
    if (!car) return 0

    let totalPrice = car.basePrice
    
    if (car.packages) {
      packageIds.forEach(packageId => {
        const carPackage = car.packages?.find(pkg => pkg.id === packageId)
        if (carPackage) {
          totalPrice += carPackage.price
        }
      })
    }

    return totalPrice
  }

  // Search cars by multiple criteria
  static searchCars(criteria: {
    model?: string
    minPrice?: number
    maxPrice?: number
    bodyStyle?: string
    fuelType?: string
    drivetrain?: string
  }): Car[] {
    return TOYOTA_MODELS.filter(car => {
      if (criteria.model && !car.model.toLowerCase().includes(criteria.model.toLowerCase())) {
        return false
      }
      if (criteria.minPrice && car.basePrice < criteria.minPrice) {
        return false
      }
      if (criteria.maxPrice && car.basePrice > criteria.maxPrice) {
        return false
      }
      if (criteria.bodyStyle && car.specifications.bodyStyle.toLowerCase() !== criteria.bodyStyle.toLowerCase()) {
        return false
      }
      if (criteria.fuelType && car.specifications.fuelType.toLowerCase() !== criteria.fuelType.toLowerCase()) {
        return false
      }
      if (criteria.drivetrain && car.specifications.drivetrain.toLowerCase() !== criteria.drivetrain.toLowerCase()) {
        return false
      }
      return true
    })
  }
}
