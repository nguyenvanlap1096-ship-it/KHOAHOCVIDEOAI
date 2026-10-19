"use strict";
/* =====================================================================
   Xưởng Kịch bản AI — học viên nhập ý tưởng, AI viết kịch bản video (chia
   cảnh) hoặc bộ ảnh, kèm prompt đúng cú pháp từng phần mềm để sao chép.
   Chỉ dùng cách MIỄN PHÍ: AI của khoá học (key Google gói miễn phí trên máy
   chủ) → key Google miễn phí của học viên → hoặc nhờ Gemini / ChatGPT bản
   miễn phí (sao chép lệnh, dán kết quả lại).
   ===================================================================== */
const { INDUSTRIES, PURPOSES, TARGETS, VOICES, IMAGE_PURPOSES, IMAGE_TARGETS, buildBrief, buildImageBrief, parseScript, parseImageSet } = window.StudioScripts;
const GOOGLE_BASE = "https://generativelanguage.googleapis.com/v1beta";
const GOOGLE_MODELS = ["gemini-3.5-flash", "gemini-2.5-flash"]; // thử lần lượt khi dùng key Google riêng
const ASK_URL = { gemini: "https://gemini.google.com/app", chatgpt: "https://chatgpt.com/" };

/* ---------------- tiện ích ---------------- */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
function h(tag, attrs, ...kids){
  const el = document.createElement(tag);
  if (attrs) for (const [k,v] of Object.entries(attrs)){
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) el.append(k.nodeType ? k : document.createTextNode(String(k)));
  return el;
}
function icon(id){ const s=document.createElementNS("http://www.w3.org/2000/svg","svg"); const u=document.createElementNS("http://www.w3.org/2000/svg","use"); u.setAttribute("href","#"+id); s.append(u); return s; }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
function toast(msg, err){ const t=h("div",{class:"toast"+(err?" err":"")},msg); $("#toasts").append(t); setTimeout(()=>t.remove(), err?6500:3500); }
function download(blob, name){ const a=h("a",{href:URL.createObjectURL(blob),download:name}); document.body.append(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000); }
function slug(s){ return (s||"kich-ban").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/gi,"d").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40) || "kich-ban"; }
function fmtDate(t){ const d=new Date(t); return d.toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})+" "+d.toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"}); }
function tc(ms){ const s=Math.floor(ms/1000); return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0"); }
async function copyText(t){
  try{ await navigator.clipboard.writeText(t); return true; }catch{}
  const ta = h("textarea",{style:"position:fixed;left:-9999px;top:0"}); ta.value = t; document.body.append(ta); ta.select();
  let ok = false; try{ ok = document.execCommand("copy"); }catch{}
  ta.remove(); return ok;
}
function openTab(url){
  const w = window.open(url, "_blank");
  if (!w){ toast("Trình duyệt chặn mở tab mới. Bấm biểu tượng chặn pop-up trên thanh địa chỉ và chọn Luôn cho phép.", true); return; }
  try{ w.opener = null; }catch{}
}
class UErr extends Error{}
const LS = { get(k,d){ try{ const v=localStorage.getItem(k); return v==null?d:JSON.parse(v); }catch{ return d; } }, set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} } };

/* ---------------- cấu hình ---------------- */
const BOOT = (() => { try{ return JSON.parse($("#studioBoot").textContent); }catch{ return {}; } })();
const HOUSE = BOOT.house || { enabled:false, features:["video","image"] };
const FEAT = Array.isArray(HOUSE.features) ? HOUSE.features : ["video","image"];
const featOn = v => !["video","image"].includes(v) || FEAT.includes(v);
const keys = Object.assign({ g:"" }, LS.get("xks.keys", {}));
const saveKeys = () => LS.set("xks.keys", keys);
const useHouse = () => HOUSE.enabled && !keys.g;

