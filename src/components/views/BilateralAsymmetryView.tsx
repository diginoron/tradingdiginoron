import React, { useState } from 'react';
import { fetchBilateralData } from '../../services/comtradeService';
import { POPULAR_REPORTERS, POPULAR_PARTNERS, POPULAR_COMMODITIES, AVAILABLE_YEARS } from '../../data/referenceData';
import { formatUSD } from '../../lib/utils';
import { Scale, ArrowRightLeft, RefreshCw, AlertCircle, TrendingUp, AlertTriangle, ShieldCheck, Database, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface BilateralAsymmetryViewProps {
  language: 'fa' | 'en';
}

export const BilateralAsymmetryView: React.FC<BilateralAsymmetryViewProps> = ({ language }) => {
  const isFa = language === 'fa';
  const [selectedReporter, setSelectedReporter] = useState('842'); // USA
  const [selectedPartner, setSelectedPartner] = useState('156'); // China
  const [selectedPeriod, setSelectedPeriod] = useState('2023');
  const [selectedCmd, setSelectedCmd] = useState('TOTAL');
  const [hasExecuted, setHasExecuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);

  const loadData = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBilateralData({
        reporterCode: selectedReporter,
        partnerCode: selectedPartner,
        period: selectedPeriod,
        cmdCode: selectedCmd,
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
      setError(err.message || (isFa ? 'خطا در واکشی داده‌های عدم تقارن دوجانبه (Bilateral Tools)' : 'Failed to fetch Bilateral Asymmetry data'));
    } finally {
      setLoading(false);
    }
  };

  const repObj = POPULAR_REPORTERS.find(r => String(r.id) === selectedReporter);
  const partObj = POPULAR_PARTNERS.find(p => String(p.id) === selectedPartner);

  const repName = repObj ? (isFa ? repObj.nameFa : repObj.nameEn) : `Country ${selectedReporter}`;
  const partName = partObj ? (isFa ? partObj.nameFa : partObj.nameEn) : `Partner ${selectedPartner}`;

  // Process Bilateral Data Records
  // Compare reported values vs mirror partner values
  const chartData = records.map((r: any, idx: number) => {
    const repVal = Number(r.primaryValue || r.reporterValue || 0);
    const mirVal = Number(r.mirrorPrimaryValue || r.mirrorValue || 0);
    const diff = Math.abs(repVal - mirVal);
    const flow = r.flowDesc || r.flowCode || (isFa ? 'جریان تجارت' : 'Trade Flow');

    return {
      flow,
      reporterVal: repVal,
      mirrorVal: mirVal,
      gap: diff,
      reporterName: repName,
      mirrorName: partName
    };
  });

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ArrowRightLeft className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'ابزار تحلیل عدم تقارن و داده‌های آینه‌ای (Bilateral Trade Asymmetries)' : 'UN Bilateral Trade Asymmetry & Mirror Data'}
            </h1>
            <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              /tools/v1/getBilateralData
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa 
              ? 'مقایسه آمار رسمی گزارش‌شده توسط کشور مبدأ در برابر آمار آینه‌ای (Mirror) ثبت‌شده توسط کشور مقصد جهت کشف شکاف‌های آماری، مغایرت‌های گمرکی و بیش/کم‌اظهاری.'
              : 'Extract bilateral trade data joined with mirror partner statistics to analyze bilateral trade discrepancies and reporting asymmetries.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Reporter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'کشور گزارش‌دهنده (Reporter)' : 'Reporter'}</label>
            <select
              id="bilateral-reporter-select"
              value={selectedReporter}
              onChange={(e) => setSelectedReporter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {POPULAR_REPORTERS.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.flag} {isFa ? c.nameFa : c.nameEn}</option>
              ))}
            </select>
          </div>

          {/* Partner */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'کشور شریک/آینه (Mirror Partner)' : 'Mirror Partner'}</label>
            <select
              id="bilateral-partner-select"
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {POPULAR_PARTNERS.filter(p => p.id !== 0).map((p) => (
                <option key={p.id} value={String(p.id)}>{p.flag} {isFa ? p.nameFa : p.nameEn}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'سال' : 'Year'}</label>
            <select
              id="bilateral-period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {AVAILABLE_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="self-end">
            <button
              id="bilateral-refresh-btn"
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isFa ? 'تحلیل تقارن' : 'Analyze'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Concept Explanation Card */}
      <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4 text-xs text-purple-950 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">
            {isFa ? 'مفهوم داده‌های آینه‌ای (Mirror Data) و عدم تقارن تجاری:' : 'Understanding Mirror Data & Trade Asymmetries:'}
          </span>
          <p className="text-slate-600 leading-relaxed">
            {isFa 
              ? 'در تجارت بین‌الملل، صادرات ثبت‌شده از کشور A به کشور B باید منطقاً با واردات ثبت‌شده توسط کشور B از کشور A همخوانی داشته باشد. تفاوت میان این دو رقم نشان‌دهنده شکاف عدم تقارن (Asymmetry Gap) ناشی از کرایه‌های حمل و بیمه (تفاوت CIF و FOB)، تأخیر زمانی در ترخیص گمرکی، قاچاق یا تخلفات کم‌اظهاری مالیاتی است.'
              : 'In theory, Country A\'s reported exports to Country B should equal Country B\'s reported imports from Country A (adjusted for CIF/FOB margins). Discrepancies reveal smuggling, misinvoicing, or transit lag.'}
          </p>
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
      {!hasExecuted && !loading && (!records || records.length === 0) && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده تحلیل عدم تقارن و داده‌های آینه‌ای دوجانبه' : 'Ready for Bilateral Mirror & Asymmetry Analysis'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'کشور گزارش‌دهنده، شریک تجاری، سال و کد کالا را در نوار بالا تعیین کرده و روی دکمه «تحلیل تقارن» کلیک کنید.'
              : 'Select reporter, partner, and commodity above, then click "Analyze" to inspect bilateral gaps.'}
          </p>
        </div>
      )}

      {/* Empty State Banner when No Bilateral Data in UN Comtrade */}
      {hasExecuted && !loading && (!records || records.length === 0) && !error && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-950 p-6 rounded-xl flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              {isFa ? 'اطلاعاتی در پایگاه داده برای فیلتر انتخابی وجود ندارد' : 'No Bilateral Asymmetry Records Found'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {isFa 
                ? `برای مبادلات مستقیم و آینه‌ای بین «${repName}» و «${partName}» در سال «${selectedPeriod}» رکوردی در پایگاه داده UN Comtrade ثبت نشده است. لطفاً جستجوی خود را تغییر دهید یا سال دیگری را انتخاب نمایید.`
                : `No reported or mirror trade data found between ${repName} and ${partName} in year ${selectedPeriod}. Please switch period or select another partner.`}
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

      {/* Comparison Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Scale className="w-4 h-4 text-purple-500" />
            <span>{isFa ? `مقایسه ارقام رسمی ${repName} در برابر ارقام آینه‌ای ${partName}` : `Reported vs. Mirror Trade Comparison`}</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Bilateral Asymmetry (USD)</span>
        </div>

        <div className="h-72">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="flow" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1e9).toFixed(1)}B`} />
                <RechartsTooltip formatter={(val: any) => [formatUSD(val, language), '']} />
                <Legend />
                <Bar 
                  dataKey="reporterVal" 
                  name={isFa ? `گزارش رسمی ${repName}` : `Reported by ${repName}`} 
                  fill="#7c3aed" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="mirrorVal" 
                  name={isFa ? `گزارش آینه‌ای ${partName}` : `Mirror from ${partName}`} 
                  fill="#38bdf8" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              {loading ? (isFa ? 'در حال دریافت داده‌های آینه‌ای دوجانبه...' : 'Fetching Bilateral Mirror Data...') : (isFa ? 'رکوردی بازگردانده نشد.' : 'No bilateral records found.')}
            </div>
          )}
        </div>
      </div>

      {/* Asymmetry Data Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-500" />
            <span>{isFa ? 'جدول کامل مقایسه گزارش رسمی، داده آینه‌ای و اختلاف آماری' : 'Bilateral Discrepancy Breakdown Table'}</span>
          </h3>
          <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {records.length} {isFa ? 'جریان ثبت‌شده' : 'flows'}
          </span>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-2.5 text-start">{isFa ? 'جریان تجاری' : 'Trade Flow'}</th>
                <th className="p-2.5 text-start">{isFa ? 'کد کالا' : 'Commodity'}</th>
                <th className="p-2.5 text-end">{isFa ? `ارزش اعلامی ${repName}` : 'Reported Value'}</th>
                <th className="p-2.5 text-end">{isFa ? `ارزش آینه‌ای ${partName}` : 'Mirror Value'}</th>
                <th className="p-2.5 text-end">{isFa ? 'شکاف آماری (Discrepancy)' : 'Asymmetry Gap'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length > 0 ? (
                records.map((r: any, idx: number) => {
                  const repVal = Number(r.primaryValue || r.reporterValue || 0);
                  const mirVal = Number(r.mirrorPrimaryValue || r.mirrorValue || 0);
                  const diff = repVal - mirVal;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-medium text-slate-800">{r.flowDesc || r.flowCode || 'N/A'}</td>
                      <td className="p-2.5 font-mono text-slate-600">{r.cmdCode || selectedCmd}</td>
                      <td className="p-2.5 font-mono font-bold text-end text-purple-700">{formatUSD(repVal, language)}</td>
                      <td className="p-2.5 font-mono font-bold text-end text-sky-700">{formatUSD(mirVal, language)}</td>
                      <td className="p-2.5 font-mono font-bold text-end">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          Math.abs(diff) === 0 
                            ? 'bg-slate-100 text-slate-600' 
                            : diff > 0 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-rose-50 text-rose-700'
                        }`}>
                          {diff > 0 ? '+' : ''}{formatUSD(diff, language)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    {loading ? (isFa ? 'در حال واکشی...' : 'Fetching...') : (isFa ? 'رکوردی ثبت نشده است.' : 'No bilateral data.')}
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
