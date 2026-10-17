'use client'

import { ShoppingBag, HeartHandshake, Sparkles, Store, MapPin, BadgePercent, Check } from 'lucide-react'

interface ComplimentsQuestionProps {
  value: string[]
  onChange: (value: string[]) => void
}

const COMPLIMENT_OPTIONS = [
  { key: 'collection', label: 'Trendy Collections', icon: ShoppingBag, desc: 'Huge variety for men, women & kids' },
  { key: 'service', label: 'Helpful Staff', icon: HeartHandshake, desc: 'Polite, attentive floor assistance' },
  { key: 'ambience', label: 'Comfortable Store', icon: Store, desc: 'Clean, spacious & well-arranged' },
  { key: 'location', label: 'Convenient Location', icon: MapPin, desc: 'Opp. Mausam Vibhag above Lenskart' },
  { key: 'value', label: 'Great Value & Offers', icon: BadgePercent, desc: 'Pocket-friendly prices & deals' },
  { key: 'quality', label: 'Durable Quality', icon: Sparkles, desc: 'Premium fabrics and household goods' },
]

export default function ComplimentsQuestion({ value, onChange }: ComplimentsQuestionProps) {
  const toggleOption = (key: string) => {
    if (value.includes(key)) {
      onChange(value.filter((k) => k !== key))
    } else {
      onChange([...value, key])
    }
  }

  return (
    <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-900">
            Question 4 of 6
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-[11px] text-amber-800 font-medium">Optional</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          What did you{' '}
          <span className="bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
            enjoy most
          </span>
          ?
        </h2>
        <p className="text-sm text-stone-600">
          Select highlights that stood out during your visit to Dream Bazaar
        </p>
      </div>

      {/* 2-Column Grid of Toggleable Cards */}
      <div
        role="group"
        aria-label="Compliments and highlights"
        className="py-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left"
      >
        {COMPLIMENT_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isSelected = value.includes(opt.key)

          return (
            <button
              key={opt.key}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggleOption(opt.key)}
              aria-label={`${opt.label}: ${opt.desc}`}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all duration-200 cursor-pointer active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-xs ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/90 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : 'border-stone-200 bg-stone-50/60 hover:bg-white hover:border-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                    isSelected ? 'bg-amber-600 text-white shadow-xs' : 'bg-stone-200/70 text-stone-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-xs font-bold ${isSelected ? 'text-amber-950' : 'text-stone-800'}`}>
                    {opt.label}
                  </div>
                  <div className="text-[10px] text-stone-500">{opt.desc}</div>
                </div>
              </div>

              {/* Checkbox Icon */}
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ml-2 ${
                  isSelected
                    ? 'border-amber-600 bg-amber-600 text-white'
                    : 'border-stone-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
