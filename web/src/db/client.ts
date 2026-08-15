import type {
  Category,
  Company,
  CompanyStatus,
  Gender,
  InviteCode,
  Merchant,
  MerchantReview,
  Offer,
  Partnership,
  PartnershipInitiator,
  PartnershipStatus,
  User,
} from '../types';
import type { CorporateDb } from './schema';
import { DB_KEY, DB_VERSION } from './schema';
import { seedDb } from './seed';

const ACCESS_KEY = 'corporate-web-admin-access';

const CATEGORIES: Category[] = ['sport', 'food', 'education', 'health', 'transport', 'events'];

function asPhone(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function tashkentPhone(seed: string): string {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 33 + seed.charCodeAt(i)) >>> 0;
  const seven = String(10000000 + (n % 9000000)).slice(1);
  return `+998 90 ${seven.slice(0, 3)} ${seven.slice(3, 5)} ${seven.slice(5)}`;
}

function hasCoreTables(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false;
  const db = value as Record<string, unknown>;
  return (
    Array.isArray(db.companies) &&
    Array.isArray(db.merchants) &&
    Array.isArray(db.users) &&
    Array.isArray(db.offers) &&
    Array.isArray(db.requests) &&
    Array.isArray(db.prices) &&
    Array.isArray(db.transactions) &&
    Array.isArray(db.interests)
  );
}

function companyStatus(value: unknown): CompanyStatus {
  if (value === 'Rejected' || value === 'Pending' || value === 'Active') return value;
  return 'Active';
}

function asCategory(value: unknown): Category {
  return CATEGORIES.includes(value as Category) ? (value as Category) : 'sport';
}

function asGender(value: unknown, fallback: Gender): Gender {
  if (value === 'female' || value === 'male' || value === 'unspecified') return value;
  return fallback;
}

function demoAge(id: string): number {
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n * 33 + id.charCodeAt(i)) >>> 0;
  return 23 + (n % 20);
}

function demoGender(name: string, id: string): Gender {
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n * 33 + id.charCodeAt(i)) >>> 0;
  if (n % 11 === 0) return 'unspecified';
  const first = name.split(/\s+/)[0] ?? '';
  const last = name.split(/\s+/).at(-1) ?? '';
  if (/a$/i.test(first) || /(ova|eva|yeva|ieva)$/i.test(last)) return 'female';
  return 'male';
}

function asInitiator(value: unknown): PartnershipInitiator {
  return value === 'merchant' ? 'merchant' : 'hr';
}

function asPartnershipStatus(value: unknown): PartnershipStatus {
  if (value === 'talking' || value === 'rejected' || value === 'connected' || value === 'pending') return value;
  return 'pending';
}

function migratePartnerships(value: unknown): Partnership[] {
  if (!Array.isArray(value) || value.length === 0) return seedDb.partnerships.map((row) => ({ ...row }));
  return value
    .map((row, i) => {
      const r = row as Partial<Partnership>;
      const companyId = asString(r.companyId, '');
      const merchantId = asString(r.merchantId, '');
      if (!companyId || !merchantId) return null;
      return {
        id: asString(r.id, `p-mig-${i}`),
        companyId,
        merchantId,
        initiator: asInitiator(r.initiator),
        status: asPartnershipStatus(r.status),
        createdAt: asString(r.createdAt, new Date().toISOString()),
      } satisfies Partnership;
    })
    .filter((row): row is Partnership => row !== null);
}

function mergeSeedPartnerships(existing: Partnership[]): Partnership[] {
  const byPair = new Map(existing.map((p) => [`${p.companyId}:${p.merchantId}`, p]));
  const extra = seedDb.partnerships.filter((p) => !byPair.has(`${p.companyId}:${p.merchantId}`));
  return extra.length ? [...existing, ...extra] : existing;
}

