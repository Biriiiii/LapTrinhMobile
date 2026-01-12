import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import apiClient from '../services/apiClient';

export default function EditProfileScreen() {
    const router = useRouter();

    // --- 1. QUẢN LÝ STATE THEO CÁC TRƯỜNG BẠN CUNG CẤP ---
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // --- 2. LẤY DỮ LIỆU CŨ KHI MỞ TRANG ---
    useEffect(() => {
        loadCurrentProfile();
    }, []);

    const loadCurrentProfile = async () => {
        try {
            const res = await apiClient.get('/customer/profile');
            const data = res.data;
            setUsername(data.username || '');
            setEmail(data.email || '');
            setFullName(data.fullName || '');
            // Password thường không trả về vì lý do bảo mật, để trống để user nhập mới
        } catch (error) {
            console.error("Không thể tải thông tin hiện tại");
        } finally {
            setFetching(false);
        }
    };

    // --- 3. HÀM LƯU THÔNG TIN (GỬI JSON ĐÚNG CẤU TRÚC) ---
    const handleSave = async () => {
        // Kiểm tra dữ liệu cơ bản
        if (!username || !email || !password || !fullName) {
            return Alert.alert("Thông báo", "Vui lòng nhập đầy đủ tất cả các trường, bao gồm cả mật khẩu mới.");
        }

        try {
            setLoading(true);

            // Cấu trúc JSON đúng như bạn yêu cầu
            const updateData = {
                username: username,
                email: email,
                password: password,
                fullName: fullName
            };

            await apiClient.put('/customer/profile', updateData);

            Alert.alert("Thành công", "Thông tin hồ sơ đã được cập nhật!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Không thể cập nhật hồ sơ.";
            Alert.alert("Lỗi", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER BAR */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Feather name="x" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#1DB954" />
                    ) : (
                        <Text style={styles.saveText}>Lưu</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.form}>

                {/* TRƯỜNG FULL NAME */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Họ và tên (Full Name)</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="VD: Nguyễn Văn A"
                        placeholderTextColor="#555"
                    />
                </View>

                {/* TRƯỜNG USERNAME */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tên đăng nhập (Username)</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="VD: updatedcustomer"
                        placeholderTextColor="#555"
                        autoCapitalize="none"
                    />
                </View>

                {/* TRƯỜNG EMAIL */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="VD: updated@customer.com"
                        placeholderTextColor="#555"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* TRƯỜNG PASSWORD */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mật khẩu mới (Password)</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Nhập mật khẩu mới..."
                        placeholderTextColor="#555"
                        secureTextEntry={true} // Ẩn mật khẩu
                    />
                    <Text style={styles.helperText}>Bạn cần nhập lại mật khẩu hoặc mật khẩu mới để xác nhận thay đổi.</Text>
                </View>

                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// --- HỆ THỐNG STYLES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 20,
        marginTop: 10
    },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    iconBtn: { padding: 4 },
    saveText: { color: '#1DB954', fontSize: 16, fontWeight: 'bold' },
    form: { paddingHorizontal: 20 },
    inputGroup: { marginBottom: 25 },
    label: { color: '#fff', fontSize: 13, fontWeight: '600', marginBottom: 10 },
    input: {
        backgroundColor: '#282828',
        color: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16
    },
    helperText: { color: '#666', fontSize: 12, marginTop: 8, lineHeight: 18 }
});