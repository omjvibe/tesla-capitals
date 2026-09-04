'use client'

import { useEffect, useState } from 'react'

export function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate).getTime() - new Date().getTime()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / 1000 / 60) % 60)
      const seconds = Math.floor((diff / 1000) % 60)
      setTimeLeft({ days, hours, minutes, seconds })
    }

    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <div className="flex flex-col items-center border border-border bg-background px-2.5 py-1.5 min-w-[45px]">
        <span className="text-sm font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-[9px] uppercase text-muted-foreground">Days</span>
      </div>
      <span className="font-bold text-primary animate-pulse">:</span>
      <div className="flex flex-col items-center border border-border bg-background px-2.5 py-1.5 min-w-[45px]">
        <span className="text-sm font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[9px] uppercase text-muted-foreground">Hrs</span>
      </div>
      <span className="font-bold text-primary animate-pulse">:</span>
      <div className="flex flex-col items-center border border-border bg-background px-2.5 py-1.5 min-w-[45px]">
        <span className="text-sm font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-[9px] uppercase text-muted-foreground">Min</span>
      </div>
      <span className="font-bold text-primary animate-pulse">:</span>
      <div className="flex flex-col items-center border border-border bg-background px-2.5 py-1.5 min-w-[45px]">
        <span className="text-sm font-bold text-primary">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-[9px] uppercase text-muted-foreground">Sec</span>
      </div>
    </div>
  )
}
