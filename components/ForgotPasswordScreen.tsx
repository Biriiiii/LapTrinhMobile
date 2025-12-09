import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface ForgotPasswordScreenProps {
    onBackToLogin: () => void;
    onEmailSubmitted: (email: string) => void;
}

export default function ForgotPasswordScreen({ onBackToLogin, onEmailSubmitted }: ForgotPasswordScreenProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); // Đã thêm biến này

    const handleResetPassword = () => {
        if (!email) {
            Alert.alert('Lỗi', 'Vui lòng nhập email của bạn!');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Lỗi', 'Email không hợp lệ!');
            return;
        }

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true); // Cập nhật trạng thái thành công

            // Chuyển sang màn hình OTP sau 500ms để người dùng kịp thấy thông báo thành công (nếu cần)
            setTimeout(() => {
                onEmailSubmitted(email);
            }, 500);
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.content}>
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBackToLogin}
                >
                    <Feather name="arrow-left" size={24} color="#ffffff" />
                </TouchableOpacity>

                {/* Icon */}
                <View style={styles.iconContainer}>
                    <Feather name="lock" size={60} color="#ffffff" />
                </View>

                {/* Title */}
                <Text style={styles.title}>Quên mật khẩu?</Text>
                <Text style={styles.subtitle}>
                    Không sao! Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
                </Text>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputContainer}>
                        <Feather name="mail" size={20} color="#666666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="your@email.com"
                            placeholderTextColor="#666666"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                    </View>
                </View>

                {/* Success Message */}
                {isSuccess && (
                    <View style={styles.successMessage}>
                        <Feather name="check-circle" size={20} color="#4BB543" />
                        <Text style={styles.successText}>
                            Email đã được gửi thành công!
                        </Text>
                    </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#000000" />
                            <Text style={styles.buttonText}>Đang xử lý...</Text>
                        </View>
                    ) : (
                        <Text style={styles.buttonText}>Gửi email khôi phục</Text>
                    )}
                </TouchableOpacity>

                {/* Back to Login Link */}
                <TouchableOpacity
                    style={styles.backToLoginContainer}
                    onPress={onBackToLogin}
                >
                    <Feather name="arrow-left" size={16} color="#ffffff" />
                    <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
                </TouchableOpacity>

                {/* Help Text */}
                <View style={styles.helpContainer}>
                    <Feather name="info" size={16} color="#999999" />
                    <Text style={styles.helpText}>
                        Không nhận được email? Kiểm tra thư mục spam hoặc thử lại sau vài phút.
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 40, // Tăng lên một chút để tránh tai thỏ
        left: 20,
        padding: 8,
        zIndex: 1,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: '#999999',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    inputGroup: {
        marginBottom: 32,
    },
    label: {
        fontSize: 13,
        color: '#999999',
        marginBottom: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        backgroundColor: '#1a1a1a',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#ffffff',
    },
    successMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#4BB543',
    },
    successText: {
        marginLeft: 8,
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 24,
    },
    buttonDisabled: {
        backgroundColor: '#666666',
    },
    buttonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backToLoginContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 8,
    },
    backToLoginText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    helpContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: '#333333',
    },
    helpText: {
        flex: 1,
        color: '#999999',
        fontSize: 12,
        lineHeight: 18,
    },
});