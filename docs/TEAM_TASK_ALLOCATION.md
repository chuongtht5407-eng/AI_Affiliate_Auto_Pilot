# Bảng Phân Công Công Việc Chi Tiết Cho Nhóm 3 Người
## Dự án: AI Affiliate Auto-Pilot (Production-Ready Architecture)

---

## 👥 Tổng quan phân vai chuyên môn hóa (Team of 3)

| Thành viên | Vai trò chính | Trọng tâm công việc |
| :--- | :--- | :--- |
| **Thành viên 1** | **Frontend & Mobile Lead** | Giao diện React/Vite, UI/UX 15 màn hình Figma, State Management, Capacitor Android Build & QA. |
| **Thành viên 2** | **Backend & AI Integration Lead** | Firebase Cloud Functions (Node.js), Gemini API, Prompt Engineering, Product URL Scraper Adapter. |
| **Thành viên 3** | **Database, Security & Payment/Video Lead** | Cloud Firestore, Security Rules, Token Ledger (Sổ cái Token), MoMo Payment API & Video Worker. |

---

## 🛠️ Chi tiết công việc cho từng thành viên

### 📱 Thành viên 1: Frontend & Mobile Lead (UI/UX & Capacitor Android)
*Mục tiêu*: Đảm bảo giao diện bám sát 100% thiết kế Figma, mượt mà trên web và đóng gói thành công file APK/AAB cho Android.
1. **Hoàn thiện UI/UX & Responsive**:
   - Kiểm tra và tinh chỉnh giao diện 15 màn hình (Splash, Onboarding, Home, Analyzer, Analysis, Generator, Result, Voice, History, Wallet, Plans, Payment, Profile).
   - Xử lý các trạng thái: `Loading` (spinner/skeleton), `Empty`, `Error` (thông báo tiếng Việt thân thiện), `Success`.
2. **Tích hợp UI với Auth & Firestore**:
   - Kết nối màn hình Login/Register với Firebase Authentication SDK thật.
   - Hiển thị số dư Token thực tế từ Firestore thay vì LocalStorage đơn thuần.
3. **Đóng gói ứng dụng Android (Capacitor)**:
   - Quản lý cấu hình `capacitor.config.ts`.
   - Chạy lệnh `npm run build && npx cap sync android`.
   - Kiểm thử trên Android Emulator / thiết bị thật, kiểm tra bàn phím, safe area và nút Back vật lý của Android.

### ⚙️ Thành viên 2: Backend & AI Integration Lead (Cloud Functions & Gemini API)
*Mục tiêu*: Xây dựng tầng API bảo mật phía server, xử lý bóc tách thông tin sản phẩm từ link Shopee/Lazada và tích hợp Gemini AI.
1. **Xây dựng Firebase Cloud Functions (Gen 2)**:
   - Tạo các API endpoint `/api/v1/...` bảo mật, giữ kín `GEMINI_API_KEY` ở server (Secret Manager).
   - Xác thực Firebase ID Token (`verifyIdToken`) cho mọi request từ client gọi lên.
2. **Phát triển Product URL Scraper Adapter**:
   - Viết adapter bóc tách metadata sản phẩm (Tên, hình ảnh, shopId, itemId) từ URL Shopee/Lazada một cách an toàn (chống SSRF).
   - Tích hợp thêm phương án dự phòng (Fallback): Dùng Gemini Vision API phân tích ảnh chụp màn hình sản phẩm khi link web bị sàn chặn bot.
3. **Tối ưu hóa Prompt Engineering cho Gemini**:
   - Hoàn thiện các prompt chuyên sâu để Gemini phân tích USP và viết kịch bản đa nền tảng (TikTok, Shopee, Facebook) chuẩn 3 cảnh (Hook, USP, CTA).

### 💳 Thành viên 3: Database, Security & Payment/Video Lead (Firestore & MoMo API)
*Mục tiêu*: Quản lý cơ sở dữ liệu an toàn, thiết lập cơ chế trừ Token nguyên tử (atomic) và tích hợp cổng thanh toán MoMo thật.
1. **Thiết lập Cloud Firestore & Security Rules**:
   - Xây dựng cấu trúc collections (`users/{uid}/products`, `campaigns`, `scripts`, `walletTransactions`, `paymentOrders`).
   - Hoàn thiện tệp `firestore.rules` và `storage.rules` đảm bảo User A không thể đọc/ghi dữ liệu của User B.
2. **Xây dựng Token Ledger (Sổ cái Token)**:
   - Viết Firestore Transaction đảm bảo trừ/cộng Token nguyên tử, hỗ trợ `idempotencyKey` chống trừ trùng lặp và tự động hoàn Token (`refundToken`) khi AI lỗi.
3. **Tích hợp MoMo Payment Gateway API**:
   - Đăng ký tài khoản Sandbox tại [developers.momo.vn](https://developers.momo.vn).
   - Viết Cloud Function tạo URL/QR thanh toán MoMo.
   - Xây dựng **MoMo Webhook / IPN Endpoint** ở backend để nhận callback từ MoMo, xác thực chữ ký HMAC SHA256 và tự động cộng Token vào tài khoản Firestore của người dùng.
4. **Auto Video Builder (FFmpeg Pipeline)**:
   - Xây dựng worker backend (Cloud Run / Node.js) nhận script, gọi TTS provider để sinh audio thật, ghép nối hình ảnh và phụ đề qua FFmpeg để xuất file MP4 hoàn chỉnh.
