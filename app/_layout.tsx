import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { PlayerProvider } from '../context/PlayerContext';

function RootLayoutNav() {
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!token) router.replace('/auth' as any);
      else router.replace('/(tabs)');
    }
  }, [token, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <RootLayoutNav />
      </PlayerProvider>
    </AuthProvider>
  );
}