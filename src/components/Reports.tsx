import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, CheckCircle, XCircle, AlertTriangle, DollarSign, Calendar, Clock } from 'lucide-react';
import type { TradingAccount } from '../types';

interface ReportsProps {
  accounts: TradingAccount[];
  darkMode: boolean;
}

export function Reports({ accounts, darkMode }: ReportsProps) {
  const totalProfit = accounts.reduce((sum, acc) => sum + acc.metrics.totalProfit, 0);
  const avgWinRate = accounts.reduce((sum, acc) => sum + acc.metrics.winRate, 0) / accounts.length || 0;
  const avgDrawdown = accounts.reduce((sum, acc) => sum + acc.metrics.drawdown, 0) / accounts.length || 0;
  
  const statusGroups = {
    inProgress: accounts.filter(acc => acc.status === 'In Progress'),
    passed: accounts.filter(acc => acc.status === 'Passed'),
    failed: accounts.filter(acc => acc.status === 'Failed'),
  };

  const propFirmStats = accounts.reduce((acc, account) => {
    if (!acc[account.propFirm]) {
      acc[account.propFirm] = {
        total: 0,
        passed: 0,
        failed: 0,
        inProgress: 0,
        totalProfit: 0,
      };
    }
    acc[account.propFirm].total++;
    acc[account.propFirm][account.status === 'Passed' ? 'passed' : account.status === 'Failed' ? 'failed' : 'inProgress']++;
    acc[account.propFirm].totalProfit += account.metrics.totalProfit;
    return acc;
  }, {} as Record<string, { total: number; passed: number; failed: number; inProgress: number; totalProfit: number; }>);

  const getStatusColor = (status: TradingAccount['status']) => {
    switch (status) {
      case 'Passed':
        return 'text-cyber-green';
      case 'Failed':
        return 'text-cyber-pink';
      default:
        return 'text-cyber-blue';
    }
  };

  const renderMetricCard = (title: string, value: string | number, icon: React.ReactNode, color: string = 'text-cyber-blue') => (
    <div className="relative bg-cyber-black/80 p-6 rounded-lg border border-cyber-blue/20 backdrop-blur-sm overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/5 to-cyber-pink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-center gap-4">
        <div className={`${color} bg-cyber-black/50 p-3 rounded-lg neon-pulse`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-cyber-blue/60">{title}</p>
          <p className={`text-xl font-bold ${color} neon-text`}>{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-cyber-black/50 border border-cyber-blue/20 text-cyber-blue hover:bg-cyber-blue/10 transition-all duration-300"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-3xl font-bold text-cyber-blue neon-text">Performance Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricCard('Total Accounts', accounts.length, <TrendingUp className="w-6 h-6" />)}
        {renderMetricCard('Total Profit', `$${totalProfit.toFixed(2)}`, <DollarSign className="w-6 h-6" />, totalProfit >= 0 ? 'text-cyber-green' : 'text-cyber-pink')}
        {renderMetricCard('Average Win Rate', `${avgWinRate.toFixed(1)}%`, <CheckCircle className="w-6 h-6" />, 'text-cyber-green')}
        {renderMetricCard('Average Drawdown', `$${avgDrawdown.toFixed(2)}`, <AlertTriangle className="w-6 h-6" />, 'text-cyber-pink')}
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/5 to-cyber-pink/5 rounded-lg" />
        <div className="relative bg-cyber-black/90 p-6 rounded-lg border border-cyber-blue/20 cyberpunk-shadow backdrop-blur-sm">
          <h2 className="text-xl font-bold text-cyber-blue neon-text mb-6">Account Status Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(statusGroups).map(([status, accounts]) => (
              <div key={status} className="relative bg-cyber-black/80 p-6 rounded-lg border border-cyber-blue/20 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  {status === 'passed' && <CheckCircle className="w-6 h-6 text-cyber-green" />}
                  {status === 'failed' && <XCircle className="w-6 h-6 text-cyber-pink" />}
                  {status === 'inProgress' && <Clock className="w-6 h-6 text-cyber-blue" />}
                  <h3 className="text-lg font-semibold text-cyber-blue">
                    {status === 'inProgress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </h3>
                </div>
                <p className="text-3xl font-bold mb-2 text-cyber-blue neon-text">
                  {accounts.length}
                </p>
                <p className="text-sm text-cyber-blue/60">
                  Total Profit: ${accounts.reduce((sum, acc) => sum + acc.metrics.totalProfit, 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/5 to-cyber-pink/5 rounded-lg" />
        <div className="relative bg-cyber-black/90 p-6 rounded-lg border border-cyber-blue/20 cyberpunk-shadow backdrop-blur-sm">
          <h2 className="text-xl font-bold text-cyber-blue neon-text mb-6">Prop Firm Performance</h2>
          <div className="grid gap-6">
            {Object.entries(propFirmStats).map(([firm, stats]) => (
              <div key={firm} className="relative bg-cyber-black/80 p-6 rounded-lg border border-cyber-blue/20 backdrop-blur-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-cyber-blue mb-2">{firm}</h3>
                    <p className="text-sm text-cyber-blue/60">
                      Total Accounts: {stats.total}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${stats.totalProfit >= 0 ? 'text-cyber-green' : 'text-cyber-pink'} neon-text`}>
                      ${stats.totalProfit.toFixed(2)}
                    </p>
                    <p className="text-sm text-cyber-blue/60">Total Profit</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-cyber-blue neon-text">{stats.inProgress}</p>
                    <p className="text-xs text-cyber-blue/60">In Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-cyber-green neon-text">{stats.passed}</p>
                    <p className="text-xs text-cyber-blue/60">Passed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-cyber-pink neon-text">{stats.failed}</p>
                    <p className="text-xs text-cyber-blue/60">Failed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}