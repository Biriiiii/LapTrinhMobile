import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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

interface UserProfile {
    id: number;
    username: string;
    email: string;
    fullName: string | null;
    walletBalance: number;
    roleName: string;
}

export default function ProfileScreen() {
    const router = useRouter();
    const { signOut } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // --- HÀM LẤY THÔNG TIN PROFILE ---
    const fetchProfile = async () => {
        try {
            const res = await apiClient.get('/customer/profile');
            setProfile(res.data);
        } catch (error) {
            console.error("Lỗi tải profile:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    if (loading && !refreshing) return (
        <View style={[styles.container, styles.centered]}>
            <ActivityIndicator size="large" color="#1DB954" />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); fetchProfile(); }}
                        tintColor="#1DB954"
                    />
                }
            >
                {/* 1. HEADER & LOGOUT */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Hồ sơ</Text>
                    <TouchableOpacity onPress={() => signOut()}>
                        <Feather name="log-out" size={22} color="#FF4D4D" />
                    </TouchableOpacity>
                </View>

                {/* 2. THÔNG TIN USER CĂN GIỮA */}
                <View style={styles.profileInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarChar}>
                            {(profile?.fullName || profile?.username || "U").charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    <Text style={styles.fullName}>{profile?.fullName || profile?.username}</Text>
                    <Text style={styles.email}>{profile?.email}</Text>

                    {/* KHỐI HIỂN THỊ VÍ TIỀN */}
                    <View style={styles.walletCard}>
                        <View style={styles.walletHeader}>
                            <FontAwesome5 name="wallet" size={16} color="#1DB954" />
                            <Text style={styles.walletLabel}>Số dư ví hiện tại</Text>
                        </View>
                        <Text style={styles.balanceValue}>
                            {profile?.walletBalance ? profile.walletBalance.toLocaleString('vi-VN') : '0'} đ
                        </Text>
                        <TouchableOpacity
                            style={styles.topUpBtn}
                            onPress={() => router.push('/top-up' as any)}
                        >
                            <Text style={styles.topUpText}>+ Nạp thêm tiền</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 3. MENU QUẢN LÝ (LÀM THEO KIỂU ẢNH BẠN GỬI) */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Bộ sưu tập của tôi</Text>

                    {/* Mục: Album đã sở hữu */}
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

                    {/* Mục: Album yêu thích (Làm giống hệt Album sở hữu) */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/favorite-albums' as any)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: '#E91E6322' }]}>
                            <MaterialCommunityIcons name="heart" size={24} color="#E91E63" />
                        </View>
                        <Text style={styles.menuText}>Album yêu thích</Text>
                        <Feather name="chevron-right" size={20} color="#666" />
                    </TouchableOpacity>

                    {/* Mục: Bài hát yêu thích */}
                    {/* <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/favorite-songs' as any)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: '#9C27B022' }]}>
                            <MaterialCommunityIcons name="music-note" size={24} color="#9C27B0" />
                        </View>
                        <Text style={styles.menuText}>Bài hát yêu thích</Text>
                        <Feather name="chevron-right" size={20} color="#666" />
                    </TouchableOpacity> */}

                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Tài khoản & Giao dịch</Text>

                    {/* Mục: Lịch sử giao dịch */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/transaction-history' as any)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: '#4ECDC422' }]}>
                            <MaterialCommunityIcons name="receipt" size={24} color="#4ECDC4" />
                        </View>
                        <Text style={styles.menuText}>Lịch sử giao dịch</Text>
                        <Feather name="chevron-right" size={20} color="#666" />
                    </TouchableOpacity>

                    {/* Mục: Chỉnh sửa hồ sơ */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/edit-profile' as any)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: '#FFB14222' }]}>
                            <Feather name="user" size={24} color="#FFB142" />
                        </View>
                        <Text style={styles.menuText}>Chỉnh sửa hồ sơ</Text>
                        <Feather name="chevron-right" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
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
    walletCard: { backgroundColor: '#1a1a1a', width: '85%', padding: 20, borderRadius: 16, marginTop: 25, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    walletHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    walletLabel: { color: '#b3b3b3', fontSize: 13, marginLeft: 8, fontWeight: '600' },
    balanceValue: { color: '#1DB954', fontSize: 26, fontWeight: 'bold' },
    topUpBtn: { marginTop: 15, backgroundColor: '#1DB95422', paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20 },
    topUpText: { color: '#1DB954', fontSize: 13, fontWeight: 'bold' },

    // --- STYLES CHO MENU DANH SÁCH (ẢNH 7) ---
    menuSection: { paddingHorizontal: 20, marginTop: 30 },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12
    },
    iconBox: {
        width: 45,
        height: 45,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    menuText: {
        color: '#fff',
        flex: 1,
        fontSize: 16,
        fontWeight: '600'
    }
});