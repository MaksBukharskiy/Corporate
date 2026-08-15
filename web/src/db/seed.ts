import type {
  BenefitRequest,
  Category,
  Company,
  CompanyPrice,
  Gender,
  Interest,
  Merchant,
  MerchantReview,
  Offer,
  Partnership,
  RequestStatus,
  Transaction,
  User,
} from '../types';
import type { CorporateDb } from './schema';
import { DB_VERSION } from './schema';

export const interests: Interest[] = [
  { id: 'gym', title: 'Зал', category: 'sport' },
  { id: 'yoga', title: 'Йога', category: 'sport' },
  { id: 'lunch', title: 'Обеды', category: 'food' },
  { id: 'coffee', title: 'Кофе-брейк', category: 'food' },
  { id: 'courses', title: 'Курсы', category: 'education' },
  { id: 'meetups', title: 'Митапы', category: 'education' },
  { id: 'health', title: 'Здоровье', category: 'health' },
  { id: 'parking', title: 'Парковка', category: 'transport' },
  { id: 'shuttle', title: 'Трансфер', category: 'transport' },
  { id: 'fest', title: 'Фестивали', category: 'events' },
  { id: 'teambuild', title: 'Тимбилдинг', category: 'events' },
  { id: 'office', title: 'Офис', category: 'events' },
];

const INTEREST_IDS = interests.map((i) => i.id);

const companies: Company[] = [
  { id: 'c1', name: 'Corporate', tenantId: 'tenant-corporate', status: 'Active', city: 'Ташкент' },
  { id: 'c2', name: 'Uzum Tech', tenantId: 'tenant-uzum', status: 'Pending', city: 'Ташкент' },
  { id: 'c3', name: 'Kapitalbank', tenantId: 'tenant-kapitalbank', status: 'Active', city: 'Ташкент' },
  { id: 'c4', name: 'Payme', tenantId: 'tenant-payme', status: 'Active', city: 'Ташкент' },
  { id: 'c5', name: 'Korzinka', tenantId: 'tenant-korzinka', status: 'Active', city: 'Ташкент' },
  { id: 'c6', name: 'Beeline Uzbekistan', tenantId: 'tenant-beeline', status: 'Active', city: 'Ташкент' },
  { id: 'c7', name: 'EPAM Tashkent', tenantId: 'tenant-epam', status: 'Active', city: 'Ташкент' },
];

function merchant(
  id: string,
  name: string,
  city: string,
  category: Category,
  verified: boolean,
  phone: string,
  about: string,
  services: string,
  coverUrl?: string,
  gallery?: string[],
): Merchant {
  return { id, name, city, category, verified, rejected: false, phone, about, services, coverUrl, gallery };
}

const merchants: Merchant[] = [
  merchant('m1', 'FitZone Premium', 'Ташкент', 'sport', true, '+998 71 200 01 01', 'Сеть залов с бассейном и групповыми занятиями.', 'Зал, бассейн, персональные тренировки'),
  merchant('m2', 'Osh Markazi', 'Ташкент', 'food', true, '+998 71 200 02 02', 'Корпоративные обеды рядом с бизнес-центрами.', 'Бизнес-ланч, пятничная пицца, доставка'),
  merchant(
    'm3',
    'IT Academy Pro',
    'Ташкент',
    'education',
    true,
    '+998 71 200 03 03',
    'Кампус на Навои и онлайн-потоки. Шесть практических курсов для команд: Python, UI/UX, Data Science, веб, мобильная разработка и QA. Группы до 16 человек, проект в каждом модуле.',
    'Python, UI/UX Design, Data Science, Web Development, Mobile App Dev, QA Engineering',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80',
    [
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    ],
  ),
  merchant('m4', 'MedPlus Clinic', 'Ташкент', 'health', false, '+998 71 200 04 04', 'Клиника чекапов и выездных бригад.', 'Чекап, вакцинация, консультации'),
  merchant('m5', 'City Parking', 'Ташкент', 'transport', true, '+998 71 200 05 05', 'Крытые парковки у офисных кварталов.', 'Месячный абонемент, гостевые места'),
  merchant('m6', 'EventLab Tashkent', 'Ташкент', 'events', true, '+998 71 200 06 06', 'Городские фестивали и командные билеты.', 'Фестивали, корпоративные вечера'),
  merchant('m7', 'Yoga House', 'Ташкент', 'sport', true, '+998 71 200 07 07', 'Йога в студии и выезд в офис.', 'Хатха, виньяса, офисные занятия'),
  merchant('m8', 'Samarkand Arena', 'Самарканд', 'sport', true, '+998 66 200 08 08', 'Зал для командировок в Самарканде.', 'Корп. абонемент, групповые занятия'),
  merchant('m9', 'Plov Nation', 'Самарканд', 'food', true, '+998 66 200 09 09', 'Плов и сеты на команду с доставкой.', 'Плов на 10 человек, офисная доставка'),
  merchant('m10', 'Coffee Lab', 'Ташкент', 'food', true, '+998 71 200 10 10', 'Кофейня с корпоративными картами.', 'Кофе-карта, зёрна в офис'),
  merchant('m11', 'Skillbox UZ', 'Ташкент', 'education', false, '+998 71 200 11 11', 'Онлайн-курсы продуктовой аналитики.', 'SQL, метрики, продуктовые треки'),
  merchant('m12', 'English Hub', 'Бухара', 'education', true, '+998 65 200 12 12', 'Английский для специалистов.', 'Группы B2, разговорные клубы'),
  merchant('m13', 'Smile Dental', 'Ташкент', 'health', true, '+998 71 200 13 13', 'Стоматология для сотрудников компаний.', 'Осмотр, гигиена, лечение'),
  merchant('m14', 'Wellness Spa', 'Самарканд', 'health', false, '+998 66 200 14 14', 'SPA для команд в командировке.', 'Массаж, хаммам, SPA-день'),
  merchant('m15', 'Yandex Go Corp', 'Ташкент', 'transport', true, '+998 71 200 15 15', 'Корпоративные поездки до офиса.', 'Лимит поездок, отчёты для HR'),
  merchant('m16', 'Metro Shuttle', 'Ташкент', 'transport', true, '+998 71 200 16 16', 'Шаттл от метро до офисных парков.', 'Утренние и вечерние рейсы'),
  merchant('m17', 'Jazz Office Fest', 'Ташкент', 'events', true, '+998 71 200 17 17', 'Джаз-вечера для офисных команд.', 'Билеты Friday Jazz, площадка'),
  merchant('m18', 'Teambuild.uz', 'Наманган', 'events', false, '+998 69 200 18 18', 'Выезды и квесты для команд.', 'Озеро, городской квест, фасилитация'),
];

