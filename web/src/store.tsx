import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadDb, saveDb } from './db';
import type { CorporateDb } from './db';
import type {
  Category,
  CompanyPrice,
  CompanyStatus,
  Gender,
  InviteCode,
  InviteRole,
  MerchantReview,
  Offer,
  OfferPeriod,
  PartnershipInitiator,
  PartnershipStatus,
  PriceMode,
  RequestStatus,
  User,
} from './types';

const SESSION_KEY = 'corporate-web-session';
const THEME_KEY = 'corporate-web-theme';

export type UserPatch = {
  name?: string;
  phone?: string;
  age?: number | null;
  gender?: Gender;
  city?: string;
  jobTitle?: string;
  password?: string;
};

function applyUserPatch(u: User, patch: UserPatch): User {
  const name = patch.name?.trim();
  const phone = patch.phone?.trim();
  const city = patch.city?.trim();
  const jobTitle = patch.jobTitle?.trim();
  const password = patch.password?.trim();
  const age =
    patch.age === undefined
      ? undefined
      : patch.age === null || Number.isNaN(patch.age)
        ? null
        : Math.min(80, Math.max(16, Math.round(patch.age)));
  return {
    ...u,
    ...(name ? { name } : {}),
    ...(patch.phone !== undefined ? { phone: phone || u.phone } : {}),
    ...(patch.city !== undefined ? { city: city || u.city } : {}),
    ...(age !== undefined ? { age } : {}),
    ...(patch.gender ? { gender: patch.gender } : {}),
    ...(patch.jobTitle !== undefined ? { jobTitle: jobTitle || u.jobTitle } : {}),
    ...(password ? { password } : {}),
  };
}

type Store = {
  session: User | null;
  booting: boolean;
  dark: boolean;
  setDark: (v: boolean) => void;
  login: (email: string, password: string) => string | null;
  loginAs: (userId: string) => string | null;
  register: (input: {
    name: string;
    email: string;
    password: string;
    role: 'hr' | 'merchant';
    companyName?: string;
    merchantName?: string;
    city?: string;
    category?: Category;
  }) => string | null;
  createInviteCode: (companyId: string, role?: InviteRole) => string | null;
  registerEmployee: (input: { name: string; email: string; password: string; code: string }) => string | null;
  removeEmployee: (userId: string, companyId: string) => void;
  deactivateHr: (userId: string, companyId: string) => void;
  setCompanyStatus: (companyId: string, status: CompanyStatus) => void;
  setMerchantStatus: (merchantId: string, status: 'verified' | 'review' | 'rejected') => void;
  logout: () => void;
  updateProfile: (patch: UserPatch) => void;
  updateEmployee: (userId: string, companyId: string, patch: UserPatch) => void;
  updateMerchant: (
    merchantId: string,
    patch: {
      name?: string;
      city?: string;
      category?: Category;
      phone?: string;
      about?: string;
      services?: string;
    },
  ) => void;
  companies: CorporateDb['companies'];
  users: User[];
  merchants: CorporateDb['merchants'];
  offers: CorporateDb['offers'];
  requests: CorporateDb['requests'];
  partnerships: CorporateDb['partnerships'];
  transactions: CorporateDb['transactions'];
  prices: CompanyPrice[];
  inviteCodes: InviteCode[];
  reviews: MerchantReview[];
  toggleCompanyOffer: (offerId: string, companyId: string) => void;
  saveOffer: (input: {
    id?: string;
    merchantId: string;
    title: string;
    description: string;
    points: number;
    category: Category;
    active: boolean;
    companyIds: string[];
    paid: boolean;
    placesLeft?: number | null;
    period?: OfferPeriod;
    image?: string;
  }) => string;
  deleteOffer: (offerId: string, merchantId: string) => void;
  requestPartnership: (companyId: string, merchantId: string, initiator: PartnershipInitiator) => void;
  sendPartnership: (companyId: string, merchantId: string, initiator: PartnershipInitiator) => void;
  setPartnershipStatus: (id: string, status: PartnershipStatus) => void;
  endPartnership: (companyId: string, merchantId: string) => void;
  setRequestStatus: (id: string, status: RequestStatus, note: string) => void;
  setPrice: (
    companyId: string,
    merchantId: string,
    mode: PriceMode,
    extra?: { discountPct?: number; points?: number; offerId?: string },
  ) => void;
  clearOfferPrice: (companyId: string, merchantId: string, offerId: string) => void;
};

const Ctx = createContext<Store | null>(null);

