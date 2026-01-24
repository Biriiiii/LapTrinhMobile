import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator, FlatList, Image,
    StatusBar,
    StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import apiClient from '../../services/apiClient';

// --- 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU KHỚP BACKEND ---
interface Album {
    id: number;
    title: string;       // Backend trả về title
    coverUrl: string;    // Backend trả về coverUrl
    releaseYear: number; // Backend trả về releaseYear
}

interface Artist {
    id: number;
    name: string;
    imageUrl: string;    // Backend trả về imageUrl
    biography: string;
}

export default function ArtistDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [artist, setArtist] = useState<Artist | null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);

    // --- 2. HÀM FETCH DATA ---
    const fetchArtistData = async () => {
        try {
            if (!artist) setLoading(true);

            // Gọi song song 2 API: Lấy thông tin Artist + Lấy danh sách Album
            const [artistRes, albumsRes] = await Promise.all([
                apiClient.get(`/public/artists/${id}`),
                apiClient.get(`/public/artists/${id}/albums`).catch(() => ({ data: [] }))
            ]);

            setArtist(artistRes.data);
            setAlbums(albumsRes.data);
        } catch (error) {
            console.log("Lỗi tải dữ liệu nghệ sĩ:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- 3. TỰ ĐỘNG CẬP NHẬT KHI MÀN HÌNH ĐƯỢC FOCUS ---
    useFocusEffect(
        useCallback(() => {
            if (id) fetchArtistData();
        }, [id])
    );

    if (loading && !artist) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color="#1DB954" size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* --- ẢNH BÌA ARTIST --- */}
            <Image
                // 🔥 Sửa thành imageUrl
                source={{ uri: artist?.imageUrl || 'https://via.placeholder.com/500' }}
                style={styles.bannerImage}
                resizeMode="cover"
            />

            {/* Nút Back */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>

            {/* --- THÔNG TIN ARTIST --- */}
            <View style={styles.infoBox}>
                <Text style={styles.name}>{artist?.name}</Text>
                <Text style={styles.stats}>Nghệ sĩ được xác minh ✅</Text>

                <TouchableOpacity style={styles.followBtn}>
                    <Text style={styles.followText}>THEO DÕI</Text>
                </TouchableOpacity>

                {/* Tiểu sử ngắn gọn */}
                <Text style={styles.bio} numberOfLines={3}>
                    {artist?.biography || "Chưa có tiểu sử."}
                </Text>
            </View>

            {/* --- DANH SÁCH ALBUM --- */}
            <Text style={styles.sectionTitle}>Phát hành phổ biến</Text>

            <FlatList
                data={albums}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.albumRow}
                        // Chuyển hướng sang trang chi tiết Album
                        onPress={() => router.push(`/album/${item.id}`)}
                    >
                        {/* 🔥 Sửa thành coverUrl */}
                        <Image
                            source={{ uri: item.coverUrl || 'https://via.placeholder.com/60' }}
                            style={styles.albumImg}
                        />

                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text style={styles.albumName} numberOfLines={1}>{item.title}</Text>
                            {/* 🔥 Hiển thị năm phát hành thật */}
                            <Text style={styles.albumYear}>
                                {item.releaseYear} • Album
                            </Text>
                        </View>

                        <Feather name="chevron-right" size={20} color="#666" />
                    </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 40 }}
                style={{ paddingHorizontal: 20 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text style={{ color: '#777', textAlign: 'center', marginTop: 20 }}>Chưa có album nào.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    centered: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },

    // Banner & Header
    bannerImage: { width: '100%', height: 350, opacity: 0.8 },
    backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20, zIndex: 10 },

    // Thông tin Artist (Gradient ảo giác đè lên ảnh)
    infoBox: {
        padding: 20,
        marginTop: -100, // Kéo lên đè ảnh
        backgroundColor: 'linear-gradient(to bottom, transparent, #121212)', // (Lưu ý: React Native thuần không hỗ trợ linear-gradient kiểu CSS này trực tiếp, đây là mô phỏng logic layout)
    },
    name: {
        color: '#fff', fontSize: 40, fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.9)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10
    },
    stats: { color: '#b3b3b3', marginTop: 5, fontSize: 14, fontWeight: '600' },
    bio: { color: '#ccc', marginTop: 15, fontSize: 13, lineHeight: 18 },

    followBtn: {
        borderWidth: 1, borderColor: '#fff', paddingHorizontal: 25, paddingVertical: 8,
        borderRadius: 20, alignSelf: 'flex-start', marginTop: 15
    },
    followText: { color: '#fff', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },

    // List Album
    sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', margin: 20, marginTop: 10 },
    albumRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#181818', padding: 10, borderRadius: 8 },
    albumImg: { width: 60, height: 60, borderRadius: 4 },
    albumName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    albumYear: { color: '#b3b3b3', fontSize: 13, marginTop: 4 }
});