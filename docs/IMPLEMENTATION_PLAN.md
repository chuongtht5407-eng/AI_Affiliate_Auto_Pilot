# Implementation Plan (AI Affiliate Auto-Pilot)

- **Phase 0 — Audit Source, Không sửa code** (Current - Completed)
  - Khảo sát tech stack, cấu trúc project, screen map, API status và lập kế hoạch.
- **Phase 1 — Giữ và Khôi phục UI Figma & Capacitor Android**
  - Đảm bảo 15 màn hình Figma render chính xác, test build web và sync Android.
- **Phase 2 — Tạo Backend và Cấu hình Môi trường**
  - Thiết lập `.env.example`, API client, health check endpoint.
- **Phase 3 — Firebase Auth, Database & Storage**
  - Cấu hình Firebase Authentication, Firestore data models, Security Rules.
- **Phase 4 — Gemini Thật và Luồng Nội dung MVP**
  - Tích hợp `@google/genai` ở backend/service với structured output và validate schema.
- **Phase 5 — Link sản phẩm và Video Adapters**
  - Xây dựng ProductSourceAdapter, chống SSRF, upload video lên Firebase Storage.
- **Phase 6 — Voiceover, Quality Checker & Auto Video Builder**
  - Tích hợp TTS, Quality Review và Auto Video Builder (render MP4 qua FFmpeg worker).
- **Phase 7 — Token, Gói và Thanh toán**
  - Ledger Token nguyên tử, idempotency, cấu hình thanh toán Google Play Billing / MoMo.
- **Phase 8 — Capacitor / Android QA và Release**
  - Kiểm thử thiết bị thật/emulator, release signing và checklist phát hành.
