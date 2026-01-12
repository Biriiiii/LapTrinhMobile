import { FontAwesome } from '@expo/vector-icons';
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

// Import các màn hình con
import ForgotPasswordScreen from '../components/ForgotPasswordScreen'; // Nếu bạn để cùng folder app
import LoginForm from '../components/LoginForm';
import OtpScreen from '../components/OtpScreen';
import RegisterForm from '../components/RegisterForm';

type ScreenType = 'login' | 'register' | 'forgot' | 'otp';

export default function AuthScreen() {
    const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
    const [resetEmail, setResetEmail] = useState<string>('');

    // Nếu đang ở màn hình Quên mật khẩu
    if (currentScreen === 'forgot') {
        return (
            <ForgotPasswordScreen
                onBackToLogin={() => setCurrentScreen('login')}
                onEmailSubmitted={(email: string) => {
                    setResetEmail(email);
                    setCurrentScreen('otp');
                }}
            />
        );
    }

    // Nếu đang ở màn hình nhập OTP
    if (currentScreen === 'otp') {
        return (
            <OtpScreen
                onVerifyOtp={(otp: string) => {
                    console.log('Verifying OTP:', otp);
                    // TODO: handle OTP verification API here
                    alert('OTP Verified! Returning to login.');
                    setCurrentScreen('login');
                }}
                onBack={() => setCurrentScreen('forgot')}
                email={resetEmail}
            />
        );
    }

    // Màn hình Login / Register
    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#000000' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>

                {/* Container chính */}
                <View style={styles.card}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Chào mừng!</Text>
                        <Text style={styles.headerSubtitle}>
                            {currentScreen === 'login' ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}
                        </Text>
                    </View>

                    {/* Form Body */}
                    <View style={styles.formBody}>
                        {currentScreen === 'login' ? (
                            // Truyền props onForgotPassword để LoginForm có thể gọi
                            <LoginForm onForgotPassword={() => setCurrentScreen('forgot')} />
                        ) : (
                            <RegisterForm />
                        )}

                        {/* Toggle Button */}
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

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Buttons */}
                        <View style={styles.socialContainer}>
                            <TouchableOpacity style={styles.socialButton}>
                                <FontAwesome name="google" size={20} color="#EA4335" />
                                <Text style={styles.socialText}>Google</Text>
                            </TouchableOpacity>

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
        backgroundColor: '#000000',
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 24,
        overflow: 'hidden',
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