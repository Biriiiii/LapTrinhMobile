import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import apiClient from '../../services/apiClient';

export default function AlbumDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [album, setAlbum] = useState<any>(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlbumDetail();
    }, [id]);

    const fetchAlbumDetail = async () => {
        try {
            setLoading(true);
            // Gọi đồng thời API lấy thông tin Album và danh sách bài hát trong album
            const [albumRes, songsRes] = await Promise.all([
                apiClient.get(`/public/albums/${id}`),
                apiClient.get(`/public/albums/${id}/songs`).catch(() => ({ data: [] }))
            ]);
            setAlbum(albumRes.data);
            setSongs(songsRes.data);
        } catch (error) {
            console.error("Lỗi tải chi tiết album:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = () => {
        Alert.alert("Xác nhận mua", `Bạn có muốn mua Album ${album?.title || album?.name} với giá ${album?.price?.toLocaleString()}đ?`, [
            { text: "Hủy", style: "cancel" },
            { text: "Mua ngay", onPress: () => Alert.alert("Thông báo", "Tính năng thanh toán đang được xử lý!") }
        ]);
    };

    if (loading) return <View style={styles.centered}><ActivityIndicator color="#1DB954" size="large" /></View>;

    return (
        <ScrollView style={styles.container}>
            {/* Nút Back */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Thông tin Album */}
            <View style={styles.header}>
                <Image source={{ uri: album?.image || 'https://via.placeholder.com/300' }} style={styles.coverImage} />
                <Text style={styles.title}>{album?.title || album?.name}</Text>
                <Text style={styles.artistName}>Album • {album?.artistName || "Nghệ sĩ"}</Text>

                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
                        <Text style={styles.buyText}>MUA {album?.price?.toLocaleString()}đ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconCircle}>
                        <Feather name="heart" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Danh sách bài hát */}
            <View style={styles.songList}>
                <Text style={styles.sectionTitle}>Danh sách bài hát</Text>
                {songs.map((song: any, index: number) => (
                    <View key={index} style={styles.songItem}>
                        <Text style={styles.songNumber}>{index + 1}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.songTitle}>{song.title}</Text>
                            <Text style={styles.songSub}>{song.artistName}</Text>
                        </View>
                        <Feather name="play-circle" size={20} color="#1DB954" />
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    centered: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
    backButton: { marginTop: 50, marginLeft: 20, zIndex: 10 },
    header: { alignItems: 'center', padding: 20 },
    coverImage: { width: 200, height: 200, borderRadius: 8, elevation: 10 },
    title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 20 },
    artistName: { color: '#b3b3b3', fontSize: 14, marginTop: 5 },
    actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
    buyButton: { backgroundColor: '#1DB954', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25, marginRight: 15 },
    buyText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
    iconCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#555', justifyContent: 'center', alignItems: 'center' },
    songList: { padding: 20 },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    songItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    songNumber: { color: '#b3b3b3', marginRight: 15, width: 20 },
    songTitle: { color: '#fff', fontSize: 16, fontWeight: '500' },
    songSub: { color: '#b3b3b3', fontSize: 13 }
});