const INVITE_ALPHABET = '123456789ABCDEFGHIJKLMNPQRSTUVWXYZ';

function nowStamp() {
  const d = new Date();
  return `${d.getDate()} авг, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function normalizeInviteCode(code: string) {
  return code.trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
}

function tashkentPhone(seed: string): string {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 33 + seed.charCodeAt(i)) >>> 0;
  const seven = String(10000000 + (n % 9000000)).slice(1);
  return `+998 90 ${seven.slice(0, 3)} ${seven.slice(3, 5)} ${seven.slice(5)}`;
}

function makeInviteCode(taken: Set<string>) {
  for (let attempt = 0; attempt < 80; attempt++) {
    const len = 6 + (attempt % 3);
    let code = '';
    for (let i = 0; i < len; i++) {
      code += INVITE_ALPHABET[Math.floor(Math.random() * INVITE_ALPHABET.length)];
    }
    if (!taken.has(code)) return code;
  }
  throw new Error('Не удалось создать код приглашения');
}

function commit(prev: CorporateDb, patch: Partial<CorporateDb>): CorporateDb {
  const next = { ...prev, ...patch };
  saveDb(next);
  return next;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<CorporateDb>(() => loadDb());
  const [session, setSession] = useState<User | null>(() => {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const user = loadDb().users.find((u) => u.id === id);
    if (!user || user.role === 'employee') {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return user;
  });
  const [dark, setDarkState] = useState(() => localStorage.getItem(THEME_KEY) === 'dark');
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (!session) {
      setBooting(false);
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setBooting(false);
      return;
    }
    setBooting(true);
    const t = window.setTimeout(() => setBooting(false), 600);
    return () => window.clearTimeout(t);
  }, [session?.id]);

  const value = useMemo<Store>(() => {
    const enter = (user: User) => {
      if (user.role === 'employee') return 'вход сотрудников только в мобильном приложении';
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setBooting(true);
      }
      setSession(user);
      localStorage.setItem(SESSION_KEY, user.id);
      return null;
    };

    const requestPartnership = (companyId: string, merchantId: string, initiator: PartnershipInitiator) => {
      const stamp = new Date().toISOString();
      setDb((prev) => {
        const company = prev.companies.find((c) => c.id === companyId);
        const merchant = prev.merchants.find((m) => m.id === merchantId);
        if (!company || company.status !== 'Active') return prev;
        if (!merchant || !merchant.verified || merchant.rejected) return prev;
        const existing = prev.partnerships.find((p) => p.companyId === companyId && p.merchantId === merchantId);
        if (existing) {
          if (existing.status === 'rejected') {
            return commit(prev, {
              partnerships: prev.partnerships.map((p) =>
                p.id === existing.id ? { ...p, initiator, status: 'pending', createdAt: stamp } : p,
              ),
            });
          }
          if (existing.status === 'pending' && existing.initiator !== initiator) {
            return commit(prev, {
              partnerships: prev.partnerships.map((p) => (p.id === existing.id ? { ...p, status: 'talking' } : p)),
            });
          }
          return prev;
        }
        return commit(prev, {
          partnerships: [
            ...prev.partnerships,
            {
              id: `p${Date.now()}`,
              companyId,
              merchantId,
              initiator,
              status: 'pending',
              createdAt: stamp,
            },
          ],
        });
      });
    };

    return {
      session,
      booting,
      dark,
      setDark: setDarkState,
      login: (email, password) => {
        const key = email.trim().toLowerCase();
        if (!key || !password) return 'Заполните email и пароль';
        const user = db.users.find(
          (u) =>
            u.email.toLowerCase() === key ||
            u.email.split('@')[0].toLowerCase() === key,
        );
        if (!user) return 'Аккаунт не найден';
        if (user.active === false) return 'Аккаунт отключён';
        if (user.password !== password) return 'Неверный пароль';
        if (user.role === 'employee') return 'вход сотрудников только в мобильном приложении';
        return enter(user);
      },
      loginAs: (userId) => {
        const user = db.users.find((u) => u.id === userId);
        if (!user) return 'Аккаунт не найден';
        if (user.active === false) return 'Аккаунт отключён';
        return enter(user);
      },
      register: (input) => {
        const name = input.name.trim();
        const email = input.email.trim();
        const password = input.password;
        if (!name || !email || !password) return 'Заполните имя, email и пароль';
        const key = email.toLowerCase();
        if (db.users.some((u) => u.email.toLowerCase() === key)) return 'Такой email уже есть';
        let created: User | null = null;
        let fail: string | null = null;
        setDb((prev) => {
          if (prev.users.some((u) => u.email.toLowerCase() === key)) {
            fail = 'Такой email уже есть';
            return prev;
          }
          const id = `u${Date.now()}`;
          if (input.role === 'hr') {
            const companyName = input.companyName?.trim() ?? '';
            if (!companyName) {
              fail = 'Укажите название компании';
              return prev;
            }
            const companyId = `c${Date.now()}`;
            const city = input.city?.trim() || 'Ташкент';
            const user: User = {
              id,
              role: 'hr',
              name: name || 'Новый HR',
              email,
              password,
              companyId,
              phone: tashkentPhone(id),
              balance: 0,
              interestIds: [],
              jobTitle: 'HR / Benefits',
              active: true,
              age: null,
              gender: 'unspecified',
              city,
            };
            created = user;
            return commit(prev, {
              companies: [
                ...prev.companies,
                { id: companyId, name: companyName, tenantId: `tenant-${companyId}`, status: 'Pending', city },
              ],
              users: [...prev.users, user],
            });
          }
          const merchantName = input.merchantName?.trim() ?? '';
          if (!merchantName) {
            fail = 'Укажите название мерчанта';
            return prev;
          }
          const merchantId = `m${Date.now()}`;
          const phone = tashkentPhone(merchantId);
          const city = input.city?.trim() || 'Ташкент';
          const user: User = {
            id,
            role: 'merchant',
            name: name || 'Новый мерчант',
            email,
            password,
            merchantId,
            phone,
            balance: 0,
            interestIds: [],
            jobTitle: 'Менеджер мерчанта',
            active: true,
            age: null,
            gender: 'unspecified',
            city,
          };
          created = user;
          return commit(prev, {
            merchants: [
              ...prev.merchants,
              {
                id: merchantId,
                name: merchantName,
                city,
                category: input.category ?? 'sport',
                verified: false,
                rejected: false,
                phone,
                about: '',
                services: '',
              },
            ],
            users: [...prev.users, user],
          });
        });
        if (fail || !created) return fail ?? 'Не удалось создать аккаунт';
        return enter(created);
      },
      createInviteCode: (companyId, role = 'employee') => {
        const company = db.companies.find((c) => c.id === companyId);
        if (!company || company.status !== 'Active') return null;
        const taken = new Set(db.inviteCodes.map((row) => row.code));
        const code = makeInviteCode(taken);
        const invite: InviteCode = {
          id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          code,
          companyId,
          role,
          createdAt: new Date().toISOString(),
          usedAt: null,
          usedByUserId: null,
        };
        setDb((prev) => commit(prev, { inviteCodes: [...prev.inviteCodes, invite] }));
        return code;
      },
      registerEmployee: ({ name, email, password, code }) => {
        if (!name.trim() || !email.trim() || !password || !code.trim()) {
          return 'Заполните имя, email, пароль и код';
        }
        const key = email.trim().toLowerCase();
        const normalized = normalizeInviteCode(code);
        let created: User | null = null;
        let fail: string | null = null;
        setDb((prev) => {
          if (prev.users.some((u) => u.email.toLowerCase() === key)) {
            fail = 'Такой email уже есть';
            return prev;
          }
          const invite = prev.inviteCodes.find((row) => row.code === normalized && !row.usedAt);
          if (!invite) {
            fail = 'Код недействителен или уже использован';
            return prev;
          }
          if (invite.role === 'employee') {
            fail = 'вход сотрудников только в мобильном приложении';
            return prev;
          }
          const company = prev.companies.find((c) => c.id === invite.companyId);
          if (!company || company.status !== 'Active') {
            fail = 'Компания на проверке, код пока не действует';
            return prev;
          }
          const id = `u${Date.now()}`;
          const isHr = invite.role === 'hr';
          const user: User = {
            id,
            role: isHr ? 'hr' : 'employee',
            name: name.trim(),
            email: email.trim(),
            password,
            companyId: invite.companyId,
            phone: tashkentPhone(id),
            balance: 0,
            interestIds: [],
            jobTitle: isHr ? 'HR / Benefits' : 'Сотрудник',
            active: true,
            age: null,
            gender: 'unspecified',
            city: company.city || 'Ташкент',
          };
          created = user;
          const usedAt = new Date().toISOString();
          return commit(prev, {
            users: [...prev.users, user],
            inviteCodes: prev.inviteCodes.map((row) =>
              row.id === invite.id ? { ...row, usedAt, usedByUserId: user.id } : row,
            ),
          });
        });
        if (fail || !created) return fail ?? 'Код недействителен или уже использован';
        return enter(created);
      },
      removeEmployee: (userId, companyId) => {
        setDb((prev) => {
          const target = prev.users.find((u) => u.id === userId);
          if (!target || target.role !== 'employee' || target.companyId !== companyId) return prev;
          return commit(prev, {
            users: prev.users.filter((u) => u.id !== userId),
            requests: prev.requests.filter((r) => r.employeeId !== userId),
          });
        });
      },
      deactivateHr: (userId, companyId) => {
        setDb((prev) => {
          const target = prev.users.find((u) => u.id === userId);
          if (!target || target.role !== 'hr' || target.companyId !== companyId || target.active === false) return prev;
          const liveHrs = prev.users.filter((u) => u.role === 'hr' && u.companyId === companyId && u.active !== false);
          if (liveHrs.length <= 1) return prev;
          const users = prev.users.map((u) => (u.id === userId ? { ...u, active: false } : u));
          const next = commit(prev, { users });
          if (session?.id === userId) {
            setSession(null);
            localStorage.removeItem(SESSION_KEY);
          }
          return next;
        });
      },
      setCompanyStatus: (companyId, status) => {
        setDb((prev) =>
          commit(prev, {
            companies: prev.companies.map((c) => (c.id === companyId ? { ...c, status } : c)),
          }),
        );
      },
      setMerchantStatus: (merchantId, status) => {
        setDb((prev) =>
          commit(prev, {
            merchants: prev.merchants.map((m) => {
              if (m.id !== merchantId) return m;
              if (status === 'verified') return { ...m, verified: true, rejected: false };
              if (status === 'rejected') return { ...m, verified: false, rejected: true };
              return { ...m, verified: false, rejected: false };
            }),
          }),
        );
      },
      logout: () => {
        setSession(null);
        localStorage.removeItem(SESSION_KEY);
      },
      updateProfile: (patch) => {
        if (!session) return;
        setDb((prev) => {
          const users = prev.users.map((u) => (u.id === session.id ? applyUserPatch(u, patch) : u));
          const next = commit(prev, { users });
          const updated = next.users.find((u) => u.id === session.id);
          if (updated) setSession(updated);
          return next;
        });
      },
      updateEmployee: (userId, companyId, patch) => {
        if (!session) return;
        const allowed =
          session.role === 'admin' || (session.role === 'hr' && session.companyId === companyId);
        if (!allowed) return;
        setDb((prev) => {
          const target = prev.users.find((u) => u.id === userId);
          if (!target || target.role !== 'employee' || target.companyId !== companyId) return prev;
          const users = prev.users.map((u) => (u.id === userId ? applyUserPatch(u, patch) : u));
          const next = commit(prev, { users });
          if (session.id === userId) {
            const updated = next.users.find((u) => u.id === userId);
            if (updated) setSession(updated);
          }
          return next;
        });
      },
      updateMerchant: (merchantId, patch) => {
        if (!session) return;
        const own = session.role === 'merchant' && session.merchantId === merchantId;
        const admin = session.role === 'admin';
        if (!own && !admin) return;
        setDb((prev) => {
          const target = prev.merchants.find((m) => m.id === merchantId);
          if (!target) return prev;
          const name = patch.name?.trim();
          const city = patch.city?.trim();
          const phone = patch.phone?.trim();
          const about = patch.about?.trim();
          const services = patch.services?.trim();
          return commit(prev, {
            merchants: prev.merchants.map((m) =>
              m.id !== merchantId
                ? m
                : {
                    ...m,
                    ...(name ? { name } : {}),
                    ...(city ? { city } : {}),
                    ...(patch.category ? { category: patch.category } : {}),
                    ...(patch.phone !== undefined ? { phone: phone || m.phone } : {}),
                    ...(patch.about !== undefined ? { about: about ?? '' } : {}),
                    ...(patch.services !== undefined ? { services: services ?? '' } : {}),
                  },
            ),
          });
        });
      },
      companies: db.companies,
      users: db.users,
      merchants: db.merchants,
      offers: db.offers,
      requests: db.requests,
      partnerships: db.partnerships,
      transactions: db.transactions,
      prices: db.prices,
      inviteCodes: db.inviteCodes,
      reviews: db.reviews ?? [],
      toggleCompanyOffer: (offerId, companyId) => {
        setDb((prev) =>
          commit(prev, {
            offers: prev.offers.map((o) => {
              if (o.id !== offerId) return o;
              const on = o.companyIds.includes(companyId);
              return {
                ...o,
                companyIds: on ? o.companyIds.filter((id) => id !== companyId) : [...o.companyIds, companyId],
              };
            }),
          }),
        );
      },
      saveOffer: (input) => {
        const id = input.id?.trim() || `o-${Date.now()}`;
        setDb((prev) => {
          const i = prev.offers.findIndex((o) => o.id === id && o.merchantId === input.merchantId);
          const prevOffer = i >= 0 ? prev.offers[i] : undefined;
          const next: Offer = {
            id,
            merchantId: input.merchantId,
            title: input.title.trim() || 'Новая услуга',
            description: input.description.trim(),
            points: input.paid ? Math.max(0, input.points) : 0,
            category: input.category,
            active: input.active,
            companyIds: input.companyIds,
            placesLeft: input.placesLeft ?? prevOffer?.placesLeft ?? null,
            paid: input.paid,
            period: input.period ?? prevOffer?.period ?? 'month',
            image: input.image !== undefined ? input.image.trim() || undefined : prevOffer?.image,
          };
          const offers =
            i < 0
              ? [...prev.offers, next]
              : prev.offers.map((o, idx) => (idx === i ? { ...o, ...next, id: o.id, merchantId: o.merchantId } : o));
          return commit(prev, { offers });
        });
        return id;
      },
      deleteOffer: (offerId, merchantId) => {
        setDb((prev) => {
          const target = prev.offers.find((o) => o.id === offerId && o.merchantId === merchantId);
          if (!target) return prev;
          return commit(prev, {
            offers: prev.offers.filter((o) => o.id !== offerId),
            prices: prev.prices.filter((p) => p.offerId !== offerId),
          });
        });
      },
      requestPartnership,
      sendPartnership: requestPartnership,
      setPartnershipStatus: (id, status) => {
        setDb((prev) => {
          const target = prev.partnerships.find((p) => p.id === id);
          if (!target) return prev;
          const nextStatus: PartnershipStatus =
            status === 'connected' || status === 'rejected' || status === 'talking' || status === 'pending'
              ? status
              : target.status;
          const offers =
            nextStatus === 'rejected'
              ? prev.offers.map((o) =>
                  o.merchantId === target.merchantId
                    ? { ...o, companyIds: o.companyIds.filter((cid) => cid !== target.companyId) }
                    : o,
                )
              : prev.offers;
          return commit(prev, {
            partnerships: prev.partnerships.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)),
            offers,
          });
        });
      },
      endPartnership: (companyId, merchantId) => {
        setDb((prev) => {
          const existing = prev.partnerships.find((p) => p.companyId === companyId && p.merchantId === merchantId);
          if (!existing || existing.status === 'rejected') return prev;
          return commit(prev, {
            partnerships: prev.partnerships.map((p) => (p.id === existing.id ? { ...p, status: 'rejected' as const } : p)),
            offers: prev.offers.map((o) =>
              o.merchantId === merchantId ? { ...o, companyIds: o.companyIds.filter((id) => id !== companyId) } : o,
            ),
          });
        });
      },
      setRequestStatus: (id, status, note) => {
        const stamp = nowStamp();
        setDb((prev) =>
          commit(prev, {
            requests: prev.requests.map((r) =>
              r.id === id
                ? { ...r, status, updatedAt: stamp, history: [...r.history, { status, at: stamp, note }] }
                : r,
            ),
          }),
        );
      },
      setPrice: (companyId, merchantId, mode, extra) => {
        setDb((prev) => {
          const offerId = extra?.offerId;
          const same = (p: CompanyPrice) =>
            p.merchantId === merchantId && p.companyId === companyId && (p.offerId ?? undefined) === offerId;
          const current = prev.prices.find(same);
          const nextPrice: CompanyPrice = {
            merchantId,
            companyId,
            offerId,
            mode,
            discountPct: extra?.discountPct ?? current?.discountPct ?? 20,
            points: extra?.points ?? current?.points ?? 2500,
          };
          const i = prev.prices.findIndex(same);
          const prices = i < 0 ? [nextPrice, ...prev.prices] : prev.prices.map((p, idx) => (idx === i ? nextPrice : p));
          return commit(prev, { prices });
        });
      },
      clearOfferPrice: (companyId, merchantId, offerId) => {
        setDb((prev) =>
          commit(prev, {
            prices: prev.prices.filter(
              (p) => !(p.merchantId === merchantId && p.companyId === companyId && p.offerId === offerId),
            ),
          }),
        );
      },
    };
  }, [session, booting, dark, db]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('Store missing');
  return ctx;
}
