import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Brand } from '@/components/platform-shell'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-12 md:px-16 lg:px-32">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-border pb-8">
          <Brand />
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Return to Home
          </Link>
        </div>

        <div className="mt-12 space-y-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Data Protection & Privacy</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Privacy Policy</h1>
            <p className="mt-2 text-xs text-muted-foreground">Last Updated: January 2026 · Tesla Capital Platforms Inc.</p>
          </div>

          <section className="space-y-4 text-sm leading-7 text-muted-foreground">
            <h2 className="text-xl font-bold text-foreground">1. Data Collection Overview</h2>
            <p>
              We collect personal identifying information (full name, email, identity documents for KYC compliance) and transactional telemetry to operate our digital wealth ecosystem safely.
            </p>

            <h2 className="text-xl font-bold text-foreground">2. Use of Information</h2>
            <p>
              Your data is utilized solely for account authentication, portfolio settlement, regulatory compliance reporting, and sending critical transactional alerts via our encrypted Resend email servers.
            </p>

            <h2 className="text-xl font-bold text-foreground">3. Security & Storage</h2>
            <p>
              All personal sensitive files are encrypted at rest using AES-256 and stored behind strict Row Level Security (RLS) policies within Supabase infrastructure.
            </p>

            <h2 className="text-xl font-bold text-foreground">4. Third-Party Integration</h2>
            <p>
              Social authentication data provided through Google OAuth and X / Twitter OAuth is strictly handled according to provider privacy guidelines and never sold to third parties.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
