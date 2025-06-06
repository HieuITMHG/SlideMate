import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import api from '../utils/api';

const Toolbar = ({ onSave, onLike }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      padding: '1rem',
      borderBottom: '1px solid #ddd',
      backgroundColor: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}
  >
    <button onClick={onSave} className="btn-save">
      💾 Lưu
    </button>
    <button onClick={onLike} className="btn-like">
      ❤️ Thích
    </button>
  </div>
);

const RecommendSidebar = () => (
  <div
    style={{
      width: 280,
      padding: '1rem',
      borderLeft: '1px solid #ddd',
      backgroundColor: '#fafafa',
      overflowY: 'auto',
    }}
  >
    <h3>Gợi ý tài liệu</h3>
    <ul>
      <li>Tài liệu 1</li>
      <li>Tài liệu 2</li>
      <li>Tài liệu 3</li>
      {/* Bạn có thể map list recommend thực tế ở đây */}
    </ul>
  </div>
);

const MaterialDetail = () => {
  const { id: materialId } = useParams();
  const [material, setMaterial] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Tạo plugin mặc định với sidebar thumbnails
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const res = await api.get(`/api/materials/${materialId}`);
        console.log(res.data.material);
        setMaterial(res.data.material);
        setPdfUrl(res.data.material.pdf_version_path);
      } catch (err) {
        console.error('Lỗi khi tải tài liệu:', err);
      }
    };
    fetchMaterial();
  }, [materialId]);

  const handleSave = () => {
    alert('Bạn đã lưu tài liệu!');
    // TODO: Thêm logic lưu tài liệu
  };

  const handleLike = () => {
    alert('Bạn đã thích tài liệu!');
    // TODO: Thêm logic thích tài liệu
  };

  if (!material) {
    return <p className="text-center mt-10">Đang tải tài liệu...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col h-screen">
      <h1 className="text-3xl font-bold mb-4">{material.title}</h1>
      <p className="mb-4 text-gray-600">{material.description}</p>

      <Toolbar onSave={handleSave} onLike={handleLike} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', border: '1px solid #ddd', borderRadius: 6, backgroundColor: 'white' }}>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          {/* Viewer chiếm khoảng 75% chiều ngang */}
          <div style={{ flex: 3, height: '100%', overflow: 'hidden' }}>
            <Viewer
              fileUrl={pdfUrl}
              plugins={[defaultLayoutPluginInstance]}
              defaultScale={1.2}
              theme="light"
              localization={{}}
            />
          </div>
        </Worker>

        {/* Sidebar Recommend bên phải */}
        <RecommendSidebar />
      </div>
    </div>
  );
};

export default MaterialDetail;
