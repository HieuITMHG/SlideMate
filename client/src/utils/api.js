import axios from 'axios';

// Tạo instance của axios với cấu hình mặc định
const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

// Interceptor cho request: Thêm Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(
          'http://localhost:3000/api/users/refresh-token',
          {},
          { withCredentials: true }
        );
        const newToken = response.data.accessToken; // Adjust based on response
        if (newToken) {
          localStorage.setItem('accessToken', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Lỗi làm mới token:', refreshError);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;