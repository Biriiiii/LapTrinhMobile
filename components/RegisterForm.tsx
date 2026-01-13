import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import apiClient from '../services/apiClient'; // Đảm bảo đường dẫn này đúng với dự án của bạn

export default function RegisterForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // 1. Cập nhật State khớp với các trường API yêu cầu
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleRegister = async () => {
        const { username, fullName, email, password, confirmPassword } = formData;

        // 2. Kiểm tra dữ liệu đầu vào (Validation)
        if (!username || !fullName || !email || !password) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin!');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            setLoading(true);

            // 3. Cấu trúc JSON gửi lên đúng như bạn yêu cầu
            const payload = {
                username: username,
                email: email,
                password: password,
                fullName: fullName
            };

            const response = await apiClient.post('/auth/register', payload);

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Thành công', 'Tài khoản đã được tạo! Vui lòng đăng nhập.', [
                    { text: 'OK', onPress: () => router.push('/auth') } // Chuyển sang trang đăng nhập
                ]);
            }
        } catch (error: any) {
            console.error("Lỗi Đăng ký:", error.response?.data);
            const errorMsg = error.response?.data?.message || 'Đăng ký thất bại. Tên đăng nhập hoặc Email có thể đã tồn tại.';
            Alert.alert('Lỗi', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Tạo Tài Khoản</Text>

            {/* Họ và tên */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Họ và tên (Full Name)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#666666"
                    value={formData.fullName}
                    onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                />
            </View>

            {/* Tên đăng nhập */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Tên đăng nhập (Username)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="testuser"
                    placeholderTextColor="#666666"
                    autoCapitalize="none"
                    value={formData.username}
                    onChangeText={(text) => setFormData({ ...formData, username: text })}
                />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="testuser@example.com"
                    placeholderTextColor="#666666"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            {/* Mật khẩu */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Mật khẩu</Text>
                <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#666666"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry={true}
                    autoCapitalize="none"
                />
            </View>

            {/* Xác nhận mật khẩu */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#666666"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                    secureTextEntry={true}
                    autoCapitalize="none"
                />
            </View>

            {/* Nút bấm */}
            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text style={styles.buttonText}>ĐĂNG KÝ NGAY</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth')} style={{ marginTop: 20 }}>
                <Text style={{ color: '#999', textAlign: 'center' }}>
                    Đã có tài khoản? <Text style={{ color: '#fff', fontWeight: 'bold' }}>Đăng nhập</Text>
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        paddingTop: 60,
        backgroundColor: '#000',
        flexGrow: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#ffffff',
        marginBottom: 36,
        textAlign: 'left',
        letterSpacing: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        color: '#999999',
        marginBottom: 8,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        borderWidth: 1,
        borderColor: '#333333',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        color: '#ffffff',
        backgroundColor: '#111',
        height: 56,
    },
    button: {
        backgroundColor: '#ffffff',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    buttonText: {
        color: '#000000',
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 1,
    }
});