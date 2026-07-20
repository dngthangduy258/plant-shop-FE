// API Configuration
// Update this to your Cloudflare Workers API URL after deployment
const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
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
}

export const api = new ApiClient(API_BASE);
export default api;