function migrateReviews(value: unknown): MerchantReview[] {
  if (!Array.isArray(value) || value.length === 0) return seedDb.reviews.map((row) => ({ ...row }));
  return value
    .map((row, i) => {
      const r = row as Partial<MerchantReview>;
      const merchantId = asString(r.merchantId, '');
      const text = asString(r.text, '').trim();
      if (!merchantId || !text) return null;
      const rating = typeof r.rating === 'number' && Number.isFinite(r.rating) ? Math.min(5, Math.max(1, Math.round(r.rating))) : 5;
      const course = typeof r.course === 'string' ? r.course : '';
      return {
        id: asString(r.id, `rev-mig-${i}`),
        merchantId,
        author: asString(r.author, 'Сотрудник'),
        rating,
        text,
        date: asString(r.date, '2026-07-01'),
        ...(course ? { course } : {}),
      } satisfies MerchantReview;
    })
    .filter((row): row is MerchantReview => row !== null);
}

function mergeSeedReviews(existing: MerchantReview[]): MerchantReview[] {
  const byId = new Map(existing.map((r) => [r.id, r]));
  const next = existing.map((r) => {
    const seeded = seedDb.reviews.find((s) => s.id === r.id);
    if (!seeded) return r;
    if (seeded.merchantId === 'm3') return { ...r, ...seeded };
    return { ...r, course: r.course || seeded.course, text: r.text || seeded.text };
  });
  const extra = seedDb.reviews.filter((r) => !byId.has(r.id));
  return extra.length ? [...next, ...extra] : next;
}

function offerImage(row: Offer & { imageUrl?: string }, seeded?: Offer): string | undefined {
  const own = typeof row.image === 'string' && row.image.trim() ? row.image : '';
  const legacy = typeof row.imageUrl === 'string' && row.imageUrl.trim() ? row.imageUrl : '';
  return own || legacy || seeded?.image;
}

function migrateOffers(value: unknown): Offer[] {
  if (!Array.isArray(value)) return seedDb.offers.map((row) => ({ ...row }));
  return (value as (Offer & { imageUrl?: string })[]).map((o, i) => {
    const seeded = seedDb.offers.find((row) => row.id === o.id);
    return {
      ...o,
      id: asString(o.id, `o-mig-${i}`),
      merchantId: asString(o.merchantId, seeded?.merchantId ?? ''),
      title: asString(o.title, seeded?.title ?? 'Услуга'),
      description: asString(o.description, seeded?.description ?? ''),
      points: typeof o.points === 'number' ? o.points : (seeded?.points ?? 0),
      category: asCategory(o.category),
      active: o.active !== false,
      companyIds: Array.isArray(o.companyIds) ? o.companyIds : (seeded?.companyIds ?? []),
      placesLeft: o.placesLeft ?? seeded?.placesLeft ?? null,
      paid: typeof o.paid === 'boolean' ? o.paid : (seeded?.paid ?? true),
      period: o.period,
      image: offerImage(o, seeded),
    };
  });
}

function academySeedOffers(): Offer[] {
  return seedDb.offers.filter((o) => o.merchantId === 'm3');
}

function academyCatalogStale(offers: Offer[]): boolean {
  return academySeedOffers().some((s) => {
    const have = offers.find((o) => o.id === s.id);
    return !have || have.merchantId !== 'm3' || !String(have.image || '').trim();
  });
}

function mergeSeedOffers(existing: Offer[]): Offer[] {
  const byId = new Map(existing.map((o) => [o.id, o]));
  const next = existing.map((o) => {
    const seeded = seedDb.offers.find((s) => s.id === o.id);
    if (!seeded) return o;
    if (seeded.merchantId !== 'm3') return { ...o, image: o.image || seeded.image };
    const companyIds = Array.from(new Set([...(o.companyIds ?? []), ...(seeded.companyIds ?? []), 'c1']));
    return {
      ...o,
      ...seeded,
      merchantId: 'm3',
      active: true,
      image: seeded.image,
      companyIds,
      placesLeft: o.placesLeft ?? seeded.placesLeft,
    };
  });
  for (const seeded of seedDb.offers) {
    if (!byId.has(seeded.id)) next.push({ ...seeded });
  }
  return next;
}

function mergeAcademyMerchant(merchants: Merchant[]): Merchant[] {
  const seeded = seedDb.merchants.find((m) => m.id === 'm3');
  if (!seeded) return merchants;
  return merchants.map((m) =>
    m.id !== 'm3'
      ? m
      : {
          ...m,
          about: seeded.about,
          services: seeded.services,
          coverUrl: seeded.coverUrl,
          gallery: seeded.gallery,
        },
  );
}

