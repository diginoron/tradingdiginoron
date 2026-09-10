export interface HsChapter {
  code: string;
  nameEn: string;
  nameFa: string;
  section: string;
  sectionFa: string;
}

export const ALL_HS_CHAPTERS: HsChapter[] = [
  // Section I: Live animals & animal products (01-05)
  { code: '01', nameEn: 'Live animals', nameFa: 'حیوانات زنده', section: 'Section I', sectionFa: 'بخش ۱: حیوانات زنده و محصولات دامی' },
  { code: '02', nameEn: 'Meat and edible meat offal', nameFa: 'گوشت و احشای خوراکی', section: 'Section I', sectionFa: 'بخش ۱: حیوانات زنده و محصولات دامی' },
  { code: '03', nameEn: 'Fish and crustaceans, molluscs', nameFa: 'ماهی‌ها، سخت‌پوستان و آبزیان', section: 'Section I', sectionFa: 'بخش ۱: حیوانات زنده و محصولات دامی' },
  { code: '04', nameEn: 'Dairy produce; birds\' eggs; natural honey', nameFa: 'محصولات لبنی، تخم پرندگان، عسل طبیعی', section: 'Section I', sectionFa: 'بخش ۱: حیوانات زنده و محصولات دامی' },
  { code: '05', nameEn: 'Products of animal origin, not elsewhere specified', nameFa: 'سایر محصولات حیوانی', section: 'Section I', sectionFa: 'بخش ۱: حیوانات زنده و محصولات دامی' },

  // Section II: Vegetable products (06-14)
  { code: '06', nameEn: 'Live trees and other plants; bulbs, roots; cut flowers', nameFa: 'درختان و گیاهان زنده، گل‌های شاخه‌بریده', section: 'Section II', sectionFa: 'بخش ۲: محصولات نباتی و کشاورزی' },
  { code: '07', nameEn: 'Edible vegetables and certain roots and tubers', nameFa: 'سبزیجات، صیفی‌جات و ریشه‌های خوراکی', section: 'Section II', sectionFa: 'بخش ۲: محصولات نباتی و کشاورزی' },
  { code: '08', nameEn: 'Edible fruit and nuts; peel of citrus fruit or melons', nameFa: 'میوه‌های خوراکی، آجیل و خشکبار (پسته، خرما، گردو)', section: 'Section II', sectionFa: 'بخش ۲: محصولات نباتی و کشاورزی' },
  { code: '09', nameEn: 'Coffee, tea, maté and spices (Saffron)', nameFa: 'قهوه، چای، زعفران و ادویه‌جات', section: 'Section II', sectionFa: 'بخش ۲: محصولات نباتی و کشاورزی' },
  { code: '10', nameEn: 'Cereals (Wheat, Rice, Corn, Barley)', nameFa: 'غلات (گندم، برنج، جو، ذرت)', section: 'Section II', sectionFa: 'بخش ۲: محصولات نباتی و کشاورزی' },
  { code: '11', nameEn: 'Products of the milling industry; malt; starches; inulin', nameFa: 'محصولات آسیابانی، آرد، مالت، نشاسته', section: 'Section II', sectionFa: 'بخش ۲: محصولات نباتی و کشاورزی' },
  { code: '12', nameEn: 'Oil seeds and oleaginous fruits; medicinal plants', nameFa: 'دانه‌های روغنی، دانه‌های دارویی و صنعتی', section: 'Section II', sectionFa: 'بخش ۲: محصولات نباتی و کشاورزی' },
  { code: '13', nameEn: 'Lac; gums, resins and other vegetable saps and extracts', nameFa: 'صمغ‌ها، رزین‌ها و عصاره‌های گیاهی', section: 'Section II', sectionFa: 'بخش ۲: محصولات نباتی و کشاورزی' },
  { code: '14', nameEn: 'Vegetable plaiting materials; vegetable products', nameFa: 'مواد گیاهی برای حصیربافی و سایر', section: 'Section II', sectionFa: 'بخش ۲: محصولات نباتی و کشاورزی' },

  // Section III: Animal or vegetable fats and oils (15)
  { code: '15', nameEn: 'Animal or vegetable fats and oils and their cleavage products', nameFa: 'چربی‌ها و روغن‌های حیوانی یا نباتی', section: 'Section III', sectionFa: 'بخش ۳: روغن‌ها و چربی‌ها' },

  // Section IV: Prepared foodstuffs; beverages, spirits and vinegar; tobacco (16-24)
  { code: '16', nameEn: 'Preparations of meat, of fish or of crustaceans', nameFa: 'فرآورده‌های گوشت، ماهی یا سایر آبزیان', section: 'Section IV', sectionFa: 'بخش ۴: صنایع غذایی، نوشیدنی‌ها و دخانیات' },
  { code: '17', nameEn: 'Sugars and sugar confectionery', nameFa: 'قند و شکر و شیرینی‌جات', section: 'Section IV', sectionFa: 'بخش ۴: صنایع غذایی، نوشیدنی‌ها و دخانیات' },
  { code: '18', nameEn: 'Cocoa and cocoa preparations', nameFa: 'کاکائو و فرآورده‌های کاکائویی و شکلات', section: 'Section IV', sectionFa: 'بخش ۴: صنایع غذایی، نوشیدنی‌ها و دخانیات' },
  { code: '19', nameEn: 'Preparations of cereals, flour, starch or milk; pastrycooks\' products', nameFa: 'فرآورده‌های غلات، آرد، نشاسته، نان و بیسکویت', section: 'Section IV', sectionFa: 'بخش ۴: صنایع غذایی، نوشیدنی‌ها و دخانیات' },
  { code: '20', nameEn: 'Preparations of vegetables, fruit, nuts or other parts of plants', nameFa: 'فرآورده‌های سبزیجات، میوه‌ها، مربا و رب', section: 'Section IV', sectionFa: 'بخش ۴: صنایع غذایی، نوشیدنی‌ها و دخانیات' },
  { code: '21', nameEn: 'Miscellaneous edible preparations', nameFa: 'فرآورده‌های خوراکی گوناگون (سس، عصاره و...) ', section: 'Section IV', sectionFa: 'بخش ۴: صنایع غذایی، نوشیدنی‌ها و دخانیات' },
  { code: '22', nameEn: 'Beverages, spirits and vinegar', nameFa: 'نوشیدنی‌ها، آبمیوه‌ها و سرکه', section: 'Section IV', sectionFa: 'بخش ۴: صنایع غذایی، نوشیدنی‌ها و دخانیات' },
  { code: '23', nameEn: 'Residues and waste from the food industries; prepared animal fodder', nameFa: 'پسماند صنایع غذایی، خوراک آماده دام و طیور', section: 'Section IV', sectionFa: 'بخش ۴: صنایع غذایی، نوشیدنی‌ها و دخانیات' },
  { code: '24', nameEn: 'Tobacco and manufactured tobacco substitutes', nameFa: 'توتون و تنباکو و فرآورده‌های دخانی', section: 'Section IV', sectionFa: 'بخش ۴: صنایع غذایی، نوشیدنی‌ها و دخانیات' },

  // Section V: Mineral products (25-27)
  { code: '25', nameEn: 'Salt; sulphur; earths and stone; plastering materials, lime and cement', nameFa: 'نمک، گوگرد، خاک و سنگ، سیمان، گچ و آهک', section: 'Section V', sectionFa: 'بخش ۵: محصولات معدنی و ساختمانی' },
  { code: '26', nameEn: 'Ores, slag and ash', nameFa: 'سنگ‌های فلزی، خاکستر و سرباره فلزات', section: 'Section V', sectionFa: 'بخش ۵: محصولات معدنی و ساختمانی' },
  { code: '27', nameEn: 'Mineral fuels, mineral oils; bituminous substances; mineral waxes', nameFa: 'سوخت‌های معدنی، نفت خام، گاز و فرآورده‌های نفتی', section: 'Section V', sectionFa: 'بخش ۵: محصولات معدنی و ساختمانی' },

  // Section VI: Products of the chemical or allied industries (28-38)
  { code: '28', nameEn: 'Inorganic chemicals; organic/inorganic compounds of precious metals', nameFa: 'مواد شیمیایی معدنی، ترکیبات فلزات گرانبها', section: 'Section VI', sectionFa: 'بخش ۶: صنایع شیمیایی و دارویی' },
  { code: '29', nameEn: 'Organic chemicals (Petrochemicals)', nameFa: 'مواد شیمیایی آلی و پتروشیمی', section: 'Section VI', sectionFa: 'بخش ۶: صنایع شیمیایی و دارویی' },
  { code: '30', nameEn: 'Pharmaceutical products', nameFa: 'محصولات دارویی و پزشکی', section: 'Section VI', sectionFa: 'بخش ۶: صنایع شیمیایی و دارویی' },
  { code: '31', nameEn: 'Fertilisers', nameFa: 'کودهای شیمیایی و معدنی (اوره، فسفات)', section: 'Section VI', sectionFa: 'بخش ۶: صنایع شیمیایی و دارویی' },
  { code: '32', nameEn: 'Tanning or dyeing extracts; tannins; dyes, pigments, paints', nameFa: 'عصاره‌های دباغی و رنگرزی، رنگ‌ها و رزین‌ها', section: 'Section VI', sectionFa: 'بخش ۶: صنایع شیمیایی و دارویی' },
  { code: '33', nameEn: 'Essential oils and resinoids; perfumery, cosmetic or toilet preparations', nameFa: 'اسانس‌ها، عطرها و لوازم آرایشی و بهداشتی', section: 'Section VI', sectionFa: 'بخش ۶: صنایع شیمیایی و دارویی' },
  { code: '34', nameEn: 'Soap, organic surface-active agents, washing preparations', nameFa: 'صابون‌ها، مواد شوینده و پاک‌کننده', section: 'Section VI', sectionFa: 'بخش ۶: صنایع شیمیایی و دارویی' },
  { code: '35', nameEn: 'Albuminoidal substances; modified starches; glues; enzymes', nameFa: 'مواد آلبومینوئید، چسب‌ها و آنزیم‌ها', section: 'Section VI', sectionFa: 'بخش ۶: صنایع شیمیایی و دارویی' },
  { code: '36', nameEn: 'Explosives; pyrotechnic products; matches; pyrophoric alloys', nameFa: 'مواد منفجره، آتش‌بازی و کبریت', section: 'Section VI', sectionFa: 'بخش ۶: صنایع شیمیایی و دارویی' },
  { code: '37', nameEn: 'Photographic or cinematographic goods', nameFa: 'محصولات عکاسی و سینمایی', section: 'Section VI', sectionFa: 'بخش ۶: صنایع شیمیایی و دارویی' },
  { code: '38', nameEn: 'Miscellaneous chemical products', nameFa: 'فرآورده‌های گوناگون صنایع شیمیایی', section: 'Section VI', sectionFa: 'بخش ۶: صنایع شیمیایی و دارویی' },

  // Section VII: Plastics and rubber (39-40)
  { code: '39', nameEn: 'Plastics and articles thereof (Polymers)', nameFa: 'پلاستیک‌ها، پلیمرها و مصنوعات پلاستیکی', section: 'Section VII', sectionFa: 'بخش ۷: پلاستیک، لاستیک و پلیمرها' },
  { code: '40', nameEn: 'Rubber and articles thereof', nameFa: 'کائوچو، لاستیک و مصنوعات لاستیکی', section: 'Section VII', sectionFa: 'بخش ۷: پلاستیک، لاستیک و پلیمرها' },

  // Section VIII: Raw hides and skins, leather (41-43)
  { code: '41', nameEn: 'Raw hides and skins (other than furskins) and leather', nameFa: 'پوست‌های خام، چرم و سالامبور', section: 'Section VIII', sectionFa: 'بخش ۸: پوست و چرم' },
  { code: '42', nameEn: 'Articles of leather; saddlery and harness; travel goods, handbags', nameFa: 'مصنوعات چرمی، کیف، چمدان و زین‌سازی', section: 'Section VIII', sectionFa: 'بخش ۸: پوست و چرم' },
  { code: '43', nameEn: 'Furskins and artificial fur; manufactures thereof', nameFa: 'پوست‌های نرمینه‌دار و خز', section: 'Section VIII', sectionFa: 'بخش ۸: پوست و چرم' },

  // Section IX: Wood and articles of wood (44-46)
  { code: '44', nameEn: 'Wood and articles of wood; wood charcoal', nameFa: 'چوب، تخته، الوار و مصنوعات چوبی', section: 'Section IX', sectionFa: 'بخش ۹: چوب، کاغذ و صنایع وابسته' },
  { code: '47', nameEn: 'Pulp of wood or of other fibrous cellulosic material', nameFa: 'خمیر چوب و مواد سلولزی', section: 'Section X', sectionFa: 'بخش ۱۰: خمیر چوب، کاغذ و مقوا' },
  { code: '48', nameEn: 'Paper and paperboard; articles of paper pulp, paper or paperboard', nameFa: 'کاغذ، مقوا و مصنوعات کاغذی', section: 'Section X', sectionFa: 'بخش ۱۰: خمیر چوب، کاغذ و مقوا' },
  { code: '49', nameEn: 'Printed books, newspapers, pictures and other products of the printing industry', nameFa: 'کتاب‌ها، روزنامه‌ها و محصولات چاپی', section: 'Section X', sectionFa: 'بخش ۱۰: خمیر چوب، کاغذ و مقوا' },

  // Section XI: Textiles and textile articles (50-63)
  { code: '50', nameEn: 'Silk', nameFa: 'ابریشم و نخ ابریشمی', section: 'Section XI', sectionFa: 'بخش ۱۱: منسوجات و پوشاک' },
  { code: '51', nameEn: 'Wool, fine or coarse animal hair; horsehair yarn and woven fabric', nameFa: 'پشم، موی نرم یا زبر حیوان', section: 'Section XI', sectionFa: 'بخش ۱۱: منسوجات و پوشاک' },
  { code: '52', nameEn: 'Cotton', nameFa: 'پنبه، نخ پنبه‌ای و پارچه‌های پنبه‌ای', section: 'Section XI', sectionFa: 'بخش ۱۱: منسوجات و پوشاک' },
  { code: '54', nameEn: 'Man-made filaments; strip and the like of man-made textile materials', nameFa: 'الیاف سنتتیک و مصنوعی یکسره', section: 'Section XI', sectionFa: 'بخش ۱۱: منسوجات و پوشاک' },
  { code: '55', nameEn: 'Man-made staple fibres', nameFa: 'الیاف سنتتیک و مصنوعی غیریکسره', section: 'Section XI', sectionFa: 'بخش ۱۱: منسوجات و پوشاک' },
  { code: '57', nameEn: 'Carpets and other textile floor coverings', nameFa: 'فرش، قالیچه و سایر کف‌پوش‌های نساجی', section: 'Section XI', sectionFa: 'بخش ۱۱: منسوجات و پوشاک' },
  { code: '61', nameEn: 'Articles of apparel and clothing accessories, knitted or crocheted', nameFa: 'لباس و پوشاک بافتنی یا قلاب‌بافی', section: 'Section XI', sectionFa: 'بخش ۱۱: منسوجات و پوشاک' },
  { code: '62', nameEn: 'Articles of apparel and clothing accessories, not knitted or crocheted', nameFa: 'لباس و پوشاک غیربافتنی (پارچه‌ای)', section: 'Section XI', sectionFa: 'بخش ۱۱: منسوجات و پوشاک' },
  { code: '63', nameEn: 'Other made-up textile articles; sets; worn clothing', nameFa: 'سایر مصنوعات نساجی، پتو، منسوجات مستعمل', section: 'Section XI', sectionFa: 'بخش ۱۱: منسوجات و پوشاک' },

  // Section XII: Footwear, headgear, umbrellas (64-67)
  { code: '64', nameEn: 'Footwear, gaiters and the like; parts of such articles', nameFa: 'کفش، گت و اجزای آن', section: 'Section XII', sectionFa: 'بخش ۱۲: کفش، کلاه، چتر و سرپوش' },

  // Section XIII: Articles of stone, plaster, cement, asbestos, mica; ceramic; glass (68-70)
  { code: '68', nameEn: 'Articles of stone, plaster, cement, asbestos, mica', nameFa: 'مصنوعات از سنگ، گچ، سیمان، میکا', section: 'Section XIII', sectionFa: 'بخش ۱۳: سرامیک، سنگ و شیشه' },
  { code: '69', nameEn: 'Ceramic products', nameFa: 'محصولات سرامیکی، کاشی و سفال', section: 'Section XIII', sectionFa: 'بخش ۱۳: سرامیک، سنگ و شیشه' },
  { code: '70', nameEn: 'Glass and glassware', nameFa: 'شیشه و مصنوعات شیشه‌ای', section: 'Section XIII', sectionFa: 'بخش ۱۳: سرامیک، سنگ و شیشه' },

  // Section XIV: Precious metals, jewellery (71)
  { code: '71', nameEn: 'Natural/cultured pearls, precious stones, precious metals (Gold/Silver)', nameFa: 'مروارید، سنگ‌های قیمتی، طلا، نقره و جواهرات', section: 'Section XIV', sectionFa: 'بخش ۱۴: طلا، جواهرات و فلزات گرانبها' },

  // Section XV: Base metals and articles of base metal (72-83)
  { code: '72', nameEn: 'Iron and steel', nameFa: 'چدن، آهن و فولاد', section: 'Section XV', sectionFa: 'بخش ۱۵: فلزات معمولی و فولاد' },
  { code: '73', nameEn: 'Articles of iron or steel', nameFa: 'مصنوعات از چدن، آهن یا فولاد (لوله، سازه)', section: 'Section XV', sectionFa: 'بخش ۱۵: فلزات معمولی و فولاد' },
  { code: '74', nameEn: 'Copper and articles thereof', nameFa: 'مس و مصنوعات مسی', section: 'Section XV', sectionFa: 'بخش ۱۵: فلزات معمولی و فولاد' },
  { code: '76', nameEn: 'Aluminium and articles thereof', nameFa: 'آلومینیوم و مصنوعات آلومینیومی', section: 'Section XV', sectionFa: 'بخش ۱۵: فلزات معمولی و فولاد' },
  { code: '78', nameEn: 'Lead and articles thereof', nameFa: 'سرب و مصنوعات سربی', section: 'Section XV', sectionFa: 'بخش ۱۵: فلزات معمولی و فولاد' },
  { code: '79', nameEn: 'Zinc and articles thereof', nameFa: 'روی و مصنوعات روی', section: 'Section XV', sectionFa: 'بخش ۱۵: فلزات معمولی و فولاد' },

  // Section XVI: Machinery and mechanical appliances; electrical equipment (84-85)
  { code: '84', nameEn: 'Nuclear reactors, boilers, machinery and mechanical appliances; parts', nameFa: 'راکتورها، بویلرها، ماشین‌آلات مکانیکی و قطعات', section: 'Section XVI', sectionFa: 'بخش ۱۶: ماشین‌آلات و تجهیزات الکترونیکی' },
  { code: '85', nameEn: 'Electrical machinery and equipment and parts; telecommunications, chips', nameFa: 'ماشین‌آلات برقی، تراشه‌ها، موبایل و الکترونیک', section: 'Section XVI', sectionFa: 'بخش ۱۶: ماشین‌آلات و تجهیزات الکترونیکی' },

  // Section XVII: Vehicles, aircraft, vessels and associated transport equipment (86-89)
  { code: '86', nameEn: 'Railway or tramway locomotives, rolling stock and parts', nameFa: 'لوکوموتیوهای راه‌آهن، واگن‌ها و قطعات ریلی', section: 'Section XVII', sectionFa: 'بخش ۱۷: خودرو، هوانوردی و حمل‌ونقل' },
  { code: '87', nameEn: 'Vehicles other than railway or tramway rolling stock, and parts', nameFa: 'خودروها، کامیون‌ها، تریلرها و قطعات یدکی', section: 'Section XVII', sectionFa: 'بخش ۱۷: خودرو، هوانوردی و حمل‌ونقل' },
  { code: '88', nameEn: 'Aircraft, spacecraft, and parts thereof', nameFa: 'هواپیماها، فضاپیماها و قطعات هوانوردی', section: 'Section XVII', sectionFa: 'بخش ۱۷: خودرو، هوانوردی و حمل‌ونقل' },
  { code: '89', nameEn: 'Ships, boats and floating structures', nameFa: 'کشتی‌ها، قایق‌ها و شناورهای دریایی', section: 'Section XVII', sectionFa: 'بخش ۱۷: خودرو، هوانوردی و حمل‌ونقل' },

  // Section XVIII: Optical, photographic, cinematographic, measuring, checking, medical instruments (90-92)
  { code: '90', nameEn: 'Optical, photographic, medical or surgical instruments and apparatus', nameFa: 'تجهیزات پزشکی، جراحی، سنجش دقیق و اپتیک', section: 'Section XVIII', sectionFa: 'بخش ۱۸: تجهیزات پزشکی و ابزار دقیق' },
  { code: '91', nameEn: 'Clocks and watches and parts thereof', nameFa: 'ساعت‌ها و قطعات ساعت', section: 'Section XVIII', sectionFa: 'بخش ۱۸: تجهیزات پزشکی و ابزار دقیق' },

  // Section XX: Miscellaneous manufactured articles (94-96)
  { code: '94', nameEn: 'Furniture; bedding, mattresses; lamps, lighting fittings; prefabricated buildings', nameFa: 'مبلمان، لوازم خواب، چراغ‌ها و ساختمان پیش‌ساخته', section: 'Section XX', sectionFa: 'بخش ۲۰: مصنوعات گوناگون' },
  { code: '95', nameEn: 'Toys, games and sports requisites; parts and accessories thereof', nameFa: 'اسباب‌بازی‌ها، بازی‌ها و لوازم ورزشی', section: 'Section XX', sectionFa: 'بخش ۲۰: مصنوعات گوناگون' }
];

