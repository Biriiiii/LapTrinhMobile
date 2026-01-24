import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router'; // Thêm useFocusEffect
import React, { useCallback, useState } from 'react'; // Thêm useCallback
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import apiClient from '../services/apiClient';

// --- 1. INTERFACE ---
interface MyAlbum {
    id: number;
    title: string;
    coverUrl: string;
    categoryName: string;
    releaseYear: number;
    formattedDuration: string;
}

export default function MyAlbumsScreen() {
    const router = useRouter();
    const [albums, setAlbums] = useState<MyAlbum[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // --- 2. HÀM FETCH DỮ LIỆU RIÊNG BIỆT ---
    const fetchMyAlbums = async () => {
        try {
            // Chỉ hiện loading lớn khi danh sách đang trống
            if (albums.length === 0) setLoading(true);

            const res = await apiClient.get('/customer/profile/my-albums');

            if (res.data) {
                setAlbums(res.data);
            }
        } catch (error: any) {
            console.error("Lỗi API chi tiết:", error.response?.status, error.response?.data);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // --- 🔥 CÁCH 1: TỰ ĐỘNG CẬP NHẬT KHI QUAY LẠI TRANG ---
    useFocusEffect(
        useCallback(() => {
            fetchMyAlbums();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyAlbums();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Album đã sở hữu</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* HIỂN THỊ TRẠNG THÁI LOADING LẦN ĐẦU */}
            {loading && albums.length === 0 ? (
                <View style={styles.centered}>
                    <ActivityIndicator color="#1DB954" size="large" />
                    <Text style={{ color: '#666', marginTop: 10 }}>Đang chuẩn bị thư viện...</Text>
                </View>
            ) : (
                <FlatList
                    data={albums}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1DB954" />
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            activeOpacity={0.7}
                            onPress={() => router.push(`/album/${item.id}` as any)}
                        >
                            <Image
                                source={{ uri: item.coverUrl || 'https://via.placeholder.com/100' }}
                                style={styles.cover}
                            />

                            <View style={styles.info}>
                                <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
                                <Text style={styles.albumSub}>
                                    {item.categoryName} • {item.releaseYear}
                                </Text>
                            </View>

                            <MaterialIcons name="play-circle-filled" size={32} color="#1DB954" />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Feather name="music" size={60} color="#333" />
                            <Text style={styles.emptyText}>Thư viện đang trống</Text>
                            <Text style={styles.emptySubText}>Những album bạn mua sẽ xuất hiện tại đây.</Text>
                            <TouchableOpacity
                                style={styles.exploreBtn}
                                onPress={() => router.push('/(tabs)')}
                            >
                                <Text style={styles.exploreText}>KHÁM PHÁ NGAY</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

// --- 3. STYLES DARK MODE ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 20 },
    backBtn: { padding: 8, backgroundColor: '#1a1a1a', borderRadius: 20 },
    title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 12, borderRadius: 12, marginBottom: 16, elevation: 3 },
    cover: { width: 64, height: 64, borderRadius: 6, backgroundColor: '#333' },
    info: { flex: 1, marginLeft: 16 },
    albumTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    albumSub: { color: '#b3b3b3', fontSize: 13, marginTop: 4 },
    empty: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyText: { color: '#fff', marginTop: 15, fontSize: 18, fontWeight: 'bold' },
    emptySubText: { color: '#666', fontSize: 14, marginTop: 8, textAlign: 'center' },
    exploreBtn: { marginTop: 25, backgroundColor: '#fff', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 25 },
    exploreText: { color: '#000', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 }
});