import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';

// 1. Cập nhật Interface khớp chính xác với JSON bạn gửi
interface UserProfile {
    id: number;
    username: string;
    email: string;
    fullName: string | null;
    walletBalance: number; // Đã đổi từ balance thành walletBalance
    roleName: string;
}

export default function ProfileScreen() {
    const router = useRouter();
    const { signOut } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/customer/profile');
            console.log("Dữ liệu nhận từ Java:", res.data);
            setProfile(res.data);
        } catch (error) {
            console.error("Lỗi tải profile:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading && !refreshing) return (
        <View style={[styles.container, styles.centered]}>
            <ActivityIndicator size="large" color="#1DB954" />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfile(); }} tintColor="#1DB954" />
                }
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Hồ sơ</Text>
                    <TouchableOpacity onPress={() => signOut()}>
                        <Feather name="log-out" size={22} color="#FF4D4D" />
                    </TouchableOpacity>
                </View>

                {/* THÔNG TIN USER */}
                <View style={styles.profileInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarChar}>
                            {/* Ưu tiên fullName, nếu null thì lấy username */}
                            {(profile?.fullName || profile?.username || "U").charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    <Text style={styles.fullName}>{profile?.fullName || profile?.username}</Text>
                    <Text style={styles.email}>{profile?.email}</Text>

                    {/* --- KHỐI HIỂN THỊ SỐ TIỀN (VÍ) --- */}
                    <View style={styles.walletCard}>
                        <View style={styles.walletHeader}>
                            <FontAwesome5 name="wallet" size={16} color="#1DB954" />
                            <Text style={styles.walletLabel}>Số dư ví hiện tại</Text>
                        </View>
                        <Text style={styles.balanceValue}>
                            {/* Sử dụng walletBalance và định dạng tiền Việt */}
                            {profile?.walletBalance ? profile.walletBalance.toLocaleString('vi-VN') : '0'} đ
                        </Text>
                        <TouchableOpacity style={styles.topUpBtn}>
                            <Text style={styles.topUpText}>+ Nạp thêm tiền</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => router.push('/edit-profile' as any)}
                    >
                        <Text style={styles.editBtnText}>Chỉnh sửa hồ sơ</Text>
                    </TouchableOpacity>
                </View>

                {/* MENU DANH MỤC */}
                <View style={styles.menuSection}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/my-albums' as any)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: '#1DB95422' }]}>
                            <MaterialCommunityIcons name="album" size={24} color="#1DB954" />
                        </View>
                        <Text style={styles.menuText}>Album đã sở hữu</Text>
                        <Feather name="chevron-right" size={20} color="#666" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, marginTop: 40, alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    profileInfo: { alignItems: 'center', paddingVertical: 10 },
    avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#E67E22', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    avatarChar: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
    fullName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    email: { color: '#b3b3b3', fontSize: 14, marginTop: 4 },

    // UI Ví tiền
    walletCard: { backgroundColor: '#1a1a1a', width: '85%', padding: 20, borderRadius: 16, marginTop: 25, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    walletHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    walletLabel: { color: '#b3b3b3', fontSize: 13, marginLeft: 8, fontWeight: '600' },
    balanceValue: { color: '#1DB954', fontSize: 26, fontWeight: 'bold' },
    topUpBtn: { marginTop: 15, backgroundColor: '#1DB95422', paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20 },
    topUpText: { color: '#1DB954', fontSize: 13, fontWeight: 'bold' },

    editBtn: { marginTop: 25, paddingHorizontal: 25, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: '#555' },
    editBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    menuSection: { paddingHorizontal: 20, marginTop: 30 },
    menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 16, borderRadius: 12, marginBottom: 12 },
    iconBox: { width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuText: { color: '#fff', flex: 1, fontSize: 16, fontWeight: '600' }
});