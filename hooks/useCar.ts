'use client'

import { useState, useEffect } from 'react'
import { CarService } from '@/lib/services/carService'
import { Car } from '@/types'

/**
 * Custom hook to fetch a single car by ID
 * @param carId - The ID of the car to fetch
 * @returns Object containing car data and loading state
 */
export function useCar(carId: string | null | undefined) {
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCar = () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!carId) {
          setCar(null)
          return
        }

        const foundCar = CarService.getCarById(carId)
        setCar(foundCar)
      } catch (error) {
        console.error('Error fetching car:', error)
        setError('Failed to load vehicle data')
      } finally {
        setLoading(false)
      }
    }

    fetchCar()
  }, [carId])

  return { car, loading, error }
}

/**
 * Custom hook to fetch multiple cars by array of IDs
 * @param carIds - Array of car IDs to fetch
 * @returns Object containing cars mapped by ID and loading state
 */
export function useCars(carIds: string[]) {
  const [cars, setCars] = useState<{ [carId: string]: Car }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCars = () => {
      try {
        setLoading(true)
        setError(null)
        
        const carMap: { [carId: string]: Car } = {}
        
        carIds.forEach(carId => {
          const car = CarService.getCarById(carId)
          if (car) {
            carMap[carId] = car
          }
        })
        
        setCars(carMap)
      } catch (error) {
        console.error('Error fetching cars:', error)
        setError('Failed to load vehicle data')
      } finally {
        setLoading(false)
      }
    }

    if (carIds.length > 0) {
      fetchCars()
    } else {
      setLoading(false)
    }
  }, [carIds])

  return { cars, loading, error }
}
