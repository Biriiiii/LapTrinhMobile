import { Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal, // 3. Tránh bàn phím che Modal
    Platform, // 1. Import Modal
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput, // 2. Import TextInput
    TouchableOpacity,
    View
} from 'react-native';
import { usePlayer } from '../../context/PlayerContext';
import apiClient from '../../services/apiClient';

// --- HÀM HELPER ---
const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function AlbumDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { playPlaylist, currentTrack } = usePlayer();

    const [album, setAlbum] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isOwned, setIsOwned] = useState(false);

    // 🔥 STATE MỚI CHO MODAL MUA HÀNG
    const [modalVisible, setModalVisible] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [buying, setBuying] = useState(false);

    // --- 1. LẤY DỮ LIỆU ---
    const fetchAlbumDetail = async () => {
        try {
            if (!album) setLoading(true);

            const [resAlb, resFavs, resOwned] = await Promise.all([
                apiClient.get(`/public/albums/${id}`),
                apiClient.get('/customer/favorites/my-albums').catch(() => ({ data: [] })),
                apiClient.get('/customer/profile/my-albums').catch(() => ({ data: [] }))
            ]);

            setAlbum(resAlb.data);
            setIsFavorite(resFavs.data.some((item: any) => item.id === Number(id)));
            setIsOwned(resOwned.data.some((item: any) => item.id === Number(id)));
        } catch (error) {
            console.error("Lỗi tải album:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { if (id) fetchAlbumDetail(); }, [id]));

    // --- 2. LOGIC MỞ MODAL ---
    const openPurchaseModal = () => {
        setPromoCode(""); // Reset mã cũ
        setModalVisible(true);
    };

    // --- 3. XỬ LÝ MUA (GỌI API) ---
    const confirmPurchase = async () => {
        setBuying(true);
        try {
            // 🔥 Gọi API kèm PromoCode trong params để Backend xử lý giảm giá
            const response = await apiClient.post(`/customer/profile/purchase-album/${id}`, null, {
                params: {
                    promoCode: promoCode.trim().toUpperCase() // Gửi code lên (nếu có)
                }
            });

            // Nếu thành công
            setModalVisible(false);
            const successMsg = response.data?.message || "Mua thành công!";
            Alert.alert("Thành công 🎉", successMsg);

            // Tải lại để mở khóa album
            fetchAlbumDetail();
        } catch (e: any) {
            // Nếu lỗi (ví dụ: mã sai, hết tiền)
            const errorMsg = e.response?.data?.message || "Giao dịch thất bại. Vui lòng kiểm tra lại!";
            Alert.alert("Thất bại ❌", errorMsg);
        } finally {
            setBuying(false);
        }
    };

    // --- 4. XỬ LÝ PHÁT NHẠC ---
    const handlePlayAlbumSong = (index: number) => {
        if (!isOwned) {
            openPurchaseModal(); // 🔥 Đổi từ Alert sang mở Modal
            return;
        }

        const albumTracks = album.songs.map((s: any) => ({
            id: s.id,
            title: s.title,
            artist: s.artistName || album.artistName,
            coverUrl: s.coverUrl || album.coverUrl,
            url: s.audioUrl
        }));
        playPlaylist(albumTracks, index);
        router.push('/player');
    };

    if (loading && !album) return (
        <View style={styles.centered}><ActivityIndicator color="#1DB954" size="large" /></View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerSmallTitle} numberOfLines={1}>{album?.title}</Text>
                <TouchableOpacity onPress={() => { /* Xử lý yêu thích sau */ }} style={styles.headerBtn}>
                    <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#1DB954" : "#fff"} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={album?.songs || []}
                keyExtractor={(item: any) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 120 }}
                ListHeaderComponent={() => (
                    <View style={styles.heroCentered}>
                        <View>
                            <Image source={{ uri: album?.coverUrl }} style={[styles.heroArt, !isOwned && { opacity: 0.6 }]} />
                            {!isOwned && (
                                <View style={styles.lockOverlayHero}>
                                    <Feather name="lock" size={40} color="#fff" />
                                </View>
                            )}
                        </View>

                        <Text style={styles.mainTitle}>{album?.title}</Text>
                        <View style={styles.greenBar} />
                        <Text style={styles.subTitle}>{album?.artistName} • {album?.releaseYear}</Text>

                        {/* NÚT MUA / PHÁT */}
                        {isOwned ? (
                            <TouchableOpacity style={styles.bigPlayBtn} onPress={() => handlePlayAlbumSong(0)}>
                                <MaterialIcons name="play-arrow" size={30} color="#000" />
                                <Text style={styles.playText}>PHÁT TẤT CẢ</Text>
                            </TouchableOpacity>
                        ) : (
                            // 🔥 Nút Mua giờ sẽ mở Modal
                            <TouchableOpacity style={[styles.bigPlayBtn, { backgroundColor: '#FFB142' }]} onPress={openPurchaseModal}>
                                <FontAwesome5 name="shopping-cart" size={18} color="#000" />
                                <Text style={styles.playText}>MUA NGAY - {album?.price?.toLocaleString('vi-VN')}đ</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                renderItem={({ item, index }) => (
                    <TouchableOpacity style={styles.songRow} onPress={() => handlePlayAlbumSong(index)}>
                        <Text style={[styles.songIndex, currentTrack?.id === item.id && { color: '#1DB954' }]}>{index + 1}</Text>
                        <View style={{ flex: 1, opacity: isOwned ? 1 : 0.5 }}>
                            <Text style={[styles.songTitle, currentTrack?.id === item.id && { color: '#1DB954' }]} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.songArtist}>{item.artistName || album?.artistName}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.durationText, !isOwned && { opacity: 0.5 }]}>{formatTime(item.duration)}</Text>
                            {!isOwned && <Feather name="lock" size={14} color="#777" style={{ marginLeft: 8 }} />}
                        </View>
                    </TouchableOpacity>
                )}
            />

            {/* 🔥 MODAL NHẬP MÃ GIẢM GIÁ 🔥 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Xác nhận mua Album</Text>
                        <Text style={styles.modalAlbumName}>💿 {album?.title}</Text>
                        <Text style={styles.modalPrice}>Giá gốc: {album?.price?.toLocaleString('vi-VN')} đ</Text>

                        {/* Ô nhập mã giảm giá */}
                        <View style={styles.inputContainer}>
                            <Feather name="tag" size={20} color="#b3b3b3" style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập mã giảm giá (nếu có)"
                                placeholderTextColor="#777"
                                value={promoCode}
                                onChangeText={setPromoCode}
                                autoCapitalize="characters" // Tự động viết hoa
                            />
                        </View>

                        {/* Nút Hủy & Xác nhận */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnTextCancel}>Để sau</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.btnConfirm}
                                onPress={confirmPurchase}
                                disabled={buying}
                            >
                                {buying ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <Text style={styles.btnTextConfirm}>XÁC NHẬN MUA</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    centered: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 60 },
    headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    headerSmallTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', flex: 1, textAlign: 'center' },

    heroCentered: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20 },
    heroArt: { width: 200, height: 200, borderRadius: 10 },
    lockOverlayHero: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10 },

    mainTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 25, textAlign: 'center' },
    greenBar: { width: 40, height: 4, backgroundColor: '#1DB954', borderRadius: 2, marginTop: 12 },
    subTitle: { color: '#b3b3b3', fontSize: 14, fontWeight: '500', marginTop: 12 },

    bigPlayBtn: { flexDirection: 'row', backgroundColor: '#1DB954', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 30, marginTop: 25, alignItems: 'center', elevation: 5 },
    playText: { color: '#000', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },

    songRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
    songIndex: { color: '#b3b3b3', fontSize: 14, width: 35 },
    songTitle: { color: '#fff', fontSize: 16, fontWeight: '500' },
    songArtist: { color: '#b3b3b3', fontSize: 13, marginTop: 3 },
    durationText: { color: '#b3b3b3', fontSize: 13, fontWeight: '400' },

    // 🔥 STYLE CHO MODAL
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: '#282828', borderRadius: 15, padding: 25, alignItems: 'center', elevation: 10 },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    modalAlbumName: { color: '#b3b3b3', fontSize: 16, marginBottom: 5 },
    modalPrice: { color: '#1DB954', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },

    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3E3E3E', borderRadius: 8, paddingHorizontal: 15, width: '100%', marginBottom: 20, height: 50 },
    input: { flex: 1, color: '#fff', fontSize: 16 },

    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    btnCancel: { flex: 1, padding: 12, marginRight: 10, alignItems: 'center' },
    btnTextCancel: { color: '#b3b3b3', fontWeight: 'bold' },
    btnConfirm: { flex: 1, backgroundColor: '#1DB954', padding: 12, borderRadius: 25, alignItems: 'center' },
    btnTextConfirm: { color: '#000', fontWeight: 'bold' }
});