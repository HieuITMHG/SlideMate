import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import api from '../utils/api';

import Footer from '../components/Footer';
import RecommendSidebar from '../components/MaterialDetail/RecommendSidebar';
import Toolbar from '../components/MaterialDetail/Toolbar';

const MaterialDetail = () => {
  const { id: materialId } = useParams();
  const [material, setMaterial] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar: () => null, // Disable the default toolbar
  });

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const res = await api.get(`/api/materials/${materialId}`);
        setMaterial(res.data.material);
        setPdfUrl(res.data.material.pdf_version_path);
        setIsSaved(res.data.material.is_saved || false);
        setIsLiked(res.data.material.is_liked || false);
      } catch (err) {
        console.error('Lỗi khi tải tài liệu:', err);
      }
    };
    fetchMaterial();
  }, [materialId]);

  const handleSave = () => {
    setIsSaved(!isSaved);
    alert(isSaved ? 'Đã bỏ lưu tài liệu!' : 'Bạn đã lưu tài liệu!');
    // TODO: Gọi API để cập nhật trạng thái lưu
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    alert(isLiked ? 'Đã bỏ thích tài liệu!' : 'Bạn đã thích tài liệu!');
    // TODO: Gọi API để cập nhật trạng thái thích
  };

  const handleDownload = () => {
    alert('Tải xuống tài liệu!');
    // TODO: Thêm logic tải xuống
  };

  const handleReport = () => {
    setIsReportModalOpen(true); // Mở modal khi nhấn "Report"
  };

  const handleReportSubmit = async () => {
    if (!reportContent.trim()) {
      alert('Vui lòng nhập nội dung báo cáo!');
      return;
    }

    try {
      await api.post('/api/materials/report', {
        materialId,
        content: reportContent,
      });
      alert('Báo cáo đã được gửi!');
      setReportContent('');
      setIsReportModalOpen(false);
    } catch (err) {
      console.error('Lỗi khi gửi báo cáo:', err);
      alert('Không thể gửi báo cáo. Vui lòng thử lại!');
    }
  };

  const handleCloseModal = () => {
    setIsReportModalOpen(false);
    setReportContent('');
  };

  if (!material) {
    return <p className="text-center mt-10 text-gray-800">Đang tải tài liệu...</p>;
  }

  return (
    <div className="w-full mx-auto p-6 flex flex-col min-h-screen bg-white overflow-y-auto">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">{material.title}</h1>
      <p className="mb-6 text-gray-600 whitespace-normal overflow-auto">
        {material.description}
      </p>

      <Toolbar
        onSave={handleSave}
        onLike={handleLike}
        onDownload={handleDownload}
        onReport={handleReport}
        isSaved={isSaved}
        isLiked={isLiked}
      />

      <div className="flex flex-1 overflow-hidden border border-gray-200 rounded-md bg-white mb-8">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            <Viewer
              fileUrl={pdfUrl}
              plugins={[defaultLayoutPluginInstance]}
              defaultScale={1.2}
              theme="light"
            />
          </div>
        </Worker>
        <RecommendSidebar />
      </div>

      {/* Modal Báo cáo */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-gray-600/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Báo cáo tài liệu</h2>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows="5"
              placeholder="Nhập lý do báo cáo..."
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                onClick={handleCloseModal}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                onClick={handleReportSubmit}
              >
                Báo cáo
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default React.memo(MaterialDetail);