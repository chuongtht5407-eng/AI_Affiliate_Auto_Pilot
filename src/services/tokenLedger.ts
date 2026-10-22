export interface TokenLedgerEntry {
  idempotencyKey: string;
  operation: string;
  cost: number;
  status: "reserved" | "succeeded" | "refunded" | "failed";
  timestamp: number;
}

class TokenLedgerManager {
  private ledgers: Map<string, TokenLedgerEntry> = new Map();

  public generateIdempotencyKey(operation: string): string {
    return `${operation}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  public reserveToken(idempotencyKey: string, operation: string, cost: number, currentTokens: number): { success: boolean; newTokens: number; message: string } {
    if (this.ledgers.has(idempotencyKey)) {
      const existing = this.ledgers.get(idempotencyKey)!;
      if (existing.status === "succeeded") {
        return { success: true, newTokens: currentTokens, message: "Giao dịch đã được thực hiện trước đó (Idempotent replay)." };
      }
    }

    if (currentTokens < cost) {
      return { success: false, newTokens: currentTokens, message: "Số dư Token không đủ để thực hiện thao tác này." };
    }

    const newTokens = currentTokens - cost;
    this.ledgers.set(idempotencyKey, {
      idempotencyKey,
      operation,
      cost,
      status: "reserved",
      timestamp: Date.now()
    });

    return { success: true, newTokens, message: "Đã trừ token thành công." };
  }

  public confirmSuccess(idempotencyKey: string) {
    if (this.ledgers.has(idempotencyKey)) {
      const entry = this.ledgers.get(idempotencyKey)!;
      entry.status = "succeeded";
      this.ledgers.set(idempotencyKey, entry);
    }
  }

  public refundToken(idempotencyKey: string, currentTokens: number): { newTokens: number } {
    if (this.ledgers.has(idempotencyKey)) {
      const entry = this.ledgers.get(idempotencyKey)!;
      if (entry.status === "reserved" || entry.status === "failed") {
        entry.status = "refunded";
        this.ledgers.set(idempotencyKey, entry);
        return { newTokens: currentTokens + entry.cost };
      }
    }
    return { newTokens: currentTokens };
  }
}

export const tokenLedger = new TokenLedgerManager();
