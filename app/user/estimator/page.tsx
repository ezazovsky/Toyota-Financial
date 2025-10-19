'use client'
import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { apiGet } from '../../../lib/api'
import { useAuth } from '../../providers/AuthProvider'
import { useRouter } from 'next/navigation'

type ToggleMode = 'finance' | 'lease'

const MODELS = [
  {
    name: 'Camry',
    trims: [
      { name: 'LE', engines: ['2.5L I4'] },
      { name: 'XSE', engines: ['3.5L V6'] }
    ]
  },
  {
    name: 'RAV4',
    trims: [
      { name: 'XLE', engines: ['2.5L I4'] },
      { name: 'Hybrid XSE', engines: ['2.5L Hybrid'] }
    ]
  },
  { name: 'Corolla', trims: [{ name: 'SE', engines: ['2.0L I4'] }] }
]

export default function Estimator() {
  const { user } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!user) router.replace('/login')
  }, [user, router])
  const [mode, setMode] = useState<ToggleMode>('finance')
  const [model, setModel] = useState<string>('')
  const [trim, setTrim] = useState<string>('')
  const [engine, setEngine] = useState<string>('')
  const [zipcode, setZipcode] = useState('')
  const [dealer, setDealer] = useState<{
    id: string
    name: string
    zip: string
    address: string
  } | null>(null)
  const [msrp, setMsrp] = useState<number>(32000)
  const [dph, setDph] = useState<number>(1095) // delivery, processing and handling

  // Right side inputs
  const [cashDown, setCashDown] = useState<number>(2000)
  const [term, setTerm] = useState<number>(60)
  const [credit, setCredit] = useState<number>(720)
  const [tradeIn, setTradeIn] = useState<number>(0)
  const [annualMiles, setAnnualMiles] = useState<number>(12000)
  const [localOffer, setLocalOffer] = useState<500 | 0>(0)

  const selectedModel = useMemo(
    () => MODELS.find(m => m.name === model),
    [model]
  )
  const selectedTrim = useMemo(
    () => selectedModel?.trims.find(t => t.name === trim),
    [selectedModel, trim]
  )

  const apr = useMemo(() => {
    // fake APR based on credit tier
    if (credit >= 760) return 2.9
    if (credit >= 700) return 3.9
    if (credit >= 640) return 5.9
    return 9.9
  }, [credit])

  const capCost = useMemo(
    () => Math.max(0, msrp + dph - cashDown - tradeIn - localOffer),
    [msrp, dph, cashDown, tradeIn, localOffer]
  )

  const monthly = useMemo(() => {
    // very simplified finance calculator: M = P * (r(1+r)^n)/((1+r)^n - 1)
    const r = apr / 100 / 12
    const n = term
    const P = capCost
    if (r === 0) return P / n
    const M = (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1)
    return M
  }, [apr, term, capCost])

  const leaseMonthly = useMemo(() => {
    // extremely simplified lease: (cap - residual)/term + rent charge
    const residualRate = 0.6 - Math.max(0, term - 24) * 0.003 // rough, for demo
    const residual = msrp * Math.max(0.45, residualRate)
    const moneyFactor = apr / 100 / 2400
    const base =
      Math.max(0, capCost - residual) / Math.max(24, Math.min(60, term))
    const rent = (capCost + residual) * moneyFactor
    return base + rent
  }, [capCost, msrp, apr, term])

  const estPayment = mode === 'finance' ? monthly : leaseMonthly

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      {/* Left sticky summary and selectors */}
      <div className='md:sticky md:top-20 md:h-[calc(100vh-140px)] md:overflow-hidden'>
        {/* Vehicle selector card */}
        <div className='space-y-4 rounded-lg border p-4'>
          <h2 className='text-lg font-medium'>Select your vehicle</h2>
          <div className='grid gap-3 sm:grid-cols-2'>
            <div>
              <label className='mb-1 block text-sm'>Model</label>
              <select
                className='w-full rounded-md border px-3 py-2'
                value={model}
                onChange={e => {
                  setModel(e.target.value)
                  setTrim('')
                  setEngine('')
                }}
              >
                <option value=''>Choose model</option>
                {MODELS.map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='mb-1 block text-sm'>Trim</label>
              <select
                className='w-full rounded-md border px-3 py-2'
                value={trim}
                onChange={e => {
                  setTrim(e.target.value)
                  setEngine('')
                }}
                disabled={!model}
              >
                <option value=''>Choose trim</option>
                {selectedModel?.trims.map(t => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='mb-1 block text-sm'>Engine</label>
              <select
                className='w-full rounded-md border px-3 py-2'
                value={engine}
                onChange={e => setEngine(e.target.value)}
                disabled={!trim}
              >
                <option value=''>Choose engine</option>
                {selectedTrim?.engines.map(e => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='mb-1 block text-sm'>Dealership by Zip</label>
              <div className='flex items-center gap-2'>
                <input
                  value={zipcode}
                  onChange={e => setZipcode(e.target.value)}
                  placeholder='e.g., 98052'
                  className='w-full rounded-md border px-3 py-2'
                />
                <button
                  type='button'
                  onClick={async () => {
                    if (!zipcode) return
                    try {
                      const res = await apiGet<any[]>(
                        `/dealerships?zip=${encodeURIComponent(zipcode)}`
                      )
                      setDealer(res[0] || null)
                    } catch (e) {
                      setDealer(null)
                    }
                  }}
                  className='rounded-md border px-3 py-2 text-sm whitespace-nowrap'
                >
                  Find
                </button>
              </div>
              {dealer && (
                <div className='mt-2 rounded-md border p-2 text-sm'>
                  <div className='font-medium'>{dealer.name}</div>
                  <div className='text-neutral-600'>{dealer.address}</div>
                </div>
              )}
            </div>
          </div>
          <div className='grid gap-3 sm:grid-cols-2'>
            <div>
              <label className='mb-1 block text-sm'>MSRP</label>
              <input
                type='number'
                value={msrp}
                onChange={e => setMsrp(Number(e.target.value) || 0)}
                className='w-full rounded-md border px-3 py-2'
              />
            </div>
            <div>
              <label className='mb-1 block text-sm'>DPH</label>
              <input
                type='number'
                value={dph}
                onChange={e => setDph(Number(e.target.value) || 0)}
                className='w-full rounded-md border px-3 py-2'
              />
            </div>
          </div>
        </div>

        {/* Selected car summary */}
        <div className='mt-4 space-y-3 rounded-lg border p-4'>
          <div className='flex items-start gap-4'>
            <div className='h-24 w-40 rounded-md bg-neutral-100' />
            <div>
              <div className='text-lg font-semibold'>
                {model || 'Model'}
                {trim ? ` ${trim}` : ''}
              </div>
              <div className='text-sm text-neutral-600'>
                {engine || 'Engine'}
              </div>
              <div className='text-sm'>
                MSRP + DPH:{' '}
                <span className='font-medium'>
                  ${(msrp + dph).toLocaleString()}
                </span>
              </div>
              <button className='mt-2 rounded-md border px-3 py-1.5 text-sm'>
                Change Vehicle
              </button>
            </div>
          </div>

          {/* Toggle */}
          <div className='mt-3 flex items-center gap-2'>
            <button
              onClick={() => setMode('finance')}
              className={`rounded-md px-3 py-1.5 text-sm ${mode === 'finance' ? 'bg-black text-white' : 'border'}`}
            >
              Finance
            </button>
            <button
              onClick={() => setMode('lease')}
              className={`rounded-md px-3 py-1.5 text-sm ${mode === 'lease' ? 'bg-black text-white' : 'border'}`}
            >
              Lease
            </button>
          </div>
        </div>

        {/* Bottom left rows */}
        {mode === 'finance' ? (
          <div className='mt-4 rounded-lg border p-4'>
            <div className='grid grid-cols-2 gap-3 text-sm sm:grid-cols-4'>
              <Info label='Payment/mo' value={`$${estPayment.toFixed(0)}`} />
              <Info label='Months' value={`${term}`} />
              <Info
                label='Due at signing'
                value={`$${Math.max(0, cashDown).toFixed(0)}`}
              />
              <Info label='Est. APR' value={`${apr.toFixed(1)}%`} />
            </div>
          </div>
        ) : (
          <div className='mt-4 rounded-lg border p-4'>
            <div className='grid grid-cols-2 gap-3 text-sm sm:grid-cols-4'>
              <Info label='Lease/mo' value={`$${estPayment.toFixed(0)}`} />
              <Info
                label='Months'
                value={`${Math.min(60, Math.max(24, term))}`}
              />
              <Info
                label='Due at signing'
                value={`$${Math.max(0, cashDown).toFixed(0)}`}
              />
              <Info
                label='Annual mileage'
                value={`${annualMiles.toLocaleString()}`}
              />
            </div>
            <div className='mt-3 text-sm text-neutral-600'>
              Seats: 5 • Doors: 4 • Drivetrain: FWD/AWD (sample)
            </div>
          </div>
        )}
      </div>

      {/* Right scrolling inputs and estimate */}
      <div className='md:h-[calc(100vh-140px)] md:overflow-y-auto md:pr-2'>
        <div className='space-y-4'>
          <div className='rounded-lg border p-4'>
            <div className='flex items-baseline justify-between'>
              <div>
                <div className='text-sm text-neutral-600'>
                  Estimated{' '}
                  {mode === 'finance' ? 'Monthly Payment' : 'Lease Payment'}
                </div>
                <div className='text-3xl font-semibold'>
                  ${estPayment.toFixed(0)}
                </div>
              </div>
            </div>
          </div>

          <ControlCard label='Cash down'>
            <div className='flex items-center gap-3'>
              <input
                type='number'
                className='w-40 rounded-md border px-3 py-2'
                value={cashDown}
                onChange={e =>
                  setCashDown(Math.max(0, Number(e.target.value) || 0))
                }
              />
              <input
                type='range'
                min={0}
                max={20000}
                step={500}
                value={cashDown}
                onChange={e => setCashDown(Number(e.target.value))}
                className='w-full'
              />
            </div>
          </ControlCard>

          <ControlCard label='Term length'>
            <div className='flex flex-wrap gap-2'>
              {(mode === 'finance'
                ? [24, 36, 48, 60, 72]
                : [24, 36, 48, 60]
              ).map(n => (
                <button
                  key={n}
                  onClick={() => setTerm(n)}
                  className={`rounded-md px-3 py-1.5 text-sm ${term === n ? 'bg-black text-white' : 'border'}`}
                >
                  {n} mo
                </button>
              ))}
            </div>
          </ControlCard>

          {mode === 'lease' && (
            <ControlCard label='Annual mileage'>
              <div className='flex flex-wrap gap-2'>
                {[10000, 12000, 15000].map(m => (
                  <button
                    key={m}
                    onClick={() => setAnnualMiles(m)}
                    className={`rounded-md px-3 py-1.5 text-sm ${annualMiles === m ? 'bg-black text-white' : 'border'}`}
                  >
                    {m.toLocaleString()}
                  </button>
                ))}
              </div>
            </ControlCard>
          )}

          <ControlCard label='Estimated credit score'>
            <div className='flex items-center gap-3'>
              <input
                type='range'
                min={500}
                max={850}
                step={10}
                value={credit}
                onChange={e => setCredit(Number(e.target.value))}
                className='w-full'
              />
              <span className='w-12 text-right text-sm'>{credit}</span>
            </div>
          </ControlCard>

          <ControlCard label='Trade-in value'>
            <input
              type='number'
              className='w-40 rounded-md border px-3 py-2'
              value={tradeIn}
              onChange={e =>
                setTradeIn(Math.max(0, Number(e.target.value) || 0))
              }
            />
          </ControlCard>

          <ControlCard label='Local offers'>
            <div className='flex items-center gap-3 text-sm'>
              <label className='inline-flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={localOffer === 500}
                  onChange={e => setLocalOffer(e.target.checked ? 500 : 0)}
                />
                <span>College or Military - $500</span>
              </label>
            </div>
          </ControlCard>

          <div className='flex justify-end'>
            <Link
              href='/user/review'
              className='rounded-md bg-black px-4 py-2 text-white'
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className='text-neutral-500'>{label}</div>
      <div className='font-medium'>{value}</div>
    </div>
  )
}

function ControlCard({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='rounded-lg border p-4'>
      <div className='mb-2 text-sm font-medium'>{label}</div>
      {children}
    </div>
  )
}
