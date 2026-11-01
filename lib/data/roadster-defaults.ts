import type { Investment, Auction, Product } from '@/types'

export const ROADSTER_DISCOUNT_PERCENT = 15 // 15% discount for Premium VIP members ($2k+ / Platinum)

export function applyRoadsterDiscount(price: number): number {
  return Math.round(price * (1 - ROADSTER_DISCOUNT_PERCENT / 100) * 100) / 100
}

/**
 * Checks if a user has Premium VIP status ($2,000+ tier, i.e., Platinum / Premium).
 * Admins are also granted access for testing & management.
 */
export function isPremiumVip(profile: { vip_tier?: string | null; role?: string | null } | null | undefined): boolean {
  if (!profile) return false
  if (profile.role === 'admin') return true
  const tier = (profile.vip_tier || '').toLowerCase().trim()
  return tier === 'platinum' || tier === 'premium' || tier.includes('platinum') || tier.includes('premium')
}

export const ROADSTER_INVESTMENT_IDS = new Set([
  'e0100000-0000-4000-8000-000000000001',
  'e0100000-0000-4000-8000-000000000002',
  'e0100000-0000-4000-8000-000000000003',
])

export function isRoadsterInvestment(id: string, name?: string): boolean {
  if (ROADSTER_INVESTMENT_IDS.has(id)) return true
  if (name && (name.includes('Roadster') || name.includes('Propulsion Syndicate') || name.includes('Suction Fan'))) return true
  return false
}

export const ROADSTER_AUCTION_ID = 'a0100000-0000-4000-8000-000000000001'

export function isRoadsterAuction(id: string, title?: string): boolean {
  if (id === ROADSTER_AUCTION_ID) return true
  if (title && (title.includes('Roadster SpaceX') || title.includes('Roadster Package'))) return true
  return false
}

export const ROADSTER_PRODUCT_ID = 'd0100000-0000-4000-8000-000000000001'

export function isRoadsterProduct(id: string, name?: string): boolean {
  if (id === ROADSTER_PRODUCT_ID) return true
  if (name && (name.includes('Roadster (SpaceX') || name.includes('Roadster SpaceX'))) return true
  return false
}

export const ROADSTER_INVESTMENTS: Investment[] = [
  {
    id: 'e0100000-0000-4000-8000-000000000001',
    name: 'Tesla Roadster SpaceX Propulsion Syndicate',
    description:
      'Exclusive private syndicate financing the production scaling of SpaceX-derived composite overwrapped pressure vessels (COPV) and cold-gas thruster manifolds for the next-generation flying Roadster.',
    category: 'Automotive',
    min_amount: applyRoadsterDiscount(2500), // $2,125 with 15% VIP discount (Original: $2,500)
    duration_months: 18,
    target_return: 28.5,
    risk_level: 'moderate',
    status: 'active',
    image_url: '/roadster-spacex-hero.jpg',
    created_at: '2026-10-21T00:00:00Z',
    updated_at: '2026-10-21T00:00:00Z',
  },
  {
    id: 'e0100000-0000-4000-8000-000000000002',
    name: 'Active Suction Fan & Ground-Effect R&D Fund',
    description:
      'High-alpha development fund commercializing proprietary underbody vacuum turbine technology, generating 4,000+ lbs of downforce for unprecedented cornering grip, wall-scaling, and inverted dynamics.',
    category: 'Technology',
    min_amount: applyRoadsterDiscount(5000), // $4,250 with 15% VIP discount (Original: $5,000)
    duration_months: 24,
    target_return: 34.0,
    risk_level: 'high',
    status: 'active',
    image_url: '/roadster-spacex-hero.jpg',
    created_at: '2026-10-21T00:00:00Z',
    updated_at: '2026-10-21T00:00:00Z',
  },
  {
    id: 'e0100000-0000-4000-8000-000000000003',
    name: 'High-Pressure Cold-Gas Supercharger Network (10k PSI)',
    description:
      'Global infrastructure buildout deploying automated pneumatic compressors at Tesla Supercharger V4 hubs to recharge Roadster cold-gas thruster tanks in under 90 seconds.',
    category: 'Energy',
    min_amount: applyRoadsterDiscount(1000), // $850 with 15% VIP discount (Original: $1,000)
    duration_months: 12,
    target_return: 21.0,
    risk_level: 'low',
    status: 'active',
    image_url: '/roadster-spacex-hero.jpg',
    created_at: '2026-10-21T00:00:00Z',
    updated_at: '2026-10-21T00:00:00Z',
  },
]

