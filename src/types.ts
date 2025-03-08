export interface TradingAccount {
  id: string;
  accountName: string;
  propFirm: string;
  platform: 'Rithmic' | 'Tradovate' | 'NinjaTrader' | 'MT4' | 'MT5';
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
  platform: 'Rithmic' | 'Tradovate' | 'NinjaTrader' | 'MT4' | 'MT5';
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

export interface FormOptions {
  propFirms: string[];
  logins: string[];
  servers: string[];
  strategies: string[];
}