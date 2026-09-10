export interface IncotermDefinition {
  code: 'EXW' | 'FCA' | 'FAS' | 'FOB' | 'CFR' | 'CIF' | 'CPT' | 'CIP' | 'DAP' | 'DPU' | 'DDP';
  nameEn: string;
  nameFa: string;
  category: 'Any Mode (Multimodal)' | 'Sea & Inland Waterway';
  categoryFa: 'تمام شیوه‌های حمل (چندوجهی)' | 'صرفاً حمل دریایی و آبراه‌ها';
  riskTransferEn: string;
  riskTransferFa: string;
  buyerObligationsFa: string[];
  sellerObligationsFa: string[];
  summaryFa: string;
  proTipFa: string;
  // Matrix of costs paid by Seller (true = Seller, false = Buyer)
  costs: {
    packaging: boolean;
    loadingOrigin: boolean;
    inlandOrigin: boolean;
    exportCustoms: boolean;
    thcOrigin: boolean;
    internationalFreight: boolean;
    marineInsurance: boolean;
    thcDestination: boolean;
    importCustomsDuty: boolean;
    inlandDestination: boolean;
    unloadingDestination: boolean;
  };
}

export const INCOTERMS_2020_RULES: IncotermDefinition[] = [
  {
    code: 'EXW',
    nameEn: 'Ex Works',
    nameFa: 'تحویل در محل کار / کارخانه مبدأ',
    category: 'Any Mode (Multimodal)',
    categoryFa: 'تمام شیوه‌های حمل (چندوجهی)',
    riskTransferEn: 'When goods are made available at seller premises (not loaded).',
    riskTransferFa: 'در انبار یا کارخانه فروشنده، پیش از بارگیری روی وسیله نقلیه.',
    sellerObligationsFa: ['تأمین کالا و بسته‌بندی مناسب صادراتی'],
    buyerObligationsFa: [
      'بارگیری در محل کارخانه فروشنده',
      'حمل داخلی در کشور مبدأ تا بندر یا فرودگاه',
      'تشریفات گمرکی صادرات و ترخیص مبدأ',
      'کرایه حمل بین‌المللی',
      'بیمه حمل بار',
      'ترخیص واردات در مقصد و پرداخت حقوق گمرکی',
      'حمل داخلی تا انبار نهایی'
    ],
    summaryFa: 'حداقل تعهد برای فروشنده و حداکثر تعهد برای خریدار. خریدار باید توانایی حقوقی ترخیص صادراتی در کشور فروشنده را داشته باشد.',
    proTipFa: 'توصیه اتاق بازرگانی: اگر خریدار نمی‌تواند تشریفات گمرکی خروج در کشور مبدأ را مستقیماً انجام دهد، از ترم FCA استفاده کنید نه EXW.',
    costs: {
      packaging: true,
      loadingOrigin: false,
      inlandOrigin: false,
      exportCustoms: false,
      thcOrigin: false,
      internationalFreight: false,
      marineInsurance: false,
      thcDestination: false,
      importCustomsDuty: false,
      inlandDestination: false,
      unloadingDestination: false,
    }
  },
  {
    code: 'FCA',
    nameEn: 'Free Carrier',
    nameFa: 'تحویل به حمل‌کننده در مبدأ',
    category: 'Any Mode (Multimodal)',
    categoryFa: 'تمام شیوه‌های حمل (چندوجهی)',
    riskTransferEn: 'When handed over to buyer\'s carrier at named place after export clearance.',
    riskTransferFa: 'هنگام تحویل کالا به متصدی حمل معرفی‌شده توسط خریدار پس از ترخیص صادراتی.',
    sellerObligationsFa: [
      'بسته‌بندی و نشانه‌گذاری صادراتی',
      'بارگیری روی وسیله نقلیه خریدار (اگر در محل کارخانه فروشنده باشد)',
      'انجام کامل تشریفات گمرکی صادرات در کشور مبدأ'
    ],
    buyerObligationsFa: [
      'کرایه حمل اصلی بین‌المللی',
      'بیمه حمل و نقل',
      'تخلیه و بارگیری در ترمینال‌های میانی',
      'ترخیص وارداتی و پرداخت حقوق گمرکی مقصد',
      'حمل داخلی تا انبار مقصد'
    ],
    summaryFa: 'انعطاف‌پذیرترین ترم در اینکوترمز ۲۰۲۰ و جایگزین مدرن و ایمن FOB برای حمل‌ونقل کانتینری و هوایی.',
    proTipFa: 'در اینکوترمز ۲۰۲۰، ترم FCA به طرفین اجازه می‌دهد بارنامه دریایی با قید بارگیری شده (On-Board B/L) برای وصول اسناد بانکی L/C صادر شود.',
    costs: {
      packaging: true,
      loadingOrigin: true,
      inlandOrigin: true,
      exportCustoms: true,
      thcOrigin: false,
      internationalFreight: false,
      marineInsurance: false,
      thcDestination: false,
      importCustomsDuty: false,
      inlandDestination: false,
      unloadingDestination: false,
    }
  },
  {
    code: 'FAS',
    nameEn: 'Free Alongside Ship',
    nameFa: 'تحویل در کنار کشتی در بندر مبدأ',
    category: 'Sea & Inland Waterway',
    categoryFa: 'صرفاً حمل دریایی و آبراه‌ها',
    riskTransferEn: 'When goods are placed alongside the vessel nominated by buyer.',
    riskTransferFa: 'وقتی کالا در اسکله یا بارج در کنار کشتی خریدار قرار می‌گیرد.',
    sellerObligationsFa: ['حمل داخلی تا اسکله بندر مبدا', 'ترخیص گمرکی صادرات'],
    buyerObligationsFa: ['بارگیری به روی عرشه کشتی', 'کرایه حمل دریایی', 'بیمه بار', 'ترخیص در مقصد'],
    summaryFa: 'مخصوص کالاهای فله‌ای (Bulk Cargo) مانند سنگ آهن، غلات یا مواد معدنی بدون کانتینر.',
    proTipFa: 'برای کالاهای کانتینری نباید استفاده شود زیرا کانتینرها به ترمینال تحویل می‌شوند نه مستقیم در کنار کشتی.',
    costs: {
      packaging: true,
      loadingOrigin: true,
      inlandOrigin: true,
      exportCustoms: true,
      thcOrigin: false,
      internationalFreight: false,
      marineInsurance: false,
      thcDestination: false,
      importCustomsDuty: false,
      inlandDestination: false,
      unloadingDestination: false,
    }
  },
  {
    code: 'FOB',
    nameEn: 'Free on Board',
    nameFa: 'تحویل روی عرشه کشتی در بندر مبدأ',
    category: 'Sea & Inland Waterway',
    categoryFa: 'صرفاً حمل دریایی و آبراه‌ها',
    riskTransferEn: 'When goods pass over the ship\'s rail and are safely loaded on board.',
    riskTransferFa: 'لحظه‌ای که کالا کاملاً روی عرشه کشتی بارگیری و مهار شد.',
    sellerObligationsFa: [
      'هزینه بسته‌بندی صادراتی',
      'حمل داخلی مبدأ به بندر',
      'ترخیص گمرکی صادرات',
      'هزینه‌های بارگیری روی عرشه کشتی (THC Origin / Loading)'
    ],
    buyerObligationsFa: [
      'انتخاب خط کشتیرانی و رزرو فضا',
      'پرداخت کرایه حمل دریایی (Ocean Freight)',
      'بیمه دریایی بار',
      'تخلیه در بندر مقصد (THC Destination)',
      'ترخیص وارداتی، حقوق گمرکی و مالیات واردات'
    ],
    summaryFa: 'محبوب‌ترین ترم تاریخی در تجارت بین‌الملل، اما فقط برای حمل دریایی سنتی و کالاهای فله/پروژه‌ای.',
    proTipFa: 'خطای رایج بازرگانان: اگر بار کانتینری است، به جای FOB حتماً FCA قرارداد ببندید، زیرا در صورت بروز حادثه در محوطه ترمینال پیش از بارگیری روی کشتی، مسئولیت حقوقی دچار تعارض می‌شود.',
    costs: {
      packaging: true,
      loadingOrigin: true,
      inlandOrigin: true,
      exportCustoms: true,
      thcOrigin: true,
      internationalFreight: false,
      marineInsurance: false,
      thcDestination: false,
      importCustomsDuty: false,
      inlandDestination: false,
      unloadingDestination: false,
    }
  },
  {
    code: 'CFR',
    nameEn: 'Cost and Freight',
    nameFa: 'ارزش و کرایه حمل تا بندر مقصد',
    category: 'Sea & Inland Waterway',
    categoryFa: 'صرفاً حمل دریایی و آبراه‌ها',
    riskTransferEn: 'Risk passes on board at origin, but seller pays freight to destination.',
    riskTransferFa: 'ریسک به محض بارگیری در مبدأ به خریدار منتقل می‌شود، اما هزینه کرایه حمل تا بندر مقصد با فروشنده است.',
    sellerObligationsFa: [
      'ترخیص صادراتی',
      'بارگیری روی کشتی',
      'پرداخت کرایه حمل دریایی تا بندر مقصد'
    ],
    buyerObligationsFa: [
      'خرید بیمه‌نامه دریایی (ریسک مسیر با خریدار است)',
      'هزینه تخلیه بندر مقصد (مگر در قرارداد کرایه لحاظ شده باشد)',
      'ترخیص گمرکی واردات و حقوق ورودی'
    ],
    summaryFa: 'فروشنده کرایه حمل را متقبل می‌شود ولی ریسک غرق شدن یا خسارت مسیر در دریا به عهده خریدار است.',
    proTipFa: 'به محض تحویل بار در مبدأ، خریدار باید تاریخ بارگیری را بداند تا پوشش بیمه دریایی معتبر شود.',
    costs: {
      packaging: true,
      loadingOrigin: true,
      inlandOrigin: true,
      exportCustoms: true,
      thcOrigin: true,
      internationalFreight: true,
      marineInsurance: false,
      thcDestination: false,
      importCustomsDuty: false,
      inlandDestination: false,
      unloadingDestination: false,
    }
  },
  {
    code: 'CIF',
    nameEn: 'Cost, Insurance and Freight',
    nameFa: 'ارزش، بیمه و کرایه حمل تا بندر مقصد',
    category: 'Sea & Inland Waterway',
    categoryFa: 'صرفاً حمل دریایی و آبراه‌ها',
    riskTransferEn: 'Risk passes when loaded at origin port; seller covers marine insurance to destination.',
    riskTransferFa: 'انتقال ریسک روی عرشه در مبدأ انجام می‌شود؛ اما فروشنده بیمه دریایی (حداقل کلوز C) و کرایه حمل تا مقصد را می‌پردازد.',
    sellerObligationsFa: [
      'ترخیص کامل صادرات',
      'پرداخت کرایه حمل دریایی تا بندر تخلیه',
      'خرید بیمه‌نامه دریایی بین‌المللی حداقل با پوشش ۱۱۰٪ ارزش کالا'
    ],
    buyerObligationsFa: [
      'هزینه‌های تخلیه در بندر مقصد (THC Destination)',
      'ترخیص واردات در گمرک مقصد',
      'پرداخت سود بازرگانی، حقوق ورودی و مالیات ارزش افزوده',
      'حمل زمینی از بندر به انبار'
    ],
    summaryFa: 'رایج‌ترین ترم برای خریداران کالاهای فله و عمومی که مایلند فروشنده وظیفه حمل و بیمه تا بندر آنها را تقبل کند.',
    proTipFa: 'طبق اینکوترمز ۲۰۲۰، در ترم CIF الزام فروشنده تنها ارائه حداقل پوشش بیمه‌ای (کلوز C) است؛ خریدار در صورت تمایل باید کلوز A را با هزینه خود توافق کند.',
    costs: {
      packaging: true,
      loadingOrigin: true,
      inlandOrigin: true,
      exportCustoms: true,
      thcOrigin: true,
      internationalFreight: true,
      marineInsurance: true,
      thcDestination: false,
      importCustomsDuty: false,
      inlandDestination: false,
      unloadingDestination: false,
    }
  },
  {
    code: 'CPT',
    nameEn: 'Carriage Paid To',
    nameFa: 'کرایه حمل پرداخت‌شده تا مقصد معین',
    category: 'Any Mode (Multimodal)',
    categoryFa: 'تمام شیوه‌های حمل (چندوجهی)',
    riskTransferEn: 'Risk passes when goods handed to first carrier; seller pays transport to destination.',
    riskTransferFa: 'ریسک خسارت هنگام تحویل به اولین متصدی حمل در مبدأ منتقل می‌شود؛ ولی هزینه حمل تا مقصد توافق‌شده با فروشنده است.',
    sellerObligationsFa: ['ترخیص صادراتی', 'هزینه ترانزیت و حمل تا نقطه توافق‌شده در کشور مقصد'],
    buyerObligationsFa: ['خرید بیمه حمل بار', 'ترخیص وارداتی و پرداخت حقوق گمرکی', 'تخلیه در مقصد'],
    summaryFa: 'معادل چندوجهی و کانتینری اصطلاح دریایی CFR.',
    proTipFa: 'مناسب برای حمل‌ونقل هوایی، جاده‌ای با تریلر (CMR) و حمل ترکیبی.',
    costs: {
      packaging: true,
      loadingOrigin: true,
      inlandOrigin: true,
      exportCustoms: true,
      thcOrigin: true,
      internationalFreight: true,
      marineInsurance: false,
      thcDestination: false,
      importCustomsDuty: false,
      inlandDestination: false,
      unloadingDestination: false,
    }
  },
  {
    code: 'CIP',
    nameEn: 'Carriage and Insurance Paid To',
    nameFa: 'کرایه و بیمه پرداخت‌شده تا مقصد معین',
    category: 'Any Mode (Multimodal)',
    categoryFa: 'تمام شیوه‌های حمل (چندوجهی)',
    riskTransferEn: 'Risk passes at first carrier; seller provides comprehensive Clause A insurance.',
    riskTransferFa: 'ریسک به اولین کریر منتقل می‌شود؛ اما فروشنده موظف به پرداخت کرایه و خرید بیمه جامع با بالاترین پوشش (کلوز A) است.',
    sellerObligationsFa: [
      'ترخیص صادرات',
      'کرایه حمل کامل تا مقصد تعیین‌شده',
      'خرید بیمه‌نامه تمام‌خطرات (Institute Cargo Clauses A) با پوشش ۱۱۰٪ ارزش'
    ],
    buyerObligationsFa: [
      'ترخیص گمرکی واردات',
      'پرداخت حقوق و عوارض گمرکی و مالیات',
      'تخلیه محموله در انبار مقصد'
    ],
    summaryFa: 'تغییر بزرگ ۲۰۲۰: برخلاف CIF که بیمه حداقلی (کلوز C) الزامی است، در ترم CIP فروشنده قانوناً ملزم به تهیه بیمه حداکثری (کلوز A) است.',
    proTipFa: 'برای کالاهای با ارزش بالا، تجهیزات پزشکی، الکترونیک و بارهای هوایی/کانتینری بهترین و امن‌ترین گزینه است.',
    costs: {
      packaging: true,
      loadingOrigin: true,
      inlandOrigin: true,
      exportCustoms: true,
      thcOrigin: true,
      internationalFreight: true,
      marineInsurance: true,
      thcDestination: true,
      importCustomsDuty: false,
      inlandDestination: false,
      unloadingDestination: false,
    }
  },
  {
    code: 'DAP',
    nameEn: 'Delivered at Place',
    nameFa: 'تحویل در محل مشخص در کشور مقصد (آماده تخلیه)',
    category: 'Any Mode (Multimodal)',
    categoryFa: 'تمام شیوه‌های حمل (چندوجهی)',
    riskTransferEn: 'When goods are placed at the disposal of buyer on arriving means of transport (ready for unloading).',
    riskTransferFa: 'روی وسیله نقلیه در محل مقرر مقصد، آماده تخلیه.',
    sellerObligationsFa: [
      'تمام هزینه‌ها و ریسک‌های حمل تا درب کارخانه یا انبار خریدار',
      'پوشش ریسک و بیمه مسیر تا رسیدن به مقصد'
    ],
    buyerObligationsFa: [
      'انجام تشریفات گمرکی واردات و پرداخت حقوق و عوارض گمرکی',
      'تخلیه فیزیکی بار از روی کامیون/کانتینر در انبار خود'
    ],
    summaryFa: 'فروشنده تا پشت درب انبار خریدار می‌آورد، اما مسئولیت پرداخت گمرک وارداتی با خود خریدار است.',
    proTipFa: 'بسیار پرطرفدار در تجارت زمینی و جاده‌ای بین کشورهای همسایه (مانند ترکیه، امارات، عراق).',
    costs: {
      packaging: true,
      loadingOrigin: true,
      inlandOrigin: true,
      exportCustoms: true,
      thcOrigin: true,
      internationalFreight: true,
      marineInsurance: true,
      thcDestination: true,
      importCustomsDuty: false,
      inlandDestination: true,
      unloadingDestination: false,
    }
  },
  {
    code: 'DPU',
    nameEn: 'Delivered at Place Unloaded',
    nameFa: 'تحویل در محل مقصد تخلیه‌شده',
    category: 'Any Mode (Multimodal)',
    categoryFa: 'تمام شیوه‌های حمل (چندوجهی)',
    riskTransferEn: 'When goods are unloaded from arriving transport at named destination.',
    riskTransferFa: 'پس از تخلیه فیزیکی کامل محموله در محل مقرر مقصد (تنها ترمی که تخلیه با فروشنده است).',
    sellerObligationsFa: [
      'تمام هزینه‌های حمل و بیمه تا مقصد',
      'تخلیه فیزیکی کانتینر یا وسیله نقلیه با جرثقیل و نیروی کار فروشنده'
    ],
    buyerObligationsFa: ['ترخیص وارداتی و پرداخت حقوق و سود گمرکی'],
    summaryFa: 'این ترم در ۲۰۲۰ جایگزین DAT شد و اجازه می‌دهد تحویل تخلیه‌شده در هر محلی (انبار یا ترمینال) انجام شود.',
    proTipFa: 'فروشنده تنها زمانی باید این ترم را بپذیرد که تجهیزات و امکانات فنی تخلیه در محل مقصد را داشته باشد.',
    costs: {
      packaging: true,
      loadingOrigin: true,
      inlandOrigin: true,
      exportCustoms: true,
      thcOrigin: true,
      internationalFreight: true,
      marineInsurance: true,
      thcDestination: true,
      importCustomsDuty: false,
      inlandDestination: true,
      unloadingDestination: true,
    }
  },
  {
    code: 'DDP',
    nameEn: 'Delivered Duty Paid',
    nameFa: 'تحویل در انبار مقصد با پرداخت حقوق گمرکی (تمام‌شده نهایی)',
    category: 'Any Mode (Multimodal)',
    categoryFa: 'تمام شیوه‌های حمل (چندوجهی)',
    riskTransferEn: 'When goods are placed at buyer disposal, cleared for import, duties and taxes paid.',
    riskTransferFa: 'در انبار خریدار، کاملاً ترخیص شده و تمام حقوق گمرکی و مالیات‌ها پرداخت شده.',
    sellerObligationsFa: [
      'همه چیز! حمل داخلی، ترخیص صادرات، کرایه بین‌المللی، بیمه، ترخیص واردات در کشور خریدار، پرداخت حقوق ورودی و مالیات بر ارزش افزوده'
    ],
    buyerObligationsFa: ['صرفاً تخلیه کالا از روی وسیله نقلیه در انبار خود'],
    summaryFa: 'حداکثر تعهد برای فروشنده. خریدار بدون هیچ دردسر گمرکی کالا را در انبار خود تحویل می‌گیرد (Landed Cost کامل).',
    proTipFa: 'فروشنده خارجی در صورتی می‌تواند DDP کار کند که ثبت شرکت محلی یا کارگزار گمرکی با کارت بازرگانی در کشور مقصد برای پرداخت مالیات داشته باشد.',
    costs: {
      packaging: true,
      loadingOrigin: true,
      inlandOrigin: true,
      exportCustoms: true,
      thcOrigin: true,
      internationalFreight: true,
      marineInsurance: true,
      thcDestination: true,
      importCustomsDuty: true,
      inlandDestination: true,
      unloadingDestination: false,
    }
  }
];

