import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  AlertTriangle,
  History,
  Box
} from 'lucide-react';

function Products() {
  const { api, categories } = useApp();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [batches, setBatches] = useState([]);
  const [productForm, setProductForm] = useState({
    code: '',
    name: '',
    category_id: '',
    unit: 'Cái',
    cost_price: 0,
    selling_price: 0,
    tax_rate: 10
  });
  const [batchForm, setBatchForm] = useState({
    batch_number: '',
    manufacturing_date: '',
    expiry_date: '',
    quantity: 0,
    cost_price: 0
  });

  const isLowStock = searchParams.get('low_stock') === 'true';

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, isLowStock]);

  const fetchProducts = async () => {
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category_id = selectedCategory;
      if (isLowStock) params.low_stock = 'true';
      const data = await api.getProducts(params);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
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

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        code: product.code,
        name: product.name,
        category_id: product.category_id,
        unit: product.unit,
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        tax_rate: product.tax_rate
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        code: '',
        name: '',
        category_id: categories[0]?.id || '',
        unit: 'Cái',
        cost_price: 0,
        selling_price: 0,
        tax_rate: 10
      });
    }
    setShowModal(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productForm);
      } else {
        await api.createProduct(productForm);
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await api.deleteProduct(id);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleOpenBatchModal = async (product) => {
    setSelectedProduct(product);
    const productBatches = await api.getProductBatches(product.id);
    setBatches(productBatches);
    setBatchForm({
      batch_number: '',
      manufacturing_date: '',
      expiry_date: '',
      quantity: 0,
      cost_price: product.cost_price
    });
    setShowBatchModal(true);
  };

  const handleSaveBatch = async () => {
    try {
      await api.addBatch(selectedProduct.id, batchForm);
      const productBatches = await api.getProductBatches(selectedProduct.id);
      setBatches(productBatches);
      fetchProducts();
      setBatchForm({
        batch_number: '',
        manufacturing_date: '',
        expiry_date: '',
        quantity: 0,
        cost_price: selectedProduct.cost_price
      });
    } catch (error) {
      console.error('Error saving batch:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-7 h-7 text-green-600" />
            Quản lý Hàng hóa
          </h1>
          <p className="text-gray-500">Thêm, sửa, xóa sản phẩm và quản lý lô hàng</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={20} />
          Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm sản phẩm (tên, mã)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tất cả nhóm hàng</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {isLowStock && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
              <AlertTriangle size={18} />
              Đang lọc: Sản phẩm sắp hết hàng
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Mã</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tên sản phẩm</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nhóm</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Giá vốn</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Giá bán</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Tồn kho</th>
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
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Không có sản phẩm nào</p>
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-green-600">{product.code}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.unit}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category_name}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(product.cost_price)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{formatCurrency(product.selling_price)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${
                        product.total_stock <= 0 ? 'text-red-600' :
                        product.total_stock <= 10 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {product.total_stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenBatchModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Quản lý lô hàng"
                        >
                          <Box size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
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

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã sản phẩm</label>
                  <input
                    type="text"
                    value={productForm.code}
                    onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Mã tự động nếu để trống"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm hàng</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                <input
                  type="text"
                  value={productForm.unit}
                  onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá vốn</label>
                  <input
                    type="number"
                    value={productForm.cost_price}
                    onChange={(e) => setProductForm({ ...productForm, cost_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
                  <input
                    type="number"
                    value={productForm.selling_price}
                    onChange={(e) => setProductForm({ ...productForm, selling_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thuế VAT (%)</label>
                <input
                  type="number"
                  value={productForm.tax_rate}
                  onChange={(e) => setProductForm({ ...productForm, tax_rate: parseFloat(e.target.value) || 0 })}
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
                  onClick={handleSaveProduct}
                  disabled={!productForm.name}
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

      {/* Batch Modal */}
      {showBatchModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                <Box className="inline mr-2 w-5 h-5" />
                Quản lý lô hàng - {selectedProduct.name}
              </h3>
              <button onClick={() => setShowBatchModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Existing Batches */}
              <div className="p-4">
                <h4 className="font-medium text-gray-800 mb-3">Các lô hàng hiện tại</h4>
                {batches.length > 0 ? (
                  <div className="space-y-2">
                    {batches.map(batch => (
                      <div
                        key={batch.id}
                        className={`p-3 rounded-lg border ${
                          batch.quantity <= 0 ? 'bg-gray-50 border-gray-200' :
                          new Date(batch.expiry_date) < new Date(Date.now() + 30*24*60*60*1000) ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Lô: {batch.batch_number || 'N/A'}</p>
                            <p className="text-sm text-gray-500">
                              Sản xuất: {formatDate(batch.manufacturing_date)} | Hạn: {formatDate(batch.expiry_date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              batch.quantity <= 0 ? 'text-gray-400' :
                              new Date(batch.expiry_date) < new Date() ? 'text-red-600' :
                              new Date(batch.expiry_date) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {batch.quantity} cái
                            </p>
                            {new Date(batch.expiry_date) < new Date() && (
                              <p className="text-xs text-red-600">Đã hết hạn</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Chưa có lô hàng nào</p>
                )}
              </div>

              {/* Add New Batch */}
              <div className="p-4 border-t">
                <h4 className="font-medium text-gray-800 mb-3">Thêm lô hàng mới</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lô</label>
                    <input
                      type="text"
                      value={batchForm.batch_number}
                      onChange={(e) => setBatchForm({ ...batchForm, batch_number: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="VD: LO2024001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                    <input
                      type="number"
                      value={batchForm.quantity}
                      onChange={(e) => setBatchForm({ ...batchForm, quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sản xuất</label>
                    <input
                      type="date"
                      value={batchForm.manufacturing_date}
                      onChange={(e) => setBatchForm({ ...batchForm, manufacturing_date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hạn sử dụng</label>
                    <input
                      type="date"
                      value={batchForm.expiry_date}
                      onChange={(e) => setBatchForm({ ...batchForm, expiry_date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSaveBatch}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus size={18} className="inline mr-2" />
                    Thêm lô hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
