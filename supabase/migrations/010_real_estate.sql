-- ============================================================
-- Tesla Capital — Real Estate Fractional Investment Schema (010_real_estate.sql)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. REAL ESTATE PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS real_estate_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL DEFAULT 'residential' CHECK (property_type IN ('residential', 'commercial', 'land', 'industrial')),
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'USA',
  total_value NUMERIC(14,2) NOT NULL,
  min_investment NUMERIC(12,2) NOT NULL DEFAULT 500.00,
  total_shares INTEGER NOT NULL DEFAULT 1000,
  available_shares INTEGER NOT NULL DEFAULT 1000,
  price_per_share NUMERIC(10,2) NOT NULL,
  projected_annual_return NUMERIC(5,2) DEFAULT 12.00,
  rental_yield NUMERIC(5,2) DEFAULT 8.50,
  occupancy_rate NUMERIC(5,2) DEFAULT 100.00,
  size_sqft INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  image_url TEXT,
  gallery_urls JSONB DEFAULT '[]'::JSONB,
  amenities JSONB DEFAULT '[]'::JSONB,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'funded', 'archived')),
  risk_level TEXT NOT NULL DEFAULT 'moderate' CHECK (risk_level IN ('low', 'moderate', 'high')),
  holding_period_months INTEGER DEFAULT 24,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE real_estate_properties ENABLE ROW LEVEL SECURITY;

-- 2. REAL ESTATE USER INVESTMENTS (FRACTIONAL HOLDINGS)
CREATE TABLE IF NOT EXISTS real_estate_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES real_estate_properties(id) ON DELETE CASCADE,
  shares INTEGER NOT NULL CHECK (shares > 0),
  amount_invested NUMERIC(12,2) NOT NULL CHECK (amount_invested > 0),
  current_value NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'exited')),
  invested_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE real_estate_investments ENABLE ROW LEVEL SECURITY;

-- 3. ROW-LEVEL SECURITY POLICIES

-- Helper function safety check
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Properties policies
DROP POLICY IF EXISTS "Anyone can view active real estate properties" ON real_estate_properties;
CREATE POLICY "Anyone can view active real estate properties"
  ON real_estate_properties FOR SELECT
  USING (status = 'active' OR is_admin());

DROP POLICY IF EXISTS "Admin can manage real estate properties" ON real_estate_properties;
CREATE POLICY "Admin can manage real estate properties"
  ON real_estate_properties FOR ALL
  USING (is_admin());

-- Investments policies
DROP POLICY IF EXISTS "Users can view own real estate investments" ON real_estate_investments;
CREATE POLICY "Users can view own real estate investments"
  ON real_estate_investments FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Users can create own real estate investments" ON real_estate_investments;
CREATE POLICY "Users can create own real estate investments"
  ON real_estate_investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can manage all real estate investments" ON real_estate_investments;
CREATE POLICY "Admin can manage all real estate investments"
  ON real_estate_investments FOR ALL
  USING (is_admin());

-- 4. TRANSACTIONS CONSTRAINT UPDATE
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
  CHECK (type IN ('deposit', 'withdrawal', 'investment', 'order', 'vip_payment', 'reward', 'stock_buy', 'stock_sell', 'real_estate'));

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_re_investments_user ON real_estate_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_re_investments_property ON real_estate_investments(property_id);
CREATE INDEX IF NOT EXISTS idx_re_properties_status ON real_estate_properties(status);
CREATE INDEX IF NOT EXISTS idx_re_properties_type ON real_estate_properties(property_type);

-- 6. SEED PREMIER REAL ESTATE ASSETS
INSERT INTO real_estate_properties (
  id,
  title,
  description,
  property_type,
  location,
  city,
  country,
  total_value,
  min_investment,
  total_shares,
  available_shares,
  price_per_share,
  projected_annual_return,
  rental_yield,
  occupancy_rate,
  size_sqft,
  bedrooms,
  bathrooms,
  image_url,
  gallery_urls,
  amenities,
  status,
  risk_level,
  holding_period_months
) VALUES 
(
  'e1a10001-0000-0000-0000-000000000001',
  'Tesla Gigafactory District Luxury Lofts',
  'Exclusive multi-family residential enclave located directly adjacent to Giga Texas in Austin. Built to house engineering leadership and tech executives with integrated Tesla Powerwall and Solar Roof microgrids.',
  'residential',
  '13101 Harold Green Rd',
  'Austin, TX',
  'USA',
  3500000.00,
  500.00,
  7000,
  4950,
  500.00,
  14.20,
  9.40,
  98.50,
  42000,
  24,
  28,
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"]'::JSONB,
  '["Tesla Solar Roof & Powerwall Microgrid", "Direct Supercharger Hub (16 V4 stalls)", "Rooftop Executive Lounge", "Biometric Access Control", "24/7 Security Patrol"]'::JSONB,
  'active',
  'low',
  36
),
(
  'e1a10001-0000-0000-0000-000000000002',
  'Fremont Advanced Mobility Tech Center',
  'Class-A commercial research campus leased by tier-1 EV suppliers, autonomous sensor labs, and robotics innovators in Silicon Valley East Bay.',
  'commercial',
  '45500 Fremont Blvd',
  'Fremont, CA',
  'USA',
  8200000.00,
  1000.00,
  8200,
  6120,
  1000.00,
  16.80,
  10.20,
  100.00,
  95000,
  NULL,
  NULL,
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80"]'::JSONB,
  '["Triple-Net (NNN) Corporate Lease", "Heavy Industrial 3-Phase Power", "High-Bay Cleanrooms", "Megapack Energy Backup", "Fiber Backbone"]'::JSONB,
  'active',
  'low',
  48
),
(
  'e1a10001-0000-0000-0000-000000000003',
  'Nevada Gigawatt Solar & Lithium Reserve',
  'Strategic 1,200-acre renewable energy and mineral parcel in Storey County, Nevada. Master-zoned for utility-scale solar generation, lithium brine storage, and battery recycling logistics.',
  'land',
  'USA Parkway Corridor',
  'Reno / Tahoe, NV',
  'USA',
  4800000.00,
  750.00,
  6400,
  5100,
  750.00,
  18.50,
  7.80,
  100.00,
  52272000,
  NULL,
  NULL,
  'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80"]'::JSONB,
  '["Master Utility Zoned", "Substation Interconnection Rights", "Federal Clean Energy Grant Eligibility", "Long-term Land Lease Backing"]'::JSONB,
  'active',
  'moderate',
  60
),
(
  'e1a10001-0000-0000-0000-000000000004',
  'Berlin Brandenburg Automated Logistics Park',
  'High-throughput robotic fulfillment and containerized distribution hub situated along the Trans-European freight corridor supporting Giga Berlin supply chains.',
  'industrial',
  'Grünheide Logistics Blvd',
  'Berlin',
  'Germany',
  6500000.00,
  500.00,
  13000,
  9800,
  500.00,
  13.90,
  8.90,
  97.00,
  110000,
  NULL,
  NULL,
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  '["https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80"]'::JSONB,
  '["Fully Automated Rail Spur", "Cross-Dock Configuration", "Solar Canopy Rooftop", "EU Green Building Certified", "Tier-1 10-year Leases"]'::JSONB,
  'active',
  'low',
  36
)
ON CONFLICT (id) DO NOTHING;

