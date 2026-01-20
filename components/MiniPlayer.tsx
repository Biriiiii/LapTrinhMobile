import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePlayer } from '../context/PlayerContext';

export default function MiniPlayer() {
    const { currentTrack, isPlaying, pauseTrack, resumeTrack } = usePlayer();
    const router = useRouter();

    if (!currentTrack) return null;

    const handlePress = () => {
        router.push({
            pathname: '/player',
            params: {
                songId: currentTrack.id,
                title: currentTrack.title,
                artist: currentTrack.artist,
                coverUrl: currentTrack.coverUrl,
                streamUrl: currentTrack.streamUrl
            }
        });
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
            <Image
                source={{ uri: currentTrack.coverUrl }}
                style={styles.coverImage}
            />

            <View style={styles.songInfo}>
                <Text style={styles.title} numberOfLines={1}>
                    {currentTrack.title}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                    {currentTrack.artist}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.playButton}
                onPress={isPlaying ? pauseTrack : resumeTrack}
            >
                <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={24}
                    color="#fff"
                />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 90, // Để không bị tab bar che
        left: 0,
        right: 0,
        backgroundColor: '#282828',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 0.5,
        borderTopColor: '#404040',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    coverImage: {
        width: 40,
        height: 40,
        borderRadius: 4,
        marginRight: 12,
    },
    songInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
    },
    artist: {
        color: '#b3b3b3',
        fontSize: 12,
    },
    playButton: {
        padding: 8,
    },
});