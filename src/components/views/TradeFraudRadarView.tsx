import React, { useState } from 'react';
import { fetchComtradeData, fetchBilateralData } from '../../services/comtradeService';
import { ALL_UN_COUNTRIES, ALL_HS_CHAPTERS, AVAILABLE_YEARS } from '../../data/referenceData';
import { formatUSD } from '../../lib/utils';
import { ShieldAlert, AlertTriangle, ArrowRightLeft, CheckCircle2, DollarSign, Filter, RefreshCw } from 'lucide-react';

interface TradeFraudRadarViewProps {
  language: 'fa' | 'en';
}

export const TradeFraudRadarView: React.FC<TradeFraudRadarViewProps> = ({ language }) => {
  const isFa = language === 'fa';

  const [reporterCountry, setReporterCountry] = useState<string>('842'); // USA
  const [partnerCountry, setPartnerCountry] = useState<string>('156'); // China
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2023');
  const [selectedHsCode, setSelectedHsCode] = useState<string>('84'); // Machinery
  const [customHsInput, setCustomHsInput] = useState<string>('');

  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    reporterExportFob: number;
    partnerImportCif: number;
    discrepancyUSD: number;
    discrepancyPct: number;
    cifFobAdjustedGap: number;
    riskLevel: 'critical' | 'high' | 'moderate' | 'normal';
    anomalyType: 'under_invoicing' | 'over_invoicing' | 'capital_flight' | 'aligned';
  } | null>(null);

  const executeFraudAudit = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);
    const cmd = customHsInput.trim() ? customHsInput.trim() : selectedHsCode;

    try {
      // 1. Fetch Reporter Exports to Partner (FOB)
      const exportRes = await fetchComtradeData({
        reporterCode: reporterCountry,
        partnerCode: partnerCountry,
        period: selectedPeriod,
        cmdCode: cmd,
        flowCode: 'X',
        typeCode: 'C',
        freqCode: 'A',
        clCode: 'HS'
      });

      // 2. Fetch Partner Imports from Reporter (CIF)
      const importRes = await fetchComtradeData({
        reporterCode: partnerCountry,
        partnerCode: reporterCountry,
        period: selectedPeriod,
        cmdCode: cmd,
        flowCode: 'M',
        typeCode: 'C',
        freqCode: 'A',
        clCode: 'HS'
      });

      const expVal = exportRes?.data?.[0]?.primaryValue || 0;
      const impVal = importRes?.data?.[0]?.primaryValue || 0;

      if (expVal === 0 && impVal === 0) {
        setAnalysis(null);
        return;
      }

      // In trade economics, Import CIF is normally ~1.10x Export FOB due to freight & insurance (CIF-FOB margin)
      const expectedCif = expVal * 1.10;
      const gapUSD = impVal - expVal;
      const discrepancyPct = expVal > 0 ? ((impVal - expectedCif) / expVal) * 100 : 0;
      const absPct = Math.abs(discrepancyPct);

      let riskLevel: 'critical' | 'high' | 'moderate' | 'normal' = 'normal';
      let anomalyType: 'under_invoicing' | 'over_invoicing' | 'capital_flight' | 'aligned' = 'aligned';

      if (absPct > 50) {
        riskLevel = 'critical';
        anomalyType = impVal > expectedCif ? 'over_invoicing' : 'under_invoicing';
      } else if (absPct > 25) {
        riskLevel = 'high';
        anomalyType = impVal > expectedCif ? 'over_invoicing' : 'under_invoicing';
      } else if (absPct > 15) {
        riskLevel = 'moderate';
        anomalyType = 'under_invoicing';
      }

      setAnalysis({
        reporterExportFob: expVal,
        partnerImportCif: impVal,
        discrepancyUSD: gapUSD,
        discrepancyPct: Number(discrepancyPct.toFixed(1)),
        cifFobAdjustedGap: impVal - expectedCif,
        riskLevel,
        anomalyType
      });

    } catch (err: any) {
      setError(err.message || 'Error running Customs Valuation Radar');
    } finally {
      setLoading(false);
    }
  };

  const repObj = ALL_UN_COUNTRIES.find(c => String(c.id) === reporterCountry);
  const partObj = ALL_UN_COUNTRIES.find(c => String(c.id) === partnerCountry);
  const repName = repObj ? (isFa ? repObj.nameFa : repObj.nameEn) : `Country ${reporterCountry}`;
  const partName = partObj ? (isFa ? partObj.nameFa : partObj.nameEn) : `Country ${partnerCountry}`;

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'دیده‌بان کم‌اظهاری، بیش‌بود ارزش و فرار ارزی گمرکی (Trade Fraud Radar)' : 'Customs Under/Over-Invoicing Radar'}
            </h1>
            <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
              Bilateral Asymmetry Audit
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa
              ? 'کشف انحرافات ارزش‌گذاری گمرکی از طریق تطبیق صادرات ثبت‌شده مبدأ (FOB) با واردات ثبت‌شده مقصد (CIF) جهت شناسایی کم‌اظهاری تعرفه یا خروج غیرقانونی ارز.'
              : 'Audit customs discrepancies between origin FOB exports and destination CIF imports to spot tariff evasion and illicit capital flows.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={reporterCountry}
            onChange={(e) => setReporterCountry(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
          >
            {ALL_UN_COUNTRIES.filter(c => c.id !== 0).map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.flag} {isFa ? c.nameFa : c.nameEn}
              </option>
            ))}
          </select>

          <span className="text-slate-400 font-bold">⇄</span>

          <select
            value={partnerCountry}
            onChange={(e) => setPartnerCountry(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
          >
            {ALL_UN_COUNTRIES.filter(c => c.id !== 0).map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.flag} {isFa ? c.nameFa : c.nameEn}
              </option>
            ))}
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
          >
            {AVAILABLE_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={executeFraudAudit}
            disabled={loading}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isFa ? 'ارزیابی ریسک' : 'Audit'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{isFa ? 'پیام وب‌سرویس سازمان ملل:' : 'Error:'}</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Initial Ready State */}
      {!hasExecuted && !loading && !analysis && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده ارزیابی ریسک و حسابرسی ارزش‌گذاری گمرکی' : 'Ready for Customs Valuation & Risk Audit'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'کشور صادرکننده، کشور واردکننده و سال را در کادر بالا مشخص کرده و برای تطبیق متقابل اظهارنامه‌ها روی دکمه «ارزیابی ریسک» کلیک کنید.'
              : 'Select origin and destination countries above, then click "Audit" to compare bilateral customs declarations.'}
          </p>
        </div>
      )}

      {/* Empty State Banner when No Bilateral Data Recorded */}
      {hasExecuted && !loading && !analysis && !error && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-950 p-6 rounded-xl flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              {isFa ? 'اطلاعاتی در پایگاه داده برای فیلتر انتخابی وجود ندارد' : 'No Bilateral Trade Data Found in Database'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {isFa 
                ? `برای مبادله تجاری بین «${repName}» و «${partName}» در سال «${selectedPeriod}» رکوردی در پایگاه داده UN Comtrade ثبت نشده است. لطفاً جستجوی خود را تغییر دهید یا سال دیگری را انتخاب نمایید.`
                : `No recorded trade flow found between ${repName} and ${partName} in year ${selectedPeriod}. Please adjust your filters or select a different period.`}
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

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Risk Level Card */}
          <div className={`p-6 rounded-xl border shadow-sm flex flex-col justify-between ${
            analysis.riskLevel === 'critical' || analysis.riskLevel === 'high'
              ? 'bg-rose-50/80 border-rose-200 text-rose-950'
              : analysis.riskLevel === 'moderate'
              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          }`}>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                {isFa ? 'سطح ریسک مغایرت ارزش اظهارنامه' : 'Discrepancy Risk Index'}
              </div>
              <div className="text-3xl font-black font-mono my-2">
                {analysis.riskLevel === 'critical' ? (isFa ? 'بحرانی / اختلاف بسیار بالا' : 'Critical Anomaly') :
                 analysis.riskLevel === 'high' ? (isFa ? 'بالا / مشکوک به بیش‌بود/کم‌اظهاری' : 'High Discrepancy') :
                 analysis.riskLevel === 'moderate' ? (isFa ? 'متوسط / نیازمند بررسی ارزش' : 'Moderate Gap') :
                 (isFa ? 'عادی و منطبق بر مارجین CIF/FOB' : 'Normal & Aligned')}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {isFa
                  ? `مغایرت آماری بین اظهارنامه گمرک ${repName} و گمرک ${partName} برابر با ${Math.abs(analysis.discrepancyPct)}% است.`
                  : `Statistical gap between origin and destination customs filings is ${Math.abs(analysis.discrepancyPct)}%.`}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200/60 text-[11px] font-mono">
              <div className="flex justify-between">
                <span>{isFa ? 'اختلاف مطلق ارزشی:' : 'Net Value Gap:'}</span>
                <span className="font-bold">{formatUSD(Math.abs(analysis.discrepancyUSD), language)}</span>
              </div>
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>{isFa ? 'مقایسه دوجانبه ارزش اظهارشده در دو گمرک' : 'Bilateral Valuation Breakdown'}</span>
              <span className="text-xs font-mono text-slate-500">HS Chapter {selectedHsCode}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-500 mb-1">{isFa ? `صادرات ثبت‌شده توسط گمرک ${repName} (FOB):` : `Export Reported by Origin (FOB):`}</div>
                <div className="text-xl font-black font-mono text-emerald-700">{formatUSD(analysis.reporterExportFob, language)}</div>
                <div className="text-[11px] text-slate-400 mt-1">{isFa ? 'قیمت تمام‌شده در مبدأ بدون احتساب کرایه حمل' : 'Free on Board valuation'}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-500 mb-1">{isFa ? `واردات ثبت‌شده توسط گمرک ${partName} (CIF):` : `Import Reported by Destination (CIF):`}</div>
                <div className="text-xl font-black font-mono text-blue-700">{formatUSD(analysis.partnerImportCif, language)}</div>
                <div className="text-[11px] text-slate-400 mt-1">{isFa ? 'ارزش کالا به همراه بیمه و کرایه حمل بین‌المللی' : 'Cost, Insurance and Freight'}</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <div className="font-bold text-slate-800 mb-1">{isFa ? 'تحلیل اقتصادی بازرگانی:' : 'Economic Audit Insight:'}</div>
              {analysis.partnerImportCif < analysis.reporterExportFob ? (
                isFa 
                  ? `واردات ثبت‌شده در مقصد کمتر از صادرات اعلامی در مبدأ است. این وضعیت می‌تواند نشان‌دهنده «کم‌اظهاری در گمرک مقصد جهت فرار از حقوق و عوارض گمرکی (Under-Invoicing)» یا ترانزیت مجدد به کشور ثالث باشد.`
                  : `Reported import in destination is lower than origin export. May indicate tariff under-invoicing.`
              ) : (
                isFa
                  ? `ارزش اعلامی واردات در مقصد بالاتر از حد استاندارد کرایه حمل (۱۰٪) است. این موضوع می‌تواند ناشی از «بیش‌بود ارزش (Over-Invoicing)» یا هزینه‌های جانبی ترخیص باشد.`
                  : `Import values exceed export baseline by greater than standard 10% freight margin.`
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
