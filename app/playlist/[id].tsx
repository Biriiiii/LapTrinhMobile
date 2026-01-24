import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList, Image, Modal,
    SafeAreaView, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { usePlayer } from '../../context/PlayerContext';
import apiClient from '../../services/apiClient';

export default function PlaylistDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { playPlaylist } = usePlayer();

    const [playlist, setPlaylist] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [myPlaylists, setMyPlaylists] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedSongId, setSelectedSongId] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            if (!playlist) setLoading(true);
            const res = await apiClient.get(`/customer/playlists/${id}`);
            setPlaylist(res.data);
        } catch (error) {
            console.error("Lỗi:", error);
            Alert.alert("Lỗi", "Không thể tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (id) fetchData();
        }, [id])
    );

    const handlePlayMusic = (index: number) => {
        if (!playlist || !playlist.songs || playlist.songs.length === 0) return;
        const tracks = playlist.songs.map((s: any) => ({
            id: s.id,
            title: s.title,
            artist: s.artistName || "Nghệ sĩ",
            coverUrl: s.thumbnail || playlist.thumbnail,
        }));
        playPlaylist(tracks, index);
        router.push('/player');
    };

    const handleDeletePlaylist = () => {
        Alert.alert("Xác nhận", "Bạn muốn xóa toàn bộ playlist này?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa",
                style: "destructive",
                onPress: async () => {
                    try {
                        await apiClient.delete(`/customer/playlists/${id}`);
                        router.back();
                    } catch (error) { Alert.alert("Lỗi", "Không thể xóa playlist."); }
                }
            }
        ]);
    };

    const handleRemoveSong = (songId: number) => {
        Alert.alert("Xác nhận", "Xóa bài hát này khỏi playlist?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa",
                style: "destructive",
                onPress: async () => {
                    try {
                        await apiClient.delete(`/customer/playlists/${id}/songs/${songId}`);
                        fetchData();
                    } catch (error) { Alert.alert("Lỗi", "Không thể xóa bài hát."); }
                }
            }
        ]);
    };

    const openAddModal = async (songId: number) => {
        try {
            const res = await apiClient.get('/customer/playlists/my-playlists');
            setMyPlaylists(res.data);
            setSelectedSongId(songId);
            setModalVisible(true);
        } catch (error) { Alert.alert("Lỗi", "Không lấy được danh sách playlist."); }
    };

    const handleAdd = async (targetPlaylistId: number) => {
        try {
            await apiClient.post(`/customer/playlists/${targetPlaylistId}/songs`, [selectedSongId]);
            Alert.alert("Thành công", "Đã thêm vào playlist!");
            setModalVisible(false);
        } catch (error) { Alert.alert("Lỗi", "Không thể thêm bài hát."); }
    };

    if (loading && !playlist) return (
        <View style={styles.centered}><ActivityIndicator color="#1DB954" size="large" /></View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header giữ nguyên để có nút Back và nút Xóa Playlist */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{playlist?.name || "Chi tiết"}</Text>
                <TouchableOpacity onPress={handleDeletePlaylist} style={styles.iconBtn}>
                    <Feather name="trash-2" size={22} color="#FF4D4D" />
                </TouchableOpacity>
            </View>

            {/* FlatList bây giờ hiện bài hát ngay lập tức */}
            <FlatList
                data={playlist?.songs || []}
                keyExtractor={(item: any) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                renderItem={({ item, index }) => (
                    <View style={styles.songRow}>
                        <TouchableOpacity
                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => handlePlayMusic(index)}
                        >
                            <Image source={{ uri: item.thumbnail || 'https://via.placeholder.com/50' }} style={styles.songThumb} />
                            <View style={{ marginLeft: 15, flex: 1 }}>
                                <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                                <Text style={styles.songArtist}>{item.artistName}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleRemoveSong(item.id)} style={{ padding: 10 }}>
                            <Feather name="x" size={18} color="#666" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => openAddModal(item.id)} style={{ padding: 10 }}>
                            <Feather name="plus-circle" size={20} color="#1DB954" />
                        </TouchableOpacity>
                    </View>
                )}
                showsVerticalScrollIndicator={false}
            />

            {/* Modal giữ nguyên */}
            <Modal visible={isModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Thêm vào playlist của bạn</Text>
                        <FlatList
                            data={myPlaylists}
                            keyExtractor={(p: any) => p.id.toString()}
                            renderItem={({ item }: any) => (
                                <TouchableOpacity style={styles.playlistItem} onPress={() => handleAdd(item.id)}>
                                    <Text style={{ color: '#fff' }}>{item.name}</Text>
                                    <Feather name="plus" size={18} color="#666" />
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}><Text style={{ color: '#fff' }}>ĐÓNG</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    centered: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 10, height: 60 },
    iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
    songRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
    songThumb: { width: 50, height: 50, borderRadius: 4 },
    songTitle: { color: '#fff', fontSize: 16, fontWeight: '500' },
    songArtist: { color: '#b3b3b3', fontSize: 13 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#282828', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '50%', padding: 20 },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    playlistItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#333' },
    closeBtn: { marginTop: 10, alignItems: 'center', padding: 15 }
});