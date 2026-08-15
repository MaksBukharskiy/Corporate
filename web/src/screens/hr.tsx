import { Fragment, useEffect, useState } from 'react';
import { Bot, CircleUser, ClipboardList, Inbox, LayoutDashboard, Store, Users } from 'lucide-react';
import { categoryAccent, categoryLabel, companyStatusLabel, formatIsoDate, interests, partnershipInboxRank, partnershipLabel, telHref } from '../data';
import { CourseCard, OfferCover, offerPrice } from './offerGrid';
import { ReviewStrip } from './merchantShowcase';
import { useHashRoute } from '../hashNav';
import type { Gender, User } from '../types';
import { PersonFields, parseAge } from './personForm';
import { Assistant } from './Assistant';
import { Shell } from './Shell';
import { useStore } from '../store';

const nav = [
  { key: 'overview', label: 'Обзор', icon: LayoutDashboard },
  { key: 'inbox', label: 'Заявки', icon: Inbox },
  { key: 'people', label: 'Сотрудники', icon: Users },
  { key: 'catalog', label: 'Каталог', icon: ClipboardList },
  { key: 'merchants', label: 'Мерчанты', icon: Store },
  { key: 'assistant', label: 'Lin', icon: Bot },
  { key: 'profile', label: 'Профиль', icon: CircleUser },
];
const HR_PAGES = nav.map((n) => n.key).join(',');

function useHrCompany() {
  const { session, companies } = useStore();
  const companyId = session?.companyId ?? 'c1';
  const company = companies.find((c) => c.id === companyId) ?? companies[0];
  return { companyId: company?.id ?? companyId, company };
}

