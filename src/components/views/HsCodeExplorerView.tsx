import React, { useState } from 'react';
import { ALL_HS_CHAPTERS, searchHsChapters, HsChapter } from '../../data/hsChapters';
import { 
  Package, 
  Search, 
  Tag, 
  ArrowRight, 
  ExternalLink, 
  Layers, 
  Zap, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

interface HsCodeExplorerViewProps {
  language: 'fa' | 'en';
  onSelectChapter?: (code: string) => void;
}

export const HsCodeExplorerView: React.FC<HsCodeExplorerViewProps> = ({ language, onSelectChapter }) => {
  const isFa = language === 'fa';
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');

  const filteredChapters = searchHsChapters(searchTerm, language).filter(ch => {
    if (selectedSectionFilter === 'all') return true;
    return ch.section === selectedSectionFilter;
  });

  // Extract unique sections
  const uniqueSections = Array.from(new Set(ALL_HS_CHAPTERS.map(c => c.section)));

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isFa ? 'دیده‌بان جامع ۹۹ فصل کد کالای گمرکی (HS Tariff Code Explorer)' : 'Comprehensive 99 HS Chapters Tariff Directory'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isFa 
              ? 'دسترسی کامل به تمام فصول سیستم هماهنگ‌شده (Harmonized System) گمرک جهانی، تفکیک ۲۱ بخش استاندارد، و جستجوی کلمات کلیدی فارسی و انگلیسی.'
              : 'Browse all 99 WCO Harmonized System chapters categorized across 21 standard sections with bilingual search.'}
          </p>
        </div>

        {/* Search */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder={isFa ? 'جستجوی نام کالا (مثلاً پسته، نفت، آهن، خودرو)...' : 'Search commodity (e.g. oil, wheat, steel)...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg py-2.5 ps-9 pe-4 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
          <Search className={`w-4 h-4 text-slate-400 absolute top-3 ${isFa ? 'right-3' : 'left-3'}`} />
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChapters.map((ch: HsChapter) => (
          <div 
            key={ch.code}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md">
                  فصل {ch.code} (HS-{ch.code})
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {ch.section}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                {isFa ? ch.nameFa : ch.nameEn}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {ch.nameEn}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {isFa ? ch.sectionFa : ch.section}
              </span>
              {onSelectChapter && (
                <button
                  onClick={() => onSelectChapter(ch.code)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700"
                >
                  <span>{isFa ? 'تحلیل در میزکار' : 'Analyze Flow'}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isFa ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
