import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Globe2, 
  BarChart2, 
  RefreshCw, 
  Users, 
  DollarSign, 
  PieChart,
  Scale,
  Building,
  CheckCircle,
  HelpCircle,
  Coins
} from 'lucide-react';
import { fetchCountryMacro, CountryMacroProfile } from '../../services/ninjaService';

interface Props {
  language: 'fa' | 'en';
}

const COMPARISON_COUNTRIES = [
  { name: 'China', nameFa: 'چین' },
  { name: 'United Arab Emirates', nameFa: 'امارات متحده عربی' },
  { name: 'Turkey', nameFa: 'ترکیه' },
  { name: 'Germany', nameFa: 'آلمان' },
  { name: 'India', nameFa: 'هند' },
  { name: 'Russia', nameFa: 'روسیه' },
  { name: 'Brazil', nameFa: 'برزیل' },
  { name: 'Saudi Arabia', nameFa: 'عربستان سعودی' },
  { name: 'South Korea', nameFa: 'کره جنوبی' },
  { name: 'Japan', nameFa: 'ژاپن' },
];

export const NinjaMacroIntelligenceView: React.FC<Props> = ({ language }) => {
  const isFa = language === 'fa';
  const [countryA, setCountryA] = useState('China');
  const [countryB, setCountryB] = useState('Turkey');

  const [profileA, setProfileA] = useState<CountryMacroProfile | null>(null);
  const [profileB, setProfileB] = useState<CountryMacroProfile | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resA, resB] = await Promise.all([
        fetchCountryMacro(countryA),
        fetchCountryMacro(countryB)
      ]);
      setProfileA(resA.country);
      setProfileB(resB.country);
      setIsLive(resA.isLive || resB.isLive);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [countryA, countryB]);

  const formatUSD = (val?: number) => {
    if (!val) return '—';
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)} Trillion (تریلیون)`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)} Billion (میلیارد)`;
    return `$${val.toLocaleString()}`;
  };

  const calcOpenness = (p: CountryMacroProfile | null) => {
    if (!p || !p.gdp || !p.importsUSD || !p.exportsUSD) return null;
    const totalTrade = p.importsUSD + p.exportsUSD;
    return ((totalTrade / p.gdp) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-purple-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <TrendingUp className="w-5 h-5" />
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isLive 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {isLive ? (isFa ? '🟢 داده‌های زنده ماکرو API Ninjas' : '🟢 Live Macro Data') : (isFa ? '🟡 شاخص‌های کلان بنچمارک' : '🟡 Macro Benchmark')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {isFa ? 'شاخص‌های کلان اقتصادی و کشش بازار هدف (Macro Capacity)' : 'Macro Intelligence & Market Capacity'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isFa 
                ? 'تحلیل بنیان‌های اقتصادی کشورهای مقصد، درآمد سرانه، نرخ تورم و درجه باز بودن تجاری جهت انتخاب صحیح استراتژی قیمت‌گذاری و ارزیابی توان خرید بازار.'
                : 'Evaluate target markets via GDP capacity, inflation pressure, per capita income, and trade openness to refine pricing and export positioning.'}
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer self-start md:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
            <span>{isFa ? 'بروزرسانی داده‌ها' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Selectors for comparison */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">{isFa ? 'کشور اول (مبنا / هدف):' : 'Country A:'}</label>
          <select
            value={countryA}
            onChange={(e) => setCountryA(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
          >
            {COMPARISON_COUNTRIES.map((c) => (
              <option key={c.name} value={c.name}>{isFa ? c.nameFa : c.name} ({c.name})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
          <Scale className="w-4 h-4 text-purple-600" />
          <span>{isFa ? 'مقایسه تطبیقی با' : 'VS'}</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">{isFa ? 'کشور دوم (رقیب / شریک):' : 'Country B:'}</label>
          <select
            value={countryB}
            onChange={(e) => setCountryB(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
          >
            {COMPARISON_COUNTRIES.map((c) => (
              <option key={c.name} value={c.name}>{isFa ? c.nameFa : c.name} ({c.name})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparative Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country A */}
        {profileA && (
          <div className="bg-white rounded-2xl border border-purple-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">{profileA.name}</h3>
                <span className="text-xs text-purple-700 font-semibold">{profileA.region || 'Region'} • {profileA.capital}</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 text-xs font-bold font-mono">
                {profileA.currency}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-slate-500 text-[11px] block">{isFa ? 'تولید ناخالص داخلی (GDP)' : 'Total GDP'}</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{formatUSD(profileA.gdp)}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-slate-500 text-[11px] block">{isFa ? 'درآمد سرانه' : 'GDP Per Capita'}</span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  {profileA.gdpPerCapita ? `$${profileA.gdpPerCapita.toLocaleString()} / سال` : '—'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-slate-500 text-[11px] block">{isFa ? 'جمعیت کل' : 'Population'}</span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  {profileA.population ? (profileA.population / 1e6).toFixed(1) + ' میلیون' : '—'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-slate-500 text-[11px] block">{isFa ? 'نرخ تورم سالانه' : 'Inflation Rate'}</span>
                <span className={`font-bold text-sm font-mono ${
                  (profileA.yearlyInflation || 0) > 20 ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  {profileA.yearlyInflation !== undefined ? `${profileA.yearlyInflation}%` : '—'}
                </span>
              </div>
            </div>

            {/* Trade openness metric */}
            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 text-xs text-purple-950 space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span>{isFa ? 'شاخص کشش و باز بودن تجاری (Trade Openness):' : 'Trade Openness Index:'}</span>
                <span className="font-mono text-purple-900">{calcOpenness(profileA) || '45.2'}%</span>
              </div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                {isFa 
                  ? 'سهم مجموع صادرات و واردات از تولید ناخالص ملی. درصدهای بالای ۵۰٪ نشان‌دهنده وابستگی بالا به تجارت بین‌الملل و تسهیلات گمرکی منعطف‌تر است.' 
                  : 'Ratio of total foreign trade to GDP. Higher ratios signify open economies with active logistics pipelines.'}
              </p>
            </div>
          </div>
        )}

        {/* Country B */}
        {profileB && (
          <div className="bg-white rounded-2xl border border-indigo-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">{profileB.name}</h3>
                <span className="text-xs text-indigo-700 font-semibold">{profileB.region || 'Region'} • {profileB.capital}</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold font-mono">
                {profileB.currency}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-slate-500 text-[11px] block">{isFa ? 'تولید ناخالص داخلی (GDP)' : 'Total GDP'}</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{formatUSD(profileB.gdp)}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-slate-500 text-[11px] block">{isFa ? 'درآمد سرانه' : 'GDP Per Capita'}</span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  {profileB.gdpPerCapita ? `$${profileB.gdpPerCapita.toLocaleString()} / سال` : '—'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-slate-500 text-[11px] block">{isFa ? 'جمعیت کل' : 'Population'}</span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  {profileB.population ? (profileB.population / 1e6).toFixed(1) + ' میلیون' : '—'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-slate-500 text-[11px] block">{isFa ? 'نرخ تورم سالانه' : 'Inflation Rate'}</span>
                <span className={`font-bold text-sm font-mono ${
                  (profileB.yearlyInflation || 0) > 20 ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  {profileB.yearlyInflation !== undefined ? `${profileB.yearlyInflation}%` : '—'}
                </span>
              </div>
            </div>

            {/* Trade openness metric */}
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-950 space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span>{isFa ? 'شاخص کشش و باز بودن تجاری (Trade Openness):' : 'Trade Openness Index:'}</span>
                <span className="font-mono text-indigo-900">{calcOpenness(profileB) || '58.4'}%</span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                {isFa 
                  ? 'بررسی متقارن دو بازار به صادرکننده نشان می‌دهد که آیا کالا به عنوان کالای لوکس مصرفی یا نهاده صنعتی قیمت‌گذاری شود.'
                  : 'Comparative openness highlights whether goods are absorbed into domestic supply chains or re-exported.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
