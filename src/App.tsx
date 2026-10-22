import { useEffect, useState } from "react";
import { auth, db, isDemoMode, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "./firebase";
import { analyzeProductWithGemini, generateScriptWithGemini, GeminiAnalysisResult } from "./services/geminiService";
import { resolveProductSource } from "./services/urlResolver";
import { parseShopeeUrl, ProductModel } from "./services/productService";
import { tokenLedger } from "./services/tokenLedger";
import { verifyPurchaseOnBackend } from "./services/paymentService";

type Screen =
  | "splash" | "onboarding" | "login" | "register" | "home"
  | "analyzer" | "analysis" | "generator" | "result" | "voice" | "video-preview"
  | "history" | "wallet" | "plans" | "payment" | "profile";

type ScriptItem = { id: number | string; title: string; body: string; created: string; platform: string };

const sampleScript = `🎯 CHIẾN DỊCH: MÁY XAY SINH TỐ MINI CẦM TAY
[CẢNH 1 - HOOK 3S ĐẦU]:
"Đừng mua bất kỳ máy xay mini nào nếu bạn chưa xem hết video này! Mình đã test qua 5 loại và đây là chân ái."

[CẢNH 2 - THÂN BÀI USP (Năng động)]:
Điểm ăn tiền nhất của Máy xay sinh tố mini cầm tay chính là công nghệ tối tân, giải quyết triệt để mọi vấn đề khó chịu nhất mà bạn gặp phải hàng ngày. Chất liệu hoàn thiện cao cấp, cầm chắc tay, dùng cực kỳ mượt mà. Đáng từng xu tiền đầu tư!

[CẢNH 3 - CALL-TO-ACTION CHỐT ĐƠN]:
"Hàng chính hãng đang sale cực sốc kèm mã freeship độc quyền hôm nay trên TikTok. Nhanh tay bấm ngay vào giỏ hàng góc trái video để sở hữu trước khi hết hàng nhé!"`;

const initialScripts: ScriptItem[] = [
  { id: 1, title: "Máy xay sinh tố mini", body: sampleScript, created: "Hôm nay, 09:42", platform: "TikTok" },
];

const icons: Record<string, string> = {
  home: "M3 11.5 12 4l9 7.5V21a1 1 0 0 1-1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z",
  spark: "m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Zm6 11 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z",
  history: "M4 12a8 8 0 1 0 2.3-5.7L4 8.5M4 4v4.5h4.5M12 8v4l3 2",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 9a7 7 0 0 0-14 0",
  wallet: "M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12M16 13h5",
  arrow: "m9 18 6-6-6-6",
  copy: "M8 8h11v11H8zM5 16H4V5h11v1",
  trash: "M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6",
  play: "m9 6 9 6-9 6V6Z",
  search: "m21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  link: "M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1",
  check: "m5 12 4 4L19 6",
  back: "m15 18-6-6 6-6",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
  loading: "M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83",
};

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={icons[name] || icons.spark} /></svg>;
}

function Header({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return <div className="header">
    {onBack ? <button type="button" className="icon-btn" onClick={onBack}><Icon name="back" /></button> : <div className="brand-small"><span>AP</span></div>}
    <div className="header-title">{title}</div>
    <div className="header-right">{right}</div>
  </div>;
}

function BottomNav({ active, go }: { active: Screen; go: (s: Screen) => void }) {
  const items: [Screen, string, string][] = [["home", "home", "Trang chủ"], ["generator", "spark", "Sáng tạo"], ["history", "history", "Lịch sử"], ["profile", "user", "Cá nhân"]];
  return <div className="bottom-nav">{items.map(([s, icon, label]) =>
    <button type="button" key={s} className={active === s ? "nav-item active" : "nav-item"} onClick={() => go(s)}><Icon name={icon} /><span>{label}</span></button>
  )}</div>;
}

function AppShell({ screen, go, children, noNav = false }: { screen: Screen; go: (s: Screen) => void; children: React.ReactNode; noNav?: boolean }) {
  return <main className="phone"><div className={noNav ? "content no-nav" : "content"}>{children}</div>{!noNav && <BottomNav active={screen} go={go} />}</main>;
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <label className="field"><span>{label}</span><input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></label>;
}

function getSpokenText(body: string): string {
  if (!body) return "";
  const lines = body.split("\n");
  const spokenLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      !trimmed ||
      trimmed.includes("CHIẾN DỊCH") ||
      trimmed.includes("NỀN TẢNG:") ||
      trimmed.includes("THỜI LƯỢNG:") ||
      trimmed.includes("PHONG CÁCH:") ||
      trimmed.startsWith("#") ||
      trimmed.includes("CẢNH 1") ||
      trimmed.includes("CẢNH 2") ||
      trimmed.includes("CẢNH 3") ||
      trimmed.includes("HOOK") ||
      trimmed.includes("THÂN BÀI") ||
      trimmed.includes("CALL-TO-ACTION")
    ) {
      continue;
    }
    const cleaned = trimmed.replace(/\[.*?\]/g, "").replace(/^-\s*/, "").replace(/^[""]|[""]$/g, "").trim();
    if (cleaned.length > 2) {
      spokenLines.push(cleaned);
    }
  }
  return spokenLines.join(" ");
}

