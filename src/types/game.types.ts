
export interface Company {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  description: string;
  logo?: string;
}

export interface PriceData {
  companyId: string;
  day1Price: number;
  day2Price: number;
  day3Price: number;
  day4Price: number;
  day5Price: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  companyId: string;
  shares: number;
  price: number;
  day: number;
  timestamp: number;
}

export interface PurchaseHistory {
  shares: number;
  price: number;
  day: number;
  timestamp: number;
}

export interface Holding {
  companyId: string;
  shares: number;
  purchaseHistory: PurchaseHistory[];
}

export interface Portfolio {
  cash: number;
  holdings: Holding[];
}

export interface PortfolioSnapshot {
  day: number;
  cash: number;
  totalValue: number;
  holdingsValue: number;
  percentChange: number | null;
}

export interface GameState {
  currentDay: number;
  startingCapital: number;
  transactions: Transaction[];
  portfolio: Portfolio;
  portfolioValueHistory: PortfolioSnapshot[];
  dailyTradesRemaining: number;
  isGameOver: boolean;
}

export interface GameSettings {
  startingCapital: number;
  tradesPerDay: number;
}

export interface MarketState {
  companies: Company[];
  priceData: PriceData[];
}

export interface AppState {
  gameState: GameState | null;
  marketState: MarketState;
  gameSettings: GameSettings;
}
