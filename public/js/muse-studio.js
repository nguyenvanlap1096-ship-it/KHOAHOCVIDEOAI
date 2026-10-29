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
  saveRefs();
}
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
// Ảnh vừa tạo → thêm thẳng vào ảnh tham chiếu với vai trò Nhân vật (dùng cho tạo lẻ và hàng loạt).
$("charBtn").onclick = async () => {
  const b = $("charBtn"), url = b.dataset.url;
  if (refs.filter(r => !r.isDoc).length >= 8){ toast("Đã đủ 8 ảnh tham chiếu. Bỏ bớt ảnh rồi thử lại.", true); return; }
  b.disabled = true;
  try{
    const blob = await (await fetch(url)).blob();
    if (blob.size > 5 * 1024 * 1024) throw new Error("Ảnh lớn hơn 5 MB");
    const data = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
    refs.push({ data, role: "character", name: b.dataset.name, isDoc: false });
    renderRefs();
    document.querySelector("details").open = true;
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
  const body = { prompt, ...commonBody(), sequence_id: $("modeSel").value === "coherent" ? getSeqId() : null };
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
    $("filmProg").classList.add("hidden"); $("filmResult").classList.remove("hidden");
    const fv = $("filmVideo"); fv.src = filmUrl; fv.style.aspectRatio = W + "/" + H;
    const a = $("filmDl"); a.href = filmUrl; a.download = fname;
    $("filmInfo").textContent = clips.length + " cảnh · " + Math.round(total) + " giây · " + W + "×" + H + " · " + fmtBytes(blob.size) + " · " + ext.toUpperCase();
    toast("🎬 Đã ghép xong phim " + Math.round(total) + " giây. Bấm ⬇ Tải phim về máy để lưu.");
  }catch(e){
    filmSay("Ghép phim lỗi: " + e.message, 0); toast("Ghép phim lỗi: " + e.message, true);
    try{ ac.close(); }catch{}
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
      else if (/^THOAI\s*:/i.test(t)){ const rest = t.replace(/^THOAI\s*:\s*/i, ""), i = rest.indexOf(":"); if (i > 0) says.push(`${rest.slice(0, i).trim()} says in Vietnamese: "${rest.slice(i + 1).trim()}"`); }
    }
    if (shot) out.push(shot + (says.length ? " Dialogue: " + says.join(" Then ") : ""));
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
const sleep = ms => new Promise(r => setTimeout(r, ms));
function lastFrame(url){
  return new Promise((res, rej) => {
    const v = document.createElement("video"); v.muted = true; v.preload = "auto"; if (WEB) v.crossOrigin = "anonymous"; v.src = url;
    const to = setTimeout(() => rej(new Error("Hết thời gian lấy khung cuối của cảnh")), 60000);
    v.addEventListener("loadedmetadata", () => { v.currentTime = Math.max(0, v.duration - 0.05); }, { once:true });
    v.addEventListener("seeked", () => {
      clearTimeout(to);
      const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext("2d").drawImage(v, 0, 0);
      try{ res(c.toDataURL("image/jpeg", 0.92)); }catch(e){ rej(new Error("Không đọc được khung cuối của cảnh")); }
    }, { once:true });
    v.addEventListener("error", () => { clearTimeout(to); rej(new Error("Không đọc được cảnh để lấy khung cuối")); }, { once:true });
  });
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
async function runChain(prompts){
  if (chainBusy){ toast("Đang làm một phim nối cảnh khác — đợi xong đã.", true); return; }
  if (kind !== "video"){ toast("Nối cảnh liền mạch chỉ dùng cho Video.", true); return; }
  chainBusy = true; $("batchBtn").disabled = true;
  const base = refsPayload();
  const baseImgs = base.reference_images.slice(0, 7), baseRoles = base.reference_roles.slice(0, 7).map(r => r === "first_frame" ? "reference" : r);
  const note = $("modeSel").value === "coherent" ? String($("continuity").value || "").trim() : "";
  const rows = prompts.map((p, i) => `<span class="muted">#${i + 1}</span><span class="p" title="${esc(p)}">${esc(p)}</span>${chip("queued")}`);
  const mark = (i, st, extra) => { rows[i] = rows[i].replace(/<span class="chip[^]*$/, chip(st)) + (extra || ""); chainSay(["<b>🎞 Phim nối cảnh — đừng đóng hay tải lại trang cho tới khi xong</b>", ...rows]); };
  mark(0, "queued");
  const urls = []; let frame = null;
  try{
    for (let i = 0; i < prompts.length; i++){
      const prompt = (frame ? "Continue seamlessly from the first-frame reference image, which is the exact last frame of the previous shot: the same character, same place, same lighting and the same camera position at the very start, then: " : "") + prompts[i] + (note ? " " + note : "");
      let url = null;
      for (let attempt = 1; attempt <= 3 && !url; attempt++){
        mark(i, "running", attempt > 1 ? ` <span class="small muted">thử lại lần ${attempt}</span>` : "");
        try{
          const body = { prompt, ...commonBody(), generation_mode: "independent", continuity_notes: "", sequence_id: null, duration: Number($("durSel").value),
            reference_images: frame ? [...baseImgs, frame] : baseImgs, reference_roles: frame ? [...baseRoles, "first_frame"] : baseRoles, reference_files: base.reference_files };
          const d = await api("/v1/videos", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
          url = await waitTask(d.id || d.task_id, prompts[i]);
        }catch(e){ if (attempt === 3) throw new Error("Cảnh " + (i + 1) + ": " + e.message); }
      }
      urls.push(url); mark(i, "completed");
      if (i + 1 < prompts.length){ frame = await lastFrame(url); mark(i + 1, "queued"); }
    }
    loadMedia();
    toast("Đã tạo xong " + urls.length + " cảnh nối liền. Đang ghép thành phim…");
    await makeFilm(urls, "phim-noi-canh", { fade: false, trim: 0.15 });
  }catch(e){
    toast("Phim nối cảnh dừng lại: " + e.message, true);
    if (urls.length >= 2) rows.push(`<button class="btn" type="button" id="chainPartial">🎬 Ghép ${urls.length} cảnh đã xong</button>`);
    chainSay(["<b>🎞 Phim nối cảnh dừng lại</b> — " + esc(e.message), ...rows]);
    const pb = $("chainPartial"); if (pb) pb.onclick = () => makeFilm(urls, "phim-noi-canh", { fade: false, trim: 0.15 });
  }finally{ chainBusy = false; $("batchBtn").disabled = false; }
}
$("chainMode").checked = LS.get("muse_chain") === "1";
$("chainMode").onchange = () => LS.set("muse_chain", $("chainMode").checked ? "1" : "0");

async function startBatch(){
  const prompts = batchParts();
  if (!prompts.length){ toast("Chưa có prompt nào trong danh sách", true); return; }
  if ($("chainMode").checked) return runChain(prompts);
  const body = { prompts, kind, duration: Number($("durSel").value), concurrency: Number($("concSel").value), ...commonBody() };
  // Lõi Muse2API 1.6.8: lô "Chuỗi đồng bộ" trả lại cùng một video cũ cho các cảnh sau (đã thử thật 28/10/2026).
  // Nên lô luôn chạy Độc lập; ghi chú nhân vật được ghép vào từng cảnh để vẫn giữ nhân vật (cùng ảnh tham chiếu).
  if (body.generation_mode === "coherent"){
    const note = String(body.continuity_notes || "").trim();
    if (note) body.prompts = prompts.map(p => p + " " + note);
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
const TAB_CARD = { create: "prompt", batch: "batchCard", library: "libCard" };
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
