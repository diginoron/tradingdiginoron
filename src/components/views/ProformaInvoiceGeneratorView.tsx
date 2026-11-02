import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  FileText,
  Package,
  Printer,
  Copy,
  Download,
  Upload,
  Plus,
  Trash2,
  Check,
  Eye,
  Edit3,
  Scale,
  Building2,
  CreditCard,
  Anchor,
  HelpCircle,
  FileCheck2,
  Sparkles,
  ArrowRightLeft,
  DollarSign,
  AlertTriangle,
  Bookmark,
  Share2,
  Boxes,
  Loader2,
  FileDown,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { exportElementToPdf } from '../../lib/pdfExport';
import {
  InvoiceItem,
  ProformaInvoiceData,
  SAMPLE_TEMPLATES,
  COMMON_UNITS,
  PACKAGE_TYPES,
  COMMON_CURRENCIES,
  INCOTERMS_LIST,
  numberToEnglishWords,
  numberToPersianWords
} from '../../data/proformaTemplates';

interface ProformaInvoiceGeneratorViewProps {
  language: 'fa' | 'en';
}

const STORAGE_KEY = 'DIGINORON_SAVED_PROFORMAS_V1';

export const ProformaInvoiceGeneratorView: React.FC<ProformaInvoiceGeneratorViewProps> = ({ language }) => {
  const isFa = language === 'fa';

  // Active Document Tab: 'PI' (Proforma Invoice) or 'PL' (Packing List)
  const [activeDocType, setActiveDocType] = useState<'PI' | 'PL'>('PI');

  // Mode: 'editor' (Form) or 'preview' (Official Printable Document)
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('preview');

  // Main Document Data
  const [invoice, setInvoice] = useState<ProformaInvoiceData>(SAMPLE_TEMPLATES.pistachio_export);

  // Active Editor Section (for structured navigation in editor mode)
  const [activeEditorTab, setActiveEditorTab] = useState<'parties' | 'shipping' | 'items' | 'financials' | 'bank_notes'>('items');

  // DOM ref for PDF extraction
  const documentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadedPdfInfo, setDownloadedPdfInfo] = useState<{ url: string; filename: string } | null>(null);

  // Feedback states
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [savedDraftsList, setSavedDraftsList] = useState<Array<{ id: string; name: string; date: string }>>([]);

  // Load saved drafts list on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedDraftsList(parsed.map((item: any) => ({
            id: item.id || item.invoiceNumber,
            name: `${item.invoiceNumber || 'No-Ref'} - ${item.seller?.companyName?.slice(0, 20) || 'PI'} (${item.date || ''})`,
            date: item.date || ''
          })));
        }
      }
    } catch (e) {
      console.error('Failed to parse saved proformas', e);
    }
  }, []);

  // Calculate live financial figures
  const subtotal = useMemo(() => {
    return invoice.items.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);
  }, [invoice.items]);

  const discountAmount = useMemo(() => {
    const pct = Number(invoice.discountPercentage) || 0;
    return (subtotal * pct) / 100;
  }, [subtotal, invoice.discountPercentage]);

  const grandTotal = useMemo(() => {
    const discounted = subtotal - discountAmount;
    const freight = Number(invoice.freightCharge) || 0;
    const insurance = Number(invoice.insuranceCharge) || 0;
    const other = Number(invoice.otherCharges) || 0;
    return Math.max(0, discounted + freight + insurance + other);
  }, [subtotal, discountAmount, invoice.freightCharge, invoice.insuranceCharge, invoice.otherCharges]);

  // Packing List Totals
  const packingTotals = useMemo(() => {
    let totalPackages = 0;
    let totalNetWeightKg = 0;
    let totalGrossWeightKg = 0;
    let totalCbm = 0;

    invoice.items.forEach(item => {
      const count = Number(item.packageCount) || 1;
      const netPerUnit = Number(item.netWeightPerUnitKg) || 0;
      const grossPerUnit = Number(item.grossWeightPerUnitKg) || 0;
      const l = Number(item.lengthCm) || 0;
      const w = Number(item.widthCm) || 0;
      const h = Number(item.heightCm) || 0;

      totalPackages += count;
      totalNetWeightKg += count * netPerUnit;
      totalGrossWeightKg += count * grossPerUnit;

      const singleCbm = (l * w * h) / 1000000;
      totalCbm += singleCbm * count;
    });

    // Air Volumetric weight (IATA standard: 1 CBM = 167 kg, or L*W*H / 6000)
    const airVolumetricWeightKg = totalCbm * 166.67;

    return {
      totalPackages,
      totalNetWeightKg: Math.round(totalNetWeightKg * 100) / 100,
      totalGrossWeightKg: Math.round(totalGrossWeightKg * 100) / 100,
      totalCbm: Math.round(totalCbm * 1000) / 1000,
      airVolumetricWeightKg: Math.round(airVolumetricWeightKg * 10) / 10
    };
  }, [invoice.items]);

  // Handlers for Items
  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => {
      const updated = [...prev.items];
      const target = { ...updated[index], [field]: value };

      // Auto-recalculate line total if quantity or unitPrice changed
      if (field === 'quantity' || field === 'unitPrice') {
        const q = field === 'quantity' ? Number(value) : Number(target.quantity);
        const p = field === 'unitPrice' ? Number(value) : Number(target.unitPrice);
        target.totalPrice = Math.round(q * p * 100) / 100;
      }

      updated[index] = target;
      return { ...prev, items: updated };
    });
  };

  const handleAddItem = () => {
    setInvoice(prev => {
      const newItem: InvoiceItem = {
        id: `item_${Date.now()}`,
        itemNo: prev.items.length + 1,
        hsCode: '',
        description: 'New Item / کالای جدید',
        specification: '',
        quantity: 1,
        unit: 'PCS',
        unitPrice: 100,
        totalPrice: 100,
        packageCount: 1,
        packageType: 'Cartons (کارتن)',
        netWeightPerUnitKg: 1,
        grossWeightPerUnitKg: 1.2,
        lengthCm: 30,
        widthCm: 20,
        heightCm: 20,
      };
      return { ...prev, items: [...prev.items, newItem] };
    });
  };

  const handleRemoveItem = (index: number) => {
    setInvoice(prev => {
      const updated = prev.items.filter((_, i) => i !== index).map((item, idx) => ({
        ...item,
        itemNo: idx + 1
      }));
      return { ...prev, items: updated };
    });
  };

  // Switch Template
  const handleLoadTemplate = (templateKey: string) => {
    const template = SAMPLE_TEMPLATES[templateKey];
    if (template) {
      setInvoice(JSON.parse(JSON.stringify(template)));
      setSaveStatus(isFa ? 'قالب با موفقیت بارگذاری شد' : 'Template loaded successfully');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Save current draft to LocalStorage
  const handleSaveDraft = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];

      const existingIndex = list.findIndex((item: any) => item.invoiceNumber === invoice.invoiceNumber);
      if (existingIndex >= 0) {
        list[existingIndex] = invoice;
      } else {
        list.unshift(invoice);
      }

      // Limit to 20 drafts
      list = list.slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

      setSavedDraftsList(list.map((item: any) => ({
        id: item.id || item.invoiceNumber,
        name: `${item.invoiceNumber || 'No-Ref'} - ${item.seller?.companyName?.slice(0, 20) || 'PI'} (${item.date || ''})`,
        date: item.date || ''
      })));

      setSaveStatus(isFa ? 'پیش‌نویس با موفقیت در مرورگر ذخیره شد' : 'Draft saved in browser');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Load from saved draft
  const handleLoadDraft = (invoiceNumber: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list = JSON.parse(raw);
      const found = list.find((item: any) => item.invoiceNumber === invoiceNumber || item.id === invoiceNumber);
      if (found) {
        setInvoice(found);
        setSaveStatus(isFa ? `پیش‌نویس ${found.invoiceNumber} فراخوانی شد` : `Loaded draft ${found.invoiceNumber}`);
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Export JSON file
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber || 'Proforma'}_${activeDocType}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.items && parsed.seller) {
          setInvoice(parsed);
          setSaveStatus(isFa ? 'فایل JSON با موفقیت وارد شد' : 'JSON imported successfully');
          setTimeout(() => setSaveStatus(null), 3000);
        } else {
          alert(isFa ? 'فرمت فایل معتبر نیست.' : 'Invalid file structure.');
        }
      } catch (err) {
        alert(isFa ? 'خطا در خواندن فایل JSON' : 'Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Generate and Download PDF directly (high resolution, client-side)
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setSaveStatus(isFa ? 'در حال تبدیل و ساخت سند PDF...' : 'Generating PDF...');
    try {
      // Ensure preview mode is active so the element is rendered in DOM
      if (viewMode !== 'preview') {
        setViewMode('preview');
        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      if (!documentRef.current) {
        throw new Error('Document element not found in DOM');
      }

      const docPrefix = activeDocType === 'PI'
        ? (invoice.docType === 'COMMERCIAL_INVOICE' ? 'Commercial_Invoice' : 'Proforma_Invoice')
        : 'Packing_List';
      const cleanRef = (invoice.invoiceNumber || 'Export').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${docPrefix}_${cleanRef}.pdf`;

      const result = await exportElementToPdf(documentRef.current, filename, {
        orientation: 'portrait',
        marginMm: 8,
        quality: 0.95,
      });

      if (result.success && result.url) {
        setDownloadedPdfInfo({ url: result.url, filename: result.filename });
        setSaveStatus(isFa ? '✅ فایل PDF با موفقیت آماده و دانلود شد' : '✅ PDF generated and downloaded');
      } else {
        throw new Error(result.error || 'Failed to export PDF');
      }
    } catch (err: any) {
      console.error('PDF export error:', err);
      setSaveStatus(isFa ? 'خطا در صدور خودکار PDF. لطفاً از دکمه چاپگر مرورگر استفاده نمایید.' : 'PDF generation error.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Print Document (Directly triggers browser print or falls back to PDF download)
  const handlePrint = () => {
    setViewMode('preview');
    setTimeout(() => {
      try {
        window.print();
      } catch {
        handleDownloadPdf();
      }
    }, 200);
  };

  // Copy Plain Text Summary (for quick emailing/WhatsApp)
  const handleCopySummary = () => {
    let text = `=========================================\n`;
    text += `${invoice.docType === 'COMMERCIAL_INVOICE' ? 'COMMERCIAL INVOICE' : 'PROFORMA INVOICE'}: ${invoice.invoiceNumber}\n`;
    text += `Date: ${invoice.date} | Valid Until: ${invoice.validUntil}\n`;
    text += `=========================================\n`;
    text += `SELLER: ${invoice.seller.companyName} (${invoice.seller.cityCountry})\n`;
    text += `BUYER: ${invoice.buyer.companyName} (${invoice.buyer.cityCountry})\n`;
    text += `TERMS: ${invoice.incoterm} ${invoice.namedPlace} | Currency: ${invoice.currency}\n`;
    text += `PAYMENT: ${invoice.paymentTerms}\n`;
    text += `DELIVERY: ${invoice.deliveryTime}\n`;
    text += `-----------------------------------------\n`;
    text += `ITEMS:\n`;
    invoice.items.forEach((item, idx) => {
      text += `${idx + 1}. [HS: ${item.hsCode || '-'}] ${item.description} - ${item.quantity} ${item.unit} @ ${invoice.currency} ${item.unitPrice} = ${invoice.currency} ${item.totalPrice}\n`;
    });
    text += `-----------------------------------------\n`;
    text += `SUBTOTAL: ${invoice.currency} ${subtotal.toLocaleString()}\n`;
    if (invoice.discountPercentage > 0) text += `DISCOUNT (${invoice.discountPercentage}%): -${invoice.currency} ${discountAmount.toLocaleString()}\n`;
    if (invoice.freightCharge > 0) text += `FREIGHT: +${invoice.currency} ${Number(invoice.freightCharge).toLocaleString()}\n`;
    if (invoice.insuranceCharge > 0) text += `INSURANCE: +${invoice.currency} ${Number(invoice.insuranceCharge).toLocaleString()}\n`;
    text += `GRAND TOTAL (${invoice.incoterm}): ${invoice.currency} ${grandTotal.toLocaleString()}\n`;
    text += `SAY TOTAL: ${numberToEnglishWords(grandTotal, invoice.currency)}\n`;
    text += `=========================================\n`;
    text += `BENEFICIARY: ${invoice.bankDetails.beneficiaryName}\n`;
    text += `BANK: ${invoice.bankDetails.bankName} | SWIFT: ${invoice.bankDetails.swiftBic} | IBAN: ${invoice.bankDetails.accountNumberOrIban}\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const currencySymbol = COMMON_CURRENCIES.find(c => c.code === invoice.currency)?.symbol || invoice.currency;

  return (
    <div className="space-y-6">
      {/* Top Banner / Introduction Card */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5" />
                {isFa ? 'استاندارد بین‌المللی اتاق بازرگانی (ICC & UN/CEFACT)' : 'ICC & UN/CEFACT Global Trade Standard'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-200">
                {isFa ? 'بدون نیاز به داده خارجی / مستقل' : 'Offline / Client-Side Engine'}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-emerald-400" />
              {isFa ? 'سازنده پیش‌فاکتور و پکینگ‌لیست استاندارد بین‌المللی' : 'Global Proforma Invoice & Packing List Builder'}
            </h1>
            <p className="mt-2 text-slate-300 text-sm max-w-3xl leading-relaxed">
              {isFa 
                ? 'ابزار رسمی و تخصصی بازرگانان برای صدور فوری پیش‌فاکتور (PI)، سیاهه تجاری و پکینگ لیست (PL) مطابق استانداردهای بانکی و گمرکی، محاسبه خودکار مبالغ به حروف، اوزان و حجم CBM، و خروجی چاپی و PDF آماده تحویل به مشتری و بانک.'
                : 'A dedicated suite for merchants and forwarders to draft and generate official Proforma Invoices (PI), Commercial Invoices, and Packing Lists (PL) compliant with ICC banking rules, automatic number-to-words, CBM calculation, and print/PDF ready.'
              }
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 bg-white/5 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-xs">
            <div className="text-center px-3 border-r border-white/10 last:border-0">
              <div className="text-slate-400 font-medium">{isFa ? 'مجموع پیش‌فاکتور' : 'Grand Total'}</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {currencySymbol} {grandTotal.toLocaleString()}
              </div>
            </div>
            <div className="text-center px-3 border-r border-white/10 last:border-0">
              <div className="text-slate-400 font-medium">{isFa ? 'تعداد بسته‌ها' : 'Total Packages'}</div>
              <div className="text-base font-bold text-amber-400 mt-0.5">
                {packingTotals.totalPackages} {isFa ? 'بسته' : 'Pkgs'}
              </div>
            </div>
            <div className="text-center px-3">
              <div className="text-slate-400 font-medium">{isFa ? 'حجم کل (CBM)' : 'Total CBM'}</div>
              <div className="text-base font-bold text-cyan-400 mt-0.5">
                {packingTotals.totalCbm} m³
              </div>
            </div>
          </div>
        </div>

        {/* Status notification toast */}
        {saveStatus && (
          <div className="mt-4 p-2.5 bg-emerald-900/80 border border-emerald-400/50 rounded-lg text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      {/* Main Control Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Document Type Switcher (PI vs PL) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveDocType('PI')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeDocType === 'PI'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            {isFa ? '۱. پیش‌فاکتور (Proforma Invoice)' : '1. Proforma Invoice (PI)'}
          </button>
          <button
            onClick={() => setActiveDocType('PL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeDocType === 'PL'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-amber-600" />
            {isFa ? '۲. پکینگ لیست گمرکی (Packing List)' : '2. Packing List (PL)'}
          </button>
        </div>

        {/* View Mode Switcher (Editor vs Document Preview) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setViewMode('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'editor'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isFa ? 'ویرایش فرم' : 'Edit Form'}
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'preview'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {isFa ? 'سند رسمی چاپی' : 'Official Preview'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              title={isFa ? 'تولید و دانلود مستقیم فایل PDF' : 'Generate and download official PDF file'}
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{isFa ? 'در حال ساخت PDF...' : 'Creating PDF...'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-emerald-100" />
                  <span>{isFa ? 'دانلود فایل PDF' : 'Download PDF'}</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title={isFa ? 'ارسال به چاپگر' : 'Print via browser'}
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>{isFa ? 'چاپگر' : 'Print'}</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
              title={isFa ? 'کپی خلاصه متن برای ایمیل/واتساپ' : 'Copy summary text'}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (isFa ? 'کپی شد!' : 'Copied!') : (isFa ? 'کپی متن' : 'Copy Text')}</span>
            </button>

            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
              title={isFa ? 'ذخیره در پیش‌نویس‌های مرورگر' : 'Save draft in browser'}
            >
              <Bookmark className="w-4 h-4 text-amber-600" />
              <span>{isFa ? 'ذخیره' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Direct PDF Download Action Banner */}
      {downloadedPdfInfo && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5 text-emerald-950 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="block text-emerald-900 font-extrabold text-sm">
                {isFa ? 'سند PDF با موفقیت آماده شد' : 'PDF Document Ready'}
              </span>
              <span className="font-mono text-emerald-700 font-normal text-[11px]">
                {downloadedPdfInfo.filename}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={downloadedPdfInfo.url}
              download={downloadedPdfInfo.filename}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isFa ? 'دریافت مستقیم فایل PDF' : 'Direct Download PDF'}</span>
            </a>
            <a
              href={downloadedPdfInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{isFa ? 'مشاهده در صفحه جدید' : 'Open in New Tab'}</span>
            </a>
          </div>
        </div>
      )}

      {/* Preset Industry Templates Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {isFa ? 'نمونه‌های آماده بازرگانی:' : 'Ready Industry Presets:'}
          </span>
          <button
            onClick={() => handleLoadTemplate('pistachio_export')}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg border border-slate-200 transition-colors"
          >
            🌰 {isFa ? 'صادرات پسته به آلمان (FOB)' : 'Pistachio to Germany (FOB)'}
          </button>
          <button
            onClick={() => handleLoadTemplate('electronics_import')}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg border border-slate-200 transition-colors"
          >
            ⚡ {isFa ? 'واردات قطعات الکترونیک از چین (FCA)' : 'Electronics from China (FCA)'}
          </button>
          <button
            onClick={() => handleLoadTemplate('petrochem_export')}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg border border-slate-200 transition-colors"
          >
            🧪 {isFa ? 'صادرات پلیمر به ترکیه (CFR)' : 'Petrochem to Turkey (CFR)'}
          </button>
          <button
            onClick={() => handleLoadTemplate('blank_slate')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors"
          >
            📝 {isFa ? 'پیش‌نویس خام (شروع از صفر)' : 'Blank Slate'}
          </button>
        </div>

        {/* Import/Export & Drafts Dropdown */}
        <div className="flex items-center gap-2">
          {savedDraftsList.length > 0 && (
            <select
              onChange={(e) => e.target.value && handleLoadDraft(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 text-xs focus:ring-1 focus:ring-emerald-500"
              defaultValue=""
            >
              <option value="" disabled>{isFa ? '📂 پیش‌نویس‌های ذخیره‌شده...' : '📂 Saved Drafts...'}</option>
              {savedDraftsList.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={handleExportJson}
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg"
            title={isFa ? 'دانلود فایل پشتیبان JSON' : 'Export JSON'}
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <label
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg cursor-pointer"
            title={isFa ? 'ورود فایل JSON قبلی' : 'Import JSON'}
          >
            <Upload className="w-3.5 h-3.5" />
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
        </div>
      </div>

      {/* VIEW MODE 1: FORM EDITOR */}
      {viewMode === 'editor' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Sub Navigation Tabs for Form Fields */}
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setActiveEditorTab('items')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeEditorTab === 'items'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Boxes className="w-4 h-4" />
              {isFa ? 'اقلام کالا و بسته‌بندی (Items & Packages)' : 'Items & Packing Details'}
              <span className="bg-white/20 text-white rounded-full px-1.5 py-0.2 text-[10px]">
                {invoice.items.length}
              </span>
            </button>
            <button
              onClick={() => setActiveEditorTab('parties')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeEditorTab === 'parties'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              {isFa ? 'مشخصات فروشنده و خریدار (Parties)' : 'Seller & Buyer Details'}
            </button>
            <button
              onClick={() => setActiveEditorTab('shipping')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeEditorTab === 'shipping'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Anchor className="w-4 h-4" />
              {isFa ? 'شرایط حمل و اینکوترمز (Shipping & Incoterms)' : 'Logistics & Incoterms'}
            </button>
            <button
              onClick={() => setActiveEditorTab('financials')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeEditorTab === 'financials'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              {isFa ? 'محاسبات مالی و ارز (Financials)' : 'Currency & Adjustments'}
            </button>
            <button
              onClick={() => setActiveEditorTab('bank_notes')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeEditorTab === 'bank_notes'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              {isFa ? 'اطلاعات بانکی و شروط (Bank & Notes)' : 'Bank Details & Terms'}
            </button>
          </div>

          <div className="p-6">
            {/* TAB: ITEMS & PACKING DETAILS */}
            {activeEditorTab === 'items' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {isFa ? 'اقلام کالا، مشخصات فنی و اطلاعات پکینگ' : 'Line Items & Packaging Specs'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isFa 
                        ? 'تغییرات در این بخش همزمان پیش‌فاکتور (مبالغ، کد تعرفه) و پکینگ لیست (تعداد کارتن، اوزان، ابعاد و CBM) را به‌روزرسانی می‌کند.'
                        : 'Edits here automatically synchronize pricing, HS codes, weights, dimensions and CBM for both documents.'
                      }
                    </p>
                  </div>
                  <button
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    {isFa ? 'افزودن ردیف کالا' : 'Add Item'}
                  </button>
                </div>

                <div className="space-y-4">
                  {invoice.items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          {item.description || (isFa ? 'کالای شماره ' + (index + 1) : `Item #${index + 1}`)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-700 text-sm">
                            {currencySymbol} {Number(item.totalPrice).toLocaleString()}
                          </span>
                          {invoice.items.length > 1 && (
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                              title={isFa ? 'حذف این ردیف' : 'Remove item'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Main Item Specs Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-3 text-xs">
                        <div className="md:col-span-5">
                          <label className="block text-slate-600 font-medium mb-1">
                            {isFa ? 'نام و شرح کالا (Commercial Description)' : 'Description of Goods'}
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                            placeholder="e.g. Raw Pistachios in Shell Grade 28/30"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-slate-600 font-medium mb-1">
                            {isFa ? 'کد تعرفه گمرکی (HS Code)' : 'HS Tariff Code'}
                          </label>
                          <input
                            type="text"
                            value={item.hsCode}
                            onChange={(e) => handleUpdateItem(index, 'hsCode', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-emerald-500"
                            placeholder="e.g. 0802.51.00"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-slate-600 font-medium mb-1">
                            {isFa ? 'تعداد / مقدار' : 'Quantity'}
                          </label>
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-slate-600 font-medium mb-1">
                            {isFa ? 'واحد اندازه‌گیری' : 'Unit'}
                          </label>
                          <select
                            value={item.unit}
                            onChange={(e) => handleUpdateItem(index, 'unit', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                          >
                            {COMMON_UNITS.map(u => (
                              <option key={u.value} value={u.value}>{u.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-12">
                          <label className="block text-slate-600 font-medium mb-1">
                            {isFa ? 'مشخصات فنی و استانداردهای کیفی (Specification / Quality Standards)' : 'Technical Specifications / Quality'}
                          </label>
                          <input
                            type="text"
                            value={item.specification || ''}
                            onChange={(e) => handleUpdateItem(index, 'specification', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                            placeholder="e.g. Moisture max 5%, Aflatoxin compliant with EU standards, Crop 2026"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-slate-600 font-medium mb-1">
                            {isFa ? `قیمت واحد (${invoice.currency})` : `Unit Price (${invoice.currency})`}
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="md:col-span-9 bg-emerald-50/70 border border-emerald-200/60 rounded-lg p-2.5 flex items-center justify-between">
                          <span className="text-emerald-900 font-medium text-xs">
                            {isFa ? 'جمع کل ردیف (Total Line Amount):' : 'Line Total:'}
                          </span>
                          <span className="text-base font-bold text-emerald-800 font-mono">
                            {currencySymbol} {Number(item.totalPrice).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Packing List Sub-Section for this Item */}
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                          <Package className="w-3.5 h-3.5 text-amber-600" />
                          {isFa ? 'تنظیمات پکینگ‌لیست (وزن، ابعاد و حجم کانتینر):' : 'Packing List Specs (Weights, Dimensions & CBM):'}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">
                              {isFa ? 'تعداد بسته‌ها' : 'No. Packages'}
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.packageCount}
                              onChange={(e) => handleUpdateItem(index, 'packageCount', parseInt(e.target.value) || 1)}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">
                              {isFa ? 'نوع بسته‌بندی' : 'Package Type'}
                            </label>
                            <input
                              type="text"
                              value={item.packageType}
                              onChange={(e) => handleUpdateItem(index, 'packageType', e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                              placeholder="Cartons, Pallets..."
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">
                              {isFa ? 'وزن خالص هر واحد (kg)' : 'Net Wgt/Unit (kg)'}
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={item.netWeightPerUnitKg}
                              onChange={(e) => handleUpdateItem(index, 'netWeightPerUnitKg', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">
                              {isFa ? 'وزن ناخالص هر واحد (kg)' : 'Gross Wgt/Unit (kg)'}
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={item.grossWeightPerUnitKg}
                              onChange={(e) => handleUpdateItem(index, 'grossWeightPerUnitKg', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-[10px] text-slate-500 mb-0.5">
                              {isFa ? 'ابعاد هر بسته (L × W × H سانتی‌متر)' : 'Dimensions (L × W × H cm)'}
                            </label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                placeholder="L"
                                value={item.lengthCm}
                                onChange={(e) => handleUpdateItem(index, 'lengthCm', parseFloat(e.target.value) || 0)}
                                className="w-1/3 px-1.5 py-1 bg-white border border-slate-300 rounded font-mono text-center text-xs"
                              />
                              <span className="text-slate-400">×</span>
                              <input
                                type="number"
                                placeholder="W"
                                value={item.widthCm}
                                onChange={(e) => handleUpdateItem(index, 'widthCm', parseFloat(e.target.value) || 0)}
                                className="w-1/3 px-1.5 py-1 bg-white border border-slate-300 rounded font-mono text-center text-xs"
                              />
                              <span className="text-slate-400">×</span>
                              <input
                                type="number"
                                placeholder="H"
                                value={item.heightCm}
                                onChange={(e) => handleUpdateItem(index, 'heightCm', parseFloat(e.target.value) || 0)}
                                className="w-1/3 px-1.5 py-1 bg-white border border-slate-300 rounded font-mono text-center text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Calculated Sub-Metrics for this row */}
                        <div className="mt-2 text-[10px] text-slate-600 flex items-center gap-4 bg-slate-100/70 px-3 py-1.5 rounded">
                          <span>
                            {isFa ? 'وزن ناخالص کل ردیف:' : 'Row Gross Weight:'} <strong>{(item.packageCount * item.grossWeightPerUnitKg).toFixed(1)} kg</strong>
                          </span>
                          <span>
                            {isFa ? 'حجم کل ردیف:' : 'Row Volume:'} <strong>{(((item.lengthCm * item.widthCm * item.heightCm) / 1000000) * item.packageCount).toFixed(3)} CBM</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SELLER & BUYER PARTIES */}
            {activeEditorTab === 'parties' && (
              <div className="space-y-6">
                {/* Document Reference Info */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    {isFa ? 'اطلاعات عمومی سند' : 'Document Header Details'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        {isFa ? 'نوع سند' : 'Document Type'}
                      </label>
                      <select
                        value={invoice.docType}
                        onChange={(e) => setInvoice(prev => ({ ...prev, docType: e.target.value as any }))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="PROFORMA_INVOICE">{isFa ? 'پیش‌فاکتور (Proforma Invoice)' : 'Proforma Invoice'}</option>
                        <option value="COMMERCIAL_INVOICE">{isFa ? 'سیاهه تجاری رسمی (Commercial Invoice)' : 'Commercial Invoice'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        {isFa ? 'شماره سند / فاکتور' : 'Invoice Number'}
                      </label>
                      <input
                        type="text"
                        value={invoice.invoiceNumber}
                        onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        {isFa ? 'تاریخ صدور' : 'Date of Issue'}
                      </label>
                      <input
                        type="date"
                        value={invoice.date}
                        onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        {isFa ? 'مهلت اعتبار (Valid Until)' : 'Validity Expiry'}
                      </label>
                      <input
                        type="date"
                        value={invoice.validUntil}
                        onChange={(e) => setInvoice(prev => ({ ...prev, validUntil: e.target.value }))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SELLER INFO */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-3 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      {isFa ? 'مشخصات فروشنده / صادرکننده (Seller / Exporter)' : 'Seller / Exporter'}
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="block text-slate-600 mb-0.5">{isFa ? 'نام رسمی شرکت' : 'Company Name'}</label>
                        <input
                          type="text"
                          value={invoice.seller.companyName}
                          onChange={(e) => setInvoice(prev => ({ ...prev, seller: { ...prev.seller, companyName: e.target.value } }))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5">{isFa ? 'شخص پاسخگو / نماینده' : 'Contact Person'}</label>
                        <input
                          type="text"
                          value={invoice.seller.contactPerson}
                          onChange={(e) => setInvoice(prev => ({ ...prev, seller: { ...prev.seller, contactPerson: e.target.value } }))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5">{isFa ? 'آدرس کامل پستی' : 'Street Address'}</label>
                        <input
                          type="text"
                          value={invoice.seller.address}
                          onChange={(e) => setInvoice(prev => ({ ...prev, seller: { ...prev.seller, address: e.target.value } }))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-600 mb-0.5">{isFa ? 'شهر و کشور' : 'City & Country'}</label>
                          <input
                            type="text"
                            value={invoice.seller.cityCountry}
                            onChange={(e) => setInvoice(prev => ({ ...prev, seller: { ...prev.seller, cityCountry: e.target.value } }))}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 mb-0.5">{isFa ? 'تلفن تماس' : 'Phone'}</label>
                          <input
                            type="text"
                            value={invoice.seller.phone}
                            onChange={(e) => setInvoice(prev => ({ ...prev, seller: { ...prev.seller, phone: e.target.value } }))}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-600 mb-0.5">{isFa ? 'ایمیل رسمی' : 'Email'}</label>
                          <input
                            type="email"
                            value={invoice.seller.email}
                            onChange={(e) => setInvoice(prev => ({ ...prev, seller: { ...prev.seller, email: e.target.value } }))}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 mb-0.5">{isFa ? 'شناسه مالیاتی / VAT' : 'Tax / VAT ID'}</label>
                          <input
                            type="text"
                            value={invoice.seller.taxOrVatId || ''}
                            onChange={(e) => setInvoice(prev => ({ ...prev, seller: { ...prev.seller, taxOrVatId: e.target.value } }))}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BUYER INFO */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-3 text-blue-800 font-bold text-xs uppercase tracking-wider">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      {isFa ? 'مشخصات خریدار / واردکننده (Buyer / Consignee)' : 'Buyer / Consignee'}
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="block text-slate-600 mb-0.5">{isFa ? 'نام رسمی شرکت خریدار' : 'Buyer Company Name'}</label>
                        <input
                          type="text"
                          value={invoice.buyer.companyName}
                          onChange={(e) => setInvoice(prev => ({ ...prev, buyer: { ...prev.buyer, companyName: e.target.value } }))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5">{isFa ? 'شخص مسئول خرید' : 'Contact Person'}</label>
                        <input
                          type="text"
                          value={invoice.buyer.contactPerson}
                          onChange={(e) => setInvoice(prev => ({ ...prev, buyer: { ...prev.buyer, contactPerson: e.target.value } }))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5">{isFa ? 'آدرس خریدار در مقصد' : 'Address in Destination'}</label>
                        <input
                          type="text"
                          value={invoice.buyer.address}
                          onChange={(e) => setInvoice(prev => ({ ...prev, buyer: { ...prev.buyer, address: e.target.value } }))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-600 mb-0.5">{isFa ? 'شهر و کشور خریدار' : 'City & Country'}</label>
                          <input
                            type="text"
                            value={invoice.buyer.cityCountry}
                            onChange={(e) => setInvoice(prev => ({ ...prev, buyer: { ...prev.buyer, cityCountry: e.target.value } }))}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 mb-0.5">{isFa ? 'تلفن تماس خریدار' : 'Phone'}</label>
                          <input
                            type="text"
                            value={invoice.buyer.phone}
                            onChange={(e) => setInvoice(prev => ({ ...prev, buyer: { ...prev.buyer, phone: e.target.value } }))}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-600 mb-0.5">{isFa ? 'ایمیل رسمی خریدار' : 'Email'}</label>
                          <input
                            type="email"
                            value={invoice.buyer.email}
                            onChange={(e) => setInvoice(prev => ({ ...prev, buyer: { ...prev.buyer, email: e.target.value } }))}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 mb-0.5">{isFa ? 'شماره مالیاتی خریدار (VAT)' : 'Buyer Tax/VAT'}</label>
                          <input
                            type="text"
                            value={invoice.buyer.taxOrVatId || ''}
                            onChange={(e) => setInvoice(prev => ({ ...prev, buyer: { ...prev.buyer, taxOrVatId: e.target.value } }))}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SHIPPING & INCOTERMS */}
            {activeEditorTab === 'shipping' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  {isFa ? 'قوانین تجاری اینکوترمز ۲۰۲۰ و مسیر لجستیک' : 'Incoterms 2020 & Logistics Route'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      {isFa ? 'قاعده اینکوترمز (Incoterm 2020)' : 'Incoterms 2020 Rule'}
                    </label>
                    <select
                      value={invoice.incoterm}
                      onChange={(e) => setInvoice(prev => ({ ...prev, incoterm: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-emerald-800"
                    >
                      {INCOTERMS_LIST.map(inc => (
                        <option key={inc.code} value={inc.code}>
                          {inc.code} - {inc.name} ({inc.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      {isFa ? 'محل یا بندر مقرر (Named Place / Port)' : 'Named Port / Place'}
                    </label>
                    <input
                      type="text"
                      value={invoice.namedPlace}
                      onChange={(e) => setInvoice(prev => ({ ...prev, namedPlace: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      placeholder="e.g. Bandar Abbas Port / Hamburg"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      {isFa ? 'کشور مبدأ کالا (Country of Origin)' : 'Country of Origin'}
                    </label>
                    <input
                      type="text"
                      value={invoice.countryOfOrigin}
                      onChange={(e) => setInvoice(prev => ({ ...prev, countryOfOrigin: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      {isFa ? 'بندر بارگیری (Port of Loading - POL)' : 'Port of Loading (POL)'}
                    </label>
                    <input
                      type="text"
                      value={invoice.portOfLoading}
                      onChange={(e) => setInvoice(prev => ({ ...prev, portOfLoading: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      placeholder="e.g. Bandar Abbas Port"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      {isFa ? 'بندر تخلیه (Port of Discharge - POD)' : 'Port of Discharge (POD)'}
                    </label>
                    <input
                      type="text"
                      value={invoice.portOfDischarge}
                      onChange={(e) => setInvoice(prev => ({ ...prev, portOfDischarge: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      placeholder="e.g. Hamburg Port / Jebel Ali"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      {isFa ? 'مقصد نهایی (Final Destination)' : 'Final Destination'}
                    </label>
                    <input
                      type="text"
                      value={invoice.finalDestination}
                      onChange={(e) => setInvoice(prev => ({ ...prev, finalDestination: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      placeholder="e.g. Hamburg Warehouse, Germany"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-600 font-medium mb-1">
                      {isFa ? 'شرایط و نحوه پرداخت (Payment Terms)' : 'Terms of Payment'}
                    </label>
                    <input
                      type="text"
                      value={invoice.paymentTerms}
                      onChange={(e) => setInvoice(prev => ({ ...prev, paymentTerms: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      placeholder="e.g. 30% T/T Advance + 70% against BL copy"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      {isFa ? 'زمان تحویل و بارگیری (Shipment Timeline)' : 'Delivery / Shipment Period'}
                    </label>
                    <input
                      type="text"
                      value={invoice.deliveryTime}
                      onChange={(e) => setInvoice(prev => ({ ...prev, deliveryTime: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      placeholder="e.g. Within 20 days after receipt of advance"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-slate-600 font-medium mb-1">
                      {isFa ? 'علائم و مشخصات روی بسته‌ها (Shipping Marks & Numbers)' : 'Marks & Numbers'}
                    </label>
                    <input
                      type="text"
                      value={invoice.shippingMarks}
                      onChange={(e) => setInvoice(prev => ({ ...prev, shippingMarks: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                      placeholder="M/N: ORDER-REF / CARTON 1-100 / MADE IN ..."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      {isFa ? 'حمل چندمرحله‌ای (Partial Shipment)' : 'Partial Shipment'}
                    </label>
                    <select
                      value={invoice.partialShipment}
                      onChange={(e) => setInvoice(prev => ({ ...prev, partialShipment: e.target.value as any }))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="ALLOWED">{isFa ? 'مجاز است (ALLOWED)' : 'Allowed'}</option>
                      <option value="NOT_ALLOWED">{isFa ? 'مجاز نیست (NOT ALLOWED)' : 'Not Allowed'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      {isFa ? 'تغییر وسیله حمل (Transhipment)' : 'Transhipment'}
                    </label>
                    <select
                      value={invoice.transhipment}
                      onChange={(e) => setInvoice(prev => ({ ...prev, transhipment: e.target.value as any }))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="ALLOWED">{isFa ? 'مجاز است (ALLOWED)' : 'Allowed'}</option>
                      <option value="NOT_ALLOWED">{isFa ? 'مجاز نیست (NOT ALLOWED)' : 'Not Allowed'}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: FINANCIALS & CURRENCY */}
            {activeEditorTab === 'financials' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  {isFa ? 'تنظیمات ارز، تخفیفات و هزینه‌های جانبی حمل' : 'Currency, Discounts & Adjustments'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      {isFa ? 'واحد پول معامله (Currency)' : 'Invoice Currency'}
                    </label>
                    <select
                      value={invoice.currency}
                      onChange={(e) => setInvoice(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                    >
                      {COMMON_CURRENCIES.map(curr => (
                        <option key={curr.code} value={curr.code}>
                          {curr.code} ({curr.symbol}) - {curr.name} ({curr.fa})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      {isFa ? 'تخفیف تجاری (%)' : 'Discount (%)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={invoice.discountPercentage}
                      onChange={(e) => setInvoice(prev => ({ ...prev, discountPercentage: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      {isFa ? `کرایه حمل (${invoice.currency})` : `Freight Charge (${invoice.currency})`}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={invoice.freightCharge}
                      onChange={(e) => setInvoice(prev => ({ ...prev, freightCharge: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      {isFa ? `بیمه باربری (${invoice.currency})` : `Insurance Fee (${invoice.currency})`}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={invoice.insuranceCharge}
                      onChange={(e) => setInvoice(prev => ({ ...prev, insuranceCharge: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      {isFa ? `سایر هزینه‌ها - گواهی و بازرسی (${invoice.currency})` : `Other Fees / Certification (${invoice.currency})`}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={invoice.otherCharges}
                      onChange={(e) => setInvoice(prev => ({ ...prev, otherCharges: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="bg-slate-900 text-white rounded-xl p-4 mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">{isFa ? 'مجموع اقلام (Subtotal):' : 'Items Subtotal:'}</span>
                    <span className="text-sm font-bold font-mono text-slate-200">
                      {currencySymbol} {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isFa ? 'میزان تخفیف:' : 'Discount Amount:'}</span>
                    <span className="text-sm font-bold font-mono text-rose-300">
                      -{currencySymbol} {discountAmount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isFa ? 'کرایه، بیمه و متفرقه:' : 'Freight + Ins + Other:'}</span>
                    <span className="text-sm font-bold font-mono text-cyan-300">
                      +{currencySymbol} {(Number(invoice.freightCharge || 0) + Number(invoice.insuranceCharge || 0) + Number(invoice.otherCharges || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-emerald-950/80 p-2 rounded-lg border border-emerald-500/40">
                    <span className="text-emerald-300 block font-semibold">{isFa ? 'مبلغ کل نهایی:' : 'Grand Total:'}</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      {currencySymbol} {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-700" />
                    {isFa ? 'مبلغ به حروف (استاندارد بین‌المللی بانک‌ها):' : 'Amount in Words (ICC Banking Clause):'}
                  </div>
                  <p className="font-serif italic font-semibold text-slate-800">
                    "Say Total: {numberToEnglishWords(grandTotal, invoice.currency)}"
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    مبلغ به حروف فارسی: {numberToPersianWords(grandTotal, invoice.currency)}
                  </p>
                </div>
              </div>
            )}

            {/* TAB: BANK DETAILS & NOTES */}
            {activeEditorTab === 'bank_notes' && (
              <div className="space-y-6">
                {/* Bank Details */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold text-xs uppercase tracking-wider">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    {isFa ? 'مشخصات حساب بانکی ذینفع جهت حواله (Beneficiary Bank Details)' : 'Beneficiary Wire Transfer Details'}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        {isFa ? 'نام ذینفع حساب (Beneficiary Name)' : 'Account Beneficiary Name'}
                      </label>
                      <input
                        type="text"
                        value={invoice.bankDetails.beneficiaryName}
                        onChange={(e) => setInvoice(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, beneficiaryName: e.target.value } }))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        {isFa ? 'نام بانک (Bank Name)' : 'Bank Name'}
                      </label>
                      <input
                        type="text"
                        value={invoice.bankDetails.bankName}
                        onChange={(e) => setInvoice(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, bankName: e.target.value } }))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        {isFa ? 'کد سوئیفت (SWIFT / BIC)' : 'SWIFT / BIC Code'}
                      </label>
                      <input
                        type="text"
                        value={invoice.bankDetails.swiftBic}
                        onChange={(e) => setInvoice(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, swiftBic: e.target.value } }))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        {isFa ? 'شماره شبا یا شماره حساب (IBAN / Account No)' : 'IBAN / Account Number'}
                      </label>
                      <input
                        type="text"
                        value={invoice.bankDetails.accountNumberOrIban}
                        onChange={(e) => setInvoice(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, accountNumberOrIban: e.target.value } }))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-slate-600 font-medium mb-1">
                        {isFa ? 'آدرس شعبه بانک' : 'Bank Address'}
                      </label>
                      <input
                        type="text"
                        value={invoice.bankDetails.bankAddress}
                        onChange={(e) => setInvoice(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, bankAddress: e.target.value } }))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Signatory Info */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold text-xs uppercase tracking-wider">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    {isFa ? 'مشخصات امضاکننده مجاز شرکت (Authorized Signatory)' : 'Authorized Signatory'}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        {isFa ? 'نام امضاکننده' : 'Signatory Name'}
                      </label>
                      <input
                        type="text"
                        value={invoice.authorizedSignatoryName}
                        onChange={(e) => setInvoice(prev => ({ ...prev, authorizedSignatoryName: e.target.value }))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        {isFa ? 'سمت سازمانی' : 'Designation / Title'}
                      </label>
                      <input
                        type="text"
                        value={invoice.authorizedSignatoryTitle}
                        onChange={(e) => setInvoice(prev => ({ ...prev, authorizedSignatoryTitle: e.target.value }))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: OFFICIAL PRINTABLE PREVIEW (ICC & UN/CEFACT FORMAT) */}
      {viewMode === 'preview' && (
        <div className="space-y-4">
          {/* Quick Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs text-amber-800 print:hidden">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              {isFa
                ? 'پیش‌نمایش سند رسمی آماده چاپ. با کلیک بر روی دکمه «چاپ / PDF» در بالای صفحه، سند در ابعاد استاندارد A4 چاپ یا ذخیره می‌شود.'
                : 'Official ready-to-print preview. Use the "Print / PDF" button above to output directly to standard A4 size.'
              }
            </span>
            <button
              onClick={() => setViewMode('editor')}
              className="text-amber-900 font-bold underline hover:text-amber-700"
            >
              {isFa ? 'ویرایش اطلاعات' : 'Edit Information'}
            </button>
          </div>

          {/* OFFICIAL DOCUMENT CONTAINER (Clean printable area - Strictly LTR for International Trade) */}
          <div 
            ref={documentRef}
            dir="ltr"
            style={{ direction: 'ltr', textAlign: 'left' }}
            className="print-document-area bg-white text-slate-900 border border-slate-300 shadow-xl rounded-xl p-8 max-w-5xl mx-auto print:m-0 print:p-0 print:border-none print:shadow-none font-sans text-xs text-left"
          >
            {/* Header: Document Title & Reference Box */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-4 text-left">
              <div className="text-left">
                <h2 className="text-2xl font-black tracking-wider uppercase text-slate-900 text-left">
                  {activeDocType === 'PI' 
                    ? (invoice.docType === 'COMMERCIAL_INVOICE' ? 'COMMERCIAL INVOICE' : 'PROFORMA INVOICE')
                    : 'OFFICIAL PACKING LIST'
                  }
                </h2>
                <div className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider text-left">
                  {activeDocType === 'PI' ? 'ICC INTERNATIONAL STANDARD COMMERCIAL DOCUMENT' : 'CUSTOMS & CARGO PACKING DECLARATION'}
                </div>
              </div>

              {/* Document Reference Stamp */}
              <div className="text-right border border-slate-300 rounded p-2.5 bg-slate-50 min-w-[220px]">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500 font-medium">Invoice No:</span>
                  <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-1">
                  <span className="text-slate-500 font-medium">Date:</span>
                  <span className="font-mono text-slate-800">{invoice.date}</span>
                </div>
                {activeDocType === 'PI' && (
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 font-medium">Valid Until:</span>
                    <span className="font-mono font-semibold text-emerald-800">{invoice.validUntil}</span>
                  </div>
                )}
                {invoice.orderReference && (
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">PO Ref:</span>
                    <span className="font-mono text-slate-800">{invoice.orderReference}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Parties Grid (Seller vs Buyer & Notify) */}
            <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded-md p-3 mb-4 bg-slate-50/30 text-left">
              {/* SELLER BOX */}
              <div className="border-r border-slate-200 pr-3 text-left">
                <div className="font-bold text-[11px] text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-1 mb-1.5 flex items-center justify-between text-left">
                  <span>EXPORTER / SHIPPER / SELLER</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{invoice.seller.companyName}</div>
                <div className="text-slate-600 mt-0.5">{invoice.seller.address}</div>
                <div className="text-slate-600">{invoice.seller.cityCountry}</div>
                <div className="text-slate-600 mt-1">
                  <span>Attn: <strong>{invoice.seller.contactPerson}</strong></span> | <span>Tel: {invoice.seller.phone}</span>
                </div>
                <div className="text-slate-600">Email: {invoice.seller.email}</div>
                {invoice.seller.taxOrVatId && (
                  <div className="text-slate-500 text-[10px] mt-0.5 font-mono">Tax/VAT: {invoice.seller.taxOrVatId}</div>
                )}
              </div>

              {/* BUYER / CONSIGNEE BOX */}
              <div className="pl-3 text-left">
                <div className="font-bold text-[11px] text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-1 mb-1.5 flex items-center justify-between text-left">
                  <span>CONSIGNEE / BUYER / IMPORTER</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{invoice.buyer.companyName}</div>
                <div className="text-slate-600 mt-0.5">{invoice.buyer.address}</div>
                <div className="text-slate-600">{invoice.buyer.cityCountry}</div>
                <div className="text-slate-600 mt-1">
                  <span>Attn: <strong>{invoice.buyer.contactPerson}</strong></span> | <span>Tel: {invoice.buyer.phone}</span>
                </div>
                <div className="text-slate-600">Email: {invoice.buyer.email}</div>
                {invoice.buyer.taxOrVatId && (
                  <div className="text-slate-500 text-[10px] mt-0.5 font-mono">Tax/VAT: {invoice.buyer.taxOrVatId}</div>
                )}
              </div>
            </div>

            {/* Shipping & Commercial Terms Strip */}
            <div className="border border-slate-300 rounded-md overflow-hidden mb-4">
              <table className="w-full text-left border-collapse text-[11px]">
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-slate-100 font-semibold text-slate-700">
                    <td className="p-2 border-r border-slate-200 w-1/4">Terms of Delivery (Incoterms 2020)</td>
                    <td className="p-2 border-r border-slate-200 w-1/4">Port of Loading (POL)</td>
                    <td className="p-2 border-r border-slate-200 w-1/4">Port of Discharge (POD)</td>
                    <td className="p-2 w-1/4">Country of Origin</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2 border-r border-slate-200 font-bold text-emerald-800">
                      {invoice.incoterm} - {invoice.namedPlace}
                    </td>
                    <td className="p-2 border-r border-slate-200">{invoice.portOfLoading}</td>
                    <td className="p-2 border-r border-slate-200">{invoice.portOfDischarge}</td>
                    <td className="p-2 font-medium">{invoice.countryOfOrigin}</td>
                  </tr>
                  <tr className="bg-slate-100 font-semibold text-slate-700">
                    <td className="p-2 border-r border-slate-200">Terms of Payment</td>
                    <td className="p-2 border-r border-slate-200">Delivery / Shipment Time</td>
                    <td className="p-2 border-r border-slate-200">Partial / Transhipment</td>
                    <td className="p-2">Currency</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2 border-r border-slate-200">{invoice.paymentTerms}</td>
                    <td className="p-2 border-r border-slate-200">{invoice.deliveryTime}</td>
                    <td className="p-2 border-r border-slate-200">
                      Partial: {invoice.partialShipment} | Trans: {invoice.transhipment}
                    </td>
                    <td className="p-2 font-bold font-mono text-slate-900">{invoice.currency}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* DOCUMENT BODY 1: PROFORMA INVOICE TABLE */}
            {activeDocType === 'PI' && (
              <div className="space-y-4">
                <table className="w-full border-collapse border border-slate-300 text-left text-xs">
                  <thead>
                    <tr className="bg-slate-800 text-white font-semibold text-[11px]">
                      <th className="p-2 border border-slate-300 w-10 text-center">#</th>
                      <th className="p-2 border border-slate-300 w-24">HS Code</th>
                      <th className="p-2 border border-slate-300">Description of Goods & Specifications</th>
                      <th className="p-2 border border-slate-300 w-20 text-center">Qty</th>
                      <th className="p-2 border border-slate-300 w-16 text-center">Unit</th>
                      <th className="p-2 border border-slate-300 w-28 text-right">Unit Price ({invoice.currency})</th>
                      <th className="p-2 border border-slate-300 w-32 text-right">Total ({invoice.currency})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50">
                        <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                        <td className="p-2 border border-slate-300 font-mono text-[11px] text-slate-700">{item.hsCode || '-'}</td>
                        <td className="p-2 border border-slate-300">
                          <div className="font-semibold text-slate-900">{item.description}</div>
                          {item.specification && (
                            <div className="text-[11px] text-slate-500 mt-0.5">{item.specification}</div>
                          )}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono font-medium">{item.quantity.toLocaleString()}</td>
                        <td className="p-2 border border-slate-300 text-center text-slate-600 text-[11px]">{item.unit}</td>
                        <td className="p-2 border border-slate-300 text-right font-mono">{Number(item.unitPrice).toFixed(2)}</td>
                        <td className="p-2 border border-slate-300 text-right font-mono font-bold text-slate-900">
                          {Number(item.totalPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Financial Totals */}
                  <tfoot className="border-t-2 border-slate-800 bg-slate-50">
                    <tr>
                      <td colSpan={5} rowSpan={5} className="p-3 border border-slate-300 align-top bg-white">
                        <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold mb-1">
                          Amount in Words (Say Total):
                        </div>
                        <div className="font-serif italic font-semibold text-slate-900 text-sm">
                          "{numberToEnglishWords(grandTotal, invoice.currency)}"
                        </div>
                        <div className="mt-3 text-[10px] text-slate-500">
                          Marks & Numbers: <strong className="font-mono text-slate-700">{invoice.shippingMarks || 'N/M'}</strong>
                        </div>
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-semibold text-slate-600">Subtotal:</td>
                      <td className="p-2 border border-slate-300 text-right font-mono font-semibold">
                        {subtotal.toFixed(2)}
                      </td>
                    </tr>
                    {invoice.discountPercentage > 0 && (
                      <tr>
                        <td className="p-2 border border-slate-300 text-right text-rose-700">
                          Discount ({invoice.discountPercentage}%):
                        </td>
                        <td className="p-2 border border-slate-300 text-right font-mono text-rose-700">
                          -{discountAmount.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {invoice.freightCharge > 0 && (
                      <tr>
                        <td className="p-2 border border-slate-300 text-right text-slate-600">Freight Charge:</td>
                        <td className="p-2 border border-slate-300 text-right font-mono">
                          +{Number(invoice.freightCharge).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {invoice.insuranceCharge > 0 && (
                      <tr>
                        <td className="p-2 border border-slate-300 text-right text-slate-600">Insurance:</td>
                        <td className="p-2 border border-slate-300 text-right font-mono">
                          +{Number(invoice.insuranceCharge).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-slate-800 text-white font-bold text-sm">
                      <td className="p-2 border border-slate-800 text-right">TOTAL ({invoice.incoterm}):</td>
                      <td className="p-2 border border-slate-800 text-right font-mono">
                        {invoice.currency} {grandTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Banking Coordinates */}
                <div className="border border-slate-300 rounded-md p-3 bg-slate-50 text-left">
                  <div className="font-bold text-[11px] text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-1 mb-2 text-left">
                    BENEFICIARY WIRE TRANSFER INSTRUCTIONS (BANKING DETAILS)
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-left">
                    <div className="text-left">
                      <span className="text-slate-500 block text-left">Beneficiary Name:</span>
                      <strong className="text-slate-900 block text-left">{invoice.bankDetails.beneficiaryName}</strong>
                    </div>
                    <div className="text-left">
                      <span className="text-slate-500 block text-left">Bank Name:</span>
                      <strong className="text-slate-900 block text-left">{invoice.bankDetails.bankName}</strong>
                    </div>
                    <div className="text-left">
                      <span className="text-slate-500 block text-left">SWIFT / BIC Code:</span>
                      <strong className="font-mono text-slate-900 block text-left">{invoice.bankDetails.swiftBic}</strong>
                    </div>
                    <div className="text-left">
                      <span className="text-slate-500 block text-left">IBAN / Account Number:</span>
                      <strong className="font-mono text-slate-900 block text-left">{invoice.bankDetails.accountNumberOrIban}</strong>
                    </div>
                  </div>
                </div>

                {/* Special Terms & Notes */}
                {invoice.specialNotes && invoice.specialNotes.length > 0 && (
                  <div className="border border-slate-200 rounded p-2.5 text-[10px] text-slate-600 bg-white text-left">
                    <span className="font-bold text-slate-800 uppercase tracking-wide block mb-1 text-left">General Conditions & Special Notes:</span>
                    <ol className="list-decimal list-inside space-y-0.5 text-left">
                      {invoice.specialNotes.map((note, i) => (
                        <li key={i} className="text-left">{note}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* DOCUMENT BODY 2: OFFICIAL PACKING LIST TABLE */}
            {activeDocType === 'PL' && (
              <div className="space-y-4 text-left">
                <table className="w-full border-collapse border border-slate-300 text-left text-xs">
                  <thead>
                    <tr className="bg-slate-800 text-white font-semibold text-[11px]">
                      <th className="p-2 border border-slate-300 w-10 text-center">#</th>
                      <th className="p-2 border border-slate-300 w-32 text-left">Marks & Numbers</th>
                      <th className="p-2 border border-slate-300 text-left">Description of Goods</th>
                      <th className="p-2 border border-slate-300 w-24 text-center">Package Type</th>
                      <th className="p-2 border border-slate-300 w-16 text-center">Pkgs</th>
                      <th className="p-2 border border-slate-300 w-20 text-center">Net Wgt (kg)</th>
                      <th className="p-2 border border-slate-300 w-20 text-center">Gross Wgt (kg)</th>
                      <th className="p-2 border border-slate-300 w-24 text-center">Dimensions (cm)</th>
                      <th className="p-2 border border-slate-300 w-20 text-right">CBM (m³)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((item, idx) => {
                      const netRow = item.packageCount * item.netWeightPerUnitKg;
                      const grossRow = item.packageCount * item.grossWeightPerUnitKg;
                      const cbmRow = ((item.lengthCm * item.widthCm * item.heightCm) / 1000000) * item.packageCount;

                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50">
                          <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                          <td className="p-2 border border-slate-300 font-mono text-[10px] text-slate-600 text-left">
                            {invoice.shippingMarks || 'N/M'}
                          </td>
                          <td className="p-2 border border-slate-300 text-left">
                            <div className="font-semibold text-slate-900 text-left">{item.description}</div>
                            <div className="text-[10px] text-slate-500 font-mono text-left">HS: {item.hsCode || '-'} | Qty: {item.quantity} {item.unit}</div>
                          </td>
                          <td className="p-2 border border-slate-300 text-center text-[11px] text-slate-700">
                            {item.packageType}
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                            {item.packageCount}
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-mono">
                            {netRow.toFixed(1)}
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-mono font-semibold">
                            {grossRow.toFixed(1)}
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-mono text-[10px]">
                            {item.lengthCm}×{item.widthCm}×{item.heightCm}
                          </td>
                          <td className="p-2 border border-slate-300 text-right font-mono font-bold text-slate-800">
                            {cbmRow.toFixed(3)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Packing List Grand Totals */}
                  <tfoot className="border-t-2 border-slate-800 bg-slate-100 font-bold text-xs">
                    <tr>
                      <td colSpan={4} className="p-2.5 border border-slate-300 text-left uppercase text-slate-700">
                        TOTAL SHIPMENT CARGO SUMMARY:
                      </td>
                      <td className="p-2.5 border border-slate-300 text-center font-mono text-amber-900">
                        {packingTotals.totalPackages}
                      </td>
                      <td className="p-2.5 border border-slate-300 text-center font-mono text-slate-900">
                        {packingTotals.totalNetWeightKg.toLocaleString()} kg
                      </td>
                      <td className="p-2.5 border border-slate-300 text-center font-mono text-slate-900">
                        {packingTotals.totalGrossWeightKg.toLocaleString()} kg
                      </td>
                      <td className="p-2.5 border border-slate-300 text-center text-[10px] text-slate-500">
                        -
                      </td>
                      <td className="p-2.5 border border-slate-300 text-right font-mono text-emerald-900">
                        {packingTotals.totalCbm.toFixed(3)} m³
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Freight Forwarding & Container Utilization Box */}
                <div className="border border-slate-300 rounded-md p-3 bg-slate-50 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-left">
                  <div className="text-left">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold text-left">Total Packages</span>
                    <strong className="text-sm font-bold text-slate-900 text-left block">{packingTotals.totalPackages} Cartons / Units</strong>
                  </div>
                  <div className="text-left">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold text-left">Total Gross Weight</span>
                    <strong className="text-sm font-bold text-slate-900 text-left block">{packingTotals.totalGrossWeightKg.toLocaleString()} KGS</strong>
                  </div>
                  <div className="text-left">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold text-left">Total Volume (CBM)</span>
                    <strong className="text-sm font-bold text-emerald-800 text-left block">{packingTotals.totalCbm} m³</strong>
                  </div>
                  <div className="text-left">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold text-left">Air Volumetric (1:6000)</span>
                    <strong className="text-sm font-bold text-cyan-800 text-left block">{packingTotals.airVolumetricWeightKg} KGS</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Signature & Seal Footer */}
            <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 gap-8 text-left">
              <div className="text-left">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 text-left">Declaration:</div>
                <p className="text-[10px] text-slate-600 italic leading-relaxed text-left">
                  We hereby certify that this document shows the actual price of the goods described, that no other invoice has been or will be issued, and that all particulars are true and correct according to official international trade records.
                </p>
              </div>

              <div className="text-right flex flex-col justify-end items-end">
                <div className="text-[11px] font-semibold text-slate-700 text-right">
                  For and on behalf of:
                </div>
                <div className="font-bold text-slate-900 text-sm mt-0.5 text-right">
                  {invoice.seller.companyName}
                </div>
                <div className="h-16 flex items-end justify-end">
                  <div className="border-b border-slate-400 w-48 text-center pb-1 text-[10px] text-slate-400">
                    [ Authorized Signature & Official Stamp ]
                  </div>
                </div>
                <div className="text-slate-800 font-semibold text-xs mt-1 text-right">
                  {invoice.authorizedSignatoryName}
                </div>
                <div className="text-slate-500 text-[10px] text-right">
                  {invoice.authorizedSignatoryTitle}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
