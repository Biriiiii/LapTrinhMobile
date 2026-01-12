import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import apiClient from '../../services/apiClient';

// --- 1. INTERFACE THỐNG NHẤT CHO CẢ HAI ---
interface UnifiedResult {
    id: number;
    title?: string; // Dành cho Album
    name?: string;  // Dành cho Nghệ sĩ
    image?: string;
    price?: number; // Chỉ Album mới có
    type: 'artist' | 'album'; // Để phân biệt cách hiển thị
}

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<UnifiedResult[]>([]);
    const [loading, setLoading] = useState(false);

    // --- 2. HÀM TÌM KIẾM TỔNG HỢP ---
    const handleSearch = async (text: string) => {
        setSearchQuery(text);

        if (text.trim().length < 2) {
            setResults([]);
            return;
        }

        try {
            setLoading(true);

            // Gọi đồng thời cả 2 API: Search Album và Search Artist
            const [albumRes, artistRes] = await Promise.all([
                apiClient.get('/public/albums/search', { params: { title: text } }),
                apiClient.get('/public/artists/search', { params: { name: text } })
            ]);

            // Gán thêm thuộc tính 'type' để phân biệt khi render
            const albums = albumRes.data.map((item: any) => ({ ...item, type: 'album' }));
            const artists = artistRes.data.map((item: any) => ({ ...item, type: 'artist' }));

            // Gộp chung kết quả (Nghệ sĩ hiện lên trước, sau đó đến Album)
            setResults([...artists, ...albums]);
        } catch (error) {
            console.error("Lỗi tìm kiếm tổng hợp:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Tìm kiếm</Text>

            {/* --- SEARCH BAR --- */}
            <View style={styles.searchBarContainer}>
                <Feather name="search" size={20} color="#000" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Nghệ sĩ hoặc Album..."
                    placeholderTextColor="#535353"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearch('')}>
                        <Feather name="x" size={20} color="#000" />
                    </TouchableOpacity>
                )}
            </View>

            {/* --- LIST KẾT QUẢ --- */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#1DB954" />
                </View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        searchQuery.length > 1 ? (
                            <Text style={styles.emptyText}>Không tìm thấy kết quả cho {searchQuery}</Text>
                        ) : null
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.resultItem}>
                            {/* Hình ảnh: Tròn cho Nghệ sĩ, Vuông cho Album */}
                            <Image
                                source={{ uri: item.image || 'https://via.placeholder.com/60' }}
                                style={[
                                    styles.resultImage,
                                    item.type === 'artist' ? { borderRadius: 30 } : { borderRadius: 4 }
                                ]}
                            />

                            <View style={styles.resultInfo}>
                                <Text style={styles.resultName} numberOfLines={1}>
                                    {item.title || item.name}
                                </Text>
                                <Text style={styles.resultSub}>
                                    {item.type === 'artist' ? 'Nghệ sĩ' : `Album • ${item.price?.toLocaleString()}đ`}
                                </Text>
                            </View>

                            <Feather name="chevron-right" size={20} color="#444" />
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

// --- 3. STYLES CHUẨN SPOTIFY ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 16 },
    headerTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 40, marginBottom: 20 },
    searchBarContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        height: 48,
        marginBottom: 20
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, color: '#000', fontSize: 16, fontWeight: '600' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        padding: 8,
        backgroundColor: '#1a1a1a',
        borderRadius: 8
    },
    resultImage: { width: 60, height: 60, backgroundColor: '#333' },
    resultInfo: { flex: 1, marginLeft: 15 },
    resultName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    resultSub: { color: '#b3b3b3', fontSize: 13, marginTop: 4 },
    emptyText: { color: '#b3b3b3', textAlign: 'center', marginTop: 50 }
});