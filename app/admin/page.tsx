'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { FinanceRequest, Offer, User, Car } from '@/types'
import { FinanceService } from '@/lib/services/financeService'
import { CarService } from '@/lib/services/carService'
import { EnhancedLoading } from '@/components/ui/enhanced-loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { 
  Users, 
  Car as CarIcon, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Edit,
  Plus
} from 'lucide-react'

interface OfferForm {
  monthlyPayment: number
  downPayment: number
  termLength: number
  interestRate: number
  notes: string
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [financeRequests, setFinanceRequests] = useState<FinanceRequest[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [cars, setCars] = useState<{ [carId: string]: Car }>({})
  const [offers, setOffers] = useState<{ [requestId: string]: Offer[] }>({})
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<FinanceRequest | null>(null)
  const [showOfferForm, setShowOfferForm] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OfferForm>()

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/login')
    }
  }, [user, authLoading, isAdmin, router])

  useEffect(() => {
    if (user && isAdmin) {
      fetchAdminData()
    }
  }, [user, isAdmin])

  const fetchAdminData = () => {
    setLoading(true)

    const unsubscribeRequests = FinanceService.subscribeToFinanceRequests((requests) => {
      setFinanceRequests(requests)
      
      const carData: { [carId: string]: Car } = {}
      requests.forEach(request => {
        const car = CarService.getCarById(request.carId)
        if (car) {
          carData[request.carId] = car
        }
      })
      setCars(carData)
      setLoading(false)
    })

    const unsubscribeOffers = FinanceService.subscribeToAllOffers((allOffers) => {
      setOffers(allOffers)
    })

    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'))
        const usersData: User[] = []
        usersSnapshot.forEach((doc) => {
          const data = doc.data()
          usersData.push({
            id: doc.id,
            email: data.email,
            name: data.name,
            role: data.role,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          })
        })
        setUsers(usersData)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()

    return () => {
      unsubscribeRequests()
      unsubscribeOffers()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'counter-offer':
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'counter-offer':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const updateRequestStatus = async (requestId: string, status: FinanceRequest['status'], notes?: string) => {
    try {
      await FinanceService.updateFinanceRequestStatus(requestId, status, notes)
      toast.success(`Request ${status} successfully!`)
    } catch (error) {
      console.error('Error updating request:', error)
      toast.error('Error updating request')
    }
  }

  const createOffer = async (data: OfferForm) => {
    if (!selectedRequest || !user) return

    try {
      const totalCost = (data.monthlyPayment * data.termLength) + data.downPayment

      const newOffer: Omit<Offer, 'id' | 'createdAt'> = {
        financeRequestId: selectedRequest.id,
        dealerUserId: user.id,
        monthlyPayment: data.monthlyPayment,
        downPayment: data.downPayment,
        termLength: data.termLength,
        interestRate: data.interestRate,
        totalCost,
        status: 'active',
        notes: data.notes,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }

      await FinanceService.createOffer(newOffer)

      toast.success('Counter offer created successfully!')
      setShowOfferForm(false)
      setSelectedRequest(null)
      reset()
    } catch (error) {
      console.error('Error creating offer:', error)
      toast.error('Error creating offer')
    }
  }

  if (authLoading || loading) {
    return <EnhancedLoading message="Loading admin dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">Manage finance applications and offers</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CarIcon className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{financeRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {financeRequests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {financeRequests.filter(r => r.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Finance Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financeRequests.map((request, index) => {
                const requestUser = users.find(u => u.id === request.userId)
                const car = cars[request.carId]
                const requestOffers = offers[request.id] || []
                const activeOffers = requestOffers.filter(offer => offer.status === 'active')

                return (
                  <div 
                    key={request.id} 
                    className="border border-gray-200 rounded-lg p-4 card-hover animate-fadeInUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <h3 className="font-semibold">{requestUser?.name || 'Unknown User'}</h3>
                          <p className="text-sm text-gray-600">{requestUser?.email || 'No email'}</p>
                          <p className="text-sm text-gray-600">
                            {car ? `${car.year} ${car.make} ${car.model} ${car.trim}` : 'Loading vehicle info...'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Credit Score</p>
                        <p className="font-semibold">{request.creditScore}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Annual Income</p>
                        <p className="font-semibold">{formatCurrency(request.annualIncome)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Down Payment</p>
                        <p className="font-semibold">{formatCurrency(request.downPayment)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Term Length</p>
                        <p className="font-semibold">{request.termLength} months ({request.financeType})</p>
                      </div>
                    </div>

                    {activeOffers.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Active Offers</h4>
                        {activeOffers.map((offer) => (
                          <div key={offer.id} className="text-sm text-blue-800">
                            Monthly: {formatCurrency(offer.monthlyPayment)} | 
                            Down: {formatCurrency(offer.downPayment)} | 
                            Rate: {offer.interestRate}% | 
                            Valid until: {formatDate(offer.validUntil)}
                          </div>
                        ))}
                      </div>
                    )}

                    {request.dealerNotes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Dealer Notes</h4>
                        <p className="text-sm text-gray-700">{request.dealerNotes}</p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateRequestStatus(request.id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateRequestStatus(request.id, 'rejected')}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowOfferForm(true)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Counter Offer
                          </Button>
                        </>
                      )}
                      {request.status === 'counter-offer' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowOfferForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Offer
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {showOfferForm && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md m-4">
              <CardHeader>
                <CardTitle>Create Counter Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(createOffer)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Payment
                    </label>
                    <Input
                      type="number"
                      {...register('monthlyPayment', { 
                        required: 'Monthly payment is required',
                        valueAsNumber: true,
                        min: { value: 100, message: 'Minimum payment is $100' }
                      })}
                      placeholder="450"
                    />
                    {errors.monthlyPayment && (
                      <p className="text-red-600 text-sm">{errors.monthlyPayment.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Down Payment
                    </label>
                    <Input
                      type="number"
                      {...register('downPayment', { 
                        required: 'Down payment is required',
                        valueAsNumber: true,
                        min: { value: 0, message: 'Down payment cannot be negative' }
                      })}
                      placeholder="5000"
                    />
                    {errors.downPayment && (
                      <p className="text-red-600 text-sm">{errors.downPayment.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Term Length (months)
                    </label>
                    <select
                      {...register('termLength', { 
                        required: 'Term length is required',
                        valueAsNumber: true 
                      })}
                      className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value={24}>24 months</option>
                      <option value={36}>36 months</option>
                      <option value={48}>48 months</option>
                      <option value={60}>60 months</option>
                      <option value={72}>72 months</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interest Rate (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      {...register('interestRate', { 
                        required: 'Interest rate is required',
                        valueAsNumber: true,
                        min: { value: 0, message: 'Interest rate cannot be negative' },
                        max: { value: 30, message: 'Interest rate cannot exceed 30%' }
                      })}
                      placeholder="4.5"
                    />
                    {errors.interestRate && (
                      <p className="text-red-600 text-sm">{errors.interestRate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <Input
                      {...register('notes')}
                      placeholder="Special promotion rate..."
                    />
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Create Offer
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowOfferForm(false)
                        setSelectedRequest(null)
                        reset()
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
