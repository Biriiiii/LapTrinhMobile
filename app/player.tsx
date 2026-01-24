import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated, Easing,
    Image,
    SafeAreaView, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import apiClient from '../services/apiClient';

export default function PlayerScreen() {
    const router = useRouter();
    const { currentTrack, isPlaying, isBuffering, status, pauseTrack, resumeTrack, seek, nextTrack, prevTrack, repeatMode, toggleRepeatMode } = usePlayer();
    const [playlists, setPlaylists] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);

    // --- GIỮ NGUYÊN LOGIC ĐĨA XOAY ---
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
        const res = await apiClient.get('/customer/playlists/my-playlists');
        setPlaylists(res.data);
    };

    const position = status?.positionMillis || 0;
    const duration = status?.durationMillis || 1;
    const formatTime = (ms: number) => {
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. Header tối giản */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Feather name="chevron-down" size={30} color="#fff" /></TouchableOpacity>
                <Text style={styles.headerLabel}>Đề xuất cho bạn</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}><Feather name="more-horizontal" size={24} color="#fff" /></TouchableOpacity>
            </View>

            {/* 2. Đĩa xoay (Giữ nguyên theo yêu cầu) */}
            <View style={styles.coverContainer}>
                <Animated.View style={{ transform: [{ rotate }] }}>
                    <Image source={{ uri: currentTrack?.coverUrl }} style={styles.coverImage} />
                </Animated.View>
            </View>

            {/* 3. Thông tin bài hát căn giữa gọn gàng */}
            <View style={styles.songInfo}>
                <Text style={styles.title} numberOfLines={1}>{currentTrack?.title}</Text>
                <Text style={styles.artist}>{currentTrack?.artist}</Text>
            </View>

            {/* 4. Thanh Progress gọn */}
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

            {/* 5. Bộ nút điều khiển cân đối */}
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
});