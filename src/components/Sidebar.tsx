
import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Layers, 
  BarChart3, 
  Table, 
  Terminal, 
  Key, 
  ExternalLink,
  ShieldCheck, 
  ShieldAlert, 
  AlertCircle, 
  X, 
  Globe2, 
  History, 
  Truck, 
  Briefcase, 
  CheckCircle2, 
  Newspaper, 
  Target, 
  ShoppingBag, 
  Compass, 
  Package, 
  Zap, 
  Award, 
  Sparkles, 
  Calendar, 
  Users, 
  PieChart, 
  BrainCircuit, 
  Coins, 
  CalendarDays, 
  CreditCard, 
  Fuel, 
  TrendingUp, 
  Scale,
  Search,
  FileText
} from 'lucide-react';
import { ActiveServiceSection } from '../types';
import { DiginoronLogo } from './DiginoronLogo';

interface SidebarProps {
  language: 'fa' | 'en';
  activeSection: ActiveServiceSection | string;
  onSelectSection: (section: any) => void;
  onOpenKeyModal: () => void;
  hasActiveKey?: boolean;
  activeKeyType?: 'primary' | 'secondary';
  mobileOpen?: boolean;
  isOpenMobile?: boolean;
  isOpen?: boolean;
  onCloseMobile: () => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  language,
  activeSection,
  onSelectSection,
  onOpenKeyModal,
  hasActiveKey = false,
  activeKeyType = 'primary',
  mobileOpen,
  isOpenMobile,
  isOpen,
  onCloseMobile,
  onClose,
}) => {
  const isFa = language === 'fa';
  const isVisible = isOpen ?? mobileOpen ?? isOpenMobile ?? false;
  const handleClose = onClose || onCloseMobile;
  const [searchQuery, setSearchQuery] = useState('');

  // Listen to Escape key to close menu
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleClose]);

  // Group 1: Trader Intelligence Suite
  const traderServices = [
    {
      id: 'smart_trade_assistant',
      titleEn: 'Smart Trade Assistant (AI)',
      titleFa: 'دستیار هوشمند تجارت (AI)',
      badge: 'هوشمند',
      icon: BrainCircuit,
      color: 'text-blue-600'
    },
    {
      id: 'business_letter_generator',
      titleEn: 'Global Trade Letter Generator (AI)',
      titleFa: 'نگارش نامه‌های تجاری بین‌الملل (AI)',
      badge: 'AI',
      icon: FileText,
      color: 'text-violet-600'
    },
    {
      id: 'trader_dashboard',
      titleEn: 'Trader Command Center',
      titleFa: 'میزکار هوشمند بازرگان',
      badge: 'میزکار',
      icon: Zap,
      color: 'text-amber-600'
    },
    {
      id: 'incoterms_landed_cost',
      titleEn: 'Landed Cost & Incoterms 2020',
      titleFa: 'محاسبه قیمت تمام‌شده و اینکوترمز',
      badge: 'مالی',
      icon: Scale,
      color: 'text-emerald-600'
    },
    {
      id: 'export_finder',
      titleEn: 'Export Target Finder',
      titleFa: 'کاوشگر بازارهای هدف صادرات',
      badge: 'صادرات',
      icon: Target,
      color: 'text-blue-600'
    },
    {
      id: 'import_sourcing',
      titleEn: 'Import Sourcing Hub',
      titleFa: 'سورسینگ و مبادی واردات',
      badge: 'واردات',
      icon: Compass,
      color: 'text-teal-600'
    },
    {
      id: 'untapped_potential',
      titleEn: 'Untapped Export Potential',
      titleFa: 'فرصت‌های پنهان و ظرفیت خالی',
      badge: 'فرصت',
      icon: Sparkles,
      color: 'text-indigo-600'
    },
    {
      id: 'country_directory',
      titleEn: '240+ Countries Directory',
      titleFa: 'راهنمای جامع ۲۴۰ کشور',
      badge: 'کشورها',
      icon: Globe2,
      color: 'text-slate-600'
    },
    {
      id: 'hs_code_explorer',
      titleEn: '99 HS Chapters Explorer',
      titleFa: 'کاوشگر ۹۹ فصل تعرفه HS',
      badge: 'تعرفه',
      icon: Package,
      color: 'text-emerald-600'
    },
  ];

  // Group 2: Advanced Trade Economics & Risk Engines
  const intelligenceServices = [
    {
      id: 'balassa_rca',
      titleEn: 'Balassa RCA Index',
      titleFa: 'مزیت نسبی آشکارشده بالاسا',
      badge: 'RCA',
      icon: Award,
      color: 'text-amber-600'
    },
    {
      id: 'trade_fraud_radar',
      titleEn: 'Customs Fraud & Valuation Radar',
      titleFa: 'دیده‌بان کم‌اظهاری و ارزش گمرکی',
      badge: 'ریسک',
      icon: ShieldAlert,
      color: 'text-rose-600'
    },
    {
      id: 'bec_categories',
      titleEn: 'BEC Economic Categories',
      titleFa: 'ماهیت اقتصادی کالاها (BEC)',
      badge: 'BEC',
      icon: Layers,
      color: 'text-blue-600'
    },
    {
      id: 'hhi_concentration',
      titleEn: 'HHI Market Concentration',
      titleFa: 'شاخص تمرکز بازار هرفیندال',
      badge: 'HHI',
      icon: ShieldCheck,
      color: 'text-purple-600'
    },
    {
      id: 'monthly_seasonality',
      titleEn: 'Monthly Demand Seasonality',
      titleFa: 'نوسانات فصلی و تقویم ماهانه',
      badge: 'فصلی',
      icon: Calendar,
      color: 'text-amber-600'
    },
    {
      id: 'trade_blocs',
      titleEn: 'Trade Blocs (BRICS, EAEU)',
      titleFa: 'بلوک‌های تجاری و ترجیحی',
      badge: 'بلوک‌ها',
      icon: Users,
      color: 'text-indigo-600'
    },
    {
      id: 'competitor_matrix',
      titleEn: 'Competitor Dominance Matrix',
      titleFa: 'ماتریس سهم از سبد رقبا',
      badge: 'رقبا',
      icon: BarChart3,
      color: 'text-teal-600'
    },
  ];

  // Group 3: Core Bilateral & Balance Tools
  const analyticsServices = [
    {
      id: 'bilateral_asymmetry',
      titleEn: 'Bilateral & Mirror Data',
      titleFa: 'عدم تقارن و داده‌های آینه‌ای',
      badge: 'آینه‌ای',
      icon: Layers,
      color: 'text-purple-600'
    },
    {
      id: 'trade_balance_tool',
      titleEn: 'Pivoted Trade Balance',
      titleFa: 'تراز تجاری محوری',
      badge: 'تراز',
      icon: BarChart3,
      color: 'text-emerald-600'
    },
    {
      id: 'transport_mot',
      titleEn: 'Transport & Logistics (MoT)',
      titleFa: 'لجستیک و شیوه حمل‌ونقل',
      badge: 'حمل',
      icon: Truck,
      color: 'text-cyan-600'
    },
    {
      id: 'world_share',
      titleEn: 'World Trade Share',
      titleFa: 'سهم از تجارت جهانی',
      badge: 'سهم',
      icon: Globe2,
      color: 'text-sky-600'
    },
  ];

  // Group 4: Official UN Comtrade Datasets
  const officialServices = [
    {
      id: 'merchandise',
      titleEn: 'UN Comtrade Merchandise Data',
      titleFa: 'استعلام جامع تجارت کالا (رسمی)',
      badge: 'UN Comtrade',
      icon: Database,
      color: 'text-blue-600'
    },
    {
      id: 'services',
      titleEn: 'Trade in Services (EBOPS)',
      titleFa: 'تجارت خدمات بین‌الملل (EBOPS)',
      badge: 'خدمات',
      icon: Briefcase,
      color: 'text-teal-600'
    },
    {
      id: 'mbs_historical',
      titleEn: 'Historical Series (1946-)',
      titleFa: 'سری‌های تاریخی تجارت',
      badge: 'تاریخی',
      icon: History,
      color: 'text-amber-600'
    },
    {
      id: 'data_availability',
      titleEn: 'Data Availability Matrix',
      titleFa: 'ماتریس دسترسی داده‌ها',
      badge: 'دسترسی',
      icon: CheckCircle2,
      color: 'text-cyan-600'
    },
    {
      id: 'releases_feed',
      titleEn: 'UN Releases Feed',
      titleFa: 'آخرین انتشارات و بروزرسانی‌ها',
      badge: 'انتشارات',
      icon: Newspaper,
      color: 'text-slate-600'
    },
  ];

  // Group 5: API Ninjas Operational Trade Tools
  const ninjaServices = [
    {
      id: 'currency_converter',
      titleEn: 'Live FX & Multi-Currency',
      titleFa: 'مبدل زنده ارزهای تجاری',
      badge: 'ارز',
      icon: Coins,
      color: 'text-emerald-600'
    },
    {
      id: 'trade_holidays',
      titleEn: 'Trade Holidays & Port Demurrage',
      titleFa: 'تعطیلات رسمی و بنادر شرکا',
      badge: 'تقویم',
      icon: CalendarDays,
      color: 'text-blue-600'
    },
    {
      id: 'macro_capacity',
      titleEn: 'Macro Intelligence & Capacity',
      titleFa: 'شاخص‌های کلان و کشش بازار',
      badge: 'کلان',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      id: 'trade_finance_validator',
      titleEn: 'IBAN & SWIFT Validator',
      titleFa: 'اعتبارسنجی بانکی شبا و سوئیفت',
      badge: 'بانک',
      icon: CreditCard,
      color: 'text-teal-600'
    },
    {
      id: 'commodity_benchmarks',
      titleEn: 'Commodity Benchmark & Valuation',
      titleFa: 'قیمت جهانی کامودیتی‌ها',
      badge: 'کامودیتی',
      icon: Fuel,
      color: 'text-amber-600'
    },
  ];

  const allItems = useMemo(() => [
    ...traderServices,
    ...intelligenceServices,
    ...analyticsServices,
    ...officialServices,
    ...ninjaServices
  ], []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    return allItems.filter(item => 
      item.titleFa.toLowerCase().includes(q) ||
      item.titleEn.toLowerCase().includes(q) ||
      item.badge.toLowerCase().includes(q)
    );
  }, [searchQuery, allItems]);

  const renderNavGroup = (title: string, items: typeof traderServices) => {
    const visibleItems = items.filter(item => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return item.titleFa.toLowerCase().includes(q) || item.titleEn.toLowerCase().includes(q);
    });

    if (visibleItems.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="text-[11px] font-bold text-slate-500 mb-1.5 px-2">
          {title}
        </div>
        <div className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id || (item.id === 'merchandise' && (activeSection === 'query' || activeSection === 'analytics' || activeSection === 'downloads'));
            return (
              <button
                key={item.id}
                id={`nav-service-${item.id}`}
                onClick={() => {
                  onSelectSection(item.id);
                  handleClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-start cursor-pointer group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-blue-600'} transition-colors`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{isFa ? item.titleFa : item.titleEn}</span>
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md shrink-0 ms-2 ${
                  isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop overlay */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity animate-fadeIn"
          onClick={handleClose}
        />
      )}

      {/* Slide-in Services Drawer */}
      <aside 
        className={`fixed top-0 bottom-0 ${isFa ? 'right-0 border-l' : 'left-0 border-r'} z-50 w-84 max-w-[85vw] bg-white flex flex-col border-slate-200 shadow-2xl transition-transform duration-200 ease-out ${
          isVisible 
            ? 'translate-x-0' 
            : (isFa ? 'translate-x-full' : '-translate-x-full')
        }`}
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <DiginoronLogo theme="light" size="sm" layout="horizontal" />
          <button 
            id="sidebar-close-btn"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title={isFa ? 'بستن (Esc)' : 'Close (Esc)'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className={`w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isFa ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFa ? 'جستجوی ابزارها و خدمات...' : 'Search tools...'}
              className={`w-full bg-white border border-slate-200 rounded-lg py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 ${
                isFa ? 'pr-8 pl-3' : 'pl-8 pr-3'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs ${isFa ? 'left-2.5' : 'right-2.5'}`}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredItems && filteredItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              {isFa ? 'ابزاری با این عنوان یافت نشد' : 'No tools found'}
            </div>
          ) : (
            <nav>
              {renderNavGroup(isFa ? 'هوش تجاری و میزکار' : 'Commercial Intelligence', traderServices)}
              {renderNavGroup(isFa ? 'تحلیل ریسک و اقتصاد بازار' : 'Risk & Market Intelligence', intelligenceServices)}
              {renderNavGroup(isFa ? 'ابزارهای عملیاتی و ارزی' : 'FX & Operational Tools', ninjaServices)}
              {renderNavGroup(isFa ? 'تراز و تحلیل‌های داده‌ای' : 'Balance & Analytics', analyticsServices)}
              {renderNavGroup(isFa ? 'پایگاه‌های رسمی UN Comtrade' : 'Official UN Datasets', officialServices)}
            </nav>
          )}
        </div>

        {/* Clean Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px] font-medium text-slate-400">Diginoron Trade Suite</span>
          <button
            onClick={() => {
              onOpenKeyModal();
              handleClose();
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            <Key className="w-3 h-3" />
            <span>{isFa ? 'تنظیمات API' : 'API Settings'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};


