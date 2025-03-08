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
        profitTarget: 3000, // Default target
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

      // Parse CSV headers and first row
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const accountIndex = headers.findIndex(h => h === 'account');

      if (accountIndex === -1) {
        throw new Error('CSV must contain an "Account" column');
      }

      const accountName = lines[1].split(',')[accountIndex].trim();
      
      // Parse the CSV using the utility function
      const { totalProfit, winRate, drawdown, tradingDays, strategy, firstTradeDate } = parseNinjaTraderCSV(content);
      
      // Update form with extracted data
      setFormData(prev => ({
        ...prev,
        accountName: accountName || '',
        propFirm: '', // Leave prop firm empty as it's not in the CSV
        platform: 'NinjaTrader', // Default to NinjaTrader since it's a NT8 export format
        strategy: strategy || '',
        dateStarted: firstTradeDate,
      }));

      // Set the performance metrics
      setMetrics({
        totalProfit,
        winRate,
        drawdown,
        tradingDays,
      });

    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert(error instanceof Error ? error.message : 'Failed to parse CSV file');
      if (csvInputRef.current) {
        csvInputRef.current.value = '';
      }
    }
  };

  const inputClasses = `w-full p-2 rounded-md border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 text-white' 
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const labelClasses = `block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`;

  const renderDatalist = (id: string, options: string[]) => (
    <datalist id={id}>
      {options.map((option, index) => (
        <option key={index} value={option} />
      ))}
    </datalist>
  );

  return (
    <form onSubmit={handleSubmit} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md border border-blue-500/20 backdrop-blur-sm`}>
      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-blue-400' : 'text-gray-800'} flex items-center`}>
        <PlusCircle className="mr-2" /> Add Trading Account
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>
            Account Name
          </label>
          <input
            type="text"
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
            className={inputClasses}
            required
          />
        </div>
        <div>
          <label className={labelClasses}>
            Prop Firm
          </label>
          <input
            type="text"
            value={formData.propFirm}
            onChange={(e) => setFormData({ ...formData, propFirm: e.target.value })}
            className={inputClasses}
            list="propFirms"
            required
          />
          {renderDatalist('propFirms', options.propFirms)}
        </div>
        <div>
          <label className={labelClasses}>
            Platform
          </label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value as AccountFormData['platform'] })}
            className={inputClasses}
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
          <label className={labelClasses}>
            Strategy
          </label>
          <input
            type="text"
            value={formData.strategy}
            onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
            className={inputClasses}
            required
          />
        </div>
        <div>
          <label className={labelClasses}>
            Date Started
          </label>
          <input
            type="date"
            value={formData.dateStarted}
            onChange={(e) => setFormData({ ...formData, dateStarted: e.target.value })}
            className={inputClasses}
            required
          />
        </div>
        <div>
          <label className={labelClasses}>
            Strategy File (.cs)
          </label>
          <input
            type="file"
            ref={fileInputRef}
            accept=".cs"
            onChange={handleFileChange}
            className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600`}
          />
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors duration-200 border border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        >
          <PlusCircle size={20} />
          Add Account
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>or</span>
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
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md ${
            darkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          } transition-colors border border-gray-600/20`}
        >
          <Upload size={20} />
          Import Trades to Add Account
        </button>
      </div>
    </form>
  );
}