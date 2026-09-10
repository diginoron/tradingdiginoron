import { CountryItem, CommodityItem, FlowItem, PresetQuery } from '../types';

export const POPULAR_REPORTERS: CountryItem[] = [
  { id: 842, text: 'USA - United States of America', iso: 'USA', nameEn: 'United States', nameFa: 'ایالات متحده آمریکا', flag: '🇺🇸' },
  { id: 156, text: 'CHN - China', iso: 'CHN', nameEn: 'China', nameFa: 'چین', flag: '🇨🇳' },
  { id: 276, text: 'DEU - Germany', iso: 'DEU', nameEn: 'Germany', nameFa: 'آلمان', flag: '🇩🇪' },
  { id: 392, text: 'JPN - Japan', iso: 'JPN', nameEn: 'Japan', nameFa: 'ژاپن', flag: '🇯🇵' },
  { id: 364, text: 'IRN - Iran (Islamic Rep. of)', iso: 'IRN', nameEn: 'Iran', nameFa: 'ایران', flag: '🇮🇷' },
  { id: 826, text: 'GBR - United Kingdom', iso: 'GBR', nameEn: 'United Kingdom', nameFa: 'بریتانیا', flag: '🇬🇧' },
  { id: 251, text: 'FRA - France', iso: 'FRA', nameEn: 'France', nameFa: 'فرانسه', flag: '🇫🇷' },
  { id: 381, text: 'ITA - Italy', iso: 'ITA', nameEn: 'Italy', nameFa: 'ایتالیا', flag: '🇮🇹' },
  { id: 410, text: 'KOR - Rep. of Korea', iso: 'KOR', nameEn: 'South Korea', nameFa: 'کره جنوبی', flag: '🇰🇷' },
  { id: 356, text: 'IND - India', iso: 'IND', nameEn: 'India', nameFa: 'هند', flag: '🇮🇳' },
  { id: 792, text: 'TUR - Türkiye', iso: 'TUR', nameEn: 'Turkey', nameFa: 'ترکیه', flag: '🇹🇷' },
  { id: 784, text: 'ARE - United Arab Emirates', iso: 'ARE', nameEn: 'United Arab Emirates', nameFa: 'امارات متحده عربی', flag: '🇦🇪' },
  { id: 682, text: 'SAU - Saudi Arabia', iso: 'SAU', nameEn: 'Saudi Arabia', nameFa: 'عربستان سعودی', flag: '🇸🇦' },
  { id: 643, text: 'RUS - Russian Federation', iso: 'RUS', nameEn: 'Russia', nameFa: 'روسیه', flag: '🇷🇺' },
  { id: 124, text: 'CAN - Canada', iso: 'CAN', nameEn: 'Canada', nameFa: 'کانادا', flag: '🇨🇦' },
  { id: 76, text: 'BRA - Brazil', iso: 'BRA', nameEn: 'Brazil', nameFa: 'برزیل', flag: '🇧🇷' },
  { id: 528, text: 'NLD - Netherlands', iso: 'NLD', nameEn: 'Netherlands', nameFa: 'هلند', flag: '🇳🇱' },
  { id: 757, text: 'CHE - Switzerland', iso: 'CHE', nameEn: 'Switzerland', nameFa: 'سوئیس', flag: '🇨🇭' },
  { id: 702, text: 'SGP - Singapore', iso: 'SGP', nameEn: 'Singapore', nameFa: 'سنگاپور', flag: '🇸🇬' },
  { id: 484, text: 'MEX - Mexico', iso: 'MEX', nameEn: 'Mexico', nameFa: 'مکزیک', flag: '🇲🇽' },
  { id: 36, text: 'AUS - Australia', iso: 'AUS', nameEn: 'Australia', nameFa: 'استرالیا', flag: '🇦🇺' },
  { id: 710, text: 'ZAF - South Africa', iso: 'ZAF', nameEn: 'South Africa', nameFa: 'آفریقای جنوبی', flag: '🇿🇦' },
  { id: 368, text: 'IRQ - Iraq', iso: 'IRQ', nameEn: 'Iraq', nameFa: 'عراق', flag: '🇮🇶' },
  { id: 586, text: 'PAK - Pakistan', iso: 'PAK', nameEn: 'Pakistan', nameFa: 'پاکستان', flag: '🇵🇰' },
  { id: 51, text: 'ARM - Armenia', iso: 'ARM', nameEn: 'Armenia', nameFa: 'ارمنستان', flag: '🇦🇲' },
  { id: 31, text: 'AZE - Azerbaijan', iso: 'AZE', nameEn: 'Azerbaijan', nameFa: 'آذربایجان', flag: '🇦🇿' },
  { id: 56, text: 'BEL - Belgium', iso: 'BEL', nameEn: 'Belgium', nameFa: 'بلژیک', flag: '🇧🇪' },
  { id: 724, text: 'ESP - Spain', iso: 'ESP', nameEn: 'Spain', nameFa: 'اسپانیا', flag: '🇪🇸' },
  { id: 752, text: 'SWE - Sweden', iso: 'SWE', nameEn: 'Sweden', nameFa: 'سوئد', flag: '🇸🇪' },
  { id: 578, text: 'NOR - Norway', iso: 'NOR', nameEn: 'Norway', nameFa: 'نروژ', flag: '🇳🇴' },
  { id: 616, text: 'POL - Poland', iso: 'POL', nameEn: 'Poland', nameFa: 'لهستان', flag: '🇵🇱' },
  { id: 40, text: 'AUT - Austria', iso: 'AUT', nameEn: 'Austria', nameFa: 'اتریش', flag: '🇦🇹' },
  { id: 458, text: 'MYS - Malaysia', iso: 'MYS', nameEn: 'Malaysia', nameFa: 'مالزی', flag: '🇲🇾' },
  { id: 764, text: 'THA - Thailand', iso: 'THA', nameEn: 'Thailand', nameFa: 'تایلند', flag: '🇹🇭' },
  { id: 360, text: 'IDN - Indonesia', iso: 'IDN', nameEn: 'Indonesia', nameFa: 'اندونزی', flag: '🇮🇩' },
  { id: 704, text: 'VNM - Viet Nam', iso: 'VNM', nameEn: 'Vietnam', nameFa: 'ویتنام', flag: '🇻🇳' },
  { id: 634, text: 'QAT - Qatar', iso: 'QAT', nameEn: 'Qatar', nameFa: 'قطر', flag: '🇶🇦' },
  { id: 512, text: 'OMN - Oman', iso: 'OMN', nameEn: 'Oman', nameFa: 'عمان', flag: '🇴🇲' },
  { id: 414, text: 'KWT - Kuwait', iso: 'KWT', nameEn: 'Kuwait', nameFa: 'کویت', flag: '🇰🇼' },
  { id: 818, text: 'EGY - Egypt', iso: 'EGY', nameEn: 'Egypt', nameFa: 'مصر', flag: '🇪🇬' }
];

