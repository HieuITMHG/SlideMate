// Saved.jsx
import React, { useState, useEffect } from 'react';
import List from '../components/List';
import { FaPlus } from 'react-icons/fa';
import api from '../utils/api';
import Footer from '../components/Footer';

const Saved = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [lists, setLists] = useState([]);

  // Fetch lists on component mount
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await api.get('/api/lists');
        setLists(response.data.data);
      } catch (error) {
        console.error('Error fetching lists:', error);
      }
    };
    fetchLists();
  }, []);

  const handleCreateList = async () => {
    if (newListName.trim()) {
      try {
        const response = await api.post('/api/lists', { list_name: newListName });
        setLists([...lists, response.data.data]);
        setNewListName('');
        setIsPopupOpen(false);
      } catch (error) {
        console.error('Error creating list:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Lists</h1>
          <button
            onClick={() => setIsPopupOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            <FaPlus className="h-5 w-5" />
            Create New List
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <List key={list.id} list={list} />
          ))}
        </div>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New List</h2>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Enter list name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsPopupOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateList}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Saved;