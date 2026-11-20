-- ============================================================
-- Tesla Capital — VIP Tiers & Profile Alignment (011_profiles_vip_tier_check.sql)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Ensure all balance, pnl, and mandate columns exist on profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS btc_balance NUMERIC(16,8) DEFAULT 0.00000000,
  ADD COLUMN IF NOT EXISTS eth_balance NUMERIC(16,8) DEFAULT 0.00000000,
  ADD COLUMN IF NOT EXISTS usdt_balance NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS realized_pnl NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS unrealized_pnl NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS is_kyc_mandated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS vip_expires_at TIMESTAMPTZ;

-- 2. Drop legacy restrictive vip_tier check constraint if present and update to all 5 platform tiers
DO $$
BEGIN
  -- Drop any existing check constraint matching vip_tier on profiles
  EXECUTE (
    SELECT 'ALTER TABLE profiles DROP CONSTRAINT ' || quote_ident(conname) || ';'
    FROM pg_constraint
    WHERE conrelid = 'profiles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%vip_tier%'
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_vip_tier_check;

ALTER TABLE profiles 
  ADD CONSTRAINT profiles_vip_tier_check 
  CHECK (vip_tier IN ('standard', 'bronze', 'silver', 'gold', 'platinum', 'vip'));
