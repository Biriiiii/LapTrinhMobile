import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated, Easing,
    Image, Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import apiClient from '../services/apiClient';

// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU (INTERFACE)
interface Playlist {
    id: number;
    name: string;
}

export default function PlayerScreen() {
    const router = useRouter();
    // currentTrack có thể là null theo định nghĩa của context
    const { currentTrack, isPlaying, status, pauseTrack, resumeTrack, seek, nextTrack, prevTrack, repeatMode, toggleRepeatMode } = usePlayer();

    // 2. KHAI BÁO KIỂU CHO STATE
    // Báo cho TS biết đây là mảng các Playlist, không phải mảng rỗng
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);

    // Xoay đĩa
    const rotateAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (isPlaying) {
            Animated.loop(Animated.timing(rotateAnim, { toValue: 1, duration: 12000, easing: Easing.linear, useNativeDriver: true })).start();
        } else {
            rotateAnim.stopAnimation();
        }
    }, [isPlaying]);

    const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    const fetchMyPlaylists = async () => {
        try {
            const res = await apiClient.get('/customer/playlists/my-playlists');
            setPlaylists(res.data);
            setModalVisible(true);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tải danh sách playlist");
        }
    };

    // 3. ĐỊNH NGHĨA KIỂU CHO THAM SỐ VÀ CHECK NULL
    const addToPlaylist = async (playlistId: number) => { // Sửa lỗi 'any' type

        // Sửa lỗi 'currentTrack' possibly null
        if (!currentTrack) {
            Alert.alert("Lỗi", "Không có bài hát nào đang phát.");
            return;
        }

        try {
            // currentTrack.id bây giờ đã an toàn để truy cập
            await apiClient.post(`/customer/playlists/${playlistId}/songs`, [currentTrack.id]);
            Alert.alert("Thành công", "Đã thêm vào playlist!");
            setModalVisible(false);
        } catch (error) {
            Alert.alert("Lỗi", "Bài hát đã có trong playlist hoặc lỗi hệ thống");
        }
    };

    // An toàn null cho status
    const position = status?.positionMillis || 0;
    const duration = status?.durationMillis || 1;

    const formatTime = (ms: number) => {
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Feather name="chevron-down" size={30} color="#fff" /></TouchableOpacity>
                <Text style={styles.headerLabel}>Đang phát</Text>
                <TouchableOpacity onPress={fetchMyPlaylists}><Feather name="plus-circle" size={26} color="#fff" /></TouchableOpacity>
            </View>

            {/* Đĩa xoay */}
            <View style={styles.coverContainer}>
                <Animated.View style={{ transform: [{ rotate }] }}>
                    {/* Sử dụng optional chaining cho currentTrack */}
                    <Image source={{ uri: currentTrack?.coverUrl }} style={styles.coverImage} />
                </Animated.View>
            </View>

            {/* Song Info */}
            <View style={styles.songInfo}>
                <Text style={styles.title} numberOfLines={1}>{currentTrack?.title || "Chưa chọn bài hát"}</Text>
                <Text style={styles.artist}>{currentTrack?.artist || "Unknown"}</Text>
            </View>

            {/* Progress Slider */}
            <View style={styles.progressBox}>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration}
                    value={position}
                    onSlidingComplete={seek}
                    minimumTrackTintColor="#1DB954"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#fff"
                />
                <View style={styles.timeRow}>
                    <Text style={styles.timeText}>{formatTime(position)}</Text>
                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                <TouchableOpacity><MaterialCommunityIcons name="shuffle" size={24} color="#1DB954" /></TouchableOpacity>
                <TouchableOpacity onPress={prevTrack}><Ionicons name="play-skip-back" size={32} color="#fff" /></TouchableOpacity>
                <TouchableOpacity style={styles.playBtn} onPress={isPlaying ? pauseTrack : resumeTrack}>
                    <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#000" style={!isPlaying && { marginLeft: 4 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={nextTrack}><Ionicons name="play-skip-forward" size={32} color="#fff" /></TouchableOpacity>
                <TouchableOpacity onPress={toggleRepeatMode}>
                    <MaterialCommunityIcons
                        name={repeatMode === 'one' ? "repeat-once" : "repeat"}
                        size={24}
                        color={repeatMode === 'off' ? "#fff" : "#1DB954"}
                    />
                </TouchableOpacity>
            </View>

            {/* Modal hiển thị Playlist */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Thêm vào playlist</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {/* item bây giờ đã được định kiểu là Playlist, không bị lỗi id/name nữa */}
                            {playlists.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.playlistItem}
                                    onPress={() => addToPlaylist(item.id)}
                                >
                                    <MaterialCommunityIcons name="playlist-music" size={30} color="#1DB954" />
                                    <Text style={styles.playlistName}>{item.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 30 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
    headerLabel: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
    coverContainer: { alignItems: 'center', marginVertical: 45 },
    coverImage: { width: 280, height: 280, borderRadius: 140, borderWidth: 4, borderColor: '#1e1e1e' },
    songInfo: { alignItems: 'center', marginBottom: 35 },
    title: { color: '#fff', fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
    artist: { color: '#b3b3b3', fontSize: 18, marginTop: 6, textAlign: 'center' },
    progressBox: { width: '100%', marginBottom: 30 },
    slider: { width: '105%', alignSelf: 'center', height: 40 },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -5 },
    timeText: { color: '#b3b3b3', fontSize: 11 },
    controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    playBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#282828', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '50%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    playlistItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#333' },
    playlistName: { color: '#fff', fontSize: 16, marginLeft: 15 },
});