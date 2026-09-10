import React, { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Sparkles,
  Send,
  Languages,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Printer,
  Download,
  RotateCcw,
  Building2,
  User,
  Globe2,
  ShieldCheck,
  CreditCard,
  Scale,
  Package,
  Layers,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Edit3,
  Bookmark,
  Check,
  Clock,
  Briefcase,
  Sliders,
  FileCheck,
  Search,
  Eye
} from 'lucide-react';
import { 
  BusinessLetterRequestPayload, 
  BusinessLetterResult 
} from '../../types';
import { requestBusinessLetterGeneration } from '../../services/comtradeService';
import { INCOTERMS_2020_RULES } from '../../data/incotermsData';

interface BusinessLetterGeneratorViewProps {
  language: 'fa' | 'en';
}

interface LetterPreset {
  id: string;
  badgeFa: string;
  badgeEn: string;
  titleFa: string;
  titleEn: string;
  descFa: string;
  payload: Partial<BusinessLetterRequestPayload>;
}

const PRESET_TEMPLATES: LetterPreset[] = [
  {
    id: 'rfq-petrochemical',
    badgeFa: 'استعلام خرید',
    badgeEn: 'RFQ / Inquiry',
    titleFa: 'استعلام رسمی خرید پلیمر و مواد پتروشیمی (FOB)',
    titleEn: 'Formal RFQ for Polymers & Petrochemicals (FOB)',
    descFa: 'استعلام استانداردهای کیفی، تناژ ماهانه و مشخصات فنی با شرایط پرداخت LC دیداری',
    payload: {
      letterType: 'rfq_inquiry',
      targetLanguage: 'en',
      tone: 'formal',
      senderInfo: {
        companyName: 'Pars Horizon Trading Co. Ltd.',
        contactPerson: 'Mr. Alireza Rahimi',
        title: 'Procurement Director',
        email: 'procurement@parshorizon-trade.com',
        phone: '+98 21 8899 0000',
        country: 'Iran',
        address: 'No. 45, Valiasr Ave, Tehran',
        website: 'www.parshorizon-trade.com'
      },
      recipientInfo: {
        companyName: 'Apex Global Petrochemicals Pte.',
        contactPerson: 'Sales & Export Division',
        title: 'Export Sales Manager',
        email: 'inquiries@apexpetrochem-global.com',
        country: 'Singapore',
        address: '80 Robinson Road, Singapore'
      },
      productDetails: {
        productName: 'Linear Low-Density Polyethylene (LLDPE) Film Grade 218W',
        hsCode: '3901.10',
        quantity: '500 Metric Tons (20 x 40ft FCL monthly)',
        packaging: '25kg multi-layer valve bags on palletized shrink-wrapped units',
        specifications: 'MFI: 2.0 g/10min, Density: 0.918 g/cm³, RoHS & FDA compliant'
      },
      commercialTerms: {
        incoterm: 'FOB',
        portOrPlace: 'Jurong Port / Singapore Port',
        paymentTerms: '100% Irrevocable L/C at Sight opened by first-class international bank',
        currency: 'USD',
        targetPrice: 'Competitive market rate',
        deliveryTimeline: 'Within 25 calendar days upon receipt of operative L/C',
        validityDate: '15 calendar days',
        inspectionAgency: 'SGS or Bureau Veritas pre-shipment quality and quantity certificate'
      },
      specialInstructions: 'Please provide Technical Data Sheet (TDS), Material Safety Data Sheet (MSDS), and COA with quotation.'
    }
  },
  {
    id: 'proforma-food-export',
    badgeFa: 'پیشنهاد قیمت',
    badgeEn: 'Offer / PI',
    titleFa: 'کاور لتر پیشنهاد رسمی و پیش‌فاکتور صادرات پسته و خشکبار',
    titleEn: 'Official Commercial Offer Cover Letter: Dried Fruit & Nuts (CIF)',
    descFa: 'ارسال مظنه قیمت رسمی، جدول انطباق استاندارد آفلاتوکسین و شرایط پرداخت ۳۰/۷۰',
    payload: {
      letterType: 'proforma_quotation',
      targetLanguage: 'en',
      tone: 'collaborative',
      senderInfo: {
        companyName: 'Golden Caspian Agro Industries',
        contactPerson: 'Ms. Sarah Mohammadi',
        title: 'International Business Executive',
        email: 'export@goldencaspian-agro.com',
        phone: '+98 34 3222 1100',
        country: 'Iran',
        address: 'Industrial Zone, Kerman, Iran'
      },
      recipientInfo: {
        companyName: 'Nordic Gourmet Imports GmbH',
        contactPerson: 'Mr. Hans Mueller',
        title: 'Head of Commodity Sourcing',
        email: 'hans.mueller@nordic-gourmet.de',
        country: 'Germany',
        address: 'Speicherstadt 12, Hamburg'
      },
      productDetails: {
        productName: 'Premium Iranian Fandoghi & Akbari Pistachios (Raw & Roasted)',
        hsCode: '0802.51',
        quantity: '40 Metric Tons (2 x 40ft Reefer Containers)',
        packaging: '10kg vacuum carton packaging with oxygen absorber',
        specifications: 'Size: 28/30, Moisture < 5%, Aflatoxin B1 < 2 ppb, Total < 4 ppb (EU Standard)'
      },
      commercialTerms: {
        incoterm: 'CIF',
        portOrPlace: 'Hamburg Port, Germany',
        paymentTerms: '30% T/T Advance deposit, 70% T/T against original B/L and Inspection Certificate copies',
        currency: 'EUR',
        targetPrice: 'EUR 11,400 per MT CIF Hamburg',
        deliveryTimeline: 'Prompt shipment within 14 days of deposit confirmation',
        validityDate: '10 calendar days due to market volatility',
        inspectionAgency: 'Eurofins / SGS laboratory pre-shipment certificate'
      },
      specialInstructions: 'Attached is Proforma Invoice No. GC-2026/104 alongside Phytosanitary Certificate and Certificate of Origin.'
    }
  },
  {
    id: 'loi-steel-billets',
    badgeFa: 'قصد خرید LOI',
    badgeEn: 'Letter of Intent',
    titleFa: 'نامه رسمی اعلام قصد خرید (Letter of Intent - LOI) فولاد و مقاطع',
    titleEn: 'Formal Letter of Intent (LOI) to Purchase Steel Billets / Rebars',
    descFa: 'سند رسمی تمایل به خرید با اعتبارات اسنادی بانکی و تاییدیه آمادگی مالی BCL',
    payload: {
      letterType: 'letter_of_intent',
      targetLanguage: 'en',
      tone: 'formal',
      senderInfo: {
        companyName: 'Gulf Infrastructure & Development Corp.',
        contactPerson: 'Eng. Tareq Al-Mansoor',
        title: 'Managing Director',
        email: 'procurement@gulf-infra.ae',
        phone: '+971 4 555 7890',
        country: 'UAE',
        address: 'Business Bay, Dubai, United Arab Emirates'
      },
      recipientInfo: {
        companyName: 'Metals & Mining International Export Group',
        contactPerson: 'Commercial Operations Board',
        title: 'Vice President of Global Sales',
        email: 'sales@metals-minexport.com',
        country: 'Global Suppliers'
      },
      productDetails: {
        productName: 'Continuous Cast Steel Billets (Grade 3SP / 5SP)',
        hsCode: '7207.11',
        quantity: '25,000 Metric Tons (+/- 5% operational tolerance)',
        packaging: 'Loose bulk cargo in standard export bundles',
        specifications: 'Cross section: 150mm x 150mm, Length: 12 meters, Prime quality mill certified'
      },
      commercialTerms: {
        incoterm: 'CFR',
        portOrPlace: 'Jebel Ali Port / Hamriyah Port, UAE',
        paymentTerms: '100% Confirmed Irrevocable Documentary Letter of Credit at Sight',
        currency: 'USD',
        targetPrice: 'USD 515 / MT CFR',
        deliveryTimeline: 'Laycan 30-45 days following operative L/C confirmation',
        validityDate: '7 business days',
        inspectionAgency: 'Independent inspection by SGS / Alex Stewart at loading port'
      },
      specialInstructions: 'Buyer confirms financial readiness through prime GCC bank. We request draft sales contract upon receipt.'
    }
  },
  {
    id: 'counter-offer-negotiation',
    badgeFa: 'چانه‌زنی و مذاکره',
    badgeEn: 'Counter-Offer',
    titleFa: 'مذاکره دیپلماتیک و ضدپیشنهاد تخفیف قیمت و تعدیل شرایط پرداخت',
    titleEn: 'Diplomatic Counter-Offer & Term Negotiation (Payment & Discount)',
    descFa: 'درخواست تخفیف ۵ درصدی بر مبنای خرید مستمر و تبدیل شرایط از پیش‌پرداخت به ۳۰/۷۰',
    payload: {
      letterType: 'price_negotiation',
      targetLanguage: 'en',
      tone: 'diplomatic',
      senderInfo: {
        companyName: 'Arya Sourcing & Supply Hub',
        contactPerson: 'Mohsen Tavakkoli',
        title: 'Chief Purchasing Officer',
        email: 'm.tavakkoli@aryasourcing.com',
        phone: '+98 21 2233 4455',
        country: 'Iran'
      },
      recipientInfo: {
        companyName: 'Guangdong Precision Machinery Co., Ltd.',
        contactPerson: 'Mr. Zhang Wei',
        title: 'Export General Manager',
        email: 'zhang.wei@gd-precisionmach.cn',
        country: 'China',
        address: 'Nanhai District, Foshan, Guangdong'
      },
      productDetails: {
        productName: 'CNC Vertical Machining Centers & Spare Tooling Kits',
        hsCode: '8457.10',
        quantity: '6 Complete Units with 2-year maintenance parts',
        packaging: 'Heavy-duty seaworthy wooden crates with vacuum anti-rust barrier',
        specifications: 'Spindle speed: 12,000 RPM, BT40, Fanuc Control System'
      },
      commercialTerms: {
        incoterm: 'FOB',
        portOrPlace: 'Shenzhen / Guangzhou Port',
        paymentTerms: 'Proposed: 20% Advance, 70% against Shipping Docs, 10% after 30 days commissioning',
        currency: 'USD',
        targetPrice: 'Seeking 6.5% discount based on long-term annual framework partnership',
        deliveryTimeline: 'Within 40 days ex-factory',
        validityDate: '10 calendar days'
      },
      specialInstructions: 'Emphasize mutual long-term growth and our intention to place repeat orders every quarter.'
    }
  },
  {
    id: 'claim-dispute-notice',
    badgeFa: 'ادعای خسارت',
    badgeEn: 'Dispute / Claim',
    titleFa: 'اخطار و ادعای رسمی مغایرت کیفی بار و کسر وزنی به استناد بازرسی',
    titleEn: 'Official Commercial Claim Notice: Quality Discrepancy & Shortage',
    descFa: 'اخطار رسمی بر اساس گواهی بازرسی مستقل و تقاضای صدور Credit Note یا تعویض کالا',
    payload: {
      letterType: 'claim_dispute',
      targetLanguage: 'en',
      tone: 'firm',
      senderInfo: {
        companyName: 'Orient Trade Logistics Co.',
        contactPerson: 'Legal & Claims Department',
        title: 'Head of Quality Assurance & Claims',
        email: 'claims@orient-tradelog.com',
        phone: '+98 21 7766 5544',
        country: 'Iran'
      },
      recipientInfo: {
        companyName: 'Bosphorus Mills & Feedstuffs A.S.',
        contactPerson: 'Export Risk & Quality Board',
        title: 'Managing Director',
        email: 'directors@bosphorusmills-tr.com',
        country: 'Turkey',
        address: 'Levent, Istanbul, Turkey'
      },
      productDetails: {
        productName: 'Non-GMO Animal Feed Corn / Soybean Meal',
        hsCode: '2304.00',
        quantity: 'Consignment B/L No. IST-2026/899 - 3,500 MT',
        packaging: 'Bulk vessel discharge',
        specifications: 'Observed moisture: 16.2% (Contract specified max 13.5%), Shortage: 42 Metric Tons'
      },
      commercialTerms: {
        incoterm: 'CFR',
        portOrPlace: 'Bandar Imam Khomeini (BIK) Port',
        paymentTerms: 'L/C already liquidated',
        currency: 'USD',
        targetPrice: 'Claim amount: USD 38,400 for moisture penalty & documented shortage'
      },
      specialInstructions: 'Attach official Joint Survey Report certified by SGS and Port Customs Surveyor. Request written settlement within 7 days.'
    }
  },
  {
    id: 'exclusive-distributorship',
    badgeFa: 'نمایندگی انحصاری',
    badgeEn: 'Agency Proposal',
    titleFa: 'پیشنهاد اخذ نمایندگی انحصاری توزیع محصولات در حوزه خاورمیانه',
    titleEn: 'Commercial Proposal for Exclusive Regional Distributorship',
    descFa: 'پیشنهاد رسمی شبکه توزیع، تضمین حداقل فروش سالانه و خدمات پس از فروش',
    payload: {
      letterType: 'agency_proposal',
      targetLanguage: 'en',
      tone: 'collaborative',
      senderInfo: {
        companyName: 'Atlas Medical & Diagnostics Distribution',
        contactPerson: 'Dr. Kianoush Rostami',
        title: 'Director of Strategic Alliances',
        email: 'alliances@atlasmedical-dist.com',
        phone: '+98 21 8877 6655',
        country: 'Iran',
        address: 'Jordan Ave, Tehran'
      },
      recipientInfo: {
        companyName: 'BioHealth Diagnostic Instruments SAS',
        contactPerson: 'International Expansion Board',
        title: 'VP Global Distribution',
        email: 'global-distrib@biohealth-france.fr',
        country: 'France',
        address: 'Parc Technologique de Lyon, France'
      },
      productDetails: {
        productName: 'Automated Clinical Chemistry Analyzers & Reagent Line',
        hsCode: '9027.89',
        quantity: 'Initial launch: 25 main units + recurring monthly reagent supply',
        specifications: 'CE IVD certified, ISO 13485'
      },
      commercialTerms: {
        incoterm: 'CIP',
        portOrPlace: 'Tehran IKA Airport',
        paymentTerms: 'Sight L/C or CAD with corporate bank guarantee',
        currency: 'EUR',
        deliveryTimeline: 'Phased quarterly schedule'
      },
      specialInstructions: 'Highlight our 120-hospital network, nationwide cold-chain logistics, and dedicated biomedical engineering support team.'
    }
  }
];