export function searchHsChapters(query: string, lang: 'fa' | 'en' = 'fa'): HsChapter[] {
  if (!query || query.trim() === '') return ALL_HS_CHAPTERS;
  const q = query.toLowerCase().trim();
  return ALL_HS_CHAPTERS.filter(c => 
    c.code.includes(q) ||
    c.nameFa.toLowerCase().includes(q) ||
    c.nameEn.toLowerCase().includes(q) ||
    c.sectionFa.toLowerCase().includes(q) ||
    c.section.toLowerCase().includes(q)
  );
}

export interface DetailedCommodity {
  code: string;
  nameFa: string;
  nameEn: string;
  chapter: string;
  categoryFa: string;
}

export const DETAILED_COMMODITIES: DetailedCommodity[] = [
  // کشاورزی و مواد غذایی
  { code: '091020', nameFa: 'زعفران (ساییده یا نساییده)', nameEn: 'Saffron', chapter: '09', categoryFa: 'محصولات کشاورزی و ادویه' },
  { code: '080251', nameFa: 'پسته با پوست تازه یا خشک', nameEn: 'Pistachios, in shell', chapter: '08', categoryFa: 'خشکبار و میوه' },
  { code: '080252', nameFa: 'مغز پسته تازه یا خشک', nameEn: 'Pistachios, shelled', chapter: '08', categoryFa: 'خشکبار و میوه' },
  { code: '080410', nameFa: 'خرما (مضافتی، کبکاب، زاهدی، پیارم)', nameEn: 'Dates, fresh or dried', chapter: '08', categoryFa: 'خشکبار و میوه' },
  { code: '080620', nameFa: 'کشمش و انگور خشک‌کرده', nameEn: 'Grapes, dried (Raisins)', chapter: '08', categoryFa: 'خشکبار و میوه' },
  { code: '080231', nameFa: 'گردو با پوست', nameEn: 'Walnuts, in shell', chapter: '08', categoryFa: 'خشکبار و میوه' },
  { code: '080211', nameFa: 'بادام با پوست', nameEn: 'Almonds, in shell', chapter: '08', categoryFa: 'خشکبار و میوه' },
  { code: '0902', nameFa: 'چای سیاه و سبز', nameEn: 'Tea, black and green', chapter: '09', categoryFa: 'نوشیدنی و ادویه' },
  { code: '1001', nameFa: 'گندم و مسلین', nameEn: 'Wheat and meslin', chapter: '10', categoryFa: 'غلات' },
  { code: '1006', nameFa: 'برنج (دانه کامل، نیم‌دانه)', nameEn: 'Rice', chapter: '10', categoryFa: 'غلات' },
  { code: '1005', nameFa: 'ذرت دامی', nameEn: 'Maize (Corn)', chapter: '10', categoryFa: 'غلات و خوراک دام' },
  { code: '1003', nameFa: 'جو خوراکی و دامی', nameEn: 'Barley', chapter: '10', categoryFa: 'غلات' },
  { code: '1201', nameFa: 'دانه سویا', nameEn: 'Soya beans', chapter: '12', categoryFa: 'دانه‌های روغنی' },
  { code: '1507', nameFa: 'روغن سویا و کسرهای آن', nameEn: 'Soya-bean oil', chapter: '15', categoryFa: 'روغن‌های خوراکی' },
  { code: '1512', nameFa: 'روغن آفتابگردان، گلرنگ یا پنبه‌دانه', nameEn: 'Sunflower-seed oil', chapter: '15', categoryFa: 'روغن‌های خوراکی' },
  { code: '0406', nameFa: 'پنیر و دلمه شیر', nameEn: 'Cheese and curd', chapter: '04', categoryFa: 'لبنیات' },
  { code: '0402', nameFa: 'شیر خشک و تغلیظ‌شده', nameEn: 'Milk and cream, concentrated', chapter: '04', categoryFa: 'لبنیات' },
  { code: '1701', nameFa: 'شکر نیشکر یا چغندرقند خام و تصفیه‌شده', nameEn: 'Cane or beet sugar', chapter: '17', categoryFa: 'شکر و شیرینی' },
  { code: '200290', nameFa: 'رب گوجه‌فرنگی و کنسرو گوجه', nameEn: 'Tomatoes, prepared/preserved (Paste)', chapter: '20', categoryFa: 'صنایع تبدیلی' },
  { code: '070310', nameFa: 'پیاز و موسیر تازه', nameEn: 'Onions and shallots, fresh', chapter: '07', categoryFa: 'سبزیجات و صیفی‌جات' },
  { code: '070200', nameFa: 'گوجه‌فرنگی تازه یا سردکرده', nameEn: 'Tomatoes, fresh or chilled', chapter: '07', categoryFa: 'سبزیجات و صیفی‌جات' },
  { code: '080810', nameFa: 'سیب درختی تازه', nameEn: 'Apples, fresh', chapter: '08', categoryFa: 'میوه‌های تازه' },
  { code: '080510', nameFa: 'پرتقال و مرکبات تازه', nameEn: 'Oranges, fresh', chapter: '08', categoryFa: 'میوه‌های تازه' },
  { code: '030617', nameFa: 'میگو منجمد پرورشی و دریایی', nameEn: 'Shrimps and prawns, frozen', chapter: '03', categoryFa: 'آبزیان و شیلات' },
  { code: '0302', nameFa: 'ماهی تازه یا سردکرده (قزل‌آلا و خاویاری)', nameEn: 'Fish, fresh or chilled', chapter: '03', categoryFa: 'آبزیان و شیلات' },
  { code: '160431', nameFa: 'خاویار طبیعی و بدل خاویار', nameEn: 'Caviar and caviar substitutes', chapter: '16', categoryFa: 'آبزیان و شیلات' },

  // پتروشیمی، شیمیایی و پلیمر
  { code: '390110', nameFa: 'پلی‌اتیلن سبک خطی و سنگین (با دانسیته کمتر از ۰.۹۴)', nameEn: 'Polyethylene, density < 0.94', chapter: '39', categoryFa: 'پلیمرها و پلاستیک' },
  { code: '390120', nameFa: 'پلی‌اتیلن سنگین (با دانسیته ۰.۹۴ یا بیشتر)', nameEn: 'Polyethylene, density >= 0.94', chapter: '39', categoryFa: 'پلیمرها و پلاستیک' },
  { code: '390210', nameFa: 'پلی‌پروپیلن به اشکال ابتدایی', nameEn: 'Polypropylene, in primary forms', chapter: '39', categoryFa: 'پلیمرها و پلاستیک' },
  { code: '390410', nameFa: 'پلی‌وینیل کلراید (PVC)', nameEn: 'Polyvinyl chloride (PVC)', chapter: '39', categoryFa: 'پلیمرها و پلاستیک' },
  { code: '390760', nameFa: 'پلی‌اتیلن ترفتالات (PET)', nameEn: 'Polyethylene terephthalate (PET)', chapter: '39', categoryFa: 'پلیمرها و پلاستیک' },
  { code: '310210', nameFa: 'کود اوره حتی به صورت محلول در آب', nameEn: 'Urea, whether or not in aqueous solution', chapter: '31', categoryFa: 'کودهای شیمیایی' },
  { code: '3105', nameFa: 'کودهای معدنی یا شیمیایی چندعنصری (NPK, DAP)', nameEn: 'Mineral or chemical fertilisers (NPK)', chapter: '31', categoryFa: 'کودهای شیمیایی' },
  { code: '290511', nameFa: 'متانول (الکل متیلیک)', nameEn: 'Methanol (methyl alcohol)', chapter: '29', categoryFa: 'مواد پتروشیمی و آلی' },
  { code: '290220', nameFa: 'بنزن خالص پتروشیمی', nameEn: 'Benzene', chapter: '29', categoryFa: 'مواد پتروشیمی و آلی' },
  { code: '290241', nameFa: 'اوروتو زایلین و پارازایلین', nameEn: 'Xylenes (o-xylene, p-xylene)', chapter: '29', categoryFa: 'مواد پتروشیمی و آلی' },
  { code: '290121', nameFa: 'اتیلن و پروپیلن گازی', nameEn: 'Ethylene and propylene', chapter: '29', categoryFa: 'مواد پتروشیمی و آلی' },
  { code: '281410', nameFa: 'آمونیاک بدون آب (آنهیدروز)', nameEn: 'Anhydrous ammonia', chapter: '28', categoryFa: 'مواد شیمیایی معدنی' },
  { code: '283620', nameFa: 'کربنات دی‌سدیم (سودا اش سنگین و سبک)', nameEn: 'Disodium carbonate (Soda ash)', chapter: '28', categoryFa: 'مواد شیمیایی معدنی' },
  { code: '281511', nameFa: 'هیدروکسید سدیم (سود سوزآور / کاستیک سودا جامد)', nameEn: 'Sodium hydroxide (caustic soda) solid', chapter: '28', categoryFa: 'مواد شیمیایی معدنی' },

  // سوخت، انرژی، نفت و گاز
  { code: '270900', nameFa: 'نفت خام حاصل از مواد قیری', nameEn: 'Petroleum oils, crude', chapter: '27', categoryFa: 'نفت، گاز و فرآورده‌ها' },
  { code: '271012', nameFa: 'بنزین موتور و نفتای سبک', nameEn: 'Motor spirit (Gasoline) and light oils', chapter: '27', categoryFa: 'نفت، گاز و فرآورده‌ها' },
  { code: '271019', nameFa: 'گازوئیل، نفت سفید، مازوت و روغن‌های روان‌کننده صنعتی', nameEn: 'Gas oils (Diesel), fuel oils, lubricants', chapter: '27', categoryFa: 'نفت، گاز و فرآورده‌ها' },
  { code: '271111', nameFa: 'گاز طبیعی مایع‌شده (LNG)', nameEn: 'Natural gas, liquefied (LNG)', chapter: '27', categoryFa: 'نفت، گاز و فرآورده‌ها' },
  { code: '271112', nameFa: 'پروپان و بوتان مایع‌شده (LPG)', nameEn: 'Propane and butane, liquefied (LPG)', chapter: '27', categoryFa: 'نفت، گاز و فرآورده‌ها' },
  { code: '271320', nameFa: 'قیر نفت (بیتومن صادراتی ۶۰/۷۰ و ۸۵/۱۰۰)', nameEn: 'Petroleum bitumen', chapter: '27', categoryFa: 'نفت، گاز و فرآورده‌ها' },

  // فلزات، فولاد و مصالح ساختمانی
  { code: '7207', nameFa: 'شمش، بیلت و بلوم فولادی', nameEn: 'Semi-finished products of iron or non-alloy steel (Billets)', chapter: '72', categoryFa: 'فولاد و فلزات پایه' },
  { code: '7213', nameFa: 'میلگرد آجدار و کلاف فولادی گرم‌نوردیده', nameEn: 'Bars and rods of iron or non-alloy steel (Rebar)', chapter: '72', categoryFa: 'فولاد و فلزات پایه' },
  { code: '7208', nameFa: 'ورق فولادی گرم‌نوردیده (کلاف گرم و شیت)', nameEn: 'Flat-rolled products of iron/steel, hot-rolled', chapter: '72', categoryFa: 'فولاد و فلزات پایه' },
  { code: '7209', nameFa: 'ورق فولادی سرد‌نوردیده (روغنی)', nameEn: 'Flat-rolled products of iron/steel, cold-rolled', chapter: '72', categoryFa: 'فولاد و فلزات پایه' },
  { code: '7210', nameFa: 'ورق فولادی گالوانیزه و رنگی', nameEn: 'Flat-rolled products of iron/steel, clad/plated (Galvanized)', chapter: '72', categoryFa: 'فولاد و فلزات پایه' },
  { code: '7203', nameFa: 'آهن اسفنجی (DRI) و گلوله‌های متالیزه', nameEn: 'Ferrous products obtained by direct reduction (DRI / Sponge Iron)', chapter: '72', categoryFa: 'فولاد و فلزات پایه' },
  { code: '260111', nameFa: 'سنگ آهن و کنسانتره سنگ آهن غیرآگلومره', nameEn: 'Iron ores and concentrates, non-agglomerated', chapter: '26', categoryFa: 'مواد معدنی' },
  { code: '260112', nameFa: 'گندله سنگ آهن آگلومره', nameEn: 'Iron ore pellets (Agglomerated)', chapter: '26', categoryFa: 'مواد معدنی' },
  { code: '740311', nameFa: 'کاتد مس تصفیه‌شده و مقاطع مس', nameEn: 'Copper cathodes and sections of cathodes', chapter: '74', categoryFa: 'مس و فلزات رنگین' },
  { code: '760110', nameFa: 'شمش آلومینیوم خالص', nameEn: 'Aluminium, not alloyed, unwrought', chapter: '76', categoryFa: 'آلومینیوم و فلزات رنگین' },
  { code: '790111', nameFa: 'شمش روی خالص (با عیار ۹۹.۹۹٪)', nameEn: 'Zinc, not alloyed, unwrought', chapter: '79', categoryFa: 'روی و فلزات رنگین' },
  { code: '780110', nameFa: 'شمش سرب تصفیه‌شده', nameEn: 'Lead, refined, unwrought', chapter: '78', categoryFa: 'سرب و فلزات رنگین' },
  { code: '252329', nameFa: 'سیمان پرتلند خاکستری و کلینکر', nameEn: 'Portland cement (Grey & Clinker)', chapter: '25', categoryFa: 'مصالح ساختمانی' },
  { code: '252310', nameFa: 'کلینکر سیمان', nameEn: 'Cement clinkers', chapter: '25', categoryFa: 'مصالح ساختمانی' },
  { code: '6907', nameFa: 'کاشی و سرامیک پرسلان، کف و دیوار', nameEn: 'Ceramic flags and paving, hearth or wall tiles', chapter: '69', categoryFa: 'کاشی و سرامیک' },
  { code: '6802', nameFa: 'سنگ‌های ساختمانی کارشده، گرانیت، مرمر و تراورتن', nameEn: 'Worked monumental or building stone (Marble, Travertine)', chapter: '68', categoryFa: 'سنگ‌های ساختمانی' },
  { code: '2515', nameFa: 'کوپ سنگ مرمر و تراورتن خام', nameEn: 'Marble and travertine, raw blocks', chapter: '25', categoryFa: 'سنگ‌های ساختمانی' },
  { code: '7005', nameFa: 'شیشه فلوت ساختمانی و شیشه جام تخت', nameEn: 'Float glass and surface ground/polished glass', chapter: '70', categoryFa: 'شیشه و بلور' },

  // منسوجات، فرش و صنایع دستی
  { code: '570110', nameFa: 'فرش دستباف پشمی یا کرکی ایرانی', nameEn: 'Carpets of wool or fine animal hair, knotted (Handmade)', chapter: '57', categoryFa: 'فرش و صنایع دستی' },
  { code: '570190', nameFa: 'فرش دستباف ابریشمی', nameEn: 'Carpets of silk, knotted', chapter: '57', categoryFa: 'فرش و صنایع دستی' },
  { code: '570242', nameFa: 'فرش ماشینی اکریلیک و پلی‌استر', nameEn: 'Carpets of man-made textile materials, woven (Machine-made)', chapter: '57', categoryFa: 'فرش ماشینی' },
  { code: '5201', nameFa: 'پنبه حلاجی‌نشده خام', nameEn: 'Cotton, not carded or combed', chapter: '52', categoryFa: 'منسوجات' },
  { code: '5205', nameFa: 'نخ پنبه‌ای یک‌لا و چندلا', nameEn: 'Cotton yarn (other than sewing thread)', chapter: '52', categoryFa: 'منسوجات' },

  // دارو، تجهیزات پزشکی و شیمیایی
  { code: '3004', nameFa: 'داروهای آماده مصرف انسانی و حیوانی', nameEn: 'Medicaments consisting of mixed or unmixed products for therapeutic use', chapter: '30', categoryFa: 'دارو و درمان' },
  { code: '3002', nameFa: 'واکسن‌ها، سرم‌های خونی و محصولات بیوتکنولوژی', nameEn: 'Human blood; animal blood; antisera; vaccines', chapter: '30', categoryFa: 'دارو و درمان' },
  { code: '9018', nameFa: 'ابزارها و وسایل پزشکی، جراحی، دندانپزشکی و سونوگرافی', nameEn: 'Instruments and appliances used in medical, surgical or veterinary sciences', chapter: '90', categoryFa: 'تجهیزات پزشکی' },

  // ماشین‌آلات، تجهیزات، خودرو و الکترونیک
  { code: '8471', nameFa: 'رایانه‌ها، لپ‌تاپ‌ها، سرورها و ماشین‌های خودکار داده‌پردازی', nameEn: 'Automatic data processing machines (Computers, Laptops)', chapter: '84', categoryFa: 'رایانه و فناوری اطلاعات' },
  { code: '851713', nameFa: 'گوشی‌های تلفن همراه هوشمند (Smartphones)', nameEn: 'Smartphones and mobile phones', chapter: '85', categoryFa: 'الکترونیک و مخابرات' },
  { code: '854231', nameFa: 'مدارهای مجتمع الکترونیکی (پردازنده‌ها، تراشه‌ها و آی‌سی)', nameEn: 'Electronic integrated circuits (Processors and controllers)', chapter: '85', categoryFa: 'الکترونیک و نیمه‌هادی‌ها' },
  { code: '8703', nameFa: 'خودروهای سواری بنزینی، هیبریدی و برقی', nameEn: 'Motor cars and other motor vehicles (Passenger Cars)', chapter: '87', categoryFa: 'خودرو و حمل‌ونقل' },
  { code: '8708', nameFa: 'قطعات و لوازم یدکی بدنه، موتور و سیستم تعلیق خودرو', nameEn: 'Parts and accessories of motor vehicles', chapter: '87', categoryFa: 'لوازم یدکی خودرو' },
  { code: '8704', nameFa: 'کامیون‌ها، کشنده‌ها و خودروهای باری', nameEn: 'Motor vehicles for the transport of goods (Trucks)', chapter: '87', categoryFa: 'خودروهای تجاری و سنگین' },
  { code: '8418', nameFa: 'یخچال و فریزرهای خانگی و صنعتی', nameEn: 'Refrigerators, freezers and other refrigerating equipment', chapter: '84', categoryFa: 'لوازم خانگی و سرمایشی' },
  { code: '8450', nameFa: 'ماشین‌های لباسشویی خانگی و صنعتی', nameEn: 'Household or laundry-type washing machines', chapter: '84', categoryFa: 'لوازم خانگی' },
  { code: '852872', nameFa: 'تلویزیون‌های هوشمند و گیرنده‌های تصویری', nameEn: 'Reception apparatus for television, colour', chapter: '85', categoryFa: 'صوتی و تصویری' },
  { code: '8544', nameFa: 'سیم‌ها و کابل‌های برق عایق‌بندی‌شده و کابل فیبر نوری', nameEn: 'Insulated wire, cable and optical fibre cables', chapter: '85', categoryFa: 'برق و کابل' },
  { code: '850440', nameFa: 'ترانسفورماتورها، مبدل‌های استاتیک، اینورتر و یوپی‌اس', nameEn: 'Static converters (Inverters, Rectifiers, UPS)', chapter: '85', categoryFa: 'تجهیزات برقی و نیروگاهی' }
];

