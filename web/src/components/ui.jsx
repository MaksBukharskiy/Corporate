const STATUS_LABELS = {
  CREATED: 'Создана',
  PENDING: 'На рассмотрении',
  APPROVED: 'Одобрена',
  REJECTED: 'Отклонена',
  REDEEMED: 'Погашена',
}

const STATUS_COLORS = {
  CREATED: 'bg-slate-100 text-slate-600',
  PENDING: 'bg-blue-50 text-blue-700',
  APPROVED: 'bg-blue-600 text-white',
  REJECTED: 'bg-slate-100 text-slate-500',
  REDEEMED: 'bg-slate-800 text-white',
}

const STATUS_STEP = {
  CREATED: 1,
  PENDING: 2,
  APPROVED: 3,
  REDEEMED: 4,
  REJECTED: 0,
}

export function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-600'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export function StatusProgress({ status }) {
  const step = STATUS_STEP[status] || 0
  if (status === 'REJECTED') {
    return <div className="text-xs text-slate-500 mt-2">Отклонена</div>
  }
  return (
    <div className="progress mt-3">
      {[1, 2, 3, 4].map((item) => (
        <span key={item} className={item <= step ? 'on' : ''} />
      ))}
    </div>
  )
}

export function formatPoints(value) {
  return new Intl.NumberFormat('ru-RU').format(value)
}

export const CATEGORIES = [
  { id: '', label: 'Все' },
  { id: 'sport', label: 'Спорт' },
  { id: 'food', label: 'Еда' },
  { id: 'education', label: 'Обучение' },
  { id: 'health', label: 'Здоровье' },
  { id: 'travel', label: 'Путешествия' },
]
