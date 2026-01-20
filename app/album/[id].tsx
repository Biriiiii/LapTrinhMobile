import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import apiClient from '../../services/apiClient';
import { MusicService } from '../../services/musicService';

export default function AlbumDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [album, setAlbum] = useState<any>(null);
    const [songs, setSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Kiểm tra đã sở hữu album hay chưa
    const [isOwned, setIsOwned] = useState(false);

    useEffect(() => {
        fetchAlbumDetail();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchAlbumDetail = async () => {
        try {
            setLoading(true);

            // 1. Gọi đồng thời: Chi tiết Album, Danh sách bài hát, và Danh sách album đã mua của user
            const [albumRes, songsRes, myAlbumsRes] = await Promise.all([
                apiClient.get(`/public/albums/${id}`),
                apiClient.get(`/public/albums/${id}/songs`).catch(() => ({ data: [] })),
                apiClient.get(`/customer/profile/my-albums`).catch(() => ({ data: [] }))
            ]);

            setAlbum(albumRes.data);
            setSongs(songsRes.data);

            // 2. KIỂM TRA SỞ HỮU: 
            const ownedList = myAlbumsRes.data;
            const checkOwned = ownedList.some((item: any) => item.id.toString() === id.toString());
            setIsOwned(checkOwned);

        } catch (error) {
            console.error("Lỗi tải chi tiết album:", error);
            Alert.alert("Lỗi", "Không thể tải thông tin album.");
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý mua album
    const handleBuy = () => {
        Alert.alert("Xác nhận mua", `Bạn có muốn mua Album ${album?.title} với giá ${album?.price?.toLocaleString()}đ?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Mua ngay",
                onPress: async () => {
                    try {
                        await MusicService.customer.purchaseAlbum(id as string);
                        Alert.alert("Thành công", "Chúc mừng bạn đã sở hữu album này!");
                        fetchAlbumDetail(); // Load lại dữ liệu để cập nhật trạng thái đã sở hữu
                    } catch (error: any) {
                        console.error('Lỗi mua album:', error);
                        const errorMessage = error?.response?.data?.message || "Giao dịch thất bại. Vui lòng kiểm tra số dư ví.";
                        Alert.alert("Lỗi", errorMessage);
                    }
                }
            }
        ]);
    };

    // HÀM XỬ LÝ PHÁT NHẠC
    const handlePlaySong = async (index: number) => {
        if (!isOwned) {
            Alert.alert("Yêu cầu mua", "Bạn cần mua album này để nghe toàn bộ các bài hát.");
            return;
        }

        const currentSong = songs[index];

        try {
            // 1. Gọi API để lấy stream info (trả về JSON với streamUrl)
            const streamResponse = await apiClient.get(`/customer/music/stream/${currentSong.id}`);

            // 2. Lấy streamUrl từ response JSON
            const { streamUrl, canStream, message } = streamResponse.data;

            if (!canStream) {
                Alert.alert("Lỗi", message || "Bạn không có quyền nghe bài hát này.");
                return;
            }

            console.log('Song data:', currentSong);
            console.log('Stream info:', streamResponse.data);
            console.log('Actual stream URL:', streamUrl);

            // 3. Chuyển hướng sang màn hình Player với streamUrl từ S3
            router.push({
                pathname: '/player',
                params: {
                    songId: currentSong.id.toString(),
                    title: currentSong.title || 'Unknown Song',
                    artist: currentSong.artistName || album?.artistName || "Unknown Artist",
                    coverUrl: album?.coverUrl || 'https://via.placeholder.com/350',
                    streamUrl: streamUrl, // URL từ S3 AWS
                    albumId: id?.toString(),
                    index: index.toString()
                }
            });
        } catch (error: any) {
            console.error('Lỗi phát nhạc:', error);
            const errorMessage = error?.response?.data?.message || "Không thể phát nhạc. Vui lòng thử lại.";
            Alert.alert("Lỗi", errorMessage);
        }
    };

    if (loading) return <View style={styles.centered}><ActivityIndicator color="#1DB954" size="large" /></View>;

    return (
        <ScrollView style={styles.container}>
            {/* Nút Quay lại */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Header Album */}
            <View style={styles.header}>
                <Image
                    source={{ uri: album?.coverUrl || 'https://via.placeholder.com/300' }}
                    style={styles.coverImage}
                />
                <Text style={styles.title}>{album?.title}</Text>
                <Text style={styles.artistName}>Album • {album?.artistName || "Nghệ sĩ"}</Text>

                <View style={styles.actionRow}>
                    {isOwned ? (
                        // NẾU ĐÃ SỞ HỮU: Nút Phát nhạc tổng
                        <TouchableOpacity
                            style={[styles.buyButton, { backgroundColor: '#1DB954' }]}
                            onPress={() => handlePlaySong(0)}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="play" size={18} color="#000" />
                                <Text style={[styles.buyText, { marginLeft: 8 }]}>PHÁT NHẠC</Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        // NẾU CHƯA SỞ HỮU: Hiện nút Mua
                        <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
                            <Text style={styles.buyText}>MUA {album?.price?.toLocaleString()}đ</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.iconCircle}>
                        <Feather name="heart" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Danh sách bài hát */}
            <View style={styles.songList}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Danh sách bài hát</Text>
                    {isOwned && <MaterialIcons name="verified" size={20} color="#1DB954" />}
                </View>

                {songs.map((song: any, index: number) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.songItem}
                        onPress={() => handlePlaySong(index)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.songNumber}>{index + 1}</Text>

                        <View style={{ flex: 1 }}>
                            <Text style={[styles.songTitle, !isOwned && { color: '#888' }]}>
                                {song.title}
                            </Text>
                            <Text style={styles.songSub}>{song.artistName || album?.artistName}</Text>
                        </View>

                        {/* Icon trạng thái bài hát */}
                        <Feather
                            name={isOwned ? "play-circle" : "lock"}
                            size={22}
                            color={isOwned ? "#1DB954" : "#555"}
                        />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Khoảng trống cuối để không bị Player bar che (nếu có) */}
            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    centered: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
    backButton: {
        marginTop: 50,
        marginLeft: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: { alignItems: 'center', padding: 20 },
    coverImage: {
        width: 220,
        height: 220,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15
    },
    title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 25, textAlign: 'center' },
    artistName: { color: '#b3b3b3', fontSize: 14, marginTop: 5 },
    actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 25 },
    buyButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 35,
        paddingVertical: 14,
        borderRadius: 30,
        marginRight: 15
    },
    buyText: { color: '#000', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center'
    },
    songList: { padding: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 5
    },
    songNumber: { color: '#b3b3b3', marginRight: 15, width: 25, fontSize: 14 },
    songTitle: { color: '#fff', fontSize: 16, fontWeight: '500' },
    songSub: { color: '#b3b3b3', fontSize: 13, marginTop: 2 }
});