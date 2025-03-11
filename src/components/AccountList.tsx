import React, { useRef, useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, XCircle, Download, Upload, FileCode2, Edit2, GripHorizontal } from 'lucide-react';
import type { TradingAccount } from '../types';
import { parseNinjaTraderCSV } from '../utils/csvParser';
import { EditAccountModal } from './EditAccountModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Column {
  id: string;
  label: string;
  accessor: (account: TradingAccount) => React.ReactNode;
  width?: string;
}

interface SortableHeaderProps {
  column: Column;
  darkMode: boolean;
}

function SortableHeader({ column, darkMode }: SortableHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={`px-6 py-3 text-left text-xs font-medium ${
        darkMode ? 'text-gray-300' : 'text-gray-500'
      } uppercase tracking-wider cursor-move group relative ${column.width || ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2">
        <GripHorizontal size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        {column.label}
      </div>
    </th>
  );
}

interface AccountListProps {
  accounts: TradingAccount[];
  darkMode: boolean;
  viewMode: 'grid' | 'list';
  onUpdateMetrics: (accountId: string, metrics: Partial<TradingAccount['metrics']>, firstTradeDate?: string) => void;
  onUpdateAccount: (accountId: string, data: Partial<TradingAccount>) => void;
}

export function AccountList({ accounts, darkMode, viewMode, onUpdateMetrics, onUpdateAccount }: AccountListProps) {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const strategyInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [editingTarget, setEditingTarget] = useState<string | null>(null);
  const [editingProfit, setEditingProfit] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);

  const getStatusStyles = (status: TradingAccount['status']) => {
    switch (status) {
      case 'Passed':
        return 'shadow-[0_0_15px_rgba(34,197,94,0.2)] border-green-500/30';
      case 'Failed':
        return 'shadow-[0_0_15px_rgba(239,68,68,0.2)] border-red-500/30';
      default:
        return 'border-blue-500/20';
    }
  };

  const handleProfitClick = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (account) {
      setEditingProfit(accountId);
    }
  };

  const handleProfitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, accountId: string) => {
    if (e.key === 'Enter') {
      const profit = parseFloat(e.currentTarget.value);
      if (!isNaN(profit)) {
        onUpdateMetrics(accountId, { 
          totalProfit: profit,
          currentProgress: (profit / 3000) * 100 // Update progress based on new profit
        });
        setEditingProfit(null);
      } else {
        alert('Please enter a valid number');
      }
    } else if (e.key === 'Escape') {
      setEditingProfit(null);
    }
  };

  const handleProfitBlur = (e: React.FocusEvent<HTMLInputElement>, accountId: string) => {
    const profit = parseFloat(e.currentTarget.value);
    if (!isNaN(profit)) {
      onUpdateMetrics(accountId, { 
        totalProfit: profit,
        currentProgress: (profit / 3000) * 100 // Update progress based on new profit
      });
    }
    setEditingProfit(null);
  };

  const defaultColumns: Column[] = [
    {
      id: 'account',
      label: 'Account',
      accessor: (account) => (
        <div className="flex flex-col">
          <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            {account.accountName}
          </span>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {account.propFirm}
          </span>
        </div>
      ),
    },
    {
      id: 'platform',
      label: 'Platform',
      accessor: (account) => (
        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {account.platform}
        </span>
      ),
    },
    {
      id: 'strategy',
      label: 'Strategy',
      accessor: (account) => (
        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {account.strategy}
        </span>
      ),
    },
    {
      id: 'started',
      label: 'Started',
      accessor: (account) => (
        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {new Date(account.dateStarted).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'target',
      label: 'Target',
      accessor: (account) => (
        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          ${account.metrics.profitTarget.toFixed(2)}
        </span>
      ),
    },
    {
      id: 'profit',
      label: 'Profit',
      accessor: (account) => (
        <button
          onClick={() => handleProfitClick(account.id)}
          className="focus:outline-none"
        >
          {editingProfit === account.id ? (
            <input
              type="number"
              defaultValue={account.metrics.totalProfit}
              onKeyDown={(e) => handleProfitKeyDown(e, account.id)}
              onBlur={(e) => handleProfitBlur(e, account.id)}
              autoFocus
              className={`w-24 px-2 py-1 rounded ${
                darkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              } border`}
            />
          ) : (
            <span className={`font-medium ${
              account.metrics.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              ${account.metrics.totalProfit.toFixed(2)}
            </span>
          )}
        </button>
      ),
    },
    {
      id: 'progress',
      label: 'Progress',
      width: 'w-48',
      accessor: (account) => {
        const progress = Math.min(100, Math.max(0, (account.metrics.totalProfit / account.metrics.profitTarget) * 100));
        return (
          <div className="flex items-center gap-2">
            <div className="flex-grow w-24 bg-gray-700/50 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {progress.toFixed(1)}%
            </span>
          </div>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      accessor: (account) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(account.status)}
          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            {account.status}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      accessor: (account) => (
        <div className="flex justify-end items-center gap-2">
          <button
            onClick={() => setEditingAccount(account)}
            className={`p-2 rounded-full hover:bg-gray-700/50 transition-colors ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => fileInputRefs.current[account.id]?.click()}
            className={`p-2 rounded-full hover:bg-gray-700/50 transition-colors ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            <Upload size={18} />
          </button>
          <button
            onClick={() => handleDownloadCSV(account)}
            className={`p-2 rounded-full hover:bg-gray-700/50 transition-colors ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            <Download size={18} />
          </button>
        </div>
      ),
    },
  ];

  const [columns, setColumns] = useState(defaultColumns);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Passed':
        return <CheckCircle className="text-green-400" />;
      case 'Failed':
        return <XCircle className="text-red-400" />;
      default:
        return <TrendingUp className="text-blue-400" />;
    }
  };

  const handleDownloadCSV = (account: TradingAccount) => {
    try {
      const csvHeader = 'Date,Trade #,Net Profit,Gross Profit,Gross Loss,Commission,Max Drawdown,Win Rate';
      const csvData = `${account.dateStarted},1,${account.metrics.totalProfit},${Math.max(0, account.metrics.totalProfit)},${Math.min(0, account.metrics.totalProfit)},0,${account.metrics.drawdown},${account.metrics.winRate}`;
      
      const csvContent = `${csvHeader}\n${csvData}`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${account.accountName}_performance.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV file. Please try again.');
    }
  };

  const handleDownloadStrategy = (account: TradingAccount) => {
    if (!account.strategyFile) {
      alert('No strategy file available for this account');
      return;
    }

    try {
      const blob = new Blob([account.strategyFile.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = account.strategyFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading strategy file:', error);
      alert('Failed to download strategy file. Please try again.');
    }
  };

  const handleImportCSV = async (accountId: string, file: File) => {
    try {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Please select a valid CSV file');
      }

      const content = await file.text();
      if (!content.trim()) {
        throw new Error('The CSV file appears to be empty');
      }

      const { totalProfit, winRate, drawdown, tradingDays, firstTradeDate } = parseNinjaTraderCSV(content);
      
      onUpdateMetrics(
        accountId,
        {
          totalProfit,
          winRate,
          drawdown,
          tradingDays,
          currentProgress: (totalProfit / 3000) * 100 // Update progress based on imported profit
        },
        firstTradeDate
      );
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert(error instanceof Error ? error.message : 'Failed to parse CSV file');
      
      if (fileInputRefs.current[accountId]) {
        fileInputRefs.current[accountId]!.value = '';
      }
    }
  };

  const handleUploadStrategy = async (accountId: string, file: File) => {
    try {
      if (!file.name.endsWith('.cs')) {
        throw new Error('Please select a valid .cs file');
      }

      const content = await file.text();
      onUpdateAccount(accountId, {
        strategyFile: {
          name: file.name,
          content: content
        }
      });

      if (strategyInputRefs.current[accountId]) {
        strategyInputRefs.current[accountId]!.value = '';
      }
    } catch (error) {
      console.error('Error uploading strategy file:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload strategy file');
      
      if (strategyInputRefs.current[accountId]) {
        strategyInputRefs.current[accountId]!.value = '';
      }
    }
  };

  const handleTargetClick = (accountId: string) => {
    setEditingTarget(accountId);
  };

  const handleTargetKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, accountId: string) => {
    if (e.key === 'Enter') {
      const target = parseFloat(e.currentTarget.value);
      if (!isNaN(target) && target > 0) {
        const account = accounts.find(acc => acc.id === accountId);
        if (account) {
          onUpdateMetrics(accountId, { 
            profitTarget: target,
            currentProgress: (account.metrics.totalProfit / target) * 100 // Update progress based on new target
          });
        }
        setEditingTarget(null);
      } else {
        alert('Please enter a valid positive number');
      }
    } else if (e.key === 'Escape') {
      setEditingTarget(null);
    }
  };

  const renderAccountActions = (account: TradingAccount) => (
    <div className="space-y-2">
      <input
        type="file"
        accept=".csv"
        ref={el => fileInputRefs.current[account.id] = el}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImportCSV(account.id, file);
          }
        }}
      />
      <input
        type="file"
        accept=".cs"
        ref={el => strategyInputRefs.current[account.id] = el}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleUploadStrategy(account.id, file);
          }
        }}
      />
      <button
        onClick={() => fileInputRefs.current[account.id]?.click()}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md ${
          darkMode 
            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        } transition-colors`}
      >
        <Upload size={16} />
        Import Trades
      </button>
      <button
        onClick={() => handleDownloadCSV(account)}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md ${
          darkMode 
            ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300' 
            : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
        } transition-colors border border-gray-600/20`}
      >
        <Download size={16} />
        Download Performance
      </button>
      {account.strategyFile ? (
        <button
          onClick={() => handleDownloadStrategy(account)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md ${
            darkMode 
              ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300' 
              : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
          } transition-colors border border-gray-600/20`}
        >
          <FileCode2 size={16} />
          Download Strategy
        </button>
      ) : (
        <button
          onClick={() => strategyInputRefs.current[account.id]?.click()}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md ${
            darkMode 
              ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300' 
              : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
          } transition-colors border border-gray-600/20`}
        >
          <Upload size={16} />
          Upload Strategy
        </button>
      )}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {accounts.map((account) => {
        const progress = Math.min(100, Math.max(0, (account.metrics.totalProfit / account.metrics.profitTarget) * 100));
        return (
          <div
            key={account.id}
            className={`${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border ${getStatusStyles(account.status)} backdrop-blur-sm relative overflow-hidden group`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-gray-800'} truncate`}>
                    {account.accountName}
                  </h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>{account.propFirm}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditingAccount(account)}
                    className={`p-2 rounded-full hover:bg-gray-700/50 transition-colors ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    <Edit2 size={18} />
                  </button>
                  {getStatusIcon(account.status)}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Platform:</span>
                  <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {account.platform}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Strategy:</span>
                  <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} truncate ml-2`}>
                    {account.strategy}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Started:</span>
                  <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {new Date(account.dateStarted).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleTargetClick(account.id)}
                    className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors cursor-pointer`}
                  >
                    Target:
                  </button>
                  {editingTarget === account.id ? (
                    <input
                      type="number"
                      defaultValue={account.metrics.profitTarget}
                      onKeyDown={(e) => handleTargetKeyDown(e, account.id)}
                      onBlur={() => setEditingTarget(null)}
                      autoFocus
                      className={`w-24 px-2 py-1 rounded ${
                        darkMode 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-white text-gray-900 border-gray-300'
                      } border`}
                    />
                  ) : (
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      ${account.metrics.profitTarget.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => handleProfitClick(account.id)}
                    className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors cursor-pointer`}
                  >
                    Profit:
                  </button>
                  {editingProfit === account.id ? (
                    <input
                      type="number"
                      defaultValue={account.metrics.totalProfit}
                      onKeyDown={(e) => handleProfitKeyDown(e, account.id)}
                      onBlur={(e) => handleProfitBlur(e, account.id)}
                      autoFocus
                      className={`w-24 px-2 py-1 rounded ${
                        darkMode 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-white text-gray-900 border-gray-300'
                      } border`}
                    />
                  ) : (
                    <span className={`font-medium ${
                      account.metrics.totalProfit >= 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      ${account.metrics.totalProfit.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-600/20">
                <div className="flex justify-between items-center mb-2">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                  <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="mt-4">
                  {renderAccountActions(account)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border border-blue-500/20 overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b border-gray-600/20`}>
              <tr>
                <SortableContext
                  items={columns.map(col => col.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {columns.map((column) => (
                    <SortableHeader
                      key={column.id}
                      column={column}
                      darkMode={darkMode}
                    />
                  ))}
                </SortableContext>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600/20">
              {accounts.map((account) => (
                <tr key={account.id} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                  {columns.map((column) => (
                    <td key={column.id} className={`px-6 py-4 ${column.width || ''}`}>
                      {column.accessor(account)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DndContext>
  );

  return (
    <>
      <div className="transition-all duration-300">
        {viewMode === 'grid' ? renderGridView() : renderListView()}
      </div>

      {editingAccount && (
        <EditAccountModal
          account={editingAccount}
          darkMode={darkMode}
          onClose={() => setEditingAccount(null)}
          onSave={(data) => {
            onUpdateAccount(editingAccount.id, data);
            setEditingAccount(null);
          }}
        />
      )}
    </>
  );
}