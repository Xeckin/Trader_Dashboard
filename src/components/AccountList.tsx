import React, { useRef, useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, XCircle, Download, Upload, FileCode2, Edit2, GripHorizontal } from 'lucide-react';
import type { TradingAccount } from '../types';
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
import { EditAccountModal } from './EditAccountModal';

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
      className={`px-6 py-3 text-left text-xs font-medium text-cyber-blue uppercase tracking-wider cursor-move group relative ${column.width || ''}`}
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
        return 'shadow-[0_0_20px_rgba(57,255,20,0.3)] border-cyber-green/30';
      case 'Failed':
        return 'shadow-[0_0_20px_rgba(255,0,51,0.4)] border-red-500/40';
      default:
        return 'shadow-[0_0_20px_rgba(0,255,255,0.3)] border-cyber-blue/30';
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
          currentProgress: (profit / 3000) * 100
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
        currentProgress: (profit / 3000) * 100
      });
    }
    setEditingProfit(null);
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
            currentProgress: (account.metrics.totalProfit / target) * 100
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

  const handleTargetBlur = (e: React.FocusEvent<HTMLInputElement>, accountId: string) => {
    const target = parseFloat(e.currentTarget.value);
    if (!isNaN(target) && target > 0) {
      const account = accounts.find(acc => acc.id === accountId);
      if (account) {
        onUpdateMetrics(accountId, { 
          profitTarget: target,
          currentProgress: (account.metrics.totalProfit / target) * 100
        });
      }
    }
    setEditingTarget(null);
  };

  const defaultColumns: Column[] = [
    {
      id: 'account',
      label: 'Account',
      accessor: (account) => (
        <div className="flex flex-col">
          <span className="font-medium text-cyber-blue neon-text">
            {account.accountName}
          </span>
          <span className="text-sm text-cyber-blue/60">
            {account.propFirm}
          </span>
        </div>
      ),
    },
    {
      id: 'platform',
      label: 'Platform',
      accessor: (account) => (
        <span className="text-cyber-blue/80">
          {account.platform}
        </span>
      ),
    },
    {
      id: 'strategy',
      label: 'Strategy',
      accessor: (account) => (
        <span className="text-cyber-blue/80">
          {account.strategy}
        </span>
      ),
    },
    {
      id: 'started',
      label: 'Started',
      accessor: (account) => (
        <span className="text-cyber-blue/80">
          {new Date(account.dateStarted).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'target',
      label: 'Target',
      accessor: (account) => (
        <span className="text-cyber-blue/80">
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
              className="w-24 px-2 py-1 rounded bg-cyber-black/80 text-cyber-blue border border-cyber-blue/30 focus:border-cyber-blue/60 focus:ring-1 focus:ring-cyber-blue/30"
            />
          ) : (
            <span className={`font-medium ${
              account.metrics.totalProfit >= 0 ? 'text-cyber-green neon-text' : 'text-cyber-pink neon-text'
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
            <div className="flex-grow w-24 bg-cyber-black/50 rounded-full h-2 border border-cyber-blue/20">
              <div
                className="bg-cyber-blue h-2 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-sm text-cyber-blue">
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
          {account.status === 'Passed' && <CheckCircle className="text-cyber-green neon-text" />}
          {account.status === 'Failed' && <XCircle className="text-cyber-pink neon-text" />}
          {account.status === 'In Progress' && <TrendingUp className="text-cyber-blue neon-text" />}
          <span className={`
            ${account.status === 'Passed' ? 'text-cyber-green' : ''}
            ${account.status === 'Failed' ? 'text-cyber-pink' : ''}
            ${account.status === 'In Progress' ? 'text-cyber-blue' : ''}
          `}>
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
            className="p-2 rounded-full hover:bg-cyber-blue/10 transition-colors text-cyber-blue"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => fileInputRefs.current[account.id]?.click()}
            className="p-2 rounded-full hover:bg-cyber-blue/10 transition-colors text-cyber-blue"
          >
            <Upload size={18} />
          </button>
          <button
            onClick={() => handleDownloadCSV(account)}
            className="p-2 rounded-full hover:bg-cyber-blue/10 transition-colors text-cyber-blue"
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

  const handleDownloadCSV = (account: TradingAccount) => {
    if (!account.csvFile) {
      alert('No Rithmic data available for this account');
      return;
    }

    try {
      const blob = new Blob([account.csvFile.content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = account.csvFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download Rithmic data. Please try again.');
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

  const handleImportCSV = async (accountId: string, file: File) => {
    try {
      const content = await file.text();
      onUpdateAccount(accountId, {
        csvFile: {
          name: file.name,
          content
        }
      });
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert('Failed to import Rithmic data. Please try again.');
      if (fileInputRefs.current[accountId]) {
        fileInputRefs.current[accountId]!.value = '';
      }
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {accounts.map((account) => {
        const progress = Math.min(100, Math.max(0, (account.metrics.totalProfit / account.metrics.profitTarget) * 100));
        return (
          <div
            key={account.id}
            className={`relative bg-cyber-black/90 p-6 rounded-lg border ${getStatusStyles(account.status)} backdrop-blur-sm overflow-hidden group`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/5 to-cyber-pink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-xl font-bold text-cyber-blue neon-text truncate">
                    {account.accountName}
                  </h3>
                  <p className="text-cyber-blue/60 truncate">{account.propFirm}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditingAccount(account)}
                    className="p-2 rounded-full hover:bg-cyber-blue/10 transition-colors text-cyber-blue"
                  >
                    <Edit2 size={18} />
                  </button>
                  {account.status === 'Passed' && <CheckCircle className="text-cyber-green neon-text" />}
                  {account.status === 'Failed' && <XCircle className="text-cyber-pink neon-text" />}
                  {account.status === 'In Progress' && <TrendingUp className="text-cyber-blue neon-text" />}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-cyber-blue/60">Platform:</span>
                  <span className="font-medium text-cyber-blue">
                    {account.platform}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyber-blue/60">Strategy:</span>
                  <span className="font-medium text-cyber-blue truncate ml-2">
                    {account.strategy}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyber-blue/60">Started:</span>
                  <span className="font-medium text-cyber-blue">
                    {new Date(account.dateStarted).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleTargetClick(account.id)}
                    className="text-cyber-blue/60 hover:text-cyber-blue transition-colors"
                  >
                    Target:
                  </button>
                  {editingTarget === account.id ? (
                    <input
                      type="number"
                      defaultValue={account.metrics.profitTarget}
                      onKeyDown={(e) => handleTargetKeyDown(e, account.id)}
                      onBlur={(e) => handleTargetBlur(e, account.id)}
                      autoFocus
                      className="w-24 px-2 py-1 rounded bg-cyber-black/80 text-cyber-blue border border-cyber-blue/30 focus:border-cyber-blue/60 focus:ring-1 focus:ring-cyber-blue/30"
                    />
                  ) : (
                    <button
                      onClick={() => handleTargetClick(account.id)}
                      className="font-medium text-cyber-blue hover:text-cyber-blue/80 transition-colors"
                    >
                      ${account.metrics.profitTarget.toFixed(2)}
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleProfitClick(account.id)}
                    className="text-cyber-blue/60 hover:text-cyber-blue transition-colors"
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
                      className="w-24 px-2 py-1 rounded bg-cyber-black/80 text-cyber-blue border border-cyber-blue/30 focus:border-cyber-blue/60 focus:ring-1 focus:ring-cyber-blue/30"
                    />
                  ) : (
                    <button
                      onClick={() => handleProfitClick(account.id)}
                      className={`font-medium ${
                        account.metrics.totalProfit >= 0 ? 'text-cyber-green neon-text' : 'text-cyber-pink neon-text'
                      } hover:opacity-80 transition-opacity`}
                    >
                      ${account.metrics.totalProfit.toFixed(2)}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-cyber-blue/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-cyber-blue/60">Progress</span>
                  <span className="font-medium text-cyber-blue">
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-cyber-black/50 rounded-full h-2 border border-cyber-blue/20">
                  <div
                    className="bg-cyber-blue h-2 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <input
                    type="file"
                    ref={el => fileInputRefs.current[account.id] = el}
                    accept=".csv"
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
                    ref={el => strategyInputRefs.current[account.id] = el}
                    accept=".cs"
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
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-cyber-black/80 text-cyber-blue hover:bg-cyber-blue/10 transition-colors border border-cyber-blue/30 cyber-button group"
                  >
                    <Upload size={16} />
                    Import Rithmic Data
                  </button>
                  {account.csvFile && (
                    <button
                      onClick={() => handleDownloadCSV(account)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-cyber-black/80 text-cyber-blue hover:bg-cyber-blue/10 transition-colors border border-cyber-blue/30 cyber-button group"
                    >
                      <Download size={16} />
                      Download Rithmic Data
                    </button>
                  )}
                  {account.strategyFile ? (
                    <button
                      onClick={() => handleDownloadStrategy(account)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-cyber-black/80 text-cyber-blue hover:bg-cyber-blue/10 transition-colors border border-cyber-blue/30 cyber-button group"
                    >
                      <FileCode2 size={16} />
                      Download Strategy
                    </button>
                  ) : (
                    <button
                      onClick={() => strategyInputRefs.current[account.id]?.click()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-cyber-black/80 text-cyber-blue hover:bg-cyber-blue/10 transition-colors border border-cyber-blue/30 cyber-button group"
                    >
                      <Upload size={16} />
                      Upload Strategy
                    </button>
                  )}
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
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/5 to-cyber-pink/5 rounded-lg" />
        <div className="relative bg-cyber-black/90 rounded-lg border border-cyber-blue/20 cyberpunk-shadow backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cyber-black/80 border-b border-cyber-blue/20">
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
              <tbody className="divide-y divide-cyber-blue/20">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-cyber-blue/5 transition-colors">
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