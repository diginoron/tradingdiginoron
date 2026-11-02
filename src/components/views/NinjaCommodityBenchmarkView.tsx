import React, { useState, useEffect } from 'react';
import { 
  Fuel, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Package, 
  Layers, 
  ArrowUpRight, 
  AlertTriangle,
  Info,
  DollarSign
} from 'lucide-react';
import { fetchCommodityPrices, CommodityItem, getStoredNinjaKey } from '../../services/ninjaService';

interface Props {
  language: 'fa' | 'en';
}

export const NinjaCommodityBenchmarkView: React.FC<Props> = ({ language }) => {
  const isFa = language === 'fa';
  const [commodities, setCommodities] = useState<CommodityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityItem | null>(null);

  // Valuation Checker state
  const [declaredUnitPrice, setDeclaredUnitPrice] = useState<number>(8500); // e.g. $/ton
  const [benchmarkUnitPrice, setBenchmarkUnitPrice] = useState<number>(9240); // Copper default

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchCommodityPrices();
      setCommodities(res.commodities || []);
      setIsLive(res.isLive);
      if (res.commodities && res.commodities.length > 0) {
        setSelectedCommodity(res.commodities[4]); // Copper default
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const priceDiffPct = benchmarkUnitPrice > 0 
    ? (((declaredUnitPrice - benchmarkUnitPrice) / benchmarkUnitPrice) * 100).toFixed(1) 
    : '0';

  const isUnderInvoiced = Number(priceDiffPct) < -10;
  const isOverInvoiced = Number(priceDiffPct) > 15;

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-stone-950 text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-amber-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Fuel className="w-5 h-5" />
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isLive 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {isLive ? (isFa ? '🟢 نرخ زنده کامودیتی‌ها API Ninjas' : '🟢 Live Commodity Feed') : (isFa ? '🟡 بنچمارک بازار جهانی' : '🟡 Market Benchmark')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {isFa ? 'قیمت‌های جهانی کامودیتی‌ها و بنچمارک ارزش گمرکی' : 'Global Commodity Prices & Valuation Radar'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isFa 
                ? 'دیده‌بان قیمت لحظه‌ای نفت، گاز، طلا، فلزات پایه (مس، آلومینیوم) و غلات جهت انطباق با کدهای تعرفه گمرکی UN Comtrade و تشخیص انحراف ارزش اظهار شده.'
                : 'Monitor global reference prices for crude oil, metals, and agricultural commodities to cross-check against customs declarations and Comtrade unit prices.'}
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer self-start md:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isFa ? 'بروزرسانی نرخ‌ها' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Commodity Cards Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>{isFa ? 'تابلوی زنده قیمت کالاهای اساسی و مواد اولیه' : 'Commodity Reference Index'}</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {commodities.length} {isFa ? 'کالای پایه' : 'Items'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {commodities.map((item) => {
            const isPositive = item.change24h.startsWith('+');
            const isSelected = selectedCommodity?.code === item.code;
            return (
              <div
                key={item.code}
                onClick={() => {
                  setSelectedCommodity(item);
                  setBenchmarkUnitPrice(item.price);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                  </div>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    isPositive 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{item.change24h}</span>
                  </span>
                </div>

                <div className="pt-1 flex items-baseline justify-between">
                  <div className="text-xl font-black font-mono text-slate-900">
                    ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-slate-500">{item.unit}</span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="text-[10px] text-slate-400">{isFa ? 'کد تعرفه متناظر:' : 'HS Code:'}</span>
                  <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    {item.comtradeHsMatch}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customs Declared Price vs Benchmark Sanity Checker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>{isFa ? 'ارزیاب انحراف ارزش اظهار شده از قیمت جهانی (Price Gap Analysis)' : 'Customs Valuation Sanity Checker'}</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {selectedCommodity?.name || 'Commodity'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              {isFa ? 'ارزش هر تن در پیش‌فاکتور / اظهارنامه ($):' : 'Declared Price per Ton ($):'}
            </label>
            <input
              type="number"
              value={declaredUnitPrice}
              onChange={(e) => setDeclaredUnitPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              {isFa ? 'قیمت مرجع جهانی در بورس کالایی ($):' : 'Benchmark World Price ($):'}
            </label>
            <input
              type="number"
              value={benchmarkUnitPrice}
              onChange={(e) => setBenchmarkUnitPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="p-3.5 rounded-xl border flex flex-col justify-center gap-1 bg-slate-50 border-slate-200">
            <span className="text-[11px] text-slate-500">{isFa ? 'میزان انحراف از قیمت روز:' : 'Valuation Discrepancy:'}</span>
            <div className="text-xl font-black font-mono flex items-center gap-2">
              <span className={Number(priceDiffPct) < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                {Number(priceDiffPct) > 0 ? `+${priceDiffPct}%` : `${priceDiffPct}%`}
              </span>
              <span className="text-xs font-normal text-slate-500">
                {isUnderInvoiced ? (isFa ? '⚠️ ریسک کم‌اظهاری' : 'Under-invoiced') : isOverInvoiced ? (isFa ? '⚠️ بیش‌اظهاری' : 'Over-invoiced') : (isFa ? '✅ در محدوده مجاز' : 'Within Normal Range')}
              </span>
            </div>
          </div>
        </div>

        {/* Advisory alert */}
        {isUnderInvoiced && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              {isFa 
                ? 'هشدار بازرگانی: قیمت اظهار شده بیش از ۱۰٪ پایین‌تر از میانگین قیمت‌های جهانی است. گمرکات مقصد ممکن است محموله را مشمول ارزش‌گذاری مجدد بر اساس ماده ۷ موافقت‌نامه ارزش گای (GATT) و اخذ جریمه گمرکی نمایند.'
                : 'Customs Warning: The declared value is significantly below world reference prices. Customs authorities may challenge the transaction value under WTO valuation rules.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