export const ROADSTER_AUCTION: Auction = {
  id: ROADSTER_AUCTION_ID,
  product_id: ROADSTER_PRODUCT_ID,
  title: '2026 Tesla Roadster SpaceX Package — Founders Chassis #001',
  subtitle: 'SpaceX Cold-Gas Thruster Array • Active Suction Fan Vacuum • 0-60 in <1.0s',
  description:
    'The historic premier production allocation of the unveiled next-generation Tesla Roadster with the official SpaceX Propulsion Package. Equipped with 10 seamless cold-gas reaction control thrusters nestled behind the license plate and aero contours, paired with dual high-power underbody suction fans allowing short-duration jumps, obstacle hops, and wall-scaling physics. Handover ceremony hosted at Starbase, Texas.',
  image_url: '/roadster-founders-auction.jpg',
  gallery_urls: ['/roadster-founders-auction.jpg', '/roadster-spacex-hero.jpg'],
  starting_price: 250000,
  reserve_price: 300000,
  current_bid: 325000,
  min_bid_increment: 5000,
  buy_now_price: applyRoadsterDiscount(500000), // $425,000 with 15% VIP discount (Original: $500,000)
  starts_at: new Date(Date.now() - 86400000).toISOString(),
  ends_at: new Date(Date.now() + 5 * 86400000).toISOString(),
  status: 'live',
  winner_id: null,
  winning_bid: null,
  total_bids: 14,
  anti_snipe_seconds: 120,
  specs: {
    '0-60 mph': '< 1.0s (SpaceX Thruster Assist)',
    'Top Speed': '250+ mph',
    'Jump Impulse': 'Up to 6 ft vertical hop / clearance',
    'Reaction Control': '10 SpaceX Cold-Gas Thrusters (10,000 PSI COPV)',
    'Downforce': '4,000+ lbs via Active Suction Turbines',
    'Lateral Grip': '3.2G cornering',
    'VIN': '7SAXROADSTER000001',
    'Delivery': 'Starbase Texas Handover Ceremony with Engineers',
    'VIP Privilege': '15% Premium VIP Member Discount Applied',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const ROADSTER_PRODUCT: Product = {
  id: ROADSTER_PRODUCT_ID,
  name: 'Tesla Roadster (SpaceX Thruster Package)',
  category: 'vehicles',
  description:
    'The pinnacle of extreme performance engineering. Integrates Falcon 9 cold-gas thruster technology and high-vacuum ground-effect fans to redefine physical motion on earth and in the air. Includes 15% Premium VIP Member Discount.',
  price: applyRoadsterDiscount(250000), // $212,500 with 15% VIP discount (Original: $250,000 - save $37,500)
  image_url: '/roadster-spacex-hero.jpg',
  stock_qty: 5,
  is_available: true,
  specs: {
    acceleration: '0-60 mph < 1.0s',
    top_speed: '250+ mph',
    range: '620 miles (Electric Only)',
    propulsion: 'Tri-Motor AWD + 10 Cold-Gas Thrusters',
    fans: 'Dual 25,000 RPM Vacuum Fans',
    seating: '4 (2+2 Aero Config)',
    vip_discount: '15% Premium VIP Discount Applied (-$37,500 savings)',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}
