import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PresetSelector } from './components/PresetSelector';
import { QueryBuilder } from './components/QueryBuilder';
import { TradeSummaryCards } from './components/TradeSummaryCards';
import { TradeCharts } from './components/TradeCharts';
import { TradeDataTable } from './components/TradeDataTable';
import { AuthLandingPage } from './components/AuthLandingPage';
import { OnDemandQueryBanner } from './components/OnDemandQueryBanner';
import { getSupabaseClient, autoDiscoverSupabaseConfig } from './lib/supabase';

// UN Comtrade specialized view components
import { SmartTradeAdvisorView } from './components/views/SmartTradeAdvisorView';
import { BusinessLetterGeneratorView } from './components/views/BusinessLetterGeneratorView';
import { TraderDashboardView } from './components/views/TraderDashboardView';
import { LandedCostIncotermsView } from './components/views/LandedCostIncotermsView';
import { ExportFinderView } from './components/views/ExportFinderView';
import { ImportSourcingView } from './components/views/ImportSourcingView';
import { CountryDirectoryView } from './components/views/CountryDirectoryView';
import { HsCodeExplorerView } from './components/views/HsCodeExplorerView';
import { WorldShareView } from './components/views/WorldShareView';
import { HistoricalMbsView } from './components/views/HistoricalMbsView';
import { TransportMoTView } from './components/views/TransportMoTView';
import { ServicesTradeView } from './components/views/ServicesTradeView';
import { DataAvailabilityView } from './components/views/DataAvailabilityView';
import { ComtradeReleasesView } from './components/views/ComtradeReleasesView';
import { BilateralAsymmetryView } from './components/views/BilateralAsymmetryView';
import { TradeBalanceToolView } from './components/views/TradeBalanceToolView';

// 8 New Advanced Trade Intelligence & Risk Engines
import { BalassaRcaView } from './components/views/BalassaRcaView';
import { TradeFraudRadarView } from './components/views/TradeFraudRadarView';
import { BecCategoriesView } from './components/views/BecCategoriesView';
import { HhiConcentrationView } from './components/views/HhiConcentrationView';
import { UntappedPotentialView } from './components/views/UntappedPotentialView';
import { MonthlySeasonalityView } from './components/views/MonthlySeasonalityView';
import { TradeBlocsView } from './components/views/TradeBlocsView';
import { CompetitorMatrixView } from './components/views/CompetitorMatrixView';

// API Ninjas Operational Trade & FX Tools
import { NinjaCurrencyConverterView } from './components/views/NinjaCurrencyConverterView';
import { NinjaTradeHolidaysView } from './components/views/NinjaTradeHolidaysView';
import { NinjaMacroIntelligenceView } from './components/views/NinjaMacroIntelligenceView';
import { NinjaTradeFinanceValidatorView } from './components/views/NinjaTradeFinanceValidatorView';
import { NinjaCommodityBenchmarkView } from './components/views/NinjaCommodityBenchmarkView';

