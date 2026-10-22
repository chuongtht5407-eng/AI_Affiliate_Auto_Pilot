# Screen Map (AI Affiliate Auto-Pilot)

Danh sách các màn hình hiện có trong `src/App.tsx`:

| Screen Key | Tên hiển thị | Component / Render Logic | Trạng thái hiện tại |
| :--- | :--- | :--- | :--- |
| `splash` | Màn hình khởi động | Splash screen với logo & loader | IMPLEMENTED (Mock timer) |
| `onboarding` | Giới thiệu ứng dụng | Onboarding art & CTA | IMPLEMENTED |
| `login` | Đăng nhập | Auth form (Email, Password) | IMPLEMENTED (Mock login) |
| `register` | Đăng ký | Auth form (Name, Email, Password) | IMPLEMENTED (Mock register) |
| `home` | Trang chủ | Greeting, Hero card, Stats, Tools, Recent | IMPLEMENTED (Local state) |
| `analyzer` | Phân tích sản phẩm | Link input, platform tags | IMPLEMENTED (Simulated AI analysis) |
| `analysis` | Kết quả phân tích | Product card, score card, highlights | IMPLEMENTED (Mock data) |
| `generator` | Tạo kịch bản AI | Platform, Tone, Length selection | IMPLEMENTED (Dynamic script gen) |
| `result` | Kết quả kịch bản | Script card, caption, hashtags, voice button | IMPLEMENTED (Clipboard copy) |
| `voice` | Giọng đọc AI | Wave animation, speech player | IMPLEMENTED (Web Speech API) |
| `history` | Lịch sử nội dung | Search input, platform filter list | IMPLEMENTED (Local state / delete) |
| `wallet` | Ví Token | Token balance, Top-up packages | IMPLEMENTED (Local state) |
| `plans` | Nâng cấp VIP | VIP Creator subscription card | IMPLEMENTED |
| `payment` | Thanh toán mô phỏng | Payment summary, MoMo Sandbox mock | IMPLEMENTED (Tokens reward on paid) |
| `profile` | Cá nhân & Cài đặt | User profile, settings toggles, showcase link | IMPLEMENTED |
| `showcase` (URL) | Tổng hợp 15 màn hình | `Showcase` component rendering 15 iframes | IMPLEMENTED |
