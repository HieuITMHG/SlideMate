import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MaterialPreview = ({ materialId }) => {
  const [pages, setPages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`http://localhost:3000/api/materials/${materialId}/pages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPages(response.data.pages);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load pages');
      }
    };
    fetchPages();
  }, [materialId]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Material Preview</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-2 gap-4">
        {pages.map((page) => (
          <div key={page._id} className="border rounded-md overflow-hidden">
            <img
              src={`http://localhost:3000/drive/view/${page.image_id}`}
              alt={`Page ${page.page_number}`}
              className="w-full h-auto"
            />
            <p className="p-2 text-center text-sm text-gray-600">Page {page.page_number}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialPreview;