import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  AlertTriangle, 
  Ship, 
  Clock, 
  Building2, 
  RefreshCw, 
  CheckCircle, 
  Info,
  Calendar,
  ShieldAlert,
  Search
} from 'lucide-react';
import { fetchCountryHolidays, TradeHolidayItem, getStoredNinjaKey } from '../../services/ninjaService';

interface Props {
  language: 'fa' | 'en';
}

interface CountryOption {
  code: string;
  nameEn: string;
  nameFa: string;
  flag: string;
  hub: string;
}

const TRADE_PARTNERS: CountryOption[] = [
  { code: 'CN', nameEn: 'China', nameFa: 'چین', flag: '🇨🇳', hub: 'بزرگترین صادرکننده صنعتی و شریک اول تجاری' },
  { code: 'AE', nameEn: 'United Arab Emirates', nameFa: 'امارات متحده عربی', flag: '🇦🇪', hub: 'هاب مالی، ترانشیپ و بازصادرات منطقه' },
  { code: 'TR', nameEn: 'Turkey', nameFa: 'ترکیه', flag: '🇹🇷', hub: 'دروازه ترانزیت زمینی اروپا و خاورمیانه' },
  { code: 'DE', nameEn: 'Germany', nameFa: 'آلمان', flag: '🇩🇪', hub: 'قطب ماشین‌آلات صنعتی و فناوری اتحادیه اروپا' },
  { code: 'IN', nameEn: 'India', nameFa: 'هند', flag: '🇮🇳', hub: 'تأمین‌کننده محصولات دارویی، کشاورزی و پتروشیمی' },
  { code: 'RU', nameEn: 'Russia', nameFa: 'روسیه', flag: '🇷🇺', hub: 'کریدور شمال-جنوب و بازار کالاهای اساسی اوراسیا' },
  { code: 'BR', nameEn: 'Brazil', nameFa: 'برزیل', flag: '🇧🇷', hub: 'تأمین‌کننده بزرگ نهاده‌های دامی و غلات بریکس' },
  { code: 'KR', nameEn: 'South Korea', nameFa: 'کره جنوبی', flag: '🇰🇷', hub: 'صنایع الکترونیک، فولاد و تجهیزات پیشرفته' },
  { code: 'SA', nameEn: 'Saudi Arabia', nameFa: 'عربستان سعودی', flag: '🇸🇦', hub: 'بزرگترین اقتصاد خلیج فارس' },
  { code: 'IT', nameEn: 'Italy', nameFa: 'ایتالیا', flag: '🇮🇹', hub: 'ماشین‌آلات بسته‌بندی، چرم و کاشی' },
];