export const POPULAR_PARTNERS: CountryItem[] = [
  { id: 0, text: 'World (Total of all partners)', iso: 'WLD', nameEn: 'World (All Partners)', nameFa: 'کل جهان (مجموع تمام کشورها)', flag: '🌍' },
  ...POPULAR_REPORTERS
];

export const FLOW_CODES: FlowItem[] = [
  { id: 'all', code: 'M,X', text: 'Imports & Exports (Trade Total)', nameEn: 'Imports & Exports', nameFa: 'واردات و صادرات', color: 'emerald' },
  { id: 'M', code: 'M', text: 'Imports (Inflows)', nameEn: 'Imports (M)', nameFa: 'فقط واردات (Imports)', color: 'blue' },
  { id: 'X', code: 'X', text: 'Exports (Outflows)', nameEn: 'Exports (X)', nameFa: 'فقط صادرات (Exports)', color: 'teal' },
  { id: 'RX', code: 'RX', text: 'Re-exports', nameEn: 'Re-exports (RX)', nameFa: 'صادرات مجدد (Re-exports)', color: 'amber' },
  { id: 'FM', code: 'FM', text: 'Re-imports', nameEn: 'Re-imports (FM)', nameFa: 'واردات مجدد (Re-imports)', color: 'purple' },
];

