import type { TradingAccount, TopstepRules, TradeMetrics } from '../types';

export function calculateTopstepMetrics(
  account: TradingAccount,
  rules: TopstepRules,
  dailyPnL: number
): Partial<TradingAccount['metrics']> {
  const startDate = new Date(account.dateStarted);
  const currentDate = new Date();
  const daysPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const currentBalance = account.metrics.startingBalance + account.metrics.totalProfit;
  const highWaterMark = Math.max(account.metrics.highWaterMark, currentBalance);
  
  // Calculate distances from limits
  const distanceFromTarget = rules.profitTarget - account.metrics.totalProfit;
  const distanceFromDailyLimit = Math.abs(rules.dailyLossLimit) + dailyPnL;
  const distanceFromDrawdown = Math.abs(rules.maxDrawdownLimit) - account.metrics.drawdown;
  
  // Calculate days remaining
  const daysRemaining = Math.max(0, rules.maxTradingDays - daysPassed);
  
  // Calculate progress percentage
  const currentProgress = (account.metrics.totalProfit / rules.profitTarget) * 100;

  return {
    currentBalance,
    highWaterMark,
    dailyPnL,
    daysRemaining,
    distanceFromTarget,
    distanceFromDailyLimit,
    distanceFromDrawdown,
    currentProgress: Math.min(100, Math.max(0, currentProgress)),
    completedTradingDays: Math.min(account.metrics.tradingDays, rules.maxTradingDays)
  };
}

export function checkTopstepStatus(
  metrics: TradingAccount['metrics'],
  rules: TopstepRules
): 'In Progress' | 'Passed' | 'Failed' {
  // Check for failure conditions
  if (metrics.dailyPnL <= rules.dailyLossLimit) {
    return 'Failed';
  }
  if (metrics.drawdown >= Math.abs(rules.maxDrawdownLimit)) {
    return 'Failed';
  }
  if (metrics.daysRemaining <= 0 && metrics.totalProfit < rules.profitTarget) {
    return 'Failed';
  }

  // Check for success conditions
  if (
    metrics.totalProfit >= rules.profitTarget &&
    metrics.completedTradingDays >= rules.minimumTradingDays
  ) {
    return 'Passed';
  }

  // Otherwise still in progress
  return 'In Progress';
}

export function initializeTopstepMetrics(rules: TopstepRules): TradingAccount['metrics'] {
  return {
    totalProfit: 0,
    winRate: 0,
    drawdown: 0,
    tradingDays: 0,
    profitTarget: rules.profitTarget,
    currentProgress: 0,
    startingBalance: 50000, // For 50K account
    currentBalance: 50000,
    highWaterMark: 50000,
    dailyPnL: 0,
    daysRemaining: rules.maxTradingDays,
    distanceFromTarget: rules.profitTarget,
    distanceFromDailyLimit: Math.abs(rules.dailyLossLimit),
    distanceFromDrawdown: Math.abs(rules.maxDrawdownLimit),
    dailyLossLimit: rules.dailyLossLimit,
    maxDrawdownLimit: rules.maxDrawdownLimit,
    minimumTradingDays: rules.minimumTradingDays,
    completedTradingDays: 0
  };
}