const TOKEN_KEY = 'agristack_token'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const token = getStoredToken()
  const headers = { ...(options.headers || {}) }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(path, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

function toQuery(params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v && v !== 'All') qs.set(k, v)
  })
  const str = qs.toString()
  return str ? `?${str}` : ''
}

export const api = {
  auth: {
    login: (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    register: (payload) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
    demoLogin: (role) => request('/api/auth/demo-login', { method: 'POST', body: JSON.stringify({ role }) }),
    me: () => request('/api/auth/me'),
  },
  farmer: {
    dashboard: () => request('/api/farmer/dashboard'),
    createCropPlan: (payload) => request('/api/farmer/crop-plan', { method: 'POST', body: JSON.stringify(payload) }),
    updateCropPlan: (id, payload) => request(`/api/farmer/crop-plan/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    commitDemand: (payload) => request('/api/farmer/commit-demand', { method: 'POST', body: JSON.stringify(payload) }),
    recommendations: () => request('/api/farmer/recommendations'),
  },
  government: {
    cropData: (filters) => request(`/api/government/crop-data${toQuery(filters)}`),
    uploadManual: (payload) => request('/api/government/upload', { method: 'POST', body: JSON.stringify(payload) }),
    uploadFile: (formData) => request('/api/government/upload', { method: 'POST', body: formData }),
    syncExternal: (payload) => request('/api/government/sync-external', { method: 'POST', body: JSON.stringify(payload) }),
  },
  company: {
    dashboard: () => request('/api/company/dashboard'),
    addSeedSale: (payload) => request('/api/company/seed-sales', { method: 'POST', body: JSON.stringify(payload) }),
    addInventory: (payload) => request('/api/company/inventory', { method: 'POST', body: JSON.stringify(payload) }),
  },
  consumer: {
    dashboard: () => request('/api/consumer/dashboard'),
    postDemand: (payload) => request('/api/consumer/demand', { method: 'POST', body: JSON.stringify(payload) }),
    placeOrder: (payload) => request('/api/consumer/orders', { method: 'POST', body: JSON.stringify(payload) }),
    updateOrderStatus: (id, status) => request(`/api/consumer/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },
  market: {
    publicOverview: () => request('/api/market/public-overview'),
    productionForecast: (filters) => request(`/api/market/production-forecast${toQuery(filters)}`),
    demandForecast: (filters) => request(`/api/market/demand-forecast${toQuery(filters)}`),
    supplyDemand: (filters) => request(`/api/market/supply-demand${toQuery(filters)}`),
    priceTrends: (filters) => request(`/api/market/price-trends${toQuery(filters)}`),
    priceProtection: (filters) => request(`/api/market/price-protection${toQuery(filters)}`),
    forecast90Days: (filters) => request(`/api/market/forecast-90-days${toQuery(filters)}`),
  },
  agent: {
    dashboard: () => request('/api/agent/dashboard'),
    verifyPlan: (payload) => request('/api/agent/verify', { method: 'POST', body: JSON.stringify(payload) }),
  },
  admin: {
    analytics: () => request('/api/admin/analytics'),
    verifyRecord: (payload) => request('/api/admin/verify-record', { method: 'POST', body: JSON.stringify(payload) }),
    runEngine: () => request('/api/admin/run-engine', { method: 'POST' }),
    toggleUser: (id) => request(`/api/admin/users/${id}/toggle`, { method: 'POST' }),
    addAlert: (payload) => request('/api/admin/alerts', { method: 'POST', body: JSON.stringify(payload) }),
  },
}
