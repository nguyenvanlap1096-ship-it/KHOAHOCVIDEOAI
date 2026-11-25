"use strict";
const $ = id => document.getElementById(id);
const LS = { get(k){ try{ return localStorage.getItem(k); }catch{ return null; } }, set(k,v){ try{ localStorage.setItem(k,v); }catch{} }, del(k){ try{ localStorage.removeItem(k); }catch{} } };

/* ---------- chạy ở đâu ----------
   Bản trên máy: trang do chính Muse2API phục vụ (http://127.0.0.1:18610/batch) → gọi cùng địa chỉ.
   Bản web khoá học: trang nằm trên web, gọi sang bộ chạy Muse2API trên máy học viên (CFG.base). */
const CFG = (() => { try{ return JSON.parse($("museCfg").textContent) || {}; }catch{ return {}; } })();
const WEB = !!CFG.web;
const BASE = WEB ? String(LS.get("muse_base") || CFG.base || "http://127.0.0.1:18610").replace(/\/+$/, "") : "";
const abs = u => (u && u.startsWith("/") ? BASE + u : u);
document.querySelectorAll(WEB ? ".only-local" : ".only-web").forEach(e => e.remove());
if (WEB) document.querySelectorAll('a[href="/admin"]').forEach(a => { a.href = BASE + "/admin"; });

/* ---------- key: lấy từ #key= (hoặc ?key= ở bản trên máy) lần đầu rồi nhớ lại, xoá khỏi thanh địa chỉ ----------
   Phần sau dấu # không được gửi lên máy chủ web, nên key không lộ ra ngoài máy học viên. */
const keyFromUrl = new URLSearchParams(location.hash.slice(1)).get("key") || new URLSearchParams(location.search).get("key") || "";
let KEY = keyFromUrl || LS.get("muse_studio_key") || "";
if (keyFromUrl){ LS.set("muse_studio_key", KEY); history.replaceState(null, "", location.pathname); }

let kind = "video", refs = [], seqId = null, lastGen = null;
const tasks = new Map();

function toast(msg, bad){ const t = document.createElement("div"); t.className = "toast" + (bad ? " bad" : ""); t.textContent = msg; $("toasts").append(t); setTimeout(() => t.remove(), bad ? 6500 : 3500); }
function esc(s){ const d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
function fmtBytes(b){ if (!b && b !== 0) return ""; if (b < 1024) return b + " B"; if (b < 1048576) return (b/1024).toFixed(0) + " KB"; return (b/1048576).toFixed(1) + " MB"; }
function fmtTime(ts){ if (!ts) return ""; const d = new Date(ts * 1000); return d.toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"}) + " " + d.toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit"}); }
const ST = { queued:["wait","Đang chờ"], processing:["run","Đang tạo"], running:["run","Đang tạo"], submitting:["run","Đang gửi"], completed:["done","Hoàn tất"], failed:["err","Lỗi"], cancelled:["wait","Đã dừng"], interrupted:["err","Gián đoạn"] };
const ACTIVE = ["queued","processing","running","submitting"];
// Muse2API báo lỗi bằng tiếng Trung: dịch các lỗi hay gặp, lỗi lạ giữ nguyên.
const ERR_VI = [
  [/未生成媒体|仅返回文本/, "muse.ai không tạo video mà chỉ trả lời bằng chữ — thường do mô tả quá dài hoặc quá nhiều yêu cầu trong 10 giây. Rút gọn mô tả (hoặc bấm ✨ Viết kịch bản lại) rồi tạo lại."],
  [/没有可用账号|无可用账号|导入\s*cookie/i, "Chưa có tài khoản muse.ai nào dùng được — thêm tài khoản (khung tím phía trên) rồi tạo lại."],
  [/超时|timeout|timed out/i, "Hết thời gian chờ muse.ai tạo xong (muse.ai đang nghẽn) — bấm Tạo lại."],
  [/额度|配额|quota|limit/i, "Tài khoản đã hết hạn mức — đợi reset hoặc dùng tài khoản khác."],
  [/登录|过期|expired|unauthori|401|403/i, "Phiên đăng nhập muse.ai đã hết hạn — thêm lại tài khoản trong Quản trị nâng cao."],
  [/拒绝|违规|安全|policy|safety|moderat/i, "muse.ai từ chối nội dung này — viết lại mô tả khác đi."],
];
function viErr(e){ const s = String(e || ""); const hit = ERR_VI.find(([re]) => re.test(s)); return hit ? hit[1] : s; }
function chip(st){ const c = ST[st] || ["wait", st]; return `<span class="chip ${c[0]}">${c[1]}</span>`; }

async function api(path, opts = {}){
  opts.headers = { ...(opts.headers || {}), Authorization: "Bearer " + KEY };
  let r;
  try{ r = await fetch(BASE + path, opts); }
  catch{
    throw new Error(WEB
      ? "Chưa kết nối được bộ chạy trên máy bạn. Bấm đôi shortcut “Muse Studio” ở Desktop (hoặc tải bộ cài bên dưới) rồi đợi vài giây. Nếu Chrome hỏi quyền truy cập thiết bị trong mạng cục bộ, bấm Cho phép."
      : "Không kết nối được Muse2API. Mở lại shortcut “Muse Studio”.");
  }
  let d = null; try{ d = await r.json(); }catch{}
  if (!r.ok){
    // Muse2API trả lỗi dạng {detail: "..."} hoặc {error: {message: "..."}}.
    const m = d && typeof d.detail === "string" ? d.detail
      : d && d.error && d.error.message ? d.error.message
      : d && typeof d.error === "string" ? d.error
      : d && d.detail ? JSON.stringify(d.detail) : "HTTP " + r.status;
    throw new Error(m);
  }
  return d;
}

/* ---------- kết nối ---------- */
async function connect(){
  if (!KEY){ $("connectBox").classList.remove("hidden"); $("app").classList.add("hidden"); return false; }
  try{
    const s = await api("/admin/status");
    $("connectBox").classList.add("hidden"); $("app").classList.remove("hidden");
    $("svcDot").className = "dot ok"; $("svcText").textContent = "Dịch vụ đang chạy";
    renderAccounts(s.accounts || []);
    return true;
  }catch(e){
    $("svcDot").className = "dot bad"; $("svcText").textContent = "Mất kết nối dịch vụ";
    $("connectBox").classList.remove("hidden"); $("app").classList.add("hidden");
    $("keyErr").textContent = /API key|401|unauthori/i.test(e.message) ? "API key không đúng. Dán lại key (phần sau MUSE2API_KEY= trong file .env)." : e.message;
    webHint();
    retryLater();
    return false;
  }
}
// Bản web: Chrome hỏi quyền "truy cập mạng cục bộ" trước khi cho trang web gọi bộ chạy trên máy.
// Nếu quyền đã bị chặn, hiện cách bật lại + nút mở bản trên máy (cùng tính năng, không cần quyền này).
async function webHint(){
  if (!WEB || !$("lnaHint")) return;
  $("openLocal").href = BASE + "/batch" + (KEY ? "?key=" + encodeURIComponent(KEY) : "");
  let st = "";
  try{ st = (await navigator.permissions.query({ name: "local-network-access" })).state; }catch{}
  $("lnaHint").classList.toggle("hidden", st !== "denied");
}
webHint();
// Đang ở màn hình kết nối: tự thử lại mỗi 5 giây — học viên vừa mở bộ chạy là trang tự vào, không cần bấm gì.
let retryTimer = null;
function retryLater(){
  if (retryTimer || !KEY) return;
  retryTimer = setInterval(async () => {
    if ($("connectBox").classList.contains("hidden")){ clearInterval(retryTimer); retryTimer = null; return; }
    if (await connect()){ clearInterval(retryTimer); retryTimer = null; init(); }
  }, 5000);
}
$("keyBtn").onclick = async () => { KEY = $("keyInput").value.trim(); if (!KEY) return; LS.set("muse_studio_key", KEY); $("keyErr").textContent = ""; if (await connect()) init(); };
$("keyInput").addEventListener("keydown", e => { if (e.key === "Enter") $("keyBtn").click(); });
if ($("baseSave")){
  $("baseInput").value = BASE;
  $("baseSave").onclick = () => { const v = $("baseInput").value.trim(); if (v) LS.set("muse_base", v); else LS.del("muse_base"); location.reload(); };
}

/* ---------- tài khoản & hạn mức ---------- */
function renderAccounts(list){
  const sel = $("accountSel"), cur = sel.value;
  sel.innerHTML = '<option value="">Tự động chọn tài khoản</option>' + list.filter(a => a.enabled !== false).map(a => `<option value="${esc(a.id)}">${esc(a.label || a.id)}</option>`).join("");
  if (cur) sel.value = cur;
  sel._list = list; updateAccInfo();
  $("noAcc").classList.toggle("hidden", list.some(a => a.enabled !== false));
}
async function refreshStatus(){
  try{ renderAccounts((await api("/admin/status")).accounts || []); $("svcDot").className = "dot ok"; $("svcText").textContent = "Dịch vụ đang chạy"; return true; }
  catch{ $("svcDot").className = "dot bad"; $("svcText").textContent = "Mất kết nối dịch vụ"; return false; }
}
$("noAccRe").onclick = async () => { await refreshStatus(); toast($("noAcc").classList.contains("hidden") ? "Đã nhận tài khoản muse. Bắt đầu tạo video được rồi!" : "Chưa thấy tài khoản nào. Thêm xong trên trang quản trị rồi bấm lại.", !$("noAcc").classList.contains("hidden")); };
function curAccount(){ const id = $("accountSel").value; return ($("accountSel")._list || []).find(a => a.id === id) || null; }
function updateAccInfo(){
  const a = curAccount(), box = $("accInfo");
  seqId = null;
  if (!a){ box.textContent = "Hệ thống tự luân phiên tài khoản khả dụng."; $("quotaBox").classList.add("hidden"); return; }
  let s = `${a.cookie_count || 0} cookie · ${a.ok === true ? "sẵn sàng" : a.ok === false ? "có lỗi" : "chưa kiểm tra"}`;
  if (a.expires_at) s += ` · phiên tới ${fmtTime(a.expires_at)}`;
  box.textContent = s;
  if (a.quota && a.quota.found) showQuota(a.quota); else $("quotaBox").classList.add("hidden");
}
$("accountSel").onchange = () => { updateAccInfo(); syncConc(); };
function showQuota(q){
  $("quotaBox").classList.remove("hidden");
  $("quotaPlan").textContent = q.plan || "Free plan";
  $("quotaPct").textContent = q.weekly_used_pct != null ? "Tuần: đã dùng " + q.weekly_used_pct + "%" : "";
  $("quotaBar").style.width = (q.weekly_used_pct || 0) + "%";
  $("quotaNote").textContent = `Reset ${q.weekly_reset || "?"}${q.extra_left ? " · Token phụ: " + q.extra_left : ""}`;
}
$("quotaBtn").onclick = async () => {
  const a = curAccount(), b = $("quotaBtn"); b.disabled = true; b.textContent = "Đang kiểm tra…";
  try{ showQuota(a ? await api("/admin/accounts/" + encodeURIComponent(a.id) + "/quota", { method:"POST" }) : await api("/admin/quota", { method:"POST" })); toast("Đã cập nhật hạn mức"); }
  catch(e){ toast("Không kiểm tra được hạn mức: " + e.message, true); }
  finally{ b.disabled = false; b.textContent = "Kiểm tra hạn mức"; }
};

/* ---------- tự lưu về thư mục ---------- */
async function loadDl(){
  try{
    const d = await api("/v1/download-settings");
    $("dlEnabled").checked = !!d.enabled; $("dlFolder").value = d.folder || "";
    $("dlStatus").textContent = (d.enabled ? "Đang bật" : "Đang tắt") + " · đã lưu " + (d.saved_count || 0) + " tệp";
  }catch(e){ $("dlStatus").textContent = e.message; }
}
$("dlChoose").onclick = async () => { try{ const d = await api("/v1/download-settings/choose-folder", { method:"POST" }); if (d.folder) $("dlFolder").value = d.folder; }catch(e){ toast(e.message, true); } };
$("dlSave").onclick = async () => { try{ await api("/v1/download-settings", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ enabled:$("dlEnabled").checked, folder:$("dlFolder").value }) }); toast("Đã lưu cài đặt tải"); loadDl(); }catch(e){ toast(e.message, true); } };

