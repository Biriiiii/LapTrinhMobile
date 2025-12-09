import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface OtpScreenProps {
    onVerifyOtp: (otp: string) => void;
    onBack: () => void;
    email: string; // Nhận email để hiển thị nếu cần
}

const OtpScreen = ({ onVerifyOtp, onBack, email }: OtpScreenProps) => {
    const [otp, setOtp] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Nhập mã OTP</Text>
            <Text style={styles.subtitle}>
                Mã xác thực đã được gửi đến {email ? email : 'email của bạn'}.
            </Text>
            <TextInput
                style={styles.input}
                placeholder="000000"
                placeholderTextColor="#666"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus={true}
            />
            <TouchableOpacity style={styles.button} onPress={() => onVerifyOtp(otp)}>
                <Text style={styles.buttonText}>Xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000', // Sửa lại cho khớp màu nền Main
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 12,
        letterSpacing: 1,
    },
    subtitle: {
        color: '#999',
        fontSize: 16,
        marginBottom: 40,
        textAlign: 'center',
        lineHeight: 24,
    },
    input: {
        width: '100%',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#333',
        textAlign: 'center',
        letterSpacing: 8,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 32,
        marginBottom: 16,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 1,
    },
    backButton: {
        marginTop: 8,
        padding: 10,
    },
    backButtonText: {
        color: '#999',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default OtpScreen;