'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface ToastContextType {
  toast: (title: string, description?: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const toast = useCallback((title: string, description?: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, title, description, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const remove = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 border p-4 shadow-2xl backdrop-blur-xl animate-toast ${
              t.type === 'success'
                ? 'border-green-500/30 bg-card text-foreground'
                : t.type === 'error'
                ? 'border-primary/50 bg-card text-foreground'
                : 'border-border bg-card text-foreground'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />}
            {t.type === 'error' && <AlertCircle className="text-primary shrink-0 mt-0.5" size={18} />}
            {t.type === 'info' && <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-none">{t.title}</p>
              {t.description && <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{t.description}</p>}
            </div>
            <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
