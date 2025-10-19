// hooks/useCarPackages.ts
import { useState, useEffect } from 'react'
import { PackageService, CarPackage } from '@/lib/services/packageService'

export function useCarPackages(carId: string) {
  const [packages, setPackages] = useState<CarPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPackages = async () => {
      if (!carId) {
        setPackages([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const carPackages = await PackageService.getPackagesForCar(carId)
        setPackages(carPackages)
      } catch (error) {
        console.error('Error fetching car packages:', error)
        setError('Failed to load packages')
        setPackages([])
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [carId])

  const refetch = async () => {
    if (!carId) return
    
    try {
      setLoading(true)
      setError(null)
      const carPackages = await PackageService.getPackagesForCar(carId)
      setPackages(carPackages)
    } catch (error) {
      console.error('Error refetching car packages:', error)
      setError('Failed to load packages')
    } finally {
      setLoading(false)
    }
  }

  return { packages, loading, error, refetch }
}

export function useAllPackages() {
  const [packages, setPackages] = useState<CarPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllPackages()
  }, [])

  const fetchAllPackages = async () => {
    try {
      setLoading(true)
      setError(null)
      const allPackages = await PackageService.getAllPackages()
      setPackages(allPackages)
    } catch (error) {
      console.error('Error fetching all packages:', error)
      setError('Failed to load packages')
      setPackages([])
    } finally {
      setLoading(false)
    }
  }

  const refetch = fetchAllPackages

  return { packages, loading, error, refetch }
}
