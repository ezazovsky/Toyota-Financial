import React from "react"
import FinanceDashboard from "./components/FinanceDashboard"

export const metadata = {
  title: "Finance",
  description: "Finance tools and dashboards",
}

export default function FinancePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Finance</h1>
      <p className="mt-2 text-neutral-600">Overview and tools for financial data.</p>
      <div className="mt-6">
        <FinanceDashboard />
      </div>
    </div>
  )
}
