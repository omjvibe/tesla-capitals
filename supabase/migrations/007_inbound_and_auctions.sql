-- ============================================================
-- Tesla Capital — Inbound Emails & Vehicle Auctions (007_inbound_and_auctions.sql)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. RESEND EMAILS TABLE ENHANCEMENT & EMAIL LOGS COMPATIBILITY
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
  in_reply_to TEXT,
  thread_id UUID,
  is_read BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resend_emails ADD COLUMN IF NOT EXISTS in_reply_to TEXT;
ALTER TABLE resend_emails ADD COLUMN IF NOT EXISTS thread_id UUID;
ALTER TABLE resend_emails ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE resend_emails ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::JSONB;

ALTER TABLE resend_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage resend emails" ON resend_emails;
CREATE POLICY "Admin can manage resend emails"
  ON resend_emails FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Backward compatibility for code referencing email_logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_id TEXT,
  direction TEXT DEFAULT 'outbound',
  from_email TEXT DEFAULT 'support@teslacapitals.app',
  to_email TEXT,
  recipient TEXT,
  subject TEXT NOT NULL,
  body_text TEXT,
  body_html TEXT,
  template TEXT,
  status TEXT DEFAULT 'sent',
  metadata JSONB DEFAULT '{}',
  in_reply_to TEXT,
  thread_id UUID,
  is_read BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage email logs" ON email_logs;
CREATE POLICY "Admin can manage email logs"
  ON email_logs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. VEHICLE & ASSET AUCTIONS TABLE
CREATE TABLE IF NOT EXISTS auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  gallery_urls JSONB DEFAULT '[]'::JSONB,
  starting_price NUMERIC(12,2) NOT NULL,
  reserve_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  current_bid NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  min_bid_increment NUMERIC(12,2) NOT NULL DEFAULT 500.00,
  buy_now_price NUMERIC(12,2),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('draft', 'upcoming', 'live', 'ended', 'cancelled')),
  winner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  winning_bid NUMERIC(12,2),
  total_bids INTEGER DEFAULT 0,
  anti_snipe_seconds INTEGER DEFAULT 120,
  specs JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view auctions" ON auctions;
DROP POLICY IF EXISTS "Admin can manage auctions" ON auctions;

CREATE POLICY "Anyone can view auctions"
  ON auctions FOR SELECT
  USING (status IN ('live', 'upcoming', 'ended') OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can manage auctions"
  ON auctions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. AUCTION BIDS TABLE (AUDIT TRAIL & LIVE FEED)
CREATE TABLE IF NOT EXISTS auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'outbid', 'won', 'retracted')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE auction_bids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view auction bids" ON auction_bids;
DROP POLICY IF EXISTS "Authenticated users can place bids" ON auction_bids;
DROP POLICY IF EXISTS "Admin can manage all auction bids" ON auction_bids;

CREATE POLICY "Anyone can view auction bids"
  ON auction_bids FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can place bids"
  ON auction_bids FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all auction bids"
  ON auction_bids FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Helpful Indexes
CREATE INDEX IF NOT EXISTS idx_auctions_status_ends ON auctions(status, ends_at);
CREATE INDEX IF NOT EXISTS idx_auction_bids_auction ON auction_bids(auction_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resend_emails_direction ON resend_emails(direction, created_at DESC);

-- 4. SEED SAMPLE RARE COLLECTOR AUCTIONS
INSERT INTO auctions (
  title,
  subtitle,
  description,
  image_url,
  gallery_urls,
  starting_price,
  reserve_price,
  current_bid,
  min_bid_increment,
  buy_now_price,
  starts_at,
  ends_at,
  status,
  total_bids,
  specs
) VALUES
  (
    '2026 Cybertruck Cyberbeast Foundation Series #001',
    'Tri-Motor AWD &bull; Laser Etched VIN 00001 &bull; 845 HP',
    'The premier production serial number of the flagship Cybertruck Cyberbeast Foundation Series. Finished in factory raw stainless steel with custom tactical blackout wheels, Full Self-Driving (Supervised) lifetime capability, and Foundation Series badging. Delivered in factory-preserved museum condition with only 12 delivery miles.',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&auto=format&fit=crop&q=80"]'::JSONB,
    95000.00,
    115000.00,
    118500.00,
    1000.00,
    145000.00,
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '3 days',
    'live',
    7,
    '{"0-60 mph": "2.6s (Beast Mode)", "Top Speed": "130 mph", "Range": "320 mi est.", "Peak Power": "845 hp", "Towing Capacity": "11,000 lbs", "VIN": "7G2CEBEA8RA000001", "Odometer": "12 miles"}'::JSONB
  ),
  (
    '2026 Model S Plaid — Apex Carbon Track Edition',
    'Tri-Motor 1,020 HP &bull; Carbon-Ceramic Brakes &bull; Ultra Red',
    'Configured with the official Tesla Carbon Ceramic Brake Package, 20" Zero-G Track Wheels with Goodyear Eagle F1 Supercar 3R tires, and track software unlock capable of 200 mph. Finished in multi-coat Ultra Red with Cream Premium interior and carbon fiber decor.',
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&auto=format&fit=crop&q=80"]'::JSONB,
    89000.00,
    105000.00,
    106500.00,
    1000.00,
    130000.00,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '4 days',
    'live',
    4,
    '{"0-60 mph": "1.99s", "Top Speed": "200 mph", "Range": "359 mi", "Peak Power": "1,020 hp", "Brakes": "Carbon Ceramic 410mm", "VIN": "5YJSA1E68RF928192", "Odometer": "45 miles"}'::JSONB
  ),
  (
    '2008 Tesla Roadster Signature 100 Edition #042',
    'Historic Collector Slot &bull; Radiance Red Metallic &bull; Collector Grade',
    'One of the first 100 hand-assembled Tesla Roadsters built in Hethel, England on the Lotus glider chassis. Complete with original Tesla battery upgrade certificate, hardtop, soft top, mobile connector, and historical documentation. A cornerstone piece of EV history.',
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1200&auto=format&fit=crop&q=80',
    '["https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1200&auto=format&fit=crop&q=80"]'::JSONB,
    120000.00,
    140000.00,
    142000.00,
    2500.00,
    180000.00,
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '2 days',
    'live',
    9,
    '{"0-60 mph": "3.9s", "Top Speed": "125 mph", "Range": "244 mi", "Transmission": "Single-Speed BorgWarner", "VIN": "SFZRE21B88A000042", "Odometer": "8,420 miles"}'::JSONB
  )
ON CONFLICT DO NOTHING;
