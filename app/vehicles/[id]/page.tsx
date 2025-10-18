'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Car } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import FinanceCalculator from '@/components/FinanceCalculator'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Fuel, Gauge, Users, Settings, Car as CarIcon } from 'lucide-react'

export default function VehicleDetailPage() {
  const params = useParams()
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    fetchCar()
  }, [params.id])

  const fetchCar = async () => {
    try {
      // For demo, use sample data if Firebase document doesn't exist
      const carId = params.id as string
      const sampleCar = getSampleCarById(carId)
      
      if (sampleCar) {
        setCar(sampleCar)
      } else {
        const carDoc = await getDoc(doc(db, 'cars', carId))
        if (carDoc.exists()) {
          setCar({
            id: carDoc.id,
            ...carDoc.data(),
            createdAt: carDoc.data().createdAt?.toDate() || new Date(),
          } as Car)
        }
      }
    } catch (error) {
      console.error('Error fetching car:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSampleCarById = (id: string): Car | null => {
    const sampleCars: { [key: string]: Car } = {
      '1': {
        id: '1',
        make: 'Toyota',
        model: 'Camry',
        year: 2024,
        trim: 'XLE',
        basePrice: 28900,
        images: ['/cars/camry-2024.jpg', '/cars/camry-interior.jpg', '/cars/camry-side.jpg'],
        specifications: {
          engine: '2.5L 4-Cylinder',
          transmission: '8-Speed Automatic',
          fuelType: 'Gasoline',
          mpg: { city: 28, highway: 39 },
          drivetrain: 'FWD',
          seating: 5,
          bodyStyle: 'Sedan'
        },
        packages: [
          {
            id: 'p1',
            name: 'Premium Package',
            description: 'Leather seats, sunroof, premium audio',
            price: 2500,
            features: ['Leather-appointed seating', 'Power moonroof', 'Premium JBL audio', 'Wireless charging']
          },
          {
            id: 'p2',
            name: 'Technology Package',
            description: 'Advanced safety and tech features',
            price: 1800,
            features: ['Adaptive cruise control', '10-inch touchscreen', 'Head-up display', 'Blind spot monitoring']
          }
        ],
        isNew: true,
        createdAt: new Date(),
      },
      '2': {
        id: '2',
        make: 'Toyota',
        model: 'RAV4',
        year: 2024,
        trim: 'Adventure',
        basePrice: 34500,
        images: ['/cars/rav4-2024.jpg', '/cars/rav4-interior.jpg'],
        specifications: {
          engine: '2.5L 4-Cylinder',
          transmission: 'CVT',
          fuelType: 'Gasoline',
          mpg: { city: 27, highway: 35 },
          drivetrain: 'AWD',
          seating: 5,
          bodyStyle: 'SUV'
        },
        isNew: true,
        createdAt: new Date(),
      },
      // Add more sample cars...
    }
    
    return sampleCars[id] || null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Not Found</h1>
          <Link href="/vehicles">
            <Button>Back to Vehicles</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/vehicles" className="inline-flex items-center text-red-600 hover:text-red-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vehicles
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vehicle Images and Info */}
          <div>
            {/* Main Image */}
            <div className="relative h-96 mb-4 bg-gray-200 rounded-lg overflow-hidden">
              <Image
                src={car.images[selectedImage] || '/placeholder-car.svg'}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-car.svg';
                }}
              />
            </div>

            {/* Thumbnail Images */}
            {car.images.length > 1 && (
              <div className="flex space-x-2 mb-6">
                {car.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 w-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-red-600' : 'border-gray-300'
                    }`}
                  >
                    <Image
                      src={image || '/placeholder-car.svg'}
                      alt={`View ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-car.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Vehicle Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {car.year} {car.make} {car.model} {car.trim}
                </CardTitle>
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrency(car.basePrice)}
                </div>
              </CardHeader>
              <CardContent>
                {/* Specifications */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Gauge className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">{car.specifications.engine}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">{car.specifications.transmission}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Fuel className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">{car.specifications.mpg.city}/{car.specifications.mpg.highway} MPG</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">{car.specifications.seating} seats</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CarIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">{car.specifications.drivetrain}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Body:</span>
                    <span className="text-sm">{car.specifications.bodyStyle}</span>
                  </div>
                </div>

                {/* Packages */}
                {car.packages && car.packages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Available Packages</h3>
                    <div className="space-y-3">
                      {car.packages.map((pkg) => (
                        <div key={pkg.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{pkg.name}</h4>
                            <span className="text-red-600 font-semibold">
                              +{formatCurrency(pkg.price)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                          <ul className="text-xs text-gray-500 space-y-1">
                            {pkg.features.map((feature, index) => (
                              <li key={index}>• {feature}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Finance Calculator */}
          <div>
            <FinanceCalculator vehiclePrice={car.basePrice} />
            
            <div className="mt-6 space-y-4">
              <Link href={`/vehicles/${car.id}/finance`} className="block">
                <Button size="lg" className="w-full">
                  Get Pre-Approved
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full">
                Schedule Test Drive
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
