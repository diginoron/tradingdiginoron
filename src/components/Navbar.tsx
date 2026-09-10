import React from 'react';
import { 
  Key, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle, 
  Globe2, 
  ChevronDown, 
  LayoutGrid, 
  User as UserIcon, 
  LogOut,
  BrainCircuit,
  Zap,
  Target,
  Database
} from 'lucide-react';
import { DiginoronLogo } from './DiginoronLogo';
import { ActiveServiceSection } from '../types';

interface NavbarProps {
  language: 'fa' | 'en';
  onToggleLanguage: () => void;
  onOpenKeyModal: () => void;
  hasActiveKey: boolean;
  activeKeyType: 'primary' | 'secondary';
  isFetching: boolean;
  onRefresh: () => void;
  onToggleMobileSidebar?: () => void;
  onToggleMobileMenu?: () => void;
  isMenuOpen?: boolean;
  user?: any;
  onSignOut?: () => void;
  onOpenAuth?: () => void;
  onHomeClick?: () => void;
  activeSection?: ActiveServiceSection | string;
  onSelectSection?: (section: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  onOpenKeyModal,
  hasActiveKey,
  activeKeyType,
  isFetching,
  onRefresh,
  onToggleMobileSidebar,
  onToggleMobileMenu,
  isMenuOpen = false,
  user,
  onSignOut,
  onOpenAuth,
  onHomeClick,
  activeSection = 'smart_trade_assistant',
  onSelectSection,
}) => {
  const isFa = language === 'fa';
  const handleToggleMenu = onToggleMobileMenu || onToggleMobileSidebar;

  const mainTabs = [
    { id: 'smart_trade_assistant', labelFa: 'دستیار هوشمند AI', labelEn: 'AI Advisor', icon: BrainCircuit },
    { id: 'trader_dashboard', labelFa: 'میزکار بازرگان', labelEn: 'Dashboard', icon: Zap },
    { id: 'export_finder', labelFa: 'بازارهای صادراتی', labelEn: 'Export Finder', icon: Target },
    { id: 'merchandise', labelFa: 'استعلام UN Comtrade', labelEn: 'UN Comtrade', icon: Database },
  ];

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Brand & Main Navigation */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0">
        {/* Brand Logo */}
        <button
          id="navbar-logo-home-btn"
          type="button"
          onClick={() => {
            if (onSelectSection) onSelectSection('smart_trade_assistant');
            else if (onHomeClick) onHomeClick();
          }}
          className="flex items-center hover:opacity-90 transition-opacity cursor-pointer p-1 rounded-lg focus:outline-hidden"
          title={isFa ? 'صفحه اصلی دستیار بازرگانی' : 'Home'}
        >
          <DiginoronLogo theme="light" size="sm" layout="horizontal" />
        </button>

        {/* Center Primary Segmented Navigation (Desktop) */}
        {onSelectSection && (
          <nav className="hidden xl:flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/70 text-xs font-semibold">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  type="button"
                  onClick={() => onSelectSection(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{isFa ? tab.labelFa : tab.labelEn}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Right Controls: Tools Drawer, API Key, Lang, User */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* All Tools Drawer Trigger */}
        <button
          id="services-menu-dropdown-btn"
          type="button"
          onClick={handleToggleMenu}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            isMenuOpen 
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
          title={isFa ? 'مشاهده تمامی ابزارهای تحلیلی و گمرکی' : 'All Tools & Datasets'}
        >
          <LayoutGrid className={`w-3.5 h-3.5 ${isMenuOpen ? 'text-white' : 'text-blue-600'}`} />
          <span className="hidden sm:inline">{isFa ? 'همه ابزارها' : 'All Tools'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Subscription Key Pill */}
        <button
          id="api-key-manager-btn"
          onClick={onOpenKeyModal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            hasActiveKey
              ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
          }`}
          title={isFa ? 'تنظیمات کلید اشتراک UN Comtrade' : 'API Key Settings'}
        >
          <Key className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden md:inline text-[11px]">
            {hasActiveKey 
              ? (isFa ? 'کلید فعال' : 'Key Active')
              : (isFa ? 'کلید API' : 'Add Key')}
          </span>
          {hasActiveKey ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          )}
        </button>

        {/* Language Switcher */}
        <button
          id="language-toggle-btn"
          onClick={onToggleLanguage}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title={isFa ? 'Switch to English' : 'تغییر به فارسی'}
        >
          <Globe2 className="w-3.5 h-3.5 text-slate-500" />
          <span>{isFa ? 'EN' : 'فا'}</span>
        </button>

        {/* User Status / Sign In */}
        {user ? (
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
            </div>
            <span className="text-[11px] font-medium text-slate-700 hidden lg:inline max-w-[100px] truncate">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </span>
            {onSignOut && (
              <button
                id="user-signout-btn"
                type="button"
                onClick={onSignOut}
                className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                title={isFa ? 'خروج از حساب' : 'Sign Out'}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : onOpenAuth ? (
          <button
            id="navbar-open-auth-btn"
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>{isFa ? 'ورود' : 'Sign In'}</span>
          </button>
        ) : null}

        {/* Conditional refresh action for merchandise query */}
        {activeSection === 'merchandise' && (
          <button
            id="execute-query-btn"
            onClick={onRefresh}
            disabled={isFetching}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isFetching ? (isFa ? 'در حال دریافت...' : 'Fetching...') : (isFa ? 'استعلام مجدد' : 'Refresh')}</span>
          </button>
        )}
      </div>
    </header>
  );
};

