import React from 'react';
import { PRESET_QUERIES } from '../data/referenceData';
import { PresetQuery } from '../types';
import { Sparkles, ArrowRight, Zap, TrendingUp, Box, Layers } from 'lucide-react';

interface PresetSelectorProps {
  language: 'fa' | 'en';
  onSelectPreset: (preset: PresetQuery) => void;
  activePresetId?: string;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  language,
  onSelectPreset,
  activePresetId,
}) => {
  const isFa = language === 'fa';

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bilateral': return <Layers className="w-3.5 h-3.5 text-blue-500" />;
      case 'commodity': return <Box className="w-3.5 h-3.5 text-amber-500" />;
      case 'trend': return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
      default: return <Zap className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm" dir={isFa ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-500 rounded-full inline-block"></span>
          <span>{isFa ? 'الگوها و نمونه‌های آماده (اجرا با یک کلیک)' : 'Curated Trade Presets (1-Click Run)'}</span>
        </h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {PRESET_QUERIES.length} {isFa ? 'الگوی منتخب' : 'Presets Available'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {PRESET_QUERIES.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              id={`preset-btn-${preset.id}`}
              onClick={() => onSelectPreset(preset)}
              className={`text-start p-3 rounded-lg border text-xs transition-all flex flex-col justify-between group ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/30'
                  : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`p-1 rounded ${isSelected ? 'bg-blue-700/60 text-white' : 'bg-white border border-slate-200'}`}>
                    {getCategoryIcon(preset.category)}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-blue-500/50 text-white' : 'bg-white border border-slate-200 text-slate-500'
                  }`}>
                    {preset.params.period.includes(',') ? `${preset.params.period.split(',').length} Yrs` : preset.params.period}
                  </span>
                </div>
                <h3 className={`font-semibold line-clamp-1 text-xs ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {isFa ? preset.titleFa : preset.titleEn}
                </h3>
              </div>

              <div className="mt-2.5 pt-1.5 border-t border-slate-200/40 flex items-center justify-between text-[11px]">
                <span className={`truncate text-[10px] font-mono ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                  {preset.params.cmdCode}
                </span>
                <span className={`font-semibold flex items-center gap-0.5 ${
                  isSelected ? 'text-white' : 'text-blue-600 group-hover:translate-x-0.5 transition-transform'
                }`}>
                  {isFa ? 'اجرا' : 'Run'}
                  <ArrowRight className={`w-3 h-3 ${isFa ? 'rotate-180' : ''}`} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

