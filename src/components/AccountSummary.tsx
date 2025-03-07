import React from 'react';
import { DollarSign, TrendingUp, Calendar, Percent } from 'lucide-react';
import type { TradingAccount } from '../types';

interface AccountSummaryProps {
  accounts: TradingAccount[];
  darkMode: boolean;
}

export function AccountSummary({ accounts, darkMode }: AccountSummaryProps) {
  const totalProfit = accounts.reduce((sum, acc) => sum + acc.metrics.totalProfit, 0);
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter(acc => acc.status === 'In Progress').length;
  const completedAccounts = accounts.filter(acc => acc.status === 'Completed').length;
  const failedAccounts = accounts.filter(acc => acc.status === 'Failed').length;
  const averageProgress = accounts.length > 0
    ? accounts.reduce((sum, acc) => sum + acc.metrics.currentProgress, 0) / accounts.length
    : 0;

  const stats = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      label: 'Total Profit',
      value: `$${totalProfit.toFixed(2)}`,
      color: totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Average Progress',
      value: `${averageProgress.toFixed(1)}%`,
      color: 'text-blue-400'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      label: 'Active Accounts',
      value: `${activeAccounts} of ${totalAccounts}`,
      color: 'text-purple-400'
    },
    {
      icon: <Percent className="w-6 h-6" />,
      label: 'Success Rate',
      value: totalAccounts > 0 
        ? `${((completedAccounts / totalAccounts) * 100).toFixed(1)}%`
        : '0%',
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className={`mt-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border border-blue-500/20 overflow-hidden`}>
      <div className="p-6">
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-blue-400' : 'text-gray-800'}`}>
          Portfolio Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${
                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              } p-6 rounded-lg border border-blue-500/10 backdrop-blur-sm relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-4">
                <div className={`${stat.color} bg-white/5 p-3 rounded-lg`}>
                  {stat.icon}
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </p>
                  <p className={`text-xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}