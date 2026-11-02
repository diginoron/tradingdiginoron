import React, { useState } from 'react';
import {
  Globe2,
  TrendingUp,
  ShieldCheck,
  BrainCircuit,
  Zap,
  Target,
  Database,
  Layers,
  Scale,
  Search,
  PieChart,
  FileText,
  Calculator,
  Lock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  DollarSign,
  AlertTriangle,
  Building2,
  FileSpreadsheet,
  Truck,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface IntroductionContentProps {
  language: 'fa' | 'en';
  onGoToAuth: () => void;
}

export const IntroductionContent: React.FC<IntroductionContentProps> = ({
  language,
  onGoToAuth,
}) => {
  const isFa = language === 'fa';
  const [activePreviewTab, setActivePreviewTab] = useState<'advisor' | 'dashboard' | 'rca' | 'fraud' | 'letters'>('advisor');
  const [activeToolCategory, setActiveToolCategory] = useState<'all' | 'strategy' | 'risk' | 'finance' | 'bigdata'>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const previewTabs = [
    { id: 'advisor', titleFa: 'مشاور هوش مصنوعی', titleEn: 'AI Trade Advisor', icon: BrainCircuit },
    { id: 'dashboard', titleFa: 'میزکار و تراز تجاری', titleEn: 'Trader Dashboard', icon: Zap },
    { id: 'rca', titleFa: 'شاخص مزیت بالاسا (RCA)', titleEn: 'Balassa RCA', icon: TrendingUp },
    { id: 'fraud', titleFa: 'رادار کشف تقلب گمرکی', titleEn: 'Customs Fraud Radar', icon: ShieldCheck },
    { id: 'letters', titleFa: 'نگارش نامه‌های تجاری ICC', titleEn: 'ICC Commercial Letters', icon: FileText },
  ];

  const toolsList = [
    { id: 'smart_advisor', nameFa: 'دستیار هوشمند تجارت بین‌الملل (AI)', nameEn: 'Smart Trade Advisor', cat: 'strategy', icon: BrainCircuit, descFa: 'مشاوره راهبردی بازرگانی، تحلیل قراردادها و فرصت‌ها با هوش مصنوعی.' },
    { id: 'balassa_rca', nameFa: 'شاخص مزیت نسبی آشکار شده بالاسا (RCA)', nameEn: 'Balassa RCA Index', cat: 'strategy', icon: TrendingUp, descFa: 'سنجش قدرت رقابتی صادرات کالا در بازارهای جهانی طبق فرمول بالاسا.' },
    { id: 'competitor_matrix', nameFa: 'ماتریس تحلیل رقبا', nameEn: 'Competitor Matrix', cat: 'strategy', icon: Target, descFa: 'رصد صادرکنندگان رقیب، سهم بازار و نرخ رشد مقاصد صادراتی.' },
    { id: 'untapped_potential', nameFa: 'پتانسیل‌های صادراتی کشف‌نشده', nameEn: 'Untapped Potential', cat: 'strategy', icon: Sparkles, descFa: 'شناسایی بازارهای پرتقاضا با رقابت کمتر برای محصولات صادراتی.' },
    { id: 'trade_blocs', nameFa: 'رادار بلوک‌های تجاری و تعرفه‌ای', nameEn: 'Trade Blocs Radar', cat: 'strategy', icon: Globe2, descFa: 'تحلیل پیمان‌های اقتصادی اوراسیا، بریکس، شانگهای و اکو.' },
    
    { id: 'trade_fraud_radar', nameFa: 'رادار کشف کم‌اظهاری و تقلب گمرکی', nameEn: 'Trade Fraud Radar', cat: 'risk', icon: ShieldCheck, descFa: 'مقایسه قیمت‌های اظهاری با میانگین‌های بین‌المللی جهت پیشگیری از جریمه.' },
    { id: 'bilateral_asymmetry', nameFa: 'تحلیل عدم تقارن آینه‌ای (Mirror Gap)', nameEn: 'Bilateral Asymmetry', cat: 'risk', icon: Scale, descFa: 'کشف اختلاف آمارهای صادرات و واردات بین گمرکات دو کشور.' },
    { id: 'hhi_concentration', nameFa: 'شاخص تمرکز بازار هرشمن-هیرفیندال', nameEn: 'HHI Market Concentration', cat: 'risk', icon: PieChart, descFa: 'بررسی درجه انحصار و ریسک وابستگی به بازارهای خاص.' },
    { id: 'bec_categories', nameFa: 'رده‌بندی ماهیت کالایی BEC', nameEn: 'BEC Classification', cat: 'risk', icon: Layers, descFa: 'تفکیک کالاهای سرمایه‌ای، واسطه‌ای و مصرفی در تجارت.' },
    { id: 'hs_explorer', nameFa: 'کاوشگر کدهای تعرفه ۶ رقمی HS', nameEn: 'HS Code Explorer', cat: 'risk', icon: Search, descFa: 'جستجو و تطبیق ساختار کدهای تعرفه گمرکی سیستم هماهنگ‌شده.' },

    { id: 'business_letters', nameFa: 'نگارشگر مکاتبات تجاری ICC', nameEn: 'ICC Business Letter Generator', cat: 'finance', icon: FileText, descFa: 'نگارش حقوقی RFQ، پروفرما، LOI و مذاکرات قیمت به ۸ زبان تجاری.' },
    { id: 'landed_cost', nameFa: 'محاسبه بهای تمام‌شده و اینکوترمز ۲۰۲۰', nameEn: 'Landed Cost & Incoterms', cat: 'finance', icon: Calculator, descFa: 'محاسبه تفکیکی FOB، CIF، بیمه، کرایه حمل و حقوق ورودی گمرک.' },
    { id: 'ninja_fx', nameFa: 'تبدیل زنده ارزها و نرخ‌های تسویه', nameEn: 'FX Converter', cat: 'finance', icon: DollarSign, descFa: 'نرخ لحظه‌ای ارزهای اصلی و محاسبه نرخ برابری در مبادلات بازرگانی.' },
    { id: 'trade_holidays', nameFa: 'تقویم تعطیلات رسمی و گمرکات جهان', nameEn: 'Trade Holidays Calendar', cat: 'finance', icon: Building2, descFa: 'تقویم کاری بنادر و تعطیلات رسمی گمرکات کشورهای هدف.' },
    { id: 'lc_validator', nameFa: 'اعتبارسنجی اعتبارات اسنادی (LC Validator)', nameEn: 'LC & Trade Finance Validator', cat: 'finance', icon: CheckCircle2, descFa: 'بررسی انطباق اسناد با مقررات متحدالشکل UCP 600.' },

    { id: 'un_comtrade', nameFa: 'استعلام کلان‌داده‌های UN Comtrade', nameEn: 'UN Comtrade Raw Data', cat: 'bigdata', icon: Database, descFa: 'دسترسی به جامع‌ترین مخزن آمار تجارت رسمی سازمان ملل متحد.' },
    { id: 'trader_dashboard', nameFa: 'میزکار و تراز تجاری دوجانبه', nameEn: 'Trader Dashboard', cat: 'bigdata', icon: Zap, descFa: 'نمای ۳۶۰ درجه از صادرات، واردات، مازاد و شرکای تجاری.' },
    { id: 'world_share', nameFa: 'سهم از تجارت جهانی کالاها', nameEn: 'World Trade Share', cat: 'bigdata', icon: Globe2, descFa: 'سهم درصدی کشورها از ارزش کل تجارت یک محصول در جهان.' },
    { id: 'transport_mot', nameFa: 'شیوه‌های حمل و ترانزیت (دریایی، هوایی، زمینی)', nameEn: 'Modes of Transport', cat: 'bigdata', icon: Truck, descFa: 'آمار حجم و ارزش محموله‌ها به تفکیک روش حمل بین‌المللی.' },
    { id: 'commodity_benchmark', nameFa: 'بنچ‌مارک آنلاین کامودیتی‌ها و نفت', nameEn: 'Commodity Benchmark', cat: 'bigdata', icon: FileSpreadsheet, descFa: 'قیمت لحظه‌ای نفت خام، طلا، فلزات پایه و غلات در بازارهای جهانی.' },
  ];

  const filteredTools = activeToolCategory === 'all'
    ? toolsList
    : toolsList.filter(t => t.cat === activeToolCategory);

  const faqs = [
    {
      qFa: 'چرا برای استفاده از ابزارها باید ثبت‌نام کنم؟',
      qEn: 'Why do I need to register to use the tools?',
      aFa: 'دیجی نورون ارائه‌دهنده ابزارهای تحلیلی سطح بالا بر پایه کلان‌داده‌های رسمی سازمان ملل (UN Comtrade) و هوش مصنوعی است. ثبت‌نام به ما امکان می‌دهد محیط اختصاصی، تاریخچه استعلامات و سهمیه‌های اختصاصی استعلام را برای هر بازرگان به صورت امن نگهداری کنیم.',
      aEn: 'Diginoron provides specialized high-tier analytics powered by UN Comtrade big data and AI. Registration provides a personalized workspace, query histories, and secure quota tracking.'
    },
    {
      qFa: 'آیا امکان تست سریع ابزارها با اکانت آزمایشی وجود دارد؟',
      qEn: 'Can I test the tools quickly with a demo account?',
      aFa: 'بله! در بالای همین صفحه و داخل کادر ثبت‌نام، دکمه «ورود سریع با حساب آزمایشی بازرگان» قرار دارد که با یک کلیک شما را وارد محیط سامانه می‌کند تا تمام ابزارها را تست و بررسی نمایید.',
      aEn: 'Yes! The sign-in card includes a 1-click "Quick Demo Trader Access" button to instantly explore all 25+ tools.'
    },
    {
      qFa: 'داده‌های تجاری سامانه از چه مراجعی تأمین می‌شوند؟',
      qEn: 'What are the sources of trade data?',
      aFa: 'تمام آمارهای بازرگانی مستقیماً از داده‌های رسمی اظهارشده گمرکات به بخش آماری سازمان ملل متحد (UN Comtrade Database)، پایگاه‌های آماری بانک جهانی، و نرخ‌های رسمی مرجع بین‌المللی استخراج و به روزرسانی می‌شوند.',
      aEn: 'Data is directly sourced and processed from United Nations Comtrade official trade statistics, World Bank indicators, and real-time global benchmarks.'
    },
    {
      qFa: 'آیا نامه‌های تجاری تولید شده مطابق قوانین اتاق بازرگانی بین‌المللی (ICC) است؟',
      qEn: 'Are AI-generated commercial letters compliant with ICC standards?',
      aFa: 'بله، دستیار نگارش نامه تجاری با تسلط کامل بر استانداردهای اینکوترمز ۲۰۲۰ و قواعد اعتبارات اسنادی UCP 600 آموزش دیده و نامه‌هایی رسمی، از نظر حقوقی دقیق و در سطح قراردادهای بین‌المللی به ۸ زبان زنده دنیا تولید می‌کند.',
      aEn: 'Yes, letters are strictly modeled on ICC Incoterms 2020 and UCP 600 standards across 8 major commercial languages.'
    }
  ];

  return (
    <div className="w-full space-y-16 sm:space-y-20 py-8">
      {/* 1. Interactive Live Tool Showcase */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isFa ? 'پیش‌نمایش زنده قابلیت‌های کلیدی' : 'Live Platform Preview'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {isFa 
              ? 'پیش از ثبت‌نام، با قدرت ابزارهای هوش تجاری دیجی نورون آشنا شوید'
              : 'Experience the Power of Diginoron Trade Intelligence'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            {isFa 
              ? 'با کلیک روی هر یک از بخش‌های زیر، پیش‌نمایشی از محیط و خروجی موتورهای هوشمند ما را مشاهده فرمایید:'
              : 'Click any module below to inspect real interactive sample outputs:'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
          {previewTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePreviewTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePreviewTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isFa ? tab.titleFa : tab.titleEn}</span>
              </button>
            );
          })}
        </div>

        {/* Preview Content Area */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 sm:p-6 text-xs text-slate-800">
          {activePreviewTab === 'advisor' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">AI</div>
                  <div>
                    <span className="font-bold text-slate-900 block">{isFa ? 'تحلیل استراتژی صادرات پسته و خشکبار (کد تعرفه 0802) به آلمان' : 'Export Strategy Analysis for Pistachios (HS 0802) to Germany'}</span>
                    <span className="text-[11px] text-slate-500">{isFa ? 'موتور تحلیلی Gemini هوش مصنوعی دیجی نورون' : 'Diginoron AI Intelligence Engine'}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold">
                  {isFa ? 'مزیت بالاسا: ۲.۸۴ (بسیار بالا)' : 'RCA: 2.84 (High)'}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                <p className="font-semibold text-slate-900 mb-1">{isFa ? 'خلاصه مشاوره استراتژیک:' : 'Executive Strategic Advice:'}</p>
                <p>
                  {isFa 
                    ? '«سهم بازار آلمان در واردات این کالا طی ۳ سال گذشته رشد ۱۲ درصدی داشته است. با توجه به استانداردهای سخت‌گیرانه آفلاتوکسین اتحادیه اروپا، پیشنهاد می‌شود از ترم CIF هامبورگ و بازرسی پیش از بارگیری SGS استفاده فرمایید. تراز تجاری در این قلم مثبت بوده و رقابت با مبادی آمریکا از نظر قیمت واحد گمرکی امکان‌پذیر است.»'
                    : '"German import volume grew 12% over 3 years. Due to EU aflatoxin regulations, CIF Hamburg with pre-shipment SGS inspection is recommended. The bilateral trade balance is positive with strong price competitiveness."'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-slate-500 text-[11px] block">{isFa ? 'شاخص رقابت قیمتی' : 'Price Competitiveness'}</span>
                  <span className="text-sm font-black text-blue-600">{isFa ? '۱۵٪ پایین‌تر از رقبا' : '15% Below Peers'}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-slate-500 text-[11px] block">{isFa ? 'ترم اینکوترمز پیشنهادی' : 'Recommended Incoterm'}</span>
                  <span className="text-sm font-black text-slate-900">CIF Hamburg (2020)</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-slate-500 text-[11px] block">{isFa ? 'سطح ریسک وصول وجه' : 'Payment Risk'}</span>
                  <span className="text-sm font-black text-emerald-600">{isFa ? 'پایین (اعتبار اسنادی LC)' : 'Low (Confirmed LC)'}</span>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-500 block">{isFa ? 'ارزش کل صادرات' : 'Total Exports'}</span>
                  <span className="text-base font-black text-emerald-600">$48.2 B</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-500 block">{isFa ? 'ارزش کل واردات' : 'Total Imports'}</span>
                  <span className="text-base font-black text-blue-600">$53.1 B</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-500 block">{isFa ? 'تراز تجاری' : 'Trade Balance'}</span>
                  <span className="text-base font-black text-red-600">-$4.9 B</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-500 block">{isFa ? 'تعداد شرکای فعال' : 'Active Partners'}</span>
                  <span className="text-base font-black text-slate-900">142 {isFa ? 'کشور' : 'Countries'}</span>
                </div>
              </div>
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{isFa ? 'شرکای عمده تجاری (Top 3)' : 'Top Trading Partners'}</span>
                  <span className="text-[11px] text-slate-500">{isFa ? 'چین (۳۲٪)، امارات متحده عربی (۲۱٪)، ترکیه (۱۴٪)' : 'China (32%), UAE (21%), Turkey (14%)'}</span>
                </div>
                <span className="text-xs font-bold text-blue-600">{isFa ? 'بررسی جامع در پنل' : 'Full Explorer in Panel'}</span>
              </div>
            </div>
          )}

          {activePreviewTab === 'rca' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="font-bold text-blue-900 block mb-1">
                  {isFa ? 'فرمول مزیت نسبی بالاسا: RCA = (X_ij / X_it) / (X_wj / X_wt)' : 'Balassa RCA Formula: Revealed Comparative Advantage'}
                </span>
                <p className="text-[11px] text-blue-800">
                  {isFa 
                    ? 'مقادیر بزرگتر از ۱ نشان‌دهنده مزیت مطلق صادراتی و قدرت رقابتی بالا در مقیاس جهانی است.'
                    : 'Values > 1 indicate clear export competitiveness in the global merchandise market.'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <span className="font-bold text-slate-900">HS 7108 (طلا و فلزات گرانبها)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-600">RCA = 3.42</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{isFa ? 'مزیت بسیار قوی' : 'High Competitiveness'}</span>
                  </div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <span className="font-bold text-slate-900">HS 2709 (نفت خام و مشتقات هیدروکربوری)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600">RCA = 2.15</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{isFa ? 'مزیت قوی' : 'Competitive'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === 'fraud' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 block">{isFa ? 'دیده‌بان کشف اختلاف ارزش و کم‌اظهاری گمرکی' : 'Customs Mirror Valuation Discrepancy Alert'}</span>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    {isFa 
                      ? 'مقایسه خودکار قیمت ارزش واحد اظهارشده در گمرک با میانگین‌های اظهاری کشور صادرکننده جهت جلوگیری از جرایم گمرکی ماده ۱۰۸.'
                      : 'Automatic cross-referencing of declared customs unit values against exporter mirror records to identify undervaluation risks.'}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">{isFa ? 'ارزش واحد گمرکی اظهارشده:' : 'Declared Unit Value:'}</span>
                  <span className="font-bold text-slate-900">$4.20 / kg</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">{isFa ? 'میانگین قیمت بین‌المللی در Comtrade:' : 'UN Comtrade Global Benchmark:'}</span>
                  <span className="font-bold text-blue-600">$7.85 / kg</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-red-600 text-[11px]">{isFa ? 'هشدار ریسک: انحراف منفی ۴۶٪ (ریسک بازرسی گمرکی)' : 'Risk Alert: 46% Negative Variance'}</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold text-[10px] rounded-md">{isFa ? 'نیاز به بررسی اسنادی' : 'Audit Required'}</span>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === 'letters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900">{isFa ? 'نمونه نامه رسمی استعلام قیمت (RFQ) با استاندارد ICC' : 'Sample Commercial RFQ Letter (ICC Standard)'}</span>
                <span className="text-[11px] text-slate-500 font-mono">Ref: DIGI-RFQ-2026</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-[11px] leading-relaxed text-slate-700 dir-ltr text-left">
                <p className="font-bold text-slate-900">RE: Request for Quotation – Grade A Petrochemical Polymers</p>
                <p className="mt-1 text-slate-600">
                  Dear Commercial Director,<br/>
                  We formally request your firm commercial offer for 500 Metric Tons of Polypropylene under Incoterms® 2020 CIF Jebel Ali Port, accompanied by full certificate of analysis (SGS inspection) and irrevocable Letter of Credit at sight.
                </p>
              </div>
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800">
                {isFa ? 'همراه با ترجمه فارسی رسمی، چک‌لیست اینکوترمز ۲۰۲۰ و انطباق با ضوابط UCP 600 اتاق بازرگانی بین‌المللی.' : 'Includes certified Persian translation and ICC UCP 600 compliance verification.'}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-600 font-medium text-center sm:text-right">
            {isFa 
              ? 'تمامی این ابزارها بلافاصله پس از ثبت‌نام یا ورود در دسترس شما قرار می‌گیرند.'
              : 'All 25+ tools unlock immediately upon registration or sign-in.'}
          </span>
          <button
            type="button"
            onClick={onGoToAuth}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isFa ? 'ثبت‌نام و شروع کار' : 'Sign Up to Access'}</span>
            {isFa ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </section>

      {/* 2. Directory of 25+ Specialized Engines */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-3xl font-black text-slate-900">
            {isFa ? 'جعبه‌ابزار جامع ۲۵ موتور هوش تجاری و گمرک' : 'The Complete 25+ Trade Engines Directory'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {isFa 
              ? 'مجموعه‌ای یکپارچه از قوی‌ترین ابزارهای تحلیلی، استعلامی و اسنادی بازرگانی بین‌الملل'
              : 'An integrated suite of elite global trade intelligence and customs compliance tools.'}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { id: 'all', labelFa: 'همه ابزارها (۲۵)', labelEn: 'All Tools (25)' },
            { id: 'strategy', labelFa: 'استراتژی و بازارها', labelEn: 'Strategy & Markets' },
            { id: 'risk', labelFa: 'دیده‌بان سلامت و گمرک', labelEn: 'Customs & Risk' },
            { id: 'finance', labelFa: 'مالی، اینکوترمز و اسناد', labelEn: 'Finance & Incoterms' },
            { id: 'bigdata', labelFa: 'کلان‌داده‌های سازمان ملل', labelEn: 'UN Comtrade Big Data' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveToolCategory(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeToolCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isFa ? cat.labelFa : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Grid of Tool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div 
                key={tool.id}
                className="bg-white border border-slate-200/90 hover:border-blue-400 p-4 rounded-xl shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                      <Lock className="w-3 h-3" />
                      <span>{isFa ? 'قفل (نیازمند ورود)' : 'Locked'}</span>
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs mb-1">
                    {isFa ? tool.nameFa : tool.nameEn}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {tool.descFa}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono text-[10px]">UN Comtrade 2026</span>
                  <button
                    type="button"
                    onClick={onGoToAuth}
                    className="text-blue-600 hover:text-blue-700 font-bold transition-colors cursor-pointer"
                  >
                    {isFa ? 'مشاهده در پنل ←' : 'Explore →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Three-Step Workflow */}
      <section className="bg-gradient-to-b from-blue-50/60 to-white border border-blue-100 rounded-2xl p-6 sm:p-10">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {isFa ? 'مسیر ۳ مرحله‌ای شروع کار با دیجی نورون' : 'Get Started in 3 Simple Steps'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {isFa ? 'تنها در چند لحظه به تصمیم‌گیرنده‌ای آگاه در صحنه تجارت بین‌الملل تبدیل شوید:' : 'Empower your global trade decisions in moments:'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-base flex items-center justify-center mx-auto shadow-xs">
              ۱
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{isFa ? 'ثبت‌نام سریع در ۳۰ ثانیه' : 'Quick 30-Sec Sign Up'}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isFa 
                ? 'با وارد کردن مشخصات یا کلیک روی دکمه ورود سریع دمو، بلافاصله حساب خود را فعال فرمایید.'
                : 'Enter your credentials or click 1-click Demo Login to activate your workspace.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-base flex items-center justify-center mx-auto shadow-xs">
              ۲
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{isFa ? 'انتخاب کالا یا کشور مقصد' : 'Select HS Code or Country'}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isFa 
                ? 'کد تعرفه ۶ رقمی، نام محصول یا کشور هدف خود را از میان ۲۰۰+ اقتصاد جهان انتخاب نمایید.'
                : 'Pick a 6-digit HS code or target economy from over 200 world jurisdictions.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-base flex items-center justify-center mx-auto shadow-xs">
              ۳
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{isFa ? 'دریافت هوش تجاری و تصمیم‌گیری' : 'Get Intelligence & Act'}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isFa 
                ? 'شاخص بالاسا، گزارش‌های آماری، رادار کم‌اظهاری و نامه‌های حقوقی را با یک کلیک دریافت کنید.'
                : 'Access Balassa RCA, mirror gap audits, and ICC standard letters instantly.'}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Trust & Standards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white border border-slate-200/90 rounded-xl flex items-start gap-3 shadow-2xs">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-0.5">{isFa ? 'داده‌های رسمی سازمان ملل' : 'Official UN Data'}</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">{isFa ? 'مبتنی بر دقیق‌ترین داده‌های گمرکات بین‌الملل UN Comtrade.' : 'Grounded on verified UN Comtrade records.'}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/90 rounded-xl flex items-start gap-3 shadow-2xs">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-0.5">{isFa ? 'انطباق با اتاق بازرگانی (ICC)' : 'ICC Standards Compliant'}</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">{isFa ? 'رعایت دقیق قواعد اینکوترمز ۲۰۲۰ و مقررات اسنادی UCP 600.' : 'Strict adherence to Incoterms® 2020 & UCP 600.'}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/90 rounded-xl flex items-start gap-3 shadow-2xs">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-0.5">{isFa ? 'حفظ کامل محرمانگی' : 'Data Privacy'}</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">{isFa ? 'محرمانگی کامل استعلامات تجاری، قیمت‌ها و قراردادهای بازرگانان.' : 'Complete privacy for commercial inquiries and negotiations.'}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/90 rounded-xl flex items-start gap-3 shadow-2xs">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-0.5">{isFa ? 'هوش مصنوعی پیشرفته' : 'Advanced AI Engines'}</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">{isFa ? 'مدل‌های تحلیلی بومی‌سازی‌شده ویژه بازرگانان و متخصصان صادرات.' : 'Fine-tuned models customized for international traders.'}</p>
          </div>
        </div>
      </section>

      {/* 5. Frequently Asked Questions */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            {isFa ? 'سوالات متداول بازرگانان' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-2 text-xs">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx} 
                className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-right font-bold text-slate-900 transition-colors cursor-pointer"
                >
                  <span>{isFa ? faq.qFa : faq.qEn}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="p-4 bg-white text-slate-600 leading-relaxed border-t border-slate-100">
                    {isFa ? faq.aFa : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Bottom Banner */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-right">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-black">
            {isFa ? 'تجارت خود را با هوش مصنوعی و کلان‌داده‌ها متحول کنید' : 'Empower Your Global Trade Journey Today'}
          </h3>
          <p className="text-xs text-slate-400">
            {isFa ? 'به جمع بازرگانان پیشرو دیجی نورون بپیوندید و تصمیمات هوشمندانه‌تری اتخاذ نمایید.' : 'Join leading international traders leveraging data-driven decision making.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onGoToAuth}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>{isFa ? 'ثبت‌نام رایگان و ورود' : 'Sign Up Free'}</span>
          {isFa ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </section>
    </div>
  );
};
