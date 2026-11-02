export interface InvoiceItem {
  id: string;
  itemNo: number;
  hsCode: string;
  description: string;
  specification?: string;
  quantity: number;
  unit: string; // PCS, KGS, MT, CTN, SET, MTR, LTR, etc.
  unitPrice: number;
  totalPrice: number;
  // Packing List specific fields
  packageCount: number; // e.g. 50 cartons
  packageType: string; // Cartons, Pallets, Wooden Crates, Drums, Bags, Rolls
  netWeightPerUnitKg: number;
  grossWeightPerUnitKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface BankDetails {
  beneficiaryName: string;
  bankName: string;
  bankAddress: string;
  accountNumberOrIban: string;
  swiftBic: string;
  currency: string;
  routingCode?: string;
  correspondentBank?: string;
}

export interface PartyDetails {
  companyName: string;
  contactPerson: string;
  address: string;
  cityCountry: string;
  phone: string;
  email: string;
  taxOrVatId?: string;
  commercialRegNo?: string;
}

export interface ProformaInvoiceData {
  id: string;
  title: string;
  docType: 'PROFORMA_INVOICE' | 'COMMERCIAL_INVOICE';
  invoiceNumber: string;
  date: string;
  validUntil: string;
  orderReference?: string;
  seller: PartyDetails;
  buyer: PartyDetails;
  notifyParty?: PartyDetails;
  countryOfOrigin: string;
  countryOfDestination: string;
  portOfLoading: string;
  portOfDischarge: string;
  finalDestination: string;
  incoterm: string; // FOB, CIF, CFR, EXW, FCA, CIP, CPT, DAP, DPU, DDP
  namedPlace: string;
  currency: string;
  paymentTerms: string;
  deliveryTime: string;
  shippingMarks: string;
  partialShipment: 'ALLOWED' | 'NOT_ALLOWED';
  transhipment: 'ALLOWED' | 'NOT_ALLOWED';
  items: InvoiceItem[];
  discountPercentage: number;
  freightCharge: number;
  insuranceCharge: number;
  otherCharges: number;
  specialNotes: string[];
  bankDetails: BankDetails;
  authorizedSignatoryName: string;
  authorizedSignatoryTitle: string;
}

// Convert numbers to English words (Standard international banking & invoice format)
export function numberToEnglishWords(amount: number, currency: string = 'USD'): string {
  if (isNaN(amount) || amount === 0) return `Zero ${currency} Only`;

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Million', 'Billion'];

  function convertGroup(num: number): string {
    let result = '';
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;

    if (hundred > 0) {
      result += units[hundred] + ' Hundred';
      if (remainder > 0) result += ' and ';
    }

    if (remainder > 0) {
      if (remainder < 20) {
        result += units[remainder];
      } else {
        const ten = Math.floor(remainder / 10);
        const unit = remainder % 10;
        result += tens[ten];
        if (unit > 0) result += '-' + units[unit];
      }
    }

    return result;
  }

  const integerPart = Math.floor(Math.abs(amount));
  const decimalPart = Math.round((Math.abs(amount) - integerPart) * 100);

  let currentNum = integerPart;
  const groups: string[] = [];
  let scaleIndex = 0;

  if (currentNum === 0) {
    groups.push('Zero');
  } else {
    while (currentNum > 0) {
      const groupValue = currentNum % 1000;
      if (groupValue !== 0) {
        const groupText = convertGroup(groupValue);
        const scale = scales[scaleIndex];
        groups.unshift(scale ? `${groupText} ${scale}` : groupText);
      }
      currentNum = Math.floor(currentNum / 1000);
      scaleIndex++;
    }
  }

  const currencyNames: Record<string, { main: string; sub: string }> = {
    USD: { main: 'US Dollars', sub: 'Cents' },
    EUR: { main: 'Euros', sub: 'Cents' },
    AED: { main: 'UAE Dirhams', sub: 'Fils' },
    CNY: { main: 'Chinese Yuan', sub: 'Fen' },
    GBP: { main: 'British Pounds', sub: 'Pence' },
    TRY: { main: 'Turkish Lira', sub: 'Kurus' },
    RUB: { main: 'Russian Rubles', sub: 'Kopeks' },
    IRR: { main: 'Iranian Rials', sub: 'Rials' },
  };

  const curr = currencyNames[currency] || { main: currency, sub: 'Cents' };
  let words = groups.join(' ') + ' ' + curr.main;

  if (decimalPart > 0) {
    words += ` and ${convertGroup(decimalPart)} ${curr.sub}`;
  }

  return words + ' Only';
}

// Convert numbers to Persian words
export function numberToPersianWords(amount: number, currency: string = 'USD'): string {
  if (isNaN(amount) || amount === 0) return 'صفر';

  const units = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه',
    'ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const hundreds = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const scales = ['', 'هزار', 'میلیون', 'میلیارد'];

  function convertGroup(num: number): string {
    const parts: string[] = [];
    const h = Math.floor(num / 100);
    const rem = num % 100;

    if (h > 0) parts.push(hundreds[h]);

    if (rem > 0) {
      if (rem < 20) {
        parts.push(units[rem]);
      } else {
        const t = Math.floor(rem / 10);
        const u = rem % 10;
        if (t > 0) parts.push(tens[t]);
        if (u > 0) parts.push(units[u]);
      }
    }
    return parts.join(' و ');
  }

  const integerPart = Math.floor(Math.abs(amount));
  let currentNum = integerPart;
  const groups: string[] = [];
  let scaleIndex = 0;

  if (currentNum === 0) {
    groups.push('صفر');
  } else {
    while (currentNum > 0) {
      const val = currentNum % 1000;
      if (val !== 0) {
        const text = convertGroup(val);
        const scale = scales[scaleIndex];
        groups.unshift(scale ? `${text} ${scale}` : text);
      }
      currentNum = Math.floor(currentNum / 1000);
      scaleIndex++;
    }
  }

  const currencyNamesFa: Record<string, string> = {
    USD: 'دلار آمریکا',
    EUR: 'یورو',
    AED: 'درهم امارات',
    CNY: 'یوآن چین',
    GBP: 'پوند انگلیس',
    TRY: 'لیر ترکیه',
    RUB: 'روبل روسیه',
    IRR: 'ریال',
  };

  const currFa = currencyNamesFa[currency] || currency;
  return `${groups.join(' و ')} ${currFa}`;
}

export const COMMON_UNITS = [
  { value: 'PCS', label: 'Pieces (عدد / قطعه)' },
  { value: 'KGS', label: 'Kilograms (کیلوگرم)' },
  { value: 'MT', label: 'Metric Tons (تن متریک)' },
  { value: 'CTN', label: 'Cartons (کارتن)' },
  { value: 'SET', label: 'Sets (مجموعه / ست)' },
  { value: 'MTR', label: 'Meters (متر)' },
  { value: 'LTR', label: 'Liters (لیتر)' },
  { value: 'DRUM', label: 'Drums (بشکه)' },
  { value: 'BAG', label: 'Bags (کیسه)' },
  { value: 'ROLL', label: 'Rolls (رول)' },
  { value: 'PAIRS', label: 'Pairs (جفت)' },
];

export const PACKAGE_TYPES = [
  'Cartons (کارتن)',
  'Pallets (پالت چوبی/پلاستیکی)',
  'Wooden Crates (جعبه چوبی)',
  'Steel Drums (بشکه فلزی)',
  'PP Bags (کیسه پلی‌پروپیلن)',
  'Bundles (بسته / بندل)',
  'Rolls (رول)',
  'Bulk (فله)'
];

export const COMMON_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', fa: 'دلار آمریکا' },
  { code: 'EUR', symbol: '€', name: 'Euro', fa: 'یورو' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', fa: 'درهم امارات' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', fa: 'یوآن چین' },
  { code: 'GBP', symbol: '£', name: 'British Pound', fa: 'پوند انگلیس' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', fa: 'لیر ترکیه' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', fa: 'روبل روسیه' },
];

