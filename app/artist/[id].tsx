import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'; // Thêm useFocusEffect
import React, { useCallback, useState } from 'react'; // Thêm useCallback
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import apiClient from '../../services/apiClient';

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
interface Album {
    id: number;
    title?: string;
    name?: string;
    image?: string;
}

export default function ArtistDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [artist, setArtist] = useState<any>(null);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);

    // --- HÀM FETCH DATA RIÊNG BIỆT ---
    const fetchArtistData = async () => {
        try {
            // Chỉ hiện loading lớn nếu chưa có dữ liệu nghệ sĩ
            if (!artist) setLoading(true);

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

    // --- 🔥 CẬP NHẬT TỨC THÌ: Dùng useFocusEffect thay cho useEffect ---
    // Chạy mỗi khi màn hình này hiện ra trước mắt người dùng
    useFocusEffect(
        useCallback(() => {
            if (id) fetchArtistData();
        }, [id])
    );

    if (loading && !artist) return <View style={styles.centered}><ActivityIndicator color="#1DB954" size="large" /></View>;

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: artist?.image || 'https://via.placeholder.com/500' }}
                style={styles.bannerImage}
            />

            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.infoBox}>
                <Text style={styles.name}>{artist?.name}</Text>
                <Text style={styles.stats}>Nghệ sĩ</Text>
                <TouchableOpacity style={styles.followBtn}>
                    <Text style={styles.followText}>THEO DÕI</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Danh mục Album</Text>

            <FlatList
                data={albums}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.albumRow}
                        onPress={() => router.push(`/album/${item.id}` as any)}
                    >
                        <Image source={{ uri: item.image || 'https://via.placeholder.com/60' }} style={styles.albumImg} />
                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text style={styles.albumName}>{item.title || item.name || "Album không tên"}</Text>
                            <Text style={styles.albumYear}>2024 • Album</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#666" />
                    </TouchableOpacity>
                )}
                style={{ paddingHorizontal: 20 }}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={<View style={{ height: 100 }} />} // Khoảng trống cuối danh sách
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    centered: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
    bannerImage: { width: '100%', height: 350 }, // Tăng chiều cao banner cho xịn xò
    backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20, zIndex: 10 },
    infoBox: { padding: 20, marginTop: -80 }, // Đẩy infoBox lên đè một phần banner
    name: { color: '#fff', fontSize: 48, fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
    stats: { color: '#b3b3b3', marginTop: 5, fontSize: 14, fontWeight: '600' },
    followBtn: { borderWidth: 1, borderColor: '#fff', paddingHorizontal: 25, paddingVertical: 10, borderRadius: 25, alignSelf: 'flex-start', marginTop: 20 },
    followText: { color: '#fff', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
    sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', margin: 20 },
    albumRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: '#1a1a1a', padding: 10, borderRadius: 8 },
    albumImg: { width: 60, height: 60, borderRadius: 4 },
    albumName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    albumYear: { color: '#b3b3b3', fontSize: 13, marginTop: 4 }
});