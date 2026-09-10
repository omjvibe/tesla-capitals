import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { AuthProvider, ThemeProvider } from '@/lib/auth/provider'
import { ToastProvider } from '@/components/ui/toast'
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
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
        
        {/* Smartsupp Live Chat Script */}
        <Script
          id="smartsupp-chat"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var _smartsupp = _smartsupp || {};
              _smartsupp.key = 'c05be36e24ee807115b86998797a8d2b55e08c7a';
              window.smartsupp||(function(d) {
                var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
                s=d.getElementsByTagName('script')[0];c=d.createElement('script');
                c.type='text/javascript';c.charset='utf-8';c.async=true;
                c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
              })(document);
            `,
          }}
        />
      </body>
    </html>
  )
}