const PEOPLE: { name: string; slug: string; job: string }[] = [
  { name: 'Ali Karimov', slug: 'ali.karimov', job: 'Backend-разработчик' },
  { name: 'Dilnoza Saidova', slug: 'dilnoza.saidova', job: 'Product designer' },
  { name: 'Jasur Rakhimov', slug: 'jasur.rakhimov', job: 'QA engineer' },
  { name: 'Madina Yusupova', slug: 'madina.yusupova', job: 'People partner' },
  { name: 'Timur Alimov', slug: 'timur.alimov', job: 'Sales' },
  { name: 'Nilufar Karimova', slug: 'nilufar.karimova', job: 'Marketing' },
  { name: 'Aziz Tursunov', slug: 'aziz.tursunov', job: 'iOS engineer' },
  { name: 'Kamola Nazarova', slug: 'kamola.nazarova', job: 'Frontend-разработчик' },
  { name: 'Bobur Ismailov', slug: 'bobur.ismailov', job: 'DevOps' },
  { name: 'Sevara Abdullaeva', slug: 'sevara.abdullaeva', job: 'Data analyst' },
  { name: 'Rustam Ergashev', slug: 'rustam.ergashev', job: 'Android engineer' },
  { name: 'Malika Mirzaeva', slug: 'malika.mirzaeva', job: 'Product manager' },
  { name: 'Sherzod Khasanov', slug: 'sherzod.khasanov', job: 'Team lead' },
  { name: 'Nodira Usmanova', slug: 'nodira.usmanova', job: 'Accountant' },
  { name: 'Farrukh Rakhmonov', slug: 'farrukh.rakhmonov', job: 'Legal counsel' },
  { name: 'Zilola Akhmedova', slug: 'zilola.akhmedova', job: 'Support lead' },
  { name: 'Jamshid Sattorov', slug: 'jamshid.sattorov', job: 'Finance' },
  { name: 'Gulnora Ibragimova', slug: 'gulnora.ibragimova', job: 'Recruiter' },
  { name: 'Otabek Nematov', slug: 'otabek.nematov', job: 'Office manager' },
  { name: 'Sabina Ganieva', slug: 'sabina.ganieva', job: 'Copywriter' },
  { name: 'Bekzod Pulatov', slug: 'bekzod.pulatov', job: 'SRE' },
  { name: 'Nigora Kadyrova', slug: 'nigora.kadyrova', job: 'UX researcher' },
  { name: 'Ulugbek Sobirov', slug: 'ulugbek.sobirov', job: 'Security engineer' },
  { name: 'Lola Rashidova', slug: 'lola.rashidova', job: 'Business analyst' },
  { name: 'Anvar Mukhammedov', slug: 'anvar.mukhammedov', job: 'Account manager' },
  { name: 'Shahnoza Alieva', slug: 'shahnoza.alieva', job: 'HR coordinator' },
  { name: 'Diyor Rasulov', slug: 'diyor.rasulov', job: 'Data engineer' },
  { name: 'Munisa Sharipova', slug: 'munisa.sharipova', job: 'Content lead' },
  { name: 'Sardor Yunusov', slug: 'sardor.yunusov', job: 'Network engineer' },
  { name: 'Feruza Mahmudova', slug: 'feruza.mahmudova', job: 'Procurement' },
];

function pickInterests(seed: number): string[] {
  const a = INTEREST_IDS[seed % INTEREST_IDS.length];
  const b = INTEREST_IDS[(seed * 3 + 4) % INTEREST_IDS.length];
  const c = INTEREST_IDS[(seed * 5 + 7) % INTEREST_IDS.length];
  const unique = [...new Set([a, b, seed % 4 === 0 ? c : a])];
  return unique.slice(0, seed % 5 === 0 ? 3 : 2);
}

