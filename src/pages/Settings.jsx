import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings as SettingsIcon,
  Store,
  Save,
  Plus,
  X,
  Users,
  CreditCard
} from 'lucide-react';

function Settings() {
  const { api, store, categories, setCategories } = useApp();
  const [storeInfo, setStoreInfo] = useState({
    name: '',
    address: '',
    phone: '',
    tax_code: ''
  });
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    if (store) {
      setStoreInfo({
        name: store.name || '',
        address: store.address || '',
        phone: store.phone || '',
        tax_code: store.tax_code || ''
      });
    }
  }, [store]);

  const handleSaveStore = async () => {
    try {
      await api.updateStore(storeInfo);
      alert('Lưu thông tin cửa hàng thành công!');
    } catch (error) {
      console.error('Error saving store:', error);
      alert('Lỗi khi lưu thông tin!');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const result = await api.createCategory({ name: newCategory });
      setCategories([...categories, result.data]);
      setNewCategory('');
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-gray-600" />
          Cài đặt
        </h1>
        <p className="text-gray-500">Quản lý thông tin cửa hàng và hệ thống</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-green-600" />
            Thông tin cửa hàng
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên cửa hàng</label>
              <input
                type="text"
                value={storeInfo.name}
                onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <input
                type="text"
                value={storeInfo.address}
                onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={storeInfo.phone}
                onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
              <input
                type="text"
                value={storeInfo.tax_code}
                onChange={(e) => setStoreInfo({ ...storeInfo, tax_code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleSaveStore}
              className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Lưu thông tin
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Nhóm hàng hóa
            </h2>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <Plus size={16} />
              Thêm nhóm
            </button>
          </div>
          <div className="space-y-2">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-800">{cat.name}</span>
                <span className="text-sm text-gray-500">{cat.description || 'Nhóm hàng'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Thông tin ứng dụng
          </h2>
          <div className="text-gray-600 space-y-2">
            <p><strong>Plant Shop POS</strong></p>
            <p>Phiên bản: 1.0.0 - Cloudflare Edition</p>
            <p>Mô tả: Phần mềm quản lý bán hàng cho cửa hàng Thuốc Bảo Vệ Thực Vật</p>
            <p className="text-sm text-gray-500 mt-4">
              - Quản lý hàng hóa theo lô/hạn sử dụng
              <br />
              - Theo dõi công nợ khách hàng
              <br />
              - Tính thuế GTGT 10%
              <br />
              - Báo cáo doanh thu chi tiết
              <br />
              - Deploy trên Cloudflare Workers + D1 + Pages
            </p>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">Thêm nhóm hàng mới</h3>
              <button onClick={() => setShowCategoryModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhóm hàng</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="VD: Thuốc trừ sâu"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim()}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