export const POPULAR_COMMODITIES: CommodityItem[] = [
  { id: 'TOTAL', text: 'TOTAL - All Commodities Aggregated', nameEn: 'All Commodities (Total Trade)', nameFa: 'تمام کالاها (مجموع کل تجارت)', category: 'Aggregates' },
  { id: '27', text: '27 - Mineral fuels, oils, distillation products', nameEn: 'Mineral fuels, oils & petroleum', nameFa: 'سوخت‌های معدنی، نفت و مشتقات', category: 'Energy' },
  { id: '2709', text: '2709 - Petroleum oils, crude', nameEn: 'Crude Petroleum Oil', nameFa: 'نفت خام', category: 'Energy' },
  { id: '2710', text: '2710 - Petroleum oils, refined', nameEn: 'Refined Petroleum Products', nameFa: 'فرآورده‌های نفتی پالایش شده', category: 'Energy' },
  { id: '2711', text: '2711 - Petroleum gases & other gaseous hydrocarbons', nameEn: 'Natural Gas & Petroleum Gases', nameFa: 'گاز طبیعی و هیدروکربن‌های گازی', category: 'Energy' },
  { id: '84', text: '84 - Nuclear reactors, boilers, machinery & mechanical appliances', nameEn: 'Machinery & Mechanical Appliances', nameFa: 'ماشین‌آلات و تجهیزات مکانیکی', category: 'Machinery' },
  { id: '8471', text: '8471 - Automatic data processing machines & units (Computers)', nameEn: 'Computers & Data Processing Units', nameFa: 'رایانه‌ها و پردازشگرهای داده', category: 'Technology' },
  { id: '85', text: '85 - Electrical machinery and equipment and parts thereof', nameEn: 'Electrical Machinery & Electronics', nameFa: 'ماشین‌آلات و تجهیزات الکترونیکی', category: 'Electronics' },
  { id: '8542', text: '8542 - Electronic integrated circuits and microassemblies (Chips)', nameEn: 'Integrated Circuits & Microchips', nameFa: 'مدارهای مجتمع الکترونیکی (تراشه‌ها)', category: 'Technology' },
  { id: '8517', text: '8517 - Telephone sets, smartphones & transmission apparatus', nameEn: 'Smartphones & Telecom Equipment', nameFa: 'تلفن‌های هوشمند و تجهیزات مخابراتی', category: 'Technology' },
  { id: '87', text: '87 - Vehicles other than railway, tramway & parts', nameEn: 'Vehicles & Automotive Parts', nameFa: 'خودروها و قطعات یدکی خودرو', category: 'Automotive' },
  { id: '8703', text: '8703 - Motor cars & vehicles for passenger transport', nameEn: 'Passenger Motor Cars', nameFa: 'خودروهای سواری مسافربری', category: 'Automotive' },
  { id: '30', text: '30 - Pharmaceutical products', nameEn: 'Pharmaceutical Products (Medicines)', nameFa: 'محصولات دارویی و داروها', category: 'Healthcare' },
  { id: '3004', text: '3004 - Medicaments consisting of mixed or unmixed products', nameEn: 'Medicines & Medicaments', nameFa: 'داروهای آماده مصرف پزشکی', category: 'Healthcare' },
  { id: '71', text: '71 - Natural pearls, precious stones, precious metals (Gold)', nameEn: 'Precious Stones & Metals (Gold)', nameFa: 'فلزات گرانبها، سنگ‌های قیمتی و طلا', category: 'Precious' },
  { id: '7108', text: '7108 - Gold (including gold plated with platinum)', nameEn: 'Gold unwrought or semi-manufactured', nameFa: 'طلا (شمش و نیمه‌ساخته)', category: 'Precious' },
  { id: '72', text: '72 - Iron and steel', nameEn: 'Iron and Steel', nameFa: 'آهن و فولاد', category: 'Metals' },
  { id: '39', text: '39 - Plastics and articles thereof', nameEn: 'Plastics & Polymers', nameFa: 'پلاستیک‌ها و پلیمرها', category: 'Chemicals' },
  { id: '10', text: '10 - Cereals (Wheat, Rice, Corn, Barley)', nameEn: 'Cereals (Wheat, Corn, Rice)', nameFa: 'غلات (گندم، برنج، ذرت)', category: 'Agriculture' },
  { id: '08', text: '08 - Edible fruit and nuts; peel of citrus fruit or melons', nameEn: 'Edible Fruits & Nuts (Pistachios, etc.)', nameFa: 'میوه‌های خوراکی و خشکبار (پسته، زعفران و...)', category: 'Agriculture' },
  { id: '09', text: '09 - Coffee, tea, maté and spices (Saffron)', nameEn: 'Spices, Saffron, Tea & Coffee', nameFa: 'ادویه‌ها، زعفران، چای و قهوه', category: 'Agriculture' },
  { id: '29', text: '29 - Organic chemicals', nameEn: 'Organic Chemicals & Petrochemicals', nameFa: 'مواد شیمیایی آلی و پتروشیمی', category: 'Chemicals' },
  { id: '90', text: '90 - Optical, photographic, medical or surgical instruments', nameEn: 'Medical & Precision Instruments', nameFa: 'ابزارهای پزشکی و اپتیک دقیق', category: 'Healthcare' },
  { id: '88', text: '88 - Aircraft, spacecraft, and parts thereof', nameEn: 'Aircraft & Aviation Components', nameFa: 'هواپیماها، فضاپیماها و قطعات هوانوردی', category: 'Aerospace' }
];

