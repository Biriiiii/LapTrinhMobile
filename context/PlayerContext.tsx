import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

// --- Types ---
type RepeatMode = 'off' | 'all' | 'one';

interface Track {
    id: number;
    title: string;
    artist: string;
    coverUrl: string;
    streamUrl?: string;
}

interface PlayerContextType {
    currentTrack: Track | null;
    queue: Track[];
    currentIndex: number;
    isPlaying: boolean;
    isBuffering: boolean;
    status: any;
    repeatMode: RepeatMode;
    playTrack: (track: Track) => Promise<void>;
    playPlaylist: (tracks: Track[], startIndex: number) => Promise<void>;
    pauseTrack: () => Promise<void>;
    resumeTrack: () => Promise<void>;
    seek: (millis: number) => Promise<void>;
    nextTrack: () => Promise<void>;
    prevTrack: () => Promise<void>;
    toggleRepeatMode: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [queue, setQueue] = useState<Track[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

    // Cấu hình chế độ âm thanh hệ thống
    useEffect(() => {
        Audio.setAudioModeAsync({
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
        });
        // Cleanup khi đóng ứng dụng
        return () => { if (sound) sound.unloadAsync(); };
    }, []);

    // Cập nhật trạng thái phát nhạc liên tục
    const onPlaybackStatusUpdate = (newStatus: AVPlaybackStatus) => {
        if (!newStatus.isLoaded) {
            if (newStatus.error) console.error(`❌ Lỗi phát nhạc: ${newStatus.error}`);
            return;
        }

        setStatus(newStatus);
        setIsPlaying(newStatus.isPlaying);
        setIsBuffering(newStatus.isBuffering);

        // Tự động chuyển bài khi kết thúc
        if (newStatus.didJustFinish && !newStatus.isLooping) {
            if (repeatMode === 'one') {
                playTrack(currentTrack!);
            } else {
                nextTrack();
            }
        }
    };

    const toggleRepeatMode = () => {
        setRepeatMode(prev => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
    };

    const playTrack = async (track: Track) => {
        try {
            setIsBuffering(true);

            // 1. Dọn dẹp bộ nhớ: Giải phóng bài hát cũ trước khi nạp bài mới
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
            }

            let url = track.streamUrl;
            if (!url) {
                // Lấy stream URL từ Backend (đảm bảo Token hợp lệ để tránh lỗi 403)
                const res = await apiClient.get(`/customer/music/stream/${track.id}`);
                url = res.data.streamUrl;
            }

            // 2. Nạp và phát nhạc mới
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url! },
                {
                    shouldPlay: true,
                    isLooping: repeatMode === 'one',
                    progressUpdateIntervalMillis: 500 // Cập nhật thanh progress mỗi 0.5s
                },
                onPlaybackStatusUpdate
            );

            setSound(newSound);
            setCurrentTrack(track);
        } catch (e) {
            console.error("❌ Lỗi nạp bài hát:", e);
            setIsBuffering(false);
        }
    };

    const playPlaylist = async (tracks: Track[], startIndex: number) => {
        setQueue(tracks);
        setCurrentIndex(startIndex);
        await playTrack(tracks[startIndex]);
    };

    const nextTrack = async () => {
        if (queue.length === 0) return;
        let nextIdx = currentIndex + 1;
        if (nextIdx >= queue.length) {
            if (repeatMode === 'all') nextIdx = 0;
            else return;
        }
        setCurrentIndex(nextIdx);
        await playTrack(queue[nextIdx]);
    };

    const prevTrack = async () => {
        if (currentIndex > 0) {
            const prevIdx = currentIndex - 1;
            setCurrentIndex(prevIdx);
            await playTrack(queue[prevIdx]);
        }
    };

    // ✨ CÁC HÀM ĐIỀU KHIỂN CÓ GUARD (CHỐNG LỖI NOT LOADED)

    const pauseTrack = async () => {
        if (sound) {
            const currentStatus = await sound.getStatusAsync();
            if (currentStatus.isLoaded) await sound.pauseAsync();
        }
    };

    const resumeTrack = async () => {
        if (sound) {
            // 1. Lấy trạng thái hiện tại của âm thanh
            const status = await sound.getStatusAsync();

            // 2. Chỉ thực hiện nếu isLoaded là true
            if (status.isLoaded) {
                await sound.playAsync();
            } else {
                console.warn("Âm thanh đang được nạp, vui lòng đợi...");
            }
        }
    };

    const seek = async (ms: number) => {
        if (sound) {
            const currentStatus = await sound.getStatusAsync();
            if (currentStatus.isLoaded) await sound.setPositionAsync(ms);
        }
    };

    return (
        <PlayerContext.Provider value={{
            currentTrack, queue, currentIndex, isPlaying, isBuffering, status, repeatMode,
            playTrack, playPlaylist, pauseTrack, resumeTrack, seek, nextTrack, prevTrack, toggleRepeatMode
        }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) throw new Error("usePlayer phải được dùng trong PlayerProvider");
    return context;
};