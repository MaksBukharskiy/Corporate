import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeftRight, Bot, Building2, CircleUser, ClipboardList, Download, LayoutDashboard, Store, Users } from 'lucide-react';
import { categoryAccent, categoryLabel, companyStatusLabel, genderLabel, interests, statusLabel, telHref } from '../data';
import { useHashRoute } from '../hashNav';
import { PersonFields, parseAge } from './personForm';
import { Assistant } from './Assistant';
import { Shell } from './Shell';
import { useStore } from '../store';
import type { Gender } from '../types';

type CompanyAccess = 'Active' | 'Pending' | 'Rejected';
type MerchantAccess = 'verified' | 'review' | 'rejected';

/** Локально в кабинете админа: в types/seed нет logo/site/address. */
type OrgCard = {
  logo: string;
  color: string;
  phone: string;
  website?: string;
  address: string;
  about: string;
};

const COMPANY_CARD: Record<string, OrgCard> = {
  c1: {
    logo: 'C',
    color: '#246BFD',
    phone: '+998 71 150 01 01',
    website: 'https://corporate.uz',
    address: 'Ташкент, Юнусабад, ул. Амира Темура 107',
    about: 'IT-компания. Корпоративные льготы для офиса в Ташкенте.',
  },
  c2: {
    logo: 'U',
    color: '#7C3AED',
    phone: '+998 71 150 02 02',
    website: 'https://uzum.uz',
    address: 'Ташкент, Мирзо-Улугбек, ул. Буюк Ипак Йули 15',
    about: 'Uzum Tech. Маркетплейс и финтех, офис в Ташкенте.',
  },
  c3: {
    logo: 'K',
    color: '#0F766E',
    phone: '+998 71 150 03 03',
    website: 'https://kapitalbank.uz',
    address: 'Ташкент, Шайхантахур, ул. Навои 44',
    about: 'Банк. Льготы для сотрудников отделений и головного офиса.',
  },
  c4: {
    logo: 'P',
    color: '#00A3FF',
    phone: '+998 71 150 04 04',
    website: 'https://payme.uz',
    address: 'Ташкент, Яккасарай, ул. Шота Руставели 12',
    about: 'Платёжный сервис. Команда продукта и поддержки.',
  },
  c5: {
    logo: 'Ko',
    color: '#16A34A',
    phone: '+998 71 150 05 05',
    website: 'https://korzinka.uz',
    address: 'Ташкент, Чиланзар, массив 7, дом 24',
    about: 'Розничная сеть. Офис и распределительный центр.',
  },
  c6: {
    logo: 'B',
    color: '#F97316',
    phone: '+998 71 150 06 06',
    website: 'https://beeline.uz',
    address: 'Ташкент, Мирабад, ул. Тараса Шевченко 20',
    about: 'Оператор связи. Головной офис и розница.',
  },
  c7: {
    logo: 'E',
    color: '#39A935',
    phone: '+998 71 150 07 07',
    website: 'https://epam.com',
    address: 'Ташкент, Мирзо-Улугбек, IT Park, ул. Темирйулчилар 1',
    about: 'EPAM Tashkent. Инжиниринговый офис.',
  },
};

const MERCHANT_CARD: Record<string, OrgCard> = {
  m1: {
    logo: 'FZ',
    color: '#8B7CFF',
    phone: '+998 71 200 01 01',
    website: 'https://fitzone.uz',
    address: 'Ташкент, Мирабад, ул. Фидокор 8',
    about: 'Сеть залов с бассейном и групповыми занятиями.',
  },
  m2: {
    logo: 'OM',
    color: '#FF8A4C',
    phone: '+998 71 200 02 02',
    website: 'https://oshmarkazi.uz',
    address: 'Ташкент, Юнусабад, Ц-1, дом 19',
    about: 'Корпоративные обеды рядом с бизнес-центрами.',
  },
  m3: {
    logo: 'IT',
    color: '#4C8DFF',
    phone: '+998 71 200 03 03',
    website: 'https://itacademy.uz',
    address: 'Ташкент, Шайхантахур, ул. Навои 18',
    about: 'Практические IT-курсы для команд.',
  },
  m4: {
    logo: 'M+',
    color: '#FF6B9D',
    phone: '+998 71 200 04 04',
    address: 'Ташкент, Яккасарай, ул. Бабура 41',
    about: 'Клиника чекапов и выездных бригад.',
  },
  m5: {
    logo: 'CP',
    color: '#2DD4BF',
    phone: '+998 71 200 05 05',
    website: 'https://cityparking.uz',
    address: 'Ташкент, Мирабад, ул. Афросиаб 31',
    about: 'Крытые парковки у офисных кварталов.',
  },
  m6: {
    logo: 'EL',
    color: '#4ADE80',
    phone: '+998 71 200 06 06',
    website: 'https://eventlab.uz',
    address: 'Ташкент, Мирзо-Улугбек, ул. Буюк Ипак Йули 72',
    about: 'Городские фестивали и командные билеты.',
  },
  m7: {
    logo: 'YH',
    color: '#8B7CFF',
    phone: '+998 71 200 07 07',
    website: 'https://yogahouse.uz',
    address: 'Ташкент, Чиланзар, массив 9, дом 11',
    about: 'Йога в студии и выезд в офис.',
  },
  m8: {
    logo: 'SA',
    color: '#8B7CFF',
    phone: '+998 66 200 08 08',
    address: 'Самарканд, ул. Регистан 4',
    about: 'Зал для командировок в Самарканде.',
  },
  m9: {
    logo: 'PN',
    color: '#FF8A4C',
    phone: '+998 66 200 09 09',
    address: 'Самарканд, ул. Дагбитская 22',
    about: 'Плов и сеты на команду с доставкой.',
  },
  m10: {
    logo: 'CL',
    color: '#FF8A4C',
    phone: '+998 71 200 10 10',
    website: 'https://coffeelab.uz',
    address: 'Ташкент, Мирабад, ул. Тараса Шевченко 5',
    about: 'Кофейня с корпоративными картами.',
  },
  m11: {
    logo: 'SX',
    color: '#4C8DFF',
    phone: '+998 71 200 11 11',
    website: 'https://skillbox.uz',
    address: 'Ташкент, Юнусабад, ул. Амира Темура 88',
    about: 'Онлайн-курсы продуктовой аналитики.',
  },
  m12: {
    logo: 'EH',
    color: '#4C8DFF',
    phone: '+998 65 200 12 12',
    address: 'Бухара, ул. Бахауддина Накшбанда 14',
    about: 'Английский для специалистов.',
  },
  m13: {
    logo: 'SD',
    color: '#FF6B9D',
    phone: '+998 71 200 13 13',
    website: 'https://smiledental.uz',
    address: 'Ташкент, Шайхантахур, ул. Сагбон 9',
    about: 'Стоматология для сотрудников компаний.',
  },
  m14: {
    logo: 'WS',
    color: '#FF6B9D',
    phone: '+998 66 200 14 14',
    address: 'Самарканд, ул. Университетский бульвар 3',
    about: 'SPA для команд в командировке.',
  },
  m15: {
    logo: 'YG',
    color: '#2DD4BF',
    phone: '+998 71 200 15 15',
    website: 'https://go.yandex',
    address: 'Ташкент, Яккасарай, ул. Шота Руставели 51',
    about: 'Корпоративные поездки до офиса.',
  },
  m16: {
    logo: 'MS',
    color: '#2DD4BF',
    phone: '+998 71 200 16 16',
    address: 'Ташкент, Юнусабад, метро «Минор»',
    about: 'Шаттл от метро до офисных парков.',
  },
  m17: {
    logo: 'JF',
    color: '#4ADE80',
    phone: '+998 71 200 17 17',
    address: 'Ташкент, Мирабад, ул. Нукус 33',
    about: 'Джаз-вечера для офисных команд.',
  },
  m18: {
    logo: 'TB',
    color: '#4ADE80',
    phone: '+998 69 200 18 18',
    address: 'Наманган, ул. Навои 60',
    about: 'Выезды и квесты для команд.',
  },
};

