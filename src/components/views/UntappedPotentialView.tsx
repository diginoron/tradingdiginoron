import React, { useState } from 'react';
import { fetchComtradeData } from '../../services/comtradeService';
import { ALL_UN_COUNTRIES, ALL_HS_CHAPTERS, AVAILABLE_YEARS } from '../../data/referenceData';
import { formatUSD } from '../../lib/utils';
import { Compass, Sparkles, RefreshCw, AlertCircle, TrendingUp, CheckCircle, ExternalLink } from 'lucide-react';

interface UntappedPotentialViewProps {
  language: 'fa' | 'en';
}

export const UntappedPotentialView: React.FC<UntappedPotentialViewProps> = ({ language }) => {
  const isFa = language === 'fa';

  const [originCountry, setOriginCountry] = useState<string>('364'); // Iran
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2021');
  const [selectedHsCode, setSelectedHsCode] = useState<string>('08'); // Fruits & Nuts

  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);

  const discoverOpportunities = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Origin exports to all partners for this commodity
      const originRes = await fetchComtradeData({
        reporterCode: originCountry,
        partnerCode: undefined,
        period: selectedPeriod,
        cmdCode: selectedHsCode,
        flowCode: 'X',
        typeCode: 'C',
        freqCode: 'A',
        clCode: 'HS'
      });

      const currentExports = originRes?.data || [];
      const currentExportMap = new Map<number, number>();
      currentExports.forEach((r: any) => {
        currentExportMap.set(Number(r.partnerCode), Number(r.primaryValue || 0));
      });

      // Sample key high-demand global markets: Germany(276), Japan(392), UK(826), France(251), Italy(381), Netherlands(528), Canada(124), Saudi(682), Poland(616), Turkey(792), UAE(784), India(356), Russia(643)
      const targetProspects = [276, 392, 826, 251, 381, 528, 124, 682, 616, 792, 784, 356, 643];
      
      const marketDemandRes = await Promise.all(
        targetProspects.map(code => 
          fetchComtradeData({
            reporterCode: String(code),
            partnerCode: '0', // World
            period: selectedPeriod,
            cmdCode: selectedHsCode,
            flowCode: 'M',
            typeCode: 'C',
            freqCode: 'A',
            clCode: 'HS'
          }).catch(() => null)
        )
      );

      const computedList: any[] = [];

      targetProspects.forEach((code, idx) => {
        const importRes = marketDemandRes[idx];
        const totalMarketImportUSD = Number(importRes?.data?.[0]?.primaryValue || 0);
        const actualExportToTargetUSD = currentExportMap.get(code) || 0;
        const currentShare = totalMarketImportUSD > 0 ? (actualExportToTargetUSD / totalMarketImportUSD) * 100 : 0;

        // Untapped gap = Market import demand - actual exports
        const untappedGapUSD = Math.max(0, totalMarketImportUSD - actualExportToTargetUSD);

        if (totalMarketImportUSD > 0) {
          const countryObj = ALL_UN_COUNTRIES.find(c => c.id === code);
          computedList.push({
            code,
            name: countryObj ? (isFa ? countryObj.nameFa : countryObj.nameEn) : `Country ${code}`,
            flag: countryObj?.flag || '🌐',
            totalMarketImportUSD,
            actualExportToTargetUSD,
            currentShare: Number(currentShare.toFixed(2)),
            untappedGapUSD,
            potentialScore: Math.min(99, Math.round((untappedGapUSD / 1000000) * 0.5 + (100 - currentShare) * 0.5))
          });
        }
      });

      computedList.sort((a, b) => b.untappedGapUSD - a.untappedGapUSD);
      setOpportunities(computedList);

    } catch (err: any) {
      setError(err.message || 'Error discovering untapped export potential');
    } finally {
      setLoading(false);
    }
  };

  const originObj = ALL_UN_COUNTRIES.find(c => String(c.id) === originCountry);
  const originName = originObj ? (isFa ? originObj.nameFa : originObj.nameEn) : `Country ${originCountry}`;

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'شناسایی فرصت‌های پنهان و ظرفیت‌های خالی صادرات (Untapped Export Potential)' : 'Untapped Export Potential Finder'}
            </h1>
            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Trade Gap Discovery
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa
              ? 'مقایسه حجم تقاضای وارداتی کشورهای بزرگ جهان با میزان حضور فعلی شما در آن بازارها جهت شناسایی بازارهای بکر با کمترین رقابت و بالاترین پتانسیل سودآوری.'
              : 'Identify target markets with massive import demand where your current export footprint is low or under-utilized.'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={originCountry}
            onChange={(e) => setOriginCountry(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium max-w-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {AVAILABLE_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={discoverOpportunities}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isFa ? 'کشف فرصت‌ها' : 'Discover'}</span>
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
      {!hasExecuted && !loading && opportunities.length === 0 && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده شناسایی فرصت‌های پنهان و ظرفیت‌های خالی صادرات' : 'Ready to Discover Untapped Export Potential'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'کشور مبدأ، کد کالایی و سال را در کادر بالا انتخاب کرده و برای کشف بازارهای بکر صادراتی روی دکمه «کشف فرصت‌ها» کلیک کنید.'
              : 'Select origin country, HS commodity, and period above, then click "Discover" to reveal high-gap target markets.'}
          </p>
        </div>
      )}

      {/* Empty State Banner when No Opportunities Data Found */}
      {hasExecuted && !loading && opportunities.length === 0 && !error && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-950 p-6 rounded-xl flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              {isFa ? 'اطلاعاتی در پایگاه داده برای فیلتر انتخابی وجود ندارد' : 'No Trade Records Found in UN Comtrade'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {isFa 
                ? `برای کشور مبدأ «${originName}» در سال «${selectedPeriod}» رکوردی جهت تحلیل ظرفیت‌های خالی صادرات در سازمان ملل ثبت نشده است. لطفاً جستجوی خود را تغییر دهید یا سال دیگری را انتخاب فرمایید.`
                : `No trade returns found for ${originName} in year ${selectedPeriod}. Please adjust your filters or switch to an earlier year.`}
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

      {/* Opportunities Grid / Table */}
      {opportunities.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-500" />
              <span>{isFa ? `رتبه‌بندی بازارهای بکر و دارای ظرفیت برای ${originName}` : `Untapped Target Markets Ranking for ${originName}`}</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">{opportunities.length} {isFa ? 'بازار هدف اول' : 'key prospects'}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="p-3 text-start">{isFa ? 'رتبه' : 'Rank'}</th>
                  <th className="p-3 text-start">{isFa ? 'کشور مقصد' : 'Target Market'}</th>
                  <th className="p-3 text-end">{isFa ? 'کل واردات آن کشور از جهان' : 'Total World Imports'}</th>
                  <th className="p-3 text-end">{isFa ? 'صادرات فعلی شما' : 'Your Exports'}</th>
                  <th className="p-3 text-end">{isFa ? 'سهم فعلی شما' : 'Current Market Share'}</th>
                  <th className="p-3 text-end">{isFa ? 'ظرفیت خالی و دست‌نخورده (Gap)' : 'Untapped Gap (USD)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {opportunities.map((opp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-lg">{opp.flag}</span>
                      <span>{opp.name}</span>
                    </td>
                    <td className="p-3 font-mono text-end text-slate-800">{formatUSD(opp.totalMarketImportUSD, language)}</td>
                    <td className="p-3 font-mono text-end text-emerald-700 font-bold">{formatUSD(opp.actualExportToTargetUSD, language)}</td>
                    <td className="p-3 font-mono text-end text-slate-600">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        opp.currentShare > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {opp.currentShare}%
                      </span>
                    </td>
                    <td className="p-3 font-mono text-end font-black text-blue-700 text-sm">
                      {formatUSD(opp.untappedGapUSD, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
