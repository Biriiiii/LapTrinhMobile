import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
// Sử dụng FontAwesome cho logo Facebook/Google
import { FontAwesome } from '@expo/vector-icons';

// Import 3 screens
import ForgotPasswordScreen from './ForgotPasswordScreen';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type ScreenType = 'login' | 'register' | 'forgot';

export default function AuthScreen() {
    const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');

    // Nếu đang ở màn hình Quên mật khẩu
    if (currentScreen === 'forgot') {
        return <ForgotPasswordScreen onBackToLogin={() => setCurrentScreen('login')} />;
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>

                {/* Container chính (thay cho div bao ngoài) */}
                <View style={styles.card}>

                    {/* Header màu tím */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Chào mừng!</Text>
                        <Text style={styles.headerSubtitle}>
                            {currentScreen === 'login' ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}
                        </Text>
                    </View>

                    {/* Form Container */}
                    <View style={styles.formBody}>

                        {/* Hiển thị Login hoặc Register */}
                        {currentScreen === 'login' ? (
                            <LoginForm onForgotPassword={() => setCurrentScreen('forgot')} />
                        ) : (
                            <RegisterForm />
                        )}

                        {/* Nút chuyển đổi giữa Login/Register */}
                        <View style={styles.toggleContainer}>
                            <Text style={styles.textGray}>
                                {currentScreen === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                            </Text>
                            <TouchableOpacity onPress={() => setCurrentScreen(currentScreen === 'login' ? 'register' : 'login')}>
                                <Text style={styles.linkText}>
                                    {currentScreen === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Đường kẻ ngang (Divider) */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Login Buttons */}
                        <View style={styles.socialContainer}>
                            {/* Google Button */}
                            <TouchableOpacity style={styles.socialButton}>
                                <FontAwesome name="google" size={20} color="#EA4335" />
                                <Text style={styles.socialText}>Google</Text>
                            </TouchableOpacity>

                            {/* Facebook Button */}
                            <TouchableOpacity style={styles.socialButton}>
                                <FontAwesome name="facebook" size={20} color="#1877F2" />
                                <Text style={styles.socialText}>Facebook</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#000000', // Nền đen tuyền
    },
    card: {
        backgroundColor: '#1a1a1a', // Đen nhẹ
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    header: {
        backgroundColor: '#000000',
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#ffffff',
        marginBottom: 8,
        letterSpacing: 1,
    },
    headerSubtitle: {
        color: '#999999',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    formBody: {
        padding: 24,
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        marginBottom: 24,
    },
    textGray: {
        color: '#999999',
        fontSize: 15,
    },
    linkText: {
        color: '#ffffff',
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#333333',
    },
    dividerText: {
        marginHorizontal: 12,
        color: '#666666',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 12,
        backgroundColor: '#000000',
    },
    socialText: {
        marginLeft: 8,
        color: '#ffffff',
        fontWeight: '600',
    },
});