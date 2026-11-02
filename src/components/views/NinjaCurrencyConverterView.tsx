import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  ArrowRightLeft, 
  TrendingUp, 
  RefreshCw, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';
import { fetchExchangeRates, convertCurrency, ExchangeRateItem, getStoredNinjaKey } from '../../services/ninjaService';

interface Props {
  language: 'fa' | 'en';
}

export const NinjaCurrencyConverterView: React.FC<Props> = ({ language }) => {
  const isFa = language === 'fa';
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('AED');
  const [amount, setAmount] = useState<number>(100000);
  const [convertedResult, setConvertedResult] = useState<number | null>(null);
  const [rates, setRates] = useState<Record<string, ExchangeRateItem>>({});
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const hasKey = Boolean(getStoredNinjaKey());

  const loadRates = async () => {
    setIsLoading(true);
    try {
      const res = await fetchExchangeRates(baseCurrency);
      setRates(res.rates || {});
      setIsLive(res.isLive);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, [baseCurrency]);

  useEffect(() => {
    const runConvert = async () => {
      if (amount <= 0) return;
      const res = await convertCurrency(amount, baseCurrency, targetCurrency);
      setConvertedResult(res.new_amount);
    };
    runConvert();
  }, [amount, baseCurrency, targetCurrency]);

  const handleCopy = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const tradePresets = [10000, 50000, 100000, 500000, 1000000];

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Coins className="w-5 h-5" />
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isLive 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {isLive ? (isFa ? '🟢 نرخ‌های زنده API Ninjas' : '🟢 Live API Ninjas Feed') : (isFa ? '🟡 بنچمارک بازار (پیش‌نمایش)' : '🟡 Market Benchmark')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {isFa ? 'مبدل زنده ارزهای تجاری و تسویه بازرگانی' : 'Real-time Trade Currency Converter & FX'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isFa 
                ? 'تبدیل فوری ارزش فاکتورهای تجاری، پیش‌فاکتورها و آمارهای گمرکی UN Comtrade به ارزهای مبادلاتی شرکای منطقه (درهم امارات، یوان چین، لیر، یورو، روبل و ریال).'
                : 'Instantly convert trade invoices, proformas and customs values into operational trade currencies (AED, CNY, TRY, EUR, RUB, SAR).'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={loadRates}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isFa ? 'بروزرسانی نرخ‌ها' : 'Refresh Rates'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive FX Converter Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Converter Calculator */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
              <span>{isFa ? 'محاسبه‌گر ارزش معامله' : 'Trade Value Calculator'}</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              1 {baseCurrency} = {rates[targetCurrency]?.rate?.toFixed(4) || '—'} {targetCurrency}
            </span>
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>{isFa ? 'مبلغ معامله / ارزش فاکتور' : 'Trade Amount'}</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {amount.toLocaleString()} {baseCurrency}
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tradePresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`px-2 py-1 text-[10px] font-mono rounded-md border transition-all cursor-pointer ${
                    amount === val 
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold' 
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  ${(val / 1000).toLocaleString()}k
                </button>
              ))}
            </div>
          </div>

          {/* Currency selection row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">{isFa ? 'از ارز' : 'From'}</label>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                {Object.keys(rates).length > 0 ? (
                  Object.keys(rates).map((c) => (
                    <option key={c} value={c}>{c} - {rates[c]?.nameFa || c}</option>
                  ))
                ) : (
                  <>
                    <option value="USD">USD - دلار آمریکا</option>
                    <option value="EUR">EUR - یورو</option>
                    <option value="CNY">CNY - یوان چین</option>
                    <option value="AED">AED - درهم امارات</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">{isFa ? 'به ارز تسویه' : 'To'}</label>
              <select
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                {Object.keys(rates).length > 0 ? (
                  Object.keys(rates).map((c) => (
                    <option key={c} value={c}>{c} - {rates[c]?.nameFa || c}</option>
                  ))
                ) : (
                  <>
                    <option value="AED">AED - درهم امارات</option>
                    <option value="CNY">CNY - یوان چین</option>
                    <option value="TRY">TRY - لیر ترکیه</option>
                    <option value="EUR">EUR - یورو</option>
                    <option value="IRR">IRR - ریال ایران</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-200/80 space-y-2">
            <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
              <span>{isFa ? 'معادل ارزش تسویه' : 'Converted Value'}</span>
              <button
                type="button"
                onClick={() => handleCopy(String(convertedResult || ''), 'calc')}
                className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 text-[10px] font-bold cursor-pointer"
              >
                {copiedCode === 'calc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'calc' ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'کپی رقم' : 'Copy')}</span>
              </button>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{convertedResult ? convertedResult.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '...'}</span>
              <span className="text-sm font-bold text-emerald-700">{targetCurrency}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isFa ? `بر پایه نرخ مبادلاتی رسمی ۱ ${baseCurrency} = ${(rates[targetCurrency]?.rate || 1).toLocaleString()} ${targetCurrency}` : `Calculated with 1 ${baseCurrency} = ${rates[targetCurrency]?.rate || 1} ${targetCurrency}`}
            </p>
          </div>

          {/* Proforma Tip */}
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              {isFa 
                ? 'نکته ارزی تجاری: نرخ درهم امارات (AED) با ضریب ثابت ۳.۶۷۲۵ به دلار پگ شده است و یکی از باثبات‌ترین ارزهای فاکتورینگ در منطقه خلیج فارس به شمار می‌رود.'
                : 'Commercial note: AED is pegged to USD at 3.6725, providing zero currency volatility risk for GCC proforma invoicing.'}
            </p>
          </div>
        </div>

        {/* Currency Rates Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>{isFa ? 'تابلوی نرخ ارزهای کلیدی تجارت خارجی' : 'Major Trade Currencies Matrix'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {isFa ? 'ارزش یک واحد ارز بر مبنای دلار آمریکا (USD)' : 'Exchange rates per 1 US Dollar (USD)'}
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {Object.keys(rates).length} {isFa ? 'ارز فعال' : 'Currencies'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.entries(rates) as [string, ExchangeRateItem][]).map(([code, item]) => {
              const convertedEquivalent = amount * (item.rate || 1);
              return (
                <div 
                  key={code}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all bg-slate-50/50 hover:bg-white space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono">
                        {code.slice(0, 3)}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{code}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{item.symbol}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[110px]">
                          {isFa ? item.nameFa : item.name}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleCopy(`${item.rate}`, code)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                      title={isFa ? 'کپی نرخ' : 'Copy rate'}
                    >
                      {copiedCode === code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-200/60 flex items-baseline justify-between text-xs font-mono">
                    <span className="text-slate-500 text-[10px]">{isFa ? 'نرخ برابری:' : 'Rate:'}</span>
                    <span className="font-bold text-slate-900">
                      {item.rate >= 100 ? item.rate.toLocaleString(undefined, { maximumFractionDigits: 1 }) : item.rate.toFixed(4)}
                    </span>
                  </div>

                  {amount > 0 && (
                    <div className="bg-white px-2 py-1 rounded-md border border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 text-[9px]">{isFa ? 'معادل مبلغ:' : 'Total:'}</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {convertedEquivalent.toLocaleString(undefined, { maximumFractionDigits: 0 })} {code}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
