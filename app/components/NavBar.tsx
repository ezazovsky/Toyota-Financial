import React from 'react'

export default function NavBar() {
  return (
    <header className="w-full border-b bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <a href="/" className="text-xl font-semibold">Toyota Financial</a>
        <nav>
          <a href="/" className="mr-4 text-neutral-700 hover:text-neutral-900">Home</a>
          <a href="/finance" className="text-neutral-700 hover:text-neutral-900">Finance</a>
        </nav>
      </div>
    </header>
  )
}
