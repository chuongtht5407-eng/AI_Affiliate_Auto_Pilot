export interface ProductModel {
  productId: string;
  shopId: string;
  name: string;
  price: number | null;
  currency: string;
  images: string[];
  description: string;
  variants: string[];
  sourceUrl: string;
  fetchedAt: number;
  verificationStatus: "verified" | "partial" | "unverified";
  warnings: string[];
}

export function parseShopeeUrl(urlStr: string): ProductModel {
  const warnings: string[] = [];
  let shopId = "";
  let productId = "";
  let name = "";

  try {
    const url = new URL(urlStr);
    const pathname = url.pathname;

    const productMatch = pathname.match(/\/product\/(\d+)\/(\d+)/);
    if (productMatch) {
      shopId = productMatch[1];
      productId = productMatch[2];
    } else {
      const iMatch = pathname.match(/i\.(\d+)\.(\d+)/);
      if (iMatch) {
        shopId = iMatch[1];
        productId = iMatch[2];
      }
    }

    const seoName = url.searchParams.get("seoName");
    if (seoName) {
      try {
        name = decodeURIComponent(seoName).trim();
      } catch (e) {
        name = seoName.replace(/[-_]/g, " ").trim();
      }
    }

    if (!name && pathname) {
      const segments = pathname.split("/").filter(Boolean);
      const lastSeg = segments[segments.length - 1];
      if (lastSeg && !lastSeg.match(/^\d+$/) && !lastSeg.startsWith("i.")) {
        name = lastSeg.replace(/[-_]/g, " ").trim();
      }
    }
  } catch (e) {
    warnings.push("Không thể phân tích định dạng URL hợp lệ.");
  }

  const verificationStatus = name && productId ? "verified" : name ? "partial" : "unverified";

  if (!name) {
    warnings.push("Không tìm thấy tên sản phẩm từ URL. Vui lòng nhập tên sản phẩm thủ công.");
  }
  if (!productId) {
    warnings.push("Không tìm thấy Product ID / Item ID từ URL.");
  }

  return {
    productId: productId || "unknown",
    shopId: shopId || "unknown",
    name: name || "",
    price: null,
    currency: "VND",
    images: [],
    description: "",
    variants: [],
    sourceUrl: urlStr,
    fetchedAt: Date.now(),
    verificationStatus,
    warnings
  };
}