export const INCOTERMS_LIST = [
  { code: 'FOB', name: 'Free on Board', category: 'Sea/Inland' },
  { code: 'CIF', name: 'Cost, Insurance and Freight', category: 'Sea/Inland' },
  { code: 'CFR', name: 'Cost and Freight', category: 'Sea/Inland' },
  { code: 'EXW', name: 'Ex Works', category: 'Any Mode' },
  { code: 'FCA', name: 'Free Carrier', category: 'Any Mode' },
  { code: 'CIP', name: 'Carriage and Insurance Paid To', category: 'Any Mode' },
  { code: 'CPT', name: 'Carriage Paid To', category: 'Any Mode' },
  { code: 'DAP', name: 'Delivered at Place', category: 'Any Mode' },
  { code: 'DPU', name: 'Delivered at Place Unloaded', category: 'Any Mode' },
  { code: 'DDP', name: 'Delivered Duty Paid', category: 'Any Mode' },
];

// Pre-configured Industry Sample Templates
export const SAMPLE_TEMPLATES: Record<string, ProformaInvoiceData> = {
  pistachio_export: {
    id: 'sample_pistachio',
    title: 'صادرات پسته ممتاز به آلمان (FOB بندرعباس)',
    docType: 'PROFORMA_INVOICE',
    invoiceNumber: 'PI-2026-EXP-084',
    date: '2026-10-01',
    validUntil: '2026-10-21',
    orderReference: 'PO-HAMBURG-9921',
    seller: {
      companyName: 'Arya Persian Pistachio & Dried Fruits Ltd.',
      contactPerson: 'Mr. Alireza Rahimi (Export Director)',
      address: 'No. 45, Commerce Tower, Beheshti Ave, Tehran, Iran',
      cityCountry: 'Tehran, Iran',
      phone: '+98 21 8877 6655',
      email: 'export@aryadriedfruits.com',
      taxOrVatId: 'IR-41129847120',
      commercialRegNo: 'CR-102948',
    },
    buyer: {
      companyName: 'Hanseatic Trade & Food Import GmbH',
      contactPerson: 'Herr Lukas Weber (Procurement Manager)',
      address: 'Am Sandtorkai 48, Speicherstadt, 20457 Hamburg',
      cityCountry: 'Hamburg, Germany',
      phone: '+49 40 3344 5566',
      email: 'weber@hanseatic-trade.de',
      taxOrVatId: 'DE 294819204',
      commercialRegNo: 'HRB 124890 Hamburg',
    },
    notifyParty: {
      companyName: 'Kuehne + Nagel Logistics Hamburg',
      contactPerson: 'Customs Clearance Desk',
      address: 'Grosser Grasbrook 11-13, 20457 Hamburg',
      cityCountry: 'Hamburg, Germany',
      phone: '+49 40 3010 0',
      email: 'hamburg.import@kuehne-nagel.com',
    },
    countryOfOrigin: 'Iran (Islamic Republic of)',
    countryOfDestination: 'Germany',
    portOfLoading: 'Bandar Abbas Port, Iran',
    portOfDischarge: 'Hamburg Seaport, Germany',
    finalDestination: 'Hamburg Warehouse, Germany',
    incoterm: 'FOB',
    namedPlace: 'Bandar Abbas Port',
    currency: 'EUR',
    paymentTerms: '30% T/T Advance upon PI confirmation, 70% against original Bill of Lading & SGS Certificate copy.',
    deliveryTime: 'Within 20 calendar days after receipt of advance deposit.',
    shippingMarks: 'M/N: HANSEATIC-HAMBURG / C/NO: 1-1000 / NET: 10 KG / MADE IN IRAN / AFLATOXIN TESTED',
    partialShipment: 'NOT_ALLOWED',
    transhipment: 'ALLOWED',
    items: [
      {
        id: 'item_1',
        itemNo: 1,
        hsCode: '0802.51.00',
        description: 'Natural Raw Pistachio In Shell - Fandoghi Round Grade (28/30)',
        specification: 'Crop 2026, Moisture max 5%, Aflatoxin B1 max 2ppb, Total max 4ppb according to EU standard',
        quantity: 10000,
        unit: 'KGS',
        unitPrice: 8.50,
        totalPrice: 85000,
        packageCount: 1000,
        packageType: 'Cartons (10kg vacuum)',
        netWeightPerUnitKg: 10,
        grossWeightPerUnitKg: 10.8,
        lengthCm: 40,
        widthCm: 30,
        heightCm: 25,
      },
      {
        id: 'item_2',
        itemNo: 2,
        hsCode: '0802.52.00',
        description: 'Super Long Akbari Pistachio - In Shell (20/22)',
        specification: 'First Quality Hand-Picked, Mechanically Opened max 2%, Color Natural',
        quantity: 5000,
        unit: 'KGS',
        unitPrice: 11.20,
        totalPrice: 56000,
        packageCount: 500,
        packageType: 'Cartons (10kg vacuum)',
        netWeightPerUnitKg: 10,
        grossWeightPerUnitKg: 10.8,
        lengthCm: 40,
        widthCm: 30,
        heightCm: 25,
      }
    ],
    discountPercentage: 2,
    freightCharge: 0,
    insuranceCharge: 0,
    otherCharges: 450, // Phytosanitary & Chamber Certificate fee
    specialNotes: [
      'Original Phytosanitary Certificate issued by National Plant Protection Organization (NPPO) included.',
      'SGS Pre-shipment Inspection Certificate for Aflatoxin and Heavy Metals required prior to loading.',
      'Fumigation certificate and Certificate of Origin attested by Chamber of Commerce.',
      'Goods packed in food-grade plastic inner bags and corrugated outer master cartons.'
    ],
    bankDetails: {
      beneficiaryName: 'Arya Persian Pistachio & Dried Fruits Ltd.',
      bankName: 'Emirates NBD Bank PJSC',
      bankAddress: 'Baniyas Road, Deira, P.O. Box 777, Dubai, United Arab Emirates',
      accountNumberOrIban: 'AE440260000123456789012',
      swiftBic: 'EBILAEADXXX',
      currency: 'EUR',
      routingCode: '026',
    },
    authorizedSignatoryName: 'Alireza Rahimi',
    authorizedSignatoryTitle: 'Managing Director & Export Head',
  },

  electronics_import: {
    id: 'sample_electronics',
    title: 'واردات قطعات الکترونیک و بردهای SMD از شنژن چین (FCA Shenzhen)',
    docType: 'PROFORMA_INVOICE',
    invoiceNumber: 'SZ-DIGI-2026-0412',
    date: '2026-10-01',
    validUntil: '2026-10-15',
    orderReference: 'RFQ-TEH-MICRO-440',
    seller: {
      companyName: 'Shenzhen MicroCore Electronics Technology Co., Ltd.',
      contactPerson: 'Ms. Kelly Zhang (Global Sales Director)',
      address: 'Building 4, High-Tech Industrial Park, Nanshan District, Shenzhen, China',
      cityCountry: 'Shenzhen, Guangdong, China',
      phone: '+86 755 8899 1122',
      email: 'sales@microcore-tech.cn',
      taxOrVatId: '91440300MA5EXXX99',
      commercialRegNo: 'CN-SHENZHEN-440300',
    },
    buyer: {
      companyName: 'Novin Smart Hardware Solutions Ltd.',
      contactPerson: 'Eng. Reza Hosseini',
      address: 'Pardis Technology Park, Innovation Blvd, Tehran, Iran',
      cityCountry: 'Tehran, Iran',
      phone: '+98 21 7625 0000',
      email: 'procurement@novinsmart.ir',
      taxOrVatId: 'IR-41130987112',
      commercialRegNo: 'CR-58921',
    },
    countryOfOrigin: 'China',
    countryOfDestination: 'United Arab Emirates / Iran',
    portOfLoading: 'Shenzhen Baoan International Airport / Yantian Port',
    portOfDischarge: 'Dubai International Airport (DXB)',
    finalDestination: 'Jebel Ali Free Zone, Dubai',
    incoterm: 'FCA',
    namedPlace: 'Shenzhen Carrier Hub',
    currency: 'USD',
    paymentTerms: '100% T/T Wire Transfer prior to warehouse dispatch.',
    deliveryTime: 'Ready for delivery within 7 working days from payment confirmation.',
    shippingMarks: 'SIDE MARK: NOVINTEL / CARTON NO: 1 TO 35 / FRAGILE - HANDLE WITH CARE / ESD SENSITIVE',
    partialShipment: 'ALLOWED',
    transhipment: 'ALLOWED',
    items: [
      {
        id: 'item_el_1',
        itemNo: 1,
        hsCode: '8542.31.00',
        description: 'ARM Cortex-M4 Microcontroller IC 32-Bit LQFP-64 Package',
        specification: 'Industrial Temp -40C to +105C, 168MHz, 1MB Flash, Tape & Reel Packaging (Original New)',
        quantity: 5000,
        unit: 'PCS',
        unitPrice: 4.85,
        totalPrice: 24250,
        packageCount: 5,
        packageType: 'Cartons (Reel)',
        netWeightPerUnitKg: 3.2,
        grossWeightPerUnitKg: 3.8,
        lengthCm: 35,
        widthCm: 35,
        heightCm: 15,
      },
      {
        id: 'item_el_2',
        itemNo: 2,
        hsCode: '8534.00.00',
        description: 'Multi-layer Printed Circuit Boards (4-Layer FR4 TG150, ENIG Finish)',
        specification: 'IPC Class 2 Standard, 100% AOI & Flying Probe Tested, RoHS Compliant',
        quantity: 2000,
        unit: 'PCS',
        unitPrice: 3.15,
        totalPrice: 6300,
        packageCount: 10,
        packageType: 'Cartons (Vacuum sealed with desiccant)',
        netWeightPerUnitKg: 5.5,
        grossWeightPerUnitKg: 6.2,
        lengthCm: 45,
        widthCm: 32,
        heightCm: 22,
      },
      {
        id: 'item_el_3',
        itemNo: 3,
        hsCode: '8517.62.00',
        description: 'Industrial IoT Gateway Modems (Cat-M1 / NB-IoT / GNSS)',
        specification: 'Aluminum housing, SMA antenna connector, RS485/Modbus interface, CE Certified',
        quantity: 300,
        unit: 'PCS',
        unitPrice: 38.00,
        totalPrice: 11400,
        packageCount: 20,
        packageType: 'Cartons (Individual box packing)',
        netWeightPerUnitKg: 4.8,
        grossWeightPerUnitKg: 5.6,
        lengthCm: 50,
        widthCm: 40,
        heightCm: 30,
      }
    ],
    discountPercentage: 0,
    freightCharge: 0,
    insuranceCharge: 0,
    otherCharges: 120, // Export documentation & customs clearance fee in Shenzhen
    specialNotes: [
      'All semiconductor items guaranteed 100% Brand New and Original with Certificate of Conformity (CoC).',
      'Electronic sensitive components packed with Anti-Static (ESD) shielding and moisture barrier bags.',
      'Commercial Invoice and Packing List 3 original copies provided inside master carton #1.'
    ],
    bankDetails: {
      beneficiaryName: 'Shenzhen MicroCore Electronics Technology Co., Ltd.',
      bankName: 'HSBC Bank (China) Company Limited, Shenzhen Branch',
      bankAddress: '18/F, China Resources Building, 5001 Shennan Dong Road, Shenzhen, China',
      accountNumberOrIban: '012-789456-001',
      swiftBic: 'HSBCCNBSZHE',
      currency: 'USD',
      routingCode: 'CH5544',
    },
    authorizedSignatoryName: 'Kelly Zhang',
    authorizedSignatoryTitle: 'Export Operations Director',
  },

  petrochem_export: {
    id: 'sample_petrochem',
    title: 'صادرات پلی‌اتیلن سنگین (HDPE) به ترکیه (CFR استانبول)',
    docType: 'PROFORMA_INVOICE',
    invoiceNumber: 'EXP-PETRO-2026-118',
    date: '2026-10-01',
    validUntil: '2026-10-10',
    orderReference: 'TURK-PLAST-PO-550',
    seller: {
      companyName: 'Persian Gulf Petrochemical Trading Co.',
      contactPerson: 'Farhad Moradi (Commercial Manager)',
      address: 'Unit 12, Mellat Tower, Vali-e-Asr St, Tehran, Iran',
      cityCountry: 'Tehran, Iran',
      phone: '+98 21 2200 4455',
      email: 'sales@pgpetrochem.com',
      taxOrVatId: 'IR-41100982341',
    },
    buyer: {
      companyName: 'Anadolu Polimer ve Plastik Sanayi A.Ş.',
      contactPerson: 'Murat Yılmaz (Satınalma Müdürü)',
      address: 'Organize Sanayi Bölgesi, 3. Cadde No: 18, Beylikdüzü, Istanbul',
      cityCountry: 'Istanbul, Turkey',
      phone: '+90 212 875 4400',
      email: 'murat.yilmaz@anadolupolimer.com.tr',
      taxOrVatId: 'TR-1029384756',
    },
    countryOfOrigin: 'Iran (Islamic Republic of)',
    countryOfDestination: 'Turkey',
    portOfLoading: 'Bandar Imam Khomeini (BIK) / Bazargan Border',
    portOfDischarge: 'Ambarli Port, Istanbul, Turkey',
    finalDestination: 'Istanbul Factory Warehouse, Turkey',
    incoterm: 'CFR',
    namedPlace: 'Ambarli Port, Istanbul',
    currency: 'EUR',
    paymentTerms: '20% Advance via Bank Transfer, 80% CAD (Cash Against Documents) via Ziraat Bankası.',
    deliveryTime: 'Ready for loading within 15 days upon advance payment.',
    shippingMarks: 'ANADOLU PLASTIK / HDPE BLOW MOLDING GRADE 0035 / 25 KG NET / LOT NO: 202610 / MADE IN IRAN',
    partialShipment: 'ALLOWED',
    transhipment: 'NOT_ALLOWED',
    items: [
      {
        id: 'item_pet_1',
        itemNo: 1,
        hsCode: '3901.20.00',
        description: 'High Density Polyethylene (HDPE) - Blow Molding Grade BL3 (0035)',
        specification: 'MFI: 0.35 g/10min, Density: 0.954 g/cm3, Virgin granules for bottles and containers',
        quantity: 50,
        unit: 'MT',
        unitPrice: 1120.00,
        totalPrice: 56000,
        packageCount: 2000,
        packageType: 'PP Bags (25kg pallets)',
        netWeightPerUnitKg: 25,
        grossWeightPerUnitKg: 25.15,
        lengthCm: 60,
        widthCm: 45,
        heightCm: 15,
      }
    ],
    discountPercentage: 0,
    freightCharge: 3800,
    insuranceCharge: 0, // In CFR buyer arranges insurance
    otherCharges: 0,
    specialNotes: [
      'Certificate of Analysis (COA) per each production batch provided.',
      'Goods palletized on fumigated wooden pallets (1 MT per pallet) and shrink-wrapped with waterproof plastic.',
      'Customs inspection at Bazargan border / Gürbulak included.'
    ],
    bankDetails: {
      beneficiaryName: 'Persian Gulf Petrochemical Trading Co.',
      bankName: 'Halkbank A.Ş., Istanbul Main Branch',
      bankAddress: 'Barbaros Bulvarı No: 125, Beşiktaş, Istanbul, Turkey',
      accountNumberOrIban: 'TR56 0001 2009 8760 0001 2345 67',
      swiftBic: 'TRHBTRISXXX',
      currency: 'EUR',
    },
    authorizedSignatoryName: 'Farhad Moradi',
    authorizedSignatoryTitle: 'Commercial & Export Vice President',
  },

  blank_slate: {
    id: 'sample_blank',
    title: 'پیش‌فاکتور جدید و خام (تکمیل دستی توسط تاجر)',
    docType: 'PROFORMA_INVOICE',
    invoiceNumber: `PI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    orderReference: '',
    seller: {
      companyName: 'Your Company Name / نام شرکت شما',
      contactPerson: 'Mr. / Ms. Manager',
      address: 'Street, District, City',
      cityCountry: 'City, Country',
      phone: '+98 ...',
      email: 'info@yourcompany.com',
      taxOrVatId: '',
      commercialRegNo: '',
    },
    buyer: {
      companyName: 'Buyer Company Name / نام شرکت خریدار',
      contactPerson: 'Purchasing Manager',
      address: 'Buyer Address, City',
      cityCountry: 'Buyer Country',
      phone: '+1 ...',
      email: 'buyer@example.com',
      taxOrVatId: '',
      commercialRegNo: '',
    },
    countryOfOrigin: 'Iran',
    countryOfDestination: 'United Arab Emirates',
    portOfLoading: 'Bandar Abbas',
    portOfDischarge: 'Jebel Ali, Dubai',
    finalDestination: 'Dubai, UAE',
    incoterm: 'FOB',
    namedPlace: 'Bandar Abbas Port',
    currency: 'USD',
    paymentTerms: '30% T/T in advance, 70% against Bill of Lading copy.',
    deliveryTime: 'Within 15 days after confirmation of payment.',
    shippingMarks: 'M/N: ORDER-01 / CARTON: 1-100 / MADE IN IRAN',
    partialShipment: 'ALLOWED',
    transhipment: 'ALLOWED',
    items: [
      {
        id: 'item_new_1',
        itemNo: 1,
        hsCode: '0000.00.00',
        description: 'Item Description / شرح و مشخصات کالا',
        specification: 'Standard specifications, Grade A',
        quantity: 100,
        unit: 'PCS',
        unitPrice: 50.00,
        totalPrice: 5000,
        packageCount: 10,
        packageType: 'Cartons (کارتن)',
        netWeightPerUnitKg: 10,
        grossWeightPerUnitKg: 11,
        lengthCm: 40,
        widthCm: 30,
        heightCm: 20,
      }
    ],
    discountPercentage: 0,
    freightCharge: 0,
    insuranceCharge: 0,
    otherCharges: 0,
    specialNotes: [
      'Goods will be inspected prior to shipment.',
      'All original documents will be dispatched via express international courier.'
    ],
    bankDetails: {
      beneficiaryName: 'Your Beneficiary Name',
      bankName: 'Your International Bank Name',
      bankAddress: 'Bank Branch Address',
      accountNumberOrIban: 'IBAN / Account Number',
      swiftBic: 'SWIFT / BIC Code',
      currency: 'USD',
    },
    authorizedSignatoryName: 'Authorized Person',
    authorizedSignatoryTitle: 'Export Director',
  }
};