/* ---------- ảnh / tài liệu tham chiếu ---------- */
const ROLES = [["reference","Tham chiếu"],["character","Nhân vật"],["background","Bối cảnh"],["scene","Bố cục cảnh"],["first_frame","Khung đầu"]];
$("refInput").onchange = async e => {
  for (const f of e.target.files){
    const isDoc = !f.type.startsWith("image/");
    if (refs.filter(r => r.isDoc === isDoc).length >= 8){ toast("Tối đa 8 ảnh + 8 tài liệu", true); continue; }
    if (f.size > 5 * 1024 * 1024){ toast("Tệp " + f.name + " quá 5 MB", true); continue; }
    const data = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });
    refs.push({ data, role: isDoc ? "document" : "reference", name: f.name, isDoc });
  }
  e.target.value = ""; renderRefs();
};
$("refClear").onclick = () => { refs = []; renderRefs(); };
function renderRefs(){
  const w = $("refList"); w.innerHTML = "";
  refs.forEach((r, i) => {
    const rm = document.createElement("button"); rm.className = "btn"; rm.onclick = () => { refs.splice(i, 1); renderRefs(); };
    if (r.isDoc){
      const d = document.createElement("div"); d.className = "docref"; d.innerHTML = `<span>📄</span><span>${esc(r.name)}</span>`;
      rm.textContent = "✕"; d.append(rm); w.append(d);
    } else {
      const d = document.createElement("div"); d.className = "ref"; d.innerHTML = `<img src="${r.data}" alt=""><div class="meta"></div>`;
      const sel = document.createElement("select");
      sel.innerHTML = ROLES.map(([v, t]) => `<option value="${v}"${r.role === v ? " selected" : ""}>${t}</option>`).join("");
      sel.onchange = () => { r.role = sel.value; saveRefs(); };
      rm.textContent = "Bỏ ảnh"; d.querySelector(".meta").append(sel, rm); w.append(d);
    }
  });
  saveRefs(); syncRefBadge();
}
// Thanh báo ảnh tham chiếu đang gắn — để không vô tình mang nhân vật của dự án cũ sang dự án mới.
function syncRefBadge(){
  const imgs = refs.filter(r => !r.isDoc), chars = imgs.filter(r => r.role === "character").length, docs = refs.length - imgs.length;
  $("refBadge").classList.toggle("hidden", !refs.length);
  $("refBadgeImgs").innerHTML = imgs.slice(0, 4).map(r => `<img src="${r.data}" alt="">`).join("");
  $("refBadgeText").textContent = "Đang gắn " + [imgs.length ? imgs.length + " ảnh tham chiếu" + (chars ? " (" + chars + " nhân vật)" : "") : "", docs ? docs + " tài liệu" : ""].filter(Boolean).join(" + ") + " vào mọi lần tạo.";
}
$("refBadgeClear").onclick = () => { refs = []; renderRefs(); toast("Đã bỏ ảnh tham chiếu."); };
$("newProject").onclick = () => {
  if (!confirm("Bắt đầu dự án mới?\n\nSẽ bỏ: ảnh nhân vật/tham chiếu, giọng nhân vật, ghi chú chuỗi, kịch bản hàng loạt và mô tả đang gõ.\nVideo đã tạo trong Thư viện vẫn giữ nguyên.")) return;
  refs = []; renderRefs();
  for (const id of ["voiceNote", "continuity", "batchPrompts", "prompt"]){ $(id).value = ""; $(id).dispatchEvent(new Event("input")); }
  LS.del("studio_seq_" + ($("accountSel").value || "auto")); seqId = null; lastGen = null;
  toast("Đã bắt đầu dự án mới — không còn nhân vật hay giọng của dự án trước.");
};
function saveRefs(){ try{ localStorage.setItem("studio_refs_v1", JSON.stringify(refs)); }catch{ /* ảnh lớn vượt bộ nhớ trình duyệt: chỉ giữ trong phiên */ } }
// Muse2API chỉ nhận data URL image/png|jpeg|webp. Ảnh lấy từ thư viện của chính Muse2API được trả về là
// application/octet-stream, nên đọc vài byte đầu để ghi lại đúng định dạng.
function fixImageDataUrl(u){
  const m = /^data:([^;,]*);base64,(.*)$/.exec(u || ""); if (!m || /^image\/(png|jpeg|webp)$/.test(m[1])) return u;
  let head = ""; try{ head = atob(m[2].slice(0, 24)); }catch{ return u; }
  const mime = head.startsWith("\x89PNG") ? "image/png" : head.startsWith("\xFF\xD8\xFF") ? "image/jpeg" : head.startsWith("RIFF") && head.slice(8, 12) === "WEBP" ? "image/webp" : "";
  return mime ? "data:" + mime + ";base64," + m[2] : u;
}
function refsPayload(){
  const imgs = refs.filter(r => !r.isDoc);
  return { reference_images: imgs.map(r => fixImageDataUrl(r.data)), reference_roles: imgs.map(r => r.role), reference_files: refs.filter(r => r.isDoc).map(r => ({ name:r.name, data:r.data })) };
}

/* ---------- ô tạo ---------- */
for (let s = 1; s <= 10; s++){ const o = document.createElement("option"); o.value = s; o.textContent = s + " giây"; if (s === 10) o.selected = true; $("durSel").append(o); }
// muse.ai tạo tối đa 10 giây/lần: video dài hơn được chia thành các đoạn nối liền (khung cuối → khung đầu) rồi tự ghép.
[[15, "15 giây (tự nối 2 đoạn)"], [20, "20 giây (tự nối 2 đoạn)"], [30, "30 giây (tự nối 3 đoạn)"]].forEach(([v, l]) => { const o = document.createElement("option"); o.value = v; o.textContent = l; $("durSel").append(o); });
const segDurs = d => { const out = []; for (let left = d; left > 0; left -= 10) out.push(Math.min(10, left)); return out; }; // 15 → [10, 5], 30 → [10, 10, 10]
$("kindSeg").querySelectorAll("button").forEach(b => b.onclick = () => {
  kind = b.dataset.kind;
  $("kindSeg").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
  $("durSel").disabled = kind !== "video";
});
$("modeSel").onchange = () => { $("coherentBox").classList.toggle("hidden", $("modeSel").value !== "coherent"); syncConc(); };
function getSeqId(){
  const k = "studio_seq_" + ($("accountSel").value || "auto");
  if (!seqId){ seqId = LS.get(k); if (!seqId){ seqId = "seq_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); LS.set(k, seqId); } }
  return seqId;
}
$("newSeqBtn").onclick = () => { LS.del("studio_seq_" + ($("accountSel").value || "auto")); seqId = null; toast("Đã bắt đầu chuỗi mới — cảnh tiếp theo sẽ mở hội thoại mới"); };
/* ---------- giọng nhân vật: mô tả cố định gắn vào mọi cảnh để muse.ai không đổi giọng giữa các cảnh ---------- */
const VOICES = [
  ["Bé trai tinh nghịch", "a bright, high-pitched, playful 7-year-old boy's voice, slightly squeaky, fast and cheerful"],
  ["Bé gái dễ thương", "a sweet, high, clear 6-year-old girl's voice, soft and giggly"],
  ["Nam thanh niên", "a warm, clear 25-year-old Vietnamese man's voice, medium pitch, friendly"],
  ["Nữ thanh niên", "a gentle, bright 23-year-old Vietnamese woman's voice, medium-high pitch, warm"],
  ["Ông cụ", "a deep, slow, slightly raspy 70-year-old man's voice, kind and calm"],
  ["Bà cụ", "a soft, slow, slightly shaky 70-year-old woman's voice, loving"],
  ["Người kể chuyện", "a calm, deep, warm storyteller voice, slow and expressive"],
];
VOICES.forEach(([label, desc]) => {
  const b = document.createElement("button"); b.type = "button"; b.className = "btn"; b.style.cssText = "padding:5px 10px;font-size:12.5px"; b.textContent = "＋ " + label;
  b.onclick = () => { const ta = $("voiceNote"); ta.value = (ta.value.trim() ? ta.value.trim() + "\n" : "") + "Tên nhân vật: " + desc; ta.dispatchEvent(new Event("input")); ta.focus(); };
  $("voicePresets").append(b);
});
$("voiceNote").value = LS.get("muse_voice") || "";
const syncVoice = () => { LS.set("muse_voice", $("voiceNote").value); $("voiceOn").classList.toggle("hidden", !$("voiceNote").value.trim()); };
$("voiceNote").addEventListener("input", syncVoice); syncVoice();
// Chỉ gắn giọng của nhân vật có trong cảnh (tên xuất hiện trong prompt) — prompt gọn, muse không từ chối vì quá dài.
// Thoại nhiều nhân vật trong một cảnh: từng câu ghi rõ ai nói, nét nhận diện và giọng NGAY TẠI CÂU ĐÓ, đúng thứ tự,
// và chỉ người đang nói mấp máy miệng — để muse không gán nhầm lời thoại cho nhân vật khác.
const clip = (t, n) => { const w = String(t || "").trim().split(/\s+/); return w.length > n ? w.slice(0, n).join(" ").replace(/[,;:]$/, "").replace(/s+(with|and|a|an|the|of|in)$/i, "").replace(/s+(with|and|a|an|the|of|in)$/i, "") : w.join(" "); };
function voiceOf(name){
  const line = $("voiceNote").value.split("\n").map(x => x.trim()).find(l => l.split(":")[0].trim().toLowerCase() === name.toLowerCase());
  return line ? clip(line.slice(line.indexOf(":") + 1), 12) : "";
}
function tagOf(name){
  try{ const f = JSON.parse(LS.get("muse_film_last") || "null"); const c = f && f.characters.find(x => x.name.toLowerCase() === name.toLowerCase()); return c ? clip(c.look_en.replace(/^(a|an|the)\s+/i, ""), 9) : ""; }catch{ return ""; }
}
function dialogueText(says){
  if (!says.length) return "";
  const seen = new Set();
  const narr = who => /người dẫn|người kể|dẫn chuyện|lời bình|narrator/i.test(who) && !tagOf(who);
  const lines = says.map((d, i) => {
    const first = !seen.has(d.who.toLowerCase()); seen.add(d.who.toLowerCase());
    if (narr(d.who)) return (i + 1) + ") off-screen voice-over by " + d.who + (first && voiceOf(d.who) ? " (voice: " + clip(voiceOf(d.who), 9) + ")" : "") + ', nobody on screen moves their lips, in Vietnamese: "' + d.text + '"';
    const info = !first ? "" : [tagOf(d.who), voiceOf(d.who) && "voice: " + voiceOf(d.who)].filter(Boolean).join("; ");
    return (i + 1) + ") " + d.who + (info ? " (" + info + ")" : "") + (i ? " replies" : " says") + ' in Vietnamese: "' + d.text + '"';
  });
  const many = new Set(says.filter(d => !narr(d.who)).map(d => d.who)).size > 1;
  return " Dialogue in this exact order" + (many ? ", only the character who is speaking moves their mouth while the others listen silently and react" : "") + ": " + lines.join(" ") + ".";
}
// Chú thích ảnh tham chiếu: "ảnh 1 là X, ảnh 2 là Y" — tránh muse lẫn nhân vật khi có nhiều ảnh.
function refLegend(){
  const imgs = refs.filter(r => !r.isDoc);
  const named = imgs.map((r, i) => r.charName ? "image " + (i + 1) + " is " + (r.isProduct ? "the REAL product " : "") + r.charName : "").filter(Boolean);
  const real = imgs.findIndex(r => r.isProduct);
  return named.length ? "Reference images: " + named.join(", ") + "; keep each character exactly as in their image" +
    (real >= 0 ? "; the product must look exactly like the real product photo (image " + (real + 1) + "): same design, color, shape and details, follow the photo over any text" : "") + ". " : "";
}
function withVoice(p){
  // Có ảnh sản phẩm thật: bỏ phần chữ tả sản phẩm (AI có thể tả sai) — để muse bám theo ảnh.
  if (refs.some(r => r.isProduct && !r.isDoc)) p = p.replace(/Product, identical shape, colors and label in every shot: ([^(]+?) \([^)]*\)\./g, "Product, identical in every shot: $1, exactly as in the real product photo.");
  p = refLegend() + p;
  if (/\(.*voice: /.test(p)) return p; // giọng đã gắn ngay tại từng câu thoại
  const all = $("voiceNote").value.split("\n").map(s => s.trim()).filter(s => s && !/^Tên nhân vật:/i.test(s));
  const low = String(p).toLowerCase();
  const named = all.filter(l => { const nm = l.split(":")[0].trim().toLowerCase(); return nm && low.includes(nm); });
  const short = l => { const w = l.split(/\s+/); return w.length > 20 ? w.slice(0, 20).join(" ") + "…" : l; }; // tên + ~16 từ mô tả giọng
  const v = (named.length ? named : all.length === 1 ? all : []).map(short);
  return v.length ? p + " Voices, identical in every scene: " + v.join("; ") + "." : p;
}
function commonBody(){
  const mode = $("modeSel").value;
  return { account_id: $("accountSel").value || null, size: $("sizeSel").value, generation_mode: mode,
    continuity_notes: mode === "coherent" ? $("continuity").value : "", prompt_language: "auto", ...refsPayload() };
}

/* ---------- khung xem ---------- */
function playMedia(url, k, prompt, filename){
  const st = $("stage"); st.innerHTML = "";
  if (k === "video"){
    const v = document.createElement("video"); v.src = url; v.controls = true; v.autoplay = true; st.append(v);
    const b = document.createElement("span"); b.className = "badge"; b.textContent = "✓ Vừa tạo xong"; st.append(b); setTimeout(() => b.remove(), 6000);
  } else { const im = document.createElement("img"); im.src = url; im.alt = ""; st.append(im); }
  $("stagePrompt").textContent = prompt || filename || "";
  const dl = $("dlBtn"); dl.href = url; dl.download = filename || ""; dl.classList.remove("hidden");
  $("regenBtn").classList.toggle("hidden", !lastGen);
  const ch = $("charBtn"); ch.classList.toggle("hidden", k !== "image"); ch.dataset.url = url; ch.dataset.name = filename || "nhan-vat";
  $("stageCard").scrollIntoView({ behavior:"smooth", block:"center" });
}
// Phim ghép xong phát ngay ở khung xem chính (khung đen phía trên); khung "Ghép phim" bên dưới chỉ để báo tiến độ.
function showFilm(url, fname, info){
  lastGen = null;
  playMedia(url, "video", "🎬 " + info, fname);
  const b = document.querySelector("#stage .badge"); if (b) b.textContent = "✓ Phim đã ghép xong";
  $("filmCard").classList.add("hidden");
}
// Ảnh vừa tạo → thêm thẳng vào ảnh tham chiếu với vai trò Nhân vật (dùng cho tạo lẻ và hàng loạt).
$("charBtn").onclick = async () => {
  const b = $("charBtn"), url = b.dataset.url;
  // Mỗi lần chỉ 1 nhân vật chính từ nút này: ảnh mới THAY nhân vật cũ, không cộng dồn.
  const replaced = refs.some(r => !r.isDoc && r.role === "character");
  if (refs.filter(r => !r.isDoc && r.role !== "character").length >= 8){ toast("Đã đủ 8 ảnh tham chiếu. Bỏ bớt ảnh rồi thử lại.", true); return; }
  b.disabled = true;
  try{
    const blob = await (await fetch(url)).blob();
    if (blob.size > 5 * 1024 * 1024) throw new Error("Ảnh lớn hơn 5 MB");
    const data = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
    refs = refs.filter(r => r.isDoc || r.role !== "character");
    refs.push({ data, role: "character", name: b.dataset.name, isDoc: false });
    renderRefs();
    $("refBox").open = true;
    if (replaced) toast("Đã thay nhân vật cũ bằng ảnh này.");
    toast("Đã thêm ảnh làm Nhân vật. Mọi video tạo lẻ và hàng loạt từ giờ sẽ giữ nhân vật này (bấm Xoá hết để bỏ).");
  }catch(e){ toast("Không thêm được ảnh: " + e.message, true); }
  finally{ b.disabled = false; }
};
$("regenBtn").onclick = () => { if (!lastGen) return; $("prompt").value = lastGen.prompt; if (lastGen.kind !== kind) document.querySelector(`#kindSeg button[data-kind="${lastGen.kind}"]`).click(); generate(); };

/* ---------- hàng đợi render ---------- */
function taskUrl(t){ return abs(t.url || (t.result && t.result.url) || (t.data && t.data[0] && t.data[0].url) || (t.video && t.video.url) || null); }
function renderQueue(){
  const w = $("queue"), arr = [...tasks.values()].sort((a, b) => (b.created_at || 0) - (a.created_at || 0)).slice(0, 30);
  $("qActive").textContent = arr.filter(t => ACTIVE.includes(t.status)).length + " đang chạy";
  if (!arr.length){ w.innerHTML = '<div class="small muted" style="margin-top:12px">Chưa có tác vụ nào. Tạo một video để bắt đầu.</div>'; return; }
  w.innerHTML = "";
  for (const t of arr){
    const d = document.createElement("div"); d.className = "qitem";
    const pct = t.status === "completed" ? 100 : Math.round(t.progress || 0);
    d.innerHTML = `<div class="row" style="flex-wrap:nowrap"><span>${t.kind === "video" ? "🎬" : "🖼"}</span><span class="p grow" title="${esc(t.prompt || "")}">${esc(t.prompt || "(không tên)")}</span>${chip(t.status)}</div>
      <div class="bar" style="margin-top:8px"><i style="width:${pct}%"></i></div>
      <div class="small muted" style="margin-top:6px">${t.status === "completed" && t.elapsed ? "Xong trong " + t.elapsed + "s" : pct + "%"}${t.error ? " · " + esc(viErr(t.error).slice(0, 120)) : ""}</div>`;
    if (t.status === "completed" && t.url){
      const b = document.createElement("button"); b.className = "btn"; b.textContent = "▶ Xem ngay"; b.style.marginTop = "8px";
      b.onclick = () => playMedia(t.url, t.kind, t.prompt, t.result && t.result.filename); d.append(b);
    }
    w.append(d);
  }
}
async function pollTask(id){
  const t = tasks.get(id); if (!t) return;
  try{
    const d = await api(t.kind === "video" ? "/v1/videos/" + id : "/v1/images/tasks/" + id);
    Object.assign(t, { status:d.status, progress:d.progress, error:d.error || null, elapsed:d.elapsed, url:taskUrl(d), result:d.result || t.result });
    renderQueue();
    if (d.status === "completed"){
      toast((t.kind === "video" ? "🎬 Video" : "🖼 Ảnh") + " đã tạo xong — đang phát ngay");
      lastGen = { prompt:t.prompt, kind:t.kind };
      playMedia(t.url, t.kind, t.prompt, t.result && t.result.filename); loadMedia();
    } else if (d.status === "failed") toast("Tạo thất bại: " + (viErr(t.error) || "lỗi không rõ"), true);
    else setTimeout(() => pollTask(id), 2500);
  }catch{ setTimeout(() => pollTask(id), 4000); }
}
async function loadServerTasks(){
  try{
    const d = await api("/admin/tasks?limit=20");
    for (const t of d.tasks || []) if (!tasks.has(t.id)) tasks.set(t.id, { id:t.id, kind:t.kind, prompt:t.prompt, status:t.status, progress:t.progress || 0, url:taskUrl(t), result:t.result, error:t.error, elapsed:t.elapsed, created_at:t.created_at });
    renderQueue();
    for (const t of tasks.values()) if (ACTIVE.includes(t.status)) pollTask(t.id);
  }catch{ renderQueue(); }
}

/* ---------- tạo 1 cảnh ---------- */
async function generate(){
  const prompt = $("prompt").value.trim();
  if (!prompt){ toast("Hãy nhập mô tả trước", true); $("prompt").focus(); return; }
  // Tạo ẢNH (thường là nhân vật mới) mà vẫn đang gắn ảnh nhân vật cũ → hỏi trước để không lẫn nhân vật.
  if (kind === "image" && refs.some(r => !r.isDoc && r.role === "character")
      && !confirm("Đang gắn ảnh NHÂN VẬT cũ vào lần tạo này.\n\nOK = vẫn dùng nhân vật đó (ví dụ vẽ nhân vật cũ ở cảnh mới).\nHuỷ = BỎ nhân vật cũ rồi tạo ảnh mới.")){
    refs = refs.filter(r => r.isDoc || r.isProduct || !(r.role === "character" || (r.charName && film.characters.some(c => c.name === r.charName)))); renderRefs(); toast("Đã bỏ nhân vật cũ.");
  }
  if (kind === "video" && Number($("durSel").value) > 10) return longVideo(prompt, Number($("durSel").value));
  const body = { prompt: kind === "video" ? withVoice(prompt) : prompt, ...commonBody(), sequence_id: $("modeSel").value === "coherent" ? getSeqId() : null };
  if (kind === "video") body.duration = Number($("durSel").value);
  const b = $("genBtn"); b.disabled = true; b.textContent = "Đang gửi…";
  try{
    const d = await api(kind === "video" ? "/v1/videos" : "/v1/images/tasks", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
    const id = d.id || d.task_id;
    tasks.set(id, { id, kind, prompt, status:d.status || "queued", progress:d.progress || 5, created_at:d.created_at || Date.now() / 1000, url:null });
    lastGen = { prompt, kind };
    renderQueue(); toast("Đã gửi yêu cầu — xem tiến độ ở Hàng đợi render");
    pollTask(id);
  }catch(e){ toast("Không gửi được: " + e.message, true); }
  finally{ b.disabled = false; b.textContent = "✦ Tạo ngay"; }
}
$("genBtn").onclick = generate;
$("prompt").addEventListener("keydown", e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) generate(); });

/* ---------- thư viện ---------- */
async function loadMedia(){
  try{
    const items = ((await api("/admin/media")).media || []).map(m => ({ ...m, url: abs(m.url) }));
    $("libCount").textContent = "· " + items.length + " tệp";
    const g = $("libGrid"); g.innerHTML = "";
    if (!items.length) g.innerHTML = '<div class="small muted">Chưa có tệp nào.</div>';
    for (const m of items){
      const t = document.createElement("div"); t.className = "tile";
      const th = document.createElement("div"); th.className = "thumb";
      if (m.kind === "video"){ const v = document.createElement("video"); v.src = m.url + "#t=0.6"; v.preload = "metadata"; v.muted = true; th.append(v); const p = document.createElement("div"); p.className = "play"; p.textContent = "▶"; th.append(p); }
      else { const im = document.createElement("img"); im.src = m.url; im.loading = "lazy"; im.alt = ""; th.append(im); }
      const del = document.createElement("button"); del.className = "del"; del.textContent = "✕"; del.title = "Xoá tệp";
      del.onclick = async ev => { ev.stopPropagation(); if (!confirm("Xoá tệp " + m.name + "?")) return; try{ await api("/admin/media/" + encodeURIComponent(m.name), { method:"DELETE" }); loadMedia(); }catch(e){ toast(e.message, true); } };
      th.append(del);
      const cap = document.createElement("div"); cap.className = "cap"; cap.textContent = (m.prompt || m.name) + " · " + fmtBytes(m.bytes);
      t.append(th, cap);
      if (m.kind === "video"){ const n = pick.indexOf(m.url); if (n >= 0){ t.classList.add("picked"); const bd = document.createElement("span"); bd.className = "pickno"; bd.textContent = n + 1; th.append(bd); } }
      t.onclick = () => {
        if (pickMode){ if (m.kind !== "video") return; const n = pick.indexOf(m.url); if (n >= 0) pick.splice(n, 1); else pick.push(m.url); syncPick(); loadMedia(); return; }
        if (m.prompt) lastGen = { prompt:m.prompt, kind:m.kind }; playMedia(m.url, m.kind, m.prompt || m.name, m.name);
      };
      g.append(t);
    }
  }catch{ /* thư viện không bắt buộc */ }
}
$("libRefresh").onclick = loadMedia;

/* ---------- chọn video trong thư viện để ghép (theo thứ tự bấm) ---------- */
let pickMode = false, pick = [];
function syncPick(){
  $("pickBtn").textContent = pickMode ? "✓ Xong chọn" : "☑ Chọn video để ghép";
  $("pickHint").classList.toggle("hidden", !pickMode);
  $("pickGo").classList.toggle("hidden", pick.length < 2); $("pickGo").textContent = "🎬 Ghép " + pick.length + " video";
  $("pickClear").classList.toggle("hidden", !pick.length);
}
$("pickBtn").onclick = () => { pickMode = !pickMode; syncPick(); loadMedia(); };
$("pickClear").onclick = () => { pick = []; syncPick(); loadMedia(); };
$("pickGo").onclick = () => makeFilm(pick.slice(), "phim-tu-chon");

/* ---------- ghép phim ngay trong trình duyệt ----------
   Phát lần lượt từng cảnh lên một khung vẽ, ghi hình + tiếng bằng MediaRecorder → 1 file MP4 (Chrome/Edge mới) hoặc WebM.
   Không cần cài gì thêm; thời gian ghép bằng tổng độ dài phim (60 giây phim ≈ 1 phút). */
let filmBusy = false, filmUrl = null;
function loadClip(url){
  return new Promise((res, rej) => {
    // crossOrigin: bản web đọc video từ bộ chạy trên máy (khác địa chỉ) — cần để vẽ hình và lấy tiếng khi ghép.
    const v = document.createElement("video"); v.preload = "auto"; v.playsInline = true; if (WEB) v.crossOrigin = "anonymous"; v.src = url;
    const to = setTimeout(() => rej(new Error("Không tải được cảnh " + url.split("/").pop())), 60000);
    v.addEventListener("canplay", () => { clearTimeout(to); res(v); }, { once:true });
    v.addEventListener("error", () => { clearTimeout(to); rej(new Error("Không đọc được cảnh " + url.split("/").pop())); }, { once:true });
  });
}
function filmSay(text, pct){ $("filmStatus").textContent = text; if (pct != null) $("filmBar").style.width = Math.min(100, pct) + "%"; }
// opt.fade: mờ dần ở chỗ nối (mặc định có). opt.trim: bỏ vài khung đầu của cảnh sau — dùng cho phim nối cảnh,
// vì khung đầu cảnh sau chính là khung cuối cảnh trước (nếu giữ cả hai, hình sẽ khựng một nhịp).
async function makeFilm(urls, name, opt = {}){
  const useFade = opt.fade !== false, trim = Math.max(0, Number(opt.trim) || 0);
  const names = urls.map(mediaName);
  if (!filmBusy && names.every(Boolean) && await helperUp()) return helperFilm(names, name, useFade, trim);
  if (filmBusy){ toast("Đang ghép một phim khác — đợi xong đã.", true); return; }
  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream){ toast("Trình duyệt này không ghép phim được. Dùng Chrome hoặc Edge bản mới.", true); return; }
  const mime = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"].find(m => MediaRecorder.isTypeSupported(m));
  const ext = mime.startsWith("video/mp4") ? "mp4" : "webm";
  const ac = new (window.AudioContext || window.webkitAudioContext)(); ac.resume(); // tạo ngay khi bấm để được phép phát tiếng
  filmBusy = true;
  const card = $("filmCard"); card.classList.remove("hidden"); $("filmResult").classList.add("hidden"); $("filmProg").classList.remove("hidden");
  card.scrollIntoView({ behavior:"smooth", block:"center" });
  if (filmUrl){ URL.revokeObjectURL(filmUrl); filmUrl = null; }
  filmSay("Đang tải " + urls.length + " cảnh…", 0);
  try{
    const clips = [];
    for (let i = 0; i < urls.length; i++){ filmSay("Đang tải cảnh " + (i + 1) + "/" + urls.length + "…", 0); clips.push(await loadClip(urls[i])); }
    const lenOf = (v, i) => (isFinite(v.duration) ? v.duration : 10) - (i > 0 ? trim : 0);
    const total = clips.reduce((s, v, i) => s + lenOf(v, i), 0);
    // Khung phim theo cảnh đầu: dọc → 720×1280, ngang → 1280×720, vuông → 1024×1024; cảnh khác cỡ được thu vừa khung.
    const r0 = clips[0].videoWidth / clips[0].videoHeight;
    const [W, H] = r0 < 0.8 ? [720, 1280] : r0 > 1.25 ? [1280, 720] : [1024, 1024];
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H; const g = cv.getContext("2d");
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    const dest = ac.createMediaStreamDestination();
    const stream = new MediaStream([...cv.captureStream(30).getVideoTracks(), ...dest.stream.getAudioTracks()]);
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_500_000, audioBitsPerSecond: 160_000 });
    const chunks = []; rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    const stopped = new Promise(r => { rec.onstop = r; });
    rec.start(1000);
    let before = 0;
    // Chuyển cảnh mờ dần: đầu mỗi cảnh, khung cuối của cảnh trước mờ dần trên cảnh mới (không làm phim dài thêm).
    const FADE = 0.6, prev = document.createElement("canvas"); prev.width = W; prev.height = H;
    for (let i = 0; i < clips.length; i++){
      const v = clips[i], src = ac.createMediaElementSource(v); src.connect(dest);
      const s = Math.min(W / v.videoWidth, H / v.videoHeight), dw = v.videoWidth * s, dh = v.videoHeight * s;
      if (i > 0){ const pg = prev.getContext("2d"); pg.clearRect(0, 0, W, H); pg.drawImage(cv, 0, 0); }
      const start = i > 0 ? trim : 0;
      if (start){ v.currentTime = start; await new Promise(r => v.addEventListener("seeked", r, { once:true })); }
      let raf = 0;
      const draw = () => {
        g.fillRect(0, 0, W, H); g.drawImage(v, (W - dw) / 2, (H - dh) / 2, dw, dh);
        const t = v.currentTime - start;
        if (useFade && i > 0 && t < FADE){ g.globalAlpha = 1 - t / FADE; g.drawImage(prev, 0, 0); g.globalAlpha = 1; }
        filmSay("Đang ghép cảnh " + (i + 1) + "/" + clips.length + " — giữ nguyên tab này, đừng chuyển tab hay thu nhỏ trình duyệt", (before + t) / total * 100);
        raf = requestAnimationFrame(draw);
      };
      const ended = new Promise(r => v.addEventListener("ended", r, { once:true }));
      await v.play(); draw(); await ended;
      cancelAnimationFrame(raf); src.disconnect();
      before += lenOf(v, i);
    }
    rec.stop(); await stopped; stream.getTracks().forEach(t => t.stop()); ac.close();
    const blob = new Blob(chunks, { type: mime.split(";")[0] });
    filmUrl = URL.createObjectURL(blob);
    const d0 = new Date(), p2 = n => String(n).padStart(2, "0"); // giờ máy (giờ Việt Nam), không dùng giờ quốc tế
    const fname = name + "-" + d0.getFullYear() + p2(d0.getMonth() + 1) + p2(d0.getDate()) + "-" + p2(d0.getHours()) + p2(d0.getMinutes()) + "." + ext;
    showFilm(filmUrl, fname, clips.length + " cảnh · " + Math.round(total) + " giây · " + W + "×" + H + " · " + fmtBytes(blob.size) + " · " + ext.toUpperCase());
    toast("🎬 Đã ghép xong phim " + Math.round(total) + " giây. Bấm ⬇ Tải phim về máy để lưu.");
  }catch(e){
    filmSay("Ghép phim lỗi: " + e.message, 0); toast("Ghép phim lỗi: " + e.message, true);
    try{ ac.close(); }catch{}
  }finally{ filmBusy = false; }
}
// Ghép bằng ffmpeg trên máy (bộ ghép chạy ngầm): vài giây, không phụ thuộc tab, phim lưu sẵn ở C:\muse2api-test\phim.
async function helperFilm(names, name, fade, trim){
  filmBusy = true;
  const card = $("filmCard"); card.classList.remove("hidden"); $("filmResult").classList.add("hidden"); $("filmProg").classList.remove("hidden");
  if (!document.hidden) card.scrollIntoView({ behavior:"smooth", block:"center" });
  if (filmUrl){ URL.revokeObjectURL(filmUrl); filmUrl = null; }
  filmSay("Đang ghép " + names.length + " cảnh bằng ffmpeg trên máy bạn (vài giây, ẩn tab vẫn chạy)…", 40);
  try{
    const d = await helperJson(await fetch(HELPER + "/ghep", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ names, trim, fade, name }) }));
    filmSay("Đang tải phim vào trang…", 90);
    const blob = await (await fetch(d.url)).blob();
    filmUrl = URL.createObjectURL(blob);
    showFilm(filmUrl, d.name, names.length + " cảnh · " + Math.round(d.seconds) + " giây · " + d.width + "×" + d.height + " · " + fmtBytes(d.bytes) + " · đã lưu sẵn: " + d.file);
    toast("🎬 Đã ghép xong phim " + Math.round(d.seconds) + " giây — đã lưu ở " + d.file);
  }catch(e){
    filmSay("Ghép phim lỗi: " + e.message, 0); toast("Ghép phim lỗi: " + e.message, true);
    throw e;
  }finally{ filmBusy = false; }
}
$("filmClose").onclick = () => { $("filmCard").classList.add("hidden"); $("filmVideo").pause(); };

