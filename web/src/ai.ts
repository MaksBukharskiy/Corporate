import { categoryLabel, interests, partnershipLabel } from './data';
import type {
  BenefitRequest,
  Company,
  CompanyPrice,
  Merchant,
  Offer,
  Partnership,
  User,
} from './types';


export type AiRole = 'hr' | 'merchant' | 'admin';

export const SUGGESTED: Record<AiRole, string[]> = {
  hr: ['Куда хотят чаще', 'Кого подключить', 'Что в заявках', 'Покрытие каталога', 'Топ интересов'],
  merchant: ['Кто хочет подключиться', 'Какие компании активнее', 'Цены', 'Ожидают ответа', 'Кто уже подключён'],
  admin: ['Кого проверить', 'Сводка', 'Очередь на проверку', 'Сколько компаний', 'Сколько мерчантов'],
};

export function suggestedQuestions(role: AiRole): string[] {
  return SUGGESTED[role];
}

const OLLAMA_MODELS = ['qwen2.5:1.5b', 'llama3.2:1b', 'qwen2.5:0.5b', 'phi3'] as const;
const OLLAMA_TIMEOUT_MS = 20000;

let cachedOllamaModel: string | null = null;
let ollamaDownNoted = false;

export type AiFacts = {
  role: AiRole;
  companyName?: string;
  merchantName?: string;
  employees: number;
  topInterests: { title: string; n: number }[];
  wantByCategory: { category: string; n: number; label: string }[];
  wantMerchants: { name: string; category: string; connected: boolean; score: number }[];
  notConnected: string[];
  partnerships: { who: string; initiator: string; status: string }[];
  coverage: { on: number; pool: number };
  incomingHr: { company: string; status: string }[];
  companyRequests: { company: string; n: number; pending: number; approved: number }[];
  prices: { company: string; label: string }[];
  partnerCounts: { pending: number; talking: number; connected: number; rejected: number };
  pendingCompanies: string[];
  pendingMerchants: string[];
  counts: { companies: number; merchants: number; activeCompanies: number; verifiedMerchants: number; people: number };
};

export type AiStoreInput = {
  role: AiRole;
  companyId?: string;
  merchantId?: string;
  companies: Company[];
  users: User[];
  merchants: Merchant[];
  offers: Offer[];
  requests: BenefitRequest[];
  partnerships: Partnership[];
  prices: CompanyPrice[];
};

