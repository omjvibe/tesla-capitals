-- ============================================================
-- Tesla Capital — Seed Data
-- Run AFTER all migrations
-- ============================================================

-- Stocks
INSERT INTO stocks (symbol, name, price, change_percent, market, description) VALUES
  ('TSLA', 'Tesla, Inc.', 248.42, 2.15, 'NASDAQ', 'Electric vehicles, energy storage, and solar panel manufacturing.'),
  ('NVDA', 'NVIDIA Corporation', 875.23, 3.25, 'NASDAQ', 'Graphics processing units and AI computing platforms.'),
  ('AAPL', 'Apple Inc.', 228.40, 0.82, 'NASDAQ', 'Consumer electronics, software, and services.'),
  ('GOOGL', 'Alphabet Inc.', 178.35, 1.45, 'NASDAQ', 'Internet services, cloud computing, and AI research.'),
  ('AMZN', 'Amazon.com Inc.', 192.80, 1.92, 'NASDAQ', 'E-commerce, cloud computing, and digital streaming.'),
  ('MSFT', 'Microsoft Corp.', 428.50, 0.65, 'NASDAQ', 'Software, cloud services, and enterprise solutions.');

-- Investments
INSERT INTO investments (name, description, category, min_amount, duration_months, target_return, risk_level, status) VALUES
  ('Tesla Growth Fund', 'Long-term growth fund focused on Tesla ecosystem and EV supply chain companies.', 'technology', 5000, 24, 18.50, 'moderate', 'active'),
  ('Clean Energy Portfolio', 'Diversified portfolio of renewable energy and sustainability-focused assets.', 'energy', 2500, 12, 12.00, 'low', 'active'),
  ('AI & Autonomous Tech', 'Concentrated exposure to artificial intelligence and autonomous driving technology leaders.', 'technology', 10000, 36, 25.00, 'high', 'active'),
  ('EV Infrastructure', 'Investment in charging networks, battery technology, and EV infrastructure buildout.', 'automotive', 3000, 18, 15.00, 'moderate', 'active'),
  ('Sustainable Future Fund', 'Broad market fund investing in companies meeting strict ESG criteria.', 'sustainability', 1000, 12, 10.00, 'low', 'active');

-- Products (Vehicles)
INSERT INTO products (name, category, description, price, stock_qty, is_available, specs) VALUES
  ('Model S', 'vehicles', 'Premium electric sedan with exceptional range and performance.', 79990.00, 15, true,
   '{"range": "405 mi", "acceleration": "1.99s 0-60", "top_speed": "200 mph", "drive": "AWD", "seating": "5"}'::JSONB),
  ('Model 3', 'vehicles', 'The most accessible Tesla, designed for mass adoption.', 49990.00, 42, true,
   '{"range": "358 mi", "acceleration": "3.1s 0-60", "top_speed": "162 mph", "drive": "AWD", "seating": "5"}'::JSONB),
  ('Model X', 'vehicles', 'Full-size SUV with falcon wing doors and maximum utility.', 119990.00, 8, true,
   '{"range": "348 mi", "acceleration": "2.5s 0-60", "top_speed": "163 mph", "drive": "AWD", "seating": "7"}'::JSONB),
  ('Model Y', 'vehicles', 'Compact SUV with versatile cargo and seating configurations.', 54990.00, 35, true,
   '{"range": "310 mi", "acceleration": "3.5s 0-60", "top_speed": "155 mph", "drive": "AWD", "seating": "7"}'::JSONB),
  ('Cybertruck', 'vehicles', 'Ultra-hard exoskeleton truck built for ultimate durability and versatility.', 99990.00, 5, true,
   '{"range": "340 mi", "acceleration": "2.6s 0-60", "top_speed": "130 mph", "drive": "AWD", "payload": "2,500 lbs"}'::JSONB);

-- Products (Energy)
INSERT INTO products (name, category, description, price, stock_qty, is_available, specs) VALUES
  ('Powerwall', 'energy', 'Home battery system for energy independence and backup power.', 11500.00, 100, true,
   '{"capacity": "13.5 kWh", "power": "5 kW continuous", "warranty": "10 years"}'::JSONB),
  ('Solar Roof', 'energy', 'Beautiful solar tiles integrated into your roof for seamless energy generation.', 35000.00, 25, true,
   '{"warranty": "25 years", "power": "8 kW", "type": "Integrated tiles"}'::JSONB);

-- VIP Tiers
INSERT INTO vip_tiers (name, price, benefits, is_active) VALUES
  ('Standard', 0, '["Basic platform access", "Market data", "Community features"]'::JSONB, true),
  ('VIP', 199, '["Priority support", "Exclusive giveaways", "Member-only rewards", "Reduced trading fees", "Early access to investments"]'::JSONB, true),
  ('Platinum', 499, '["Everything in VIP", "24/7 premium support", "Exclusive events access", "Highest reward eligibility", "Early product access", "Dedicated account manager"]'::JSONB, true);

-- Giveaways
INSERT INTO giveaways (title, description, starts_at, ends_at, status) VALUES
  ('Model 3 Performance Giveaway', 'Win a brand new Tesla Model 3 Performance. Open to all VIP and Platinum members.', NOW(), NOW() + INTERVAL '30 days', 'active'),
  ('Tesla Cybertruck Giveaway', 'Win the all-new Tesla Cybertruck. Exclusive to Platinum members.', NOW() + INTERVAL '15 days', NOW() + INTERVAL '60 days', 'upcoming');

-- Articles
INSERT INTO articles (title, slug, content, excerpt, category, reading_time, is_published) VALUES
  ('The Future of Sustainable Energy', 'future-sustainable-energy',
   'Sustainable energy is no longer a distant dream — it is an economic imperative. Solar, wind, and battery storage technologies have reached cost parity with fossil fuels in most markets worldwide. This shift represents one of the largest investment opportunities of the century.',
   'Discover how Tesla is building a sustainable future with innovative energy solutions.',
   'energy', 8, true),
  ('Understanding Tesla Stock', 'understanding-tesla-stock',
   'Tesla stock (TSLA) has been one of the most discussed equities in modern financial history. From its IPO in 2010 to becoming the most valuable automaker in the world, Tesla journey reflects a fundamental shift in how markets value innovation and disruption.',
   'An in-depth guide to investing in Tesla and understanding the market dynamics.',
   'investing', 12, true),
  ('AI and the Future of Driving', 'ai-future-driving',
   'Autonomous driving represents the convergence of artificial intelligence, sensor technology, and software engineering. Tesla Full Self-Driving technology is at the forefront of this revolution, processing billions of miles of real-world data.',
   'Explore Tesla AI technology and its impact on the future of transportation.',
   'technology', 10, true),
  ('How EV Markets Work', 'how-ev-markets-work',
   'The electric vehicle market is experiencing exponential growth globally. Understanding the dynamics of this market — from battery supply chains to charging infrastructure — is essential for any modern investor.',
   'A comprehensive overview of electric vehicle market dynamics and investment implications.',
   'markets', 7, true),
  ('Energy Storage Explained', 'energy-storage-explained',
   'Energy storage is the missing piece in the renewable energy puzzle. Battery technology, particularly lithium-ion and emerging solid-state batteries, is enabling a world where clean energy can be stored and dispatched on demand.',
   'Understanding battery technology and its role in the energy transition.',
   'sustainability', 6, true);
