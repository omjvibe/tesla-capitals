-- ============================================================
-- Tesla Capital — Row-Level Security Policies
-- Run AFTER 001_foundation.sql
-- ============================================================

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ══════════════════════════════════════════════════════════════
-- PROFILES
-- ══════════════════════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Admin can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin can delete profiles"
  ON profiles FOR DELETE
  USING (is_admin());

-- Allow insert from trigger (service role)
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- INVESTMENTS
-- ══════════════════════════════════════════════════════════════
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active investments"
  ON investments FOR SELECT
  USING (status = 'active' OR is_admin());

CREATE POLICY "Admin can manage investments"
  ON investments FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════
-- INVESTMENT HOLDINGS
-- ══════════════════════════════════════════════════════════════
ALTER TABLE investment_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own holdings"
  ON investment_holdings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own holdings"
  ON investment_holdings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all holdings"
  ON investment_holdings FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════
-- STOCKS
-- ══════════════════════════════════════════════════════════════
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published stocks"
  ON stocks FOR SELECT
  USING (is_published = true OR is_admin());

CREATE POLICY "Admin can manage stocks"
  ON stocks FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════
-- WATCHLIST
-- ══════════════════════════════════════════════════════════════
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own watchlist"
  ON watchlist FOR ALL
  USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- PORTFOLIO HOLDINGS
-- ══════════════════════════════════════════════════════════════
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio"
  ON portfolio_holdings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own portfolio"
  ON portfolio_holdings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all portfolios"
  ON portfolio_holdings FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════
-- PRODUCTS
-- ══════════════════════════════════════════════════════════════
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  USING (is_available = true OR is_admin());

CREATE POLICY "Admin can manage products"
  ON products FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════
-- ORDERS
-- ══════════════════════════════════════════════════════════════
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all orders"
  ON orders FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════
-- VIP TIERS
-- ══════════════════════════════════════════════════════════════
ALTER TABLE vip_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tiers"
  ON vip_tiers FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admin can manage tiers"
  ON vip_tiers FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════
-- GIVEAWAYS
-- ══════════════════════════════════════════════════════════════
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active giveaways"
  ON giveaways FOR SELECT
  USING (status IN ('active', 'ended') OR is_admin());

CREATE POLICY "Admin can manage giveaways"
  ON giveaways FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════
-- GIVEAWAY ENTRIES
-- ══════════════════════════════════════════════════════════════
ALTER TABLE giveaway_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON giveaway_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own entries"
  ON giveaway_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all entries"
  ON giveaway_entries FOR SELECT
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════
-- KYC DOCUMENTS
-- ══════════════════════════════════════════════════════════════
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON kyc_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own documents"
  ON kyc_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all KYC"
  ON kyc_documents FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════
-- SUPPORT TICKETS
-- ══════════════════════════════════════════════════════════════
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets"
  ON support_tickets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all tickets"
  ON support_tickets FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════
-- SUPPORT MESSAGES
-- ══════════════════════════════════════════════════════════════
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages on own tickets"
  ON support_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
    AND is_internal = false
  );

CREATE POLICY "Users can send messages on own tickets"
  ON support_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all messages"
  ON support_messages FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ══════════════════════════════════════════════════════════════
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage notifications"
  ON notifications FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════
-- ADMIN ACTIVITY LOGS
-- ══════════════════════════════════════════════════════════════
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage activity logs"
  ON admin_activity_logs FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════
-- ARTICLES
-- ══════════════════════════════════════════════════════════════
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published articles"
  ON articles FOR SELECT
  USING (is_published = true OR is_admin());

CREATE POLICY "Admin can manage articles"
  ON articles FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════
-- TRANSACTIONS
-- ══════════════════════════════════════════════════════════════
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all transactions"
  ON transactions FOR ALL
  USING (is_admin());
