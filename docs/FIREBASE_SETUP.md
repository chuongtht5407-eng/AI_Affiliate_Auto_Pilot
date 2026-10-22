# Firebase Setup Guide (AI Affiliate Auto-Pilot)

## 1. Tạo Project trên Firebase Console
1. Truy cập [Firebase Console](https://console.firebase.google.com/).
2. Nhấn **Add project** và làm theo hướng dẫn tạo project.
3. Thêm Web App vào project và copy lại Firebase Web Configuration (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `appId`).

## 2. Cấu hình Biến môi trường (.env)
Tạo tệp `.env` ở thư mục gốc dự án:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_APP_ID=your_app_id
```

## 3. Cấu hình Authentication
1. Vào **Authentication** > **Sign-in method**.
2. Bật **Email/Password** provider.

## 4. Firestore & Storage Security Rules
- **Firestore Rules**: Sử dụng tệp `firestore.rules` có sẵn trong dự án để bảo vệ dữ liệu theo UID người dùng.
- **Storage Rules**: Sử dụng tệp `storage.rules` để giới hạn quyền upload file riêng tư tại `users/{uid}/uploads/`.
