// components/admin/PackageManager.tsx
'use client'

import { useState, useEffect } from 'react'
import { PackageService, CarPackage, CreatePackageData } from '@/lib/services/packageService'
import { CarService } from '@/lib/services/carService'
import { useAllPackages } from '@/hooks/useCarPackages'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { useForm } from 'react-hook-form'
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
  carId: string
  name: string
  description: string
  price: number
  features: string
}

export default function PackageManager() {
  const { packages, loading, refetch } = useAllPackages()
  const [cars, setCars] = useState<any[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingPackage, setEditingPackage] = useState<CarPackage | null>(null)
  const [selectedCarId, setSelectedCarId] = useState<string>('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<PackageFormData>()

  useEffect(() => {
    const allCars = CarService.getAllCars()
    setCars(allCars)
  }, [])

  useEffect(() => {
    if (editingPackage) {
      setValue('carId', editingPackage.carId)
      setValue('name', editingPackage.name)
      setValue('description', editingPackage.description)
      setValue('price', editingPackage.price)
      setValue('features', editingPackage.features.join('\n'))
    }
  }, [editingPackage, setValue])

  const onSubmit = async (data: PackageFormData) => {
    try {
      const packageData: CreatePackageData = {
        carId: data.carId,
        name: data.name,
        description: data.description,
        price: data.price,
        features: data.features.split('\n').filter(f => f.trim() !== '')
      }

      if (editingPackage) {
        const success = await PackageService.updatePackage(editingPackage.id, packageData)
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
    return car ? `${car.year} ${car.make} ${car.model} ${car.trim}` : 'Unknown Car'
  }

  const filteredPackages = selectedCarId 
    ? packages.filter(pkg => pkg.carId === selectedCarId)
    : packages

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Package Management</h2>
          <p className="text-gray-600">Manage car packages and options</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Package
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Car
              </label>
              <select
                value={selectedCarId}
                onChange={(e) => setSelectedCarId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Cars</option>
                {cars.map(car => (
                  <option key={car.id} value={car.id}>
                    {car.year} {car.make} {car.model} {car.trim}
                  </option>
                ))}
              </select>
            </div>
            {selectedCarId && (
              <Button
                variant="outline"
                onClick={() => setSelectedCarId('')}
              >
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Car *
                  </label>
                  <select
                    {...register('carId', { required: 'Please select a car' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select a car...</option>
                    {cars.map(car => (
                      <option key={car.id} value={car.id}>
                        {car.year} {car.make} {car.model} {car.trim}
                      </option>
                    ))}
                  </select>
                  {errors.carId && (
                    <p className="text-red-600 text-sm mt-1">{errors.carId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Name *
                  </label>
                  <Input
                    {...register('name', { required: 'Package name is required' })}
                    placeholder="e.g., Premium Package"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <Input
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Brief description of the package"
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <Input
                  type="number"
                  step="1"
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  placeholder="2500"
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Features (one per line) *
                </label>
                <textarea
                  {...register('features', { required: 'At least one feature is required' })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Leather-appointed seating
Power moonroof
Premium JBL audio
Wireless charging"
                />
                {errors.features && (
                  <p className="text-red-600 text-sm mt-1">{errors.features.message}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingPackage ? 'Update Package' : 'Create Package')}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Packages List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map(pkg => (
          <Card key={pkg.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <CarIcon className="h-4 w-4" />
                    {getCarName(pkg.carId)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(pkg)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(pkg.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-600">
                  {formatCurrency(pkg.price)}
                </span>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Features:</h4>
                <ul className="space-y-1">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="text-xs text-gray-600">
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <Badge variant={pkg.isActive ? "default" : "secondary"}>
                  {pkg.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
            <p className="text-gray-600 mb-4">
              {selectedCarId 
                ? 'No packages found for the selected car.' 
                : 'No packages have been created yet.'
              }
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Package
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
