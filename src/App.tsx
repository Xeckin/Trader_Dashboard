import React, { useState, useEffect } from 'react';
import { AccountForm } from './components/AccountForm';
import { AccountList } from './components/AccountList';
import { AccountSummary } from './components/AccountSummary';
import type { TradingAccount, AccountFormData, FormOptions } from './types';
import { BarChart3, Moon, Sun, LayoutGrid, List } from 'lucide-react';

function App() {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formOptions, setFormOptions] = useState<FormOptions>({
    propFirms: [],
    strategies: [],
  });

  useEffect(() => {
    const newOptions: FormOptions = {
      propFirms: [...new Set(accounts.map(acc => acc.propFirm))],
      strategies: [...new Set(accounts.map(acc => acc.strategy))],
    };
    setFormOptions(newOptions);
  }, [accounts]);

  const handleAddAccount = (formData: AccountFormData & { metrics?: TradingAccount['metrics'] }) => {
    const newAccount: TradingAccount = {
      id: crypto.randomUUID(),
      ...formData,
      status: 'In Progress',
      metrics: formData.metrics || {
        totalProfit: 0,
        winRate: 0,
        drawdown: 0,
        tradingDays: 0,
        profitTarget: 3000,
        currentProgress: 0,
      },
    };
    setAccounts([...accounts, newAccount]);
  };

  const handleUpdateMetrics = (accountId: string, metrics: Partial<TradingAccount['metrics']>, firstTradeDate?: string) => {
    setAccounts(accounts.map(account => {
      if (account.id === accountId) {
        const updatedMetrics = { ...account.metrics, ...metrics };
        return {
          ...account,
          dateStarted: firstTradeDate || account.dateStarted,
          metrics: {
            ...updatedMetrics,
            currentProgress: (updatedMetrics.totalProfit / updatedMetrics.profitTarget) * 100
          }
        };
      }
      return account;
    }));
  };

  const handleUpdateAccount = (accountId: string, data: Partial<TradingAccount>) => {
    setAccounts(accounts.map(account => {
      if (account.id === accountId) {
        return { ...account, ...data };
      }
      return account;
    }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <header className={`${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-lg border-b border-blue-500/20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Trading Performance Dashboard
              </h1>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full hover:bg-gray-700/50 transition-colors duration-200 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <AccountForm 
            onSubmit={handleAddAccount} 
            darkMode={darkMode} 
            options={formOptions}
          />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${
                darkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>
                Trading Accounts
              </h2>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className={`p-2 rounded-md hover:bg-gray-700/50 transition-colors duration-200 flex items-center gap-2 ${
                  darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <List size={20} />
                    <span className="text-sm font-medium">List View</span>
                  </>
                ) : (
                  <>
                    <LayoutGrid size={20} />
                    <span className="text-sm font-medium">Grid View</span>
                  </>
                )}
              </button>
            </div>
            <AccountList 
              accounts={accounts} 
              darkMode={darkMode}
              viewMode={viewMode}
              onUpdateMetrics={handleUpdateMetrics}
              onUpdateAccount={handleUpdateAccount}
            />
          </div>

          <AccountSummary accounts={accounts} darkMode={darkMode} />
        </div>
      </main>
    </div>
  );
}

export default App;