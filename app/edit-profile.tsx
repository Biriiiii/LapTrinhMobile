import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router'; // Thêm useFocusEffect
import React, { useCallback, useState } from 'react'; // Thêm useCallback
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
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

export default function EditProfileScreen() {
    const router = useRouter();
    const { updateUser } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // --- 🚀 HÀM TẢI DỮ LIỆU HIỆN TẠI ---
    const loadCurrentProfile = async () => {
        try {
            setFetching(true);
            const res = await apiClient.get('/customer/profile');
            const data = res.data;
            setUsername(data.username || '');
            setEmail(data.email || '');
            setFullName(data.fullName || '');
            setPassword(''); // Luôn reset password mỗi khi load lại form
        } catch (error) {
            console.error("Lỗi tải profile:", error);
            Alert.alert("Lỗi", "Không thể lấy thông tin hồ sơ hiện tại.");
        } finally {
            setFetching(false);
        }
    };

    // --- 🔥 CẬP NHẬT TỨC THÌ: useFocusEffect ---
    // Giúp form luôn nhận dữ liệu mới nhất mỗi khi trang được mở ra
    useFocusEffect(
        useCallback(() => {
            loadCurrentProfile();
        }, [])
    );

    const handleSave = async () => {
        if (!username || !email || !fullName) {
            return Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin.");
        }

        try {
            setLoading(true);

            // Tạo payload gửi lên Server
            const updateData: any = {
                username: username.trim(),
                email: email.trim(),
                fullName: fullName.trim()
            };

            // Chỉ gửi password nếu có thay đổi
            if (password && password.trim() !== "") {
                if (password.length < 6) {
                    setLoading(false);
                    return Alert.alert("Thông báo", "Mật khẩu mới phải từ 6 ký tự trở lên.");
                }
                updateData.password = password;
            }

            console.log("🚀 PAYLOAD GỬI LÊN SERVER:", JSON.stringify(updateData));

            const res = await apiClient.put('/customer/profile', updateData);

            // Cập nhật lại thông tin trong AuthContext toàn cục
            await updateUser(res.data);

            Alert.alert("Thành công", "Hồ sơ đã cập nhật!", [
                { text: "OK", onPress: () => router.back() }
            ]);

        } catch (error: any) {
            console.error("Lỗi 400 từ Server:", error.response?.data);
            const errorMsg = error.response?.data?.validationErrors?.password
                || error.response?.data?.message
                || "Không thể cập nhật hồ sơ.";
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

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Họ và tên</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholderTextColor="#555"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mật khẩu mới (Bỏ trống nếu không đổi)</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Nhập mật khẩu mới..."
                        secureTextEntry
                        placeholderTextColor="#555"
                    />
                </View>
                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 10 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    iconBtn: { padding: 4 },
    saveText: { color: '#1DB954', fontSize: 16, fontWeight: 'bold' },
    form: { paddingHorizontal: 20 },
    inputGroup: { marginBottom: 25 },
    label: { color: '#fff', fontSize: 13, marginBottom: 10 },
    input: { backgroundColor: '#282828', color: '#fff', padding: 12, borderRadius: 8, fontSize: 16 }
});