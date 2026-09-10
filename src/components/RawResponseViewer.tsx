import React, { useState } from 'react';
import { ComtradeApiResponse } from '../types';
import { Terminal, Copy, Check, ChevronDown, ChevronUp, Clock, Globe, Shield } from 'lucide-react';

interface RawResponseViewerProps {
  response: ComtradeApiResponse | null;
  language: 'fa' | 'en';
}

export const RawResponseViewer: React.FC<RawResponseViewerProps> = ({ response, language }) => {
  const isFa = language === 'fa';
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!response) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 text-white overflow-hidden shadow-lg" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">
                {isFa ? 'بررسی پاسخ خام API سازمان ملل (UN Comtrade JSON Response)' : 'UN Comtrade Raw API Response & Inspector'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                Status {response.statusCode || 200}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {response.count || 0} records returned • {response.queryTimeMs || 0}ms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Expandable Body */}
      {isOpen && (
        <div className="p-5 border-t border-slate-800 space-y-3 bg-slate-950/80">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300">
              <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">{response.endpointUrl || 'https://comtradeapi.un.org/data/v1/get/...'}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFa ? `زمان پاسخ: ${response.queryTimeMs || 0} میلی‌ثانیه` : `Elapsed: ${response.queryTimeMs || 0}ms`}</span>
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'کپی کد JSON' : 'Copy JSON')}</span>
              </button>
            </div>
          </div>

          {/* JSON code block */}
          <div className="relative">
            <pre className="max-h-72 overflow-y-auto p-3.5 rounded-xl bg-black/70 border border-slate-800 text-[11px] font-mono text-sky-300 leading-relaxed scrollbar-thin">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
