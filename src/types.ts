export interface TradingAccount {
  id: string;
  accountName: string;
  propFirm: string;
  platform: 'MT4' | 'MT5' | 'Tradovate' | 'Rithmic' | 'NinjaTrader';
  login: string;
  server: string;
  strategy: string;
  strategyFile?: {
    name: string;
    content: string;
  };
  dateStarted: string;
  status: 'In Progress' | 'Completed' | 'Failed';
  metrics: {
    totalProfit: number;
    winRate: number;
    drawdown: number;
    tradingDays: number;
    profitTarget: number;
    currentProgress: number;
  };
}

export interface AccountFormData {
  accountName: string;
  propFirm: string;
  platform: 'MT4' | 'MT5' | 'Tradovate' | 'Rithmic' | 'NinjaTrader';
  login: string;
  server: string;
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