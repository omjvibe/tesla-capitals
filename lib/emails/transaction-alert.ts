import { createAdminClient } from '@/lib/supabase/admin'

export interface TransactionAlertParams {
  userId: string
  to: string
  userName?: string | null
  type: 'deposit' | 'withdrawal'
  amount: number
  newBalance: number
  currency?: string
  referenceId?: string
  description?: string
}

export function generateTransactionAlertHtml(params: {
  userName: string
  type: 'deposit' | 'withdrawal'
  amount: number
  newBalance: number
  currency: string
  referenceId: string
  dateStr: string
  appUrl: string
}) {
  const { userName, type, amount, newBalance, currency, referenceId, dateStr, appUrl } = params
  const isDeposit = type === 'deposit'

  const formattedAmount = (isDeposit ? '+' : '-') + ' $' + Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ` ${currency}`

  const formattedBalance = '$' + newBalance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ` ${currency}`

  const title = isDeposit ? 'Deposit Confirmed' : 'Withdrawal Processed'
  const headline = isDeposit ? 'Funds Credited to Your Account' : 'Funds Debited from Your Account'
  const badgeColor = isDeposit ? '#10b981' : '#ef4444'
  const badgeBg = isDeposit ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'
  const badgeBorder = isDeposit ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'

  const leadText = isDeposit
    ? `Your deposit has been verified and settled. The funds are immediately available in your liquid balance for portfolio allocation and platform investments.`
    : `A withdrawal request has been completed and debited from your liquid balance. The updated balance is reflected across your portfolio.`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #f4f4f5; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #0c0c0e; border: 1px solid #27272a; border-radius: 4px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Brand Header -->
          <tr>
            <td style="padding: 32px 36px 20px; border-bottom: 1px solid #1f1f23; background: linear-gradient(180deg, #121215 0%, #0c0c0e 100%);">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: #e5e5e5; font-weight: 700;">TESLA CAPITAL</span>
                  </td>
                  <td align="right">
                    <span style="font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #71717a; border: 1px solid #27272a; padding: 3px 8px; border-radius: 2px;">OFFICIAL NOTICE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              
              <!-- Badge -->
              <div style="display: inline-block; padding: 4px 12px; background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; color: ${badgeColor}; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 2px; margin-bottom: 16px; font-family: 'SF Mono', Monaco, monospace;">
                ${title}
              </div>

              <!-- Headline -->
              <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em; line-height: 1.25;">
                ${headline}
              </h1>

              <!-- Greeting & Lead -->
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                Hello <strong style="color: #f4f4f5;">${userName}</strong>,<br>
                ${leadText}
              </p>

              <!-- Transaction Summary Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070708; border: 1px solid #27272a; border-radius: 4px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px 24px; border-bottom: 1px solid #1a1a1e;">
                    <span style="font-family: 'SF Mono', Monaco, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #71717a; display: block; margin-bottom: 6px;">Transaction Amount</span>
                    <span style="font-family: 'SF Mono', Monaco, monospace; font-size: 26px; font-weight: 700; color: ${badgeColor}; letter-spacing: -0.01em;">
                      ${formattedAmount}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 24px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #71717a;">Available Balance</td>
                        <td align="right" style="padding: 6px 0; font-family: 'SF Mono', Monaco, monospace; font-size: 13px; font-weight: 600; color: #e5e5e5;">${formattedBalance}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #71717a;">Transaction Type</td>
                        <td align="right" style="padding: 6px 0; font-family: 'SF Mono', Monaco, monospace; font-size: 12px; font-weight: 600; color: #e5e5e5; text-transform: uppercase;">${isDeposit ? 'Deposit / Credit' : 'Withdrawal / Debit'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #71717a;">Reference ID</td>
                        <td align="right" style="padding: 6px 0; font-family: 'SF Mono', Monaco, monospace; font-size: 12px; color: #a1a1aa;">${referenceId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #71717a;">Date & Time</td>
                        <td align="right" style="padding: 6px 0; font-size: 12px; color: #a1a1aa;">${dateStr}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #71717a;">Status</td>
                        <td align="right" style="padding: 6px 0; font-family: 'SF Mono', Monaco, monospace; font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase;">SETTLED</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <a href="${appUrl}/wallet" style="display: inline-block; background-color: #ffffff; color: #000000; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; padding: 13px 28px; border-radius: 2px;">
                      View Wallet & Transactions &rarr;
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Security Footer -->
          <tr>
            <td style="padding: 24px 36px 32px; background-color: #070709; border-top: 1px solid #1a1a1e;">
              <p style="margin: 0 0 12px 0; font-size: 11px; line-height: 1.6; color: #71717a;">
                <strong style="color: #a1a1aa;">Security Notice:</strong> This is an automated financial transaction alert dispatched immediately upon balance settlement. If you did not recognize or authorize this transaction, please secure your account immediately and contact Treasury Services at <a href="mailto:support@teslacapitals.app" style="color: #a1a1aa; text-decoration: underline;">support@teslacapitals.app</a>.
              </p>
              <p style="margin: 0; font-size: 10px; color: #52525b; font-family: 'SF Mono', Monaco, monospace; text-transform: uppercase; letter-spacing: 0.05em;">
                &copy; ${new Date().getFullYear()} Tesla Capital Inc. Institutional Financial Services.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export async function sendTransactionAlertEmail(params: TransactionAlertParams): Promise<{ success: boolean; resendId?: string | null; error?: string }> {
  try {
    const {
      userId,
      to,
      userName,
      type,
      amount,
      newBalance,
      currency = 'USD',
      referenceId = `TSL-${type === 'deposit' ? 'DEP' : 'WTH'}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      description,
    } = params

    if (!to || !amount) {
      return { success: false, error: 'Recipient email and amount are required' }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://teslacapitals.app'
    const isDeposit = type === 'deposit'
    const name = userName?.trim() || to.split('@')[0]
    const dateStr = new Date().toUTCString()

    const subject = isDeposit
      ? `Transaction Alert: $${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD Deposited`
      : `Transaction Alert: $${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD Withdrawal Processed`

    const html = generateTransactionAlertHtml({
      userName: name,
      type,
      amount,
      newBalance,
      currency,
      referenceId,
      dateStr,
      appUrl,
    })

    const resendApiKey = process.env.RESEND_API_KEY
    let resendId: string | null = null
    let sendError: string | null = null

    if (resendApiKey) {
      const primaryFrom = process.env.RESEND_FROM_EMAIL || 'Tesla Capital <support@teslacapitals.app>'
      const fallbackFrom = 'Tesla Capital <onboarding@resend.dev>'

      async function attemptDispatch(fromAddr: string) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddr,
            to: [to],
            subject,
            html,
          }),
        })
        const data = await res.json().catch(() => ({}))
        return { ok: res.ok, status: res.status, data }
      }

      try {
        const firstTry = await attemptDispatch(primaryFrom)
        if (firstTry.ok && firstTry.data?.id) {
          resendId = firstTry.data.id
        } else {
          sendError = firstTry.data?.message || `Resend error HTTP ${firstTry.status}`
          console.warn('[Transaction Alert] First attempt failed with sender:', primaryFrom, sendError)

          // If domain is unverified, automatically retry with Resend sandbox testing domain
          if (
            primaryFrom !== fallbackFrom &&
            (firstTry.status === 403 || sendError?.toLowerCase().includes('not verified') || sendError?.toLowerCase().includes('domain'))
          ) {
            console.log('[Transaction Alert] Attempting fallback sender:', fallbackFrom)
            const secondTry = await attemptDispatch(fallbackFrom)
            if (secondTry.ok && secondTry.data?.id) {
              resendId = secondTry.data.id
              sendError = null
            } else {
              sendError = secondTry.data?.message || `Resend error HTTP ${secondTry.status}`
              console.warn('[Transaction Alert] Fallback attempt also failed:', sendError)
            }
          }
        }
      } catch (networkErr: unknown) {
        sendError = networkErr instanceof Error ? networkErr.message : 'Network error reaching Resend API'
        console.warn('[Transaction Alert] Network error while calling Resend:', sendError)
      }
    } else {
      sendError = 'RESEND_API_KEY is not configured in server environment.'
      console.warn('[Transaction Alert]', sendError)
    }

    // Use adminSupabase to log email and record in-app notification
    const admin = createAdminClient()

    // 1. Log to resend_emails
    try {
      await admin.from('resend_emails').insert({
        direction: 'outbound',
        from_email: resendId ? (process.env.RESEND_FROM_EMAIL || 'support@teslacapitals.app') : 'support@teslacapitals.app',
        to_email: to,
        subject,
        body_html: html,
        status: resendId ? 'sent' : (resendApiKey ? 'failed' : 'simulated'),
        resend_id: resendId,
        metadata: {
          template: isDeposit ? 'deposit_confirmation' : 'withdrawal_confirmation',
          reference_id: referenceId,
          type,
          amount,
          new_balance: newBalance,
          error: sendError || null,
        },
      })
    } catch (logErr) {
      console.warn('[Transaction Alert] Could not write to resend_emails:', logErr)
    }

    // 2. Fallback sync to email_logs
    try {
      await admin.from('email_logs').insert({
        direction: 'outbound',
        from_email: 'support@teslacapitals.app',
        to_email: to,
        recipient: to,
        subject,
        template: isDeposit ? 'deposit_confirmation' : 'withdrawal_confirmation',
        status: resendId ? 'sent' : (resendApiKey ? 'failed' : 'simulated'),
        resend_id: resendId,
      })
    } catch {
      // Ignore if email_logs table does not exist
    }

    // 3. Create in-app notification for the user
    try {
      await admin.from('notifications').insert({
        user_id: userId,
        title: isDeposit ? 'Deposit Settled' : 'Withdrawal Processed',
        message: isDeposit
          ? `Your liquid wallet has been credited with $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD.`
          : `A withdrawal of $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD has been processed from your balance.`,
        type: isDeposit ? 'deposit' : 'withdrawal',
        link: '/wallet',
      })
    } catch (notifErr) {
      console.warn('[Transaction Alert] Could not write notification:', notifErr)
    }

    return {
      success: !!resendId,
      resendId,
      error: sendError || undefined,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[sendTransactionAlertEmail Error]', message)
    return { success: false, error: message }
  }
}