/* ---------------- gọi AI ---------------- */
async function readJson(r){ const txt = await r.text(); try{ return [JSON.parse(txt), txt]; }catch{ return [{}, txt]; } }
async function houseWrite(kind, form){
  let r;
  try{
    r = await fetch("/api/studio/script", { method:"POST", credentials:"same-origin", headers:{ "Content-Type":"application/json", "X-CSRF-Token": BOOT.csrf || "" }, body: JSON.stringify(Object.assign({ kind }, form)) });
  }catch{ throw new UErr("Không kết nối được tới máy chủ. Kiểm tra mạng Internet."); }
  const [j] = await readJson(r);
  if (r.status===401) throw new UErr("Phiên đăng nhập đã hết. Tải lại trang và đăng nhập lại.");
  if (!r.ok) throw new UErr(j.error || "Máy chủ báo lỗi (mã " + r.status + ").");
  if (typeof j.used === "number"){ HOUSE.used = j.used; renderKeyState(); }
  return j.result;
}
async function googleWrite(system, user){
  let lastErr;
  for (const model of GOOGLE_MODELS){
    let r;
    try{
      r = await fetch(GOOGLE_BASE + "/models/" + model + ":generateContent", { method:"POST", headers:{ "x-goog-api-key": keys.g, "Content-Type":"application/json" },
        body: JSON.stringify({ systemInstruction:{ parts:[{ text:system }] }, contents:[{ role:"user", parts:[{ text:user }] }], generationConfig:{ responseMimeType:"application/json", temperature:0.8 } }) });
    }catch{ throw new UErr("Không kết nối được tới Google. Kiểm tra mạng Internet."); }
    const [j] = await readJson(r);
    if (r.status===404){ lastErr = new UErr("Không tìm thấy model AI của Google."); continue; }
    if (!r.ok){
      const m = (j.error && j.error.message) || "";
      if (/api key/i.test(m)) throw new UErr("API key Google không đúng. Kiểm tra lại trong Cài đặt.");
      if (r.status===429) throw new UErr("Key Google miễn phí đã chạm giới hạn. Đợi 1–2 phút, hoặc bấm “Nhờ Gemini viết” / “Nhờ ChatGPT viết”.");
      throw new UErr("Google báo lỗi (mã " + r.status + "). " + m.slice(0,160));
    }
    const c = (j.candidates || [])[0];
    const text = c && c.content && (c.content.parts || []).map(p => p.text || "").join("");
    if (!text) throw new UErr("AI không trả về nội dung (có thể bị bộ lọc chặn). Thử diễn đạt lại ý tưởng.");
    return text;
  }
  throw lastErr;
}
/* ---------------- 2 loại kịch bản dùng chung một khung ---------------- */
const KINDS = {
  video: { p:"v", label:"kịch bản video", purposes:PURPOSES, targets:TARGETS, counts:[3,4,5,6,8,10], unit:"cảnh",
    defaults:{ industry:"fnb", purpose:"ads", target:"veo3", voice:"talk", idea:"", brand:"", style:"", n:5, dur:8, ratio:"9:16" },
    ratios:[{v:"9:16",l:"Dọc 9:16"},{v:"16:9",l:"Ngang 16:9"},{v:"1:1",l:"Vuông 1:1"}],
    form: s => ({ industry:s.industry, purpose:s.purpose, target:s.target, voice:s.voice, idea:s.idea, brand:s.brand, style:s.style, scenes:s.n, dur:s.dur, ratio:s.ratio }),
    brief: f => buildBrief(f), parse: parseScript, quick: f => window.StudioQuick.quickVideo(f, window.StudioScripts), items: r => r.scenes },
  image: { p:"i", label:"kịch bản ảnh", purposes:IMAGE_PURPOSES, targets:IMAGE_TARGETS, counts:[3,4,6,8,10,12], unit:"ảnh",
    defaults:{ industry:"fnb", purpose:"ads", target:"nanobanana", idea:"", brand:"", style:"", n:6, ratio:"1:1" },
    ratios:[{v:"1:1",l:"1:1"},{v:"4:5",l:"4:5"},{v:"9:16",l:"9:16"},{v:"16:9",l:"16:9"},{v:"3:4",l:"3:4"}],
    form: s => ({ industry:s.industry, purpose:s.purpose, target:s.target, idea:s.idea, brand:s.brand, style:s.style, count:s.n, ratio:s.ratio }),
    brief: f => buildImageBrief(f), parse: parseImageSet, quick: f => window.StudioQuick.quickImages(f, window.StudioScripts), items: r => r.images }
};
const ST = {};
for (const [k, K] of Object.entries(KINDS)) ST[k] = Object.assign({}, K.defaults, LS.get("xks.form." + k, {}), { current:null });
const saveForm = k => { const { current, ...f } = ST[k]; LS.set("xks.form." + k, f); };
const targetOf = (k, key) => KINDS[k].targets.find(t => t.key===(key || ST[k].target)) || KINDS[k].targets[0];