function hashNum(seed: string): number {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 33 + seed.charCodeAt(i)) >>> 0;
  return n;
}

function demoAge(id: string): number {
  return 23 + (hashNum(id) % 20);
}

function demoGender(name: string, id: string): Gender {
  if (hashNum(id) % 11 === 0) return 'unspecified';
  const first = name.split(/\s+/)[0] ?? '';
  const last = name.split(/\s+/).at(-1) ?? '';
  if (/a$/i.test(first) || /(ova|eva|yeva|ieva)$/i.test(last)) return 'female';
  return 'male';
}

function officeCity(companyId: string): string {
  return companies.find((c) => c.id === companyId)?.city ?? 'Ташкент';
}

function personPhone(seed: string): string {
  const seven = String(10000000 + (hashNum(seed) % 9000000)).slice(1);
  return `+998 90 ${seven.slice(0, 3)} ${seven.slice(3, 5)} ${seven.slice(5)}`;
}

function emp(
  id: string,
  name: string,
  email: string,
  companyId: string,
  balance: number,
  interestIds: string[],
  jobTitle: string,
): User {
  return {
    id,
    role: 'employee',
    name,
    email,
    password: '1234',
    companyId,
    phone: personPhone(id),
    balance,
    interestIds,
    jobTitle,
    active: true,
    age: demoAge(id),
    gender: demoGender(name, id),
    city: officeCity(companyId),
  };
}

function staff(companyId: string, domain: string, count: number, offset: number): User[] {
  return Array.from({ length: count }, (_, i) => {
    const person = PEOPLE[(i + offset) % PEOPLE.length];
    const n = i + offset;
    return emp(
      `e-${companyId}-${i + 1}`,
      person.name,
      `${person.slug}@${domain}`,
      companyId,
      2800 + ((n * 730) % 14000),
      pickInterests(n + companyId.charCodeAt(1)),
      person.job,
    );
  });
}

function hrUser(id: string, name: string, email: string, companyId: string, phone: string): User {
  return {
    id,
    role: 'hr',
    name,
    email,
    password: '1234',
    companyId,
    phone,
    balance: 0,
    interestIds: [],
    jobTitle: 'HR / Benefits',
    active: true,
    age: demoAge(id),
    gender: demoGender(name, id),
    city: officeCity(companyId),
  };
}

