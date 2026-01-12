import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface AuthContextType {
    token: string | null;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hàm hỗ trợ lưu trữ đa nền tảng
const saveStorage = async (key: string, value: string) => {
    if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
    } else {
        await SecureStore.setItemAsync(key, value);
    }
};

const getStorage = async (key: string) => {
    if (Platform.OS === 'web') {
        return localStorage.getItem(key);
    } else {
        return await SecureStore.getItemAsync(key);
    }
};

const deleteStorage = async (key: string) => {
    if (Platform.OS === 'web') {
        localStorage.removeItem(key);
    } else {
        await SecureStore.deleteItemAsync(key);
    }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Kiểm tra token khi khởi động app
        getStorage('userToken').then((val) => {
            setToken(val);
            setIsLoading(false);
        });
    }, []);

    const signIn = async (newToken: string) => {
        await saveStorage('userToken', newToken);
        setToken(newToken);
        router.replace('/(tabs)');
    };

    const signOut = async () => {
        await deleteStorage('userToken');
        setToken(null);
        router.replace('/auth');
    };

    return (
        <AuthContext.Provider value={{ token, signIn, signOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be within AuthProvider');
    return context;
};