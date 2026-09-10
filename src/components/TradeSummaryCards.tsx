import React from 'react';
import { TradeSummaryStats } from '../types';
import { formatUSD } from '../lib/utils';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Scale, 
  TrendingUp,
  TrendingDown,
  Layers,
  Database
} from 'lucide-react';

interface TradeSummaryCardsProps {
  stats: TradeSummaryStats;
  language: 'fa' | 'en';
  queryTimeMs?: number;
  statusCode?: number;
}

export const TradeSummaryCards: React.FC<TradeSummaryCardsProps> = ({
  stats,
  language,
  queryTimeMs,
  statusCode,
}) => {
  const isFa = language === 'fa';
  const isSurplus = stats.tradeBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" dir={isFa ? 'rtl' : 'ltr'}>
      {/* 1. Total Trade Turnover */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {isFa ? 'ارزش کل مبادلات (Total Trade)' : 'Total Trade Value'}
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {formatUSD(stats.totalTradeValue, language)}
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{isFa ? 'تعداد رکوردهای استخراج شده' : 'Record Count'}</span>
          <span className="font-mono font-bold text-blue-600">{stats.recordCount.toLocaleString()}</span>
        </div>
      </div>

      {/* 2. Total Exports (Outflows) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            <span>{isFa ? 'ارزش کل صادرات (Exports)' : 'Total Exports'}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {formatUSD(stats.totalExports, language)}
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-medium">
          <span>{isFa ? 'سهم از کل گردش تجاری' : 'Share of Trade'}</span>
          <span className="font-mono font-bold">
            {stats.totalTradeValue > 0 ? `${((stats.totalExports / stats.totalTradeValue) * 100).toFixed(1)}%` : '0%'}
          </span>
        </div>
      </div>

      {/* 3. Total Imports (Inflows) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
            <span>{isFa ? 'ارزش کل واردات (Imports)' : 'Total Imports'}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {formatUSD(stats.totalImports, language)}
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>{isFa ? 'سهم از کل گردش تجاری' : 'Share of Trade'}</span>
          <span className="font-mono font-bold">
            {stats.totalTradeValue > 0 ? `${((stats.totalImports / stats.totalTradeValue) * 100).toFixed(1)}%` : '0%'}
          </span>
        </div>
      </div>

      {/* 4. Trade Balance (Net Surplus / Deficit) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {isFa ? 'تراز تجاری خالص (Trade Balance)' : 'Net Trade Balance'}
          </div>
          <div className={`text-2xl font-bold tracking-tight font-mono ${
            isSurplus ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {formatUSD(stats.tradeBalance, language)}
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className={`font-semibold ${isSurplus ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isSurplus 
              ? (isFa ? 'مازاد تجاری (+ Surplus)' : 'Trade Surplus')
              : (isFa ? 'کسری تجاری (- Deficit)' : 'Trade Deficit')}
          </span>
          {queryTimeMs !== undefined && (
            <span className="text-[11px] font-mono text-slate-400">
              {queryTimeMs}ms
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

