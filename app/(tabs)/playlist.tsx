import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert, FlatList, Modal, RefreshControl,
    SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import apiClient from '../../services/apiClient';

export default function PlaylistScreen() {
    const router = useRouter();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');

    // --- HÀM LẤY DỮ LIỆU ---
    const fetchPlaylists = async () => {
        try {
            // Chỉ hiện loading xoay lớn nếu chưa có dữ liệu nào
            if (playlists.length === 0) setLoading(true);

            const res = await apiClient.get('/customer/playlists/my-playlists');
            setPlaylists(res.data);
        } catch (error) {
            console.error("Lỗi tải playlist:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // --- 🔥 CẬP NHẬT TỨC THÌ ---
    useFocusEffect(
        useCallback(() => {
            fetchPlaylists();
        }, [])
    );

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return Alert.alert("Lỗi", "Tên không được để trống");
        try {
            await apiClient.post('/customer/playlists', { name: newPlaylistName });
            setNewPlaylistName('');
            setModalVisible(false);
            // Cập nhật lại danh sách ngay lập tức
            await fetchPlaylists();
            Alert.alert("Thành công", "Đã tạo playlist mới!");
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tạo playlist");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* --- HEADER CHUẨN: Tránh bị notch che --- */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Thư viện</Text>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={styles.addButton}
                >
                    <Feather name="plus" size={28} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading && playlists.length === 0 ? (
                <View style={styles.centered}><ActivityIndicator color="#1DB954" size="large" /></View>
            ) : (
                <FlatList
                    data={playlists}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.listContent} // Thêm padding dưới cho Mini Player
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={fetchPlaylists}
                            tintColor="#1DB954"
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Feather name="folder-plus" size={50} color="#333" />
                            <Text style={styles.emptyText}>Chưa có playlist nào.</Text>
                            <Text style={styles.emptySub}>Nhấn dấu (+) để tạo mới</Text>
                        </View>
                    }
                    renderItem={({ item }: any) => (
                        <TouchableOpacity
                            style={styles.item}
                            activeOpacity={0.7}
                            onPress={() => router.push(`/playlist/${item.id}`)}
                        >
                            <View style={styles.iconBox}>
                                <Feather name="music" size={22} color="#fff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemSub}>Playlist • {item.songCount || 0} bài hát</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color="#444" />
                        </TouchableOpacity>
                    )}
                />
            )}

            {/* Modal tạo Playlist */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Tên playlist</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Tên playlist của tôi"
                            placeholderTextColor="#666"
                            value={newPlaylistName}
                            onChangeText={setNewPlaylistName}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnCancel}>HỦY</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCreatePlaylist}>
                                <Text style={styles.btnCreate}>TẠO</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // --- HEADER STYLE ---
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 10
    },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    addButton: { padding: 5 },

    listContent: {
        paddingBottom: 120, // CHỖ NÀY: Để không bị Mini Player che mất
        paddingTop: 10
    },

    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16
    },
    iconBox: {
        width: 56,
        height: 56,
        backgroundColor: '#282828',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    itemName: { color: '#fff', fontSize: 16, fontWeight: '600' },
    itemSub: { color: '#b3b3b3', fontSize: 13, marginTop: 4 },

    emptyBox: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 15 },
    emptySub: { color: '#666', fontSize: 14, marginTop: 5 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: '#282828', padding: 25, borderRadius: 12 },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: {
        borderBottomWidth: 2,
        borderBottomColor: '#1DB954',
        color: '#fff',
        padding: 12,
        fontSize: 18,
        marginBottom: 30,
        textAlign: 'center'
    },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-around' },
    btnCancel: { color: '#b3b3b3', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
    btnCreate: { color: '#1DB954', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 }
});