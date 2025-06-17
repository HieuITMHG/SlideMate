// src/pages/ListDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MaterialCard from '../components/MaterialCard';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaEllipsisH } from 'react-icons/fa';
import { Menu, Transition } from '@headlessui/react';
import Footer from '../components/Footer';

const ListDetail = () => {
  const { listId } = useParams(); // Lấy listId từ URL
  const navigate = useNavigate();
  const [list, setList] = useState(null); // Thông tin danh sách
  const [materials, setMaterials] = useState([]); // Danh sách tài liệu
  const [isLoading, setIsLoading] = useState(true); // Trạng thái tải
  const [isEditOpen, setIsEditOpen] = useState(false); // Modal sửa tên
  const [newListName, setNewListName] = useState(''); // Tên danh sách mới

  // Lấy thông tin danh sách và tài liệu khi component mount
  useEffect(() => {
    const fetchListDetails = async () => {
      try {
        setIsLoading(true);
        // Lấy thông tin danh sách
        const listResponse = await api.get(`/api/lists/${listId}`);
        setList(listResponse.data.data);

        // Lấy tất cả tài liệu trong danh sách
        const materialsResponse = await api.get(`/api/lists/${listId}/materials`);
        setMaterials(materialsResponse.data.data);
      } catch (error) {
        console.error('Error fetching list details:', error);
        toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách', {
          position: 'top-right',
          autoClose: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchListDetails();
  }, [listId]);

  // Xử lý xóa danh sách
  const handleDeleteList = async () => {
    if (window.confirm('Bạn có chắc muốn xóa danh sách này?')) {
      try {
        await api.delete(`/api/lists/${listId}`);
        toast.success('Xóa danh sách thành công', {
          position: 'top-right',
          autoClose: 3000,
        });
        navigate('/saved'); // Chuyển hướng về trang danh sách
      } catch (error) {
        console.error('Error deleting list:', error);
        toast.error(error.response?.data?.message || 'Lỗi khi xóa danh sách', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    }
  };

  // Xử lý sửa tên danh sách
  const handleEditListName = async () => {
    if (newListName.trim()) {
      try {
        const response = await api.patch(`/api/lists/${listId}`, {
          list_name: newListName,
        });
        setList(response.data.data);
        setIsEditOpen(false);
        setNewListName('');
        toast.success('Cập nhật tên danh sách thành công', {
          position: 'top-right',
          autoClose: 3000,
        });
      } catch (error) {
        console.error('Error editing list name:', error);
        toast.error(error.response?.data?.message || 'Lỗi khi sửa tên danh sách', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } else {
      toast.error('Tên danh sách không được để trống', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  // Kiểm tra nếu danh sách có tên là "Later" (không phân biệt hoa thường)
  const isLaterList = list && list.name.toLowerCase() === 'later';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-red-600">Danh sách không tồn tại</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{list.name}</h1>
            {/* Chỉ hiển thị nút ba chấm nếu không phải danh sách "Later" */}
            {!isLaterList && (
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="p-2 rounded-full hover:bg-gray-200 transition">
                  <FaEllipsisH className="h-5 w-5 text-gray-600" />
                </Menu.Button>
                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            setIsEditOpen(true);
                            setNewListName(list.name);
                          }}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } w-full text-left px-4 py-2 text-sm text-gray-700`}
                        >
                          Sửa tên danh sách
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleDeleteList}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } w-full text-left px-4 py-2 text-sm text-red-600`}
                        >
                          Xóa danh sách
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>
        </div>

        {materials.length === 0 ? (
          <p className="text-lg text-gray-600">Danh sách này chưa có tài liệu nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        )}
      </div>

      {/* Modal sửa tên danh sách, chỉ hiển thị nếu không phải "Later" */}
      {isEditOpen && !isLaterList && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Sửa tên danh sách</h2>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Nhập tên danh sách mới"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setNewListName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={handleEditListName}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ListDetail;