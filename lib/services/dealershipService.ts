// lib/services/dealershipService.ts
import { Dealership } from '@/types'

// Sample dealership database
export const DEALERSHIPS: Dealership[] = [
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
  {
    id: '4',
    name: 'West Austin Toyota',
    address: '321 West Ave',
    city: 'Austin',
    state: 'TX',
    zipCode: '78703',
    phone: '(512) 555-0321',
    email: 'sales@westaustintoyota.com',
    adminUserId: 'dealer4',
    createdAt: new Date(),
  },
  {
    id: '5',
    name: 'Round Rock Toyota',
    address: '654 IH-35 North',
    city: 'Round Rock',
    state: 'TX',
    zipCode: '78664',
    phone: '(512) 555-0654',
    email: 'contact@roundrocktoyota.com',
    adminUserId: 'dealer5',
    createdAt: new Date(),
  }
]

export class DealershipService {
  // Get all dealerships
  static getAllDealerships(): Dealership[] {
    return DEALERSHIPS
  }

  // Get dealership by ID
  static getDealershipById(dealershipId: string): Dealership | null {
    return DEALERSHIPS.find(dealership => dealership.id === dealershipId) || null
  }

  // Get dealerships by city
  static getDealershipsByCity(city: string): Dealership[] {
    return DEALERSHIPS.filter(dealership => 
      dealership.city.toLowerCase() === city.toLowerCase()
    )
  }

  // Get dealerships by state
  static getDealershipsByState(state: string): Dealership[] {
    return DEALERSHIPS.filter(dealership => 
      dealership.state.toLowerCase() === state.toLowerCase()
    )
  }

  // Search dealerships by name or location
  static searchDealerships(searchTerm: string): Dealership[] {
    const term = searchTerm.toLowerCase()
    return DEALERSHIPS.filter(dealership => 
      dealership.name.toLowerCase().includes(term) ||
      dealership.city.toLowerCase().includes(term) ||
      dealership.address.toLowerCase().includes(term)
    )
  }

  // Get dealership by admin user ID
  static getDealershipByAdminUserId(adminUserId: string): Dealership | null {
    return DEALERSHIPS.find(dealership => dealership.adminUserId === adminUserId) || null
  }
}
