// services/authService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL =  'http://10.0.2.2:8000/api/auth'; // ב-Emulator Android תשתמש ב-10.0.2.2

// פונקציית הרשמה
export const register = async (username, email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/register/`, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Registration failed' };
  }
};

// פונקציית התחברות
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/login/`, {
      username,
      password,
    });

    const { access, refresh } = response.data;

    // שמירה של הטוקנים בזיכרון המקומי
    await AsyncStorage.setItem('accessToken', access);
    await AsyncStorage.setItem('refreshToken', refresh);

    return { access, refresh };
  } catch (error) {
    throw error.response?.data || { error: 'Login failed' };
  }
};

// פונקציית יציאה
export const logout = async () => {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
};
