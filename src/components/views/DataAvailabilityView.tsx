import React, { useState } from 'react';
import { fetchDataAvailability } from '../../services/comtradeService';
import { POPULAR_REPORTERS, AVAILABLE_YEARS } from '../../data/referenceData';
import { CheckCircle2, AlertCircle, RefreshCw, Database, Calendar, Filter, Search, Layers, Clock } from 'lucide-react';

interface DataAvailabilityViewProps {
  language: 'fa' | 'en';
}

export const DataAvailabilityView: React.FC<DataAvailabilityViewProps> = ({ language }) => {
  const isFa = language === 'fa';
  const [selectedReporter, setSelectedReporter] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('2023');
  const [isTariffline, setIsTariffline] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [daRecords, setDaRecords] = useState<any[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  const loadData = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);
    try {
      const response = await fetchDataAvailability({
        reporterCode: selectedReporter || undefined,
        period: selectedPeriod,
        typeCode: 'C',
        freqCode: 'A',
        clCode: 'HS',
        isTariffline
      });
      if (response && response.data) {
        setDaRecords(response.data);
      } else {
        setDaRecords([]);
      }
    } catch (err: any) {
      setError(err.message || (isFa ? 'خطا در دریافت وضعیت انتشار داده‌ها از API سازمان ملل' : 'Failed to fetch Data Availability'));
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = daRecords.filter((r: any) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    const reporter = String(r.reporterDesc || r.reporterCode || '').toLowerCase();
    return reporter.includes(term);
  });

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'ماتریس در دسترس بودن داده‌های گمرکی (Data Availability)' : 'UN Data Availability Matrix'}
            </h1>
            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              /public/v1/getDA
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa 
              ? 'بررسی شفافیت آماری و اطلاع از اینکه هر کشور تا چه سال، ماه و در چه سطحی داده‌های گمرکی خود را به دبیرخانه سازمان ملل تحویل داده است.'
              : 'Audit data availability and reporting coverage across world economies, years, and tariffline publishing completeness.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Specific Country */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'فیلتر کشور' : 'Country'}</label>
            <select
              id="da-reporter-select"
              value={selectedReporter}
              onChange={(e) => setSelectedReporter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">{isFa ? 'همه کشورهای گزارش‌دهنده' : 'All Reporting Countries'}</option>
              {POPULAR_REPORTERS.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.flag} {isFa ? c.nameFa : c.nameEn}</option>
              ))}
            </select>
          </div>

          {/* Period */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'سال' : 'Year'}</label>
            <select
              id="da-period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {AVAILABLE_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Mode Toggle (Standard vs Tariffline) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{isFa ? 'سطح گزارش' : 'Granularity'}</label>
            <button
              type="button"
              id="da-tariffline-toggle"
              onClick={() => setIsTariffline(!isTariffline)}
              className={`text-xs px-3 py-2 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                isTariffline ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isTariffline ? (isFa ? 'سطح تعرفه‌ای (Tariffline)' : 'Tariffline DA') : (isFa ? 'استاندارد (Standard DA)' : 'Standard DA')}</span>
            </button>
          </div>

          <div className="self-end">
            <button
              id="da-refresh-btn"
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isFa ? 'استعلام' : 'Query'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Initial Ready State */}
      {!hasExecuted && !loading && daRecords.length === 0 && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده استعلام وضعیت داده‌های گمرکی کشورها' : 'Ready to Query Global Data Availability'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'سال آماری و سطح گزارش را در کادر بالا انتخاب کرده و روی دکمه «استعلام» کلیک کنید.'
              : 'Select period and granularity above, then click "Query" to view submission status.'}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{isFa ? 'پیام سرور:' : 'Server message:'}</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Search Bar & Grid */}
      {hasExecuted && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
              <input
                type="text"
                id="da-search-input"
                placeholder={isFa ? 'جستجو در نام کشورها...' : 'Search country...'}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 ps-9 pe-3 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {filteredRecords.length} {isFa ? 'کشور دارای داده در سال' : 'countries available for'} {selectedPeriod}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-3 text-start">{isFa ? 'کشور گزارش‌دهنده' : 'Reporter Country'}</th>
                <th className="p-3 text-start">{isFa ? 'کد کشور (M49)' : 'Country Code'}</th>
                <th className="p-3 text-start">{isFa ? 'سال/دوره' : 'Period'}</th>
                <th className="p-3 text-start">{isFa ? 'نوع و طبقه‌بندی' : 'Type & Classification'}</th>
                <th className="p-3 text-end">{isFa ? 'وضعیت دسترسی' : 'Availability Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-3 font-semibold text-slate-900">
                      {r.reporterDesc || r.reporterISO || `Country ${r.reporterCode}`}
                    </td>
                    <td className="p-3 font-mono text-slate-600">{r.reporterCode}</td>
                    <td className="p-3 font-mono text-slate-600">{r.period || selectedPeriod}</td>
                    <td className="p-3 font-mono text-slate-500">{r.typeCode || 'C'} / {r.clCode || 'HS'}</td>
                    <td className="p-3 text-end">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{isFa ? 'داده رسمی موجود است' : 'Official Data Available'}</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    {loading 
                      ? (isFa ? 'در حال دریافت ماتریس دسترسی...' : 'Loading Data Availability Matrix...') 
                      : (isFa ? 'هیچ رکوردی برای این فیلترها یافت نشد.' : 'No data availability records found for this query.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};
