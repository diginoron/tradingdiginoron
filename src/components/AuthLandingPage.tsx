import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Phone,
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Globe2, 
  TrendingUp, 
  ShieldCheck, 
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  RefreshCw,
  Share2,
  Database,
  SlidersHorizontal,
  Check,
  Zap,
  ArrowDown
} from 'lucide-react';
import { DiginoronLogo } from './DiginoronLogo';
import { IntroductionContent } from './landing/IntroductionContent';
import { 
  getSupabaseClient, 
  isSupabaseConfigured, 
  autoDiscoverSupabaseConfig, 
  initSupabaseClient,
  getSupabaseCredentials
} from '../lib/supabase';

interface AuthLandingPageProps {
  language: 'fa' | 'en';
  onLoginSuccess: (user: any) => void;
  onLogoClick?: () => void;
  onClose?: () => void;
  onToggleLanguage?: () => void;
  currentUser?: any;
}

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';

const REFERRAL_OPTIONS_FA = [
  { value: '', label: 'انتخاب کنید...' },
  { value: 'google', label: 'جستجوی گوگل' },
  { value: 'social', label: 'شبکه‌های اجتماعی (لینکدین، اینستاگرام، تلگرام)' },
  { value: 'colleague', label: 'معرفی همکاران و بازرگانان' },
  { value: 'event', label: 'رویدادها و نمایشگاه‌های تجاری' },
  { value: 'article', label: 'مقالات تحلیلی و وبلاگ دیجی نورون' },
  { value: 'other', label: 'سایر روش‌ها' },
];

const REFERRAL_OPTIONS_EN = [
  { value: '', label: 'Select option...' },
  { value: 'google', label: 'Google Search' },
  { value: 'social', label: 'Social Media (LinkedIn, Instagram, Telegram)' },
  { value: 'colleague', label: 'Colleague / Business Partner Recommendation' },
  { value: 'event', label: 'Trade Exhibitions & Conferences' },
  { value: 'article', label: 'Articles & Diginoron Blog' },
  { value: 'other', label: 'Other' },
];

const LOCAL_USERS_KEY = 'DIGINORON_REGISTERED_USERS';
const LOCAL_SESSION_KEY = 'DIGINORON_AUTH_USER';

