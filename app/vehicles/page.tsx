'use client'

import { useEffect, useState } from 'react'
import { CarService } from '@/lib/services/carService'
import { Car } from '@/types'
import CarCard from '@/components/CarCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, SlidersHorizontal } from 'lucide-react'

export default function VehiclesPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 })
  const [selectedBodyStyle, setSelectedBodyStyle] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchCars()
  }, [])

  useEffect(() => {
    filterCars()
  }, [cars, searchTerm, priceRange, selectedBodyStyle])

  const fetchCars = async () => {
    try {
      // Use the centralized CarService
      setCars(CarService.getAllCars())
    } catch (error) {
      console.error('Error fetching cars:', error)
      setCars([])
    } finally {
      setLoading(false)
    }
  }

  const filterCars = () => {
    let filtered = cars.filter(car => {
      // Create a combined searchable string with all relevant car information
      const searchableText = `${car.make} ${car.model} ${car.trim} ${car.year} ${car.specifications.bodyStyle}`.toLowerCase()
      const searchTermLower = searchTerm.toLowerCase().trim()
      
      // Handle empty search
      if (!searchTermLower) {
        const matchesPrice = car.basePrice >= priceRange.min && car.basePrice <= priceRange.max
        const matchesBodyStyle = !selectedBodyStyle || car.specifications.bodyStyle === selectedBodyStyle
        return matchesPrice && matchesBodyStyle
      }
      
      // Support multi-word search by checking if all words in the search term exist in the searchable text
      const searchWords = searchTermLower.split(/\s+/).filter(word => word.length > 0)
      const matchesSearch = searchWords.every(word => searchableText.includes(word))
      
      const matchesPrice = car.basePrice >= priceRange.min && car.basePrice <= priceRange.max
      const matchesBodyStyle = !selectedBodyStyle || car.specifications.bodyStyle === selectedBodyStyle

      return matchesSearch && matchesPrice && matchesBodyStyle
    })

    setFilteredCars(filtered)
  }

  const bodyStyles = Array.from(new Set(cars.map(car => car.specifications.bodyStyle)))

  const resetFilters = () => {
    setSearchTerm('')
    setPriceRange({ min: 0, max: 100000 })
    setSelectedBodyStyle('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Vehicle Inventory</h1>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by make, model, or year (e.g., 'Toyota RAV4', '2024 Hybrid')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Filters</span>
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Min Price"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      />
                      <Input
                        type="number"
                        placeholder="Max Price"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  {/* Body Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body Style
                    </label>
                    <select
                      value={selectedBodyStyle}
                      onChange={(e) => setSelectedBodyStyle(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="">All Body Styles</option>
                      {bodyStyles.map((style) => (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredCars.length} of {cars.length} vehicles
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCars.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={resetFilters}>Reset Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
