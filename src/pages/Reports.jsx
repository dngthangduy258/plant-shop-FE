import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  FileText,
  PieChart
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

function Reports() {
  const { api } = useApp();
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });
  const [salesData, setSalesData] = useState([]);
  const [taxData, setTaxData] = useState({ invoices: [], summary: null });
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default date range to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateRange({
      start_date: firstDay.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0]
    });
  }, []);

  useEffect(() => {
    if (dateRange.start_date && dateRange.end_date) {
      fetchData();
    }
  }, [dateRange, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      };

      switch (activeTab) {
        case 'sales':
          const sales = await api.getSalesReport(params);
          setSalesData(sales);
          break;
        case 'tax':
          const tax = await api.getTaxReport(params);
          setTaxData(tax);
          break;
        case 'products':
          const products = await api.getProductReport(params);
          setProductData(products);
          break;
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
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
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
        end = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        end = new Date().toISOString().split('T')[0];
        break;
    }

    setDateRange({ start_date: start, end_date: end });
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => row[h]).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${dateRange.start_date}_${dateRange.end_date}.csv`;
    link.click();
  };

  const tabs = [
    { id: 'sales', label: 'Doanh thu', icon: TrendingUp },
    { id: 'tax', label: 'Báo cáo thuế', icon: FileText },
    { id: 'products', label: 'Sản phẩm', icon: PieChart }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-green-600" />
            Báo cáo & Thống kê
          </h1>
          <p className="text-gray-500">Xem báo cáo doanh thu, thuế và sản phẩm</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
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
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 bg-green-50 border-green-500 text-green-700"
            >
              Tháng này
            </button>
            <button
              onClick={() => handleSetDateFilter('lastMonth')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Tháng trước
            </button>
            <button
              onClick={() => handleSetDateFilter('year')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Năm nay
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <span className="text-gray-500">đến</span>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Sales Report */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Tổng doanh thu</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(salesData.reduce((sum, d) => sum + d.total, 0))}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Đã thanh toán</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(salesData.reduce((sum, d) => sum + d.paid, 0))}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Còn nợ</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(salesData.reduce((sum, d) => sum + d.debt, 0))}
                  </p>
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Số hóa đơn</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {salesData.reduce((sum, d) => sum + d.invoice_count, 0)}
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Biểu đồ doanh thu theo ngày</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(d) => formatDate(d)} />
                      <YAxis tickFormatter={(v) => `${v / 1000000}M`} />
                      <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(d) => formatDate(d)} />
                      <Bar dataKey="total" fill="#22c55e" name="Doanh thu" />
                      <Bar dataKey="paid" fill="#3b82f6" name="Đã thanh toán" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <h3 className="font-semibold">Chi tiết doanh thu theo ngày</h3>
                  <button
                    onClick={() => exportToCSV(salesData, 'sales_report')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Download size={18} />
                    Xuất Excel
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ngày</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Số hóa đơn</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Doanh thu</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Giảm giá</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Thuế</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Tổng cộng</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Còn nợ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {salesData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{formatDate(row.date)}</td>
                          <td className="px-4 py-3 text-right">{row.invoice_count}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(row.subtotal)}</td>
                          <td className="px-4 py-3 text-right text-red-600">{formatCurrency(row.discount)}</td>
                          <td className="px-4 py-3 text-right text-blue-600">{formatCurrency(row.tax)}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.total)}</td>
                          <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(row.debt)}</td>
                        </tr>
                      ))}
                    </tbody>
                    {salesData.length > 0 && (
                      <tfoot className="bg-gray-50 font-semibold">
                        <tr>
                          <td className="px-4 py-3">Tổng cộng</td>
                          <td className="px-4 py-3 text-right">
                            {salesData.reduce((sum, d) => sum + d.invoice_count, 0)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(salesData.reduce((sum, d) => sum + d.subtotal, 0))}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(salesData.reduce((sum, d) => sum + d.discount, 0))}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(salesData.reduce((sum, d) => sum + d.tax, 0))}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(salesData.reduce((sum, d) => sum + d.total, 0))}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(salesData.reduce((sum, d) => sum + d.debt, 0))}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tax Report */}
          {activeTab === 'tax' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Tổng hóa đơn</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {taxData.summary?.total_invoices || 0}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Doanh thu (chưa VAT)</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(taxData.summary?.total_subtotal || 0)}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Thuế GTGT</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(taxData.summary?.total_tax || 0)}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Tổng cộng (có VAT)</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(taxData.summary?.total_amount || 0)}
                  </p>
                </div>
              </div>

              {/* Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <h3 className="font-semibold">Chi tiết hóa đơn có thuế</h3>
                  <button
                    onClick={() => exportToCSV(taxData.invoices, 'tax_report')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Download size={18} />
                    Xuất Excel
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ngày</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Mã hóa đơn</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Khách hàng</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Giá trị</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Thuế 10%</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Tổng cộng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {taxData.invoices?.map((inv, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{formatDate(inv.date)}</td>
                          <td className="px-4 py-3 font-medium text-green-600">{inv.invoice_number}</td>
                          <td className="px-4 py-3">{inv.customer_name || 'Khách lẻ'}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(inv.subtotal)}</td>
                          <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(inv.tax_amount)}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(inv.total_amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Products Report */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Chart */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Top 10 sản phẩm bán chạy</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productData.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(v) => `${v / 1000000}M`} />
                      <YAxis type="category" dataKey="product_name" width={150} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="total_sales" fill="#22c55e" name="Doanh số" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <h3 className="font-semibold">Chi tiết sản phẩm đã bán</h3>
                  <button
                    onClick={() => exportToCSV(productData, 'product_report')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Download size={18} />
                    Xuất Excel
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Mã SP</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tên sản phẩm</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Số lượng bán</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Giá TB</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Doanh số</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Thuế</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {productData.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600">{product.product_code}</td>
                          <td className="px-4 py-3 font-medium">{product.product_name}</td>
                          <td className="px-4 py-3 text-right">{product.total_quantity}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(product.avg_price)}</td>
                          <td className="px-4 py-3 text-right font-medium text-green-600">
                            {formatCurrency(product.total_sales)}
                          </td>
                          <td className="px-4 py-3 text-right text-orange-600">
                            {formatCurrency(product.total_tax)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
