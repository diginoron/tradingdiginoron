/**
 * UN Comtrade Data Types & Interfaces
 */

export interface ComtradeRecord {
  typeCode?: string; // 'C' for commodities, 'S' for services
  freqCode?: string; // 'A' for annual, 'M' for monthly
  refPeriodId?: number; // e.g. 20230101
  refYear?: number; // e.g. 2023
  refMonth?: number; // e.g. 1
  period: string | number; // e.g. 2023 or 202301
  reporterCode: number; // e.g. 842 (USA)
  reporterISO?: string; // e.g. 'USA'
  reporterDesc?: string; // e.g. 'USA'
  flowCode: string; // 'M' (Imports), 'X' (Exports), 'RX' (Re-exports), 'FM' (Re-imports)
  flowDesc?: string; // e.g. 'Imports', 'Exports'
  partnerCode: number; // e.g. 0 (World), 156 (China)
  partnerISO?: string;
  partnerDesc?: string;
  partner2Code?: number;
  partner2ISO?: string;
  partner2Desc?: string;
  classificationCode?: string; // e.g. 'H6', 'HS'
  cmdCode: string; // e.g. 'TOTAL', '0101', '8471'
  cmdDesc?: string;
  customsCode?: string;
  motCode?: number; // Mode of transport
  qtyUnitCode?: number;
  qtyUnit?: string;
  qty?: number;
  altQtyUnitCode?: number;
  altQtyUnit?: string;
  altQty?: number;
  netWgt?: number; // Net weight in kg
  grossWgt?: number; // Gross weight in kg
  cifvalue?: number; // CIF value in USD (Cost, Insurance, Freight)
  fobvalue?: number; // FOB value in USD (Free on Board)
  primaryValue: number; // Main trade value in USD
  legacyEstimationFlag?: number;
  isReported?: boolean;
  isAggregate?: boolean;
}

export interface ComtradeApiResponse {
  elapsedTime?: string;
  count: number;
  data: ComtradeRecord[];
  error?: string;
  statusCode?: number;
  endpointUrl?: string;
  queryTimeMs?: number;
  isMock?: boolean;
  rateLimitRemaining?: string | null;
}

export interface CountryItem {
  id: number;
  text: string;
  iso: string;
  nameEn: string;
  nameFa: string;
  flag?: string;
}

export interface CommodityItem {
  id: string; // e.g. 'TOTAL', '01', '84', '8542'
  text: string;
  nameEn: string;
  nameFa: string;
  category?: string;
  chapter?: string;
}

export interface FlowItem {
  id: string;
  code: string;
  text: string;
  nameEn: string;
  nameFa: string;
  color: string;
}

export interface QueryParams {
  typeCode: 'C' | 'S'; // Commodities or Services
  freqCode: 'A' | 'M'; // Annual or Monthly
  clCode: 'HS' | 'SITC' | 'BEC'; // Classification
  reporterCode: string; // Comma-separated country IDs or single (e.g. "842" or "842,156")
  partnerCode?: string; // Comma-separated country IDs or "0" (World)
  partner2Code?: string; // Usually "0"
  period: string; // e.g. "2023" or "2020,2021,2022,2023"
  cmdCode: string; // e.g. "TOTAL" or "8471"
  flowCode: string; // e.g. "M,X" or "M" or "X"
  customsCode?: string;
  motCode?: string;
  format?: 'JSON' | 'CSV';
  includeDesc?: boolean;
}

export interface PresetQuery {
  id: string;
  titleEn: string;
  titleFa: string;
  descriptionEn: string;
  descriptionFa: string;
  category: 'bilateral' | 'commodity' | 'global' | 'trend';
  params: QueryParams;
}

export interface TradeSummaryStats {
  totalTradeValue: number;
  totalExports: number;
  totalImports: number;
  totalReExports: number;
  tradeBalance: number; // Exports - Imports
  totalNetWeightKg: number;
  recordCount: number;
  topPartner?: { name: string; value: number };
  topCommodity?: { name: string; value: number };
}

// Service 1: World Trade Share
export interface WorldShareRecord {
  period?: number | string;
  reporterCode?: number;
  reporterISO?: string;
  reporterDesc?: string;
  flowCode?: string;
  flowDesc?: string;
  primaryValue?: number;
  tradeShare?: number; // Percent share of world trade (e.g. 14.85%)
  worldTotal?: number;
  rank?: number;
}

export interface WorldShareResponse {
  count: number;
  data: WorldShareRecord[];
  queryTimeMs?: number;
  endpointUrl?: string;
  error?: string;
  statusCode?: number;
}

// Service 2: Monthly Bulletin of Statistics (MBS) 1946-
export interface MbsRecord {
  series_type?: string; // T35.A.V.$, T38.A.CF.
  year?: number | string;
  period?: number | string;
  country_code?: number | string;
  country_desc?: string;
  country_iso?: string;
  value?: number;
  unit?: string;
  flow?: string;
  flowDesc?: string;
  conversion_factor?: number;
}

