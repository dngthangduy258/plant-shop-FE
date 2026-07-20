import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  Clock,
  Users,
  ArrowRight
} from 'lucide-react';

function Dashboard() {
  const { api } = useApp();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const result = await api.getDashboard();
      setData(result);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
        <p className="text-gray-500">Xem nhanh tình hình kinh doanh hôm nay</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Doanh thu hôm nay</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(data?.today?.total)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-gray-500">{data?.today?.count || 0} đơn hàng</span>
            {data?.today?.debt > 0 && (
              <span className="text-orange-500 flex items-center gap-1">
                <AlertTriangle size={14} />
                {formatCurrency(data?.today?.debt)} nợ
              </span>
            )}
          </div>
        </div>

        {/* Month Sales */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Doanh thu tháng này</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(data?.month?.total)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-gray-500">{data?.month?.count || 0} đơn hàng</span>
          </div>
        </div>

        {/* Total Debt */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tổng công nợ</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {formatCurrency(data?.total_debt)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <button
            onClick={() => navigate('/debts')}
            className="mt-3 text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            Xem chi tiết <ArrowRight size={14} />
          </button>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Sản phẩm sắp hết</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {data?.low_stock?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Package className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <button
            onClick={() => navigate('/products?low_stock=true')}
            className="mt-3 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            Xem ngay <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Sản phẩm sắp hết hàng
            </h2>
            <button
              onClick={() => navigate('/products')}
              className="text-sm text-green-600 hover:text-green-700"
            >
              Xem tất cả
            </button>
          </div>
          {data?.low_stock?.length > 0 ? (
            <div className="space-y-3">
              {data.low_stock.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Mã: {item.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{item.stock} cái</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.selling_price)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Không có sản phẩm sắp hết hàng</p>
            </div>
          )}
        </div>

        {/* Expiring Products */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" />
              Sản phẩm sắp hết hạn
            </h2>
          </div>
          {data?.expiring_products?.length > 0 ? (
            <div className="space-y-3">
              {data.expiring_products.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Lô: {item.batch_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{formatDate(item.expiry_date)}</p>
                    <p className="text-sm text-gray-500">{item.quantity} cái</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Không có sản phẩm sắp hết hạn</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-500" />
            Đơn hàng gần đây
          </h2>
          <button
            onClick={() => navigate('/invoices')}
            className="text-sm text-green-600 hover:text-green-700"
          >
            Xem tất cả
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3 px-2 text-sm font-medium text-gray-500">Mã HD</th>
                <th className="py-3 px-2 text-sm font-medium text-gray-500">Khách hàng</th>
                <th className="py-3 px-2 text-sm font-medium text-gray-500 text-right">Tổng tiền</th>
                <th className="py-3 px-2 text-sm font-medium text-gray-500 text-right">Thanh toán</th>
                <th className="py-3 px-2 text-sm font-medium text-gray-500 text-right">Còn nợ</th>
                <th className="py-3 px-2 text-sm font-medium text-gray-500">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {data?.recent_invoices?.length > 0 ? (
                data.recent_invoices.slice(0, 5).map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-green-600">
                      {invoice.invoice_number}
                    </td>
                    <td className="py-3 px-2">{invoice.customer_name || 'Khách lẻ'}</td>
                    <td className="py-3 px-2 text-right font-semibold">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="py-3 px-2 text-right text-blue-600">
                      {formatCurrency(invoice.paid_amount)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {invoice.debt_amount > 0 ? (
                        <span className="text-orange-600">{formatCurrency(invoice.debt_amount)}</span>
                      ) : (
                        <span className="text-green-600">-</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-gray-500 text-sm">
                      {formatDate(invoice.invoice_date)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
