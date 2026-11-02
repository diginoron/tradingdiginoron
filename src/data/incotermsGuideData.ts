/**
 * Comprehensive Incoterms 2020 Master Guide Data
 * Grounded in Official ICC (International Chamber of Commerce) Standards
 */

export interface IncotermsUpdatePoint {
  id: string;
  titleEn: string;
  titleFa: string;
  badgeFa: string;
  impactLevel: 'critical' | 'high' | 'medium';
  summaryFa: string;
  summaryEn: string;
  before2020Fa: string;
  now2020Fa: string;
  practicalAdviceFa: string;
}

export const INCOTERMS_2020_KEY_CHANGES: IncotermsUpdatePoint[] = [
  {
    id: 'dpu_dat',
    titleEn: 'Replacement of DAT with DPU (Delivered at Place Unloaded)',
    titleFa: 'حذف ترم DAT و جایگزینی با ترم جدید DPU (تحویل در محل تخلیه‌شده)',
    badgeFa: 'تغییر نام و مفهوم اصلی',
    impactLevel: 'critical',
    summaryFa: 'ترم DAT (تحویل در ترمینال) حذف شده و جای آن را DPU گرفت. اکنون محل تحویل منحصر به ترمینال گمرکی یا بندری نیست و می‌تواند انبار، کارخانه خریدار یا هر سایت دیگری باشد، مشروط بر این‌که فروشنده وظیفه تخلیه کالا را بر عهده بگیرد.',
    summaryEn: 'DAT was renamed and expanded to DPU to emphasize that the destination can be any place (not just a terminal), provided the seller is able to unload the goods.',
    before2020Fa: 'در اینکوترمز ۲۰۱۰، ترم DAT تحویل را فقط در یک ترمینال بندری یا گمرکی مشخص (مانند محوطه کانتینری بندر یا فرودگاه) محدود می‌کرد.',
    now2020Fa: 'در اینکوترمز ۲۰۲۰، ترم DPU این آزادی را می‌دهد که محل تحویل هر جایی باشد (حتی محوطه احداث کارخانه یا انبار خریدار). اما توجه شود: DPU تنها قاعده‌ای از بین تمام ۱۱ قاعده است که در آن «فروشنده قانوناً موظف به تخلیه فیزیکی بار از وسیله نقلیه» در مقصد است.',
    practicalAdviceFa: 'هشدار مهم: فروشنده فقط زمانی باید DPU را قبول کند که تجهیزات جرثقیل، لیفتراک و نیروی کار تخلیه را در محل مقصد هماهنگ کرده باشد. در غیر این صورت باید از DAP استفاده شود تا وظیفه تخلیه به عهده خریدار باشد.'
  },
  {
    id: 'insurance_cip_cif',
    titleEn: 'Divergent Insurance Coverage: CIP (Clause A) vs CIF (Clause C)',
    titleFa: 'تفکیک سطح پوشش بیمه‌ای: الزام کلوز A برای CIP در برابر کلوز C برای CIF',
    badgeFa: 'تغییر بزرگ مالی و بیمه',
    impactLevel: 'critical',
    summaryFa: 'در اینکوترمز ۲۰۱۰، در هر دو ترم CIF و CIP فروشنده تنها ملزم به تهیه حداقل پوشش بیمه‌ای (کلوز C) بود. در اینکوترمز ۲۰۲۰، این دو از هم تفکیک شدند: برای CIP پوشش کلوز A (تمام خطرات) اجباری شد، اما CIF در همان کلوز C حداقلی باقی ماند.',
    summaryEn: 'Incoterms 2020 introduced different default insurance levels: CIP now mandates maximum coverage under Institute Cargo Clauses (A), while CIF retains minimum coverage under Institute Cargo Clauses (C).',
    before2020Fa: 'در هر دو قاعده CIF و CIP، فروشنده طبق ماده A3 کافی بود بیمه‌نامه حداقلی (Institute Cargo Clauses C لندن) با پوشش ۱۱۰٪ ارزش تهیه کند.',
    now2020Fa: 'در CIP فروشنده قانوناً ملزم است بیمه‌نامه جامع تمام‌خطرات (Institute Cargo Clauses A) با پوشش حداقل ۱۱۰٪ به نفع خریدار بخرد. در ترم دریایی CIF الزام قانونی همچنان همان کلوز C (حداقل) است، چون در بارهای فله و کالاهای خام (Commodities)، هزینه کلوز A توجیه اقتصادی ندارد.',
    practicalAdviceFa: 'اگر در حال خرید کالاهای گران‌قیمت، الکترونیکی یا تجهیزات حساس صنعتی با ترم CIP هستید، فروشنده نمی‌تواند با بیمه ارزان کلوز C رفع تکلیف کند؛ حتماً گواهی بیمه تمام خطرات (All Risks) را مطالبه نمایید.'
  },
  {
    id: 'fca_on_board_bl',
    titleEn: 'FCA with On-Board Bill of Lading Mechanism for Bank Letters of Credit (L/C)',
    titleFa: 'مکانیزم صدور بارنامه دریایی با قید بارگیری (On-Board B/L) در ترم FCA',
    badgeFa: 'حل چالش بزرگ اعتبارات اسنادی',
    impactLevel: 'high',
    summaryFa: 'حل تعارض تاریخی سیستم بانکی و حمل کانتینری: در ترم FCA خریدار و فروشنده می‌توانند توافق کنند که خریدار به متصدی حمل خود دستور دهد پس از بارگیری کانتینر روی کشتی، یک بارنامه با قید On-Board برای فروشنده صادر کند تا فروشنده بتواند آن را برای معامله اسناد به بانک تحویل دهد.',
    summaryEn: 'Provides an option in FCA where buyer instructs the carrier to issue an on-board bill of lading to the seller after loading, resolving L/C bank requirements.',
    before2020Fa: 'در حمل کانتینری، فروشنده بار را در ترمینال کانتینری به کریر تحویل می‌داد و رسید کانتینر (FCR/MTO) می‌گرفت. اما بانک‌ها در گشایش اعتبار L/C طبق مقررات UCP600 اصرار داشتند که تنها «بارنامه دریایی بارگیری‌شده On-Board» را قبول کنند. این موضوع فروشندگان را مجبور می‌کرد به اشتباه به سمت ترم خطرناک FOB بروند.',
    now2020Fa: 'در قاعده FCA اینکوترمز ۲۰۲۰، در بند A6/B6 این امکان به صراحت گنجانده شد که خریدار به خط کشتیرانی یا فورواردر دستور دهد بارنامه دریایی با درج On-Board برای فروشنده صادر شود.',
    practicalAdviceFa: 'در تمام قراردادهای کانتینری به جای FOB از FCA استفاده کنید و در شرایط پرداخت L/C قید نمایید: "FCA Named Terminal, with carrier instructed to issue an On-Board Bill of Lading".'
  },
  {
    id: 'own_means_of_transport',
    titleEn: 'Allowance for Own Means of Transport in FCA, DAP, DPU, and DDP',
    titleFa: 'به‌رسمیت شناخته شدن ناوگان حمل اختصاصی (بدون نیاز به شرکت حمل واسط)',
    badgeFa: 'تسهیل لجستیک و ترانزیت',
    impactLevel: 'medium',
    summaryFa: 'در ویرایش‌های قبلی فرض بر این بود که کالا همواره توسط یک شرکت باربری شخص ثالث مستقل حمل می‌شود. در اینکوترمز ۲۰۲۰ رسماً پذیرفته شد که خریدار یا فروشنده می‌توانند با وسایل نقلیه و کامیون‌های شخصی یا ناوگان خود کالا را جابجا کنند.',
    summaryEn: 'Expressly recognizes that either the seller or the buyer may use their own vehicles and transport facilities in FCA, DAP, DPU, and DDP without contracting third-party carriers.',
    before2020Fa: 'متن مقررات بر این فرض استوار بود که همیشه طرفین با یک حمل‌کننده تجاری شخص ثالث (Contract of Carriage) قرارداد منعقد می‌کنند.',
    now2020Fa: 'در ترم‌های FCA (توسط خریدار) و ترم‌های گروه D شامل DAP, DPU, DDP (توسط فروشنده)، طرفین مجازند با ناوگان ترانزیتی و لجستیکی متعلق به خود عملیات حمل را به انجام برسانند.',
    practicalAdviceFa: 'بسیار کاربردی در تجارت زمینی ایران با ترکیه، عراق، ارمنستان و روسیه که شرکت‌ها اغلب تریلرهای ترانزیتی یا واگن‌های اختصاصی دارند.'
  },
  {
    id: 'security_requirements',
    titleEn: 'Enhanced Security-Related Obligations and Cost Transparency',
    titleFa: 'الزامات امنیتی پیشرفته زنجیره تأمین و شفاف‌سازی هزینه‌های بازرسی',
    badgeFa: 'امنیت و کنترل گمرکی',
    impactLevel: 'high',
    summaryFa: 'با توجه به گسترش پروتکل‌های امنیتی در بنادر و گمرکات دنیا (نظیر ISPS، احراز هویت اسکنرهای ایکس‌ری و کانتینری)، اینکوترمز ۲۰۲۰ مسئولیت و هزینه‌های مربوط به تشریفات امنیتی مبدأ، ترانزیت و مقصد را تفکیک و تثبیت کرد.',
    summaryEn: 'Clearly demarcates security obligations and related costs (such as port facility security screening and X-ray checks) in sections A4/B4 and A9/B9.',
    before2020Fa: 'الزامات امنیتی در متن قوانین پراکنده بود و اغلب بین بازرگانان و خطوط کشتیرانی بر سر هزینه‌های امنیتی ترمینال (ISPS / Terminal Security Charge) اختلاف به وجود می‌آمد.',
    now2020Fa: 'در بندهای A4 و A7 و به ویژه جدول هزینه‌های A9/B9 هر ترم، مشخص شد که کدام طرف مسئول رعایت و پرداخت الزامات امنیتی صادرات، ترانزیت و واردات است.',
    practicalAdviceFa: 'هزینه‌های اسکن امنیتی کانتینر در بندر مبدا به عهده فروشنده در ترم‌های گروه C و D است، اما در ترم‌های گروه F بستگی به نقطه تحویل توافق‌شده دارد.'
  },
  {
    id: 'cost_clarity_a9_b9',
    titleEn: 'Centralized Cost Allocation in Articles A9/B9 (One-Stop Cost Reference)',
    titleFa: 'تجمیع و شفاف‌سازی یکپارچه هزینه‌ها در ماده‌های A9 و B9 قوانین',
    badgeFa: 'سازماندهی ساختار قوانین',
    impactLevel: 'medium',
    summaryFa: 'اتاق بازرگانی بین‌المللی (ICC) در نسخه ۲۰۲۰ برای جلوگیری از سردرگمی، تمام وظایف مالی طرفین را در ماده A9 (هزینه‌های فروشنده) و ماده B9 (هزینه‌های خریدار) تجمیع کرد تا بازرگان نیاز به جستجو در سایر بندها نداشته باشد.',
    summaryEn: 'Articles A9/B9 now serve as a single, consolidated reference list for all cost items allocated to seller and buyer respectively.',
    before2020Fa: 'تعهدات مالی در بخش‌های مختلف متن (مانند ترخیص، بارگیری، بسته‌بندی، حمل) پراکنده بود که باعث غفلت خریداران و فروشندگان از برخی هزینه‌های پنهان می‌شد.',
    now2020Fa: 'با مراجعه مستقیم به A9 و B9 هر اصطلاح، فهرست قطعی و بسته تمامی هزینه‌ها مانند THC، صدور اسناد، گمرکی و حمل داخلی مشخص است.',
    practicalAdviceFa: 'هنگام بروز اختلاف در صورتحساب فورواردر یا کارگزار، مستقیماً به ماده A9 و B9 ترم مندرج در پیش‌فاکتور استناد کنید.'
  }
];

