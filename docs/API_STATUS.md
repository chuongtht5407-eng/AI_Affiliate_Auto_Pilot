# API Status Report (AI Affiliate Auto-Pilot)

| API / Service | Trạng thái | Ghi chú & Kế hoạch |
| :--- | :--- | :--- |
| **Gemini AI API** | `LOCALLY TESTED` | Sử dụng SDK `@google/genai` với Gemini 1.5 Flash cho phân tích sản phẩm và tạo kịch bản chuyên sâu. |
| **Firebase Authentication** | `IMPLEMENTED` | Tích hợp Auth web SDK (Email/Password & Demo Mode). |
| **Cloud Firestore & Rules** | `IMPLEMENTED` | Cấu hình client SDK và thiết lập `firestore.rules` bảo mật theo UID. |
| **Firebase Storage & Rules** | `IMPLEMENTED` | Thiết lập `storage.rules` cho private user uploads. |
| **Text-to-Speech (TTS)** | `VERIFIED` | Sử dụng Web Speech API trên thiết bị cho voiceover preview. |
| **Auto Video Builder (FFmpeg)** | `IMPLEMENTED (Preview)` | Multi-scene storyboard player & TTS sync. |
| **Payment (Google Play / MoMo)** | `MOCK` | Mô phỏng giao dịch sandbox bảo mật. |
