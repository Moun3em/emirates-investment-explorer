import { v4 as uuidv4 } from 'uuid';
import { 
  AppState, Company, GameSettings, GameState, Holding,
  MarketState, Portfolio, PortfolioSnapshot, PriceData,
  Transaction 
} from '../types/game.types';
import { sampleCompanies, samplePriceData } from '../data/sampleData';
import { toast } from 'sonner';

const GAME_STATE_KEY = 'uae_stock_game_state';
const GAME_SETTINGS_KEY = 'uae_stock_game_settings';
const MARKET_DATA_KEY_PREFIX = 'uae_stock_market_data_';

const DEFAULT_GAME_SETTINGS: GameSettings = {
  startingCapital: 10000,
  tradesPerDay: 3
};

export const initializeMarketState = (): MarketState => {
  // Try to load saved market data from local storage first
  const savedCompanies = localStorage.getItem(`${MARKET_DATA_KEY_PREFIX}companies`);
  const savedPriceData = localStorage.getItem(`${MARKET_DATA_KEY_PREFIX}priceData`);
  
  const companies = savedCompanies ? JSON.parse(savedCompanies) : [...sampleCompanies];
  const priceData = savedPriceData ? JSON.parse(savedPriceData) : [...samplePriceData];
  
  return {
    companies,
    priceData
  };
};

export const updateMarketData = (dataType: 'companies' | 'priceData', data: any): void => {
  localStorage.setItem(`${MARKET_DATA_KEY_PREFIX}${dataType}`, JSON.stringify(data));
};

export const initializeGameState = (settings: GameSettings): GameState => {
  return {
    currentDay: 1,
    startingCapital: settings.startingCapital,
    transactions: [],
    portfolio: {
      cash: settings.startingCapital,
      holdings: []
    },
    portfolioValueHistory: [{
      day: 1,
      cash: settings.startingCapital,
      totalValue: settings.startingCapital,
      holdingsValue: 0,
      percentChange: null
    }],
    dailyTradesRemaining: settings.tradesPerDay,
    isGameOver: false
  };
};

export const saveGameState = (gameState: GameState): void => {
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
};

export const loadGameState = (): GameState | null => {
  const savedState = localStorage.getItem(GAME_STATE_KEY);
  if (savedState) {
    try {
      return JSON.parse(savedState);
    } catch (error) {
      console.error("Error loading game state:", error);
      return null;
    }
  }
  return null;
};

export const saveGameSettings = (settings: GameSettings): void => {
  localStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(settings));
};

export const loadGameSettings = (): GameSettings => {
  const savedSettings = localStorage.getItem(GAME_SETTINGS_KEY);
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings);
    } catch (error) {
      console.error("Error loading game settings:", error);
      return DEFAULT_GAME_SETTINGS;
    }
  }
  return DEFAULT_GAME_SETTINGS;
};

export const getStockPrice = (
  companyId: string,
  day: number,
  priceData: PriceData[]
): number | null => {
  const company = priceData.find(data => data.companyId === companyId);
  if (!company) return null;

  switch (day) {
    case 1: return company.day1Price;
    case 2: return company.day2Price;
    case 3: return company.day3Price;
    case 4: return company.day4Price;
    case 5: return company.day5Price;
    default: return null;
  }
};

export const getCompanyPriceHistory = (
  companyId: string,
  currentDay: number,
  priceData: PriceData[]
): number[] => {
  const company = priceData.find(data => data.companyId === companyId);
  if (!company) return [];

  const history: number[] = [];
  for (let day = 1; day <= currentDay; day++) {
    const price = getStockPrice(companyId, day, priceData);
    if (price !== null) {
      history.push(price);
    }
  }
  return history;
};

export const calculateHoldingValue = (
  holding: Holding,
  currentDay: number,
  priceData: PriceData[]
): number => {
  const currentPrice = getStockPrice(holding.companyId, currentDay, priceData);
  return currentPrice ? currentPrice * holding.shares : 0;
};

export const calculatePortfolioValue = (
  portfolio: Portfolio,
  currentDay: number,
  priceData: PriceData[]
): { totalValue: number, holdingsValue: number } => {
  let holdingsValue = 0;
  
  portfolio.holdings.forEach(holding => {
    holdingsValue += calculateHoldingValue(holding, currentDay, priceData);
  });
  
  const totalValue = portfolio.cash + holdingsValue;
  return { totalValue, holdingsValue };
};

export const calculateDailyReturn = (
  currentSnapshot: PortfolioSnapshot,
  previousSnapshot: PortfolioSnapshot | null
): number | null => {
  if (!previousSnapshot) return null;
  
  const prevValue = previousSnapshot.totalValue;
  const currentValue = currentSnapshot.totalValue;
  
  if (prevValue === 0) return null;
  
  return ((currentValue - prevValue) / prevValue) * 100;
};