const users: User[] = [
  hrUser('u-hr', 'Malika HR', 'hr@click.uz', 'c1', '+998 71 150 01 01'),
  hrUser('u-hr-c2', 'Kamola HR Uzum', 'hr@uzum.uz', 'c2', '+998 71 150 02 02'),
  hrUser('u-hr-c3', 'Dilshod HR Kapitalbank', 'hr@kapitalbank.uz', 'c3', '+998 71 150 03 03'),
  hrUser('u-hr-c4', 'Sevara HR Payme', 'hr@payme.uz', 'c4', '+998 71 150 04 04'),
  hrUser('u-hr-c5', 'Jasur HR Korzinka', 'hr@korzinka.uz', 'c5', '+998 71 150 05 05'),
  hrUser('u-hr-c6', 'Nilufar HR Beeline', 'hr@beeline.uz', 'c6', '+998 71 150 06 06'),
  hrUser('u-hr-c7', 'Sherzod HR EPAM', 'hr@epam.uz', 'c7', '+998 71 150 07 07'),
  ...([
    ['u2', 'Nodira FitZone', 'nodira@fitzone.uz', 'm1', 'Менеджер FitZone'],
    ['u-m2', 'Rustam Osh Markazi', 'rustam@oshmarkazi.uz', 'm2', 'Менеджер мерчанта'],
    ['u-m3', 'Aziza IT Academy', 'aziza@itacademy.uz', 'm3', 'Менеджер мерчанта'],
    ['u-m4', 'Shahnoza MedPlus', 'shahnoza@medplus.uz', 'm4', 'Менеджер мерчанта'],
    ['u-m5', 'Otabek City Parking', 'otabek@cityparking.uz', 'm5', 'Менеджер мерчанта'],
    ['u-m6', 'Bekzod EventLab', 'bekzod@eventlab.uz', 'm6', 'Менеджер мерчанта'],
    ['u-m7', 'Madina Yoga House', 'madina@yogahouse.uz', 'm7', 'Менеджер мерчанта'],
    ['u-m8', 'Jasur Arena', 'jasur@arena.uz', 'm8', 'Менеджер мерчанта'],
    ['u-m9', 'Gulnora Plov Nation', 'gulnora@plovnation.uz', 'm9', 'Менеджер мерчанта'],
    ['u-m10', 'Lola Coffee Lab', 'lola@coffeelab.uz', 'm10', 'Менеджер мерчанта'],
    ['u-m11', 'Diyor Skillbox', 'diyor@skillbox.uz', 'm11', 'Менеджер мерчанта'],
    ['u-m12', 'Munisa English Hub', 'munisa@englishhub.uz', 'm12', 'Менеджер мерчанта'],
    ['u-m13', 'Anvar Smile Dental', 'anvar@smiledental.uz', 'm13', 'Менеджер мерчанта'],
    ['u-m14', 'Feruza Wellness', 'feruza@wellness.uz', 'm14', 'Менеджер мерчанта'],
    ['u-m15', 'Sardor Yandex Go', 'sardor@yandexgo.uz', 'm15', 'Менеджер мерчанта'],
    ['u-m16', 'Ulugbek Shuttle', 'ulugbek@shuttle.uz', 'm16', 'Менеджер мерчанта'],
    ['u-m17', 'Nigora Jazz Fest', 'nigora@jazzfest.uz', 'm17', 'Менеджер мерчанта'],
    ['u-m18', 'Bekzod Teambuild', 'bekzod@teambuild.uz', 'm18', 'Менеджер мерчанта'],
  ] as const).map(([id, name, email, merchantId, jobTitle]) => {
    const shop = merchants.find((m) => m.id === merchantId);
    return {
      id,
      role: 'merchant' as const,
      name,
      email,
      password: '1234',
      merchantId,
      phone: shop?.phone ?? personPhone(id),
      balance: 0,
      interestIds: [] as string[],
      jobTitle,
      active: true,
      age: demoAge(id),
      gender: demoGender(name, id),
      city: shop?.city ?? 'Ташкент',
    };
  }),
  {
    id: 'u3',
    role: 'admin',
    name: 'Admin Corporate',
    email: 'admin@click.uz',
    password: '1234',
    phone: '+998 71 150 00 00',
    balance: 0,
    interestIds: [],
    jobTitle: 'Администратор',
    active: true,
    age: 38,
    gender: 'unspecified',
    city: 'Ташкент',
  },
  emp('u1', 'Ali Karimov', 'ali@click.uz', 'c1', 12500, ['gym', 'yoga'], 'Backend-разработчик'),
  emp('u4', 'Dilnoza Saidova', 'dilnoza@click.uz', 'c1', 8200, ['lunch', 'coffee'], 'Product designer'),
  emp('u5', 'Jasur Rakhimov', 'jasur@click.uz', 'c1', 6100, ['courses', 'meetups'], 'QA engineer'),
  emp('u6', 'Madina Yusupova', 'madina@click.uz', 'c1', 9400, ['health', 'yoga'], 'People partner'),
  emp('u7', 'Timur Alimov', 'timur@click.uz', 'c1', 4300, ['parking', 'shuttle'], 'Sales'),
  emp('u8', 'Nilufar Karimova', 'nilufar@click.uz', 'c1', 7100, ['fest', 'teambuild'], 'Marketing'),
  emp('u10', 'Kamola Nazarova', 'kamola@click.uz', 'c1', 5600, ['coffee', 'meetups'], 'Frontend-разработчик'),
  emp('u11', 'Bobur Ismailov', 'bobur@click.uz', 'c1', 10200, ['gym', 'courses'], 'DevOps'),
  emp('u12', 'Sevara Abdullaeva', 'sevara@click.uz', 'c1', 3800, ['lunch', 'office'], 'Data analyst'),
  emp('u13', 'Rustam Ergashev', 'rustam@click.uz', 'c1', 8900, ['health', 'parking'], 'Android engineer'),
  emp('u14', 'Malika Mirzaeva', 'malika@click.uz', 'c1', 6700, ['yoga', 'fest'], 'Product manager'),
  emp('u15', 'Sherzod Khasanov', 'sherzod@click.uz', 'c1', 11400, ['gym', 'teambuild'], 'Team lead'),
  emp('u16', 'Zilola Akhmedova', 'zilola@click.uz', 'c1', 4900, ['shuttle', 'coffee'], 'Support lead'),
  emp('u17', 'Otabek Nematov', 'otabek@click.uz', 'c1', 3200, ['office', 'lunch'], 'Office manager'),
  emp('u9', 'Aziz Uzum', 'aziz@uzum.uz', 'c2', 5000, ['gym', 'courses'], 'iOS engineer'),
  ...staff('c2', 'uzum.uz', 11, 7),
  ...staff('c3', 'kapitalbank.uz', 13, 2),
  ...staff('c4', 'payme.uz', 11, 9),
  ...staff('c5', 'korzinka.uz', 15, 4),
  ...staff('c6', 'beeline.uz', 12, 11),
  ...staff('c7', 'epam.uz', 10, 16),
];

function offer(
  id: string,
  merchantId: string,
  title: string,
  description: string,
  points: number,
  category: Category,
  active: boolean,
  companyIds: string[],
  placesLeft: number | null,
  paid: boolean,
  image?: string,
): Offer {
  return { id, merchantId, title, description, points, category, active, companyIds, placesLeft, paid, image };
}

const allCompanies = companies.map((c) => c.id);
const tech = ['c1', 'c2', 'c4', 'c7'];
const retail = ['c1', 'c3', 'c5', 'c6'];