/* ---------------- đã lưu ---------------- */
let saved = LS.get("xks.saved", []);
const persistSaved = () => { saved = saved.slice(0,60); LS.set("xks.saved", saved); $("#savedCount").textContent = saved.length; };
function storeResult(kind, result, form){
  const it = { id:uid(), kind, target:form.target, title: result.title || form.idea.slice(0,60), idea:form.idea, form, result, createdAt:Date.now() };
  saved.unshift(it); persistSaved(); return it;
}
function touchSaved(it){ const i = saved.findIndex(x => x.id===it.id); if (i>=0){ saved[i] = it; persistSaved(); } }

/* ---------------- văn bản để sao chép / tải về ---------------- */
function itemText(kind, c, tg){
  if (kind === "video") return [
    "CẢNH " + String(c.n).padStart(2,"0") + (c.purpose ? " — " + c.purpose : ""),
    c.description_vi && "Mô tả: " + c.description_vi, c.camera && "Máy quay: " + c.camera,
    c.dialogue_vi && "Lời thoại: " + c.dialogue_vi, c.sound && "Âm thanh: " + c.sound,
    "\nPROMPT VIDEO (" + tg.label + "):\n" + c.video_prompt,
    c.negative_prompt && "\nNEGATIVE PROMPT:\n" + c.negative_prompt,
    c.image_prompt && "\nPROMPT ẢNH KHUNG ĐẦU:\n" + c.image_prompt
  ].filter(Boolean).join("\n");
  return [
    "ẢNH " + String(c.n).padStart(2,"0") + (c.purpose ? " — " + c.purpose : ""),
    c.description_vi && "Mô tả: " + c.description_vi, c.layout && "Bố cục: " + c.layout,
    c.text_overlay && "Chữ trên ảnh: " + c.text_overlay,
    "\nPROMPT (" + tg.label + "):\n" + c.prompt
  ].filter(Boolean).join("\n");
}
function allText(it){
  const K = KINDS[it.kind], tg = targetOf(it.kind, it.target), r = it.result;
  return [
    (it.kind==="video" ? "KỊCH BẢN VIDEO: " : "KỊCH BẢN ẢNH: ") + (r.title || it.idea),
    "Viết cho: " + tg.label, r.hook && "Hook: " + r.hook, r.concept && "Ý tưởng: " + r.concept,
    r.character && "Nhân vật / sản phẩm: " + r.character, r.palette && "Bảng màu: " + r.palette, "",
    ...K.items(r).map(c => itemText(it.kind, c, tg) + "\n"),
    r.caption_vi && "CAPTION:\n" + r.caption_vi, r.hashtags && r.hashtags.length ? r.hashtags.join(" ") : ""
  ].filter(x => x !== false && x != null).join("\n").replace(/\n{3,}/g, "\n\n");
}

