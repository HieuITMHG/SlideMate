
import { useEffect, useState } from 'react';
import publicApi from '../utils/publicapi';

const useAuth = () => {
  const [authenticated, setAuthenticated] = useState(null); // null: loading
  useEffect(() => {
    const check = async () => {
      try {
        await publicApi.get('/api/users/me', { withCredentials: true });
        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      }
    };
    check();
  }, []);
  return authenticated;
};

export default useAuth;
