'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/lib/auth/provider'

export function LandingThemeToggle() {
  const { theme, setTheme } = useTheme()
  const cycle = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }
  return (
    <button
      aria-label="Toggle theme"
      onClick={cycle}
      title={`Theme: ${theme}`}
      className="hidden md:grid size-9 place-items-center border border-white/20 text-white/60 transition-colors hover:border-white hover:text-white"
    >
      {theme === 'dark' ? <Moon size={15} /> : theme === 'light' ? <Sun size={15} /> : <Monitor size={15} />}
    </button>
  )
}
