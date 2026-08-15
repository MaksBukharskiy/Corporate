import { useEffect, useState } from 'react';
import { Bot, Building2, CircleUser, Inbox, LayoutDashboard, Percent, Sparkles } from 'lucide-react';
import { categoryAccent, categoryCover, categoryLabel, formatIsoDate, interests, partnershipInboxRank, partnershipLabel, servicePhotoPresets, telHref } from '../data';
import { CourseCard, OfferCover, offerPrice } from './offerGrid';
import { ReviewStrip } from './merchantShowcase';
import { useHashRoute } from '../hashNav';
import type { Category, CompanyPrice, Gender, Offer, OfferPeriod, PriceMode } from '../types';
import { PersonFields, parseAge } from './personForm';
import { Assistant } from './Assistant';
import { Shell } from './Shell';
import { useStore } from '../store';

const BASE_PLAN = '*';

const nav = [
  { key: 'overview', label: 'Обзор', icon: LayoutDashboard },
  { key: 'inbox', label: 'Заявки', icon: Inbox },
  { key: 'companies', label: 'Компании', icon: Building2 },
  { key: 'offers', label: 'Услуги', icon: Sparkles },
  { key: 'prices', label: 'Цены', icon: Percent },
  { key: 'assistant', label: 'Lin', icon: Bot },
  { key: 'profile', label: 'Профиль', icon: CircleUser },
];

const MERCHANT_PAGES = nav.map((n) => n.key).join(',');

function useMerchantId() {
  const { session, merchants } = useStore();
  const merchantId = session?.merchantId ?? 'm1';
  const merchant = merchants.find((m) => m.id === merchantId) ?? merchants[0];
  return { merchantId: merchant?.id ?? merchantId, merchant };
}

const periodLabel: Record<OfferPeriod, string> = {
  day: 'День',
  week: 'Неделя',
  month: 'Месяц',
};

function guessPeriod(o: Offer): OfferPeriod {
  if (o.period) return o.period;
  const t = `${o.title} ${o.description}`.toLowerCase();
  if (/день|дневн|разово/.test(t)) return 'day';
  if (/недел/.test(t)) return 'week';
  return 'month';
}

const WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function parseStamp(value: string) {
  const m = value.match(/^(\d{1,2}) авг, (\d{2}):(\d{2})/);
  if (!m) return { day: 1, hh: 12 };
  return { day: Number(m[1]), hh: Number(m[2]) };
}

function weekday(day: number) {
  return (day - 3 + 70) % 7;
}

export function MerchantApp() {
  const { page, id, go } = useHashRoute(MERCHANT_PAGES, 'overview');
  const { merchant } = useMerchantId();
  const limited = Boolean(merchant && (!merchant.verified || merchant.rejected));
  return (
    <Shell title={`Мерчант · ${merchant?.name ?? 'кабинет'}`} nav={nav} page={page} onNav={(key) => go(key)}>
      {limited ? (
        <div className="review-banner" style={{ margin: '0 0 16px' }}>
          {merchant?.rejected ? 'Заявку отклонили.' : 'На проверке. Запросы недоступны.'}
        </div>
      ) : null}
      {page === 'overview' ? <Overview key={page} onGo={go} /> : null}
      {page === 'inbox' ? (
        <MerchantPartnerships openId={id} onOpen={(cid) => go('inbox', cid)} onClose={() => go('inbox')} />
      ) : null}
      {page === 'companies' ? (
        <Companies openId={id} onOpen={(cid) => go('companies', cid)} onClose={() => go('companies')} />
      ) : null}
      {page === 'offers' ? <Offers /> : null}
      {page === 'prices' ? <Prices /> : null}
      {page === 'assistant' ? <Assistant role="merchant" /> : null}
      {page === 'profile' ? <MerchantProfile /> : null}
    </Shell>
  );
}