const offers: Offer[] = [
  offer('o1', 'm1', 'Абонемент в зал', 'Зал, бассейн и групповые занятия на 30 дней', 3000, 'sport', true, ['c1', 'c2', 'c4', 'c7'], 12, true),
  offer('o2', 'm2', 'Бизнес-ланч', 'Обед в кафе рядом с офисом', 1500, 'food', true, ['c1', 'c3', 'c5'], 40, true),
  offer(
    'o3',
    'm3',
    'Python-программирование',
    '8 недель Python с нуля до FastAPI: синтаксис, API, ревью кода. Группы до 16 человек, свой проект в конце модуля.',
    4800,
    'education',
    true,
    ['c1', 'c2', 'c4', 'c7'],
    12,
    true,
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
  ),
  offer('o4', 'm4', 'Чекап здоровья', 'Полное обследование в клинике', 4000, 'health', true, ['c1', 'c6'], 6, true),
  offer('o5', 'm5', 'Парковка у офиса', 'Крытое место на месяц', 2200, 'transport', true, ['c1', 'c3', 'c4'], 20, true),
  offer('o6', 'm1', 'Персональные тренировки', 'Пять занятий с тренером', 4500, 'sport', false, ['c1'], 3, true),
  offer('o7', 'm6', 'Летний фестиваль команд', 'Билет на корпоративный фестиваль в городе', 2500, 'events', true, ['c1', 'c5'], 18, true),
  offer('o8', 'm7', 'Йога в офисе', 'Утренние занятия для сотрудников', 0, 'sport', true, ['c1', 'c2', 'c7'], 25, false),
  offer('o9', 'm2', 'Пятничная пицца', 'Бесплатный ланч по пятницам у офиса', 0, 'food', true, ['c1'], 50, false),
  offer(
    'o10',
    'm3',
    'Web Development',
    '6 недель веба: HTML/CSS, React, TypeScript и деплой. Домашки на реальных экранах корпоративных кабинетов.',
    4500,
    'education',
    true,
    ['c1', 'c2', 'c4', 'c7'],
    14,
    true,
    'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=900&q=80',
  ),
  offer('o11', 'm18', 'Тимбилдинг на озере', 'Выезд для сотрудников компании', 0, 'events', true, ['c1', 'c6'], 40, false),
  offer('o12', 'm16', 'Трансфер от метро', 'Корпоративный шаттл до офиса', 0, 'transport', true, ['c1', 'c4'], null, false),
  offer('o13', 'm1', 'Бассейн и сауна', 'Вечерние посещения 8 раз в месяц', 2800, 'sport', true, tech, 10, true),
  offer('o14', 'm7', 'Абонемент йога 12 занятий', 'Хатха и виньяса в центре города', 2600, 'sport', true, ['c1', 'c2', 'c6'], 16, true),
  offer('o15', 'm8', 'Корп. абонемент Arena', 'Зал в Самарканде для командировок', 2100, 'sport', true, ['c3', 'c5'], 9, true),
  offer('o16', 'm9', 'Плов на команду', 'Набор на 10 человек, доставка в офис', 1800, 'food', true, retail, 22, true),
  offer('o17', 'm10', 'Кофе-карта месяца', 'Напитки в Coffee Lab без очереди', 900, 'food', true, allCompanies, 80, true),
  offer('o18', 'm11', 'Курс Product Analytics', '6 недель SQL и метрик', 4200, 'education', true, tech, 7, true),
  offer('o19', 'm12', 'English B2 вечерний', 'Группа 2 раза в неделю', 3100, 'education', true, ['c1', 'c3', 'c6'], 14, true),
  offer('o20', 'm13', 'Стоматология check-up', 'Осмотр и гигиена', 2400, 'health', true, ['c1', 'c2', 'c4', 'c7'], 11, true),
  offer('o21', 'm14', 'SPA-день', 'Массаж и хаммам в Самарканде', 3500, 'health', false, ['c5'], 4, true),
  offer('o22', 'm15', 'Корп. поездки Yandex Go', 'Лимит поездок до офиса', 1600, 'transport', true, ['c2', 'c4', 'c7'], 60, true),
  offer('o23', 'm17', 'Jazz Friday', 'Билет на офисный джаз-вечер', 1200, 'events', true, ['c1', 'c2', 'c7'], 28, true),
  offer('o24', 'm18', 'Квест на команду', 'Городской тимбилдинг на 8 человек', 2000, 'events', true, ['c3', 'c5', 'c6'], 6, true),
  offer('o25', 'm10', 'Эспрессо для стендапа', 'Зёрна и капсулы в офис', 0, 'food', true, ['c2', 'c7'], null, false),
  offer('o26', 'm4', 'Вакцинация на работе', 'Выезд медбригады', 0, 'health', true, ['c3', 'c5'], 40, false),
  offer(
    'o27',
    'm3',
    'Data Science',
    '7 недель: Python для данных, SQL, визуализация и первая модель. Датасеты из продуктовых команд.',
    4200,
    'education',
    true,
    ['c1', 'c2', 'c4', 'c7'],
    16,
    true,
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
  ),
  offer(
    'o28',
    'm3',
    'UI/UX Design',
    'Исследования, CJM и прототипы в Figma. 6 недель: разбор интерфейсов вашей команды и защита макетов.',
    3600,
    'education',
    true,
    ['c1', 'c2', 'c4', 'c7'],
    15,
    true,
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=900&q=80',
  ),
  offer(
    'o29',
    'm3',
    'Mobile App Dev',
    '8 недель мобильной разработки: Flutter и публикация сборки. Практика на корпоративном мини-приложении.',
    4700,
    'education',
    true,
    ['c1', 'c2', 'c4', 'c7'],
    10,
    true,
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80',
  ),
  offer(
    'o30',
    'm3',
    'QA Engineering',
    'Тест-дизайн, регрессия, Postman и автотесты. 5 недель с баг-репортами на живом стенде академии.',
    3400,
    'education',
    true,
    ['c1', 'c2', 'c4', 'c7'],
    18,
    true,
    'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=900&q=80',
  ),
];

