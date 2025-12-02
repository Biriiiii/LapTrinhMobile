// File: App.tsx (Nằm ở thư mục ngoài cùng)
import { StatusBar } from 'expo-status-bar';
import { Platform, SafeAreaView, StyleSheet } from 'react-native';

// Import màn hình AuthScreen (nhớ đường dẫn ./components/AuthScreen)
import AuthScreen from './components/AuthScreen';

export default function App() {
    return (
        <SafeAreaView style={styles.container}>
            {/* Gọi màn hình đăng nhập ra */}
            <AuthScreen />

            {/* Chỉnh màu thanh trạng thái (pin, đồng hồ) */}
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // Màu nền trắng
        // Padding cho Android để tránh đè lên thanh trạng thái
        paddingTop: Platform.OS === 'android' ? 35 : 0,
    },
});