import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// 👤 Định nghĩa kiểu dữ liệu User dựa trên UserResponse từ Backend
interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    walletBalance: number;
    roleName: string;
}

interface AuthContextType {
    token: string | null;
    user: User | null; // ✅ Thêm thông tin user
    signIn: (token: string, userData: User) => Promise<void>; // Cập nhật tham số
    signOut: () => Promise<void>;
    updateUser: (userData: User) => Promise<void>; // ✅ Hàm cập nhật profile nhanh
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Các hàm hỗ trợ Storage giữ nguyên ---
const saveStorage = async (key: string, value: string) => {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); }
    else { await SecureStore.setItemAsync(key, value); }
};

const getStorage = async (key: string) => {
    if (Platform.OS === 'web') { return localStorage.getItem(key); }
    else { return await SecureStore.getItemAsync(key); }
};

const deleteStorage = async (key: string) => {
    if (Platform.OS === 'web') { localStorage.removeItem(key); }
    else { await SecureStore.deleteItemAsync(key); }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null); // ✅ State lưu trữ user
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Kiểm tra token và thông tin user khi khởi động app
        const loadStoredData = async () => {
            const storedToken = await getStorage('userToken');
            const storedUser = await getStorage('userData');

            if (storedToken) setToken(storedToken);
            if (storedUser) setUser(JSON.parse(storedUser));

            setIsLoading(false);
        };
        loadStoredData();
    }, []);

    // Đăng nhập: Lưu cả token và thông tin user
    const signIn = async (newToken: string, userData: User) => {
        await saveStorage('userToken', newToken);
        await saveStorage('userData', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        router.replace('/(tabs)');
    };

    // ✅ Cập nhật thông tin user (Dùng sau khi Edit Profile thành công)
    const updateUser = async (userData: User) => {
        await saveStorage('userData', JSON.stringify(userData));
        setUser(userData); // Cập nhật state để UI đổi tên ngay lập tức
    };

    const signOut = async () => {
        await deleteStorage('userToken');
        await deleteStorage('userData');
        setToken(null);
        setUser(null);
        router.replace('/auth');
    };

    return (
        <AuthContext.Provider value={{ token, user, signIn, signOut, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be within AuthProvider');
    return context;
};