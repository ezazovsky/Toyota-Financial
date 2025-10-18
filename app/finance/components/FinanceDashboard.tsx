"use client"

import React from "react"

type Tx = { id: string; date: string; amount: number; category: string }

const sample: Tx[] = [
  { id: "1", date: "2025-10-01", amount: 1240.5, category: "Revenue" },
  { id: "2", date: "2025-10-05", amount: -420.0, category: "Expense" },
  { id: "3", date: "2025-10-09", amount: 980.0, category: "Revenue" },
  { id: "4", date: "2025-10-12", amount: -140.25, category: "Expense" },
]

function currency(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" })
}

export default function FinanceDashboard() {
  const [filter, setFilter] = React.useState<string>("all")

  const rows = sample.filter((r) => filter === "all" || r.category === filter)
  const total = rows.reduce((s, r) => s + r.amount, 0)

  return (
    <section className="rounded-lg border p-4 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Summary</h2>
          <p className="text-sm text-neutral-600">Transactions ({rows.length})</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-neutral-500">Total</div>
            <div className="text-xl font-semibold">{currency(total)}</div>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded border px-2 py-1"
          >
            <option value="all">All</option>
            <option value="Revenue">Revenue</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm text-neutral-600">
              <th className="pb-2">Date</th>
              <th className="pb-2">Category</th>
              <th className="pb-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2 text-sm">{r.date}</td>
                <td className="py-2 text-sm">{r.category}</td>
                <td className={`py-2 text-sm ${r.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {currency(r.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
