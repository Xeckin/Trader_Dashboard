import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { TradingAccount } from '../types';

interface EditAccountModalProps {
  account: TradingAccount;
  darkMode: boolean;
  onClose: () => void;
  onSave: (data: Partial<TradingAccount>) => void;
}

export function EditAccountModal({ account, darkMode, onClose, onSave }: EditAccountModalProps) {
  const [formData, setFormData] = useState({
    accountName: account.accountName,
    propFirm: account.propFirm,
    platform: account.platform,
    login: account.login,
    server: account.server,
    strategy: account.strategy,
    status: account.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClasses = `w-full p-2 rounded-md border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 text-white' 
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const labelClasses = `block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-gray-800'}`}>
            Edit Account
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-700/50 transition-colors ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClasses}>Account Name</label>
            <input
              type="text"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label className={labelClasses}>Prop Firm</label>
            <input
              type="text"
              value={formData.propFirm}
              onChange={(e) => setFormData({ ...formData, propFirm: e.target.value })}
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label className={labelClasses}>Platform</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value as TradingAccount['platform'] })}
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
            <label className={labelClasses}>Login</label>
            <input
              type="text"
              value={formData.login}
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label className={labelClasses}>Server</label>
            <input
              type="text"
              value={formData.server}
              onChange={(e) => setFormData({ ...formData, server: e.target.value })}
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label className={labelClasses}>Strategy</label>
            <input
              type="text"
              value={formData.strategy}
              onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label className={labelClasses}>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TradingAccount['status'] })}
              className={inputClasses}
              required
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2 px-4 rounded-md ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}