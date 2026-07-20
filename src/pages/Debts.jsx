import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  DollarSign,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  X,
  Eye
} from 'lucide-react';

function Debts() {
  const { api } = useApp();
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [payAmount, setPayAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    fetchDebts();
    fetchSummary();
  }, [filter]);

  const fetchDebts = async () => {
    try {
      const response = await api.getDebts(filter === 'all' ? '' : filter);
      setDebts(response.data || []);
    } catch (error) {
      console.error('Error fetching debts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.getDebtSummary();
      setSummary(response);
    } catch (error) {
      console.error('Error fetching summary:', error);
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

  const handlePayDebt = (debt) => {
    setSelectedDebt(debt);
    setPayAmount(debt.remaining_amount);
    setShowPayModal(true);
  };

  const handleSubmitPayment = async () => {
    try {
      await api.payDebt(selectedDebt.id, {
        amount: payAmount,
        payment_method: paymentMethod
      });
      setShowPayModal(false);
      fetchDebts();
      fetchSummary();
    } catch (error) {
      console.error('Error paying debt:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-orange-600" />
            Quản lý Công nợ
          </h1>
          <p className="text-gray-500">Theo dõi và thu tiền công nợ từ khách hàng</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tổng công nợ</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {formatCurrency(summary?.total_debt || 0)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Số công nợ chưa thanh toán</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {summary?.pending_debts || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Đã thanh toán (tháng)</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock size={18} className="inline mr-2" />
            Chưa thanh toán
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckCircle size={18} className="inline mr-2" />
            Đã thanh toán
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
        </div>
      </div>

      {/* Debts List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Khách hàng</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Hóa đơn</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Tổng nợ</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Đã trả</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Còn nợ</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Trạng thái</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : debts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Không có công nợ nào</p>
                  </td>
                </tr>
              ) : (
                debts.map(debt => (
                  <tr key={debt.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{debt.customer_name}</p>
                      <p className="text-sm text-gray-500">{debt.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-green-600 font-medium">{debt.invoice_number}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(debt.amount)}</td>
                    <td className="px-4 py-3 text-right text-blue-600">{formatCurrency(debt.paid_amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${
                        debt.remaining_amount > 0 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(debt.remaining_amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {debt.status === 'paid' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                          <CheckCircle size={14} className="mr-1" />
                          Đã thanh toán
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                          <Clock size={14} className="mr-1" />
                          Chưa thanh toán
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {debt.status === 'pending' && debt.remaining_amount > 0 && (
                        <button
                          onClick={() => handlePayDebt(debt)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
                        >
                          <DollarSign size={16} />
                          Thu tiền
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Debt Modal */}
      {showPayModal && selectedDebt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">Thu tiền công nợ</h3>
              <button onClick={() => setShowPayModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Customer Info */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedDebt.customer_name}</p>
                <p className="text-sm text-gray-500">Hóa đơn: {selectedDebt.invoice_number}</p>
              </div>

              {/* Amount Info */}
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <p className="text-gray-600">Số tiền còn nợ</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatCurrency(selectedDebt.remaining_amount)}
                </p>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền thanh toán
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border rounded-lg text-lg"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setPayAmount(selectedDebt.remaining_amount)}
                    className="flex-1 py-1 text-sm border rounded hover:bg-gray-50"
                  >
                    Thanh toán đủ
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình thức thanh toán
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-lg border ${
                      paymentMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    Tiền mặt
                  </button>
                  <button
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-3 rounded-lg border ${
                      paymentMethod === 'transfer' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    Chuyển khoản
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitPayment}
                  disabled={payAmount <= 0}
                  className={`flex-1 py-3 rounded-lg font-medium ${
                    payAmount > 0 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  Xác nhận thu tiền
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Debts;
