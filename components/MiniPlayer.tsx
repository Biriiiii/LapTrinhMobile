import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePlayer } from '../context/PlayerContext';

// Thêm Ionicons vào import nếu chưa có
import { Ionicons } from '@expo/vector-icons';

export default function MiniPlayer() {
    const router = useRouter();
    const { currentTrack, isPlaying, pauseTrack, resumeTrack, status } = usePlayer();

    if (!currentTrack) return null;

    // Tính toán phần trăm thanh tiến trình (Progress Bar)
    const position = status?.positionMillis || 0;
    const duration = status?.durationMillis || 1;
    const progress = (position / duration) * 100;

    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.9}
            onPress={() => router.push('/player')}
        >
            {/* Nhãn Đề xuất cho bạn (Giống ảnh 2) */}
            <Text style={styles.suggestText}>Đề xuất cho bạn</Text>

            <View style={styles.mainRow}>
                {/* Ảnh bìa bài hát */}
                <Image
                    source={{ uri: currentTrack.coverUrl || 'https://via.placeholder.com/50' }}
                    style={styles.coverImg}
                />

                {/* Thông tin Bài hát & Nghệ sĩ */}
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>
                        {currentTrack.title}
                    </Text>
                    <View style={styles.artistRow}>
                        {/* Icon xanh lá nhỏ cạnh tên nghệ sĩ */}
                        <MaterialIcons name="verified" size={12} color="#1DB954" style={{ marginRight: 4 }} />
                        <Text style={styles.artist} numberOfLines={1}>
                            {currentTrack.artist}
                        </Text>
                    </View>
                </View>

                {/* Cụm icon bên phải: Kết nối thiết bị & Play/Pause */}
                <View style={styles.controls}>
                    <TouchableOpacity style={{ marginRight: 20 }}>
                        <MaterialIcons name="devices" size={22} color="#b3b3b3" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => isPlaying ? pauseTrack() : resumeTrack()}>
                        <Ionicons
                            name={isPlaying ? "pause" : "play"}
                            size={26}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 🔥 THANH TIẾN TRÌNH CỰC MỎNG (Dưới đáy) */}
            <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        // 🔥 Đẩy lên trên thanh Tab Bar (60 + 5 = 65)
        bottom: 65,
        left: 10,
        right: 10,
        backgroundColor: '#282828',
        borderRadius: 8,
        paddingTop: 8,
        overflow: 'hidden',
        // Đảm bảo MiniPlayer luôn nằm trên cùng
        zIndex: 999,
        elevation: 10,
    },
    suggestText: {
        color: '#b3b3b3',
        fontSize: 10,
        marginLeft: 12,
        marginBottom: 4,
        fontWeight: '500',
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingBottom: 8,
    },
    coverImg: {
        width: 40,
        height: 40,
        borderRadius: 4,
    },
    info: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    artistRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    artist: {
        color: '#b3b3b3',
        fontSize: 12,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    // Style cho thanh Progress chuẩn Spotify
    progressBg: {
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: '100%',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#1DB954', // Màu xanh Spotify
    }
});