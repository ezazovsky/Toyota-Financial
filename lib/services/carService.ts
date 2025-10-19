// lib/services/carService.ts
import { Car } from '@/types'

// Comprehensive Toyota model database with 2024-2025 lineup
export const TOYOTA_MODELS: Car[] = [
  // Sedans
  {
    id: 'camry-le-2024',
    make: 'Toyota',
    model: 'Camry',
    year: 2024,
    trim: 'LE',
    basePrice: 26395,
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
        id: 'convenience',
        name: 'Convenience Package',
        description: 'Power moonroof, wireless charging',
        price: 1200,
        features: ['Power moonroof', 'Wireless phone charging', 'Remote start']
      }
    ],
    isNew: true,
    createdAt: new Date()
  },
  {
    id: 'camry-xle-2024',
    make: 'Toyota',
    model: 'Camry',
    year: 2024,
    trim: 'XLE',
    basePrice: 31395,
    images: [
      '/images/cars/camry-xle-2024-1.jpg',
      '/images/cars/camry-xle-2024-2.jpg'
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
        description: 'Leather seats, premium audio',
        price: 2500,
        features: ['Leather-trimmed seats', 'JBL Audio', 'Heated/ventilated seats']
      }
    ],
    isNew: true,
    createdAt: new Date()
  },
  {
    id: 'camry-trd-2024',
    make: 'Toyota',
    model: 'Camry',
    year: 2024,
    trim: 'TRD',
    basePrice: 35395,
    images: ['/images/cars/camry-trd-2024-1.jpg'],
    specifications: {
      engine: '3.5L V6',
      transmission: '8-Speed Automatic',
      fuelType: 'Gasoline',
      mpg: { city: 22, highway: 33 },
      drivetrain: 'FWD',
      seating: 5,
      bodyStyle: 'Sedan'
    },
    packages: [],
    isNew: true,
    createdAt: new Date()
  },
  
  // Corolla Models
  {
    id: 'corolla-le-2024',
    make: 'Toyota',
    model: 'Corolla',
    year: 2024,
    trim: 'LE',
    basePrice: 24295,
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
  {
    id: 'corolla-se-2024',
    make: 'Toyota',
    model: 'Corolla',
    year: 2024,
    trim: 'SE',
    basePrice: 25795,
    images: ['/images/cars/corolla-se-2024-1.jpg'],
    specifications: {
      engine: '2.0L 4-Cylinder',
      transmission: 'CVT',
      fuelType: 'Gasoline',
      mpg: { city: 31, highway: 40 },
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
    id: 'rav4-le-2024',
    make: 'Toyota',
    model: 'RAV4',
    year: 2024,
    trim: 'LE',
    basePrice: 29200,
    images: ['/images/cars/rav4-le-2024-1.jpg'],
    specifications: {
      engine: '2.5L 4-Cylinder',
      transmission: '8-Speed Automatic',
      fuelType: 'Gasoline',
      mpg: { city: 27, highway: 35 },
      drivetrain: 'AWD',
      seating: 5,
      bodyStyle: 'SUV'
    },
    packages: [
      {
        id: 'weather',
        name: 'Weather Package',
        description: 'All-weather floor mats and cargo tray',
        price: 300,
        features: ['All-weather floor mats', 'Cargo tray', 'Mud guards']
      }
    ],
    isNew: true,
    createdAt: new Date()
  },
  {
    id: 'rav4-xle-2024',
    make: 'Toyota',
    model: 'RAV4',
    year: 2024,
    trim: 'XLE',
    basePrice: 32200,
    images: ['/images/cars/rav4-xle-2024-1.jpg'],
    specifications: {
      engine: '2.5L 4-Cylinder',
      transmission: '8-Speed Automatic',
      fuelType: 'Gasoline',
      mpg: { city: 27, highway: 35 },
      drivetrain: 'AWD',
      seating: 5,
      bodyStyle: 'SUV'
    },
    packages: [
      {
        id: 'premium-rav4',
        name: 'Premium Package',
        description: 'Moonroof, wireless charging, premium audio',
        price: 1800,
        features: ['Power moonroof', 'Wireless charging', 'JBL Audio', 'Heated seats']
      }
    ],
    isNew: true,
    createdAt: new Date()
  },
  {
    id: 'rav4-hybrid-le-2024',
    make: 'Toyota',
    model: 'RAV4 Hybrid',
    year: 2024,
    trim: 'LE',
    basePrice: 32200,
    images: ['/images/cars/rav4-hybrid-le-2024-1.jpg'],
    specifications: {
      engine: '2.5L Hybrid',
      transmission: 'CVT',
      fuelType: 'Hybrid',
      mpg: { city: 41, highway: 38 },
      drivetrain: 'AWD',
      seating: 5,
      bodyStyle: 'SUV'
    },
    packages: [],
    isNew: true,
    createdAt: new Date()
  },

  // Prius Models
  {
    id: 'prius-le-2024',
    make: 'Toyota',
    model: 'Prius',
    year: 2024,
    trim: 'LE',
    basePrice: 28395,
    images: ['/images/cars/prius-le-2024-1.jpg'],
    specifications: {
      engine: '2.0L Hybrid',
      transmission: 'CVT',
      fuelType: 'Hybrid',
      mpg: { city: 54, highway: 50 },
      drivetrain: 'FWD',
      seating: 5,
      bodyStyle: 'Hatchback'
    },
    packages: [],
    isNew: true,
    createdAt: new Date()
  },

  // Highlander Models
  {
    id: 'highlander-le-2024',
    make: 'Toyota',
    model: 'Highlander',
    year: 2024,
    trim: 'LE',
    basePrice: 37395,
    images: ['/images/cars/highlander-le-2024-1.jpg'],
    specifications: {
      engine: '2.4L Turbo 4-Cylinder',
      transmission: '8-Speed Automatic',
      fuelType: 'Gasoline',
      mpg: { city: 24, highway: 32 },
      drivetrain: 'AWD',
      seating: 8,
      bodyStyle: 'SUV'
    },
    packages: [
      {
        id: 'family',
        name: 'Family Package',
        description: 'Third row seating enhancements',
        price: 800,
        features: ['Captain\'s chairs', 'Third row USB ports', 'Rear entertainment']
      }
    ],
    isNew: true,
    createdAt: new Date()
  },
  {
    id: 'highlander-xle-2024',
    make: 'Toyota',
    model: 'Highlander',
    year: 2024,
    trim: 'XLE',
    basePrice: 42395,
    images: ['/images/cars/highlander-xle-2024-1.jpg'],
    specifications: {
      engine: '2.4L Turbo 4-Cylinder',
      transmission: '8-Speed Automatic',
      fuelType: 'Gasoline',
      mpg: { city: 24, highway: 32 },
      drivetrain: 'AWD',
      seating: 8,
      bodyStyle: 'SUV'
    },
    packages: [],
    isNew: true,
    createdAt: new Date()
  },

  // 4Runner Models
  {
    id: '4runner-sr5-2024',
    make: 'Toyota',
    model: '4Runner',
    year: 2024,
    trim: 'SR5',
    basePrice: 40705,
    images: ['/images/cars/4runner-sr5-2024-1.jpg'],
    specifications: {
      engine: '4.0L V6',
      transmission: '5-Speed Automatic',
      fuelType: 'Gasoline',
      mpg: { city: 17, highway: 20 },
      drivetrain: '4WD',
      seating: 5,
      bodyStyle: 'SUV'
    },
    packages: [
      {
        id: 'offroad',
        name: 'Off-Road Package',
        description: 'Enhanced off-road capabilities',
        price: 2200,
        features: ['Crawl Control', 'Multi-terrain Select', 'Off-road tires']
      }
    ],
    isNew: true,
    createdAt: new Date()
  },

  // Tacoma Models
  {
    id: 'tacoma-sr-2024',
    make: 'Toyota',
    model: 'Tacoma',
    year: 2024,
    trim: 'SR',
    basePrice: 31895,
    images: ['/images/cars/tacoma-sr-2024-1.jpg'],
    specifications: {
      engine: '2.4L Turbo 4-Cylinder',
      transmission: '8-Speed Automatic',
      fuelType: 'Gasoline',
      mpg: { city: 22, highway: 26 },
      drivetrain: '4WD',
      seating: 5,
      bodyStyle: 'Truck'
    },
    packages: [],
    isNew: true,
    createdAt: new Date()
  },

  // Sienna Models
  {
    id: 'sienna-le-2024',
    make: 'Toyota',
    model: 'Sienna',
    year: 2024,
    trim: 'LE',
    basePrice: 37290,
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
    packages: [
      {
        id: 'convenience-sienna',
        name: 'Convenience Package',
        description: 'Enhanced comfort features',
        price: 1500,
        features: ['Power sliding doors', 'Power liftgate', 'Remote start']
      }
    ],
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
