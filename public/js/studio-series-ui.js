"use strict";
/* =====================================================================
   Phim dài tập — bước 1 lên dàn ý cả bộ (nhân vật cố định, tóm tắt từng
   tập), bước 2 viết từng tập thành kịch bản CANH / THOAI dán vào Muse
   Studio. Tập sau nhận 2 cảnh cuối của tập trước để nối mạch. Mỗi bộ phim
   lưu trên trình duyệt của máy này.
   ===================================================================== */
(function(){
const X = window.XKS, S = window.StudioSeries;
const { $, h, icon, toast, download, slug, fmtDate, tc, copyText, openTab, LS, copyBtn, autoSize, autoSizeAll } = X;

const EP_COUNTS = [3,5,8,10,15,20,30], SCENE_COUNTS = [8,10,12,15];
const form = Object.assign({ genre:"family", look:"live", idea:"", cast:"", episodes:8, scenes:12 }, LS.get("xks.form.series", {}));
const saveForm = () => LS.set("xks.form.series", form);
let projects = LS.get("xks.series", []);
let cur = projects.find(p => p.id === LS.get("xks.series.cur", "")) || projects[0] || null;
let askN = 0; // tập đang nhờ Gemini / ChatGPT viết (0 = dàn ý)
let busy = false;

function persist(){
  projects = projects.slice(0, 12);
  try{ localStorage.setItem("xks.series", JSON.stringify(projects)); }
  catch{ toast("Bộ nhớ trình duyệt đã đầy. Xoá bớt các bộ phim cũ trong ô “Bộ phim của bạn”.", true); }
  LS.set("xks.series.cur", cur ? cur.id : "");
}
const lookOf = p => S.LOOKS.find(l => l.key === p.form.look) || S.LOOKS[0];
const epText = (p, n) => p.eps[n] ? S.museText(p.bible, p.eps[n]) : "";
const nextN = p => { for (let n = 1; n <= p.bible.episodes.length; n++) if (!p.eps[n]) return n; return 0; };
// Dàn ý gửi lên máy chủ: chỉ các trường cần thiết. Tập trước: chỉ 2 cảnh cuối + móc câu (giữ yêu cầu nhỏ).
const bibleOut = b => ({ title:b.title, logline_vi:b.logline_vi, style_en:b.style_en, setting_en:b.setting_en, characters:b.characters, episodes:b.episodes });
const prevOut = (p, n) => p.eps[n-1] ? { scenes: p.eps[n-1].scenes.slice(-2), cliffhanger_vi: p.eps[n-1].cliffhanger_vi } : null;

/* ---------------- gọi AI: AI khoá học → key Google riêng → Trình viết nhanh ---------------- */
async function viaAI(payload, brief, parse){
  if (X.useHouse()) return X.houseWrite("series", payload);
  return parse(await X.googleWrite(brief.system, brief.user));
}
function running(btn, label){
  busy = true; const old = btn.lastChild.textContent; btn.disabled = true; btn.lastChild.textContent = label;
  const t0 = Date.now(), timer = setInterval(() => { $("#sSummary").textContent = label + " " + tc(Date.now()-t0); }, 1000);
  return () => { busy = false; clearInterval(timer); btn.disabled = false; btn.lastChild.textContent = old; renderSummary(); };
}

async function writeBible(){
  if (busy) return;
  if ((form.idea||"").trim().length < 5){ toast("Hãy viết ý tưởng cốt truyện trước (ít nhất vài chữ).", true); $("#sIdea").focus(); return; }
  const f = { ...form }, o = { genre:f.genre, look:f.look, idea:f.idea, cast:f.cast, episodes:f.episodes, scenes:f.scenes };
  const done = bible => {
    cur = { id: Date.now().toString(36), form:f, bible, eps:{}, createdAt:Date.now() };
    projects.unshift(cur); persist(); render();
    toast("Đã lên dàn ý " + bible.episodes.length + " tập, " + bible.characters.length + " nhân vật" + (bible.quick ? " bằng Trình viết nhanh" : "") + ". Bấm “Viết tập 1”.");
  };
  if (!X.aiReady()){ done(S.quickBible(o)); return; }
  const stop = running($("#sGo"), "AI đang lên dàn ý…");
  try{ done(await viaAI({ step:"bible", ...o }, S.buildBibleBrief(o), t => S.parseBible(t, o))); }
  catch(e){ done(S.quickBible(o)); toast((e.message || "AI đang bận.") + " Đã tự lên dàn ý bằng Trình viết nhanh.", true); }
  finally{ stop(); }
}

async function writeEpisode(n, btn){
  if (busy || !cur) return;
  const p = cur, o = { ...p.form };
  if (n > 1 && !p.eps[n-1]) toast("Tập " + (n-1) + " chưa viết — tập " + n + " sẽ không nối được cảnh cuối của tập trước.");
  const done = ep => { p.eps[n] = ep; persist(); render(); toast("Đã viết xong tập " + n + " (" + ep.scenes.length + " cảnh)" + (ep.quick ? " bằng Trình viết nhanh" : "") + "."); };
  if (!X.aiReady()){ done(S.quickEpisode(o, p.bible, n)); return; }
  const stop = running(btn || $("#sGo"), "AI đang viết tập " + n + "…");
  try{
    const prev = prevOut(p, n);
    done(await viaAI({ step:"episode", genre:o.genre, look:o.look, scenes:o.scenes, episodes:o.episodes, bible:bibleOut(p.bible), n, prev },
      S.buildEpisodeBrief(o, p.bible, n, prev), t => S.parseEpisode(t, p.bible, n)));
  }catch(e){ done(S.quickEpisode(o, p.bible, n)); toast((e.message || "AI đang bận.") + " Đã tự viết tập " + n + " bằng Trình viết nhanh.", true); }
  finally{ stop(); }
}

async function ask(where, n){
  let b;
  if (!n){
    if ((form.idea||"").trim().length < 5){ toast("Hãy viết ý tưởng cốt truyện trước.", true); $("#sIdea").focus(); return; }
    b = S.buildBibleBrief(form);
  } else b = S.buildEpisodeBrief(cur.form, cur.bible, n, prevOut(cur, n));
  askN = n || 0;
  const ok = await copyText(b.system + "\n\n=====\n\n" + b.user);
  $("#sPasteBox").open = true;
  $("#sPasteLabel").textContent = askN ? "Dán kết quả tập " + askN + " vào đây" : "Dán kết quả dàn ý vào đây";
  openTab(X.ASK_URL[where]);
  toast(ok ? "Đã sao chép lệnh. Dán (Ctrl + V) vào " + (where==="gemini" ? "Gemini" : "ChatGPT") + ", gửi đi, rồi sao chép câu trả lời dán vào ô “Dán kết quả”." : "Không tự sao chép được. Thử lại bằng Chrome hoặc Edge.", !ok);
}
function readPaste(){
  const txt = $("#sPaste").value;
  try{
    if (askN && cur){
      cur.eps[askN] = S.parseEpisode(txt, cur.bible, askN); persist();
      toast("Đã đọc tập " + askN + " (" + cur.eps[askN].scenes.length + " cảnh).");
    } else {
      const bible = S.parseBible(txt, form);
      cur = { id: Date.now().toString(36), form:{ ...form }, bible, eps:{}, createdAt:Date.now() };
      projects.unshift(cur); persist();
      toast("Đã đọc dàn ý " + bible.episodes.length + " tập.");
    }
    $("#sPaste").value = ""; $("#sPasteBox").open = false; askN = 0; render();
  }catch(e){ toast(e.message, true); }
}

/* ---------------- hiển thị ---------------- */
function card(title, sub, actions, ...body){
  return h("article",{class:"res-card"},
    h("header",{class:"res-head"}, h("div",{class:"res-title"}, h("h3",null,title), sub ? h("div",{class:"res-sub"}, sub) : null), actions),
    h("div",{class:"res-body"}, ...body));
}
function readBox(label, text, opt={}){
  const ta = h("textarea",{class:"fld-text" + (opt.mono ? " mono" : ""),readonly:true,spellcheck:"false","aria-label":label});
  ta.value = text; requestAnimationFrame(() => autoSize(ta));
  return h("section",{class:"fld" + (opt.big ? " big" : "")},
    h("div",{class:"fld-head"}, h("span",{class:"fld-label"}, opt.icon ? h("span",{class:"fld-ico"}, opt.icon) : null, label),
      h("div",{class:"fld-acts"}, copyBtn(opt.copy || "Sao chép", () => ta.value, opt.big), ...(opt.extra || []))), ta);
}
function editBox(label, obj, key, opt={}){
  const ta = h("textarea",{class:"fld-text" + (opt.mono ? " mono" : ""),spellcheck:"false","aria-label":label});
  ta.value = obj[key] || ""; requestAnimationFrame(() => autoSize(ta));
  ta.addEventListener("input", () => { obj[key] = ta.value; autoSize(ta); persist(); });
  ta.addEventListener("change", () => render());
  return h("section",{class:"fld"},
    h("div",{class:"fld-head"}, h("span",{class:"fld-label"}, opt.icon ? h("span",{class:"fld-ico"}, opt.icon) : null, label), h("div",{class:"fld-acts"}, copyBtn("Sao chép", () => ta.value))), ta);
}

function renderSummary(){
  if (busy) return;
  $("#sSummary").textContent = cur ? Object.keys(cur.eps).length + " / " + cur.bible.episodes.length + " tập đã viết · " + cur.form.scenes + " cảnh × 10 giây mỗi tập" : "chưa có";
  $("#sAll").disabled = !cur || !Object.keys(cur.eps).length;
}

function render(){
  renderProjects(); renderSummary();
  const out = $("#sOut"); out.innerHTML = "";
  if (!cur){
    out.append(h("div",{class:"empty"},
      h("h3",null,"Ý tưởng → dàn ý cả bộ → từng tập CANH / THOAI cho Muse Studio"),
      h("p",null,"Bước 1: chọn thể loại, kiểu hình ảnh, số tập, viết ý tưởng rồi bấm Lên dàn ý cả bộ. Công cụ tạo dàn nhân vật với ngoại hình cố định và tóm tắt từng tập, tập nào cũng kết bằng móc câu."),
      h("p",null,"Bước 2: bấm Viết tập 1, 2, 3… Mỗi tập ra đúng mẫu Muse Studio (mỗi cảnh 1 dòng CANH + các dòng THOAI, mỗi cảnh 10 giây). Ngoại hình nhân vật được gắn y hệt vào mọi cảnh để giữ nhân vật xuyên suốt cả bộ, tập sau tự nối tiếp cảnh cuối của tập trước."),
      h("p",{class:"hint"},"Bên Muse Studio: dán prompt ảnh định trang vào ô Ảnh định trang nhân vật, tạo ảnh trước, rồi dán kịch bản từng tập vào tab Làm phim 1-click.")));
    return;
  }
  const p = cur, b = p.bible, lk = lookOf(p), n0 = nextN(p);

  out.append(h("article",{class:"res-card res-top"},
    h("header",{class:"res-head"},
      h("div",{class:"res-title"}, h("h2",null, b.title || "Phim dài tập"),
        h("div",{class:"res-tags"}, b.quick ? h("span",{class:"tag quick"},"Viết nhanh (không dùng AI)") : h("span",{class:"tag ai"},"AI viết"),
          h("span",{class:"tag"}, lk.label), h("span",{class:"tag"}, b.episodes.length + " tập"), h("span",{class:"tag"}, p.form.scenes + " cảnh/tập"))),
      n0 ? h("button",{class:"btn sm primary",type:"button",onclick:e=>writeEpisode(n0, e.currentTarget)}, icon("i-spark"), h("span",null,"Viết tập " + n0)) : null),
    h("div",{class:"res-body"},
      b.logline_vi ? h("p",{class:"res-note"}, "📖 " + b.logline_vi) : null,
      h("p",{class:"res-note"}, "🎬 Bên Muse Studio chọn chế độ khoá nhân vật: " + lk.muse + ". Tạo ảnh định trang trước rồi mới làm phim từng tập."),
      readBox("Prompt ảnh định trang nhân vật — dán vào ô “Ảnh định trang nhân vật”", S.castSheet(b), { icon:"🧑‍🤝‍🧑", big:true, copy:"Sao chép prompt" }),
      readBox("Casting giọng — kiểm tra lại giới tính / độ tuổi ở bảng casting của Muse", S.castingTable(b), { icon:"🎙️" }),
      editBox("Phong cách hình ảnh chung (gắn vào đầu mọi cảnh)", b, "style_en", { icon:"🎨" }))));

  out.append(card("Dàn nhân vật cố định", "Sửa ngoại hình ở đây thì mọi tập xuất ra đều đổi theo", null,
    ...b.characters.map(c => editBox(c.name + " · " + S.GENDERS[c.gender] + ", " + S.AGES[c.age] + (c.role_vi ? " — " + c.role_vi : ""), c, "look_en", { icon:"👤" }))));

  for (const e of b.episodes){
    const ep = p.eps[e.n];
    const acts = h("span",{class:"row"});
    if (ep){
      acts.append(h("button",{class:"btn sm",type:"button",onclick:()=>download(new Blob([epText(p, e.n)],{type:"text/plain;charset=utf-8"}), slug(b.title) + "-tap-" + String(e.n).padStart(2,"0") + ".txt")}, icon("i-down"), ".txt"));
      acts.append(h("button",{class:"btn sm",type:"button",onclick:ev=>writeEpisode(e.n, ev.currentTarget)}, icon("i-spark"), h("span",null,"Viết lại")));
    } else acts.append(h("button",{class:"btn sm primary",type:"button",onclick:ev=>writeEpisode(e.n, ev.currentTarget)}, icon("i-spark"), h("span",null,"Viết tập " + e.n)));
    acts.append(h("button",{class:"linkbtn",type:"button",onclick:()=>ask("gemini", e.n)},"nhờ Gemini"));
    const body = [h("p",{class:"res-note"}, e.summary_vi + (e.cliffhanger_vi ? " 🪝 " + e.cliffhanger_vi : ""))];
    if (ep){
      if (ep.quick) body.push(h("p",{class:"res-note"},"⚠️ Tập này viết bằng Trình viết nhanh (khung mẫu). Có AI thì bấm Viết lại để có thoại và hành động sát cốt truyện."));
      body.push(readBox("Kịch bản Muse Studio — dán vào tab Làm phim 1-click", epText(p, e.n), { icon:"🎬", big:true, mono:true, copy:"Sao chép kịch bản tập " + e.n }));
      body.push(h("details",{class:"paste-box"}, h("summary",null,"Xem từng cảnh bằng tiếng Việt"),
        ...ep.scenes.map(c => h("p",{class:"hint"}, h("b",null,"Cảnh " + c.n + ": "), c.shot_vi || c.shot_en, h("br"), c.lines.map(l => l.speaker + ": “" + l.text + "”").join("  ·  ")))));
    }
    out.append(card("Tập " + e.n + (e.title ? " — " + (ep && ep.title || e.title) : ""), ep ? ep.scenes.length + " cảnh · khoảng " + Math.round(ep.scenes.length * 10 / 6) / 10 + " phút" : "chưa viết", acts, ...body));
  }
  requestAnimationFrame(() => autoSizeAll(out));
}

function renderProjects(){
  const box = $("#sProjects"), sel = $("#sProject");
  box.hidden = !projects.length; sel.innerHTML = "";
  for (const p of projects) sel.append(h("option",{value:p.id}, (p.bible.title || "Phim") + " · " + Object.keys(p.eps).length + "/" + p.bible.episodes.length + " tập · " + fmtDate(p.createdAt)));
  if (cur) sel.value = cur.id;
}

function seg(el, options, value, onChange){
  el.innerHTML = "";
  for (const o of options) el.append(h("button",{ type:"button", class: o.v===value ? "on" : "", onclick:()=>onChange(o.v) }, o.l));
}
function syncForm(){
  $("#sGenreHint").textContent = (S.GENRES.find(g => g.key===form.genre) || S.GENRES[0]).guide;
  $("#sLookHint").textContent = "Bên Muse Studio dùng chế độ khoá: " + (S.LOOKS.find(l => l.key===form.look) || S.LOOKS[0]).muse;
  seg($("#sEps"), EP_COUNTS.map(n => ({ v:n, l:n + " tập" })), form.episodes, v => { form.episodes = v; saveForm(); syncForm(); });
  seg($("#sScenes"), SCENE_COUNTS.map(n => ({ v:n, l:n + " cảnh" })), form.scenes, v => { form.scenes = v; saveForm(); syncForm(); });
  $("#sKbd").textContent = X.useHouse() ? "AI miễn phí của khoá học viết · dàn ý 1 lượt, mỗi tập 1 lượt"
    : X.aiReady() ? "Dùng key Google miễn phí của bạn" : "Trình viết nhanh — ra khung ngay, miễn phí, không giới hạn";
}

(function init(){
  const fill = (sel, list, key) => { list.forEach(x => sel.append(h("option",{value:x.key}, x.label))); if (!list.some(x => x.key===form[key])) form[key] = list[0].key; sel.value = form[key]; sel.addEventListener("change", () => { form[key] = sel.value; saveForm(); syncForm(); }); };
  fill($("#sGenre"), S.GENRES, "genre"); fill($("#sLook"), S.LOOKS, "look");
  for (const [id, key] of [["sIdea","idea"],["sCast","cast"]]){ const el = $("#" + id); el.value = form[key] || ""; el.addEventListener("input", () => { form[key] = el.value; saveForm(); }); }
  $("#sForm").addEventListener("submit", e => { e.preventDefault(); writeBible(); });
  $("#sPasteGo").addEventListener("click", readPaste);
  document.addEventListener("click", e => { const b = e.target.closest("[data-sask]"); if (b) ask(b.dataset.sask, 0); });
  $("#sProject").addEventListener("change", e => { cur = projects.find(p => p.id === e.target.value) || null; persist(); render(); });
  const del = $("#sDel");
  del.addEventListener("click", () => {
    if (!cur) return;
    if (del.dataset.arm !== "1"){ del.dataset.arm = "1"; del.textContent = "Bấm lần nữa để xoá"; setTimeout(() => { del.dataset.arm = ""; del.textContent = "Xoá bộ này"; }, 3000); return; }
    projects = projects.filter(p => p !== cur); cur = projects[0] || null; persist(); render();
    del.dataset.arm = ""; del.textContent = "Xoá bộ này";
  });
  $("#sAll").addEventListener("click", () => {
    const b = cur.bible;
    const txt = [b.title, b.logline_vi, "", "ẢNH ĐỊNH TRANG NHÂN VẬT:", S.castSheet(b), "", "CASTING GIỌNG:", S.castingTable(b), "",
      ...b.episodes.filter(e => cur.eps[e.n]).map(e => "==================== TẬP " + e.n + (e.title ? " — " + e.title : "") + " ====================\n\n" + epText(cur, e.n) + "\n")].join("\n");
    download(new Blob([txt], { type:"text/plain;charset=utf-8" }), slug(b.title) + "-ca-bo.txt");
  });
  syncForm(); render();
})();
})();
