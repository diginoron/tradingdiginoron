import React, { useState } from 'react';
import { ComtradeRecord } from '../types';
import { 
  transformTimeSeriesData, 
  transformPartnerData, 
  transformCommodityData 
} from '../services/comtradeService';
import { formatUSD } from '../lib/utils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  LineChart as LineChartIcon, 
  BarChart3, 
  PieChart as PieIcon, 
  Box, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Layers 
} from 'lucide-react';

interface TradeChartsProps {
  records: ComtradeRecord[];
  language: 'fa' | 'en';
}

const COLORS = ['#2563eb', '#0d9488', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#f97316'];

export const TradeCharts: React.FC<TradeChartsProps> = ({ records, language }) => {
  const isFa = language === 'fa';
  const [activeTab, setActiveTab] = useState<'trends' | 'partners' | 'commodities' | 'distribution'>('trends');

  const timeSeriesData = transformTimeSeriesData(records, language);
  const partnerData = transformPartnerData(records, language, 8);
  const commodityData = transformCommodityData(records, language, 8);

  // Custom tooltip for currency values
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs border border-slate-800 space-y-1.5 font-sans">
          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-mono font-bold text-white">
                {formatUSD(entry.value, language)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!records || records.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header & View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full inline-block"></span>
            <span>{isFa ? 'تحلیل‌های بصری و توزیع آماری تجارت' : 'Visual Trade Analytics & Charts'}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isFa 
              ? 'ترسیم داده‌های واقعی بر اساس آمار تفکیکی گمرکی' 
              : 'Interactive visualizations calculated from official UN Comtrade records'}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            id="tab-trends"
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'trends'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>{isFa ? 'روند زمانی' : 'Time Trends'}</span>
          </button>

          <button
            id="tab-partners"
            onClick={() => setActiveTab('partners')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'partners'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{isFa ? 'شرکای تجاری' : 'Top Partners'}</span>
          </button>

          <button
            id="tab-commodities"
            onClick={() => setActiveTab('commodities')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'commodities'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>{isFa ? 'کالاها و اقلام' : 'Commodities'}</span>
          </button>

          <button
            id="tab-distribution"
            onClick={() => setActiveTab('distribution')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'distribution'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>{isFa ? 'سهم بازار' : 'Market Share'}</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div>
        {/* 1. Time Trends Chart */}
        {activeTab === 'trends' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{isFa ? 'مقایسه روند صادرات (X) و واردات (M) در طول دوره‌های انتخابی' : 'Export & Import Trajectories across Periods'}</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                  {isFa ? 'صادرات (Exports)' : 'Exports'}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                  {isFa ? 'واردات (Imports)' : 'Imports'}
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExports" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorImports" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickFormatter={(val) => formatUSD(val, language)} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="exports" 
                    name={isFa ? 'صادرات' : 'Exports'} 
                    stroke="#2563eb" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorExports)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="imports" 
                    name={isFa ? 'واردات' : 'Imports'} 
                    stroke="#64748b" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorImports)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 2. Top Partners Chart */}
        {activeTab === 'partners' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500">
              {isFa ? 'بزرگترین شرکای تجاری بر حسب ارزش کل مبادلات (میلیارد/میلیون دلار)' : 'Top Trading Partner Countries ranked by total value in USD'}
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partnerData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="partner" stroke="#94a3b8" fontSize={11} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickFormatter={(val) => formatUSD(val, language)} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="exports" name={isFa ? 'صادرات (Exports)' : 'Exports'} fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="imports" name={isFa ? 'واردات (Imports)' : 'Imports'} fill="#64748b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. Commodities Breakdown */}
        {activeTab === 'commodities' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500">
              {isFa ? 'تفکیک ارزش اقلام و گروه‌های کالایی (HS Codes)' : 'Commodity Code distribution and export/import values'}
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commodityData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickFormatter={(val) => formatUSD(val, language)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="commodity" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name={isFa ? 'ارزش کل' : 'Trade Value'} fill="#2563eb" radius={[0, 4, 4, 0]}>
                    {commodityData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 4. Partner Shares Distribution */}
        {activeTab === 'distribution' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500">
              {isFa ? 'سهم درصدی شرکای عمده از کل حجم مبادلات' : 'Percentage market share of top trading partners'}
            </div>

            <div className="h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={partnerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="total"
                    nameKey="partner"
                  >
                    {partnerData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