export const buyStock = (
  gameState: GameState,
  marketState: MarketState,
  companyId: string,
  shares: number
): GameState => {
  if (gameState.dailyTradesRemaining <= 0) {
    toast.error("No trades remaining for today!");
    return gameState;
  }

  if (shares <= 0) {
    toast.error("You must buy at least some shares!");
    return gameState;
  }

  const currentPrice = getStockPrice(companyId, gameState.currentDay, marketState.priceData);
  if (!currentPrice) {
    toast.error("Could not get current price!");
    return gameState;
  }

  const totalCost = currentPrice * shares;
  if (totalCost > gameState.portfolio.cash) {
    toast.error("Not enough cash for this purchase!");
    return gameState;
  }

  const newTransaction: Transaction = {
    id: uuidv4(),
    type: 'buy',
    companyId,
    shares,
    price: currentPrice,
    day: gameState.currentDay,
    timestamp: Date.now()
  };

  const newPurchaseHistory = {
    shares,
    price: currentPrice,
    day: gameState.currentDay,
    timestamp: Date.now()
  };

  // Update or create holding
  const existingHoldingIndex = gameState.portfolio.holdings.findIndex(
    h => h.companyId === companyId
  );

  let updatedHoldings = [...gameState.portfolio.holdings];
  if (existingHoldingIndex >= 0) {
    // Update existing holding
    const existingHolding = updatedHoldings[existingHoldingIndex];
    updatedHoldings[existingHoldingIndex] = {
      ...existingHolding,
      shares: existingHolding.shares + shares,
      purchaseHistory: [...existingHolding.purchaseHistory, newPurchaseHistory]
    };
  } else {
    // Create new holding
    updatedHoldings.push({
      companyId,
      shares,
      purchaseHistory: [newPurchaseHistory]
    });
  }

  const updatedPortfolio = {
    cash: gameState.portfolio.cash - totalCost,
    holdings: updatedHoldings
  };

  const { totalValue, holdingsValue } = calculatePortfolioValue(
    updatedPortfolio,
    gameState.currentDay,
    marketState.priceData
  );

  // Get the last snapshot to calculate percent change
  const lastSnapshot = gameState.portfolioValueHistory.length > 0
    ? gameState.portfolioValueHistory[gameState.portfolioValueHistory.length - 1]
    : null;

  const newSnapshot = {
    day: gameState.currentDay,
    cash: updatedPortfolio.cash,
    totalValue,
    holdingsValue,
    percentChange: calculateDailyReturn(
      { day: gameState.currentDay, cash: updatedPortfolio.cash, totalValue, holdingsValue, percentChange: null },
      lastSnapshot
    )
  };

  toast.success(`Successfully bought ${shares} shares of ${companyId} at AED ${currentPrice.toFixed(2)}`);

  return {
    ...gameState,
    transactions: [...gameState.transactions, newTransaction],
    portfolio: updatedPortfolio,
    portfolioValueHistory: [...gameState.portfolioValueHistory, newSnapshot],
    dailyTradesRemaining: gameState.dailyTradesRemaining - 1
  };
};

export const sellStock = (
  gameState: GameState,
  marketState: MarketState,
  companyId: string,
  shares: number
): GameState => {
  if (gameState.dailyTradesRemaining <= 0) {
    toast.error("No trades remaining for today!");
    return gameState;
  }

  if (shares <= 0) {
    toast.error("You must sell at least some shares!");
    return gameState;
  }

  const holdingIndex = gameState.portfolio.holdings.findIndex(
    h => h.companyId === companyId
  );

  if (holdingIndex === -1) {
    toast.error("You don't own any shares of this company!");
    return gameState;
  }

  const holding = gameState.portfolio.holdings[holdingIndex];

  if (holding.shares < shares) {
    toast.error(`You only have ${holding.shares} shares to sell!`);
    return gameState;
  }

  const currentPrice = getStockPrice(companyId, gameState.currentDay, marketState.priceData);
  if (!currentPrice) {
    toast.error("Could not get current price!");
    return gameState;
  }

  const totalProceeds = currentPrice * shares;

  const newTransaction: Transaction = {
    id: uuidv4(),
    type: 'sell',
    companyId,
    shares,
    price: currentPrice,
    day: gameState.currentDay,
    timestamp: Date.now()
  };

  let updatedHoldings = [...gameState.portfolio.holdings];

  // Update the holding or remove it if all shares sold
  if (holding.shares === shares) {
    // Remove the holding if selling all shares
    updatedHoldings = updatedHoldings.filter((_, index) => index !== holdingIndex);
  } else {
    // Update the holding if selling some shares
    updatedHoldings[holdingIndex] = {
      ...holding,
      shares: holding.shares - shares
      // Note: We keep purchase history intact for reporting
    };
  }

  const updatedPortfolio = {
    cash: gameState.portfolio.cash + totalProceeds,
    holdings: updatedHoldings
  };

  const { totalValue, holdingsValue } = calculatePortfolioValue(
    updatedPortfolio,
    gameState.currentDay,
    marketState.priceData
  );

  // Get the last snapshot to calculate percent change
  const lastSnapshot = gameState.portfolioValueHistory.length > 0
    ? gameState.portfolioValueHistory[gameState.portfolioValueHistory.length - 1]
    : null;

  const newSnapshot = {
    day: gameState.currentDay,
    cash: updatedPortfolio.cash,
    totalValue,
    holdingsValue,
    percentChange: calculateDailyReturn(
      { day: gameState.currentDay, cash: updatedPortfolio.cash, totalValue, holdingsValue, percentChange: null },
      lastSnapshot
    )
  };

  toast.success(`Successfully sold ${shares} shares of ${companyId} at AED ${currentPrice.toFixed(2)}`);

  return {
    ...gameState,
    transactions: [...gameState.transactions, newTransaction],
    portfolio: updatedPortfolio,
    portfolioValueHistory: [...gameState.portfolioValueHistory, newSnapshot],
    dailyTradesRemaining: gameState.dailyTradesRemaining - 1
  };
};

