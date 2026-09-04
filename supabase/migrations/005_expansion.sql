-- ============================================================
-- Tesla Capital — Schema Expansion (005_expansion.sql)
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Profiles expansion: Wallet balances, P&L, KYC mandate flag
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS btc_balance NUMERIC(16,8) DEFAULT 0.00000000,
  ADD COLUMN IF NOT EXISTS eth_balance NUMERIC(16,8) DEFAULT 0.00000000,
  ADD COLUMN IF NOT EXISTS usdt_balance NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS realized_pnl NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS unrealized_pnl NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS is_kyc_mandated BOOLEAN DEFAULT false;

-- 2. Stocks expansion: Icon URL
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- 3. Crypto deposit addresses (managed by admin)
CREATE TABLE IF NOT EXISTS crypto_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency TEXT NOT NULL UNIQUE, -- BTC, ETH, USDT, SOL
  network TEXT NOT NULL,         -- Bitcoin, Ethereum (ERC20), TRC20, Solana
  address TEXT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE crypto_addresses ENABLE ROW LEVEL SECURITY;

-- Policies for crypto_addresses
CREATE POLICY "Anyone can view active crypto addresses"
  ON crypto_addresses FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admin can manage crypto addresses"
  ON crypto_addresses FOR ALL
  USING (is_admin());

-- 4. Deposit requests
CREATE TABLE IF NOT EXISTS deposit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  tx_hash TEXT,
  proof_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
ALTER TABLE deposit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deposit requests"
  ON deposit_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own deposit requests"
  ON deposit_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all deposit requests"
  ON deposit_requests FOR ALL
  USING (is_admin());

-- 5. Withdrawal requests
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  destination_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawal requests"
  ON withdrawal_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawal requests"
  ON withdrawal_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all withdrawal requests"
  ON withdrawal_requests FOR ALL
  USING (is_admin());

-- 6. Resend Email Logs & Inbound Messages
CREATE TABLE IF NOT EXISTS resend_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_id TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_text TEXT,
  body_html TEXT,
  status TEXT DEFAULT 'sent',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE resend_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage resend emails"
  ON resend_emails FOR ALL
  USING (is_admin());

-- Seed initial crypto addresses if not present
INSERT INTO crypto_addresses (currency, network, address) VALUES
  ('BTC', 'Bitcoin Network', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'),
  ('ETH', 'Ethereum (ERC20)', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'),
  ('USDT', 'Tron (TRC20)', 'TXk28cK9xP9N4mF6VzW9g1aBc3dE5f6G7H'),
  ('SOL', 'Solana Network', '7xKXtg2CW87d97TXJSDyf1p5EdTMN32n5F2')
ON CONFLICT (currency) DO NOTHING;
