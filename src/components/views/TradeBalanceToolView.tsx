import React, { useState } from 'react';
import { fetchTradeBalanceTool } from '../../services/comtradeService';
import { POPULAR_REPORTERS, POPULAR_PARTNERS, POPULAR_COMMODITIES, AVAILABLE_YEARS, ALL_UN_COUNTRIES } from '../../data/referenceData';
import { formatUSD } from '../../lib/utils';
import { Scale, RefreshCw, AlertCircle, Database, Layers, ArrowUpRight, ArrowDownLeft, Sliders, Filter } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface TradeBalanceToolViewProps {
  language: 'fa' | 'en';
}

export const TradeBalanceToolView: React.FC<TradeBalanceToolViewProps> = ({ language }) => {
  const isFa = language === 'fa';
  const [selectedReporter, setSelectedReporter] = useState('842'); // USA
  const [selectedPartner, setSelectedPartner] = useState('0'); // World
  const [selectedPeriod, setSelectedPeriod] = useState('2023');
  const [selectedCmd, setSelectedCmd] = useState('TOTAL');
  const [breakdownMode, setBreakdownMode] = useState('classic');
  const [hasExecuted, setHasExecuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);

  const loadData = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);
    try {
      const response = await fetchTradeBalanceTool({
        reporterCode: selectedReporter,
        partnerCode: selectedPartner,
        period: selectedPeriod,
        cmdCode: selectedCmd,
        breakdownMode: breakdownMode || undefined,
        typeCode: 'C',
        freqCode: 'A',
        clCode: 'HS',
        includeDesc: true
      });
      if (response && response.data) {
        setRecords(response.data);
      } else {
        setRecords([]);
      }
    } catch (err: any) {
      setError(err.message || (isFa ? 'خطا در واکشی جدول تراز تجاری (Trade Balance Tool)' : 'Failed to fetch pivoted Trade Balance'));
    } finally {
      setLoading(false);
    }
  };

  const repObj = POPULAR_REPORTERS.find(r => String(r.id) === selectedReporter);
  const repName = repObj ? (isFa ? repObj.nameFa : repObj.nameEn) : `Country ${selectedReporter}`;

  const partObj = ALL_UN_COUNTRIES.find(c => String(c.id) === selectedPartner) || POPULAR_PARTNERS.find(p => String(p.id) === selectedPartner);
  const partName = partObj ? (isFa ? partObj.nameFa : partObj.nameEn) : (selectedPartner === '0' ? (isFa ? 'کل جهان' : 'World') : `Partner ${selectedPartner}`);

  // Summaries
  let totalExports = 0;
  let totalImports = 0;
  let totalReExports = 0;

  for (const r of records) {
    totalExports += Number(r.exportsValue || r.fobvalue || 0);
    totalImports += Number(r.importsValue || r.cifvalue || 0);
    totalReExports += Number(r.reExportsValue || 0);
  }

  const netBalance = totalExports - totalImports;

  // Chart data
  const chartData = [
    { name: isFa ? 'صادرات (Exports)' : 'Exports', value: totalExports, fill: '#10b981' },
    { name: isFa ? 'واردات (Imports)' : 'Imports', value: totalImports, fill: '#3b82f6' },
    { name: isFa ? 'صادرات مجدد (Re-Exports)' : 'Re-Exports', value: totalReExports, fill: '#8b5cf6' }
  ].filter(i => i.value > 0);

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Scale className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'ابزار تخصصی تراز تجاری محوری (Pivoted Trade Balance)' : 'UN Pivoted Trade Balance Tool'}
            </h1>
            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              /tools/v1/getTradeBalance
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa 
              ? 'استخراج ماتریس پیووت‌شده صادرات و واردات در یک جدول یکپارچه جهت محاسبه فوری مازاد یا کسری تراز بازرگانی با قابلیت تفکیک پیشرفته.'
              : 'Extract trade data in a structured pivoted flow (exports and imports side-by-side) to directly measure trade surpluses and deficits.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Reporter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'گزارش‌دهنده' : 'Reporter'}</label>
            <select
              id="tb-reporter-select"
              value={selectedReporter}
              onChange={(e) => setSelectedReporter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {POPULAR_REPORTERS.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.flag} {isFa ? c.nameFa : c.nameEn}</option>
              ))}
            </select>
          </div>

          {/* Partner */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'طرف تجاری' : 'Partner'}</label>
            <select
              id="tb-partner-select"
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {POPULAR_PARTNERS.map((p) => (
                <option key={p.id} value={String(p.id)}>{p.flag} {isFa ? p.nameFa : p.nameEn}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'سال' : 'Year'}</label>
            <select
              id="tb-period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {AVAILABLE_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="self-end">
            <button
              id="tb-refresh-btn"
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isFa ? 'محاسبه تراز' : 'Calculate'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{isFa ? 'پیام وب‌سرویس سازمان ملل:' : 'UN Comtrade Tool Message:'}</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Initial Ready State */}
      {!hasExecuted && !loading && totalExports === 0 && totalImports === 0 && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده تجمیع و محاسبه تراز تجاری دوجانبه' : 'Ready to Calculate Bilateral Trade Balance'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'کشور اصلی، طرف تجاری، سال و کد کالا را در کادر بالا انتخاب کرده و روی دکمه «استعلام تراز» کلیک کنید.'
              : 'Select reporter, partner, period, and commodity above, then click "Calculate" to pivot trade balance.'}
          </p>
        </div>
      )}

      {/* Empty State Banner when No Data Found */}
      {hasExecuted && !loading && totalExports === 0 && totalImports === 0 && !error && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-950 p-6 rounded-xl flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              {isFa ? 'اطلاعاتی در پایگاه داده برای فیلتر انتخابی وجود ندارد' : 'No Trade Balance Records Found in UN Comtrade'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {isFa 
                ? `برای کشور «${repName}» و طرف تجاری «${partName}» در سال «${selectedPeriod}» رکوردی برای محاسبه تراز بازرگانی در سازمان ملل ثبت نشده است. لطفاً سال‌های قبل‌تر (مانند ۲۰۲۱ یا ۲۰۲۲) یا کشور دیگری را انتخاب فرمایید.`
                : `No import or export returns found for ${repName} and ${partName} in year ${selectedPeriod}. Please switch to an earlier period or choose another partner.`}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedPeriod('2021')}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors"
              >
                {isFa ? '🔄 تغییر سال به 2021' : '🔄 Switch to 2021'}
              </button>
              <button
                onClick={() => setSelectedPeriod('2022')}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors"
              >
                {isFa ? '🔄 تغییر سال به 2022' : '🔄 Switch to 2022'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Exports */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>{isFa ? 'کل صادرات (Exports - X)' : 'Total Exports (X)'}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {formatUSD(totalExports, language)}
          </div>
        </div>

        {/* Imports */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            <span>{isFa ? 'کل واردات (Imports - M)' : 'Total Imports (M)'}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {formatUSD(totalImports, language)}
          </div>
        </div>

        {/* Net Trade Balance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {isFa ? 'تراز خالص بازرگانی (Net Balance)' : 'Net Trade Balance'}
          </div>
          <div className={`text-2xl font-bold font-mono mt-1 ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {netBalance >= 0 ? '+' : ''}{formatUSD(netBalance, language)}
          </div>
        </div>
      </div>

      {/* Charts & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>{isFa ? `توازن صادرات در برابر واردات ${repName}` : 'Export vs Import Balance'}</span>
            </h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1e9).toFixed(1)}B`} />
                <RechartsTooltip formatter={(val: any) => [formatUSD(val, language), '']} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pivoted Data Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>{isFa ? 'جدول پیووت‌شده تراز تجاری سازمان ملل' : 'Pivoted Trade Balance Table'}</span>
            </h3>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {records.length} {isFa ? 'رکورد' : 'records'}
            </span>
          </div>

          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="p-2.5 text-start">{isFa ? 'کد کالا' : 'HS Code'}</th>
                  <th className="p-2.5 text-end text-emerald-700">{isFa ? 'صادرات (Exports)' : 'Exports'}</th>
                  <th className="p-2.5 text-end text-blue-700">{isFa ? 'واردات (Imports)' : 'Imports'}</th>
                  <th className="p-2.5 text-end">{isFa ? 'تراز خالص (Balance)' : 'Balance'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length > 0 ? (
                  records.map((r: any, idx: number) => {
                    const exp = Number(r.exportsValue || r.fobvalue || 0);
                    const imp = Number(r.importsValue || r.cifvalue || 0);
                    const bal = exp - imp;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-2.5 font-mono font-medium text-slate-800">{r.cmdCode || selectedCmd}</td>
                        <td className="p-2.5 font-mono text-end text-emerald-700 font-semibold">{formatUSD(exp, language)}</td>
                        <td className="p-2.5 font-mono text-end text-blue-700 font-semibold">{formatUSD(imp, language)}</td>
                        <td className={`p-2.5 font-mono font-bold text-end ${bal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {bal >= 0 ? '+' : ''}{formatUSD(bal, language)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      {loading ? (isFa ? 'در حال دریافت ماتریس تراز...' : 'Calculating Trade Balance...') : (isFa ? 'رکوردی ثبت نشده است.' : 'No balance records returned.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
