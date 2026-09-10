-- ============================================================
-- Tesla Capital — Comprehensive Fixes & Storage (006_fixes_and_storage.sql)
-- Run this in your Supabase Project SQL Editor
-- ============================================================

-- 1. VIP Tiers Column & 5-Tier System
ALTER TABLE vip_tiers ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2) DEFAULT 0.00;

-- Ensure VIP Tiers RLS policies allow admin full management
DROP POLICY IF EXISTS "Admin can manage tiers" ON vip_tiers;
CREATE POLICY "Admin can manage tiers" ON vip_tiers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed / Upsert the 5 VIP Tiers
INSERT INTO vip_tiers (name, price, discount_percent, benefits, is_active) VALUES
  ('Standard', 0.00, 0.00, '["Standard access to public markets", "Basic portfolio tracking", "Community support"]'::JSONB, true),
  ('Bronze', 122.00, 5.00, '["5% off all investments & inventory", "Priority trade execution", "Monthly market digest"]'::JSONB, true),
  ('Silver', 499.00, 10.00, '["10% off all investments & inventory", "Direct analyst chat", "Early giveaway entries"]'::JSONB, true),
  ('Gold', 1499.00, 18.00, '["18% off all investments & inventory", "Exclusive private deal flow", "Dedicated wealth manager"]'::JSONB, true),
  ('Platinum', 5000.00, 25.00, '["25% off all investments & inventory", "0% trading fee surcharge", "Annual Tesla executive retreat invite", "24/7 Apex support"]'::JSONB, true)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  discount_percent = EXCLUDED.discount_percent,
  benefits = EXCLUDED.benefits,
  is_active = EXCLUDED.is_active;

-- 2. Storage Buckets Setup (Fixes "NoSuchBucket" error)
-- Create kyc-documents and other required buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('kyc-documents', 'kyc-documents', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']),
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('giveaway-images', 'giveaway-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('support-attachments', 'support-attachments', true, 10485760, NULL)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies for kyc-documents
DROP POLICY IF EXISTS "Public can view kyc docs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload kyc docs" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage all kyc docs" ON storage.objects;

CREATE POLICY "Public can view kyc docs" ON storage.objects
  FOR SELECT USING (bucket_id = 'kyc-documents');

CREATE POLICY "Authenticated users can upload kyc docs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'kyc-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can manage all kyc docs" ON storage.objects
  FOR ALL USING (
    bucket_id = 'kyc-documents' AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Crypto Addresses Management
CREATE TABLE IF NOT EXISTS crypto_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency TEXT NOT NULL UNIQUE,
  network TEXT NOT NULL,
  address TEXT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crypto_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active crypto addresses" ON crypto_addresses;
DROP POLICY IF EXISTS "Admin can manage crypto addresses" ON crypto_addresses;

CREATE POLICY "Anyone can view active crypto addresses" ON crypto_addresses
  FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can manage crypto addresses" ON crypto_addresses
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed default crypto addresses if not present
INSERT INTO crypto_addresses (currency, network, address) VALUES
  ('BTC', 'Bitcoin Network', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'),
  ('ETH', 'Ethereum (ERC20)', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'),
  ('USDT', 'Tron (TRC20)', 'TXk28cK9xP9N4mF6VzW9g1aBc3dE5f6G7H'),
  ('SOL', 'Solana Network', '7xKXtg2CW87d97TXJSDyf1p5EdTMN32n5F2')
ON CONFLICT (currency) DO NOTHING;
