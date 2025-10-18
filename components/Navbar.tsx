// components/Navbar.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Car, User, Settings, LogOut } from 'lucide-react'

export default function Navbar() {
  const { user, logout, isAdmin, isDealer } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-red-600" />
              <span className="text-xl font-bold text-gray-900">Toyota Finance</span>
            </Link>
            
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/" className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link href="/vehicles" className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium">
                Vehicles
              </Link>
              {user && (
                <Link href="/dashboard" className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium">
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Welcome, {user.name}</span>
                <div className="flex items-center space-x-2">
                  <Link href="/profile">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
