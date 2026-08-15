export type Role = 'employee' | 'merchant' | 'admin' | 'hr';
export type RequestStatus = 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
export type Category = 'sport' | 'food' | 'education' | 'health' | 'transport' | 'events';
export type TxType = 'redeem' | 'topup';
export type PriceMode = 'free' | 'discount' | 'points';

export type CompanyStatus = 'Active' | 'Pending' | 'Rejected';
export type Gender = 'female' | 'male' | 'unspecified';

export type Company = { id: string; name: string; tenantId: string; status: CompanyStatus; city: string };

export type User = {
  id: string;
  role: Role;
  name: string;
  email: string;
  password: string;
  companyId?: string;
  merchantId?: string;
  phone: string;
  balance: number;
  interestIds: string[];
  jobTitle: string;
  /** false = не может войти; каталог и коды компании остаются */
  active: boolean;
  age: number | null;
  gender: Gender;
  city: string;
};

export type Interest = { id: string; title: string; category: Category };

export type Merchant = {
  id: string;
  name: string;
  city: string;
  category: Category;
  verified: boolean;
  rejected: boolean;
  phone: string;
  about: string;
  services: string;
  coverUrl?: string;
  gallery?: string[];
};

export type MerchantReview = {
  id: string;
  merchantId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  course?: string;
};

export type PartnershipStatus = 'pending' | 'talking' | 'rejected' | 'connected';
export type PartnershipInitiator = 'hr' | 'merchant';

export type Partnership = {
  id: string;
  companyId: string;
  merchantId: string;
  initiator: PartnershipInitiator;
  status: PartnershipStatus;
  createdAt: string;
};

export type OfferPeriod = 'day' | 'week' | 'month';

export type Offer = {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  points: number;
  category: Category;
  active: boolean;
  companyIds: string[];
  placesLeft?: number | null;
  paid: boolean;
  period?: OfferPeriod;
  image?: string;
};

export type HistoryEntry = { status: RequestStatus; at: string; note: string };

export type BenefitRequest = {
  id: string;
  offerId: string;
  employeeId: string;
  companyId: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  history: HistoryEntry[];
};

export type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  userId: string;
  companyId: string | null;
  offerId: string | null;
  createdAt: string;
};

export type CompanyPrice = {
  merchantId: string;
  companyId: string;
  /** Пусто = тариф компании. Заполнено = персонально на услугу. */
  offerId?: string;
  mode: PriceMode;
  discountPct: number;
  points: number;
};

export type InviteRole = 'hr' | 'employee';

export type InviteCode = {
  id: string;
  code: string;
  companyId: string;
  role: InviteRole;
  createdAt: string;
  usedAt: string | null;
  usedByUserId: string | null;
};
