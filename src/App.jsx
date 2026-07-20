import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import Debts from './pages/Debts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="pos" element={<POS />} />
            <Route path="products" element={<Products />} />
            <Route path="customers" element={<Customers />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="debts" element={<Debts />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