const STATUSES: RequestStatus[] = ['pending', 'approved', 'in_progress', 'completed', 'rejected'];

function stamp(day: number, hh: number, mm: number): string {
  return `${String(day).padStart(2, '0')} авг, ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function req(
  id: string,
  offerId: string,
  employeeId: string,
  companyId: string,
  status: RequestStatus,
  day: number,
  hh = 8 + (day % 8),
  mm = (day * 7) % 60,
): BenefitRequest {
  const createdAt = stamp(day, hh, mm);
  const history: BenefitRequest['history'] = [{ status: 'pending', at: createdAt, note: 'Заявка создана' }];
  let updatedAt = createdAt;
  if (status !== 'pending') {
    updatedAt = stamp(Math.min(14, day + 1), 11, 20);
    history.push({
      status: status === 'rejected' ? 'rejected' : status === 'completed' ? 'approved' : status,
      at: updatedAt,
      note: status === 'rejected' ? 'Нет свободных слотов' : 'Мерчант подтвердил услугу',
    });
  }
  if (status === 'in_progress' || status === 'completed') {
    updatedAt = stamp(Math.min(14, day + 2), 10, 2);
    history.push({ status: 'in_progress', at: updatedAt, note: 'Услуга активирована' });
  }
  if (status === 'completed') {
    updatedAt = stamp(Math.min(14, day + 3), 16, 40);
    history.push({ status: 'completed', at: updatedAt, note: 'Сотрудник отметил визит' });
  }
  return { id, offerId, employeeId, companyId, status, createdAt, updatedAt, history };
}

function employeesOf(companyId: string): User[] {
  return users.filter((u) => u.role === 'employee' && u.companyId === companyId);
}

function buildRequests(): BenefitRequest[] {
  const rows: BenefitRequest[] = [
    req('r1', 'o1', 'u1', 'c1', 'in_progress', 10),
    req('r2', 'o2', 'u1', 'c1', 'pending', 12),
    req('r3', 'o11', 'u8', 'c1', 'approved', 13),
    req('r4', 'o1', 'u9', 'c2', 'pending', 13),
  ];
  const pairs: { offerId: string; companyId: string }[] = [
    { offerId: 'o1', companyId: 'c1' },
    { offerId: 'o1', companyId: 'c2' },
    { offerId: 'o1', companyId: 'c4' },
    { offerId: 'o1', companyId: 'c7' },
    { offerId: 'o13', companyId: 'c1' },
    { offerId: 'o2', companyId: 'c1' },
    { offerId: 'o2', companyId: 'c3' },
    { offerId: 'o2', companyId: 'c5' },
    { offerId: 'o17', companyId: 'c1' },
    { offerId: 'o17', companyId: 'c2' },
    { offerId: 'o17', companyId: 'c6' },
    { offerId: 'o3', companyId: 'c1' },
    { offerId: 'o3', companyId: 'c7' },
    { offerId: 'o4', companyId: 'c1' },
    { offerId: 'o5', companyId: 'c1' },
    { offerId: 'o8', companyId: 'c1' },
    { offerId: 'o14', companyId: 'c2' },
    { offerId: 'o16', companyId: 'c5' },
    { offerId: 'o19', companyId: 'c3' },
    { offerId: 'o20', companyId: 'c1' },
    { offerId: 'o20', companyId: 'c4' },
    { offerId: 'o22', companyId: 'c2' },
    { offerId: 'o23', companyId: 'c7' },
    { offerId: 'o24', companyId: 'c3' },
    { offerId: 'o7', companyId: 'c1' },
    { offerId: 'o12', companyId: 'c1' },
  ];
  let n = 5;
  for (const pair of pairs) {
    const team = employeesOf(pair.companyId);
    const take = 2 + (n % 2);
    for (let i = 0; i < take && i < team.length; i++) {
      const user = team[(n + i) % team.length];
      const status = STATUSES[(n + i) % STATUSES.length];
      rows.push(req(`r${n}`, pair.offerId, user.id, pair.companyId, status, 3 + ((n + i) % 11)));
      n += 1;
    }
  }
  return rows;
}

function buildWeekActivity(): { extra: BenefitRequest[]; txs: Transaction[] } {
  const team = employeesOf('c1');
  const extra: BenefitRequest[] = [];
  const txs: Transaction[] = [];
  const patterns: { offerId: string; days: number[]; hour: number; take: number; status: RequestStatus; points: number }[] = [
    { offerId: 'o2', days: [3, 4, 5, 6, 7, 10, 11, 12, 13, 14], hour: 12, take: 5, status: 'completed', points: 1500 },
    { offerId: 'o9', days: [7, 14], hour: 13, take: 8, status: 'completed', points: 0 },
    { offerId: 'o17', days: [3, 4, 5, 6, 10, 11, 12, 13], hour: 9, take: 4, status: 'completed', points: 900 },
    { offerId: 'o1', days: [3, 4, 5, 10, 11, 12], hour: 8, take: 4, status: 'completed', points: 3000 },
    { offerId: 'o1', days: [4, 11], hour: 19, take: 3, status: 'in_progress', points: 3000 },
    { offerId: 'o5', days: [3, 4, 5, 6, 7, 10, 11, 12, 13, 14], hour: 8, take: 3, status: 'completed', points: 2200 },
    { offerId: 'o8', days: [4, 11], hour: 8, take: 3, status: 'completed', points: 0 },
    { offerId: 'o23', days: [7, 14], hour: 19, take: 4, status: 'approved', points: 1200 },
    { offerId: 'o20', days: [5, 12], hour: 16, take: 2, status: 'completed', points: 2400 },
    { offerId: 'o13', days: [6, 13], hour: 19, take: 3, status: 'completed', points: 2800 },
    { offerId: 'o12', days: [3, 4, 5, 6, 7, 10, 11, 12, 13, 14], hour: 8, take: 2, status: 'completed', points: 0 },
    { offerId: 'o10', days: [6, 13], hour: 18, take: 5, status: 'approved', points: 0 },
    { offerId: 'o14', days: [5, 12], hour: 8, take: 3, status: 'completed', points: 2600 },
  ];
  let n = 0;
  for (const p of patterns) {
    for (const day of p.days) {
      for (let i = 0; i < p.take && i < team.length; i++) {
        const user = team[(day * 3 + i + n) % team.length];
        const id = `ra${n}`;
        extra.push(req(id, p.offerId, user.id, 'c1', p.status, day, p.hour, (i * 11) % 60));
        if (p.points > 0 && (p.status === 'completed' || p.status === 'in_progress')) {
          txs.push({
            id: `ta${n}`,
            type: 'redeem',
            amount: p.points,
            userId: user.id,
            companyId: 'c1',
            offerId: p.offerId,
            createdAt: stamp(day, p.hour, (i * 11) % 60),
          });
        }
        n += 1;
      }
    }
  }
  return { extra, txs };
}

const week = buildWeekActivity();
const requests = [...buildRequests(), ...week.extra];

const transactions: Transaction[] = [
  { id: 't1', type: 'topup', amount: 800, userId: 'u1', companyId: 'c1', offerId: null, createdAt: '01 авг, 09:00' },
  { id: 't2', type: 'redeem', amount: 3000, userId: 'u1', companyId: 'c1', offerId: 'o1', createdAt: '10 авг, 09:14' },
  { id: 't3', type: 'redeem', amount: 1500, userId: 'u1', companyId: 'c1', offerId: 'o2', createdAt: '12 авг, 08:20' },
  { id: 't4', type: 'topup', amount: 5000, userId: 'u4', companyId: 'c1', offerId: null, createdAt: '02 авг, 10:12' },
  { id: 't5', type: 'redeem', amount: 900, userId: 'u10', companyId: 'c1', offerId: 'o17', createdAt: '08 авг, 08:40' },
  { id: 't6', type: 'topup', amount: 4000, userId: 'u9', companyId: 'c2', offerId: null, createdAt: '04 авг, 11:00' },
  { id: 't7', type: 'redeem', amount: 3000, userId: 'u9', companyId: 'c2', offerId: 'o1', createdAt: '13 авг, 16:00' },
  { id: 't8', type: 'redeem', amount: 1600, userId: 'e-c2-2', companyId: 'c2', offerId: 'o22', createdAt: '09 авг, 09:30' },
  { id: 't9', type: 'topup', amount: 2500, userId: 'e-c3-1', companyId: 'c3', offerId: null, createdAt: '05 авг, 09:15' },
  { id: 't10', type: 'redeem', amount: 1500, userId: 'e-c3-1', companyId: 'c3', offerId: 'o2', createdAt: '11 авг, 12:10' },
  { id: 't11', type: 'redeem', amount: 2400, userId: 'u13', companyId: 'c1', offerId: 'o20', createdAt: '07 авг, 14:22' },
  { id: 't12', type: 'topup', amount: 7000, userId: 'e-c7-1', companyId: 'c7', offerId: null, createdAt: '03 авг, 08:05' },
  { id: 't13', type: 'redeem', amount: 1200, userId: 'e-c7-3', companyId: 'c7', offerId: 'o23', createdAt: '12 авг, 18:40' },
  { id: 't14', type: 'redeem', amount: 1800, userId: 'e-c5-4', companyId: 'c5', offerId: 'o16', createdAt: '06 авг, 13:00' },
  ...week.txs,
];

const prices: CompanyPrice[] = [
  { merchantId: 'm1', companyId: 'c1', mode: 'discount', discountPct: 20, points: 2400 },
  { merchantId: 'm1', companyId: 'c2', mode: 'points', discountPct: 0, points: 2800 },
  { merchantId: 'm1', companyId: 'c3', mode: 'points', discountPct: 0, points: 3000 },
  { merchantId: 'm1', companyId: 'c4', mode: 'discount', discountPct: 15, points: 2550 },
  { merchantId: 'm1', companyId: 'c7', mode: 'free', discountPct: 0, points: 0 },
  { merchantId: 'm2', companyId: 'c1', mode: 'points', discountPct: 0, points: 1500 },
  { merchantId: 'm2', companyId: 'c5', mode: 'discount', discountPct: 10, points: 1350 },
  { merchantId: 'm10', companyId: 'c1', mode: 'free', discountPct: 0, points: 0 },
  { merchantId: 'm10', companyId: 'c2', mode: 'points', discountPct: 0, points: 900 },
  { merchantId: 'm3', companyId: 'c7', mode: 'discount', discountPct: 25, points: 3750 },
];

function partner(
  id: string,
  companyId: string,
  merchantId: string,
  initiator: Partnership['initiator'],
  status: Partnership['status'],
  createdAt: string,
): Partnership {
  return { id, companyId, merchantId, initiator, status, createdAt };
}

const partnerships: Partnership[] = [
  partner('p1', 'c1', 'm1', 'hr', 'connected', '2026-08-01T09:00:00.000Z'),
  partner('p2', 'c1', 'm2', 'hr', 'connected', '2026-08-02T09:00:00.000Z'),
  partner('p3', 'c1', 'm3', 'merchant', 'connected', '2026-08-03T09:00:00.000Z'),
  partner('p4', 'c1', 'm7', 'hr', 'connected', '2026-08-04T09:00:00.000Z'),
  partner('p5', 'c1', 'm10', 'hr', 'connected', '2026-08-05T09:00:00.000Z'),
  partner('p6', 'c4', 'm1', 'merchant', 'connected', '2026-08-06T09:00:00.000Z'),
  partner('p7', 'c7', 'm1', 'hr', 'connected', '2026-08-07T09:00:00.000Z'),
  partner('p9', 'c1', 'm13', 'merchant', 'pending', '2026-08-13T11:00:00.000Z'),
  partner('p10', 'c5', 'm1', 'merchant', 'pending', '2026-08-13T12:00:00.000Z'),
  partner('p11', 'c3', 'm1', 'merchant', 'talking', '2026-08-11T09:30:00.000Z'),
  partner('p12', 'c1', 'm6', 'hr', 'pending', '2026-08-14T08:15:00.000Z'),
  partner('p13', 'c1', 'm5', 'merchant', 'pending', '2026-08-14T10:40:00.000Z'),
  partner('p14', 'c6', 'm1', 'hr', 'pending', '2026-08-14T15:20:00.000Z'),
  partner('p15', 'c1', 'm12', 'hr', 'pending', '2026-08-15T07:50:00.000Z'),
  partner('p16', 'c4', 'm6', 'hr', 'pending', '2026-08-15T09:10:00.000Z'),
];

const reviews: MerchantReview[] = [
  {
    id: 'r-m3-1',
    merchantId: 'm3',
    author: 'Камола Назарова',
    rating: 5,
    course: 'Web Development',
    text: 'React и TypeScript закрыли пробелы за шесть недель. Домашки — как наша админка, а не учебные тояки.',
    date: '2026-07-12',
  },
  {
    id: 'r-m3-2',
    merchantId: 'm3',
    author: 'Бобур Исмаилов',
    rating: 5,
    course: 'Python-программирование',
    text: 'С нуля до FastAPI. Группа небольшая, ревью кода как на работе. Кампус на Навои удобный после офиса.',
    date: '2026-06-28',
  },
  {
    id: 'r-m3-3',
    merchantId: 'm3',
    author: 'Севара Абдуллаева',
    rating: 5,
    course: 'Data Science',
    text: 'SQL и визуализация на наших датасетах. К концу модуля уже строила отчёты для продукта.',
    date: '2026-07-03',
  },
  {
    id: 'r-m3-4',
    merchantId: 'm3',
    author: 'Нигора Кадырова',
    rating: 5,
    course: 'UI/UX Design',
    text: 'CJM по кабинету и прототипы в Figma за неделю. Преподаватели из продакшена, без воды.',
    date: '2026-05-19',
  },
  {
    id: 'r-m3-5',
    merchantId: 'm3',
    author: 'Азиз Турсунов',
    rating: 5,
    course: 'Mobile App Dev',
    text: 'Flutter с нуля и своя сборка в конце. Онлайн-занятия не отстают от очных в кампусе.',
    date: '2026-08-02',
  },
  {
    id: 'r-m3-6',
    merchantId: 'm3',
    author: 'Жасур Рахимов',
    rating: 5,
    course: 'QA Engineering',
    text: 'Тест-дизайн и автотесты на живом стенде. После курса баг-репорты в команде стали короче и яснее.',
    date: '2026-07-21',
  },
];

export const seedDb: CorporateDb = {
  version: DB_VERSION,
  companies,
  merchants,
  users,
  offers,
  requests,
  prices,
  transactions,
  interests,
  inviteCodes: [],
  partnerships,
  reviews,
};
