export interface TradingAccount {
  id: string;
  accountName: string;
  propFirm: string;
  platform: 'Rithmic' | 'Tradovate' | 'NinjaTrader' | 'MT4' | 'MT5';
  strategy: string;
  strategyFile?: {
    name: string;
    content: string;
  };
  dateStarted: string;
  status: 'In Progress' | 'Passed' | 'Failed';
  login?: string;
  server?: string;
  metrics: {
    totalProfit: number;
    winRate: number;
    drawdown: number;
    tradingDays: number;
    profitTarget: number;
    currentProgress: number;
    // Topstep specific metrics
    startingBalance: number;
    currentBalance: number;
    highWaterMark: number;
    dailyPnL: number;
    daysRemaining: number;
    distanceFromTarget: number;
    distanceFromDailyLimit: number;
    distanceFromDrawdown: number;
    dailyLossLimit: number;
    maxDrawdownLimit: number;
    minimumTradingDays: number;
    completedTradingDays: number;
  };
}

export interface AccountFormData {
  accountName: string;
  propFirm: string;
  platform: 'Rithmic' | 'Tradovate' | 'NinjaTrader' | 'MT4' | 'MT5';
  strategy: string;
  strategyFile?: {
    name: string;
    content: string;
  };
  dateStarted: string;
}

export interface TradeMetrics {
  totalProfit: number;
  winRate: number;
  drawdown: number;
  tradingDays: number;
}

export interface FormOptions {
  propFirms: string[];
  strategies: string[];
}

export interface TopstepRules {
  profitTarget: number;
  dailyLossLimit: number;
  maxDrawdownLimit: number;
  minimumTradingDays: number;
  maxTradingDays: number;
}

export const TOPSTEP_50K_RULES: TopstepRules = {
  profitTarget: 3000,
  dailyLossLimit: -2000,
  maxDrawdownLimit: -2000,
  minimumTradingDays: 10,
  maxTradingDays: 60,
};