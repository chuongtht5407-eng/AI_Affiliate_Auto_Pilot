# Chiến Lược Phân Nhánh GitHub & Phân Chia Tệp (Git Branching & File Ownership)
## Dự án: AI Affiliate Auto-Pilot

Để 3 thành viên trong nhóm có thể code độc lập trên GitHub mà **không bị xung đột (Merge Conflict)**, dự án được chia thành các nhánh (Branches) và sở hữu các tệp (File Ownership) riêng biệt như sau:

---

## 🌿 1. Sơ đồ Nhánh Git (Git Branches)
* `main`: Nhánh sản phẩm chính (Production / Stable).
* `develop`: Nhánh tích hợp chung (Integration Branch).
* `feature/frontend-ui` (Thành viên 1).
* `feature/ai-backend` (Thành viên 2).
* `feature/database-payment` (Thành viên 3).

---

## 📂 2. Phân Chia Tệp Theo Thành Viên (File Ownership)

### 📱 Nhánh `feature/frontend-ui` (Thành viên 1: Frontend & Mobile Lead)
* **Phạm vi tệp phụ trách**:
  - [`src/App.tsx`](file:///C:/Users/thaid/OneDrive/Tài liệu/Downloads/AI%20Affiliate%20Auto-Pilot%20Demo/src/App.tsx) (Quản lý giao diện 15 màn hình, điều hướng state).
  - [`src/index.css`](file:///C:/Users/thaid/OneDrive/Tài liệu/Downloads/AI%20Affiliate%20Auto-Pilot%20Demo/src/index.css) (Giao diện CSS, Tailwind, Responsive, Safe Area).
  - Thư mục `public/` (Assets, hình ảnh, favicon).
* **Nhiệm vụ trên nhánh**: Hoàn thiện UI/UX, responsive trên mobile, kết nối các sự kiện bấm nút của người dùng gọi sang các service.

### ⚙️ Nhánh `feature/ai-backend` (Thành viên 2: AI & Backend Lead)
* **Phạm vi tệp phụ trách**:
  - [`src/services/geminiService.ts`](file:///C:/Users/thaid/OneDrive/Tài liệu/Downloads/AI%20Affiliate%20Auto-Pilot%20Demo/src/services/geminiService.ts) (Tích hợp Gemini AI 1.5 Flash SDK, Prompt Engineering).
  - [`src/services/urlResolver.ts`](file:///C:/Users/thaid/OneDrive/Tài liệu/Downloads/AI%20Affiliate%20Auto-Pilot%20Demo/src/services/urlResolver.ts) (Xử lý, kiểm tra định dạng URL chống SSRF).
  - [`src/services/productService.ts`](file:///C:/Users/thaid/OneDrive/Tài liệu/Downloads/AI%20Affiliate%20Auto-Pilot%20Demo/src/services/productService.ts) (Bóc tách Shop ID, Product ID, `seoName` từ Shopee/Lazada URL).
  - Thư mục `functions/` (Firebase Cloud Functions cho backend API proxy nếu có).
* **Nhiệm vụ trên nhánh**: Tối ưu hóa prompt AI, phát triển thuật toán bóc tách dữ liệu sản phẩm, xử lý lỗi AI.

### 💳 Nhánh `feature/database-payment` (Thành viên 3: DB, Security & Payment Lead)
* **Phạm vi tệp phụ trách**:
  - [`src/firebase.ts`](file:///C:/Users/thaid/OneDrive/Tài liệu/Downloads/AI%20Affiliate%20Auto-Pilot%20Demo/src/firebase.ts) (Cấu hình Firebase Auth & Firestore client).
  - [`src/services/tokenLedger.ts`](file:///C:/Users/thaid/OneDrive/Tài liệu/Downloads/AI%20Affiliate%20Auto-Pilot%20Demo/src/services/tokenLedger.ts) (Sổ cái Token, Idempotency, Atomic Transaction).
  - [`src/services/paymentService.ts`](file:///C:/Users/thaid/OneDrive/Tài liệu/Downloads/AI%20Affiliate%20Auto-Pilot%20Demo/src/services/paymentService.ts) (Xác thực thanh toán MoMo Sandbox / Play Billing).
  - [`src/services/videoAiService.ts`](file:///C:/Users/thaid/OneDrive/Tài liệu/Downloads/AI%20Affiliate%20Auto-Pilot%20Demo/src/services/videoAiService.ts) (Video rendering worker / storyboard service).
  - [`firestore.rules`](file:///C:/Users/thaid/OneDrive/Tài liệu/Downloads/AI%20Affiliate%20Auto-Pilot%20Demo/firestore.rules) & [`storage.rules`](file:///C:/Users/thaid/OneDrive/Tài liệu/Downloads/AI%20Affiliate%20Auto-Pilot%20Demo/storage.rules) (Quy tắc bảo mật cơ sở dữ liệu).
* **Nhiệm vụ trên nhánh**: Cấu hình cơ sở dữ liệu, viết Security Rules, quản lý Sổ cái trừ Token và tích hợp cổng thanh toán.
