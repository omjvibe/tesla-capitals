# Supabase Auth Email Templates — Tesla Capital

These email templates have been redesigned from the ground up to **100% match Tesla Capital's exact site design language**:

- **Color System**: Pure dark background (`#0a0a0a`), deep dark cards (`#141414`), sharp muted borders (`#1f1f1f`), and signature Tesla Red (`#e53935`).
- **Typography & Geometry**: Sharp 0px border-radius, monospaced uppercase category tags (`font-family: monospace; letter-spacing: 2.5px; color: #e53935;`), crisp white headers (`#ffffff`), and monospace metadata footers.
- **Brand Header**: Matches the site header branding (`TESLA CAPITAL` with monospaced letter spacing).
- **CTA Buttons**: Solid `#e53935` red rectangular action buttons with uppercase monospaced text (`CONFIRM EMAIL ADDRESS ->`).

---

## File List

1. **Confirm Email / Registration**: [`confirm_signup.html`](./confirm_signup.html)
2. **Reset Password / Password Recovery**: [`reset_password.html`](./reset_password.html)
3. **Magic Link / One-Time Access**: [`magic_link.html`](./magic_link.html)
4. **Change Email Verification**: [`change_email.html`](./change_email.html)
5. **Account Invitation**: [`invite_user.html`](./invite_user.html)

---

## How to Apply in Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **Authentication** &rarr; **Email Templates**.
3. Copy the HTML content from each file in `supabase/templates/` and paste into the corresponding email template **Body** field.
4. Click **Save**.
