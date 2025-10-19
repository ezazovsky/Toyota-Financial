import { z } from 'zod'

// Base finance form validation schema with shared fields
export const baseFinanceSchema = z.object({
  creditScore: z.number()
    .min(300, 'Credit score must be at least 300')
    .max(850, 'Credit score cannot exceed 850'),
  annualIncome: z.number()
    .min(1000, 'Annual income must be at least $1,000'),
  termLength: z.number()
    .min(12, 'Term must be at least 12 months')
    .max(84, 'Term cannot exceed 84 months'),
  downPayment: z.number()
    .min(0, 'Down payment cannot be negative'),
  financeType: z.enum(['finance', 'lease']),
  annualMileage: z.number().optional(),
})

// Finance application schema (for the application page with dealership selection)
export const financeApplicationSchema = baseFinanceSchema.extend({
  dealershipId: z.string().min(1, 'Please select a dealership'),
})

// Full finance application schema (for review page with car selection)
export const fullFinanceApplicationSchema = baseFinanceSchema.extend({
  carId: z.string().min(1, 'Please select a vehicle'),
  monthlyPayment: z.number().optional(),
  dealershipId: z.string().optional().default('default-dealership')
})

// Type exports
export type BaseFinanceForm = z.infer<typeof baseFinanceSchema>
export type FinanceApplicationForm = z.infer<typeof financeApplicationSchema>
export type FullFinanceApplicationForm = z.infer<typeof fullFinanceApplicationSchema>
