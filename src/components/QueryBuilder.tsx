import React, { useState } from 'react';
import { QueryParams } from '../types';
import { 
  POPULAR_REPORTERS, 
  POPULAR_PARTNERS, 
  POPULAR_COMMODITIES, 
  FLOW_CODES, 
  AVAILABLE_YEARS 
} from '../data/referenceData';
import { 
  SlidersHorizontal, 
  Play, 
  Code, 
  Calendar, 
  Package, 
  ArrowLeftRight, 
  Globe2, 
  Filter,
  RefreshCw
} from 'lucide-react';

interface QueryBuilderProps {
  queryParams: QueryParams;
  onChangeParams: (params: QueryParams) => void;
  onSubmitQuery: () => void;
  isLoading: boolean;
  language: 'fa' | 'en';
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({
  queryParams,
  onChangeParams,
  onSubmitQuery,
  isLoading,
  language,
}) => {
  const isFa = language === 'fa';
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customCmdInput, setCustomCmdInput] = useState('');

  // Selected periods as array
  const selectedYears = queryParams.period.split(',').map(s => s.trim()).filter(Boolean);

  const toggleYear = (year: string) => {
    let newYears: string[];
    if (selectedYears.includes(year)) {
      newYears = selectedYears.filter(y => y !== year);
      if (newYears.length === 0) newYears = [year]; // Keep at least one
    } else {
      newYears = [...selectedYears, year].sort((a, b) => Number(a) - Number(b));
    }
    onChangeParams({ ...queryParams, period: newYears.join(',') });
  };

  const handleCustomCmdApply = () => {
    if (customCmdInput.trim()) {
      onChangeParams({ ...queryParams, cmdCode: customCmdInput.trim().toUpperCase() });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Section Heading with Blue Indicator */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-500 rounded-full inline-block"></span>
          <span>{isFa ? 'استعلام مستقیم داده‌های تجارت بین‌الملل (UN Comtrade)' : 'Direct UN Comtrade Trade Query'}</span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3 h-3 text-slate-500" />
            <span>{showAdvanced ? (isFa ? 'تنظیمات پایه' : 'Basic') : (isFa ? 'تنظیمات پیشرفته' : 'Advanced')}</span>
          </button>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={(e) => { e.preventDefault(); onSubmitQuery(); }} className="space-y-4">
        {/* Main Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Reporter Area */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
              {isFa ? 'کشور گزارش‌دهنده (Reporter Area)' : 'Reporter Area'}
            </label>
            <select
              id="reporter-select"
              value={queryParams.reporterCode}
              onChange={(e) => onChangeParams({ ...queryParams, reporterCode: e.target.value })}
              className="w-full border border-slate-200 rounded-md p-2 text-xs sm:text-sm bg-slate-50 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              {POPULAR_REPORTERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.flag} {isFa ? r.nameFa : r.nameEn} ({r.iso})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Partner Country */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
              {isFa ? 'کشور طرف تجاری (Partner Area)' : 'Partner Area'}
            </label>
            <select
              id="partner-select"
              value={queryParams.partnerCode}
              onChange={(e) => onChangeParams({ ...queryParams, partnerCode: e.target.value })}
              className="w-full border border-slate-200 rounded-md p-2 text-xs sm:text-sm bg-slate-50 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              {POPULAR_PARTNERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.flag} {isFa ? p.nameFa : p.nameEn} {p.id !== 0 ? `(${p.iso})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Commodity / HS Code */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
              {isFa ? 'کد کالا (Commodity / HS Code)' : 'Commodity Code'}
            </label>
            <select
              id="commodity-select"
              value={queryParams.cmdCode}
              onChange={(e) => onChangeParams({ ...queryParams, cmdCode: e.target.value })}
              className="w-full border border-slate-200 rounded-md p-2 text-xs sm:text-sm bg-slate-50 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              {POPULAR_COMMODITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.id}] {isFa ? c.nameFa : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Trade Flow */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
              {isFa ? 'جریان تجاری (Trade Flow)' : 'Trade Flow'}
            </label>
            <select
              id="flow-select"
              value={queryParams.flowCode}
              onChange={(e) => onChangeParams({ ...queryParams, flowCode: e.target.value })}
              className="w-full border border-slate-200 rounded-md p-2 text-xs sm:text-sm bg-slate-50 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              {FLOW_CODES.map((f) => (
                <option key={f.id} value={f.code}>
                  {isFa ? f.nameFa : f.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeframe & Period Selector */}
        <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                {isFa ? 'دوره زمانی (Period - چند ساله یا تک ساله):' : 'Period / Timeframe:'}
              </label>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span>{isFa ? 'انتخاب شده:' : 'Active:'}</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-blue-700">
                {queryParams.period}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {AVAILABLE_YEARS.map((yr) => {
              const isSelected = selectedYears.includes(yr);
              return (
                <button
                  key={yr}
                  type="button"
                  id={`year-btn-${yr}`}
                  onClick={() => toggleYear(yr)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {yr}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onChangeParams({ ...queryParams, period: '2020,2021,2022,2023' })}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1"
            >
              {isFa ? '۴ سال اخیر (۲۰۲۰-۲۰۲۳)' : 'Last 4 Years (2020-2023)'}
            </button>
            <button
              type="button"
              onClick={() => onChangeParams({ ...queryParams, period: '2023' })}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1"
            >
              {isFa ? 'فقط ۲۰۲۳' : '2023 Only'}
            </button>
          </div>
        </div>

        {/* Advanced options */}
        {showAdvanced && (
          <div className="p-4 bg-slate-50 rounded-md border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
                {isFa ? 'طبقه‌بندی استاندارد (Classification)' : 'Classification'}
              </label>
              <select
                value={queryParams.clCode}
                onChange={(e) => onChangeParams({ ...queryParams, clCode: e.target.value as any })}
                className="w-full border border-slate-200 rounded p-2 text-xs bg-white text-slate-900"
              >
                <option value="HS">HS - Harmonized System</option>
                <option value="SITC">SITC - Standard International Trade</option>
                <option value="BEC">BEC - Broad Economic Categories</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
                {isFa ? 'تواتر داده‌ها (Frequency)' : 'Frequency'}
              </label>
              <select
                value={queryParams.freqCode}
                onChange={(e) => onChangeParams({ ...queryParams, freqCode: e.target.value as any })}
                className="w-full border border-slate-200 rounded p-2 text-xs bg-white text-slate-900"
              >
                <option value="A">{isFa ? 'سالانه (Annual - A)' : 'Annual (A)'}</option>
                <option value="M">{isFa ? 'ماهانه (Monthly - M)' : 'Monthly (M)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
                {isFa ? 'کد اختصاصی کالا (Custom Code)' : 'Custom Commodity Code'}
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. 2701, 8542"
                  value={customCmdInput}
                  onChange={(e) => setCustomCmdInput(e.target.value)}
                  className="flex-1 border border-slate-200 rounded p-2 text-xs bg-white text-slate-900 font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={handleCustomCmdApply}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-900"
                >
                  {isFa ? 'اعمال' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Execute Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            id="submit-query-btn"
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isFa ? 'در حال ارسال درخواست...' : 'Executing Query...'}</span>
              </>
            ) : (
              <>
                <Play className={`w-3.5 h-3.5 fill-white ${isFa ? 'rotate-180' : ''}`} />
                <span>{isFa ? 'اجرای استعلام سازمان ملل' : 'Execute Query'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

