// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// Finance calculation utilities
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number,
  downPayment: number = 0
): number {
  const loanAmount = principal - downPayment
  const monthlyRate = annualRate / 100 / 12
  
  if (monthlyRate === 0) {
    return loanAmount / termMonths
  }
  
  const monthlyPayment = 
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1)
  
  return monthlyPayment
}

export function calculateLeasePayment(
  vehiclePrice: number,
  residualValue: number,
  moneyFactor: number,
  termMonths: number,
  downPayment: number = 0
): number {
  const capitalizedCost = vehiclePrice - downPayment
  const depreciation = (capitalizedCost - residualValue) / termMonths
  const interest = (capitalizedCost + residualValue) * moneyFactor
  
  return depreciation + interest
}

export function getInterestRateByCredit(creditScore: number): number {
  if (creditScore >= 800) return 3.5
  if (creditScore >= 740) return 4.5
  if (creditScore >= 670) return 6.5
  if (creditScore >= 580) return 9.5
  if (creditScore >= 500) return 13.5
  return 18.0
}

export function getResidualValue(vehiclePrice: number, termMonths: number): number {
  // Typical residual values for different lease terms
  const residualPercentages: { [key: number]: number } = {
    24: 0.65,
    36: 0.55,
    48: 0.45,
    60: 0.35,
  }
  
  const percentage = residualPercentages[termMonths] || 0.50
  return vehiclePrice * percentage
}
