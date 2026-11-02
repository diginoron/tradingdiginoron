import React, { useState } from 'react';
import { fetchComtradeData } from '../../services/comtradeService';
import { ALL_UN_COUNTRIES, AVAILABLE_YEARS } from '../../data/referenceData';
import { formatUSD } from '../../lib/utils';
import { Globe2, Users, RefreshCw, AlertCircle, TrendingUp, ShieldCheck, ArrowRightLeft } from 'lucide-react';

interface TradeBlocsViewProps {
  language: 'fa' | 'en';
}

interface TradeBlocDef {
  id: string;
  nameFa: string;
  nameEn: string;
  descFa: string;
  descEn: string;
  flag: string;
  memberCodes: number[];
}

const TRADE_BLOCS: TradeBlocDef[] = [
  {
    id: 'brics',
    nameFa: 'پیمان بریکس پلاس (BRICS+)',
    nameEn: 'BRICS+ Alliance',
    descFa: 'بزرگترین بلوک اقتصادهای نوظهور جهان شامل ایران، چین، روسیه، هند، برزیل، امارات، آفریقای جنوبی، مصر و عربستان.',
    descEn: 'Major emerging market economic bloc: China, Russia, India, Brazil, Iran, UAE, Saudi Arabia, Egypt, South Africa.',
    flag: '🌍',
    memberCodes: [156, 643, 356, 76, 710, 364, 784, 818, 682]
  },
  {
    id: 'eaeu',
    nameFa: 'اتحادیه اقتصادی اوراسیا (EAEU)',
    nameEn: 'Eurasian Economic Union (EAEU)',
    descFa: 'بازار مشترک منطقه شمالی با توافق تجارت آزاد با ایران: روسیه، بلاروس، قزاقستان، ارمنستان و قرقیزستان.',
    descEn: 'Northern free trade common market: Russia, Belarus, Kazakhstan, Armenia, Kyrgyzstan, and Iran FTA.',
    flag: '🏔️',
    memberCodes: [643, 112, 398, 51, 417, 364]
  },
  {
    id: 'eco',
    nameFa: 'سازمان همکاری اقتصادی (ECO)',
    nameEn: 'Economic Cooperation Organization (ECO)',
    descFa: 'پیمان منطقه‌ای آسیای میانه و خاورمیانه: ایران، ترکیه، پاکستان، آذربایجان، قزاقستان، ازبکستان، ترکمنستان، تاجیکستان و افغانستان.',
    descEn: 'Central & West Asian trade union: Iran, Turkey, Pakistan, Azerbaijan, Kazakhstan, Uzbekistan, Turkmenistan, Tajikistan, Afghanistan.',
    flag: '🕌',
    memberCodes: [364, 792, 586, 31, 398, 860, 795, 762, 4]
  },
  {
    id: 'gcc',
    nameFa: 'شورای همکاری خلیج فارس (GCC)',
    nameEn: 'Gulf Cooperation Council (GCC)',
    descFa: 'بلوک کشورهای عربی خلیج فارس: امارات، عربستان سعودی، قطر، کویت، عمان و بحرین.',
    descEn: 'Arabian Gulf customs bloc: UAE, Saudi Arabia, Qatar, Kuwait, Oman, Bahrain.',
    flag: '🏝️',
    memberCodes: [784, 682, 634, 414, 512, 48]
  },
  {
    id: 'eu',
    nameFa: 'اتحادیه اروپا (European Union)',
    nameEn: 'European Union (EU-27)',
    descFa: 'بزرگترین بازار واحد یکپارچه جهان: آلمان، فرانسه، ایتالیا، اسپانیا، هلند، بلژیک، لهستان و ۲۰ کشور دیگر.',
    descEn: 'World single market powerhouse: Germany, France, Italy, Spain, Netherlands, Belgium, Poland, etc.',
    flag: '🇪🇺',
    memberCodes: [276, 251, 381, 724, 528, 56, 616, 40, 752]
  }
];