function Auth({ register, go, login, notify }: { register?: boolean; go: (s: Screen) => void; login: (name: string) => void; notify: (msg: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !pass) {
      notify("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }
    setLoading(true);
    try {
      if (!isDemoMode && auth) {
        if (register) {
          await createUserWithEmailAndPassword(auth, email, pass);
          notify("Tạo tài khoản Firebase thành công!");
        } else {
          await signInWithEmailAndPassword(auth, email, pass);
          notify("Đăng nhập Firebase thành công!");
        }
      }
      login(name || email.split("@")[0] || "Minh Anh");
    } catch (err: any) {
      notify(`Lỗi xác thực: ${err.message || "Kiểm tra lại thông tin"}`);
    } finally {
      setLoading(false);
    }
  };

  return <AppShell screen={register ? "register" : "login"} go={go} noNav>
    <div className="auth">
      <button type="button" className="back-float" onClick={() => go("onboarding")}><Icon name="back" /></button>
      <div className="logo"><Icon name="spark" size={32} /></div>
      <div className="eyebrow">AI AFFILIATE AUTO-PILOT {isDemoMode ? "(Demo Mode)" : "(Firebase Live)"}</div>
      <h1>{register ? "Tạo tài khoản" : "Chào mừng trở lại"}</h1>
      <p className="muted">{register ? "Bắt đầu hành trình affiliate thông minh" : "Tiếp tục biến ý tưởng thành doanh thu"}</p>
      <div className="form">
        {register && <Field label="Họ và tên" value={name} onChange={setName} placeholder="Nguyễn Minh Anh" />}
        <Field label="Email" value={email} onChange={setEmail} placeholder="ban@email.com" type="email" />
        <Field label="Mật khẩu" value={pass} onChange={setPass} placeholder="Tối thiểu 6 ký tự" type="password" />
      </div>
      <button type="button" className="primary" disabled={loading} onClick={handleSubmit}>{loading ? "Đang xử lý..." : (register ? "Đăng ký miễn phí" : "Đăng nhập")}</button>
      <button type="button" className="demo" onClick={() => login("Minh Anh (Demo)")}>Dùng tài khoản demo</button>
      <button type="button" className="showcase-button login-showcase" onClick={() => { window.location.href = `${window.location.pathname}?showcase=1`; }}><Icon name="spark" /> Xem tất cả 15 màn hình UI</button>
      <p className="switch">{register ? "Đã có tài khoản?" : "Chưa có tài khoản?"} <button type="button" onClick={() => go(register ? "login" : "register")}>{register ? "Đăng nhập" : "Đăng ký ngay"}</button></p>
    </div>
  </AppShell>;
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const requestedScreen = params.get("screen") as Screen | null;
  const isShowcase = params.get("showcase") === "1";
  const isEmbed = params.get("embed") === "1";
  const [screen, setScreen] = useState<Screen>(requestedScreen || "splash");
  const [tokens, setTokens] = useState(() => Number(localStorage.getItem("tokens") || 10));
  const [name, setName] = useState(() => localStorage.getItem("name") || "Minh Anh");
  const [scripts, setScripts] = useState<ScriptItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("scripts") || "null") || initialScripts; } catch { return initialScripts; }
  });
  const [link, setLink] = useState("");
  const [productTitle, setProductTitle] = useState("Máy xay sinh tố mini cầm tay");
  const [product, setProduct] = useState<ProductModel | null>(null);
  const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisResult | null>(null);
  const [tone, setTone] = useState("Năng động");
  const [length, setLength] = useState("30 giây");
  const [platform, setPlatform] = useState("TikTok");
  const [search, setSearch] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("Tất cả");
  const [toast, setToast] = useState("");
  const [payFor, setPayFor] = useState("Gói 50 Tokens");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeScript, setActiveScript] = useState<ScriptItem>(initialScripts[0]);

  useEffect(() => {
    localStorage.setItem("tokens", String(tokens));
    localStorage.setItem("name", name);
  }, [tokens, name]);

  useEffect(() => { localStorage.setItem("scripts", JSON.stringify(scripts)); }, [scripts]);
  useEffect(() => { if (screen === "splash" && !isEmbed && !isShowcase) { const t = setTimeout(() => setScreen("onboarding"), 1500); return () => clearTimeout(t); } }, [screen, isEmbed, isShowcase]);

  const notify = (text: string) => { setToast(text); setTimeout(() => setToast(""), 2000); };
  const go = (s: Screen) => setScreen(s);
  const login = (n: string) => { setName(n); go("home"); };
  const logout = async () => {
    try {
      if (!isDemoMode && auth) await signOut(auth);
    } catch (e) {}
    setName("Minh Anh");
    go("login");
    notify("Đã đăng xuất");
  };

  const handleAnalyze = async () => {
    if (!link) return;
    const sourceCheck = resolveProductSource(link);
    if (sourceCheck.sourceType === "invalid_url") {
      notify(sourceCheck.message);
      return;
    }
    setIsAnalyzing(true);
    try {
      const parsedProduct = parseShopeeUrl(link);
      setProduct(parsedProduct);
      if (parsedProduct.name) {
        setProductTitle(parsedProduct.name);
      }

      const analysis = await analyzeProductWithGemini(parsedProduct);
      setAnalysisResult(analysis);

      go("analysis");
      notify("Phân tích sản phẩm thành công!");
    } catch (err: any) {
      console.error("Analysis error:", err);
      notify(`Lỗi phân tích: ${err.message || "Không thể kết nối API"}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    const productName = product?.name || productTitle || "Sản phẩm Affiliate";
    const idempotencyKey = tokenLedger.generateIdempotencyKey("generate_script");
    const reservation = tokenLedger.reserveToken(idempotencyKey, "generate_script", 1, tokens);
    if (!reservation.success) {
      notify(reservation.message);
      go("wallet");
      return;
    }
    setTokens(reservation.newTokens);
    setIsGenerating(true);
    try {
      const generatedBody = await generateScriptWithGemini(productName, platform, tone, length);
      tokenLedger.confirmSuccess(idempotencyKey);

      const newItem: ScriptItem = {
        id: Date.now(),
        title: productName,
        body: generatedBody,
        created: "Vừa xong",
        platform: platform,
      };

      setScripts((s) => [newItem, ...s]);
      setActiveScript(newItem);
      go("result");
      notify("Gemini AI Pro đã tạo kịch bản chuyên sâu thành công (-1 Token)");
    } catch (err) {
      const refunded = tokenLedger.refundToken(idempotencyKey, tokens);
      setTokens(refunded.newTokens);
      notify("Lỗi tạo kịch bản từ Gemini AI. Đã hoàn lại Token.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copy = (text: string) => { navigator.clipboard?.writeText(text); notify("Đã sao chép vào bộ nhớ tạm!"); };

  if (isShowcase) return <Showcase />;

  if (screen === "splash") return <main className="phone splash">
    <div className="splash-glow" /><div className="logo large"><Icon name="spark" size={44} /></div>
    <h1>AI Affiliate<br /><span>Auto-Pilot</span></h1><p>Biến sản phẩm thành nội dung bán hàng<br />chỉ trong vài giây.</p><div className="loader"><i /></div>
  </main>;

  if (screen === "onboarding") return <AppShell screen={screen} go={go} noNav>
    <div className="onboard-art">
      <div className="orbit one" /><div className="orbit two" />
      <div className="ai-core"><Icon name="spark" size={50} /></div>
      <div className="floating-card fc1"><Icon name="link" /><span>Phân tích link</span></div>
      <div className="floating-card fc2"><Icon name="spark" /><span>AI viết nội dung</span></div>
    </div>
    <div className="onboard-copy"><div className="dots"><i className="active" /><i /><i /></div><h1>Bán hàng thông minh<br />cùng trợ lý AI</h1><p>Dán link sản phẩm, nhận ngay kịch bản hấp dẫn và bắt đầu tạo chuyển đổi.</p>
      <button type="button" className="primary" onClick={() => go("register")}>Bắt đầu miễn phí <Icon name="arrow" /></button>
      <button type="button" className="text-btn" onClick={() => go("login")}>Tôi đã có tài khoản</button>
    </div>
  </AppShell>;

  if (screen === "login" || screen === "register") return <Auth register={screen === "register"} go={go} login={login} notify={notify} />;

  const headers: Partial<Record<Screen, string>> = { analyzer: "Phân tích sản phẩm", analysis: "Kết quả phân tích", generator: "Tạo kịch bản AI", result: "Kịch bản của bạn", voice: "Giọng đọc AI", "video-preview": "Video AI Quảng Cáo", history: "Lịch sử nội dung", wallet: "Ví Token", plans: "Nâng cấp VIP", payment: "Thanh toán mô phỏng", profile: "Cá nhân & Cài đặt" };

  let body: React.ReactNode;
  if (screen === "home") body = <>
    <div className="home-head"><div><span className="muted">Xin chào,</span><h2>{name}</h2></div><button type="button" className="icon-btn" onClick={() => notify("Không có thông báo mới")}><Icon name="bell" /></button></div>
    <section className="hero-card"><div className="pill"><Icon name="spark" size={14} /> AI AFFILIATE STUDIO</div><h1>Từ link sản phẩm<br />đến nội dung <span>bán hàng.</span></h1><p>Gemini AI Pro lo phần khó, bạn tập trung vào sáng tạo.</p><button type="button" onClick={() => go("analyzer")}>Phân tích sản phẩm <Icon name="arrow" /></button><div className="hero-orb" /></section>
    <div className="stats"><button type="button" onClick={() => go("wallet")}><div className="stat-icon purple"><Icon name="wallet" /></div><div><b>{tokens}</b><span>Token còn lại</span></div></button><button type="button" onClick={() => go("history")}><div className="stat-icon blue"><Icon name="history" /></div><div><b>{scripts.length}</b><span>Nội dung đã tạo</span></div></button></div>
    <div className="section-title"><h3>Công cụ AI</h3><span>Chọn để bắt đầu</span></div>
    <div className="tools"><button type="button" onClick={() => go("analyzer")}><div className="tool-icon"><Icon name="link" /></div><b>Phân tích Link</b><span>Hiểu sản phẩm tức thì</span><Icon name="arrow" /></button><button type="button" onClick={() => go("generator")}><div className="tool-icon pink"><Icon name="spark" /></div><b>Tạo Kịch bản</b><span>Nội dung thu hút</span><Icon name="arrow" /></button></div>
    <div className="recent"><div className="section-title"><h3>Gần đây</h3><button type="button" onClick={() => go("history")}>Xem tất cả</button></div>{scripts.slice(0, 2).map(s => <button type="button" className="recent-row" key={s.id} onClick={() => { setActiveScript(s); go("result"); }}><div className="thumb">{s.platform.slice(0,1)}</div><div><b>{s.title}</b><span>{s.created} · {s.platform}</span></div><Icon name="arrow" /></button>)}</div>
  </>;
  else if (screen === "analyzer") body = <><Header title={headers[screen]!} onBack={() => go("home")} /><div className="page intro"><div className="page-icon"><Icon name="link" size={30} /></div><h1>Khám phá tiềm năng<br />của sản phẩm</h1><p>Dán link Shopee, Lazada, TikTok Shop bất kỳ. Hệ thống sẽ bóc tách Shop ID, Product ID và tên từ URL.</p><label className="big-input"><span>LINK SẢN PHẨM</span><div><Icon name="link" /><input value={link} onChange={e => setLink(e.target.value)} placeholder="https://shopee.vn/product/..." /></div></label><div className="platforms"><span>Shopee</span><span>TikTok Shop</span><span>Lazada</span></div><button type="button" className="primary" disabled={!link || isAnalyzing} onClick={handleAnalyze}>{isAnalyzing ? <span style={{display: 'flex', alignItems: 'center', gap: 8}}><svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={icons.loading}/></svg> Đang bóc tách URL & Phân tích...</span> : <><Icon name="spark" /> Phân tích sản phẩm</>}</button><div className="privacy">Dữ liệu bóc tách minh bạch từ URL nguồn.</div></div></>;
  else if (screen === "analysis") body = <><Header title={headers[screen]!} onBack={() => go("analyzer")} /><div className="page"><div className="product-card"><div className="product-img">{(product?.name || productTitle || "SP").slice(0, 2).toUpperCase()}</div><div><span className={`badge ${product?.verificationStatus === "verified" ? "success" : "warning"}`}>{product?.verificationStatus === "verified" ? "Đã xác thực tên sản phẩm" : "Cần xác thực thêm"}</span><h3>{product?.name || productTitle}</h3><p>Shop ID: {product?.shopId || "38038824"} · Product ID: {product?.productId || "578903659"}</p><b>{product?.price ? `${product.price}đ` : "Giá chưa xác thực (cần kiểm tra tại gian hàng)"}</b></div></div><div className="score-card" style={{background: "linear-gradient(135deg, #3b3378, #4f46e5)"}}><div><h3>Tóm tắt phân tích AI</h3><p>{analysisResult?.productSummary || "Đang phân tích..."}</p></div></div><Info title="Đặc điểm đã xác thực" items={analysisResult?.verifiedFeatures || [product?.name || productTitle]} /><Info title="Thông tin chưa xác thực (Cần lưu ý)" items={analysisResult?.unknownFacts || ["Giá chính xác và tồn kho"]} /><Info title="Cảnh báo dữ liệu nguồn" items={analysisResult?.warnings || product?.warnings || []} /><button type="button" className="primary sticky-action" onClick={() => go("generator")}><Icon name="spark" /> Tạo kịch bản chuyên sâu ngay</button></div></>;
  else if (screen === "generator") body = <><Header title={headers[screen]!} onBack={() => go("home")} right={<button type="button" className="token-mini" onClick={() => go("wallet")}><Icon name="wallet" size={16} /> {tokens}</button>} /><div className="page"><div className="generator-top"><Icon name="spark" size={34} /><h1>Tạo nội dung<br />chạm đúng khách hàng</h1><p>Hệ thống AI Affiliate Master sẽ viết kịch bản riêng cho {product?.name || productTitle}.</p></div><Field label="Tên sản phẩm" value={product?.name || productTitle} onChange={(val) => { setProductTitle(val); if (product) setProduct({...product, name: val}); }} /><div className="option"><span>Nền tảng</span><div className="choice-row">{["TikTok", "Shopee", "Facebook"].map(x => <button type="button" className={platform === x ? "selected" : ""} onClick={() => setPlatform(x)} key={x}>{x}</button>)}</div></div><div className="option"><span>Giọng điệu</span><div className="choice-row">{["Năng động", "Chân thực", "Chuyên gia"].map(x => <button type="button" className={tone === x ? "selected" : ""} onClick={() => setTone(x)} key={x}>{x}</button>)}</div></div><div className="option"><span>Độ dài</span><div className="choice-row">{["15 giây", "30 giây", "60 giây"].map(x => <button type="button" className={length === x ? "selected" : ""} onClick={() => setLength(x)} key={x}>{x}</button>)}</div></div><button type="button" className="primary generate" disabled={isGenerating} onClick={handleGenerate}>{isGenerating ? <span style={{display: 'flex', alignItems: 'center', gap: 8}}>Gemini AI Pro đang viết...</span> : <><Icon name="spark" /> Tạo kịch bản chuyên sâu · 1 Token</>}</button></div></>;
  else if (screen === "result") body = <><Header title={headers[screen]!} onBack={() => go("generator")} right={<button type="button" className="icon-btn" onClick={() => copy(activeScript?.body || "")}><Icon name="copy" /></button>} /><div className="page"><div className="success-banner"><Icon name="check" /><div><b>Kịch bản chuyên sâu đã sẵn sàng!</b><span>Tối ưu riêng cho {activeScript?.title || ""} ({activeScript?.platform || ""})</span></div></div><div className="script-card"><div className="script-label">KỊCH BẢN CHI TIẾT - {activeScript?.title || ""}</div><p>{activeScript?.body || ""}</p><button type="button" className="copy-btn" onClick={() => copy(activeScript?.body || "")}><Icon name="copy" /> Sao chép kịch bản</button></div><div className="caption-card"><b>Caption gợi ý</b><p>Sản phẩm {activeScript?.title || ""} đang làm mưa làm gió! Nhanh tay săn deal số lượng có hạn tại giỏ hàng.</p><button type="button" onClick={() => copy(`Sản phẩm ${activeScript?.title || ""} đang làm mưa làm gió! Nhanh tay săn deal số lượng có hạn tại giỏ hàng.`)}><Icon name="copy" size={18} /></button></div><div className="hashtags">#{((activeScript?.title || "sanpham").toLowerCase().replace(/[^a-z0-9]/g, ''))} #reviewhot #affiliatemarketing #tiktokshop</div><button type="button" className="primary" onClick={() => go("video-preview")}><Icon name="spark" /> Tạo Video AI Quảng Cáo Chuẩn Kịch Bản · 2 Tokens</button><button type="button" className="secondary" onClick={() => go("voice")}><Icon name="play" /> Nghe thử giọng đọc AI</button><button type="button" className="secondary" onClick={handleGenerate}>Tạo phiên bản khác · 1 Token</button></div></>;
  else if (screen === "voice") body = <Voice go={go} text={getSpokenText(activeScript?.body || "")} />;
  else if (screen === "video-preview") body = <VideoPreview go={go} script={activeScript || initialScripts[0]} />;
  else if (screen === "history") {
    const filteredScripts = scripts.filter(s => {
      const matchSearch = (s?.title || "").toLowerCase().includes(search.toLowerCase()) || (s?.body || "").toLowerCase().includes(search.toLowerCase());
      const matchFilter = filterPlatform === "Tất cả" || (s?.platform || "").toLowerCase() === filterPlatform.toLowerCase();
      return matchSearch && matchFilter;
    });
    body = <><Header title={headers[screen]!} /><div className="page"><div className="search"><Icon name="search" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên sản phẩm..." /></div><div className="filter-row">{["Tất cả", "TikTok", "Shopee", "Facebook"].map(f => <button type="button" key={f} className={filterPlatform === f ? "active" : ""} onClick={() => setFilterPlatform(f)}>{f}</button>)}</div><div className="history-list">{filteredScripts.length === 0 ? <p className="center muted" style={{padding: '30px 0'}}>Không tìm thấy kịch bản phù hợp.</p> : filteredScripts.map(s => <div className="history-card" key={s.id}><div className="history-meta"><span>{s.platform}</span><small>{s.created}</small></div><h3 onClick={() => { setActiveScript(s); go("result"); }} style={{cursor: 'pointer'}}>{s.title}</h3><p>{s.body}</p><div><button type="button" onClick={() => copy(s.body)}><Icon name="copy" size={18} /> Sao chép</button><button type="button" className="danger" onClick={() => setScripts(x => x.filter(i => i.id !== s.id))}><Icon name="trash" size={18} /></button></div></div>)}</div></div></>;
  }
  else if (screen === "wallet") body = <><Header title={headers[screen]!} onBack={() => go("profile")} /><div className="page"><div className="wallet-card"><span>SỐ DƯ KHẢ DỤNG</span><strong>{tokens}</strong><b>Tokens</b><div>1 Token = 1 lần tạo kịch bản AI</div></div><h3 className="block-title">Nạp thêm Token</h3><div className="packages">{[["20 Tokens","29.000đ"],["50 Tokens","59.000đ"],["120 Tokens","119.000đ"]].map((p,i)=><button type="button" className={i===1?"popular":""} key={p[0]} onClick={() => { setPayFor(`Gói ${p[0]}`); go("payment"); }}>{i===1&&<em>PHỔ BIẾN</em>}<b>{p[0]}</b><span>{p[1]}</span></button>)}</div><div className="notice"><b>Cổng thanh toán MoMo Sandbox / Stripe</b><p>Hỗ trợ quét mã QR giả lập, thanh toán an toàn tức thì.</p></div></div></>;
  else if (screen === "plans") body = <><Header title={headers[screen]!} onBack={() => go("profile")} /><div className="page"><div className="vip-head"><span>AI AFFILIATE VIP</span><h1>Nâng cấp sức mạnh<br />sáng tạo của bạn</h1><p>Nhiều nội dung hơn, không giới hạn tiềm năng.</p></div><div className="plan-card"><div className="plan-title"><div><span>GÓI THÁNG</span><h2>VIP Creator</h2></div><b>149K<small>/tháng</small></b></div><ul><li>100 Tokens mỗi tháng</li><li>Giọng đọc AI cao cấp</li><li>Lưu lịch sử không giới hạn</li><li>Ưu tiên tính năng mới</li></ul><button type="button" className="primary" onClick={() => { setPayFor("VIP Creator"); go("payment"); }}>Chọn gói VIP</button></div><p className="center muted">Hủy bất cứ lúc nào · Thanh toán bảo mật</p></div></>;
  else if (screen === "payment") body = <Payment title={payFor} go={go} onPaid={(awardedTokens) => {
    setTokens(t => t + awardedTokens);
    notify(`Thanh toán thành công! +${awardedTokens} Tokens`);
    go("wallet");
  }} />;
  else body = <><Header title={headers.profile!} /><div className="page profile"><div className="avatar">{name.slice(0,1)}</div><h2>{name}</h2><p>{name.toLowerCase().replace(/\s+/g,".")}@demo.vn</p><div className="vip-strip"><div><Icon name="spark" /><span><b>Nâng cấp VIP</b><small>Mở khóa toàn bộ sức mạnh AI</small></span></div><button type="button" onClick={() => go("plans")}>Xem gói</button></div><div className="menu"><button type="button" onClick={() => go("wallet")}><span><Icon name="wallet" /> Ví Token</span><b>{tokens} Tokens</b><Icon name="arrow" /></button><button type="button" onClick={() => notify("Cài đặt tài khoản đồng bộ")}><span className="flex items-center gap-2"><Icon name="settings" /> Cài đặt ứng dụng</span><Icon name="arrow" /></button><button type="button" onClick={() => notify("Đã bật thông báo đẩy")}><span className="flex items-center gap-2"><Icon name="bell" /> Thông báo</span><em className="toggle on" /></button><button type="button" onClick={() => notify("AI Affiliate Auto-Pilot v1.0.0 · Gemini AI & Firebase")}><span><Icon name="spark" /> Về ứng dụng</span><Icon name="arrow" /></button></div><button type="button" className="showcase-button" onClick={() => { window.location.href = `${window.location.pathname}?showcase=1`; }}><Icon name="spark" /> Xem tất cả 15 màn hình UI</button><button type="button" className="logout" onClick={logout}>Đăng xuất</button><small className="version">AI Affiliate Auto-Pilot · v1.0.0 Production Ready</small></div></>;

  return <AppShell screen={screen} go={go}>{body}{toast && <div className="toast"><Icon name="check" />{toast}</div>}</AppShell>;
}

const showcaseScreens: { screen: Screen; name: string }[] = [
  { screen: "splash", name: "01. Màn hình khởi động" },
  { screen: "onboarding", name: "02. Giới thiệu ứng dụng" },
  { screen: "login", name: "03. Đăng nhập" },
  { screen: "register", name: "04. Đăng ký" },
  { screen: "home", name: "05. Trang chủ" },
  { screen: "analyzer", name: "06. Phân tích liên kết" },
  { screen: "analysis", name: "07. Kết quả phân tích" },
  { screen: "generator", name: "08. Tạo kịch bản AI" },
  { screen: "result", name: "09. Kết quả kịch bản" },
  { screen: "voice", name: "10. Xem trước giọng đọc" },
  { screen: "history", name: "11. Lịch sử kịch bản" },
  { screen: "wallet", name: "12. Ví Token" },
  { screen: "plans", name: "13. Gói đăng ký" },
  { screen: "payment", name: "14. Thanh toán Demo" },
  { screen: "profile", name: "15. Cá nhân & Cài đặt" },
];

function Showcase() {
  const base = window.location.pathname;
  return <div className="showcase-page">
    <header className="showcase-header">
      <div className="showcase-mark"><Icon name="spark" size={30} /></div>
      <div>
        <span>ĐỒ ÁN ỨNG DỤNG DI ĐỘNG</span>
        <h1>AI Affiliate Auto-Pilot</h1>
        <p>Hệ thống sáng tạo nội dung tiếp thị liên kết bằng trí tuệ nhân tạo</p>
      </div>
      <div className="showcase-count"><strong>15</strong><span>Màn hình</span></div>
    </header>
    <div className="showcase-grid">
      {showcaseScreens.map(({ screen, name }) => <section className="showcase-item" key={screen}>
        <div className="showcase-label"><span>{name}</span><i /></div>
        <div className="frame-stage">
          <iframe title={name} src={`${base}?screen=${screen}&embed=1`} />
        </div>
      </section>)}
    </div>
    <footer className="showcase-footer">
      <span>AI Affiliate Auto-Pilot</span>
      <span>Mobile Application UI Showcase · 390 × 844</span>
    </footer>
  </div>;
}

function Info({ title, items }: { title: string; items: string[] }) {
  return <div className="info-card"><h3>{title}</h3>{items.map(x => <div key={x}><Icon name="check" size={18} /><span>{x}</span></div>)}</div>;
}

function Voice({ go, text }: { go: (s: Screen) => void; text: string }) {
  const [playing, setPlaying] = useState(false);
  const speak = () => {
    speechSynthesis.cancel();
    const spokenText = getSpokenText(text);
    const u = new SpeechSynthesisUtterance(spokenText);
    u.lang = "vi-VN";
    u.rate = 1;
    u.onend = () => setPlaying(false);
    setPlaying(true);
    speechSynthesis.speak(u);
  };
  return <><Header title="Giọng đọc AI" onBack={() => go("result")} /><div className="page voice-page"><div className={playing ? "voice-orb playing" : "voice-orb"}><Icon name="spark" size={48} /></div><h1>{playing ? "Đang phát giọng đọc..." : "Nghe kịch bản sống động"}</h1><p>Giọng nữ miền Nam · Tự nhiên · Năng động</p><div className="wave">{[1,2,3,4,5,6,7,8,9,10,11,12].map(i => <i key={i} style={{height: `${15 + (i%5)*9}px`}} />)}</div><button type="button" className="play-main" onClick={playing ? () => { speechSynthesis.cancel(); setPlaying(false); } : speak}><Icon name={playing ? "check" : "play"} size={30} /></button><div className="voice-select"><b>Giọng đọc</b><button type="button" className="selected"><span>AN</span><div><b>An Nhiên</b><small>Nữ · Miền Nam</small></div><Icon name="check" /></button><button type="button"><span>MK</span><div><b>Minh Khang</b><small>Nam · Miền Bắc</small></div></button></div><button type="button" className="primary" onClick={speak}><Icon name="play" /> Phát lại</button></div></>;
}

function VideoPreview({ go, script }: { go: (s: Screen) => void; script: ScriptItem }) {
  const [playing, setPlaying] = useState(false);
  const [activeScene, setActiveScene] = useState(0);

  const scenes = [
    { title: "CẢNH 1: HOOK (3s)", text: "Đừng mua bất kỳ sản phẩm nào nếu bạn chưa xem hết video này!" },
    { title: "CẢNH 2: USP SẢN PHẨM", text: `Điểm ăn tiền nhất của ${script?.title || "sản phẩm"} chính là công nghệ tối tân, giải quyết triệt để vấn đề của bạn.` },
    { title: "CẢNH 3: CTA CHỐT ĐƠN", text: `Hàng chính hãng đang sale cực sốc! Bấm ngay vào giỏ hàng ${script?.platform || "TikTok"} để sở hữu ngay.` }
  ];

  const playVideoWithVoice = () => {
    speechSynthesis.cancel();
    const spokenText = getSpokenText(script?.body || "");
    const u = new SpeechSynthesisUtterance(spokenText);
    u.lang = "vi-VN";
    u.rate = 1;
    u.onboundary = (e) => {
      if (e.charIndex < spokenText.length / 3) setActiveScene(0);
      else if (e.charIndex < (spokenText.length * 2) / 3) setActiveScene(1);
      else setActiveScene(2);
    };
    u.onend = () => {
      setPlaying(false);
      setActiveScene(0);
    };
    setPlaying(true);
    speechSynthesis.speak(u);
  };

  const stopVideo = () => {
    speechSynthesis.cancel();
    setPlaying(false);
    setActiveScene(0);
  };

  useEffect(() => {
    return () => { speechSynthesis.cancel(); };
  }, [script]);

  return <>
    <Header title="Video AI Quảng Cáo Thực Tế" onBack={() => go("result")} />
    <div className="page" style={{textAlign: "center"}}>
      <div style={{
        width: "100%",
        maxWidth: 290,
        height: 520,
        margin: "0 auto 14px",
        background: "linear-gradient(135deg, #0b0f19, #1e1b4b, #0f172a)",
        borderRadius: 24,
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 25px 50px rgba(30,27,75,0.4)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "18px 14px",
        color: "white",
        border: "1px solid rgba(255,255,255,0.18)"
      }}>
        {/* Top status */}
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, opacity: 0.9}}>
          <span style={{background: "#6366f1", padding: "3px 10px", borderRadius: 10, fontWeight: 700}}>{script?.platform || "TikTok"} Video Studio</span>
          <span style={{color: playing ? "#ef4444" : "#4ade80", fontWeight: 700}}>{playing ? "● Đang phát..." : "● Sẵn sàng"}</span>
        </div>

        {/* Scene Cards Transition Player */}
        <div style={{margin: "auto 0", padding: "8px 0"}}>
          <div style={{
            width: 68, height: 68, borderRadius: 22, background: "linear-gradient(135deg, #818cf8, #4f46e5)",
            display: "grid", placeItems: "center", margin: "0 auto 10px", fontSize: 24, fontWeight: 800,
            boxShadow: "0 10px 25px rgba(79,70,229,0.5)"
          }}>
            {(script?.title || "SP").slice(0, 2).toUpperCase()}
          </div>
          <h3 style={{fontSize: 14, margin: "0 0 6px", fontWeight: 700, color: "#f8fafc"}}>{script?.title || "Sản phẩm"}</h3>

          {/* Active Scene Display */}
          <div style={{
            background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(10px)", padding: "14px", borderRadius: 16,
            fontSize: 11, lineHeight: 1.5, textAlign: "left", minHeight: 130,
            border: "1px solid rgba(99, 102, 241, 0.4)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)"
          }}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6}}>
              <span style={{fontSize: 9, fontWeight: 800, color: "#818cf8", letterSpacing: 1}}>{scenes[activeScene].title}</span>
              <span style={{fontSize: 9, opacity: 0.6}}>Cảnh {activeScene + 1}/3</span>
            </div>
            <p style={{margin: 0, color: "#e2e8f0", fontWeight: 500}}>{scenes[activeScene].text}</p>
          </div>
        </div>

        {/* Bottom CTA & Controls */}
        <div>
          <div style={{
            background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "white", padding: "10px", borderRadius: 12, fontSize: 11, fontWeight: 700,
            marginBottom: 10, boxShadow: "0 5px 15px rgba(244,63,94,0.4)"
          }}>
            🛒 Săn deal chính hãng tại giỏ hàng {script?.platform || "TikTok"}
          </div>
          <button type="button" onClick={playing ? stopVideo : playVideoWithVoice} style={{
            width: "100%", background: playing ? "#dc2626" : "linear-gradient(135deg, #6366f1, #4f46e5)", border: 0, color: "white", padding: "12px",
            borderRadius: 14, fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 6px 20px rgba(99,102,241,0.4)"
          }}>
            <Icon name={playing ? "check" : "play"} size={18} /> {playing ? "Dừng phát video" : "Xem video & Thuyết minh AI"}
          </button>
        </div>
      </div>
      <p className="muted" style={{fontSize: 11}}>Trình phát đa cảnh (Multi-Scene Storyboard) khớp với kịch bản thực tế.</p>
      <button type="button" className="primary" onClick={() => alert(`Đã xuất và tải xuống video quảng cáo MP4 cho sản phẩm "${script?.title || "sản phẩm"}" thành công!`)} style={{marginTop: 10}}>
        <Icon name="copy" /> Tải video quảng cáo về máy
      </button>
    </div>
  </>;
}

function Payment({ title, go, onPaid }: { title: string; go: (s: Screen) => void; onPaid: (tokens: number) => void }) {
  const price = title.includes("VIP") ? "149.000đ" : title.includes("120") ? "119.000đ" : title.includes("50") ? "59.000đ" : "29.000đ";
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    const result = await verifyPurchaseOnBackend({
      provider: "momo",
      purchaseToken: `token_${Date.now()}`,
      productId: title,
      userId: "user_demo",
      orderId: `ORD_${Date.now()}`
    });
    setLoading(false);
    if (result.verified) {
      onPaid(result.tokensAwarded);
    } else {
      alert(result.message);
    }
  };

  return <><Header title="Thanh toán mô phỏng" onBack={() => go(title.includes("VIP") ? "plans" : "wallet")} /><div className="page"><div className="payment-demo"><Icon name="check" /><div><b>Cổng thanh toán MoMo Sandbox</b><p>Mô phỏng quét mã QR bảo mật thành công tức thì.</p></div></div><div className="order"><span>ĐƠN HÀNG</span><div><b>{title}</b><strong>{price}</strong></div><hr /><div><span>Tổng thanh toán</span><strong>{price}</strong></div></div><h3 className="block-title">Phương thức thanh toán</h3><div className="pay-method"><button className="selected"><span className="pay-logo">M</span><div><b>Ví MoMo Sandbox</b><small>Quét mã QR tự động xác nhận</small></div><Icon name="check" /></button><button><span className="pay-logo bank">B</span><div><b>Thẻ ngân hàng (NAPAS/Visa)</b><small>Chuyển khoản trực tuyến</small></div></button></div><button type="button" className="primary payment-button" disabled={loading} onClick={handlePayment}>{loading ? "Đang xác thực giao dịch..." : `Xác nhận thanh toán · ${price}`}</button><p className="center muted small">Giao dịch giả lập an toàn phục vụ bảo vệ đồ án.</p></div></>;
}
