import React, { useState } from 'react';
import { fetchComtradeData } from '../../services/comtradeService';
import { POPULAR_REPORTERS, POPULAR_PARTNERS, EBOPS_SERVICES, AVAILABLE_YEARS, ALL_UN_COUNTRIES } from '../../data/referenceData';
import { formatUSD } from '../../lib/utils';
import { Briefcase, RefreshCw, AlertCircle, Database, Layers, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface ServicesTradeViewProps {
  language: 'fa' | 'en';
}

export const ServicesTradeView: React.FC<ServicesTradeViewProps> = ({ language }) => {
  const isFa = language === 'fa';
  const [selectedReporter, setSelectedReporter] = useState('842'); // USA
  const [selectedPartner, setSelectedPartner] = useState('0'); // World
  const [selectedPeriod, setSelectedPeriod] = useState('2023');
  const [selectedService, setSelectedService] = useState('TOTAL');
  const [hasExecuted, setHasExecuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);

  const loadData = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);
    try {
      const response = await fetchComtradeData({
        typeCode: 'S', // Services
        freqCode: 'A',
        clCode: 'HS', // Or EB
        reporterCode: selectedReporter,
        partnerCode: selectedPartner,
        period: selectedPeriod,
        cmdCode: selectedService,
        flowCode: 'M,X'
      });
      if (response && response.data) {
        setRecords(response.data);
      } else {
        setRecords([]);
      }
    } catch (err: any) {
      setError(err.message || (isFa ? 'خطا در دریافت داده‌های تجارت خدمات از API سازمان ملل' : 'Failed to fetch Services trade data'));
    } finally {
      setLoading(false);
    }
  };

  let totalExports = 0;
  let totalImports = 0;

  for (const r of records) {
    const val = Number(r.primaryValue) || 0;
    const flow = (r.flowCode || '').toUpperCase();
    if (flow === 'X') totalExports += val;
    else if (flow === 'M') totalImports += val;
  }

  const repObj = ALL_UN_COUNTRIES.find(c => String(c.id) === selectedReporter);
  const repName = repObj ? (isFa ? repObj.nameFa : repObj.nameEn) : selectedReporter;

  const tradeBalance = totalExports - totalImports;

  // Chart data
  const chartData = [
    { name: isFa ? 'صادرات خدمات (Exports)' : 'Services Exports', value: totalExports, fill: '#10b981' },
    { name: isFa ? 'واردات خدمات (Imports)' : 'Services Imports', value: totalImports, fill: '#3b82f6' }
  ];

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'تجارت بین‌المللی خدمات (Trade in Services - EBOPS)' : 'International Trade in Services'}
            </h1>
            <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
              /data/v1/get/S/A/EB
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa 
              ? 'بررسی داده‌های بخش غیرکالایی شامل خدمات فناوری اطلاعات، حمل‌ونقل و ترانزیت، مالی، گردشگری، مهندسی و مالکیت معنوی.'
              : 'Official UN Comtrade SITS services database covering ICT, transport logistics, financial services, tourism, IP licensing, and consulting.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Reporter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'گزارش‌دهنده' : 'Reporter'}</label>
            <select
              id="services-reporter-select"
              value={selectedReporter}
              onChange={(e) => setSelectedReporter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {POPULAR_REPORTERS.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.flag} {isFa ? c.nameFa : c.nameEn}</option>
              ))}
            </select>
          </div>

          {/* Service Sector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'بخش خدمات (EBOPS)' : 'Services Sector'}</label>
            <select
              id="services-sector-select"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {EBOPS_SERVICES.map((s) => (
                <option key={s.code} value={s.code}>{isFa ? s.nameFa : s.nameEn}</option>
              ))}
            </select>
          </div>

          {/* Period */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'سال' : 'Year'}</label>
            <select
              id="services-period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {AVAILABLE_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="self-end">
            <button
              id="services-refresh-btn"
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isFa ? 'استعلام' : 'Query'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{isFa ? 'پیام سرور:' : 'Server message:'}</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Initial Ready State */}
      {!hasExecuted && !loading && totalExports === 0 && totalImports === 0 && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده استعلام آمار تجارت بین‌المللی خدمات (EBOPS)' : 'Ready for Services Trade Analysis (EBOPS)'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'کشور گزارش‌دهنده، بخش خدمات و سال آماری را در کادر بالا انتخاب کرده و روی دکمه «استعلام» کلیک کنید.'
              : 'Select reporting country, service sector, and year above, then click "Query" to view services balance.'}
          </p>
        </div>
      )}

      {/* Empty State Banner when No Services Data Recorded */}
      {hasExecuted && !loading && totalExports === 0 && totalImports === 0 && !error && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-950 p-6 rounded-xl flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              {isFa ? 'اطلاعاتی در پایگاه داده برای فیلتر انتخابی وجود ندارد' : 'No Commercial Services Trade Data Found'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {isFa 
                ? `برای کشور «${repName}» در سال «${selectedPeriod}» سوابق تجارت خدمات تجاری (EBOPS) در پایگاه داده UN Comtrade ثبت نشده است. لطفاً سال‌های قبل‌تر یا کشور دیگری را انتخاب فرمایید.`
                : `No services trade returns (EBOPS) reported for ${repName} in year ${selectedPeriod}.`}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Services Exports */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>{isFa ? 'صادرات خدمات (Exports)' : 'Services Exports'}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {formatUSD(totalExports, language)}
          </div>
        </div>

        {/* Total Services Imports */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            <span>{isFa ? 'واردات خدمات (Imports)' : 'Services Imports'}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {formatUSD(totalImports, language)}
          </div>
        </div>

        {/* Trade Balance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {isFa ? 'تراز خالص تجارت خدمات' : 'Net Services Balance'}
          </div>
          <div className={`text-2xl font-bold font-mono mt-1 ${tradeBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatUSD(tradeBalance, language)}
          </div>
        </div>
      </div>

      {/* Charts & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-500" />
              <span>{isFa ? 'مقایسه صادرات و واردات خدمات' : 'Services Export vs Import Comparison'}</span>
            </h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1e9).toFixed(1)}B`} />
                <RechartsTooltip formatter={(val: any) => [formatUSD(val, language), isFa ? 'ارزش' : 'Value']} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-500" />
              <span>{isFa ? 'جدول رکوردهای رسمی خدمات EBOPS' : 'EBOPS Services Records'}</span>
            </h3>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {records.length} {isFa ? 'رکورد' : 'records'}
            </span>
          </div>

          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="p-2.5 text-start">{isFa ? 'جریان' : 'Flow'}</th>
                  <th className="p-2.5 text-start">{isFa ? 'کد خدمات' : 'Service Code'}</th>
                  <th className="p-2.5 text-end">{isFa ? 'ارزش ثبتی (دلار)' : 'Recorded Value (USD)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length > 0 ? (
                  records.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-medium">
                        {r.flowDesc || (r.flowCode === 'X' ? (isFa ? 'صادرات' : 'Exports') : (isFa ? 'واردات' : 'Imports'))}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600">{r.cmdDesc || r.cmdCode || selectedService}</td>
                      <td className="p-2.5 font-mono text-end font-bold text-slate-900">{r.primaryValue ? formatUSD(r.primaryValue, language) : 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-400">
                      {loading ? (isFa ? 'در حال دریافت داده‌های خدمات...' : 'Loading Services Data...') : (isFa ? 'رکوردی ثبت نشده است.' : 'No records returned.')}
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
