'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fullFinanceApplicationSchema, FullFinanceApplicationForm } from '@/lib/validation/financeSchemas'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CarService } from '@/lib/services/carService'
import { FinanceService } from '@/lib/services/financeService'
import { EnhancedLoading } from '@/components/ui/enhanced-loading'
import { Car, FinanceRequest } from '@/types'
import { 
  Car as CarIcon, 
  DollarSign, 
  FileText, 
  Calendar,
  CreditCard,
  MapPin,
  Check,
  Loader2
} from 'lucide-react'

export default function ReviewPage() {
  const { user } = useAuthRedirect()
  const router = useRouter()
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(fullFinanceApplicationSchema),
    defaultValues: {
      financeType: 'finance' as const,
      creditScore: 720,
      termLength: 60,
      downPayment: 5000,
      dealershipId: 'default-dealership'
    }
  })

  const financeType = watch('financeType')
  const carId = watch('carId')

  useEffect(() => {
    if (carId) {
      const car = CarService.getCarById(carId)
      setSelectedCar(car)
    }
  }, [carId])

  const availableCars = CarService.getAllCars()

  const onSubmit = async (data: FullFinanceApplicationForm) => {
    if (!user || !selectedCar) {
      toast.error('Please make sure you are logged in and have selected a vehicle')
      return
    }

    setIsSubmitting(true)

    try {
      const financeRequest: Omit<FinanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'offers'> = {
        userId: user.id,
        carId: data.carId,
        dealershipId: data.dealershipId,
        financeType: data.financeType,
        creditScore: data.creditScore,
        annualIncome: data.annualIncome,
        termLength: data.termLength,
        downPayment: data.downPayment,
        monthlyPayment: data.monthlyPayment,
        annualMileage: data.annualMileage,
        status: 'pending'
      }

      const requestId = await FinanceService.createFinanceRequest(financeRequest)
      
      toast.success('Finance application submitted successfully!')
      router.push(`/user/dashboard?applicationId=${requestId}`)
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Error submitting application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { title: 'Vehicle Selection', icon: CarIcon },
    { title: 'Finance Details', icon: DollarSign },
    { title: 'Personal Info', icon: FileText },
    { title: 'Review & Submit', icon: Check }
  ]

  if (!user) {
    return <EnhancedLoading message="Verifying authentication..." />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            
            return (
              <div key={step.title} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white shadow-lg transform scale-105' 
                    : isActive 
                    ? 'bg-red-600 border-red-600 text-white shadow-lg animate-pulse' 
                    : 'border-gray-300 text-gray-400 hover:border-gray-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-red-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Vehicle Selection */}
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CarIcon className="w-6 h-6 mr-2" />
                Select Your Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a Toyota Vehicle
                </label>
                <select
                  {...register('carId')}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select a vehicle...</option>
                  {availableCars.map(car => (
                    <option key={car.id} value={car.id}>
                      {car.year} {car.make} {car.model} {car.trim} - ${car.basePrice.toLocaleString()}
                    </option>
                  ))}
                </select>
                {errors.carId && (
                  <p className="text-red-600 text-sm mt-1">{errors.carId.message}</p>
                )}
              </div>

              {selectedCar && (
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-16 bg-gray-300 rounded-md flex items-center justify-center">
                      <CarIcon className="w-8 h-8 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {selectedCar.year} {selectedCar.make} {selectedCar.model} {selectedCar.trim}
                      </h3>
                      <p className="text-gray-600">{selectedCar.specifications.engine} • {selectedCar.specifications.transmission}</p>
                      <p className="text-gray-600">
                        {selectedCar.specifications.mpg.city}/{selectedCar.specifications.mpg.highway} MPG (city/hwy)
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        ${selectedCar.basePrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={() => setCurrentStep(1)} 
                  disabled={!carId}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Next: Finance Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Finance Details */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-6 h-6 mr-2" />
                Finance Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Finance Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="finance"
                        {...register('financeType')}
                        className="mr-2"
                      />
                      <span>Finance (Buy)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="lease"
                        {...register('financeType')}
                        className="mr-2"
                      />
                      <span>Lease</span>
                    </label>
                  </div>
                  {errors.financeType && (
                    <p className="text-red-600 text-sm mt-1">{errors.financeType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Down Payment
                  </label>
                  <Input
                    type="number"
                    {...register('downPayment', { valueAsNumber: true })}
                    placeholder="5000"
                    className="focus:ring-red-500 focus:border-red-500"
                  />
                  {errors.downPayment && (
                    <p className="text-red-600 text-sm mt-1">{errors.downPayment.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Term Length (months)
                  </label>
                  <select
                    {...register('termLength', { valueAsNumber: true })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    {financeType === 'lease' ? (
                      <>
                        <option value={24}>24 months</option>
                        <option value={36}>36 months</option>
                        <option value={48}>48 months</option>
                      </>
                    ) : (
                      <>
                        <option value={36}>36 months</option>
                        <option value={48}>48 months</option>
                        <option value={60}>60 months</option>
                        <option value={72}>72 months</option>
                        <option value={84}>84 months</option>
                      </>
                    )}
                  </select>
                  {errors.termLength && (
                    <p className="text-red-600 text-sm mt-1">{errors.termLength.message}</p>
                  )}
                </div>

                {financeType === 'lease' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Mileage
                    </label>
                    <select
                      {...register('annualMileage', { valueAsNumber: true })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value={10000}>10,000 miles</option>
                      <option value={12000}>12,000 miles</option>
                      <option value={15000}>15,000 miles</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentStep(0)}
                >
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setCurrentStep(2)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Next: Personal Info
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Information */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-6 h-6 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Score (Estimated)
                  </label>
                  <Input
                    type="number"
                    {...register('creditScore', { valueAsNumber: true })}
                    placeholder="720"
                    min="300"
                    max="850"
                    className="focus:ring-red-500 focus:border-red-500"
                  />
                  {errors.creditScore && (
                    <p className="text-red-600 text-sm mt-1">{errors.creditScore.message}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    This is an estimate and will be verified during approval
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Income
                  </label>
                  <Input
                    type="number"
                    {...register('annualIncome', { valueAsNumber: true })}
                    placeholder="75000"
                    className="focus:ring-red-500 focus:border-red-500"
                  />
                  {errors.annualIncome && (
                    <p className="text-red-600 text-sm mt-1">{errors.annualIncome.message}</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Privacy Notice</h4>
                <p className="text-blue-800 text-sm">
                  Your personal information will be used to process your finance application. 
                  We protect your data with industry-standard security measures and will never 
                  share your information without your consent.
                </p>
              </div>

              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setCurrentStep(3)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Review Application
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review and Submit */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Check className="w-6 h-6 mr-2" />
                Review & Submit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">Application Summary</h3>
                
                {selectedCar && (
                  <div className="border-b pb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Vehicle</h4>
                    <p className="text-gray-700">
                      {selectedCar.year} {selectedCar.make} {selectedCar.model} {selectedCar.trim}
                    </p>
                    <p className="text-lg font-semibold text-red-600">
                      ${selectedCar.basePrice.toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Finance Details</h4>
                    <p className="text-gray-700">Type: {financeType === 'finance' ? 'Finance (Buy)' : 'Lease'}</p>
                    <p className="text-gray-700">Down Payment: ${watch('downPayment')?.toLocaleString()}</p>
                    <p className="text-gray-700">Term: {watch('termLength')} months</p>
                    {financeType === 'lease' && (
                      <p className="text-gray-700">Annual Mileage: {watch('annualMileage')?.toLocaleString()}</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                    <p className="text-gray-700">Name: {user.name}</p>
                    <p className="text-gray-700">Email: {user.email}</p>
                    <p className="text-gray-700">Credit Score: {watch('creditScore')}</p>
                    <p className="text-gray-700">Annual Income: ${watch('annualIncome')?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Next Steps</h4>
                <p className="text-yellow-800 text-sm">
                  After submitting your application, our finance team will review it and get back to you 
                  within 24 hours. You'll receive updates via email and can check the status in your dashboard.
                </p>
              </div>

              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentStep(2)}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  )
}
