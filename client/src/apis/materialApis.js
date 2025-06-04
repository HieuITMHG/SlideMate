import api from '../utils/api';

const getMaterialsByCategory = async (categoryName) => {
    try {
        const response = await api.get(`/api/materials/${categoryName}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching materials by category:', error);
        throw error;
    }
};

export { getMaterialsByCategory };