function Overview({ onGo }: { onGo: (page: string, id?: string | null) => void }) {
  const { offers, requests, companies, partnerships, transactions } = useStore();
  const { merchant, merchantId } = useMerchantId();
  const mine = offers.filter((o) => o.merchantId === merchantId);
  const mineIds = new Set(mine.map((o) => o.id));
  const visits = requests.filter((r) => mineIds.has(r.offerId));
  const people = new Set(visits.map((r) => r.employeeId));
  const waiting = partnerships.filter((p) => p.merchantId === merchantId && (p.status === 'pending' || p.status === 'talking'));
  const pendingN = visits.filter((r) => r.status === 'pending').length;
  const approvedN = visits.filter((r) => r.status === 'approved' || r.status === 'in_progress' || r.status === 'completed').length;
  const rejectedN = visits.filter((r) => r.status === 'rejected').length;
  const convBase = pendingN + approvedN;
  const conv = convBase ? Math.round((approvedN / convBase) * 100) : 0;
  let stDeg = 0;
  const stSlices = [
    { n: pendingN, c: '#0284C7' },
    { n: approvedN, c: '#1D4ED8' },
    { n: rejectedN, c: '#64748B' },
  ].filter((s) => s.n > 0);
  const stTotal = Math.max(1, pendingN + approvedN + rejectedN);
  const stDonut = stSlices
    .map((s) => {
      const from = stDeg;
      stDeg += (s.n / stTotal) * 360;
      return `${s.c} ${from}deg ${stDeg}deg`;
    })
    .join(', ');
  const incoming = Array.from({ length: 7 }, (_, i) => {
    const day = 8 + i;
    return { day, n: visits.filter((r) => parseStamp(r.createdAt).day === day).length };
  });
  const inMax = Math.max(1, ...incoming.map((d) => d.n));
  const spent = transactions
    .filter((t) => t.type === 'redeem' && t.offerId && mineIds.has(t.offerId))
    .reduce((s, t) => s + t.amount, 0);
  const byCompany = companies
    .map((c) => {
      const rows = visits.filter((r) => r.companyId === c.id);
      const uniq = new Set(rows.map((r) => r.employeeId)).size;
      const deal = partnerships.find((p) => p.companyId === c.id && p.merchantId === merchantId);
      return { c, n: rows.length, uniq, deal: deal?.status };
    })
    .sort((a, b) => b.n - a.n);
  const hot = byCompany.filter((x) => x.n > 0);
  const quiet = byCompany.filter((x) => x.deal === 'connected' && x.n === 0);
  const walkIn = byCompany.filter((x) => x.n > 0 && !x.deal);
  const leader = hot[0];
  const share = visits.length && leader ? Math.round((leader.n / visits.length) * 100) : 0;
  const byOffer = mine
    .map((o) => ({ o, n: visits.filter((r) => r.offerId === o.id).length }))
    .sort((a, b) => b.n - a.n);
  const idleOffers = byOffer.filter((x) => x.o.active && x.n === 0);
  const byPeriod = (['day', 'week', 'month'] as OfferPeriod[]).map((p) => ({
    p,
    n: visits.filter((r) => {
      const o = mine.find((x) => x.id === r.offerId);
      return o ? guessPeriod(o) === p : false;
    }).length,
  }));
  const periodTotal = Math.max(1, byPeriod.reduce((s, x) => s + x.n, 0));
  let perDeg = 0;
  const periodColors: Record<OfferPeriod, string> = { day: '#0284C7', week: '#3B82F6', month: '#1D4ED8' };
  const periodDonut = byPeriod
    .filter((x) => x.n > 0)
    .map((x) => {
      const from = perDeg;
      perDeg += (x.n / periodTotal) * 360;
      return `${periodColors[x.p]} ${from}deg ${perDeg}deg`;
    })
    .join(', ');
  const byWeek = WEEK.map((label, i) => ({
    label,
    n: visits.filter((r) => weekday(parseStamp(r.createdAt).day) === i).length,
  }));
  const weekMax = Math.max(1, ...byWeek.map((d) => d.n));
  const peakDay = [...byWeek].sort((a, b) => b.n - a.n)[0];
  const slots = [
    { label: 'Утро', hint: 'до 11:00', n: visits.filter((r) => parseStamp(r.createdAt).hh < 11).length },
    { label: 'Обед', hint: '11–16', n: visits.filter((r) => parseStamp(r.createdAt).hh >= 11 && parseStamp(r.createdAt).hh < 16).length },
    { label: 'Вечер', hint: 'после 16:00', n: visits.filter((r) => parseStamp(r.createdAt).hh >= 16).length },
  ];
  const slotMax = Math.max(1, ...slots.map((s) => s.n));
  const peakSlot = [...slots].sort((a, b) => b.n - a.n)[0];
  const heatSlots = [
    { key: 'm', label: 'Утро', test: (h: number) => h < 11 },
    { key: 'd', label: 'Обед', test: (h: number) => h >= 11 && h < 16 },
    { key: 'e', label: 'Вечер', test: (h: number) => h >= 16 },
  ];
  const heat = heatSlots.map((slot) =>
    WEEK.map((_, wi) =>
      visits.filter((r) => {
        const s = parseStamp(r.createdAt);
        return weekday(s.day) === wi && slot.test(s.hh);
      }).length,
    ),
  );
  const heatMax = Math.max(1, ...heat.flat());
  const byMonth = Array.from({ length: 14 }, (_, i) => {
    const day = i + 1;
    return { day, n: visits.filter((r) => parseStamp(r.createdAt).day === day).length };
  });
  const monthMax = Math.max(1, ...byMonth.map((d) => d.n));
  const chartW = 640;
  const chartH = 168;
  const padX = 18;
  const padY = 22;
  const chartPts = byMonth.map((d, i) => ({
    ...d,
    x: padX + (i / Math.max(1, byMonth.length - 1)) * (chartW - padX * 2),
    y: chartH - padY - (d.n / monthMax) * (chartH - padY * 2),
  }));
  const chartLine = chartPts.map((p) => `${p.x},${p.y}`).join(' ');
  const chartArea = `${padX},${chartH - padY} ${chartLine} ${chartW - padX},${chartH - padY}`;
  const tips: { title: string; body: string; go: string; goLabel: string; id?: string }[] = [];
  if (leader && share >= 40) {
    tips.push({
      title: `${leader.c.name} · ${share}%`,
      body: `${leader.uniq} чел. · ${leader.n}`,
      go: 'prices',
      goLabel: 'Цены',
    });
  } else if (leader) {
    tips.push({
      title: leader.c.name,
      body: `${leader.uniq} чел. · ${leader.n}`,
      go: 'prices',
      goLabel: 'Цены',
    });
  }
  if (idleOffers[0]) {
    tips.push({
      title: idleOffers[0].o.title,
      body: '0 обращений',
      go: 'offers',
      goLabel: 'Услуги',
    });
  }
  if (waiting[0]) {
    const c = companies.find((x) => x.id === waiting[0].companyId);
    tips.push({
      title: c?.name ?? 'Компания',
      body: partnershipLabel[waiting[0].status] ?? 'запрос',
      go: waiting[0].initiator === 'hr' ? 'inbox' : 'companies',
      goLabel: waiting[0].initiator === 'hr' ? 'Заявки' : 'Компании',
      id: waiting[0].companyId,
    });
  }
  if (walkIn[0]) {
    tips.push({
      title: walkIn[0].c.name,
      body: 'без договора',
      go: 'companies',
      goLabel: 'Компании',
      id: walkIn[0].c.id,
    });
  }
  const shownTips = tips.slice(0, 3);

  let coDeg = 0;
  const coTotal = Math.max(1, visits.length);
  const coCols = ['#1D4ED8', '#3B82F6', '#0284C7', '#64748B', '#818CF8'];
  const coDonut = hot
    .slice(0, 5)
    .map((row, i) => {
      const from = coDeg;
      coDeg += (row.n / coTotal) * 360;
      return `${coCols[i]} ${from}deg ${coDeg}deg`;
    })
    .join(', ');

  return (
    <div className="hr-desk">
      <h1>{merchant?.name ?? 'Обзор'}</h1>
      {leader ? (
        <p className="lead">
          {leader.c.name} · {share}% · пик {peakDay.label}, {peakSlot.label.toLowerCase()}
        </p>
      ) : (
        <p className="lead">Обращений пока нет.</p>
      )}

      {shownTips.length ? (
        <div className="hr-list" style={{ marginBottom: 20 }}>
          {shownTips.map((t) => (
            <div key={t.title} className="hr-line">
              <div>
                <div className="hr-name">{t.title}</div>
                <div className="meta">{t.body}</div>
              </div>
              <div />
              <div className="hr-side">
                <button className="mini" type="button" onClick={() => onGo(t.go, t.id)}>
                  {t.goLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="dash-hero">
        <div className="hero-card hr-trade">
          <div className="hr-trade-top">
            <div>
              <div className="kicker">1–14 августа</div>
              <div className="hr-trade-val">
                {visits.length}
                <span>обращений</span>
              </div>
            </div>
            <div className="meta">{spent.toLocaleString('ru-RU')} баллов с ваших услуг</div>
          </div>
          <svg className="hr-trade-svg" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none">
            {[0.25, 0.5, 0.75].map((t) => (
              <line
                key={t}
                x1={padX}
                x2={chartW - padX}
                y1={padY + t * (chartH - padY * 2)}
                y2={padY + t * (chartH - padY * 2)}
                stroke="rgba(255,255,255,0.22)"
              />
            ))}
            <polygon className="chart-area" points={chartArea} fill="rgba(255,255,255,0.22)" />
            <polyline className="chart-line" points={chartLine} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            {chartPts.map((p) => (
              <circle className="chart-pt" key={p.day} cx={p.x} cy={p.y} r={p.n === monthMax && p.n > 0 ? 5.5 : 4} fill="#fff" stroke="rgba(255,255,255,0.75)" strokeWidth="2" />
            ))}
          </svg>
          <div className="hr-trade-axis">
            {byMonth.filter((_, i) => i % 2 === 0).map((d) => (
              <span key={d.day}>{d.day}</span>
            ))}
          </div>
        </div>
        <div className="kpi tight">
          <div className="stat">
            Компании
            <b>{hot.length}</b>
          </div>
          <div className="stat">
            Люди
            <b>{people.size}</b>
          </div>
          <div className="stat">
            Конверсия
            <b>{conv}%</b>
          </div>
          <div className="stat">
            Услуги
            <b>{mine.filter((o) => o.active).length}</b>
          </div>
        </div>
      </div>

      <div className="stat-strip">
        <div className="panel tight">
          <h3>Очередь → ок</h3>
          <div className="hr-pie">
            <div className="donut sm" style={{ background: `conic-gradient(${stDonut || 'var(--line) 0 360deg'})` }}>
              <span>{conv}%</span>
            </div>
            <div className="legend">
              <div>
                <i style={{ background: '#0284C7' }} />
                ждут · {pendingN}
              </div>
              <div>
                <i style={{ background: '#1D4ED8' }} />
                прошли · {approvedN}
              </div>
              <div>
                <i style={{ background: '#64748B' }} />
                отказ · {rejectedN}
              </div>
            </div>
          </div>
        </div>
        <div className="panel tight">
          <h3>Входящие 8–14</h3>
          <div className="spark-in">
            {incoming.map((d) => (
              <div key={d.day} className="spark-in-col">
                <div className="spark-col" style={{ height: `${12 + (d.n / inMax) * 64}px` }} />
                <span>{d.day}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel tight">
          <h3>По компаниям</h3>
          {hot.length === 0 ? (
            <p className="meta">Обращений нет</p>
          ) : (
            <div className="compare tight">
              {hot.slice(0, 6).map((x) => (
                <div key={x.c.id} className="compare-col">
                  <b>{x.n}</b>
                  <div className="tower" style={{ height: `${20 + (x.n / Math.max(1, hot[0].n)) * 88}px` }} />
                  <span className="meta">{x.c.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <h3>Неделя</h3>
        <div className="hr-week">
          {byWeek.map((d, i) => (
            <div key={d.label} className={`hr-week-col${i >= 5 ? ' weekend' : ''}${d.n === peakDay?.n && d.n > 0 ? ' peak' : ''}`}>
              <div className="hr-week-bar" style={{ height: `${28 + (d.n / weekMax) * 140}px` }} />
              <b>{d.n}</b>
              <span>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hr-dash">
        <div className="panel">
          <h3>Компании</h3>
          <div className="hr-pie">
            <div className="donut" style={{ background: `conic-gradient(${coDonut || 'var(--line) 0 360deg'})` }}>
              <span>{share}%</span>
            </div>
            <div className="legend">
              {hot.slice(0, 5).map((row, i) => (
                <div key={row.c.id}>
                  <i style={{ background: coCols[i] }} />
                  {row.c.name} · {row.n} · {row.uniq} чел.
                </div>
              ))}
            </div>
          </div>
          <div className="hr-podium" style={{ marginTop: 8 }}>
            {hot.slice(0, 5).map((x, i) => (
              <button key={x.c.id} className={`hr-podium-row${i === 0 ? ' first' : ''}`} type="button" onClick={() => onGo('prices')}>
                <span className="hr-place">{i + 1}</span>
                <div className="grow">
                  <div className="hr-name">{x.c.name}</div>
                  <div className="meta">{x.deal === 'connected' ? 'партнёр' : x.deal ? 'запрос' : 'без договора'}</div>
                </div>
                <b>{Math.round((x.n / coTotal) * 100)}%</b>
              </button>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3>Часы</h3>
          <div className="hr-slots">
            {slots.map((s) => (
              <div key={s.label} className="hr-slot">
                <div className="hr-ring" style={{ background: `conic-gradient(#246BFD ${(s.n / slotMax) * 360}deg, var(--line) 0)` }}>
                  <b>{s.n}</b>
                </div>
                <strong>{s.label}</strong>
                <span className="meta">{s.hint}</span>
              </div>
            ))}
          </div>
          <div className="hr-heat" style={{ marginTop: 18 }}>
            <div />
            {WEEK.map((d) => (
              <div key={d} className="hr-heat-lab">
                {d}
              </div>
            ))}
            {heatSlots.map((slot, si) => (
              <div key={slot.key} style={{ display: 'contents' }}>
                <div className="hr-heat-lab left">{slot.label}</div>
                {heat[si].map((n, di) => (
                  <div
                    key={`${slot.key}-${di}`}
                    className="hr-heat-cell"
                    title={`${slot.label}, ${WEEK[di]}: ${n}`}
                    style={{ background: `color-mix(in srgb, #246bfd ${(n / heatMax) * 100}%, var(--bg))` }}
                  >
                    {n || ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hr-dash">
        <div className="panel">
          <h3>Абонементы</h3>
          <div className="hr-pie">
            <div className="donut" style={{ background: `conic-gradient(${periodDonut || 'var(--line) 0 360deg'})` }}>
              <span>{visits.length}</span>
            </div>
            <div className="legend">
              {byPeriod.map((x) => (
                <div key={x.p}>
                  <i style={{ background: periodColors[x.p] }} />
                  {periodLabel[x.p]} · {Math.round((x.n / periodTotal) * 100)}%
                </div>
              ))}
            </div>
          </div>
          <div className="hr-podium" style={{ marginTop: 8 }}>
            {byOffer.slice(0, 5).map((x, i) => (
              <button key={x.o.id} className={`hr-podium-row${i === 0 ? ' first' : ''}`} type="button" onClick={() => onGo('offers')}>
                <span className="hr-place">{i + 1}</span>
                <div className="grow">
                  <div className="hr-name">{x.o.title}</div>
                  <div className="meta">
                    {periodLabel[guessPeriod(x.o)]} · {x.n ? `${x.n} взяли` : 'тишина'}
                  </div>
                </div>
                <b>{x.n}</b>
              </button>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3>Очередь</h3>
          <div className="hr-cover">
            <div>
              <b>{quiet.length}</b>
              <span className="meta">без визитов</span>
            </div>
            <div>
              <b>{idleOffers.length}</b>
              <span className="meta">без спроса</span>
            </div>
          </div>
          {quiet.map((row) => (
            <div key={row.c.id} className="hr-podium-row">
              <div className="grow">
                <div className="hr-name">{row.c.name}</div>
                <div className="meta">Договор есть, визитов нет</div>
              </div>
              <button className="mini" type="button" onClick={() => onGo('prices')}>
                Цена
              </button>
            </div>
          ))}
          {idleOffers.map((row) => (
            <div key={row.o.id} className="hr-podium-row">
              <div className="grow">
                <div className="hr-name">{row.o.title}</div>
                <div className="meta">0 · {periodLabel[guessPeriod(row.o)]}</div>
              </div>
              <button className="mini" type="button" onClick={() => onGo('offers')}>
                Править
              </button>
            </div>
          ))}
          {waiting.map((p) => {
            const c = companies.find((x) => x.id === p.companyId);
            return (
              <button key={p.id} className="hr-podium-row" type="button" onClick={() => onGo(p.initiator === 'hr' ? 'inbox' : 'companies', p.companyId)}>
                <div className="grow">
                  <div className="hr-name">{c?.name}</div>
                  <div className="meta">{partnershipLabel[p.status]}</div>
                </div>
              </button>
            );
          })}
          {!quiet.length && !idleOffers.length && !waiting.length ? (
            <p className="meta">Пусто.</p>
          ) : null}
        </div>
      </div>

    </div>
  );
}

type OfferDraft = {
  id?: string;
  title: string;
  description: string;
  points: string;
  paid: boolean;
  active: boolean;
  period: OfferPeriod;
  category: Category;
  image: string;
};

function emptyDraft(category: Category): OfferDraft {
  return { title: '', description: '', points: '2500', paid: true, active: true, period: 'month', category, image: categoryCover[category] };
}

function Offers() {
  const { offers, companies, saveOffer, deleteOffer, reviews } = useStore();
  const { merchant, merchantId } = useMerchantId();
  const allIds = companies.map((c) => c.id);
  const mine = offers.filter((o) => o.merchantId === merchantId);
  const fallbackCat: Category = merchant?.category ?? 'sport';
  const [draft, setDraft] = useState<OfferDraft | null>(null);

  const startEdit = (o: Offer) => {
    setDraft({
      id: o.id,
      title: o.title,
      description: o.description,
      points: String(o.points || 2500),
      paid: o.paid,
      active: o.active,
      period: guessPeriod(o),
      category: o.category,
      image: o.image ?? '',
    });
  };

  const save = () => {
    if (!draft || !draft.title.trim()) return;
    saveOffer({
      id: draft.id,
      merchantId,
      title: draft.title,
      description: draft.description,
      points: Number(draft.points) || 0,
      category: draft.category,
      active: draft.active,
      companyIds: allIds,
      paid: draft.paid,
      period: draft.period,
      image: draft.image.trim() || categoryCover[draft.category],
    });
    setDraft(null);
  };

  return (
    <>
      <h1>Услуги</h1>
      <p className="lead">Карточка открывает редактирование. Новая услуга — кнопка над сеткой.</p>
      <div className="actions" style={{ marginBottom: 16 }}>
        <button className="mini" type="button" onClick={() => setDraft(emptyDraft(fallbackCat))}>
          Новая услуга
        </button>
      </div>
      {mine.length === 0 ? (
        <div className="hr-empty">Пока нет услуг. Добавьте первую.</div>
      ) : (
        <div className="offer-grid">
          {mine.map((o) => (
              <CourseCard
                key={o.id}
                offer={o}
                dim={!o.active}
                showDescription
                onOpen={() => startEdit(o)}
                footerLeft={offerPrice(o)}
                footerRight={<span className={o.active ? 'ok' : 'warn'}>{o.active ? 'Активна' : 'Скрыта'}</span>}
              />
          ))}
        </div>
      )}
      <ReviewStrip reviews={reviews.filter((r) => r.merchantId === merchantId)} />
      {draft ? (
        <div className="hr-overlay" onClick={() => setDraft(null)}>
          <div className="hr-sheet course-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="hr-sheet-close" type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setDraft(null)}>
              Закрыть
            </button>
            <OfferCover category={draft.category} imageUrl={draft.image} />
            <h2 style={{ marginTop: 16 }}>{draft.id ? 'Изменить услугу' : 'Новая услуга'}</h2>
            <div className="auth-form" style={{ marginTop: 12 }}>
              <label>
                Фото услуги
                <input
                  value={draft.image}
                  onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                  placeholder="https://…"
                />
              </label>
              <div className="photo-thumbs">
                {servicePhotoPresets.map((src) => (
                  <button
                    key={src}
                    className={`photo-thumb${draft.image === src ? ' on' : ''}`}
                    type="button"
                    onClick={() => setDraft({ ...draft, image: src })}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
              <label>
                Название
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Абонемент в зал" />
              </label>
              <label>
                Описание
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Что входит"
                  rows={5}
                />
              </label>
              <div className="meta">Категория</div>
              <div className="modes wrap">
                {(Object.keys(categoryLabel) as Category[]).map((key) => (
                  <button key={key} className={`mode${draft.category === key ? ' on' : ''}`} type="button" onClick={() => setDraft({ ...draft, category: key })}>
                    {categoryLabel[key]}
                  </button>
                ))}
              </div>
              <div className="meta">Срок</div>
              <div className="modes">
                {(['day', 'week', 'month'] as OfferPeriod[]).map((p) => (
                  <button key={p} className={`mode${draft.period === p ? ' on' : ''}`} type="button" onClick={() => setDraft({ ...draft, period: p })}>
                    {periodLabel[p]}
                  </button>
                ))}
              </div>
              <div className="meta">Цена</div>
              <div className="modes">
                <button className={`mode${!draft.paid ? ' on' : ''}`} type="button" onClick={() => setDraft({ ...draft, paid: false })}>
                  Бесплатно
                </button>
                <button className={`mode${draft.paid ? ' on' : ''}`} type="button" onClick={() => setDraft({ ...draft, paid: true })}>
                  Баллы
                </button>
              </div>
              {draft.paid ? (
                <label>
                  Баллы
                  <input
                    inputMode="numeric"
                    value={draft.points}
                    onChange={(e) => setDraft({ ...draft, points: e.target.value.replace(/[^\d]/g, '') })}
                  />
                </label>
              ) : null}
              <div className="row" style={{ border: 'none', padding: 0 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>В каталоге</div>
                  <div className="meta">{draft.active ? 'Видна' : 'Скрыта'}</div>
                </div>
                <button className={`switch${draft.active ? ' on' : ''}`} type="button" onClick={() => setDraft({ ...draft, active: !draft.active })}>
                  <i />
                </button>
              </div>
              <div className="actions">
                <button className="mini" type="button" onClick={save}>
                  Сохранить
                </button>
                <button className="mini danger" type="button" onClick={() => setDraft(null)}>
                  Отмена
                </button>
                {draft.id ? (
                  <button
                    className="hr-del"
                    type="button"
                    onClick={() => {
                      if (!window.confirm(`Удалить «${draft.title || 'услугу'}»?`)) return;
                      deleteOffer(draft.id!, merchantId);
                      setDraft(null);
                    }}
                  >
                    Удалить
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function peopleWord(n: number) {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return `${n} сотрудник`;
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return `${n} сотрудника`;
  return `${n} сотрудников`;
}

function MerchantPartnerships({
  openId,
  onOpen,
  onClose,
}: {
  openId: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  const { companies, partnerships, setPartnershipStatus } = useStore();
  const { merchant, merchantId } = useMerchantId();
  const [tab, setTab] = useState<'in' | 'out'>('in');
  const live = Boolean(merchant?.verified && !merchant?.rejected);
  const incoming = partnerships
    .filter((p) => p.merchantId === merchantId && p.initiator === 'hr' && p.status !== 'connected')
    .sort((a, b) => partnershipInboxRank(a.status) - partnershipInboxRank(b.status) || b.createdAt.localeCompare(a.createdAt));
  const outgoing = partnerships
    .filter((p) => p.merchantId === merchantId && p.initiator === 'merchant' && p.status !== 'connected')
    .sort((a, b) => partnershipInboxRank(a.status) - partnershipInboxRank(b.status) || b.createdAt.localeCompare(a.createdAt));
  const rows = tab === 'in' ? incoming : outgoing;

  return (
    <div className="hr-desk">
      <h1>Заявки</h1>
      <p className="lead">Запросы HR на партнёрство. Визиты сотрудников — в мобильном приложении.</p>
      <div className="hr-switch">
        <button className={tab === 'in' ? 'on' : ''} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setTab('in')}>
          Входящие
        </button>
        <button className={tab === 'out' ? 'on' : ''} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setTab('out')}>
          Исходящие
        </button>
      </div>
      <div className="hr-list">
        <div className="hr-line hr-head queue-row">
          <div>Компания</div>
          <div>Дата</div>
          <div>Действия</div>
        </div>
        {rows.length === 0 ? (
          <div className="hr-empty">{tab === 'in' ? 'Нет входящих заявок от HR.' : 'Нет исходящих запросов.'}</div>
        ) : (
          rows.map((p) => {
            const c = companies.find((x) => x.id === p.companyId);
            const actionable = tab === 'in' && live && (p.status === 'pending' || p.status === 'talking');
            return (
              <div key={p.id} className="hr-line queue-row" onClick={() => c && onOpen(c.id)}>
                <div className="hr-who">
                  <span className="hr-dot lg" style={{ background: '#246BFD' }} />
                  <div>
                    <div className="hr-name">{c?.name ?? 'Компания'}</div>
                    <div className="meta">
                      {c?.city ?? '—'}
                      {p.status !== 'pending' ? ` · ${partnershipLabel[p.status]}` : ''}
                    </div>
                  </div>
                </div>
                <div className="meta">{formatIsoDate(p.createdAt)}</div>
                <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                  {actionable ? (
                    <>
                      <button
                        className="hr-btn sm"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPartnershipStatus(p.id, 'connected');
                        }}
                      >
                        Подтвердить
                      </button>
                      <button
                        className="hr-btn ghost sm"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPartnershipStatus(p.id, 'rejected');
                        }}
                      >
                        Отклонить
                      </button>
                    </>
                  ) : (
                    <span className="meta">{partnershipLabel[p.status]}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      {openId ? <CompanyPeek companyId={openId} onClose={onClose} /> : null}
    </div>
  );
}

function CompanyPeek({ companyId, onClose }: { companyId: string; onClose: () => void }) {
  const { companies, users, offers, requests, partnerships, sendPartnership, setPartnershipStatus, endPartnership } = useStore();
  const { merchant, merchantId } = useMerchantId();
  const c = companies.find((x) => x.id === companyId);
  if (!c) return null;
  const deal = partnerships.find((p) => p.companyId === c.id && p.merchantId === merchantId);
  const ours = deal?.status === 'connected';
  const waiting = deal?.status === 'pending' || deal?.status === 'talking';
  const merchantLive = Boolean(merchant?.verified && !merchant?.rejected);
  const live = c.status === 'Active';
  const canAsk = live && merchantLive && !ours && !waiting;
  const cat = merchant?.category;
  const team = users.filter((u) => u.companyId === c.id && u.role === 'employee');
  const why = cat ? interests.filter((i) => i.category === cat && team.some((u) => u.interestIds.includes(i.id))) : [];
  const hits = cat
    ? team.filter((u) => u.interestIds.some((id) => interests.find((x) => x.id === id)?.category === cat)).length
    : 0;
  const mine = offers.filter((o) => o.merchantId === merchantId);
  const mineIds = new Set(mine.map((o) => o.id));
  const used = requests.filter((r) => mineIds.has(r.offerId) && r.companyId === c.id).length;
  const hr = users.find((u) => u.role === 'hr' && u.companyId === c.id && u.active !== false);

  return (
    <div className="hr-overlay" onClick={onClose}>
      <div className="hr-sheet" onClick={(e) => e.stopPropagation()}>
        <button className="hr-sheet-close" type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClose}>
          Закрыть
        </button>
        {ours ? (
          <div className="kicker">Наш партнёр</div>
        ) : deal?.status === 'pending' || deal?.status === 'talking' ? (
          <div className="kicker">{partnershipLabel[deal.status]}</div>
        ) : (
          <div className="kicker">Рекомендация</div>
        )}
        <h2>{c.name}</h2>
        <p className="meta">
          {c.city} · {team.length} сотрудников
          {hits ? ` · интерес к вам у ${peopleWord(hits)}` : ''}
          {used ? ` · уже ${used} обращений` : ''}
        </p>
        {hr ? (
          <p className="meta" style={{ marginTop: 8 }}>
            HR: {hr.name}
            {hr.phone ? (
              <>
                {' · '}
                <a className="hr-phone" href={telHref(hr.phone)}>
                  {hr.phone}
                </a>
              </>
            ) : null}
          </p>
        ) : (
          <p className="meta">Нет контакта HR.</p>
        )}
        {why.length ? (
          <div className="hr-chips" style={{ marginTop: 10 }}>
            {why.map((item) => (
              <span key={item.id} className="chip">
                <i className="hr-dot" style={{ background: categoryAccent[item.category] }} />
                {item.title}
              </span>
            ))}
          </div>
        ) : null}

        <div className="hr-actions" style={{ marginTop: 20 }}>
          {ours ? (
            <button
              className="hr-btn ghost"
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                endPartnership(c.id, merchantId);
                onClose();
              }}
            >
              Прекратить услуги
            </button>
          ) : canAsk ? (
            <button className="hr-btn" type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => sendPartnership(c.id, merchantId, 'merchant')}>
              Запросить
            </button>
          ) : !live || !merchantLive ? (
            <span className="meta">На проверке</span>
          ) : deal && waiting && deal.initiator === 'hr' ? (
            <>
              <button className="hr-btn" type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setPartnershipStatus(deal.id, 'connected')}>
                Подтвердить
              </button>
              <button className="hr-btn ghost" type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setPartnershipStatus(deal.id, 'rejected')}>
                Отклонить
              </button>
            </>
          ) : deal && waiting ? (
            <p className="meta" style={{ width: '100%', margin: 0 }}>
              Запрос у HR. Ответ придёт в заявках компании.
            </p>
          ) : null}
          {hr?.phone ? (
            <a className="hr-btn ghost" href={telHref(hr.phone)}>
              Позвонить
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Companies({
  openId,
  onOpen,
  onClose,
}: {
  openId: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  const { companies, users, offers, requests, partnerships, sendPartnership } = useStore();
  const { merchant, merchantId } = useMerchantId();
  const [tab, setTab] = useState<'ours' | 'rec'>('ours');
  const mine = offers.filter((o) => o.merchantId === merchantId);
  const mineIds = new Set(mine.map((o) => o.id));
  const visits = requests.filter((r) => mineIds.has(r.offerId));
  const cat = merchant?.category;
  const merchantLive = Boolean(merchant?.verified && !merchant?.rejected);

  const rows = companies
    .map((c) => {
      const deal = partnerships.find((p) => p.companyId === c.id && p.merchantId === merchantId);
      const ours = deal?.status === 'connected';
      const team = users.filter((u) => u.companyId === c.id && u.role === 'employee');
      const why = cat ? interests.filter((i) => i.category === cat && team.some((u) => u.interestIds.includes(i.id))) : [];
      const hits = cat
        ? team.filter((u) => u.interestIds.some((id) => interests.find((x) => x.id === id)?.category === cat)).length
        : 0;
      const used = visits.filter((r) => r.companyId === c.id).length;
      const hr = users.find((u) => u.role === 'hr' && u.companyId === c.id && u.active !== false);
      return { c, deal, ours, why, hits, used, team: team.length, hr, live: c.status === 'Active' };
    })
    .sort((a, b) => b.hits - a.hits || b.used - a.used || a.c.name.localeCompare(b.c.name, 'ru'));

  const ours = rows.filter((r) => r.ours);
  const recommended = rows.filter((r) => !r.ours);
  const shown = tab === 'ours' ? ours : recommended.sort((a, b) => b.hits - a.hits || (a.deal ? 0 : 1) - (b.deal ? 0 : 1));
  const max = Math.max(1, ...shown.map((r) => Math.max(r.hits, r.used)));

  return (
    <div className="hr-desk">
      <h1>Компании</h1>
      <div className="hr-switch">
        <button
          className={tab === 'ours' ? 'on' : ''}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setTab('ours');
            onClose();
          }}
        >
          Наши
        </button>
        <button
          className={tab === 'rec' ? 'on' : ''}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setTab('rec');
            onClose();
          }}
        >
          Рекомендации
        </button>
      </div>
      <div className="hr-list hr-mscroll">
        {shown.length === 0 ? (
          <div className="hr-empty">
            {tab === 'ours' ? 'Пока нет партнёров.' : 'Нет компаний вне партнёрки.'}
          </div>
        ) : (
          shown.map((r, i) => {
            const waiting = r.deal?.status === 'pending' || r.deal?.status === 'talking';
            const canAsk = r.live && merchantLive && !r.ours && !waiting;
            return (
              <div key={r.c.id} className="hr-mline" onClick={() => onOpen(r.c.id)} style={r.live ? undefined : { opacity: 0.55 }}>
                <span className="hr-rank">{i + 1}</span>
                <div className="hr-who">
                  <span className="hr-dot lg" style={{ background: '#246BFD' }} />
                  <div>
                    <div className="hr-name">{r.c.name}</div>
                    <div className="meta">
                      {r.ours
                        ? 'Партнёр'
                        : !r.live
                          ? 'на проверке'
                          : r.deal?.status === 'rejected'
                            ? 'Отказали'
                            : r.deal
                              ? partnershipLabel[r.deal.status]
                              : r.hits
                                ? `подходит ${peopleWord(r.hits)}`
                                : 'без совпадений'}
                      {r.used ? ` · ${r.used} обращений` : ''}
                    </div>
                    {r.why.length ? (
                      <div className="hr-chips">
                        {r.why.slice(0, 4).map((item) => (
                          <span key={item.id} className="chip">
                            <i className="hr-dot" style={{ background: categoryAccent[item.category] }} />
                            {item.title}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="hr-demand">
                  {tab === 'rec' && canAsk ? (
                    <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="hr-btn sm"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sendPartnership(r.c.id, merchantId, 'merchant');
                        }}
                      >
                        Запросить
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${(Math.max(r.hits, r.used) / max) * 100}%`, background: '#246BFD' }} />
                      </div>
                      <span className="meta">{tab === 'ours' ? `${r.used} визитов` : peopleWord(r.hits)}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      {openId ? <CompanyPeek companyId={openId} onClose={onClose} /> : null}
    </div>
  );
}

function priceLabel(p: CompanyPrice | undefined, fallback: string) {
  if (!p) return fallback;
  if (p.mode === 'free') return 'Бесплатно';
  if (p.mode === 'discount') return `Скидка ${p.discountPct}%`;
  return `${p.points} баллов`;
}

function matchPrice(prices: CompanyPrice[], merchantId: string, companyId: string, offerId?: string) {
  return prices.find((p) => p.merchantId === merchantId && p.companyId === companyId && (p.offerId ?? undefined) === offerId);
}

function dealLabel(ours: boolean, status?: string) {
  if (ours) return 'Работаем';
  if (status === 'rejected') return 'Закрыто';
  if (status) return 'Запрос в работе';
  return 'Не подключены';
}

function Prices() {
  const { companies, offers, prices, partnerships, setPrice, clearOfferPrice } = useStore();
  const { merchantId } = useMerchantId();
  const mine = offers.filter((o) => o.merchantId === merchantId);
  const [openId, setOpenId] = useState<string | null>(companies[0]?.id ?? null);
  const base = matchPrice(prices, merchantId, BASE_PLAN);
  const selected = companies.find((c) => c.id === openId) ?? companies[0];
  const deal = selected ? partnerships.find((p) => p.companyId === selected.id && p.merchantId === merchantId) : undefined;
  const ours = deal?.status === 'connected';
  const own = selected ? matchPrice(prices, merchantId, selected.id) : undefined;
  const effective = own ?? base;

  return (
    <>
      <h1>Цены</h1>
      <div className="panel" style={{ marginBottom: 20 }}>
        <h3>Базовый план</h3>
        <PriceEditor
          mode={base?.mode ?? 'points'}
          discountPct={base?.discountPct ?? 20}
          points={base?.points ?? 2500}
          onMode={(mode) => setPrice(BASE_PLAN, merchantId, mode, { discountPct: base?.discountPct, points: base?.points })}
          onDiscount={(n) => setPrice(BASE_PLAN, merchantId, 'discount', { discountPct: n, points: base?.points })}
          onPoints={(n) => setPrice(BASE_PLAN, merchantId, 'points', { discountPct: base?.discountPct, points: n })}
        />
      </div>
      <div className="hr-list">
        {companies.map((c) => {
          const row = matchPrice(prices, merchantId, c.id);
          const shown = row ?? base;
          const p = partnerships.find((x) => x.companyId === c.id && x.merchantId === merchantId);
          const connected = p?.status === 'connected';
          const on = openId === c.id;
          return (
            <button
              key={c.id}
              className={`hr-line${on ? ' on' : ''}`}
              type="button"
              onClick={() => setOpenId(c.id)}
              style={{ width: '100%', textAlign: 'left' }}
            >
              <div className="hr-name">{c.name}</div>
              <div className="meta">{dealLabel(connected, p?.status)}</div>
              <div className="hr-side">{row ? priceLabel(row, '') : priceLabel(shown, 'баллы')}</div>
            </button>
          );
        })}
      </div>
      {selected ? (
        <div className="panel" style={{ marginTop: 20 }}>
          <h3>{selected.name}</h3>
          <p className="meta">
            {dealLabel(ours, deal?.status)} · {own ? priceLabel(own, '') : priceLabel(effective, 'баллы')}
          </p>
          <PriceEditor
            mode={effective?.mode ?? 'points'}
            discountPct={effective?.discountPct ?? 20}
            points={effective?.points ?? 2500}
            onMode={(mode) => setPrice(selected.id, merchantId, mode, { discountPct: effective?.discountPct, points: effective?.points })}
            onDiscount={(n) => setPrice(selected.id, merchantId, 'discount', { discountPct: n, points: effective?.points })}
            onPoints={(n) => setPrice(selected.id, merchantId, 'points', { discountPct: effective?.discountPct, points: n })}
          />
          <h3 style={{ marginTop: 24 }}>Услуги</h3>
          <div className="hr-list">
            {mine.map((o) => {
              const row = matchPrice(prices, merchantId, selected.id, o.id);
              const shown = row ?? effective;
              return (
                <div key={o.id} className="hr-line">
                  <div className="grow">
                    <div className="hr-name">{o.title}</div>
                    <div className="meta">
                      {periodLabel[guessPeriod(o)]} · {row ? priceLabel(row, '') : priceLabel(shown, 'услуга')}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <PriceEditor
                        mode={shown?.mode ?? (o.paid ? 'points' : 'free')}
                        discountPct={shown?.discountPct ?? 20}
                        points={shown?.points ?? o.points ?? 2500}
                        onMode={(mode) =>
                          setPrice(selected.id, merchantId, mode, {
                            discountPct: shown?.discountPct,
                            points: shown?.points ?? o.points,
                            offerId: o.id,
                          })
                        }
                        onDiscount={(n) =>
                          setPrice(selected.id, merchantId, 'discount', {
                            discountPct: n,
                            points: shown?.points ?? o.points,
                            offerId: o.id,
                          })
                        }
                        onPoints={(n) =>
                          setPrice(selected.id, merchantId, 'points', { discountPct: shown?.discountPct, points: n, offerId: o.id })
                        }
                      />
                      {row ? (
                        <button className="mini" type="button" style={{ marginTop: 8 }} onClick={() => clearOfferPrice(selected.id, merchantId, o.id)}>
                          Как у компании
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}

function PriceEditor({
  mode,
  discountPct,
  points,
  onMode,
  onDiscount,
  onPoints,
}: {
  mode: PriceMode;
  discountPct: number;
  points: number;
  onMode: (mode: PriceMode) => void;
  onDiscount: (n: number) => void;
  onPoints: (n: number) => void;
}) {
  const [pct, setPct] = useState(String(discountPct));
  const [pts, setPts] = useState(String(points));
  useEffect(() => {
    setPct(String(discountPct));
    setPts(String(points));
  }, [discountPct, points]);

  return (
    <>
      <div className="modes">
        {(['free', 'discount', 'points'] as PriceMode[]).map((m) => (
          <button key={m} className={`mode${mode === m ? ' on' : ''}`} type="button" onClick={() => onMode(m)}>
            {m === 'free' ? 'Бесплатно' : m === 'discount' ? 'Скидка' : 'Баллы'}
          </button>
        ))}
      </div>
      {mode === 'discount' ? (
        <label className="auth-form" style={{ marginTop: 10 }}>
          Процент скидки
          <input
            inputMode="numeric"
            value={pct}
            onChange={(e) => setPct(e.target.value.replace(/[^\d]/g, ''))}
            onBlur={() => onDiscount(Math.min(90, Math.max(1, Number(pct) || 20)))}
          />
        </label>
      ) : null}
      {mode === 'points' ? (
        <label className="auth-form" style={{ marginTop: 10 }}>
          Баллы
          <input
            inputMode="numeric"
            value={pts}
            onChange={(e) => setPts(e.target.value.replace(/[^\d]/g, ''))}
            onBlur={() => onPoints(Math.max(0, Number(pts) || 0))}
          />
        </label>
      ) : null}
    </>
  );
}

function MerchantProfile() {
  const { session, updateProfile, updateMerchant } = useStore();
  const { merchant, merchantId } = useMerchantId();
  const [name, setName] = useState(session?.name ?? '');
  const [phone, setPhone] = useState(session?.phone || merchant?.phone || '');
  const [age, setAge] = useState(session?.age != null ? String(session.age) : '');
  const [gender, setGender] = useState<Gender>(session?.gender ?? 'unspecified');
  const [city, setCity] = useState(session?.city ?? '');
  const [jobTitle, setJobTitle] = useState(session?.jobTitle ?? '');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState(merchant?.name ?? '');
  const [orgCity, setOrgCity] = useState(merchant?.city ?? '');
  const [orgPhone, setOrgPhone] = useState(merchant?.phone ?? '');
  const [orgCategory, setOrgCategory] = useState<Category>(merchant?.category ?? 'sport');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(session?.name ?? '');
    setPhone(session?.phone || merchant?.phone || '');
    setAge(session?.age != null ? String(session.age) : '');
    setGender(session?.gender ?? 'unspecified');
    setCity(session?.city ?? '');
    setJobTitle(session?.jobTitle ?? '');
    setOrgName(merchant?.name ?? '');
    setOrgCity(merchant?.city ?? '');
    setOrgPhone(merchant?.phone ?? '');
    setOrgCategory(merchant?.category ?? 'sport');
  }, [session, merchant]);

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
        <h3>Организация</h3>
        <div className="profile-row">
          <span>Название</span>
          <input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="FitZone" />
        </div>
        <div className="profile-row">
          <span>Телефон</span>
          <input value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} autoComplete="tel" />
        </div>
        <div className="profile-row">
          <span>Город</span>
          <input value={orgCity} onChange={(e) => setOrgCity(e.target.value)} placeholder="Ташкент" />
        </div>
        <div className="profile-row">
          <span>Категория</span>
          <select value={orgCategory} onChange={(e) => setOrgCategory(e.target.value as Category)}>
            {(Object.keys(categoryLabel) as Category[]).map((key) => (
              <option key={key} value={key}>
                {categoryLabel[key]}
              </option>
            ))}
          </select>
        </div>
        <div className="profile-row">
          <span>Статус</span>
          <b className={merchant?.verified ? 'ok' : 'warn'}>{merchant?.verified ? 'Проверен' : 'На проверке'}</b>
        </div>
        <div className="profile-actions">
          <button
            className="primary"
            type="button"
            onClick={() => {
              updateProfile({ name, phone, age: parseAge(age), gender, city, jobTitle, password });
              updateMerchant(merchantId, { name: orgName, city: orgCity, phone: orgPhone, category: orgCategory });
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
