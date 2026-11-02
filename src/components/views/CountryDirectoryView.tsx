import React, { useState } from 'react';
import { ALL_UN_COUNTRIES, searchCountries } from '../../data/allCountries';
import { fetchComtradeData } from '../../services/comtradeService';
import { formatUSD } from '../../lib/utils';
import { 
  Globe2, 
  Search, 
  ExternalLink, 
  TrendingUp, 
  Scale, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Building2, 
  Layers, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface CountryDirectoryViewProps {
  language: 'fa' | 'en';
}

export const CountryDirectoryView: React.FC<CountryDirectoryViewProps> = ({ language }) => {
  const isFa = language === 'fa';
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<any>(ALL_UN_COUNTRIES.find(c => c.id === 364) || ALL_UN_COUNTRIES[1]); // Default Iran
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [countryTradeRecords, setCountryTradeRecords] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('2023');

  const filteredCountries = searchCountries(searchTerm, language).filter(c => c.id !== 0);

  const loadCountryProfile = async (country: any = selectedCountry) => {
    if (country) setSelectedCountry(country);
    setHasExecuted(true);
    setLoadingProfile(true);
    try {
      // Query top commodities for this country (reporter)
      const res = await fetchComtradeData({
        reporterCode: String((country || selectedCountry).id),
        partnerCode: '0', // World
        period: selectedYear,
        cmdCode: 'TOTAL',
        flowCode: 'M,X',
        typeCode: 'C',
        freqCode: 'A',
        clCode: 'HS',
        includeDesc: true
      });

      if (res && res.data) {
        setCountryTradeRecords(res.data);
      } else {
        setCountryTradeRecords([]);
      }
    } catch {
      setCountryTradeRecords([]);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Summaries for selected country
  let totalExports = 0;
  let totalImports = 0;
  for (const r of countryTradeRecords) {
    const val = Number(r.primaryValue || 0);
    const flow = String(r.flowCode || '').toUpperCase();
    if (flow === 'X') totalExports += val;
    else if (flow === 'M') totalImports += val;
  }
  const netBal = totalExports - totalImports;

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
              {isFa ? 'دایره‌المعارف و پروفایل تجاری ۲۴۰+ کشور جهان' : 'Global 240+ Countries Trade Directory & Profiles'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa 
              ? 'جستجوی هوشمند در میان تمام کشورها و قلمروهای گمرکی جهان طبق استاندارد M49 سازمان ملل، مشاهده پروفایل بازرگانی، اقلام عمده و تراز تجاری.'
              : 'Search and inspect trade profiles, top export/import products, and balance statistics across all 240+ official UN M49 countries and customs territories.'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder={isFa ? 'جستجوی نام کشور، کد M49 یا ISO3...' : 'Search country name, M49, ISO3...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg py-2.5 ps-9 pe-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <Search className={`w-4 h-4 text-slate-400 absolute top-3 ${isFa ? 'right-3' : 'left-3'}`} />
        </div>
      </div>

      {/* Main Grid: Country List (Left/Right) & Profile Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Countries Grid (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
            <span>{isFa ? 'فهرست کشورهای جهان' : 'Countries Directory'}</span>
            <span className="font-mono">{filteredCountries.length} {isFa ? 'کشور یافت شد' : 'countries'}</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm max-h-[620px] overflow-y-auto space-y-1.5">
            {filteredCountries.map((c) => {
              const isSelected = selectedCountry?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => loadCountryProfile(c)}
                  className={`w-full text-start p-3 rounded-lg text-xs transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{c.flag}</span>
                    <div>
                      <div className="text-xs">{isFa ? c.nameFa : c.nameEn}</div>
                      <div className={`text-[10px] font-mono ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {c.nameEn} • {c.iso}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    M49: {c.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Country Profile (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedCountry ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              {/* Country Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-4xl p-2 bg-slate-50 rounded-xl border border-slate-100">{selectedCountry.flag}</span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {isFa ? selectedCountry.nameFa : selectedCountry.nameEn}
                    </h2>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      ISO: {selectedCountry.iso3} | UN ID: {selectedCountry.id}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      if (hasExecuted) {
                        loadCountryProfile(selectedCountry);
                      }
                    }}
                    className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {['2023', '2022', '2021', '2020', '2019'].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => loadCountryProfile(selectedCountry)}
                    disabled={loadingProfile}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingProfile ? 'animate-spin' : ''}`} />
                    <span>{isFa ? 'استعلام پروفایل' : 'Load Profile'}</span>
                  </button>
                </div>
              </div>

              {/* Initial Ready State or Profile Details */}
              {!hasExecuted && !loadingProfile && countryTradeRecords.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">
                    {isFa ? `آماده بارگذاری پروفایل تجاری ${isFa ? selectedCountry.nameFa : selectedCountry.nameEn}` : `Ready to Load ${selectedCountry.nameEn} Profile`}
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    {isFa
                      ? 'برای دریافت تراز تجاری و آمارهای رسمی این کشور روی دکمه «استعلام پروفایل» در بالا کلیک نمایید.'
                      : 'Click "Load Profile" above to retrieve trade balances and merchandise flows from UN Comtrade.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Profile Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isFa ? 'کل صادرات جهانی' : 'Total World Exports'}</div>
                      <div className="text-base font-bold text-emerald-700 font-mono mt-1">
                        {formatUSD(totalExports, language)}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isFa ? 'کل واردات جهانی' : 'Total World Imports'}</div>
                      <div className="text-base font-bold text-blue-700 font-mono mt-1">
                        {formatUSD(totalImports, language)}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isFa ? 'تراز تجاری کشور' : 'Trade Balance'}</div>
                      <div className={`text-base font-bold font-mono mt-1 ${netBal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {netBal >= 0 ? '+' : ''}{formatUSD(netBal, language)}
                      </div>
                    </div>
                  </div>

                  {/* Commodities Table for this country */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isFa ? `اقلام ثبت‌شده در گمرکات ${isFa ? selectedCountry.nameFa : selectedCountry.nameEn}` : `Reported Commodities & Flows`}</span>
                    </h4>

                    <div className="overflow-x-auto max-h-72 border border-slate-100 rounded-lg">
                      <table className="w-full text-xs text-start">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                            <th className="p-2.5 text-start">{isFa ? 'کد کالا' : 'HS Code'}</th>
                            <th className="p-2.5 text-start">{isFa ? 'شرح کالا' : 'Description'}</th>
                            <th className="p-2.5 text-start">{isFa ? 'جریان' : 'Flow'}</th>
                            <th className="p-2.5 text-end">{isFa ? 'ارزش (USD)' : 'Value'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {countryTradeRecords.length > 0 ? (
                            countryTradeRecords.map((r: any, idx: number) => {
                              const val = Number(r.primaryValue || 0);
                              const isExp = String(r.flowCode).toUpperCase() === 'X';

                              return (
                                <tr key={idx} className="hover:bg-slate-50/80">
                                  <td className="p-2.5 font-mono font-bold text-slate-800">{r.cmdCode}</td>
                                  <td className="p-2.5 text-slate-600 max-w-xs truncate">{r.cmdDesc || 'N/A'}</td>
                                  <td className="p-2.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      isExp ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                                    }`}>
                                      {r.flowDesc || (isExp ? 'Export' : 'Import')}
                                    </span>
                                  </td>
                                  <td className="p-2.5 font-mono font-bold text-end text-slate-900">{formatUSD(val, language)}</td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-slate-400">
                                {loadingProfile ? (isFa ? 'در حال دریافت پروفایل تجاری...' : 'Loading profile...') : (isFa ? 'برای این سال آماری ثبتی موجود نیست یا نیاز به بارگذاری است.' : 'No trade flows loaded for this year.')}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              {isFa ? 'یک کشور را از فهرست سمت راست انتخاب کنید.' : 'Select a country to view trade profile.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
