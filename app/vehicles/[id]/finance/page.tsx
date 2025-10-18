'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Car, FinanceRequest, Dealership, FinanceCalculation } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import UnifiedFinanceCalculator from '@/components/UnifiedFinanceCalculator'
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
        images: ['/placeholder-car.svg'],
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
          {/* Unified Finance Calculator & Form */}
          <div>
            <UnifiedFinanceCalculator
              vehiclePrice={car.basePrice}
              onValuesChange={(values) => {
                setCalculation(values.calculation)
                // Sync all values with the form
                setValue('financeType', values.financeType)
                setValue('creditScore', values.creditScore)
                setValue('annualIncome', values.annualIncome)
                setValue('downPayment', values.downPayment)
                setValue('termLength', values.termLength)
                if (values.annualMileage) {
                  setValue('annualMileage', values.annualMileage)
                }
              }}
            />
          </div>

          {/* Application Submission */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Application</CardTitle>
                <CardDescription>
                  Select a dealership to complete your finance application. All calculation details will be automatically included.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Dealership *
                    </label>
                    <select
                      {...register('dealershipId')}
                      className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="">Choose a dealership...</option>
                      {dealerships.map((dealer) => (
                        <option key={dealer.id} value={dealer.id}>
                          {dealer.name} - {dealer.city}, {dealer.state}
                        </option>
                      ))}
                    </select>
                    {errors.dealershipId && (
                      <p className="text-red-600 text-sm">{errors.dealershipId.message}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Choose your preferred dealership for this application
                    </div>
                  </div>

                  {calculation && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Application Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm text-green-800 mb-3">
                        <div>
                          <span className="font-medium">Monthly Payment:</span>
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(calculation.monthlyPayment)}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Finance Type:</span>
                          <div className="capitalize font-semibold">{watch('financeType')}</div>
                        </div>
                        <div>
                          <span className="font-medium">Credit Score:</span>
                          <div className="font-semibold">{watch('creditScore')}</div>
                        </div>
                        <div>
                          <span className="font-medium">Down Payment:</span>
                          <div className="font-semibold">{formatCurrency(watch('downPayment') || 0)}</div>
                        </div>
                      </div>
                      <p className="text-xs text-green-700">
                        Ready to submit your application with the details above.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting || !calculation || !watch('dealershipId')}
                  >
                    {submitting ? 'Submitting Application...' : 'Submit Finance Application'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Dealership Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Available Dealerships</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dealerships.slice(0, 2).map((dealer) => (
                    <div key={dealer.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
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
                        </div>
                      </div>
                    </div>
                  ))}
                  {dealerships.length > 2 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{dealerships.length - 2} more available in the dropdown
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>


        </div>
      </div>
    </div>
  )
}
