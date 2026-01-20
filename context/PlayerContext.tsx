import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { createContext, useContext, useEffect, useState } from 'react';

// --- 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
interface Track {
    id: number;
    title: string;
    artist: string;
    coverUrl: string;
    streamUrl: string;
}

interface PlayerContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    status: any; // Thông tin vị trí & thời lượng nhạc
    playTrack: (track: Track) => void;
    pauseTrack: () => void;
    resumeTrack: () => void;
    seek: (millis: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// --- 2. PROVIDER CHÍNH ---
export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [status, setStatus] = useState<any>(null);

    // Khởi tạo Audio mode
    useEffect(() => {
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });
    }, []);

    // Cập nhật trạng thái nhạc (position, duration)
    const onPlaybackStatusUpdate = (newStatus: AVPlaybackStatus) => {
        if (newStatus.isLoaded) {
            setStatus(newStatus);
            setIsPlaying(newStatus.isPlaying);
            if (newStatus.didJustFinish) {
                setIsPlaying(false);
            }
        }
    };

    const playTrack = async (track: Track) => {
        try {
            console.log('Attempting to play track:', track);

            if (!track.streamUrl) {
                console.error('StreamURL is missing!');
                return;
            }

            if (sound) {
                await sound.unloadAsync();
            }

            console.log('Creating audio with URL:', track.streamUrl);

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: track.streamUrl },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );
            setSound(newSound);
            setCurrentTrack(track);
            setIsPlaying(true);

            console.log('Audio loaded successfully');
        } catch (error) {
            console.error("Lỗi phát nhạc:", error);
            console.error("URL gây lỗi:", track.streamUrl);
        }
    };

    const pauseTrack = async () => {
        if (sound) {
            await sound.pauseAsync();
            setIsPlaying(false);
        }
    };

    const resumeTrack = async () => {
        if (sound) {
            await sound.playAsync();
            setIsPlaying(true);
        }
    };

    const seek = async (millis: number) => {
        if (sound) {
            await sound.setPositionAsync(millis);
        }
    };

    // ĐOẠN NÀY ĐÃ SỬA LỖI: Liệt kê rõ ràng tất cả các giá trị
    return (
        <PlayerContext.Provider
            value={{
                currentTrack,
                isPlaying,
                status,
                playTrack,
                pauseTrack,
                resumeTrack,
                seek
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) throw new Error("usePlayer must be used within PlayerProvider");
    return context;
};