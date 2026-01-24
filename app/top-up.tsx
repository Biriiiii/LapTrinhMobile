import { Feather } from '@expo/vector-icons'; // 🔥 Import Icon
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router'; // 🔥 Import Router
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import apiClient from '../services/apiClient';

// 💵 Danh sách mệnh giá nạp
const DENOMINATIONS = [
    { label: '10.000 đ', value: 10000 },
    { label: '20.000 đ', value: 20000 },
    { label: '50.000 đ', value: 50000 },
    { label: '100.000 đ', value: 100000 },
    { label: '200.000 đ', value: 200000 },
    { label: '500.000 đ', value: 500000 },
];

export default function DepositScreen() {
    const router = useRouter(); // 🔥 Khởi tạo router
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // 🔗 1. LẮNG NGHE KẾT QUẢ TRẢ VỀ TỪ VNPAY
    useEffect(() => {
        const handleDeepLink = (event: { url: string }) => {
            console.log("⚡ App nhận được URL:", event.url);
            const { queryParams } = Linking.parse(event.url);

            if (queryParams?.status === 'success') {
                Alert.alert("Thành công", "Nạp xu thành công! Số dư đã được cập nhật 💰");
                setSelectedAmount(null);
            } else if (queryParams?.status === 'failed') {
                Alert.alert("Thất bại", "Giao dịch bị hủy hoặc lỗi thanh toán ❌");
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);
        Linking.getInitialURL().then((url) => {
            if (url) handleDeepLink({ url });
        });

        return () => subscription.remove();
    }, []);

    // 💳 2. XỬ LÝ THANH TOÁN
    const handlePayment = async () => {
        if (!selectedAmount) {
            Alert.alert("Thông báo", "Vui lòng chọn mệnh giá nạp!");
            return;
        }

        setLoading(true);
        try {
            // A. Lấy ID thật
            const profileRes = await apiClient.get('/customer/profile');
            const realUserId = profileRes.data.id;

            if (!realUserId) {
                Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng.");
                setLoading(false);
                return;
            }

            // B. Gọi API tạo Payment URL
            const res = await apiClient.post('/vnpay/create', null, {
                params: {
                    amount: selectedAmount,
                    userId: realUserId,
                    platform: 'WEB_BROWSER'
                }
            });

            // C. Mở trình duyệt
            if (res.data.paymentUrl) {
                await Linking.openURL(res.data.paymentUrl);
            } else {
                Alert.alert("Lỗi", "Không nhận được link thanh toán.");
            }

        } catch (error) {
            console.error("Lỗi thanh toán:", error);
            Alert.alert("Lỗi", "Không kết nối được server.");
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: { label: string, value: number } }) => {
        const isSelected = selectedAmount === item.value;
        return (
            <TouchableOpacity
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelectedAmount(item.value)}
                activeOpacity={0.7}
            >
                <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>
                    {item.label}
                </Text>
            </TouchableOpacity>
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

                    <Text style={styles.headerTitle}>Nạp Xu 💎</Text>

                    {/* View rỗng để cân bằng tiêu đề vào giữa */}
                    <View style={{ width: 40 }} />
                </View>

                {/* Phần nội dung chính (Căn giữa màn hình) */}
                <View style={styles.contentCenter}>
                    <Text style={styles.subTitle}>Chọn mệnh giá bạn muốn nạp</Text>

                    <View style={styles.gridContainer}>
                        <FlatList
                            data={DENOMINATIONS}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.value.toString()}
                            numColumns={2}
                            columnWrapperStyle={styles.row}
                            scrollEnabled={false}
                        />
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tổng thanh toán:</Text>
                            <Text style={styles.amountText}>
                                {selectedAmount ? selectedAmount.toLocaleString('vi-VN') + ' đ' : '0 đ'}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={handlePayment}
                            disabled={!selectedAmount || loading}
                            style={[styles.btn, (!selectedAmount || loading) && styles.btnDisabled]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.btnText}>Xác nhận thanh toán</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

// 🖌️ STYLE DARK MODE
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#121212' },

    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
        // ❌ Xóa justifyContent: 'center' ở đây để Header nằm được trên cùng
    },

    // 🔥 STYLE HEADER MỚI
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20, // Giảm size chút cho vừa header
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center'
    },

    // 🔥 Wrapper cho nội dung chính để nó căn giữa phần còn lại
    contentCenter: {
        flex: 1,
        justifyContent: 'center'
    },

    subTitle: {
        fontSize: 16, color: '#B3B3B3', marginBottom: 30, textAlign: 'center'
    },

    gridContainer: { marginBottom: 20 },
    row: { justifyContent: 'space-between', marginBottom: 15 },

    // Thẻ tiền
    card: {
        width: '48%', paddingVertical: 20,
        backgroundColor: '#282828', borderRadius: 8,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'transparent',
    },
    cardSelected: {
        backgroundColor: '#1DB954', borderColor: '#1DB954',
    },
    cardText: { fontSize: 16, fontWeight: '600', color: '#fff' },
    cardTextSelected: { color: '#fff', fontWeight: 'bold' },

    // Footer
    footer: {
        borderTopWidth: 1, borderTopColor: '#282828', paddingTop: 20
    },
    summaryRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20
    },
    summaryLabel: { fontSize: 16, color: '#B3B3B3' },
    amountText: { fontSize: 24, fontWeight: 'bold', color: '#1DB954' },

    // Nút bấm
    btn: {
        backgroundColor: '#1DB954', padding: 18,
        borderRadius: 30, alignItems: 'center'
    },
    btnDisabled: { backgroundColor: '#3E3E3E' },
    btnText: {
        color: '#fff', fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase'
    },
});