export interface TradePitfall {
  id: string;
  titleFa: string;
  titleEn: string;
  severity: 'danger' | 'warning' | 'critical';
  frequency: string;
  scenarioFa: string;
  rootCauseFa: string;
  consequenceFa: string;
  solutionFa: string;
  iccGuidanceFa: string;
}

export const COMMON_TRADE_PITFALLS: TradePitfall[] = [
  {
    id: 'fob_container_trap',
    titleFa: 'دام مهلک FOB در بارهای کانتینری (بزرگ‌ترین خطای رایج تجار ایرانی)',
    titleEn: 'The FOB Trap for Containerized Cargo',
    severity: 'danger',
    frequency: 'بیش از ۷۰٪ قراردادهای کانتینری ایران و منطقه',
    scenarioFa: 'یک بازرگان برای واردات ۱ کانتینر قطعات الکترونیک از چین قرارداد FOB Shanghai منعقد می‌کند. کانتینر در محوطه کانتینری بندر شانگهای (CY) مستقر شده اما قبل از بارگیری روی کشتی، به دلیل طوفان یا واژگونی تاپ‌لیفت آسیب می‌بیند.',
    rootCauseFa: 'در ترم FOB، ریسک فقط زمانی به خریدار منتقل می‌شود که کالا «روی عرشه کشتی (On Board)» بارگیری شده باشد. در حالی که در حمل کانتینری، فروشنده بار را ۲ تا ۵ روز قبل به محوطه ترمینال تحویل داده و دیگر هیچ کنترلی روی آن ندارد.',
    consequenceFa: 'بیمه دریایی خریدار ممکن است خسارت در محوطه ترمینال را نپذیرد؛ فروشنده نیز کالا را تحویل ترمینال داده و مسئولیت را قبول نمی‌کند. اختلاف حقوقی طولانی و معطلی کالا حتمی است.',
    solutionFa: 'در تمام محموله‌های کانتینری (FCL یا LCL) به جای FOB از FCA (تحویل به حمل‌کننده در ترمینال کانتینری مبدأ) استفاده کنید.',
    iccGuidanceFa: 'تأکید صریح ICC: اصطلاح FOB، CFR و CIF فقط برای کالاهای فله و عمومی غیرکانتینری است که مستقیماً روی عرشه کشتی قرار می‌گیرند. برای کانتینرها منحصراً از FCA، CPT و CIP استفاده شود.'
  },
  {
    id: 'two_point_confusion',
    titleFa: 'اشتباه گرفتن نقطه انتقال ریسک با نقطه پرداخت هزینه در گروه C (CFR/CIF/CPT/CIP)',
    titleEn: 'Two-Point Rules Confusion in Group C Terms',
    severity: 'critical',
    frequency: 'بسیار متداول در مذاکرات خرید خارجی',
    scenarioFa: 'خریدار ایرانی تصور می‌کند چون قرارداد CFR Bandar Abbas یا CIF Bandar Abbas بسته، در صورت غرق شدن کشتی در مسیر اقیانوس هند فروشنده باید خسارت را جبران کند.',
    rootCauseFa: 'اصطلاحات گروه C قواعد «دو نقطه‌ای» هستند. نقطه انتقال ریسک خسارت در بندر یا محل مبدأ (هنگام بارگیری روی کشتی یا تحویل به اولین کریر) رخ می‌دهد، اما نقطه پرداخت کرایه تا بندر مقصد است!',
    consequenceFa: 'اگر بار در مسیر دریایی خسارت ببیند، خریدار حق توقف پرداخت اسناد L/C یا کسر وجه از فروشنده را ندارد؛ زیان با خود خریدار است و خریدار باید خسارت را از شرکت بیمه مطالبه کند.',
    solutionFa: 'بدانید که در CFR و CPT فروشنده بیمه‌گذار نیست و اگر خودتان بیمه معتبر نخرید، با غرق شدن کشتی ۱۰۰٪ سرمایه شما از بین می‌رود. در CIF و CIP نیز بررسی کنید که آیا پوشش بیمه‌ای فروشنده کافی است یا خیر.',
    iccGuidanceFa: 'همواره تفکیک دقیق کنید: «محل تحویل و ریسک» در کشور مبدأ است، اما «محل مقصد هزینه» در کشور مقصد است.'
  },
  {
    id: 'exw_customs_block',
    titleFa: 'خرید با ترم EXW (درب کارخانه) توسط خریداران بدون امکان ترخیص صادراتی',
    titleEn: 'EXW Nightmare for International Cross-Border Buyers',
    severity: 'warning',
    frequency: 'شایع در خرید از کارخانجات چینی، هندی و اروپایی',
    scenarioFa: 'یک شرکت ایرانی کالایی را با ترم EXW در کارخانه فروشنده در آلمان یا چین می‌خرد. وقتی کامیون به گمرک خروجی می‌رسد، گمرک از صدور پروانه صادراتی خودداری می‌کند چون خریدار شرکت ثبت‌شده یا کارت بازرگانی محلی در آن کشور ندارد.',
    rootCauseFa: 'در ترم EXW انجام تشریفات گمرکی صادرات به عهده خریدار است. اگر فروشنده حاضر به اظهار صادرات به نام خود نشود، ترخیص صادراتی قفل می‌شود.',
    consequenceFa: 'توقیف کالا، جریمه‌های انبارداری سنگین در گمرک مبدأ و از دست رفتن معافیت استرداد مالیات ارزش افزوده (Tax Refund/Export Rebate) برای فروشنده.',
    solutionFa: 'هرگز در معاملات برون‌مرزی از EXW استفاده نکنید مگر آنکه فورواردر شما در کشور مبدأ مجوز رسمی ترخیص صادرات داشته باشد. جایگزین هوشمند: ترم FCA در انبار فروشنده (FCA Seller Premises).',
    iccGuidanceFa: 'اتاق بازرگانی بین‌المللی استفاده از EXW را برای معاملات داخلی یا معاملاتی که خریدار نمایندگی مستقیم گمرکی در مبدأ دارد توصیه می‌کند؛ برای صادرات، FCA گزینه استاندارد است.'
  },
  {
    id: 'ddp_vat_tax_trap',
    titleFa: 'پذیرش فروش با ترم DDP بدون ثبت شرکت و شناخت قوانین مالیاتی کشور مقصد',
    titleEn: 'The DDP Local Tax & Customs Registration Trap',
    severity: 'danger',
    frequency: 'متداول در صادرات به اتحادیه اروپا، امارات یا روسیه',
    scenarioFa: 'یک صادرکننده قرارداد DDP با خریدار خارجی می‌بندد. پس از رسیدن بار به گمرک مقصد، گمرک اعلام می‌کند حقوق ورودی و مالیات ارزش افزوده (VAT/GST) باید توسط یک شخص حقیقی یا حقوقی دارای شناسه مالیاتی محلی پرداخت شود.',
    rootCauseFa: 'در ترم DDP، حداکثر تعهدات بر دوش فروشنده است و فروشنده مسئول پرداخت گمرکی، سود بازرگانی و تمام مالیات‌های واردات در کشور خریدار است.',
    consequenceFa: 'کالا در گمرک مقصد دپو شده و دموراژ می‌خورد، فروشنده مجبور به استخدام اضطراری واسطه‌های محلی با کارمزدهای نجومی می‌شود.',
    solutionFa: 'اگر صادرکننده هستید، ترجیحاً با DAP یا CPT قرارداد ببندید تا پرداخت حقوق گمرکی و مالیات واردات با خود خریدار محلی باشد. اگر حتماً DDP می‌بندید، عبارت "DDP excluding VAT/GST" را در قرارداد درج کنید.',
    iccGuidanceFa: 'اگر فروشنده نتواند به صورت مستقیم یا غیرمستقیم مجوزهای وارداتی کشور مقصد را کسب کند، اصطلاح DDP نباید به کار گرفته شود؛ اصطلاح مناسب DAP است.'
  },
  {
    id: 'imprecise_named_place',
    titleFa: 'ذکر نامبهم محل یا بندر در قرارداد (مثال غلط: FOB China)',
    titleEn: 'Vague or Omitted Named Place/Port Specification',
    severity: 'warning',
    frequency: 'بسیار شایع در پروفرماهای غیرحرفه‌ای',
    scenarioFa: 'در پیش‌فاکتور صرفاً درج شده: "FOB China" یا "CIF Iran" بدون اشاره به بندر یا ترمینال مشخص.',
    rootCauseFa: 'چین بیش از ۲۰ بندر اقیانوسی بزرگ و صدها ترمینال دارد؛ ایران نیز بنادر متعددی (شهید رجایی، امام خمینی، بوشهر، چابهار، انزلی) دارد. مشخص نبودن بندر و ترمینال دقیق موجب اختلاف بر سر کرایه حمل داخلی و خط کشتیرانی می‌شود.',
    consequenceFa: 'فروشنده می‌تواند بار را به ارزان‌ترین و دورافتاده‌ترین بندر تحویل دهد و خریدار را با هزینه‌های سنگین حمل مواجه سازد؛ دادگاه‌ها نیز به دلیل ابهام در موضوع قرارداد دچار بن‌بست می‌شوند.',
    solutionFa: 'همواره نام کامل اسکله، بندر، شهر، کشور و کد ترمینال را دقیقاً ذکر کنید: "FOB Beilun Terminal, Ningbo Port, China, Incoterms® 2020".',
    iccGuidanceFa: 'کلیه قواعد اینکوترمز ۲۰۲۰ تنها زمانی دارای اثر حقوقی کامل هستند که «محل دقیق تعیین‌شده (Named Place / Port)» به وضوح قید شده باشد.'
  },
  {
    id: 'omitting_incoterms_year',
    titleFa: 'عدم ذکر سال نسخه اینکوترمز (خطر تفسیر قرارداد با قوانین سال ۲۰۰۰ یا ۲۰۱۰)',
    titleEn: 'Omitting the Version Year (Incoterms 2020)',
    severity: 'warning',
    frequency: 'رایج در استعلام‌های شفاهی و مکاتبات بازرگانان',
    scenarioFa: 'طرفین در قرارداد صرفاً می‌نویسند: "CIP Frankfurt Airport". در صورت بروز خسارت، مشخص نیست که سطح بیمه باید طبق ۲۰۱۰ (کلوز C) باشد یا طبق ۲۰۲۰ (کلوز A).',
    rootCauseFa: 'انتشار نسخه‌های جدید اینکوترمز به معنای باطل شدن نسخه‌های قبلی نیست. نسخه‌های ۲۰۰۰ و ۲۰۱۰ همچنان از نظر حقوقی در صورت توافق طرفین معتبرند.',
    consequenceFa: 'دادگاه یا داور تجاری (Arbitration) ممکن است بر خلاف میل شما، قرارداد را با نسخه قدیمی ۲۰۱۰ تفسیر کرده و پوشش بیمه‌ای یا تعهدات امنیتی را به ضرر شما تشخیص دهد.',
    solutionFa: 'در تمامی مکاتبات، پیش‌فاکتورها، بارنامه‌ها و اعتبارات اسنادی همواره سال نسخه را صریحاً درج کنید: "Incoterms® 2020".',
    iccGuidanceFa: 'فرمول استاندارد ICC: [قاعده انتخابی] + [محل دقیق] + Incoterms® 2020.'
  }
];

