import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  Menu,
  X,
  Leaf
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Tổng quan' },
  { path: '/pos', icon: ShoppingCart, label: 'Bán hàng' },
  { path: '/products', icon: Package, label: 'Hàng hóa' },
  { path: '/customers', icon: Users, label: 'Khách hàng' },
  { path: '/invoices', icon: FileText, label: 'Hóa đơn' },
  { path: '/debts', icon: DollarSign, label: 'Công nợ' },
  { path: '/reports', icon: BarChart3, label: 'Báo cáo' },
  { path: '/settings', icon: Settings, label: 'Cài đặt' },
];

function Layout() {
  const { store } = useApp();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPOS = location.pathname === '/pos';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-green-600 rounded-lg transition"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <Leaf size={28} className="text-green-300" />
              <div>
                <h1 className="font-bold text-lg">{store?.name || 'Plant Shop POS'}</h1>
                <p className="text-xs text-green-200">{store?.address || 'Cửa hàng Thuốc BVTV'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm hidden sm:block">
              {new Date().toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <nav className="flex-1 py-4 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${isActive ? 'bg-green-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t">
              <div className="text-xs text-gray-500 text-center">
                Plant Shop POS v1.0
                <br />
                Cloudflare Edition
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 min-h-screen ${isPOS ? '' : 'lg:ml-64'} p-4`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
