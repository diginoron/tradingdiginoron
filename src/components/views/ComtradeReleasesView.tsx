import React, { useState } from 'react';
import { fetchComtradeReleases } from '../../services/comtradeService';
import { Newspaper, RefreshCw, AlertCircle, Calendar, Database, CheckCircle2, Clock, Globe2, ShieldCheck } from 'lucide-react';

interface ComtradeReleasesViewProps {
  language: 'fa' | 'en';
}

export const ComtradeReleasesView: React.FC<ComtradeReleasesViewProps> = ({ language }) => {
  const isFa = language === 'fa';
  const [hasExecuted, setHasExecuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [releases, setReleases] = useState<any[]>([]);

  const loadData = async () => {
    setHasExecuted(true);
    setLoading(true);
    setError(null);
    try {
      const response = await fetchComtradeReleases();
      if (response && response.data) {
        setReleases(response.data);
      } else if (Array.isArray(response)) {
        setReleases(response);
      } else {
        setReleases([]);
      }
    } catch (err: any) {
      setError(err.message || (isFa ? 'خطا در دریافت فید انتشارات سازمان ملل' : 'Failed to fetch Comtrade releases'));
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
            <span className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Newspaper className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'آخرین انتشارات و به‌روزرسانی‌های سازمان ملل (Comtrade Releases)' : 'Live UN Comtrade Data Releases'}
            </h1>
            <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
              /public/v1/getComtradeReleases
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa 
              ? 'اطلاع لحظه‌ای از تازه‌ترین دیتاسِت‌ها، کشورهایی که داده‌های جدید بارگذاری کرده‌اند و نسخه‌های ویرایشی سازمان ملل متحد.'
              : 'Real-time feed of official UN Comtrade dataset releases, newly submitted country trade data, and version revisions.'}
          </p>
        </div>

        <div>
          <button
            id="releases-refresh-btn"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isFa ? 'دریافت آخرین انتشارات' : 'Fetch Latest Releases'}</span>
          </button>
        </div>
      </div>

      {/* Initial Ready State */}
      {!hasExecuted && !loading && releases.length === 0 && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
            <Newspaper className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isFa ? 'آماده دریافت فید زنده انتشارات و به‌روزرسانی‌های سازمان ملل' : 'Ready to Fetch UN Comtrade Releases'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isFa
              ? 'برای برقراری ارتباط با وب‌سرویس سازمان ملل و مشاهده آخرین بسته‌های داده روی دکمه «دریافت آخرین انتشارات» در بالا کلیک کنید.'
              : 'Click "Fetch Latest Releases" in the top bar to retrieve live update feed from UN servers.'}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{isFa ? 'پیام سرور سازمان ملل:' : 'Server message:'}</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Feed List */}
      {hasExecuted && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-500" />
              <span>{isFa ? 'فهرست آخرین تغییرات و انتشارات رسمی' : 'Official Publication Stream'}</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              {releases.length} {isFa ? 'انتشار ثبتی' : 'releases'}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {releases.length > 0 ? (
              releases.map((item: any, idx: number) => (
                <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-lg px-2 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500 inline-block"></span>
                      <span className="font-bold text-xs text-slate-900">
                        {item.datasetName || item.reporterDesc || (isFa ? `دیتاسِت شناسه ${item.releaseId || idx + 1}` : `Dataset Release #${idx + 1}`)}
                      </span>
                      {item.classification && (
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {item.classification}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 ps-4">
                      {item.description || (isFa ? 'به‌روزرسانی داده‌های تجارت رسمی و کدهای گمرکی ثبت شده در پایگاه UN Comtrade.' : 'Official merchandise and tariffline data submitted to UN Comtrade database.')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 ps-4 sm:ps-0 shrink-0">
                    {item.refPeriod && (
                      <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px]">
                        {item.refPeriod}
                      </span>
                    )}
                    {item.releaseDate && (
                      <span className="text-[11px] font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{item.releaseDate}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                {loading 
                  ? (isFa ? 'در حال دریافت آخرین انتشارات سازمان ملل...' : 'Fetching latest UN publications...')
                  : (isFa ? 'داده‌های زنده انتشارات دریافت شد یا سرور در وضعیت انتظار است.' : 'No release items returned from endpoint.')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
