# Master Engineering Prompt: Phân công nhiệm vụ hoàn thiện AI Affiliate Auto-Pilot (Team 3 người)

## 📌 Bối cảnh Dự án (Context)
- **Tên dự án**: AI Affiliate Auto-Pilot (Hệ thống sáng tạo nội dung tiếp thị liên kết bằng trí tuệ nhân tạo).
- **Trạng thái hiện tại**: Giao diện UI/UX (15 màn hình chuẩn Figma, Tailwind CSS v4, Responsive, Safe Area) đã được thiết kế và code hoàn thiện 100% trên nền tảng React + Vite + Capacitor Android.
- **Mục tiêu tiếp theo**: Hoàn thiện toàn bộ logic nghiệp vụ, kết nối API thực tế, tích hợp trọn vẹn **hệ sinh thái Firebase (9 dịch vụ)**, **Gemini AI API**, và **Auto Video Builder**.

---

## 🛠️ Công nghệ & Skills sử dụng (Tech Stack & Skills)
1. **Phân tích sản phẩm & Link (Product Analysis)**:
   - *Skill/API*: `parseShopeeUrl` (bóc tách Shop ID, Product ID, `seoName`), `resolveProductSource` (chống SSRF), và **Google GenAI SDK (`@google/genai` - Gemini 1.5 Flash / Vision)** để bóc tách USP và chấm điểm tiềm năng.
2. **Tạo kịch bản AI & Text-to-Speech (AI Script & Voiceover)**:
   - *Skill/API*: `generateScriptWithGemini` (Master Prompt Engineering đóng vai Top KOC TikTok Affiliate, sinh kịch bản chuẩn 3 cảnh: Hook, USP, CTA), kết hợp Web Speech API / Google Cloud TTS cho thuyết minh.
3. **Dựng Video Quảng Cáo (Auto Video Builder)**:
   - *Skill/API*: Multi-Scene Storyboard Player, đồng bộ subtitle theo cảnh, kết hợp Worker FFmpeg phía backend để xuất file MP4 hoàn chỉnh.
4. **Hệ sinh thái Firebase (9 Dịch vụ cốt lõi)**:
   - *Authentication*: Đăng nhập, đăng ký tài khoản.
   - *Cloud Firestore*: Lưu trữ profile, chiến dịch, lịch sử kịch bản.
   - *Realtime Database*: Đồng bộ số dư ví Token real-time.
   - *Cloud Storage*: Lưu trữ ảnh/video sản phẩm và render MP4 (`storage.rules`).
   - *Cloud Messaging (FCM)*: Gửi push notification khi hoàn tất tạo kịch bản/dựng video.
   - *Remote Config*: Điều khiển cấu hình (Token cost, bật/tắt tính năng) từ xa.
   - *Google Analytics*: Thống kê hành vi người dùng.
   - *Crashlytics*: Báo cáo lỗi tự động.
   - *AdMob*: Kiếm Token miễn phí qua quảng cáo thưởng (*Rewarded Ads*).

---

## 👥 Bảng Phân Công Nhiệm Vụ Chi Tiết Cho 3 Thành Viên

### 📱 Thành viên 1: Frontend & Mobile Lead (UI/UX, Capacitor & Client Services)
* **Phạm vi tệp phụ trách**: `src/App.tsx`, `src/index.css`, `public/`.
* **Nhiệm vụ cụ thể**:
  1. Kiểm tra và đảm bảo 15 màn hình giao diện Figma phản hồi mượt mà trên cả trình duyệt và thiết bị Android.
  2. Tích hợp **Google Analytics** (`logEvent`) để ghi nhận các hành vi người dùng (tạo kịch bản, nạp token, xem video).
  3. Tích hợp **Firebase Crashlytics** để bắt lỗi client-side.
  4. Xây dựng tính năng **AdMob Rewarded Ads** (*"Xem quảng cáo nhận +2 Tokens miễn phí"*) tại màn hình Ví Token.
  5. Quản lý build APK và sync Android qua Capacitor (`npm run build && npx cap sync android`).

### ⚙️ Thành viên 2: AI & Cloud Functions Lead (Gemini API, FCM & Remote Config)
* **Phạm vi tệp phụ trách**: `src/services/geminiService.ts`, `src/services/urlResolver.ts`, `src/services/productService.ts`, thư mục `functions/`.
* **Nhiệm vụ cụ thể**:
  1. Xây dựng Firebase Cloud Functions (Gen 2) làm API Proxy bảo mật khóa `GEMINI_API_KEY`.
  2. Hoàn thiện Product URL Scraper Adapter (bóc tách link Shopee/Lazada và tích hợp Gemini Vision API phân tích ảnh chụp màn hình sản phẩm).
  3. Tối ưu hóa Prompt Engineering cho Gemini để sinh kịch bản affiliate chuyên sâu không bị ngắn, chuẩn 3 cảnh.
  4. Tích hợp **Firebase Remote Config** để đồng bộ cấu hình token cost từ cloud và **Cloud Messaging (FCM)** gửi thông báo đẩy.

### 💳 Thành viên 3: Database, Security & Payment/Video Lead (Firestore, Realtime DB, Storage & Ledger)
* **Phạm vi tệp phụ trách**: `src/firebase.ts`, `src/services/tokenLedger.ts`, `src/services/paymentService.ts`, `src/services/videoAiService.ts`, `firestore.rules`, `storage.rules`.
* **Nhiệm vụ cụ thể**:
  1. Cấu trúc hóa **Cloud Firestore** và **Realtime Database** để đồng bộ ví token real-time.
  2. Cấu hình **Firebase Storage** bảo mật tệp riêng tư theo UID với `storage.rules`.
  3. Hoàn thiện **Sổ cái Token (`tokenLedger.ts`)** sử dụng Firestore Transaction (trừ nguyên tử, idempotency, hoàn token khi lỗi).
  4. Tích hợp cổng thanh toán MoMo Sandbox / API Webhook (IPN) xác thực giao dịch tiền thật.
  5. Xây dựng Auto Video Builder worker (FFmpeg + TTS) render file MP4 quảng cáo.
