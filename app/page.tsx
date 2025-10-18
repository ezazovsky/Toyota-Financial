'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Car } from '@/types'
import CarCard from '@/components/CarCard'
import { LoadingCard } from '@/components/ui/loading-spinner'
import { ErrorState } from '@/components/ui/error-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Search, ArrowRight, Star, Shield, Award } from 'lucide-react'

export default function Home() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchNewestCars()
  }, [])

  const fetchNewestCars = async () => {
    try {
      // For demo purposes, create sample cars if none exist
      const carsRef = collection(db, 'cars')
      const q = query(carsRef, orderBy('createdAt', 'desc'), limit(6))
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        // Create sample cars for demo
        setCars(getSampleCars())
      } else {
        const carsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Car[]
        setCars(carsData)
      }
    } catch (error) {
      console.error('Error fetching cars:', error)
      setError('Failed to load vehicles. Please try again.')
      // Fallback to sample cars on error
      setCars(getSampleCars())
    } finally {
      setLoading(false)
    }
  }

  const getSampleCars = (): Car[] => [
    {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      trim: 'XLE',
      basePrice: 28900,
      images: ['/placeholder-car.svg'],
      specifications: {
        engine: '2.5L 4-Cylinder',
        transmission: 'Automatic',
        fuelType: 'Gasoline',
        mpg: { city: 28, highway: 39 },
        drivetrain: 'FWD',
        seating: 5,
        bodyStyle: 'Sedan'
      },
      isNew: true,
      createdAt: new Date(),
    },
    {
      id: '2',
      make: 'Toyota',
      model: 'RAV4',
      year: 2024,
      trim: 'Adventure',
      basePrice: 34500,
      images: ['/placeholder-car.svg'],
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
    {
      id: '3',
      make: 'Toyota',
      model: 'Prius',
      year: 2024,
      trim: 'LE',
      basePrice: 26400,
      images: ['/placeholder-car.svg'],
      specifications: {
        engine: '1.8L Hybrid',
        transmission: 'CVT',
        fuelType: 'Hybrid',
        mpg: { city: 58, highway: 53 },
        drivetrain: 'FWD',
        seating: 5,
        bodyStyle: 'Hatchback'
      },
      isNew: true,
      createdAt: new Date(),
    },
    {
      id: '4',
      make: 'Toyota',
      model: 'Highlander',
      year: 2024,
      trim: 'XLE',
      basePrice: 38420,
      images: ['/placeholder-car.svg'],
      specifications: {
        engine: '3.5L V6',
        transmission: '8-Speed Automatic',
        fuelType: 'Gasoline',
        mpg: { city: 21, highway: 29 },
        drivetrain: 'AWD',
        seating: 8,
        bodyStyle: 'SUV'
      },
      isNew: true,
      createdAt: new Date(),
    },
    {
      id: '5',
      make: 'Toyota',
      model: 'Corolla',
      year: 2024,
      trim: 'LE',
      basePrice: 23200,
      images: ['/placeholder-car.svg'],
      specifications: {
        engine: '2.0L 4-Cylinder',
        transmission: 'CVT',
        fuelType: 'Gasoline',
        mpg: { city: 32, highway: 41 },
        drivetrain: 'FWD',
        seating: 5,
        bodyStyle: 'Sedan'
      },
      isNew: true,
      createdAt: new Date(),
    },
    {
      id: '6',
      make: 'Toyota',
      model: 'Tacoma',
      year: 2024,
      trim: 'SR5',
      basePrice: 31895,
      images: ['/placeholder-car.svg'],
      specifications: {
        engine: '2.7L 4-Cylinder',
        transmission: '6-Speed Automatic',
        fuelType: 'Gasoline',
        mpg: { city: 20, highway: 23 },
        drivetrain: '4WD',
        seating: 5,
        bodyStyle: 'Pickup'
      },
      isNew: true,
      createdAt: new Date(),
    },
  ]

  const filteredCars = cars.filter(car => {
    const searchQuery = searchTerm.toLowerCase().trim()
    if (!searchQuery) return true
    
    const carText = `${car.make} ${car.model} ${car.trim} ${car.year} ${car.specifications.bodyStyle}`.toLowerCase()
    
    // Handle multi-word searches by splitting on spaces
    const searchWords = searchQuery.split(/\s+/)
    return searchWords.every(word => 
      carText.includes(word) || 
      car.make.toLowerCase().includes(word) ||
      car.model.toLowerCase().includes(word) ||
      car.trim.toLowerCase().includes(word)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Drive Your Dreams Today
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100">
              Flexible financing and leasing options for every budget
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vehicles">
                <Button size="lg" variant="outline" className="text-red-600 border-white bg-white hover:bg-gray-100">
                  Browse Vehicles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="ghost" className="text-white border-white hover:bg-red-800">
                Calculate Payment
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Rates</h3>
              <p className="text-gray-600">Competitive financing rates starting as low as 2.9% APR</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Service</h3>
              <p className="text-gray-600">Over 50 years of automotive financing experience</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Award Winning</h3>
              <p className="text-gray-600">Recognized for excellence in customer satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Cars Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Newest Vehicles
            </h2>
            <p className="text-lg text-gray-600">
              Discover our latest lineup of vehicles with competitive financing options
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="Unable to Load Vehicles"
              message={error}
              action={{
                label: "Retry",
                onClick: () => {
                  setError(null)
                  setLoading(true)
                  fetchNewestCars()
                }
              }}
            />
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? 'No vehicles found matching your search.' : 'No vehicles available at this time.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/vehicles">
              <Button size="lg">
                View All Vehicles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}