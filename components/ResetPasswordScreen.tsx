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
import { MusicService } from '../services/musicService';

interface ResetPasswordScreenProps {
    email: string;
    otpCode: string;
    onPasswordReset: () => void;
    onBack: () => void;
}

export default function ResetPasswordScreen({ email, otpCode, onPasswordReset, onBack }: ResetPasswordScreenProps) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }

        setIsLoading(true);

        try {
            await MusicService.auth.resetPassword(email, otpCode, newPassword);

            setIsLoading(false);

            Alert.alert(
                'Thành công',
                'Mật khẩu đã được thay đổi thành công! Bạn có thể đăng nhập với mật khẩu mới.',
                [
                    {
                        text: 'OK',
                        onPress: onPasswordReset
                    }
                ]
            );
        } catch (error: any) {
            setIsLoading(false);

            const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!';
            Alert.alert('Lỗi', errorMessage);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Feather name="chevron-left" size={24} color="#fff" />
                    <Text style={styles.backText}>Quay lại</Text>
                </TouchableOpacity>

                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Đặt lại mật khẩu</Text>
                    <Text style={styles.subtitle}>
                        Nhập mật khẩu mới cho tài khoản {email}
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Mật khẩu mới"
                            placeholderTextColor="#666"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Xác nhận mật khẩu"
                            placeholderTextColor="#666"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Feather name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        alignSelf: 'flex-start',
    },
    backText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 8,
    },
    headerContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        color: '#ccc',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 30,
    },
    passwordContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    passwordInput: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        paddingRight: 50,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: '50%',
        marginTop: -10,
    },
    button: {
        backgroundColor: '#1DB954',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        backgroundColor: '#666',
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
});