import React, { useRef, useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, XCircle, Download, Upload } from 'lucide-react';
import type { TradingAccount } from '../types';
import { parseNinjaTraderCSV } from '../utils/csvParser';

interface AccountListProps {
  accounts: TradingAccount[];
  darkMode: boolean;
  onUpdateMetrics: (accountId: string, metrics: Partial<TradingAccount['metrics']>, firstTradeDate?: string) => void;
}

export function AccountList({ accounts, darkMode, onUpdateMetrics }: AccountListProps) {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [editingTarget, setEditingTarget] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="text-green-400" />;
      case 'Failed':
        return <XCircle className="text-red-400" />;
      default:
        return <TrendingUp className="text-blue-400" />;
    }
  };

  const handleDownloadCSV = (account: TradingAccount) => {
    try {
      // Create a sample CSV with the current metrics
      const csvHeader = 'Date,Trade #,Net Profit,Gross Profit,Gross Loss,Commission,Max Drawdown,Win Rate';
      const csvData = `${account.dateStarted},1,${account.metrics.totalProfit},${Math.max(0, account.metrics.totalProfit)},${Math.min(0, account.metrics.totalProfit)},0,${account.metrics.drawdown},${account.metrics.winRate}`;
      
      const csvContent = `${csvHeader}\n${csvData}`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${account.accountName}_performance.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV file. Please try again.');
    }
  };

  const handleImportCSV = async (accountId: string, file: File) => {
    try {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Please select a valid CSV file');
      }

      const content = await file.text();
      if (!content.trim()) {
        throw new Error('The CSV file appears to be empty');
      }

      const { totalProfit, winRate, drawdown, tradingDays, firstTradeDate } = parseNinjaTraderCSV(content);
      
      onUpdateMetrics(
        accountId,
        {
          totalProfit,
          winRate,
          drawdown,
          tradingDays,
        },
        firstTradeDate
      );
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert(error instanceof Error ? error.message : 'Failed to parse CSV file');
      
      // Reset file input
      if (fileInputRefs.current[accountId]) {
        fileInputRefs.current[accountId]!.value = '';
      }
    }
  };

  const handleTargetClick = (accountId: string) => {
    setEditingTarget(accountId);
  };

  const handleTargetKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, accountId: string) => {
    if (e.key === 'Enter') {
      const target = parseFloat(e.currentTarget.value);
      if (!isNaN(target) && target > 0) {
        onUpdateMetrics(accountId, { profitTarget: target });
        setEditingTarget(null);
      } else {
        alert('Please enter a valid positive number');
      }
    } else if (e.key === 'Escape') {
      setEditingTarget(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {accounts.map((account) => (
        <div
          key={account.id}
          className={`${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-500/20 backdrop-blur-sm relative overflow-hidden group`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-gray-800'}`}>
                  {account.accountName}
                </h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{account.propFirm}</p>
              </div>
              {getStatusIcon(account.status)}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Platform:</span>
                <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {account.platform}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Strategy:</span>
                <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {account.strategy}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Started:</span>
                <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {new Date(account.dateStarted).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleTargetClick(account.id)}
                  className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors cursor-pointer`}
                >
                  Target:
                </button>
                {editingTarget === account.id ? (
                  <input
                    type="number"
                    defaultValue={account.metrics.profitTarget}
                    onKeyDown={(e) => handleTargetKeyDown(e, account.id)}
                    onBlur={() => setEditingTarget(null)}
                    autoFocus
                    className={`w-24 px-2 py-1 rounded ${
                      darkMode 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-white text-gray-900 border-gray-300'
                    } border`}
                  />
                ) : (
                  <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    ${account.metrics.profitTarget.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Profit:</span>
                <span className={`font-medium ${
                  account.metrics.totalProfit >= 0 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  ${account.metrics.totalProfit.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-600/20">
              <div className="flex justify-between items-center mb-2">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {account.metrics.currentProgress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  style={{ width: `${account.metrics.currentProgress}%` }}
                ></div>
              </div>
              
              <div className="mt-4 space-y-2">
                <input
                  type="file"
                  accept=".csv"
                  ref={el => fileInputRefs.current[account.id] = el}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImportCSV(account.id, file);
                    }
                  }}
                />
                <button
                  onClick={() => fileInputRefs.current[account.id]?.click()}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  } transition-colors`}
                >
                  <Upload size={16} />
                  Import Trades
                </button>
                <button
                  onClick={() => handleDownloadCSV(account)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md ${
                    darkMode 
                      ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300' 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                  } transition-colors border border-gray-600/20`}
                >
                  <Download size={16} />
                  Download Performance
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}