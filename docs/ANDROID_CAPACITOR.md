# Android Capacitor Guide (AI Affiliate Auto-Pilot)

## 1. Yêu cầu hệ thống
- Node.js & pnpm
- Android Studio mới nhất kèm Android SDK (API 34+)

## 2. Các bước build và sync Android
1. Build web bundle:
   ```bash
   npm run build
   ```
2. Đồng bộ assets sang Android project:
   ```bash
   npx cap sync android
   ```
3. Mở dự án trên Android Studio:
   - Mở Android Studio > Open an Existing Project > Chọn thư mục `android` trong thư mục gốc dự án.

## 3. Chạy trên Emulator / Thiết bị thật
- Chọn thiết bị Android Emulator hoặc cắm điện thoại thật (bật USB Debugging).
- Nhấn nút **Run 'app' (▶)** trên Android Studio để cài đặt và chạy ứng dụng.
