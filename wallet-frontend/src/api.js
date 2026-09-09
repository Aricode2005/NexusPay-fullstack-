const API_BASE = 'http://localhost:3000';

/**
 * Centralized API client for NexusPay backend.
 * Handles auth token injection, 401/403 auto-logout, and error parsing.
 */
class ApiClient {
  constructor() {
    this.onUnauthorized = null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  headers(json = true) {
    const h = {};
    const token = this.getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    if (json) h['Content-Type'] = 'application/json';
    return h;
  }

  async request(method, path, body = null) {
    const url = `${API_BASE}${path}`;
    const opts = { method, headers: this.headers(!!body) };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);

    if ((res.status === 401 || res.status === 403) && this.onUnauthorized) {
      this.onUnauthorized();
      throw new Error('Session expired. Please login again.');
    }

    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || data.message || 'Request failed');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  // ─── Auth ─────────────────────────────────────────
  register(payload) {
    return this.request('POST', '/api/v1/auth/register', payload);
  }

  login(email, password) {
    return this.request('POST', '/api/v1/auth/login', { email, password });
  }

  // ─── Profile ──────────────────────────────────────
  getProfile() {
    return this.request('GET', '/api/ai/me');
  }

  // ─── Handles / Bank Accounts ──────────────────────
  getHandles() {
    return this.request('GET', '/api/v1/handles');
  }

  createHandle(payload) {
    return this.request('POST', '/api/v1/handles', payload);
  }

  setPrimary(handleId) {
    return this.request('PUT', '/api/v1/handles/set-primary', { handleId });
  }

  // ─── Transactions ────────────────────────────────
  createIntent(payload) {
    return this.request('POST', '/api/v1/transactions/intent', payload);
  }

  executeTransfer(order_id, mpin) {
    return this.request('POST', '/api/v1/transactions/execute', { order_id, mpin });
  }

  getHistory() {
    return this.request('GET', '/api/v1/transactions/history');
  }

  // ─── Notifications ───────────────────────────────
  getNotifications() {
    return this.request('GET', '/api/v1/notifications');
  }

  // ─── AI Chat ─────────────────────────────────────
  chat(query) {
    return this.request('POST', '/api/ai/chat', { query });
  }

  // ─── Fraud / Security ────────────────────────────
  getFraudStatus() {
    return this.request('GET', '/api/v1/transactions/fraud/status');
  }

  // ─── Health ──────────────────────────────────────
  healthCheck() {
    return this.request('GET', '/health');
  }
}

const api = new ApiClient();
export default api;
