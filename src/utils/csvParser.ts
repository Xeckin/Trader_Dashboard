export function parseNinjaTraderCSV(csvContent: string): {
  totalProfit: number;
  winRate: number;
  drawdown: number;
  tradingDays: number;
  firstTradeDate: string;
  strategy?: string;
} {
  try {
    if (!csvContent || typeof csvContent !== 'string') {
      throw new Error('Invalid CSV content: File appears to be empty or corrupted');
    }

    // Split into lines and remove empty lines
    const lines = csvContent.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one trade');
    }

    // Parse header to find column indices
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const profitIndex = headers.findIndex(h => h === 'profit');
    const entryTimeIndex = headers.findIndex(h => h === 'entry time');
    const cumProfitIndex = headers.findIndex(h => h === 'cum. net profit');
    const maeIndex = headers.findIndex(h => h === 'mae');
    const strategyIndex = headers.findIndex(h => h === 'strategy');

    if (profitIndex === -1 || entryTimeIndex === -1 || cumProfitIndex === -1 || maeIndex === -1) {
      throw new Error('Missing required columns: Profit, Entry time, Cum. net profit, or MAE');
    }

    // Find the first non-empty strategy name
    let strategy = '';
    if (strategyIndex !== -1) {
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map(col => col.trim());
        if (columns[strategyIndex] && columns[strategyIndex] !== '') {
          strategy = columns[strategyIndex];
          break;
        }
      }
    }

    // Remove header row and process trade data
    const trades = lines.slice(1).map(line => {
      const columns = line.split(',').map(col => col.trim());
      return {
        profit: parseFloat(columns[profitIndex].replace(/[($)]/g, '')) || 0,
        entryTime: new Date(columns[entryTimeIndex]),
        cumProfit: parseFloat(columns[cumProfitIndex].replace(/[($)]/g, '')) || 0,
        mae: parseFloat(columns[maeIndex].replace(/[($)]/g, '')) || 0
      };
    });

    // Calculate metrics
    const totalProfit = trades[trades.length - 1].cumProfit;
    const winningTrades = trades.filter(t => t.profit > 0).length;
    const winRate = (winningTrades / trades.length) * 100;

    // Calculate maximum drawdown
    let maxDrawdown = 0;
    let peak = 0;
    trades.forEach(trade => {
      const currentValue = trade.cumProfit;
      peak = Math.max(peak, currentValue);
      const drawdown = Math.abs(peak - currentValue);
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    });

    // Get first trade date
    const firstTrade = trades[0];
    const firstTradeDate = firstTrade.entryTime.toISOString().split('T')[0];

    // Count unique trading days
    const uniqueDays = new Set(
      trades.map(t => t.entryTime.toISOString().split('T')[0])
    );
    const tradingDays = uniqueDays.size;

    if (isNaN(totalProfit) || isNaN(winRate) || isNaN(maxDrawdown) || isNaN(tradingDays)) {
      throw new Error('Invalid numeric values in CSV');
    }

    return {
      totalProfit,
      winRate,
      drawdown: maxDrawdown,
      tradingDays,
      firstTradeDate,
      strategy: strategy || undefined
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('CSV Parsing Error:', error.message);
      throw new Error(`Failed to parse CSV file: ${error.message}`);
    } else {
      console.error('CSV Parsing Error:', error);
      throw new Error('Failed to parse CSV file. Please ensure it\'s in the correct format.');
    }
  }
}