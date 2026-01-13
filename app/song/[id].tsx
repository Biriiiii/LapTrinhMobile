import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
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

    // Lấy các hàm và trạng thái từ PlayerContext toàn cục
    const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack } = usePlayer();

    const [song, setSong] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 1. Tải thông tin bài hát từ API
    useEffect(() => {
        fetchSongDetail();
    }, [id]);

    const fetchSongDetail = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/public/songs/${id}`);
            setSong(res.data);
        } catch (error) {
            console.error("Lỗi tải chi tiết bài hát:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. TỰ ĐỘNG PHÁT KHI DỮ LIỆU TẢI XONG
    useEffect(() => {
        if (song && currentTrack?.id !== song.id) {
            // Nếu bài hát này chưa được phát, thì tự động gọi hàm phát luôn
            playTrack({
                id: song.id,
                title: song.title,
                artist: song.artistName || "Nghệ sĩ",
                coverUrl: song.coverUrl || song.albumCoverUrl,
                streamUrl: song.streamUrl
            });
        }
    }, [song]); // Chạy ngay khi biến 'song' có dữ liệu

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseTrack();
        } else {
            resumeTrack();
        }
    };

    if (loading) return (
        <View style={styles.centered}>
            <ActivityIndicator color="#1DB954" size="large" />
            <Text style={{ color: '#fff', marginTop: 10 }}>Đang chuẩn bị nhạc...</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="chevron-down" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ĐANG PHÁT</Text>
                <TouchableOpacity>
                    <Feather name="more-vertical" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Artwork */}
            <View style={styles.artworkContainer}>
                <Image
                    source={{ uri: song?.coverUrl || song?.albumCoverUrl || 'https://via.placeholder.com/350' }}
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
                    maximumValue={1}
                    value={0} // Để đồng bộ thời gian thực, bạn cần thêm state position/duration vào Context
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
                <TouchableOpacity>
                    <MaterialCommunityIcons name="shuffle" size={26} color="#1DB954" />
                </TouchableOpacity>

                <TouchableOpacity>
                    <Ionicons name="play-skip-back" size={36} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.playPauseBtn} onPress={handlePlayPause}>
                    <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={40}
                        color="#000"
                    />
                </TouchableOpacity>

                <TouchableOpacity>
                    <Ionicons name="play-skip-forward" size={36} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity>
                    <MaterialCommunityIcons name="repeat" size={26} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.footerIcons}>
                <Feather name="share-2" size={20} color="#b3b3b3" />
                <MaterialCommunityIcons name="playlist-music" size={24} color="#b3b3b3" />
            </View>
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
    footerIcons: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30, marginTop: 40 }
});