import axios from 'axios';
import { storage } from './storage';

const apiClient = axios.create({
    baseURL: 'https://euryhaline-kerry-xenomorphically.ngrok-free.dev/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await storage.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