/* ---------- hàng loạt ---------- */
// Nhận cả kịch bản CANH / THOAI: mỗi cảnh thành 1 prompt, lời thoại ghép vào để model video nói tiếng Việt.
function batchParts(){
  const raw = $("batchPrompts").value.replace(/\r/g, "");
  if (!/^\s*CANH\s*:/im.test(raw)) return raw.split("\n").map(x => x.trim()).filter(Boolean).slice(0, 500);
  const out = [];
  for (const block of raw.split(/\n\s*\n/)){
    let shot = ""; const says = [];
    for (const ln of block.split("\n")){
      const t = ln.trim();
      if (/^CANH\s*:/i.test(t)) shot = t.replace(/^CANH\s*:\s*/i, "");
      else if (/^THOAI\s*:/i.test(t)){ const rest = t.replace(/^THOAI\s*:\s*/i, ""), i = rest.indexOf(":"); if (i > 0) says.push({ who: rest.slice(0, i).trim(), text: rest.slice(i + 1).trim() }); }
    }
    if (shot) out.push(shot + dialogueText(says));
  }
  return out.slice(0, 500);
}
$("batchPrompts").oninput = () => { const n = batchParts().length; $("batchCount").textContent = n + " prompt" + (/^\s*CANH\s*:/im.test($("batchPrompts").value) ? " (đọc từ kịch bản CANH/THOAI)" : ""); };
$("batchFile").onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try{
    if (/\.txt$/i.test(f.name)) $("batchPrompts").value = (await f.text()).replace(/^\uFEFF/, "");
    else { const d = await api("/v1/batches/import", { method:"POST", headers:{ "X-Filename": encodeURIComponent(f.name) }, body: await f.arrayBuffer() }); $("batchPrompts").value = (d.prompts || []).join("\n"); }
    $("batchPrompts").oninput();
  }catch(err){ toast("Không đọc được file: " + err.message, true); }
  e.target.value = "";
};
function syncConc(){ const locked = !!$("accountSel").value || $("modeSel").value === "coherent"; if (locked) $("concSel").value = "1"; $("concSel").disabled = locked; }
/* ---------- phim nối cảnh liền mạch ----------
   Tạo lần lượt từng cảnh; cảnh sau nhận khung hình cuối của cảnh trước làm "Khung đầu" (first_frame),
   cùng ảnh nhân vật. Xong thì tự ghép thành phim, nối cắt liền và bỏ khung trùng ở chỗ nối. */
// Hẹn giờ chạy nền (worker): tab bị ẩn vẫn theo dõi tiến độ đều đặn. Không tạo được worker thì dùng setTimeout.
const bgTimer = (() => {
  try{
    const src = WEB ? "/js/muse-timer.js" : URL.createObjectURL(new Blob(["onmessage=e=>{setTimeout(()=>postMessage(e.data),e.data.ms)}"], { type:"text/javascript" }));
    const w = new Worker(src), waits = new Map(); let n = 0;
    w.onmessage = e => { const r = waits.get(e.data.id); if (r){ waits.delete(e.data.id); r(); } };
    return ms => new Promise(r => { const id = ++n; waits.set(id, r); w.postMessage({ id, ms }); });
  }catch{ return null; }
})();
const sleep = ms => bgTimer ? bgTimer(ms) : new Promise(r => setTimeout(r, ms));

/* ---------- bộ ghép phim chạy ngầm trên máy (muse-helper.ps1, ffmpeg) ----------
   File bấm 1 lần tự bật nó ở http://localhost:18622. Có nó thì ghép phim và lấy khung cuối bằng ffmpeg:
   nhanh, nét, và chạy bình thường kể cả khi tab bị ẩn. Không có thì dùng cách cũ trong trình duyệt. */