export interface MbsResponse {
  count: number;
  data: MbsRecord[];
  queryTimeMs?: number;
  endpointUrl?: string;
  error?: string;
  statusCode?: number;
}

// Service 3: Tariffline & Mode of Transport (MoT) & 2nd Partner
export interface TarifflineRecord {
  period?: number | string;
  reporterCode?: number;
  reporterDesc?: string;
  partnerCode?: number;
  partnerDesc?: string;
  partner2Code?: number;
  partner2Desc?: string;
  flowCode?: string;
  flowDesc?: string;
  cmdCode?: string;
  cmdDesc?: string;
  motCode?: number; // 1: Sea, 2: Rail, 3: Road, 4: Air, 5: Postal, 7: Multimodal, 8: Pipeline
  motDesc?: string;
  customsCode?: string;
  customsDesc?: string;
  primaryValue?: number;
  netWgt?: number;
  grossWgt?: number;
  qty?: number;
  qtyUnit?: string;
}

export interface TarifflineResponse {
  count: number;
  data: TarifflineRecord[];
  queryTimeMs?: number;
  endpointUrl?: string;
  error?: string;
  statusCode?: number;
}

// Service 4: Data Availability Matrix (DA)
export interface DataAvailabilityRecord {
  typeCode?: string;
  freqCode?: string;
  clCode?: string;
  reporterCode?: number;
  reporterISO?: string;
  reporterDesc?: string;
  periods?: string[];
  totalRecords?: number;
  latestPeriod?: string;
  publishedDate?: string;
}

export interface DataAvailabilityResponse {
  count: number;
  data: DataAvailabilityRecord[];
  queryTimeMs?: number;
  endpointUrl?: string;
  error?: string;
  statusCode?: number;
}

// Service 5: UN Comtrade Releases Feed
export interface ComtradeReleaseItem {
  releaseId?: string | number;
  datasetName?: string;
  reporterCode?: number;
  reporterDesc?: string;
  refPeriod?: string;
  typeCode?: string;
  classification?: string;
  recordCount?: number;
  releaseDate?: string;
  description?: string;
}

export interface ComtradeReleasesResponse {
  count: number;
  data: ComtradeReleaseItem[];
  queryTimeMs?: number;
  endpointUrl?: string;
  error?: string;
  statusCode?: number;
}

// Service 6: Bilateral Trade Asymmetry & Mirror Data Tool
export interface BilateralTradeRecord {
  period?: string | number;
  reporterCode?: number;
  reporterISO?: string;
  reporterDesc?: string;
  partnerCode?: number;
  partnerISO?: string;
  partnerDesc?: string;
  cmdCode?: string;
  cmdDesc?: string;
  flowCode?: string;
  flowDesc?: string;
  reporterValue?: number; // Value reported by reporter
  mirrorValue?: number; // Value reported by mirror partner
  asymmetryDifference?: number; // reporterValue - mirrorValue
  asymmetryRatio?: number; // (reporterValue / mirrorValue)
  primaryValue?: number;
  mirrorPrimaryValue?: number;
  netWgt?: number;
  mirrorNetWgt?: number;
}

export interface BilateralTradeResponse {
  count: number;
  data: BilateralTradeRecord[];
  queryTimeMs?: number;
  endpointUrl?: string;
  error?: string;
  statusCode?: number;
}

// Service 7: Pivoted Trade Balance Tool
export interface TradeBalanceToolRecord {
  period?: string | number;
  reporterCode?: number;
  reporterISO?: string;
  reporterDesc?: string;
  partnerCode?: number;
  partnerISO?: string;
  partnerDesc?: string;
  partner2Code?: number;
  partner2Desc?: string;
  cmdCode?: string;
  cmdDesc?: string;
  customsCode?: string;
  motCode?: number;
  exportsValue?: number; // Export flow (X)
  importsValue?: number; // Import flow (M)
  reExportsValue?: number; // Re-export flow (RX)
  reImportsValue?: number; // Re-import flow (FM)
  tradeBalance?: number; // exportsValue - importsValue
  primaryValue?: number;
}

export interface TradeBalanceToolResponse {
  count: number;
  data: TradeBalanceToolRecord[];
  queryTimeMs?: number;
  endpointUrl?: string;
  error?: string;
  statusCode?: number;
}

// AI Smart Trade Advisor Types
export interface AiTradeAdvisorContext {
  originCountry: string;
  originName: string;
  originIso?: string;
  destinationCountry: string;
  destName: string;
  destIso?: string;
  hsCode: string;
  hsTitle: string;
  period: string;
  
