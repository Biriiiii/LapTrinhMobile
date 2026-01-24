import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import apiClient from '../services/apiClient';

interface Album {
    id: number;
    title: string;
    artistName: string;
    coverUrl: string;
    releaseYear: number;
}

export default function FavoriteAlbumsScreen() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<Album[]>([]);
    const [ownedAlbumIds, setOwnedAlbumIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    // --- HÀM LẤY DỮ LIỆU ---
    const fetchFavoriteData = async () => {
        try {
            const [resFavs, resOwned] = await Promise.all([
                // 1. Lấy danh sách album đã thả tim
                apiClient.get('/customer/favorites/my-albums'),
                // 2. Lấy danh sách album đã mua để hiện nhãn Verified
                apiClient.get('/customer/profile/my-albums').catch(() => ({ data: [] }))
            ]);

            setFavorites(resFavs.data);
            setOwnedAlbumIds(resOwned.data.map((a: any) => a.id));
        } catch (error) {
            console.error("Lỗi tải album yêu thích:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchFavoriteData();
        }, [])
    );

    if (loading) return (
        <View style={styles.centered}><ActivityIndicator color="#1DB954" size="large" /></View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* --- HEADER --- */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Feather name="chevron-left" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Album yêu thích</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* --- DANH SÁCH ALBUM --- */}
            <FlatList
                data={favorites}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Feather name="heart" size={60} color="#333" />
                        <Text style={styles.emptyText}>Bạn chưa thả tim album nào</Text>
                        <TouchableOpacity
                            style={styles.exploreBtn}
                            onPress={() => router.push('/(tabs)')}
                        >
                            <Text style={styles.exploreText}>Khám phá ngay</Text>
                        </TouchableOpacity>
                    </View>
                )}
                renderItem={({ item }) => {
                    const isOwned = ownedAlbumIds.includes(item.id); // Check sở hữu
                    return (
                        <TouchableOpacity
                            style={styles.albumRow}
                            onPress={() => router.push(`/album/${item.id}` as any)}
                        >
                            <Image source={{ uri: item.coverUrl }} style={styles.albumArt} />

                            <View style={styles.albumInfo}>
                                <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
                                <Text style={styles.albumSub}>{item.artistName} • {item.releaseYear}</Text>

                                {isOwned && (
                                    <View style={styles.verifiedBadge}>
                                        <MaterialIcons name="verified" size={12} color="#1DB954" />
                                        <Text style={styles.verifiedText}>ĐÃ SỞ HỮU</Text>
                                    </View>
                                )}
                            </View>

                            <Feather name="chevron-right" size={20} color="#666" />
                        </TouchableOpacity>
                    );
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    centered: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        height: 60,
        borderBottomWidth: 0.5,
        borderBottomColor: '#282828'
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    albumRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#1a1a1a',
        padding: 12,
        borderRadius: 12
    },
    albumArt: { width: 70, height: 70, borderRadius: 8 },
    albumInfo: { flex: 1, marginLeft: 15 },
    albumTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    albumSub: { color: '#b3b3b3', fontSize: 13, marginTop: 4 },

    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        backgroundColor: '#1DB95411',
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4
    },
    verifiedText: { color: '#1DB954', fontSize: 9, fontWeight: 'bold', marginLeft: 4 },

    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#666', fontSize: 16, marginTop: 20 },
    exploreBtn: {
        marginTop: 20,
        backgroundColor: '#1DB954',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25
    },
    exploreText: { color: '#000', fontWeight: 'bold' }
});