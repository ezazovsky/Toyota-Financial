'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FinanceService } from '@/lib/services/financeService'
import { CarService } from '@/lib/services/carService'
import { FinanceRequest, Offer, Car } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { EnhancedLoading, ApplicationSkeleton } from '@/components/ui/enhanced-loading'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Car as CarIcon,
  FileText,
  DollarSign,
  Calendar,
  RefreshCw,
  Plus
} from 'lucide-react'

export default function UserDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [financeRequests, setFinanceRequests] = useState<FinanceRequest[]>([])
  const [offers, setOffers] = useState<{ [requestId: string]: Offer[] }>({})
  const [cars, setCars] = useState<{ [carId: string]: Car }>({})
  const [loading, setLoading] = useState(true)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)

  const applicationId = searchParams.get('applicationId')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  useEffect(() => {
    if (applicationId && financeRequests.length > 0) {
      const newApplication = financeRequests.find(req => req.id === applicationId)
      if (newApplication) {
        toast.success('Your application has been submitted successfully!')
      }
    }
  }, [applicationId, financeRequests])

  const fetchUserData = () => {
    if (!user) return

    setLoading(true)

    // Subscribe to user's finance requests
    const unsubscribeRequests = FinanceService.subscribeToUserFinanceRequests(
      user.id, 
      (requests) => {
        setFinanceRequests(requests)
        
        // Load car data for each request
        const carData: { [carId: string]: Car } = {}
        requests.forEach(request => {
          const car = CarService.getCarById(request.carId)
          if (car) {
            carData[request.carId] = car
          }
        })
        setCars(carData)
        setLoading(false)
      }
    )

    // Subscribe to offers for user's requests
    const unsubscribeOffers = FinanceService.subscribeToAllOffers((allOffers) => {
      // Filter offers for user's requests only
      const userOffers: { [requestId: string]: Offer[] } = {}
      financeRequests.forEach(request => {
        if (allOffers[request.id]) {
          userOffers[request.id] = allOffers[request.id]
        }
      })
      setOffers(userOffers)
    })

    return () => {
      unsubscribeRequests()
      unsubscribeOffers()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'counter-offer':
        return <AlertCircle className="h-5 w-5 text-blue-600" />
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
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
      case 'accepted':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your application is under review. We\'ll get back to you within 24 hours.'
      case 'approved':
        return 'Congratulations! Your finance application has been approved.'
      case 'rejected':
        return 'Unfortunately, we cannot approve your application at this time.'
      case 'counter-offer':
        return 'We have a counter offer for you. Review the details below.'
      case 'accepted':
        return 'Great! You\'ve accepted an offer. Next steps will be sent to your email.'
      default:
        return 'Application status unknown.'
    }
  }

  const handleAcceptOffer = async (offer: Offer) => {
    try {
      await FinanceService.updateOfferStatus(offer.id, 'accepted')
      toast.success('Offer accepted! You will receive next steps via email.')
    } catch (error) {
      console.error('Error accepting offer:', error)
      toast.error('Error accepting offer. Please try again.')
    }
  }

  const handleRejectOffer = async (offer: Offer) => {
    try {
      await FinanceService.updateOfferStatus(offer.id, 'rejected')
      toast.success('Offer declined.')
    } catch (error) {
      console.error('Error rejecting offer:', error)
      toast.error('Error declining offer. Please try again.')
    }
  }

  if (authLoading || loading) {
    return <EnhancedLoading message="Loading your dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-lg text-gray-600">Track your finance applications and offers</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => router.push('/user/estimator')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Application
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/vehicles')}
                >
                  <CarIcon className="w-4 h-4 mr-2" />
                  Browse Vehicles
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
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
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {financeRequests.filter(r => r.status === 'approved' || r.status === 'accepted').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Finance Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {financeRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-6">Start your finance journey by creating your first application.</p>
                <Button 
                  onClick={() => router.push('/user/estimator')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Application
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {financeRequests.map((request, index) => {
                  const car = cars[request.carId]
                  const requestOffers = offers[request.id] || []
                  const activeOffers = requestOffers.filter(offer => offer.status === 'active')

                  return (
                    <div 
                      key={request.id} 
                      className="border border-gray-200 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:border-red-300 animate-fadeInUp"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(request.status)}
                          <div>
                            <h3 className="font-semibold text-lg">
                              {car ? `${car.year} ${car.make} ${car.model} ${car.trim}` : 'Vehicle Information Loading...'}
                            </h3>
                            <p className="text-gray-600">
                              {request.financeType === 'finance' ? 'Finance Application' : 'Lease Application'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            Applied {formatDate(request.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 text-sm">
                          {getStatusDescription(request.status)}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Down Payment</p>
                          <p className="font-semibold">{formatCurrency(request.downPayment)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Term Length</p>
                          <p className="font-semibold">{request.termLength} months</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Credit Score</p>
                          <p className="font-semibold">{request.creditScore}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Annual Income</p>
                          <p className="font-semibold">{formatCurrency(request.annualIncome)}</p>
                        </div>
                      </div>

                      {/* Active Offers */}
                      {activeOffers.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Available Offers</h4>
                          <div className="space-y-3">
                            {activeOffers.map((offer) => (
                              <div key={offer.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <p className="font-semibold text-blue-900">Counter Offer</p>
                                    <p className="text-sm text-blue-700">
                                      Valid until {formatDate(offer.validUntil)}
                                    </p>
                                  </div>
                                  <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <div>
                                    <p className="text-sm text-blue-700">Monthly Payment</p>
                                    <p className="font-bold text-blue-900">{formatCurrency(offer.monthlyPayment)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700">Down Payment</p>
                                    <p className="font-semibold text-blue-900">{formatCurrency(offer.downPayment)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700">Interest Rate</p>
                                    <p className="font-semibold text-blue-900">{offer.interestRate}%</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-blue-700">Total Cost</p>
                                    <p className="font-semibold text-blue-900">{formatCurrency(offer.totalCost)}</p>
                                  </div>
                                </div>

                                {offer.notes && (
                                  <div className="mb-4 p-2 bg-blue-100 rounded">
                                    <p className="text-sm text-blue-800"><strong>Note:</strong> {offer.notes}</p>
                                  </div>
                                )}

                                <div className="flex space-x-3">
                                  <Button
                                    onClick={() => handleAcceptOffer(offer)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Accept Offer
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleRejectOffer(offer)}
                                    className="text-gray-600 border-gray-300"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Decline
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {request.dealerNotes && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Dealer Notes:</strong> {request.dealerNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
