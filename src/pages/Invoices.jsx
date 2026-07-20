import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Search,
  Eye,
  Printer,
  Download,
  Filter,
  ChevronDown
} from 'lucide-react';

function Invoices() {
  const { api } = useApp();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });
  const [showFilter, setShowFilter] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [dateRange]);

  const fetchInvoices = async () => {
    try {
      const params = {};
      if (dateRange.start_date) params.start_date = dateRange.start_date;
      if (dateRange.end_date) params.end_date = dateRange.end_date;
      const data = await api.getInvoices(params);
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
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
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetail = async (invoice) => {
    const detail = await api.getInvoice(invoice.id);
    setSelectedInvoice(detail);
    setShowDetailModal(true);
  };

  const handlePrint = (invoice) => {
    handleViewDetail(invoice);
  };

  const handleSetDateFilter = (type) => {
    const today = new Date();
    let start, end;

    switch (type) {
      case 'today':
        start = end = today.toISOString().split('T')[0];
        break;
      case 'week':
        const dayOfWeek = today.getDay();
        start = new Date(today.setDate(today.getDate() - dayOfWeek)).toISOString().split('T')[0];
        end = new Date().toISOString().split('T')[0];
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        end = new Date().toISOString().split('T')[0];
        break;
      case 'all':
        start = end = '';
        break;
    }

    setDateRange({ start_date: start, end_date: end });
  };

  // Calculate summary
  const summary = invoices.reduce((acc, inv) => {
    acc.total += inv.total_amount;
    acc.paid += inv.paid_amount;
    acc.debt += inv.debt_amount;
    acc.count += 1;
    return acc;
  }, { total: 0, paid: 0, debt: 0, count: 0 });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-7 h-7 text-green-600" />
            Quản lý Hóa đơn
          </h1>
          <p className="text-gray-500">Xem và in hóa đơn bán hàng</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-gray-500 text-sm">Tổng số hóa đơn</p>
          <p className="text-2xl font-bold text-gray-800">{summary.count}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-gray-500 text-sm">Tổng doanh thu</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.total)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-gray-500 text-sm">Đã thanh toán</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.paid)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-gray-500 text-sm">Còn nợ</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.debt)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm hóa đơn (mã, khách hàng)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSetDateFilter('today')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hôm nay
            </button>
            <button
              onClick={() => handleSetDateFilter('week')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Tuần này
            </button>
            <button
              onClick={() => handleSetDateFilter('month')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Tháng này
            </button>
            <button
              onClick={() => handleSetDateFilter('all')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Tất cả
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Mã HD</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Khách hàng</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Tổng tiền</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Giảm giá</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Thuế</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Thanh toán</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Còn nợ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ngày</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Không có hóa đơn nào</p>
                  </td>
                </tr>
              ) : (
                invoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-green-600">{invoice.invoice_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{invoice.customer_name || 'Khách lẻ'}</p>
                      <p className="text-sm text-gray-500">{invoice.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(invoice.subtotal)}</td>
                    <td className="px-4 py-3 text-right text-red-600">{formatCurrency(invoice.discount_amount)}</td>
                    <td className="px-4 py-3 text-right text-blue-600">{formatCurrency(invoice.tax_amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-medium text-gray-800">{formatCurrency(invoice.total_amount)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {invoice.debt_amount > 0 ? (
                        <span className="font-semibold text-orange-600">{formatCurrency(invoice.debt_amount)}</span>
                      ) : (
                        <span className="text-green-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{formatDate(invoice.invoice_date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(invoice)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="In hóa đơn"
                        >
                          <Printer size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {showDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">Chi tiết hóa đơn</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Printer size={18} />
                  In
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {/* Invoice Header */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">HÓA ĐƠN BÁN HÀNG</h2>
                <p className="text-gray-500">{selectedInvoice.invoice_number}</p>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <p><strong>Khách hàng:</strong> {selectedInvoice.customer_name || 'Khách lẻ'}</p>
                {selectedInvoice.customer_phone && <p><strong>Điện thoại:</strong> {selectedInvoice.customer_phone}</p>}
                {selectedInvoice.customer_address && <p><strong>Địa chỉ:</strong> {selectedInvoice.customer_address}</p>}
                <p><strong>Ngày:</strong> {formatDate(selectedInvoice.invoice_date)}</p>
              </div>

              {/* Items */}
              <table className="w-full mb-6 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-2 text-left">Sản phẩm</th>
                    <th className="py-2 px-2 text-right">SL</th>
                    <th className="py-2 px-2 text-right">Đơn giá</th>
                    <th className="py-2 px-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items?.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-2">
                        <p>{item.product_name}</p>
                        <p className="text-xs text-gray-500">Mã: {item.product_code}</p>
                      </td>
                      <td className="py-2 px-2 text-right">{item.quantity}</td>
                      <td className="py-2 px-2 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="py-2 px-2 text-right">{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Giảm giá:</span>
                  <span className="text-red-600">-{formatCurrency(selectedInvoice.discount_amount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Thuế VAT:</span>
                  <span className="text-blue-600">{formatCurrency(selectedInvoice.tax_amount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>TỔNG CỘNG:</span>
                  <span className="text-green-600">{formatCurrency(selectedInvoice.total_amount)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Đã thanh toán:</span>
                  <span className="text-blue-600">{formatCurrency(selectedInvoice.paid_amount)}</span>
                </div>
                {selectedInvoice.debt_amount > 0 && (
                  <div className="flex justify-between text-orange-600 font-semibold">
                    <span>Còn nợ:</span>
                    <span>{formatCurrency(selectedInvoice.debt_amount)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invoices;