export function HrApp() {
  const { page, id, go } = useHashRoute(HR_PAGES, 'overview');
  const { company } = useHrCompany();
  const pending = company?.status === 'Pending';
  const rejected = company?.status === 'Rejected';
  return (
    <Shell title={`HR · ${company?.name ?? 'компания'}`} nav={nav} page={page} onNav={(key) => go(key)}>
      <div className="hr-desk">
        {pending ? <div className="review-banner">На проверке. Коды и партнёрства недоступны.</div> : null}
        {rejected ? <div className="review-banner">Заявку отклонили. Коды и партнёрства недоступны.</div> : null}
        {page === 'overview' ? <Overview onGo={go} /> : null}
        {page === 'inbox' ? (
          <HrPartnerships openId={id} onOpen={(mid) => go('inbox', mid)} onClose={() => go('inbox')} />
        ) : null}
        {page === 'people' ? <People /> : null}
        {page === 'catalog' ? <Catalog onOpenMerchant={(mid) => go('merchants', mid)} /> : null}
        {page === 'merchants' ? (
          <Merchants openId={id} onOpen={(mid) => go('merchants', mid)} onClose={() => go('merchants')} />
        ) : null}
        {page === 'assistant' ? <Assistant role="hr" /> : null}
        {page === 'profile' ? <HrProfile /> : null}
      </div>
    </Shell>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
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

function Overview({ onGo }: { onGo: (page: string, id?: string | null) => void }) {
  const { users, offers, merchants, partnerships, requests, transactions } = useStore();
  const { company, companyId } = useHrCompany();
  const team = users.filter((u) => u.companyId === companyId && u.role === 'employee');
  const catalogAll = offers.filter((o) => o.companyIds.includes(companyId));
  const catalog = catalogAll.filter((o) => o.active);
  const catalogPct = catalogAll.length ? Math.round((catalog.length / catalogAll.length) * 100) : 0;
  const ours = merchants.filter((m) => partnerships.some((p) => p.companyId === companyId && p.merchantId === m.id && p.status === 'connected'));
  const visits = requests.filter((r) => r.companyId === companyId);
  const spent = transactions.filter((t) => t.companyId === companyId && t.type === 'redeem').reduce((s, t) => s + t.amount, 0);
  const usedPeople = new Set(visits.map((r) => r.employeeId));
  const activeN = team.filter((u) => usedPeople.has(u.id)).length;
  const silentN = team.filter((u) => !usedPeople.has(u.id)).length;
  const wallet = team.reduce((s, u) => s + u.balance, 0);
  const interestCounts = interests
    .map((i) => ({ ...i, n: team.filter((u) => u.interestIds.includes(i.id)).length }))
    .filter((i) => i.n > 0)
    .sort((a, b) => b.n - a.n);
  const byWeek = WEEK.map((label, i) => ({
    label,
    n: visits.filter((r) => weekday(parseStamp(r.createdAt).day) === i).length,
  }));
  const weekMax = Math.max(1, ...byWeek.map((d) => d.n));
  const byCat = (['sport', 'food', 'education', 'health', 'transport', 'events'] as const)
    .map((cat) => ({
      cat,
      n: visits.filter((r) => offers.find((o) => o.id === r.offerId)?.category === cat).length,
    }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const catTotal = Math.max(1, byCat.reduce((s, c) => s + c.n, 0));
  const top3 = byCat.slice(0, 3);
  const top3Max = Math.max(1, ...top3.map((c) => c.n));
  let catDeg = 0;
  const donut = byCat
    .map((c) => {
      const from = catDeg;
      catDeg += (c.n / catTotal) * 360;
      return `${categoryAccent[c.cat]} ${from}deg ${catDeg}deg`;
    })
    .join(', ');
  const byMerchant = merchants
    .map((m) => ({
      m,
      n: visits.filter((r) => offers.find((o) => o.id === r.offerId)?.merchantId === m.id).length,
    }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);
  const slots = [
    { label: 'Утро', hint: 'до 11:00', n: visits.filter((r) => parseStamp(r.createdAt).hh < 11).length },
    { label: 'Обед', hint: '11–16', n: visits.filter((r) => parseStamp(r.createdAt).hh >= 11 && parseStamp(r.createdAt).hh < 16).length },
    { label: 'Вечер', hint: 'после 16:00', n: visits.filter((r) => parseStamp(r.createdAt).hh >= 16).length },
  ];
  const slotMax = Math.max(1, ...slots.map((s) => s.n));
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
  const peakDay = [...byWeek].sort((a, b) => b.n - a.n)[0];
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
  const idleOffers = catalog.filter((o) => !visits.some((r) => r.offerId === o.id)).slice(0, 5);
  const topPeople = team
    .map((u) => ({ u, n: visits.filter((r) => r.employeeId === u.id).length }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);
  const peopleMax = Math.max(1, ...topPeople.map((p) => p.n));

  return (
    <>
      <h1>{company?.name}</h1>
      <div className="dash-hero">
        <div className="hero-card hr-trade">
          <div className="hr-trade-top">
            <div>
              <div className="kicker">1–14 августа</div>
              <div className="hr-trade-val">
                {visits.length}
                <span>записей</span>
              </div>
            </div>
            <div className="meta">{peakDay ? `Пик недели: ${peakDay.label}` : ''}</div>
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
              <circle className="chart-pt" key={p.day} cx={p.x} cy={p.y} r={p.n === monthMax ? 5.5 : 4} fill="#fff" stroke="rgba(255,255,255,0.75)" strokeWidth="2" />
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
            Визиты
            <b>{visits.length}</b>
          </div>
          <div className="stat">
            Баллы
            <b>{spent.toLocaleString('ru-RU')}</b>
          </div>
          <div className="stat">
            Сотрудники
            <b>{team.length}</b>
          </div>
          <div className="stat">
            Мерчанты
            <b>{ours.length}</b>
          </div>
        </div>
      </div>

      <div className="stat-strip">
        <div className="panel tight">
          <h3>Каталог</h3>
          <div className="hr-cover sm">
            <div>
              <b>{catalogPct}%</b>
              <span className="meta">услуг on</span>
            </div>
            <div>
              <b>
                {catalog.length}/{catalogAll.length || 0}
              </b>
              <span className="meta">в выдаче</span>
            </div>
          </div>
          <div className="hr-cover-bar">
            <i style={{ width: `${catalogPct}%` }} />
          </div>
        </div>
        <div className="panel tight">
          <h3>Топ сфер</h3>
          {top3.length === 0 ? (
            <p className="meta">Пока пусто</p>
          ) : (
            top3.map((c) => (
              <div key={c.cat} className="bar-row">
                <span className="bar-label">{categoryLabel[c.cat]}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(c.n / top3Max) * 100}%`, background: categoryAccent[c.cat] }} />
                </div>
                <span className="meta">{c.n}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="panel">
        <h3>Дни недели</h3>
        <div className="hr-week">
          {byWeek.map((d, i) => (
            <div key={d.label} className={`hr-week-col${i >= 5 ? ' weekend' : ''}${d.n === peakDay?.n ? ' peak' : ''}`}>
              <div className="hr-week-bar" style={{ height: `${28 + (d.n / weekMax) * 140}px` }} />
              <b>{d.n}</b>
              <span>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="hr-dash">
        <div className="panel">
          <h3>Сферы</h3>
          <div className="hr-pie">
            <div className="donut" style={{ background: `conic-gradient(${donut || '#246BFD 0 360deg'})` }}>
              <span>{catTotal}</span>
            </div>
            <div className="legend">
              {byCat.map((c) => (
                <div key={c.cat}>
                  <i style={{ background: categoryAccent[c.cat] }} />
                  {categoryLabel[c.cat]} · {c.n}
                </div>
              ))}
            </div>
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
        </div>
      </div>
      <div className="hr-dash">
        <div className="panel">
          <h3>Мерчанты</h3>
          <div className="hr-podium">
            {byMerchant.map((x, i) => (
              <button
                key={x.m.id}
                className={`hr-podium-row${i === 0 ? ' first' : ''}`}
                type="button"
                onClick={() => onGo('merchants', x.m.id)}
              >
                <span className="hr-place">{i + 1}</span>
                <div className="grow">
                  <div className="hr-name">{x.m.name}</div>
                  <div className="meta">{categoryLabel[x.m.category]}</div>
                </div>
                <b>{x.n}</b>
              </button>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3>Интересы</h3>
          {interestCounts.slice(0, 6).map((i) => (
            <div key={i.id} className="bar-row">
              <span className="bar-label">{i.title}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${(i.n / Math.max(1, interestCounts[0].n)) * 100}%`,
                    background: categoryAccent[i.category],
                  }}
                />
              </div>
              <span className="meta">{i.n}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <h3>Тепло</h3>
        <div className="hr-heat">
          <div />
          {WEEK.map((d) => (
            <div key={d} className="hr-heat-lab">
              {d}
            </div>
          ))}
          {heatSlots.map((slot, si) => (
            <Fragment key={slot.key}>
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
            </Fragment>
          ))}
        </div>
      </div>
      <div className="hr-dash">
        <div className="panel">
          <h3>Охват</h3>
          <div className="hr-cover">
            <div>
              <b>{team.length ? Math.round((activeN / team.length) * 100) : 0}%</b>
              <span className="meta">{activeN} чел.</span>
            </div>
            <div>
              <b>{silentN}</b>
              <span className="meta">без визитов</span>
            </div>
          </div>
          <div className="hr-cover-bar">
            <i style={{ width: `${team.length ? (activeN / team.length) * 100 : 0}%` }} />
          </div>
          <p className="meta">{wallet.toLocaleString('ru-RU')} баллов на счетах</p>
        </div>
        <div className="panel">
          <h3>Без визитов</h3>
          {idleOffers.length === 0 ? (
            <p className="meta">Все льготы уже брали.</p>
          ) : (
            idleOffers.map((o) => (
              <button key={o.id} className="hr-idle" type="button" onClick={() => onGo('merchants', o.merchantId)}>
                <span className="hr-dot" style={{ background: categoryAccent[o.category] }} />
                <span>{o.title}</span>
                <span className="meta">0 визитов</span>
              </button>
            ))
          )}
        </div>
      </div>
      <div className="panel">
        <h3>Сотрудники</h3>
        <div className="hr-people-act">
          {topPeople.map((p) => (
            <div key={p.u.id} className="hr-act-row">
              <div className="hr-avatar">{initials(p.u.name)}</div>
              <div className="grow">
                <div className="hr-name">{p.u.name}</div>
                <div className="hr-act-track">
                  <i style={{ width: `${(p.n / peopleMax) * 100}%` }} />
                </div>
              </div>
              <b>{p.n}</b>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ListHead({ a, b, c }: { a: string; b: string; c: string }) {
  return (
    <div className="hr-line hr-head">
      <div>{a}</div>
      <div>{b}</div>
      <div>{c}</div>
    </div>
  );
}

function People() {
  const { session, users, createInviteCode, removeEmployee, deactivateHr } = useStore();
  const { company, companyId } = useHrCompany();
  const team = users.filter((u) => u.companyId === companyId && u.role === 'employee');
  const hrs = users.filter((u) => u.companyId === companyId && u.role === 'hr');
  const liveHrs = hrs.filter((u) => u.active !== false);
  const pending = company?.status !== 'Active';
  const [code, setCode] = useState<string | null>(null);
  const [hrCode, setHrCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<'emp' | 'hr' | null>(null);
  const [inviteHint, setInviteHint] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const editing = team.find((u) => u.id === editId);

  function makeCode(kind: 'employee' | 'hr') {
    setCopied(null);
    setInviteHint('');
    const next = createInviteCode(companyId, kind);
    if (!next) {
      setInviteHint('На проверке — коды недоступны.');
      return;
    }
    if (kind === 'hr') setHrCode(next);
    else setCode(next);
  }

  return (
    <>
      <h1>Сотрудники</h1>
      {pending ? <div className="hr-invite-wait">На проверке — коды недоступны.</div> : null}
      <div className="hr-invite">
        <button
          className="demo-btn"
          type="button"
          disabled={pending}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => makeCode('employee')}
        >
          Новый код сотрудника
        </button>
        {code ? (
          <>
            <b className="hr-invite-code">{code}</b>
            <button
              className="demo-btn"
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(code).then(() => setCopied('emp'));
              }}
            >
              {copied === 'emp' ? 'Скопировано' : 'Копировать'}
            </button>
          </>
        ) : null}
      </div>
      {inviteHint ? <p className="meta">{inviteHint}</p> : null}

      <h3 style={{ margin: '28px 0 12px' }}>HR</h3>
      <div className="hr-invite">
        <button
          className="demo-btn"
          type="button"
          disabled={pending}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => makeCode('hr')}
        >
          Код для коллеги HR
        </button>
        {hrCode ? (
          <>
            <b className="hr-invite-code">{hrCode}</b>
            <button
              className="demo-btn"
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(hrCode).then(() => setCopied('hr'));
              }}
            >
              {copied === 'hr' ? 'Скопировано' : 'Копировать'}
            </button>
          </>
        ) : null}
      </div>
      <div className="hr-list" style={{ marginBottom: 24 }}>
        <ListHead a="HR" b="Email" c="" />
        {hrs.map((u) => (
          <div key={u.id} className="hr-line">
            <div className="hr-who">
              <div className="hr-avatar">{initials(u.name)}</div>
              <div>
                <div className="hr-name">{u.name}</div>
                <div className="meta">
                  {u.jobTitle}
                  {u.active === false ? ' · отключён' : ''}
                  {u.id === session?.id ? ' · вы' : ''}
                </div>
              </div>
            </div>
            <div className="meta">{u.email}</div>
            <div className="hr-side stack">
              {u.active !== false && u.id !== session?.id && liveHrs.length > 1 ? (
                <button className="hr-del" type="button" onClick={() => deactivateHr(u.id, companyId)}>
                  Отключить
                </button>
              ) : (
                <span className="meta">{u.active === false ? 'нет входа' : ''}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="hr-list">
        <ListHead a="Сотрудник" b="Интересы" c="Баллы" />
        {team.map((u) => (
          <div key={u.id} className="hr-line">
            <div className="hr-who">
              <div className="hr-avatar">{initials(u.name)}</div>
              <div>
                <div className="hr-name">{u.name}</div>
                <div className="meta">
                  {u.jobTitle} · {u.email}
                </div>
              </div>
            </div>
            <div className="hr-chips">
              {u.interestIds.map((id) => {
                const item = interests.find((x) => x.id === id);
                return (
                  <span key={id} className="chip">
                    <i className="hr-dot" style={{ background: item ? categoryAccent[item.category] : '#246BFD' }} />
                    {item?.title ?? id}
                  </span>
                );
              })}
            </div>
            <div className="hr-side stack">
              <span>{u.balance.toLocaleString('ru-RU')}</span>
              <button
                className="hr-btn ghost sm"
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditId(u.id);
                }}
              >
                Изменить
              </button>
              <button className="hr-del" type="button" onClick={() => removeEmployee(u.id, companyId)}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
      {editing ? (
        <EmployeeEditor
          key={editing.id}
          user={editing}
          companyId={companyId}
          onClose={() => setEditId(null)}
        />
      ) : null}
    </>
  );
}

function EmployeeEditor({ user, companyId, onClose }: { user: User; companyId: string; onClose: () => void }) {
  const { updateEmployee } = useStore();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [age, setAge] = useState(user.age != null ? String(user.age) : '');
  const [gender, setGender] = useState<Gender>(user.gender);
  const [city, setCity] = useState(user.city);
  const [jobTitle, setJobTitle] = useState(user.jobTitle);
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);

  return (
    <div className="hr-overlay" onClick={onClose}>
      <div className="hr-sheet" onClick={(e) => e.stopPropagation()}>
        <button className="hr-sheet-close" type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClose}>
          Закрыть
        </button>
        <div className="kicker">Сотрудник</div>
        <h2>{user.name}</h2>
        <p className="meta">{user.email}</p>
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
        <div className="profile-actions" style={{ marginTop: 20 }}>
          <button
            className="hr-btn"
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              updateEmployee(user.id, companyId, {
                name,
                phone,
                age: parseAge(age),
                gender,
                city,
                jobTitle,
                password,
              });
              setPassword('');
              setSaved(true);
            }}
          >
            Сохранить
          </button>
          <button className="hr-btn ghost" type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClose}>
            Закрыть
          </button>
          {saved ? <span className="meta">Сохранено</span> : null}
        </div>
      </div>
    </div>
  );
}

function peopleWord(n: number) {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return `${n} сотрудник`;
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return `${n} сотрудника`;
  return `${n} сотрудников`;
}

function visitWord(n: number) {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return `${n} визит`;
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return `${n} визита`;
  return `${n} визитов`;
}

function HrPartnerships({
  openId,
  onOpen,
  onClose,
}: {
  openId: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  const { merchants, partnerships, setPartnershipStatus } = useStore();
  const { company, companyId } = useHrCompany();
  const [tab, setTab] = useState<'in' | 'out'>('in');
  const live = company?.status === 'Active';
  const incoming = partnerships
    .filter((p) => p.companyId === companyId && p.initiator === 'merchant' && p.status !== 'connected')
    .sort((a, b) => partnershipInboxRank(a.status) - partnershipInboxRank(b.status) || b.createdAt.localeCompare(a.createdAt));
  const outgoing = partnerships
    .filter((p) => p.companyId === companyId && p.initiator === 'hr' && p.status !== 'connected')
    .sort((a, b) => partnershipInboxRank(a.status) - partnershipInboxRank(b.status) || b.createdAt.localeCompare(a.createdAt));
  const rows = tab === 'in' ? incoming : outgoing;

  return (
    <>
      <h1>Заявки</h1>
      <p className="lead">Запросы мерчантов на партнёрство. Бронирования сотрудников — в мобильном приложении.</p>
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
          <div>Мерчант</div>
          <div>Дата</div>
          <div>Действия</div>
        </div>
        {rows.length === 0 ? (
          <div className="hr-empty">{tab === 'in' ? 'Нет входящих заявок от мерчантов.' : 'Нет исходящих запросов.'}</div>
        ) : (
          rows.map((p) => {
            const m = merchants.find((x) => x.id === p.merchantId);
            const actionable = tab === 'in' && live && (p.status === 'pending' || p.status === 'talking');
            return (
              <div key={p.id} className="hr-line queue-row" onClick={() => m && onOpen(m.id)}>
                <div className="hr-who">
                  <span className="hr-dot lg" style={{ background: m ? categoryAccent[m.category] : '#246BFD' }} />
                  <div>
                    <div className="hr-name">{m?.name ?? 'Мерчант'}</div>
                    <div className="meta">
                      {m?.city ?? '—'} · {m ? categoryLabel[m.category] : '—'}
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
      {openId ? <MerchantPeek merchantId={openId} onClose={onClose} /> : null}
    </>
  );
}

function MerchantPeek({ merchantId, onClose }: { merchantId: string; onClose: () => void }) {
  const { merchants, users, offers, partnerships, requests, reviews, sendPartnership, setPartnershipStatus, endPartnership, toggleCompanyOffer } =
    useStore();
  const { company, companyId } = useHrCompany();
  const m = merchants.find((x) => x.id === merchantId);
  const team = users.filter((u) => u.companyId === companyId && u.role === 'employee');
  if (!m) return null;
  const deal = partnerships.find((p) => p.companyId === companyId && p.merchantId === m.id);
  const ours = deal?.status === 'connected';
  const why = interests.filter((i) => i.category === m.category && team.some((u) => u.interestIds.includes(i.id)));
  const hits = team.filter((u) => u.interestIds.some((id) => interests.find((i) => i.id === id)?.category === m.category)).length;
  const shopOffers = offers.filter((o) => o.merchantId === m.id);
  const live = Boolean(company?.status === 'Active' && m.verified && !m.rejected);
  const canAsk = live && !ours && deal?.status !== 'pending' && deal?.status !== 'talking';
  const visitTotal = requests.filter((r) => r.companyId === companyId && shopOffers.some((o) => o.id === r.offerId)).length;
  const phone = m.phone;

  function callMerchant() {
    if (deal && deal.status === 'pending') setPartnershipStatus(deal.id, 'talking');
    window.open(telHref(phone));
  }

  return (
    <div className="hr-overlay" onClick={onClose}>
      <div className="hr-sheet wide" onClick={(e) => e.stopPropagation()}>
        <button className="hr-sheet-close" type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClose}>
          Закрыть
        </button>
        {ours ? (
          <div className="kicker">Партнёр</div>
        ) : deal?.status === 'pending' || deal?.status === 'talking' ? (
          <div className="kicker">{partnershipLabel[deal.status]}</div>
        ) : null}
        <h2>{m.name}</h2>
        <p className="meta">
          {m.city} · {categoryLabel[m.category]} · {m.verified ? 'проверен' : 'на проверке'}
          {hits ? ` · подходит ${peopleWord(hits)}` : ''}
          {visitTotal ? ` · ${visitWord(visitTotal)}` : ''}
        </p>
        {m.about ? <p className="hr-about">{m.about}</p> : null}
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
        <a className="hr-phone" href={telHref(m.phone)}>
          {m.phone}
        </a>
        <h3>Услуги</h3>
        {shopOffers.length ? (
          <div className="offer-grid">
            {shopOffers.map((o) => {
              const on = o.companyIds.includes(companyId);
              const used = requests.filter((r) => r.companyId === companyId && r.offerId === o.id).length;
              return (
                <CourseCard
                  key={o.id}
                  offer={o}
                  dim={ours && !on}
                  showDescription
                  onOpen={() => {
                    if (ours) toggleCompanyOffer(o.id, companyId);
                  }}
                  footerLeft={offerPrice(o)}
                  footerRight={
                    ours ? (
                      <span className={on ? 'ok' : 'warn'}>{on ? 'В каталоге' : 'Выдать'}</span>
                    ) : used ? (
                      <span className="meta">{visitWord(used)}</span>
                    ) : null
                  }
                />
              );
            })}
          </div>
        ) : (
          <p className="meta">Услуг пока нет.</p>
        )}
        <ReviewStrip reviews={reviews.filter((r) => r.merchantId === m.id)} />
        <div className="hr-actions" style={{ marginTop: 20 }}>
          {ours ? (
            <button className="hr-btn ghost" type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => endPartnership(companyId, m.id)}>
              Прекратить сотрудничество
            </button>
          ) : canAsk ? (
            <button className="hr-btn" type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => sendPartnership(companyId, m.id, 'hr')}>
              Запросить
            </button>
          ) : deal && (deal.status === 'pending' || deal.status === 'talking') && deal.initiator === 'merchant' ? (
            <>
              <button className="hr-btn" type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setPartnershipStatus(deal.id, 'connected')}>
                Подтвердить
              </button>
              <button className="hr-btn ghost" type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setPartnershipStatus(deal.id, 'rejected')}>
                Отклонить
              </button>
            </>
          ) : deal && (deal.status === 'pending' || deal.status === 'talking') ? (
            <p className="meta" style={{ width: '100%', margin: 0 }}>
              Запрос у мерчанта. Ответ придёт в его заявках.
            </p>
          ) : !live ? (
            <span className="meta">На проверке</span>
          ) : null}
          <button className={`hr-btn${ours || canAsk ? ' ghost' : ''}`} type="button" onMouseDown={(e) => e.preventDefault()} onClick={callMerchant}>
            Позвонить
          </button>
        </div>
      </div>
    </div>
  );
}

function Catalog({ onOpenMerchant }: { onOpenMerchant: (merchantId: string) => void }) {
  const { offers, merchants, partnerships, toggleCompanyOffer } = useStore();
  const { companyId } = useHrCompany();
  const [openId, setOpenId] = useState<string | null>(null);
  const ours = new Set(partnerships.filter((p) => p.companyId === companyId && p.status === 'connected').map((p) => p.merchantId));
  const list = offers.filter((o) => ours.has(o.merchantId));
  const open = list.find((o) => o.id === openId) ?? null;
  const openMerchant = open ? merchants.find((m) => m.id === open.merchantId) : undefined;
  const inCatalog = (o: (typeof offers)[number]) => o.companyIds.includes(companyId);

  return (
    <>
      <h1>Каталог услуг</h1>
      <p className="lead">Карточка — описание. Переключатель — в каталоге компании, не сотрудникам по одному.</p>
      {list.length === 0 ? (
        <div className="hr-empty">Пусто. Подключите мерчанта — его услуги появятся здесь.</div>
      ) : (
        <div className="offer-grid">
          {list.map((o) => {
            const merchant = merchants.find((m) => m.id === o.merchantId);
            const on = inCatalog(o);
            return (
              <CourseCard
                key={o.id}
                offer={o}
                dim={!on || !o.active}
                onOpen={() => setOpenId(o.id)}
                footerLeft={
                  <>
                    {merchant?.name ?? 'мерчант'} · {offerPrice(o)}
                  </>
                }
                footerRight={
                  <button
                    className={`switch${on ? ' on' : ''}`}
                    type="button"
                    aria-label={on ? 'В каталоге' : 'Не в каталоге'}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompanyOffer(o.id, companyId);
                    }}
                  >
                    <i />
                  </button>
                }
              />
            );
          })}
        </div>
      )}
      {open ? (
        <div className="hr-overlay" onClick={() => setOpenId(null)}>
          <div className="hr-sheet course-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="hr-sheet-close" type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setOpenId(null)}>
              Закрыть
            </button>
            <OfferCover category={open.category} />
            <div className="kicker" style={{ marginTop: 16 }}>
              {categoryLabel[open.category]}
            </div>
            <h2>{open.title}</h2>
            <p className="meta">
              {openMerchant?.name ?? 'мерчант'} · {offerPrice(open)}
              {!open.active ? ' · скрыта мерчантом' : ''}
            </p>
            <p>{open.description || 'Состав услуги не указан.'}</p>
            <label className="hr-svc-access">
              <button
                className={`switch${inCatalog(open) ? ' on' : ''}`}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleCompanyOffer(open.id, companyId)}
              >
                <i />
              </button>
              В каталоге
            </label>
            {openMerchant ? (
              <div className="hr-actions" style={{ marginTop: 20 }}>
                <button
                  className="hr-btn ghost"
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onOpenMerchant(openMerchant.id)}
                >
                  Профиль мерчанта
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function Merchants({
  openId,
  onOpen,
  onClose,
}: {
  openId: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  const { merchants, users, offers, partnerships, sendPartnership } = useStore();
  const { company, companyId } = useHrCompany();
  const [tab, setTab] = useState<'subs' | 'rec'>('subs');
  const companyLive = company?.status === 'Active';
  const team = users.filter((u) => u.companyId === companyId && u.role === 'employee');
  const recs = merchants
    .map((m) => {
      const deal = partnerships.find((p) => p.companyId === companyId && p.merchantId === m.id);
      const ours = deal?.status === 'connected';
      const why = interests.filter((i) => i.category === m.category && team.some((u) => u.interestIds.includes(i.id)));
      const hits = team.filter((u) => u.interestIds.some((id) => interests.find((i) => i.id === id)?.category === m.category)).length;
      return { m, hits, deal, ours, why };
    })
    .sort((a, b) => b.hits - a.hits || a.m.name.localeCompare(b.m.name, 'ru'));
  const max = Math.max(1, ...recs.map((r) => r.hits));
  const ours = recs.filter((r) => r.ours);
  const recommended = recs.filter((r) => !r.ours && (r.hits > 0 || r.deal?.status === 'pending' || r.deal?.status === 'talking'));
  const shown = tab === 'subs' ? ours : recommended;

  useEffect(() => {
    if (!openId) return;
    const r = recs.find((x) => x.m.id === openId);
    if (!r) return;
    setTab(r.ours ? 'subs' : 'rec');
  }, [openId]);

  function Row({ r, i }: { r: (typeof recs)[number]; i: number }) {
    const n = offers.filter((o) => o.merchantId === r.m.id).length;
    const st = r.deal && !r.ours ? partnershipLabel[r.deal.status] : null;
    const canAsk =
      companyLive && r.m.verified && !r.m.rejected && !r.ours && r.deal?.status !== 'pending' && r.deal?.status !== 'talking';
    return (
      <div className="hr-mline" onClick={() => onOpen(r.m.id)} style={r.m.verified ? undefined : { opacity: 0.55 }}>
        <span className="hr-rank">{i + 1}</span>
        <div className="hr-who">
          <span className="hr-dot lg" style={{ background: categoryAccent[r.m.category] }} />
          <div>
            <div className="hr-name">{r.m.name}</div>
            <div className="meta">
              {r.m.city} · {categoryLabel[r.m.category]} · {n} услуг
              {r.m.verified ? '' : ' · на проверке'}
              {st ? ` · ${st}` : ''}
            </div>
            {r.why.length ? (
              <div className="hr-chips">
                {r.why.map((item) => (
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
          {canAsk ? (
            <div className="row-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className="hr-btn sm"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sendPartnership(companyId, r.m.id, 'hr');
                }}
              >
                Запросить
              </button>
            </div>
          ) : (
            <>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(r.hits / max) * 100}%`, background: '#246BFD' }} />
              </div>
              <span className="meta">{peopleWord(r.hits)}</span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <h1>Мерчанты</h1>
      <div className="hr-switch">
        <button
          className={tab === 'subs' ? 'on' : ''}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setTab('subs');
            onClose();
          }}
        >
          Подписки
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
          <div className="hr-empty">{tab === 'subs' ? 'Подписок нет.' : 'Нет совпадений.'}</div>
        ) : (
          shown.map((r, i) => <Row key={r.m.id} r={r} i={i} />)
        )}
      </div>
      {openId ? <MerchantPeek merchantId={openId} onClose={onClose} /> : null}
    </>
  );
}

function HrProfile() {
  const { session, users, updateProfile } = useStore();
  const { company, companyId } = useHrCompany();
  const hrs = users.filter((u) => u.companyId === companyId && u.role === 'hr');
  const [name, setName] = useState(session?.name ?? '');
  const [phone, setPhone] = useState(session?.phone ?? '');
  const [age, setAge] = useState(session?.age != null ? String(session.age) : '');
  const [gender, setGender] = useState(session?.gender ?? 'unspecified');
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
      {company?.status === 'Pending' ? <div className="review-banner">На проверке</div> : null}
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
        <div className="profile-row">
          <span>Компания</span>
          <b>{company?.name}</b>
        </div>
        <div className="profile-row">
          <span>Город компании</span>
          <b>{company?.city || '—'}</b>
        </div>
        <div className="profile-row">
          <span>Статус</span>
          <b>{company ? companyStatusLabel(company.status) : '—'}</b>
        </div>
        <h3>HR</h3>
        {hrs.map((u) => (
          <div key={u.id} className="profile-row">
            <span>{u.name}</span>
            <b>
              {u.email}
              {u.active === false ? ' · отключён' : ''}
            </b>
          </div>
        ))}
        <div className="profile-actions">
          <button
            className="primary"
            type="button"
            onClick={() => {
              updateProfile({
                name,
                phone,
                age: parseAge(age),
                gender,
                city,
                jobTitle,
                password,
              });
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
