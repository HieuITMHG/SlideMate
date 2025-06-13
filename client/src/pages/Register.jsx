import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import publicApi from '../utils/publicApi.js';
import { setUserInfo } from '../store/slices/userSlice';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await publicApi.post('/api/users/register', { email, password, name });
      localStorage.setItem('accessToken', response.data.accessToken);
      dispatch(setUserInfo({ email, name }));
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data.message || 'Lỗi đăng ký');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await publicApi.post('/api/users/google', { token: credentialResponse.credential });
      localStorage.setItem('accessToken', response.data.accessToken);
      dispatch(setUserInfo(response.data.user));
      console.log(response.data.user)
      navigate('/profile');
    } catch (error) {
      setError('Lỗi đăng nhập Google');
    }
  };

  const handleGoogleFailure = () => {
    setError('Đăng nhập Google thất bại');
  };

  return (
    <div className="inset-0 h-screen w-screen bg-gray-100 flex justify-center items-center">
      <form className="w-[500px] bg-white p-6 rounded shadow-md" onSubmit={handleRegister}>
        <h2 className="text-2xl font-bold mb-4">Đăng Ký</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Tên</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
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
          Đăng Ký
        </button>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            text="signup_with"
          />
        </GoogleOAuthProvider>
      </form>
    </div>
  );
}

export default Register;