export interface TradeCorridor {
  id: string;
  nameEn: string;
  nameFa: string;
  originCountry: string;
  originFlag: string;
  originPort: string;
  destCountry: string;
  destFlag: string;
  destPort: string;
  mode: 'sea' | 'air' | 'road' | 'rail';
  modeFa: string;
  transitDays: number;
  rateFcl20ft: number; // USD
  rateFcl40ftHq: number; // USD
  rateLclPerCbm: number; // USD
  rateAirPerKg: number; // USD
  rateTruckTrailer?: number; // USD
  typicalThcOriginUsd: number;
  typicalThcDestUsd: number;
  reliabilityPct: number;
}

export const REAL_WORLD_CORRIDORS: TradeCorridor[] = [
  {
    id: 'sha-bnd',
    nameEn: 'Shanghai / Ningbo to Bandar Abbas (Iran)',
    nameFa: 'شانگهای / نینگبو به بندرعباس (شهید رجایی)',
    originCountry: 'China',
    originFlag: '🇨🇳',
    originPort: 'Shanghai / Ningbo Port',
    destCountry: 'Iran',
    destFlag: '🇮🇷',
    destPort: 'Bandar Abbas (Shahid Rajaee)',
    mode: 'sea',
    modeFa: 'دریایی کانتینری مستقیم / ترانشیپ',
    transitDays: 24,
    rateFcl20ft: 1450,
    rateFcl40ftHq: 2350,
    rateLclPerCbm: 65,
    rateAirPerKg: 4.3,
    typicalThcOriginUsd: 140,
    typicalThcDestUsd: 220,
    reliabilityPct: 94
  },
  {
    id: 'szx-dxb',
    nameEn: 'Shenzhen / Nansha to Dubai (Jebel Ali)',
    nameFa: 'شنژن / نانشا به دبی (جبل علی)',
    originCountry: 'China',
    originFlag: '🇨🇳',
    originPort: 'Shenzhen Yantian',
    destCountry: 'UAE',
    destFlag: '🇦🇪',
    destPort: 'Dubai (Jebel Ali DP World)',
    mode: 'sea',
    modeFa: 'دریایی کانتینری مستقیم',
    transitDays: 16,
    rateFcl20ft: 1100,
    rateFcl40ftHq: 1850,
    rateLclPerCbm: 50,
    rateAirPerKg: 3.6,
    typicalThcOriginUsd: 130,
    typicalThcDestUsd: 190,
    reliabilityPct: 98
  },
  {
    id: 'dxb-bnd',
    nameEn: 'Dubai (Jebel Ali) to Bandar Abbas (Feeder)',
    nameFa: 'دبی (جبل علی) به بندرعباس (فیدر دریایی خلیج فارس)',
    originCountry: 'UAE',
    originFlag: '🇦🇪',
    originPort: 'Dubai (Jebel Ali)',
    destCountry: 'Iran',
    destFlag: '🇮🇷',
    destPort: 'Bandar Abbas',
    mode: 'sea',
    modeFa: 'فیدر دریایی کوتاه',
    transitDays: 3,
    rateFcl20ft: 480,
    rateFcl40ftHq: 780,
    rateLclPerCbm: 35,
    rateAirPerKg: 1.8,
    typicalThcOriginUsd: 180,
    typicalThcDestUsd: 210,
    reliabilityPct: 96
  },
  {
    id: 'ist-thr',
    nameEn: 'Istanbul / Mersin to Tehran (Bazargan Border)',
    nameFa: 'استانبول / مرسین به تهران (گمرک بازرگان)',
    originCountry: 'Turkey',
    originFlag: '🇹🇷',
    originPort: 'Istanbul TIR Terminal',
    destCountry: 'Iran',
    destFlag: '🇮🇷',
    destPort: 'Tehran Customs / West Customs',
    mode: 'road',
    modeFa: 'جاده‌ای تریلر چادری (TIR / CMR)',
    transitDays: 5,
    rateFcl20ft: 1800,
    rateFcl40ftHq: 3200,
    rateLclPerCbm: 85,
    rateAirPerKg: 2.8,
    rateTruckTrailer: 3400,
    typicalThcOriginUsd: 90,
    typicalThcDestUsd: 140,
    reliabilityPct: 92
  },
  {
    id: 'bom-bnd',
    nameEn: 'Mumbai (Nhava Sheva) to Bandar Abbas',
    nameFa: 'بمبئی (نوا شوا هند) به بندرعباس',
    originCountry: 'India',
    originFlag: '🇮🇳',
    originPort: 'Jawaharlal Nehru (Nhava Sheva)',
    destCountry: 'Iran',
    destFlag: '🇮🇷',
    destPort: 'Bandar Abbas (Shahid Rajaee)',
    mode: 'sea',
    modeFa: 'دریایی مستقیم اقیانوس هند',
    transitDays: 6,
    rateFcl20ft: 750,
    rateFcl40ftHq: 1250,
    rateLclPerCbm: 40,
    rateAirPerKg: 2.9,
    typicalThcOriginUsd: 120,
    typicalThcDestUsd: 200,
    reliabilityPct: 95
  },
  {
    id: 'ham-bnd',
    nameEn: 'Hamburg / Rotterdam to Bandar Abbas',
    nameFa: 'هامبورگ / روتردام به بندرعباس',
    originCountry: 'Germany / Netherlands',
    originFlag: '🇪🇺',
    originPort: 'Rotterdam / Hamburg',
    destCountry: 'Iran',
    destFlag: '🇮🇷',
    destPort: 'Bandar Abbas',
    mode: 'sea',
    modeFa: 'دریایی دور دنیا / کانال سوئز',
    transitDays: 32,
    rateFcl20ft: 2200,
    rateFcl40ftHq: 3600,
    rateLclPerCbm: 95,
    rateAirPerKg: 5.4,
    typicalThcOriginUsd: 250,
    typicalThcDestUsd: 230,
    reliabilityPct: 90
  },
  {
    id: 'mow-anz',
    nameEn: 'Moscow / Astrakhan to Bandar Anzali / Amirabad',
    nameFa: 'مسکو / آستاراخان به بندر انزلی و امیرآباد (کاسپین)',
    originCountry: 'Russia',
    originFlag: '🇷🇺',
    originPort: 'Astrakhan Port (Volga)',
    destCountry: 'Iran',
    destFlag: '🇮🇷',
    destPort: 'Bandar Anzali / Amirabad',
    mode: 'sea',
    modeFa: 'کشتیرانی دریای خزر (فله / کانتینر)',
    transitDays: 9,
    rateFcl20ft: 1300,
    rateFcl40ftHq: 2100,
    rateLclPerCbm: 60,
    rateAirPerKg: 3.5,
    rateTruckTrailer: 3100,
    typicalThcOriginUsd: 110,
    typicalThcDestUsd: 130,
    reliabilityPct: 88
  },
  {
    id: 'sha-rot',
    nameEn: 'Shanghai to Rotterdam (Main Europe Hub)',
    nameFa: 'شانگهای به روتردام (هاب اصلی اروپای غربی)',
    originCountry: 'China',
    originFlag: '🇨🇳',
    originPort: 'Shanghai Port',
    destCountry: 'Netherlands',
    destFlag: '🇳🇱',
    destPort: 'Port of Rotterdam',
    mode: 'sea',
    modeFa: 'دریایی لاینر آسیا-اروپا',
    transitDays: 34,
    rateFcl20ft: 2400,
    rateFcl40ftHq: 3950,
    rateLclPerCbm: 85,
    rateAirPerKg: 5.8,
    typicalThcOriginUsd: 145,
    typicalThcDestUsd: 280,
    reliabilityPct: 95
  }
];

