import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Ship, 
  Truck, 
  Plane, 
  ShieldCheck, 
  Scale, 
  DollarSign, 
  Percent, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Layers, 
  TrendingUp, 
  Copy, 
  Check, 
  Printer, 
  Zap, 
  Box, 
  Anchor, 
  Clock, 
  AlertTriangle,
  ChevronDown,
  Info
} from 'lucide-react';
import { 
  INCOTERMS_2020_RULES, 
  REAL_WORLD_CORRIDORS, 
  INSURANCE_CLAUSES, 
  CONTAINER_SPECS,
  IncotermDefinition,
  TradeCorridor
} from '../../data/incotermsData';
import { ALL_HS_CHAPTERS } from '../../data/hsChapters';

interface Props {
  language: 'fa' | 'en';
}

export const LandedCostIncotermsView: React.FC<Props> = ({ language }) => {
  const isFa = language === 'fa';

  // Active Tab
  const [activeTab, setActiveTab] = useState<'calculator' | 'incoterms_matrix' | 'demurrage_radar' | 'proforma_sheet'>('calculator');

  // Calculator Form State
  const [selectedIncoterm, setSelectedIncoterm] = useState<IncotermDefinition['code']>('FOB');
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('sha-bnd');
  const [cargoType, setCargoType] = useState<'20ft' | '40ft_hq' | 'lcl' | 'trailer' | 'air'>('40ft_hq');
  const [selectedHsCode, setSelectedHsCode] = useState<string>('84'); // Machinery & Electronics
  const [selectedInsuranceClause, setSelectedInsuranceClause] = useState<'A' | 'B' | 'C'>('A');

  // Quantities & Base Costs
  const [itemUnits, setItemUnits] = useState<number>(1000);
  const [unitBasePriceUsd, setUnitBasePriceUsd] = useState<number>(25.0);
  const [currencyRateToUsd, setCurrencyRateToUsd] = useState<number>(1.0); // 1.0 for USD, e.g. 0.272 for AED
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'AED' | 'CNY'>('USD');
  const [cargoGrossWeightKg, setCargoGrossWeightKg] = useState<number>(12500);
  const [cargoVolumeCbm, setCargoVolumeCbm] = useState<number>(45);

  // Operational & Shipping Adjustments
  const [fxBankFeePct, setFxBankFeePct] = useState<number>(1.5); // Bank transfer / exchange fee
  const [inspectionPsiFeeUsd, setInspectionPsiFeeUsd] = useState<number>(350); // SGS inspection
  const [exportClearanceUsd, setExportClearanceUsd] = useState<number>(180);
  const [originThcUsd, setOriginThcUsd] = useState<number>(160);
  const [customFreightUsd, setCustomFreightUsd] = useState<number | null>(null);
  const [destThcUsd, setDestThcUsd] = useState<number>(240);
  const [customsTariffDutyPct, setCustomsTariffDutyPct] = useState<number>(10.0); // Custom duty %
  const [importVatPct, setImportVatPct] = useState<number>(10.0); // VAT %
  const [customsClearanceBrokerUsd, setCustomsClearanceBrokerUsd] = useState<number>(450); // Clearance broker fee
  const [destInlandTruckingUsd, setDestInlandTruckingUsd] = useState<number>(650); // Port to warehouse
  const [targetProfitMarginPct, setTargetProfitMarginPct] = useState<number>(25.0); // Target profit margin %

  // Demurrage Simulator State
  const [containerCount, setContainerCount] = useState<number>(2);
  const [freeDaysAllowed, setFreeDaysAllowed] = useState<number>(14);
  const [actualPortDays, setActualPortDays] = useState<number>(22);
  const [dailyTier1Rate, setDailyTier1Rate] = useState<number>(50); // days 1-5 after free
  const [dailyTier2Rate, setDailyTier2Rate] = useState<number>(90); // days 6+ after free

  // Copy Feedback
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Selected corridor helper
  const currentCorridor = useMemo(() => {
    return REAL_WORLD_CORRIDORS.find(c => c.id === selectedCorridorId) || REAL_WORLD_CORRIDORS[0];
  }, [selectedCorridorId]);

  // Selected Incoterm helper
  const currentIncoterm = useMemo(() => {
    return INCOTERMS_2020_RULES.find(r => r.code === selectedIncoterm) || INCOTERMS_2020_RULES[3];
  }, [selectedIncoterm]);

  // Freight rate determination based on corridor and cargo mode
  const calculatedFreightCost = useMemo(() => {
    if (customFreightUsd !== null && customFreightUsd >= 0) return customFreightUsd;
    if (cargoType === '20ft') return currentCorridor.rateFcl20ft;
    if (cargoType === '40ft_hq') return currentCorridor.rateFcl40ftHq;
    if (cargoType === 'lcl') return Math.max(currentCorridor.rateLclPerCbm * cargoVolumeCbm, 250);
    if (cargoType === 'trailer') return currentCorridor.rateTruckTrailer || 3200;
    if (cargoType === 'air') return currentCorridor.rateAirPerKg * cargoGrossWeightKg;
    return 2000;
  }, [cargoType, currentCorridor, cargoVolumeCbm, cargoGrossWeightKg, customFreightUsd]);

  // Demurrage calculation
  const demurrageCalculation = useMemo(() => {
    const delayDays = Math.max(0, actualPortDays - freeDaysAllowed);
    let totalDemurrage = 0;
    if (delayDays > 0) {
      const tier1Days = Math.min(delayDays, 7);
      const tier2Days = Math.max(0, delayDays - 7);
      totalDemurrage = (tier1Days * dailyTier1Rate + tier2Days * dailyTier2Rate) * containerCount;
    }
    return {
      delayDays,
      totalDemurrage,
      perContainer: containerCount > 0 ? totalDemurrage / containerCount : 0
    };
  }, [actualPortDays, freeDaysAllowed, dailyTier1Rate, dailyTier2Rate, containerCount]);

  // Comprehensive Landed Cost Computation Engine
  const costBreakdown = useMemo(() => {
    // 1. Base Commercial Invoice (FOB or EXW value based on contract)
    const baseGoodsTotalUsd = itemUnits * unitBasePriceUsd;
    const fxBankCost = baseGoodsTotalUsd * (fxBankFeePct / 100);

    // 2. Pre-Carriage & Origin Costs (Depends on selected Incoterm)
    // If EXW: Buyer pays loading, inland origin, export clearance, THC
    // If FCA: Buyer pays THC origin onwards
    // If FOB: Seller has included THC origin, buyer pays international freight onwards
    const isExw = selectedIncoterm === 'EXW';
    const isFca = selectedIncoterm === 'FCA';
    const isFas = selectedIncoterm === 'FAS';
    
    let buyerOriginExpenses = 0;
    if (isExw) {
      buyerOriginExpenses += 200; // loading at origin
      buyerOriginExpenses += 350; // inland origin
      buyerOriginExpenses += exportClearanceUsd;
      buyerOriginExpenses += originThcUsd;
    } else if (isFca || isFas) {
      buyerOriginExpenses += originThcUsd;
    }
    buyerOriginExpenses += inspectionPsiFeeUsd;

    // 3. International Freight Cost
    // In EXW, FCA, FAS, FOB: Buyer pays ocean/air freight
    // In CFR, CIF, CPT, CIP, DAP, DPU, DDP: Seller already included freight in commercial price
    const buyerPaysFreight = ['EXW', 'FCA', 'FAS', 'FOB'].includes(selectedIncoterm);
    const effectiveFreightPaidByBuyer = buyerPaysFreight ? calculatedFreightCost : 0;

    // 4. Marine / Air Cargo Insurance (Calculated on 110% of CIF value as per ICC rules)
    const cifEquivalentBasis = baseGoodsTotalUsd + calculatedFreightCost;
    const insuranceClauseRate = INSURANCE_CLAUSES.find(c => c.clause === selectedInsuranceClause)?.ratePct || 0.45;
    const totalInsurancePremium = (cifEquivalentBasis * 1.10) * (insuranceClauseRate / 100);
    
    // In CIF, CIP, DAP, DPU, DDP: Seller already included insurance.
    const buyerPaysInsurance = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CPT'].includes(selectedIncoterm);
    const effectiveInsurancePaidByBuyer = buyerPaysInsurance ? totalInsurancePremium : 0;

    // 5. Destination Port & Arrival Costs
    // In DDP: Seller covers destination THC, customs and duties.
    // In other terms: Buyer covers THC dest, clearance, customs duty & VAT.
    const buyerPaysDestArrival = selectedIncoterm !== 'DDP';
    const effectiveDestThc = buyerPaysDestArrival ? destThcUsd : 0;
    const effectiveBrokerage = buyerPaysDestArrival ? customsClearanceBrokerUsd : 0;
    const effectiveDemurrage = buyerPaysDestArrival ? demurrageCalculation.totalDemurrage : 0;

    // 6. Customs Valuation Base (CIF Value = Base + Freight + Insurance)
    const customsValuationUsd = cifEquivalentBasis + totalInsurancePremium;
    const tariffDutyUsd = buyerPaysDestArrival ? (customsValuationUsd * (customsTariffDutyPct / 100)) : 0;
    const dutyPlusCifBase = customsValuationUsd + tariffDutyUsd;
    const importVatUsd = buyerPaysDestArrival ? (dutyPlusCifBase * (importVatPct / 100)) : 0;

    // 7. Destination Inland Delivery (Port to Warehouse)
    // Paid by seller in DAP, DPU, DDP. Paid by buyer in EXW through CIP.
    const buyerPaysInlandDest = !['DAP', 'DPU', 'DDP'].includes(selectedIncoterm);
    const effectiveInlandDelivery = buyerPaysInlandDest ? destInlandTruckingUsd : 0;

    // Total Landed Cost (Full Investment landed inside buyer warehouse)
    const grandTotalLandedCostUsd = 
      baseGoodsTotalUsd + 
      fxBankCost + 
      buyerOriginExpenses + 
      effectiveFreightPaidByBuyer + 
      effectiveInsurancePaidByBuyer + 
      effectiveDestThc + 
      effectiveBrokerage + 
      effectiveDemurrage + 
      tariffDutyUsd + 
      importVatUsd + 
      effectiveInlandDelivery;

    const landedCostPerUnit = itemUnits > 0 ? grandTotalLandedCostUsd / itemUnits : 0;
    const additionalCostOverBasePct = baseGoodsTotalUsd > 0 
      ? ((grandTotalLandedCostUsd - baseGoodsTotalUsd) / baseGoodsTotalUsd) * 100 
      : 0;

    // Profit Margin Calculations
    const targetMarkupMultiplier = 1 + (targetProfitMarginPct / 100);
    const targetUnitSellingPrice = landedCostPerUnit * targetMarkupMultiplier;
    const targetTotalRevenueUsd = targetUnitSellingPrice * itemUnits;
    const totalExpectedProfitUsd = targetTotalRevenueUsd - grandTotalLandedCostUsd;

    return {
      baseGoodsTotalUsd,
      fxBankCost,
      buyerOriginExpenses,
      effectiveFreightPaidByBuyer,
      effectiveInsurancePaidByBuyer,
      effectiveDestThc,
      effectiveBrokerage,
      effectiveDemurrage,
      tariffDutyUsd,
      importVatUsd,
      effectiveInlandDelivery,
      grandTotalLandedCostUsd,
      landedCostPerUnit,
      additionalCostOverBasePct,
      targetUnitSellingPrice,
      totalExpectedProfitUsd,
      customsValuationUsd,
      insuranceClauseRate
    };
  }, [
    itemUnits,
    unitBasePriceUsd,
    fxBankFeePct,
    selectedIncoterm,
    exportClearanceUsd,
    originThcUsd,
    inspectionPsiFeeUsd,
    calculatedFreightCost,
    selectedInsuranceClause,
    destThcUsd,
    customsClearanceBrokerUsd,
    demurrageCalculation.totalDemurrage,
    customsTariffDutyPct,
    importVatPct,
    destInlandTruckingUsd,
    targetProfitMarginPct
  ]);

  // Presets Loader
  const handleLoadPreset = (type: 'china_electronics' | 'dubai_petrochem' | 'germany_machinery' | 'iran_pistachio_export') => {
    if (type === 'china_electronics') {
      setSelectedIncoterm('FOB');
      setSelectedCorridorId('sha-bnd');
      setCargoType('40ft_hq');
      setSelectedHsCode('85');
      setItemUnits(2000);
      setUnitBasePriceUsd(42.5);
      setCustomsTariffDutyPct(12);
      setImportVatPct(10);
      setContainerCount(1);
      setActualPortDays(12);
      setFreeDaysAllowed(14);
      setCustomFreightUsd(null);
    } else if (type === 'dubai_petrochem') {
      setSelectedIncoterm('CFR');
      setSelectedCorridorId('dxb-bnd');
      setCargoType('20ft');
      setSelectedHsCode('39');
      setItemUnits(22000); // 22 Tons
      setUnitBasePriceUsd(1.20);
      setCustomsTariffDutyPct(5);
      setImportVatPct(10);
      setContainerCount(2);
      setActualPortDays(10);
      setFreeDaysAllowed(10);
      setCustomFreightUsd(null);
    } else if (type === 'germany_machinery') {
      setSelectedIncoterm('EXW');
      setSelectedCorridorId('ham-bnd');
      setCargoType('40ft_hq');
      setSelectedHsCode('84');
      setItemUnits(4);
      setUnitBasePriceUsd(45000);
      setCustomsTariffDutyPct(4);
      setImportVatPct(10);
      setContainerCount(1);
      setActualPortDays(18);
      setFreeDaysAllowed(14);
      setCustomFreightUsd(null);
    } else if (type === 'iran_pistachio_export') {
      setSelectedIncoterm('FCA');
      setSelectedCorridorId('ist-thr');
      setCargoType('trailer');
      setSelectedHsCode('08');
      setItemUnits(20000); // 20 tons
      setUnitBasePriceUsd(8.5);
      setCustomsTariffDutyPct(0);
      setImportVatPct(0);
      setContainerCount(1);
      setActualPortDays(4);
      setFreeDaysAllowed(5);
      setCustomFreightUsd(3200);
    }
  };

  // Copy Proforma Breakdown
  const handleCopyProforma = () => {
    const text = `
==============================================
📋 گزارش رسمی بهای تمام‌شده و شبیه‌ساز اینکوترمز ۲۰۲۰
GLOBAL LANDED COST & INCOTERMS 2020 BREAKDOWN
==============================================
📌 مشخصات محموله و ترم معامله:
• قاعده اینکوترمز: ${selectedIncoterm} (${currentIncoterm.nameFa})
• کریدور تجاری: ${currentCorridor.nameFa}
• تعداد/حجم: ${itemUnits.toLocaleString()} عدد/واحد
• قیمت فاکتور مبدأ: $${unitBasePriceUsd.toFixed(2)} ($${costBreakdown.baseGoodsTotalUsd.toLocaleString()} کل)
• شیوه حمل: ${cargoType} | مدت ترانزیت: ~${currentCorridor.transitDays} روز

💰 جزئیات هزینه‌های مسیر تا انبار مقصد (Landed Cost):
1. ارزش اولیه فاکتور کالا: $${costBreakdown.baseGoodsTotalUsd.toLocaleString()}
2. کارمزد حواله و صرافی (${fxBankFeePct}%): $${costBreakdown.fxBankCost.toLocaleString()}
3. بازرسی و تشریفات مبدأ: $${costBreakdown.buyerOriginExpenses.toLocaleString()}
4. کرایه حمل بین‌المللی: $${costBreakdown.effectiveFreightPaidByBuyer.toLocaleString()}
5. بیمه دریایی کلوپ لندن (کلوز ${selectedInsuranceClause}): $${costBreakdown.effectiveInsurancePaidByBuyer.toFixed(2)}
6. هزینه‌های بندری و THC مقصد: $${costBreakdown.effectiveDestThc.toLocaleString()}
7. ترخیص گمرکی و حق‌العمل‌کاری: $${costBreakdown.effectiveBrokerage.toLocaleString()}
8. حقوق و سود بازرگانی گمرک (${customsTariffDutyPct}%): $${costBreakdown.tariffDutyUsd.toLocaleString()}
9. مالیات بر ارزش افزوده واردات (${importVatPct}%): $${costBreakdown.importVatUsd.toLocaleString()}
10. جریمه معطلی کانتینر (دموراژ): $${costBreakdown.effectiveDemurrage.toLocaleString()}
11. حمل داخلی تا انبار نهایی: $${costBreakdown.effectiveInlandDelivery.toLocaleString()}

----------------------------------------------
🏁 خلاصه نهایی اقتصادی:
• بهای تمام‌شده کل محموله در انبار: $${Math.round(costBreakdown.grandTotalLandedCostUsd).toLocaleString()}
• بهای تمام‌شده هر واحد کالا: $${costBreakdown.landedCostPerUnit.toFixed(2)}
• افزایش قیمت نسبت به فاکتور مبدأ: +${costBreakdown.additionalCostOverBasePct.toFixed(1)}%
• حداقل قیمت فروش پیشنهادی با سود (${targetProfitMarginPct}%): $${costBreakdown.targetUnitSellingPrice.toFixed(2)}
• سود پیش‌بینی‌شده کل محموله: $${Math.round(costBreakdown.totalExpectedProfitUsd).toLocaleString()}
==============================================
تولید شده توسط موتور محاسباتی DIGINORON Trade Intelligence
`.trim();

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="space-y-6" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {isFa ? 'آماده برای ۱۰,۰۰۰ درخواست همزمان (Zero-Latency)' : '10,000 Concurrent Engine'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                ICC Incoterms® 2020
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-200 border border-blue-500/30">
                Landed Cost & Profit Margin
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Scale className="w-6 h-6 text-indigo-400" />
              <span>
                {isFa ? 'موتور جامع Landed Cost و شبیه‌ساز هوشمند Incoterms 2020' : 'Global Landed Cost & Incoterms 2020 Engine'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {isFa
                ? 'محاسبه فوری و دقیق قیمت تمام‌شده کالا در انبار مقصد با لحاظ حقوق گمرکی ۹۹ فصل HS، تفکیک مو به موی مسئولیت ۱۱ ترم اینکوترمز ۲۰۲۰، بیمه دریایی کلوپ لندن، کریدورهای حمل بین‌المللی، جریمه معطلی کانتینر (دموراژ) و حاشیه سود واقعی بدون تاخیر یا محدودیت سهمیه.'
                : 'Zero-latency landed cost calculation, 11 Incoterms 2020 rule allocation, London cargo insurance clauses, container demurrage radar, and real-time net margin analyzer.'}
            </p>
          </div>

          {/* Quick Action Presets */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <button
              onClick={() => handleLoadPreset('china_electronics')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>🇨🇳 ⚡ {isFa ? 'الکترونیک چین (FOB)' : 'China Electronics (FOB)'}</span>
            </button>
            <button
              onClick={() => handleLoadPreset('dubai_petrochem')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🇦🇪 🛢️ {isFa ? 'پتروشیمی دبی (CFR)' : 'Dubai Petrochem (CFR)'}</span>
            </button>
            <button
              onClick={() => handleLoadPreset('germany_machinery')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🇩🇪 ⚙️ {isFa ? 'ماشین‌آلات آلمان (EXW)' : 'Germany Machinery (EXW)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'calculator'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{isFa ? 'ماشین‌حساب قیمت تمام‌شده در انبار (Landed Cost)' : 'Landed Cost Calculator'}</span>
        </button>

        <button
          onClick={() => setActiveTab('incoterms_matrix')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'incoterms_matrix'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isFa ? 'ماتریس تعهدات و ریسک ۱۱ ترم اینکوترمز ۲۰۲۰' : 'Incoterms 2020 Rules Matrix'}</span>
        </button>

        <button
          onClick={() => setActiveTab('demurrage_radar')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'demurrage_radar'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Anchor className="w-4 h-4" />
          <span>{isFa ? 'رادار جریمه دموراژ و معطلی کانتینر' : 'Demurrage & Detention Radar'}</span>
        </button>

        <button
          onClick={() => setActiveTab('proforma_sheet')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'proforma_sheet'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isFa ? 'فاکتور تفکیکی رسمی و پرینت پروفرما' : 'Proforma & Profit Summary'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LANDED COST ENGINE */}
      {/* ========================================================================= */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Form Inputs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Base Purchase & Incoterms Rule */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">1</span>
                  <span>{isFa ? 'قاعده اینکوترمز ۲۰۲۰ و فاکتور اولیه خرید' : 'Incoterms Rule & Commercial Base'}</span>
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  {currentIncoterm.categoryFa}
                </span>
              </div>

              {/* Incoterms Selector Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{isFa ? 'ترم قرارداد اینکوترمز (Incoterm):' : 'Incoterms Term:'}</span>
                  <span className="text-[11px] text-indigo-600 font-semibold">{currentIncoterm.nameFa}</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                  {INCOTERMS_2020_RULES.map((rule) => {
                    const isSelected = selectedIncoterm === rule.code;
                    return (
                      <button
                        key={rule.code}
                        type="button"
                        onClick={() => setSelectedIncoterm(rule.code)}
                        className={`py-2 px-2 rounded-xl text-center font-black text-xs transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700'
                        }`}
                      >
                        <div>{rule.code}</div>
                        <div className="text-[9px] font-normal truncate opacity-80">{rule.nameEn.split(' ')[0]}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity & Base Unit Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isFa ? 'تعداد / مقدار کالا:' : 'Total Quantity / Units:'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={itemUnits}
                    onChange={(e) => setItemUnits(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isFa ? 'قیمت فاکتور مبدأ (USD):' : 'Unit Base Price (USD):'}
                  </label>
                  <div className="relative">
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">$</span>
                    <input
                      type="number"
                      min={0.01}
                      step={0.1}
                      value={unitBasePriceUsd}
                      onChange={(e) => setUnitBasePriceUsd(Math.max(0, Number(e.target.value)))}
                      className="w-full pr-7 pl-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isFa ? 'کارمزد صرافی و حواله (%):' : 'Banking & FX Spread (%):'}
                  </label>
                  <div className="relative">
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">%</span>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={fxBankFeePct}
                      onChange={(e) => setFxBankFeePct(Math.max(0, Number(e.target.value)))}
                      className="w-full pr-7 pl-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Route, Corridor & Freight */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
                  <span>{isFa ? 'کریدور تجاری، نوع کانتینر و کرایه حمل' : 'Trade Corridor & Freight Carriage'}</span>
                </h2>
                <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentCorridor.transitDays} {isFa ? 'روز ترانزیت' : 'days transit'}</span>
                </span>
              </div>

              {/* Corridor Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isFa ? 'کریدور حمل‌ونقل بین‌المللی آماده:' : 'Pre-configured Trade Corridor:'}
                </label>
                <select
                  value={selectedCorridorId}
                  onChange={(e) => setSelectedCorridorId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                >
                  {REAL_WORLD_CORRIDORS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.originFlag} {c.originPort} ➔ {c.destFlag} {c.destPort} ({c.transitDays} {isFa ? 'روز' : 'days'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Container & Transport Mode */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {[
                  { id: '20ft', label: '20ft FCL', icon: Box, sub: '$' + currentCorridor.rateFcl20ft },
                  { id: '40ft_hq', label: '40ft HQ', icon: Box, sub: '$' + currentCorridor.rateFcl40ftHq },
                  { id: 'lcl', label: 'LCL (CBM)', icon: Layers, sub: '$' + currentCorridor.rateLclPerCbm + '/m³' },
                  { id: 'trailer', label: isFa ? 'تریلر جاده‌ای' : 'Truck Trailer', icon: Truck, sub: '$' + (currentCorridor.rateTruckTrailer || 3200) },
                  { id: 'air', label: isFa ? 'هوایی' : 'Air Cargo', icon: Plane, sub: '$' + currentCorridor.rateAirPerKg + '/kg' }
                ].map((item) => {
                  const isSelected = cargoType === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCargoType(item.id as any)}
                      className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xs font-black">{item.label}</div>
                      <div className="text-[10px] opacity-80 font-mono">{item.sub}</div>
                    </button>
                  );
                })}
              </div>

              {/* Freight Price Override & Cargo details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isFa ? 'کرایه حمل بین‌المللی (USD):' : 'Freight Cost (USD):'}
                  </label>
                  <input
                    type="number"
                    value={calculatedFreightCost}
                    onChange={(e) => setCustomFreightUsd(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {['EXW', 'FCA', 'FAS', 'FOB'].includes(selectedIncoterm) 
                      ? (isFa ? 'پرداخت توسط خریدار' : 'Paid by Buyer') 
                      : (isFa ? 'لحاظ‌شده در فاکتور فروشنده' : 'Included by Seller')}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isFa ? 'وزن ناخالص بار (کیلوگرم):' : 'Gross Weight (Kg):'}
                  </label>
                  <input
                    type="number"
                    value={cargoGrossWeightKg}
                    onChange={(e) => setCargoGrossWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isFa ? 'حجم محموله (مترمکعب CBM):' : 'Total Volume (CBM):'}
                  </label>
                  <input
                    type="number"
                    value={cargoVolumeCbm}
                    onChange={(e) => setCargoVolumeCbm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Marine Insurance, Customs Tariff & Port Charges */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">3</span>
                  <span>{isFa ? 'بیمه دریایی لندن، حقوق گمرکی و عوارض ترخیص' : 'Marine Insurance, Customs Duty & VAT'}</span>
                </h2>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ICC 110% CIF</span>
                </span>
              </div>

              {/* Insurance Clause Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {isFa ? 'شرایط بیمه‌نامه باربری دریایی (Institute Cargo Clauses):' : 'Marine Cargo Insurance Clause:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {INSURANCE_CLAUSES.map((ins) => {
                    const isSelected = selectedInsuranceClause === ins.clause;
                    return (
                      <button
                        key={ins.clause}
                        type="button"
                        onClick={() => setSelectedInsuranceClause(ins.clause)}
                        className={`p-2.5 rounded-xl text-right border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-black">
                          <span>{isFa ? `کلوز ${ins.clause}` : `Clause ${ins.clause}`}</span>
                          <span className="font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                            {ins.ratePct}%
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                          {ins.titleFa}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* HS Chapter Auto-Estimation & Duty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isFa ? 'فصل تعرفه HS کالا (جهت ارزیابی گمرکی):' : 'HS Tariff Chapter:'}
                  </label>
                  <select
                    value={selectedHsCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setSelectedHsCode(code);
                      // Realistic duty defaults based on chapter
                      const num = Number(code);
                      if (num <= 14) setCustomsTariffDutyPct(4);
                      else if (num <= 24) setCustomsTariffDutyPct(15);
                      else if (num <= 39) setCustomsTariffDutyPct(5);
                      else if (num <= 63) setCustomsTariffDutyPct(26);
                      else if (num <= 70) setCustomsTariffDutyPct(15);
                      else if (num <= 83) setCustomsTariffDutyPct(10);
                      else if (num <= 85) setCustomsTariffDutyPct(12);
                      else if (num <= 90) setCustomsTariffDutyPct(8);
                      else setCustomsTariffDutyPct(20);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  >
                    {ALL_HS_CHAPTERS.map((ch) => (
                      <option key={ch.code} value={ch.code}>
                        HS {ch.code}: {isFa ? ch.nameFa : ch.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isFa ? 'حقوق گمرکی (%):' : 'Customs Duty (%):'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={customsTariffDutyPct}
                      onChange={(e) => setCustomsTariffDutyPct(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {isFa ? 'مالیات ارزش افزوده VAT (%):' : 'Import VAT (%):'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      step={0.5}
                      value={importVatPct}
                      onChange={(e) => setImportVatPct(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Port & Final Inland Trucking */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isFa ? 'هزینه THC بندر مقصد ($):' : 'Dest THC ($):'}
                  </label>
                  <input
                    type="number"
                    value={destThcUsd}
                    onChange={(e) => setDestThcUsd(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isFa ? 'حق‌العمل ترخیص گمرک ($):' : 'Broker Fee ($):'}
                  </label>
                  <input
                    type="number"
                    value={customsClearanceBrokerUsd}
                    onChange={(e) => setCustomsClearanceBrokerUsd(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isFa ? 'حمل داخلی به انبار ($):' : 'Inland Trucking ($):'}
                  </label>
                  <input
                    type="number"
                    value={destInlandTruckingUsd}
                    onChange={(e) => setDestInlandTruckingUsd(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Profit Margin Target */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">4</span>
                  <span>{isFa ? 'درصد سود هدف تاجر (Target Profit Margin)' : 'Trader Target Profit Margin'}</span>
                </h2>
                <span className="text-base font-black text-amber-600 font-mono">
                  +{targetProfitMarginPct}%
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={80}
                step={1}
                value={targetProfitMarginPct}
                onChange={(e) => setTargetProfitMarginPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                <span>{isFa ? 'حداقل سود (۵٪)' : 'Minimum (5%)'}</span>
                <span>{isFa ? 'حاشیه استاندارد بازرگانی (۲۵٪)' : 'Standard (25%)'}</span>
                <span>{isFa ? 'کالای پرریسک / لوکس (۸۰٪)' : 'High Risk/Luxury (80%)'}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Dynamic Results & Profit Cards (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Main Result Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-800/60 space-y-5 sticky top-4">
              
              <div className="flex items-center justify-between border-b border-indigo-800/40 pb-4">
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-300">
                    {isFa ? 'قیمت تمام‌شده در انبار خریدار' : 'Total Landed Cost'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-0.5 font-mono">
                    ${Math.round(costBreakdown.grandTotalLandedCostUsd).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    +{(costBreakdown.additionalCostOverBasePct).toFixed(1)}% {isFa ? 'سربار تا مقصد' : 'over FOB'}
                  </span>
                  <div className="text-xs text-slate-300 mt-1 font-mono">
                    {isFa ? 'برای ' : 'For '}{itemUnits.toLocaleString()} {isFa ? 'واحد کالا' : 'units'}
                  </div>
                </div>
              </div>

              {/* Per Unit Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] text-slate-300 font-semibold block">
                    {isFa ? 'قیمت تمام‌شده هر واحد:' : 'Landed Cost / Unit:'}
                  </span>
                  <div className="text-xl font-black text-emerald-300 font-mono">
                    ${costBreakdown.landedCostPerUnit.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isFa ? `فاکتور مبدأ: $${unitBasePriceUsd.toFixed(2)}` : `Base invoice: $${unitBasePriceUsd.toFixed(2)}`}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] text-amber-300 font-semibold block">
                    {isFa ? `قیمت فروش پیشنهادی (+${targetProfitMarginPct}%):` : `Target Sale Price:`}
                  </span>
                  <div className="text-xl font-black text-amber-300 font-mono">
                    ${costBreakdown.targetUnitSellingPrice.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isFa ? `حداقل سود: +$${(costBreakdown.targetUnitSellingPrice - costBreakdown.landedCostPerUnit).toFixed(2)}` : 'Target profit/unit'}
                  </div>
                </div>
              </div>

              {/* Net Profit Summary */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-300 block">
                    {isFa ? 'سود خالص پیش‌بینی‌شده کل محموله:' : 'Total Expected Net Profit:'}
                  </span>
                  <span className="text-lg font-black text-white font-mono">
                    +${Math.round(costBreakdown.totalExpectedProfitUsd).toLocaleString()}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              {/* Detailed Cost Allocation Breakdown Bar */}
              <div className="space-y-2 pt-2 border-t border-indigo-800/40">
                <div className="text-xs font-bold text-slate-300">
                  {isFa ? 'ترکیب و سهم اجزای بهای تمام‌شده:' : 'Cost Component Shares:'}
                </div>
                
                {/* Visual stacked bar */}
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                  <div 
                    style={{ width: `${(costBreakdown.baseGoodsTotalUsd / costBreakdown.grandTotalLandedCostUsd) * 100}%` }}
                    className="bg-indigo-500 h-full" 
                    title={isFa ? 'ارزش اولیه کالا' : 'Base Goods'} 
                  />
                  <div 
                    style={{ width: `${((costBreakdown.effectiveFreightPaidByBuyer + costBreakdown.buyerOriginExpenses) / costBreakdown.grandTotalLandedCostUsd) * 100}%` }}
                    className="bg-blue-500 h-full" 
                    title={isFa ? 'حمل و لجستیک' : 'Logistics & Freight'} 
                  />
                  <div 
                    style={{ width: `${((costBreakdown.tariffDutyUsd + costBreakdown.importVatUsd) / costBreakdown.grandTotalLandedCostUsd) * 100}%` }}
                    className="bg-emerald-500 h-full" 
                    title={isFa ? 'گمرک و مالیات' : 'Customs & VAT'} 
                  />
                  <div 
                    style={{ width: `${((costBreakdown.fxBankCost + costBreakdown.effectiveInsurancePaidByBuyer + costBreakdown.effectiveDestThc + costBreakdown.effectiveBrokerage + costBreakdown.effectiveDemurrage + costBreakdown.effectiveInlandDelivery) / costBreakdown.grandTotalLandedCostUsd) * 100}%` }}
                    className="bg-amber-500 h-full" 
                    title={isFa ? 'بیمه، صرافی و سایر' : 'Insurance & Other'} 
                  />
                </div>

                {/* Legend list */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                      <span>{isFa ? 'فاکتور اولیه خرید کالا:' : 'Commercial Invoice:'}</span>
                    </span>
                    <span className="font-mono font-bold">${costBreakdown.baseGoodsTotalUsd.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                      <span>{isFa ? 'کرایه حمل و تشریفات مبدأ:' : 'Freight & Origin:'}</span>
                    </span>
                    <span className="font-mono font-bold">
                      ${(costBreakdown.effectiveFreightPaidByBuyer + costBreakdown.buyerOriginExpenses).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      <span>{isFa ? 'حقوق ورودی و مالیات ارزش افزوده:' : 'Customs Tariff & VAT:'}</span>
                    </span>
                    <span className="font-mono font-bold">
                      ${Math.round(costBreakdown.tariffDutyUsd + costBreakdown.importVatUsd).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      <span>{isFa ? 'بیمه، کارمزد صرافی، THC و ترخیص:' : 'Insurance, THC & Clearance:'}</span>
                    </span>
                    <span className="font-mono font-bold">
                      ${Math.round(costBreakdown.fxBankCost + costBreakdown.effectiveInsurancePaidByBuyer + costBreakdown.effectiveDestThc + costBreakdown.effectiveBrokerage + costBreakdown.effectiveDemurrage + costBreakdown.effectiveInlandDelivery).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-2">
                <button
                  onClick={handleCopyProforma}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedSummary ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSummary ? (isFa ? 'کپی شد!' : 'Copied!') : (isFa ? 'کپی فاکتور بهای تمام‌شده' : 'Copy Breakdown')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('proforma_sheet')}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  title={isFa ? 'مشاهده و چاپ پروفرما' : 'View Proforma'}
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              {/* Incoterms Pro-Tip Notice */}
              <div className="bg-indigo-950/80 border border-indigo-700/50 rounded-xl p-3 text-[11px] text-indigo-200 leading-relaxed">
                💡 <strong>{isFa ? 'توصیه اتاق بازرگانی بین‌المللی (ICC):' : 'ICC Pro-Tip:'}</strong> {currentIncoterm.proTipFa}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INCOTERMS 2020 INTERACTIVE MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'incoterms_matrix' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900">
                {isFa ? 'ماتریس کامل مسئولیت‌ها و انتقال ریسک در ۱۱ قاعده اینکوترمز ۲۰۲۰' : 'Incoterms 2020 Risk & Cost Allocation Matrix'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isFa
                  ? 'بر اساس استاندارد رسمی اتاق بازرگانی بین‌المللی (ICC Publication No. 723). خانه سبز به معنی تعهد فروشنده (Seller) و خانه آبی به معنی تعهد خریدار (Buyer) است.'
                  : 'Official ICC 2020 rules: Green indicates seller obligation; blue indicates buyer obligation.'}
              </p>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px]">
                    <th className="p-2.5 font-bold">{isFa ? 'قاعده' : 'Term'}</th>
                    <th className="p-2.5 font-bold">{isFa ? 'شیوه حمل' : 'Mode'}</th>
                    <th className="p-2.5 font-bold">{isFa ? 'بسته‌بندی' : 'Packing'}</th>
                    <th className="p-2.5 font-bold">{isFa ? 'بارگیری مبدا' : 'Loading Origin'}</th>
                    <th className="p-2.5 font-bold">{isFa ? 'حمل داخلی مبدا' : 'Inland Origin'}</th>
                    <th className="p-2.5 font-bold">{isFa ? 'ترخیص صادرات' : 'Export Custom'}</th>
                    <th className="p-2.5 font-bold">{isFa ? 'کرایه بین‌المللی' : 'Freight'}</th>
                    <th className="p-2.5 font-bold">{isFa ? 'بیمه حمل' : 'Insurance'}</th>
                    <th className="p-2.5 font-bold">{isFa ? 'ترخیص واردات و گمرک' : 'Import Duty'}</th>
                    <th className="p-2.5 font-bold">{isFa ? 'حمل تا انبار خریدار' : 'Dest Inland'}</th>
                    <th className="p-2.5 font-bold">{isFa ? 'تخلیه مقصد' : 'Unloading'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {INCOTERMS_2020_RULES.map((rule) => {
                    const isSelected = selectedIncoterm === rule.code;
                    return (
                      <tr 
                        key={rule.code} 
                        onClick={() => setSelectedIncoterm(rule.code)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-indigo-50 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-2.5 text-indigo-700 font-black flex items-center gap-1.5">
                          <span>{rule.code}</span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                        </td>
                        <td className="p-2.5 text-slate-600 text-[10px] whitespace-nowrap">
                          {rule.category === 'Sea & Inland Waterway' ? (isFa ? 'دریایی' : 'Sea Only') : (isFa ? 'چندوجهی' : 'Multimodal')}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">{isFa ? 'فروشنده' : 'Seller'}</span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${rule.costs.loadingOrigin ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.loadingOrigin ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${rule.costs.inlandOrigin ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.inlandOrigin ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${rule.costs.exportCustoms ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.exportCustoms ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${rule.costs.internationalFreight ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.internationalFreight ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${rule.costs.marineInsurance ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.marineInsurance ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${rule.costs.importCustomsDuty ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.importCustomsDuty ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${rule.costs.inlandDestination ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.inlandDestination ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${rule.costs.unloadingDestination ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {rule.costs.unloadingDestination ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Selected Rule Deep Dive */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-indigo-700 bg-indigo-100 px-3 py-1 rounded-xl">
                    {currentIncoterm.code}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{currentIncoterm.nameFa}</h3>
                    <p className="text-xs text-slate-500 font-mono">{currentIncoterm.nameEn}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
                  {currentIncoterm.categoryFa}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                  <h4 className="font-black text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isFa ? 'تعهدات اصلی فروشنده (Seller):' : 'Seller Obligations:'}</span>
                  </h4>
                  <ul className="space-y-1 text-emerald-950 font-medium">
                    {currentIncoterm.sellerObligationsFa.map((ob, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{ob}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-2">
                  <h4 className="font-black text-blue-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>{isFa ? 'تعهدات اصلی خریدار (Buyer):' : 'Buyer Obligations:'}</span>
                  </h4>
                  <ul className="space-y-1 text-blue-950 font-medium">
                    {currentIncoterm.buyerObligationsFa.map((ob, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{ob}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800">
                  🎯 <strong>{isFa ? 'نقطه انتقال ریسک به خریدار:' : 'Point of Risk Transfer:'}</strong> {currentIncoterm.riskTransferFa}
                </div>
                <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  💡 <strong>{isFa ? 'نکته طلایی بازرگان:' : 'Trader Tip:'}</strong> {currentIncoterm.proTipFa}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CONTAINER DEMURRAGE & DETENTION RADAR */}
      {/* ========================================================================= */}
      {activeTab === 'demurrage_radar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Anchor className="w-5 h-5 text-indigo-600" />
                <span>{isFa ? 'شبیه‌ساز و دیده‌بان جریمه معطلی کانتینر (Demurrage & Detention)' : 'Demurrage & Detention Cost Radar'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isFa
                  ? 'یکی از پنهان‌ترین هزینه‌هایی که سود تاجران را از بین می‌برد، جریمه دیرکرد عودت کانتینر خالی به خطوط کشتیرانی (مانند کشتیرانی جمهوری اسلامی IRISL، مرسک Maersk، یا MSC) است.'
                  : 'Calculate shipping line container detention fees when port clearance exceeds free-day limits.'}
              </p>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isFa ? 'تعداد کانتینر محموله:' : 'Container Count (TEU/FEU):'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={containerCount}
                  onChange={(e) => setContainerCount(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isFa ? 'روزهای آزاد مجاز (Free Days):' : 'Free Days Granted:'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={freeDaysAllowed}
                  onChange={(e) => setFreeDaysAllowed(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">{isFa ? 'عرف بنادر: ۱۰ الی ۱۴ روز' : 'Standard: 10-14 days'}</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isFa ? 'کل روزهای معطلی تا ترخیص و عودت:' : 'Actual Days in Port/Yard:'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={actualPortDays}
                  onChange={(e) => setActualPortDays(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">{isFa ? 'مدت زمان واقعی تخلیه' : 'Days until empty return'}</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isFa ? 'نرخ جریمه روزانه (USD/کانتینر):' : 'Tier 1 Rate ($/day):'}
                </label>
                <input
                  type="number"
                  min={10}
                  value={dailyTier1Rate}
                  onChange={(e) => setDailyTier1Rate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">{isFa ? 'روزهای اول تا هفتم مازاد' : 'Days 1-7 excess'}</span>
              </div>
            </div>

            {/* Demurrage Calculation Result Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border ${
                demurrageCalculation.delayDays > 0 ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}>
                <span className="text-xs font-bold block">{isFa ? 'وضعیت فرجه مجاز' : 'Free Days Status'}</span>
                <div className="text-2xl font-black font-mono mt-1">
                  {demurrageCalculation.delayDays > 0 
                    ? `+${demurrageCalculation.delayDays} ${isFa ? 'روز اضافه (خطر)' : 'days excess'}`
                    : (isFa ? 'در محدوده مجاز (بدون جریمه)' : 'Within Free Time')}
                </div>
                <div className="text-xs opacity-80 mt-1">
                  {isFa ? `${actualPortDays} روز از ${freeDaysAllowed} روز مجاز سپری شده` : `${actualPortDays} of ${freeDaysAllowed} days used`}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                <span className="text-xs font-bold text-slate-600 block">{isFa ? 'جریمه هر کانتینر' : 'Demurrage / Container'}</span>
                <div className="text-2xl font-black text-rose-600 font-mono mt-1">
                  ${demurrageCalculation.perContainer.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {isFa ? 'محاسبه بر اساس نرخ پلکانی لاینر' : 'Shipping line tariff rate'}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-900 text-white shadow-xs">
                <span className="text-xs font-bold text-slate-300 block">{isFa ? 'کل جریمه دموراژ محموله' : 'Total Demurrage Liability'}</span>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                  ${demurrageCalculation.totalDemurrage.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {isFa ? `برای ${containerCount} دستگاه کانتینر` : `For ${containerCount} container units`}
                </div>
              </div>
            </div>

            {/* Practical Advice */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <h4 className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{isFa ? 'راهکار پیشگیری از دموراژ برای تجار هوشمند:' : 'Proactive Demurrage Prevention:'}</span>
              </h4>
              <p>
                {isFa
                  ? '۱. پیش از حرکت کشتی، با فورواردر یا خط کشتیرانی بر سر حداقل ۱۴ تا ۲۱ روز Free Time در بندر مقصد چانه‌زنی کنید.'
                  : '1. Negotiate 14-21 days destination free time with your carrier before booking.'}
              </p>
              <p>
                {isFa
                  ? '۲. ثبت سفارش گمرکی و تخصیص ارز را همزمان با بارگیری مبدأ تکمیل کنید تا در زمان رسیدن کشتی، ترخیص بدون توقف انجام شود.'
                  : '2. Complete customs pre-declaration and FX allocations prior to vessel arrival.'}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PROFORMA BREAKDOWN & PRINTABLE FINANCIAL SHEET */}
      {/* ========================================================================= */}
      {activeTab === 'proforma_sheet' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            
            {/* Header with Print / Copy */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                  Official Trade Document
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {isFa ? 'صورت تفکیکی بهای تمام‌شده و آنالیز سود پروفرما' : 'Proforma Landed Cost & Profitability Sheet'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isFa ? 'فاکتور قابل استناد جهت ارائه به مدیران عامل، کارفرما و تیم مالی' : 'Printable cost sheet for executive review'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyProforma}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSummary ? (isFa ? 'کپی شد!' : 'Copied!') : (isFa ? 'کپی متن گزارش' : 'Copy Text')}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isFa ? 'چاپ یا خروجی PDF' : 'Print / Export PDF'}</span>
                </button>
              </div>
            </div>

            {/* Shipment Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">{isFa ? 'ترم قرارداد:' : 'Incoterms Term:'}</span>
                <span className="font-black text-indigo-700 text-sm">{selectedIncoterm} - {currentIncoterm.nameEn}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isFa ? 'کریدور تجاری:' : 'Trade Route:'}</span>
                <span className="font-bold text-slate-900">{currentCorridor.nameFa}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isFa ? 'تعداد کل محموله:' : 'Total Quantity:'}</span>
                <span className="font-bold text-slate-900">{itemUnits.toLocaleString()} {isFa ? 'عدد' : 'units'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isFa ? 'شیوه و ابزار حمل:' : 'Carriage Mode:'}</span>
                <span className="font-bold text-slate-900">{cargoType}</span>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="p-3">#</th>
                    <th className="p-3">{isFa ? 'شرح ردیف هزینه بازرگانی' : 'Cost Item Description'}</th>
                    <th className="p-3">{isFa ? 'مبنای محاسبه / نرخ' : 'Calculation Basis / Rate'}</th>
                    <th className="p-3">{isFa ? 'مسئولیت در اینکوترمز' : 'Payer in Term'}</th>
                    <th className="p-3 text-left font-mono">{isFa ? 'مبلغ کل (USD)' : 'Total (USD)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  <tr>
                    <td className="p-3 text-slate-400">01</td>
                    <td className="p-3 font-bold text-slate-900">{isFa ? 'مبلغ اولیه فاکتور خرید کالا (Commercial Base)' : 'Goods Invoice Value'}</td>
                    <td className="p-3 text-slate-600">{itemUnits.toLocaleString()} × ${unitBasePriceUsd.toFixed(2)}</td>
                    <td className="p-3 text-indigo-600 font-bold">{isFa ? 'فروشنده / خریدار' : 'Base Invoice'}</td>
                    <td className="p-3 text-left font-mono font-bold">${costBreakdown.baseGoodsTotalUsd.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400">02</td>
                    <td className="p-3 text-slate-800">{isFa ? 'کارمزد صرافی، سوئیفت و انتقال ارز' : 'Banking & FX Spread'}</td>
                    <td className="p-3 text-slate-600">{fxBankFeePct}% {isFa ? 'ارزش فاکتور' : 'of invoice'}</td>
                    <td className="p-3 text-blue-600 font-bold">{isFa ? 'خریدار' : 'Buyer'}</td>
                    <td className="p-3 text-left font-mono">${costBreakdown.fxBankCost.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400">03</td>
                    <td className="p-3 text-slate-800">{isFa ? 'بازرسی کیفی پیش از حمل PSI و تشریفات مبدأ' : 'Pre-Shipment Inspection & Origin'}</td>
                    <td className="p-3 text-slate-600">{isFa ? 'SGS / Cotecna استاندارد' : 'SGS / PSI'}</td>
                    <td className="p-3 text-slate-600">{['EXW', 'FCA'].includes(selectedIncoterm) ? (isFa ? 'خریدار' : 'Buyer') : (isFa ? 'فروشنده' : 'Seller')}</td>
                    <td className="p-3 text-left font-mono">${costBreakdown.buyerOriginExpenses.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400">04</td>
                    <td className="p-3 text-slate-800">{isFa ? 'کرایه حمل بین‌المللی (Ocean / Air / Road)' : 'Main Freight Carriage'}</td>
                    <td className="p-3 text-slate-600">{currentCorridor.nameFa}</td>
                    <td className="p-3 text-indigo-600 font-bold">{['EXW', 'FCA', 'FAS', 'FOB'].includes(selectedIncoterm) ? (isFa ? 'خریدار' : 'Buyer') : (isFa ? 'فروشنده (لحاظ‌شده)' : 'Seller')}</td>
                    <td className="p-3 text-left font-mono">${costBreakdown.effectiveFreightPaidByBuyer.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400">05</td>
                    <td className="p-3 text-slate-800">{isFa ? `بیمه دریایی انستیتو لندن (کلوز ${selectedInsuranceClause})` : `Marine Insurance Clause ${selectedInsuranceClause}`}</td>
                    <td className="p-3 text-slate-600">110% CIF × {costBreakdown.insuranceClauseRate}%</td>
                    <td className="p-3 text-slate-600">{['CIF', 'CIP', 'DDP'].includes(selectedIncoterm) ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}</td>
                    <td className="p-3 text-left font-mono">${costBreakdown.effectiveInsurancePaidByBuyer.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400">06</td>
                    <td className="p-3 text-slate-800">{isFa ? 'هزینه ترمینال مقصد (THC) و ترخیص گمرکی' : 'Destination THC & Brokerage'}</td>
                    <td className="p-3 text-slate-600">{isFa ? 'حق‌العمل ترخیص و تخلیه' : 'Handling & Broker'}</td>
                    <td className="p-3 text-blue-600 font-bold">{selectedIncoterm === 'DDP' ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}</td>
                    <td className="p-3 text-left font-mono">${(costBreakdown.effectiveDestThc + costBreakdown.effectiveBrokerage).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400">07</td>
                    <td className="p-3 text-slate-800">{isFa ? `حقوق ورودی و سود بازرگانی گمرک (${customsTariffDutyPct}%)` : `Customs Tariff Duty (${customsTariffDutyPct}%)`}</td>
                    <td className="p-3 text-slate-600">HS {selectedHsCode} × {customsTariffDutyPct}%</td>
                    <td className="p-3 text-blue-600 font-bold">{selectedIncoterm === 'DDP' ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}</td>
                    <td className="p-3 text-left font-mono">${Math.round(costBreakdown.tariffDutyUsd).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400">08</td>
                    <td className="p-3 text-slate-800">{isFa ? `مالیات بر ارزش افزوده واردات VAT (${importVatPct}%)` : `Import VAT (${importVatPct}%)`}</td>
                    <td className="p-3 text-slate-600">{isFa ? 'مبنای CIF + حقوق ورودی' : 'CIF + Duty Base'}</td>
                    <td className="p-3 text-blue-600 font-bold">{selectedIncoterm === 'DDP' ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}</td>
                    <td className="p-3 text-left font-mono">${Math.round(costBreakdown.importVatUsd).toLocaleString()}</td>
                  </tr>
                  {costBreakdown.effectiveDemurrage > 0 && (
                    <tr className="bg-rose-50/50">
                      <td className="p-3 text-rose-500">09</td>
                      <td className="p-3 text-rose-900 font-bold">{isFa ? 'جریمه دیرکرد و معطلی کانتینر (دموراژ)' : 'Demurrage & Detention'}</td>
                      <td className="p-3 text-rose-800">{demurrageCalculation.delayDays} {isFa ? 'روز مازاد' : 'days excess'}</td>
                      <td className="p-3 text-rose-600 font-bold">{isFa ? 'خریدار' : 'Buyer'}</td>
                      <td className="p-3 text-left font-mono font-bold text-rose-600">${costBreakdown.effectiveDemurrage.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="p-3 text-slate-400">{costBreakdown.effectiveDemurrage > 0 ? '10' : '09'}</td>
                    <td className="p-3 text-slate-800">{isFa ? 'حمل زمینی از گمرک تا انبار نهایی خریدار' : 'Destination Inland Delivery'}</td>
                    <td className="p-3 text-slate-600">{isFa ? 'تریلر ترانزیتی داخلی' : 'Trucking to site'}</td>
                    <td className="p-3 text-slate-600">{['DAP', 'DPU', 'DDP'].includes(selectedIncoterm) ? (isFa ? 'فروشنده' : 'Seller') : (isFa ? 'خریدار' : 'Buyer')}</td>
                    <td className="p-3 text-left font-mono">${costBreakdown.effectiveInlandDelivery.toLocaleString()}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-indigo-900 text-white font-black text-sm">
                    <td colSpan={4} className="p-3.5">
                      {isFa ? 'بهای تمام‌شده کل محموله در انبار مقصد (Landed Cost):' : 'Grand Total Landed Cost:'}
                    </td>
                    <td className="p-3.5 text-left font-mono text-emerald-300 text-base">
                      ${Math.round(costBreakdown.grandTotalLandedCostUsd).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Financial Highlights Bottom Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 text-white p-5 rounded-2xl">
              <div>
                <span className="text-xs text-slate-400 block">{isFa ? 'بهای تمام‌شده هر واحد کالا:' : 'Unit Landed Cost:'}</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">${costBreakdown.landedCostPerUnit.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{isFa ? `فاکتور مبدأ: $${unitBasePriceUsd.toFixed(2)}` : 'Incoterms origin base'}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">{isFa ? `قیمت فروش پیشنهادی (+${targetProfitMarginPct}%):` : 'Target Selling Price:'}</span>
                <span className="text-2xl font-black text-amber-400 font-mono">${costBreakdown.targetUnitSellingPrice.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{isFa ? 'نقطه سربه سر و تحقق حاشیه سود' : 'Break-even target'}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">{isFa ? 'پیش‌بینی سود خالص کل:' : 'Projected Total Net Profit:'}</span>
                <span className="text-2xl font-black text-white font-mono">+${Math.round(costBreakdown.totalExpectedProfitUsd).toLocaleString()}</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">{isFa ? 'بازده سرمایه‌گذاری تضمینی' : 'Calculated Net ROI'}</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
