import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Building, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Copy, 
  Check, 
  AlertCircle,
  FileCheck,
  Globe2,
  Lock
} from 'lucide-react';
import { validateIban, validateSwift, IbanValidationResult, SwiftValidationResult, getStoredNinjaKey } from '../../services/ninjaService';

interface Props {
  language: 'fa' | 'en';
}

export const NinjaTradeFinanceValidatorView: React.FC<Props> = ({ language }) => {
  const isFa = language === 'fa';
  const hasKey = Boolean(getStoredNinjaKey());

  // IBAN State
  const [ibanInput, setIbanInput] = useState('DE89370400440532013000');
  const [ibanResult, setIbanResult] = useState<IbanValidationResult | null>(null);
  const [isCheckingIban, setIsCheckingIban] = useState(false);

  // SWIFT State
  const [swiftInput, setSwiftInput] = useState('DEUTDEDD');
  const [swiftResult, setSwiftResult] = useState<SwiftValidationResult | null>(null);
  const [isCheckingSwift, setIsCheckingSwift] = useState(false);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleCheckIban = async () => {
    if (!ibanInput.trim()) return;
    setIsCheckingIban(true);
    try {
      const res = await validateIban(ibanInput.trim());
      setIbanResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingIban(false);
    }
  };

  const handleCheckSwift = async () => {
    if (!swiftInput.trim()) return;
    setIsCheckingSwift(true);
    try {
      const res = await validateSwift(swiftInput.trim());
      setSwiftResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingSwift(false);
    }
  };

  const sampleIbans = [
    { label: 'آلمان (DE)', code: 'DE89370400440532013000' },
    { label: 'امارات (AE)', code: 'AE070330000000000000001' },
    { label: 'ترکیه (TR)', code: 'TR330006100519786452103845' },
    { label: 'انگلستان (GB)', code: 'GB29NWBK60161331926819' },
    { label: 'فرانسه (FR)', code: 'FR1420041010050500013M02606' },
  ];

  const sampleSwifts = [
    { label: 'دویچه بانک (آلمان)', code: 'DEUTDEDD' },
    { label: 'امارات NBD (دبی)', code: 'EBILAEAD' },
    { label: 'ایش بانک (ترکیه)', code: 'ISBKTRIS' },
    { label: 'جی‌پی مورگان (آمریکا)', code: 'CHASUS33' },
    { label: 'بانک چین (پکن)', code: 'BKCHCNBJ' },
  ];

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-cyan-950 text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-teal-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <CreditCard className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-teal-500/20 text-teal-300 border-teal-500/40">
              {isFa ? 'اعتبارسنجی بانکی بین‌المللی' : 'International Banking Verification'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {isFa ? 'جعبه‌ابزار سلامت بانکی و مالی تجار (IBAN & SWIFT Validator)' : 'Trade Finance & Bank Health Validator'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {isFa 
              ? 'اعتبارسنجی صحت شماره حساب‌های بین‌المللی (IBAN) و کدهای سوئیفت (SWIFT/BIC) طرف‌های خارجی پیش از حواله ارزی، جهت جلوگیری از برگشت حواله، کسر کارمزد ناموفق و تقلب فاکتورینگ.'
              : 'Validate international bank account numbers (IBAN) and SWIFT codes prior to wire transfers to prevent costly failed wire penalties and invoice fraud.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IBAN Validator Tool */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>{isFa ? 'اعتبارسنجی شماره شبا بین‌المللی (IBAN)' : 'IBAN Validator'}</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">ISO 13616 Modulo-97</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              {isFa ? 'شماره IBAN مقصد (مثال: DE..., AE..., TR...):' : 'Enter Target IBAN:'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ibanInput}
                onChange={(e) => setIbanInput(e.target.value.toUpperCase())}
                placeholder="DE89370400440532013000"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold tracking-wider text-slate-900 focus:ring-2 focus:ring-teal-500 uppercase"
              />
              <button
                type="button"
                onClick={handleCheckIban}
                disabled={isCheckingIban}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {isCheckingIban ? '...' : (isFa ? 'استعلام' : 'Check')}
              </button>
            </div>

            {/* Quick Samples */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 self-center me-1">{isFa ? 'نمونه‌ها:' : 'Presets:'}</span>
              {sampleIbans.map((s) => (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => {
                    setIbanInput(s.code);
                    validateIban(s.code).then(setIbanResult);
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result breakdown */}
          {ibanResult && (
            <div className={`p-4 rounded-xl border space-y-3 ${
              ibanResult.valid 
                ? 'bg-teal-50/50 border-teal-200' 
                : 'bg-rose-50/50 border-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ibanResult.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <span className={`text-xs font-bold ${ibanResult.valid ? 'text-teal-900' : 'text-rose-900'}`}>
                    {ibanResult.valid 
                      ? (isFa ? 'شماره IBAN معتبر و تایید شده است' : 'Valid IBAN Structure') 
                      : (isFa ? 'شماره IBAN نامعتبر است (خطای چک‌سام یا طول)' : 'Invalid IBAN')}
                  </span>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  {ibanResult.source || 'Engine'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-white border border-slate-200/80">
                  <span className="text-slate-400 block text-[9px]">{isFa ? 'کشور صادرکننده' : 'Country'}</span>
                  <span className="font-bold text-slate-800">{ibanResult.country || ibanResult.country_code}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200/80">
                  <span className="text-slate-400 block text-[9px]">{isFa ? 'کد بانک' : 'Bank Code'}</span>
                  <span className="font-bold text-slate-800">{ibanResult.bank_code || '—'}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200/80 col-span-2">
                  <span className="text-slate-400 block text-[9px]">{isFa ? 'ارقام کنترلی (Check Digits)' : 'Checksum'}</span>
                  <span className="font-bold text-teal-700">{ibanResult.check_digits || 'Passed (MOD-97)'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SWIFT / BIC Validator Tool */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-600" />
              <span>{isFa ? 'استعلام و آنالیز ساختار کد سوئیفت (SWIFT/BIC)' : 'SWIFT/BIC Code Lookup'}</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">ISO 9362</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              {isFa ? 'کد سوئیفت بانک خارجی (۸ یا ۱۱ رقم):' : 'Enter SWIFT/BIC Code:'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={swiftInput}
                onChange={(e) => setSwiftInput(e.target.value.toUpperCase())}
                placeholder="DEUTDEDD"
                maxLength={11}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold tracking-wider text-slate-900 focus:ring-2 focus:ring-cyan-500 uppercase"
              />
              <button
                type="button"
                onClick={handleCheckSwift}
                disabled={isCheckingSwift}
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {isCheckingSwift ? '...' : (isFa ? 'آنالیز' : 'Validate')}
              </button>
            </div>

            {/* Quick Samples */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 self-center me-1">{isFa ? 'نمونه‌ها:' : 'Presets:'}</span>
              {sampleSwifts.map((s) => (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => {
                    setSwiftInput(s.code);
                    validateSwift(s.code).then(setSwiftResult);
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result breakdown */}
          {swiftResult && (
            <div className={`p-4 rounded-xl border space-y-3 ${
              swiftResult.valid 
                ? 'bg-cyan-50/50 border-cyan-200' 
                : 'bg-rose-50/50 border-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {swiftResult.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <span className={`text-xs font-bold ${swiftResult.valid ? 'text-cyan-900' : 'text-rose-900'}`}>
                    {swiftResult.valid 
                      ? (isFa ? 'ساختار کد سوئیفت استاندارد است' : 'Valid SWIFT Code') 
                      : (isFa ? 'کد نامعتبر است' : 'Invalid SWIFT')}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  {swiftResult.swift_code}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-white border border-slate-200/80">
                  <span className="text-slate-400 block text-[9px]">{isFa ? 'شناسه مؤسسه (۴ حرف اول)' : 'Bank Code'}</span>
                  <span className="font-bold text-slate-800">{swiftResult.institution_code}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200/80">
                  <span className="text-slate-400 block text-[9px]">{isFa ? 'کد کشور (حرف ۵ و ۶)' : 'Country Code'}</span>
                  <span className="font-bold text-slate-800">{swiftResult.country_code}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200/80">
                  <span className="text-slate-400 block text-[9px]">{isFa ? 'کد موقعیت مکانی' : 'Location Code'}</span>
                  <span className="font-bold text-slate-800">{swiftResult.location_code}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200/80">
                  <span className="text-slate-400 block text-[9px]">{isFa ? 'کد شعبه' : 'Branch Code'}</span>
                  <span className="font-bold text-cyan-700">{swiftResult.branch_code}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Proforma Wire Safety Checklist */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 space-y-3">
        <h4 className="font-bold text-sm flex items-center gap-2 text-cyan-400">
          <FileCheck className="w-4 h-4" />
          <span>{isFa ? 'چک‌لیست ایمنی حوالجات ارزی و فاکتور پروفرما (Anti-Fraud Safety)' : 'Trade Wire Safety Checklist'}</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
            <span className="font-bold text-white block">۱. تطابق نام ذینفع</span>
            <p className="text-[11px] text-slate-400">
              {isFa ? 'نام صاحب حساب در سوئیفت دقیقاً باید با نام شرکت صادرکننده در پروفرما یکسان باشد.' : 'Beneficiary name must strictly match the registered company name on the proforma.'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
            <span className="font-bold text-white block">۲. ارز حساب مقصد</span>
            <p className="text-[11px] text-slate-400">
              {isFa ? 'از هم‌خوان بودن واحد ارزی حواله (مثلاً EUR یا AED) با ارز پایه حساب مقصد اطمینان حاصل کنید.' : 'Confirm whether target account accepts incoming currency without secondary FX conversion.'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
            <span className="font-bold text-white block">۳. بررسی بانک واسط (Intermediary)</span>
            <p className="text-[11px] text-slate-400">
              {isFa ? 'برای مقاصد خاص، تعیین بانک واسط کارگزار (Correspondent Bank) جهت تسریع در واریز ضروری است.' : 'Ensure intermediary SWIFT details are completed for multi-hop cross-border clearing.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
