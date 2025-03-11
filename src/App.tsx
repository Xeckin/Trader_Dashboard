import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AccountForm } from './components/AccountForm';
import { AccountList } from './components/AccountList';
import { AccountSummary } from './components/AccountSummary';
import { Reports } from './components/Reports';
import type { TradingAccount, AccountFormData, FormOptions } from './types';
import { BarChart3, Moon, Sun, LayoutGrid, List, FileText } from 'lucide-react';

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

  const renderHeader = () => (
    <header className="bg-cyber-black/90 backdrop-blur-lg border-b border-cyber-blue/20 relative overflow-hidden">
      <div className="scanline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-cyber-blue animate-glow" />
                <h1 className="text-2xl font-bold text-cyber-blue neon-text">
                  Trading Performance
                </h1>
              </Link>
              <Link
                to="/reports"
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-cyber-black/50 border border-cyber-blue/20 text-cyber-blue hover:bg-cyber-blue/10 transition-all duration-300"
              >
                <FileText size={20} />
                <span>Reports</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="cyber-button p-2 rounded-md bg-cyber-black/50 border border-cyber-blue/20 text-cyber-blue hover:border-cyber-blue/40 transition-all duration-300"
              >
                {viewMode === 'grid' ? <List size={20} /> : <LayoutGrid size={20} />}
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="cyber-button p-2 rounded-md bg-cyber-black/50 border border-cyber-blue/20 text-cyber-blue hover:border-cyber-blue/40 transition-all duration-300"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <Router>
      <div className="min-h-screen bg-cyber-black cyberpunk-grid transition-all duration-300">
        {renderHeader()}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8">
                <AccountForm 
                  onSubmit={handleAddAccount} 
                  darkMode={darkMode} 
                  options={formOptions}
                />
                <div>
                  <h2 className="text-xl font-semibold text-cyber-blue neon-text mb-4">
                    Trading Accounts
                  </h2>
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
            } />
            <Route path="/reports" element={
              <Reports accounts={accounts} darkMode={darkMode} />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;