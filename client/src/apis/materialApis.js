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

const toggleSaveMaterial = async (materialId) => {
  try {
    const res = await api.post("/api/lists/toggle-save", { material_id: materialId });
    return res.data;
  } catch (error) {
    console.error("Error toggling save material:", error);
    throw error;
  }
};

export { getMaterialsByCategory, toggleSaveMaterial };
