import React from 'react';
import { TrendingUp, AlertTriangle, Target, ArrowDown, CheckCircle2 } from 'lucide-react';
import type { TradingAccount } from '../types';

interface AccountSummaryProps {
  accounts: TradingAccount[];
  darkMode: boolean;
}

export function AccountSummary({ accounts, darkMode }: AccountSummaryProps) {
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter(acc => acc.status === 'In Progress').length;
  const passedAccounts = accounts.filter(acc => acc.status === 'Passed').length;
  const failedAccounts = accounts.filter(acc => acc.status === 'Failed').length;
  
  const successRate = totalAccounts > 0 
    ? (passedAccounts / (passedAccounts + failedAccounts)) * 100 
    : 0;
  
  const stats = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'In Progress',
      value: `${activeAccounts} account${activeAccounts !== 1 ? 's' : ''}`,
      color: 'text-blue-400'
    },
    {
      icon: <Target className="w-6 h-6" />,
      label: 'Success Rate',
      value: `${successRate.toFixed(1)}%`,
      color: 'text-green-400'
    },
    {
      icon: <ArrowDown className="w-6 h-6" />,
      label: 'Failed Accounts',
      value: `${failedAccounts} of ${totalAccounts}`,
      color: 'text-red-400'
    }
  ];

  // Calculate warning stats
  const accountsNearLimit = accounts.filter(acc => 
    acc.metrics.distanceFromDailyLimit < 500 || 
    acc.metrics.distanceFromDrawdown < 500
  ).length;

  const warningStats = accountsNearLimit > 0 ? [
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      label: 'Near Limits',
      value: `${accountsNearLimit} account${accountsNearLimit > 1 ? 's' : ''}`,
      color: 'text-yellow-400'
    }
  ] : [];

  // Calculate success stats
  const accountsNearTarget = accounts.filter(acc => 
    acc.metrics.distanceFromTarget < 500 && 
    acc.metrics.completedTradingDays >= acc.metrics.minimumTradingDays
  ).length;

  const successStats = accountsNearTarget > 0 ? [
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      label: 'Near Target',
      value: `${accountsNearTarget} account${accountsNearTarget > 1 ? 's' : ''}`,
      color: 'text-green-400'
    }
  ] : [];

  return (
    <div className={`mt-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border border-blue-500/20 overflow-hidden`}>
      <div className="p-6">
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-blue-400' : 'text-gray-800'}`}>
          Portfolio Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...stats, ...warningStats, ...successStats].map((stat, index) => (
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