function migrateInviteCodes(value: unknown): InviteCode[] {
  if (!Array.isArray(value)) return [];
  return value.map((row, i) => {
    const r = row as Partial<InviteCode>;
    return {
      id: asString(r.id, `inv-mig-${i}`),
      code: asString(r.code, '').toUpperCase(),
      companyId: asString(r.companyId, ''),
      role: r.role === 'hr' ? 'hr' : 'employee',
      createdAt: asString(r.createdAt, new Date().toISOString()),
      usedAt: typeof r.usedAt === 'string' ? r.usedAt : null,
      usedByUserId: typeof r.usedByUserId === 'string' ? r.usedByUserId : null,
    };
  });
}

function applyLegacyAccess(db: CorporateDb): CorporateDb {
  try {
    const raw = localStorage.getItem(ACCESS_KEY);
    if (!raw) return db;
    const parsed = JSON.parse(raw) as {
      companies?: Record<string, string>;
      merchants?: Record<string, string>;
    };
    const companies = db.companies.map((c) => {
      const patch = parsed.companies?.[c.id];
      if (patch === 'Active' || patch === 'Pending' || patch === 'Rejected') {
        const status: CompanyStatus = patch;
        return { ...c, status };
      }
      return c;
    });
    const merchants = db.merchants.map((m) => {
      const patch = parsed.merchants?.[m.id];
      if (patch === 'verified') return { ...m, verified: true, rejected: false };
      if (patch === 'rejected') return { ...m, verified: false, rejected: true };
      if (patch === 'review') return { ...m, verified: false, rejected: false };
      return m;
    });
    localStorage.removeItem(ACCESS_KEY);
    return { ...db, companies, merchants };
  } catch {
    return db;
  }
}

function migrateDb(value: unknown): CorporateDb | null {
  if (!hasCoreTables(value)) return null;
  const inviteCodes = migrateInviteCodes(value.inviteCodes);
  const partnerships = migratePartnerships(value.partnerships);
  const companies: Company[] = (value.companies as Company[]).map((c, i) => {
    const seeded = seedDb.companies.find((row) => row.id === c.id);
    return {
      id: asString(c.id, `c-mig-${i}`),
      name: asString(c.name, 'Компания'),
      tenantId: asString(c.tenantId, `tenant-${c.id || i}`),
      status: companyStatus(c.status),
      city: asString((c as Company).city, seeded?.city ?? 'Ташкент') || 'Ташкент',
    };
  });
  const merchants: Merchant[] = (value.merchants as Merchant[]).map((m, i) => {
    const row = m as Merchant & { rejected?: unknown };
    return {
      id: asString(m.id, `m${i}`),
      name: asString(m.name, 'Мерчант'),
      city: asString(m.city, 'Ташкент'),
      category: asCategory(m.category),
      verified: typeof m.verified === 'boolean' ? m.verified : true,
      rejected: row.rejected === true,
      phone: asPhone(row.phone, tashkentPhone(m.id || `m${i}`)),
      about: asString(m.about, ''),
      services: asString(m.services, ''),
      coverUrl: typeof (m as Merchant).coverUrl === 'string' ? (m as Merchant).coverUrl : undefined,
      gallery: Array.isArray((m as Merchant).gallery)
        ? (m as Merchant).gallery?.filter((src): src is string => typeof src === 'string' && src.trim().length > 0)
        : undefined,
    };
  });
  const users: User[] = (value.users as User[]).map((u, i) => {
    const shop = u.merchantId ? merchants.find((m) => m.id === u.merchantId) : undefined;
    const company = u.companyId ? companies.find((c) => c.id === u.companyId) : undefined;
    const seeded = seedDb.users.find((row) => row.id === u.id);
    const row = u as User & { active?: unknown; age?: unknown; gender?: unknown; city?: unknown };
    const name = asString(u.name, 'Пользователь');
    const id = asString(u.id, `u${i}`);
    const age =
      typeof row.age === 'number' && Number.isFinite(row.age)
        ? Math.round(row.age)
        : (seeded?.age ?? demoAge(id));
    return {
      ...u,
      id,
      name,
      email: asString(u.email, `user${i}@demo.uz`),
      password: asString(u.password, '1234'),
      phone: asPhone(row.phone, shop?.phone ?? tashkentPhone(id)),
      balance: typeof u.balance === 'number' ? u.balance : 0,
      interestIds: Array.isArray(u.interestIds) ? u.interestIds : [],
      jobTitle: asString(u.jobTitle, ''),
      active: row.active !== false,
      age: age > 0 ? age : seeded?.age ?? demoAge(id),
      gender: asGender(row.gender, seeded?.gender ?? demoGender(name, id)),
      city: asString(row.city, seeded?.city ?? shop?.city ?? company?.city ?? 'Ташкент') || 'Ташкент',
    };
  });
  return applyLegacyAccess({
    version: DB_VERSION,
    companies,
    merchants,
    users,
    offers: migrateOffers(value.offers),
    requests: value.requests as CorporateDb['requests'],
    prices: value.prices as CorporateDb['prices'],
    transactions: value.transactions as CorporateDb['transactions'],
    interests: value.interests as CorporateDb['interests'],
    inviteCodes,
    partnerships,
    reviews: migrateReviews(value.reviews),
  });
}

