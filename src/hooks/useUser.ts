import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cacheInstance } from '../utils/cache';

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  projects: any[];  // Replace with proper Project interface
}

export const useUser = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cachedUser = cacheInstance.get('user_data');
    const userId = cacheInstance.get('userId');

    if (!cachedUser || !userId) {
      navigate('/login');
      setLoading(false);
      return;
    }

    setUserData(cachedUser.data);
    setLoading(false);
  }, [navigate]);

  const clearUser = () => {
    cacheInstance.remove('user_data');
    cacheInstance.remove('userId');
    cacheInstance.remove('projectId');
    setUserData(null);
  };

  return {
    user: userData,
    loading,
    clearUser,
    isAuthenticated: !!userData
  };
};
