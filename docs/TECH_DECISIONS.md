# Technical Decisions (AI Affiliate Auto-Pilot)

1. **Giữ nguyên Web Frontend (React + Vite + Tailwind CSS v4)**:
   - *Lý do*: Giao diện đã được thiết kế và hoàn thiện từ Figma Make, giữ nguyên source code giúp bảo toàn 100% độ chính xác UI/UX so với thiết kế Figma, tránh tốn thời gian dựng lại từ đầu bằng Kotlin/Compose hoặc framework khác.
2. **Đóng gói Android qua Capacitor**:
   - *Lý do*: Phù hợp cho source web hiện đại (React/Vite), cho phép đóng gói ứng dụng thành Android Native App (`android/` project) chạy trên Android Studio mà vẫn giữ nguyên giao diện web UI đã tối ưu.
3. **Backend & Security (Firebase + Cloud Functions)**:
   - *Lý do*: Bảo vệ Gemini API Key khỏi frontend bundle, quản lý token ledger an toàn phía server, xác thực người dùng qua Firebase Auth và lưu trữ dữ liệu riêng tư qua Firestore Security Rules.
4. **Structured JSON Output từ Gemini**:
   - *Lý do*: Đảm bảo đầu trả về từ AI luôn có cấu trúc schema ổn định cho storyboard, cảnh, lời thoại và caption, dễ dàng render trên UI.
