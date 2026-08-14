import { useEffect, useState } from 'react'
import { api } from '../api'
import { StatusBadge, formatPoints } from '../components/ui'

export default function MerchantPage() {
  const [merchants, setMerchants] = useState([])
  const [merchantId, setMerchantId] = useState(null)
  const [applications, setApplications] = useState([])
  const [error, setError] = useState('')
  const [loadingId, setLoadingId] = useState(null)

  useEffect(() => {
    api.getMerchants().then((data) => {
      setMerchants(data)
      if (data.length > 0) setMerchantId(data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!merchantId) return
    loadApplications()
    const timer = setInterval(loadApplications, 3000)
    return () => clearInterval(timer)
  }, [merchantId])

  async function loadApplications() {
    try {
      const data = await api.getPendingApplications(merchantId)
      setApplications(data)
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleAction(id, action) {
    setLoadingId(id)
    setError('')
    try {
      if (action === 'approve') await api.approveApplication(id)
      if (action === 'reject') await api.rejectApplication(id)
      if (action === 'redeem') await api.redeemApplication(id)
      await loadApplications()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingId(null)
    }
  }

  const pendingCount = applications.filter((app) => app.status === 'PENDING').length
  const merchant = merchants.find((item) => item.id === merchantId)

  return (
    <div className="space-y-6">
      <section className="card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{merchant?.name || 'Мерчант'}</h2>
          <p className="text-slate-400 text-sm mt-1">Входящие заявки</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400">Ожидают</p>
            <p className="text-xl font-semibold text-blue-600">{pendingCount}</p>
          </div>
          <select
            className="select"
            value={merchantId || ''}
            onChange={(e) => setMerchantId(Number(e.target.value))}
          >
            {merchants.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </section>

      {error && <div className="card p-4 text-red-600 text-sm">{error}</div>}

      <div className="space-y-3">
        {applications.length === 0 && (
          <div className="card p-6 text-slate-400 text-sm">Заявок нет</div>
        )}
        {applications.map((app) => (
          <div key={app.id} className="card p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium">{app.employeeName}</p>
              <p className="text-sm text-slate-400">{app.companyName} · {app.offerTitle}</p>
              <p className="text-blue-600 font-medium mt-1">{formatPoints(app.pointsPrice)} баллов</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={app.status} />
              {app.status === 'PENDING' && (
                <>
                  <button className="btn-primary" disabled={loadingId === app.id} onClick={() => handleAction(app.id, 'approve')}>
                    Одобрить
                  </button>
                  <button className="btn-danger" disabled={loadingId === app.id} onClick={() => handleAction(app.id, 'reject')}>
                    Отклонить
                  </button>
                </>
              )}
              {app.status === 'APPROVED' && (
                <button className="btn-primary" disabled={loadingId === app.id} onClick={() => handleAction(app.id, 'redeem')}>
                  Погасить QR
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