export interface IncotermGlossaryItem {
  term: string;
  termFa: string;
  category: string;
  definitionFa: string;
  practicalTipFa: string;
}

export const INCOTERMS_GLOSSARY: IncotermGlossaryItem[] = [
  {
    term: 'THC (Terminal Handling Charges)',
    termFa: 'هزینه‌های جابجایی ترمینال (مبدأ / مقصد)',
    category: 'هزینه‌های بندری',
    definitionFa: 'هزینه‌ای که ترمینال یا پورت‌اپراتور بابت بارگیری و تخلیه کانتینر، جابجایی با جرثقیل و نگهداری موقت در محوطه بندر دریافت می‌کند.',
    practicalTipFa: 'در قرارداد مشخص کنید که THC Origin با فروشنده و THC Destination بر عهده چه کسی است تا دچار دوباره‌پرداخت در مقصد نشوید.'
  },
  {
    term: 'Bill of Lading (B/L)',
    termFa: 'بارنامه دریایی',
    category: 'اسناد حمل',
    definitionFa: 'سند رسمی صادرشده توسط خط کشتیرانی که نقش رسید تحویل کالا، سند مالکیت قابل معامله (Negotiable Document of Title) و قرارداد حمل را ایفا می‌کند.',
    practicalTipFa: 'در ترم‌های دریایی و اعتبارات اسنادی L/C، تنها با ارائه نسخه اصل بارنامه ظهرنویسی‌شده امکان ترخیص و تحویل کالا در بندر مقصد وجود دارد.'
  },
  {
    term: 'On-Board Notation',
    termFa: 'قید بارگیری روی عرشه در بارنامه',
    category: 'اسناد حمل و بانک',
    definitionFa: 'مهری رسمی روی بارنامه که گواهی می‌دهد کانتینر یا کالا در تاریخ معین دقیقاً روی عرشه کشتی مورد نظر بارگیری شده است.',
    practicalTipFa: 'بانک‌های عامل در اعتبارات اسنادی طبق UCP600 تنها بارنامه‌های دارای قید On-Board با ذکر تاریخ قطعی را معامله می‌کنند.'
  },
  {
    term: 'Demurrage',
    termFa: 'دموراژ (جریمه دیرکرد عودت کانتینر در بندر)',
    category: 'ریسک مالی و لجستیک',
    definitionFa: 'جریمه روزانه‌ای که شرکت کشتیرانی بابت معطلی کانتینر پر در محوطه بندر یا گمرک پس از پایان فرجه مجاز (Free Time) از صاحب کالا دریافت می‌کند.',
    practicalTipFa: 'همواره پیش از بارگیری حداقل ۱۴ تا ۲۱ روز Free Days در بندر مقصد را در قرارداد حمل مکتوب نمایید.'
  },
  {
    term: 'Detention',
    termFa: 'دتنشن (جریمه دیرکرد عودت کانتینر خالی به دپو)',
    category: 'ریسک مالی و لجستیک',
    definitionFa: 'جریمه دیرکرد عودت کانتینر خالی پس از خروج از گمرک تا زمان تحویل مجدد به دپوی خط کشتیرانی.',
    practicalTipFa: 'برای محموله‌هایی که ترخیص در مقصد طول می‌کشد یا نیاز به ترانزیت به گمرکات داخلی دارند بسیار مهم است.'
  },
  {
    term: 'Free Time',
    termFa: 'فرجه زمانی مجاز رایگان کانتینر',
    category: 'لجستیک و کشتیرانی',
    definitionFa: 'تعداد روزهایی که صاحب کالا اجازه دارد بدون پرداخت جریمه دموراژ، کانتینر را برای تخلیه و ترخیص در اختیار داشته باشد.',
    practicalTipFa: 'عرف بنادر خاورمیانه ۱۰ روز است اما در مذاکرات با فورواردر به راحتی می‌توانید آن را به ۱۴ یا ۲۱ روز افزایش دهید.'
  },
  {
    term: 'CY (Container Yard)',
    termFa: 'محوطه کانتینری بندر',
    category: 'پایانه‌های باربری',
    definitionFa: 'محوطه باز و مجهز در بنادر و ترمینال‌های ترانزیتی که کانتینرهای پر و خالی تا زمان بارگیری روی کشتی یا بارگیری روی تریلر در آن چیده می‌شوند.',
    practicalTipFa: 'تحویل در CY نقطه استاندارد انتقال ریسک در ترم‌های چندوجهی مانند FCA است.'
  },
  {
    term: 'Institute Cargo Clauses (A, B, C)',
    termFa: 'کلوزهای سه‌گانه بیمه باربری انستیتو لندن',
    category: 'بیمه بین‌الملل',
    definitionFa: 'استاندارد جهانی بیمه دریایی و حمل کالا: کلوز A بالاترین پوشش (تمام خطرات به جز استثنائات عمدی)، کلوز B پوشش متوسط (خطرات اصلی، زلزله و نفوذ آب)، و کلوز C پوشش حداقلی (صرفاً غرق شدن، حریق و فجایع کلی).',
    practicalTipFa: 'در اینکوترمز ۲۰۲۰، ترم CIP به صورت پیش‌فرض ملزم به کلوز A است، در حالی که CIF به کلوز C بسنده می‌کند.'
  },
  {
    term: 'Sea Waybill',
    termFa: 'راهنامه دریایی (غیرقابل انتقال)',
    category: 'اسناد حمل',
    definitionFa: 'سندی غیرقابل معامله (Non-negotiable) که مانند بارنامه نشان‌دهنده حمل بار است، اما نیازی به ارسال فیزیکی اصل سند به مقصد برای آزادسازی کالا نیست.',
    practicalTipFa: 'برای شرکت‌های وابسته یا معاملات حساب باز (Open Account) بسیار سریع‌تر از بارنامه سنتی B/L است.'
  },
  {
    term: 'CMR Waybill',
    termFa: 'راهنامه بین‌المللی حمل جاده‌ای (CMR)',
    category: 'اسناد جاده‌ای',
    definitionFa: 'سند استاندارد کنوانسیون بین‌المللی حمل جاده‌ای کالا که در ترانزیت زمینی بین ایران، ترکیه، اروپا و آسیای میانه کاربرد دارد.',
    practicalTipFa: 'در ترم‌های DAP و CPT در حمل جاده‌ای، CMR سند اثبات تحویل به حامل اول محسوب می‌شود.'
  },
  {
    term: 'Air Waybill (AWB)',
    termFa: 'بارنامه هوایی',
    category: 'اسناد هوایی',
    definitionFa: 'سند غیرقابل انتقال حمل هوایی کالا که توسط شرکت‌های هواپیمایی مانند ایران‌ایر، امارات یا قطر ایرویز صادر می‌شود.',
    practicalTipFa: 'کالای هوایی با احراز هویت گیرنده مندرج در AWB ترخیص می‌شود، بنابراین در ترم‌های هوایی باید نام دقیق گیرنده قانونی درج شود.'
  },
  {
    term: 'General Average',
    termFa: 'خسارت مشترک دریایی (جنرال اوریج)',
    category: 'حقوق دریایی',
    definitionFa: 'قاعده بین‌المللی که بر اساس آن اگر ناخدای کشتی برای نجات جان خدمه و حفظ کل کشتی و بار ناچار به فدا کردن بخشی از بار شود (مثلاً پرتاب کانتینر به دریا در طوفان شدید)، کلیه صاحبان کالاهای سالم و مالک کشتی در جبران این خسارت شریک خواهند بود.',
    practicalTipFa: 'حتی ارزان‌ترین بیمه باربری (کلوز C) نیز پوشش خسارت مشترک دریایی را بر عهده می‌گیرد.'
  }
];