/* ---------------- hiển thị kết quả ---------------- */
function copyBtn(label, getText, primary){
  return h("button",{class:"btn sm" + (primary ? " primary" : ""),type:"button",onclick:async()=>{ const ok = await copyText(typeof getText==="function" ? getText() : getText); toast(ok ? "Đã sao chép." : "Không tự sao chép được — bôi đen rồi Ctrl + C.", !ok); }}, icon("i-copy"), label);
}
// Ô chữ tự cao theo nội dung. Chỉ đo khi ô đang hiển thị (ô trong tab ẩn đo ra 0 → đo lại khi mở tab).
function autoSize(ta){
  if (!ta.offsetParent) return;
  ta.style.height = "auto";
  ta.style.height = Math.min(640, Math.max(ta.scrollHeight + 2, 64)) + "px";
}
function autoSizeAll(root){ $$("textarea.fld-text", root || document).forEach(autoSize); }
window.addEventListener("resize", () => autoSizeAll());
// Một mục của kết quả: nhãn rõ ràng + nút Sao chép riêng. Prompt là ô sửa được (sửa xong tự lưu).
function field(it, obj, key, label, opt={}){
  const val = () => opt.editable ? ta.value : String(obj[key] || "");
  let ta = null, body;
  if (opt.editable){
    ta = h("textarea",{class:"fld-text" + (opt.mono ? " mono" : ""),spellcheck:"false","aria-label":label,rows:String(Math.min(14, Math.max(3, Math.ceil(String(obj[key]||"").length / 90) + String(obj[key]||"").split("\n").length)))});
    ta.value = obj[key];
    ta.addEventListener("input", () => { obj[key] = ta.value; autoSize(ta); if (it) touchSaved(it); });
    requestAnimationFrame(() => autoSize(ta));
    body = ta;
  } else body = h("div",{class:"fld-read"}, opt.quote ? "“" + obj[key] + "”" : obj[key]);
  const acts = h("div",{class:"fld-acts"}, copyBtn(opt.big ? "Sao chép prompt" : "Sao chép", val, opt.big));
  if (opt.url) acts.append(h("button",{class:"btn sm",type:"button",onclick:async()=>{ const ok = await copyText(val()); openTab(opt.url.href); toast(ok ? "Đã sao chép. Dán (Ctrl + V) vào " + opt.url.name + "." : "Không tự sao chép được — bôi đen rồi Ctrl + C.", !ok); }}, icon("i-open"), "Sao chép & mở " + opt.url.name));
  return h("section",{class:"fld" + (opt.big ? " big" : "") + (opt.cls ? " " + opt.cls : "")},
    h("div",{class:"fld-head"}, h("span",{class:"fld-label"}, opt.icon ? h("span",{class:"fld-ico"}, opt.icon) : null, label), acts), body);
}
function renderResult(kind){
  const K = KINDS[kind], p = K.p, it = ST[kind].current, out = $("#" + p + "Out");
  out.innerHTML = "";
  $("#" + p + "CopyAll").disabled = $("#" + p + "Txt").disabled = !it;
  if (!it){
    $("#" + p + "Summary").textContent = "chưa có";
    out.append(h("div",{class:"empty"},
      h("h3",null, kind==="video" ? "Ý tưởng → kịch bản chia cảnh → prompt video chuẩn" : "Ý tưởng → bộ ảnh → prompt ảnh chuẩn"),
      h("p",null, kind==="video"
        ? "Chọn ngành, mục đích và phần mềm bạn sẽ dùng (Veo 3.1, Kling, Sora, Seedance, Grok, Hailuo, Wan). Viết ý tưởng bằng tiếng Việt rồi bấm Viết kịch bản video. Mỗi cảnh có mô tả, góc máy, lời thoại, âm thanh, prompt video đúng cú pháp phần mềm và prompt ảnh khung đầu."
        : "Chọn ngành, loại bộ ảnh và phần mềm bạn sẽ dùng (Midjourney, Nano Banana, ChatGPT, Seedream, Flux, Grok). Viết ý tưởng rồi bấm Viết kịch bản ảnh. Mỗi ảnh có vai trò, bố cục, chữ gợi ý và prompt đúng cú pháp phần mềm."),
      h("p",{class:"hint"}, (aiReady() ? "AI viết chi tiết theo ý tưởng của bạn; khi AI bận sẽ tự dùng Trình viết nhanh." : "Trình viết nhanh ra kịch bản ngay, miễn phí, không giới hạn.") + " Kết quả sửa trực tiếp được, tự lưu vào mục Đã lưu. Bấm “Sao chép & mở …” để dán thẳng vào phần mềm.")));
    return;
  }
  const tg = targetOf(kind, it.target), r = it.result, items = K.items(r);
  const tool = tg.url ? { href: tg.url, name: tg.label.split(" (")[0] } : null;
  $("#" + p + "Summary").textContent = items.length + " " + K.unit + " · prompt chuẩn " + tg.label;

  // Thẻ tổng quan
  const overview = [];
  if (r.autoIndustry){
    const ind = INDUSTRIES.find(i => i.key===r.autoIndustry);
    if (ind) overview.push(h("p",{class:"res-note"}, "💡 Ý tưởng của bạn thuộc ngành “" + ind.label + "” nên Trình viết nhanh đã dùng bối cảnh của ngành này. Lần sau chọn đúng ngành ở ô Ngành để kết quả sát hơn."));
  }
  if (r.reference_analysis) overview.push(field(it, r, "reference_analysis", "Phân tích tham chiếu", { icon:"🔍" }));
  if (r.hook) overview.push(field(it, r, "hook", "Hook mở đầu", { icon:"⚡" }));
  if (r.concept) overview.push(field(it, r, "concept", "Ý tưởng chung", { icon:"💡" }));
  if (r.palette) overview.push(field(it, r, "palette", "Bảng màu", { icon:"🎨" }));
  if (r.character) overview.push(field(it, r, "character", kind==="video" ? "Nhân vật chính — dán vào mọi cảnh để giữ đúng nhân vật" : "Nhân vật / sản phẩm cố định", { icon:"👤", editable:true }));
  out.append(h("article",{class:"res-card res-top"},
    h("header",{class:"res-head"},
      h("div",{class:"res-title"}, h("h2",null, r.title || it.idea),
        h("div",{class:"res-tags"}, r.quick ? h("span",{class:"tag quick"},"Viết nhanh (không dùng AI)") : h("span",{class:"tag ai"},"AI viết"), h("span",{class:"tag"}, tg.label), h("span",{class:"tag"}, items.length + " " + K.unit))),
      r.quick && aiReady() ? h("button",{class:"btn sm",type:"button",onclick:()=>write(kind)}, icon("i-spark"), "Viết lại bằng AI") : null),
    overview.length ? h("div",{class:"res-body"}, overview) : null));

  // Từng cảnh / từng ảnh: prompt chính đặt trên cùng, các mục khác bên dưới — mục nào cũng sao chép riêng được.
  for (const c of items){
    const fields = [];
    if (kind === "video"){
      fields.push(field(it, c, "video_prompt", "Prompt video · " + tg.label, { editable:true, big:true, url:tool, icon:"🎬" }));
      if (c.dialogue_vi) fields.push(field(it, c, "dialogue_vi", "Lời thoại / lời dẫn", { quote:true, icon:"💬", cls:"say" }));
      if (c.image_prompt) fields.push(field(it, c, "image_prompt", "Prompt ảnh khung đầu (Nano Banana / Midjourney / ChatGPT)", { editable:true, icon:"🖼️" }));
      if (c.negative_prompt) fields.push(field(it, c, "negative_prompt", "Negative prompt (những thứ cần tránh)", { editable:true, icon:"🚫" }));
    } else {
      fields.push(field(it, c, "prompt", "Prompt ảnh · " + tg.label, { editable:true, big:true, url:tool, icon:"🖼️" }));
      if (c.text_overlay) fields.push(field(it, c, "text_overlay", "Chữ trên ảnh", { quote:true, icon:"🔤", cls:"say" }));
    }
    const info = [];
    if (c.description_vi) info.push(field(it, c, "description_vi", "Mô tả cảnh", { icon:"📝" }));
    if (c.camera) info.push(field(it, c, "camera", "Máy quay", { icon:"🎥" }));
    if (c.layout) info.push(field(it, c, "layout", "Bố cục", { icon:"📐" }));
    if (c.sound) info.push(field(it, c, "sound", "Âm thanh", { icon:"🔊" }));
    out.append(h("article",{class:"res-card"},
      h("header",{class:"res-head scene"},
        h("span",{class:"res-num"}, String(c.n)),
        h("div",{class:"res-title"}, h("h3",null, (kind==="video" ? "Cảnh " : "Ảnh ") + c.n + (c.purpose ? " — " + c.purpose : "")),
          h("div",{class:"res-sub"}, kind==="video" ? (it.form.dur || r.dur || "") + " giây · khung " + it.form.ratio : "Khung " + it.form.ratio)),
        copyBtn("Sao chép cả " + K.unit, () => itemText(kind, c, tg))),
      h("div",{class:"res-body"}, fields, info.length ? h("div",{class:"res-info"}, info) : null)));
  }
  if (r.caption_vi || (r.hashtags && r.hashtags.length)){
    const cap = { text: [r.caption_vi, (r.hashtags||[]).join(" ")].filter(Boolean).join("\n\n") };
    out.append(h("article",{class:"res-card"},
      h("header",{class:"res-head"}, h("div",{class:"res-title"}, h("h3",null,"Caption đăng bài"))),
      h("div",{class:"res-body"}, field(null, cap, "text", "Caption + hashtag", { editable:true, icon:"📣" }))));
  }
  requestAnimationFrame(() => autoSizeAll(out));
}

