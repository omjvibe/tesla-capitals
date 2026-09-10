-- ============================================================
-- Tesla Capital — Giveaway Enhancements (008_giveaway_enhancements.sql)
-- Adds: entry fees, max entries, VIP tier eligibility, admin-selected participants
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. EXTEND GIVEAWAYS TABLE
ALTER TABLE giveaways ADD COLUMN IF NOT EXISTS entry_fee NUMERIC(10,2) DEFAULT 0;
ALTER TABLE giveaways ADD COLUMN IF NOT EXISTS max_entries INTEGER;
ALTER TABLE giveaways ADD COLUMN IF NOT EXISTS eligible_tiers TEXT[];
ALTER TABLE giveaways ADD COLUMN IF NOT EXISTS prize_value NUMERIC(12,2);
ALTER TABLE giveaways ADD COLUMN IF NOT EXISTS prize_description TEXT;

-- 2. EXTEND GIVEAWAY_ENTRIES TABLE
ALTER TABLE giveaway_entries ADD COLUMN IF NOT EXISTS is_admin_selected BOOLEAN DEFAULT false;
ALTER TABLE giveaway_entries ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE giveaway_entries ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. RLS: Allow users to insert their own entries (for the API route)
-- We need INSERT policy on giveaway_entries for authenticated users
DROP POLICY IF EXISTS "Users can enter giveaways" ON giveaway_entries;
CREATE POLICY "Users can enter giveaways"
  ON giveaway_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. RLS: Users can view their own entries
DROP POLICY IF EXISTS "Users can view own entries" ON giveaway_entries;
CREATE POLICY "Users can view own entries"
  ON giveaway_entries FOR SELECT
  USING (auth.uid() = user_id);

-- 5. RLS: Admin full access on giveaway_entries
DROP POLICY IF EXISTS "Admin can manage giveaway entries" ON giveaway_entries;
CREATE POLICY "Admin can manage giveaway entries"
  ON giveaway_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_giveaway_entries_giveaway ON giveaway_entries(giveaway_id, user_id);
CREATE INDEX IF NOT EXISTS idx_giveaways_status ON giveaways(status, ends_at);
