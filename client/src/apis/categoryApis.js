import publicApi from "../utils/publicApi";

const getAllCategories = async () => {
    try {
        const res = await publicApi.get('/api/admin/categories');
        return res.data.data;
    } catch(error) {
        console.error(error);
    }
    
}

export { getAllCategories };