import { useEffect, useState } from 'react'
import EmployeePage from './pages/EmployeePage'
import MerchantPage from './pages/MerchantPage'
import AdminPage from './pages/AdminPage'

const ROLES = [
  { id: 'employee', label: 'Сотрудник' },
  { id: 'merchant', label: 'Мерчант' },
  { id: 'admin', label: 'Админ' },
]

export default function App() {
  const [role, setRole] = useState('employee')
  const [companyId, setCompanyId] = useState(1)
  const [employeeId, setEmployeeId] = useState(1)

  useEffect(() => {
    document.title = 'Click Benefits'
  }, [])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-600 text-white text-sm font-semibold grid place-items-center">
              C
            </div>
            <div>
              <h1 className="text-slate-900 text-base font-semibold leading-none">Benefits</h1>
              <p className="text-slate-400 text-xs mt-1">Click</p>
            </div>
          </div>
          <nav className="flex gap-1">
            {ROLES.map((item) => (
              <button
                key={item.id}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  role === item.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
                onClick={() => setRole(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {role === 'employee' && (
          <EmployeePage
            companyId={companyId}
            employeeId={employeeId}
            onCompanyChange={setCompanyId}
            onEmployeeChange={setEmployeeId}
          />
        )}
        {role === 'merchant' && <MerchantPage />}
        {role === 'admin' && <AdminPage />}
      </main>
    </div>
  )
}
