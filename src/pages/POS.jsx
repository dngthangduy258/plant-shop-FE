import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  Printer,
  CreditCard,
  Banknote,
  QrCode,
  X,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';

function POS() {
  const { api, categories, products: allProducts, customers } = useApp();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerList, setCustomerList] = useState([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'cash',
    paid_amount: 0,
    note: ''
  });
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    const data = await api.getProducts();
    setProducts(data);
  };

  const fetchCustomers = async () => {
    const data = await api.getCustomers();
    setCustomerList(data);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = !selectedCategory || p.category_id === selectedCategory;
    return matchSearch && matchCategory;
  });

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const batch = product.batches?.find(b => b.quantity > 0);
      setCart([...cart, {
        product_id: product.id,
        product_code: product.code,
        product_name: product.name,
        batch_id: batch?.id,
        unit: product.unit,
        quantity: 1,
        unit_price: product.selling_price,
        tax_rate: product.tax_rate || 10,
        discount_amount: 0
      }]);
    }
  };

  const updateQuantity = (index, delta) => {
    const newQuantity = cart[index].quantity + delta;
    if (newQuantity <= 0) {
      removeItem(index);
    } else {
      setCart(cart.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateItemDiscount = (index, discount) => {
    setCart(cart.map((item, i) =>
      i === index ? { ...item, discount_amount: discount } : item
    ));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;

    cart.forEach(item => {
      const itemSubtotal = item.quantity * item.unit_price - (item.discount_amount || 0);
      const itemTax = itemSubtotal * (item.tax_rate || 10) / 100;
      subtotal += itemSubtotal;
      totalTax += itemTax;
    });

    const total = subtotal + totalTax;
    return { subtotal, totalTax, total };
  };

  const { subtotal, totalTax, total } = calculateTotals();

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
    setCustomerSearch('');
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name) return;
    const customer = await api.createCustomer(newCustomer);
    setCustomerList([...customerList, customer]);
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
    setNewCustomer({ name: '', phone: '', address: '' });
  };

  const handlePayment = async () => {
    if (cart.length === 0) return;

    setPaymentInfo({ ...paymentInfo, paid_amount: total });

    const invoice = await api.createInvoice({
      customer_id: selectedCustomer?.id,
      customer_name: selectedCustomer?.name || 'Khách lẻ',
      customer_phone: selectedCustomer?.phone,
      customer_address: selectedCustomer?.address,
      items: cart,
      discount_amount: 0,
      payment_method: paymentInfo.method,
      paid_amount: paymentInfo.paid_amount,
      note: paymentInfo.note
    });

    setCreatedInvoice(invoice);
    setShowPaymentModal(false);
    setShowInvoiceModal(true);
    fetchProducts(); // Refresh stock
  };

  const handleNewSale = () => {
    setCart([]);
    setSelectedCustomer(null);
    setCreatedInvoice(null);
    setShowInvoiceModal(false);
  };

  const handleQuickPrint = () => {
    window.print();
  };

  const filteredCustomers = customerList.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  );

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart className="w-7 h-7 text-green-600" />
          Bán hàng
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCustomerModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <User size={18} />
            {selectedCustomer ? selectedCustomer.name : 'Chọn khách hàng'}
          </button>
        </div>
      </div>

      {/* POS Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Product Grid */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Search & Categories */}
          <div className="p-4 border-b">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm sản phẩm (tên hoặc mã)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  !selectedCategory ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                    selectedCategory === cat.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map(product => {
                  const stock = product.total_stock || 0;
                  const isLowStock = stock <= 10;
                  const isOutOfStock = stock <= 0;

                  return (
                    <button
                      key={product.id}
                      onClick={() => !isOutOfStock && addToCart(product)}
                      disabled={isOutOfStock}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        isOutOfStock
                          ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                          : 'bg-white border-gray-200 hover:border-green-500 hover:shadow-md'
                      }`}
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">📦</span>
                        )}
                      </div>
                      <p className="font-medium text-gray-800 text-sm line-clamp-2">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.code}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-semibold text-green-600">
                          {formatCurrency(product.selling_price)}
                        </span>
                        <span className={`text-xs ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-gray-500'}`}>
                          {isOutOfStock ? 'Hết hàng' : `Còn ${stock}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Không tìm thấy sản phẩm nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart Panel */}
        <div className="bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingCart size={18} />
              Giỏ hàng ({cart.length})
            </h2>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length > 0 ? (
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">{item.product_name}</p>
                        <p className="text-xs text-gray-500">{item.product_code}</p>
                        <p className="text-sm text-green-600 mt-1">
                          {formatCurrency(item.unit_price)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          {formatCurrency((item.quantity * item.unit_price) - (item.discount_amount || 0))}
                        </p>
                        {item.tax_rate > 0 && (
                          <p className="text-xs text-gray-500">Thuế: {formatCurrency((item.quantity * item.unit_price - (item.discount_amount || 0)) * item.tax_rate / 100)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Giỏ hàng trống</p>
              </div>
            )}
          </div>

          {/* Totals & Actions */}
          <div className="border-t p-4 bg-gray-50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thuế (VAT {cart[0]?.tax_rate || 10}%):</span>
                <span className="font-medium">{formatCurrency(totalTax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Tổng cộng:</span>
                <span className="text-green-600">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={cart.length === 0}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                  cart.length === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Banknote size={20} />
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">Chọn khách hàng</h3>
              <button onClick={() => setShowCustomerModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="Tìm khách hàng..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {/* Customer List */}
              <div className="space-y-2 mb-4">
                {filteredCustomers.slice(0, 10).map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
                  >
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                    {customer.total_debt > 0 && (
                      <p className="text-sm text-orange-500">Nợ: {formatCurrency(customer.total_debt)}</p>
                    )}
                  </button>
                ))}
              </div>

              {/* Add New Customer */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Thêm khách hàng mới</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tên khách hàng *"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Số điện thoại"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Địa chỉ"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <button
                    onClick={handleCreateCustomer}
                    disabled={!newCustomer.name}
                    className={`w-full py-2 rounded-lg font-medium ${
                      newCustomer.name ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    Thêm khách hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">Thanh toán</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Customer Info */}
              {selectedCustomer && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                </div>
              )}

              {/* Total */}
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-gray-600">Tổng cộng</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(total)}</p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hình thức thanh toán</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentInfo({ ...paymentInfo, method: 'cash' })}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${
                      paymentInfo.method === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <Banknote size={24} />
                    <span className="text-sm">Tiền mặt</span>
                  </button>
                  <button
                    onClick={() => setPaymentInfo({ ...paymentInfo, method: 'transfer' })}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${
                      paymentInfo.method === 'transfer' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <Banknote size={24} />
                    <span className="text-sm">Chuyển khoản</span>
                  </button>
                  <button
                    onClick={() => setPaymentInfo({ ...paymentInfo, method: 'qr' })}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${
                      paymentInfo.method === 'qr' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <QrCode size={24} />
                    <span className="text-sm">QR Code</span>
                  </button>
                </div>
              </div>

              {/* Paid Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền khách đã trả
                </label>
                <input
                  type="number"
                  value={paymentInfo.paid_amount}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, paid_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg text-lg"
                />
                {paymentInfo.paid_amount < total && paymentInfo.paid_amount > 0 && (
                  <p className="text-sm text-orange-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    Khách còn nợ: {formatCurrency(total - paymentInfo.paid_amount)}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPaymentInfo({ ...paymentInfo, paid_amount: total });
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Trả đủ
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && createdInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h3>
              <p className="text-gray-500 mb-4">
                Mã hóa đơn: <span className="font-semibold text-green-600">{createdInvoice.invoice_number}</span>
              </p>

              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="font-medium">{formatCurrency(createdInvoice.total_amount)}</span>
                </div>
                {createdInvoice.debt_amount > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Còn nợ:</span>
                    <span className="font-medium">{formatCurrency(createdInvoice.debt_amount)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleNewSale}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Bán hàng mới
                </button>
                <button
                  onClick={handleQuickPrint}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  In hóa đơn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default POS;
