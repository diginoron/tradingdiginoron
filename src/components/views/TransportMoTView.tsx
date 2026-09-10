import React, { useState } from 'react';
import { fetchTarifflineTransport } from '../../services/comtradeService';
import { POPULAR_REPORTERS, POPULAR_PARTNERS, POPULAR_COMMODITIES, MODES_OF_TRANSPORT, AVAILABLE_YEARS } from '../../data/referenceData';
import { formatUSD, formatKG } from '../../lib/utils';
import { Truck, Ship, Plane, Train, Package, RefreshCw, AlertCircle, Database, Layers, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface TransportMoTViewProps {
  language: 'fa' | 'en';
}

const MOT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b', '#f97316'];

export const TransportMoTView: React.FC<TransportMoTViewProps> = ({ language }) => {
  const isFa = language === 'fa';
  const [selectedReporter, setSelectedReporter] = useState('842'); // USA
  const [selectedPartner, setSelectedPartner] = useState('0'); // World
  const [selectedPeriod, setSelectedPeriod] = useState('2023');
  const [selectedCmd, setSelectedCmd] = useState('TOTAL');
  const [selectedMot, setSelectedMot] = useState('0');
  const [hasExecuted, setHasExecuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);

  const loadData = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);
    try {
      const response = await fetchTarifflineTransport({
        reporterCode: selectedReporter,
        partnerCode: selectedPartner,
        period: selectedPeriod,
        cmdCode: selectedCmd,
        motCode: selectedMot !== '0' ? selectedMot : undefined,
        typeCode: 'C',
        freqCode: 'A',
        clCode: 'HS'
      });
      if (response && response.data) {
        setRecords(response.data);
      } else {
        setRecords([]);
      }
    } catch (err: any) {
      setError(err.message || (isFa ? 'خطا در دریافت داده‌های شیوه حمل و نقل از API سازمان ملل' : 'Failed to fetch transport data'));
    } finally {
      setLoading(false);
    }
  };

  // Aggregate by Mode of Transport
  const motAggregation: Record<string, { name: string; value: number; weight: number; code: number }> = {};
  
  for (const r of records) {
    const code = Number(r.motCode ?? 0);
    const motDef = MODES_OF_TRANSPORT.find(m => m.code === code);
    const name = motDef ? (isFa ? motDef.nameFa : motDef.nameEn) : (isFa ? `شیوه کد ${code}` : `Mode ${code}`);
    
    if (!motAggregation[name]) {
      motAggregation[name] = { name, value: 0, weight: 0, code };
    }
    motAggregation[name].value += Number(r.primaryValue) || 0;
    motAggregation[name].weight += Number(r.netWgt) || 0;
  }

  const motChartData = Object.values(motAggregation).sort((a, b) => b.value - a.value);

  const repObj = POPULAR_REPORTERS.find(r => String(r.id) === selectedReporter);
  const repName = repObj ? (isFa ? repObj.nameFa : repObj.nameEn) : selectedReporter;

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Truck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'تفکیک شیوه حمل‌ونقل و مبدأ واقعی (MoT & Consignment)' : 'Mode of Transport & Logistics Explorer'}
            </h1>
            <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
              /public/v1/previewTariffline
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa 
              ? 'تحلیل دقیق شیوه انتقال فیزیکی کالاها (دریایی، هوایی، جاده‌ای، ریلی، خط لوله) و ردیابی کشورهای واسطه و ترانزیت (Partner 2).'
              : 'Analyze physical freight modes (Maritime, Air, Road, Rail, Pipeline) and trace indirect consignment hubs and origin nations.'}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Reporter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'گزارش‌دهنده' : 'Reporter'}</label>
            <select
              id="mot-reporter-select"
              value={selectedReporter}
              onChange={(e) => setSelectedReporter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              id="mot-partner-select"
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              id="mot-period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {AVAILABLE_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Mode of Transport Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'شیوه حمل' : 'Mode of Transport'}</label>
            <select
              id="mot-filter-select"
              value={selectedMot}
              onChange={(e) => setSelectedMot(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {MODES_OF_TRANSPORT.map((m) => (
                <option key={m.code} value={String(m.code)}>{m.icon} {isFa ? m.nameFa : m.nameEn}</option>
              ))}
            </select>
          </div>

          <div className="self-end">
            <button
              id="mot-refresh-btn"
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
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
            <div className="font-bold">{isFa ? 'پیام سرور گمرکی:' : 'Customs Server Note:'}</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Initial Ready State */}
      {!hasExecuted && !loading && records.length === 0 && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده تفکیک و استعلام شیوه‌های حمل‌ونقل گمرکی (MoT)' : 'Ready for Mode of Transport (MoT) Analysis'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'کشور گزارش‌دهنده، شیوه حمل (دریایی، هوایی، جاده‌ای) و سال را در کادر بالا انتخاب کرده و روی دکمه «استعلام» کلیک کنید.'
              : 'Select reporter, transport mode, and period above, then click "Query" to view logistics breakdown.'}
          </p>
        </div>
      )}

      {/* Empty State Banner when No MoT Data Recorded */}
      {hasExecuted && !loading && records.length === 0 && !error && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-950 p-6 rounded-xl flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              {isFa ? 'اطلاعاتی در پایگاه داده برای فیلتر انتخابی وجود ندارد' : 'No Mode of Transport Data Found'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {isFa 
                ? `برای کشور «${repName}» در سال «${selectedPeriod}» داده‌های تفکیک شیوه حمل‌ونقل گمرکی (MoT) ثبت نشده است. توجه فرمایید که تفکیک حمل‌ونقل توسط برخی کشورهای خاص (مانند آمریکا و اروپا) به سازمان ملل ارائه می‌شود.`
                : `No mode of transport (MoT) customs breakdown reported for ${repName} in year ${selectedPeriod}.`}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedReporter('842')}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors"
              >
                {isFa ? '🔄 تست با ایالات متحده (USA)' : '🔄 Test with USA'}
              </button>
              <button
                onClick={() => setSelectedPeriod('2021')}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors"
              >
                {isFa ? '🔄 تغییر سال به 2021' : '🔄 Switch to 2021'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode of Transport Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MODES_OF_TRANSPORT.slice(1, 5).map((m) => {
          const item = motChartData.find(d => d.code === m.code);
          const val = item ? item.value : 0;
          return (
            <div key={m.code} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{m.icon}</span>
                <span className="text-[10px] font-mono font-bold text-slate-400">MoT {m.code}</span>
              </div>
              <div className="mt-3">
                <div className="text-xs font-semibold text-slate-700">{isFa ? m.nameFa : m.nameEn}</div>
                <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                  {val > 0 ? formatUSD(val, language) : (isFa ? 'ثبت شده' : 'Active')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logistics Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Ship className="w-4 h-4 text-indigo-500" />
              <span>{isFa ? 'سهم شیوه‌های مختلف حمل‌ونقل از ارزش محموله‌ها' : 'Freight Value by Mode of Transport'}</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">USD Value</span>
          </div>

          <div className="h-64">
            {motChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={motChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} />
                  <RechartsTooltip formatter={(val: any) => [formatUSD(val, language), isFa ? 'ارزش حمل' : 'Value']} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                {loading ? (isFa ? 'در حال بارگذاری شیوه‌های حمل...' : 'Loading Transport Modes...') : (isFa ? 'داده‌ای یافت نشد.' : 'No transport records found.')}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Tariffline Records Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              <span>{isFa ? 'جدول رکوردهای تفصیلی گمرکی (Tariffline)' : 'Detailed Tariffline Records'}</span>
            </h3>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {records.length} {isFa ? 'محموله' : 'shipments'}
            </span>
          </div>

          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="p-2 text-start">{isFa ? 'شیوه حمل' : 'MoT'}</th>
                  <th className="p-2 text-start">{isFa ? 'شریک دوم (مبدأ/واسطه)' : '2nd Partner'}</th>
                  <th className="p-2 text-start">{isFa ? 'کد کالا' : 'HS Code'}</th>
                  <th className="p-2 text-end">{isFa ? 'ارزش (دلار)' : 'Value (USD)'}</th>
                  <th className="p-2 text-end">{isFa ? 'وزن خالص (کیلوگرم)' : 'Net Wgt (kg)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length > 0 ? (
                  records.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-2 font-medium text-indigo-600">
                        {r.motDesc || (r.motCode ? `MoT ${r.motCode}` : (isFa ? 'نامشخص' : 'General'))}
                      </td>
                      <td className="p-2 font-mono text-slate-600">
                        {r.partner2Desc || (r.partner2Code ? `Code ${r.partner2Code}` : (isFa ? 'مستقیم (Direct)' : 'Direct'))}
                      </td>
                      <td className="p-2 font-mono text-slate-800">{r.cmdCode || selectedCmd}</td>
                      <td className="p-2 font-mono text-end font-bold text-slate-900">{r.primaryValue ? formatUSD(r.primaryValue, language) : 'N/A'}</td>
                      <td className="p-2 font-mono text-end text-slate-600">{r.netWgt ? formatKG(r.netWgt) : '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      {loading ? (isFa ? 'در حال واکشی داده‌های گمرکی...' : 'Fetching Tariffline...') : (isFa ? 'رکوردی ثبت نشده است.' : 'No records returned.')}
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