export function searchAllHsCommodities(query: string, lang: 'fa' | 'en' = 'fa'): Array<{
  code: string;
  nameFa: string;
  nameEn: string;
  chapter: string;
  categoryFa: string;
  type: 'chapter' | 'subheading';
}> {
  if (!query || query.trim() === '') {
    return [
      ...DETAILED_COMMODITIES.slice(0, 20).map(d => ({ ...d, type: 'subheading' as const })),
      ...ALL_HS_CHAPTERS.slice(0, 15).map(c => ({
        code: c.code,
        nameFa: `فصل ${c.code}: ${c.nameFa}`,
        nameEn: `Chapter ${c.code}: ${c.nameEn}`,
        chapter: c.code,
        categoryFa: c.sectionFa,
        type: 'chapter' as const
      }))
    ];
  }

  const q = query.toLowerCase().trim();

  const matchingDetailed = DETAILED_COMMODITIES.filter(d =>
    d.code.toLowerCase().includes(q) ||
    d.nameFa.toLowerCase().includes(q) ||
    d.nameEn.toLowerCase().includes(q) ||
    d.categoryFa.toLowerCase().includes(q)
  ).map(d => ({ ...d, type: 'subheading' as const }));

  const matchingChapters = ALL_HS_CHAPTERS.filter(c =>
    c.code.toLowerCase().includes(q) ||
    c.nameFa.toLowerCase().includes(q) ||
    c.nameEn.toLowerCase().includes(q) ||
    c.sectionFa.toLowerCase().includes(q)
  ).map(c => ({
    code: c.code,
    nameFa: `فصل ${c.code}: ${c.nameFa}`,
    nameEn: `Chapter ${c.code}: ${c.nameEn}`,
    chapter: c.code,
    categoryFa: c.sectionFa,
    type: 'chapter' as const
  }));

  return [...matchingDetailed, ...matchingChapters];
}

