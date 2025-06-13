import publicApi from "../utils/publicApi.js";

const getMaterialsByCategory = async (categoryName) => {
    try {
        const response = await publicApi.get(`/api/materials/category/${categoryName}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching materials by category:', error);
        throw error;
    }
};

export { getMaterialsByCategory };