const nav = [
  { key: 'overview', label: 'Обзор', icon: LayoutDashboard },
  { key: 'inbox', label: 'Заявки', icon: ClipboardList },
  { key: 'companies', label: 'Компании', icon: Building2 },
  { key: 'merchants', label: 'Мерчанты', icon: Store },
  { key: 'people', label: 'Люди', icon: Users },
  { key: 'export', label: 'Выгрузка', icon: Download },
  { key: 'ops', label: 'Операции', icon: ArrowLeftRight },
  { key: 'assistant', label: 'Lin', icon: Bot },
  { key: 'profile', label: 'Профиль', icon: CircleUser },
];

const ADMIN_PAGES = nav.map((n) => n.key).join(',');

const WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const ROLE_LABEL: Record<string, string> = {
  admin: 'Админ',
  hr: 'HR',
  merchant: 'Мерчант',
  employee: 'Сотрудник',
};

function companyAccess(status: string): CompanyAccess {
  if (status === 'Rejected') return 'Rejected';
  if (status === 'Pending') return 'Pending';
  return 'Active';
}

function merchantAccess(verified: boolean, rejected?: boolean): MerchantAccess {
  if (rejected) return 'rejected';
  return verified ? 'verified' : 'review';
}

function parseStamp(value: string) {
  const m = value.match(/^(\d{1,2}) авг, (\d{2}):(\d{2})/);
  if (!m) return { day: 1, hh: 12 };
  return { day: Number(m[1]), hh: Number(m[2]) };
}

function weekday(day: number) {
  return (day - 3 + 70) % 7;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
}

