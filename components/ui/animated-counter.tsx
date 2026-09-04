'use client'

import { useEffect, useRef, useState } from 'react'

export function AnimatedCounter({ end, duration = 2000, prefix = '', suffix = '' }: { end: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const nodeRef = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = nodeRef.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true
        let startTimestamp: number | null = null

        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp
          const progress = Math.min((timestamp - startTimestamp) / duration, 1)
          // Ease out cubic
          const easedProgress = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(easedProgress * end))
          if (progress < 1) {
            window.requestAnimationFrame(step)
          }
        }
        window.requestAnimationFrame(step)
      }
    }, { threshold: 0.2 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration])

  return (
    <span ref={nodeRef} className="font-mono font-bold">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}