export interface InsuranceClauseInfo {
  clause: 'A' | 'B' | 'C';
  titleEn: string;
  titleFa: string;
  ratePct: number; // e.g. 0.40%
  coverageLevelFa: string;
  descriptionFa: string;
  recommendedForFa: string;
}

export const INSURANCE_CLAUSES: InsuranceClauseInfo[] = [
  {
    clause: 'A',
    titleEn: 'Institute Cargo Clauses (A) - All Risks',
    titleFa: 'کلوز A لندن (پوشش تمام خطرات - بالاترین سطح بیمه)',
    ratePct: 0.45,
    coverageLevelFa: 'پوشش جامع ۹۹٪ خطرات احتمالی (خسارت جزئی، کلی، سرقت، نم‌زدگی، ریزش، شکستگی)',
    descriptionFa: 'کامل‌ترین پوشش بیمه باربری دریایی بین‌المللی. خسارت‌های ناشی از تصادم، حریق، دزدی دریایی، غرق شدن، نفوذ آب دریا به انبار و خسارت‌های تخلیه را پوشش می‌دهد.',
    recommendedForFa: 'تجهیزات صنعتی، کالاهای حساس و الکترونیک، مواد غذایی بسته‌بندی و پوشاک با ارزش بالا.'
  },
  {
    clause: 'B',
    titleEn: 'Institute Cargo Clauses (B) - Major Named Risks',
    titleFa: 'کلوز B لندن (خطرات مشخص، زلزله، نفوذ آب و خسارت عام)',
    ratePct: 0.25,
    coverageLevelFa: 'پوشش خطرات اصلی به همراه نفوذ آب دریا/رودخانه و به دریا افتادن کالا',
    descriptionFa: 'پوشش متوسط شامل آتش‌سوزی، انفجار، غرق شدن، تصادف، واژگونی، زلزله، فوران آتشفشان، صاعقه، ورود آب و خسارت مشترک دریایی (General Average).',
    recommendedForFa: 'مواد شیمیایی، آهن‌آلات، مصالح ساختمانی، لاستیک و لوازم یدکی خودرو.'
  },
  {
    clause: 'C',
    titleEn: 'Institute Cargo Clauses (C) - Total Loss & Catastrophes',
    titleFa: 'کلوز C لندن (پوشش حداقلی - حریق، غرق شدن و خسارت کلی)',
    ratePct: 0.12,
    coverageLevelFa: 'حداقل پوشش مجاز بین‌المللی (صرفاً خسارت‌های کلی و فاجعه‌آمیز)',
    descriptionFa: 'صرفاً حوادث شدید و غیرمترقبه نظیر غرق شدن کامل کشتی، به گل نشستن، حریق یا انفجار و فدا کردن کالا در خسارت همگانی را پوشش می‌دهد و ریزش، خیس‌شدگی جزئی یا دزدی را پوشش نمی‌دهد.',
    recommendedForFa: 'کالاهای فله ارزان‌قیمت، مواد معدنی خام، قراضه آهن، سنگ‌آهن و سیمان فله.'
  }
];

