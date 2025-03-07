export function parseNinjaTraderCSV(csvContent: string): {
  totalProfit: number;
  winRate: number;
  drawdown: number;
  tradingDays: number;
} {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('Invalid CSV format');
  }

  // Get the last line for the most recent metrics
  const lastLine = lines[lines.length - 1];
  const values = lastLine.split(',');

  // Parse values based on known CSV structure
  const totalProfit = parseFloat(values[2].replace('$', '').replace(',', ''));
  const winRate = parseFloat(values[9].replace('%', ''));
  const drawdown = Math.abs(parseFloat(values[7].replace('$', '').replace(',', '')));
  const tradingDays = lines.length - 1; // Subtract header row

  return {
    totalProfit,
    winRate,
    drawdown,
    tradingDays,
  };
}