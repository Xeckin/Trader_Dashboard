import React, { useRef, useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, XCircle, Download, Upload } from 'lucide-react';
import type { TradingAccount } from '../types';
import { parseNinjaTraderCSV } from '../utils/csvParser';

interface AccountListProps {
  accounts: TradingAccount[];
  darkMode: boolean;
  onUpdateMetrics: (accountId: string, metrics: Partial<TradingAccount['metrics']>) => void;
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

  const handleDownload = (account: TradingAccount) => {
    if (account.strategyFile) {
      const blob = new Blob([account.strategyFile.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = account.strategyFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleImportCSV = async (accountId: string, file: File) => {
    try {
      const content = await file.text();
      const metrics = parseNinjaTraderCSV(content);
      const account = accounts.find(a => a.id === accountId);
      
      if (account) {
        onUpdateMetrics(accountId, {
          totalProfit: metrics.totalProfit,
          winRate: metrics.winRate,
          drawdown: metrics.drawdown,
          tradingDays: metrics.tradingDays,
        });
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error importing CSV file. Please check the format.');
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
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {account.strategy}
                  </span>
                  {account.strategyFile && (
                    <button
                      onClick={() => handleDownload(account)}
                      className="text-blue-400 hover:text-blue-500 transition-colors"
                      title="Download Strategy File"
                    >
                      <Download size={18} />
                    </button>
                  )}
                </div>
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
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Win Rate:</span>
                <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {account.metrics.winRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Max Drawdown:</span>
                <span className="font-medium text-red-400">
                  {account.metrics.drawdown}%
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
              
              <div className="mt-4">
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
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}