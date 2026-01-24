import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router'; // Thêm useFocusEffect
import React, { useCallback, useState } from 'react'; // Thêm useCallback
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { MusicService } from '../services/musicService';

interface Transaction {
    id: number;
    type: string; // 'PURCHASE', 'WALLET_DEPOSIT', 'WALLET_WITHDRAW'
    amount: number;
    description: string;
    transactionDate: string;
    status: string; // 'SUCCESS', 'PENDING', 'FAILED'
    albumTitle?: string;
    artistName?: string;
}

export default function TransactionHistoryScreen() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // --- HÀM LẤY DỮ LIỆU RIÊNG BIỆT ---
    const fetchTransactions = async () => {
        try {
            // Chỉ hiện loading xoay lớn nếu danh sách đang trống
            if (transactions.length === 0) setLoading(true);

            const response = await MusicService.customer.getTransactions();
            setTransactions(response.data);
        } catch (error) {
            console.error('Lỗi tải lịch sử giao dịch:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // --- 🔥 CẬP NHẬT TỨC THÌ: useFocusEffect ---
    // Giúp tự động tải lại lịch sử mỗi khi Biriii quay lại màn hình này
    useFocusEffect(
        useCallback(() => {
            fetchTransactions();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchTransactions();
    };

    const formatAmount = (amount: number, type: string) => {
        const formatted = amount.toLocaleString();
        if (type === 'PURCHASE') {
            return `-${formatted}đ`;
        } else if (type === 'WALLET_DEPOSIT') {
            return `+${formatted}đ`;
        }
        return `${formatted}đ`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'PURCHASE':
                return <MaterialIcons name="shopping-cart" size={24} color="#FF6B6B" />;
            case 'WALLET_DEPOSIT':
                return <MaterialIcons name="account-balance-wallet" size={24} color="#4ECDC4" />;
            case 'WALLET_WITHDRAW':
                return <MaterialIcons name="money-off" size={24} color="#FFE66D" />;
            default:
                return <MaterialIcons name="receipt" size={24} color="#A8E6CF" />;
        }
    };

    const getTypeTitle = (type: string) => {
        switch (type) {
            case 'PURCHASE': return 'Mua Album';
            case 'WALLET_DEPOSIT': return 'Nạp Tiền';
            case 'WALLET_WITHDRAW': return 'Rút Tiền';
            default: return 'Giao Dịch';
        }
    };

    const getAmountColor = (type: string) => {
        switch (type) {
            case 'PURCHASE':
            case 'WALLET_WITHDRAW': return '#FF6B6B';
            case 'WALLET_DEPOSIT': return '#4ECDC4';
            default: return '#fff';
        }
    };

    const renderTransaction = ({ item }: { item: Transaction }) => (
        <View style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
                {getTransactionIcon(item.type)}
                <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>{getTypeTitle(item.type)}</Text>
                    <Text style={styles.transactionDesc} numberOfLines={2}>
                        {item.description || `${item.albumTitle} - ${item.artistName}`}
                    </Text>
                    <Text style={styles.transactionDate}>{formatDate(item.transactionDate)}</Text>
                </View>
            </View>
            <View style={styles.transactionRight}>
                <Text style={[styles.transactionAmount, { color: getAmountColor(item.type) }]}>
                    {formatAmount(item.amount, item.type)}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'SUCCESS' ? '#4ECDC4' : '#FF6B6B' }]}>
                    <Text style={styles.statusText}>
                        {item.status === 'SUCCESS' ? 'Thành công' : item.status === 'PENDING' ? 'Đang xử lý' : 'Thất bại'}
                    </Text>
                </View>
            </View>
        </View>
    );

    if (loading && transactions.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1DB954" />
                    <Text style={styles.loadingText}>Đang tải lịch sử giao dịch...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lịch Sử Giao Dịch</Text>
                <View style={styles.placeholder} />
            </View>

            <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id.toString()}
                style={styles.transactionList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#1DB954']}
                        tintColor="#1DB954"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="receipt-long" size={64} color="#666" />
                        <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
                        <Text style={styles.emptySubText}>Lịch sử giao dịch sẽ hiển thị tại đây</Text>
                    </View>
                }
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
    backButton: { padding: 5 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    placeholder: { width: 34 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#fff', marginTop: 16, fontSize: 16 },
    transactionList: { flex: 1, paddingHorizontal: 20 },
    transactionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 16, backgroundColor: '#1e1e1e', borderRadius: 12, marginVertical: 4 },
    transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    transactionInfo: { marginLeft: 12, flex: 1 },
    transactionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
    transactionDesc: { color: '#b3b3b3', fontSize: 14, marginBottom: 4 },
    transactionDate: { color: '#888', fontSize: 12 },
    transactionRight: { alignItems: 'flex-end' },
    transactionAmount: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    statusText: { color: '#000', fontSize: 10, fontWeight: '500' },
    separator: { height: 1, backgroundColor: '#333', marginVertical: 4 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    emptyText: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 16 },
    emptySubText: { color: '#888', fontSize: 14, marginTop: 8, textAlign: 'center' },
});