export const PRESET_QUERIES: PresetQuery[] = [
  {
    id: 'usa-china-trade',
    titleEn: 'USA ↔ China Bilateral Trade Trend',
    titleFa: 'روند تجارت دوجانبه آمریکا و چین (۲۰۱۹-۲۰۲۳)',
    descriptionEn: 'Explore real import/export flows, trade balance and deficit between the US and China over recent years.',
    descriptionFa: 'بررسی جریان‌های واردات و صادرات و تراز تجاری بین ایالات متحده و چین در سال‌های اخیر.',
    category: 'bilateral',
    params: {
      typeCode: 'C',
      freqCode: 'A',
      clCode: 'HS',
      reporterCode: '842', // USA
      partnerCode: '156', // China
      period: '2019,2020,2021,2022,2023',
      cmdCode: 'TOTAL',
      flowCode: 'M,X'
    }
  },
  {
    id: 'germany-world-machinery',
    titleEn: 'Germany Global Machinery Exports (HS 84)',
    titleFa: 'صادرات جهانی ماشین‌آلات آلمان (فصل ۸۴)',
    descriptionEn: 'Detailed machinery and industrial equipment export data from Germany to global markets.',
    descriptionFa: 'داده‌های واقعی صادرات ماشین‌آلات صنعتی آلمان به کشورهای مختلف جهان.',
    category: 'commodity',
    params: {
      typeCode: 'C',
      freqCode: 'A',
      clCode: 'HS',
      reporterCode: '276', // Germany
      partnerCode: '0', // World
      period: '2022,2023',
      cmdCode: '84',
      flowCode: 'X'
    }
  },
  {
    id: 'iran-trade-flows',
    titleEn: 'Iran Trade Partners & Flows',
    titleFa: 'شرکای تجاری و جریان‌های صادرات و واردات ایران',
    descriptionEn: 'UN reported trade flows, primary commodities, and partner destinations for Iran.',
    descriptionFa: 'جریان‌های ثبت شده تجارت، مقاصد صادراتی و مبادی وارداتی ایران در پایگاه سازمان ملل.',
    category: 'global',
    params: {
      typeCode: 'C',
      freqCode: 'A',
      clCode: 'HS',
      reporterCode: '364', // Iran
      partnerCode: '0', // World
      period: '2021,2022,2023',
      cmdCode: 'TOTAL',
      flowCode: 'M,X'
    }
  },
  {
    id: 'global-semiconductors',
    titleEn: 'Global Semiconductor & Chip Trade (HS 8542)',
    titleFa: 'تجارت جهانی میکروچیپ و نیمه‌هادی‌ها (HS 8542)',
    descriptionEn: 'Microchip & integrated circuit trade volume across top technology exporter nations.',
    descriptionFa: 'حجم مبادلات جهانی تراشه‌های الکترونیکی و مدارهای مجتمع میان کشورهای برتر فناوری.',
    category: 'commodity',
    params: {
      typeCode: 'C',
      freqCode: 'A',
      clCode: 'HS',
      reporterCode: '842', // USA
      partnerCode: '0', // World
      period: '2022,2023',
      cmdCode: '8542',
      flowCode: 'M,X'
    }
  },
  {
    id: 'japan-automotive',
    titleEn: 'Japan Passenger Vehicle Exports (HS 8703)',
    titleFa: 'صادرات خودروهای سواری ژاپن (HS 8703)',
    descriptionEn: 'Motor vehicle export volumes and top receiving partner countries from Japan.',
    descriptionFa: 'حجم صادرات اتومبیل‌های سواری ساخت ژاپن به بازارهای عمده جهانی.',
    category: 'commodity',
    params: {
      typeCode: 'C',
      freqCode: 'A',
      clCode: 'HS',
      reporterCode: '392', // Japan
      partnerCode: '0', // World
      period: '2023',
      cmdCode: '8703',
      flowCode: 'X'
    }
  },
  {
    id: 'turkey-trade-trend',
    titleEn: 'Türkiye Total Trade Balance (2019-2023)',
    titleFa: 'تراز کل تجارت خارجی ترکیه (۲۰۱۹ تا ۲۰۲۳)',
    descriptionEn: '5-year overview of exports, imports, and net trade balance for Turkey.',
    descriptionFa: 'روند ۵ ساله صادرات، واردات و تراز تجاری کشور ترکیه با کل دنیا.',
    category: 'trend',
    params: {
      typeCode: 'C',
      freqCode: 'A',
      clCode: 'HS',
      reporterCode: '792', // Turkey
      partnerCode: '0', // World
      period: '2019,2020,2021,2022,2023',
      cmdCode: 'TOTAL',
      flowCode: 'M,X'
    }
  }
];

