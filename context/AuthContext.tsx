import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '@/utils/storage';

// 👤 Kiểu User (khớp UserResponse backend)
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
    user: User | null;
    signIn: (token: string, userData: User) => Promise<void>;
    signOut: () => Promise<void>;
    updateUser: (userData: User) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 🔄 Load token + user khi app start
    useEffect(() => {
        const loadStoredData = async () => {
            const storedToken = await storage.getToken();
            const storedUser = await storage.getUser();

            if (storedToken) setToken(storedToken);
            if (storedUser) setUser(storedUser);

            setIsLoading(false);
        };
        loadStoredData();
    }, []);

    // 🔐 Đăng nhập
    const signIn = async (newToken: string, userData: User) => {
        await storage.setToken(newToken);
        await storage.setUser(userData);
        setToken(newToken);
        setUser(userData);
        router.replace('/(tabs)');
    };

    // ✏️ Update profile nhanh (edit profile)
    const updateUser = async (userData: User) => {
        await storage.setUser(userData);
        setUser(userData);
    };

    // 🚪 Logout
    const signOut = async () => {
        await storage.clear();
        setToken(null);
        setUser(null);
        router.replace('/auth');
    };

    return (
        <AuthContext.Provider
            value={{ token, user, signIn, signOut, updateUser, isLoading }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
