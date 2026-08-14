import { Platform } from 'react-native'
import Constants from 'expo-constants'

function resolveBaseUrl() {
  const hostUri = Constants.expoConfig?.hostUri || ''
  const host = hostUri.replace(/^https?:\/\//, '').split(':')[0]
  const loopback = !host || host === 'localhost' || host === '127.0.0.1'

  if (Platform.OS === 'android' && loopback) {
    return 'http://10.0.2.2:8080'
  }
  if (!loopback) {
    return `http://${host}:8080`
  }
  return 'http://localhost:8080'
}

const API_BASE = resolveBaseUrl()

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
    throw new Error(body.error || `Ошибка ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  return response
}

export const api = {
  getEmployee: (id) => request(`/api/employees/${id}`),
  getCatalog: (category) => request(category ? `/api/catalog?category=${category}` : '/api/catalog'),
  createApplication: (body) => request('/api/applications', { method: 'POST', body: JSON.stringify(body) }),
  getApplications: (employeeId) => request(`/api/applications?employeeId=${employeeId}`),
  getQrUrl: (id) => `${API_BASE}/api/applications/${id}/qr`,
  getAdminStats: () => request('/api/admin/stats'),
  getTransactions: () => request('/api/admin/transactions'),
  getCompanies: () => request('/api/companies'),
}