  // Aggregated Tool Intelligence
  traderHub: {
    totalTradeValue: number;
    exportsValue: number;
    importsValue: number;
    tradeBalance: number;
    unitPriceUsdPerKg?: number;
    recordCount: number;
  };
  exportFinder: {
    topExportMarkets: Array<{ country: string; sharePercent: number; valueUSD: number }>;
    totalOriginExportsGlobal: number;
  };
  importSourcing: {
    topSuppliersToDest: Array<{ country: string; sharePercent: number; valueUSD: number }>;
    totalDestImportsGlobal: number;
  };
  untappedPotential: {
    estimatedPotentialUSD: number;
    actualExportsUSD: number;
    untappedGapUSD: number;
    growthDemandPct: number;
  };
  balassaRca: {
    rcaScore: number;
    hasAdvantage: boolean;
    strength: 'very_high' | 'moderate' | 'none';
    interpretationFa: string;
    interpretationEn: string;
  };
  tradeFraudRadar: {
    averageGlobalUnitPrice: number;
    reportedUnitPrice: number;
    deviationPercentage: number;
    riskLevel: 'low' | 'moderate' | 'high_under_invoicing' | 'high_over_invoicing';
    riskLabelFa: string;
  };
  becCategory: {
    code: string;
    categoryTitleFa: string;
    categoryTitleEn: string;
    economicNature: 'capital' | 'intermediate' | 'consumption' | 'fuel' | 'unclassified';
    descriptionFa: string;
  };
  hhiConcentration: {
    hhiScore: number;
    marketStructure: 'competitive' | 'moderate' | 'highly_concentrated';
    structureFa: string;
  };
  monthlySeasonality: {
    peakQuarterFa: string;
    peakQuarterEn: string;
    demandVolatility: 'low' | 'medium' | 'high';
  };
  tradeBlocs: {
    sharedBlocs: string[];
    originBlocs: string[];
    destBlocs: string[];
    hasPreferentialTariff: boolean;
    detailsFa: string;
  };
  competitorMatrix: {
    topCompetitors: Array<{ country: string; sharePct: number }>;
    originRankInDestination: number | string;
  };
  bilateralAsymmetry?: {
    mirrorDifferenceUSD: number;
    discrepancyPct: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelUsed?: string;
  durationMs?: number;
}

// Business Letter Generation Interfaces (ICC Standards & AI Engine)
export interface BusinessLetterSenderInfo {
  companyName: string;
  contactPerson: string;
  title: string;
  email: string;
  phone: string;
  country: string;
  address?: string;
  website?: string;
}

export interface BusinessLetterRecipientInfo {
  companyName: string;
  contactPerson: string;
  title?: string;
  email?: string;
  country: string;
  address?: string;
}

export interface BusinessLetterProductDetails {
  productName: string;
  hsCode?: string;
  quantity?: string;
  packaging?: string;
  specifications?: string;
}

export interface BusinessLetterCommercialTerms {
  incoterm?: string; // FOB, CIF, CFR, EXW, FCA, etc.
  portOrPlace?: string; // Named port or place
  paymentTerms?: string; // e.g. L/C at Sight, 30% T/T Advance + 70% against BL
  currency?: string; // USD, EUR, CNY, AED, RUB
  targetPrice?: string;
  deliveryTimeline?: string; // e.g. Within 30 days of L/C issuance
  validityDate?: string; // Offer validity
  inspectionAgency?: string; // SGS, Bureau Veritas, etc.
}

export interface BusinessLetterRequestPayload {
  letterType: string;
  targetLanguage: 'en' | 'fa' | 'ar' | 'zh' | 'ru' | 'de' | 'fr' | 'es' | 'tr';
  senderInfo: BusinessLetterSenderInfo;
  recipientInfo: BusinessLetterRecipientInfo;
  productDetails: BusinessLetterProductDetails;
  commercialTerms: BusinessLetterCommercialTerms;
  tone: 'formal' | 'diplomatic' | 'firm' | 'collaborative' | 'urgent';
  specialInstructions?: string;
  includePersianTranslation?: boolean;
  customKey?: string;
  model?: string;
}

export interface BusinessLetterResult {
  subject: string;
  letterBody: string;
  persianTranslation: string;
  commercialNotes: string[];
  iccChecklist: Array<{
    item: string;
    status: 'compliant' | 'warning' | 'info';
    note: string;
  }>;
  metadata?: {
    date: string;
    refNumber: string;
    wordCount?: number;
  };
  modelUsed?: string;
  durationMs?: number;
}

// Active Service View Type
export type ActiveServiceSection = 
  | 'smart_trade_assistant'
  | 'business_letter_generator'
  | 'trader_dashboard'
  | 'incoterms_landed_cost'
  | 'export_finder'
  | 'import_sourcing'
  | 'currency_converter'
  | 'trade_holidays'
  | 'macro_capacity'
  | 'trade_finance_validator'
  | 'commodity_benchmarks'
  | 'country_directory'
  | 'hs_code_explorer'
  | 'balassa_rca'
  | 'trade_fraud_radar'
  | 'bec_categories'
  | 'hhi_concentration'
  | 'untapped_potential'
  | 'monthly_seasonality'
  | 'trade_blocs'
  | 'competitor_matrix'
  | 'merchandise'
  | 'bilateral_asymmetry'
  | 'trade_balance_tool'
  | 'world_share'
  | 'transport_mot'
  | 'services'
  | 'mbs_historical'
  | 'data_availability'
  | 'releases_feed'
  | 'key_manager'
  | 'api_docs';

