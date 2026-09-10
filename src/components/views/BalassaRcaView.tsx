import React, { useState } from 'react';
import { fetchComtradeData } from '../../services/comtradeService';
import { ALL_UN_COUNTRIES, ALL_HS_CHAPTERS, AVAILABLE_YEARS } from '../../data/referenceData';
import { formatUSD } from '../../lib/utils';
import { Award, Zap, AlertCircle, RefreshCw, TrendingUp, HelpCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BalassaRcaViewProps {
  language: 'fa' | 'en';
}

export const BalassaRcaView: React.FC<BalassaRcaViewProps> = ({ language }) => {
  const isFa = language === 'fa';

  const [reporterCountry, setReporterCountry] = useState<string>('364'); // Iran
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2021');
  const [selectedHsCode, setSelectedHsCode] = useState<string>('08'); // Edible fruit & nuts (e.g. Pistachios)
  const [customHsInput, setCustomHsInput] = useState<string>('');

  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rcaResult, setRcaResult] = useState<{
    rcaScore: number;
    countryExportCommodity: number;
    countryTotalExports: number;
    worldExportCommodity: number;
    worldTotalExports: number;
    hasAdvantage: boolean;
    strength: 'very_high' | 'high' | 'moderate' | 'weak' | 'none';
  } | null>(null);

  const [topAdvantageList, setTopAdvantageList] = useState<any[]>([]);

  const calculateRCA = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);
    const cmd = customHsInput.trim() ? customHsInput.trim() : selectedHsCode;

    try {
      // 1. Fetch Country Export of Commodity
      const countryCmdRes = await fetchComtradeData({
        reporterCode: reporterCountry,
        partnerCode: '0', // World
        period: selectedPeriod,
        cmdCode: cmd,
        flowCode: 'X',
        typeCode: 'C',
        freqCode: 'A',
        clCode: 'HS'
      });

      // 2. Fetch Country Total Exports
      const countryTotalRes = await fetchComtradeData({
        reporterCode: reporterCountry,
        partnerCode: '0',
        period: selectedPeriod,
        cmdCode: 'TOTAL',
        flowCode: 'X',
        typeCode: 'C',
        freqCode: 'A',
        clCode: 'HS'
      });

      // 3. Fetch World Export of Commodity
      const worldCmdRes = await fetchComtradeData({
        reporterCode: '0', // World
        partnerCode: '0',
        period: selectedPeriod,
        cmdCode: cmd,
        flowCode: 'X',
        typeCode: 'C',
        freqCode: 'A',
        clCode: 'HS'
      });

      // 4. Fetch World Total Exports
      const worldTotalRes = await fetchComtradeData({
        reporterCode: '0',
        partnerCode: '0',
        period: selectedPeriod,
        cmdCode: 'TOTAL',
        flowCode: 'X',
        typeCode: 'C',
        freqCode: 'A',
        clCode: 'HS'
      });

      const cCmdVal = countryCmdRes?.data?.[0]?.primaryValue || 0;
      const cTotVal = countryTotalRes?.data?.[0]?.primaryValue || 0;
      const wCmdVal = worldCmdRes?.data?.[0]?.primaryValue || 0;
      const wTotVal = worldTotalRes?.data?.[0]?.primaryValue || 0;

      // Check if country has reported trade for this year
      if (cTotVal === 0 && (!countryCmdRes?.data || countryCmdRes.data.length === 0)) {
        setRcaResult(null);
        return;
      }

      if (cTotVal === 0) {
        setRcaResult(null);
        return;
      }

      const countryShareInBasket = cCmdVal / cTotVal;
      const worldShareInBasket = wTotVal > 0 ? (wCmdVal / wTotVal) : 0.01;

      let rca = 0;
      if (worldShareInBasket > 0 && countryShareInBasket > 0) {
        rca = countryShareInBasket / worldShareInBasket;
      }

      let strength: 'very_high' | 'high' | 'moderate' | 'weak' | 'none' = 'none';
      if (rca >= 4) strength = 'very_high';
      else if (rca >= 2) strength = 'high';
      else if (rca >= 1) strength = 'moderate';
      else if (rca >= 0.5) strength = 'weak';

      setRcaResult({
        rcaScore: Number(rca.toFixed(2)),
        countryExportCommodity: cCmdVal,
        countryTotalExports: cTotVal,
        worldExportCommodity: wCmdVal,
        worldTotalExports: wTotVal,
        hasAdvantage: rca > 1,
        strength
      });

    } catch (err: any) {
      setError(err.message || 'Error calculating Balassa RCA index');
    } finally {
      setLoading(false);
    }
  };

  const countryObj = ALL_UN_COUNTRIES.find(c => String(c.id) === reporterCountry);
  const countryName = countryObj ? (isFa ? countryObj.nameFa : countryObj.nameEn) : `Country ${reporterCountry}`;

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'شاخص مزیت نسبی آشکارشده بالاسا (Balassa RCA Calculator)' : 'Balassa Revealed Comparative Advantage Index'}
            </h1>
            <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              RCA &gt; 1.0 = Competitive Edge
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa
              ? 'سنجش علمی قدرت رقابت‌پذیری صادرات یک کالا در مقایسه با متوسط جهانی بر اساس فرمول استاندارد پروفسور بلا بالاسا (Balassa 1965).'
              : 'Empirical measurement of a country export competitiveness relative to global trade baseline.'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Country Selector */}
          <select
            value={reporterCountry}
            onChange={(e) => setReporterCountry(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {ALL_UN_COUNTRIES.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.flag} {isFa ? c.nameFa : c.nameEn}
              </option>
            ))}
          </select>

          {/* HS Commodity */}
          <select
            value={selectedHsCode}
            onChange={(e) => {
              setSelectedHsCode(e.target.value);
              setCustomHsInput('');
            }}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium max-w-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {ALL_HS_CHAPTERS.map((ch) => (
              <option key={ch.code} value={ch.code}>
                فصل {ch.code}: {isFa ? ch.nameFa : ch.nameEn}
              </option>
            ))}
          </select>

          {/* Year */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {AVAILABLE_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={() => calculateRCA()}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isFa ? 'محاسبه شاخص RCA' : 'Calculate'}</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{isFa ? 'خطا در محاسبه شاخص:' : 'Calculation Error:'}</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Initial Ready State */}
      {!hasExecuted && !loading && !rcaResult && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده محاسبه شاخص مزیت نسبی بالاسا (RCA)' : 'Ready to Calculate Balassa RCA Index'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'کشور صادرکننده، سال آماری و کد فصل کالایی را در کادر بالا انتخاب کرده و روی دکمه «محاسبه شاخص RCA» کلیک کنید.'
              : 'Select exporting country, period, and HS chapter above, then click "Calculate" to measure comparative advantage.'}
          </p>
        </div>
      )}

      {/* Empty State Banner when No Data is Available in UN database */}
      {hasExecuted && !loading && !rcaResult && !error && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-950 p-6 rounded-xl flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              {isFa ? 'اطلاعاتی در پایگاه داده سازمان ملل برای فیلتر انتخابی وجود ندارد' : 'No Trade Records Found in UN Comtrade'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {isFa 
                ? `برای کشور «${countryName}» در سال «${selectedPeriod}» هنوز داده یا اظهارنامه گمرکی رسمی در سرورهای UN Comtrade ثبت نشده است. لطفاً جستجوی خود را تغییر دهید یا سال‌های قبل‌تر (مانند ۲۰۲۱ یا ۲۰۲۲) یا کشور دیگری را انتخاب نمایید.`
                : `No customs trade returns recorded for ${countryName} in year ${selectedPeriod}. Please adjust your filters, select an earlier year (e.g. 2021, 2022), or choose a different country.`}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedPeriod('2021')}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors"
              >
                {isFa ? '🔄 تغییر سال به 2021' : '🔄 Switch Year to 2021'}
              </button>
              <button
                onClick={() => setSelectedPeriod('2022')}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors"
              >
                {isFa ? '🔄 تغییر سال به 2022' : '🔄 Switch Year to 2022'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main RCA Score Card */}
      {rcaResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Metric Banner */}
          <div className={`p-6 rounded-xl border shadow-sm col-span-1 flex flex-col justify-between ${
            rcaResult.hasAdvantage 
              ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950' 
              : 'bg-gradient-to-br from-slate-50 to-rose-50 border-slate-200 text-slate-900'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isFa ? `شاخص RCA کشور ${countryName}` : `Balassa RCA Index`}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                  rcaResult.hasAdvantage ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {rcaResult.hasAdvantage ? (isFa ? 'دارای مزیت رقابتی' : 'Competitive Edge') : (isFa ? 'فاقد مزیت رقابتی' : 'No Comparative Edge')}
                </span>
              </div>

              <div className="text-5xl font-black font-mono my-3 tracking-tight">
                {rcaResult.rcaScore}
              </div>

              <p className="text-xs leading-relaxed opacity-90">
                {rcaResult.rcaScore >= 4 
                  ? (isFa ? '🔥 مزیت نسبی بسیار قدرتمند و موقعیت انحصاری در بازار جهانی.' : 'Exceptional comparative advantage and dominant global footprint.')
                  : rcaResult.rcaScore >= 2
                  ? (isFa ? '✅ مزیت نسبی بالا و توان رقابت قدرتمند با تولیدکنندگان بین‌المللی.' : 'High comparative advantage with strong global market power.')
                  : rcaResult.rcaScore >= 1
                  ? (isFa ? '⚖️ مزیت نسبی متوسط در مرز رقابت‌پذیری.' : 'Moderate comparative advantage above global average.')
                  : (isFa ? '⚠️ سهم صادرات این کالا کمتر از میانگین جهانی است و کشور در آن مزیت صادراتی ندارد.' : 'Below global average export intensity.')}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200/60 text-[11px] font-mono text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>{isFa ? 'فرمول بالاسا:' : 'Formula:'}</span>
                <span>(X_cp / X_c) / (X_wp / X_w)</span>
              </div>
            </div>
          </div>

          {/* Mathematical Decomposition */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>{isFa ? 'تفکیک اجزای فرمول بالاسا در پایگاه داده سازمان ملل' : 'Formula Components & Export Values'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="text-xs text-slate-500 font-medium">{isFa ? `صادرات این کالا توسط ${countryName}:` : `Country Export of Commodity:`}</div>
                <div className="text-lg font-black font-mono text-slate-900">{formatUSD(rcaResult.countryExportCommodity, language)}</div>
                <div className="text-[11px] text-slate-400">
                  {((rcaResult.countryExportCommodity / (rcaResult.countryTotalExports || 1)) * 100).toFixed(2)}% {isFa ? 'از کل سبد صادراتی کشور' : 'of country basket'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="text-xs text-slate-500 font-medium">{isFa ? `کل صادرات تمام کالاهای ${countryName}:` : `Country Total Exports (All Commodities):`}</div>
                <div className="text-lg font-black font-mono text-slate-900">{formatUSD(rcaResult.countryTotalExports, language)}</div>
                <div className="text-[11px] text-slate-400">{isFa ? 'مجموع کل ارزش اظهارشده گمرکی' : 'Aggregated trade total'}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="text-xs text-slate-500 font-medium">{isFa ? 'کل صادرات جهانی این کالا:' : 'World Total Export of this Commodity:'}</div>
                <div className="text-lg font-black font-mono text-slate-900">{formatUSD(rcaResult.worldExportCommodity, language)}</div>
                <div className="text-[11px] text-slate-400">{isFa ? 'مجموع صادرات تمام کشورهای جهان' : 'Global exports aggregated'}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="text-xs text-slate-500 font-medium">{isFa ? 'کل تجارت و صادرات جهان:' : 'World Total Exports (All World):'}</div>
                <div className="text-lg font-black font-mono text-slate-900">{formatUSD(rcaResult.worldTotalExports, language)}</div>
                <div className="text-[11px] text-slate-400">{isFa ? 'معیار پایه اقتصاد بین‌الملل' : 'World trade denominator'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
