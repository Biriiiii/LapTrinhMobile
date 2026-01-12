import apiClient from './apiClient';
import { Album, Artist, Category, Profile } from './types';

export const MusicService = {
    // --- 🌍 PUBLIC APIs ---
    public: {
        // Categories
        getCategories: () => apiClient.get<Category[]>('/public/categories'),
        getCategoryDetail: (id: number) => apiClient.get<Category>(`/public/categories/${id}`),
        searchCategories: (query: string) => apiClient.get('/public/categories/search', { params: { query } }),

        // Artists
        getArtists: () => apiClient.get<Artist[]>('/public/artists'),
        getArtistDetail: (id: number) => apiClient.get<Artist>(`/public/artists/${id}`),
        searchArtists: (query: string) => apiClient.get('/public/artists/search', { params: { query } }),
        getPopularArtists: () => apiClient.get<Artist[]>('/public/artists/popular'),
        getArtistAlbumCount: (id: number) => apiClient.get(`/public/artists/${id}/album-count`),
        getArtistSongCount: (id: number) => apiClient.get(`/public/artists/${id}/song-count`),

        // Albums
        getAlbums: () => apiClient.get<Album[]>('/public/albums'),
        getAlbumDetail: (id: number) => apiClient.get<Album>(`/public/albums/${id}`),
        searchAlbums: (query: string) => apiClient.get('/public/albums/search', { params: { query } }),
    },

    // --- 👤 CUSTOMER PROFILE APIs ---
    customer: {
        getProfile: () => apiClient.get<Profile>('/customer/profile'),
        getProfileById: (id: number) => apiClient.get<Profile>(`/customer/profile/${id}`),
        updateProfile: (data: Partial<Profile>) => apiClient.put('/customer/profile', data),
        updateProfileById: (id: number, data: Partial<Profile>) => apiClient.put(`/customer/profile/${id}`, data),

        getWalletBalance: () => apiClient.get('/customer/profile/wallet/balance'),
        getMyAlbums: () => apiClient.get<Album[]>('/customer/profile/my-albums'),

        checkUsername: (username: string) => apiClient.get(`/customer/profile/check/username/${username}`),
        checkEmail: (email: string) => apiClient.get(`/customer/profile/check/email/${email}`),
    },

    // --- 🎵 MEDIA PROCESSING APIs ---
    media: {
        getMediaInfo: (mediaId: string) => apiClient.get(`/customer/media/${mediaId}`),
        searchMedia: (query: string) => apiClient.get('/customer/media/search', { params: { query } }),
        getMediaStats: (mediaId: string) => apiClient.get(`/customer/media/${mediaId}/statistics`),
        processMedia: (type: string, data: any) => apiClient.post(`/customer/media/process/${type}`, data),
        getProcessingStats: () => apiClient.get('/customer/media/processing/statistics'),
    }
};