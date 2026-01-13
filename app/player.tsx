import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Cần import thêm Ionicons cho nút Play chuyên nghiệp
import { Ionicons } from '@expo/vector-icons';

export default function PlayerScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Lấy dữ liệu từ params (được truyền từ trang Album Detail)
    const { songId, title, artist, coverUrl, streamUrl } = params;

    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    // 1. Khởi tạo và tải nhạc
    useEffect(() => {
        loadAudio();
        return () => {
            if (sound) {
                sound.unloadAsync(); // Giải phóng bộ nhớ khi thoát trang
            }
        };
    }, [streamUrl]);

    async function loadAudio() {
        try {
            // Ngừng âm thanh cũ nếu có
            if (sound) await sound.unloadAsync();

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: streamUrl as string },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );
            setSound(newSound);
            setIsPlaying(true);
        } catch (error) {
            console.error("Không thể tải nhạc:", error);
        }
    }

    // 2. Cập nhật trạng thái bài hát (thời gian đang chạy)
    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
            if (status.didJustFinish) setIsPlaying(false);
        }
    };

    // 3. Các hàm điều khiển
    const handlePlayPause = async () => {
        if (!sound) return;
        if (isPlaying) {
            await sound.pauseAsync();
        } else {
            await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = async (value: number) => {
        if (sound) {
            await sound.setPositionAsync(value);
        }
    };

    // Định dạng thời gian mm:ss
    const formatTime = (millis: number) => {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="chevron-down" size={30} color="#fff" />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.headerSub}>ĐANG PHÁT TỪ ALBUM</Text>
                    <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                </View>
                <Feather name="more-horizontal" size={24} color="#fff" />
            </View>

            {/* Ảnh bìa lớn */}
            <View style={styles.coverContainer}>
                <Image
                    source={{ uri: coverUrl as string || 'https://via.placeholder.com/350' }}
                    style={styles.coverImage}
                />
            </View>

            {/* Thông tin bài hát */}
            <View style={styles.songInfo}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    <Text style={styles.artist}>{artist}</Text>
                </View>
                <TouchableOpacity>
                    <Feather name="heart" size={24} color="#1DB954" />
                </TouchableOpacity>
            </View>

            {/* Thanh tiến trình */}
            <View style={styles.progressContainer}>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration}
                    value={position}
                    onSlidingComplete={handleSeek}
                    minimumTrackTintColor="#1DB954"
                    maximumTrackTintColor="#535353"
                    thumbTintColor="#fff"
                />
                <View style={styles.timeRow}>
                    <Text style={styles.timeText}>{formatTime(position)}</Text>
                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
            </View>

            {/* Bộ điều khiển */}
            <View style={styles.controls}>
                <TouchableOpacity>
                    <MaterialCommunityIcons name="shuffle" size={24} color="#b3b3b3" />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Feather name="skip-back" size={35} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playBtn} onPress={handlePlayPause}>
                    <Ionicons name={isPlaying ? "pause" : "play"} size={35} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Feather name="skip-forward" size={35} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity>
                    <MaterialCommunityIcons name="repeat" size={24} color="#b3b3b3" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
    headerSub: { color: '#b3b3b3', fontSize: 10, letterSpacing: 1, fontWeight: 'bold' },
    headerTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginTop: 2 },
    coverContainer: { alignItems: 'center', marginVertical: 40, elevation: 20 },
    coverImage: { width: 330, height: 330, borderRadius: 8 },
    songInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    artist: { color: '#b3b3b3', fontSize: 18, marginTop: 4 },
    progressContainer: { width: '100%', marginBottom: 20 },
    slider: { width: '105%', height: 40, alignSelf: 'center' },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
    timeText: { color: '#b3b3b3', fontSize: 12 },
    controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    playBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }
});