# AI Video Builder Guide (AI Affiliate Auto-Pilot)

## 1. Tổng quan
- Ứng dụng tích hợp **Multi-Scene Storyboard Video Player** hỗ trợ người dùng xem trước video quảng cáo phân chia theo 3 cảnh chính: Hook (Cảnh 1), USP (Cảnh 2), và CTA (Cảnh 3).
- Đồng bộ hóa thời gian thực với **Web Speech API (TTS)** để phát thuyết minh AI khớp với nội dung kịch bản.

## 2. Kết xuất MP4 Production
- Trong môi trường Production, worker phía backend (Cloud Run / Node.js worker) sử dụng **FFmpeg** kết hợp TTS provider (Google Cloud TTS) để render file video MP4 chính thức, ghép phụ đề (burn-in subtitles) và nhạc nền có bản quyền.