export const BusinessLetterGeneratorView: React.FC<BusinessLetterGeneratorViewProps> = ({
  language
}) => {
  const isFa = language === 'fa';
  const printRef = useRef<HTMLDivElement>(null);

  // Form State
  const [letterType, setLetterType] = useState<string>('rfq_inquiry');
  const [targetLanguage, setTargetLanguage] = useState<'en' | 'fa' | 'ar' | 'zh' | 'ru' | 'de' | 'fr' | 'es' | 'tr'>('en');
  const [tone, setTone] = useState<'formal' | 'diplomatic' | 'firm' | 'collaborative' | 'urgent'>('formal');
  
  // Default trade AI model
  const selectedModel = 'gemini-2.5-flash-lite';

  // Sender Info
  const [senderCompany, setSenderCompany] = useState<string>('Pars Horizon Trading Co. Ltd.');
  const [senderContact, setSenderContact] = useState<string>('Mr. Alireza Rahimi');
  const [senderTitle, setSenderTitle] = useState<string>('Procurement Director');
  const [senderEmail, setSenderEmail] = useState<string>('procurement@parshorizon-trade.com');
  const [senderPhone, setSenderPhone] = useState<string>('+98 21 8899 0000');
  const [senderCountry, setSenderCountry] = useState<string>('Iran');
  const [senderAddress, setSenderAddress] = useState<string>('No. 45, Valiasr Ave, Tehran');
  const [senderWebsite, setSenderWebsite] = useState<string>('www.parshorizon-trade.com');

  // Recipient Info
  const [recipientCompany, setRecipientCompany] = useState<string>('Apex Global Petrochemicals Pte.');
  const [recipientContact, setRecipientContact] = useState<string>('Sales & Export Division');
  const [recipientTitle, setRecipientTitle] = useState<string>('Export Sales Manager');
  const [recipientEmail, setRecipientEmail] = useState<string>('inquiries@apexpetrochem-global.com');
  const [recipientCountry, setRecipientCountry] = useState<string>('Singapore');
  const [recipientAddress, setRecipientAddress] = useState<string>('80 Robinson Road, Singapore');

  // Product Details
  const [productName, setProductName] = useState<string>('Linear Low-Density Polyethylene (LLDPE) Film Grade 218W');
  const [hsCode, setHsCode] = useState<string>('3901.10');
  const [quantity, setQuantity] = useState<string>('500 Metric Tons (20 x 40ft FCL monthly)');
  const [packaging, setPackaging] = useState<string>('25kg multi-layer valve bags on palletized shrink-wrapped units');
  const [specifications, setSpecifications] = useState<string>('MFI: 2.0 g/10min, Density: 0.918 g/cm³, RoHS & FDA compliant');

  // Commercial Terms
  const [incoterm, setIncoterm] = useState<string>('FOB');
  const [portOrPlace, setPortOrPlace] = useState<string>('Jurong Port / Singapore Port');
  const [paymentTerms, setPaymentTerms] = useState<string>('100% Irrevocable L/C at Sight (UCP 600)');
  const [currency, setCurrency] = useState<string>('USD');
  const [targetPrice, setTargetPrice] = useState<string>('Competitive market rate');
  const [deliveryTimeline, setDeliveryTimeline] = useState<string>('Within 25 calendar days upon receipt of operative L/C');
  const [validityDate, setValidityDate] = useState<string>('15 calendar days');
  const [inspectionAgency, setInspectionAgency] = useState<string>('SGS or Bureau Veritas pre-shipment quality certificate');
  const [specialInstructions, setSpecialInstructions] = useState<string>('Please provide Technical Data Sheet (TDS), Material Safety Data Sheet (MSDS), and COA with quotation.');

  // UI state
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewSubTab, setPreviewSubTab] = useState<'letter' | 'translation' | 'compliance' | 'notes'>('letter');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [letterResult, setLetterResult] = useState<BusinessLetterResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditingInPreview, setIsEditingInPreview] = useState<boolean>(false);
  const [editedBody, setEditedBody] = useState<string>('');

  // Apply Preset
  const handleApplyPreset = (preset: LetterPreset) => {
    const p = preset.payload;
    if (p.letterType) setLetterType(p.letterType);
    if (p.targetLanguage) setTargetLanguage(p.targetLanguage);
    if (p.tone) setTone(p.tone);

    if (p.senderInfo) {
      setSenderCompany(p.senderInfo.companyName || '');
      setSenderContact(p.senderInfo.contactPerson || '');
      setSenderTitle(p.senderInfo.title || '');
      setSenderEmail(p.senderInfo.email || '');
      setSenderPhone(p.senderInfo.phone || '');
      setSenderCountry(p.senderInfo.country || '');
      setSenderAddress(p.senderInfo.address || '');
      setSenderWebsite(p.senderInfo.website || '');
    }

    if (p.recipientInfo) {
      setRecipientCompany(p.recipientInfo.companyName || '');
      setRecipientContact(p.recipientInfo.contactPerson || '');
      setRecipientTitle(p.recipientInfo.title || '');
      setRecipientEmail(p.recipientInfo.email || '');
      setRecipientCountry(p.recipientInfo.country || '');
      setRecipientAddress(p.recipientInfo.address || '');
    }

    if (p.productDetails) {
      setProductName(p.productDetails.productName || '');
      setHsCode(p.productDetails.hsCode || '');
      setQuantity(p.productDetails.quantity || '');
      setPackaging(p.productDetails.packaging || '');
      setSpecifications(p.productDetails.specifications || '');
    }

    if (p.commercialTerms) {
      setIncoterm(p.commercialTerms.incoterm || 'FOB');
      setPortOrPlace(p.commercialTerms.portOrPlace || '');
      setPaymentTerms(p.commercialTerms.paymentTerms || '');
      setCurrency(p.commercialTerms.currency || 'USD');
      setTargetPrice(p.commercialTerms.targetPrice || '');
      setDeliveryTimeline(p.commercialTerms.deliveryTimeline || '');
      setValidityDate(p.commercialTerms.validityDate || '');
      setInspectionAgency(p.commercialTerms.inspectionAgency || '');
    }

    if (p.specialInstructions !== undefined) {
      setSpecialInstructions(p.specialInstructions);
    }
  };

  // Generate Letter Handler
  const handleGenerateLetter = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    const payload: BusinessLetterRequestPayload = {
      letterType,
      targetLanguage,
      senderInfo: {
        companyName: senderCompany,
        contactPerson: senderContact,
        title: senderTitle,
        email: senderEmail,
        phone: senderPhone,
        country: senderCountry,
        address: senderAddress,
        website: senderWebsite
      },
      recipientInfo: {
        companyName: recipientCompany,
        contactPerson: recipientContact,
        title: recipientTitle,
        email: recipientEmail,
        country: recipientCountry,
        address: recipientAddress
      },
      productDetails: {
        productName,
        hsCode,
        quantity,
        packaging,
        specifications
      },
      commercialTerms: {
        incoterm,
        portOrPlace,
        paymentTerms,
        currency,
        targetPrice,
        deliveryTimeline,
        validityDate,
        inspectionAgency
      },
      tone,
      specialInstructions,
      includePersianTranslation: true,
      model: selectedModel
    };

    try {
      const response = await requestBusinessLetterGeneration(payload);
      if (response.success && response.data) {
        setLetterResult(response.data);
        setEditedBody(response.data.letterBody);
        setActiveTab('preview');
        setPreviewSubTab('letter');
      } else {
        setGenerationError(response.error || (isFa ? 'خطا در تولید نامه تجاری' : 'Failed to generate letter'));
      }
    } catch (err: any) {
      setGenerationError(err.message || (isFa ? 'خطای اتصال به هوش مصنوعی' : 'Connection error'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy letter to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Print Letter
  const handlePrint = () => {
    window.print();
  };

  // Download as text file
  const handleDownloadTxt = () => {
    if (!letterResult) return;
    const content = `SUBJECT: ${letterResult.subject}\nREF: ${letterResult.metadata?.refNumber || ''}\nDATE: ${letterResult.metadata?.date || ''}\n\n========================================\n\n${editedBody || letterResult.letterBody}\n\n========================================\nPERSIAN TRANSLATION / ترجمه فارسی:\n\n${letterResult.persianTranslation}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Trade_Letter_${letterResult.metadata?.refNumber || 'ICC'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedIncotermObj = useMemo(() => {
    return INCOTERMS_2020_RULES.find(i => i.code === incoterm);
  }, [incoterm]);

  return (
    <div className="space-y-6" id="business-letter-generator-root">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>{isFa ? 'موتور هوشمند نگارش مکاتبات تجاری بین‌الملل' : 'AI International Trade Correspondence'}</span>
              <span className="bg-indigo-500/40 px-2 py-0.5 rounded-full text-[10px] text-white">ICC 2020 Compliant</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-indigo-400" />
              <span>{isFa ? 'نگارش نامه‌های تجاری بین‌المللی با استاندارد جهانی' : 'Global Business Letter Generator'}</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              {isFa
                ? 'تنظیم حرفه‌ای انواع اسناد مکاتبات بازرگانی خارجی (استعلام خرید، پیشنهاد قیمت، LOI، چانه‌زنی، اخطار خسارت و نمایندگی) به ۹ زبان رسمی دنیا با رعایت دقیق اینکوترمز ۲۰۲۰، قواعد بانکی UCP 600، بازرسی و ترجمه فارسی هم‌زمان.'
                : 'Draft immaculate commercial letters (RFQ, Proforma Offers, LOI, Counter-Offers, Claims & Distributorship) in 9 major global trade languages strictly compliant with ICC 2020 rules, UCP 600, and dual Persian review.'}
            </p>
          </div>

          {/* Tab Switcher & Status */}
          <div className="flex items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 shadow-inner">
            <button
              id="tab-btn-editor"
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'editor'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>{isFa ? '۱. تنظیم ورودی‌ها و فرم' : '1. Letter Setup'}</span>
            </button>
            <button
              id="tab-btn-preview"
              onClick={() => {
                if (letterResult) setActiveTab('preview');
              }}
              disabled={!letterResult}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : letterResult
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  : 'text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{isFa ? '۲. سربرگ و خروجی رسمی' : '2. Official Letterhead'}</span>
              {letterResult && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Presets Carousel / Grid */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <Bookmark className="w-4 h-4 text-indigo-600" />
            <span>{isFa ? 'قالب‌های آماده استاندارد اتاق بازرگانی بین‌الملل (ICC)' : 'ICC Standard Trade Presets'}</span>
          </div>
          <span className="text-xs text-slate-500">{isFa ? 'کلیک جهت بارگذاری فوری سناریو' : 'Click to load scenario'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_TEMPLATES.map((preset) => (
            <button
              key={preset.id}
              id={`preset-${preset.id}`}
              onClick={() => handleApplyPreset(preset)}
              className="text-start p-3.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {isFa ? preset.badgeFa : preset.badgeEn}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-900">
                {isFa ? preset.titleFa : preset.titleEn}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {preset.descFa}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT: EDITOR TAB */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          {/* Section 1: Letter Type & Language & Tone */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Languages className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                {isFa ? 'گام ۱: تعیین نوع سند، زبان مقصد و لحن نگارش' : 'Step 1: Document Type, Target Language & Tone'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Document Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {isFa ? 'نوع سند / هدف مکاتبه:' : 'Document / Letter Type:'}
                </label>
                <select
                  id="select-letter-type"
                  value={letterType}
                  onChange={(e) => setLetterType(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 font-medium"
                >
                  <option value="rfq_inquiry">استعلام خرید و درخواست قیمت رسمی (RFQ / Buying Inquiry)</option>
                  <option value="proforma_quotation">پیشنهاد رسمی و کاور لتر پیش‌فاکتور (Commercial Offer / PI)</option>
                  <option value="letter_of_intent">نامه رسمی اعلام قصد خرید (Letter of Intent - LOI)</option>
                  <option value="price_negotiation">مذاکره دیپلماتیک تخفیف و شرایط پرداخت (Counter-Offer)</option>
                  <option value="purchase_order">ارسال سفارش خرید رسمی (Purchase Order - PO Transmittal)</option>
                  <option value="shipping_inspection">اطلاعیه حمل، بارگیری و بازرسی کالا (Shipping & Inspection Advice)</option>
                  <option value="claim_dispute">اخطار و ادعای رسمی مغایرت بار / خسارت (Commercial Claim Notice)</option>
                  <option value="agency_proposal">پیشنهاد اخذ / اعطای نمایندگی انحصاری (Agency & Distributorship)</option>
                  <option value="custom">مکاتبه بازرگانی اختصاصی و سفارشی (Custom Trade Letter)</option>
                </select>
              </div>

              {/* Target Language */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {isFa ? 'زبان مقصد نامه:' : 'Target Language:'}
                </label>
                <select
                  id="select-target-language"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value as any)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 font-medium"
                >
                  <option value="en">🇬🇧 English (استاندارد بین‌المللی بازرگانی)</option>
                  <option value="fa">🇮🇷 فارسی (رسمی و اداری بازرگانی)</option>
                  <option value="ar">🇦🇪 العربية التجارية (امارات، خلیج‌فارس و کشورهای عربی)</option>
                  <option value="zh">🇨🇳 中文商务 (چین - استانداردهای تجاری سازمانی)</option>
                  <option value="ru">🇷🇺 Деловой русский (روسیه و کشورهای اوراسیا EAEU)</option>
                  <option value="de">🇩🇪 Deutsch (آلمان، سوئیس و اتریش - استاندارد DIN 5008)</option>
                  <option value="fr">🇫🇷 Français (فرانسه، بلژیک و حوزه آفریقا)</option>
                  <option value="es">🇪🇸 Español (اسپانیا و آمریکای لاتین)</option>
                  <option value="tr">🇹🇷 Türkçe (ترکیه - مکاتبات رسمی بازرگانی)</option>
                </select>
              </div>

              {/* Tone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {isFa ? 'لحن نگارش (Tone of Voice):' : 'Tone of Voice:'}
                </label>
                <select
                  id="select-tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 font-medium"
                >
                  <option value="formal">رسمی و اداری (Formal & Corporate Standard)</option>
                  <option value="diplomatic">دیپلماتیک و محتاطانه (Diplomatic & Tactful)</option>
                  <option value="firm">قاطع و مبتنی بر موازین حقوقی (Firm & Contractual)</option>
                  <option value="collaborative">همکارانه و توسعه روابط بلندمدت (Collaborative & Partner-Oriented)</option>
                  <option value="urgent">فوری و الزام‌آور (Urgent & Time-Sensitive)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Sender & Recipient Information */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                {isFa ? 'گام ۲: مشخصات طرفین مکاتبه (فرستنده و گیرنده)' : 'Step 2: Parties Information (Sender & Recipient)'}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sender Box */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isFa ? 'اطلاعات فرستنده (شرکت شما)' : 'Sender Information (Your Company)'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">نام شرکت:</label>
                    <input
                      type="text"
                      value={senderCompany}
                      onChange={(e) => setSenderCompany(e.target.value)}
                      placeholder="e.g. Pars Horizon Trading Co."
                      className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">نام مسئول / امضاکننده:</label>
                    <input
                      type="text"
                      value={senderContact}
                      onChange={(e) => setSenderContact(e.target.value)}
                      placeholder="e.g. Mr. Alireza Rahimi"
                      className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">سمت سازمانی:</label>
                    <input
                      type="text"
                      value={senderTitle}
                      onChange={(e) => setSenderTitle(e.target.value)}
                      placeholder="e.g. Procurement Director"
                      className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">کشور مبدأ:</label>
                    <input
                      type="text"
                      value={senderCountry}
                      onChange={(e) => setSenderCountry(e.target.value)}
                      placeholder="e.g. Iran"
                      className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">ایمیل رسمی:</label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="procurement@company.com"
                      className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">تلفن / فکس:</label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="+98 21 8899 0000"
                      className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Recipient Box */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Globe2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isFa ? 'اطلاعات گیرنده (شرکت طرف مقابل)' : 'Recipient / Counterpart Information'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">نام شرکت مخاطب:</label>
                    <input
                      type="text"
                      value={recipientCompany}
                      onChange={(e) => setRecipientCompany(e.target.value)}
                      placeholder="e.g. Apex Global Petrochemicals Pte."
                      className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">نام مخاطب یا واحد مربوطه (Attn):</label>
                    <input
                      type="text"
                      value={recipientContact}
                      onChange={(e) => setRecipientContact(e.target.value)}
                      placeholder="e.g. Sales Division / Mr. John Smith"
                      className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">سمت مخاطب:</label>
                    <input
                      type="text"
                      value={recipientTitle}
                      onChange={(e) => setRecipientTitle(e.target.value)}
                      placeholder="e.g. Export Sales Director"
                      className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">کشور مقصد:</label>
                    <input
                      type="text"
                      value={recipientCountry}
                      onChange={(e) => setRecipientCountry(e.target.value)}
                      placeholder="e.g. Singapore, China, Germany"
                      className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">آدرس پستی یا ایمیل مخاطب:</label>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="Address or inquiries@company.com"
                      className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Commodity, HS Code & Specifications */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Package className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                {isFa ? 'گام ۳: مشخصات کالا و استاندارد فنی' : 'Step 3: Commodity, HS Code & Technical Specifications'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {isFa ? 'نام دقیق تجاری و علمی کالا (Commercial Product Name):' : 'Product Name:'}
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Linear Low-Density Polyethylene Film Grade 218W"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {isFa ? 'کد تعرفه گمرکی (HS Code):' : 'HS Code:'}
                </label>
                <input
                  type="text"
                  value={hsCode}
                  onChange={(e) => setHsCode(e.target.value)}
                  placeholder="e.g. 3901.10 or 0802.51"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {isFa ? 'مقدار / حجم / تناژ:' : 'Quantity / Volume:'}
                </label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 500 Metric Tons / 20 FCL"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {isFa ? 'نوع بسته‌بندی صادراتی:' : 'Export Packaging:'}
                </label>
                <input
                  type="text"
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value)}
                  placeholder="e.g. 25kg bags palletized, Jumbo Bags, Bulk"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {isFa ? 'مشخصات فنی و گرید (Technical Specs):' : 'Specifications / Grade:'}
                </label>
                <input
                  type="text"
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  placeholder="e.g. MFI 2.0, Moisture < 5%, Purity 99.8%"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Commercial & Incoterms 2020 Terms */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Scale className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                {isFa ? 'گام ۴: شرایط تجاری، اینکوترمز ۲۰۲۰ و شیوه پرداخت بین‌المللی' : 'Step 4: Commercial Terms, Incoterms 2020 & International Payments'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Incoterm */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {isFa ? 'قاعده اینکوترمز ۲۰۲۰:' : 'Incoterms 2020 Rule:'}
                </label>
                <select
                  id="select-incoterm"
                  value={incoterm}
                  onChange={(e) => setIncoterm(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900"
                >
                  <option value="FOB">FOB - Free on Board (تحویل روی عرشه کشتی)</option>
                  <option value="CIF">CIF - Cost, Insurance & Freight (هزینه، بیمه و کرایه تا مقصد)</option>
                  <option value="CFR">CFR - Cost & Freight (هزینه و کرایه تا بندر مقصد)</option>
                  <option value="EXW">EXW - Ex Works (تحویل در محل کارخانه)</option>
                  <option value="FCA">FCA - Free Carrier (تحویل به حمل‌کننده در مبدأ)</option>
                  <option value="CPT">CPT - Carriage Paid To (کرایه حمل پرداخت‌شده تا مقصد)</option>
                  <option value="CIP">CIP - Carriage & Insurance Paid (کرایه و بیمه پرداخت‌شده)</option>
                  <option value="DAP">DAP - Delivered at Place (تحویل در محل مقصد بدون ترخیص)</option>
                  <option value="DDP">DDP - Delivered Duty Paid (تحویل با پرداخت کلیه حقوق گمرکی)</option>
                </select>
                {selectedIncotermObj && (
                  <p className="text-[10px] text-slate-500 bg-slate-100 p-1.5 rounded leading-tight">
                    {selectedIncotermObj.summaryFa}
                  </p>
                )}
              </div>

              {/* Named Port or Place */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {isFa ? 'نام دقیق بندر یا محل تحویل (Named Port/Place):' : 'Named Port or Place:'}
                </label>
                <input
                  type="text"
                  value={portOrPlace}
                  onChange={(e) => setPortOrPlace(e.target.value)}
                  placeholder="e.g. Shanghai Port, Bandar Abbas Port"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <span className="text-[10px] text-slate-500 block">طبق استاندارد ICC درج نام بندر پس از ترم الزامی است.</span>
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {isFa ? 'روش پرداخت بانکی:' : 'Payment Method:'}
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g. 100% L/C at Sight (UCP 600) or 30% T/T Advance + 70% against B/L"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Currency */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {isFa ? 'ارز مبادله‌ای:' : 'Currency:'}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 font-bold"
                >
                  <option value="USD">USD ($) - دلار آمریکا</option>
                  <option value="EUR">EUR (€) - یورو اروپا</option>
                  <option value="CNY">CNY (¥) - یوان چین</option>
                  <option value="AED">AED (درهم) - درهم امارات</option>
                  <option value="RUB">RUB (₽) - روبل روسیه</option>
                </select>
              </div>

              {/* Target Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {isFa ? 'قیمت پیشنهادی یا هدف:' : 'Target Price / Unit Rate:'}
                </label>
                <input
                  type="text"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="e.g. USD 1,120 / MT or Best competitive offer"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Delivery Timeline */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {isFa ? 'زمان‌بندی تحویل / حمل (Lead Time):' : 'Delivery Timeline:'}
                </label>
                <input
                  type="text"
                  value={deliveryTimeline}
                  onChange={(e) => setDeliveryTimeline(e.target.value)}
                  placeholder="e.g. Within 25 days of operative L/C"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Offer Validity */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {isFa ? 'مهلت اعتبار پیشنهاد / پاسخ (Validity):' : 'Validity Date:'}
                </label>
                <input
                  type="text"
                  value={validityDate}
                  onChange={(e) => setValidityDate(e.target.value)}
                  placeholder="e.g. 15 calendar days"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Inspection Agency */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {isFa ? 'شرکت بازرسی فنی (Inspection):' : 'Inspection Agency:'}
                </label>
                <input
                  type="text"
                  value={inspectionAgency}
                  onChange={(e) => setInspectionAgency(e.target.value)}
                  placeholder="e.g. SGS / Bureau Veritas / Intertek"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Special Instructions & AI Engine Settings */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Edit3 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                {isFa ? 'گام ۵: نکات و بندهای ویژه مدنظر شما + تنظیمات مدل هوش مصنوعی' : 'Step 5: Special Clauses & AI Engine'}
              </h2>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                {isFa ? 'شروط ویژه یا الزامات خاص مدنظر بازرگان (مثلاً درخواست ارسال نمونه، گواهی آنالیز، جریمه دیرکرد):' : 'Special Instructions / Custom Clauses:'}
              </label>
              <textarea
                rows={3}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Seller must provide original Certificate of Origin and Phytosanitary certificate. Please provide sample analysis before bulk loading..."
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Error Message if any */}
          {generationError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-1">{isFa ? 'خطا در نگارش نامه تجاری:' : 'Drafting Error:'}</strong>
                <span>{generationError}</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              id="btn-generate-letter"
              onClick={handleGenerateLetter}
              disabled={isGenerating || !productName.trim()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isFa ? 'در حال نگارش سند رسمی تجاری (لطفاً شکیبا باشید)...' : 'Drafting Official Trade Letter...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{isFa ? 'ایجاد نامه تجاری رسمی با هوش مصنوعی' : 'Generate ICC Official Trade Letter'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT: PREVIEW & LETTERHEAD TAB */}
      {activeTab === 'preview' && letterResult && (
        <div className="space-y-6">
          {/* Subtabs Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                id="subtab-letter"
                onClick={() => setPreviewSubTab('letter')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  previewSubTab === 'letter'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{isFa ? 'متن رسمی سربرگ (Target Language)' : 'Official Letter'}</span>
              </button>

              <button
                id="subtab-translation"
                onClick={() => setPreviewSubTab('translation')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  previewSubTab === 'translation'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Languages className="w-4 h-4" />
                <span>{isFa ? 'ترجمه و راهنمای فارسی' : 'Persian Translation'}</span>
              </button>

              <button
                id="subtab-compliance"
                onClick={() => setPreviewSubTab('compliance')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  previewSubTab === 'compliance'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isFa ? 'انطباق ICC و اصطلاحات بازرگانی' : 'ICC Compliance'}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {letterResult.iccChecklist?.length || 4}
                </span>
              </button>

              <button
                id="subtab-notes"
                onClick={() => setPreviewSubTab('notes')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  previewSubTab === 'notes'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isFa ? 'یادداشت‌های راهبردی مذاکره' : 'Negotiation Strategy'}</span>
              </button>
            </div>

            {/* Action Buttons: Copy, Print, Download, Edit */}
            <div className="flex items-center gap-2">
              <button
                id="btn-edit-toggle"
                onClick={() => setIsEditingInPreview(!isEditingInPreview)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                title={isFa ? 'ویرایش دستی متن' : 'Edit text directly'}
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                <span>{isEditingInPreview ? (isFa ? 'اتمام ویرایش' : 'Done') : (isFa ? 'ویرایش متن' : 'Edit')}</span>
              </button>

              <button
                id="btn-copy-letter"
                onClick={() => handleCopy(editedBody || letterResult.letterBody)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">{isFa ? 'کپی شد!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>{isFa ? 'کپی متن' : 'Copy'}</span>
                  </>
                )}
              </button>

              <button
                id="btn-print-letter"
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition-colors"
                title={isFa ? 'چاپ سربرگ رسمی' : 'Print official letter'}
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>{isFa ? 'چاپ / PDF' : 'Print / PDF'}</span>
              </button>

              <button
                id="btn-download-txt"
                onClick={handleDownloadTxt}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isFa ? 'دانلود TXT' : 'Download'}</span>
              </button>

              <button
                id="btn-back-editor"
                onClick={() => setActiveTab('editor')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isFa ? 'تغییر ورودی‌ها' : 'Modify Inputs'}</span>
              </button>
            </div>
          </div>

          {/* 1. Official Letterhead Container */}
          {previewSubTab === 'letter' && (
            <div
              ref={printRef}
              className="bg-white rounded-2xl border border-slate-300/80 shadow-lg p-8 sm:p-12 max-w-4xl mx-auto space-y-8 print:border-none print:shadow-none print:p-0 print:m-0"
              style={{ minHeight: '800px' }}
            >
              {/* Letterhead Top Header */}
              <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-wide text-slate-900 uppercase">
                    {senderCompany || 'PARS HORIZON TRADING CO. LTD.'}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    {senderAddress || 'International Trade & Export Operations'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-2 font-mono">
                    {senderEmail && <span>Email: {senderEmail}</span>}
                    {senderPhone && <span>Tel: {senderPhone}</span>}
                    {senderWebsite && <span>Web: {senderWebsite}</span>}
                  </div>
                </div>

                {/* Reference & Date Stamp */}
                <div className="sm:text-right bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div>
                    <span className="text-slate-500">Ref No: </span>
                    <strong className="font-mono text-slate-900">{letterResult.metadata?.refNumber || 'REF-2026/0909'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Date: </span>
                    <span className="font-mono text-slate-900">{letterResult.metadata?.date || new Date().toISOString().split('T')[0]}</span>
                  </div>
                  <div className="pt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                      ICC Commercial Standard
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject Line */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">SUBJECT (موضوع نامه):</div>
                <div className="text-base sm:text-lg font-bold text-slate-900">
                  {letterResult.subject}
                </div>
              </div>

              {/* Main Letter Body */}
              <div className="space-y-4">
                {isEditingInPreview ? (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 block">ویرایش متن نامه در همین صفحه:</label>
                    <textarea
                      rows={22}
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      className="w-full text-sm font-sans p-4 border-2 border-indigo-500 rounded-xl focus:outline-none leading-relaxed"
                    />
                  </div>
                ) : (
                  <div
                    className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans select-text"
                    style={{ direction: targetLanguage === 'fa' || targetLanguage === 'ar' ? 'rtl' : 'ltr' }}
                  >
                    {editedBody || letterResult.letterBody}
                  </div>
                )}
              </div>

              {/* Official Signatory Footer */}
              <div className="border-t border-slate-200 pt-6 mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600">
                <div>
                  <p className="font-bold text-slate-900">{senderContact || 'Authorized Signatory'}</p>
                  <p className="text-slate-600">{senderTitle || 'Director of International Trade'}</p>
                  <p className="text-slate-500">{senderCompany}</p>
                </div>
                <div className="text-slate-400 text-[11px] sm:text-right">
                  <p>Certified under ICC International Commercial Correspondence Protocols</p>
                  <p className="font-mono text-[10px] mt-0.5">ICC Standards Compliant | {letterResult.metadata?.wordCount || 300} Words</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. Persian Translation Subtab */}
          {previewSubTab === 'translation' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Languages className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  ترجمه و انطباق سطر به سطر فارسی برای بازرگان ایرانی
                </h3>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>💡 راهنمای حقوقی بازرگان:</strong> این ترجمه به شما کمک می‌کند تمام تعهدات، اینکوترمز ۲۰۲۰ و قیود مندرج در نامه خارجی را با دقت ارزیابی نموده و از بروز هرگونه ابهام تجاری یا مسئولیت ناخواسته قبل از ارسال رسمی جلوگیری کنید.
              </div>

              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                {letterResult.persianTranslation || 'ترجمه فارسی در دسترس نیست.'}
              </div>
            </div>
          )}

          {/* 3. ICC Compliance Checklist Subtab */}
          {previewSubTab === 'compliance' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  چک‌لیست تطبیق با استانداردهای اتاق بازرگانی بین‌الملل (ICC) و قوانین گمرک
                </h3>
              </div>

              <div className="space-y-3">
                {letterResult.iccChecklist?.map((check, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border bg-slate-50 border-slate-200 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{check.item}</h4>
                      <p className="text-xs text-slate-600">{check.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Incoterms 2020 Matrix reminder */}
              {selectedIncotermObj && (
                <div className="p-5 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-indigo-950 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    <span>تعهدات بازرگان طبق ترم {selectedIncotermObj.code} ({selectedIncotermObj.nameFa})</span>
                  </h4>
                  <p className="text-xs text-indigo-900 leading-relaxed">
                    {selectedIncotermObj.proTipFa}
                  </p>
                  <div className="text-[11px] text-slate-700">
                    <strong>محل انتقال ریسک: </strong>
                    <span>{selectedIncotermObj.riskTransferFa}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Negotiation & Commercial Notes Subtab */}
          {previewSubTab === 'notes' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  راهبردها و توصیه‌های تاکتیکی هوش مصنوعی برای مذاکره
                </h3>
              </div>

              <div className="space-y-3">
                {letterResult.commercialNotes?.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-950 text-xs sm:text-sm leading-relaxed flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