export interface ContractSampleClause {
  incoterm: string;
  contextFa: string;
  englishClause: string;
  persianTranslation: string;
  placeholders: string[];
}

export const SAMPLE_CONTRACT_CLAUSES: ContractSampleClause[] = [
  {
    incoterm: 'FCA',
    contextFa: 'قرارداد خرید کانتینری از کارخانه یا ترمینال مبدأ با اعتبار اسنادی (L/C)',
    englishClause: 'Delivery shall be FCA [Named Container Terminal, Port of Loading, Country] Incoterms® 2020. The Seller shall be responsible for export customs clearance. Upon loading of the goods on board the vessel, the Buyer shall instruct its nominated carrier to issue an on-board ocean bill of lading to the Seller.',
    persianTranslation: 'تحویل کالا به صورت FCA [نام ترمینال کانتینری، بندر بارگیری، کشور] بر اساس اینکوترمز ۲۰۲۰ خواهد بود. فروشنده مسئول انجام تشریفات گمرکی صادرات است. پس از بارگیری کالا روی عرشه کشتی، خریدار متعهد است به متصدی حمل معرفی‌شده خود دستور دهد بارنامه دریایی با قید بارگیری‌شده (On-Board) به نفع فروشنده صادر نماید.',
    placeholders: ['نام دقیق ترمینال یا انبار', 'بندر بارگیری', 'کشور مبدأ']
  },
  {
    incoterm: 'CIP',
    contextFa: 'خرید تجهیزات صنعتی گران‌قیمت یا الکترونیک با بیمه تمام خطرات و حمل هوایی/چندوجهی',
    englishClause: 'The goods shall be supplied on CIP [Named Airport or Destination City, Country] Incoterms® 2020. Freight and marine cargo insurance shall be arranged and paid by the Seller. In accordance with Incoterms® 2020 rules, insurance coverage shall comply with Institute Cargo Clauses (A) for 110% of the invoice value in the contract currency.',
    persianTranslation: 'کالا بر مبنای CIP [نام فرودگاه یا شهر مقصد، کشور] طبق اینکوترمز ۲۰۲۰ تأمین خواهد شد. کرایه حمل و بیمه‌نامه باربری توسط فروشنده هماهنگ و پرداخت می‌شود. منطبق با قوانین اینکوترمز ۲۰۲۰، پوشش بیمه‌ای باید حداقل معادل ۱۱۰٪ ارزش فاکتور به ارز قرارداد و با شرایط کلوز A لندن (تمام‌خطرات) ارائه گردد.',
    placeholders: ['نام فرودگاه یا ترمینال مقصد', 'شهر مقصد', 'کشور مقصد']
  },
  {
    incoterm: 'CIF',
    contextFa: 'خرید کالاهای فله و کشاورزی یا مواد شیمیایی مایع از طریق کشتیرانی',
    englishClause: 'Delivery shall be made CIF [Named Port of Destination, Country] Incoterms® 2020. The Seller shall cover ocean freight and marine insurance (Institute Cargo Clauses C, 110% coverage). Destination port handling charges (THC Destination) and import customs clearance shall be at the Buyer’s expense.',
    persianTranslation: 'تحویل به صورت CIF [نام بندر مقصد، کشور] طبق اینکوترمز ۲۰۲۰ خواهد بود. فروشنده کرایه حمل دریایی و بیمه باربری دریایی (کلوز C، پوشش ۱۱۰٪) را متقبل می‌گردد. هزینه‌های تخلیه در بندر مقصد (THC Destination) و تشریفات گمرکی واردات بر عهده خریدار است.',
    placeholders: ['بندر مقصد (مثلاً بندرعباس)', 'کشور مقصد']
  },
  {
    incoterm: 'DAP',
    contextFa: 'ترانزیت جاده‌ای یا تحویل تا درب کارخانه/انبار خریدار بدون ترخیص واردات',
    englishClause: 'The terms of sale are DAP [Buyer’s Factory/Warehouse Address, City, Country] Incoterms® 2020. The Seller bears all costs and risks of carriage up to the designated location, ready for unloading. The Buyer is solely responsible for import customs clearance, payment of import customs duties and taxes, and the physical unloading of the cargo.',
    persianTranslation: 'شرایط فروش به صورت DAP [آدرس دقیق کارخانه یا انبار خریدار، شهر، کشور] طبق اینکوترمز ۲۰۲۰ می‌باشد. فروشنده کلیه هزینه‌ها و خطرات حمل را تا محل تعیین‌شده و به حالت آماده برای تخلیه تقبل می‌کند. خریدار منحصراً مسئول ترخیص گمرکی واردات، پرداخت حقوق و عوارض گمرکی و مالیات، و تخلیه فیزیکی بار از وسیله نقلیه است.',
    placeholders: ['آدرس دقیق انبار خریدار', 'شهر مقصد', 'کشور']
  },
  {
    incoterm: 'DPU',
    contextFa: 'تحویل کالا در مقصد با تقبل مسئولیت تخلیه فیزیکی توسط فروشنده',
    englishClause: 'Delivery shall be DPU [Designated Project Site / Warehouse, City, Country] Incoterms® 2020. The Seller shall bear all risks and expenses to transport the goods to the destination and safely unload them from the arriving vehicle. Import customs clearance and local import taxes shall be fulfilled by the Buyer.',
    persianTranslation: 'تحویل کالا به صورت DPU [محل پروژه / انبار مقصد، شهر، کشور] بر مبنای اینکوترمز ۲۰۲۰ خواهد بود. فروشنده کلیه خطرات و هزینه‌های ترابری به مقصد و تخلیه ایمن بار از روی وسیله نقلیه در مقصد را بر عهده دارد. تشریفات گمرکی و مالیات واردات توسط خریدار انجام و پرداخت می‌شود.',
    placeholders: ['محل پروژه یا انبار مقصد', 'شهر', 'کشور']
  }
];

export interface DecisionWizardStep {
  id: number;
  questionFa: string;
  questionEn: string;
  options: {
    id: string;
    labelFa: string;
    labelEn: string;
    descriptionFa: string;
    nextStep?: number;
    recommendedTerm?: 'EXW' | 'FCA' | 'FAS' | 'FOB' | 'CFR' | 'CIF' | 'CPT' | 'CIP' | 'DAP' | 'DPU' | 'DDP';
  }[];
}
