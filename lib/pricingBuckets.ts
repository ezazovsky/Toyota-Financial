// lib/pricingBuckets.ts
import { formatCurrency } from './utils'

export interface PricingBucket {
  id: string
  name: string
  minPrice: number
  maxPrice: number
  baseDownPayment: number
  recommendedTerms: number[]
  features: string[]
  popularTerm: number
  color: string
}

export const PRICING_BUCKETS: PricingBucket[] = [
  {
    id: 'economy',
    name: 'Economy',
    minPrice: 20000,
    maxPrice: 28000,
    baseDownPayment: 2000,
    recommendedTerms: [48, 60, 72],
    features: ['Low monthly payments', 'Great fuel economy', 'Reliable transportation'],
    popularTerm: 60,
    color: 'green',
  },
  {
    id: 'midsize',
    name: 'Mid-Size',
    minPrice: 28001,
    maxPrice: 38000,
    baseDownPayment: 3000,
    recommendedTerms: [48, 60, 72],
    features: ['Balanced performance', 'Family-friendly', 'Advanced safety features'],
    popularTerm: 60,
    color: 'blue',
  },
  {
    id: 'premium',
    name: 'Premium',
    minPrice: 38001,
    maxPrice: 55000,
    baseDownPayment: 5000,
    recommendedTerms: [48, 60, 72, 84],
    features: ['Premium comfort', 'Advanced technology', 'Superior performance'],
    popularTerm: 72,
    color: 'purple',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    minPrice: 55001,
    maxPrice: 100000,
    baseDownPayment: 8000,
    recommendedTerms: [60, 72, 84],
    features: ['Luxury amenities', 'Cutting-edge technology', 'Premium materials'],
    popularTerm: 72,
    color: 'red',
  },
]

export function getPricingBucket(vehiclePrice: number): PricingBucket {
  return PRICING_BUCKETS.find(bucket => 
    vehiclePrice >= bucket.minPrice && vehiclePrice <= bucket.maxPrice
  ) || PRICING_BUCKETS[0]
}

export function getBucketRecommendations(bucket: PricingBucket, creditScore: number) {
  const recommendations = []
  
  // Adjust down payment based on credit score
  let adjustedDownPayment = bucket.baseDownPayment
  if (creditScore >= 750) {
    adjustedDownPayment = Math.max(1000, bucket.baseDownPayment * 0.8)
    recommendations.push("Excellent credit! You qualify for reduced down payment.")
  } else if (creditScore >= 700) {
    adjustedDownPayment = bucket.baseDownPayment * 0.9
    recommendations.push("Good credit score allows for flexible terms.")
  } else if (creditScore < 600) {
    adjustedDownPayment = bucket.baseDownPayment * 1.3
    recommendations.push("Consider a larger down payment for better rates.")
  }

  return {
    adjustedDownPayment: Math.round(adjustedDownPayment),
    recommendations,
  }
}