function siteHost(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function AdminApp() {
  const { page, id, go } = useHashRoute(ADMIN_PAGES, 'overview');
  const store = useStore();
  const waiting =
    store.companies.filter((c) => companyAccess(c.status) === 'Pending').length +
    store.merchants.filter((m) => merchantAccess(m.verified, m.rejected) === 'review').length;

  function openCompany(cid: string) {
    go('companies', cid);
  }

  function openMerchant(mid: string) {
    go('merchants', mid);
  }

  return (
    <Shell title="Админ" nav={nav} page={page} onNav={(key) => go(key)}>
      <div className="hr-desk">
        {page === 'overview' ? (
          <Overview key={page} waiting={waiting} onOpenInbox={() => go('inbox')} onOpenCompany={openCompany} />
        ) : null}
        {page === 'inbox' ? <Inbox onOpenCompany={openCompany} onOpenMerchant={openMerchant} /> : null}
        {page === 'companies' ? <Companies pick={id} onPick={(cid) => go('companies', cid)} /> : null}
        {page === 'merchants' ? <Merchants pick={id} onPick={(mid) => go('merchants', mid)} /> : null}
        {page === 'people' ? <People /> : null}
        {page === 'export' ? <ExportData /> : null}
        {page === 'ops' ? <Ops /> : null}
        {page === 'assistant' ? <Assistant role="admin" /> : null}
        {page === 'profile' ? <AdminProfile /> : null}
      </div>
    </Shell>
  );
}

function Overview({
  waiting,
  onOpenInbox,
  onOpenCompany,
}: {
  waiting: number;
  onOpenInbox: () => void;
  onOpenCompany: (id: string) => void;
}) {
  const { companies, users, requests, merchants, transactions } = useStore();
  const liveCompanies = companies.filter((c) => companyAccess(c.status) === 'Active');
  const pendingCompanies = companies.filter((c) => companyAccess(c.status) === 'Pending');
  const liveMerchants = merchants.filter((m) => merchantAccess(m.verified, m.rejected) === 'verified');
  const reviewMerchants = merchants.filter((m) => merchantAccess(m.verified, m.rejected) === 'review');
  const unverifiedMerchants = merchants.filter((m) => !m.verified);
  const employees = users.filter((u) => u.role === 'employee');
  const spent = transactions.filter((t) => t.type === 'redeem').reduce((s, t) => s + t.amount, 0);
  const byWeek = WEEK.map((label, i) => ({
    label,
    n: requests.filter((r) => weekday(parseStamp(r.createdAt).day) === i).length,
  }));
  const weekMax = Math.max(1, ...byWeek.map((d) => d.n));
  const peak = [...byWeek].sort((a, b) => b.n - a.n)[0];
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const day = 8 + i;
    return { day, n: requests.filter((r) => parseStamp(r.createdAt).day === day).length };
  });
  const last7Max = Math.max(1, ...last7.map((d) => d.n));
  const byCat = (Object.keys(categoryLabel) as Array<keyof typeof categoryLabel>)
    .map((cat) => ({
      cat,
      n: merchants.filter((m) => m.category === cat).length,
    }))
    .sort((a, b) => b.n - a.n);
  const catMax = Math.max(1, ...byCat.map((x) => x.n));
  const companyRows = companies
    .map((c) => {
      const n = employees.filter((u) => u.companyId === c.id).length;
      const visits = requests.filter((r) => r.companyId === c.id).length;
      return { c, n, visits, access: companyAccess(c.status) };
    })
    .sort((a, b) => b.n - a.n);
  const peopleMax = Math.max(1, ...companyRows.map((x) => x.n));

  return (
    <>
      <h1>Обзор</h1>
      <div className="dash-hero solo">
        <div className="hero-card hr-trade">
          <div className="hr-trade-top">
            <div>
              <div className="kicker">1–14 августа</div>
              <div className="hr-trade-val">
                {requests.length}
                <span>заявок</span>
              </div>
            </div>
            <button className="hr-btn" type="button" onClick={onOpenInbox}>
              На ревью {waiting}
            </button>
          </div>
          <svg className="hr-trade-svg" viewBox="0 0 640 168" preserveAspectRatio="none">
            {byWeek.map((d, i) => {
              const gap = 640 / byWeek.length;
              const h = (d.n / weekMax) * 120;
              return (
                <rect
                  className="chart-col"
                  key={d.label}
                  x={18 + i * gap + 10}
                  y={148 - h}
                  width={Math.max(18, gap - 28)}
                  height={h}
                  rx="8"
                  fill="#ffffff"
                  opacity={d.label === peak.label ? 1 : 0.5 + (d.n / weekMax) * 0.4}
                />
              );
            })}
          </svg>
          <div className="hr-trade-axis">
            {byWeek.map((d) => (
              <span key={d.label}>{d.label}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="kpi tight six">
        <div className="stat">
          Очередь
          <b>{waiting}</b>
        </div>
        <div className="stat">
          Компании
          <b>{liveCompanies.length}</b>
        </div>
        <div className="stat">
          На проверке
          <b>{pendingCompanies.length}</b>
        </div>
        <div className="stat">
          Мерчанты
          <b>{liveMerchants.length}</b>
        </div>
        <div className="stat">
          Без галки
          <b>{unverifiedMerchants.length}</b>
        </div>
        <div className="stat">
          Заявки
          <b>{requests.length}</b>
        </div>
      </div>
      <div className="stat-strip">
        <div className="panel tight">
          <h3>Компании</h3>
          <div className="hr-cover sm">
            <div>
              <b>{liveCompanies.length}</b>
              <span className="meta">активны</span>
            </div>
            <div>
              <b>{pendingCompanies.length}</b>
              <span className="meta">ждут</span>
            </div>
          </div>
          <div className="split-meter">
            <i
              style={{
                width: `${companies.length ? (liveCompanies.length / companies.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        <div className="panel tight">
          <h3>Мерчанты</h3>
          <div className="hr-cover sm">
            <div>
              <b>{liveMerchants.length}</b>
              <span className="meta">с галкой</span>
            </div>
            <div>
              <b>{unverifiedMerchants.length}</b>
              <span className="meta">без галки</span>
            </div>
          </div>
          <div className="split-meter">
            <i
              style={{
                width: `${merchants.length ? (liveMerchants.length / merchants.length) * 100 : 0}%`,
              }}
            />
          </div>
          <p className="meta">{reviewMerchants.length} на ревью</p>
        </div>
        <div className="panel tight">
          <h3>7 дней</h3>
          <div className="spark-in">
            {last7.map((d) => (
              <div key={d.day} className="spark-in-col">
                <div className="spark-col" style={{ height: `${12 + (d.n / last7Max) * 64}px` }} />
                <span>{d.day}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel tight">
          <h3>Списания</h3>
          <div className="hr-cover sm">
            <div>
              <b>{spent.toLocaleString('ru-RU')}</b>
              <span className="meta">баллов</span>
            </div>
          </div>
        </div>
      </div>
      <div className="hr-dash">
        <div className="panel">
          <h3>Компании</h3>
          {companyRows.map((row) => (
            <button
              key={row.c.id}
              type="button"
              onClick={() => onOpenCompany(row.c.id)}
              style={{ width: '100%', textAlign: 'left', marginBottom: 14, background: 'none', padding: 0 }}
            >
              <div className="row" style={{ border: 'none', padding: 0, marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <LogoMark id={row.c.id} kind="company" size={36} />
                  <div>
                    <div style={{ fontWeight: 700 }}>{row.c.name}</div>
                    <div className="meta">{row.visits} заявок</div>
                  </div>
                </div>
                <AccessBadge kind="company" value={row.access} />
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(row.n / peopleMax) * 100}%`, background: 'var(--brand)' }} />
              </div>
              <div className="meta" style={{ marginTop: 6 }}>
                {row.n} сотрудников
              </div>
            </button>
          ))}
        </div>
        <div className="panel">
          <h3>Категории</h3>
          <div className="compare">
            {byCat.map((x) => (
              <div key={x.cat} className="compare-col">
                <b>{x.n}</b>
                <div
                  className="tower"
                  style={{
                    height: `${24 + (x.n / catMax) * 140}px`,
                    background: `linear-gradient(180deg, ${categoryAccent[x.cat]}, var(--brand))`,
                  }}
                />
                <span className="meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <span className="cat-dot" style={{ background: categoryAccent[x.cat] }} />
                  {categoryLabel[x.cat]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Inbox({
  onOpenCompany,
  onOpenMerchant,
}: {
  onOpenCompany: (id: string) => void;
  onOpenMerchant: (id: string) => void;
}) {
  const { companies, merchants, users, setCompanyStatus, setMerchantStatus } = useStore();
  const [tab, setTab] = useState<'all' | 'company' | 'merchant'>('all');
  const companyQueue = companies.filter((c) => companyAccess(c.status) === 'Pending');
  const merchantQueue = merchants.filter((m) => merchantAccess(m.verified, m.rejected) === 'review');

  const showCompanies = tab === 'all' || tab === 'company';
  const showMerchants = tab === 'all' || tab === 'merchant';
  const companyRows = showCompanies ? companyQueue : [];
  const merchantRows = showMerchants ? merchantQueue : [];
  const empty = companyRows.length === 0 && merchantRows.length === 0;

  return (
    <>
      <h1>Заявки</h1>
      <div className="pipe compact">
        <span>
          <b>{companyQueue.length}</b>компании
        </span>
        <span>
          <b>{merchantQueue.length}</b>мерчанты
        </span>
      </div>
      <div className="hr-switch">
        {(
          [
            ['all', 'Все'],
            ['company', 'Компании'],
            ['merchant', 'Мерчанты'],
          ] as const
        ).map(([key, label]) => (
          <button key={key} className={tab === key ? 'on' : ''} type="button" onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>
      {empty ? (
        <p className="meta quiet-empty">Нет заявок</p>
      ) : (
        <>
          {companyRows.length > 0 ? (
            <>
              {tab === 'all' && merchantRows.length > 0 ? <h3 className="list-kicker">Компании</h3> : null}
              <div className="hr-list">
                <div className="hr-line hr-head queue-row">
                  <div>Компания</div>
                  <div>Город</div>
                  <div>Действия</div>
                </div>
                {companyRows.map((c) => {
                  const hr = users.find((u) => u.companyId === c.id && u.role === 'hr');
                  const people = users.filter((u) => u.companyId === c.id && u.role === 'employee').length;
                  return (
                    <div key={c.id} className="hr-line queue-row" onClick={() => onOpenCompany(c.id)}>
                      <div className="hr-who">
                        <LogoMark id={c.id} kind="company" size={36} />
                        <div>
                          <div className="hr-name">{c.name}</div>
                          <div className="meta">
                            {hr ? hr.name : 'HR'} · {people} сотрудников
                          </div>
                        </div>
                      </div>
                      <div className="meta">{c.city || '—'}</div>
                      <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="hr-btn sm"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCompanyStatus(c.id, 'Active');
                          }}
                        >
                          Подтвердить
                        </button>
                        <button
                          className="hr-btn ghost sm"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCompanyStatus(c.id, 'Rejected');
                          }}
                        >
                          Отклонить
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
          {merchantRows.length > 0 ? (
            <>
              {tab === 'all' && companyRows.length > 0 ? <h3 className="list-kicker">Мерчанты</h3> : null}
              <div className="hr-list" style={companyRows.length > 0 ? { marginTop: 16 } : undefined}>
                <div className="hr-line hr-head queue-row">
                  <div>Мерчант</div>
                  <div>Город</div>
                  <div>Действия</div>
                </div>
                {merchantRows.map((m) => (
                  <div key={m.id} className="hr-line queue-row" onClick={() => onOpenMerchant(m.id)}>
                    <div className="hr-who">
                      <LogoMark id={m.id} kind="merchant" size={36} />
                      <div>
                        <div className="hr-name">{m.name}</div>
                        <div className="meta">{categoryLabel[m.category]}</div>
                      </div>
                    </div>
                    <div className="meta">{m.city}</div>
                    <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="hr-btn sm"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMerchantStatus(m.id, 'verified');
                        }}
                      >
                        Подтвердить
                      </button>
                      <button
                        className="hr-btn ghost sm"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMerchantStatus(m.id, 'rejected');
                        }}
                      >
                        Отклонить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </>
      )}
    </>
  );
}

function Companies({
  pick,
  onPick,
}: {
  pick: string | null;
  onPick: (id: string | null) => void;
}) {
  const { companies, users, setCompanyStatus } = useStore();
  const company = companies.find((c) => c.id === pick);
  const [tab, setTab] = useState<'data' | 'people'>('data');

  useEffect(() => {
    setTab('data');
  }, [pick]);

  if (company) {
    const st = companyAccess(company.status);
    const card = COMPANY_CARD[company.id];
    const team = users.filter((u) => u.companyId === company.id && u.role === 'employee');
    const hrs = users.filter((u) => u.role === 'hr' && u.companyId === company.id);
    return (
      <>
        <button className="hr-btn ghost" type="button" onClick={() => onPick(null)}>
          К списку
        </button>
        <div className="hr-switch" style={{ marginTop: 16 }}>
          <button className={tab === 'data' ? 'on' : ''} type="button" onClick={() => setTab('data')}>
            Данные
          </button>
          <button className={tab === 'people' ? 'on' : ''} type="button" onClick={() => setTab('people')}>
            Сотрудники · {team.length}
          </button>
        </div>
        {tab === 'data' ? (
          <div className="panel profile-panel" style={{ marginTop: 8, maxWidth: 860 }}>
            <OrgProfile
              kicker="Компания"
              name={company.name}
              card={card}
              fallbackPhone={hrs[0]?.phone}
              badge={<AccessBadge kind="company" value={st} />}
            />
            <div className="profile-row">
              <span>Статус</span>
              <b>{companyStatusLabel(company.status)}</b>
            </div>
            <div className="profile-row">
              <span>Сотрудники</span>
              <b>
                <button className="hr-btn ghost" type="button" onClick={() => setTab('people')} style={{ height: 36 }}>
                  {team.length} человек
                </button>
              </b>
            </div>
            <h3>Контакты</h3>
            {hrs.length === 0 ? (
              <p className="meta">Нет HR</p>
            ) : (
              hrs.map((hr) => (
                <div key={hr.id} className="profile-row">
                  <span>{hr.name}</span>
                  <b>
                    {hr.email}
                    <br />
                    <a className="hr-phone" href={telHref(hr.phone)} style={{ margin: 0 }}>
                      {hr.phone}
                    </a>
                  </b>
                </div>
              ))
            )}
            <div className="row-actions profile-actions">
              {st !== 'Active' ? (
                <button className="hr-btn" type="button" onClick={() => setCompanyStatus(company.id, 'Active')}>
                  Подтвердить
                </button>
              ) : (
                <button className="hr-btn ghost" type="button" onClick={() => setCompanyStatus(company.id, 'Pending')}>
                  Вернуть на проверку
                </button>
              )}
              {st !== 'Rejected' ? (
                <button className="hr-btn ghost" type="button" onClick={() => setCompanyStatus(company.id, 'Rejected')}>
                  Отклонить
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <h1 style={{ marginTop: 8 }}>{company.name}</h1>
            {team.length === 0 ? (
              <p className="meta">Пусто.</p>
            ) : (
              <div className="hr-list">
                <div className="hr-line hr-head">
                  <div>Сотрудник</div>
                  <div>Должность</div>
                  <div>Телефон</div>
                </div>
                {team.map((u) => (
                  <div key={u.id} className="hr-line">
                    <div className="hr-who">
                      <div className="hr-avatar">{initials(u.name)}</div>
                      <div>
                        <div className="hr-name">{u.name}</div>
                        <div className="meta">{u.email}</div>
                      </div>
                    </div>
                    <div className="meta">{u.jobTitle}</div>
                    <div className="hr-side">
                      <a href={telHref(u.phone)}>{u.phone}</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </>
    );
  }

  const review = companies.filter((c) => companyAccess(c.status) !== 'Active');
  const live = companies.filter((c) => companyAccess(c.status) === 'Active');

  function rows(list: typeof companies) {
    return list.map((c) => {
      const a = companyAccess(c.status);
      const extra = COMPANY_CARD[c.id];
      return (
        <button key={c.id} className="hr-line" type="button" onClick={() => onPick(c.id)} style={{ width: '100%', textAlign: 'left' }}>
          <div className="hr-who">
            <LogoMark id={c.id} kind="company" />
            <div>
              <div className="hr-name">{c.name}</div>
              <div className="meta">{c.city || 'Ташкент'}</div>
            </div>
          </div>
          <div className="meta">{extra?.about ?? companyStatusLabel(c.status)}</div>
          <div className="hr-side">
            <AccessBadge kind="company" value={a} />
          </div>
        </button>
      );
    });
  }

  return (
    <>
      <h1>Компании</h1>
      {review.length > 0 ? (
        <>
          <h3 className="list-kicker">На ревью · {review.length}</h3>
          <div className="hr-list">
            <div className="hr-line hr-head">
              <div>Компания</div>
              <div>Адрес</div>
              <div>Доступ</div>
            </div>
            {rows(review)}
          </div>
        </>
      ) : null}
      <h3 className="list-kicker" style={review.length > 0 ? { marginTop: 28 } : undefined}>
        В приложении · {live.length}
      </h3>
      {live.length === 0 ? (
        <p className="meta quiet-empty">Нет заявок</p>
      ) : (
        <div className="hr-list">
          <div className="hr-line hr-head">
            <div>Компания</div>
            <div>Адрес</div>
            <div>Доступ</div>
          </div>
          {rows(live)}
        </div>
      )}
    </>
  );
}

function Merchants({
  pick,
  onPick,
}: {
  pick: string | null;
  onPick: (id: string | null) => void;
}) {
  const { merchants, users, setMerchantStatus, updateMerchant } = useStore();
  const merchant = merchants.find((m) => m.id === pick);
  const [editName, setEditName] = useState(merchant?.name ?? '');
  const [editPhone, setEditPhone] = useState(merchant?.phone ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setEditName(merchant?.name ?? '');
    setEditPhone(merchant?.phone ?? '');
    setSaved(false);
  }, [merchant?.id, merchant?.name, merchant?.phone]);

  if (merchant) {
    const st = merchantAccess(merchant.verified, merchant.rejected);
    const card: OrgCard = MERCHANT_CARD[merchant.id] ?? {
      logo: initials(merchant.name),
      color: categoryAccent[merchant.category],
      phone: merchant.phone,
      address: merchant.city,
      about: merchant.about,
    };
    const owners = users.filter((u) => u.role === 'merchant' && u.merchantId === merchant.id);
    return (
      <>
        <button className="hr-btn ghost" type="button" onClick={() => onPick(null)}>
          К списку
        </button>
        <div className="panel profile-panel" style={{ marginTop: 16, maxWidth: 860 }}>
          <OrgProfile
            kicker={categoryLabel[merchant.category]}
            name={merchant.name}
            card={card}
            fallbackPhone={merchant.phone}
            badge={<AccessBadge kind="merchant" value={st} />}
          />
          <div className="profile-row">
            <span>Название</span>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div className="profile-row">
            <span>Телефон</span>
            <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} autoComplete="tel" />
          </div>
          {merchant.services ? (
            <div className="profile-row">
              <span>Услуги</span>
              <b>{merchant.services}</b>
            </div>
          ) : null}
          <h3>Контакты</h3>
          {owners.length === 0 ? (
            <p className="meta">Нет кабинета</p>
          ) : (
            owners.map((u) => (
              <div key={u.id} className="profile-row">
                <span>{u.name}</span>
                <b>
                  {u.email}
                  <br />
                  <a className="hr-phone" href={telHref(u.phone || merchant.phone)} style={{ margin: 0 }}>
                    {u.phone || merchant.phone}
                  </a>
                </b>
              </div>
            ))
          )}
          <div className="row-actions profile-actions">
            <button
              className="hr-btn"
              type="button"
              onClick={() => {
                updateMerchant(merchant.id, { name: editName, phone: editPhone });
                setSaved(true);
              }}
            >
              Сохранить
            </button>
            {saved ? <span className="meta">Сохранено</span> : null}
            {st !== 'verified' ? (
              <button className="hr-btn" type="button" onClick={() => setMerchantStatus(merchant.id, 'verified')}>
                Подтвердить
              </button>
            ) : (
              <button className="hr-btn ghost" type="button" onClick={() => setMerchantStatus(merchant.id, 'review')}>
                Снять verified
              </button>
            )}
            {st !== 'rejected' ? (
              <button className="hr-btn ghost" type="button" onClick={() => setMerchantStatus(merchant.id, 'rejected')}>
                Отклонить
              </button>
            ) : null}
          </div>
        </div>
      </>
    );
  }

  const review = merchants.filter((m) => merchantAccess(m.verified, m.rejected) !== 'verified');
  const live = merchants.filter((m) => merchantAccess(m.verified, m.rejected) === 'verified');

  function rows(list: typeof merchants) {
    return list.map((m) => {
      const a = merchantAccess(m.verified, m.rejected);
      return (
        <button key={m.id} className="hr-line" type="button" onClick={() => onPick(m.id)} style={{ width: '100%', textAlign: 'left' }}>
          <div className="hr-who">
            <LogoMark id={m.id} kind="merchant" />
            <div>
              <div className="hr-name">{m.name}</div>
              <div className="meta">{categoryLabel[m.category]}</div>
            </div>
          </div>
          <div className="meta">{MERCHANT_CARD[m.id]?.address ?? m.city}</div>
          <div className="hr-side">
            <AccessBadge kind="merchant" value={a} />
          </div>
        </button>
      );
    });
  }

  return (
    <>
      <h1>Мерчанты</h1>
      {review.length > 0 ? (
        <>
          <h3 className="list-kicker">На ревью · {review.length}</h3>
          <div className="hr-list">
            <div className="hr-line hr-head">
              <div>Мерчант</div>
              <div>Адрес</div>
              <div>Статус</div>
            </div>
            {rows(review)}
          </div>
        </>
      ) : null}
      <h3 className="list-kicker" style={review.length > 0 ? { marginTop: 28 } : undefined}>
        Verified · {live.length}
      </h3>
      {live.length === 0 ? (
        <p className="meta quiet-empty">Нет заявок</p>
      ) : (
        <div className="hr-list">
          <div className="hr-line hr-head">
            <div>Мерчант</div>
            <div>Адрес</div>
            <div>Статус</div>
          </div>
          {rows(live)}
        </div>
      )}
    </>
  );
}

function OrgProfile({
  kicker,
  name,
  card,
  fallbackPhone,
  badge,
}: {
  kicker: string;
  name: string;
  card?: OrgCard;
  fallbackPhone?: string;
  badge: ReactNode;
}) {
  const phone = card?.phone || fallbackPhone;
  return (
    <>
      <div className="kicker">{kicker}</div>
      <div className="person-top" style={{ marginTop: 12 }}>
        {card ? (
          <span className="hr-avatar" style={{ width: 64, height: 64, borderRadius: 18, background: card.color, fontSize: 18 }}>
            {card.logo}
          </span>
        ) : (
          <span className="hr-avatar" style={{ width: 64, height: 64, borderRadius: 18 }}>
            {initials(name)}
          </span>
        )}
        <div className="grow">
          <h1 style={{ margin: 0, fontSize: 28 }}>{name}</h1>
          {badge}
        </div>
      </div>
      {card?.about ? <p className="hr-about">{card.about}</p> : null}
      <div className="profile-row">
        <span>Телефон</span>
        {phone ? (
          <b>
            <a className="hr-phone" href={telHref(phone)} style={{ margin: 0 }}>
              {phone}
            </a>
          </b>
        ) : (
          <b className="meta">не указан</b>
        )}
      </div>
      <div className="profile-row">
        <span>Сайт</span>
        {card?.website ? (
          <b>
            <a href={card.website} target="_blank" rel="noreferrer">
              {siteHost(card.website)}
            </a>
          </b>
        ) : (
          <b className="meta">нет</b>
        )}
      </div>
      <div className="profile-row">
        <span>Город</span>
        <b>{card?.address ? card.address.split(',')[0] : 'Ташкент'}</b>
      </div>
    </>
  );
}

function LogoMark({ id, kind, size = 40 }: { id: string; kind: 'company' | 'merchant'; size?: number }) {
  const card = kind === 'company' ? COMPANY_CARD[id] : MERCHANT_CARD[id];
  return (
    <span
      className="hr-avatar"
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: card?.color ?? '#246BFD',
        fontSize: size > 40 ? 16 : 12,
      }}
    >
      {card?.logo ?? id.slice(0, 2).toUpperCase()}
    </span>
  );
}

function AdminProfile() {
  const { session, updateProfile } = useStore();
  const [name, setName] = useState(session?.name ?? '');
  const [phone, setPhone] = useState(session?.phone ?? '');
  const [age, setAge] = useState(session?.age != null ? String(session.age) : '');
  const [gender, setGender] = useState<Gender>(session?.gender ?? 'unspecified');
  const [city, setCity] = useState(session?.city ?? '');
  const [jobTitle, setJobTitle] = useState(session?.jobTitle ?? '');
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(session?.name ?? '');
    setPhone(session?.phone ?? '');
    setAge(session?.age != null ? String(session.age) : '');
    setGender(session?.gender ?? 'unspecified');
    setCity(session?.city ?? '');
    setJobTitle(session?.jobTitle ?? '');
  }, [session]);

  return (
    <>
      <h1>Профиль</h1>
      <div className="panel profile-panel">
        <PersonFields
          name={name}
          phone={phone}
          age={age}
          gender={gender}
          city={city}
          jobTitle={jobTitle}
          password={password}
          onName={setName}
          onPhone={setPhone}
          onAge={setAge}
          onGender={setGender}
          onCity={setCity}
          onJobTitle={setJobTitle}
          onPassword={setPassword}
        />
        <div className="profile-row">
          <span>Email</span>
          <b>{session?.email}</b>
        </div>
        <div className="profile-actions">
          <button
            className="primary"
            type="button"
            onClick={() => {
              updateProfile({ name, phone, age: parseAge(age), gender, city, jobTitle, password });
              setPassword('');
              setSaved(true);
            }}
          >
            Сохранить
          </button>
          {saved ? <span className="meta">Сохранено</span> : null}
        </div>
      </div>
    </>
  );
}

function ExportData() {
  const { companies, users, merchants, offers, requests, transactions, partnerships } = useStore();
  const employees = users.filter((u) => u.role === 'employee');
  const interestTitle = (id: string) => interests.find((i) => i.id === id)?.title ?? id;

  const packs = [
    {
      key: 'audience',
      title: 'Аудитория',
      note: `${employees.length} сотрудников: компания, город, возраст, пол, интересы, телефон. Без паролей.`,
      run: () =>
        downloadCsv('audience.csv', [
          ['id', 'name', 'email', 'phone', 'company', 'city', 'age', 'gender', 'job', 'interests', 'visits'],
          ...employees.map((u) => {
            const company = companies.find((c) => c.id === u.companyId);
            const visits = requests.filter((r) => r.employeeId === u.id).length;
            return [
              u.id,
              u.name,
              u.email,
              u.phone,
              company?.name ?? '',
              u.city ?? '',
              u.age ?? '',
              u.gender && u.gender !== 'unspecified' ? genderLabel[u.gender] : '',
              u.jobTitle,
              u.interestIds.map(interestTitle).join('; '),
              visits,
            ];
          }),
        ]),
    },
    {
      key: 'demand',
      title: 'Спрос',
      note: 'Сколько людей в каждой компании отметили интерес. Для продажи мерчантам.',
      run: () => {
        const rows: (string | number)[][] = [['company', 'interest', 'category', 'people']];
        for (const c of companies) {
          const team = employees.filter((u) => u.companyId === c.id);
          for (const item of interests) {
            const n = team.filter((u) => u.interestIds.includes(item.id)).length;
            if (n) rows.push([c.name, item.title, categoryLabel[item.category], n]);
          }
        }
        downloadCsv('demand.csv', rows);
      },
    },
    {
      key: 'usage',
      title: 'Визиты',
      note: `${requests.length} заявок: компания, мерчант, услуга, категория, статус.`,
      run: () =>
        downloadCsv('usage.csv', [
          ['id', 'created', 'company', 'merchant', 'offer', 'category', 'status', 'employee'],
          ...requests.map((r) => {
            const offer = offers.find((o) => o.id === r.offerId);
            const company = companies.find((c) => c.id === r.companyId);
            const merchant = merchants.find((m) => m.id === offer?.merchantId);
            const user = users.find((u) => u.id === r.employeeId);
            return [
              r.id,
              r.createdAt,
              company?.name ?? '',
              merchant?.name ?? '',
              offer?.title ?? '',
              offer ? categoryLabel[offer.category] : '',
              statusLabel[r.status] ?? r.status,
              user?.name ?? '',
            ];
          }),
        ]),
    },
    {
      key: 'companies',
      title: 'Компании',
      note: `${companies.length} компаний: город, статус, число людей.`,
      run: () =>
        downloadCsv('companies.csv', [
          ['id', 'name', 'city', 'status', 'employees', 'hr'],
          ...companies.map((c) => [
            c.id,
            c.name,
            c.city,
            companyStatusLabel(c.status),
            users.filter((u) => u.companyId === c.id && u.role === 'employee').length,
            users.filter((u) => u.companyId === c.id && u.role === 'hr').length,
          ]),
        ]),
    },
    {
      key: 'merchants',
      title: 'Мерчанты',
      note: `${merchants.length} партнёров: категория, город, телефон, услуги.`,
      run: () =>
        downloadCsv('merchants.csv', [
          ['id', 'name', 'city', 'category', 'phone', 'verified', 'services'],
          ...merchants.map((m) => [
            m.id,
            m.name,
            m.city,
            categoryLabel[m.category],
            m.phone,
            m.verified ? 'yes' : 'no',
            m.services,
          ]),
        ]),
    },
    {
      key: 'pack',
      title: 'Пакет JSON',
      note: 'Все таблицы одним файлом. Пароли не входят.',
      run: () =>
        downloadJson('corporate-data.json', {
          exportedAt: new Date().toISOString(),
          companies,
          merchants,
          people: users.map(({ password: _pw, ...u }) => u),
          offers,
          requests,
          partnerships,
          transactions,
        }),
    },
  ];

  return (
    <>
      <h1>Выгрузка</h1>
      <p className="lead">Файлы для продажи: аудитория, спрос, визиты. CSV открывается в Excel. Пароли не выгружаем.</p>
      <div className="people-grid">
        {packs.map((p) => (
          <div key={p.key} className="tile">
            <h3 style={{ margin: '0 0 8px' }}>{p.title}</h3>
            <p className="meta" style={{ minHeight: 48 }}>
              {p.note}
            </p>
            <button className="hr-btn" type="button" onClick={p.run} style={{ marginTop: 12 }}>
              Скачать
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function csvCell(value: string | number) {
  const s = String(value);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const body = rows.map((row) => row.map(csvCell).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + body], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function People() {
  const { users, companies, merchants } = useStore();
  const [role, setRole] = useState<'all' | 'hr' | 'merchant' | 'employee' | 'admin'>('all');
  const shown = role === 'all' ? users : users.filter((u) => u.role === role);

  return (
    <>
      <h1>Люди</h1>
      <div className="hr-switch">
        {(
          [
            ['all', 'Все'],
            ['hr', 'HR'],
            ['merchant', 'Мерчанты'],
            ['employee', 'Сотрудники'],
            ['admin', 'Админ'],
          ] as const
        ).map(([key, label]) => (
          <button key={key} className={role === key ? 'on' : ''} type="button" onClick={() => setRole(key)}>
            {label}
          </button>
        ))}
      </div>
      <div className="hr-list">
        <div className="hr-line hr-head">
          <div>Человек</div>
          <div>Где</div>
          <div>Роль</div>
        </div>
        {shown.map((u) => {
          const company = companies.find((c) => c.id === u.companyId);
          const shop = merchants.find((m) => m.id === u.merchantId);
          return (
            <div key={u.id} className="hr-line">
              <div className="hr-who">
                <div className="hr-avatar">{initials(u.name)}</div>
                <div>
                  <div className="hr-name">{u.name}</div>
                  <div className="meta">
                    {u.email} · {u.jobTitle}
                    {u.age ? ` · ${u.age}` : ''}
                    {u.gender && u.gender !== 'unspecified' ? ` · ${genderLabel[u.gender]}` : ''}
                    {u.city ? ` · ${u.city}` : ''}
                    {u.active === false ? ' · отключён' : ''}
                  </div>
                </div>
              </div>
              <div className="meta">{company?.name ?? shop?.name ?? 'Приложение'}</div>
              <div className="hr-side">
                <span className="badge">{ROLE_LABEL[u.role] ?? u.role}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Ops() {
  const { transactions, users, companies, offers } = useStore();
  const sorted = useMemo(
    () => [...transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt, 'ru')),
    [transactions],
  );

  return (
    <>
      <h1>Операции</h1>
      <div className="hr-list">
        <div className="hr-line hr-head">
          <div>Операция</div>
          <div>Кто</div>
          <div>Сумма</div>
        </div>
        {sorted.map((t) => {
          const user = users.find((u) => u.id === t.userId);
          const company = companies.find((c) => c.id === t.companyId);
          const offer = offers.find((o) => o.id === t.offerId);
          const title = offer?.title ?? (t.type === 'topup' ? 'Пополнение' : 'Операция');
          return (
            <div key={t.id} className="hr-line">
              <div>
                <div className="hr-name">{title}</div>
                <div className="meta">{t.createdAt}</div>
              </div>
              <div className="meta">
                {user?.name ?? t.userId}
                {company ? ` · ${company.name}` : ''}
              </div>
              <div className="hr-side">
                {t.type === 'redeem' ? `−${t.amount.toLocaleString('ru-RU')}` : `+${t.amount.toLocaleString('ru-RU')}`}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function AccessBadge({
  kind,
  value,
}: { kind: 'company'; value: CompanyAccess } | { kind: 'merchant'; value: MerchantAccess }) {
  if (kind === 'company') {
    if (value === 'Active') return <span className="ok">В приложении</span>;
    if (value === 'Rejected') return <span className="warn">Отказ</span>;
    return <span className="warn">Ждёт доступа</span>;
  }
  if (value === 'verified') return <span className="ok">Verified</span>;
  if (value === 'rejected') return <span className="warn">Отказ</span>;
  return <span className="warn">Review</span>;
}
