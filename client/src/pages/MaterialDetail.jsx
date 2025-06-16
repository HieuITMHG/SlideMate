import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import api from '../utils/api';
import Footer from '../components/Footer'; // Import Footer component

const Toolbar = ({ onSave, onLike, onDownload, onReport }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      borderBottom: '1px solid #e9ecef',
      backgroundColor: '#fff',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    }}
  >
    <div>
      <button
        onClick={onDownload}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '1rem',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={e => (e.target.style.backgroundColor = '#218838')}
        onMouseLeave={e => (e.target.style.backgroundColor = '#28a745')}
      >
        📥 Download
      </button>
      <button
        onClick={onReport}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#dc3545',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={e => (e.target.style.backgroundColor = '#c82333')}
        onMouseLeave={e => (e.target.style.backgroundColor = '#dc3545')}
      >
        ⚠️ Report
      </button>
    </div>
    <div>
      <button
        onClick={onSave}
        className="btn-save"
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '1rem',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={e => (e.target.style.backgroundColor = '#0056b3')}
        onMouseLeave={e => (e.target.style.backgroundColor = '#007bff')}
      >
        💾 Lưu
      </button>
      <button
        onClick={onLike}
        className="btn-like"
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#dc3545',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={e => (e.target.style.backgroundColor = '#c82333')}
        onMouseLeave={e => (e.target.style.backgroundColor = '#dc3545')}
      >
        ❤️ Thích
      </button>
    </div>
  </div>
);

const RecommendSidebar = () => (
  <div
    style={{
      width: 280,
      padding: '1rem',
      borderLeft: '1px solid #e9ecef',
      backgroundColor: '#fff',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 120px)',
      boxShadow: '-2px 0 4px rgba(0, 0, 0, 0.05)',
    }}
  >
    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>
      Gợi ý tài liệu
    </h3>
    <ul style={{ listStyle: 'none', padding: 0, color: '#6c757d' }}>
      <li style={{ marginBottom: '0.5rem' }}>Tài liệu 1</li>
      <li style={{ marginBottom: '0.5rem' }}>Tài liệu 2</li>
      <li style={{ marginBottom: '0.5rem' }}>Tài liệu 3</li>
      {/* Bạn có thể map list recommend thực tế ở đây */}
    </ul>
  </div>
);

const MaterialDetail = () => {
  const { id: materialId } = useParams();
  const [material, setMaterial] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar: () => null, // Disable the default toolbar
  });

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

  const handleDownload = () => {
    alert('Tải xuống tài liệu!');
    // TODO: Thêm logic tải xuống (e.g., window.open(pdfUrl))
  };

  const handleReport = () => {
    alert('Báo cáo tài liệu!');
    // TODO: Thêm logic báo cáo (e.g., gọi API report)
  };

  if (!material) {
    return <p className="text-center mt-10" style={{ color: '#333' }}>Đang tải tài liệu...</p>;
  }

  return (
    <div className="w-full mx-auto p-6 flex flex-col min-h-screen bg-white overflow-y-auto">
      <h1 className="text-3xl font-bold mb-4" style={{ color: '#333' }}>
        {material.title}
      </h1>
      <p
        className="mb-4 text-gray-600"
        style={{
          color: '#6c757d',
          whiteSpace: 'normal',
          overflow: 'auto',
        }}
      >
        {material.description}
      </p>

      <Toolbar
        onSave={handleSave}
        onLike={handleLike}
        onDownload={handleDownload}
        onReport={handleReport}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', border: '1px solid #e9ecef', borderRadius: '6px', backgroundColor: '#fff', marginBottom: '2rem' }}>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <div style={{ flex: 3, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
            <Viewer
              fileUrl={pdfUrl}
              plugins={[defaultLayoutPluginInstance]}
              defaultScale={1.2}
              theme="light"
              localization={{}}
            />
          </div>
        </Worker>

        <RecommendSidebar />
      </div>

      <Footer /> {/* Add Footer component */}
    </div>
  );
};

export default MaterialDetail;