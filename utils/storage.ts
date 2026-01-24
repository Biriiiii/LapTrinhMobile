import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';

export const storage = {
    async getToken(): Promise<string | null> {
        if (Platform.OS === 'web') {
            return localStorage.getItem(TOKEN_KEY);
        }
        return await SecureStore.getItemAsync(TOKEN_KEY);
    },

    async setToken(token: string) {
        if (Platform.OS === 'web') {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
        }
    },

    async getUser() {
        if (Platform.OS === 'web') {
            const data = localStorage.getItem(USER_KEY);
            return data ? JSON.parse(data) : null;
        }
        const data = await SecureStore.getItemAsync(USER_KEY);
        return data ? JSON.parse(data) : null;
    },

    async setUser(user: any) {
        const value = JSON.stringify(user);
        if (Platform.OS === 'web') {
            localStorage.setItem(USER_KEY, value);
        } else {
            await SecureStore.setItemAsync(USER_KEY, value);
        }
    },

    async clear() {
        if (Platform.OS === 'web') {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        } else {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
        }
    },
};
