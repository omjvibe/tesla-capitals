# Supabase Auth Custom Email Templates — Tesla Capitals

This directory contains production-ready, ultra-luxury dark mode HTML email templates for all Supabase Authentication events.

## Templates Included

1. **Confirm Signup / Email Verification**: [`confirm_signup.html`](./confirm_signup.html)
2. **Reset Password / Password Recovery**: [`reset_password.html`](./reset_password.html)
3. **Magic Link / OTP Sign-In**: [`magic_link.html`](./magic_link.html)
4. **Change Email Verification**: [`change_email.html`](./change_email.html)
5. **Invite User**: [`invite_user.html`](./invite_user.html)

---

## How to Install in Supabase Dashboard

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your Tesla Capitals project.
3. Navigate to **Authentication** &rarr; **Email Templates** in the sidebar.
4. For each email template tab:
   - **Confirm signup**: Open [`confirm_signup.html`](./confirm_signup.html), copy all HTML content, paste into the Body editor in Supabase, and click **Save**.
   - **Reset password**: Open [`reset_password.html`](./reset_password.html), copy all HTML content, paste into Body editor, and click **Save**.
   - **Magic link**: Open [`magic_link.html`](./magic_link.html), copy all HTML content, paste into Body editor, and click **Save**.
   - **Change email address**: Open [`change_email.html`](./change_email.html), copy all HTML content, paste into Body editor, and click **Save**.
   - **User invite**: Open [`invite_user.html`](./invite_user.html), copy all HTML content, paste into Body editor, and click **Save**.

---

## Customizing Logo / Image URL (Optional)

If you wish to display an image logo instead of the stylized text badge `TESLA.CAPITALS`:
1. Host your logo image publicly (e.g. `https://teslacapitals.app/tesla-seeklogo.png`).
2. Replace the text container in the `<td align="center">` section of the HTML template with:

```html
<img src="https://teslacapitals.app/tesla-seeklogo.png" alt="Tesla Capitals Logo" width="160" style="display: block; border: 0; outline: none; text-decoration: none;" />
```

---

## Email Client Compatibility
- Outlook 2016 / 2019 / 365 (Windows & Mac)
- Apple Mail (iOS & macOS)
- Gmail (Desktop, Android & iOS)
- Yahoo Mail & Webmail
