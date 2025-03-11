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
      color: 'text-cyber-blue'
    },
    {
      icon: <Target className="w-6 h-6" />,
      label: 'Success Rate',
      value: `${successRate.toFixed(1)}%`,
      color: 'text-cyber-green'
    },
    {
      icon: <ArrowDown className="w-6 h-6" />,
      label: 'Failed Accounts',
      value: `${failedAccounts} of ${totalAccounts}`,
      color: 'text-cyber-pink'
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
      color: 'text-cyber-pink'
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
      color: 'text-cyber-green'
    }
  ] : [];

  return (
    <div className="mt-12 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/5 to-cyber-pink/5 rounded-lg" />
      <div className="relative bg-cyber-black/90 p-6 rounded-lg border border-cyber-blue/20 cyberpunk-shadow backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6 text-cyber-blue neon-text">
          Portfolio Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...stats, ...warningStats, ...successStats].map((stat, index) => (
            <div
              key={index}
              className="relative bg-cyber-black/80 p-6 rounded-lg border border-cyber-blue/20 backdrop-blur-sm overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/5 to-cyber-pink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-4">
                <div className={`${stat.color} bg-cyber-black/50 p-3 rounded-lg neon-pulse`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-cyber-blue/60">
                    {stat.label}
                  </p>
                  <p className={`text-xl font-bold ${stat.color} neon-text`}>
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