export const NinjaTradeHolidaysView: React.FC<Props> = ({ language }) => {
  const isFa = language === 'fa';
  const [selectedCountry, setSelectedCountry] = useState('CN');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [holidays, setHolidays] = useState<TradeHolidayItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'severe' | 'public'>('all');

  const currentPartner = TRADE_PARTNERS.find(p => p.code === selectedCountry) || TRADE_PARTNERS[0];

  const loadHolidays = async () => {
    setIsLoading(true);
    try {
      const res = await fetchCountryHolidays(selectedCountry, selectedYear);
      setHolidays(res.holidays || []);
      setIsLive(res.isLive);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, [selectedCountry, selectedYear]);

  const filteredList = holidays.filter(h => {
    if (filterType === 'severe') {
      return h.type?.includes('MAJOR') || h.type?.includes('SHUTDOWN') || (h.daysOff && h.daysOff >= 3);
    }
    return true;
  });

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <CalendarDays className="w-5 h-5" />
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isLive 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {isLive ? (isFa ? '🟢 داده‌های زنده API Ninjas' : '🟢 Live Holidays Feed') : (isFa ? '🟡 تقویم لجستیکی شرکا' : '🟡 Logistics Benchmark')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {isFa ? 'دیده‌بان تعطیلات رسمی و تقویم لجستیک شرکای تجاری' : 'Trade Holidays & Port Disruption Radar'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isFa 
                ? 'پیش‌بینی زمان تعطیلی گمرکات، بنادر تخلیه و بانک‌های کشورهای طرف قرارداد جهت مدیریت سررسید اعتبارات اسنادی (L/C)، جلوگیری از جریمه دموراژ (Demurrage) و زمان‌بندی بارگیری کانتینرها.'
                : 'Monitor official bank and port holidays across major trading nations to prevent demurrage penalties, cargo congestion, and L/C expiration lapses.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadHolidays}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span>{isFa ? 'بروزرسانی تقویم' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Select Country & Year & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Country Picker */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>{isFa ? 'کشور طرف تجاری:' : 'Partner Country:'}</span>
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            {TRADE_PARTNERS.map((p) => (
              <option key={p.code} value={p.code}>
                {p.flag} {isFa ? p.nameFa : p.nameEn} ({p.code})
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">{isFa ? 'سال تقویمی:' : 'Year:'}</label>
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            {[2025, 2026, 2027].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isFa ? 'همه رویدادها' : 'All Events'} ({holidays.length})
          </button>
          <button
            onClick={() => setFilterType('severe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'severe'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isFa ? 'تعطیلات طولانی و ریسک بالا' : 'Major Disruptions'}</span>
          </button>
        </div>
      </div>

      {/* Country Logistics Profile Banner */}
      <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-blue-950">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{currentPartner.flag}</span>
          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              <span>{isFa ? currentPartner.nameFa : currentPartner.nameEn}</span>
              <span className="text-xs font-normal text-blue-700 font-mono">ISO: {currentPartner.code}</span>
            </div>
            <p className="text-xs text-blue-800 mt-0.5">{currentPartner.hub}</p>
          </div>
        </div>

        <div className="bg-white px-3.5 py-2 rounded-xl border border-blue-200 text-xs font-semibold text-blue-900 flex items-center gap-2 shadow-xs">
          <Ship className="w-4 h-4 text-blue-600" />
          <span>
            {isFa ? 'توصیه لجستیکی:' : 'Port Guidance:'}{' '}
            <strong className="text-blue-950">
              {selectedCountry === 'CN' 
                ? 'رزرو کانتینر حداقل ۴ هفته قبل از سال نو چینی ضروری است.' 
                : 'هماهنگی ترخیص پیش از تعطیلات اعیاد رسمی جهت اجتناب از معطلی در اسکله.'}
            </strong>
          </span>
        </div>
      </div>

      {/* Holidays Timeline List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>{isFa ? `تقویم تعطیلات ${currentPartner.nameFa} در سال ${selectedYear}` : `${currentPartner.nameEn} Holiday Calendar (${selectedYear})`}</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {filteredList.length} {isFa ? 'مورد ثبت شده' : 'Items'}
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            {isFa ? 'موردی برای نمایش یافت نشد.' : 'No holidays recorded for this filter.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredList.map((item, idx) => {
              const isSevere = item.type?.includes('SHUTDOWN') || item.type?.includes('MAJOR') || (item.daysOff && item.daysOff >= 3);
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                    isSevere
                      ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {item.name}
                      </h4>
                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.date}</span>
                        {item.daysOff && (
                          <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px] font-semibold">
                            {item.daysOff} {isFa ? 'روز تعطیلی' : 'days off'}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      isSevere
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {isSevere ? (isFa ? '⚠️ توقف عمده بنادر/کارخانجات' : 'Major Port Shutdown') : (isFa ? 'تعطیل رسمی' : 'Public Holiday')}
                    </span>
                  </div>

                  {item.impact && (
                    <div className="p-2 rounded-lg bg-white/80 border border-slate-200/70 text-[11px] text-slate-700 flex items-center gap-2">
                      <ShieldAlert className={`w-3.5 h-3.5 shrink-0 ${isSevere ? 'text-rose-600' : 'text-blue-600'}`} />
                      <span>{item.impact}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
