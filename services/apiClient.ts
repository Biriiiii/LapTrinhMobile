import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const apiClient = axios.create({
    // Đảm bảo IP và Port khớp với máy tính của bạn
    baseURL: 'http://192.168.100.190:8080/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000, // Tăng timeout lên 30 giây
});

apiClient.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor để handle lỗi
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout - Kiểm tra kết nối mạng');
        } else if (error.message === 'Network Error') {
            console.error('Network Error - Kiểm tra IP address và firewall');
        }
        return Promise.reject(error);
    }
);

export default apiClient;