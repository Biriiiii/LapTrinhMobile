import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

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

    useEffect(() => {
        Audio.setAudioModeAsync({ staysActiveInBackground: true, playsInSilentModeIOS: true });
        return () => { if (sound) sound.unloadAsync(); };
    }, [sound]);

    const onPlaybackStatusUpdate = (newStatus: AVPlaybackStatus) => {
        if (!newStatus.isLoaded) return;
        setStatus(newStatus);
        setIsPlaying(newStatus.isPlaying);
        setIsBuffering(newStatus.isBuffering);

        if (newStatus.didJustFinish && !newStatus.isLooping) {
            if (repeatMode === 'one') playTrack(currentTrack!);
            else nextTrack();
        }
    };

    const toggleRepeatMode = () => {
        setRepeatMode(prev => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
    };

    const playTrack = async (track: Track) => {
        try {
            if (sound) await sound.unloadAsync();
            let url = track.streamUrl;
            if (!url) {
                const res = await apiClient.get(`/customer/music/stream/${track.id}`);
                url = res.data.streamUrl;
            }
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url! },
                { shouldPlay: true, isLooping: repeatMode === 'one' },
                onPlaybackStatusUpdate
            );
            setSound(newSound);
            setCurrentTrack(track);
        } catch (e) { console.error("Lỗi phát:", e); }
    };

    const playPlaylist = async (tracks: Track[], startIndex: number) => {
        setQueue(tracks);
        setCurrentIndex(startIndex);
        await playTrack(tracks[startIndex]);
    };

    const nextTrack = async () => {
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

    // 🔥 SỬA LỖI Ở ĐÂY: Thêm dấu { } và await để ép kiểu trả về là Promise<void>
    const pauseTrack = async () => {
        if (sound) await sound.pauseAsync();
    };

    const resumeTrack = async () => {
        if (sound) await sound.playAsync();
    };

    const seek = async (ms: number) => {
        if (sound) await sound.setPositionAsync(ms);
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
    const c = useContext(PlayerContext);
    if (!c) throw new Error("usePlayer must be used within PlayerProvider");
    return c;
};