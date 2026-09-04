export * from './database'

// Derived types for common query patterns
import type { Profile, InvestmentHolding, PortfolioHolding, Stock, Transaction } from './database'

export interface DashboardStats {
  totalBalance: number
  investedAmount: number
  availableCash: number
  dailyChange: number
  dailyChangePercent: number
  allTimeChange: number
  allTimeChangePercent: number
}

export interface PortfolioSummary {
  totalValue: number
  investmentHoldings: InvestmentHolding[]
  stockHoldings: (PortfolioHolding & { stock: Stock })[]
  recentTransactions: Transaction[]
}

export interface AdminKPIs {
  totalUsers: number
  activeInvestments: number
  totalOrders: number
  pendingKyc: number
  openTickets: number
  vipMembers: number
  totalInvestmentValue: number
}
