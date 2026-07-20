// API Configuration
// Update this to your Cloudflare Workers API URL after deployment
const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.sessionId = localStorage.getItem('session_id') || '';
  }

  setSession(sessionId) {
    this.sessionId = sessionId;
    if (sessionId) {
      localStorage.setItem('session_id', sessionId);
    } else {
      localStorage.removeItem('session_id');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...(this.sessionId && { 'X-Session-ID': this.sessionId }),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.error || 'Request failed');
        error.response = { status: response.status, data };
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products${query ? '?' + query : ''}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(data) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id, data) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, { method: 'DELETE' });
  }

  async addBatch(productId, data) {
    return this.request(`/products/${productId}/batches`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProductBatches(productId) {
    return this.request(`/products/${productId}/batches`);
  }

  // Customers
  async getCustomers(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/customers${query}`);
  }

  async getCustomer(id) {
    return this.request(`/customers/${id}`);
  }

  async createCustomer(data) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id, data) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Invoices
  async getInvoices(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/invoices${query ? '?' + query : ''}`);
  }

  async getInvoice(id) {
    return this.request(`/invoices/${id}`);
  }

  async createInvoice(data) {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Debts
  async getDebts(status = '') {
    const query = status ? `?status=${status}` : '';
    return this.request(`/debts${query}`);
  }

  async getDebtSummary() {
    return this.request('/debts/summary');
  }

  async getCustomerDebts(customerId, status = '') {
    const query = status ? `?status=${status}` : '';
    return this.request(`/debts/customer/${customerId}${query}`);
  }

  async payDebt(id, data) {
    return this.request(`/debts/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reports
  async getDashboard() {
    return this.request('/reports/dashboard');
  }

  async getSalesReport(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reports/sales${query ? '?' + query : ''}`);
  }

  async getTaxReport(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reports/tax${query ? '?' + query : ''}`);
  }

  async getProductReport(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reports/products${query ? '?' + query : ''}`);
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(data) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Store
  async getStore() {
    return this.request('/store');
  }

  async updateStore(data) {
    return this.request('/store', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Suppliers
  async getSuppliers() {
    return this.request('/store/suppliers');
  }

  async createSupplier(data) {
    return this.request('/store/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Auth
  async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(username, password, store_name, phone) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, store_name, phone }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Seed
  async seedData() {
    return this.request('/seed', { method: 'POST' });
  }

  async getSeedStatus() {
    return this.request('/seed');
  }
}

export const api = new ApiClient(API_BASE);
export default api;
