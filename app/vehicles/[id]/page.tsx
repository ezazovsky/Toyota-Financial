'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useCar } from '@/hooks/useCar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import UnifiedFinanceCalculator from '@/components/UnifiedFinanceCalculator'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Fuel,
  Gauge,
  Users,
  Settings,
  Car as CarIcon
} from 'lucide-react'

export default function VehicleDetailPage() {
  const params = useParams()
  const { car, loading } = useCar(params.id as string)
  const [selectedImage, setSelectedImage] = useState(0)

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-32 w-32 animate-spin rounded-full border-b-2 border-red-600'></div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <h1 className='mb-4 text-2xl font-bold text-gray-900'>
            Vehicle Not Found
          </h1>
          <Link href='/vehicles'>
            <Button>Back to Vehicles</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='border-b bg-white'>
        <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
          <Link
            href='/vehicles'
            className='inline-flex items-center text-red-600 hover:text-red-700'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Vehicles
          </Link>
        </div>
      </div>

      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          {/* Vehicle Images and Info */}
          <div>
            {/* Main Image */}
            <div className='relative mb-4 h-96 overflow-hidden rounded-lg bg-gray-200'>
              <Image
                src={car.images[selectedImage]}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className='object-cover'
                onError={e => {
                  const target = e.target as HTMLImageElement
                  target.src = '/cars/supra.png'
                }}
              />
            </div>

            {/* Thumbnail Images */}
            {car.images.length > 1 && (
              <div className='mb-6 flex space-x-2'>
                {car.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 ${
                      selectedImage === index
                        ? 'border-red-600'
                        : 'border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`View ${index + 1}`}
                      fill
                      className='object-cover'
                      onError={e => {
                        const target = e.target as HTMLImageElement
                        target.src = '/cars/supra.png'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Vehicle Info */}
            <Card>
              <CardHeader>
                <CardTitle className='text-2xl'>
                  {car.year} {car.make} {car.model} {car.trim}
                </CardTitle>
                <div className='text-3xl font-bold text-red-600'>
                  {formatCurrency(car.basePrice)}
                </div>
              </CardHeader>
              <CardContent>
                {/* Specifications */}
                <div className='mb-6 grid grid-cols-2 gap-4'>
                  <div className='flex items-center space-x-2'>
                    <Gauge className='h-5 w-5 text-gray-500' />
                    <span className='text-sm'>{car.specifications.engine}</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Settings className='h-5 w-5 text-gray-500' />
                    <span className='text-sm'>
                      {car.specifications.transmission}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Fuel className='h-5 w-5 text-gray-500' />
                    <span className='text-sm'>
                      {car.specifications.mpg.city}/
                      {car.specifications.mpg.highway} MPG
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Users className='h-5 w-5 text-gray-500' />
                    <span className='text-sm'>
                      {car.specifications.seating} seats
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <CarIcon className='h-5 w-5 text-gray-500' />
                    <span className='text-sm'>
                      {car.specifications.drivetrain}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm font-medium'>Body:</span>
                    <span className='text-sm'>
                      {car.specifications.bodyStyle}
                    </span>
                  </div>
                </div>

                {/* Packages */}
                {car.packages && car.packages.length > 0 && (
                  <div>
                    <h3 className='mb-3 text-lg font-semibold'>
                      Available Packages
                    </h3>
                    <div className='space-y-3'>
                      {car.packages.map(pkg => (
                        <div
                          key={pkg.id}
                          className='rounded-lg border border-gray-200 p-4'
                        >
                          <div className='mb-2 flex items-start justify-between'>
                            <h4 className='font-medium'>{pkg.name}</h4>
                            <span className='font-semibold text-red-600'>
                              +{formatCurrency(pkg.price)}
                            </span>
                          </div>
                          <p className='mb-2 text-sm text-gray-600'>
                            {pkg.description}
                          </p>
                          <ul className='space-y-1 text-xs text-gray-500'>
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
            <UnifiedFinanceCalculator vehiclePrice={car.basePrice} />

            <div className='mt-6 space-y-4'>
              <Link href={`/vehicles/${car.id}/finance`} className='block'>
                <Button size='lg' className='w-full'>
                  Get Pre-Approved
                </Button>
              </Link>
              <Button size='lg' variant='outline' className='w-full'>
                Schedule Test Drive
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
