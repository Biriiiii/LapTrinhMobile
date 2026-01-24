import { Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { usePlayer } from '../../context/PlayerContext';
import apiClient from '../../services/apiClient';

export default function AlbumDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { playPlaylist, currentTrack, isPlaying } = usePlayer();

    const [album, setAlbum] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isOwned, setIsOwned] = useState(false);

    // --- 1. LẤY DỮ LIỆU TỔNG HỢP ---
    const fetchAlbumDetail = async () => {
        try {
            if (!album) setLoading(true);
            const [resAlb, resFavs, resOwned] = await Promise.all([
                apiClient.get(`/public/albums/${id}`),
                apiClient.get('/customer/favorites/my-albums').catch(() => ({ data: [] })),
                apiClient.get('/customer/profile/my-albums').catch(() => ({ data: [] }))
            ]);

            setAlbum(resAlb.data);
            setIsFavorite(resFavs.data.some((item: any) => item.id === Number(id)));
            setIsOwned(resOwned.data.some((item: any) => item.id === Number(id)));
        } catch (error) {
            console.error("Lỗi tải album:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { if (id) fetchAlbumDetail(); }, [id]));

    // --- 2. HÀM GỌI ENDPOINT MUA ALBUM (JAVA) ---
    const handlePurchase = async () => {
        Alert.alert(
            "Xác nhận mua",
            `Bạn muốn dùng số dư ví để mua "${album?.title}" với giá ${album?.price?.toLocaleString('vi-VN')}đ?`,
            [
                { text: "Để sau", style: "cancel" },
                {
                    text: "MUA NGAY",
                    onPress: async () => {
                        try {
                            // 🔥 Gọi đúng endpoint PostMapping bạn đã viết
                            const response = await apiClient.post(`/customer/profile/purchase-album/${id}`);

                            // Hiển thị thông báo chúc mừng từ Backend
                            Alert.alert("Thành công", response.data);

                            // Tải lại dữ liệu để isOwned thành true -> Mở khóa nhạc ngay
                            fetchAlbumDetail();
                        } catch (e: any) {
                            const errorMsg = e.response?.data?.message || "Giao dịch thất bại. Vui lòng kiểm tra lại số dư!";
                            Alert.alert("Lỗi", errorMsg);
                        }
                    }
                }
            ]
        );
    };

    const handlePlayAlbumSong = (index: number) => {
        if (!isOwned) {
            handlePurchase();
            return;
        }
        const albumTracks = album.songs.map((s: any) => ({
            id: s.id,
            title: s.title,
            artist: s.artistName || album.artistName,
            coverUrl: s.coverUrl || album.coverUrl,
        }));
        playPlaylist(albumTracks, index);
        router.push('/player');
    };

    if (loading && !album) return (
        <View style={styles.centered}><ActivityIndicator color="#1DB954" size="large" /></View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}><Feather name="arrow-left" size={24} color="#fff" /></TouchableOpacity>
                <Text style={styles.headerSmallTitle} numberOfLines={1}>{album?.title}</Text>
                <TouchableOpacity onPress={() => { }} style={styles.headerBtn}><Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#1DB954" : "#fff"} /></TouchableOpacity>
            </View>

            <FlatList
                data={album?.songs || []}
                keyExtractor={(item: any) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 120 }}
                ListHeaderComponent={() => (
                    <View style={styles.heroCentered}>
                        <View>
                            <Image source={{ uri: album?.coverUrl }} style={[styles.heroArt, !isOwned && { opacity: 0.6 }]} />
                            {!isOwned && <View style={styles.lockOverlayHero}><Feather name="lock" size={40} color="#fff" /></View>}
                        </View>

                        <Text style={styles.mainTitle}>{album?.title}</Text>
                        <View style={styles.greenBar} />
                        <Text style={styles.subTitle}>{album?.artistName} • {album?.releaseYear}</Text>

                        {/* NÚT PHÁT HOẶC MUA */}
                        {isOwned ? (
                            <TouchableOpacity style={styles.bigPlayBtn} onPress={() => handlePlayAlbumSong(0)}>
                                <MaterialIcons name="play-arrow" size={30} color="#000" />
                                <Text style={styles.playText}>PHÁT TẤT CẢ</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={[styles.bigPlayBtn, { backgroundColor: '#FFB142' }]} onPress={handlePurchase}>
                                <FontAwesome5 name="shopping-cart" size={18} color="#000" />
                                <Text style={styles.playText}>MUA ALBUM - {album?.price?.toLocaleString('vi-VN')}đ</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                renderItem={({ item, index }) => (
                    <TouchableOpacity style={styles.songRow} onPress={() => handlePlayAlbumSong(index)}>
                        <Text style={[styles.songIndex, currentTrack?.id === item.id && { color: '#1DB954' }]}>{index + 1}</Text>
                        <View style={{ flex: 1, opacity: isOwned ? 1 : 0.5 }}>
                            <Text style={[styles.songTitle, currentTrack?.id === item.id && { color: '#1DB954' }]} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.songArtist}>{item.artistName || album?.artistName}</Text>
                        </View>
                        {!isOwned && <Feather name="lock" size={16} color="#444" style={{ marginRight: 10 }} />}
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    centered: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 60 },
    headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    headerSmallTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', flex: 1, textAlign: 'center' },
    heroCentered: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20 },
    heroArt: { width: 200, height: 200, borderRadius: 10 },
    lockOverlayHero: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10 },
    mainTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 25, textAlign: 'center' },
    greenBar: { width: 40, height: 4, backgroundColor: '#1DB954', borderRadius: 2, marginTop: 12 },
    subTitle: { color: '#b3b3b3', fontSize: 14, fontWeight: '500', marginTop: 12 },
    bigPlayBtn: { flexDirection: 'row', backgroundColor: '#1DB954', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 30, marginTop: 25, alignItems: 'center', elevation: 5 },
    playText: { color: '#000', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
    songRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
    songIndex: { color: '#b3b3b3', fontSize: 14, width: 35 },
    songTitle: { color: '#fff', fontSize: 16, fontWeight: '500' },
    songArtist: { color: '#b3b3b3', fontSize: 13, marginTop: 3 },
});