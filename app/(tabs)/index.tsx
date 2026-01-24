import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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

// --- INTERFACES ---
interface Category { id: number; name: string; }
interface Artist { id: number; name: string; image?: string; }
interface Album {
  id: number;
  title: string;
  releaseYear: number;
  price: number;
  coverUrl: string;
  description?: string;
  categoryName?: string;
}
interface UserProfile { username: string; email: string; walletBalance: number; }

export default function SpotifyHomeScreen() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ownedAlbumIds, setOwnedAlbumIds] = useState<number[]>([]);

  // 🔥 STATE LƯU TRỮ DANH SÁCH ID ALBUM ĐÃ THÍCH
  const [favoriteAlbumIds, setFavoriteAlbumIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);

  // --- HÀM LẤY DỮ LIỆU ---
  const fetchHomeData = async () => {
    try {
      // Gọi đồng thời tất cả các API để tối ưu tốc độ
      const [resCat, resArt, resAlb, resProf, resMyAlbums, resFavAlbums] = await Promise.all([
        apiClient.get('/public/categories'),
        apiClient.get('/public/artists/popular'),
        apiClient.get('/public/albums'),
        apiClient.get('/customer/profile').catch(() => null),
        apiClient.get('/customer/profile/my-albums').catch(() => ({ data: [] })),
        // 🔥 Gọi API Backend: Lấy danh sách Album yêu thích của tôi
        apiClient.get('/customer/favorites/my-albums').catch(() => ({ data: [] }))
      ]);

      if (resCat) setCategories(resCat.data);
      if (resArt) setArtists(resArt.data);
      if (resAlb) setAlbums(resAlb.data);
      if (resProf) setProfile(resProf.data);

      if (resMyAlbums) {
        const ids = resMyAlbums.data.map((item: any) => item.id);
        setOwnedAlbumIds(ids);
      }

      // 🔥 Cập nhật danh sách ID đã thích để hiển thị icon Tim
      if (resFavAlbums) {
        const favIds = resFavAlbums.data.map((item: any) => item.id);
        setFavoriteAlbumIds(favIds);
      }
    } catch (error) {
      console.error("Lỗi kết nối API:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [])
  );

  // --- 🔥 HÀM TOGGLE YÊU THÍCH ALBUM ---
  const handleToggleFavorite = async (albumId: number) => {
    try {
      // Gọi đúng Endpoint POST /api/customer/favorites/album/{id} ở Backend
      const res = await apiClient.post(`/customer/favorites/album/${albumId}`);
      const isNowFavorite = res.data; // Backend trả về true/false

      if (isNowFavorite) {
        // Thêm vào danh sách state cục bộ
        setFavoriteAlbumIds(prev => [...prev, albumId]);
      } else {
        // Xóa khỏi danh sách state cục bộ
        setFavoriteAlbumIds(prev => prev.filter(id => id !== albumId));
      }
    } catch (error) {
      console.error("Lỗi yêu thích album:", error);
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
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <View style={styles.profileCircle}>
              <Text style={styles.profileChar}>
                {profile?.username ? profile.username.charAt(0).toUpperCase() : 'G'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* --- SECTION 2: ALBUMS NỔI BẬT --- */}
        <Text style={styles.sectionTitle}>Albums nổi bật</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollPadding}>
          {albums.map((album) => {
            const isOwned = ownedAlbumIds.includes(album.id);
            const isFavorite = favoriteAlbumIds.includes(album.id); // Check trạng thái Tim

            return (
              <TouchableOpacity
                key={album.id}
                style={styles.albumCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/album/${album.id}` as any)}
              >
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: album.coverUrl || 'https://via.placeholder.com/150' }}
                    style={styles.albumImage}
                  />

                  {/* 🔥 NÚT THẢ TIM TRÊN ẢNH ALBUM */}
                  <TouchableOpacity
                    style={styles.favIconOverlay}
                    onPress={() => handleToggleFavorite(album.id)}
                  >
                    <Ionicons
                      name={isFavorite ? "heart" : "heart-outline"}
                      size={20}
                      color={isFavorite ? "#1DB954" : "#fff"}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.albumNameText} numberOfLines={1}>
                  {album.title}
                </Text>

                <Text style={styles.releaseYearText}>
                  Năm: {album.releaseYear || '2024'}
                </Text>

                {isOwned ? (
                  <View style={[styles.priceTag, { backgroundColor: '#1DB95422' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialIcons name="verified" size={12} color="#1DB954" />
                      <Text style={[styles.priceText, { marginLeft: 4 }]}>ĐÃ SỞ HỮU</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>
                      {album.price > 0 ? `${album.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* --- SECTION 3: NGHỆ SĨ --- */}
        <Text style={styles.sectionTitle}>Nghệ sĩ đang hot</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollPadding}>
          {artists.map((artist) => (
            <TouchableOpacity
              key={artist.id}
              style={styles.artistItem}
              onPress={() => router.push(`/artist/${artist.id}` as any)}
            >
              <Image source={{ uri: artist.image || 'https://via.placeholder.com/100' }} style={styles.artistCircleImg} />
              <Text style={styles.artistNameText} numberOfLines={1}>{artist.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, marginTop: 40 },
  profileCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E67E22', justifyContent: 'center', alignItems: 'center' },
  profileChar: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', margin: 16 },
  scrollPadding: { paddingLeft: 16 },
  albumCard: { width: 140, marginRight: 16, minHeight: 230 },
  albumImage: { width: 140, height: 140, borderRadius: 8, backgroundColor: '#333' },

  // 🔥 Style cho nút thả tim
  favIconOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 6,
    borderRadius: 20,
  },

  albumNameText: { color: '#ffffff', marginTop: 10, fontWeight: 'bold', fontSize: 14 },
  releaseYearText: { color: '#b3b3b3', fontSize: 11, marginTop: 2 },
  priceTag: { marginTop: 6, backgroundColor: '#1DB95422', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priceText: { color: '#1DB954', fontSize: 11, fontWeight: 'bold' },
  artistItem: { alignItems: 'center', marginRight: 16, width: 100 },
  artistCircleImg: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#333' },
  artistNameText: { color: '#fff', marginTop: 8, fontSize: 12, textAlign: 'center' }
});