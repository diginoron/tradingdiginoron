import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight, 
  Scale, 
  FileText, 
  Ship, 
  Truck, 
  Plane, 
  Search, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink, 
  Info, 
  Compass, 
  RotateCcw,
  Anchor,
  Box,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Calculator
} from 'lucide-react';
import { 
  INCOTERMS_2020_RULES, 
  IncotermDefinition 
} from '../../data/incotermsData';
import { 
  INCOTERMS_2020_KEY_CHANGES, 
  COMMON_TRADE_PITFALLS, 
  INCOTERMS_GLOSSARY, 
  SAMPLE_CONTRACT_CLAUSES,
  TradePitfall,
  IncotermsUpdatePoint
} from '../../data/incotermsGuideData';

interface IncotermsGuideViewProps {
  language: 'fa' | 'en';
  onNavigateToCalculator?: () => void;
}

export const IncotermsGuideView: React.FC<IncotermsGuideViewProps> = ({
  language,
  onNavigateToCalculator
}) => {
  const isFa = language === 'fa';

  // Sub-tabs in the Incoterms Guide
  const [activeTab, setActiveTab] = useState<
    'rules_explorer' | 'key_changes' | 'decision_wizard' | 'comparison_matrix' | 'pitfalls' | 'contract_clauses' | 'glossary'
  >('rules_explorer');

  // Rules Explorer state
  const [selectedRuleCode, setSelectedRuleCode] = useState<IncotermDefinition['code']>('FCA');
  const [ruleFilterCategory, setRuleFilterCategory] = useState<'all' | 'multimodal' | 'sea_only'>('all');
  const [ruleGroupFilter, setRuleGroupFilter] = useState<'all' | 'E' | 'F' | 'C' | 'D'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Comparator state
  const [compareTermA, setCompareTermA] = useState<IncotermDefinition['code']>('FCA');
  const [compareTermB, setCompareTermB] = useState<IncotermDefinition['code']>('FOB');

  // Copy notification state
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Selected Rule object
  const selectedRule = useMemo(() => {
    return INCOTERMS_2020_RULES.find(r => r.code === selectedRuleCode) || INCOTERMS_2020_RULES[1];
  }, [selectedRuleCode]);

  // Filtered Rules list
  const filteredRules = useMemo(() => {
    return INCOTERMS_2020_RULES.filter(rule => {
      // Category filter
      if (ruleFilterCategory === 'multimodal' && rule.category !== 'Any Mode (Multimodal)') return false;
      if (ruleFilterCategory === 'sea_only' && rule.category !== 'Sea & Inland Waterway') return false;

      // Group filter (E, F, C, D)
      if (ruleGroupFilter !== 'all' && !rule.code.startsWith(ruleGroupFilter)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = rule.code.toLowerCase().includes(q);
        const matchesNameEn = rule.nameEn.toLowerCase().includes(q);
        const matchesNameFa = rule.nameFa.toLowerCase().includes(q);
        const matchesSummary = rule.summaryFa.toLowerCase().includes(q);
        const matchesTip = rule.proTipFa.toLowerCase().includes(q);
        return matchesCode || matchesNameEn || matchesNameFa || matchesSummary || matchesTip;
      }

      return true;
    });
  }, [ruleFilterCategory, ruleGroupFilter, searchQuery]);

  // ==========================================
  // DECISION WIZARD STATE & LOGIC
  // ==========================================
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [transportMode, setTransportMode] = useState<'sea' | 'multimodal' | 'air' | 'road_rail'>('sea');
  const [cargoType, setCargoType] = useState<'container' | 'bulk_breakbulk'>('container');
  const [freightPayer, setFreightPayer] = useState<'seller' | 'buyer'>('buyer');
  const [insurancePreference, setInsurancePreference] = useState<'seller_clause_a' | 'seller_clause_c' | 'buyer_covers'>('buyer_covers');
  const [destinationCustomsClearance, setDestinationCustomsClearance] = useState<'buyer_clears' | 'seller_clears' | 'seller_unloads'>('buyer_clears');

  // Reset wizard
  const handleResetWizard = () => {
    setWizardStep(1);
    setTransportMode('sea');
    setCargoType('container');
    setFreightPayer('buyer');
    setInsurancePreference('buyer_covers');
    setDestinationCustomsClearance('buyer_clears');
  };

  // Determine recommended term based on answers
  const wizardRecommendation = useMemo(() => {
    // Logic tree
    if (freightPayer === 'buyer') {
      // Buyer arranges freight -> Group E or F
      if (cargoType === 'container' || transportMode !== 'sea') {
        return {
          term: 'FCA' as IncotermDefinition['code'],
          name: 'Free Carrier (تحویل به حمل‌کننده در مبدأ)',
          rating: 'بهترین انتخاب قطعی (توصیه اکید ICC)',
          reasonFa: 'برای تمام بارهای کانتینری و چندوجهی که خریدار کرایه حمل اصلی را مدیریت می‌کند، ترم FCA استانداردترین گزینه است. این ترم ریسک‌های مربوط به انبارداری و کانتینریار را در مبدأ حل می‌کند و اجازه صدور بارنامه دریایی On-Board را نیز می‌دهد.',
          avoidFa: 'هرگز از FOB برای کانتینر استفاده نکنید، زیرا انتقال ریسک روی عرشه کشتی با تحویل در ترمینال کانتینری همخوانی ندارد.'
        };
      } else {
        // Sea non-containerized
        return {
          term: 'FOB' as IncotermDefinition['code'],
          name: 'Free on Board (تحویل روی عرشه کشتی در بندر مبدأ)',
          rating: 'استاندارد کالاهای فله دریایی',
          reasonFa: 'برای محموله‌های فله غیرکانتینری (سنگ‌آهن، غلات، نفت، لوله، قراضه) که کالا مستقیماً روی عرشه کشتی مهار می‌شود و خریدار کرایه کشتی را رزرو می‌کند.',
          avoidFa: 'فقط برای کالای فله بدون کانتینر استفاده شود.'
        };
      }
    } else {
      // Seller pays freight -> Group C or D
      if (destinationCustomsClearance === 'seller_clears') {
        return {
          term: 'DDP' as IncotermDefinition['code'],
          name: 'Delivered Duty Paid (تحویل در انبار مقصد با پرداخت گمرکی)',
          rating: 'حداکثر تعهد فروشنده (خدمات درب تا درب Door-to-Door)',
          reasonFa: 'فروشنده کلیه هزینه‌ها، کرایه، بیمه و تشریفات ترخیص وارداتی به همراه حقوق و عوارض گمرکی را در کشور خریدار متقبل می‌شود.',
          avoidFa: 'فروشنده حتماً باید ثبت شرکت یا کارت بازرگانی با امکان پرداخت مالیات بر ارزش افزوده در کشور مقصد داشته باشد.'
        };
      }

      if (destinationCustomsClearance === 'seller_unloads') {
        return {
          term: 'DPU' as IncotermDefinition['code'],
          name: 'Delivered at Place Unloaded (تحویل در مقصد تخلیه‌شده)',
          rating: 'تنها قاعده‌ای که تخلیه با فروشنده است (جایگزین DAT)',
          reasonFa: 'فروشنده بار را تا محل پروژه یا انبار مقصد حمل کرده و شخصاً با جرثقیل یا نیروی کار تخلیه می‌نماید. ترخیص وارداتی با خریدار است.',
          avoidFa: 'فروشنده در صورتی این ترم را بپذیرد که امکانات فیزیکی تخلیه ایمن در مقصد را داشته باشد.'
        };
      }

      // Seller pays freight to destination without clearing customs
      if (cargoType === 'container' || transportMode !== 'sea') {
        if (insurancePreference === 'seller_clause_a') {
          return {
            term: 'CIP' as IncotermDefinition['code'],
            name: 'Carriage and Insurance Paid To (کرایه و بیمه پرداخت‌شده تا مقصد)',
            rating: 'بهترین انتخاب برای کالاهای باارزش و های‌تک کانتینری',
            reasonFa: 'فروشنده کرایه حمل تا مقصد و بیمه‌نامه جامع کلوز A (تمام خطرات) را می‌پردازد. انتقال ریسک در مبدأ به اولین متصدی حمل انجام می‌شود.',
            avoidFa: 'طبق اینکوترمز ۲۰۲۰، در CIP فروشنده ملزم به کلوز A است، لذا برای کالاهای خام فله گران تمام می‌شود.'
          };
        } else {
          return {
            term: 'CPT' as IncotermDefinition['code'],
            name: 'Carriage Paid To (کرایه حمل پرداخت‌شده تا مقصد معین)',
            rating: 'معادل چندوجهی و کانتینری CFR دریایی',
            reasonFa: 'فروشنده کرایه حمل را تا شهر یا فرودگاه مقصد می‌پردازد و خریدار خودش بیمه‌نامه باربری را خریداری می‌کند.',
            avoidFa: 'خریدار باید به محض تحویل بار به اولین متصدی حمل در مبدأ، بیمه باربری خود را فعال کند چون ریسک مسیر با خریدار است.'
          };
        }
      } else {
        // Sea bulk
        if (insurancePreference === 'seller_clause_c' || insurancePreference === 'seller_clause_a') {
          return {
            term: 'CIF' as IncotermDefinition['code'],
            name: 'Cost, Insurance and Freight (ارزش، بیمه و کرایه حمل تا بندر مقصد)',
            rating: 'استاندارد جهانی کالاهای فله دریایی با بیمه حداقل',
            reasonFa: 'فروشنده کرایه دریایی و بیمه حداقل (کلوز C) را تا بندر تخلیه مقصد تقبل می‌کند. ریسک روی عرشه در مبدأ به خریدار منتقل می‌گردد.',
            avoidFa: 'برای بارهای کانتینری به هیچ عنوان استفاده نکنید؛ در کانتینرها از CIP استفاده شود.'
          };
        } else {
          return {
            term: 'CFR' as IncotermDefinition['code'],
            name: 'Cost and Freight (ارزش و کرایه حمل تا بندر مقصد)',
            rating: 'بارهای فله بدون الزام بیمه توسط فروشنده',
            reasonFa: 'فروشنده کرایه حمل دریایی را می‌پردازد ولی مسئولیتی در قبال بیمه ندارد. خریدار باید بیمه دریایی را پوشش دهد.',
            avoidFa: 'ریسک به محض بارگیری روی کشتی در مبدأ با خریدار است.'
          };
        }
      }
    }
  }, [freightPayer, cargoType, transportMode, insurancePreference, destinationCustomsClearance]);

  // Contract clause generator state
  const [contractTerm, setContractTerm] = useState<IncotermDefinition['code']>('FCA');
  const [contractNamedPlace, setContractNamedPlace] = useState('Shahid Rajaee Container Terminal, Bandar Abbas Port, Iran');
  const [contractLanguage, setContractLanguage] = useState<'both' | 'en' | 'fa'>('both');

  const generatedContractClause = useMemo(() => {
    const termDef = INCOTERMS_2020_RULES.find(r => r.code === contractTerm) || INCOTERMS_2020_RULES[1];
    const enText = `The goods shall be delivered on ${contractTerm} (${contractNamedPlace}) Incoterms® 2020. The Seller and Buyer shall adhere to their respective obligations under ICC rules, including the allocation of freight, customs clearances, terminal handling charges (THC), and insurance coverage where applicable.`;
    const faText = `تحویل کالا به صورت ${contractTerm} (${contractNamedPlace}) بر مبنای اینکوترمز ۲۰۲۰ (Incoterms® 2020) خواهد بود. طرفین متعهد به انجام تعهدات مقرر در قوانین اتاق بازرگانی بین‌المللی (ICC) شامل تفکیک هزینه‌های حمل، ترخیص‌های گمرکی مبدأ و مقصد، هزینه‌های ترمینال (THC) و پوشش بیمه‌ای می‌باشند.`;

    if (contractLanguage === 'en') return enText;
    if (contractLanguage === 'fa') return faText;
    return `${enText}\n\n[ترجمه فارسی استنادی]:\n${faText}`;
  }, [contractTerm, contractNamedPlace, contractLanguage]);

  return (
    <div className="space-y-6 pb-12" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-black tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isFa ? 'مرجع رسمی اتاق بازرگانی بین‌الملل (ICC)' : 'Official ICC Standards'}</span>
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-black tracking-wide flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isFa ? 'آخرین نکات و ویرایش ۲۰۲۰' : 'Incoterms® 2020 Edition'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{isFa ? 'راهنمای جامع اینکوترمز ۲۰۲۰' : 'Incoterms® 2020 Master Guide'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {isFa
                ? 'راهنمای عملیاتی و حقوقی ۱۱ قاعده رسمی اینکوترمز، آخرین تغییرات نسخه ۲۰۲۰، تفکیک دقیق نقاط انتقال ریسک و هزینه، مشاور هوشمند انتخاب ترم، و راهکارهای پیشگیری از خطاهای مهلک در تجارت بین‌الملل.'
                : 'Complete operational and legal guide to the 11 official Incoterms rules, key 2020 changes, risk and cost distribution matrix, interactive decision wizard, and essential international trade pitfalls.'}
            </p>
          </div>

          {/* Quick Jump Action Button */}
          {onNavigateToCalculator && (
            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={onNavigateToCalculator}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer border border-indigo-400/30"
              >
                <Calculator className="w-4 h-4" />
                <span>{isFa ? 'ماشین‌حساب قیمت تمام‌شده (Landed Cost)' : 'Landed Cost Calculator'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('rules_explorer')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'rules_explorer'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isFa ? 'کاوشگر ۱۱ قاعده اینکوترمز' : '11 Rules Explorer'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('key_changes')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'key_changes'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isFa ? 'آخرین تغییرات ۲۰۲۰ نسبت به ۲۰۱۰' : '2020 Key Changes'}</span>
          <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black">جدید</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('decision_wizard')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'decision_wizard'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{isFa ? 'انتخابگر هوشمند ترم مناسب' : 'Decision Wizard'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('comparison_matrix')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'comparison_matrix'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>{isFa ? 'ماتریس جامع مقایسه هزینه‌ها' : 'Cost & Risk Matrix'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pitfalls')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'pitfalls'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>{isFa ? 'اشتباهات مهلک و خطرات رایج' : 'Critical Pitfalls'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contract_clauses')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'contract_clauses'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isFa ? 'شروط حقوقی قرارداد و پروفرما' : 'Contract Clauses'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('glossary')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'glossary'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isFa ? 'واژه‌نامه و اصطلاحات کلیدی' : 'Trade Glossary'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 11 RULES EXPLORER & DEEP DIVE */}
      {/* ========================================================================= */}
      {activeTab === 'rules_explorer' && (
        <div className="space-y-6">
          {/* Controls Bar: Filters & Search */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Category Pill Filters */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <span className="text-slate-500 text-xs px-1">{isFa ? 'دسته‌بندی شیوه حمل:' : 'Category:'}</span>
              <button
                type="button"
                onClick={() => setRuleFilterCategory('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  ruleFilterCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isFa ? 'همه ۱۱ قاعده' : 'All 11 Rules'}
              </button>

              <button
                type="button"
                onClick={() => setRuleFilterCategory('multimodal')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  ruleFilterCategory === 'multimodal'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{isFa ? 'چندوجهی / ترکیبی (۷ ترم)' : 'Multimodal (7)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setRuleFilterCategory('sea_only')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  ruleFilterCategory === 'sea_only'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Ship className="w-3.5 h-3.5" />
                <span>{isFa ? 'صرفاً دریایی و آبراه (۴ ترم)' : 'Sea Only (4)'}</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className={`w-4 h-4 text-slate-400 absolute top-2.5 ${isFa ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isFa ? 'جستجو در نام ترم، بیمه، کانتینر...' : 'Search rules, insurance, terms...'}
                className={`w-full py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all ${
                  isFa ? 'pr-9 pl-3' : 'pl-9 pr-3'
                }`}
              />
            </div>
          </div>

          {/* Incoterms Selector Horizontal Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2">
            {INCOTERMS_2020_RULES.map((rule) => {
              const isSelected = selectedRuleCode === rule.code;
              const isSeaOnly = rule.category === 'Sea & Inland Waterway';
              return (
                <button
                  key={rule.code}
                  type="button"
                  onClick={() => setSelectedRuleCode(rule.code)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300'
                      : 'bg-white hover:bg-indigo-50/60 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                      isSelected 
                        ? 'bg-indigo-700 text-indigo-100' 
                        : isSeaOnly ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isSeaOnly ? 'دریایی' : 'چندوجهی'}
                    </span>
                    {rule.code === 'DPU' && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" title="قاعده جدید ۲۰۲۰" />
                    )}
                  </div>
                  <div className="text-base font-black tracking-wider my-0.5">{rule.code}</div>
                  <div className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {rule.nameEn.split(' ')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Rule Deep Dive Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header of the Selected Rule */}
            <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-black tracking-widest text-white shadow-inner">
                  {selectedRule.code}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-white">{selectedRule.nameFa}</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 font-bold">
                      {selectedRule.categoryFa}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-1">{selectedRule.nameEn}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyText(`Incoterms® 2020: ${selectedRule.code} - ${selectedRule.nameEn} (${selectedRule.nameFa})`, selectedRule.code)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                >
                  {copiedItem === selectedRule.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedItem === selectedRule.code ? (isFa ? 'کپی شد!' : 'Copied') : (isFa ? 'کپی نام ترم' : 'Copy')}</span>
                </button>
              </div>
            </div>

            {/* Quick Summary & Point of Risk Transfer */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Summary Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                    <Info className="w-4 h-4" />
                    <span>{isFa ? 'ماهیت و شرح کاربردی قاعده:' : 'Rule Summary:'}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{selectedRule.summaryFa}</p>
                </div>

                {/* Risk Transfer Point Card */}
                <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>{isFa ? 'نقطه دقیق انتقال ریسک خسارت (Risk Transfer Point):' : 'Risk Transfer Point:'}</span>
                  </div>
                  <p className="text-xs text-amber-950 font-semibold leading-relaxed">{selectedRule.riskTransferFa}</p>
                  <p className="text-[11px] text-amber-800 font-mono">{selectedRule.riskTransferEn}</p>
                </div>
              </div>

              {/* ICC Pro Tip & Crucial Advice */}
              <div className="bg-indigo-50 border border-indigo-200/70 rounded-2xl p-4 flex items-start gap-3 text-indigo-950">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-black text-indigo-900 block">
                    {isFa ? 'نکته کلیدی و توصیه حرفه‌ای اتاق بازرگانی بین‌الملل (ICC Pro Tip):' : 'ICC Expert Advice:'}
                  </span>
                  <p className="text-xs leading-relaxed font-medium">{selectedRule.proTipFa}</p>
                </div>
              </div>

              {/* Seller vs Buyer Obligations Two-Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Seller Obligations */}
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                    <h3 className="text-xs font-black text-emerald-950 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{isFa ? 'تعهدات و مسئولیت‌های فروشنده (Seller):' : 'Seller Obligations:'}</span>
                    </h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                      صادرکننده
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-emerald-950 font-medium">
                    {selectedRule.sellerObligationsFa.map((obligation, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                        <span>{obligation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Buyer Obligations */}
                <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                    <h3 className="text-xs font-black text-blue-950 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>{isFa ? 'تعهدات و مسئولیت‌های خریدار (Buyer):' : 'Buyer Obligations:'}</span>
                    </h3>
                    <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                      واردکننده
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-blue-950 font-medium">
                    {selectedRule.buyerObligationsFa.map((obligation, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                        <span>{obligation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Exact Cost Allocation Matrix for this Rule */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-indigo-600" />
                  <span>{isFa ? 'جدول تفکیک دقیق هزینه‌ها بر اساس ماده A9/B9 اینکوترمز:' : 'Article A9/B9 Cost Breakdown:'}</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">{isFa ? 'بسته‌بندی صادراتی' : 'Export Packaging'}</span>
                    <span className="mt-1.5 px-2 py-1 rounded-lg text-[10px] font-black text-center bg-emerald-100 text-emerald-800">
                      {isFa ? 'فروشنده' : 'Seller'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">{isFa ? 'بارگیری در مبدأ' : 'Origin Loading'}</span>
                    <span className={`mt-1.5 px-2 py-1 rounded-lg text-[10px] font-black text-center ${
                      selectedRule.costs.loadingOrigin ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedRule.costs.loadingOrigin ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">{isFa ? 'ترخیص صادرات' : 'Export Customs'}</span>
                    <span className={`mt-1.5 px-2 py-1 rounded-lg text-[10px] font-black text-center ${
                      selectedRule.costs.exportCustoms ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedRule.costs.exportCustoms ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">{isFa ? 'کرایه حمل اصلی' : 'Main Freight'}</span>
                    <span className={`mt-1.5 px-2 py-1 rounded-lg text-[10px] font-black text-center ${
                      selectedRule.costs.internationalFreight ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedRule.costs.internationalFreight ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">{isFa ? 'بیمه حمل باربری' : 'Cargo Insurance'}</span>
                    <span className={`mt-1.5 px-2 py-1 rounded-lg text-[10px] font-black text-center ${
                      selectedRule.costs.marineInsurance ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedRule.costs.marineInsurance ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">{isFa ? 'حقوق گمرکی واردات' : 'Import Customs'}</span>
                    <span className={`mt-1.5 px-2 py-1 rounded-lg text-[10px] font-black text-center ${
                      selectedRule.costs.importCustomsDuty ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedRule.costs.importCustomsDuty ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KEY 2020 CHANGES & LATEST ICC UPDATES */}
      {/* ========================================================================= */}
      {activeTab === 'key_changes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>{isFa ? 'آخرین تغییرات محوری اینکوترمز ۲۰۲۰ نسبت به ۲۰۱۰' : 'Incoterms 2020 Key Updates & ICC Changes'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isFa
                  ? 'بررسی ۶ تغییر استراتژیک مصوب اتاق بازرگانی بین‌الملل (ICC) شامل معرفی DPU، تفکیک کلوزهای بیمه، مکانیزم جدید FCA برای اعتبارات اسنادی، و الزامات نوین امنیتی.'
                  : 'Deep dive into the 6 major structural revisions introduced in Incoterms 2020 compared to the 2010 edition.'}
              </p>
            </div>

            {/* List of 6 Major Changes */}
            <div className="grid grid-cols-1 gap-5">
              {INCOTERMS_2020_KEY_CHANGES.map((change, idx) => (
                <div 
                  key={change.id}
                  className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">{change.titleFa}</h3>
                        <p className="text-[11px] font-mono text-slate-500">{change.titleEn}</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shrink-0 self-start sm:self-auto">
                      {change.badgeFa}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {change.summaryFa}
                  </p>

                  {/* Comparison Side-by-Side: Before 2020 vs Now 2020 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 space-y-1 text-rose-950">
                      <span className="font-bold text-[11px] text-rose-800 flex items-center gap-1">
                        <span>❌ {isFa ? 'در اینکوترمز ۲۰۱۰ (گذشته):' : 'Before 2020:'}</span>
                      </span>
                      <p className="text-xs leading-relaxed">{change.before2020Fa}</p>
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-1 text-emerald-950">
                      <span className="font-bold text-[11px] text-emerald-800 flex items-center gap-1">
                        <span>✅ {isFa ? 'در اینکوترمز ۲۰۲۰ (اکنون):' : 'Now in 2020:'}</span>
                      </span>
                      <p className="text-xs leading-relaxed font-medium">{change.now2020Fa}</p>
                    </div>
                  </div>

                  {/* Practical Advice Banner */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-amber-900">{isFa ? 'توصیه اجرایی برای بازرگانان:' : 'Practical Takeaway:'}</span>
                      <p className="mt-0.5 leading-relaxed">{change.practicalAdviceFa}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INTERACTIVE DECISION WIZARD */}
      {/* ========================================================================= */}
      {activeTab === 'decision_wizard' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                  Smart Decision Engine
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1">
                  {isFa ? 'انتخابگر و مشاور هوشمند ترم بهینه اینکوترمز' : 'Incoterms Decision Wizard'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isFa ? 'با پاسخ به چند پرسش سریع، بهترین قاعده منطبق با شیوه حمل و قرارداد خود را بیابید.' : 'Answer a few quick questions to identify the optimal Incoterm for your shipment.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetWizard}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isFa ? 'شروع مجدد' : 'Reset Wizard'}</span>
              </button>
            </div>

            {/* Stepper Questions Form */}
            <div className="space-y-5">
              {/* Question 1: Mode of Transport */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>{isFa ? 'شیوه اصلی حمل‌ونقل محموله چیست؟' : 'What is the primary mode of transport?'}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'sea', labelFa: 'کشتیرانی دریایی (بندر به بندر)', icon: Ship },
                    { id: 'multimodal', labelFa: 'چندوجهی / ترکیبی', icon: Layers },
                    { id: 'air', labelFa: 'هوایی (فرودگاهی)', icon: Plane },
                    { id: 'road_rail', labelFa: 'جاده‌ای ترانزیت یا ریلی', icon: Truck },
                  ].map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTransportMode(mode.id as any)}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        transportMode === mode.id
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <mode.icon className="w-5 h-5" />
                      <span className="text-center">{mode.labelFa}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Cargo Packaging & Containerization */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>{isFa ? 'نوع کالا و بسته‌بندی چیست؟ (کانتینری یا فله‌ای؟)' : 'Cargo packaging and containerization:'}</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCargoType('container')}
                    className={`p-3.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                      cargoType === 'container'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-black flex items-center justify-between">
                      <span>{isFa ? 'کانتینری (FCL یا LCL خرده‌بار)' : 'Containerized (FCL / LCL)'}</span>
                      <Box className="w-4 h-4 text-indigo-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {isFa ? 'کالا در محوطه کانتینری بندر یا انبار تحویل می‌شود. (نیاز به قواعد چندوجهی FCA / CIP / CPT)' : 'Container yard delivery.'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCargoType('bulk_breakbulk')}
                    className={`p-3.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                      cargoType === 'bulk_breakbulk'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-black flex items-center justify-between">
                      <span>{isFa ? 'فله، مواد معدنی، نفت، یا نگله‌های سنگین بدون کانتینر' : 'Bulk / Breakbulk Cargo'}</span>
                      <Anchor className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {isFa ? 'کالا مستقیماً روی عرشه کشتی یا در انبار کشتی لود می‌شود (مناسب برای FOB / CIF / CFR).' : 'Direct on-board vessel loading.'}
                    </p>
                  </button>
                </div>
              </div>

              {/* Question 3: Who arranges & pays international freight? */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>{isFa ? 'چه کسی قرارداد کرایه حمل بین‌المللی را منعقد و پرداخت می‌کند؟' : 'Who contracts and pays the main international freight?'}</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFreightPayer('buyer')}
                    className={`p-3.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                      freightPayer === 'buyer'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-black block">{isFa ? 'خریدار (واردکننده) خود کرایه حمل را هماهنگ می‌کند' : 'Buyer pays freight'}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {isFa ? 'خریدار خط کشتیرانی یا فورواردر منتخب خود را به فروشنده معرفی می‌نماید (گروه F و E).' : 'Nominated carrier controlled by buyer.'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFreightPayer('seller')}
                    className={`p-3.5 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                      freightPayer === 'seller'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-black block">{isFa ? 'فروشنده (صادرکننده) کرایه حمل تا مقصد را می‌پردازد' : 'Seller pays freight'}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {isFa ? 'کرایه حمل تا بندر یا شهر مقصد در فاکتور فروشنده محاسبه می‌شود (گروه C و D).' : 'Freight prepaid to destination.'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Question 4: Destination customs and delivery preferences */}
              {freightPayer === 'seller' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                    <span>{isFa ? 'وظایف در کشور مقصد و ترخیص واردات چگونه است؟' : 'Destination customs & unloading requirements:'}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDestinationCustomsClearance('buyer_clears')}
                      className={`p-3 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                        destinationCustomsClearance === 'buyer_clears'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="block font-black">{isFa ? 'ترخیص واردات با خریدار است' : 'Buyer clears import customs'}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{isFa ? 'عرف استاندارد (DAP / CIF / CIP / CPT)' : 'Standard'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDestinationCustomsClearance('seller_unloads')}
                      className={`p-3 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                        destinationCustomsClearance === 'seller_unloads'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="block font-black">{isFa ? 'فروشنده بار را در مقصد تخلیه هم بکند' : 'Seller unloads in destination'}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{isFa ? 'قاعده DPU (تخلیه‌شده)' : 'DPU unloaded'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDestinationCustomsClearance('seller_clears')}
                      className={`p-3 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                        destinationCustomsClearance === 'seller_clears'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="block font-black">{isFa ? 'فروشنده گمرک و مالیات واردات را هم بپردازد' : 'Seller pays import duty & taxes'}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{isFa ? 'قاعده DDP (درب انبار نهایی)' : 'DDP (Door to Door)'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Recommendation Result Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-indigo-800 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-2xl font-black shadow-inner">
                    {wizardRecommendation.term}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>{wizardRecommendation.rating}</span>
                    </span>
                    <h3 className="text-base font-black text-white">{wizardRecommendation.name}</h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRuleCode(wizardRecommendation.term);
                    setActiveTab('rules_explorer');
                  }}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <span>{isFa ? 'مشاهده جزئیات کامل این ترم' : 'View Full Details'}</span>
                  <ArrowRight className={`w-4 h-4 ${isFa ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-indigo-950/70 p-3.5 rounded-xl border border-indigo-800/60 leading-relaxed text-indigo-100 font-medium">
                  <span className="font-bold text-amber-300 block mb-1">💡 {isFa ? 'چرا این ترم برای شما مناسب است؟' : 'Why this is recommended:'}</span>
                  {wizardRecommendation.reasonFa}
                </div>

                <div className="bg-rose-950/60 p-3.5 rounded-xl border border-rose-800/60 leading-relaxed text-rose-200">
                  <span className="font-bold text-rose-300 block mb-1">⚠️ {isFa ? 'از چه خطایی باید پرهیز کرد؟' : 'What to avoid:'}</span>
                  {wizardRecommendation.avoidFa}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMPREHENSIVE COMPARISON MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'comparison_matrix' && (
        <div className="space-y-6">
          {/* Side-by-side Quick Comparator Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>{isFa ? 'مقایسه رو در روی دو اصطلاح اینکوترمز (Side-by-Side Comparator):' : 'Side-by-Side Comparator:'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">{isFa ? 'ترم اول (قاعده A):' : 'First Term:'}</label>
                <select
                  value={compareTermA}
                  onChange={(e) => setCompareTermA(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-900 bg-slate-50 focus:bg-white"
                >
                  {INCOTERMS_2020_RULES.map(r => (
                    <option key={r.code} value={r.code}>{r.code} - {r.nameFa}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">{isFa ? 'ترم دوم (قاعده B):' : 'Second Term:'}</label>
                <select
                  value={compareTermB}
                  onChange={(e) => setCompareTermB(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-900 bg-slate-50 focus:bg-white"
                >
                  {INCOTERMS_2020_RULES.map(r => (
                    <option key={r.code} value={r.code}>{r.code} - {r.nameFa}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Direct Comparison Cards */}
            {(() => {
              const ruleA = INCOTERMS_2020_RULES.find(r => r.code === compareTermA)!;
              const ruleB = INCOTERMS_2020_RULES.find(r => r.code === compareTermB)!;
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-indigo-700">{ruleA.code}</span>
                      <span className="text-xs font-bold text-slate-600">{ruleA.categoryFa}</span>
                    </div>
                    <p className="text-xs text-slate-700">{ruleA.summaryFa}</p>
                    <div className="text-xs text-indigo-900 bg-white p-2.5 rounded-xl border border-indigo-100 font-medium">
                      <strong>نقطه ریسک:</strong> {ruleA.riskTransferFa}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-blue-700">{ruleB.code}</span>
                      <span className="text-xs font-bold text-slate-600">{ruleB.categoryFa}</span>
                    </div>
                    <p className="text-xs text-slate-700">{ruleB.summaryFa}</p>
                    <div className="text-xs text-blue-900 bg-white p-2.5 rounded-xl border border-blue-100 font-medium">
                      <strong>نقطه ریسک:</strong> {ruleB.riskTransferFa}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Full Master Cost Table for All 11 Rules */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-sm font-black text-slate-900">{isFa ? 'ماتریس کامل ۱۱ قاعده و کلیه اقلام هزینه اینکوترمز ۲۰۲۰' : 'Master 11 Rules Cost Allocation'}</h2>
                <p className="text-xs text-slate-500">{isFa ? 'راهنمای رنگی: سبز = پرداخت توسط فروشنده | آبی = پرداخت توسط خریدار' : 'Green = Seller pays | Blue = Buyer pays'}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-3 whitespace-nowrap">{isFa ? 'قاعده' : 'Term'}</th>
                    <th className="p-3 whitespace-nowrap">{isFa ? 'شیوه' : 'Mode'}</th>
                    <th className="p-3 whitespace-nowrap text-center">{isFa ? 'بسته‌بندی' : 'Packaging'}</th>
                    <th className="p-3 whitespace-nowrap text-center">{isFa ? 'بارگیری مبدأ' : 'Loading Origin'}</th>
                    <th className="p-3 whitespace-nowrap text-center">{isFa ? 'حمل داخلی مبدأ' : 'Inland Origin'}</th>
                    <th className="p-3 whitespace-nowrap text-center">{isFa ? 'گمرک صادرات' : 'Export Customs'}</th>
                    <th className="p-3 whitespace-nowrap text-center">{isFa ? 'THC مبدأ' : 'Origin THC'}</th>
                    <th className="p-3 whitespace-nowrap text-center">{isFa ? 'کرایه بین‌الملل' : 'Freight'}</th>
                    <th className="p-3 whitespace-nowrap text-center">{isFa ? 'بیمه حمل' : 'Insurance'}</th>
                    <th className="p-3 whitespace-nowrap text-center">{isFa ? 'THC مقصد' : 'Dest THC'}</th>
                    <th className="p-3 whitespace-nowrap text-center">{isFa ? 'گمرک و مالیات واردات' : 'Import Duty'}</th>
                    <th className="p-3 whitespace-nowrap text-center">{isFa ? 'حمل داخلی مقصد' : 'Inland Dest'}</th>
                    <th className="p-3 whitespace-nowrap text-center">{isFa ? 'تخلیه در مقصد' : 'Unloading Dest'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {INCOTERMS_2020_RULES.map((rule) => {
                    const isSea = rule.category === 'Sea & Inland Waterway';
                    return (
                      <tr key={rule.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-black text-indigo-700">{rule.code}</td>
                        <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">{isSea ? 'دریایی' : 'چندوجهی'}</td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">فروشنده</span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rule.costs.loadingOrigin ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.loadingOrigin ? 'فروشنده' : 'خریدار'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rule.costs.inlandOrigin ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.inlandOrigin ? 'فروشنده' : 'خریدار'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rule.costs.exportCustoms ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.exportCustoms ? 'فروشنده' : 'خریدار'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rule.costs.thcOrigin ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.thcOrigin ? 'فروشنده' : 'خریدار'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rule.costs.internationalFreight ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.internationalFreight ? 'فروشنده' : 'خریدار'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rule.costs.marineInsurance ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.marineInsurance ? 'فروشنده' : 'خریدار'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rule.costs.thcDestination ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.thcDestination ? 'فروشنده' : 'خریدار'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rule.costs.importCustomsDuty ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.importCustomsDuty ? 'فروشنده' : 'خریدار'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rule.costs.inlandDestination ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.inlandDestination ? 'فروشنده' : 'خریدار'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rule.costs.unloadingDestination ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.unloadingDestination ? 'فروشنده' : 'خریدار'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: TRADE PITFALLS & REAL-WORLD MISTAKES */}
      {/* ========================================================================= */}
      {activeTab === 'pitfalls' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>{isFa ? 'اشتباهات مهلک و خطرات رایج بازرگانان در اینکوترمز' : 'Critical Pitfalls & Costly Trade Mistakes'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isFa
                  ? 'بررسی تجارب پرهزینه بازرگانان در بنادر خاورمیانه، چین و اروپا، تله‌های کانتینری FOB، ابهام در ترخیص گمرکی، و راهکارهای مصونیت حقوقی.'
                  : 'Real-world scenarios, legal risks, and proven solutions to prevent costly international shipping and customs disputes.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {COMMON_TRADE_PITFALLS.map((pitfall, idx) => (
                <div
                  key={pitfall.id}
                  className="rounded-2xl border border-slate-200 p-5 bg-slate-50/60 hover:bg-white hover:border-rose-300 transition-all space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">{pitfall.titleFa}</h3>
                        <p className="text-[11px] font-mono text-slate-500">{pitfall.titleEn}</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 shrink-0 self-start sm:self-auto">
                      فراوانی: {pitfall.frequency}
                    </span>
                  </div>

                  {/* Scenario */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <span className="font-black text-slate-900 block">📌 {isFa ? 'سناریوی واقعی و اتفاق افتاده:' : 'Real Scenario:'}</span>
                    <p className="text-slate-700 leading-relaxed">{pitfall.scenarioFa}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-1 text-rose-950">
                      <span className="font-bold text-rose-800">⚠️ {isFa ? 'ریشه اشتباه حقوقی و پیامد مالی:' : 'Root Cause & Penalty:'}</span>
                      <p className="leading-relaxed">{pitfall.rootCauseFa}</p>
                      <p className="text-rose-900 font-semibold mt-1">{pitfall.consequenceFa}</p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1 text-emerald-950">
                      <span className="font-bold text-emerald-800">✅ {isFa ? 'راهکار صحیح و ایمن:' : 'The Correct Solution:'}</span>
                      <p className="leading-relaxed font-medium">{pitfall.solutionFa}</p>
                    </div>
                  </div>

                  {/* ICC Official Rule Quotation */}
                  <div className="bg-slate-900 text-slate-200 rounded-xl p-3 text-xs flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300 block">{isFa ? 'دستورالعمل صریح اتاق بازرگانی بین‌المللی (ICC):' : 'Official ICC Guidance:'}</span>
                      <p className="mt-0.5 leading-relaxed text-slate-300">{pitfall.iccGuidanceFa}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CONTRACT CLAUSES & GENERATOR */}
      {/* ========================================================================= */}
      {activeTab === 'contract_clauses' && (
        <div className="space-y-6">
          {/* Interactive Contract Clause Generator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>{isFa ? 'سازنده بند رسمی اینکوترمز برای پیش‌فاکتور و قرارداد خرید (Clause Generator)' : 'Incoterms Contract Clause Generator'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isFa ? 'متن استاندارد و حقوقی منطبق با رویه اتاق بازرگانی را با وارد کردن مشخصات محموله خود تولید و کپی کنید.' : 'Generate compliant standard contract text for your proforma invoices.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isFa ? 'انتخاب قاعده اینکوترمز:' : 'Incoterm Rule:'}
                </label>
                <select
                  value={contractTerm}
                  onChange={(e) => setContractTerm(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white"
                >
                  {INCOTERMS_2020_RULES.map(r => (
                    <option key={r.code} value={r.code}>{r.code} - {r.nameFa}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isFa ? 'نام دقیق اسکله، ترمینال، بندر یا انبار (Named Place/Port):' : 'Named Place / Port / Terminal:'}
                </label>
                <input
                  type="text"
                  value={contractNamedPlace}
                  onChange={(e) => setContractNamedPlace(e.target.value)}
                  placeholder="e.g. Shahid Rajaee Port, Bandar Abbas or Ningbo Port"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900"
                />
              </div>
            </div>

            {/* Generated Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300">{isFa ? 'متن حقوقی آماده الصاق به قرارداد:' : 'Standard Contract Text:'}</span>
                <button
                  type="button"
                  onClick={() => handleCopyText(generatedContractClause, 'contract_clause')}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedItem === 'contract_clause' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedItem === 'contract_clause' ? (isFa ? 'کپی شد!' : 'Copied') : (isFa ? 'کپی متن بند' : 'Copy')}</span>
                </button>
              </div>

              <pre className="text-xs font-mono text-slate-200 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
                {generatedContractClause}
              </pre>
            </div>
          </div>

          {/* Sample Pre-Drafted Clauses for Key Terms */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              {isFa ? 'نمونه شروط استاندارد آماده برای اصطلاحات پرکاربرد:' : 'Sample Pre-Drafted Clauses for Key Incoterms:'}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {SAMPLE_CONTRACT_CLAUSES.map((sample, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-800 text-xs font-black">
                        {sample.incoterm}
                      </span>
                      <span className="text-xs font-black text-slate-900">{sample.contextFa}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyText(`${sample.englishClause}\n\n${sample.persianTranslation}`, `sample_${idx}`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedItem === `sample_${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedItem === `sample_${idx}` ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'کپی' : 'Copy')}</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="font-mono text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {sample.englishClause}
                    </div>
                    <div className="text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                      {sample.persianTranslation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: TRADE GLOSSARY & ACRONYMS */}
      {/* ========================================================================= */}
      {activeTab === 'glossary' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>{isFa ? 'فرهنگ جامع اصطلاحات تخصصی اینکوترمز و لجستیک' : 'Incoterms & Shipping Acronyms Glossary'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isFa ? 'تعاریف دقیق و کاربردی بارنامه، دموراژ، فرجه مجاز، کلوزهای بیمه و هزینه‌های بندری.' : 'Essential terms and definitions for international shipping.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INCOTERMS_GLOSSARY.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 hover:bg-white hover:border-indigo-300 transition-all space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-indigo-700 font-mono">{item.term}</span>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-xs font-black text-slate-900">{item.termFa}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.definitionFa}</p>

                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-950">
                    <span className="font-bold text-amber-900">💡 {isFa ? 'نکته کاربردی بازرگان:' : 'Practical Tip:'} </span>
                    {item.practicalTipFa}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