export const AVAILABLE_YEARS = [
  '2026',
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
  '2019',
  '2018',
  '2017',
  '2016',
  '2015',
  '2014',
  '2013',
  '2012',
  '2010'
];

export interface MotItem {
  code: number;
  nameEn: string;
  nameFa: string;
  icon: string;
  color: string;
}

export const MODES_OF_TRANSPORT: MotItem[] = [
  { code: 0, nameEn: 'All Modes of Transport', nameFa: 'تمام شیوه‌های حمل‌ونقل', icon: '🚚', color: 'slate' },
  { code: 1, nameEn: 'Sea Transport (Maritime)', nameFa: 'حمل‌ونقل دریایی (کشتی/بنادر)', icon: '🚢', color: 'blue' },
  { code: 2, nameEn: 'Rail Transport', nameFa: 'حمل‌ونقل ریلی (قطار باری)', icon: '🚆', color: 'emerald' },
  { code: 3, nameEn: 'Road Transport', nameFa: 'حمل‌ونقل جاده‌ای (کامیون/ترانزیت)', icon: '🚛', color: 'amber' },
  { code: 4, nameEn: 'Air Transport', nameFa: 'حمل‌ونقل هوایی (کارگو/فرودگاهی)', icon: '✈️', color: 'sky' },
  { code: 5, nameEn: 'Postal & Courier Consignments', nameFa: 'پست و کوریر بین‌الملل', icon: '📦', color: 'purple' },
  { code: 7, nameEn: 'Multimodal Transport', nameFa: 'حمل‌ونقل ترکیبی (چندوجهی)', icon: '🔄', color: 'indigo' },
  { code: 8, nameEn: 'Fixed Transport / Pipelines', nameFa: 'خطوط لوله و تأسیسات انتقال ثابت (نفت/گاز)', icon: '⚡', color: 'orange' },
  { code: 9, nameEn: 'Inland Waterways', nameFa: 'آبراه‌ها و رودخانه‌های داخلی', icon: '⛵', color: 'teal' },
];

