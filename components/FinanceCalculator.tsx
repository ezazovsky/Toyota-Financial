// components/FinanceCalculator.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, calculateMonthlyPayment, calculateLeasePayment, getInterestRateByCredit, getResidualValue } from '@/lib/utils'
import { FinanceCalculation } from '@/types'
import { Calculator, TrendingUp, DollarSign } from 'lucide-react'

interface FinanceCalculatorProps {
  vehiclePrice: number
  onCalculationChange?: (calculation: FinanceCalculation) => void
}

export default function FinanceCalculator({ vehiclePrice, onCalculationChange }: FinanceCalculatorProps) {
  const [financeType, setFinanceType] = useState<'finance' | 'lease'>('finance')
  const [creditScore, setCreditScore] = useState(700)
  const [annualIncome, setAnnualIncome] = useState(60000)
  const [downPayment, setDownPayment] = useState(5000)
  const [termLength, setTermLength] = useState(60)
  const [annualMileage, setAnnualMileage] = useState(12000)
  const [calculation, setCalculation] = useState<FinanceCalculation | null>(null)

  useEffect(() => {
    calculatePayments()
  }, [financeType, creditScore, downPayment, termLength, annualMileage, vehiclePrice])

  const calculatePayments = () => {
    const interestRate = getInterestRateByCredit(creditScore)
    
    let monthlyPayment: number
    let totalCost: number
    
    if (financeType === 'finance') {
      monthlyPayment = calculateMonthlyPayment(vehiclePrice, interestRate, termLength, downPayment)
      totalCost = (monthlyPayment * termLength) + downPayment
    } else {
      // Lease calculation
      const residualValue = getResidualValue(vehiclePrice, termLength)
      const moneyFactor = interestRate / 2400 // Convert APR to money factor
      monthlyPayment = calculateLeasePayment(vehiclePrice, residualValue, moneyFactor, termLength, downPayment)
      totalCost = (monthlyPayment * termLength) + downPayment
    }

    const totalInterest = totalCost - vehiclePrice

    const newCalculation: FinanceCalculation = {
      monthlyPayment,
      totalCost,
      totalInterest,
      downPayment,
      termLength,
      interestRate,
    }

    setCalculation(newCalculation)
    onCalculationChange?.(newCalculation)
  }

  return (
    <div className="space-y-6">
      {/* Finance Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Finance Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              variant={financeType === 'finance' ? 'default' : 'outline'}
              onClick={() => setFinanceType('finance')}
              className="w-full"
            >
              Finance
            </Button>
            <Button
              variant={financeType === 'lease' ? 'default' : 'outline'}
              onClick={() => setFinanceType('lease')}
              className="w-full"
            >
              Lease
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Score: {creditScore}
              </label>
              <input
                type="range"
                min="500"
                max="850"
                value={creditScore}
                onChange={(e) => setCreditScore(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Poor (500)</span>
                <span>Excellent (850)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Income
              </label>
              <Input
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                placeholder="60000"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Down Payment
              </label>
              <Input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                placeholder="5000"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Term Length (months)
              </label>
              <select
                value={termLength}
                onChange={(e) => setTermLength(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value={24}>24 months</option>
                <option value={36}>36 months</option>
                <option value={48}>48 months</option>
                <option value={60}>60 months</option>
                <option value={72}>72 months</option>
              </select>
            </div>

            {financeType === 'lease' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Mileage: {annualMileage.toLocaleString()} miles
                </label>
                <input
                  type="range"
                  min="5000"
                  max="25000"
                  step="1000"
                  value={annualMileage}
                  onChange={(e) => setAnnualMileage(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5,000 miles</span>
                  <span>25,000 miles</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calculation Results */}
      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Payment Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <DollarSign className="mx-auto h-8 w-8 text-red-600 mb-2" />
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(calculation.monthlyPayment)}
                </div>
                <div className="text-sm text-gray-600">Monthly Payment</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-semibold text-gray-900">
                  {formatCurrency(calculation.totalCost)}
                </div>
                <div className="text-sm text-gray-600">Total Cost</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-semibold text-gray-900">
                  {calculation.interestRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Interest Rate</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Vehicle Price:</span>
                  <span>{formatCurrency(vehiclePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Down Payment:</span>
                  <span>{formatCurrency(calculation.downPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Financed:</span>
                  <span>{formatCurrency(vehiclePrice - calculation.downPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Term:</span>
                  <span>{calculation.termLength} months</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Interest:</span>
                  <span>{formatCurrency(calculation.totalInterest)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
