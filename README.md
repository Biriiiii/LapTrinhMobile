# LapTrinhMobile - Ứng Dụng Phát Nhạc 🎵

Một ứng dụng di động React Native được xây dựng với Expo và TypeScript để phát nhạc, quản lý danh sách phát và xử lý thanh toán. Ứng dụng có tính năng xác thực, hồ sơ người dùng, phát nhạc và tích hợp VNPay để mua hàng trong ứng dụng.

## 📋 Tính Năng

- **Xác Thực**
  - Đăng ký và đăng nhập
  - Quên mật khẩu
  - Xác minh OTP
  - Đặt lại mật khẩu
  
- **Phát Nhạc**
  - Phát bài hát và album
  - Trình phát nhỏ để phát liên tục
  - Điều khiển phát (phát, tạm dừng, tiếp theo, trước đó)
  - Phát âm thanh bằng Expo AV
  
- **Quản Lý Nội Dung**
  - Duyệt xem album và nghệ sĩ
  - Tạo và quản lý danh sách phát
  - Tìm kiếm nội dung âm nhạc
  - Album yêu thích
  
- **Hồ Sơ Người Dùng**
  - Chỉnh sửa thông tin hồ sơ
  - Xem lịch sử giao dịch
  - Chức năng nạp tiền
  
- **Tích Hợp Thanh Toán**
  - Tích hợp cổng thanh toán VNPay
  - Xử lý thanh toán an toàn
  
- **Thiết Kế Đáp Ứng**
  - Hỗ trợ chủ đề tối/sáng
  - Điều hướng dựa trên tab
  - Các màn hình modal chi tiết

## 🚀 Bắt Đầu

### Yêu Cầu Tiên Quyết

- Node.js (phiên bản 16 trở lên)
- npm hoặc yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (cho phát triển Android) hoặc Xcode (cho phát triển iOS)

### Cài Đặt

1. Sao chép kho lưu trữ:
   ```bash
   git clone <repository-url>
   cd LapTrinhMobile
   ```

2. Cài đặt các phụ thuộc:
   ```bash
   npm install
   ```

3. Khởi động máy chủ phát triển:
   ```bash
   npm start
   ```

### Chạy Trên Các Nền Tảng Khác Nhau

- **iOS Simulator:**
  ```bash
  npm run ios
  ```

- **Android Emulator:**
  ```bash
  npm run android
  ```

- **Trình Duyệt Web:**
  ```bash
  npm run web
  ```

## 📁 Cấu Trúc Dự Án

```
LapTrinhMobile/
├── app/                          # Màn hình ứng dụng và tuyến đường
│   ├── _layout.tsx              # Bố cục gốc
│   ├── auth.tsx                 # Màn hình xác thực
│   ├── edit-profile.tsx         # Màn hình chỉnh sửa hồ sơ
│   ├── favorite-albums.tsx      # Màn hình album yêu thích
│   ├── modal.tsx                # Màn hình modal
│   ├── my-albums.tsx            # Màn hình album của tôi
│   ├── player.tsx               # Màn hình trình phát
│   ├── top-up.tsx               # Màn hình nạp tiền
│   ├── transaction-history.tsx  # Màn hình lịch sử giao dịch
│   ├── (tabs)/                  # Điều hướng tab
│   ├── album/                   # Trang chi tiết album
│   ├── artist/                  # Trang chi tiết nghệ sĩ
│   ├── playlist/                # Trang chi tiết danh sách phát
│   └── song/                    # Trang chi tiết bài hát
├── assets/                       # Tài sản tĩnh (hình ảnh, phông chữ)
├── components/                   # Các thành phần React tái sử dụng
│   ├── Thành phần xác thực (LoginForm, RegisterForm, v.v.)
│   ├── Thành phần trình phát (MiniPlayer, PlayerControls)
│   └── Thành phần UI
├── context/                      # React Context API
│   ├── AuthContext.tsx          # Trạng thái xác thực
│   └── PlayerContext.tsx        # Quản lý trạng thái trình phát
├── hooks/                        # Hook React tùy chỉnh
│   ├── use-color-scheme.ts
│   ├── use-theme-color.ts
│   └── use-color-scheme.web.ts
├── services/                     # Dịch vụ API
│   ├── apiClient.ts             # Cấu hình Axios
│   ├── musicService.ts          # Gọi API nhạc
│   ├── paymentApi.ts            # Tích hợp thanh toán
│   └── types.ts                 # Định nghĩa kiểu TypeScript
├── utils/                        # Các hàm tiện ích
│   ├── axios.ts                 # Cài đặt phiên bản Axios
│   └── storage.ts               # Tiện ích lưu trữ cục bộ
├── constants/                    # Hằng số ứng dụng
│   └── theme.ts                 # Cấu hình chủ đề
└── package.json                 # Phụ thuộc và kịch bản
```

## 🔧 Cấu Hình

### Biến Môi Trường

Ứng dụng sử dụng điểm cuối cổng thanh toán VNPay. Cập nhật URL API trong `services/paymentApi.ts`:

```typescript
const API_URL = 'https://your-api-url.com';
```

### Tùy Chỉnh Chủ Đề

Sửa đổi màu chủ đề và kiểu trong `constants/theme.ts`.

## 📦 Phụ Thuộc Chính

- **Expo**: Nền tảng để xây dựng ứng dụng React Native
- **React Navigation**: Điều hướng và định tuyến
- **Axios**: HTTP client cho gọi API
- **React Native Reanimated**: Thư viện hoạt ảnh
- **Expo AV**: Phát âm thanh và video
- **Expo Secure Store**: Lưu trữ thông tin xác thực an toàn
- **React Native Gesture Handler**: Nhận dạng cử chỉ

## 🔐 Tính Năng Bảo Mật

- Lưu trữ token an toàn bằng Expo Secure Store
- Giao tiếp API an toàn thông qua HTTPS
- Xác minh OTP để đặt lại mật khẩu
- Giao dịch thanh toán được mã hóa

## 🧪 Chất Lượng Mã

Chạy ESLint để kiểm tra chất lượng mã:

```bash
npm run lint
```

## 📱 Nền Tảng Được Hỗ Trợ

- iOS (11+)
- Android (8.0+)
- Trình duyệt web

## 🎯 Tích Hợp API

Ứng dụng tích hợp với API phía sau cho:
- Xác thực người dùng và quản lý hồ sơ
- Nội dung âm nhạc (album, nghệ sĩ, danh sách phát, bài hát)
- Xử lý thanh toán thông qua VNPay
- Lịch sử giao dịch và quản lý ví

## 🤝 Đóng Góp

1. Tạo nhánh tính năng (`git checkout -b feature/AmazingFeature`)
2. Xác nhận các thay đổi của bạn (`git commit -m 'Add some AmazingFeature'`)
3. Đẩy tới nhánh (`git push origin feature/AmazingFeature`)
4. Mở Yêu Cầu Kéo

## 📄 Giấy Phép

Dự án này được cấp phép theo Giấy Phép MIT.

## 📞 Hỗ Trợ

Để báo cáo sự cố và câu hỏi, vui lòng tạo vấn đề trong kho lưu trữ.