export function hydrateDb(): CorporateDb {
  const copy = structuredClone(seedDb);
  localStorage.setItem(DB_KEY, JSON.stringify(copy));
  return copy;
}

export function loadDb(): CorporateDb {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return hydrateDb();
    const parsed: unknown = JSON.parse(raw);
    const migrated = migrateDb(parsed);
    if (!migrated) return hydrateDb();
    const before = parsed as { version?: number; inviteCodes?: unknown; reviews?: unknown };
    const missingPhone =
      (parsed as { users?: { phone?: unknown }[]; merchants?: { phone?: unknown }[] }).users?.some(
        (u) => typeof u.phone !== 'string' || !u.phone.trim(),
      ) ||
      (parsed as { merchants?: { phone?: unknown }[] }).merchants?.some(
        (m) => typeof m.phone !== 'string' || !m.phone.trim(),
      );
    const missingFlags =
      (parsed as { users?: { active?: unknown; age?: unknown; gender?: unknown; city?: unknown }[] }).users?.some(
        (u) =>
          typeof u.active !== 'boolean' ||
          typeof u.age !== 'number' ||
          (u.gender !== 'female' && u.gender !== 'male' && u.gender !== 'unspecified') ||
          typeof u.city !== 'string',
      ) ||
      (parsed as { companies?: { city?: unknown }[] }).companies?.some((c) => typeof c.city !== 'string') ||
      (parsed as { merchants?: { rejected?: unknown }[] }).merchants?.some((m) => typeof m.rejected !== 'boolean') ||
      (parsed as { inviteCodes?: { role?: unknown }[] }).inviteCodes?.some((row) => row.role !== 'hr' && row.role !== 'employee');
    if (
      before.version !== DB_VERSION ||
      !Array.isArray(before.inviteCodes) ||
      !Array.isArray(before.reviews) ||
      missingPhone ||
      missingFlags ||
      academyCatalogStale(migrated.offers)
    ) {
      if ((before.version ?? 0) < 5) {
        migrated.requests = seedDb.requests;
        migrated.transactions = seedDb.transactions;
      }
      if ((before.version ?? 0) < 8) {
        migrated.companies = migrated.companies.map((c) => {
          const seeded = seedDb.companies.find((row) => row.id === c.id);
          return seeded ? { ...c, status: seeded.status } : c;
        });
        migrated.merchants = migrated.merchants.map((m) => {
          const seeded = seedDb.merchants.find((row) => row.id === m.id);
          return seeded ? { ...m, verified: seeded.verified, rejected: seeded.rejected } : m;
        });
      }
      if ((before.version ?? 0) < 9) {
        migrated.partnerships = mergeSeedPartnerships(migrated.partnerships);
      }
      if ((before.version ?? 0) < 13 || academyCatalogStale(migrated.offers)) {
        migrated.offers = mergeSeedOffers(migrated.offers);
        migrated.reviews = mergeSeedReviews(migrated.reviews);
        migrated.merchants = mergeAcademyMerchant(migrated.merchants);
      }
      saveDb(migrated);
    }
    return migrated;
  } catch {
    return hydrateDb();
  }
}

export function saveDb(db: CorporateDb): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}
