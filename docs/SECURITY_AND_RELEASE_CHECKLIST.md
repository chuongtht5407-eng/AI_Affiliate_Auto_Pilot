# Security & Release Checklist (AI Affiliate Auto-Pilot)

## 1. Bảo mật & Secret Management
- Không commit các tệp `.env` hoặc API keys lên Git repository.
- Sử dụng Firebase Secret Manager / Google Cloud Secret Manager cho backend secrets (Gemini API, Payment webhook secrets).
- Đảm bảo Firestore Security Rules (`firestore.rules`) và Storage Rules (`storage.rules`) được áp dụng chính xác trên Firebase Console.

## 2. Thanh toán & Token Ledger
- Mọi giao dịch trừ Token phải qua server-side transaction với `idempotencyKey`.
- Tách biệt môi trường Sandbox và Production cho thanh toán.

## 3. Checklist phát hành Android (Google Play)
- Kiểm tra App ID / Package Name (`com.aiaffiliate.autopilot`).
- Ký release APK/AAB bằng keystore bảo mật (không lưu mật khẩu keystore trên git).
- Khai báo Data Safety, Privacy Policy và Terms of Service đầy đủ trên Google Play Console.
