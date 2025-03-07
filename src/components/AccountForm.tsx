import React, { useState, useRef } from 'react';
import { PlusCircle, Upload } from 'lucide-react';
import type { AccountFormData } from '../types';

interface AccountFormProps {
  onSubmit: (data: AccountFormData) => void;
  darkMode: boolean;
}

export function AccountForm({ onSubmit, darkMode }: AccountFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<AccountFormData>({
    accountName: '',
    propFirm: '',
    platform: 'MT4',
    login: '',
    server: '',
    strategy: '',
    dateStarted: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      accountName: '',
      propFirm: '',
      platform: 'MT4',
      login: '',
      server: '',
      strategy: '',
      dateStarted: new Date().toISOString().split('T')[0],
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  return (
    <form onSubmit={handleSubmit} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md border border-blue-500/20 backdrop-blur-sm`}>
      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-blue-400' : 'text-gray-800'} flex items-center`}>
        <PlusCircle className="mr-2" /> Add Trading Account
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Account Name
          </label>
          <input
            type="text"
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
            className={`w-full p-2 rounded-md border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Prop Firm
          </label>
          <input
            type="text"
            value={formData.propFirm}
            onChange={(e) => setFormData({ ...formData, propFirm: e.target.value })}
            className={`w-full p-2 rounded-md border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Platform
          </label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value as AccountFormData['platform'] })}
            className={`w-full p-2 rounded-md border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          >
            <option value="MT4">MT4</option>
            <option value="MT5">MT5</option>
            <option value="Tradovate">Tradovate</option>
            <option value="Rithmic">Rithmic</option>
            <option value="NinjaTrader">NinjaTrader</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Login
          </label>
          <input
            type="text"
            value={formData.login}
            onChange={(e) => setFormData({ ...formData, login: e.target.value })}
            className={`w-full p-2 rounded-md border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Server
          </label>
          <input
            type="text"
            value={formData.server}
            onChange={(e) => setFormData({ ...formData, server: e.target.value })}
            className={`w-full p-2 rounded-md border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Strategy
          </label>
          <input
            type="text"
            value={formData.strategy}
            onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
            className={`w-full p-2 rounded-md border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Date Started
          </label>
          <input
            type="date"
            value={formData.dateStarted}
            onChange={(e) => setFormData({ ...formData, dateStarted: e.target.value })}
            className={`w-full p-2 rounded-md border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Strategy File (.cs)
          </label>
          <input
            type="file"
            ref={fileInputRef}
            accept=".cs"
            onChange={handleFileChange}
            className={`w-full p-2 rounded-md border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600`}
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors duration-200 border border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
      >
        <PlusCircle size={20} />
        Add Account
      </button>
    </form>
  );
}