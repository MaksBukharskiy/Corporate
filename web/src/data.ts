import type { Category } from './types';

export { interests } from './db/seed';

export const categoryAccent: Record<Category, string> = {
  sport: '#8B7CFF',
  food: '#FF8A4C',
  education: '#4C8DFF',
  health: '#FF6B9D',
  transport: '#2DD4BF',
  events: '#4ADE80',
};

export const categoryLabel: Record<Category, string> = {
  sport: 'Спорт',
  food: 'Еда',
  education: 'Обучение',
  health: 'Здоровье',
  transport: 'Транспорт',
  events: 'Ивенты',
};

/** Stock covers for service cards (Unsplash). Cards fall back to a solid+icon if the image fails. */
export const categoryCover: Record<Category, string> = {
  sport: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  education: 'https://images.unsplash.com/photo-14565130808-af504b3a8c18?auto=format&fit=crop&w=800&q=80',
  health: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
  transport: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
  events: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80',
};

export const servicePhotoPresets: string[] = [
  ...Object.values(categoryCover),
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=900&q=80',
];

export const statusLabel: Record<string, string> = {
  pending: 'На рассмотрении',
  approved: 'Одобрена',
  in_progress: 'В работе',
  completed: 'Завершена',
  rejected: 'Отклонена',
};

export const partnershipLabel: Record<string, string> = {
  pending: 'На рассмотрении',
  talking: 'Переговоры',
  rejected: 'Отклонена',
  connected: 'Подключены',
};

const MONTH_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export function formatIsoDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}

export function partnershipInboxRank(status: string) {
  if (status === 'pending') return 0;
  if (status === 'talking') return 1;
  if (status === 'rejected') return 2;
  return 3;
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export const genderLabel: Record<import('./types').Gender, string> = {
  female: 'жен',
  male: 'муж',
  unspecified: 'не указывать',
};

export function companyStatusLabel(status: string) {
  if (status === 'Active') return 'активна';
  if (status === 'Rejected') return 'отклонена';
  return 'на проверке';
}
