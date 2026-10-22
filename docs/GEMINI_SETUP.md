# Gemini AI Setup Guide (AI Affiliate Auto-Pilot)

## 1. Lấy Gemini API Key
1. Truy cập [Google AI Studio](https://aistudio.google.com/api-keys).
2. Đăng nhập bằng tài khoản Google cá nhân (tránh tài khoản trường học bị giới hạn Cloud Project).
3. Nhấn **Create API key** và sao chép khóa (bắt đầu bằng `AIzaSy...`).

## 2. Tích hợp vào Dự án
Thêm vào tệp `.env`:
```env
VITE_GEMINI_API_KEY=AIzaSy...
```

## 3. Mô hình sử dụng
Ứng dụng sử dụng mô hình **`gemini-1.5-flash`** thông qua SDK chính thức `@google/genai` để thực hiện:
- Phân tích liên kết sản phẩm (Product Link Analyzer).
- Sinh kịch bản video ngắn đa nền tảng (AI Script Generator).
