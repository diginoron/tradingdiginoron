import React, { useState, useEffect } from 'react';
import { Key, X, Check, AlertCircle, RefreshCw, ShieldCheck, ExternalLink, Mail, Copy, Sparkles, Coins, Globe } from 'lucide-react';
import { getStoredApiKeys, saveStoredApiKeys, testSubscriptionKey } from '../services/comtradeService';
import { getStoredNinjaKey, saveStoredNinjaKey, testNinjaKey } from '../services/ninjaService';
import { DiginoronLogo } from './DiginoronLogo';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'fa' | 'en';
  onKeysUpdated: () => void;
  defaultTab?: 'comtrade' | 'ninjas';
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  language,
  onKeysUpdated,
  defaultTab = 'comtrade',
}) => {
  const isFa = language === 'fa';
  const [activeTab, setActiveTab] = useState<'comtrade' | 'ninjas'>(defaultTab);

  // UN Comtrade State
  const [primaryKey, setPrimaryKey] = useState('');
  const [secondaryKey, setSecondaryKey] = useState('');
  const [activeType, setActiveType] = useState<'primary' | 'secondary'>('primary');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    valid?: boolean;
    message?: string;
    durationMs?: number;
    recordCount?: number;
  } | null>(null);

  // API Ninjas State
  const [ninjaKey, setNinjaKey] = useState('');
  const [isTestingNinja, setIsTestingNinja] = useState(false);
  const [ninjaTestResult, setNinjaTestResult] = useState<{
    valid?: boolean;
    message?: string;
    durationMs?: number;
    statusCode?: number;
  } | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredApiKeys();
      setPrimaryKey(stored.primaryKey);
      setSecondaryKey(stored.secondaryKey);
      setActiveType(stored.activeKeyType);
      
      const storedNinja = getStoredNinjaKey();
      setNinjaKey(storedNinja);

      setTestResult(null);
      setNinjaTestResult(null);
      setSavedSuccess(false);
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveStoredApiKeys(primaryKey, secondaryKey, activeType);
    saveStoredNinjaKey(ninjaKey);
    setSavedSuccess(true);
    onKeysUpdated();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleTestKey = async () => {
    const keyToTest = activeType === 'primary' ? primaryKey : secondaryKey;
    if (!keyToTest || keyToTest.trim().length === 0) {
      setTestResult({
        valid: false,
        message: isFa ? 'لطفا ابتدا کلید را در فیلد مربوطه وارد کنید.' : 'Please enter a subscription key to test.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSubscriptionKey(keyToTest.trim());
      setTestResult(res);
    } catch (e: any) {
      setTestResult({
        valid: false,
        message: e.message || 'Failed to connect to UN Comtrade'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestNinjaKey = async () => {
    if (!ninjaKey || ninjaKey.trim().length === 0) {
      setNinjaTestResult({
        valid: false,
        message: isFa ? 'لطفاً کلید API Ninjas را وارد کنید.' : 'Please enter your API Ninjas key.'
      });
      return;
    }

    setIsTestingNinja(true);
    setNinjaTestResult(null);
    try {
      const res = await testNinjaKey(ninjaKey.trim());
      setNinjaTestResult(res);
    } catch (e: any) {
      setNinjaTestResult({
        valid: false,
        message: e.message || 'Error connecting to API Ninjas'
      });
    } finally {
      setIsTestingNinja(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="api-key-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden transition-all"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DiginoronLogo theme="dark" size="sm" layout="icon" />
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>{isFa ? 'مدیریت کلیدهای API و اتصال داده‌ها' : 'API Keys & Integration Manager'}</span>
              </h3>
              <p className="text-xs text-slate-300">
                {isFa ? 'پیکربندی کلیدهای UN Comtrade و API Ninjas' : 'Configure UN Comtrade and API Ninjas credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('comtrade')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'comtrade'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isFa ? 'UN Comtrade سازمان ملل' : 'UN Comtrade'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ninjas')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer relative ${
              activeTab === 'ninjas'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{isFa ? 'سرویس‌های API Ninjas' : 'API Ninjas'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-100 text-emerald-800 font-mono">
              New
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {activeTab === 'comtrade' ? (
            <>
              {/* UN Comtrade Tab */}
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-sky-700 mt-0.5 shrink-0" />
                <div className="text-xs text-sky-900 space-y-1">
                  <p className="font-semibold">
                    {isFa ? 'اتصال به پورتال رسمی UN Comtrade' : 'Official UN Comtrade API Connection'}
                  </p>
                  <p className="text-sky-700">
                    {isFa 
                      ? 'کلیدهای دریافت شده از پرتال Comtrade Developer را در این بخش وارد و مدیریت کنید.'
                      : 'Configure and manage your UN Comtrade Developer subscription keys.'}
                  </p>
                </div>
              </div>

              {/* Active Key Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  {isFa ? 'انتخاب کلید پیش‌فرض برای درخواست‌ها:' : 'Select Active Key for API requests:'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveType('primary')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                      activeType === 'primary'
                        ? 'bg-sky-50 border-sky-500 text-sky-800 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{isFa ? 'کلید اولیه (Primary Key)' : 'Primary Key'}</span>
                    {activeType === 'primary' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveType('secondary')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                      activeType === 'secondary'
                        ? 'bg-sky-50 border-sky-500 text-sky-800 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{isFa ? 'کلید ثانویه (Secondary Key)' : 'Secondary Key'}</span>
                    {activeType === 'secondary' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </button>
                </div>
              </div>

              {/* Primary Key Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-800">
                    {isFa ? 'کلید اشتراک اولیه (Primary Key):' : 'Primary Subscription Key:'}
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">Ocp-Apim-Subscription-Key</span>
                </div>
                <input
                  id="input-primary-key"
                  type="password"
                  placeholder={isFa ? 'مثال: 3a9b1c7...' : 'e.g. 3a9b1c7...'}
                  value={primaryKey}
                  onChange={(e) => setPrimaryKey(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50 text-slate-900"
                />
              </div>

              {/* Secondary Key Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-800">
                    {isFa ? 'کلید اشتراک ثانویه (Secondary Key - پشتیبان):' : 'Secondary Subscription Key (Backup):'}
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">Backup key</span>
                </div>
                <input
                  id="input-secondary-key"
                  type="password"
                  placeholder={isFa ? 'کلید ثانویه (در صورت نیاز به جابجایی سهمیه)' : 'Secondary key (for quota rotation)'}
                  value={secondaryKey}
                  onChange={(e) => setSecondaryKey(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50 text-slate-900"
                />
              </div>

              {/* Test connection result */}
              {testResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.valid 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}>
                  {testResult.valid ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">{testResult.message}</p>
                    {testResult.durationMs && (
                      <p className="text-[11px] opacity-80">
                        {isFa ? `زمان پاسخ سرور سازمان ملل: ${testResult.durationMs} میلی‌ثانیه` : `UN API Latency: ${testResult.durationMs}ms`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Direct Link to Portal */}
              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>{isFa ? 'پرتال ثبت‌نام و دریافت کلید Comtrade:' : 'Comtrade Developer Portal:'}</span>
                <a
                  href="https://comtradedeveloper.un.org/developer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:text-sky-800 font-semibold inline-flex items-center gap-1"
                >
                  <span>comtradedeveloper.un.org</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </>
          ) : (
            <>
              {/* API Ninjas Tab */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
                <Coins className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div className="text-xs text-emerald-900 space-y-1">
                  <p className="font-semibold">
                    {isFa ? 'اتصال هوشمند به سرویس‌های تجاری API Ninjas' : 'API Ninjas Trade Intelligence Suite'}
                  </p>
                  <p className="text-emerald-700">
                    {isFa 
                      ? 'با فعال‌سازی این کلید، نرخ‌های زنده ارز، تقویم تعطیلات تجاری، شاخص‌های کلان GDP/تورم، استعلام شبا و سوئیفت و قیمت کامودیتی‌ها متصل می‌شوند.'
                      : 'Unlocks real-time FX currency rates, trade holidays, macro GDP/inflation, IBAN/SWIFT validator, and commodity benchmarks.'}
                  </p>
                </div>
              </div>

              {/* Ninja Key Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-800">
                    {isFa ? 'کلید اختصاصی API Ninjas (X-Api-Key):' : 'API Ninjas Key:'}
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">X-Api-Key</span>
                </div>
                <input
                  id="input-ninja-key"
                  type="password"
                  placeholder={isFa ? 'کلید دریافت شده از api-ninjas.com را اینجا قرار دهید' : 'Paste your API Ninjas key here'}
                  value={ninjaKey}
                  onChange={(e) => setNinjaKey(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 text-slate-900"
                />
              </div>

              {/* Ninja Test connection result */}
              {ninjaTestResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  ninjaTestResult.valid 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  {ninjaTestResult.valid ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">{ninjaTestResult.message}</p>
                    {ninjaTestResult.durationMs && (
                      <p className="text-[11px] opacity-80">
                        {isFa ? `پاسخ سرور API Ninjas: ${ninjaTestResult.durationMs} میلی‌ثانیه` : `API Latency: ${ninjaTestResult.durationMs}ms`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Direct Link to API Ninjas Profile */}
              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>{isFa ? 'مشاهده و کپی کلید از حساب کاربری:' : 'Copy key from your profile:'}</span>
                <a
                  href="https://api-ninjas.com/profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1"
                >
                  <span>api-ninjas.com/profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {activeTab === 'comtrade' ? (
            <button
              id="test-key-btn"
              type="button"
              onClick={handleTestKey}
              disabled={isTesting}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isFa ? 'تست اتصال به UN Comtrade' : 'Test UN Key'}</span>
            </button>
          ) : (
            <button
              id="test-ninja-key-btn"
              type="button"
              onClick={handleTestNinjaKey}
              disabled={isTestingNinja}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingNinja ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isFa ? 'تست اتصال به API Ninjas' : 'Test Ninjas Key'}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              {isFa ? 'انصراف' : 'Cancel'}
            </button>
            <button
              id="save-keys-btn"
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isFa ? 'ذخیره شد!' : 'Saved!'}</span>
                </>
              ) : (
                <span>{isFa ? 'ذخیره و اعمال' : 'Save & Apply'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
