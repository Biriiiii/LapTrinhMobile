import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePlayer } from '../context/PlayerContext';

export default function PlayerControls() {
    const { isPlaying, isBuffering, status, pauseTrack, resumeTrack, seek } = usePlayer();

    // State cục bộ để thanh Slider không bị "nhảy" khi đang kéo
    const [slidingValue, setSlidingValue] = useState(0);
    const [isSliding, setIsSliding] = useState(false);

    const position = status?.positionMillis || 0;
    const duration = status?.durationMillis || 0;
    

    // Cập nhật giá trị Slider theo nhạc (chỉ khi người dùng không đang kéo)
    useEffect(() => {
        if (!isSliding) {
            setSlidingValue(position);
        }
    }, [position, isSliding]);

    const formatTime = (millis: number) => {
        if (!millis || millis < 0) return "0:00";
        const minutes = Math.floor(millis / 60000);
        const seconds = Math.floor((millis % 60000) / 1000);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleSlidingComplete = async (value: number) => {
        await seek(value); // Nhảy đến đoạn nhạc mới
        setIsSliding(false); // Trả lại quyền cập nhật cho status
    };

    return (
        <View style={styles.container}>
            {/* THANH SLIDER TỐI ƯU */}
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration > 0 ? duration : 1}
                value={slidingValue}
                onValueChange={(val) => {
                    setIsSliding(true);
                    setSlidingValue(val);
                }}
                onSlidingComplete={handleSlidingComplete}
                minimumTrackTintColor="#1DB954"
                maximumTrackTintColor="#4f4f4f"
                thumbTintColor="#fff"
            />

            {/* HIỂN THỊ THỜI GIAN */}
            <View style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTime(isSliding ? slidingValue : position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            {/* CÁC NÚT ĐIỀU KHIỂN CHUẨN SPOTIFY */}
            <View style={styles.controls}>
                <TouchableOpacity activeOpacity={0.7}>
                    <MaterialCommunityIcons name="shuffle" size={24} color="#1DB954" />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7}>
                    <Ionicons name="play-skip-back" size={36} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.playBtn}
                    onPress={isPlaying ? pauseTrack : resumeTrack}
                    activeOpacity={0.8}
                >
                    {isBuffering ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Ionicons
                            name={isPlaying ? "pause" : "play"}
                            size={38}
                            color="#000"
                            style={!isPlaying ? { marginLeft: 4 } : {}} // Căn giữa icon play
                        />
                    )}
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7}>
                    <Ionicons name="play-skip-forward" size={36} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7}>
                    <MaterialCommunityIcons name="repeat" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%', paddingHorizontal: 20, marginTop: 10 },
    slider: { width: '100%', height: 40 },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        marginTop: -5
    },
    timeText: { color: '#b3b3b3', fontSize: 12, fontWeight: '500' },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 10
    },
    playBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        // Hiệu ứng bóng đổ cho nút Play
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
});