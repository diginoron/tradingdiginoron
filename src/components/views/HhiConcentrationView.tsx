import React, { useState } from 'react';
import { fetchComtradeData } from '../../services/comtradeService';
import { ALL_UN_COUNTRIES, ALL_HS_CHAPTERS, AVAILABLE_YEARS } from '../../data/referenceData';
import { formatUSD } from '../../lib/utils';
import { ShieldCheck, AlertTriangle, RefreshCw, BarChart2, CheckCircle2, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HhiConcentrationViewProps {
  language: 'fa' | 'en';
}

export const HhiConcentrationView: React.FC<HhiConcentrationViewProps> = ({ language }) => {
  const isFa = language === 'fa';

  const [reporterCountry, setReporterCountry] = useState<string>('364'); // Iran
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2021');
  const [selectedHsCode, setSelectedHsCode] = useState<string>('08'); // Fruit & Nuts
  const [flowDirection, setFlowDirection] = useState<'X' | 'M'>('X');

  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hhiScore, setHhiScore] = useState<number | null>(null);
  const [partnersShares, setPartnersShares] = useState<any[]>([]);

  const computeHhi = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);

    try {
      const response = await fetchComtradeData({
        reporterCode: reporterCountry,
        partnerCode: undefined, // all partners
        period: selectedPeriod,
        cmdCode: selectedHsCode,
        flowCode: flowDirection,
        typeCode: 'C',
        freqCode: 'A',
        clCode: 'HS'
      });

      const records = response?.data || [];
      // Filter out partner 0 (World)
      const validPartners = records.filter((r: any) => Number(r.partnerCode) !== 0 && Number(r.primaryValue) > 0);

      const totalVal = validPartners.reduce((acc: number, r: any) => acc + Number(r.primaryValue || 0), 0);

      if (totalVal === 0) {
        setHhiScore(null);
        setPartnersShares([]);
        return;
      }

      // Compute shares & HHI: Sum of (market share %)^2
      let sumSquares = 0;
      const shares = validPartners.map((r: any) => {
        const pObj = ALL_UN_COUNTRIES.find(c => Number(c.id) === Number(r.partnerCode));
        const val = Number(r.primaryValue || 0);
        const sharePct = (val / totalVal) * 100;
        sumSquares += (sharePct * sharePct);

        return {
          partnerCode: r.partnerCode,
          name: pObj ? (isFa ? pObj.nameFa : pObj.nameEn) : (r.partnerDesc || `Country ${r.partnerCode}`),
          flag: pObj?.flag || '🌐',
          value: val,
          sharePct: Number(sharePct.toFixed(1))
        };
      }).sort((a: any, b: any) => b.value - a.value);

      setHhiScore(Math.round(sumSquares));
      setPartnersShares(shares.slice(0, 10));

    } catch (err: any) {
      setError(err.message || 'Error computing HHI index');
    } finally {
      setLoading(false);
    }
  };

  const repObj = ALL_UN_COUNTRIES.find(c => String(c.id) === reporterCountry);
  const repName = repObj ? (isFa ? repObj.nameFa : repObj.nameEn) : `Country ${reporterCountry}`;

  const getRiskLevel = (score: number) => {
    if (score < 1500) return { label: isFa ? 'تنوع بالا / کم‌ریسک' : 'Highly Diversified', color: 'emerald', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    if (score <= 2500) return { label: isFa ? 'تمرکز متوسط / ریسک میانه' : 'Moderate Concentration', color: 'amber', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    return { label: isFa ? 'تمرکز بالا / ریسک وابستگی شدید' : 'Highly Concentrated', color: 'rose', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
  };

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'شاخص تمرکز بازار و تنوع مشتریان هرفیندال (HHI Concentration Index)' : 'Herfindahl-Hirschman (HHI) Trade Index'}
            </h1>
            <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              HHI: 0 - 10,000 Points
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa
              ? 'سنجش علمی میزان وابستگی سبد تجاری به چند خریدار محدود و ارزیابی ریسک‌های ژئوپلیتیک و آسیب‌پذیری ناشی از تحریم یا شوک‌های تقاضا.'
              : 'Empirical assessment of trade market concentration and partner risk diversification.'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={reporterCountry}
            onChange={(e) => setReporterCountry(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            {ALL_UN_COUNTRIES.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.flag} {isFa ? c.nameFa : c.nameEn}
              </option>
            ))}
          </select>

          <select
            value={selectedHsCode}
            onChange={(e) => setSelectedHsCode(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium max-w-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            {ALL_HS_CHAPTERS.map((ch) => (
              <option key={ch.code} value={ch.code}>
                فصل {ch.code}: {isFa ? ch.nameFa : ch.nameEn}
              </option>
            ))}
          </select>

          <select
            value={flowDirection}
            onChange={(e) => setFlowDirection(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="X">{isFa ? 'تمرکز خریداران صادراتی' : 'Exports (Destinations)'}</option>
            <option value="M">{isFa ? 'تمرکز تأمین‌کنندگان وارداتی' : 'Imports (Origins)'}</option>
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            {AVAILABLE_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={computeHhi}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isFa ? 'محاسبه HHI' : 'Compute'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{isFa ? 'خطا:' : 'Error:'}</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Initial Ready State */}
      {!hasExecuted && !loading && hhiScore === null && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده محاسبه شاخص تمرکز و تنوع مشتریان (HHI)' : 'Ready to Calculate HHI Market Concentration Index'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'کشور، فصل گمرکی، جهت جریان و سال را در کادر بالا مشخص کرده و روی دکمه «محاسبه HHI» کلیک کنید.'
              : 'Select country, HS chapter, flow direction, and year above, then click "Compute" to measure market risk.'}
          </p>
        </div>
      )}

      {/* Empty State Banner when No Data in UN database */}
      {hasExecuted && !loading && hhiScore === null && !error && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-950 p-6 rounded-xl flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              {isFa ? 'اطلاعاتی در پایگاه داده برای فیلتر انتخابی وجود ندارد' : 'No Trade Records Found in UN Comtrade'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {isFa 
                ? `برای کشور «${repName}» در سال «${selectedPeriod}» داده‌ای جهت محاسبه شاخص تمرکز هرفیندال در سازمان ملل ثبت نشده است. لطفاً سال‌های قبل‌تر (مانند ۲۰۲۱ یا ۲۰۲۲) یا کشور دیگری را انتخاب فرمایید.`
                : `No partner trade returns found for ${repName} in year ${selectedPeriod}. Please adjust your filters or switch to an earlier year.`}
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

      {hhiScore !== null && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main HHI Gauge Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                {isFa ? `نمره شاخص هرفیندال (HHI)` : 'Herfindahl Index'}
              </div>
              <div className="text-5xl font-black font-mono my-2 text-purple-700">
                {hhiScore.toLocaleString()}
              </div>

              <div className={`p-3 rounded-xl border text-xs font-bold mt-3 ${getRiskLevel(hhiScore).bg}`}>
                {getRiskLevel(hhiScore).label}
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {hhiScore > 2500 
                  ? (isFa ? '⚠️ بیش از ۵۰٪ بازار در انحصار ۱ یا ۲ کشور خاص است. ایجاد بازارهای صادراتی جایگزین توصیه می‌شود.' : 'High market concentration vulnerability.')
                  : hhiScore >= 1500
                  ? (isFa ? '⚖️ پراکندگی بازار در حد استاندارد است اما سهم کشورهای اول نیازمند پایش است.' : 'Moderate market diversity.')
                  : (isFa ? '✅ سبد خریداران به خوبی در جهان پخش شده و ریسک قطع رابطه با یک کشور بسیار پایین است.' : 'Well-diversified market footprint.')}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] font-mono text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>0 - 1500:</span>
                <span className="text-emerald-600 font-bold">{isFa ? 'متنوع و امن' : 'Diverse'}</span>
              </div>
              <div className="flex justify-between">
                <span>1500 - 2500:</span>
                <span className="text-amber-600 font-bold">{isFa ? 'تمرکز متوسط' : 'Moderate'}</span>
              </div>
              <div className="flex justify-between">
                <span>2500 - 10000:</span>
                <span className="text-rose-600 font-bold">{isFa ? 'انحصاری و پرریسک' : 'Concentrated'}</span>
              </div>
            </div>
          </div>

          {/* Top Partners Breakdown Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>{isFa ? 'سهم درصدی شرکای تجاری اصلی از کل بازار' : 'Market Share by Key Trade Partners'}</span>
              <span className="text-xs font-mono text-slate-400">{partnersShares.length} {isFa ? 'کشور اول' : 'top partners'}</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partnersShares} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" unit="%" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip formatter={(val: any) => [`${val}%`, isFa ? 'سهم از بازار' : 'Market Share']} />
                  <Bar dataKey="sharePct" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
