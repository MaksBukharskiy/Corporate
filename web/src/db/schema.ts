export type {
  BenefitRequest,
  Category,
  Company,
  CompanyPrice,
  HistoryEntry,
  Interest,
  InviteCode,
  Merchant,
  MerchantReview,
  Offer,
  Partnership,
  PriceMode,
  RequestStatus,
  Role,
  Transaction,
  TxType,
  User,
} from '../types';

import type {
  BenefitRequest,
  Company,
  CompanyPrice,
  Interest,
  InviteCode,
  Merchant,
  MerchantReview,
  Offer,
  Partnership,
  Transaction,
  User,
} from '../types';

export const DB_KEY = 'corporate-web-db';
export const DB_VERSION = 13;

export type CorporateDb = {
  version: number;
  companies: Company[];
  merchants: Merchant[];
  users: User[];
  offers: Offer[];
  requests: BenefitRequest[];
  prices: CompanyPrice[];
  transactions: Transaction[];
  interests: Interest[];
  inviteCodes: InviteCode[];
  partnerships: Partnership[];
  reviews: MerchantReview[];
};
