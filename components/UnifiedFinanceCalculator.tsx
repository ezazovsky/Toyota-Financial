'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  formatCurrency,
  calculateMonthlyPayment,
  calculateLeasePayment,
  calculateLeaseDetails,
  getInterestRateByCredit,
  getResidualValue
} from '@/lib/utils'
import { FinanceCalculation } from '@/types'
import { Calculator, TrendingUp, DollarSign, Star, Info } from 'lucide-react'
import {
  getPricingBucket,
  getBucketRecommendations
} from '@/lib/pricingBuckets'

interface UnifiedFinanceCalculatorProps {
  vehiclePrice: number
  onValuesChange?: (values: {
    financeType: 'finance' | 'lease'
    creditScore: number
    annualIncome: number
    downPayment: number
    termLength: number
    annualMileage?: number
    calculation: FinanceCalculation
  }) => void
}

export default function UnifiedFinanceCalculator({
  vehiclePrice,
  onValuesChange
}: UnifiedFinanceCalculatorProps) {
  const [financeType, setFinanceType] = useState<'finance' | 'lease'>('finance')
  const [creditScore, setCreditScore] = useState(700)
  const [annualIncome, setAnnualIncome] = useState(60000)
  const [downPayment, setDownPayment] = useState(5000)
  const [tradeInValue, setTradeInValue] = useState(0)
  const [termLength, setTermLength] = useState(60)
  const [annualMileage, setAnnualMileage] = useState(12000)
  const [calculation, setCalculation] = useState<FinanceCalculation | null>(
    null
  )

  // Get pricing bucket and recommendations
  const pricingBucket = getPricingBucket(vehiclePrice)
  const recommendations = getBucketRecommendations(pricingBucket, creditScore)

  useEffect(() => {
    calculatePayment()
  }, [
    financeType,
    creditScore,
    annualIncome,
    downPayment,
    tradeInValue,
    termLength,
    annualMileage,
    vehiclePrice
  ])

  const calculatePayment = () => {
    const interestRate = getInterestRateByCredit(creditScore)
    let monthlyPayment: number
    let totalCost: number
    let totalInterest: number
    // Subtract trade-in value from vehicle price for calculations
    const effectiveVehiclePrice = Math.max(vehiclePrice - tradeInValue, 0)

    if (financeType === 'lease') {
      const leaseDetails = calculateLeaseDetails(
        effectiveVehiclePrice,
        termLength,
        interestRate,
        downPayment
      )
      monthlyPayment = leaseDetails.monthlyPayment
      totalCost = leaseDetails.totalOfPayments + downPayment
      totalInterest = leaseDetails.totalFinanceCharges
    } else {
      const loanAmount = effectiveVehiclePrice - downPayment
      monthlyPayment = calculateMonthlyPayment(
        loanAmount,
        interestRate,
        termLength
      )
      totalCost = monthlyPayment * termLength + downPayment
      totalInterest = totalCost - effectiveVehiclePrice
    }

    const newCalculation: FinanceCalculation = {
      monthlyPayment,
      totalCost,
      totalInterest,
      downPayment,
      termLength,
      interestRate
    }

    setCalculation(newCalculation)

    // Notify parent with all values
    onValuesChange?.({
      financeType,
      creditScore,
      annualIncome,
      downPayment,
      termLength,
      annualMileage: financeType === 'lease' ? annualMileage : undefined,
      calculation: newCalculation
    })
  }

  return (
    <div className='space-y-6'>
      {/* Pricing Package Display */}
      <Card className={`border-l-4 border-l-${pricingBucket.color}-500`}>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Star className='mr-2 h-5 w-5 text-yellow-500' />
            {pricingBucket.name} Package
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <p className='mb-3 text-sm text-gray-600'>
                Price Range: {formatCurrency(pricingBucket.minPrice)} -{' '}
                {formatCurrency(pricingBucket.maxPrice)}
              </p>
              <ul className='space-y-1'>
                {pricingBucket.features.map((feature, index) => (
                  <li
                    key={index}
                    className='flex items-center text-sm text-gray-600'
                  >
                    <div className='mr-2 h-2 w-2 rounded-full bg-green-500'></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              {recommendations.recommendations.length > 0 && (
                <div className='rounded-lg bg-blue-50 p-3'>
                  <div className='mb-2 flex items-center'>
                    <Info className='mr-1 h-4 w-4 text-blue-600' />
                    <span className='text-sm font-medium text-blue-900'>
                      Recommendations
                    </span>
                  </div>
                  {recommendations.recommendations.map((rec, index) => (
                    <p key={index} className='mb-1 text-xs text-blue-700'>
                      {rec}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unified Finance Form & Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Calculator className='mr-2 h-5 w-5' />
            Payment Calculator & Application Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Finance Type Selection */}
            <div className='grid grid-cols-2 gap-4'>
              <Button
                variant={financeType === 'finance' ? 'default' : 'outline'}
                onClick={() => setFinanceType('finance')}
                className='w-full'
              >
                Finance
              </Button>
              <Button
                variant={financeType === 'lease' ? 'default' : 'outline'}
                onClick={() => setFinanceType('lease')}
                className='w-full'
              >
                Lease
              </Button>
            </div>

            {/* Input Fields */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Credit Score
                </label>
                <Input
                  type='number'
                  min='300'
                  max='850'
                  value={creditScore}
                  onChange={e => setCreditScore(Number(e.target.value))}
                  className='w-full'
                  placeholder='700'
                />
                <div className='mt-1 text-xs text-gray-500'>
                  Enter your credit score (300-850)
                </div>
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Annual Income
                </label>
                <Input
                  type='number'
                  value={annualIncome}
                  onChange={e => setAnnualIncome(Number(e.target.value))}
                  className='w-full'
                  placeholder='60000'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Down Payment
                </label>
                <Input
                  type='number'
                  value={downPayment}
                  onChange={e => setDownPayment(Number(e.target.value))}
                  className='w-full'
                  placeholder='5000'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Estimated Trade-In Value (optional)
                </label>
                <Input
                  type='number'
                  value={tradeInValue}
                  onChange={e => setTradeInValue(Number(e.target.value))}
                  className='w-full'
                  placeholder='0'
                  min='0'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Term Length (months)
                </label>
                <select
                  value={termLength}
                  onChange={e => setTermLength(Number(e.target.value))}
                  className='h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:ring-1 focus:ring-red-500 focus:outline-none'
                >
                  {pricingBucket.recommendedTerms.map(term => (
                    <option key={term} value={term}>
                      {term} months{' '}
                      {term === pricingBucket.popularTerm ? '(Popular)' : ''}
                    </option>
                  ))}
                </select>
                <div className='mt-1 text-xs text-gray-500'>
                  Recommended terms for this vehicle class
                </div>
              </div>

              {financeType === 'lease' && (
                <div className='md:col-span-2'>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Annual Mileage
                  </label>
                  <Input
                    type='number'
                    value={annualMileage}
                    onChange={e => setAnnualMileage(Number(e.target.value))}
                    className='w-full'
                    placeholder='12000'
                  />
                  <div className='mt-1 text-xs text-gray-500'>
                    Typical range: 10,000 - 15,000 miles per year
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Results */}
      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <TrendingUp className='mr-2 h-5 w-5' />
              Payment Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <div className='rounded-lg bg-red-50 p-4 text-center'>
                <div className='text-2xl font-bold text-red-600'>
                  {formatCurrency(calculation.monthlyPayment)}
                </div>
                <div className='text-sm text-gray-600'>Monthly Payment</div>
              </div>

              <div className='rounded-lg bg-gray-50 p-4 text-center'>
                <div className='text-xl font-semibold text-gray-900'>
                  {formatCurrency(calculation.totalCost)}
                </div>
                <div className='text-sm text-gray-600'>
                  {financeType === 'lease' ? 'Total Payments' : 'Total Cost'}
                </div>
              </div>

              <div className='rounded-lg bg-gray-50 p-4 text-center'>
                <div className='text-xl font-semibold text-gray-900'>
                  {calculation.interestRate.toFixed(1)}%
                </div>
                <div className='text-sm text-gray-600'>Interest Rate</div>
              </div>
            </div>

            <div className='mt-6 rounded-lg bg-blue-50 p-4'>
              <h4 className='mb-2 font-semibold text-blue-900'>
                {financeType === 'lease' ? 'Lease Summary' : 'Finance Summary'}
              </h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>Vehicle Price:</span>
                  <span>{formatCurrency(vehiclePrice)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Down Payment:</span>
                  <span>{formatCurrency(calculation.downPayment)}</span>
                </div>
                {financeType === 'lease' ? (
                  <>
                    <div className='flex justify-between'>
                      <span>Capitalized Cost:</span>
                      <span>
                        {formatCurrency(vehiclePrice - calculation.downPayment)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Residual Value:</span>
                      <span>
                        {formatCurrency(
                          getResidualValue(vehiclePrice, calculation.termLength)
                        )}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Depreciation:</span>
                      <span>
                        {formatCurrency(
                          vehiclePrice -
                            calculation.downPayment -
                            getResidualValue(
                              vehiclePrice,
                              calculation.termLength
                            )
                        )}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className='flex justify-between'>
                    <span>Amount Financed:</span>
                    <span>
                      {formatCurrency(vehiclePrice - calculation.downPayment)}
                    </span>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span>Term:</span>
                  <span>{calculation.termLength} months</span>
                </div>
                <div className='flex justify-between font-semibold'>
                  <span>
                    {financeType === 'lease'
                      ? 'Total Finance Charges:'
                      : 'Total Interest:'}
                  </span>
                  <span>{formatCurrency(calculation.totalInterest)}</span>
                </div>
                {financeType === 'lease' && (
                  <div className='flex justify-between font-semibold text-blue-800'>
                    <span>Total of Payments:</span>
                    <span>
                      {formatCurrency(
                        calculation.totalCost - calculation.downPayment
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
