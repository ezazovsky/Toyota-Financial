'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { FinanceRequest, Offer, User, Car } from '@/types'
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
  const [cars, setCars] = useState<Car[]>([])
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
    // For demo purposes, create sample data
    const sampleRequests: FinanceRequest[] = [
      {
        id: '1',
        userId: 'user1',
        carId: '1',
        dealershipId: '1',
        financeType: 'finance',
        creditScore: 720,
        annualIncome: 65000,
        termLength: 60,
        downPayment: 5000,
        monthlyPayment: 485,
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        offers: [],
      },
      {
        id: '2',
        userId: 'user2',
        carId: '2',
        dealershipId: '1',
        financeType: 'lease',
        creditScore: 680,
        annualIncome: 55000,
        termLength: 36,
        annualMileage: 12000,
        downPayment: 2000,
        monthlyPayment: 395,
        status: 'counter-offer',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        offers: [
          {
            id: 'o1',
            financeRequestId: '2',
            dealerUserId: user?.id || '',
            monthlyPayment: 365,
            downPayment: 3000,
            termLength: 36,
            interestRate: 4.5,
            totalCost: 16140,
            status: 'active',
            notes: 'Better rate with higher down payment',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
          }
        ],
      },
      {
        id: '3',
        userId: 'user3',
        carId: '1',
        dealershipId: '1',
        financeType: 'finance',
        creditScore: 650,
        annualIncome: 48000,
        termLength: 72,
        downPayment: 3000,
        monthlyPayment: 425,
        status: 'approved',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        offers: [],
      },
    ]

    const sampleUsers: User[] = [
      {
        id: 'user1',
        email: 'john@example.com',
        name: 'John Smith',
        role: 'user',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'user2',
        email: 'jane@example.com',
        name: 'Jane Doe',
        role: 'user',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'user3',
        email: 'mike@example.com',
        name: 'Mike Johnson',
        role: 'user',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ]

    setFinanceRequests(sampleRequests)
    setUsers(sampleUsers)
    setCars([]) // You can add sample cars if needed
    setLoading(false)
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
      // In a real app, you'd update the database
      // await updateDoc(doc(db, 'financeRequests', requestId), {
      //   status,
      //   dealerNotes: notes,
      //   updatedAt: new Date(),
      // })

      // Update local state for demo
      setFinanceRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status, dealerNotes: notes, updatedAt: new Date() }
            : req
        )
      )

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

      const newOffer: Omit<Offer, 'id'> = {
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
        createdAt: new Date(),
      }

      // In a real app, you'd add to database
      // await addDoc(collection(db, 'offers'), newOffer)

      // Update local state for demo
      const offerId = `offer_${Date.now()}`
      setFinanceRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { 
                ...req, 
                status: 'counter-offer',
                offers: [...req.offers, { ...newOffer, id: offerId }],
                updatedAt: new Date()
              }
            : req
        )
      )

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
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

        {/* Finance Requests Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Finance Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financeRequests.map((request) => {
                const user = users.find(u => u.id === request.userId)
                return (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <h3 className="font-semibold">{user?.name || 'Unknown User'}</h3>
                          <p className="text-sm text-gray-600">2024 Toyota Camry XLE</p>
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
                        <p className="text-sm text-gray-600">Monthly Payment</p>
                        <p className="font-semibold">{formatCurrency(request.monthlyPayment || 0)}</p>
                      </div>
                    </div>

                    {request.offers.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Active Offers</h4>
                        {request.offers.map((offer) => (
                          <div key={offer.id} className="text-sm text-blue-800">
                            Monthly: {formatCurrency(offer.monthlyPayment)} | 
                            Down: {formatCurrency(offer.downPayment)} | 
                            Rate: {offer.interestRate}%
                          </div>
                        ))}
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

        {/* Offer Form Modal */}
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