export interface EbopsServiceItem {
  code: string;
  nameEn: string;
  nameFa: string;
  category: string;
}

export const EBOPS_SERVICES: EbopsServiceItem[] = [
  { code: 'TOTAL', nameEn: 'Commercial Services (Total Trade)', nameFa: 'مجموع کل تجارت خدمات تجاری', category: 'General' },
  { code: 'SC', nameEn: 'Transportation Services (Freight & Passenger)', nameFa: 'خدمات حمل‌ونقل، کشتیرانی و ترانزیت', category: 'Logistics' },
  { code: 'SD', nameEn: 'Travel & Tourism Services', nameFa: 'خدمات مسافرت و گردشگری بین‌المللی', category: 'Travel' },
  { code: 'SI', nameEn: 'Telecommunications, Computer & Information (ICT)', nameFa: 'خدمات فناوری اطلاعات، نرم‌افزار و مخابرات', category: 'Tech' },
  { code: 'SF', nameEn: 'Financial & Insurance Services', nameFa: 'خدمات مالی، بانکی و بیمه بین‌المللی', category: 'Finance' },
  { code: 'SH', nameEn: 'Charges for Use of Intellectual Property (Licensing)', nameFa: 'حقوق مالکیت معنوی، پتنت و لایسنس', category: 'IP' },
  { code: 'SJ', nameEn: 'Other Business Services (R&D, Consulting, Legal)', nameFa: 'خدمات مشاوره‌ای، فنی، مهندسی و تحقیق و توسعه', category: 'Business' },
  { code: 'SK', nameEn: 'Personal, Cultural & Recreational Services', nameFa: 'خدمات فرهنگی، هنری، رسانه‌ای و آموزشی', category: 'Culture' },
  { code: 'SL', nameEn: 'Government Goods & Services n.i.e.', nameFa: 'خدمات و اقلام دولتی و دیپلماتیک', category: 'Government' },
  { code: 'SA', nameEn: 'Manufacturing Services on Physical Inputs', nameFa: 'خدمات فرآوری و ساخت بر روی کالاهای ورودی', category: 'Manufacturing' },
  { code: 'SB', nameEn: 'Maintenance and Repair Services n.i.e.', nameFa: 'خدمات تعمیرات و نگهداری تخصصی تجهیزات', category: 'Maintenance' },
];

export const MBS_SERIES_TYPES = [
  { code: 'T35.A.V.$', nameEn: 'Table 35: Total Merchandise Trade Value - Annual (USD)', nameFa: 'جدول ۳۵: ارزش کل تجارت کالا - سالانه (دلار)' },
  { code: 'T35.Q.V.$', nameEn: 'Table 35: Total Merchandise Trade Value - Quarterly (USD)', nameFa: 'جدول ۳۵: ارزش کل تجارت کالا - فصلی (دلار)' },
  { code: 'T35.M.V.$', nameEn: 'Table 35: Total Merchandise Trade Value - Monthly (USD)', nameFa: 'جدول ۳۵: ارزش کل تجارت کالا - ماهانه (دلار)' },
  { code: 'T38.A.CF.', nameEn: 'Table 38: Conversion Factors to USD - Annual', nameFa: 'جدول ۳۸: ضرایب تبدیل ارز به دلار - سالانه' },
  { code: 'T38.M.CF.', nameEn: 'Table 38: Conversion Factors to USD - Monthly', nameFa: 'جدول ۳۸: ضرایب تبدیل ارز به دلار - ماهانه' },
];

export { ALL_UN_COUNTRIES, searchCountries } from './allCountries';
export { ALL_HS_CHAPTERS, searchHsChapters } from './hsChapters';

