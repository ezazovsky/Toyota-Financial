// components/admin/PackageManager.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  PackageService,
  CarPackage,
  CreatePackageData
} from '@/lib/services/packageService'
import { CarService } from '@/lib/services/carService'
import { useAllPackages } from '@/hooks/useCarPackages'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import type { Car } from '@/types'
import toast from 'react-hot-toast'
import {
  Plus,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Car as CarIcon
} from 'lucide-react'

interface PackageFormData {
  carId?: string
  appliesToType: 'all' | 'model' | 'trim' | 'car'
  appliesToValue?: string
  name: string
  description: string
  price: number
  features: string
  planType: 'lease' | 'finance'
  term: number
  rate: number
  downPayment: number
  mileage?: number
}

export default function PackageManager() {
  const { packages, loading, refetch } = useAllPackages()
  const [cars, setCars] = useState<Car[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingPackage, setEditingPackage] = useState<CarPackage | null>(null)
  const [selectedCarId, setSelectedCarId] = useState<string>('')

  const {
    watch,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<PackageFormData>()

  // watch values extracted for hooks dependency safety
  const appliesToType = watch('appliesToType') || 'all'
  const watchedCarId = watch('carId')
  const watchedAppliesToValue = watch('appliesToValue')

  useEffect(() => {
    const allCars = CarService.getAllCars()
    setCars(allCars)
  }, [])

  useEffect(() => {
    if (editingPackage) {
      setValue('carId', editingPackage.carId)
      setValue('appliesToType', editingPackage.appliesTo?.type || 'all')
      setValue('appliesToValue', editingPackage.appliesTo?.value || '')
      setValue('name', editingPackage.name)
      setValue('description', editingPackage.description)
      setValue('price', editingPackage.price)
  setValue('features', (editingPackage.features ?? []).join('\n'))
      setValue('planType', editingPackage.planType)
      setValue('term', editingPackage.term)
      setValue('rate', editingPackage.rate)
      setValue('downPayment', editingPackage.downPayment)
      setValue('mileage', editingPackage.mileage ?? 12000)
    } else {
      // Only set default price when creating
      let defaultPrice = 0
      if (appliesToType === 'car') {
        const car = cars.find(c => c.id === watchedCarId)
        if (car) defaultPrice = car.basePrice
      } else if (appliesToType === 'model') {
        const car = cars.find(c => c.model === watchedAppliesToValue)
        if (car) defaultPrice = car.basePrice
      } else if (appliesToType === 'trim') {
        const car = cars.find(c => c.trim === watchedAppliesToValue)
        if (car) defaultPrice = car.basePrice
      }
      if (defaultPrice > 0) setValue('price', defaultPrice)
    }
  }, [
    editingPackage,
    setValue,
    cars,
    // watched values extracted above for lint friendliness
    appliesToType,
    watchedCarId,
    watchedAppliesToValue
  ])

  const onSubmit = async (data: PackageFormData) => {
    try {
      const packageData: CreatePackageData = {
        carId: data.appliesToType === 'car' ? data.carId : undefined,
        appliesTo: {
          type: data.appliesToType,
          value: data.appliesToType !== 'all' ? data.appliesToValue : undefined
        },
        name: data.name,
        description: data.description,
        price: data.price,
        features: data.features.split('\n').filter(f => f.trim() !== ''),
        planType: data.planType,
        term: Number(data.term),
        rate: Number(data.rate),
        downPayment: Number(data.downPayment),
        mileage: data.planType === 'lease' ? Number(data.mileage) : undefined
      }

      if (editingPackage) {
        const success = await PackageService.updatePackage(
          editingPackage.id,
          packageData
        )
        if (success) {
          toast.success('Package updated successfully')
          setEditingPackage(null)
        } else {
          toast.error('Failed to update package')
          return
        }
      } else {
        const packageId = await PackageService.createPackage(packageData)
        if (packageId) {
          toast.success('Package created successfully')
          setIsCreating(false)
        } else {
          toast.error('Failed to create package')
          return
        }
      }

      reset()
      refetch()
    } catch (error) {
      console.error('Error saving package:', error)
      toast.error('Failed to save package')
    }
  }

  const handleDelete = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return

    try {
      const success = await PackageService.deletePackage(packageId)
      if (success) {
        toast.success('Package deleted successfully')
        refetch()
      } else {
        toast.error('Failed to delete package')
      }
    } catch (error) {
      console.error('Error deleting package:', error)
      toast.error('Failed to delete package')
    }
  }

  const handleEdit = (pkg: CarPackage) => {
    setEditingPackage(pkg)
    setIsCreating(true)
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingPackage(null)
    reset()
  }

  const getCarName = (carId: string) => {
    const car = cars.find(c => c.id === carId)
    return car
      ? `${car.year} ${car.make} ${car.model} ${car.trim}`
      : 'Unknown Car'
  }

  // Show all packages that apply to the selected car, or all if no filter
  const filteredPackages = selectedCarId
    ? packages.filter(pkg => {
        if (!pkg.appliesTo) return false
        if (pkg.appliesTo.type === 'all') return true
        if (
          pkg.appliesTo.type === 'car' &&
          pkg.appliesTo.value === selectedCarId
        )
          return true
        // Find car for model/trim match
        const car = cars.find(c => c.id === selectedCarId)
        if (!car) return false
        if (pkg.appliesTo.type === 'model' && pkg.appliesTo.value === car.model)
          return true
        if (pkg.appliesTo.type === 'trim' && pkg.appliesTo.value === car.trim)
          return true
        return false
      })
    : packages

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-red-600'></div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Package Management
          </h2>
          <p className='text-gray-600'>Manage car packages and options</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Add Package
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-end gap-4'>
            <div className='flex-1'>
              <label className='mb-1 block text-sm font-medium text-gray-700'>
                Filter by Car
              </label>
              <select
                value={selectedCarId}
                onChange={e => setSelectedCarId(e.target.value)}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none'
              >
                <option value=''>All Cars</option>
                {cars.map(car => (
                  <option key={car.id} value={car.id}>
                    {car.year} {car.make} {car.model} {car.trim}
                  </option>
                ))}
              </select>
            </div>
            {selectedCarId && (
              <Button variant='outline' onClick={() => setSelectedCarId('')}>
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPackage ? 'Edit Package' : 'Create New Package'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Applies To *
                  </label>
                  <select
                    {...register('appliesToType', {
                      required: 'Please select what this plan applies to'
                    })}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none'
                  >
                    <option value='all'>All Vehicles</option>
                    <option value='model'>Model</option>
                    <option value='trim'>Trim</option>
                    <option value='car'>Specific Car</option>
                  </select>
                  {errors.appliesToType && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.appliesToType.message}
                    </p>
                  )}
                </div>
                {/* Show value input if not 'all' */}
                {(watch('appliesToType') || 'all') !== 'all' && (
                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700'>
                      Value *
                    </label>
                    <Input
                      {...register('appliesToValue', {
                        required: 'Please specify the value for this type'
                      })}
                      placeholder={
                        watch('appliesToType') === 'model'
                          ? 'e.g. Camry'
                          : watch('appliesToType') === 'trim'
                            ? 'e.g. XSE'
                            : watch('appliesToType') === 'car'
                              ? 'Car ID'
                              : ''
                      }
                    />
                    {errors.appliesToValue && (
                      <p className='mt-1 text-sm text-red-600'>
                        {errors.appliesToValue.message}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Car *
                  </label>
                  {watch('appliesToType') === 'all' ? (
                    <select
                      disabled
                      className='w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500'
                    >
                      <option>All Vehicles</option>
                    </select>
                  ) : (
                    <select
                      {...register('carId', {
                        required: 'Please select a car'
                      })}
                      className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none'
                    >
                      <option value=''>Select a car...</option>
                      {cars.map(car => (
                        <option key={car.id} value={car.id}>
                          {car.year} {car.make} {car.model} {car.trim}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.carId && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.carId.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Package Name *
                  </label>
                  <Input
                    {...register('name', {
                      required: 'Package name is required'
                    })}
                    placeholder='e.g., Premium Package'
                  />
                  {errors.name && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Plan Type *
                  </label>
                  <select
                    {...register('planType', {
                      required: 'Please select a plan type'
                    })}
                    className='w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none'
                  >
                    <option value=''>Select plan type...</option>
                    <option value='finance'>Finance</option>
                    <option value='lease'>Lease</option>
                  </select>
                  {errors.planType && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.planType.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Term (months) *
                  </label>
                  <Input
                    type='number'
                    {...register('term', {
                      required: 'Term is required',
                      min: { value: 1, message: 'Term must be positive' }
                    })}
                    placeholder='36'
                  />
                  {errors.term && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.term.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Interest Rate (%) *
                  </label>
                  <Input
                    type='number'
                    step='0.01'
                    {...register('rate', {
                      required: 'Rate is required',
                      min: { value: 0, message: 'Rate must be non-negative' }
                    })}
                    placeholder='3.5'
                  />
                  {errors.rate && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.rate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Down Payment *
                  </label>
                  <Input
                    type='number'
                    {...register('downPayment', {
                      required: 'Down payment is required',
                      min: {
                        value: 0,
                        message: 'Down payment must be non-negative'
                      }
                    })}
                    placeholder='2000'
                  />
                  {errors.downPayment && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.downPayment.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Annual Mileage (lease only)
                  </label>
                  <Input
                    type='number'
                    {...register('mileage', { valueAsNumber: true })}
                    placeholder='12000'
                    disabled={false}
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Description *
                  </label>
                  <Input
                    {...register('description', {
                      required: 'Description is required'
                    })}
                    placeholder='Brief description of the package'
                  />
                  {errors.description && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.description.message}
                    </p>
                  )}
                </div>
                <div className='md:col-span-2'>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Price *
                  </label>
                  <Input
                    type='number'
                    step='1'
                    {...register('price', {
                      required: 'Price is required',
                      min: { value: 0, message: 'Price must be positive' }
                    })}
                    placeholder='2500'
                  />
                  {errors.price && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.price.message}
                    </p>
                  )}
                </div>
              </div>
              <div className='flex gap-2'>
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Saving...'
                    : editingPackage
                      ? 'Update Package'
                      : 'Create Package'}
                </Button>
                <Button type='button' variant='outline' onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Packages List */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {filteredPackages.map(pkg => (
          <Card key={pkg.id}>
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div>
                  <CardTitle className='text-lg'>{pkg.name}</CardTitle>
                  <div className='mt-1 flex items-center gap-2 text-sm text-gray-600'>
                    <CarIcon className='h-4 w-4' />
                    {pkg.appliesTo && pkg.appliesTo.type === 'all' && (
                      <span className='font-semibold text-blue-700'>
                        All Vehicles
                      </span>
                    )}
                    {pkg.appliesTo && pkg.appliesTo.type === 'model' && (
                      <span>
                        Model:{' '}
                        <span className='font-semibold'>
                          {pkg.appliesTo.value}
                        </span>
                      </span>
                    )}
                    {pkg.appliesTo && pkg.appliesTo.type === 'trim' && (
                      <span>
                        Trim:{' '}
                        <span className='font-semibold'>
                          {pkg.appliesTo.value}
                        </span>
                      </span>
                    )}
                    {pkg.appliesTo && pkg.appliesTo.type === 'car' && (
                      <span>
                        Car:{' '}
                        <span className='font-semibold'>
                          {getCarName(pkg.appliesTo.value || '')}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <div className='flex gap-1'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleEdit(pkg)}
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleDelete(pkg.id)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className='mb-3 text-sm text-gray-600'>{pkg.description}</p>

              <div className='mb-3 flex items-center gap-2'>
                <DollarSign className='h-4 w-4 text-green-600' />
                <span className='font-semibold text-green-600'>
                  {formatCurrency(pkg.price)}
                </span>
              </div>

              <div>
                <h4 className='mb-2 text-sm font-medium'>Features:</h4>
                <ul className='space-y-1'>
                  {(pkg.features ?? []).map((feature, index) => (
                    <li key={index} className='text-xs text-gray-600'>
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className='mt-3 flex items-center gap-2 border-t pt-3'>
                <Badge variant={pkg.isActive ? 'default' : 'secondary'}>
                  {pkg.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <Card>
          <CardContent className='py-8 text-center'>
            <Package className='mx-auto mb-4 h-12 w-12 text-gray-400' />
            <h3 className='mb-2 text-lg font-medium text-gray-900'>
              No packages found
            </h3>
            <p className='mb-4 text-gray-600'>
              {selectedCarId
                ? 'No packages found for the selected car.'
                : 'No packages have been created yet.'}
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Create First Package
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
