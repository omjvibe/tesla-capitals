-- ============================================================
-- Tesla Capital — Next-Gen Roadster SpaceX Flying Car Unveil (009_roadster_spacex_expansion.sql)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. SEED EARLY INVESTMENT OPPORTUNITIES
INSERT INTO investments (
  id,
  name,
  description,
  category,
  min_amount,
  duration_months,
  target_return,
  risk_level,
  status,
  image_url
) VALUES
  (
    'e0100000-0000-4000-8000-000000000001',
    'Tesla Roadster SpaceX Propulsion Syndicate',
    'Exclusive private syndicate financing the production scaling of SpaceX-derived composite overwrapped pressure vessels (COPV) and cold-gas thruster manifolds for the next-generation flying Roadster.',
    'Automotive',
    2500.00,
    18,
    28.50,
    'moderate',
    'active',
    '/roadster-spacex-hero.jpg'
  ),
  (
    'e0100000-0000-4000-8000-000000000002',
    'Active Suction Fan & Ground-Effect R&D Fund',
    'High-alpha development fund commercializing proprietary underbody vacuum turbine technology, generating 4,000+ lbs of downforce for unprecedented cornering grip, wall-scaling, and inverted dynamics.',
    'Technology',
    5000.00,
    24,
    34.00,
    'high',
    'active',
    '/roadster-spacex-hero.jpg'
  ),
  (
    'e0100000-0000-4000-8000-000000000003',
    'High-Pressure Cold-Gas Supercharger Network (10k PSI)',
    'Global infrastructure buildout deploying automated pneumatic compressors at Tesla Supercharger V4 hubs to recharge Roadster cold-gas thruster tanks in under 90 seconds.',
    'Energy',
    1000.00,
    12,
    21.00,
    'low',
    'active',
    '/roadster-spacex-hero.jpg'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  min_amount = EXCLUDED.min_amount,
  duration_months = EXCLUDED.duration_months,
  target_return = EXCLUDED.target_return,
  risk_level = EXCLUDED.risk_level,
  status = EXCLUDED.status,
  image_url = EXCLUDED.image_url;

-- 2. SEED PREMIER ROADSTER SPACEX FOUNDERS AUCTION
INSERT INTO auctions (
  id,
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
    'a0100000-0000-4000-8000-000000000001',
    '2026 Tesla Roadster SpaceX Package — Founders Chassis #001',
    'SpaceX Cold-Gas Thruster Array • Active Suction Fan Vacuum • 0-60 in <1.0s',
    'The historic premier production allocation of the unveiled next-generation Tesla Roadster with the official SpaceX Propulsion Package. Equipped with 10 seamless cold-gas reaction control thrusters nestled behind the license plate and aero contours, paired with dual high-power underbody suction fans allowing short-duration jumps, obstacle hops, and wall-scaling physics. Handover ceremony hosted at Starbase, Texas.',
    '/roadster-founders-auction.jpg',
    '["/roadster-founders-auction.jpg", "/roadster-spacex-hero.jpg"]'::JSONB,
    250000.00,
    300000.00,
    325000.00,
    5000.00,
    500000.00,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '6 days',
    'live',
    14,
    '{
      "0-60 mph": "< 1.0s (SpaceX Thruster Assist)",
      "Top Speed": "250+ mph",
      "Jump Impulse": "Up to 6 ft vertical hop / clearance",
      "Reaction Control": "10 SpaceX Cold-Gas Thrusters (10,000 PSI COPV)",
      "Downforce": "4,000+ lbs via Active Suction Turbines",
      "Lateral Grip": "3.2G cornering",
      "VIN": "7SAXROADSTER000001",
      "Delivery": "Starbase Texas Handover Ceremony with Engineers"
    }'::JSONB
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  current_bid = EXCLUDED.current_bid,
  status = EXCLUDED.status,
  specs = EXCLUDED.specs;

-- 3. SEED PRODUCTION PRODUCT INVENTORY ENTRY
INSERT INTO products (
  id,
  name,
  category,
  description,
  price,
  image_url,
  stock_qty,
  is_available,
  specs
) VALUES
  (
    'p0100000-0000-4000-8000-000000000001',
    'Tesla Roadster (SpaceX Thruster Package)',
    'vehicles',
    'The pinnacle of extreme performance engineering. Integrates Falcon 9 cold-gas thruster technology and high-vacuum ground-effect fans to redefine physical motion on earth and in the air.',
    250000.00,
    '/roadster-spacex-hero.jpg',
    5,
    true,
    '{
      "acceleration": "0-60 mph < 1.0s",
      "top_speed": "250+ mph",
      "range": "620 miles (Electric Only)",
      "propulsion": "Tri-Motor AWD + 10 Cold-Gas Thrusters",
      "fans": "Dual 25,000 RPM Vacuum Fans",
      "seating": "4 (2+2 Aero Config)"
    }'::JSONB
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  specs = EXCLUDED.specs;
