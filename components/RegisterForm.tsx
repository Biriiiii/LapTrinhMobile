// File: components/RegisterForm.tsx
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleRegister = () => {
        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu không khớp!');
            return;
        }
        Alert.alert('Thành công', `Đăng ký cho: ${formData.name}`);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Đăng Ký Tài Khoản</Text>

            {/* Tên */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Họ và tên</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#666666"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="email@example.com"
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
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Đăng Ký</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: 'transparent',
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#ffffff',
        marginBottom: 36,
        textAlign: 'center',
        letterSpacing: 1,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 13,
        color: '#999999',
        marginBottom: 10,
        fontWeight: '600',
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
        backgroundColor: '#000000',
        height: 56,
    },
    button: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonText: {
        color: '#000000',
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 1,
    }
});