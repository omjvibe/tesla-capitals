import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/lib/auth/provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tesla Capital | Invest in the Future',
  description: 'A modern investment platform for building your portfolio around the companies and ideas moving humanity forward.',
}

export const viewport: Viewport = { colorScheme: 'light dark', themeColor: '#d32f2f' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
