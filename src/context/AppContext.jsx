import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    fetchInitialData();
  }, [fetchInitialData]);

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
    refreshData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
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
