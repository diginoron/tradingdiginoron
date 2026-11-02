import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Clock, 
  ShieldCheck, 
  Play, 
  Database, 
  Cpu, 
  Globe2, 
  Zap, 
  Search, 
  Terminal, 
  ChevronRight, 
  Layers, 
  Server,
  Code2,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

interface ToolStatusItem {
  id: string;
  name: string;
  nameFa: string;
  category: 'core' | 'comtrade' | 'ai' | 'ninjas' | 'database';
  endpoint: string;
  method: 'GET' | 'POST';
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTimeMs: number | null;
  httpStatus: number | null;
  lastCheckedAt: string | null;
  errorMessage: string | null;
  hasActiveIncident: boolean;
  incidentDetails?: any;
}

interface HealthSummary {
  status: 'healthy' | 'degraded' | 'unhealthy';
  totalRegisteredTools: number;
  lastCheckedAt: string | null;
  uptimePercentage: number;
  averageResponseTimeMs: number;
  openIncidentsCount: number;
  latestRun: any;
  systemOverview: {
    healthyTools: number;
    degradedTools: number;
    unhealthyTools: number;
  };
  databaseConnected: boolean;
}

interface IncidentItem {
  id?: string;
  tool_id: string;
  tool_name: string;
  incident_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  error_message: string;
  first_seen_at?: string;
  last_seen_at: string;
  resolved_at?: string | null;
  consecutive_failures: number;
  occurrences: number;
}

interface HealthMonitoringDashboardProps {
  language: 'fa' | 'en';
}

