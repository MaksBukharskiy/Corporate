import { useEffect, useState } from 'react'
import { api } from '../api'
import { formatPoints } from '../components/ui'

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [companies, setCompanies] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.getAdminStats(),
      api.getTransactions(),
      api.getCompanies(),
    ])
      .then(([statsData, txData, companiesData]) => {
        setStats(statsData)
        setTransactions(txData)
        setCompanies(companiesData)
      })
      .catch((e) => setError(e.message))
  }, [])

  const maxTop = Math.max(1, ...(stats?.topOffers || []).map((item) => item.count))

  return (
    <div className="space-y-6">
      {error && <div className="card p-4 text-red-600 text-sm">{error}</div>}

      {stats && (
        <div className="grid md:grid-cols-4 gap-3">
          {[
            ['Компании', stats.totalCompanies],
            ['Сотрудники', stats.totalEmployees],
            ['Заявки', stats.totalApplications],
            ['Одобрено', stats.approvedApplications],
          ].map(([label, value]) => (
            <div key={label} className="card p-4">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="text-3xl font-semibold mt-2 text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Компании</h3>
          <div className="space-y-2">
            {companies.map((company) => (
              <div key={company.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <img src={company.logoUrl} alt="" className="w-8 h-8 rounded object-cover" />
                  <span className="text-sm font-medium">{company.name}</span>
                </div>
                <span className="text-sm text-slate-400">{company.employeeCount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Топ льгот</h3>
          <div className="space-y-3">
            {(stats?.topOffers || []).map((item) => (
              <div key={item.title}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{item.title}</span>
                  <span className="text-blue-600 font-medium">{item.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${(item.count / maxTop) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {(stats?.topOffers || []).length === 0 && (
              <p className="text-slate-400 text-sm">Нет данных</p>
            )}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold">Транзакции</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Сотрудник</th>
              <th className="px-5 py-3 font-medium">Компания</th>
              <th className="px-5 py-3 font-medium">Сумма</th>
              <th className="px-5 py-3 font-medium">Описание</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t border-slate-100">
                <td className="px-5 py-3">{tx.employeeName}</td>
                <td className="px-5 py-3 text-slate-500">{tx.companyName}</td>
                <td className="px-5 py-3 text-blue-600 font-medium">-{formatPoints(tx.amount)}</td>
                <td className="px-5 py-3 text-slate-400">{tx.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p className="px-5 py-6 text-slate-400 text-sm">Транзакций пока нет</p>
        )}
      </div>
    </div>
  )
}
