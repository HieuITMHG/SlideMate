import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import publicApi from '../utils/publicApi.js';
import { setUserInfo } from '../store/slices/userSlice';
import { useNavigate, useLocation } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Xử lý redirect từ Google OAuth
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const accountId = query.get('accountId');
    const errorMessage = query.get('message');

    if (errorMessage) {
      setError(decodeURIComponent(errorMessage));
    } else if (accountId) {
      // Xác thực thành công, gọi API để lấy thông tin người dùng
      publicApi.get('/api/users/me')
        .then(response => {
          dispatch(setUserInfo(response.data.user));
          navigate('/');
        })
        .catch(err => {
          setError('Lỗi lấy thông tin người dùng sau OAuth');
        });
    }
  }, [location, dispatch, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await publicApi.post('/api/users/login', { email, password });
      const { user, needsAuth, authUrl } = response.data;

      dispatch(setUserInfo(user));
      if (needsAuth) {
        // Chuyển hướng đến authUrl nếu cần Google OAuth
        console.log('Redirecting to Google auth URL:', authUrl);
        window.location.href = authUrl;
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data.message || 'Lỗi đăng nhập');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await publicApi.post('/api/users/google', { token: credentialResponse.credential });
      const { user, needsAuth, authUrl } = response.data;

      dispatch(setUserInfo(user));
      if (needsAuth) {
        // Chuyển hướng đến authUrl nếu cần Google OAuth
        console.log('Redirecting to Google auth URL:', authUrl);
        window.location.href = authUrl;
      } else {
        navigate('/');
      }
    } catch (error) {
      setError('Lỗi đăng nhập Google');
    }
  };

  const handleGoogleFailure = () => {
    setError('Đăng nhập Google thất bại');
  };

  return (
    <div className="inset-0 h-screen w-screen bg-gray-100 flex justify-center items-center">
      <form className="w-[500px] bg-white p-6 rounded shadow-md" onSubmit={handleLogin}>
        <h2 className="text-2xl font-bold mb-4">Đăng Nhập</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-4">
          Đăng Nhập
        </button>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            text="signin_with"
          />
        </GoogleOAuthProvider>
      </form>
    </div>
  );
}

export default Login;