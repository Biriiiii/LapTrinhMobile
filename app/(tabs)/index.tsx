import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 1. BẮT BUỘC: Phải có import này
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import apiClient from '../../services/apiClient';

// --- 1. ĐỊNH NGHĨA INTERFACES ---
interface Category { id: number; name: string; }
interface Artist { id: number; name: string; image?: string; }
interface Album {
  id: number;
  name?: string;
  title?: string;
  image?: string;
  price: number;
}
interface UserProfile { username: string; email: string; }

export default function SpotifyHomeScreen() {
  // 2. BẮT BUỘC: Khai báo router bên trong component
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [resCat, resArt, resAlb, resProf] = await Promise.all([
        apiClient.get('/public/categories'),
        apiClient.get('/public/artists/popular'),
        apiClient.get('/public/albums'),
        apiClient.get('/customer/profile').catch(() => null)
      ]);

      if (resCat) setCategories(resCat.data);
      if (resArt) setArtists(resArt.data);
      if (resAlb) setAlbums(resAlb.data);
      if (resProf) setProfile(resProf.data);
    } catch (error) {
      console.error("Lỗi kết nối API:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileChar}>
              {profile?.username ? profile.username.charAt(0).toUpperCase() : 'G'}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {['Tất cả', 'Âm nhạc', 'Albums', 'Nghệ sĩ'].map((chip, index) => (
              <TouchableOpacity key={index} style={[styles.chip, index === 0 && styles.chipActive]}>
                <Text style={[styles.chipText, index === 0 && styles.chipTextActive]}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* --- SECTION 1: THỂ LOẠI --- */}
        <Text style={styles.sectionTitle}>Thể loại phổ biến</Text>
        <View style={styles.recentGrid}>
          {categories.map((item) => (
            <TouchableOpacity key={item.id} style={styles.recentItem} activeOpacity={0.7}>
              <View style={styles.recentImagePlaceholder}>
                <Feather name="grid" size={20} color="#1DB954" />
              </View>
              <Text style={styles.recentText} numberOfLines={2}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- SECTION 2: ALBUMS (DÒNG FIX LỖI TẠI ĐÂY) --- */}
        <Text style={styles.sectionTitle}>Albums nổi bật</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollPadding}>
          {albums.map((album) => (
            <TouchableOpacity
              key={album.id}
              style={styles.albumCard}
              activeOpacity={0.8}
              // Sửa lỗi: Thêm 'as any' để TypeScript không bắt lỗi định dạng chuỗi
              onPress={() => router.push(`/album/${album.id}` as any)}
            >
              <Image
                source={{ uri: album.image || 'https://via.placeholder.com/150' }}
                style={styles.albumImage}
              />
              <Text style={styles.albumNameText} numberOfLines={2}>
                {album.name || album.title || "Album không tên"}
              </Text>
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>
                  {album.price > 0 ? `${album.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* --- SECTION 3: NGHỆ SĨ --- */}
        <Text style={styles.sectionTitle}>Nghệ sĩ đang hot</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollPadding}>
          {artists.map((artist) => (
            <TouchableOpacity
              key={artist.id}
              style={styles.artistItem}
              activeOpacity={0.8}
              // Sửa lỗi: Điều hướng sang trang artist
              onPress={() => router.push(`/artist/${artist.id}` as any)}
            >
              <Image source={{ uri: artist.image || 'https://via.placeholder.com/100' }} style={styles.artistCircleImg} />
              <Text style={styles.artistNameText} numberOfLines={1}>{artist.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* --- MINI PLAYER --- */}
      <View style={styles.miniPlayer}>
        <View style={styles.miniPlayerIcon}>
          <MaterialCommunityIcons name="music-note" size={24} color="#1DB954" />
        </View>
        <View style={styles.miniPlayerInfo}>
          <Text style={styles.miniTitle} numberOfLines={1}>Sẵn sàng phát nhạc</Text>
          <Text style={styles.miniArtist} numberOfLines={1}>Chọn Album để nghe</Text>
        </View>
        <Feather name="play" size={26} color="#fff" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, marginTop: 40 },
  profileCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E67E22', justifyContent: 'center', alignItems: 'center' },
  profileChar: { color: '#fff', fontWeight: 'bold' },
  chipContainer: { marginLeft: 10 },
  chip: { backgroundColor: '#282828', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  chipActive: { backgroundColor: '#1DB954' },
  chipText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#000' },
  sectionTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', margin: 16 },
  recentGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  recentItem: { width: '46%', backgroundColor: '#282828', margin: '2%', flexDirection: 'row', alignItems: 'center', borderRadius: 4, overflow: 'hidden' },
  recentImagePlaceholder: { width: 56, height: 56, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  recentText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 8, flex: 1 },
  scrollPadding: { paddingLeft: 16 },
  albumCard: { width: 140, marginRight: 16, minHeight: 210 },
  albumImage: { width: 140, height: 140, borderRadius: 8, backgroundColor: '#333' },
  albumNameText: { color: '#ffffff', marginTop: 10, fontWeight: 'bold', fontSize: 14, minHeight: 35 },
  priceTag: { marginTop: 6, backgroundColor: '#1DB95422', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  priceText: { color: '#1DB954', fontSize: 12, fontWeight: 'bold' },
  artistItem: { alignItems: 'center', marginRight: 16, width: 100 },
  artistCircleImg: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#333' },
  artistNameText: { color: '#fff', marginTop: 8, fontSize: 12, textAlign: 'center' },
  miniPlayer: {
    position: 'absolute', bottom: 10, left: 10, right: 10,
    backgroundColor: '#282828', height: 60, borderRadius: 8,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15,
    elevation: 10, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10
  },
  miniPlayerIcon: { width: 40, height: 40, borderRadius: 4, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  miniPlayerInfo: { flex: 1, marginLeft: 12 },
  miniTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  miniArtist: { color: '#999', fontSize: 11 }
});