import React from 'react';
import { Zap, Database, ArrowRight, ShieldCheck, Coins } from 'lucide-react';

interface ParameterItem {
  label: string;
  value: string;
}

interface OnDemandQueryBannerProps {
  title: string;
  description: string;
  buttonText: string;
  loading: boolean;
  onExecute: () => void;
  paramsSummary: ParameterItem[];
  language: 'fa' | 'en';
  badgeText?: string;
  icon?: React.ReactNode;
}

export const OnDemandQueryBanner: React.FC<OnDemandQueryBannerProps> = ({
  title,
  description,
  buttonText,
  loading,
  onExecute,
  paramsSummary,
  language,
  badgeText,
  icon,
}) => {
  const isFa = language === 'fa';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-3xl mx-auto my-6 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-xs">
        {icon || <Database className="w-8 h-8" />}
      </div>

      <div className="space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
          <Coins className="w-3.5 h-3.5 text-amber-600" />
          <span>{badgeText || (isFa ? 'استعلام درخواستی (بر اساس تقاضا)' : 'On-Demand Query')}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>

      {/* Selected Parameters summary */}
      {paramsSummary.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-lg mx-auto">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            {isFa ? 'پارامترهای آماده برای استعلام:' : 'Query Parameters Ready:'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {paramsSummary.map((item, idx) => (
              <div key={idx} className="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs text-start">
                <div className="text-[10px] text-slate-400 font-medium">{item.label}</div>
                <div className="font-semibold text-slate-800 truncate" title={item.value}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onExecute}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 text-sm cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{isFa ? 'در حال واکشی و پردازش داده‌ها...' : 'Fetching & Processing...'}</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{buttonText}</span>
              <ArrowRight className={`w-4 h-4 ${isFa ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>
          {isFa
            ? 'داده‌ها به صورت زنده و بدون مصرف مکرر کوئری پس از تأیید شما بارگذاری می‌شوند.'
            : 'Live UN Comtrade data is fetched only upon explicit user request.'}
        </span>
      </div>
    </div>
  );
};