export interface ContainerSpec {
  id: string;
  nameEn: string;
  nameFa: string;
  payloadKg: number;
  cbmVolume: number;
  suitableGoodsFa: string;
  freeDaysDefault: number;
}

export const CONTAINER_SPECS: ContainerSpec[] = [
  {
    id: '20ft',
    nameEn: '20ft General Purpose (Dry Van)',
    nameFa: 'کانتینر ۲۰ فوت استاندارد (TEU)',
    payloadKg: 21800,
    cbmVolume: 33.2,
    suitableGoodsFa: 'بارهای سنگین و متراکم (شیمیایی، کاشی، فلزات، حبوبات)',
    freeDaysDefault: 10
  },
  {
    id: '40ft_hq',
    nameEn: '40ft High Cube (HQ)',
    nameFa: 'کانتینر ۴۰ فوت های‌کیوب (سقف بلند)',
    payloadKg: 26500,
    cbmVolume: 76.4,
    suitableGoodsFa: 'بارهای حجیم با وزن متوسط (لوازم خانگی، مبلمان، پوشاک، قطعات)',
    freeDaysDefault: 14
  },
  {
    id: '40ft_dry',
    nameEn: '40ft Standard Dry',
    nameFa: 'کانتینر ۴۰ فوت استاندارد',
    payloadKg: 26700,
    cbmVolume: 67.7,
    suitableGoodsFa: 'کالاهای بسته‌بندی پالت‌شده استاندارد',
    freeDaysDefault: 14
  },
  {
    id: 'lcl',
    nameEn: 'LCL (Less than Container Load)',
    nameFa: 'خرده‌بار اشتراکی (LCL بر حسب CBM / تن)',
    payloadKg: 1000,
    cbmVolume: 1.0,
    suitableGoodsFa: 'محموله‌های آزمایشی، سمپل و حجم‌های کمتر از ۱۵ مترمکعب',
    freeDaysDefault: 7
  },
  {
    id: 'trailer',
    nameEn: 'Tilt / Box Road Trailer (TIR)',
    nameFa: 'تریلر ترانزیتی جاده‌ای (چادری ۹۲ مترمکعب)',
    payloadKg: 22000,
    cbmVolume: 92.0,
    suitableGoodsFa: 'حمل جاده‌ای مستقیم از ترکیه، اروپا و روسیه بدون دست‌خوردن بار',
    freeDaysDefault: 4
  }
];
