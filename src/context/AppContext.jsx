import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { CheckCircle, XCircle, Loader, AlertCircle, X } from 'lucide-react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({ message, type, id: Date.now() });
    if (duration > 0) {
      setTimeout(() => setToast(null), duration);
    }
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [storeRes, categoriesRes, customersRes, productsRes] = await Promise.all([
        api.getStore(),
        api.getCategories(),
        api.getCustomers(),
        api.getProducts()
      ]);

      setStore(storeRes.data);
      setCategories(categoriesRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const sessionId = localStorage.getItem('session_id');
    if (sessionId) {
      try {
        const res = await api.getCurrentUser();
        if (res.success) {
          setUser(res.data);
          setIsAuthenticated(true);
          api.setSession(sessionId);
          fetchInitialData();
        } else {
          logout();
        }
      } catch (err) {
        logout();
      }
    } else {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const res = await api.login(username, password);
      if (res.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        api.setSession(res.data.session_id);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        fetchInitialData();
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (username, password, store_name, phone) => {
    try {
      const res = await api.register(username, password, store_name, phone);
      if (res.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        api.setSession(res.data.session_id);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        fetchInitialData();
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    api.setSession('');
    localStorage.removeItem('session_id');
    localStorage.removeItem('user');
  };

  const seedData = async () => {
    try {
      const res = await api.seedData();
      return res;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const refreshData = useCallback(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const value = {
    store,
    setStore,
    categories,
    setCategories,
    customers,
    setCustomers,
    products,
    setProducts,
    loading,
    error,
    api,
    refreshData,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    seedData,
    toast,
    showToast,
    hideToast
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] animate-slide-in">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            toast.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
            {toast.type === 'loading' && <Loader className="w-5 h-5 text-blue-600 animate-spin" />}
            {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600" />}
            <span className="font-medium">{toast.message}</span>
            <button onClick={hideToast} className="ml-2 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export default AppContext;
