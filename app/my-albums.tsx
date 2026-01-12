import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import apiClient from '../services/apiClient';

// --- 1. INTERFACE DỰA TRÊN ẢNH POSTMAN BẠN GỬI ---
interface MyAlbum {
    id: number;
    title: string;
    coverUrl: string;       // Sử dụng coverUrl thay vì image
    categoryName: string;   // Dữ liệu V-Pop, Pop...
    releaseYear: number;
    formattedDuration: string;
}

export default function MyAlbumsScreen() {
    const router = useRouter();
    const [albums, setAlbums] = useState<MyAlbum[]>([]);
    const [loading, setLoading] = useState(true);

    // --- 2. GỌI API KHI MÀN HÌNH ĐƯỢC MỞ ---
    useEffect(() => {
        fetchMyAlbums();
    }, []);

    const fetchMyAlbums = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/customer/profile/my-albums');

            // DÒNG NÀY ĐỂ KIỂM TRA TRÊN TERMINAL/CONSOLE:
            console.log("Dữ liệu nhận được từ API:", res.data);

            if (res.data) {
                // Gán dữ liệu vào state để hiển thị lên màn hình
                setAlbums(res.data);
            }
        } catch (error: any) {
            // In ra lỗi chi tiết để xem là lỗi 401 (Token), 404 (Sai link) hay 500 (Server)
            console.error("Lỗi API chi tiết:", error.response?.status, error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Album đã sở hữu</Text>
                <TouchableOpacity onPress={fetchMyAlbums}>
                    <Feather name="refresh-cw" size={20} color="#1DB954" />
                </TouchableOpacity>
            </View>

            {/* HIỂN THỊ TRẠNG THÁI LOADING */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color="#1DB954" size="large" />
                    <Text style={{ color: '#666', marginTop: 10 }}>Đang tải dữ liệu...</Text>
                </View>
            ) : (
                <FlatList
                    data={albums}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => router.push(`/album/${item.id}` as any)}
                        >
                            {/* Sử dụng đúng trường coverUrl từ API */}
                            <Image
                                source={{ uri: item.coverUrl || 'https://via.placeholder.com/100' }}
                                style={styles.cover}
                            />

                            <View style={styles.info}>
                                <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
                                <Text style={styles.albumSub}>
                                    {item.categoryName} • {item.releaseYear} • {item.formattedDuration}
                                </Text>
                            </View>

                            <MaterialIcons name="play-circle-filled" size={32} color="#1DB954" />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Feather name="music" size={60} color="#333" />
                            <Text style={styles.emptyText}>Thư viện của bạn đang trống.</Text>
                            <Text style={styles.emptySubText}>Hãy mua thêm album để bắt đầu nghe nhạc!</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

// --- 3. HỆ THỐNG STYLES CHUẨN DARK MODE ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212'
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 20
    },
    backBtn: {
        padding: 8,
        backgroundColor: '#1a1a1a',
        borderRadius: 20
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold'
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        // Hiệu ứng đổ bóng cho card
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3
    },
    cover: {
        width: 64,
        height: 64,
        borderRadius: 6,
        backgroundColor: '#333'
    },
    info: {
        flex: 1,
        marginLeft: 16
    },
    albumTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    albumSub: {
        color: '#b3b3b3',
        fontSize: 13,
        marginTop: 4
    },
    empty: {
        alignItems: 'center',
        marginTop: 120
    },
    emptyText: {
        color: '#fff',
        marginTop: 15,
        fontSize: 18,
        fontWeight: 'bold'
    },
    emptySubText: {
        color: '#666',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center'
    }
});