'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'

export function BreakingRoadsterBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <aside
      aria-label="Roadster SpaceX Announcement"
      className="relative z-50 border-b border-white/10 bg-black/90 px-4 py-2 text-white text-xs backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex size-1.5 rounded-full bg-primary animate-ping shrink-0" />
          <p className="truncate text-white/80 font-sans">
            <span className="font-semibold text-white">Next-Gen Roadster with SpaceX Thruster Package:</span> Premium VIP Exclusive ($2k+) with 15% member discount.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <a
            href="#roadster-unveil"
            className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-primary hover:text-white transition-colors"
          >
            <span>Learn more</span>
            <ArrowRight size={12} />
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/40 hover:text-white transition-colors"
            title="Dismiss announcement"
            aria-label="Dismiss announcement"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </aside>
  )
}
