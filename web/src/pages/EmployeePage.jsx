import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { api } from '../api'
import { CATEGORIES, StatusBadge, StatusProgress, formatPoints } from '../components/ui'

export default function EmployeePage({ companyId, employeeId, onEmployeeChange, onCompanyChange }) {
  const [companies, setCompanies] = useState([])
  const [employees, setEmployees] = useState([])
  const [employee, setEmployee] = useState(null)
  const [offers, setOffers] = useState([])
  const [applications, setApplications] = useState([])
  const [category, setCategory] = useState('')
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getCompanies().then(setCompanies).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    if (!companyId) return
    api.getEmployees(companyId).then((data) => {
      setEmployees(data)
      if (data.length > 0 && !data.some((item) => item.id === employeeId)) {
        onEmployeeChange(data[0].id)
      }
    }).catch((e) => setError(e.message))
  }, [companyId])

  useEffect(() => {
    if (!employeeId) return
    refreshEmployeeData()
  }, [employeeId, category])

  async function refreshEmployeeData() {
    try {
      const [employeeData, catalog, apps] = await Promise.all([
        api.getEmployee(employeeId),
        api.getCatalog(category || undefined),
        api.getApplications(employeeId),
      ])
      setEmployee(employeeData)
      setOffers(catalog)
      setApplications(apps)
    } catch (e) {
      setError(e.message)
    }
  }

  async function applyForOffer(offer) {
    setLoading(true)
    setError('')
    try {
      await api.createApplication({ employeeId, offerId: offer.id })
      await refreshEmployeeData()
      setSelectedOffer(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const approvedApp = applications.find((app) => app.status === 'APPROVED')

  useEffect(() => {
    if (approvedApp) {
      confetti({ particleCount: 80, spread: 50, origin: { y: 0.7 }, colors: ['#2563eb', '#93c5fd', '#ffffff'] })
    }
  }, [approvedApp?.id, approvedApp?.status])

  return (
    <div className="space-y-8">
      <section className="card p-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm text-slate-500">Баланс</p>
          <p className="text-4xl font-semibold text-slate-900 mt-1 tracking-tight">
            {formatPoints(employee?.balance || 0)}
            <span className="text-base font-medium text-slate-400 ml-2">баллов</span>
          </p>
        </div>
        <div className="flex gap-2">
          <select className="select" value={companyId || ''} onChange={(e) => onCompanyChange(Number(e.target.value))}>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select className="select" value={employeeId || ''} onChange={(e) => onEmployeeChange(Number(e.target.value))}>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      </section>

      {error && <div className="card p-4 text-red-600 text-sm">{error}</div>}

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
              category === cat.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
            onClick={() => setCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {offers.map((offer) => (
          <button
            key={offer.id}
            className="card overflow-hidden text-left hover:border-blue-300 transition"
            onClick={() => setSelectedOffer(offer)}
          >
            <img src={offer.imageUrl} alt={offer.title} className="h-40 w-full object-cover" />
            <div className="p-4">
              <p className="text-xs text-slate-400">{offer.merchantName}</p>
              <h3 className="font-semibold mt-1">{offer.title}</h3>
              <p className="text-blue-600 font-semibold mt-3">{formatPoints(offer.pointsPrice)} баллов</p>
            </div>
          </button>
        ))}
      </div>

      {selectedOffer && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="card max-w-lg w-full overflow-hidden">
            <img src={selectedOffer.imageUrl} alt="" className="h-44 w-full object-cover" />
            <div className="p-5">
              <p className="text-sm text-slate-400">{selectedOffer.merchantName}</p>
              <h3 className="text-xl font-semibold mt-1">{selectedOffer.title}</h3>
              <p className="text-slate-500 mt-3 text-sm leading-relaxed">{selectedOffer.description}</p>
              <p className="text-blue-600 font-semibold text-lg mt-4">{formatPoints(selectedOffer.pointsPrice)} баллов</p>
              <div className="flex gap-2 mt-5">
                <button className="btn-primary flex-1" disabled={loading} onClick={() => applyForOffer(selectedOffer)}>
                  {loading ? 'Отправка...' : 'Получить льготу'}
                </button>
                <button className="btn-secondary" onClick={() => setSelectedOffer(null)}>Закрыть</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Мои заявки</h3>
          <span className="text-sm text-slate-400">{applications.length}</span>
        </div>
        <div className="space-y-3">
          {applications.length === 0 && (
            <p className="text-slate-400 text-sm">Заявок пока нет</p>
          )}
          {applications.map((app) => (
            <div key={app.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{app.offerTitle}</p>
                  <p className="text-sm text-slate-400">{app.merchantName} · {formatPoints(app.pointsPrice)} баллов</p>
                  <StatusProgress status={app.status} />
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={app.status} />
                  {app.status === 'APPROVED' && (
                    <div className="text-center">
                      <img src={api.getQrUrl(app.id)} alt="QR" className="w-20 h-20 border border-slate-200" />
                      <p className="text-xs mt-1 font-mono text-slate-500">{app.voucherCode}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
