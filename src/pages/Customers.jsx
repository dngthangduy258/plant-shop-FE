import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Plus,
  Search,
  Edit,
  X,
  Save,
  Phone,
  MapPin,
  DollarSign,
  Eye,
  ChevronDown
} from 'lucide-react';

function Customers() {
  const { api } = useApp();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    debt_limit: 0,
    note: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);

  const fetchCustomers = async () => {
    try {
      const data = await api.getCustomers(searchQuery);
      // Get debt info for each customer
      const customersWithDebt = await Promise.all(
        data.map(async (customer) => {
          const detail = await api.getCustomer(customer.id);
          return { ...customer, total_debt: detail.total_debt };
        })
      );
      setCustomers(customersWithDebt);
    } catch (error) {
      console.error('Error fetching customers:', error);
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

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setCustomerForm({
        name: customer.name,
        phone: customer.phone || '',
        address: customer.address || '',
        email: customer.email || '',
        debt_limit: customer.debt_limit || 0,
        note: customer.note || ''
      });
    } else {
      setEditingCustomer(null);
      setCustomerForm({
        name: '',
        phone: '',
        address: '',
        email: '',
        debt_limit: 0,
        note: ''
      });
    }
    setShowModal(true);
  };

  const handleSaveCustomer = async () => {
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, customerForm);
      } else {
        await api.createCustomer(customerForm);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleViewDetail = async (customer) => {
    const detail = await api.getCustomer(customer.id);
    setSelectedCustomer(detail);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-green-600" />
            Quản lý Khách hàng
          </h1>
          <p className="text-gray-500">Theo dõi thông tin và công nợ khách hàng</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={20} />
          Thêm khách hàng
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm khách hàng (tên, số điện thoại, mã)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Mã KH</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tên khách hàng</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Điện thoại</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Địa chỉ</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Công nợ</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Không có khách hàng nào</p>
                  </td>
                </tr>
              ) : (
                customers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-blue-600">{customer.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{customer.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {customer.phone && <span className="flex items-center gap-1"><Phone size={14} /> {customer.phone}</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {customer.address && <span className="flex items-center gap-1"><MapPin size={14} /> {customer.address}</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {customer.total_debt > 0 ? (
                        <span className="font-semibold text-orange-600">{formatCurrency(customer.total_debt)}</span>
                      ) : (
                        <span className="text-green-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(customer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(customer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit size={18} />
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

      {/* Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {editingCustomer ? 'Sửa khách hàng' : 'Thêm khách hàng mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
                <input
                  type="text"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hạn mức nợ</label>
                  <input
                    type="number"
                    value={customerForm.debt_limit}
                    onChange={(e) => setCustomerForm({ ...customerForm, debt_limit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={customerForm.note}
                  onChange={(e) => setCustomerForm({ ...customerForm, note: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveCustomer}
                  disabled={!customerForm.name}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                >
                  <Save size={18} className="inline mr-2" />
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">Chi tiết khách hàng</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-lg text-gray-800">{selectedCustomer.name}</h4>
                <p className="text-gray-600">{selectedCustomer.code}</p>
                <div className="mt-2 space-y-1 text-sm">
                  {selectedCustomer.phone && <p><Phone size={14} className="inline mr-2" />{selectedCustomer.phone}</p>}
                  {selectedCustomer.address && <p><MapPin size={14} className="inline mr-2" />{selectedCustomer.address}</p>}
                </div>
              </div>

              {/* Debt Summary */}
              <div className="bg-orange-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Tổng công nợ:</span>
                  <span className="text-xl font-bold text-orange-600">{formatCurrency(selectedCustomer.total_debt)}</span>
                </div>
              </div>

              {/* Recent Invoices */}
              <h4 className="font-semibold text-gray-800 mb-3">Lịch sử mua hàng</h4>
              {selectedCustomer.recent_invoices?.length > 0 ? (
                <div className="space-y-2">
                  {selectedCustomer.recent_invoices.map(invoice => (
                    <div key={invoice.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-600">{invoice.invoice_number}</p>
                          <p className="text-sm text-gray-500">{formatDate(invoice.invoice_date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(invoice.total_amount)}</p>
                          {invoice.debt_amount > 0 && (
                            <p className="text-sm text-orange-600">Nợ: {formatCurrency(invoice.debt_amount)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có lịch sử mua hàng</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
