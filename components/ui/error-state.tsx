'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './button'

interface ErrorStateProps {
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function ErrorState({ 
  title = "Something went wrong",
  message = "We encountered an error. Please try again.",
  action
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 p-8 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  )
}

interface ErrorBoundaryFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorBoundaryFallback({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <ErrorState
          title="Application Error"
          message={error.message || "An unexpected error occurred. Please refresh the page and try again."}
          action={{
            label: "Try Again",
            onClick: resetErrorBoundary
          }}
        />
      </div>
    </div>
  )
}
