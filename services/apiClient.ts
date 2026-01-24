import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const apiClient = axios.create({
    // 🔥 Sử dụng đúng Port 85 và IP máy tính của bạn
    baseURL: 'http://192.168.100.190:85/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
});

// Hàm lấy Token thông minh tùy theo nền tảng
const getAuthToken = async () => {
    if (Platform.OS === 'web') {
        // Trên Web dùng localStorage để tránh lỗi SecureStore
        return localStorage.getItem('userToken');
    }
    // Trên Android/iOS dùng SecureStore
    return await SecureStore.getItemAsync('userToken');
};

apiClient.interceptors.request.use(async (config) => {
    const token = await getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error(`❌ Lỗi API [${error.response?.status}]:`, error.config?.url);
        return Promise.reject(error);
    }
);

export default apiClient;