const HELPER = "http://localhost:18622";
async function helperUp(){
  try{ const r = await fetch(HELPER + "/health", { signal: AbortSignal.timeout(2500) }); return r.ok && !!(await r.json()).ffmpeg; }catch{ return false; }
}
const mediaName = u => { const m = /\/v1\/media\/([A-Za-z0-9_.-]+\.mp4)(?:$|[?#])/.exec(String(u || "")); return m ? m[1] : null; };
async function helperJson(r){ let d = {}; try{ d = await r.json(); }catch{} if (!r.ok) throw new Error(d.error || "Bộ ghép phim báo lỗi (" + r.status + ")"); return d; }
// Lấy khung hình cuối của một cảnh. Tab bị ẩn/thu nhỏ thì Chrome có thể không tải video "chạy ngầm",
// nên: gắn video (ẩn) vào trang, thử lại tối đa 3 lần, từ lần 2 tải cả file về rồi đọc tại chỗ (không phụ thuộc mạng/tab).
function grabFrame(src, ms){
  return new Promise((res, rej) => {
    const v = document.createElement("video"); v.muted = true; v.playsInline = true; v.preload = "auto";
    if (WEB && !src.startsWith("blob:")) v.crossOrigin = "anonymous";
    v.style.cssText = "position:fixed;left:-10px;top:-10px;width:2px;height:2px;opacity:0;pointer-events:none";
    const done = (fn, x) => { clearTimeout(to); v.remove(); fn(x); };
    const to = setTimeout(() => done(rej, new Error("Hết thời gian lấy khung cuối của cảnh")), ms);
    v.addEventListener("loadedmetadata", () => { v.currentTime = Math.max(0, v.duration - 0.05); }, { once:true });
    v.addEventListener("seeked", () => {
      try{
        const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext("2d").drawImage(v, 0, 0);
        done(res, c.toDataURL("image/jpeg", 0.92));
      }catch{ done(rej, new Error("Không đọc được khung cuối của cảnh")); }
    }, { once:true });
    v.addEventListener("error", () => done(rej, new Error("Không đọc được cảnh để lấy khung cuối")), { once:true });
    document.body.append(v); v.src = src; v.load();
  });
}
async function lastFrame(url){
  const name = mediaName(url);
  if (name && await helperUp()){
    try{
      const blob = await (await fetch(HELPER + "/frame?name=" + encodeURIComponent(name))).blob();
      if (blob.type === "image/jpeg" && blob.size > 1000) return await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(blob); });
    }catch{ /* thử cách trong trình duyệt */ }
  }
  let err;
  for (let attempt = 1; attempt <= 3; attempt++){
    let blobUrl = null;
    try{
      if (attempt === 1) return await grabFrame(url, 30000);
      blobUrl = URL.createObjectURL(await (await fetch(url)).blob());
      return await grabFrame(blobUrl, 45000);
    }catch(e){ err = e; await sleep(2000); }
    finally{ if (blobUrl) URL.revokeObjectURL(blobUrl); }
  }
  throw err;
}
async function waitTask(id, prompt){
  for (;;){
    await sleep(4000);
    let d; try{ d = await api("/v1/videos/" + id); }catch{ continue; }
    tasks.set(id, { id, kind:"video", prompt, status:d.status, progress:d.progress, error:d.error || null, elapsed:d.elapsed, url:taskUrl(d), result:d.result, created_at:d.created_at || Date.now() / 1000 });
    renderQueue();
    if (d.status === "completed") return taskUrl(d);
    if (["failed", "cancelled", "interrupted"].includes(d.status)) throw new Error(viErr(d.error) || "Tạo cảnh thất bại");
  }
}
let chainBusy = false;
function chainSay(lines){ const b = $("chainBox"); b.classList.remove("hidden"); b.innerHTML = lines.map(l => `<div class="bitem">${l}</div>`).join(""); }
// Tiêu đề tab báo trạng thái — nhìn được cả khi đang ở tab khác.
const TITLE0 = document.title;
const tabTitle = s => { document.title = s ? s + " · " + TITLE0 : TITLE0; };
document.addEventListener("visibilitychange", () => { if (!document.hidden && !chainBusy && /^(✅|⚠)/.test(document.title)) setTimeout(() => tabTitle(""), 4000); });
// resume: { urls } — các cảnh đã xong của lần chạy trước; chạy tiếp từ cảnh kế tiếp, không làm lại từ đầu.
async function runChain(prompts, resume, opt = {}){
  if (chainBusy){ toast("Đang làm một phim nối cảnh khác — đợi xong đã.", true); return; }
  if (kind !== "video"){ toast("Nối cảnh liền mạch chỉ dùng cho Video.", true); return; }
  chainBusy = true; $("batchBtn").disabled = true;
  const base = refsPayload();
  const baseImgs = base.reference_images.slice(0, 7), baseRoles = base.reference_roles.slice(0, 7).map(r => r === "first_frame" ? "reference" : r);
  const note = $("modeSel").value === "coherent" ? String($("continuity").value || "").trim() : "";
  const urls = resume ? resume.urls.slice() : [];
  const rows = prompts.map((p, i) => `<span class="muted">#${i + 1}</span><span class="p" title="${esc(p)}">${esc(p)}</span>${chip(i < urls.length ? "completed" : "queued")}`);
  const head = "<b>" + (opt.label || "🎞 Phim nối cảnh") + " — giữ tab này mở trên màn hình cho tới khi xong</b>";
  const mark = (i, st, extra) => { rows[i] = rows[i].replace(/<span class="chip[^]*$/, chip(st)) + (extra || ""); chainSay([head, ...rows]); };
  chainSay([head, ...rows]);
  let frame = null, i = urls.length;
  try{
    if (urls.length){ mark(i, "running", ' <span class="small muted">đang lấy khung cuối của cảnh trước…</span>'); frame = await lastFrame(urls[urls.length - 1]); }
    for (; i < prompts.length; i++){
      tabTitle("⏳ Cảnh " + (i + 1) + "/" + prompts.length);
      const prompt = (frame ? "Continue seamlessly from the first-frame image (the exact last frame of the previous shot), same place, light and camera. " : "") + withVoice(prompts[i]) + (note ? " " + note : "");
      let url = null;
      for (let attempt = 1; attempt <= 3 && !url; attempt++){
        mark(i, "running", attempt > 1 ? ` <span class="small muted">thử lại lần ${attempt}</span>` : "");
        try{
          const body = { prompt, ...commonBody(), generation_mode: "independent", continuity_notes: "", sequence_id: null, duration: opt.durs ? opt.durs[i] : Math.min(10, Number($("durSel").value)),
            reference_images: frame ? [...baseImgs, frame] : baseImgs, reference_roles: frame ? [...baseRoles, "first_frame"] : baseRoles, reference_files: base.reference_files };
          const d = await api("/v1/videos", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
          url = await waitTask(d.id || d.task_id, prompts[i]);
        }catch(e){ if (attempt === 3) throw new Error("Cảnh " + (i + 1) + ": " + e.message); }
      }
      urls.push(url); mark(i, "completed");
      if (i + 1 < prompts.length){ mark(i + 1, "running", ' <span class="small muted">đang lấy khung cuối của cảnh trước…</span>'); frame = await lastFrame(url); mark(i + 1, "queued"); }
    }
    loadMedia();
    tabTitle("🎬 Đang ghép phim");
    toast("Đã tạo xong " + urls.length + " cảnh nối liền. Đang ghép thành phim…");
    await makeFilm(urls, opt.name || "phim-noi-canh", { fade: false, trim: 0.15 });
    tabTitle("✅ Phim xong");
  }catch(e){
    tabTitle("⚠ Phim dừng ở cảnh " + (urls.length + 1));
    const left = prompts.length - urls.length;
    const btns = [`<button class="btn primary" type="button" id="chainResume">▶ Chạy tiếp từ cảnh ${urls.length + 1} (còn ${left} cảnh)</button>`];
    if (urls.length >= 2) btns.push(`<button class="btn" type="button" id="chainPartial">🎬 Ghép ${urls.length} cảnh đã xong</button>`);
    chainSay(["<b>⚠ Phim nối cảnh dừng lại</b> — " + esc(e.message) + ". Các cảnh đã xong vẫn giữ nguyên.", ...rows, `<span class="row">${btns.join("")}</span>`]);
    $("chainBox").classList.add("chain-stop");
    $("chainBox").scrollIntoView({ behavior:"smooth", block:"center" });
    toast("⚠ Phim nối cảnh dừng ở cảnh " + (urls.length + 1) + ". Bấm “Chạy tiếp” để làm tiếp, không phải làm lại từ đầu.", true);
    $("chainResume").onclick = () => { $("chainBox").classList.remove("chain-stop"); runChain(prompts, { urls }, opt); };
    const pb = $("chainPartial"); if (pb) pb.onclick = () => makeFilm(urls, "phim-noi-canh", { fade: false, trim: 0.15 });
  }finally{ chainBusy = false; $("batchBtn").disabled = false; }
}
// Video dài (15/20/30 giây) từ 1 mô tả: chia đoạn nối liền, cùng nhân vật + giọng, tự ghép thành 1 video.
function longVideo(prompt, total){
  const durs = segDurs(total), n = durs.length;
  const parts = durs.map((d, i) => prompt + " This is part " + (i + 1) + " of " + n + " of ONE continuous " + total + "-second shot (" + d + " seconds): " +
    (i === 0 ? "show the beginning of the action and end mid-motion, ready to continue." : i < n - 1 ? "continue the same action naturally, the middle of the moment, end mid-motion." : "continue the same action and bring it to a natural, satisfying ending."));
  lastGen = { prompt, kind: "video" };
  toast("Video " + total + " giây = " + n + " đoạn nối liền (muse tạo tối đa 10 giây/lần). Studio tự nối và ghép thành 1 video.");
  $("batchCard").scrollIntoView({ behavior:"smooth", block:"start" });
  return runChain(parts, null, { durs, name: "video-" + total + "s", label: "🎬 Video " + total + " giây (" + n + " đoạn nối liền)" });
}
$("chainMode").checked = LS.get("muse_chain") === "1";
$("chainMode").onchange = () => LS.set("muse_chain", $("chainMode").checked ? "1" : "0");

async function startBatch(){
  const prompts = batchParts();
  if (!prompts.length){ toast("Chưa có prompt nào trong danh sách", true); return; }
  if (kind === "video" && Number($("durSel").value) > 10) toast("Hàng loạt: mỗi cảnh tối đa 10 giây (giới hạn của muse). Phim dài hơn = nhiều cảnh nối cảnh liền mạch.", true);
  if ($("chainMode").checked) return runChain(prompts);
  const body = { prompts: kind === "video" ? prompts.map(withVoice) : prompts, kind, duration: Math.min(10, Number($("durSel").value)), concurrency: Number($("concSel").value), ...commonBody() };
  // Lõi Muse2API 1.6.8: lô "Chuỗi đồng bộ" trả lại cùng một video cũ cho các cảnh sau (đã thử thật 28/10/2026).
  // Nên lô luôn chạy Độc lập; ghi chú nhân vật được ghép vào từng cảnh để vẫn giữ nhân vật (cùng ảnh tham chiếu).
  if (body.generation_mode === "coherent"){
    const note = String(body.continuity_notes || "").trim();
    if (note) body.prompts = body.prompts.map(p => p + " " + note);
    body.generation_mode = "independent"; body.continuity_notes = "";
    toast("Hàng loạt chạy chế độ Độc lập (chế độ Chuỗi đồng bộ của Muse2API bị lặp video khi chạy lô). Ghi chú nhân vật đã được ghép vào từng cảnh.");
  }
  $("batchBtn").disabled = true;
  try{ const d = await api("/v1/batches", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) }); toast("Đã chạy lô " + String(d.id).slice(0, 14) + "… — tiến độ hiện ngay bên dưới"); loadBatches(); }
  catch(e){ toast("Không chạy được lô: " + e.message, true); }
  finally{ $("batchBtn").disabled = false; }
}
$("batchBtn").onclick = startBatch;
let batchTimer = null;
async function loadBatches(){
  try{
    const list = await api("/v1/batches");
    const w = $("batchList"); w.innerHTML = ""; let anyActive = false;
    for (const b of list.slice(0, 8)){
      const items = (b.items || []).map(i => ({ ...i, url: abs(i.url) })), done = items.filter(i => i.status === "completed").length, failed = items.filter(i => i.status === "failed").length;
      const active = items.some(i => ACTIVE.includes(i.status));
      if (active && !b.paused) anyActive = true;
      const div = document.createElement("div"); div.className = "batch";
      div.innerHTML = `<div class="row"><b>${b.kind === "video" ? "🎬" : "🖼"} Lô ${esc(String(b.id).slice(6, 14))}</b>
        <span class="chip ${active ? "run" : "done"}">${b.paused ? "Tạm dừng" : active ? "Đang chạy" : "Kết thúc"}</span>
        <span class="small muted">${esc(b.account_label || "")} · ${b.generation_mode === "coherent" ? "Chuỗi đồng bộ" : "Độc lập"} · ${fmtTime(b.created_at)}</span>
        <span class="grow"></span><b>${done}/${items.length}</b>${failed ? `<span class="chip err">${failed} lỗi</span>` : ""}</div>
        <div class="bar" style="margin-top:8px"><i style="width:${items.length ? done / items.length * 100 : 0}%"></i></div>`;
      const acts = document.createElement("div"); acts.className = "row"; acts.style.marginTop = "9px";
      const mk = (label, action) => { const btn = document.createElement("button"); btn.className = "btn"; btn.textContent = label; btn.onclick = async () => { try{ await api("/v1/batches/" + b.id + "/" + action, { method:"POST" }); loadBatches(); }catch(e){ toast(e.message, true); } }; acts.append(btn); };
      if (active && !b.paused) mk("⏸ Tạm dừng", "pause");
      if (b.paused) mk("▶ Tiếp tục", "resume");
      if (active) mk("⏹ Dừng", "stop");
      if (failed) mk("↻ Tạo lại prompt lỗi", "retry-failed");
      const doneUrls = items.filter(i => i.status === "completed" && i.url).sort((x, y) => x.index - y.index).map(i => i.url);
      if (b.kind === "video" && doneUrls.length >= 2){
        const fb = document.createElement("button"); fb.className = "btn primary"; fb.textContent = "🎬 Ghép thành phim (" + doneUrls.length + " cảnh)";
        fb.onclick = () => makeFilm(doneUrls, "phim-lo-" + String(b.id).slice(6, 14));
        acts.append(fb);
      }
      if (acts.children.length) div.append(acts);
      const bi = document.createElement("div"); bi.className = "bitems";
      for (const it of items){
        const r = document.createElement("div"); r.className = "bitem";
        r.innerHTML = `<span class="muted">#${it.index}</span><span class="p" title="${esc(it.prompt)}">${esc(it.prompt)}</span>${chip(it.status)}`;
        if (it.status === "completed" && it.url){ const pb = document.createElement("button"); pb.className = "btn"; pb.textContent = "▶ Xem"; pb.onclick = () => playMedia(it.url, b.kind, it.prompt, null); r.append(pb); }
        if (it.error){ const s = document.createElement("span"); s.className = "small"; s.style.color = "var(--bad)"; s.textContent = viErr(it.error).slice(0, 90); r.append(s); }
        bi.append(r);
      }
      div.append(bi); w.append(div);
    }
    if (anyActive){ if (!batchTimer) batchTimer = setInterval(() => { loadBatches(); loadMedia(); }, 6000); }
    else if (batchTimer){ clearInterval(batchTimer); batchTimer = null; loadMedia(); }
  }catch{ /* hàng loạt không bắt buộc */ }
}

/* ---------- sáng / tối ---------- */
function applyTheme(th){ document.documentElement.dataset.theme = th; LS.set("muse_studio_theme", th); $("themeBtn").textContent = th === "dark" ? "☀️ Giao diện sáng" : "🌙 Giao diện tối"; }
applyTheme(LS.get("muse_studio_theme") === "dark" ? "dark" : "light");
$("themeBtn").onclick = () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");

/* ---------- sao chép API key (để dán vào tiện ích thêm tài khoản muse) ---------- */
async function copyKey(){
  let ok = false;
  try{ await navigator.clipboard.writeText(KEY); ok = true; }
  catch{
    const ta = document.createElement("textarea"); ta.value = KEY; ta.style.cssText = "position:fixed;left:-9999px"; document.body.append(ta); ta.select();
    try{ ok = document.execCommand("copy"); }catch{} ta.remove();
  }
  toast(ok ? "Đã sao chép API key. Mở tiện ích M trên thanh Chrome và dán (Ctrl + V) vào ô API key." : "Không tự sao chép được — dùng Chrome hoặc Edge rồi thử lại.", !ok);
}
document.querySelectorAll("[data-copykey]").forEach(b => b.onclick = copyKey);

/* ---------- menu trái: cuộn tới từng phần ---------- */
const TAB_CARD = { script: "scriptCard", create: "prompt", batch: "batchCard", library: "libCard" };
document.querySelectorAll(".nav button[data-tab]").forEach(b => b.onclick = () => {
  document.querySelectorAll(".nav button[data-tab]").forEach(x => x.classList.toggle("on", x === b));
  $(TAB_CARD[b.dataset.tab]).scrollIntoView({ behavior:"smooth", block:"start" });
  if (b.dataset.tab === "create") $("prompt").focus({ preventScroll:true });
});

async function init(){
  try{ const arr = JSON.parse(localStorage.getItem("studio_refs_v1") || "[]"); if (Array.isArray(arr)) refs = arr; }catch{}
  renderRefs(); syncConc();
  await Promise.all([loadDl(), loadServerTasks(), loadMedia(), loadBatches()]);
  setInterval(refreshStatus, 30000);
  window.addEventListener("focus", refreshStatus); // quay lại từ trang thêm tài khoản thì tự cập nhật
}
(async () => { if (await connect()) init(); })();

/* ---------- 🎬 Dự án video: Phim truyện · Quảng cáo · Affiliate · Tuyên truyền (public/js/muse-film.js) ----------
   Mỗi loại video là 1 dự án riêng, đi theo 3 bước: ① ảnh tham chiếu (nhân vật / sản phẩm) → ② kịch bản viết DỰA TRÊN
   đúng các ảnh đó (bản web: AI của khoá học xem ảnh để tả đúng ngoại hình) → ③ tạo video nối cảnh, tự ghép. */
(function videoProject(){
  const F = window.MuseFilm; if (!F) return;
  const GUI = {
    film: { hint:"Phim có câu chuyện: mở – thắt – cao trào – mở nút. Nhân vật giữ nguyên ngoại hình và giọng ở mọi cảnh.",
      idea:"Ý tưởng phim. Ví dụ: Chú sóc tinh nghịch lấy trộm hạt dẻ của bác nhím, bị phát hiện, cuối cùng biết xin lỗi và chia sẻ cho cả khu rừng." },
    ad: { hint:"2 giây đầu gây chú ý → sản phẩm là người hùng, chứng minh công dụng → cảnh sản phẩm đẹp nhất + lời kêu gọi mua.",
      idea:"Ý tưởng quảng cáo. Ví dụ: Cô gái văn phòng mệt mỏi buổi chiều, uống một ngụm trà sữa và cả buổi chiều bừng sáng." },
    affiliate: { hint:"Review chân thật quay bằng điện thoại: nỗi khổ quen thuộc → mở hộp, dùng thử → kết quả → \"link ở giỏ hàng\".",
      idea:"Ý tưởng video review. Ví dụ: Mẹ bỉm review máy hút bụi cầm tay, dọn sạch vụn bánh con làm rơi trên sofa trong 10 giây." },
    psa: { hint:"Khoảnh khắc đời thường → nguy cơ, hậu quả (nhẹ nhàng) → làm đúng → thông điệp, khẩu hiệu rõ ràng.",
      idea:"Ý tưởng tuyên truyền. Ví dụ: Bạn trẻ vừa lái xe máy vừa xem điện thoại, suýt va chạm, từ đó luôn tập trung khi lái.",
      msg:"Thông điệp cần truyền tải, người xem là ai, khẩu hiệu (nếu có). Ví dụ: An toàn giao thông cho học sinh – sinh viên; khẩu hiệu: Đã lái xe – không cầm điện thoại" },
  };
  const DESC = {
    person:"Tả nhân vật (không bắt buộc nếu đã có ảnh): tuổi, giới tính, tóc, trang phục, màu sắc, nét riêng…",
    product:"Tên + loại sản phẩm, màu, chất liệu, công dụng THẬT, giá/ưu đãi. Ví dụ: Áo khoác nỉ hồng pastel có mũ, khoá kéo bạc; ấm, nhẹ; giảm 30% hôm nay",
  };
  const MAX_CHARS = 3;
  const uid = () => Math.random().toString(36).slice(2, 9);
  const blank = (kind, name) => ({ id: uid(), kind, name: name || "", desc: "", img: null, src: "", look_en: "", lookFor: "" });
  function fresh(genre){
    const g = F.GENRES.find(x => x.key === genre) || F.GENRES[0];
    const cast = g.product ? [blank("product"), blank("person", genre === "affiliate" ? "Người review" : "")] : [blank("person")];
    return { genre: g.key, cast, idea: "", msg: "", style: g.style, scenes: g.scenes, talk: "talk", ratio: g.ratio || "16:9", film: null };
  }
  const key = g => "muse_proj_" + g;
  function load(g){
    try{ const p = JSON.parse(LS.get(key(g)) || "null"); if (p && Array.isArray(p.cast)) return Object.assign(fresh(g), p); }catch{}
    // dự án cũ (trước khi có từng mục): mang kịch bản đang có sang Phim truyện / đúng loại của nó
    const p = fresh(g);
    try{ const old = JSON.parse(LS.get("muse_film_last") || "null"); if (old && (old.genre || "film") === g){ p.film = old; } }catch{}
    return p;
  }
  function save(){ try{ LS.set(key(P.genre), JSON.stringify(P)); LS.set("muse_proj_genre", P.genre); }catch{ toast("Bộ nhớ trình duyệt đầy — ảnh tham chiếu chỉ giữ trong phiên này.", true); } }

  F.STYLES.forEach(st => { const o = document.createElement("option"); o.value = st.key; o.textContent = st.label; $("fStyle").append(o); });
  F.GENRES.forEach(g => {
    const o = document.createElement("option"); o.value = g.key; o.textContent = g.label; $("fGenre").append(o);
    const b = document.createElement("button"); b.type = "button"; b.dataset.genre = g.key; b.textContent = g.label.replace(" (review bán hàng)", ""); $("pTabs").append(b);
  });
  let P = load(LS.get("muse_proj_genre") || "film");

  /* ----- ảnh: thu nhỏ trước khi lưu (giữ bộ nhớ trình duyệt và gửi đi nhanh) ----- */
  function shrink(data, max = 1280, q = 0.88){
    return new Promise(res => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement("canvas");
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
        try{ res(c.toDataURL("image/jpeg", q)); }catch{ res(data); }
      };
      im.onerror = () => res(data); im.src = data;
    });
  }
  const readFile = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });
  const sig = d => d ? d.length + ":" + d.slice(-40) : "";

  /* ----- giao diện từng loại video ----- */
  function show(){
    const g = F.GENRES.find(x => x.key === P.genre) || F.GENRES[0], u = GUI[g.key];
    $("fGenre").value = g.key;
    $("pTitle").textContent = g.label;
    $("pHint").textContent = u.hint;
    $("pTabs").querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.genre === g.key));
    const onTab = $("pTabs").querySelector("button.on"); if (onTab) $("pTabs").scrollLeft = onTab.offsetLeft - 24; // điện thoại: tab đang chọn luôn trong tầm nhìn
    document.querySelectorAll(".nav button[data-genre]").forEach(b => b.classList.toggle("cur", b.dataset.genre === g.key));
    $("fIdea").placeholder = u.idea; $("fIdea").value = P.idea || "";
    $("fProduct").classList.toggle("hidden", !u.msg); $("fProduct").placeholder = u.msg || ""; $("fProduct").value = P.msg || "";
    $("fStyle").value = P.style; $("fScenes").value = String(P.scenes); $("fTalk").value = P.talk; $("pRatio").value = P.ratio;
    $("pCastHint").textContent = g.product ? "Làm trước tiên: ảnh SẢN PHẨM thật (chụp hoặc ảnh shop) + nhân vật. Kịch bản sẽ bám đúng các ảnh này." : "Làm trước tiên: mỗi nhân vật 1 thẻ — tải ảnh thật hoặc tả rồi bấm Tạo ảnh. Kịch bản sẽ bám đúng các ảnh này.";
    renderCast(); render();
  }
  function switchGenre(gk){
    if (gk === P.genre) return;
    save(); P = load(gk); save(); show();
  }
  $("pTabs").addEventListener("click", e => { const b = e.target.closest("button[data-genre]"); if (b) switchGenre(b.dataset.genre); });
  document.querySelectorAll(".nav button[data-genre]").forEach(b => b.addEventListener("click", () => switchGenre(b.dataset.genre)));
  $("fIdea").addEventListener("input", () => { P.idea = $("fIdea").value; save(); });
  $("fProduct").addEventListener("input", () => { P.msg = $("fProduct").value; save(); });
  $("fStyle").addEventListener("change", () => { P.style = $("fStyle").value; save(); });
  $("fScenes").addEventListener("change", () => { P.scenes = Number($("fScenes").value); save(); });
  $("fTalk").addEventListener("change", () => { P.talk = $("fTalk").value; save(); });
  $("pRatio").addEventListener("change", () => { P.ratio = $("pRatio").value; if (P.film) P.film.ratio = P.ratio; save(); });
  $("pNew").onclick = () => {
    if (!confirm("Bắt đầu dự án " + $("pTitle").textContent + " mới?\nSẽ xoá ảnh tham chiếu, ý tưởng và kịch bản của loại video này. Video đã tạo trong Thư viện vẫn giữ nguyên.")) return;
    P = fresh(P.genre); save(); show(); toast("Đã bắt đầu dự án mới.");
  };

  /* ----- bước 1: thẻ ảnh tham chiếu ----- */
  function renderCast(){
    const box = $("pCast"); box.innerHTML = "";
    P.cast.forEach(c => {
      const el = document.createElement("div"); el.className = "castc" + (c.kind === "product" ? " prod" : ""); el.dataset.id = c.id;
      const st = c.img ? (c.src === "upload" ? "✓ Ảnh thật" : "✓ Ảnh AI tạo") + (c.look_en && c.lookFor === sig(c.img) ? " · AI đã xem ảnh" : "") : "Chưa có ảnh";
      el.innerHTML = `
        <label class="castc-img" title="Bấm để tải ảnh thật">${c.img ? `<img src="${c.img}" alt="">` : `<span>${c.kind === "product" ? "📦" : "👤"}<br>Bấm để tải ảnh</span>`}<input type="file" accept="image/*" hidden data-act="file"></label>
        <div class="castc-body">
          <div class="row"><span class="chip">${c.kind === "product" ? "📦 Sản phẩm" : "👤 Nhân vật"}</span><input type="text" data-act="name" maxlength="40" placeholder="${c.kind === "product" ? "Tên sản phẩm" : "Tên nhân vật"}" value="${esc(c.name)}">${c.kind === "person" && P.cast.filter(x => x.kind === "person").length > 1 ? '<button class="btn" type="button" data-act="del" title="Bỏ thẻ này">✕</button>' : ""}</div>
          <textarea rows="2" data-act="desc" placeholder="${esc(DESC[c.kind])}">${esc(c.desc)}</textarea>
          <div class="row"><button class="btn" type="button" data-act="gen">🖼 ${c.img ? "Tạo lại ảnh" : "Tạo ảnh từ mô tả"}</button>${c.img ? '<button class="btn" type="button" data-act="clear">Bỏ ảnh</button>' : ""}<span class="small ${c.img ? "ok" : "muted"} grow">${st}</span></div>
        </div>`;
      box.append(el);
    });
    const persons = P.cast.filter(x => x.kind === "person").length;
    $("pAddChar").disabled = persons >= MAX_CHARS;
    const miss = P.cast.filter(c => !c.img).length;
    $("pGenAll").classList.toggle("hidden", !miss);
    $("pCastNote").textContent = miss ? miss + " thẻ chưa có ảnh." : "✓ Đủ ảnh tham chiếu — sang bước 2.";
    steps();
  }
  // trạng thái 3 bước: xong → dấu ✓ + đường nối màu nhấn; bước đang làm → viền màu nhấn
  function steps(){
    const st = [P.cast.length > 0 && P.cast.every(c => c.img), !!P.film, false];
    const cur = st.indexOf(false);
    document.querySelectorAll("#scriptCard .pstep").forEach((el, i) => { el.classList.toggle("done", st[i]); el.classList.toggle("cur", i === cur); });
  }
  const cardOf = el => P.cast.find(c => c.id === el.closest(".castc").dataset.id);
  $("pCast").addEventListener("input", e => {
    const c = cardOf(e.target), a = e.target.dataset.act;
    if (a === "name") c.name = e.target.value.trim();
    if (a === "desc"){ c.desc = e.target.value; if (c.src !== "upload") c.lookFor = ""; }
    save();
  });
  $("pCast").addEventListener("change", async e => {
    if (e.target.dataset.act !== "file") return;
    const c = cardOf(e.target), f = e.target.files[0]; e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")){ toast("Chọn tệp ảnh (JPG, PNG, WEBP).", true); return; }
    if (f.size > 15 * 1024 * 1024){ toast("Ảnh quá 15 MB.", true); return; }
    c.img = await shrink(fixImageDataUrl(await readFile(f))); c.src = "upload"; c.look_en = ""; c.lookFor = "";
    if (!c.name) c.name = c.kind === "product" ? f.name.replace(/\.[^.]+$/, "").slice(0, 40) : "";
    save(); renderCast(); toast("Đã gắn ảnh thật cho " + (c.name || (c.kind === "product" ? "sản phẩm" : "nhân vật")) + ".");
  });
  $("pCast").addEventListener("click", async e => {
    const b = e.target.closest("button[data-act]"); if (!b) return;
    const c = cardOf(b), a = b.dataset.act;
    if (a === "del"){ P.cast = P.cast.filter(x => x !== c); save(); renderCast(); }
    if (a === "clear"){ c.img = null; c.src = ""; c.look_en = ""; c.lookFor = ""; save(); renderCast(); }
    if (a === "gen") await genCard([c]);
  });
  $("pAddChar").onclick = () => { if (P.cast.filter(x => x.kind === "person").length < MAX_CHARS){ P.cast.push(blank("person")); save(); renderCast(); } };
  $("pGenAll").onclick = () => genCard(P.cast.filter(c => !c.img));

  // tạo 1 ảnh qua bộ chạy Muse2API (tài khoản muse của học viên) → dataURL
  async function genImage(prompt, label){
    const body = { prompt, ...commonBody(), generation_mode:"independent", continuity_notes:"", sequence_id:null, size:"1280x720", reference_images:[], reference_roles:[], reference_files:[] };
    const d = await api("/v1/images/tasks", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
    const id = d.id || d.task_id;
    for (;;){
      await sleep(4000);
      let x; try{ x = await api("/v1/images/tasks/" + id); }catch{ continue; }
      tasks.set(id, { id, kind:"image", prompt: label, status:x.status, progress:x.progress, error:x.error || null, elapsed:x.elapsed, url:taskUrl(x), result:x.result, created_at:x.created_at || Date.now() / 1000 }); renderQueue();
      if (x.status === "completed"){
        const url = taskUrl(x), blob = await (await fetch(url)).blob();
        return { url, data: await shrink(fixImageDataUrl(await readFile(blob))) };
      }
      if (["failed", "cancelled", "interrupted"].includes(x.status)) throw new Error(viErr(x.error) || "Tạo ảnh thất bại");
    }
  }
  let busy = false;
  async function genCard(list){
    if (busy){ toast("Đang tạo ảnh — đợi xong đã.", true); return false; }
    const need = list.filter(c => (c.desc || "").trim().length >= 3 || c.name);
    const bad = list.filter(c => !need.includes(c));
    if (bad.length){ toast("Hãy ghi tên hoặc tả " + (bad[0].kind === "product" ? "sản phẩm" : "nhân vật") + " trước khi tạo ảnh.", true); return false; }
    const style = (F.STYLES.find(s => s.key === P.style) || F.STYLES[0]).en;
    busy = true; $("pGenAll").disabled = true;
    try{
      for (let i = 0; i < need.length; i++){
        const c = need[i], name = c.name || (c.kind === "product" ? "Sản phẩm" : "Nhân vật " + (i + 1));
        $("pCastNote").textContent = "🖼 Đang tạo ảnh " + name + " (" + (i + 1) + "/" + need.length + ")… khoảng 30–60 giây";
        let out = null;
        for (let attempt = 1; attempt <= 2 && !out; attempt++){
          try{ out = await genImage(F.turnaround({ style_en: style }, { name, kind: c.kind, look_en: (c.desc || "").trim() || name }), "Ảnh tham chiếu " + name); }
          catch(e){ if (attempt === 2) throw new Error(name + ": " + e.message); }
        }
        c.img = out.data; c.src = "ai"; c.look_en = ""; c.lookFor = ""; if (!c.name) c.name = name;
        save(); renderCast(); playMedia(out.url, "image", "Ảnh tham chiếu: " + name, name);
      }
      toast("Đã tạo xong ảnh tham chiếu. Sang bước 2 — viết kịch bản.");
      return true;
    }catch(e){ toast("Tạo ảnh dừng: " + e.message, true); return false; }
    finally{ busy = false; $("pGenAll").disabled = false; renderCast(); }
  }

  /* ----- bước 2: kịch bản dựa trên ảnh ----- */
  const ai = CFG.ai || null;
  $("fAiNote").textContent = (WEB && ai ? "AI của khoá học xem ảnh bước 1 để tả đúng nhân vật/sản phẩm (" + (ai.unlimited ? "không giới hạn" : "còn " + ai.left + " lượt") + "), rồi " : "") +
    "Chat Muse (tài khoản muse của bạn) viết kịch bản trong khoảng 30–60 giây." + (WEB && ai ? " Muse bận thì AI khoá học viết thay." : "");
  // bản web: AI khoá học (Gemini) nhìn ảnh, tả ngoại hình bằng tiếng Anh để muse giữ đúng nhân vật/sản phẩm.
  async function describe(){
    const todo = P.cast.filter(c => c.img && c.lookFor !== sig(c.img));
    if (!todo.length || !WEB || !ai) return 0;
    const items = await Promise.all(todo.map(async c => ({ name: c.name, kind: c.kind, desc: c.desc, image: await shrink(c.img, 768, 0.82) })));
    const r = await fetch("/muse/api/describe", { method:"POST", credentials:"same-origin", headers:{ "Content-Type":"application/json", "X-CSRF-Token": CFG.csrf || "" }, body: JSON.stringify({ items }) });
    let d = {}; try{ d = await r.json(); }catch{}
    if (!r.ok) throw new Error(d.error || "AI không xem được ảnh (mã " + r.status + ").");
    if (ai && !ai.unlimited) ai.left = Math.max(0, ai.left - 1);
    todo.forEach((c, i) => { const it = (d.items || [])[i]; if (it && it.look_en){ c.look_en = it.look_en; c.lookFor = sig(c.img); } });
    save(); renderCast();
    return todo.length;
  }
  // gửi cho người viết: danh sách nhân vật/sản phẩm CỐ ĐỊNH lấy từ bước 1
  function castText(){
    return P.cast.map(c => {
      const look = c.look_en && c.lookFor === sig(c.img) ? c.look_en : "";
      return "- " + (c.kind === "product" ? "SẢN PHẨM" : "NHÂN VẬT") + " \"" + c.name + "\"" + (c.desc.trim() ? ": " + c.desc.trim() : "") +
        (look ? " | LOOK_EN (tả từ ảnh thật, chép nguyên vào look_en): " + look : c.img ? " | có ảnh tham chiếu: không tự bịa màu sắc/kiểu dáng ngoài mô tả" : "");
    }).join("\n");
  }
  const form = () => ({
    genre: P.genre, idea: $("fIdea").value.trim(), cast: castText(), castFixed: true, castNames: P.cast.filter(c => c.kind === "person").map(c => c.name).join("\n"), productName: (P.cast.find(c => c.kind === "product") || {}).name || "", product: P.genre === "psa" ? $("fProduct").value.trim() : "",
    productPhoto: P.cast.some(c => c.kind === "product" && c.img), style: P.style, scenes: P.scenes, dialogue: P.talk, ratio: P.ratio,
  });
  // kịch bản luôn dùng đúng tên + ngoại hình của bước 1 (AI có quên cũng được sửa lại ở đây)
  function enforce(film){
    film.genre = P.genre; film.ratio = P.ratio;
    const used = new Set();
    P.cast.forEach(c => {
      let ch = film.characters.find(x => !used.has(x) && x.name.toLowerCase() === c.name.toLowerCase());
      if (!ch) ch = film.characters.find(x => !used.has(x) && (x.kind === "product") === (c.kind === "product") && !P.cast.some(k => k.name.toLowerCase() === x.name.toLowerCase()));
      const look = (c.look_en && c.lookFor === sig(c.img) && c.look_en) || "";
      if (!ch){ ch = { name: c.name, look_en: look || c.desc || c.name, voice_en: c.kind === "product" ? "" : "a clear, warm, natural voice, speaks Vietnamese" }; film.characters.push(ch); }
      else if (ch.name !== c.name){
        const old = ch.name, re = new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
        film.scenes.forEach(s => { ["start_en", "action_en", "end_en", "summary_vi"].forEach(k => { s[k] = (s[k] || "").replace(re, c.name); }); s.dialogue.forEach(d => { if (d.speaker === old) d.speaker = c.name; }); });
        ch.name = c.name;
      }
      if (look) ch.look_en = look;
      if (c.kind === "product"){ ch.kind = "product"; ch.voice_en = ""; } else delete ch.kind;
      used.add(ch);
    });
    return film;
  }
  async function viaMuse(o){
    const br = F.buildBrief(o);
    const d = await api("/v1/chat/completions", { method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ model:"muse-spark", stream:false, messages:[{ role:"system", content:br.system }, { role:"user", content:br.user }] }) });
    const text = d && d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
    if (!text) throw new Error("Chat Muse không trả lời.");
    return Object.assign(F.parse(text, o), { by:"muse" });
  }
  async function viaAI(o){
    const r = await fetch("/muse/api/script", { method:"POST", credentials:"same-origin", headers:{ "Content-Type":"application/json", "X-CSRF-Token": CFG.csrf || "" }, body: JSON.stringify(o) });
    let d = {}; try{ d = await r.json(); }catch{}
    if (!r.ok) throw Object.assign(new Error(d.error || "AI đang bận (mã " + r.status + ")."), { noAi: d.noAi });
    if (ai && !ai.unlimited && typeof d.used === "number") ai.left = Math.max(0, ai.left - 1);
    return d.result;
  }
  function checkCast(){
    P.cast.forEach((c, i) => { if (!c.name) c.name = c.kind === "product" ? "Sản phẩm" : "Nhân vật " + (i + 1); });
    const names = P.cast.map(c => c.name.toLowerCase());
    if (new Set(names).size !== names.length){ toast("Mỗi thẻ ở bước 1 cần một tên khác nhau.", true); return false; }
    save(); renderCast(); return true;
  }
  $("fGo").onclick = async () => {
    P.idea = $("fIdea").value.trim(); P.msg = $("fProduct").value.trim(); save();
    if (P.idea.length < 5){ toast("Hãy viết ý tưởng trước (ít nhất vài chữ).", true); $("fIdea").focus(); return; }
    if (!checkCast()) return;
    if (!P.cast.some(c => c.img) && !confirm("Bước 1 chưa có ảnh tham chiếu nào — nhân vật sẽ khó giữ giống nhau giữa các cảnh.\n\nVẫn viết kịch bản?")) return;
    const b = $("fGo"); b.disabled = true;
    const t0 = Date.now(), tick = setInterval(() => { b.textContent = (b.dataset.phase || "Muse đang viết…") + " " + Math.round((Date.now() - t0) / 1000) + "s"; }, 1000);
    let film;
    try{
      b.dataset.phase = "AI đang xem ảnh…";
      try{ await describe(); }catch(e){ toast(e.message + " — vẫn viết kịch bản theo mô tả của bạn.", true); }
      b.dataset.phase = "Muse đang viết…";
      const o = form();
      try{ film = await viaMuse(o); toast("Chat Muse đã viết xong kịch bản " + film.scenes.length + " cảnh."); }
      catch(e1){
        if (WEB && ai){ b.dataset.phase = "AI khoá học đang viết…"; film = Object.assign(await viaAI(o), { by:"ai" }); toast("Muse bận (" + e1.message + ") — AI của khoá học đã viết xong."); }
        else throw e1;
      }
    }catch(e){ film = F.quick(form()); toast((e.message || "AI đang bận.") + " Đã dùng Trình viết nhanh để bạn có ngay khung kịch bản.", true); }
    finally{ clearInterval(tick); b.disabled = false; b.textContent = "✨ Viết kịch bản"; delete b.dataset.phase; }
    P.film = enforce(film); save(); render();
    $("fOut").scrollIntoView({ behavior:"smooth", block:"start" });
  };
  document.querySelectorAll("[data-fask]").forEach(btn => btn.onclick = async () => {
    P.idea = $("fIdea").value.trim(); save();
    if (P.idea.length < 5){ toast("Hãy viết ý tưởng trước.", true); $("fIdea").focus(); return; }
    if (!checkCast()) return;
    const br = F.buildBrief(form()), text = br.system + "\n\n=====\n\n" + br.user;
    let ok = false; try{ await navigator.clipboard.writeText(text); ok = true; }catch{}
    const w = window.open(btn.dataset.fask === "gemini" ? "https://gemini.google.com/app" : "https://chatgpt.com/", "_blank"); try{ if (w) w.opener = null; }catch{}
    toast(ok ? "Đã sao chép lệnh. Dán vào " + (btn.dataset.fask === "gemini" ? "Gemini" : "ChatGPT") + ", gửi đi, rồi sao chép câu trả lời dán vào ô bên dưới." : "Không tự sao chép được — thử lại bằng Chrome.", !ok);
  });
  $("fPasteGo").onclick = () => {
    const txt = $("fPaste").value;
    // Kịch bản CANH/THOAI lấy ở ngoài (vd Xưởng Kịch bản → Phim dài tập): đưa thẳng vào Hàng loạt nối cảnh.
    if (/^\s*CANH\s*:/im.test(txt) && !/^\s*\{/.test(txt.trim())){
      $("batchPrompts").value = txt.trim(); $("batchPrompts").dispatchEvent(new Event("input"));
      $("chainMode").checked = true; $("chainMode").dispatchEvent(new Event("change"));
      document.querySelector('#kindSeg [data-kind=video]').click(); $("fPaste").value = "";
      $("batchCard").scrollIntoView({ behavior:"smooth", block:"start" });
      toast("Đã đưa kịch bản CANH/THOAI vào Hàng loạt và bật Nối cảnh liền mạch. Nhớ điền 🎙 Giọng nhân vật rồi bấm ▶ Chạy hàng loạt.");
      return;
    }
    try{ P.film = enforce(F.parse(txt, form())); $("fPaste").value = ""; save(); render(); toast("Đã đọc kịch bản " + P.film.scenes.length + " cảnh."); }
    catch(e){ toast(e.message, true); }
  };

  function render(){
    const out = $("fOut"); out.innerHTML = "";
    const film = P.film;
    $("pRun").disabled = $("pEdit").disabled = !film;
    steps();
    $("pRunInfo").textContent = film ? film.scenes.length + " cảnh × 10 giây = video " + film.scenes.length * 10 + " giây · " + P.cast.filter(c => c.img).length + " ảnh tham chiếu" : "Viết kịch bản ở bước 2 trước.";
    if (!film) return;
    const box = document.createElement("div"); box.className = "batch";
    const hasProd = film.characters.some(c => c.kind === "product");
    box.innerHTML = `<div class="row"><b>${esc(film.title || "Video")}</b>${film.quick ? '<span class="chip wait">Trình viết nhanh</span>' : film.by === "muse" ? '<span class="chip done">Chat Muse viết</span>' : film.by === "ai" ? '<span class="chip done">AI khoá học viết</span>' : '<span class="chip done">Dán từ ngoài</span>'}<span class="grow"></span><span class="small muted">${film.scenes.length} cảnh · ${film.scenes.length * 10} giây</span></div>
      ${film.logline_vi ? `<div class="small muted" style="margin-top:6px">${esc(film.logline_vi)}</div>` : ""}
      <div class="small" style="margin-top:10px"><b>${hasProd ? "Nhân vật, sản phẩm & giọng" : "Nhân vật & giọng"} (giữ nguyên mọi cảnh):</b></div>
      ${film.characters.map(c => { const card = P.cast.find(k => k.name.toLowerCase() === c.name.toLowerCase()); const th = card && card.img ? `<img class="thumb" src="${card.img}" alt="">` : ""; return c.kind === "product" ? `<div class="small cline">${th}<span>📦 <b>${esc(c.name)}</b> — ${esc(c.look_en)}</span></div>` : `<div class="small cline">${th}<span>👤 <b>${esc(c.name)}</b> — ${esc(c.look_en)}<br><span class="muted">🎙 ${esc(c.voice_en)}</span></span></div>`; }).join("")}
      ${F.voiceNote(film).split("\n").filter(l => F.isNarrator(l.split(":")[0], film.characters)).map(l => `<div class="small cline"><span>🎙 <b>${esc(l.split(":")[0])}</b> <span class="muted">(giọng ngoài hình, cố định cả video) — ${esc(l.slice(l.indexOf(":") + 1).trim())}</span></span></div>`).join("")}
      <div class="small" style="margin-top:10px"><b>Các cảnh (mỗi cảnh mở đầu đúng chỗ cảnh trước kết thúc):</b></div>
      <div class="bitems" style="max-height:none">${film.scenes.map(c => `<div class="bitem" style="align-items:flex-start"><span class="muted">#${c.n}</span><span style="flex:1">${esc(c.summary_vi || c.action_en)}${c.dialogue.length ? `<br><span class="muted">💬 ${c.dialogue.map(d => esc(d.speaker) + ": “" + esc(d.text_vi) + "”").join(" · ")}</span>` : ""}</span></div>`).join("")}</div>
      <div class="row" style="margin-top:12px"><button class="btn" type="button" id="fCopy">📋 Sao chép kịch bản</button><span class="small muted grow">Ưng rồi thì sang bước 3 — bấm ▶ Tạo video.</span></div>`;
    out.append(box);
    $("fCopy").onclick = async () => { let ok = false; try{ await navigator.clipboard.writeText(F.toCanhThoai(film)); ok = true; }catch{} toast(ok ? "Đã sao chép kịch bản CANH/THOAI." : "Không tự sao chép được.", !ok); };
  }

  /* ----- bước 3: tạo video ----- */
  // ảnh bước 1 → ảnh tham chiếu gửi kèm mọi cảnh (thay ảnh nhân vật/sản phẩm của dự án khác, giữ ảnh/tài liệu tự thêm)
  function applyRefs(){
    refs = refs.filter(r => r.isDoc || (!r.charName && !r.fromProj && r.role !== "character"));
    P.cast.filter(c => c.img).forEach(c => refs.push({ data: c.img, role: c.kind === "product" ? "reference" : "character", name: c.name + ".jpg", charName: c.name, isProduct: c.kind === "product" && c.src === "upload", fromProj: true, isDoc: false }));
    renderRefs();
  }
  function loadBatch(){
    const film = P.film;
    LS.set("muse_film_last", JSON.stringify(film)); // nhận diện nhân vật tại từng câu thoại đọc từ đây
    applyRefs();
    $("batchPrompts").value = F.toCanhThoai(film); $("batchPrompts").dispatchEvent(new Event("input"));
    const voice = F.voiceNote(film); $("voiceNote").value = voice; $("voiceNote").dispatchEvent(new Event("input"));
    $("chainMode").checked = true; $("chainMode").dispatchEvent(new Event("change"));
    document.querySelector('#kindSeg [data-kind=video]').click();
    $("durSel").value = "10"; $("modeSel").value = "independent";
    $("sizeSel").value = P.ratio === "9:16" ? "720x1280" : P.ratio === "1:1" ? "1024x1024" : "1280x720";
    $("sizeSel").dispatchEvent(new Event("change"));
  }
  $("pEdit").onclick = () => { if (!P.film) return; loadBatch(); $("batchCard").scrollIntoView({ behavior:"smooth", block:"start" }); toast("Kịch bản đã ở Hàng loạt — sửa từng cảnh rồi bấm ▶ Chạy hàng loạt."); };
  $("pRun").onclick = () => {
    if (!P.film) return;
    if (!P.cast.some(c => c.img) && !confirm("Chưa có ảnh tham chiếu nào ở bước 1 — nhân vật/sản phẩm có thể khác nhau giữa các cảnh.\n\nVẫn tạo video?")) return;
    loadBatch();
    $("batchBtn").click();
    $("batchCard").scrollIntoView({ behavior:"smooth", block:"start" });
  };

  show();
})();
