const API_BASE = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response
}

export const api = {
  getCompanies: () => request('/api/companies'),
  getEmployees: (companyId) => request(`/api/employees?companyId=${companyId}`),
  getEmployee: (id) => request(`/api/employees/${id}`),
  getMerchants: () => request('/api/merchants'),
  getCatalog: (category) => request(category ? `/api/catalog?category=${category}` : '/api/catalog'),
  getOffer: (id) => request(`/api/catalog/${id}`),
  createApplication: (body) => request('/api/applications', { method: 'POST', body: JSON.stringify(body) }),
  getApplications: (employeeId) => request(`/api/applications?employeeId=${employeeId}`),
  getPendingApplications: (merchantId) => request(`/api/applications/pending?merchantId=${merchantId}`),
  approveApplication: (id) => request(`/api/applications/${id}/approve`, { method: 'POST' }),
  rejectApplication: (id) => request(`/api/applications/${id}/reject`, { method: 'POST' }),
  redeemApplication: (id) => request(`/api/applications/${id}/redeem`, { method: 'POST' }),
  getQrUrl: (id) => `${API_BASE}/api/applications/${id}/qr`,
  getAdminStats: () => request('/api/admin/stats'),
  getTransactions: () => request('/api/admin/transactions'),
}
