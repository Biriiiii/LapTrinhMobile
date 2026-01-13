import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const apiClient = axios.create({
    // Đảm bảo IP và Port khớp với máy tính của bạn
    baseURL: 'http://172.20.10.3:8080/api',
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;