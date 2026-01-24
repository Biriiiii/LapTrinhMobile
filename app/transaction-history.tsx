import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'; // 🔥 Import thêm Feather
import { useRouter } from 'expo-router'; // 🔥 Import router
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity, // 🔥 Import TouchableOpacity
    View
} from 'react-native';
import apiClient from '../services/apiClient';

interface TransactionResponse {
    id: number;
    amount: number;
    type: string;
    status: string;
    description?: string;
    createdAt: string;
}

export default function TransactionHistoryScreen() {
    const router = useRouter(); // 🔥 Khởi tạo router
    const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = async () => {
        try {
            const res = await apiClient.get('/customer/profile/transactions');
            setTransactions(res.data);
        } catch (error) {
            console.error("Lỗi tải lịch sử:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);
    const onRefresh = () => { setRefreshing(true); fetchHistory(); };

    const renderItem = ({ item }: { item: TransactionResponse }) => {
        const isDeposit = item.type === 'DEPOSIT' || item.type === 'NAP_XU';
        const isSuccess = item.status === 'SUCCESS';
        const isFailed = item.status === 'FAILED';

        let amountColor = isDeposit ? '#1DB954' : '#E53935';
        let iconName = isDeposit ? "wallet-plus" : "cart-minus";
        let iconBg = isDeposit ? 'rgba(29, 185, 84, 0.15)' : 'rgba(229, 57, 53, 0.15)';
        let sign = isDeposit ? "+" : "-";

        if (isFailed) {
            amountColor = '#777';
            iconName = "alert-circle-outline";
            iconBg = 'rgba(119, 119, 119, 0.15)';
        } else if (item.status === 'PENDING') {
            amountColor = '#FFD700';
        }

        return (
            <View style={[styles.card, isFailed && styles.cardFailed]}>
                <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                    <MaterialCommunityIcons
                        name={iconName as any}
                        size={24}
                        color={isFailed ? '#777' : (isDeposit ? '#1DB954' : '#E53935')}
                    />
                </View>

                <View style={styles.info}>
                    <Text style={styles.typeText}>
                        {isDeposit ? "Nạp Xu" : "Mua Album"}
                    </Text>
                    {item.description ? (
                        <Text style={styles.descText} numberOfLines={1} ellipsizeMode="tail">
                            {item.description}
                        </Text>
                    ) : null}
                    <Text style={styles.dateText}>
                        {new Date(item.createdAt).toLocaleString('vi-VN', {
                            hour: '2-digit', minute: '2-digit',
                            day: '2-digit', month: '2-digit', year: 'numeric'
                        })}
                        {!isSuccess && <Text style={{ color: amountColor, fontWeight: 'bold' }}> • {item.status}</Text>}
                    </Text>
                </View>

                <Text style={[styles.amount, { color: amountColor }, isFailed && styles.amountFailed]}>
                    {sign}{item.amount.toLocaleString('vi-VN')} đ
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />
            <View style={styles.container}>

                {/* 🔥 HEADER CÓ NÚT BACK */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Lịch sử biến động 📉</Text>

                    {/* View rỗng để cân bằng tiêu đề vào giữa */}
                    <View style={{ width: 40 }} />
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={transactions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1DB954" />}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Chưa có giao dịch nào.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#121212' },
    container: { flex: 1, backgroundColor: '#121212', padding: 15 },

    // 🔥 STYLE CHO HEADER
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Căn đều 2 bên
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20, // Bo tròn thành hình tròn
        backgroundColor: '#333', // Màu nền nút giống ảnh
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center'
    },

    // Style cũ giữ nguyên
    card: {
        flexDirection: 'row',
        backgroundColor: '#282828',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333'
    },
    cardFailed: { opacity: 0.6 },
    iconBox: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    info: { flex: 1, paddingRight: 10 },
    typeText: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
    descText: { fontSize: 13, color: '#DDD', marginBottom: 4, fontStyle: 'italic' },
    dateText: { fontSize: 12, color: '#777' },
    amount: { fontSize: 16, fontWeight: 'bold' },
    amountFailed: { textDecorationLine: 'line-through', fontStyle: 'italic' },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#777', fontSize: 16 }
});