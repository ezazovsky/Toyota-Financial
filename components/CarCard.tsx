// components/CarCard.tsx
'use client'

import { Car } from '@/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { Fuel, Gauge, Users } from 'lucide-react'

interface CarCardProps {
  car: Car
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <Card className='overflow-hidden transition-shadow hover:shadow-lg'>
      <div className='relative h-48 w-full'>
        <Image
          src={car.images[0]}
          alt={`${car.year} ${car.make} ${car.model}`}
          fill
          className='object-cover'
          onError={e => {
            const target = e.target as HTMLImageElement
            target.src = '/cars/supra.png'
          }}
        />
        {car.isNew && (
          <div className='absolute top-2 left-2 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white'>
            NEW
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className='text-lg'>
          {car.year} {car.make} {car.model}
        </CardTitle>
        <CardDescription className='text-sm text-gray-600'>
          {car.trim}
        </CardDescription>
        <div className='text-2xl font-bold text-red-600'>
          {formatCurrency(car.basePrice)}
        </div>
      </CardHeader>

      <CardContent>
        <div className='mb-4 flex items-center justify-between text-sm text-gray-600'>
          <div className='flex items-center space-x-1'>
            <Fuel className='h-4 w-4' />
            <span>
              {car.specifications.mpg.city}/{car.specifications.mpg.highway} MPG
            </span>
          </div>
          <div className='flex items-center space-x-1'>
            <Gauge className='h-4 w-4' />
            <span>{car.specifications.engine}</span>
          </div>
          <div className='flex items-center space-x-1'>
            <Users className='h-4 w-4' />
            <span>{car.specifications.seating} seats</span>
          </div>
        </div>

        <div className='flex space-x-2'>
          <Link href={`/vehicles/${car.id}`} className='flex-1'>
            <Button className='w-full' variant='outline'>
              View Details
            </Button>
          </Link>
          <Link href={`/vehicles/${car.id}/finance`} className='flex-1'>
            <Button className='w-full'>Get Quote</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