export function buildFacts(input: AiStoreInput): AiFacts {
  const { companies, users, merchants, offers, requests, partnerships, prices } = input;
  const company = companies.find((c) => c.id === input.companyId);
  const merchant = merchants.find((m) => m.id === input.merchantId);

  const team = users.filter((u) => u.companyId === input.companyId && u.role === 'employee');
  const interestHits = new Map<string, number>();
  const catHits = new Map<string, number>();
  for (const u of team) {
    for (const id of u.interestIds) {
      const item = interests.find((i) => i.id === id);
      if (!item) continue;
      interestHits.set(item.title, (interestHits.get(item.title) ?? 0) + 1);
      catHits.set(item.category, (catHits.get(item.category) ?? 0) + 1);
    }
  }
  const topInterests = [...interestHits.entries()]
    .map(([title, n]) => ({ title, n }))
    .sort((a, b) => b.n - a.n);
  const wantByCategory = [...catHits.entries()]
    .map(([category, n]) => ({ category, n, label: categoryLabel[category as keyof typeof categoryLabel] ?? category }))
    .sort((a, b) => b.n - a.n);

  const connectedIds = new Set(
    partnerships.filter((p) => p.companyId === input.companyId && p.status === 'connected').map((p) => p.merchantId),
  );
  const liveMerchants = merchants.filter((m) => m.verified && !m.rejected);
  const wantMerchants = liveMerchants
    .map((m) => ({
      name: m.name,
      category: categoryLabel[m.category],
      connected: connectedIds.has(m.id),
      score: catHits.get(m.category) ?? 0,
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'ru'));
  const notConnected = wantMerchants.filter((m) => !m.connected).map((m) => m.name);

  const hrLinks = partnerships
    .filter((p) => p.companyId === input.companyId)
    .map((p) => ({
      who: merchants.find((m) => m.id === p.merchantId)?.name ?? p.merchantId,
      initiator: p.initiator === 'hr' ? 'HR' : 'мерчант',
      status: partnershipLabel[p.status] ?? p.status,
    }));

  const pool = offers.filter((o) => o.active && connectedIds.has(o.merchantId));
  const on = pool.filter((o) => o.companyIds.includes(input.companyId ?? '')).length;

  const mineIds = new Set(offers.filter((o) => o.merchantId === input.merchantId).map((o) => o.id));
  const incomingHr = partnerships
    .filter((p) => p.merchantId === input.merchantId && p.initiator === 'hr')
    .map((p) => ({
      company: companies.find((c) => c.id === p.companyId)?.name ?? p.companyId,
      status: partnershipLabel[p.status] ?? p.status,
    }));

  const byCompany = new Map<string, { n: number; pending: number; approved: number }>();
  for (const r of requests) {
    if (!mineIds.has(r.offerId)) continue;
    const row = byCompany.get(r.companyId) ?? { n: 0, pending: 0, approved: 0 };
    row.n += 1;
    if (r.status === 'pending') row.pending += 1;
    if (r.status === 'approved' || r.status === 'completed' || r.status === 'in_progress') row.approved += 1;
    byCompany.set(r.companyId, row);
  }
  const companyRequests = [...byCompany.entries()]
    .map(([id, row]) => ({
      company: companies.find((c) => c.id === id)?.name ?? id,
      ...row,
    }))
    .sort((a, b) => b.n - a.n);

  const minePrices = prices.filter((p) => p.merchantId === input.merchantId && !p.offerId);
  const pricesOut = companies.map((c) => {
    const row = minePrices.find((p) => p.companyId === c.id) ?? minePrices.find((p) => p.companyId === '*');
    return { company: c.name, label: row ? priceLabel(row) : 'как в базовом плане' };
  });

  const minePartners = partnerships.filter((p) => p.merchantId === input.merchantId);
  const partnerCounts = {
    pending: minePartners.filter((p) => p.status === 'pending').length,
    talking: minePartners.filter((p) => p.status === 'talking').length,
    connected: minePartners.filter((p) => p.status === 'connected').length,
    rejected: minePartners.filter((p) => p.status === 'rejected').length,
  };

  const pendingCompanies = companies.filter((c) => c.status === 'Pending').map((c) => c.name);
  const pendingMerchants = merchants.filter((m) => !m.verified && !m.rejected).map((m) => m.name);

  return {
    role: input.role,
    companyName: company?.name,
    merchantName: merchant?.name,
    employees: team.length,
    topInterests,
    wantByCategory,
    wantMerchants,
    notConnected,
    partnerships: hrLinks,
    coverage: { on, pool: pool.length },
    incomingHr,
    companyRequests,
    prices: pricesOut,
    partnerCounts,
    pendingCompanies,
    pendingMerchants,
    counts: {
      companies: companies.length,
      merchants: merchants.length,
      activeCompanies: companies.filter((c) => c.status === 'Active').length,
      verifiedMerchants: merchants.filter((m) => m.verified && !m.rejected).length,
      people: users.filter((u) => u.active !== false).length,
    },
  };
}

function priceLabel(p: CompanyPrice) {
  if (p.mode === 'free') return 'бесплатно';
  if (p.mode === 'discount') return `скидка ${p.discountPct}%`;
  return `${p.points} баллов`;
}

function joinRu(items: string[], max = 6) {
  const list = items.slice(0, max);
  if (!list.length) return 'пока никого';
  if (list.length === 1) return list[0];
  return `${list.slice(0, -1).join(', ')} и ${list[list.length - 1]}`;
}

function q(s: string) {
  return s.toLowerCase().replace(/ё/g, 'е');
}

export const LIN_NAME = 'Lin';

export function linRoleLine(facts: AiFacts) {
  if (facts.role === 'hr') return facts.companyName ? `HR · ${facts.companyName}` : 'HR';
  if (facts.role === 'merchant') return facts.merchantName ? `мерчант · ${facts.merchantName}` : 'мерчант';
  return 'админ';
}

export function greeting(facts: AiFacts) {
  if (facts.role === 'hr') {
    return `Привет, я ${LIN_NAME}. Смотрю интересы команды, мерчантов и заявки.`;
  }
  if (facts.role === 'merchant') {
    return `Привет, я ${LIN_NAME}. Вижу запросы HR, активность компаний и цены.`;
  }
  return `Привет, я ${LIN_NAME}. Вижу очередь на проверку компаний и мерчантов.`;
}

export function linStats(facts: AiFacts): { label: string; value: string }[] {
  if (facts.role === 'hr') {
    const top = facts.topInterests[0];
    const pending = facts.partnerships.filter((p) => /рассмотрен/i.test(p.status)).length;
    return [
      { label: 'Топ интерес', value: top ? `${top.title} · ${top.n}` : 'пока нет' },
      { label: 'Заявки', value: String(pending) },
      { label: 'Команда', value: String(facts.employees) },
      { label: 'В каталоге', value: `${facts.coverage.on} / ${facts.coverage.pool}` },
    ];
  }
  if (facts.role === 'merchant') {
    const topCo = facts.companyRequests[0];
    return [
      { label: 'Ждут ответа', value: String(facts.partnerCounts.pending) },
      { label: 'Подключены', value: String(facts.partnerCounts.connected) },
      { label: 'Запросы HR', value: String(facts.incomingHr.length) },
      { label: 'Активнее', value: topCo ? `${topCo.company} · ${topCo.n}` : 'пока нет' },
    ];
  }
  return [
    { label: 'Компании на проверке', value: String(facts.pendingCompanies.length) },
    { label: 'Мерчанты на проверке', value: String(facts.pendingMerchants.length) },
    { label: 'Активных компаний', value: String(facts.counts.activeCompanies) },
    { label: 'Проверенных мерчантов', value: String(facts.counts.verifiedMerchants) },
  ];
}

function hrBrief(f: AiFacts) {
  const top = f.wantByCategory.slice(0, 3).map((c) => `${c.label} (${c.n})`);
  const pending = f.partnerships.filter((p) => /рассмотрен/i.test(p.status));
  const need = f.wantMerchants.filter((m) => !m.connected && m.score > 0).slice(0, 4).map((m) => m.name);
  return [
    `Команда: ${f.employees} сотрудников.`,
    top.length ? `Чаще хотят: ${joinRu(top, 3)}.` : 'Интересы пока не отмечены.',
    need.length ? `Имеет смысл подключить: ${joinRu(need, 4)}.` : 'По интересам основные мерчанты уже в связях.',
    `Каталог: ${f.coverage.on} из ${f.coverage.pool} услуг подключённых мерчантов включены для компании.`,
    pending.length
      ? `В заявках на рассмотрении: ${joinRu(pending.map((p) => `${p.who} (${p.initiator})`), 4)}.`
      : 'Заявок на рассмотрении нет.',
  ].join(' ');
}

function merchantBrief(f: AiFacts) {
  const wait = f.incomingHr.filter((x) => /рассмотрен|переговор/i.test(x.status));
  const active = f.companyRequests.slice(0, 3).map((c) => `${c.company} (${c.n})`);
  return [
    wait.length ? `HR хочет подключиться: ${joinRu(wait.map((x) => `${x.company} — ${x.status}`), 4)}.` : 'Входящих запросов HR на рассмотрении нет.',
    active.length ? `Больше запросов по услугам: ${joinRu(active, 3)}.` : 'Запросов по услугам пока нет.',
    `Связи: ${f.partnerCounts.pending} ждут ответа, ${f.partnerCounts.talking} в переговорах, ${f.partnerCounts.connected} подключены.`,
  ].join(' ');
}

function adminBrief(f: AiFacts) {
  return [
    `На проверке компаний: ${f.pendingCompanies.length}${f.pendingCompanies.length ? ` (${joinRu(f.pendingCompanies, 5)})` : ''}.`,
    `На проверке мерчантов: ${f.pendingMerchants.length}${f.pendingMerchants.length ? ` (${joinRu(f.pendingMerchants, 5)})` : ''}.`,
    `Всего: ${f.counts.activeCompanies} активных компаний из ${f.counts.companies}, ${f.counts.verifiedMerchants} проверенных мерчантов из ${f.counts.merchants}, людей ${f.counts.people}.`,
  ].join(' ');
}

export function fakeAnswer(role: AiRole, question: string, facts: AiFacts): string {
  const t = q(question);

  if (role === 'hr') {
    if (/интерес|топ/.test(t)) {
      const list = facts.topInterests.slice(0, 6).map((i) => `${i.title} — ${i.n}`);
      return list.length
        ? `Топ интересов команды: ${joinRu(list, 6)}. Это то, что сотрудники отметили у себя.`
        : 'Сотрудники ещё не отметили интересы — сначала заполните карточки в разделе «Сотрудники».';
    }
    if (/куда|чаще|хотят|спрос|категор/.test(t)) {
      const cats = facts.wantByCategory.slice(0, 4).map((c) => `${c.label} (${c.n} отметок)`);
      const names = facts.wantMerchants.filter((m) => m.score > 0).slice(0, 5).map((m) => `${m.name}${m.connected ? '' : ' — ещё не подключён'}`);
      return cats.length
        ? `Команда чаще отмечает: ${joinRu(cats, 4)}. По этим направлениям: ${joinRu(names, 5)}.`
        : hrBrief(facts);
    }
    if (/подключ|кого|нет связи|не подключен/.test(t)) {
      const ranked = facts.wantMerchants.filter((m) => !m.connected).slice(0, 6);
      return ranked.length
        ? `Ещё не подключены, но закрывают интересы: ${joinRu(ranked.map((m) => `${m.name} (${m.category})`), 6)}. Всего без связи: ${facts.notConnected.length}.`
        : 'Проверенные мерчанты по интересам команды уже в связях.';
    }
    if (/заявк|входящ|партнер|партнёр|рассмотр/.test(t)) {
      const open = facts.partnerships.filter((p) => !/подключен/i.test(p.status) && !/отклон/i.test(p.status));
      return open.length
        ? `Сейчас в заявках: ${joinRu(open.map((p) => `${p.who} — ${p.status}, от ${p.initiator}`), 8)}.`
        : 'Открытых заявок на партнёрство нет. Подключённые связи можно смотреть в разделе мерчантов.';
    }
    if (/покрыт|каталог|услуг/.test(t)) {
      return `Для компании включено ${facts.coverage.on} услуг из ${facts.coverage.pool} у уже подключённых мерчантов. Остальное можно включить в каталоге.`;
    }
    return hrBrief(facts);
  }

  if (role === 'merchant') {
    if (/хочет|подключ|входящ|hr|заявк/.test(t) && !/активн/.test(t)) {
      const list = facts.incomingHr.filter((x) => /рассмотрен|переговор/i.test(x.status));
      const all = list.length ? list : facts.incomingHr;
      return all.length
        ? `Запросы HR: ${joinRu(all.map((x) => `${x.company} — ${x.status}`), 8)}.`
        : 'Входящих запросов от HR нет. Можно самим отправить запрос компаниям.';
    }
    if (/активн|компани|запрос|льгот|услуг/.test(t)) {
      return facts.companyRequests.length
        ? `По запросам услуг впереди: ${joinRu(facts.companyRequests.slice(0, 5).map((c) => `${c.company} — ${c.n} (ждут ${c.pending}, в работе/одобрены ${c.approved})`), 5)}.`
        : 'По вашим услугам запросов от компаний ещё нет.';
    }
    if (/цен|тариф|скидк|балл/.test(t)) {
      const rows = facts.prices.slice(0, 8).map((p) => `${p.company}: ${p.label}`);
      return rows.length ? `Цены: ${joinRu(rows, 8)}.` : 'Персональных цен нет — действует базовый план.';
    }
    if (/ожид|ответ|pending|рассмотр/.test(t)) {
      return `Ждут ответа: ${facts.partnerCounts.pending}. В переговорах: ${facts.partnerCounts.talking}.`;
    }
    if (/одобр|подключен|connected/.test(t)) {
      return `Подключено компаний: ${facts.partnerCounts.connected}. Отклонено: ${facts.partnerCounts.rejected}.`;
    }
    return merchantBrief(facts);
  }

  if (/провер|очеред|кого/.test(t)) {
    const c = facts.pendingCompanies;
    const m = facts.pendingMerchants;
    if (!c.length && !m.length) return 'Очередь пуста: все компании и мерчанты уже разобраны.';
    return [
      c.length ? `Компании: ${joinRu(c, 8)}.` : 'Компаний в очереди нет.',
      m.length ? `Мерчанты: ${joinRu(m, 8)}.` : 'Мерчантов в очереди нет.',
    ].join(' ');
  }
  if (/сводк|сколько|счёт|счет|всего/.test(t)) {
    return adminBrief(facts);
  }
  return adminBrief(facts);
}

function compactForModel(facts: AiFacts) {
  if (facts.role === 'hr') {
    return {
      компания: facts.companyName,
      сотрудники: facts.employees,
      топИнтересы: facts.topInterests.slice(0, 8),
      спрос: facts.wantByCategory.slice(0, 6),
      мерчанты: facts.wantMerchants.slice(0, 10).map((m) => ({ имя: m.name, категория: m.category, подключён: m.connected, спрос: m.score })),
      заявки: facts.partnerships.slice(0, 12),
      покрытиеУслуг: facts.coverage,
    };
  }
  if (facts.role === 'merchant') {
    return {
      мерчант: facts.merchantName,
      входящиеHR: facts.incomingHr.slice(0, 12),
      запросыКомпаний: facts.companyRequests.slice(0, 8),
      цены: facts.prices.slice(0, 10),
      связи: facts.partnerCounts,
    };
  }
  return {
    компанииНаПроверке: facts.pendingCompanies,
    мерчантыНаПроверке: facts.pendingMerchants,
    счётчики: facts.counts,
  };
}

function systemPrompt(role: AiRole) {
  const who =
    role === 'hr'
      ? 'Lin, ассистент HR: льготы, интересы команды, мерчанты, заявки'
      : role === 'merchant'
        ? 'Lin, ассистент мерчанта: заявки HR, компании, цены'
        : 'Lin, ассистент админа: очередь на проверку компаний и мерчантов';
  return `Тебя зовут Lin. Ты ${who}. Отвечай по-русски, коротко (1–4 предложения), по делу. Не пиши лекции. Только факты из JSON. Говори «мерчант», не пиши tenant и не говори «платформа». Не выдумывай числа. Если вопрос широкий — дай краткую сводку по JSON. Не представляйся как «ассистент HR».`;
}

async function tryOllama(role: AiRole, question: string, facts: AiFacts): Promise<string | null> {
  const models = cachedOllamaModel
    ? [cachedOllamaModel, ...OLLAMA_MODELS.filter((m) => m !== cachedOllamaModel)]
    : [...OLLAMA_MODELS];
  const payloadBase = {
    stream: false,
    messages: [
      { role: 'system' as const, content: systemPrompt(role) },
      {
        role: 'user' as const,
        content: `Данные:\n${JSON.stringify(compactForModel(facts))}\n\nВопрос: ${question}`,
      },
    ],
  };

  for (const model of models) {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), OLLAMA_TIMEOUT_MS);
    try {
      const res = await fetch('/ollama/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payloadBase, model }),
        signal: ctrl.signal,
      });
      window.clearTimeout(timer);
      if (res.status === 404) continue;
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        if (/not found|unknown model|404/i.test(errText)) continue;
        return null;
      }
      const data = (await res.json()) as { message?: { content?: string } };
      const text = data.message?.content?.trim();
      if (text) {
        cachedOllamaModel = model;
        return text;
      }
    } catch {
      window.clearTimeout(timer);
      return null;
    }
  }
  return null;
}

function typingPause() {
  return new Promise((r) => window.setTimeout(r, 400 + Math.floor(Math.random() * 400)));
}

export async function answer(
  role: AiRole,
  question: string,
  facts: AiFacts,
): Promise<{ text: string; notice?: string }> {
  const local = await tryOllama(role, question, facts);
  if (local) return { text: local };
  await typingPause();
  const text = fakeAnswer(role, question, facts);
  if (!ollamaDownNoted) {
    ollamaDownNoted = true;
    return { text, notice: 'Локальная модель недоступна — отвечаю по данным кабинета.' };
  }
  return { text };
}
