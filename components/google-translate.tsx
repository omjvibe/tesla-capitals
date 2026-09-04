'use client'

import { useEffect, useState } from 'react'
import { Globe, ChevronDown } from 'lucide-react'

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: any
  }
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
]

export function GoogleTranslate({ minimal = false }: { minimal?: boolean }) {
  const [selected, setSelected] = useState('en')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Check if cookie exists
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/)
    if (match && match[1]) {
      setSelected(match[1])
    }

    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              autoDisplay: false,
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            },
            'google_translate_element'
          )
        }
      }

      const script = document.createElement('script')
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const changeLanguage = (langCode: string) => {
    setSelected(langCode)
    setOpen(false)

    if (langCode === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname
      window.location.reload()
      return
    }

    // Set Google Translate cookie
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${window.location.hostname}`
    document.cookie = `googtrans=/en/${langCode}; path=/`

    // Trigger select element if rendered
    const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement
    if (selectEl) {
      selectEl.value = langCode
      selectEl.dispatchEvent(new Event('change'))
    } else {
      window.location.reload()
    }
  }

  const currentLang = languages.find(l => l.code === selected) || languages[0]

  return (
    <div className="relative inline-block text-left">
      {/* Hidden google container */}
      <div id="google_translate_element" className="hidden" />

      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-bold transition-colors hover:border-primary ${
          minimal ? 'bg-black/40 text-white border-white/20 hover:border-white' : 'bg-card text-foreground'
        }`}
        title="Change language"
      >
        <Globe size={15} className="text-primary" />
        <span>{currentLang.flag}</span>
        {!minimal && <span className="hidden sm:inline">{currentLang.name}</span>}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 border border-border bg-card shadow-2xl backdrop-blur-xl">
          <div className="p-1">
            <p className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
              Select Language
            </p>
            {languages.map(l => (
              <button
                key={l.code}
                onClick={() => changeLanguage(l.code)}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-xs transition-colors hover:bg-primary hover:text-primary-foreground ${
                  selected === l.code ? 'font-bold text-primary bg-primary/10' : 'text-foreground'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
