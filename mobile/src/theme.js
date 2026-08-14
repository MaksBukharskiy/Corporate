export const colors = {
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  text: '#1e293b',
  muted: '#94a3b8',
  blue: '#2563eb',
  blueDark: '#1d4ed8',
  blueSoft: '#eff6ff',
}

export const USERS = [
  { login: 'ali', password: '1234', role: 'employee', employeeId: 1, name: 'Ali Karimov' },
  { login: 'admin', password: '1234', role: 'admin', name: 'Admin Click' },
]

export function formatPoints(value) {
  return new Intl.NumberFormat('ru-RU').format(value || 0)
}

export const STATUS_LABELS = {
  CREATED: 'Создана',
  PENDING: 'На рассмотрении',
  APPROVED: 'Одобрена',
  REJECTED: 'Отклонена',
  REDEEMED: 'Погашена',
}

export const CATEGORIES = [
  { id: '', label: 'Все' },
  { id: 'sport', label: 'Спорт' },
  { id: 'food', label: 'Еда' },
  { id: 'education', label: 'Обучение' },
  { id: 'health', label: 'Здоровье' },
  { id: 'travel', label: 'Путешествия' },
]
