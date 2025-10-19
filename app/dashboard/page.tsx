'use client'

import { useEffect, useState } from 'react'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { useRouter } from 'next/navigation'

import { FinanceRequest, Offer } from '@/types'
import { FinanceService } from '@/lib/services/financeService'
import { CarService } from '@/lib/services/carService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, XCircle, AlertCircle, Car, DollarSign, Calendar, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuthRedirect()
  const router = useRouter()
  const [financeRequests, setFinanceRequests] = useState<FinanceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      const unsubscribe = fetchFinanceRequests()
      return unsubscribe
    }
  }, [user])

  const fetchFinanceRequests = () => {
    if (!user) return

    // Use the FinanceService to subscribe to user's finance requests
    const unsubscribe = FinanceService.subscribeToUserFinanceRequests(
      user.id,
      (requests) => {
        setFinanceRequests(requests)
        setLoading(false)
      }
    )

    return unsubscribe
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

  const acceptOffer = async (requestId: string, offerId: string) => {
    try {
      // Update the offer status to 'accepted' using the service
      await FinanceService.updateOfferStatus(offerId, 'accepted')
      
      alert('Offer accepted! A dealer representative will contact you soon.')
    } catch (error) {
      console.error('Error accepting offer:', error)
      alert('Error accepting offer. Please try again.')
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-lg text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Car className="h-8 w-8 text-red-600" />
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
                    {financeRequests.filter(r => r.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Counter Offers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {financeRequests.filter(r => r.status === 'counter-offer').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Finance Requests */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Applications</h2>
          
          {financeRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-4">Start by browsing our vehicle inventory</p>
                <Button onClick={() => router.push('/vehicles')}>
                  Browse Vehicles
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {financeRequests.map((request) => {
                const car = CarService.getCarById(request.carId)
                const carDisplayName = car ? `${car.year} ${car.make} ${car.model} ${car.trim}` : 'Vehicle Details Unavailable'
                
                return (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span>{carDisplayName}</span>
                      </CardTitle>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Vehicle Info */}
                      {car && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Vehicle Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">MSRP:</span>
                              <span className="font-medium">{formatCurrency(car.basePrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Engine:</span>
                              <span className="font-medium">{car.specifications.engine}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">MPG:</span>
                              <span className="font-medium">{car.specifications.mpg.city}/{car.specifications.mpg.highway}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Drivetrain:</span>
                              <span className="font-medium">{car.specifications.drivetrain}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Application Details */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Application Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium">{request.financeType === 'finance' ? 'Finance' : 'Lease'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Term:</span>
                            <span className="font-medium">{request.termLength} months</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Down Payment:</span>
                            <span className="font-medium">{formatCurrency(request.downPayment)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Payment:</span>
                            <span className="font-medium">{formatCurrency(request.monthlyPayment || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Applied:</span>
                            <span className="font-medium">{formatDate(request.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Updates */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Status Updates</h4>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-gray-600">Application submitted</span>
                          </div>
                          {request.status !== 'pending' && (
                            <div className="flex items-center text-sm">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              <span className="text-gray-600">Under review</span>
                            </div>
                          )}
                          {request.status === 'approved' && (
                            <div className="flex items-center text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span className="text-green-600 font-medium">Approved!</span>
                            </div>
                          )}
                          {request.status === 'counter-offer' && (
                            <div className="flex items-center text-sm">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              <span className="text-blue-600 font-medium">Counter offer received</span>
                            </div>
                          )}
                        </div>

                        {request.dealerNotes && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Dealer Note:</strong> {request.dealerNotes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Offers */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          {request.offers.length > 0 ? 'Counter Offers' : 'Actions'}
                        </h4>
                        
                        {request.offers.length > 0 ? (
                          <div className="space-y-3">
                            {request.offers.map((offer) => (
                              <div key={offer.id} className="border border-gray-200 rounded-lg p-3">
                                <div className="space-y-2 text-sm mb-3">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Monthly Payment:</span>
                                    <span className="font-semibold text-green-600">
                                      {formatCurrency(offer.monthlyPayment)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Down Payment:</span>
                                    <span>{formatCurrency(offer.downPayment)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Interest Rate:</span>
                                    <span>{offer.interestRate}%</span>
                                  </div>
                                </div>
                                
                                {offer.notes && (
                                  <p className="text-xs text-gray-600 mb-3">{offer.notes}</p>
                                )}
                                
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => acceptOffer(request.id, offer.id)}
                                    className="flex-1"
                                  >
                                    Accept
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex-1">
                                    Decline
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Button size="sm" variant="outline" className="w-full">
                              Contact Dealer
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              onClick={() => router.push(`/vehicles/${request.carId}`)}
                            >
                              View Vehicle
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )})}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