import { 
  ComtradeApiResponse, 
  ComtradeRecord, 
  QueryParams, 
  PresetQuery, 
  TradeSummaryStats,
  ActiveServiceSection
} from './types';
import { PRESET_QUERIES } from './data/referenceData';
import { 
  fetchComtradeData, 
  getStoredApiKeys, 
  calculateSummaryStats, 
  checkServerApiStatus 
} from './services/comtradeService';
import { 
  AlertTriangle, 
  Key, 
  RefreshCw, 
  ExternalLink, 
  Layers, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  Database,
  ArrowRight,
  Download,
  BookOpen,
  FileCode,
  Globe2,
  Terminal,
  Activity,
  History,
  Truck,
  Briefcase,
  Newspaper
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<'fa' | 'en'>('fa');
  const [activeSection, setActiveSection] = useState<ActiveServiceSection>('smart_trade_assistant');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [activeKeyType, setActiveKeyType] = useState<'primary' | 'secondary'>('primary');
  const [hasActiveKey, setHasActiveKey] = useState(false);

  // Supabase Authentication & Landing Page State (Strictly gated)
  const [user, setUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('DIGINORON_AUTH_USER');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return null;
  });
  const [showAuthPage, setShowAuthPage] = useState<boolean>(false);

  const [activePresetId, setActivePresetId] = useState<string>('usa-china-trade');
  const [queryParams, setQueryParams] = useState<QueryParams>(PRESET_QUERIES[0].params);
  
  const [hasRunQuery, setHasRunQuery] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ComtradeApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorTip, setErrorTip] = useState<string | null>(null);

  const isFa = language === 'fa';

  // Initialize Supabase Auth Session listener
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupAuth = async () => {
      const supabase = await autoDiscoverSupabaseConfig() || getSupabaseClient();
      if (!supabase) return;

      // Check existing session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setShowAuthPage(false);
        }
      } catch (err) {
        console.warn('Session check warning:', err);
      }

      // Listen for auth events (sign in, sign out, token refresh)
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser(session.user);
            setShowAuthPage(false);
          } else {
            setUser(null);
          }
        });
        unsubscribe = () => subscription.unsubscribe();
      } catch (err) {
        console.warn('Auth state change listener warning:', err);
      }
    };

    setupAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch {}
    try {
      localStorage.removeItem('DIGINORON_AUTH_USER');
    } catch {}
    setUser(null);
    setShowAuthPage(true);
  };

  // Load API key state
  const refreshKeyStatus = useCallback(async () => {
    const stored = getStoredApiKeys();
    setActiveKeyType(stored.activeKeyType);
    
    const serverStatus = await checkServerApiStatus();
    const hasKey = Boolean(stored.activeKey || serverStatus.hasConfiguredKey);
    setHasActiveKey(hasKey);
  }, []);

  useEffect(() => {
    refreshKeyStatus();
  }, [refreshKeyStatus]);

  // Execute query function for merchandise
  const runQuery = useCallback(async (paramsToRun?: QueryParams) => {
    const params = paramsToRun || queryParams;
    setHasRunQuery(true);
    setIsLoading(true);
    setError(null);
    setErrorTip(null);

    try {
      const response = await fetchComtradeData(params);
      setApiResponse(response);
    } catch (err: any) {
      console.error('Comtrade query failed:', err);
      setError(err.message || 'Failed to fetch trade data from UN Comtrade API');
      if (err.message?.includes('401') || err.message?.includes('Unauthorized') || err.message?.includes('Subscription')) {
        setErrorTip(isFa 
          ? 'احتمالاً کلید اشتراک وارد نشده یا منقضی شده است. روی دکمه «مدیریت کلیدها» در بالای صفحه کلیک کنید.' 
          : 'Please set your valid UN Comtrade Subscription Key in the Key Manager (top right).');
      } else if (err.message?.includes('429')) {
        setErrorTip(isFa 
          ? 'محدودیت تعداد درخواست در دقیقه/روز پر شده است. لطفاً به کلید ثانویه (Secondary Key) سوئیچ کنید.' 
          : 'Rate limit reached. Try switching to your Secondary Key in Key Manager.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [queryParams, isFa]);

  // Handle Preset selection
  const handleSelectPreset = (preset: PresetQuery) => {
    setActivePresetId(preset.id);
    setQueryParams(preset.params);
    runQuery(preset.params);
  };

  // Calculate summary stats
  const records: ComtradeRecord[] = apiResponse?.data || [];
  const stats: TradeSummaryStats = calculateSummaryStats(records);

  // User MUST be registered or logged in to access tools!
  // If not logged in, or if user explicitly opened the introduction page, render AuthLandingPage
  if (!user || showAuthPage) {
    return (
      <AuthLandingPage
        language={language}
        currentUser={user}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setShowAuthPage(false);
          try {
            localStorage.setItem('DIGINORON_AUTH_USER', JSON.stringify(loggedInUser));
          } catch {}
        }}
        onLogoClick={() => {
          if (user) {
            setShowAuthPage(false);
          }
        }}
        onClose={user ? () => setShowAuthPage(false) : undefined}
        onToggleLanguage={() => setLanguage(l => (l === 'fa' ? 'en' : 'fa'))}
      />
    );
  }

  return (
    <div className={`flex h-screen bg-slate-50 overflow-hidden text-slate-900 ${isFa ? 'font-sans' : ''}`} dir={isFa ? 'rtl' : 'ltr'}>
      {/* On-Demand Services Drawer Menu (Desktop & Mobile) */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={(section) => {
          setActiveSection(section);
          setIsServicesMenuOpen(false);
        }}
        language={language}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        isOpen={isServicesMenuOpen}
        onClose={() => setIsServicesMenuOpen(false)}
        onCloseMobile={() => setIsServicesMenuOpen(false)}
        hasActiveKey={hasActiveKey}
        activeKeyType={activeKeyType}
      />

      {/* Main Full-Width Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          language={language}
          activeSection={activeSection}
          onSelectSection={(section) => setActiveSection(section as ActiveServiceSection)}
          onToggleLanguage={() => setLanguage(l => (l === 'fa' ? 'en' : 'fa'))}
          onOpenKeyModal={() => setIsKeyModalOpen(true)}
          hasActiveKey={hasActiveKey}
          activeKeyType={activeKeyType}
          isFetching={isLoading}
          onRefresh={() => runQuery()}
          onToggleMobileMenu={() => setIsServicesMenuOpen(prev => !prev)}
          isMenuOpen={isServicesMenuOpen}
          user={user}
          onSignOut={handleSignOut}
          onOpenAuth={() => setShowAuthPage(true)}
          onHomeClick={() => {
            setActiveSection('smart_trade_assistant');
          }}
        />

        {/* Scrollable Dashboard View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Contextual Sub-Tool Breadcrumb Bar (Shown only on deep specialized tools) */}
          {!['smart_trade_assistant', 'business_letter_generator', 'trader_dashboard', 'export_finder', 'merchandise'].includes(activeSection) && (
            <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">{isFa ? 'ابزار تخصصی فعال:' : 'Active Specialized Tool:'}</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  {activeSection === 'incoterms_landed_cost' && (isFa ? '⚖️ قیمت تمام‌شده و اینکوترمز' : '⚖️ Landed Cost & Incoterms')}
                  {activeSection === 'import_sourcing' && (isFa ? '🧭 سورسینگ واردات' : '🧭 Import Sourcing')}
                  {activeSection === 'untapped_potential' && (isFa ? '✨ فرصت‌های پنهان صادراتی' : '✨ Untapped Potential')}
                  {activeSection === 'balassa_rca' && (isFa ? '🏆 مزیت رقابتی بالاسا (RCA)' : '🏆 Balassa RCA')}
                  {activeSection === 'trade_fraud_radar' && (isFa ? '🛡️ دیده‌بان کم‌اظهاری و ارزش گمرکی' : '🛡️ Customs Valuation Radar')}
                  {activeSection === 'bec_categories' && (isFa ? '🏭 تحلیل ماهیت اقتصادی BEC' : '🏭 BEC Categories')}
                  {activeSection === 'hhi_concentration' && (isFa ? '⚖️ تمرکز بازار هرفیندال (HHI)' : '⚖️ HHI Market Concentration')}
                  {activeSection === 'monthly_seasonality' && (isFa ? '📅 تقویم فصلی تجارت' : '📅 Seasonality Calendar')}
                  {activeSection === 'trade_blocs' && (isFa ? '🌐 بلوک‌های تجاری و ترجیحی' : '🌐 Trade Blocs')}
                  {activeSection === 'competitor_matrix' && (isFa ? '👥 ماتریس رقبا' : '👥 Competitor Matrix')}
                  {activeSection === 'bilateral_asymmetry' && (isFa ? '🪞 داده‌های آینه‌ای' : '🪞 Mirror Data')}
                  {!['incoterms_landed_cost','import_sourcing','untapped_potential','balassa_rca','trade_fraud_radar','bec_categories','hhi_concentration','monthly_seasonality','trade_blocs','competitor_matrix','bilateral_asymmetry'].includes(activeSection) && activeSection}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsServicesMenuOpen(true)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  {isFa ? 'انتخاب یا جستجوی ابزار دیگر' : 'All Tools'}
                </button>
                <button
                  onClick={() => setActiveSection('smart_trade_assistant')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  {isFa ? 'بازگشت به دستیار هوشمند' : 'Back to AI Advisor'}
                </button>
              </div>
            </div>
          )}

          {/* 0.0 AI Smart Trade Assistant (Gemini 3.5 Flash Lite Powered) */}
          {activeSection === 'smart_trade_assistant' && (
            <SmartTradeAdvisorView language={language} />
          )}

          {/* 0.05 International Commercial Business Letter Generator (ICC Standards) */}
          {activeSection === 'business_letter_generator' && (
            <BusinessLetterGeneratorView language={language} />
          )}

          {/* 0. Trader Command Center (Dedicated Trader Suite) */}
          {activeSection === 'trader_dashboard' && (
            <TraderDashboardView language={language} />
          )}

          {/* 0.05 Global Landed Cost & Incoterms 2020 Engine (10,000 Concurrent Ready) */}
          {activeSection === 'incoterms_landed_cost' && (
            <LandedCostIncotermsView language={language} />
          )}

          {/* 0.1 Export Target Markets Finder */}
          {activeSection === 'export_finder' && (
            <ExportFinderView language={language} />
          )}

          {/* 0.2 Import Sourcing & Supplier Hub */}
          {activeSection === 'import_sourcing' && (
            <ImportSourcingView language={language} />
          )}

          {/* 0.3 Untapped Export Potential Finder */}
          {activeSection === 'untapped_potential' && (
            <UntappedPotentialView language={language} />
          )}

          {/* 0.4 Balassa Revealed Comparative Advantage */}
          {activeSection === 'balassa_rca' && (
            <BalassaRcaView language={language} />
          )}

          {/* 0.5 Customs Valuation & Fraud Radar */}
          {activeSection === 'trade_fraud_radar' && (
            <TradeFraudRadarView language={language} />
          )}

          {/* 0.6 BEC Categories (Capital, Intermediate, Consumption, Fuels) */}
          {activeSection === 'bec_categories' && (
            <BecCategoriesView language={language} />
          )}

          {/* 0.7 HHI Market Concentration Index */}
          {activeSection === 'hhi_concentration' && (
            <HhiConcentrationView language={language} />
          )}

          {/* 0.8 Monthly Seasonality & Demand Peaks */}
          {activeSection === 'monthly_seasonality' && (
            <MonthlySeasonalityView language={language} />
          )}

          {/* 0.9 Regional Trade Blocs (BRICS, EAEU, ECO, GCC) */}
          {activeSection === 'trade_blocs' && (
            <TradeBlocsView language={language} />
          )}

          {/* 0.10 Competitor Dominance Matrix */}
          {activeSection === 'competitor_matrix' && (
            <CompetitorMatrixView language={language} />
          )}

          {/* 0.11 Global 240+ Countries Directory */}
          {activeSection === 'country_directory' && (
            <CountryDirectoryView language={language} />
          )}

          {/* 0.12 All 99 HS Tariff Chapters Explorer */}
          {activeSection === 'hs_code_explorer' && (
            <HsCodeExplorerView 
              language={language} 
              onSelectChapter={(code) => {
                setActiveSection('trader_dashboard');
              }}
            />
          )}

          {/* API Ninjas 1: Live FX & Trade Currency Converter */}
          {activeSection === 'currency_converter' && (
            <NinjaCurrencyConverterView language={language} />
          )}

          {/* API Ninjas 2: Trade & Customs Holidays Radar */}
          {activeSection === 'trade_holidays' && (
            <NinjaTradeHolidaysView language={language} />
          )}

          {/* API Ninjas 3: Macro Intelligence & Market Capacity */}
          {activeSection === 'macro_capacity' && (
            <NinjaMacroIntelligenceView language={language} />
          )}

          {/* API Ninjas 4: IBAN & SWIFT Trade Finance Validator */}
          {activeSection === 'trade_finance_validator' && (
            <NinjaTradeFinanceValidatorView language={language} />
          )}

          {/* API Ninjas 5: Global Commodity Benchmark & Valuation */}
          {activeSection === 'commodity_benchmarks' && (
            <NinjaCommodityBenchmarkView language={language} />
          )}

          {/* 1. Merchandise Trade (HS) Dashboard */}
          {activeSection === 'merchandise' && (
            <div className="space-y-6">
              {/* Active Preset Indicator & 1-Click Run Bar */}
              <PresetSelector
                language={language}
                onSelectPreset={handleSelectPreset}
                activePresetId={activePresetId}
              />

              {/* Interactive Query Builder Component */}
              <QueryBuilder
                queryParams={queryParams}
                onChangeParams={(newParams) => {
                  setQueryParams(newParams);
                  setActivePresetId('');
                }}
                onSubmitQuery={() => runQuery()}
                isLoading={isLoading}
                language={language}
              />

              {/* Error Banner */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900 shadow-xs">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1.5 flex-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                        {isFa ? 'خطا در ارتباط با API سازمان ملل' : 'UN Comtrade API Error'}
                      </h4>
                      <p className="text-xs font-mono bg-white/70 p-2 rounded-md border border-rose-200 text-rose-950">
                        {error}
                      </p>
                      {errorTip && (
                        <p className="text-xs text-rose-700">
                          💡 <strong>{isFa ? 'راهنما:' : 'Tip:'}</strong> {errorTip}
                        </p>
                      )}
                      <div className="pt-2 flex items-center gap-3">
                        <button
                          onClick={() => setIsKeyModalOpen(true)}
                          className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>{isFa ? 'ورود کلید اشتراک (API Key)' : 'Configure Subscription Keys'}</span>
                        </button>
                        <button
                          onClick={() => runQuery()}
                          className="px-3.5 py-1.5 bg-white hover:bg-rose-100 border border-rose-300 text-rose-800 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{isFa ? 'تلاش مجدد' : 'Retry Query'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Reminder Notice if unconfigured */}
              {!hasActiveKey && !error && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
                  <div className="flex items-center gap-2.5">
                    <Key className="w-4 h-4 text-amber-700 shrink-0" />
                    <div className="text-xs">
                      <span className="font-semibold">
                        {isFa ? 'شناسه ثبت‌نامی:' : 'Registered Account:'}
                      </span>{' '}
                      <span className="font-mono font-bold text-amber-950">DIGINORON@GMAIL.COM</span> •{' '}
                      {isFa 
                        ? 'برای جلوگیری از محدودیت نرخ درخواست، کلیدهای اولیه یا ثانویه را ثبت کنید.' 
                        : 'Enter your primary or secondary subscription key for higher quota limits.'}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsKeyModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-bold shrink-0 shadow-xs transition-colors self-end sm:self-auto"
                  >
                    {isFa ? 'تنظیم کلیدها' : 'Set Keys'}
                  </button>
                </div>
              )}

              {/* Summary Metrics Cards */}
              {records.length > 0 && (
                <TradeSummaryCards
                  stats={stats}
                  language={language}
                  queryTimeMs={apiResponse?.queryTimeMs}
                  statusCode={apiResponse?.statusCode}
                />
              )}

              {/* Visual Charts */}
              {records.length > 0 && (
                <TradeCharts
                  records={records}
                  language={language}
                />
              )}

              {/* Records Table */}
              {records.length > 0 && (
                <TradeDataTable
                  records={records}
                  language={language}
                />
              )}

              {/* On-Demand Initial Ready State */}
              {!hasRunQuery && !isLoading && records.length === 0 && !error && (
                <OnDemandQueryBanner
                  title={isFa ? 'آماده برای استعلام و واکشی داده‌های گمرکی' : 'Ready to Query International Trade Data'}
                  description={isFa
                    ? 'پارامترهای جستجوی مورد نظر خود را در پنل بالا تنظیم کرده و برای استعلام زنده روی دکمه زیر کلیک نمایید.'
                    : 'Configure your target country, commodity, and timeframe above, then click below to execute the query.'}
                  buttonText={isFa ? 'دریافت و استعلام داده‌ها' : 'Execute & Fetch Trade Records'}
                  loading={isLoading}
                  onExecute={() => runQuery()}
                  language={language}
                  paramsSummary={[
                    { label: isFa ? 'گزارش‌دهنده' : 'Reporter', value: queryParams.reporterCode || (isFa ? 'تمام کشورها' : 'All') },
                    { label: isFa ? 'طرف تجاری' : 'Partner', value: queryParams.partnerCode || (isFa ? 'تمام شرکا' : 'All') },
                    { label: isFa ? 'دوره زمانی' : 'Period', value: queryParams.period },
                    { label: isFa ? 'کد تعرفه' : 'Commodity', value: queryParams.cmdCode || 'TOTAL' },
                  ]}
                />
              )}

              {/* Empty state after running query */}
              {hasRunQuery && !isLoading && records.length === 0 && !error && (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto">
                    <Database className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-sm font-bold text-slate-800">
                      {isFa ? 'رکوردی برای این پرس‌وجو یافت نشد' : 'No Trade Records Returned'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isFa 
                        ? 'برای ترکیب کشور، سال و کد کالای انتخابی آماری ثبت نشده است. یکی از نمونه‌های آماده را امتحان نمایید.' 
                        : 'No trade statistics reported for this specific country, commodity, and timeframe combination.'}
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => handleSelectPreset(PRESET_QUERIES[0])}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{isFa ? 'مشاهده تجارت آمریکا - چین' : 'Load USA-China Trade'}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isFa ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. World Trade Share (getWorldShare) */}
          {activeSection === 'world_share' && (
            <WorldShareView language={language} />
          )}

          {/* 3. Historical MBS Series (getMBS) */}
          {activeSection === 'mbs_historical' && (
            <HistoricalMbsView language={language} />
          )}

          {/* 4. Mode of Transport & Tariffline (previewTariffline) */}
          {activeSection === 'transport_mot' && (
            <TransportMoTView language={language} />
          )}

          {/* 5. Bilateral Trade Asymmetry & Mirror Data Tool (getBilateralData) */}
          {activeSection === 'bilateral_asymmetry' && (
            <BilateralAsymmetryView language={language} />
          )}

          {/* 6. Pivoted Trade Balance Tool (getTradeBalance) */}
          {activeSection === 'trade_balance_tool' && (
            <TradeBalanceToolView language={language} />
          )}

          {/* 7. Trade in Services (EBOPS SITS) */}
          {activeSection === 'services' && (
            <ServicesTradeView language={language} />
          )}

          {/* 6. Data Availability Matrix (getDA / getDATariffline) */}
          {activeSection === 'data_availability' && (
            <DataAvailabilityView language={language} />
          )}

          {/* 7. Live UN Releases Feed (getComtradeReleases) */}
          {activeSection === 'releases_feed' && (
            <ComtradeReleasesView language={language} />
          )}

          {/* 8. API Documentation */}
          {activeSection === 'api_docs' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 text-xs text-slate-700">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-blue-500 rounded-full inline-block"></span>
                  <span>{isFa ? 'مستندات و فهرست جامع وب‌سرویس‌های UN Comtrade v1' : 'UN Comtrade v1 API Reference'}</span>
                </h2>
                <p className="text-slate-500 mt-1">
                  {isFa 
                    ? 'تمامی خدمات قابل دسترس در این اپلیکیشن با اتصال مستقیم به سرورهای رسمی سازمان ملل متحد' 
                    : 'All UN Comtrade API endpoints implemented directly in this application'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Key className="w-4 h-4 text-blue-600" />
                    <span>{isFa ? 'حساب کاربری ثبت شده' : 'User Credentials'}</span>
                  </h3>
                  <p><strong>Account Email:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-600 font-mono">DIGINORON@GMAIL.COM</code></p>
                  <p><strong>Primary Key:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-mono">Ocp-Apim-Subscription-Key</code></p>
                  <p><strong>Status:</strong> {hasActiveKey ? (isFa ? 'متصل و فعال' : 'Active') : (isFa ? 'نیاز به کلید' : 'Unconfigured')}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-600" />
                    <span>{isFa ? 'لیست کامل اندپوینت‌های پیاده‌سازی شده' : 'Integrated Endpoints'}</span>
                  </h3>
                  <ul className="space-y-1 font-mono text-[11px] text-slate-700">
                    <li>• <span className="text-blue-600">GET</span> /data/v1/get/C/A/HS (Merchandise Trade)</li>
                    <li>• <span className="text-emerald-600">GET</span> /public/v1/getWorldShare (World Share)</li>
                    <li>• <span className="text-amber-600">GET</span> /public/v1/getMBS (Historical Series 1946-)</li>
                    <li>• <span className="text-indigo-600">GET</span> /public/v1/previewTariffline (MoT & Consignment)</li>
                    <li>• <span className="text-teal-600">GET</span> /data/v1/get/S/A/EB (Trade in Services)</li>
                    <li>• <span className="text-cyan-600">GET</span> /public/v1/getDA (Data Availability)</li>
                    <li>• <span className="text-sky-600">GET</span> /public/v1/getComtradeReleases (Releases Feed)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Subscription Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        language={language}
        onKeysUpdated={() => {
          refreshKeyStatus();
          runQuery();
        }}
      />
    </div>
  );
}

