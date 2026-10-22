import { GoogleGenAI } from '@google/genai';
import { ProductModel } from './productService';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = apiKey && apiKey !== "replace_me" ? new GoogleGenAI({ apiKey }) : null;

export interface GeminiAnalysisResult {
  productSummary: string;
  verifiedFeatures: string[];
  unknownFacts: string[];
  marketingAngles: Array<{ id: string; title: string; targetAudience: string; coreMessage: string; hookIdea: string }>;
  warnings: string[];
}

export async function analyzeProductWithGemini(product: ProductModel): Promise<GeminiAnalysisResult> {
  if (!ai || !product.name) {
    return {
      productSummary: product.name ? `Sản phẩm ${product.name} (Shop ID: ${product.shopId}, Product ID: ${product.productId})` : "Sản phẩm chưa xác thực tên từ nguồn.",
      verifiedFeatures: product.name ? [`Tên sản phẩm: ${product.name}`, `Mã sản phẩm: ${product.productId}`] : [],
      unknownFacts: ["Giá chính xác tại thời điểm hiện tại chưa được xác thực qua API chính thức", "Tồn kho và phân loại chi tiết chưa có sẵn"],
      marketingAngles: [
        { id: "angle-1", title: "Review chân thực & Trải nghiệm", targetAudience: "Khách hàng quan tâm chất lượng thực tế", coreMessage: "Đánh giá chi tiết từ góc nhìn người dùng", hookIdea: "Sự thật về sản phẩm này là gì?" }
      ],
      warnings: product.warnings.length > 0 ? product.warnings : ["Dữ liệu lấy từ metadata URL công khai, cần kiểm tra lại giá và tồn kho thực tế."]
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Phân tích sản phẩm affiliate sau dựa trên dữ liệu đã xác thực:
Tên sản phẩm: ${product.name}
Shop ID: ${product.shopId}
Product ID: ${product.productId}
Nguồn URL: ${product.sourceUrl}

Hãy đóng vai chuyên gia E-commerce, trả về kết quả định dạng JSON gồm các keys:
- productSummary (string: tóm tắt khách quan)
- verifiedFeatures (array of strings: đặc điểm đã xác thực từ tên/metadata)
- unknownFacts (array of strings: những thông tin chưa rõ như giá chính xác, tồn kho)
- marketingAngles (array of objects: gồm id, title, targetAudience, coreMessage, hookIdea)
- warnings (array of strings: cảnh báo về giới hạn dữ liệu nguồn)`,
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        productSummary: data.productSummary || product.name,
        verifiedFeatures: data.verifiedFeatures || [product.name],
        unknownFacts: data.unknownFacts || ["Giá và tồn kho cần xác thực trực tiếp tại gian hàng"],
        marketingAngles: data.marketingAngles || [
          { id: "1", title: "Review trải nghiệm", targetAudience: "Người mua hàng online", coreMessage: product.name, hookIdea: "Có nên mua sản phẩm này không?" }
        ],
        warnings: data.warnings || product.warnings
      };
    }
    throw new Error("Invalid JSON from Gemini");
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return {
      productSummary: product.name,
      verifiedFeatures: [product.name],
      unknownFacts: ["Không thể kết nối API Gemini để phân tích sâu hơn"],
      marketingAngles: [
        { id: "1", title: "Review cơ bản", targetAudience: "Khách hàng mua sắm", coreMessage: product.name, hookIdea: "Khám phá nhanh sản phẩm" }
      ],
      warnings: [...product.warnings, "Lỗi kết nối AI phân tích."]
    };
  }
}

export async function generateScriptWithGemini(productName: string, platform: string, tone: string, length: string): Promise<string> {
  if (!ai) {
    return `🎯 CHIẾN DỊCH SẢN PHẨM: ${productName}
[CẢNH 1 - HOOK]:
"Bạn đang tìm kiếm ${productName}? Hãy xem ngay đánh giá chi tiết này."

[CẢNH 2 - THÂN BÀI (${tone})]:
Sản phẩm ${productName} mang lại trải nghiệm tiện lợi và đáp ứng nhu cầu sử dụng hàng ngày.

[CẢNH 3 - CTA]:
"Xem chi tiết và đặt hàng tại giỏ hàng ${platform} chính hãng."`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Viết kịch bản video ngắn bán hàng trung thực cho sản phẩm "${productName}" trên ${platform}. Phong cách: ${tone}, Thời lượng: ${length}. Không đưa ra các con số doanh số hoặc cam kết lợi nhuận không có căn cứ. Chia thành 3 cảnh rõ ràng (Hook, Thân bài, CTA).`,
    });
    return response.text || "Kịch bản trống.";
  } catch (error) {
    return `🎯 CHIẾN DỊCH: ${productName}\n[HOOK]: Khám phá ${productName}.\n[CTA]: Mua hàng tại ${platform}.`;
  }
}
