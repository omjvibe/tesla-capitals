// Tesla Capital — Database Types

export type UserRole = 'user' | 'admin'
export type VipTier = 'standard' | 'bronze' | 'silver' | 'gold' | 'platinum'
export type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected'
export type InvestmentStatus = 'draft' | 'active' | 'archived'
export type RiskLevel = 'low' | 'moderate' | 'high'
export type HoldingStatus = 'active' | 'matured' | 'withdrawn'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type GiveawayStatus = 'upcoming' | 'active' | 'ended'
export type KycDocType = 'government_id' | 'passport' | 'proof_of_address'
export type KycDocStatus = 'pending' | 'approved' | 'rejected'
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TransactionType = 'deposit' | 'withdrawal' | 'investment' | 'order' | 'vip_payment' | 'reward' | 'stock_buy' | 'stock_sell'
export type ProductCategory = 'vehicles' | 'energy' | 'accessories'
export type RequestStatus = 'pending' | 'approved' | 'rejected'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  vip_tier: VipTier
  vip_expires_at: string | null
  kyc_status: KycStatus
  wallet_balance: number
  btc_balance?: number
  eth_balance?: number
  usdt_balance?: number
  realized_pnl?: number
  unrealized_pnl?: number
  is_kyc_mandated?: boolean
  created_at: string
  updated_at: string
}

export interface Investment {
  id: string
  name: string
  description: string | null
  category: string
  min_amount: number
  duration_months: number | null
  target_return: number | null
  risk_level: RiskLevel
  status: InvestmentStatus
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface InvestmentHolding {
  id: string
  user_id: string
  investment_id: string
  amount: number
  current_value: number
  status: HoldingStatus
  invested_at: string
  updated_at: string
  investment?: Investment
}

export interface Stock {
  id: string
  symbol: string
  name: string
  price: number
  change_percent: number
  market: string
  description: string | null
  icon_url?: string | null
  is_published: boolean
  updated_at: string
}

export interface WatchlistItem {
  id: string
  user_id: string
  stock_id: string
  created_at: string
  stock?: Stock
}

export interface PortfolioHolding {
  id: string
  user_id: string
  stock_id: string
  shares: number
  avg_cost: number
  created_at: string
  updated_at: string
  stock?: Stock
}

export interface Product {
  id: string
  name: string
  category: ProductCategory
  description: string | null
  price: number
  image_url: string | null
  specs: Record<string, string>
  stock_qty: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  product_id: string | null
  total: number
  status: OrderStatus
  tracking_info: string | null
  created_at: string
  updated_at: string
  product?: Product
  user?: Profile
}

export interface VipTierData {
  id: string
  name: string
  price: number
  benefits: string[]
  discount_percent: number
  is_active: boolean
  created_at: string
}

export interface Giveaway {
  id: string
  title: string
  description: string | null
  image_url: string | null
  starts_at: string
  ends_at: string
  status: GiveawayStatus
  winner_id: string | null
  created_at: string
  entries_count?: number
}

export interface GiveawayEntry {
  id: string
  giveaway_id: string
  user_id: string
  created_at: string
}

export interface KycDocument {
  id: string
  user_id: string
  doc_type: KycDocType
  file_url: string
  status: KycDocStatus
  admin_notes: string | null
  reviewed_by: string | null
  created_at: string
  reviewed_at: string | null
  user?: Profile
}

export interface SupportTicket {
  id: string
  ticket_number: string
  user_id: string
  subject: string
  category: string
  status: TicketStatus
  priority: TicketPriority
  assigned_admin: string | null
  created_at: string
  updated_at: string
  messages?: SupportMessage[]
  user?: Profile
}

export interface SupportMessage {
  id: string
  ticket_id: string
  sender_id: string
  message: string
  is_internal: boolean
  created_at: string
  sender?: Profile
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  link: string | null
  created_at: string
}

export interface AdminActivityLog {
  id: string
  admin_id: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  admin?: Profile
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  category: string
  cover_image: string | null
  author: string
  reading_time: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  description: string | null
  reference_id: string | null
  created_at: string
}

export interface CryptoAddress {
  id: string
  currency: string
  network: string
  address: string
  qr_code_url?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DepositRequest {
  id: string
  user_id: string
  amount: number
  currency: string
  tx_hash: string | null
  proof_url: string | null
  status: RequestStatus
  admin_notes: string | null
  created_at: string
  reviewed_at: string | null
  user?: Profile
}

export interface WithdrawalRequest {
  id: string
  user_id: string
  amount: number
  currency: string
  destination_address: string
  status: RequestStatus
  admin_notes: string | null
  created_at: string
  reviewed_at: string | null
  user?: Profile
}

export interface ResendEmail {
  id: string
  resend_id?: string | null
  direction: 'inbound' | 'outbound'
  from_email: string
  to_email: string
  subject: string
  body_text?: string | null
  body_html?: string | null
  status: string
  metadata?: Record<string, unknown>
  created_at: string
}
