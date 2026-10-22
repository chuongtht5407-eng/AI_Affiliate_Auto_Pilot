export interface PurchaseVerificationRequest {
  provider: "google_play" | "momo" | "stripe";
  purchaseToken: string;
  productId: string;
  userId: string;
  orderId: string;
}

export async function verifyPurchaseOnBackend(req: PurchaseVerificationRequest): Promise<{ verified: boolean; tokensAwarded: number; message: string }> {
  // Simulate secure server-side receipt verification against Google Play Developer API or MoMo/Stripe webhook signature
  await new Promise(r => setTimeout(r, 1000));

  if (!req.purchaseToken || !req.orderId) {
    return { verified: false, tokensAwarded: 0, message: "Biên lai giao dịch không hợp lệ." };
  }

  let tokens = 20;
  if (req.productId.includes("VIP") || req.productId.includes("100")) tokens = 100;
  else if (req.productId.includes("120")) tokens = 120;
  else if (req.productId.includes("50")) tokens = 50;

  return {
    verified: true,
    tokensAwarded: tokens,
    message: `Xác thực giao dịch thành công qua ${req.provider.toUpperCase()}! Đã cộng ${tokens} Tokens.`
  };
}
