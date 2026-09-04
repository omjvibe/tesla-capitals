'use client'

import { useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types'

export function NotificationsClient({ notifications: initial, userId }: { notifications: Notification[]; userId: string }) {
  const [items, setItems] = useState<Notification[]>(initial)

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllRead = async () => {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId)
    setItems(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  return (
    <PlatformShell>
      <div className="flex items-center justify-between border-b border-border pb-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Alerts</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Notifications</h1>
        </div>
        {items.some(n => !n.is_read) && (
          <button onClick={markAllRead} className="border border-border px-4 py-2 text-xs font-bold hover:border-primary">
            Mark all as read
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <div className="mt-8 space-y-3">
          {items.map(n => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`cursor-pointer border p-5 transition-colors ${n.is_read ? 'border-border bg-card opacity-70' : 'border-primary bg-primary/5'}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold">{n.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-3 font-mono text-[10px] text-muted-foreground">
                    {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.is_read && <span className="size-2 bg-primary" />}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <Bell size={40} className="mx-auto text-muted-foreground" />
          <p className="mt-4 text-lg font-bold">No notifications</p>
          <p className="mt-2 text-sm text-muted-foreground">You are all caught up.</p>
        </div>
      )}
    </PlatformShell>
  )
}