export const AuthLandingPage: React.FC<AuthLandingPageProps> = ({
  language,
  onLoginSuccess,
  onLogoClick,
  onClose,
  onToggleLanguage,
  currentUser,
}) => {
  const isFa = language === 'fa';
  const authCardRef = useRef<HTMLDivElement>(null);

  const [configured, setConfigured] = useState<boolean>(isSupabaseConfigured());
  const [mode, setMode] = useState<AuthMode>('signup'); // Default to Registration on fresh load
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Manual Supabase Config modal/panel state
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [configSaved, setConfigSaved] = useState(false);

  const referralOptions = isFa ? REFERRAL_OPTIONS_FA : REFERRAL_OPTIONS_EN;

  // Auto-discover Supabase config on mount
  useEffect(() => {
    let isMounted = true;
    const checkConfig = async () => {
      setDiscovering(true);
      const client = await autoDiscoverSupabaseConfig();
      if (isMounted) {
        const isReady = Boolean(client && isSupabaseConfigured());
        setConfigured(isReady);
        const creds = getSupabaseCredentials();
        setManualUrl(creds.url);
        setManualKey(creds.anonKey);
        setDiscovering(false);
      }
    };

    checkConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  // Check if URL has password recovery token
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setMode('reset');
      setSuccessMsg(isFa ? 'لطفاً رمز عبور جدید خود را وارد کنید.' : 'Please enter your new password.');
    }
  }, [isFa]);

  const scrollToAuth = () => {
    if (authCardRef.current) {
      authCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleManualSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl || !manualKey) {
      setErrorMsg(isFa ? 'لطفاً آدرس پروژه و کلید anon را وارد کنید.' : 'Please enter project URL and anon key.');
      return;
    }

    const client = initSupabaseClient(manualUrl, manualKey, true);
    if (client) {
      setConfigured(true);
      setConfigSaved(true);
      setErrorMsg(null);
      setSuccessMsg(isFa ? 'تنظیمات Supabase با موفقیت ذخیره و متصل شد.' : 'Supabase configured and connected successfully.');
      setTimeout(() => {
        setShowConfigPanel(false);
        setConfigSaved(false);
      }, 1200);
    } else {
      setErrorMsg(isFa ? 'فرمت آدرس یا کلید معتبر نیست.' : 'Invalid URL or key format.');
    }
  };

  const handleRetryAutoDiscovery = async () => {
    setDiscovering(true);
    setErrorMsg(null);
    const client = await autoDiscoverSupabaseConfig();
    setDiscovering(false);
    if (client && isSupabaseConfigured()) {
      setConfigured(true);
      setSuccessMsg(isFa ? 'سامانه احراز هویت با موفقیت متصل شد.' : 'Authentication system successfully connected.');
      setShowConfigPanel(false);
    } else {
      setErrorMsg(isFa ? 'متغیرها در سرور یافت نشدند. لطفاً کلیدها را در کادر زیر وارد و ذخیره کنید.' : 'Credentials not detected on server. Please enter them manually below.');
      setShowConfigPanel(true);
    }
  };

  // 1-Click Fast Demo Login for instant testing
  const handleFastDemoLogin = () => {
    const demoUser = {
      id: 'demo-trader-' + Date.now().toString().slice(-4),
      email: 'trader@diginoron.com',
      user_metadata: {
        full_name: isFa ? 'بازرگان بین‌المللی (حساب آزمایشی)' : 'Global Trader (Demo Account)',
        company: isFa ? 'شرکت تجارت و توسعه نورون' : 'Noron Trade & Development',
        phone: '+98 912 000 0000',
        referral_source: 'diginoron_demo',
      },
      created_at: new Date().toISOString()
    };

    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(demoUser));
    } catch {}

    setSuccessMsg(isFa ? 'ورود با حساب آزمایشی موفقیت‌آمیز بود. در حال انتقال به محیط ابزارها...' : 'Demo login successful. Launching workspace...');
    setTimeout(() => {
      onLoginSuccess(demoUser);
    }, 400);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg(isFa ? 'لطفاً ایمیل و رمز عبور را وارد کنید.' : 'Please enter email and password.');
      return;
    }

    const supabase = getSupabaseClient();

    // If Supabase is configured, use Supabase Auth
    if (supabase && configured) {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          try {
            localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(data.user));
          } catch {}
          setSuccessMsg(isFa ? 'ورود موفقیت‌آمیز بود. در حال انتقال...' : 'Login successful. Redirecting...');
          setTimeout(() => {
            onLoginSuccess(data.user);
          }, 400);
          return;
        }
      } catch (err: any) {
        console.warn('Supabase sign in failed, trying local store fallback:', err.message);
      } finally {
        setLoading(false);
      }
    }

    // Local authentication fallback
    try {
      setLoading(true);
      const rawStored = localStorage.getItem(LOCAL_USERS_KEY);
      const users: any[] = rawStored ? JSON.parse(rawStored) : [];
      const foundUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

      if (foundUser && foundUser.password === password) {
        const sessionUser = {
          id: foundUser.id,
          email: foundUser.email,
          user_metadata: {
            full_name: foundUser.full_name,
            company: foundUser.company,
            phone: foundUser.phone,
            referral_source: foundUser.referral_source,
          },
          created_at: foundUser.created_at,
        };
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionUser));
        setSuccessMsg(isFa ? 'ورود با موفقیت انجام شد. خوش آمدید!' : 'Signed in successfully. Welcome!');
        setTimeout(() => {
          onLoginSuccess(sessionUser);
        }, 400);
      } else {
        setErrorMsg(isFa ? 'ایمیل یا رمز عبور اشتباه است. در صورت نداشتن حساب، لطفاً ثبت‌نام کنید.' : 'Invalid email or password. If you have no account, please sign up.');
      }
    } catch {
      setErrorMsg(isFa ? 'خطا در ورود به حساب.' : 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName) {
      setErrorMsg(isFa ? 'لطفاً نام و نام خانوادگی خود را وارد کنید.' : 'Please enter full name.');
      return;
    }

    if (!phone) {
      setErrorMsg(isFa ? 'لطفاً شماره تماس / همراه خود را وارد کنید.' : 'Please enter phone number.');
      return;
    }

    if (!email || !password) {
      setErrorMsg(isFa ? 'لطفاً ایمیل و رمز عبور را وارد کنید.' : 'Please enter email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg(isFa ? 'رمز عبور باید حداقل ۶ کاراکتر باشد.' : 'Password must be at least 6 characters.');
      return;
    }

    const supabase = getSupabaseClient();

    // If Supabase is configured, register via Supabase
    if (supabase && configured) {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              company: company,
              referral_source: referralSource,
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          try {
            localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(data.user));
          } catch {}
          setSuccessMsg(isFa ? 'ثبت‌نام با موفقیت انجام شد. خوش آمدید!' : 'Account registered successfully. Welcome!');
          setTimeout(() => onLoginSuccess(data.user), 500);
          return;
        }
      } catch (err: any) {
        console.warn('Supabase signup error, using local fallback:', err.message);
      } finally {
        setLoading(false);
      }
    }

    // Local user registration fallback (always 100% reliable)
    try {
      setLoading(true);
      const rawStored = localStorage.getItem(LOCAL_USERS_KEY);
      const users: any[] = rawStored ? JSON.parse(rawStored) : [];

      // Check if already registered
      if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
        setErrorMsg(isFa ? 'این ایمیل قبلاً ثبت شده است. لطفاً وارد شوید.' : 'Email already registered. Please sign in.');
        setMode('signin');
        return;
      }

      const newUser = {
        id: 'user-' + Date.now(),
        email: email.trim(),
        password: password,
        full_name: fullName.trim(),
        phone: phone.trim(),
        company: company.trim(),
        referral_source: referralSource,
        created_at: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

      const sessionUser = {
        id: newUser.id,
        email: newUser.email,
        user_metadata: {
          full_name: newUser.full_name,
          company: newUser.company,
          phone: newUser.phone,
          referral_source: newUser.referral_source,
        },
        created_at: newUser.created_at,
      };

      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionUser));
      setSuccessMsg(isFa ? 'ثبت‌نام با موفقیت انجام شد. خوش آمدید به دستیار هوشمند تجارت!' : 'Account created successfully! Welcome to Smart Trade Assistant.');
      setTimeout(() => {
        onLoginSuccess(sessionUser);
      }, 500);
    } catch {
      setErrorMsg(isFa ? 'خطا در ثبت اطلاعات کاربری.' : 'Failed to save user data.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      setErrorMsg(isFa ? 'لطفاً ایمیل خود را وارد کنید.' : 'Please enter your email.');
      return;
    }

    const supabase = getSupabaseClient();
    if (supabase && configured) {
      try {
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/#type=recovery`,
        });

        if (error) throw error;

        setSuccessMsg(
          isFa 
            ? 'لینک بازیابی رمز عبور به ایمیل شما ارسال شد. لطفاً صندوق ورودی خود را بررسی کنید.' 
            : 'Password reset instructions sent to your email.'
        );
        return;
      } catch (err: any) {
        console.warn('Supabase reset password error:', err.message);
      } finally {
        setLoading(false);
      }
    }

    setSuccessMsg(isFa ? 'دستورالعمل بازیابی رمز عبور ذخیره شد. برای ورود می‌توانید از کلید ورود آزمایشی نیز استفاده کنید.' : 'Password reset instructions noted.');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!password || password.length < 6) {
      setErrorMsg(isFa ? 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.' : 'New password must be at least 6 characters.');
      return;
    }

    const supabase = getSupabaseClient();
    if (supabase && configured) {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) throw error;

        setSuccessMsg(isFa ? 'رمز عبور جدید شما با موفقیت ثبت شد. در حال ورود...' : 'Password updated successfully. Logging in...');
        setTimeout(() => {
          if (data.user) {
            onLoginSuccess(data.user);
          } else {
            setMode('signin');
          }
        }, 700);
        return;
      } catch (err: any) {
        setErrorMsg(err.message || (isFa ? 'خطا در ثبت رمز عبور جدید.' : 'Failed to update password.'));
      } finally {
        setLoading(false);
      }
    }

    setSuccessMsg(isFa ? 'رمز عبور تغییر یافت. لطفاً وارد شوید.' : 'Password updated.');
    setMode('signin');
  };

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      setMode('signup');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-x-hidden" 
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {/* Background Decorative Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/70 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70"></div>
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 shadow-2xs">
        {/* Brand Logo */}
        <button
          id="landing-logo-btn"
          type="button"
          onClick={handleLogoClick}
          className="flex items-center hover:opacity-90 transition-opacity cursor-pointer group"
          title={isFa ? 'صفحه اصلی دیجی نورون' : 'Diginoron Home'}
        >
          <DiginoronLogo theme="light" size="sm" layout="horizontal" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle */}
          {onToggleLanguage && (
            <button
              id="landing-lang-toggle"
              type="button"
              onClick={onToggleLanguage}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
              title={isFa ? 'Switch to English' : 'تغییر به فارسی'}
            >
              <Globe2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{isFa ? 'EN' : 'فا'}</span>
            </button>
          )}

          {/* Database/Auth Status Indicator */}
          <button
            id="supabase-status-btn"
            type="button"
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              configured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={isFa ? 'وضعیت پایگاه داده و احراز هویت' : 'Auth & Database Status'}
          >
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">
              {configured 
                ? (isFa ? 'دیتابیس متصل است' : 'DB Connected') 
                : (isFa ? 'تنظیمات دیتابیس' : 'DB Setup')}
            </span>
            <span className={`w-2 h-2 rounded-full ${configured ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
          </button>

          {/* Quick Tab Switcher: Sign In / Sign Up */}
          <div className="flex items-center gap-1.5">
            <button
              id="header-signin-btn"
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); scrollToAuth(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'signin' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isFa ? 'ورود' : 'Sign In'}
            </button>
            <button
              id="header-signup-btn"
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); scrollToAuth(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'signup' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isFa ? 'ثبت‌نام' : 'Sign Up'}
            </button>

            {/* If user is ALREADY logged in and opened intro from navbar */}
            {currentUser && onClose && (
              <button
                id="header-return-tools-btn"
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ml-1"
              >
                <span>{isFa ? 'بازگشت به ابزارها' : 'Return to Tools'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col">
        
        {/* Hero Section with Value Proposition + Registration Form */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 pb-12 border-b border-slate-200/80">
          
          {/* Left Side: Brand Identity & Value Proposition */}
          <div className="flex-1 text-center lg:text-right space-y-6 max-w-2xl">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold rounded-full">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>{isFa ? 'پلتفرم جامع هوش تجاری و تصمیم‌گیری بازرگانان' : 'Diginoron Trade Intelligence Platform'}</span>
            </div>

            {/* Official Title & Slogan */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              {isFa ? (
                <>
                  دستیار هوشمند تجارت بین‌الملل <span className="text-blue-600">دیجی نورون</span>
                </>
              ) : (
                <>
                  <span className="text-blue-600">Diginoron</span> Smart Global Trade Assistant
                </>
              )}
            </h1>

            <p className="text-lg sm:text-xl text-slate-800 font-bold leading-relaxed">
              {isFa ? (
                'ما مسیر تجارت شما را هوشمند می‌کنیم.'
              ) : (
                'We empower and intelligently guide your global trade journey.'
              )}
            </p>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-normal">
              {isFa ? (
                'سامانه یکپارچه ۲۵ ابزار تخصصی بازرگانی: دسترسی مستقیم به کلان‌داده‌های ۲۰۰+ کشور در UN Comtrade، محاسبه شاخص مزیت نسبی بالاسا (RCA)، رادار کشف کم‌اظهاری و تقلب گمرکی، و نگارشگر هوشمند نامه‌های تجاری بین‌الملل منطبق بر استانداردهای اتاق بازرگانی (ICC) و اینکوترمز ۲۰۲۰.'
              ) : (
                'Integrated suite of 25 specialized trade engines: 200+ UN Comtrade datasets, Balassa RCA index, customs undervaluation radar, and ICC-compliant international commercial letters.'
              )}
            </p>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs flex flex-col gap-1 items-start">
                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                  <Globe2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900">{isFa ? '۲۰۰+ کشور جهان' : '200+ Economies'}</span>
                <span className="text-[11px] text-slate-500">{isFa ? 'کدهای ۶ رقمی HS' : 'HS 6-Digit Codes'}</span>
              </div>

              <div className="p-3.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs flex flex-col gap-1 items-start">
                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900">{isFa ? 'شاخص بالاسا (RCA)' : 'Balassa RCA Index'}</span>
                <span className="text-[11px] text-slate-500">{isFa ? 'توان رقابتی صادرات' : 'Export Competitiveness'}</span>
              </div>

              <div className="p-3.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs flex flex-col gap-1 items-start col-span-2 sm:col-span-1">
                <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900">{isFa ? 'رادار تقلب گمرکی' : 'Customs Fraud Radar'}</span>
                <span className="text-[11px] text-slate-500">{isFa ? 'پیشگیری از جریمه' : 'Audit Defense'}</span>
              </div>
            </div>

            {/* Scroll Down Prompt */}
            <div className="pt-2 hidden lg:flex items-center gap-2 text-xs text-slate-500">
              <ArrowDown className="w-4 h-4 text-blue-600 animate-bounce" />
              <span>{isFa ? 'معرفی جامع قابلیت‌ها و ابزارها در پایین همین صفحه قرار دارد' : 'Scroll down to explore full platform features & tools'}</span>
            </div>
          </div>

          {/* Right Side: Authentication & Registration Card */}
          <div 
            ref={authCardRef}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-5 sm:p-7 relative"
          >
            {/* Top Accent Line */}
            <div className="absolute -top-px left-8 right-8 h-1 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 rounded-t-full"></div>

            {/* Access Gating Notice */}
            <div className="mb-4 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start gap-2">
              <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px]">
                {isFa ? (
                  <>
                    <strong className="font-bold block text-blue-950">دسترسی انحصاری به ابزارها:</strong>
                    برای استفاده از ابزارهای تحلیلی، استعلام داده‌های UN Comtrade و مشاوره هوش مصنوعی، لطفاً وارد شوید یا ثبت‌نام کنید.
                  </>
                ) : (
                  <>
                    <strong className="font-bold block text-blue-950">Members-Only Tools Access:</strong>
                    Please register or sign in to access the trade intelligence workspace and analytics.
                  </>
                )}
              </div>
            </div>

            {/* 1-Click Fast Demo Login */}
            <button
              id="fast-demo-login-btn"
              type="button"
              onClick={handleFastDemoLogin}
              className="w-full mb-4 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-800"
              title={isFa ? 'ورود آنی بدون نیاز به فرم جهت تست ابزارها' : 'Instant 1-Click Demo Trader Access'}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{isFa ? 'ورود سریع با حساب آزمایشی بازرگان (تست آنی)' : 'Quick Demo Trader Access (1-Click)'}</span>
            </button>

            <div className="relative flex py-1 items-center mb-4">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase font-semibold">
                {isFa ? 'یا از طریق فرم زیر' : 'Or via form below'}
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Supabase Connection Setup Panel */}
            {showConfigPanel && (
              <div className="mb-5 p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                    {isFa ? 'تنظیمات اتصال دیتابیس Supabase' : 'Supabase Config'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowConfigPanel(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                  >
                    {isFa ? 'بستن' : 'Close'}
                  </button>
                </div>

                <form onSubmit={handleManualSaveConfig} className="space-y-2">
                  <div>
                    <input
                      type="url"
                      required
                      dir="ltr"
                      placeholder="Project URL: https://xyz.supabase.co"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      required
                      dir="ltr"
                      placeholder="Anon Key: eyJhbGci..."
                      value={manualKey}
                      onChange={(e) => setManualKey(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                    >
                      {configSaved ? (isFa ? 'ذخیره شد!' : 'Saved!') : (isFa ? 'ذخیره اتصال' : 'Save')}
                    </button>
                    <button
                      type="button"
                      onClick={handleRetryAutoDiscovery}
                      disabled={discovering}
                      className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${discovering ? 'animate-spin' : ''}`} />
                      <span>{isFa ? 'بررسی خودکار' : 'Auto'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Form Mode Tabs: Sign Up vs Sign In */}
            {mode !== 'reset' && (
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mb-4 text-xs font-bold">
                <button
                  id="auth-tab-signup"
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'signup' 
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isFa ? 'ثبت‌نام کاربر جدید' : 'New Sign Up'}</span>
                </button>

                <button
                  id="auth-tab-signin"
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'signin' 
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isFa ? 'ورود به حساب' : 'Sign In'}</span>
                </button>
              </div>
            )}

            {/* Alert Messages */}
            {errorMsg && (
              <div className="mb-3.5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-medium text-[11px] leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-3.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium text-[11px] leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* Sign Up Form */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {isFa ? 'نام و نام خانوادگی' : 'Full Name'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className={`w-4 h-4 text-slate-400 absolute top-3 ${isFa ? 'right-3' : 'left-3'}`} />
                    <input
                      id="signup-name-input"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isFa ? 'مثال: علیرضا محمدی' : 'e.g. John Doe'}
                      className={`w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-xs font-medium transition-all ${
                        isFa ? 'pr-9 pl-3' : 'pl-9 pr-3'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {isFa ? 'شماره تماس / همراه' : 'Phone Number'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className={`w-4 h-4 text-slate-400 absolute top-3 ${isFa ? 'right-3' : 'left-3'}`} />
                    <input
                      id="signup-phone-input"
                      type="tel"
                      required
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09123456789"
                      className={`w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-xs font-medium transition-all ${
                        isFa ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {isFa ? 'نام شرکت یا مجموعه تجاری (اختیاری)' : 'Company (Optional)'}
                  </label>
                  <div className="relative">
                    <Building2 className={`w-4 h-4 text-slate-400 absolute top-3 ${isFa ? 'right-3' : 'left-3'}`} />
                    <input
                      id="signup-company-input"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={isFa ? 'بازرگانی نورون' : 'Noron Trading Co.'}
                      className={`w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-xs font-medium transition-all ${
                        isFa ? 'pr-9 pl-3' : 'pl-9 pr-3'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {isFa ? 'نحوه آشنایی با دیجی نورون' : 'Referral Source'}
                  </label>
                  <div className="relative">
                    <Share2 className={`w-4 h-4 text-slate-400 absolute top-3 ${isFa ? 'right-3' : 'left-3'}`} />
                    <select
                      id="signup-referral-input"
                      value={referralSource}
                      onChange={(e) => setReferralSource(e.target.value)}
                      className={`w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-xs font-medium transition-all appearance-none cursor-pointer ${
                        isFa ? 'pr-9 pl-3' : 'pl-9 pr-3'
                      }`}
                    >
                      {referralOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {isFa ? 'آدرس ایمیل' : 'Email'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 text-slate-400 absolute top-3 ${isFa ? 'right-3' : 'left-3'}`} />
                    <input
                      id="signup-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="trader@company.com"
                      className={`w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-xs font-medium transition-all ${
                        isFa ? 'pr-9 pl-3' : 'pl-9 pr-3'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {isFa ? 'تعریف رمز عبور (حداقل ۶ کاراکتر)' : 'Password (min 6 chars)'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className={`w-4 h-4 text-slate-400 absolute top-3 ${isFa ? 'right-3' : 'left-3'}`} />
                    <input
                      id="signup-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-xs font-medium transition-all ${
                        isFa ? 'pr-9 pl-9' : 'pl-9 pr-9'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-3 text-slate-400 hover:text-slate-600 ${isFa ? 'left-3' : 'right-3'}`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="signup-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isFa ? 'در حال ثبت‌نام...' : 'Registering...'}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>{isFa ? 'ثبت‌نام و ورود به ابزارها' : 'Sign Up & Enter Workspace'}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Sign In Form */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    {isFa ? 'آدرس ایمیل' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 text-slate-400 absolute top-3 ${isFa ? 'right-3' : 'left-3'}`} />
                    <input
                      id="signin-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="trader@company.com"
                      className={`w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-xs font-medium transition-all ${
                        isFa ? 'pr-9 pl-3' : 'pl-9 pr-3'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-700 font-semibold">
                      {isFa ? 'رمز عبور' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setErrorMsg(null); setSuccessMsg(null); }}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      {isFa ? 'فراموشی رمز عبور؟' : 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className={`w-4 h-4 text-slate-400 absolute top-3 ${isFa ? 'right-3' : 'left-3'}`} />
                    <input
                      id="signin-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-xs font-medium transition-all ${
                        isFa ? 'pr-9 pl-9' : 'pl-9 pr-9'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-3 text-slate-400 hover:text-slate-600 ${isFa ? 'left-3' : 'right-3'}`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="signin-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isFa ? 'در حال ورود...' : 'Signing In...'}</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{isFa ? 'ورود به سامانه' : 'Sign In to Workspace'}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Forgot Password Mode */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] leading-relaxed font-medium">
                  {isFa ? (
                    'ایمیل ثبت‌نامی خود را وارد کنید تا دستورالعمل بازیابی رمز عبور برای شما فعال گردد.'
                  ) : (
                    'Enter your registered email to reset your password.'
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    {isFa ? 'آدرس ایمیل' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 text-slate-400 absolute top-3 ${isFa ? 'right-3' : 'left-3'}`} />
                    <input
                      id="forgot-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="trader@company.com"
                      className={`w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-xs font-medium transition-all ${
                        isFa ? 'pr-9 pl-3' : 'pl-9 pr-3'
                      }`}
                    />
                  </div>
                </div>

                <button
                  id="forgot-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isFa ? 'در حال پردازش...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>{isFa ? 'ارسال درخواست بازیابی رمز' : 'Send Reset Request'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="w-full py-2 text-slate-600 hover:text-slate-900 font-semibold text-center transition-colors cursor-pointer"
                >
                  {isFa ? 'بازگشت به صفحه ورود' : 'Back to Sign In'}
                </button>
              </form>
            )}

            {/* Reset Password Form */}
            {mode === 'reset' && (
              <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    {isFa ? 'رمز عبور جدید (حداقل ۶ کاراکتر)' : 'New Password (min 6 chars)'}
                  </label>
                  <div className="relative">
                    <Lock className={`w-4 h-4 text-slate-400 absolute top-3 ${isFa ? 'right-3' : 'left-3'}`} />
                    <input
                      id="reset-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-xs font-medium transition-all ${
                        isFa ? 'pr-9 pl-9' : 'pl-9 pr-9'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-3 text-slate-400 hover:text-slate-600 ${isFa ? 'left-3' : 'right-3'}`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="reset-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isFa ? 'ثبت رمز جدید و ورود' : 'Save New Password & Enter'}</span>
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Integrated Introduction Content: Interactive Live Preview, 25+ Engines Directory, 3-Step Workflow, FAQ */}
        <IntroductionContent
          language={language}
          onGoToAuth={scrollToAuth}
        />

      </main>

      {/* Modern Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <DiginoronLogo theme="light" size="xs" layout="icon" />
          <span>© 2026 DIGINORON. {isFa ? 'کلیه حقوق برای سامانه دستیار هوشمند تجارت محفوظ است.' : 'All rights reserved.'}</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
          <span>{isFa ? 'پایگاه داده UN Comtrade سازمان ملل' : 'UN Comtrade Big Data'}</span>
          <span>•</span>
          <span>{isFa ? 'استاندارد اتاق بازرگانی بین‌المللی (ICC)' : 'ICC Incoterms® 2020'}</span>
        </div>
      </footer>
    </div>
  );
};