/* ---------------- viết ---------------- */
const aiReady = () => useHouse() || !!keys.g;
// Viết trong ứng dụng: có AI (khoá học / key Google miễn phí) thì AI viết; không có AI, hết lượt hoặc AI
// đang quá tải thì Trình viết nhanh dựng kịch bản ngay — học viên luôn có kết quả hoàn chỉnh.
async function write(kind, opts={}){
  const K = KINDS[kind], p = K.p, s = ST[kind];
  if ((s.idea||"").trim().length < 5){ toast("Hãy viết ý tưởng trước (ít nhất vài chữ).", true); $("#" + p + "Idea").focus(); return; }
  const form = K.form(s);
  const finish = (result, note) => {
    s.current = storeResult(kind, result, form);
    renderResult(kind);
    toast(note || ("Đã viết xong " + K.items(result).length + " " + K.unit + ". Đã lưu vào mục Đã lưu."));
  };
  if (opts.quick || !aiReady()){ const q = K.quick(form); finish(q, "Đã viết xong " + K.items(q).length + " " + K.unit + " bằng Trình viết nhanh. Đã lưu vào mục Đã lưu."); return; }
  const btn = $("#" + p + "Go"), lbl = btn.lastChild.textContent; btn.disabled = true; btn.lastChild.textContent = "AI đang viết…";
  const t0 = Date.now(); const timer = setInterval(() => { $("#" + p + "Summary").textContent = "AI đang viết… " + tc(Date.now()-t0); }, 1000);
  try{
    let result;
    if (useHouse()) result = await houseWrite(kind, form);
    else {
      const b = K.brief(form);
      result = K.parse(await googleWrite(b.system, b.user));
    }
    finish(result);
  }catch(e){
    // AI không viết được (hết lượt, quá tải, lỗi mạng…) → vẫn ra kịch bản bằng Trình viết nhanh.
    finish(K.quick(form), (e.message || "AI đang bận.") + " Đã tự viết bằng Trình viết nhanh để bạn dùng ngay.");
  }finally{
    clearInterval(timer); btn.disabled = false; btn.lastChild.textContent = lbl;
    if (!s.current) $("#" + p + "Summary").textContent = "chưa có";
  }
}
async function askChat(kind, where){
  const K = KINDS[kind], s = ST[kind];
  if ((s.idea||"").trim().length < 5){ toast("Hãy viết ý tưởng trước.", true); $("#" + K.p + "Idea").focus(); return; }
  const b = K.brief(K.form(s));
  const ok = await copyText(b.system + "\n\n=====\n\n" + b.user);
  $("#" + K.p + "PasteBox").open = true;
  openTab(ASK_URL[where]);
  toast(ok ? "Đã sao chép lệnh. Trong " + (where==="gemini" ? "Gemini" : "ChatGPT") + " bấm Ctrl + V rồi gửi; viết xong thì sao chép câu trả lời, dán vào ô “Dán kết quả”." : "Không tự sao chép được. Thử lại bằng Chrome hoặc Edge.", !ok);
}

