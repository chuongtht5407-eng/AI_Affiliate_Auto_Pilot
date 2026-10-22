export type SourceType =
  | "product_url_supported"
  | "youtube_public_video"
  | "social_video_url_unsupported"
  | "image_upload"
  | "manual_entry"
  | "invalid_url";

export function resolveProductSource(input: string): { sourceType: SourceType; message: string; safeUrl?: string } {
  if (!input || input.trim().length === 0) {
    return { sourceType: "manual_entry", message: "Chưa nhập đường dẫn, chuyển sang nhập thủ công." };
  }

  const trimmed = input.trim();

  // Check if it's an image file or data uri
  if (trimmed.match(/\.(jpeg|jpg|png|webp|gif)$/i) || trimmed.startsWith("data:image/")) {
    return { sourceType: "image_upload", message: "Định dạng ảnh hợp lệ để Gemini Vision phân tích.", safeUrl: trimmed };
  }

  try {
    const url = new URL(trimmed);
    // Prevent SSRF / dangerous schemes
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { sourceType: "invalid_url", message: "Giao thức URL không được hỗ trợ (chỉ chấp nhận http/https)." };
    }

    const hostname = url.hostname.toLowerCase();

    // Check YouTube
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return { sourceType: "youtube_public_video", message: "Link video YouTube công cộng hợp lệ.", safeUrl: trimmed };
    }

    // Check supported e-commerce (Shopee, Lazada, TikTok Shop)
    if (hostname.includes("shopee") || hostname.includes("lazada") || hostname.includes("tiktok.com")) {
      return { sourceType: "product_url_supported", message: "Đường dẫn sản phẩm thương mại điện tử hợp lệ.", safeUrl: trimmed };
    }

    // General web URL
    return { sourceType: "product_url_supported", message: "Đường dẫn web hợp lệ để phân tích.", safeUrl: trimmed };
  } catch (e) {
    return { sourceType: "manual_entry", message: "Không phải URL hợp lệ, hệ thống sẽ sử dụng làm từ khóa tìm kiếm/nhập tay." };
  }
}
