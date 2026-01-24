import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import apiClient from '../../services/apiClient';

// --- 1. INTERFACE CẬP NHẬT: Thêm type 'song' ---
interface UnifiedResult {
    id: number;
    title?: string;      // Dành cho Album/Song
    name?: string;       // Dành cho Nghệ sĩ
    artistName?: string; // Dành cho Song
    image?: string;
    thumbnail?: string;  // Dành cho Song
    price?: number;
    type: 'artist' | 'album' | 'song';
}

export default function SearchScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<UnifiedResult[]>([]);
    const [loading, setLoading] = useState(false);

    // ✅ State cho Modal Thêm vào Playlist
    const [myPlaylists, setMyPlaylists] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedSongId, setSelectedSongId] = useState<number | null>(null);

    // --- 2. HÀM TÌM KIẾM TỔNG HỢP (Thêm Song) ---
    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.trim().length < 2) {
            setResults([]);
            return;
        }

        try {
            setLoading(true);
            // Gọi đồng thời 3 API: Album, Artist và Song
            const [albumRes, artistRes, songRes] = await Promise.all([
                apiClient.get('/public/albums/search', { params: { title: text } }),
                apiClient.get('/public/artists/search', { params: { name: text } }),
                apiClient.get('/public/songs/search', { params: { title: text } }) // Giả định endpoint này tồn tại
            ]);

            const albums = albumRes.data.map((item: any) => ({ ...item, type: 'album' }));
            const artists = artistRes.data.map((item: any) => ({ ...item, type: 'artist' }));
            const songs = songRes.data.map((item: any) => ({ ...item, type: 'song' }));

            // Gộp kết quả: Ưu tiên Nghệ sĩ -> Bài hát -> Album
            setResults([...artists, ...songs, ...albums]);
        } catch (error) {
            console.error("Lỗi tìm kiếm:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- 3. LOGIC THÊM VÀO PLAYLIST ---
    const openAddModal = async (songId: number) => {
        try {
            const res = await apiClient.get('/customer/playlists/my-playlists');
            setMyPlaylists(res.data);
            setSelectedSongId(songId);
            setModalVisible(true);
        } catch (error) { Alert.alert("Lỗi", "Không thể lấy danh sách playlist"); }
    };

    const handleAddToPlaylist = async (playlistId: number) => {
        try {
            await apiClient.post(`/customer/playlists/${playlistId}/songs`, [selectedSongId]);
            Alert.alert("Thành công", "Đã thêm bài hát vào playlist!");
            setModalVisible(false);
        } catch (error) { Alert.alert("Lỗi", "Không thể thêm bài hát."); }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Tìm kiếm</Text>

            {/* SEARCH BAR */}
            <View style={styles.searchBarContainer}>
                <Feather name="search" size={20} color="#000" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Bài hát, nghệ sĩ hoặc album..."
                    placeholderTextColor="#535353"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoCapitalize="none"
                />
            </View>

            {/* LIST KẾT QUẢ */}
            {loading ? (
                <View style={styles.centered}><ActivityIndicator size="large" color="#1DB954" /></View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
                    renderItem={({ item }) => (
                        <View style={styles.resultItem}>
                            <TouchableOpacity
                                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                                onPress={() => {
                                    if (item.type === 'song') router.push(`/song/${item.id}`);
                                    else if (item.type === 'album') router.push(`/album/${item.id}`);
                                    else if (item.type === 'artist') router.push(`/artist/${item.id}`);
                                }}
                            >
                                <Image
                                    source={{ uri: item.image || item.thumbnail || 'https://via.placeholder.com/60' }}
                                    style={[
                                        styles.resultImage,
                                        item.type === 'artist' ? { borderRadius: 30 } : { borderRadius: 4 }
                                    ]}
                                />
                                <View style={styles.resultInfo}>
                                    <Text style={styles.resultName} numberOfLines={1}>{item.title || item.name}</Text>
                                    <Text style={styles.resultSub}>
                                        {item.type === 'artist' ? 'Nghệ sĩ' :
                                            item.type === 'song' ? `Bài hát • ${item.artistName}` : `Album • ${item.price?.toLocaleString()}đ`}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* ✅ Nút (+) chỉ hiện cho BÀI HÁT */}
                            {item.type === 'song' && (
                                <TouchableOpacity onPress={() => openAddModal(item.id)} style={{ padding: 10 }}>
                                    <Feather name="plus-circle" size={22} color="#1DB954" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                />
            )}

            {/* MODAL CHỌN PLAYLIST */}
            <Modal visible={isModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Thêm vào playlist</Text>
                        <FlatList
                            data={myPlaylists}
                            keyExtractor={(p: any) => p.id.toString()}
                            renderItem={({ item }: any) => (
                                <TouchableOpacity style={styles.playlistRow} onPress={() => handleAddToPlaylist(item.id)}>
                                    <Text style={{ color: '#fff' }}>{item.name}</Text>
                                    <Feather name="plus" size={18} color="#1DB954" />
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                            <Text style={{ color: '#fff' }}>ĐÓNG</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 16 },
    headerTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 40, marginBottom: 20 },
    searchBarContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, alignItems: 'center', height: 48, marginBottom: 20 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, color: '#000', fontSize: 16, fontWeight: '600' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    resultItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, padding: 8, backgroundColor: '#1a1a1a', borderRadius: 8 },
    resultImage: { width: 60, height: 60, backgroundColor: '#333' },
    resultInfo: { flex: 1, marginLeft: 15 },
    resultName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    resultSub: { color: '#b3b3b3', fontSize: 13, marginTop: 4 },
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#282828', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '50%', padding: 25 },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    playlistRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#333' },
    closeBtn: { marginTop: 10, alignItems: 'center', padding: 15 }
});