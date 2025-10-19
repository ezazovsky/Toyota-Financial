// components/Navbar.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { User, LogOut } from 'lucide-react'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
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
    <nav className='border-b bg-white shadow-lg'>
      <div className='w-full px-0 py-0'>
        <div className='flex h-16 w-full items-center justify-between'>
          <div className='ml-4 flex items-center'>
            <Link
              href='/'
              aria-label='Go to homepage'
              className='flex items-center'
            >
              {/* <Car className="h-8 w-8 text-red-600" /> */}
              <Image
                src='/TFS_logo.jpeg'
                alt='Logo'
                width={120}
                height={54}
                className='h-16 w-auto'
                priority
              />
            </Link>

            <div className='hidden md:ml-10 md:flex md:space-x-8'>
              <Link
                href='/'
                className='text-med px-3 py-2 text-gray-700 hover:text-red-600'
              >
                Home
              </Link>
              <Link
                href='/vehicles'
                className='text-med px-3 py-2 text-gray-700 hover:text-red-600'
              >
                Vehicles
              </Link>
              {user && (
                <Link
                  href='/dashboard'
                  className='text-med px-3 py-2 text-gray-700 hover:text-red-600'
                >
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  href='/admin'
                  className='text-med px-3 py-2 text-gray-700 hover:text-red-600'
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className='mr-4 flex items-center space-x-4'>
            {user ? (
              <div className='flex items-center space-x-4'>
                <span className='text-med text-gray-700'>
                  Welcome, {user.name}
                </span>
                <div className='flex items-center space-x-2'>
                  <Link href='/profile'>
                    <Button variant='ghost' size='sm'>
                      <User className='h-4 w-4' />
                    </Button>
                  </Link>
                  <Button variant='ghost' size='sm' onClick={handleLogout}>
                    <LogOut className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ) : (
              <div className='flex items-center space-x-2'>
                <Link href='/login'>
                  <Button variant='outline' size='sm'>
                    Login
                  </Button>
                </Link>
                <Link href='/register'>
                  <Button size='sm'>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
