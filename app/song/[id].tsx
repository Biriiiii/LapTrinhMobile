import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { usePlayer } from '../../context/PlayerContext';
import apiClient from '../../services/apiClient';

const { width } = Dimensions.get('window');

export default function SongDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack, status } = usePlayer();

    const [song, setSong] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // State cho tính năng Thêm vào Playlist
    const [playlists, setPlaylists] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);

    // --- 1. HÀM FETCH DATA (Fix lỗi StreamURL is missing) ---
    const fetchSongDetail = async () => {
        try {
            if (!song) setLoading(true);

            // Gọi đồng thời: Metadata (Public) và Stream Link (Customer/Private)
            const [songRes, streamRes] = await Promise.all([
                apiClient.get(`/public/songs/${id}`),
                apiClient.get(`/customer/music/stream/${id}`).catch(() => ({ data: {} }))
            ]);

            const songData = songRes.data;
            const streamData = streamRes.data;

            setSong({
                ...songData,
                streamUrl: streamData.streamUrl, // Link nhạc từ S3
                coverUrl: songData.coverUrl || songData.thumbnail || songData.albumCoverUrl
            });
        } catch (error) {
            console.error("Lỗi tải chi tiết bài hát:", error);
            Alert.alert("Lỗi", "Không thể tải thông tin bài hát.");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. TỰ ĐỘNG CẬP NHẬT KHI FOCUS ---
    useFocusEffect(
        useCallback(() => {
            if (id) fetchSongDetail();
        }, [id])
    );

    // --- 3. TỰ ĐỘNG PHÁT NHẠC KHI CÓ LINK ---
    useEffect(() => {
        if (song && song.streamUrl && currentTrack?.id !== song.id) {
            playTrack({
                id: song.id,
                title: song.title,
                artist: song.artistName || "Nghệ sĩ",
                coverUrl: song.coverUrl,
                streamUrl: song.streamUrl // Bây giờ đã có link từ S3
            });
        }
    }, [song]);

    const openPlaylistModal = async () => {
        try {
            const res = await apiClient.get('/customer/playlists/my-playlists');
            setPlaylists(res.data);
            setModalVisible(true);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể lấy danh sách playlist.");
        }
    };

    const handleAddToPlaylist = async (playlistId: number) => {
        try {
            await apiClient.post(`/customer/playlists/${playlistId}/songs`, [Number(id)]);
            Alert.alert("Thành công", "Đã thêm vào playlist!");
            setModalVisible(false);
        } catch (error) {
            Alert.alert("Lỗi", "Bài hát đã có hoặc lỗi kết nối.");
        }
    };

    const position = status?.positionMillis || 0;
    const duration = status?.durationMillis || 1;

    if (loading && !song) return (
        <View style={styles.centered}><ActivityIndicator color="#1DB954" size="large" /></View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="chevron-down" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ĐANG PHÁT</Text>
                <TouchableOpacity onPress={openPlaylistModal}>
                    <Feather name="plus-circle" size={26} color="#1DB954" />
                </TouchableOpacity>
            </View>

            {/* Artwork */}
            <View style={styles.artworkContainer}>
                <Image
                    source={{ uri: song?.coverUrl || 'https://via.placeholder.com/350' }}
                    style={styles.artwork}
                />
            </View>

            {/* Info */}
            <View style={styles.infoContainer}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.songTitle} numberOfLines={1}>{song?.title}</Text>
                    <Text style={styles.artistName}>{song?.artistName}</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="heart-outline" size={28} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Progress */}
            <View style={styles.progressSection}>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration}
                    value={position}
                    minimumTrackTintColor="#1DB954"
                    maximumTrackTintColor="#4f4f4f"
                    thumbTintColor="#fff"
                />
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>0:00</Text>
                    <Text style={styles.timeText}>{song?.formattedDuration || "0:00"}</Text>
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controlsContainer}>
                <TouchableOpacity><MaterialCommunityIcons name="shuffle" size={26} color="#1DB954" /></TouchableOpacity>
                <TouchableOpacity><Ionicons name="play-skip-back" size={36} color="#fff" /></TouchableOpacity>
                <TouchableOpacity style={styles.playPauseBtn} onPress={() => isPlaying ? pauseTrack() : resumeTrack()}>
                    <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity><Ionicons name="play-skip-forward" size={36} color="#fff" /></TouchableOpacity>
                <TouchableOpacity><MaterialCommunityIcons name="repeat" size={26} color="#fff" /></TouchableOpacity>
            </View>

            {/* MODAL PLAYLIST */}
            <Modal visible={isModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Thêm vào playlist</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={playlists}
                            keyExtractor={(item: any) => item.id.toString()}
                            renderItem={({ item }: any) => (
                                <TouchableOpacity
                                    style={styles.playlistRow}
                                    onPress={() => handleAddToPlaylist(item.id)}
                                >
                                    <View style={styles.playlistIcon}><Feather name="music" size={20} color="#fff" /></View>
                                    <Text style={styles.playlistNameText}>{item.name}</Text>
                                    <Feather name="plus" size={20} color="#1DB954" />
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    centered: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20 },
    headerTitle: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    artworkContainer: { alignItems: 'center', marginTop: 40 },
    artwork: { width: width * 0.85, height: width * 0.85, borderRadius: 8 },
    infoContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 30, marginTop: 40 },
    songTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    artistName: { color: '#b3b3b3', fontSize: 18, marginTop: 5 },
    progressSection: { paddingHorizontal: 20, marginTop: 30 },
    slider: { width: '100%', height: 40 },
    timeContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
    timeText: { color: '#b3b3b3', fontSize: 12 },
    controlsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30, marginTop: 20 },
    playPauseBtn: { width: 75, height: 75, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#282828', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '60%', padding: 25 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    playlistRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#333' },
    playlistIcon: { width: 40, height: 40, backgroundColor: '#444', borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    playlistNameText: { color: '#fff', fontSize: 16, flex: 1 }
});