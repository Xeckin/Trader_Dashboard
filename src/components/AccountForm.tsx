import React, { useState, useRef } from 'react';
import { PlusCircle, Upload, FileCode2 } from 'lucide-react';
import type { AccountFormData, FormOptions } from '../types';
import { parseNinjaTraderCSV } from '../utils/csvParser';

interface AccountFormProps {
  onSubmit: (data: AccountFormData & { metrics?: { 
    totalProfit: number;
    winRate: number;
    drawdown: number;
    tradingDays: number;
    profitTarget: number;
    currentProgress: number;
  }}) => void;
  darkMode: boolean;
  options: FormOptions;
}

export function AccountForm({ onSubmit, darkMode, options }: AccountFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<AccountFormData>({
    accountName: '',
    propFirm: '',
    platform: 'Rithmic',
    strategy: '',
    dateStarted: new Date().toISOString().split('T')[0],
  });
  const [metrics, setMetrics] = useState<{
    totalProfit: number;
    winRate: number;
    drawdown: number;
    tradingDays: number;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      metrics: metrics ? {
        ...metrics,
        profitTarget: 3000,
        currentProgress: (metrics.totalProfit / 3000) * 100
      } : undefined
    });
    setFormData({
      accountName: '',
      propFirm: '',
      platform: 'Rithmic',
      strategy: '',
      dateStarted: new Date().toISOString().split('T')[0],
    });
    setMetrics(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.cs')) {
      const content = await file.text();
      setFormData({
        ...formData,
        strategyFile: {
          name: file.name,
          content: content
        }
      });
    } else if (file) {
      alert('Please upload a .cs file');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
      
      if (lines.length < 2) {
        throw new Error('CSV must contain at least a header row and one trade');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const accountIndex = headers.findIndex(h => h === 'account');

      if (accountIndex === -1) {
        throw new Error('CSV must contain an "Account" column');
      }

      const accountName = lines[1].split(',')[accountIndex].trim();
      const { totalProfit, winRate, drawdown, tradingDays, strategy, firstTradeDate } = parseNinjaTraderCSV(content);
      
      setFormData(prev => ({
        ...prev,
        accountName: accountName || '',
        propFirm: '',
        platform: 'NinjaTrader',
        strategy: strategy || '',
        dateStarted: firstTradeDate,
      }));

      setMetrics({
        totalProfit,
        winRate,
        drawdown,
        tradingDays,
      });

    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert(error instanceof Error ? error.message : 'Failed to parse CSV file');
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  const renderDatalist = (id: string, options: string[]) => (
    <datalist id={id}>
      {options.map((option, index) => (
        <option key={index} value={option} />
      ))}
    </datalist>
  );

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/5 to-cyber-pink/5 rounded-lg" />
      <div className="relative bg-cyber-black/90 p-6 rounded-lg border border-cyber-blue/20 cyberpunk-shadow backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="w-6 h-6 text-cyber-blue neon-text" />
          <h2 className="text-2xl font-bold text-cyber-blue neon-text">Add Trading Account</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-cyber-blue/60 mb-1">
              Account Name
            </label>
            <input
              type="text"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              className="w-full p-2 rounded-md bg-cyber-black/80 text-cyber-blue border border-cyber-blue/30 focus:border-cyber-blue/60 focus:ring-1 focus:ring-cyber-blue/30 placeholder-cyber-blue/30"
              required
              placeholder="Enter account name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyber-blue/60 mb-1">
              Prop Firm
            </label>
            <input
              type="text"
              value={formData.propFirm}
              onChange={(e) => setFormData({ ...formData, propFirm: e.target.value })}
              className="w-full p-2 rounded-md bg-cyber-black/80 text-cyber-blue border border-cyber-blue/30 focus:border-cyber-blue/60 focus:ring-1 focus:ring-cyber-blue/30 placeholder-cyber-blue/30"
              list="propFirms"
              required
              placeholder="Select or enter prop firm"
            />
            {renderDatalist('propFirms', options.propFirms)}
          </div>

          <div>
            <label className="block text-sm font-medium text-cyber-blue/60 mb-1">
              Platform
            </label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value as AccountFormData['platform'] })}
              className="w-full p-2 rounded-md bg-cyber-black/80 text-cyber-blue border border-cyber-blue/30 focus:border-cyber-blue/60 focus:ring-1 focus:ring-cyber-blue/30"
              required
            >
              <option value="Rithmic">Rithmic</option>
              <option value="Tradovate">Tradovate</option>
              <option value="NinjaTrader">NinjaTrader</option>
              <option value="MT4">MT4</option>
              <option value="MT5">MT5</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cyber-blue/60 mb-1">
              Strategy
            </label>
            <input
              type="text"
              value={formData.strategy}
              onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
              className="w-full p-2 rounded-md bg-cyber-black/80 text-cyber-blue border border-cyber-blue/30 focus:border-cyber-blue/60 focus:ring-1 focus:ring-cyber-blue/30 placeholder-cyber-blue/30"
              required
              placeholder="Enter strategy name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyber-blue/60 mb-1">
              Date Started
            </label>
            <input
              type="date"
              value={formData.dateStarted}
              onChange={(e) => setFormData({ ...formData, dateStarted: e.target.value })}
              className="w-full p-2 rounded-md bg-cyber-black/80 text-cyber-blue border border-cyber-blue/30 focus:border-cyber-blue/60 focus:ring-1 focus:ring-cyber-blue/30"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyber-blue/60 mb-1">
              Strategy File (.cs)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".cs"
              onChange={handleFileChange}
              className="w-full p-2 rounded-md bg-cyber-black/80 text-cyber-blue border border-cyber-blue/30 focus:border-cyber-blue/60 focus:ring-1 focus:ring-cyber-blue/30 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-cyber-blue/30 file:text-sm file:font-medium file:bg-cyber-black file:text-cyber-blue hover:file:bg-cyber-blue/10 file:transition-colors"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <button
            type="submit"
            className="w-full bg-cyber-black/80 text-cyber-blue py-3 px-4 rounded-md hover:bg-cyber-blue/10 transition-all duration-300 border border-cyber-blue/30 cyber-button group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/0 via-cyber-blue/20 to-cyber-blue/0 group-hover:animate-[gradient_2s_ease-in-out_infinite]" />
            <span className="relative flex items-center justify-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Add Account
            </span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyber-blue/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-cyber-black text-cyber-blue/60">or</span>
            </div>
          </div>

          <input
            type="file"
            ref={csvInputRef}
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => csvInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-cyber-black/80 text-cyber-blue hover:bg-cyber-blue/10 transition-all duration-300 border border-cyber-blue/30 cyber-button group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/0 via-cyber-blue/10 to-cyber-blue/0 group-hover:animate-[gradient_2s_ease-in-out_infinite]" />
            <span className="relative flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Trades to Add Account
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}