import React from 'react'
import Link from 'next/link'

export default function UserHome() {
  return (
    <section className='space-y-6'>
      <h1 className='text-2xl font-semibold'>Welcome</h1>
      <p className='text-neutral-600'>
        Homepage defaults to the payment estimator.
      </p>
      <Link
        href='/user/estimator'
        className='inline-block rounded-md bg-black px-4 py-2 text-white'
      >
        Open Payment Estimator
      </Link>
    </section>
  )
}
