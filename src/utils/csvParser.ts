export function parseNinjaTraderCSV(csvContent: string): {
  totalProfit: number;
  winRate: number;
  drawdown: number;
  tradingDays: number;
  firstTradeDate: string;
} {
  try {
    if (!csvContent || typeof csvContent !== 'string') {
      throw new Error('Invalid CSV content: File appears to be empty or corrupted');
    }

    // Split into lines and remove empty lines and whitespace
    const lines = csvContent.split('\n').map(line => line.trim()).filter(Boolean);
    
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row');
    }

    // Validate header row
    const headerRow = lines[0].split(',');
    if (headerRow.length < 10) {
      throw new Error('Invalid CSV format: Missing required columns in header');
    }

    // Get the first trade date from the first data row
    const firstDataRow = lines[1].split(',');
    if (!firstDataRow[0] || !/^\d{4}-\d{2}-\d{2}$/.test(firstDataRow[0])) {
      throw new Error('Invalid date format in CSV. Expected format: YYYY-MM-DD');
    }
    const firstTradeDate = firstDataRow[0];

    // Get the last line for the most recent metrics
    const lastLine = lines[lines.length - 1].split(',');

    // Validate data row
    if (lastLine.length < 10) {
      throw new Error('Invalid CSV format: Missing required columns in data row');
    }

    // Parse values with strict validation
    const totalProfitStr = lastLine[2]?.replace(/[$,]/g, '');
    const winRateStr = lastLine[9]?.replace('%', '');
    const drawdownStr = lastLine[7]?.replace(/[$,]/g, '');

    if (!totalProfitStr || !winRateStr || !drawdownStr) {
      throw new Error('Invalid CSV format: Missing required values');
    }

    const totalProfit = parseFloat(totalProfitStr);
    const winRate = parseFloat(winRateStr);
    const drawdown = Math.abs(parseFloat(drawdownStr));
    const tradingDays = lines.length - 1; // Subtract header row

    if (isNaN(totalProfit) || isNaN(winRate) || isNaN(drawdown)) {
      throw new Error('Invalid numeric values in CSV');
    }

    return {
      totalProfit,
      winRate,
      drawdown,
      tradingDays,
      firstTradeDate,
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