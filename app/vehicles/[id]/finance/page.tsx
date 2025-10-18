'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Car, FinanceRequest, Dealership, FinanceCalculation } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import FinanceCalculator from '@/components/FinanceCalculator'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, Mail } from 'lucide-react'

const financeSchema = z.object({
  creditScore: z.number().min(300).max(850),
  annualIncome: z.number().min(10000),
  termLength: z.number().min(12).max(84),
  annualMileage: z.number().optional(),
  downPayment: z.number().min(0),
  dealershipId: z.string().min(1, 'Please select a dealership'),
  financeType: z.enum(['lease', 'finance']),
})

type FinanceForm = z.infer<typeof financeSchema>

export default function FinanceApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [car, setCar] = useState<Car | null>(null)
  const [dealerships, setDealerships] = useState<Dealership[]>([])
  const [calculation, setCalculation] = useState<FinanceCalculation | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FinanceForm>({
    resolver: zodResolver(financeSchema),
    defaultValues: {
      creditScore: 700,
      annualIncome: 60000,
      termLength: 60,
      annualMileage: 12000,
      downPayment: 5000,
      financeType: 'finance',
    },
  })

  useEffect(() => {
    fetchData()
  }, [params.id])

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const fetchData = async () => {
    try {
      // Fetch car data (using sample data for demo)
      const carId = params.id as string
      const sampleCar = getSampleCarById(carId)
      setCar(sampleCar)

      // Fetch dealerships (using sample data for demo)
      setDealerships(getSampleDealerships())
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error loading data')
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
        images: ['/cars/camry-2024.jpg'],
        specifications: {
          engine: '2.5L 4-Cylinder',
          transmission: '8-Speed Automatic',
          fuelType: 'Gasoline',
          mpg: { city: 28, highway: 39 },
          drivetrain: 'FWD',
          seating: 5,
          bodyStyle: 'Sedan'
        },
        isNew: true,
        createdAt: new Date(),
      },
      // Add more sample cars as needed
    }
    
    return sampleCars[id] || null
  }

  const getSampleDealerships = (): Dealership[] => [
    {
      id: '1',
      name: 'Downtown Toyota',
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      phone: '(512) 555-0123',
      email: 'sales@downtowntoyota.com',
      adminUserId: 'dealer1',
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'North Austin Toyota',
      address: '456 North Loop',
      city: 'Austin',
      state: 'TX',
      zipCode: '78756',
      phone: '(512) 555-0456',
      email: 'sales@northaustintoyota.com',
      adminUserId: 'dealer2',
      createdAt: new Date(),
    },
    {
      id: '3',
      name: 'South Toyota Center',
      address: '789 South Blvd',
      city: 'Austin',
      state: 'TX',
      zipCode: '78745',
      phone: '(512) 555-0789',
      email: 'info@southtoyota.com',
      adminUserId: 'dealer3',
      createdAt: new Date(),
    },
  ]

  const onSubmit = async (data: FinanceForm) => {
    if (!user || !car || !calculation) return

    try {
      setSubmitting(true)

      const financeRequest: Omit<FinanceRequest, 'id'> = {
        userId: user.id,
        carId: car.id,
        dealershipId: data.dealershipId,
        financeType: data.financeType,
        creditScore: data.creditScore,
        annualIncome: data.annualIncome,
        termLength: data.termLength,
        annualMileage: data.annualMileage,
        downPayment: data.downPayment,
        monthlyPayment: calculation.monthlyPayment,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        offers: [],
      }

      await addDoc(collection(db, 'financeRequests'), {
        ...financeRequest,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      toast.success('Finance application submitted successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Error submitting application')
    } finally {
      setSubmitting(false)
    }
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
          <Link href={`/vehicles/${car.id}`} className="inline-flex items-center text-red-600 hover:text-red-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vehicle Details
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finance Application
          </h1>
          <p className="text-lg text-gray-600">
            {car.year} {car.make} {car.model} {car.trim} - {formatCurrency(car.basePrice)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Finance Calculator */}
          <div>
            <FinanceCalculator
              vehiclePrice={car.basePrice}
              onCalculationChange={(calc) => {
                setCalculation(calc)
                setValue('creditScore', 700) // You can sync these values
                setValue('downPayment', calc.downPayment)
                setValue('termLength', calc.termLength)
              }}
            />
          </div>

          {/* Application Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Finance Type
                      </label>
                      <select
                        {...register('financeType')}
                        className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        <option value="finance">Finance</option>
                        <option value="lease">Lease</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Credit Score
                      </label>
                      <Input
                        type="number"
                        {...register('creditScore', { valueAsNumber: true })}
                        placeholder="700"
                      />
                      {errors.creditScore && (
                        <p className="text-red-600 text-sm">{errors.creditScore.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Income
                    </label>
                    <Input
                      type="number"
                      {...register('annualIncome', { valueAsNumber: true })}
                      placeholder="60000"
                    />
                    {errors.annualIncome && (
                      <p className="text-red-600 text-sm">{errors.annualIncome.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Down Payment
                      </label>
                      <Input
                        type="number"
                        {...register('downPayment', { valueAsNumber: true })}
                        placeholder="5000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Term Length (months)
                      </label>
                      <select
                        {...register('termLength', { valueAsNumber: true })}
                        className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        <option value={24}>24 months</option>
                        <option value={36}>36 months</option>
                        <option value={48}>48 months</option>
                        <option value={60}>60 months</option>
                        <option value={72}>72 months</option>
                      </select>
                    </div>
                  </div>

                  {watch('financeType') === 'lease' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Annual Mileage
                      </label>
                      <Input
                        type="number"
                        {...register('annualMileage', { valueAsNumber: true })}
                        placeholder="12000"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Dealership
                    </label>
                    <select
                      {...register('dealershipId')}
                      className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="">Choose a dealership...</option>
                      {dealerships.map((dealer) => (
                        <option key={dealer.id} value={dealer.id}>
                          {dealer.name}
                        </option>
                      ))}
                    </select>
                    {errors.dealershipId && (
                      <p className="text-red-600 text-sm">{errors.dealershipId.message}</p>
                    )}
                  </div>

                  {calculation && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Estimated Payment</h4>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(calculation.monthlyPayment)}/month
                      </div>
                      <p className="text-sm text-blue-700">
                        Based on your inputs. Final terms may vary.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting || !calculation}
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Dealership Info */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Available Dealerships</h3>
              <div className="space-y-3">
                {dealerships.map((dealer) => (
                  <Card key={dealer.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{dealer.name}</h4>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {dealer.address}, {dealer.city}, {dealer.state} {dealer.zipCode}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Phone className="h-4 w-4 mr-1" />
                          {dealer.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Mail className="h-4 w-4 mr-1" />
                          {dealer.email}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
