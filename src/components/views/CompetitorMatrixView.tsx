import React, { useState } from 'react';
import { fetchComtradeData } from '../../services/comtradeService';
import { ALL_UN_COUNTRIES, ALL_HS_CHAPTERS, AVAILABLE_YEARS } from '../../data/referenceData';
import { formatUSD } from '../../lib/utils';
import { Users, BarChart2, RefreshCw, AlertCircle, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CompetitorMatrixViewProps {
  language: 'fa' | 'en';
}

export const CompetitorMatrixView: React.FC<CompetitorMatrixViewProps> = ({ language }) => {
  const isFa = language === 'fa';

  const [destinationCountry, setDestinationCountry] = useState<string>('784'); // UAE
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2023');
  const [selectedHsCode, setSelectedHsCode] = useState<string>('08'); // Fruits & Nuts

  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [totalMarketImportUSD, setTotalMarketImportUSD] = useState<number>(0);

  const analyzeCompetitors = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);

    try {
      // Query destination country's imports for this commodity across all partners
      const res = await fetchComtradeData({
        reporterCode: destinationCountry,
        partnerCode: undefined, // all partners
        period: selectedPeriod,
        cmdCode: selectedHsCode,
        flowCode: 'M',
        typeCode: 'C',
        freqCode: 'A',
        clCode: 'HS'
      });

      const records = res?.data || [];
      const validSuppliers = records.filter((r: any) => Number(r.partnerCode) !== 0 && Number(r.primaryValue) > 0);

      const totalVal = validSuppliers.reduce((acc: number, r: any) => acc + Number(r.primaryValue || 0), 0);
      setTotalMarketImportUSD(totalVal);

      const supplierList = validSuppliers.map((r: any) => {
        const pObj = ALL_UN_COUNTRIES.find(c => Number(c.id) === Number(r.partnerCode));
        const val = Number(r.primaryValue || 0);
        const share = totalVal > 0 ? (val / totalVal) * 100 : 0;
        const netWgt = Number(r.netWgt || 0);
        const unitPrice = netWgt > 0 ? val / netWgt : 0;

        return {
          code: r.partnerCode,
          name: pObj ? (isFa ? pObj.nameFa : pObj.nameEn) : (r.partnerDesc || `Country ${r.partnerCode}`),
          flag: pObj?.flag || '🌐',
          value: val,
          sharePct: Number(share.toFixed(1)),
          netWgtKg: netWgt,
          unitPriceUSD: Number(unitPrice.toFixed(2))
        };
      }).sort((a: any, b: any) => b.value - a.value);

      setCompetitors(supplierList.slice(0, 15));

    } catch (err: any) {
      setError(err.message || 'Failed to analyze competitor suppliers');
    } finally {
      setLoading(false);
    }
  };

  const destObj = ALL_UN_COUNTRIES.find(c => String(c.id) === destinationCountry);
  const destName = destObj ? (isFa ? destObj.nameFa : destObj.nameEn) : `Country ${destinationCountry}`;

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'ماتریس سهم از سبد وارداتی رقبا (Import Market Penetration & Competitor Dominance)' : 'Import Market Penetration & Competitor Dominance Matrix'}
            </h1>
            <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
              Supplier Market Share & Pricing
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa
              ? 'بررسی سهم تأمین‌کنندگان خارجی در بازار کشور مقصد و مقایسه قیمت واحد صادراتی ($/kg) و قدرت انحصار رقبای بین‌المللی.'
              : 'Dissect supplier market shares and pricing dynamics in target destination import markets.'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={destinationCountry}
            onChange={(e) => setDestinationCountry(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium max-w-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            {ALL_HS_CHAPTERS.map((ch) => (
              <option key={ch.code} value={ch.code}>
                فصل {ch.code}: {isFa ? ch.nameFa : ch.nameEn}
              </option>
            ))}
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            {AVAILABLE_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={analyzeCompetitors}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isFa ? 'تحلیل رقبا' : 'Analyze'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{isFa ? 'پیام:' : 'Message:'}</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Initial Ready State */}
      {!hasExecuted && !loading && competitors.length === 0 && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده تحلیل ماتریس رقبا و سهم بازار' : 'Ready for Competitor Market Share Matrix'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'کشور مقصد، سال آماری و کد فصل کالایی را در کادر بالا انتخاب کرده و روی دکمه «تحلیل رقبا» کلیک کنید.'
              : 'Select target market, period, and HS chapter above, then click "Analyze" to inspect supplier dominance.'}
          </p>
        </div>
      )}

      {/* Empty State Banner when No Import Data Recorded */}
      {hasExecuted && !loading && competitors.length === 0 && !error && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-950 p-6 rounded-xl flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              {isFa ? 'اطلاعاتی در پایگاه داده برای فیلتر انتخابی وجود ندارد' : 'No Import Records Found in UN Comtrade'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {isFa 
                ? `برای کشور مقصد «${destName}» در سال «${selectedPeriod}» داده‌های وارداتی در پایگاه داده سازمان ملل ثبت نشده است. لطفاً سال‌های قبل‌تر (مانند ۲۰۲۱ یا ۲۰۲۲) یا کشور مقصد دیگری را انتخاب فرمایید.`
                : `No import trade data found for ${destName} in year ${selectedPeriod}. Please switch to another period or target destination.`}
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

      {/* Summary Total */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase">
            {isFa ? `مجموع تقاضای وارداتی ${destName}` : `Total Market Import Demand`}
          </span>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {formatUSD(totalMarketImportUSD, language)}
          </div>
        </div>
        <div className="text-end">
          <span className="text-xs font-mono text-slate-400">
            {competitors.length} {isFa ? 'کشور صادرکننده فعال' : 'supplying nations'}
          </span>
        </div>
      </div>

      {/* Competitors Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>{isFa ? `سهم تأمین‌کنندگان خارجی از بازار واردات ${destName}` : `Foreign Suppliers Market Share Matrix`}</span>
          <span className="text-xs font-mono text-slate-400">Ranked by Value</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-3 text-start">{isFa ? 'رتبه' : 'Rank'}</th>
                <th className="p-3 text-start">{isFa ? 'کشور رقیب / صادرکننده' : 'Exporter Nation'}</th>
                <th className="p-3 text-end">{isFa ? 'ارزش صادرات به مقصد' : 'Export Value (USD)'}</th>
                <th className="p-3 text-end">{isFa ? 'سهم از کل بازار' : 'Market Share'}</th>
                <th className="p-3 text-end">{isFa ? 'وزن خالص (کیلوگرم)' : 'Net Weight (Kg)'}</th>
                <th className="p-3 text-end">{isFa ? 'قیمت میانگین واحد' : 'Unit Price ($/kg)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {competitors.length > 0 ? (
                competitors.map((comp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-lg">{comp.flag}</span>
                      <span>{comp.name}</span>
                    </td>
                    <td className="p-3 font-mono text-end font-bold text-teal-700">{formatUSD(comp.value, language)}</td>
                    <td className="p-3 font-mono text-end">
                      <span className="px-2 py-0.5 bg-teal-50 text-teal-800 font-bold rounded text-[11px]">
                        {comp.sharePct}%
                      </span>
                    </td>
                    <td className="p-3 font-mono text-end text-slate-600">
                      {comp.netWgtKg > 0 ? comp.netWgtKg.toLocaleString() : '-'}
                    </td>
                    <td className="p-3 font-mono text-end text-slate-900 font-bold">
                      {comp.unitPriceUSD > 0 ? `$${comp.unitPriceUSD}` : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {loading ? (isFa ? 'در حال دریافت داده‌های رقبا...' : 'Fetching competitors...') : (isFa ? 'داده‌ای یافت نشد' : 'No records')}
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
