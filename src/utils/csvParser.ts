import type { TradeMetrics } from '../types';

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
    const profitIndex = headers.findIndex(h => h === 'profit' || h === 'net profit');
    const entryTimeIndex = headers.findIndex(h => h === 'entry time' || h === 'date');
    const cumProfitIndex = headers.findIndex(h => h === 'cum. net profit' || h === 'cumulative net profit');
    const maeIndex = headers.findIndex(h => h === 'mae' || h === 'max adverse excursion');
    const strategyIndex = headers.findIndex(h => h === 'strategy');

    if (profitIndex === -1 || entryTimeIndex === -1) {
      throw new Error('CSV must contain Profit and Entry Time columns');
    }

    // Process trades and collect data
    const trades = lines.slice(1).map(line => {
      const columns = line.split(',').map(col => col.trim());
      const profitStr = columns[profitIndex].replace(/[$,]/g, '');
      const dateStr = columns[entryTimeIndex];
      
      // Parse date string
      let entryTime: Date;
      if (dateStr.includes('/')) {
        // Parse MM/DD/YYYY format
        const [month, day, year] = dateStr.split('/');
        // Create date using UTC to avoid timezone issues
        entryTime = new Date(Date.UTC(
          parseInt(year),
          parseInt(month) - 1, // Months are 0-based
          parseInt(day)
        ));
      } else {
        // Handle YYYY-MM-DD format
        entryTime = new Date(dateStr + 'T00:00:00Z');
      }

      // Validate the date
      if (isNaN(entryTime.getTime())) {
        console.error('Invalid date:', dateStr);
        throw new Error(`Invalid date format in CSV: ${dateStr}`);
      }

      return {
        profit: parseFloat(profitStr) || 0,
        entryTime,
        cumProfit: cumProfitIndex !== -1 ? parseFloat(columns[cumProfitIndex].replace(/[$,]/g, '')) || 0 : 0,
        mae: maeIndex !== -1 ? parseFloat(columns[maeIndex].replace(/[$,]/g, '')) || 0 : 0,
        strategy: strategyIndex !== -1 ? columns[strategyIndex] : undefined
      };
    });

    if (trades.length === 0) {
      throw new Error('No valid trades found in CSV');
    }

    // Sort trades by date to ensure we get the correct first trade
    trades.sort((a, b) => a.entryTime.getTime() - b.entryTime.getTime());

    // Extract strategy name - use the first non-empty strategy value
    const strategy = trades.find(t => t.strategy && t.strategy.trim())?.strategy;

    // Calculate metrics
    const totalProfit = trades.reduce((sum, trade) => sum + trade.profit, 0);
    const winningTrades = trades.filter(t => t.profit > 0).length;
    const winRate = (winningTrades / trades.length) * 100;

    // Calculate maximum drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let runningTotal = 0;
    
    trades.forEach(trade => {
      runningTotal += trade.profit;
      peak = Math.max(peak, runningTotal);
      const drawdown = peak - runningTotal;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    });

    // Get first trade date in YYYY-MM-DD format
    const firstTradeDate = trades[0].entryTime.toISOString().split('T')[0];

    // Count unique trading days
    const uniqueDays = new Set(
      trades.map(t => t.entryTime.toISOString().split('T')[0])
    );
    const tradingDays = uniqueDays.size;

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

export function parseRithmicCSV(csvContent: string): TradeMetrics {
  try {
    if (!csvContent || typeof csvContent !== 'string') {
      throw new Error('Invalid CSV content: File appears to be empty or corrupted');
    }

    // Split content into sections based on headers
    const sections = csvContent.split('\n\n');
    const completedOrdersSection = sections.find(section => 
      section.toLowerCase().includes('"account","status"')
    );

    if (!completedOrdersSection) {
      throw new Error('Could not find Completed Orders section in CSV');
    }

    // Split into lines and remove empty lines
    const lines = completedOrdersSection.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one trade');
    }

    // Parse headers - handle quoted fields properly
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    
    // Find required column indices
    const statusIndex = headers.indexOf('status');
    const buySellIndex = headers.indexOf('buy/sell');
    const avgFillPriceIndex = headers.indexOf('avg fill price');
    const qtyToFillIndex = headers.indexOf('qty to fill');
    const createTimeIndex = headers.indexOf('create time (edt)');

    // Process filled trades
    const trades = lines.slice(1)
      .map(line => {
        // Split by commas while respecting quotes
        const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
          .map(col => col.replace(/"/g, '').trim());

        if (columns[statusIndex] !== 'Filled') {
          return null;
        }

        const isBuy = columns[buySellIndex] === 'B';
        const qty = parseInt(columns[qtyToFillIndex]) || 0;
        const price = parseFloat(columns[avgFillPriceIndex].replace(/,/g, '')) || 0;
        const dateStr = columns[createTimeIndex]?.split(' ')[0];

        if (!price || !qty || !dateStr) {
          return null;
        }

        return {
          qty,
          price,
          isBuy,
          date: dateStr
        };
      })
      .filter((trade): trade is NonNullable<typeof trade> => trade !== null);

    if (trades.length === 0) {
      throw new Error('No valid filled trades found in CSV');
    }

    // Calculate metrics
    let position = 0;
    let avgEntryPrice = 0;
    let totalProfit = 0;
    let wins = 0;
    let maxDrawdown = 0;
    let peak = 0;
    let equity = 0;

    trades.forEach(trade => {
      const pointValue = 20; // NQ futures point value
      if (trade.isBuy) {
        if (position < 0) { // Closing short position
          const profit = (avgEntryPrice - trade.price) * Math.min(-position, trade.qty) * pointValue;
          totalProfit += profit;
          if (profit > 0) wins++;
          position += trade.qty;
          if (position >= 0) avgEntryPrice = position > 0 ? trade.price : 0;
        } else { // Opening/adding to long position
          const newPosition = position + trade.qty;
          avgEntryPrice = (avgEntryPrice * position + trade.price * trade.qty) / newPosition;
          position = newPosition;
        }
      } else { // Sell trade
        if (position > 0) { // Closing long position
          const profit = (trade.price - avgEntryPrice) * Math.min(position, trade.qty) * pointValue;
          totalProfit += profit;
          if (profit > 0) wins++;
          position -= trade.qty;
          if (position <= 0) avgEntryPrice = position < 0 ? trade.price : 0;
        } else { // Opening/adding to short position
          const newPosition = position - trade.qty;
          avgEntryPrice = (avgEntryPrice * -position + trade.price * trade.qty) / -newPosition;
          position = newPosition;
        }
      }

      equity = totalProfit;
      peak = Math.max(peak, equity);
      maxDrawdown = Math.max(maxDrawdown, peak - equity);
    });

    // Count unique trading days
    const uniqueDays = new Set(trades.map(t => t.date));

    return {
      totalProfit,
      winRate: trades.length > 0 ? (wins / trades.length) * 100 : 0,
      drawdown: maxDrawdown,
      tradingDays: uniqueDays.size
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Rithmic CSV Parsing Error:', error.message);
      throw new Error(`Failed to parse Rithmic CSV: ${error.message}`);
    } else {
      console.error('Rithmic CSV Parsing Error:', error);
      throw new Error('Failed to parse Rithmic CSV. Please ensure it\'s in the correct format.');
    }
  }
}