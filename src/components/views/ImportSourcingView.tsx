import React, { useState } from 'react';
import { ALL_UN_COUNTRIES } from '../../data/allCountries';
import { ALL_HS_CHAPTERS } from '../../data/hsChapters';
import { AVAILABLE_YEARS } from '../../data/referenceData';
import { fetchComtradeData } from '../../services/comtradeService';
import { formatUSD, formatWeightKg } from '../../lib/utils';
import { 
  ShoppingBag, 
  TrendingDown, 
  Globe2, 
  RefreshCw, 
  AlertCircle, 
  Award, 
  DollarSign, 
  Truck, 
  Layers, 
  Compass,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';

interface ImportSourcingViewProps {
  language: 'fa' | 'en';
}

const BAR_COLORS = ['#0284c7', '#0369a1', '#075985', '#0d9488', '#0f766e', '#6366f1', '#4f46e5', '#8b5cf6', '#a855f7', '#d946ef'];

export const ImportSourcingView: React.FC<ImportSourcingViewProps> = ({ language }) => {
  const isFa = language === 'fa';

  const [importerCountry, setImporterCountry] = useState<string>('364'); // Iran
  const [selectedHsCode, setSelectedHsCode] = useState<string>('84'); // Machinery (84) or 10 (Cereals)
  const [customHsInput, setCustomHsInput] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2023');
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [importSources, setImportSources] = useState<any[]>([]);

  const loadImportSources = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);
    const cmdCode = customHsInput.trim() ? customHsInput.trim() : selectedHsCode;

    try {
      // Query import flow (M) for importer country from all partner countries
      const response = await fetchComtradeData({
        reporterCode: importerCountry,
        partnerCode: undefined, // all partners
        period: selectedPeriod,
        cmdCode: cmdCode,
        flowCode: 'M',
        typeCode: 'C',
        freqCode: 'A',
        clCode: 'HS',
        includeDesc: true
      });

      if (response && response.data) {
        // Exclude total code 0 to rank individual supplying countries
        const individualPartners = response.data.filter((r: any) => Number(r.partnerCode) !== 0 && Number(r.primaryValue) > 0);
        // Sort descending by import value
        individualPartners.sort((a: any, b: any) => Number(b.primaryValue || 0) - Number(a.primaryValue || 0));
        setImportSources(individualPartners);
      } else {
        setImportSources([]);
      }
    } catch (err: any) {
      setError(err.message || (isFa ? 'خطا در واکشی مبادی تأمین وارداتی' : 'Failed to fetch import sources'));
    } finally {
      setLoading(false);
    }
  };

  const importerObj = ALL_UN_COUNTRIES.find(c => String(c.id) === importerCountry);
  const importerName = importerObj ? (isFa ? importerObj.nameFa : importerObj.nameEn) : `Country ${importerCountry}`;

  const totalImportSum = importSources.reduce((acc, cur) => acc + Number(cur.primaryValue || 0), 0);

  // Top 10 for bar chart
  const chartData = importSources.slice(0, 10).map((r: any) => {
    const partnerObj = ALL_UN_COUNTRIES.find(c => Number(c.id) === Number(r.partnerCode));
    const pName = partnerObj ? (isFa ? partnerObj.nameFa : partnerObj.nameEn) : (r.partnerDesc || `Country ${r.partnerCode}`);
    const val = Number(r.primaryValue || 0);
    const share = totalImportSum > 0 ? (val / totalImportSum) * 100 : 0;

    return {
      name: pName,
      code: r.partnerCode,
      value: val,
      share: share.toFixed(1)
    };
  });

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'مبادی‌یابی و سورسینگ هوشمند واردات (Import Sourcing & Supplier Hub)' : 'Global Import Sourcing & Supplier Finder'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa 
              ? 'شناسایی و رتبه‌بندی بزرگترین کشورهای تأمین‌کننده کالاهای وارداتی، مقایسه قیمت واحد هر کیلوگرم ($/kg) و شیوه‌های تأمین کالا.'
              : 'Identify top global suppliers, compare CIF import valuations and $/kg rates to optimize international procurement.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Importer */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'کشور واردکننده' : 'Importer'}</label>
            <select
              id="import-reporter-select"
              value={importerCountry}
              onChange={(e) => setImporterCountry(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {ALL_UN_COUNTRIES.filter(c => c.id !== 0).map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.flag} {isFa ? c.nameFa : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* HS Commodity */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'کالای وارداتی' : 'Commodity'}</label>
            <select
              id="import-hs-select"
              value={selectedHsCode}
              onChange={(e) => {
                setSelectedHsCode(e.target.value);
                setCustomHsInput('');
              }}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="TOTAL">{isFa ? 'TOTAL - تمام اقلام وارداتی' : 'TOTAL - All Import Products'}</option>
              {ALL_HS_CHAPTERS.map((ch) => (
                <option key={ch.code} value={ch.code}>
                  فصل {ch.code}: {isFa ? ch.nameFa : ch.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'سال' : 'Year'}</label>
            <select
              id="import-year-select"
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
              id="import-refresh-btn"
              onClick={loadImportSources}
              disabled={loading}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isFa ? 'سورسینگ تأمین' : 'Find Suppliers'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{isFa ? 'پیام وب‌سرویس سازمان ملل:' : 'UN Comtrade Message:'}</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Initial Ready State */}
      {!hasExecuted && !loading && importSources.length === 0 && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده سورسینگ و شناسایی مبادی تأمین وارداتی' : 'Ready to Discover Import Sourcing Origins'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'کشور خریدار، کالای وارداتی و سال را در نوار بالا تعیین کرده و روی دکمه «سورسینگ تأمین» کلیک کنید.'
              : 'Configure importing country, commodity, and period above, then click "Find Suppliers" to map supply chains.'}
          </p>
        </div>
      )}

      {/* Non-reporting helper if 0 suppliers found */}
      {hasExecuted && !loading && importSources.length === 0 && !error && (
        <div className="bg-amber-50/90 border border-amber-200 p-5 rounded-xl text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-900 text-sm">
                {isFa 
                  ? `اطلاعاتی در پایگاه داده برای فیلتر انتخابی (${importerName} - سال ${selectedPeriod}) وجود ندارد` 
                  : `No Import Sourcing Records for ${importerName} in ${selectedPeriod}`}
              </div>
              <p className="text-amber-800 leading-relaxed max-w-2xl">
                {isFa
                  ? `برای کشور واردکننده انتخابی، رکوردی از مبادی تأمین کالا در پایگاه داده UN Comtrade ثبت نشده است. لطفاً سال‌های قبل‌تر (مانند ۲۰۲۱ یا ۲۰۲۲) یا کشور دیگری را انتخاب فرمایید.`
                  : `Direct import returns are not available for ${selectedPeriod}. Consider viewing earlier years (e.g. 2021) or selecting another country.`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('2021')}
              className="bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0"
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
      )}

      {/* Top 3 Suppliers Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {importSources.slice(0, 3).map((target: any, idx: number) => {
          const pObj = ALL_UN_COUNTRIES.find(c => Number(c.id) === Number(target.partnerCode));
          const pName = pObj ? (isFa ? pObj.nameFa : pObj.nameEn) : (target.partnerDesc || `Country ${target.partnerCode}`);
          const pFlag = pObj?.flag || '🌐';
          const val = Number(target.primaryValue || 0);
          const w = Number(target.netWgt || 0);
          const unitRate = w > 0 ? val / w : null;
          const share = totalImportSum > 0 ? (val / totalImportSum) * 100 : 0;

          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{pFlag}</span>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      {isFa ? `تأمین‌کننده رتبه ${idx + 1}` : `Rank #${idx + 1} Supplier`}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{pName}</h4>
                  </div>
                </div>
                <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-2">
                {formatUSD(val, language)}
              </div>
              <div className="text-xs text-slate-500 mt-2 flex justify-between border-t border-slate-100 pt-2">
                <span>{isFa ? 'سهم از کل واردات:' : 'Share of Imports:'}</span>
                <span className="font-bold text-teal-600 font-mono">{share.toFixed(1)}%</span>
              </div>
              {unitRate !== null && (
                <div className="text-xs text-slate-500 mt-1 flex justify-between">
                  <span>{isFa ? 'نرخ واحد CIF:' : 'CIF Unit Price:'}</span>
                  <span className="font-bold text-amber-600 font-mono">${unitRate.toFixed(2)}/kg</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Top 10 Suppliers Bar Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-teal-500" />
            <span>{isFa ? `۱۰ مبدأ اصلی تأمین کالا برای ${importerName}` : `Top 10 Import Suppliers for ${importerName}`}</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">CIF Value (USD)</span>
        </div>

        <div className="h-72">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1e9).toFixed(1)}B`} />
                <RechartsTooltip formatter={(val: any) => [formatUSD(val, language), isFa ? 'ارزش واردات' : 'Import Value']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              {loading ? (isFa ? 'در حال تحلیل مبادی تأمین...' : 'Analyzing supplier origins...') : (isFa ? 'رکوردی بازگردانده نشد.' : 'No suppliers found.')}
            </div>
          )}
        </div>
      </div>

      {/* Full Suppliers Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-500" />
            <span>{isFa ? 'جدول کامل تمام کشورهای مبدأ و فروشنده' : 'All Sourcing Countries Ranking Table'}</span>
          </h3>
          <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {importSources.length} {isFa ? 'مبدأ تأمین' : 'suppliers'}
          </span>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-2.5 text-start">{isFa ? 'رتبه' : 'Rank'}</th>
                <th className="p-2.5 text-start">{isFa ? 'کشور فروشنده / مبدأ' : 'Supplier Country'}</th>
                <th className="p-2.5 text-start">{isFa ? 'کد ISO' : 'ISO3'}</th>
                <th className="p-2.5 text-end">{isFa ? 'ارزش واردات (USD)' : 'Import Value (USD)'}</th>
                <th className="p-2.5 text-end">{isFa ? 'سهم از بازار' : 'Market Share'}</th>
                <th className="p-2.5 text-end">{isFa ? 'قیمت بر کیلو ($/kg)' : 'Rate ($/kg)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {importSources.length > 0 ? (
                importSources.map((t: any, idx: number) => {
                  const pObj = ALL_UN_COUNTRIES.find(c => Number(c.id) === Number(t.partnerCode));
                  const pName = pObj ? (isFa ? pObj.nameFa : pObj.nameEn) : (t.partnerDesc || `Country ${t.partnerCode}`);
                  const pFlag = pObj?.flag || '🌐';
                  const val = Number(t.primaryValue || 0);
                  const w = Number(t.netWgt || 0);
                  const unitRate = w > 0 ? val / w : null;
                  const share = totalImportSum > 0 ? (val / totalImportSum) * 100 : 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-bold text-slate-400 font-mono">#{idx + 1}</td>
                      <td className="p-2.5 font-semibold text-slate-900 flex items-center gap-2">
                        <span>{pFlag}</span>
                        <span>{pName}</span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-500">{pObj?.iso || t.partnerISO || '-'}</td>
                      <td className="p-2.5 font-mono font-bold text-end text-teal-700">{formatUSD(val, language)}</td>
                      <td className="p-2.5 font-mono text-end font-semibold text-blue-600">{share.toFixed(1)}%</td>
                      <td className="p-2.5 font-mono text-end font-bold text-amber-600">
                        {unitRate !== null ? `$${unitRate.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {loading ? (isFa ? 'در حال واکشی...' : 'Loading...') : (isFa ? 'رکوردی ثبت نشده است.' : 'No suppliers found.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
