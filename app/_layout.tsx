import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { PlayerProvider } from '../context/PlayerContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <PlayerProvider>
        {/* Stack ở đây quản lý việc chuyển giữa nhóm Tabs và màn hình Player (dạng Modal) */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="player" options={{ presentation: 'modal' }} />
        </Stack>
      </PlayerProvider>
    </AuthProvider>
  );
}