import publicApi from "../utils/publicApi.js";
import api from "../utils/api.js";

const getMaterialsByCategory = async (categoryName) => {
    try {
        const response = await publicApi.get(`/api/materials/category/${categoryName}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching materials by category:', error);
        throw error;
    }
};

const getTopMaterialsByCategory = async (category_id) => {
    try {
        const response = await publicApi.get(`/api/materials/top-category/${category_id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching materials by category:', error);
        throw error;
    }
};

const getRelatedMaterials = async (material_id) => {
    try {
        const response = await publicApi.get(`/api/materials/${material_id}/related`);
        return response.data;
    } catch (error) {
        console.error('Error fetching materials by category:', error);
        throw error;
    }
};

const toggleSaveMaterial = async (materialId) => {
  try {
    const res = await api.post("/api/lists/toggle-save", { material_id: materialId });
    return res.data;
  } catch (error) {
    console.error("Error toggling save material:", error);
    throw error;
  }
};

export const getUserUploadedMaterials = async () => {
  try {
    const response = await api.get('/api/materials/my-uploads');
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  } catch (error) {
    console.error('Error in getUserUploadedMaterials:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

export const deleteMaterial = async (materialId) => {
  try {
    const response = await api.delete(`/api/materials/${materialId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
};

export const updateMaterial = async (materialId, updateData) => {
  try {
    const response = await api.patch(`/api/materials/${materialId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating material:', error);
    throw error;
  }
};

export const toggleMaterialVisibility = async (materialId) => {
  try {
    const response = await api.patch(`/api/materials/${materialId}/visibility`);
    return response.data;
  } catch (error) {
    console.error('Error toggling material visibility:', error);
    throw error;
  }
};

export { getMaterialsByCategory, toggleSaveMaterial, getRelatedMaterials, getTopMaterialsByCategory };