export const TradeBlocsView: React.FC<TradeBlocsViewProps> = ({ language }) => {
  const isFa = language === 'fa';

  const [selectedBlocId, setSelectedBlocId] = useState<string>('brics');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2023');
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [blocStats, setBlocStats] = useState<{
    totalBlocTradeUSD: number;
    membersData: any[];
  } | null>(null);

  const activeBloc = TRADE_BLOCS.find(b => b.id === selectedBlocId) || TRADE_BLOCS[0];

  const calculateBlocTrade = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);

    try {
      // Query trade of key member countries
      const membersToQuery = activeBloc.memberCodes.slice(0, 6);
      const responses = await Promise.all(
        membersToQuery.map(cCode =>
          fetchComtradeData({
            reporterCode: String(cCode),
            partnerCode: '0', // World
            period: selectedPeriod,
            cmdCode: 'TOTAL',
            flowCode: 'M,X',
            typeCode: 'C',
            freqCode: 'A',
            clCode: 'HS'
          }).catch(() => null)
        )
      );

      let totalUSD = 0;
      const membersList: any[] = [];

      membersToQuery.forEach((cCode, idx) => {
        const res = responses[idx];
        const val = Number(res?.data?.[0]?.primaryValue || 0);
        totalUSD += val;

        const cObj = ALL_UN_COUNTRIES.find(c => c.id === cCode);
        membersList.push({
          code: cCode,
          name: cObj ? (isFa ? cObj.nameFa : cObj.nameEn) : `Country ${cCode}`,
          flag: cObj?.flag || '🌐',
          tradeValueUSD: val,
        });
      });

      setBlocStats({
        totalBlocTradeUSD: totalUSD,
        membersData: membersList.sort((a, b) => b.tradeValueUSD - a.tradeValueUSD)
      });

    } catch (err: any) {
      setError(err.message || 'Failed to calculate trade bloc statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Globe2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'ارزیابی بلوک‌های تجاری و پیمان‌های منطقه‌ای (Trade Blocs: BRICS, EAEU, ECO, GCC)' : 'Regional Trade Blocs & FTA Simulator'}
            </h1>
            <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
              Intra-Bloc Trade Flows
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa
              ? 'تحلیل جامع حجم مبادلات، فرصت‌های تعرفه ترجیحی و هم‌افزایی بازرگانی در بلوک‌های بزرگ اقتصادی نظیر بریکس، اوراسیا، اکو و شورای همکاری خلیج فارس.'
              : 'Assess bilateral trade integration and tariff advantages within global economic unions.'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedBlocId}
            onChange={(e) => setSelectedBlocId(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {TRADE_BLOCS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.flag} {isFa ? b.nameFa : b.nameEn}
              </option>
            ))}
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {AVAILABLE_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={calculateBlocTrade}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isFa ? 'ارزیابی بلوک' : 'Evaluate'}</span>
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
      {!hasExecuted && !loading && !blocStats && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Globe2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? `آماده ارزیابی بلوک اقتصادی ${isFa ? activeBloc.nameFa : activeBloc.nameEn}` : `Ready to Evaluate ${activeBloc.nameEn}`}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'بلوک تجاری و سال آماری را در کادر بالا انتخاب کرده و روی دکمه «ارزیابی بلوک» کلیک کنید.'
              : 'Select trade bloc and period above, then click "Evaluate" to aggregate member statistics.'}
          </p>
        </div>
      )}

      {/* Empty State Banner when No Bloc Data Found */}
      {hasExecuted && !loading && blocStats && blocStats.totalBlocTradeUSD === 0 && !error && (
        <div className="bg-amber-50/80 border border-amber-200 text-amber-950 p-6 rounded-xl flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              {isFa ? 'اطلاعاتی در پایگاه داده برای فیلتر انتخابی وجود ندارد' : 'No Trade Records Found for Selected Period'}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {isFa 
                ? `برای اعضای این بلوک تجاری در سال «${selectedPeriod}» اظهارنامه یا رکوردی در سرورهای UN Comtrade ثبت نشده است. لطفاً سال‌های قبل‌تر (مانند ۲۰۲۱ یا ۲۰۲۲) یا بلوک دیگری را انتخاب فرمایید.`
                : `No trade returns recorded for this bloc in year ${selectedPeriod}. Please switch to an earlier year.`}
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

      {/* Bloc Info Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{activeBloc.flag}</span>
            <h2 className="text-lg font-bold">{isFa ? activeBloc.nameFa : activeBloc.nameEn}</h2>
          </div>
          <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">
            {isFa ? activeBloc.descFa : activeBloc.descEn}
          </p>
        </div>

        {blocStats && (
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10 shrink-0 text-end">
            <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
              {isFa ? 'مجموع تجارت نمونه اعضای بلوک' : 'Aggregate Sample Bloc Trade'}
            </div>
            <div className="text-2xl font-black font-mono mt-1 text-white">
              {formatUSD(blocStats.totalBlocTradeUSD, language)}
            </div>
          </div>
        )}
      </div>

      {/* Members Grid */}
      {blocStats && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>{isFa ? 'حجم مبادلات تجاری اعضای اصلی پیمان' : 'Trade Volumes of Member Economies'}</span>
            <span className="text-xs font-mono text-slate-400">UN Comtrade Verified Returns</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blocStats.membersData.map((m, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.flag}</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{m.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Rank #{idx + 1}</span>
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-sm font-black font-mono text-indigo-700">
                    {formatUSD(m.tradeValueUSD, language)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {((m.tradeValueUSD / (blocStats.totalBlocTradeUSD || 1)) * 100).toFixed(1)}% {isFa ? 'سهم از بلوک' : 'share'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