/* ---------------- form ---------------- */
function syncForm(kind){
  const K = KINDS[kind], p = K.p, s = ST[kind], tg = targetOf(kind);
  $("#" + p + "IndHint").textContent = (INDUSTRIES.find(i => i.key===s.industry) || INDUSTRIES[0]).guide;
  const pur = K.purposes.find(x => x.key===s.purpose);
  $("#" + p + "PurHint").textContent = pur && pur.guide ? pur.guide : "";
  $("#" + p + "TargetHint").textContent = tg.url ? "Prompt viết đúng cú pháp " + tg.label + ". Dán tại: " + tg.url.replace(/^https:\/\//,"") : "";
  seg($("#" + p + "N"), K.counts.map(n => ({ v:n, l:n + " " + K.unit })), s.n, v => { s.n = v; saveForm(kind); syncForm(kind); });
  seg($("#" + p + "Ratio"), K.ratios, s.ratio, v => { s.ratio = v; saveForm(kind); syncForm(kind); });
  if (kind === "video"){
    if (!tg.durs.includes(s.dur)) s.dur = tg.dur;
    seg($("#vDur"), tg.durs.map(d => ({ v:d, l:d + " giây" })), s.dur, v => { s.dur = v; saveForm(kind); syncForm(kind); });
  }
  $("#" + p + "Kbd").textContent = useHouse() ? "AI miễn phí của khoá học viết · 1 lượt · khoảng 10–40 giây"
    : keys.g ? "Dùng key Google miễn phí của bạn" : "Trình viết nhanh — ra kịch bản ngay, miễn phí, không giới hạn";
}
function seg(el, options, value, onChange){
  el.innerHTML = "";
  for (const o of options) el.append(h("button",{ type:"button", class: o.v===value ? "on" : "", onclick:()=>onChange(o.v) }, o.l));
}
function initForm(kind){
  const K = KINDS[kind], p = K.p, s = ST[kind];
  const fill = (sel, list, key) => { list.forEach(x => sel.append(h("option",{value:x.key}, x.label))); if (!list.some(x => x.key===s[key])) s[key] = list[0].key; sel.value = s[key]; sel.addEventListener("change", () => { s[key] = sel.value; saveForm(kind); syncForm(kind); }); };
  fill($("#" + p + "Ind"), INDUSTRIES, "industry");
  fill($("#" + p + "Pur"), K.purposes, "purpose");
  fill($("#" + p + "Target"), K.targets, "target");
  if (kind === "video") fill($("#vVoice"), VOICES, "voice");
  for (const [id, key] of [["Idea","idea"],["Brand","brand"],["Style","style"]]){
    const el = $("#" + p + id); el.value = s[key] || "";
    el.addEventListener("input", () => { s[key] = el.value; saveForm(kind); if (key==="idea") $("#" + p + "Count").textContent = el.value.length; });
  }
  $("#" + p + "Count").textContent = (s.idea||"").length;
  $("#" + p + "Form").addEventListener("submit", e => { e.preventDefault(); write(kind); });
  $("#" + p + "PasteGo").addEventListener("click", () => {
    try{
      const result = K.parse($("#" + p + "Paste").value);
      s.current = storeResult(kind, result, K.form(s)); renderResult(kind);
      $("#" + p + "Paste").value = ""; $("#" + p + "PasteBox").open = false;
      toast("Đã đọc " + K.items(result).length + " " + K.unit + ". Đã lưu vào mục Đã lưu.");
    }catch(e){ toast(e.message, true); }
  });
  $("#" + p + "CopyAll").addEventListener("click", async () => { const ok = await copyText(allText(s.current)); toast(ok ? "Đã sao chép toàn bộ." : "Không tự sao chép được.", !ok); });
  $("#" + p + "Txt").addEventListener("click", () => download(new Blob([allText(s.current)], { type:"text/plain;charset=utf-8" }), (kind==="video" ? "kich-ban-video-" : "kich-ban-anh-") + slug(s.current.title) + ".txt"));
  syncForm(kind); renderResult(kind);
}
document.addEventListener("click", e => { const b = e.target.closest("[data-ask]"); if (b) askChat(b.dataset.kind, b.dataset.ask); });

/* ---------------- đã lưu ---------------- */
function renderSaved(){
  const el = $("#savedList"); el.innerHTML = "";
  if (!saved.length){ el.append(h("div",{class:"empty"}, h("h3",null,"Chưa có kịch bản nào"), h("p",null,"Kịch bản viết xong tự lưu ở đây để mở lại, sửa và sao chép sau."))); return; }
  for (const it of saved){
    const tg = targetOf(it.kind, it.target), n = KINDS[it.kind].items(it.result).length;
    const del = h("button",{class:"btn sm danger",type:"button"},"Xoá");
    del.addEventListener("click", () => {
      if (del.dataset.arm!=="1"){ del.dataset.arm="1"; del.textContent="Bấm lần nữa để xoá"; setTimeout(()=>{ del.dataset.arm=""; del.textContent="Xoá"; },3000); return; }
      saved = saved.filter(x => x.id!==it.id); persistSaved();
      for (const k of Object.keys(ST)) if (ST[k].current && ST[k].current.id===it.id){ ST[k].current = null; renderResult(k); }
      renderSaved();
    });
    el.append(h("div",{class:"saved"},
      h("span",{class:"tag"}, it.kind==="video" ? "Video" : "Ảnh"),
      h("div",{class:"info"}, h("div",{class:"ttl"}, it.title || it.idea), h("div",{class:"sub"}, n + " " + KINDS[it.kind].unit + " · " + tg.label + " · " + fmtDate(it.createdAt))),
      h("button",{class:"btn sm primary",type:"button",onclick:()=>{ if (!featOn(it.kind)){ toast("Tính năng này đang tạm tắt.", true); return; } ST[it.kind].current = it; renderResult(it.kind); show(it.kind); }},"Mở"),
      h("button",{class:"btn sm",type:"button",onclick:()=>download(new Blob([allText(it)],{type:"text/plain;charset=utf-8"}), slug(it.title) + ".txt")}, icon("i-down"), ".txt"),
      del));
  }
}

/* ---------------- cài đặt ---------------- */
function renderKeyState(){
  const mine = keys.g ? "Google" : "";
  $("#keyDot").className = "dot " + (mine || HOUSE.enabled ? "ok" : "warn");
  $("#keyText").textContent = mine ? "Dùng key " + mine + " của bạn"
    : HOUSE.enabled ? (HOUSE.unlimited ? "AI khoá học: không giới hạn" : "AI khoá học: còn " + Math.max(0, HOUSE.quota - HOUSE.used) + " lượt")
    : "Trình viết nhanh (miễn phí)";
  const left = Math.max(0, (HOUSE.quota||0) - (HOUSE.used||0));
  $("#houseText").textContent = HOUSE.enabled
    ? (HOUSE.unlimited ? "Tài khoản quản trị: không giới hạn. Tháng này đã viết " + HOUSE.used + " kịch bản." : "Tháng này bạn còn " + left + " / " + HOUSE.quota + " lượt viết (mỗi kịch bản 1 lượt, lỗi tự hoàn). Lượt làm mới vào ngày 1 hằng tháng.")
    : HOUSE.reason==="paid" ? "AI của khoá học dành cho học viên khoá chuyên sâu. Bạn vẫn viết được ngay bằng Trình viết nhanh (miễn phí, không giới hạn)."
    : "Khoá học chưa bật AI viết kịch bản. Bạn vẫn viết được ngay bằng Trình viết nhanh (miễn phí, không giới hạn), hoặc dán key Google miễn phí của bạn bên dưới để AI viết.";
  $("#houseBar").style.width = HOUSE.enabled && !HOUSE.unlimited ? Math.min(100, Math.round(HOUSE.used / Math.max(1, HOUSE.quota) * 100)) + "%" : "0";
  for (const k of Object.keys(KINDS)) if ($("#" + KINDS[k].p + "Kbd")) syncFormKbd(k);
}
function syncFormKbd(kind){ $("#" + KINDS[kind].p + "Kbd").textContent = useHouse() ? "AI miễn phí của khoá học viết · 1 lượt · khoảng 10–40 giây" : keys.g ? "Dùng key Google miễn phí của bạn" : "Trình viết nhanh — ra kịch bản ngay, miễn phí, không giới hạn"; }
function initSettings(){
  $("#setGKey").value = keys.g;
  const msg = (t, ok) => { $("#setMsg").className = "msg " + (ok ? "ok" : "err"); $("#setMsg").textContent = t; };
  $("#setGSave").addEventListener("click", () => { keys.g = $("#setGKey").value.trim(); saveKeys(); renderKeyState(); msg(keys.g ? "Đã lưu key Google. Từ giờ AI viết bằng key của bạn." : "Đã bỏ key Google.", true); });
  $("#setDel").addEventListener("click", () => { keys.g = ""; saveKeys(); $("#setGKey").value = ""; renderKeyState(); msg("Đã xoá key khỏi máy này.", true); });
}

/* ---------------- điều hướng ---------------- */
let currentView = "video";
function show(view){
  if (!featOn(view)){ toast("Tính năng này đang tạm tắt.", true); return; }
  currentView = view;
  $$(".view").forEach(v => v.hidden = v.id !== "view-" + view);
  $$(".nav-btn").forEach(b => b.classList.toggle("on", b.dataset.view===view));
  try{ localStorage.setItem("xks.view", view); }catch{}
  if (view==="saved") renderSaved();
  requestAnimationFrame(() => autoSizeAll());
}
document.addEventListener("click", e => { const b = e.target.closest("[data-view]"); if (b) show(b.dataset.view); });

/* ---------------- sáng / tối ---------------- */
function applyTheme(t){
  document.documentElement.dataset.theme = t;
  try{ localStorage.setItem("xks.theme", t); }catch{}
  const b = $("#themeBtn"); if (b) b.lastChild.textContent = t === "dark" ? "Giao diện sáng" : "Giao diện tối";
}
document.addEventListener("click", e => { if (e.target.closest("#themeBtn")) applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"); });

(function boot(){
  let theme = "light"; try{ theme = localStorage.getItem("xks.theme") || "light"; }catch{}
  applyTheme(theme === "dark" ? "dark" : "light");
  initForm("video"); initForm("image"); initSettings();
  persistSaved(); renderKeyState();
  $$("[data-view]").forEach(b => { if (!featOn(b.dataset.view)) b.hidden = true; });
  if (BOOT.user && BOOT.user.admin && HOUSE.open === false) toast("Xưởng đang ĐÓNG với học viên — chỉ quản trị thấy trang này.", true);
  else if (BOOT.user && BOOT.user.admin && HOUSE.offFeatures && HOUSE.offFeatures.length) toast("Đang tắt với học viên: " + HOUSE.offFeatures.join(", ") + ".");
  let v = "video"; try{ v = localStorage.getItem("xks.view") || "video"; }catch{}
  if (!["video","image","saved","settings"].includes(v)) v = "video";
  if (!featOn(v)) v = ["video","image"].find(featOn) || "saved";
  show(v);
})();
