import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePlayer } from '../context/PlayerContext';

export default function PlayerControls() {
    const { isPlaying, status, pauseTrack, resumeTrack, seek } = usePlayer();

    // Tính toán thời gian
    const position = status?.positionMillis || 0;
    const duration = status?.durationMillis || 0;

    const formatTime = (millis: number) => {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <View style={styles.container}>
            {/* THANH SLIDER CHẠY THEO NHẠC */}
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                onSlidingComplete={seek} // Khi thả tay ra thì nhạc nhảy tới đoạn đó
                minimumTrackTintColor="#1DB954"
                maximumTrackTintColor="#4f4f4f"
                thumbTintColor="#fff"
            />

            {/* HIỂN THỊ THỜI GIAN */}
            <View style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            {/* CÁC NÚT ĐIỀU KHIỂN */}
            <View style={styles.controls}>
                <TouchableOpacity>
                    <MaterialCommunityIcons name="shuffle" size={24} color="#1DB954" />
                </TouchableOpacity>

                <TouchableOpacity>
                    <Ionicons name="play-skip-back" size={36} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.playBtn}
                    onPress={isPlaying ? pauseTrack : resumeTrack}
                >
                    <Ionicons name={isPlaying ? "pause" : "play"} size={38} color="#000" />
                </TouchableOpacity>

                <TouchableOpacity>
                    <Ionicons name="play-skip-forward" size={36} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity>
                    <MaterialCommunityIcons name="repeat" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%', paddingHorizontal: 20 },
    slider: { width: '100%', height: 40 },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
    timeText: { color: '#b3b3b3', fontSize: 12 },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20
    },
    playBtn: {
        width: 70, height: 70, borderRadius: 35,
        backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center'
    }
});