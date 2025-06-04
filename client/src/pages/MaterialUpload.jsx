import React, { useState } from 'react';
import api from '../utils/api'; // Use the custom axios instance
import { useNavigate } from 'react-router-dom';

const MaterialUpload = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [category, setCategory] = useState('General');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(selectedFile.type)
    ) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a PDF or PowerPoint file.');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      setError('Please provide a title and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('visibility', visibility);
    formData.append('category_name', category);

    try {
      setIsLoading(true);
      // Use api instance instead of axios
      const response = await api.post('/api/materials/upload', formData);
      setSuccess('Material uploaded successfully!');
      setError('');
      setFile(null);
      setTitle('');
      setDescription('');
      setVisibility('PUBLIC');
      setCategory('General');
    } catch (err) {
      console.error('Upload error:', err.response?.data, err.message);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Upload failed.');
      }
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Material</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter material title"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter material description"
            rows="4"
          />
        </div>
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            File (PDF/PPT)
          </label>
          <input
            id="file"
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx"
            onChange={handleFileChange}
            required
            className="mt-1 w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <div>
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
            Visibility
          </label>
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="PRIVATE">Private</option>
            <option value="PUBLIC">Public</option>
            <option value="PROTECTED">Protected</option>
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter category (default: General)"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
};

export default MaterialUpload;