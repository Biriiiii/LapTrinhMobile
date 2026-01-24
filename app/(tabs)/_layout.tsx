import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import MiniPlayer from '../../components/MiniPlayer';

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Lớp 1: Hệ thống Tabs (Nằm dưới cùng) */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#1DB954',
          tabBarInactiveTintColor: '#b3b3b3',
          tabBarStyle: {
            backgroundColor: '#000',
            borderTopWidth: 0,
            height: 60, // Cố định chiều cao thanh Tab là 60
            position: 'absolute', // Làm TabBar trong suốt hoặc đè lên nội dung
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Trang chủ', tabBarIcon: ({ color }) => <Ionicons name="home" size={22} color={color} /> }} />
        <Tabs.Screen name="search" options={{ title: 'Tìm kiếm', tabBarIcon: ({ color }) => <Ionicons name="search" size={22} color={color} /> }} />
        <Tabs.Screen name="playlist" options={{ title: 'Thư viện', tabBarIcon: ({ color }) => <Ionicons name="library" size={22} color={color} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Hồ sơ', tabBarIcon: ({ color }) => <Ionicons name="person" size={22} color={color} /> }} />
      </Tabs>

      {/* Lớp 2: Mini Player (Nằm đè lên trên thanh Tabs) */}
      <MiniPlayer />
    </View>
  );
}