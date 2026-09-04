import type { Metadata, Viewport } from 'next'
import { AuthProvider, ThemeProvider } from '@/lib/auth/provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tesla Capital | Invest in the Future',
  description: 'A modern investment platform for building your portfolio around the companies and ideas moving humanity forward.',
}

export const viewport: Viewport = { colorScheme: 'light dark', themeColor: '#d32f2f' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevents flash of wrong theme on load */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('tc-theme') || 'system';
              var d = t === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t;
              document.documentElement.classList.add(d);
            } catch(e){}
          })()
        ` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