export const HealthMonitoringDashboardView: React.FC<HealthMonitoringDashboardProps> = ({ language }) => {
  const isFa = language === 'fa';

  const [activeTab, setActiveTab] = useState<'tools' | 'incidents' | 'api_guide' | 'sql'>('tools');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [testLevel, setTestLevel] = useState<'basic' | 'functional' | 'integration'>('basic');

  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [tools, setTools] = useState<ToolStatusItem[]>([]);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [selectedToolDetail, setSelectedToolDetail] = useState<any | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Fetch Summary & Tools
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, toolsRes, incRes] = await Promise.all([
        fetch('/api/health-monitor?action=summary').then(r => r.json()).catch(() => null),
        fetch('/api/health-monitor?action=tools').then(r => r.json()).catch(() => null),
        fetch('/api/health-monitor?action=incidents&status=all').then(r => r.json()).catch(() => null),
      ]);

      if (sumRes?.data) setSummary(sumRes.data);
      if (toolsRes?.data) setTools(toolsRes.data);
      if (incRes?.data) setIncidents(incRes.data);
    } catch (err) {
      console.error('[Health Dashboard Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Trigger Monitoring Run
  const handleRunChecks = async (level: 'basic' | 'functional' | 'integration' = testLevel) => {
    setIsRunningTests(true);
    setRunMessage(isFa ? 'در حال اجرای موازی تست سلامت ابزارها...' : 'Executing parallel health checks...');
    try {
      const res = await fetch(`/api/health-monitor?action=run&testType=${level}&source=manual`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.skipped) {
        setRunMessage(isFa ? 'اجرای تست متوقف شد: فرآیند دیگری هم‌اکنون در حال اجراست (Concurrency Lock).' : 'Run skipped: Lock is active.');
      } else if (data.success) {
        setRunMessage(
          isFa
            ? `پایش با موفقیت پایان یافت: ${data.healthy} سالم، ${data.degraded} کند، ${data.unhealthy} خطا`
            : `Completed: ${data.healthy} healthy, ${data.degraded} degraded, ${data.unhealthy} unhealthy`
        );
      }
      await loadData();
    } catch (err: any) {
      setRunMessage(isFa ? `خطا در اجرای تست: ${err.message}` : `Execution error: ${err.message}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleInspectTool = async (toolId: string) => {
    try {
      const res = await fetch(`/api/health-monitor?action=tool-detail&toolId=${toolId}`);
      const data = await res.json();
      if (data?.data) {
        setSelectedToolDetail(data.data);
      }
    } catch (err) {
      console.warn('Error fetching tool detail:', err);
    }
  };

  const filteredTools = tools.filter(t => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.nameFa.toLowerCase().includes(q) || t.endpoint.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'core': return { labelFa: 'هسته سیستم', labelEn: 'Core Gateway', color: 'bg-slate-100 text-slate-700' };
      case 'database': return { labelFa: 'سوپابیس', labelEn: 'Database', color: 'bg-emerald-100 text-emerald-800' };
      case 'comtrade': return { labelFa: 'سازمان ملل', labelEn: 'UN Comtrade', color: 'bg-blue-100 text-blue-800' };
      case 'ai': return { labelFa: 'هوش مصنوعی', labelEn: 'AvalAI / LLM', color: 'bg-purple-100 text-purple-800' };
      case 'ninjas': return { labelFa: 'شاخص نینجا', labelEn: 'API Ninjas', color: 'bg-amber-100 text-amber-800' };
      default: return { labelFa: cat, labelEn: cat, color: 'bg-slate-100 text-slate-600' };
    }
  };

  const sqlCodeToCopy = `-- ==============================================================================
-- AUTOMATED HEALTH MONITORING SYSTEM TABLES FOR SUPABASE
-- Run in Supabase Dashboard -> SQL Editor
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.health_monitor_runs (
  id TEXT PRIMARY KEY,
  started_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMPTZ,
  trigger_source TEXT DEFAULT 'manual',
  test_type TEXT DEFAULT 'basic',
  total_tools INTEGER DEFAULT 0,
  healthy_count INTEGER DEFAULT 0,
  degraded_count INTEGER DEFAULT 0,
  unhealthy_count INTEGER DEFAULT 0,
  unknown_count INTEGER DEFAULT 0,
  run_status TEXT DEFAULT 'completed',
  execution_duration_ms INTEGER DEFAULT 0,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS public.health_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id TEXT REFERENCES public.health_monitor_runs(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL,
  test_type TEXT DEFAULT 'basic',
  response_time_ms INTEGER DEFAULT 0,
  http_status INTEGER DEFAULT 0,
  error_code TEXT,
  error_message TEXT,
  checked_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.health_incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  error_message TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 1,
  occurrences INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_health_checks_tool_checked ON public.health_checks (tool_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_checks_status ON public.health_checks (status);
CREATE INDEX IF NOT EXISTS idx_health_incidents_tool_status ON public.health_incidents (tool_id, status);
CREATE INDEX IF NOT EXISTS idx_health_monitor_runs_started ON public.health_monitor_runs (started_at DESC);

ALTER TABLE public.health_monitor_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to health_monitor_runs" ON public.health_monitor_runs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to health_checks" ON public.health_checks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to health_incidents" ON public.health_incidents FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read health runs" ON public.health_monitor_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read health checks" ON public.health_checks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read health incidents" ON public.health_incidents FOR SELECT TO authenticated USING (true);

GRANT ALL ON public.health_monitor_runs TO service_role;
GRANT ALL ON public.health_checks TO service_role;
GRANT ALL ON public.health_incidents TO service_role;
GRANT SELECT ON public.health_monitor_runs TO authenticated;
GRANT SELECT ON public.health_checks TO authenticated;
GRANT SELECT ON public.health_incidents TO authenticated;`;

  return (
    <div className="space-y-6 pb-12" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 -top-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isFa ? 'پایش دائمی هر ۳۰ دقیقه (GitHub Actions + Vercel Cron)' : 'Continuous 30-min monitoring'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isFa ? 'سامانه هوشمند پایش سلامت و تست خودکار اپلیکیشن' : 'Automated Health Monitoring System'}
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
              {isFa
                ? 'ارزیابی خودکار و مستمر ۲۵ ابزار و سرویس فعال تجاری، دیتابیس Supabase، هوش مصنوعی AvalAI و شاخص‌های مالی بدون توقف و مدیریت خودکار رخدادها.'
                : 'Continuous automated testing of 25 trade intelligence tools, Supabase database, AvalAI LLM, and API Ninjas with incident management.'}
            </p>
          </div>

          {/* Quick Action Control */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700 text-xs">
              <button
                onClick={() => setTestLevel('basic')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  testLevel === 'basic' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
                title={isFa ? 'سبک، سریع و هزینه توکن صفر' : 'Smoke check, 0 tokens'}
              >
                {isFa ? 'سبک (Basic)' : 'Basic'}
              </button>
              <button
                onClick={() => setTestLevel('functional')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  testLevel === 'functional' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
                title={isFa ? 'ارزیابی ساختار پاسخ و اعتبارسنجی فیلدها' : 'Schema validation'}
              >
                {isFa ? 'عملیاتی (Functional)' : 'Functional'}
              </button>
              <button
                onClick={() => setTestLevel('integration')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  testLevel === 'integration' ? 'bg-purple-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
                title={isFa ? 'تست سرتاسری اتصال زنده هوش مصنوعی و سرویس‌ها' : 'Deep probe'}
              >
                {isFa ? 'عمیق (Integration)' : 'Integration'}
              </button>
            </div>

            <button
              onClick={() => handleRunChecks()}
              disabled={isRunningTests}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Play className={`w-4 h-4 ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>{isRunningTests ? (isFa ? 'در حال اجرا...' : 'Running...') : (isFa ? 'اجرای فوری تست‌ها' : 'Run Checks Now')}</span>
            </button>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer border border-slate-700"
              title={isFa ? 'بروزرسانی داده‌ها' : 'Refresh'}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {runMessage && (
          <div className="mt-4 p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{runMessage}</span>
            </div>
            <button onClick={() => setRunMessage(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tools */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              {isFa ? 'ابزارهای فعال تحت پایش' : 'Total Monitored Tools'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800">{summary?.totalRegisteredTools || 25}</span>
              <span className="text-xs text-slate-400 font-medium">{isFa ? 'ابزار تجاری' : 'tools'}</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Uptime Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              {isFa ? 'نرخ دسترس‌پذیری (Uptime)' : 'System Uptime Rate'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{summary?.uptimePercentage ?? 100}%</span>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                {isFa ? 'پایدار' : 'Optimal'}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              {isFa ? 'میانگین زمان پاسخ‌دهی' : 'Average Response Time'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800">{summary?.averageResponseTimeMs || 0}</span>
              <span className="text-xs text-slate-400 font-medium">ms</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Incidents Count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              {isFa ? 'رخدادهای خطا (Incidents)' : 'Active Incidents'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${summary?.openIncidentsCount ? 'text-rose-600' : 'text-slate-800'}`}>
                {summary?.openIncidentsCount ?? 0}
              </span>
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                summary?.openIncidentsCount ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {summary?.openIncidentsCount ? (isFa ? 'نیاز به بررسی' : 'Active') : (isFa ? 'همه سالم' : 'Clean')}
              </span>
            </div>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            summary?.openIncidentsCount ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('tools')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'tools'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{isFa ? 'وضعیت لحظه‌ای ابزارها' : 'Monitored Tools Status'}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{filteredTools.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('incidents')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'incidents'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>{isFa ? 'تاریخچه رخدادها و خطاها' : 'Incidents History'}</span>
          {incidents.filter(i => i.status !== 'resolved').length > 0 && (
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 font-extrabold">
              {incidents.filter(i => i.status !== 'resolved').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('api_guide')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'api_guide'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>{isFa ? 'راهنمای API مدیریتی و کرون' : 'Management API & Cron'}</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'sql'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>{isFa ? 'اسکریپت SQL سوپابیس' : 'Supabase SQL'}</span>
        </button>
      </div>

      {/* TAB 1: TOOLS LIST */}
      {activeTab === 'tools' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', labelFa: 'همه ابزارها', labelEn: 'All' },
                { id: 'core', labelFa: 'هسته سیستم', labelEn: 'Core' },
                { id: 'database', labelFa: 'سوپابیس', labelEn: 'Database' },
                { id: 'comtrade', labelFa: 'کامترید سازمان ملل', labelEn: 'UN Comtrade' },
                { id: 'ai', labelFa: 'هوش مصنوعی AvalAI', labelEn: 'AI Services' },
                { id: 'ninjas', labelFa: 'ابزارهای نینجا', labelEn: 'Ninjas' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isFa ? cat.labelFa : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isFa ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isFa ? 'جستجوی ابزار یا Endpoint...' : 'Search tools...'}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 ${
                  isFa ? 'pr-9 pl-3' : 'pl-9 pr-3'
                }`}
              />
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredTools.map(tool => {
              const catBadge = getCategoryBadge(tool.category);
              const isHealthy = tool.status === 'healthy';
              const isDegraded = tool.status === 'degraded';
              const isUnhealthy = tool.status === 'unhealthy';

              return (
                <div
                  key={tool.id}
                  onClick={() => handleInspectTool(tool.id)}
                  className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Category + Status Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${catBadge.color}`}>
                        {isFa ? catBadge.labelFa : catBadge.labelEn}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isHealthy && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isFa ? 'سالم' : 'Healthy'}</span>
                          </span>
                        )}
                        {isDegraded && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>{isFa ? 'دارای اختلال' : 'Degraded'}</span>
                          </span>
                        )}
                        {isUnhealthy && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>{isFa ? 'خطا' : 'Unhealthy'}</span>
                          </span>
                        )}
                        {tool.status === 'unknown' && (
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {isFa ? 'تست نشده' : 'Unknown'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tool Name */}
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">
                      {isFa ? tool.nameFa : tool.name}
                    </h3>

                    {/* Endpoint path */}
                    <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-1.5 rounded-lg my-2 truncate" title={tool.endpoint}>
                      <span className="font-bold text-blue-600 me-1.5">{tool.method}</span>
                      <span>{tool.endpoint}</span>
                    </div>

                    {tool.errorMessage && (
                      <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg line-clamp-2 my-1">
                        {tool.errorMessage}
                      </p>
                    )}
                  </div>

                  {/* Bottom Metas */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{tool.responseTimeMs !== null ? `${tool.responseTimeMs} ms` : '—'}</span>
                    </div>
                    {tool.httpStatus && (
                      <span className={`font-mono font-semibold ${tool.httpStatus < 300 ? 'text-emerald-600' : 'text-slate-600'}`}>
                        HTTP {tool.httpStatus}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INCIDENTS HISTORY */}
      {activeTab === 'incidents' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {isFa ? 'مدیریت رخدادها و اختلالات سیستمی (Incidents Tracker)' : 'Incident Lifecycle Management'}
            </h3>
            <span className="text-xs text-slate-500">
              {isFa ? 'ثبت خودکار هنگام خطا و رفع خودکار با بازگشت سلامت' : 'Auto-opened on failure & auto-resolved on recovery'}
            </span>
          </div>

          {incidents.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>{isFa ? 'هیچ رخداد یا خطایی ثبت نشده است؛ تمام سرویس‌ها در سلامت کامل هستند.' : 'No incidents recorded.'}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3 text-start">{isFa ? 'ابزار' : 'Tool'}</th>
                    <th className="p-3 text-start">{isFa ? 'نوع رخداد' : 'Type'}</th>
                    <th className="p-3 text-start">{isFa ? 'شدت' : 'Severity'}</th>
                    <th className="p-3 text-start">{isFa ? 'وضعیت' : 'Status'}</th>
                    <th className="p-3 text-start">{isFa ? 'پیام خطا' : 'Error Message'}</th>
                    <th className="p-3 text-start">{isFa ? 'تعداد تکرار' : 'Occurrences'}</th>
                    <th className="p-3 text-start">{isFa ? 'آخرین مشاهده' : 'Last Seen'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incidents.map((inc, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{inc.tool_name}</td>
                      <td className="p-3 font-mono text-slate-600">{inc.incident_type}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                          inc.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {inc.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate" title={inc.error_message}>
                        {inc.error_message}
                      </td>
                      <td className="p-3 font-bold text-slate-700">{inc.occurrences}</td>
                      <td className="p-3 text-slate-400">
                        {new Date(inc.last_seen_at).toLocaleTimeString(isFa ? 'fa-IR' : 'en-US')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MANAGEMENT API & CRON GUIDE */}
      {activeTab === 'api_guide' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-2">
              {isFa ? 'مسیرهای API مدیریتی سیستم پایش سلامت' : 'Management API Endpoints'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {isFa
                ? 'تمام درخواست‌ها از طریق یک فایل یکپارچه (/api/health-monitor) و با پارامتر ?action=... مدیریت می‌شوند تا سقف ۱۲ فانکشن پلن رایگان ورسل هرگز پر نشود.'
                : 'All actions run via unified /api/health-monitor maintaining Vercel Hobby plan 12-function limit.'}
            </p>

            <div className="space-y-3 font-mono text-xs">
              {[
                { method: 'GET', url: '/api/health-monitor?action=summary', descFa: 'خلاصه وضعیت سیستم، آپ‌تایم و میانگین سرعت' },
                { method: 'GET', url: '/api/health-monitor?action=tools', descFa: 'فهرست وضعیت لحظه‌ای ۲۵ ابزار با تاخیر و وضعیت رخداد' },
                { method: 'GET', url: '/api/health-monitor?action=tool-detail&toolId=core_gateway_health', descFa: 'جزئیات سلامت و تاریخچه تست‌های یک ابزار خاص' },
                { method: 'GET', url: '/api/health-monitor?action=incidents&status=open', descFa: 'لیست رخدادهای فعال و خطاهای باز' },
                { method: 'POST', url: '/api/health-monitor?action=run&testType=basic', descFa: 'اجرای تست زمان‌بندی‌شده یا دستی با قفل همزمانی' },
                { method: 'POST', url: '/api/health-monitor?action=cleanup', descFa: 'اجرای پاکسازی و نگهداری داده‌ها (Data Retention)' },
              ].map((api, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">{api.method}</span>
                    <span className="text-slate-800 font-semibold">{api.url}</span>
                  </div>
                  <span className="font-sans text-[11px] text-slate-500">{api.descFa}</span>
                </div>
              ))}
            </div>
          </div>

          {/* GitHub Actions 30-min setup explanation */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-2">
              {isFa ? 'زمان‌بندی دقیق هر ۳۰ دقیقه با GitHub Actions' : 'GitHub Actions 30-Minute Cron'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isFa
                ? 'فایل Workflow استاندارد در مسیر .github/workflows/health-monitor.yml ایجاد شده است. این گردش کار بدون محدودیت پلن‌های سرورلس ورسل، دقیقاً هر ۳۰ دقیقه اجرا شده و به سرور درخواست تست ارسال می‌نماید.'
                : 'Configured in .github/workflows/health-monitor.yml to run every 30 minutes without Vercel Hobby restrictions.'}
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: SUPABASE SQL SCRIPT */}
      {activeTab === 'sql' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {isFa ? 'کد کامل SQL برای اجرا در سوپابیس' : 'Supabase SQL Tables & RLS'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isFa
                  ? 'این کد را در پنل Supabase -> SQL Editor اجرا کنید تا جداول، ایندکس‌ها و پالیسی‌های امنیتی RLS ایجاد شوند.'
                  : 'Execute this SQL in Supabase Dashboard SQL Editor.'}
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sqlCodeToCopy);
                setCopiedSql(true);
                setTimeout(() => setCopiedSql(false), 2500);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? (isFa ? 'کپی شد!' : 'Copied!') : (isFa ? 'کپی کد SQL' : 'Copy SQL')}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed">
            {sqlCodeToCopy}
          </pre>
        </div>
      )}

      {/* Tool Detail Modal */}
      {selectedToolDetail && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedToolDetail.tool.category}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  {isFa ? selectedToolDetail.tool.nameFa : selectedToolDetail.tool.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedToolDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">{isFa ? 'درصد پایداری' : 'Uptime'}</span>
                <span className="text-base font-black text-emerald-600">{selectedToolDetail.uptimePercentage}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">{isFa ? 'زمان آخرین پاسخ' : 'Last Latency'}</span>
                <span className="text-base font-black text-slate-800">
                  {selectedToolDetail.latestResponseTimeMs ? `${selectedToolDetail.latestResponseTimeMs} ms` : '—'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">{isFa ? 'مسیر فراخوانی' : 'Endpoint'}</span>
              <div className="p-2 bg-slate-100 rounded-lg text-xs font-mono text-slate-700 break-all">
                {selectedToolDetail.tool.method} {selectedToolDetail.tool.endpoint}
              </div>
            </div>

            {/* History Preview */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">{isFa ? 'تست‌های اخیر' : 'Recent Checks'}</span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {selectedToolDetail.history?.map((h: any, i: number) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-50 text-[11px] flex items-center justify-between">
                    <span className="font-mono text-slate-500">
                      {new Date(h.checked_at).toLocaleTimeString(isFa ? 'fa-IR' : 'en-US')}
                    </span>
                    <span className={`font-bold ${h.status === 'healthy' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {h.status} ({h.response_time_ms}ms)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedToolDetail(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {isFa ? 'بستن' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