export const advanceToNextDay = (
  gameState: GameState,
  marketState: MarketState
): GameState => {
  const nextDay = gameState.currentDay + 1;
  
  if (nextDay > 5) {
    toast.info("Game is already on the final day!");
    return { ...gameState, isGameOver: true };
  }
  
  const { totalValue, holdingsValue } = calculatePortfolioValue(
    gameState.portfolio,
    nextDay,
    marketState.priceData
  );
  
  // Get the last snapshot to calculate percent change
  const lastSnapshot = gameState.portfolioValueHistory.length > 0
    ? gameState.portfolioValueHistory[gameState.portfolioValueHistory.length - 1]
    : null;
  
  const newSnapshot = {
    day: nextDay,
    cash: gameState.portfolio.cash,
    totalValue,
    holdingsValue,
    percentChange: calculateDailyReturn(
      { day: nextDay, cash: gameState.portfolio.cash, totalValue, holdingsValue, percentChange: null },
      lastSnapshot
    )
  };
  
  const isGameOver = nextDay === 5;
  
  toast.success(`Advanced to Day ${nextDay}${isGameOver ? " - Final Day!" : ""}`);
  
  // Use the stored tradesPerDay setting from the game settings
  const settings = loadGameSettings();
  
  return {
    ...gameState,
    currentDay: nextDay,
    portfolioValueHistory: [...gameState.portfolioValueHistory, newSnapshot],
    dailyTradesRemaining: settings.tradesPerDay,
    isGameOver
  };
};

export const resetGame = (settings: GameSettings): GameState => {
  return initializeGameState(settings);
};

export const calculateProfitLoss = (gameState: GameState): {
  amount: number;
  percentage: number;
} => {
  if (!gameState || !gameState.portfolioValueHistory.length) {
    return { amount: 0, percentage: 0 };
  }
  
  const startingValue = gameState.startingCapital;
  const finalValue = gameState.portfolioValueHistory[gameState.portfolioValueHistory.length - 1].totalValue;
  
  const amount = finalValue - startingValue;
  const percentage = (amount / startingValue) * 100;
  
  return { amount, percentage };
};

export const getBestAndWorstTrades = (
  gameState: GameState,
  marketState: MarketState
): {
  bestTrade: Transaction | null;
  worstTrade: Transaction | null;
  bestReturn: number;
  worstReturn: number;
} => {
  const { transactions } = gameState;
  if (!transactions || transactions.length === 0) {
    return {
      bestTrade: null,
      worstTrade: null,
      bestReturn: 0,
      worstReturn: 0
    };
  }
  
  let bestTrade: Transaction | null = null;
  let worstTrade: Transaction | null = null;
  let bestReturn = -Infinity;
  let worstReturn = Infinity;
  
  transactions.forEach(transaction => {
    if (transaction.type === 'buy') {
      // For buys, calculate return based on final value
      const finalPrice = getStockPrice(transaction.companyId, 5, marketState.priceData) || 0;
      const returnValue = ((finalPrice - transaction.price) / transaction.price) * 100;
      
      if (returnValue > bestReturn) {
        bestReturn = returnValue;
        bestTrade = transaction;
      }
      
      if (returnValue < worstReturn) {
        worstReturn = returnValue;
        worstTrade = transaction;
      }
    }
  });
  
  return {
    bestTrade,
    worstTrade,
    bestReturn,
    worstReturn
  };
};
