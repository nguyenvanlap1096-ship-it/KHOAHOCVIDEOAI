/* Phim dài tập — lên dàn ý cả bộ (nhân vật cố định + tóm tắt từng tập) rồi viết từng tập thành kịch bản
   CANH / THOAI (mỗi cảnh 10 giây) để dán thẳng vào ô "Làm phim 1-click" của Muse Studio hoặc tool làm phim khác.
   Dùng chung cho trình duyệt và máy chủ. Có Trình viết nhanh (không cần AI) cùng cấu trúc kết quả. */
(function (root) {
  "use strict";

  const GENRES = [
    { key:"family", label:"Gia đình / đời thường Việt", guide:"Chuyện nhà, mẹ chồng nàng dâu, anh em, hàng xóm; xung đột đời thường, cảm xúc thật, kết có hậu hoặc bài học. Bối cảnh nhà phố, chợ, quán nhỏ Việt Nam.", setting:"a contemporary small town in Vietnam: narrow tube houses, a wet market, a small family shop" },
    { key:"karma", label:"Bài học cuộc sống / nhân quả", guide:"Người tốt bị coi thường, kẻ tham lam hống hách, cú lật ngược cuối tập (vả mặt), gieo nhân nào gặt quả nấy. Mỗi tập một tình huống, cao trào rõ.", setting:"modern Vietnamese city streets, offices, restaurants and a humble countryside home" },
    { key:"fairy", label:"Cổ tích / truyền thuyết Việt", guide:"Không khí cổ tích Việt: làng quê, cây đa, giếng nước, bụt/tiên hiện lên, người hiền gặp lành, kẻ ác bị trừng phạt. Có người kể chuyện dẫn dắt.", setting:"an ancient Vietnamese village with a banyan tree, rice fields, bamboo houses and a river" },
    { key:"ancient", label:"Cổ trang / kiếm hiệp", guide:"Triều đình, giang hồ, âm mưu, báo thù, võ công; trang phục cổ, cung điện, rừng trúc, quán trọ. Thoại trang trọng kiểu cổ.", setting:"an ancient Asian imperial palace, bamboo forests, misty mountains and old inns" },
    { key:"school", label:"Học đường / thanh xuân", guide:"Lớp học, bạn thân, crush, thi cử, hiểu lầm và trưởng thành; nhịp vui tươi xen cảm động.", setting:"a Vietnamese high school with a sunny schoolyard, flame trees, classrooms and a street-side snack stall" },
    { key:"love", label:"Tình cảm / ngôn tình", guide:"Gặp gỡ định mệnh, hiểu lầm, người thứ ba, hoá giải; khoảnh khắc lãng mạn và nút thắt cảm xúc cuối tập.", setting:"stylish Vietnamese city cafés, rainy streets at night, a rooftop and a riverside" },
    { key:"comedy", label:"Hài / sitcom", guide:"Tình huống dở khóc dở cười, nhân vật tính cách đối lập, thoại nhanh, punchline cuối mỗi cảnh hoặc cuối tập.", setting:"a lively Vietnamese apartment block, a neighbourhood alley and a small café" },
    { key:"mystery", label:"Trinh thám / bí ẩn", guide:"Một vụ việc lạ, manh mối rải từng tập, nghi phạm, cú twist; không khí căng, ánh sáng tương phản.", setting:"an old Vietnamese town with foggy alleys, an antique shop and a police station" },
    { key:"spooky", label:"Tâm linh / kinh dị nhẹ", guide:"Rùng rợn vừa phải, không máu me: nhà cũ, tiếng động lạ, truyền thuyết làng, bí mật được hé lộ dần.", setting:"a remote Vietnamese village, an abandoned old house, a temple and a misty pond at night" },
    { key:"animal", label:"Thú cưng / con vật biết nói", guide:"Các con vật biết nói, mỗi con một tính cách, phiêu lưu và tình bạn, hài hước dễ thương; hợp với trẻ em và gia đình.", setting:"a colourful storybook kingdom of cats and dogs with a castle, a village and a waterfall" },
    { key:"adventure", label:"Phiêu lưu / viễn tưởng", guide:"Hành trình tìm kho báu hoặc cứu thế giới, phép thuật hoặc công nghệ tương lai, mỗi tập một chặng mới.", setting:"fantastical landscapes: floating islands, ancient ruins, neon future cities" },
    { key:"other", label:"Khác (tự mô tả trong ý tưởng)", guide:"Bám sát ý tưởng người dùng, có nhân vật rõ, mâu thuẫn, cao trào và móc nối cuối mỗi tập.", setting:"settings that match the story idea" }
  ];

  // Kiểu hình ảnh: câu phong cách tiếng Anh gắn vào mọi cảnh + chế độ khoá nhân vật nên dùng bên Muse Studio.
  const LOOKS = [
    { key:"live", label:"Người thật (điện ảnh)", style:"Photorealistic live-action cinematic drama, natural skin texture, 35mm film look, soft natural lighting, muted realistic colors", muse:"Người thật" },
    { key:"pixar", label:"Hoạt hình 3D kiểu Pixar", style:"Pixar-style 3D animated feature film, soft global illumination, expressive stylized characters, vibrant warm colors", muse:"PRO" },
    { key:"anime", label:"Anime 2D", style:"2D anime style, clean line art, cel shading, cinematic lighting, rich painted backgrounds", muse:"PRO" },
    { key:"storybook", label:"Tranh truyện cổ tích", style:"Storybook illustration style, soft watercolor textures, warm golden light, whimsical Vietnamese folk-tale atmosphere", muse:"PRO" }
  ];

  const AGES = { child:"trẻ em", teen:"thiếu niên", adult:"người lớn", elder:"lớn tuổi" };
  const GENDERS = { female:"Nữ", male:"Nam" };
  const NARRATOR = "Người kể chuyện";
  const find = (list, k) => list.find(x => x.key === k) || list[0];
  const clampN = (v, lo, hi, d) => Math.min(hi, Math.max(lo, Number(v) || d));
  const s = v => (v == null ? "" : String(v)).replace(/\s+/g, " ").trim();

  function parseJson(text) {
    const t = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    if (a < 0 || b <= a) throw new Error("AI không trả về đúng định dạng. Bấm Viết lại.");
    try { return JSON.parse(t.slice(a, b + 1)); }
    catch { try { return JSON.parse(t.slice(a, b + 1).replace(/,\s*([}\]])/g, "$1")); } catch { throw new Error("Không đọc được kết quả của AI. Bấm Viết lại."); } }
  }

  /* ===================== BƯỚC 1: DÀN Ý CẢ BỘ ===================== */
  function buildBibleBrief(o) {
    const g = find(GENRES, o.genre), lk = find(LOOKS, o.look);
    const eps = clampN(o.episodes, 2, 30, 8), scenes = clampN(o.scenes, 6, 15, 12);
    const system = `Bạn là biên kịch trưởng phim ngắn dài tập (short drama) tiếng Việt cho YouTube / TikTok / Facebook. Phim được làm bằng AI tạo video: mỗi cảnh dài 10 giây, mỗi tập ${scenes} cảnh (khoảng ${Math.round(scenes * 10 / 60 * 10) / 10} phút). Bạn lên DÀN Ý CẢ BỘ để sau đó viết từng tập mà nhân vật và mạch truyện luôn nhất quán.

QUY TẮC:
- Cả bộ có một mạch truyện lớn xuyên suốt; mỗi tập có mâu thuẫn và cao trào riêng, KẾT THÚC BẰNG MỘT MÓC CÂU (cliffhanger) khiến người xem muốn xem tập sau. Tập cuối khép lại mạch truyện.
- Tối đa 6 nhân vật chính. Tên nhân vật có tiền tố xưng hô tiếng Việt (Ông, Bà, Chú, Cô, Anh, Chị, Bé, Cậu, Vua, Hoàng hậu…) để công cụ lồng tiếng tự đoán giọng nam/nữ, già/trẻ. Có thể thêm "${NARRATOR}" nếu cần lời dẫn (không tính là nhân vật).
- look_en: mô tả ngoại hình CỐ ĐỊNH bằng tiếng Anh, 25–45 từ: tuổi, dân tộc, khuôn mặt, tóc, vóc dáng, trang phục đặc trưng có MÀU cụ thể, một món đồ nhận diện. Mô tả này sẽ được dán y hệt vào mọi cảnh nên phải rõ ràng, không mâu thuẫn, không thay đổi giữa các tập.${o.look === "live" ? "" : " Mô tả theo phong cách hình ảnh đã chọn (nhân vật hoạt hình / con vật)."}
- gender: "female" hoặc "male"; age: "child", "teen", "adult" hoặc "elder".
- style_en: 1 câu tiếng Anh về phong cách hình ảnh chung, bắt đầu bằng: "${lk.style}". setting_en: 1 câu tiếng Anh về bối cảnh chính của cả bộ.
- Tóm tắt từng tập bằng tiếng Việt, cụ thể sự việc (ai làm gì, chuyện gì xảy ra), 2–4 câu.
- Không nội dung nhạy cảm, bạo lực máu me hay xúc phạm.

ĐẦU RA: CHỈ TRẢ VỀ MỘT KHỐI JSON hợp lệ, không markdown, không giải thích:
{"title":"tên bộ phim","logline_vi":"tóm tắt cả bộ trong 1–2 câu","style_en":"…","setting_en":"…","characters":[{"name":"Bà Tư","role_vi":"vai trò & tính cách","gender":"female","age":"elder","look_en":"…"}],"episodes":[{"n":1,"title":"tên tập","summary_vi":"…","cliffhanger_vi":"móc câu cuối tập"}]}`;
    const user = [
      `THỂ LOẠI: ${g.label} — ${g.guide}`,
      `KIỂU HÌNH ẢNH: ${lk.label}`,
      `Ý TƯỞNG CỐT TRUYỆN: ${String(o.idea || "").trim()}`,
      o.cast ? `DÀN NHÂN VẬT NGƯỜI DÙNG MUỐN CÓ (giữ đúng tên và đặc điểm, bổ sung phần còn thiếu): ${String(o.cast).trim()}` : "",
      `SỐ TẬP: ${eps}`,
      `MỖI TẬP: ${scenes} cảnh × 10 giây`,
      "",
      `Lên dàn ý đủ ${eps} tập. Trả về đúng JSON.`
    ].filter(Boolean).join("\n");
    return { system, user, eps, scenes };
  }

  function normBible(j, o) {
    const lk = find(LOOKS, o && o.look);
    const characters = (Array.isArray(j.characters) ? j.characters : []).map(c => ({
      name: s(c.name).slice(0, 40), role_vi: s(c.role_vi || c.role), gender: c.gender === "male" ? "male" : "female",
      age: AGES[c.age] ? c.age : "adult", look_en: s(c.look_en || c.look)
    })).filter(c => c.name && c.name !== NARRATOR).slice(0, 8);
    const episodes = (Array.isArray(j.episodes) ? j.episodes : []).map((e, i) => ({
      n: i + 1, title: s(e.title), summary_vi: s(e.summary_vi || e.summary), cliffhanger_vi: s(e.cliffhanger_vi || e.cliffhanger)
    })).filter(e => e.summary_vi || e.title).slice(0, 30);
    if (!characters.length) throw new Error("AI chưa tạo được nhân vật. Thử viết rõ ý tưởng hơn rồi bấm Viết lại.");
    if (!episodes.length) throw new Error("AI chưa lên được tập nào. Thử viết rõ ý tưởng hơn rồi bấm Viết lại.");
    return { title: s(j.title), logline_vi: s(j.logline_vi || j.logline), style_en: s(j.style_en) || lk.style, setting_en: s(j.setting_en), characters, episodes };
  }
  function parseBible(text, o) { return normBible(parseJson(text), o); }

  /* ===================== BƯỚC 2: VIẾT TỪNG TẬP ===================== */
  function castLines(bible) {
    return bible.characters.map(c => `- ${c.name} (${GENDERS[c.gender]}, ${AGES[c.age]}): ${c.role_vi}. Ngoại hình: ${c.look_en}`).join("\n");
  }
  // prev: tập liền trước đã viết (nếu có) — gửi 2 cảnh cuối để nối mạch.
  function buildEpisodeBrief(o, bible, n, prev) {
    const scenes = clampN(o.scenes, 6, 15, 12);
    const ep = bible.episodes[n - 1] || { n, title: "", summary_vi: "", cliffhanger_vi: "" };
    const names = bible.characters.map(c => c.name);
    const tail = prev && Array.isArray(prev.scenes) ? prev.scenes.slice(-2).map(c => `• ${c.shot_vi || c.shot_en} — ${(c.lines || []).map(l => l.speaker + ": " + l.text).join(" / ")}`).join("\n") : "";
    const system = `Bạn là biên kịch và đạo diễn phim ngắn dài tập làm bằng AI tạo video. Bạn viết MỘT TẬP thành danh sách cảnh, mỗi cảnh đúng 10 giây, để dán vào công cụ làm phim tự động (mỗi cảnh: 1 mô tả hình ảnh tiếng Anh + lời thoại tiếng Việt được lồng tiếng tự động).

QUY TẮC:
- Viết đúng ${scenes} cảnh. Bám sát tóm tắt tập và giữ đúng tính cách nhân vật trong dàn ý.
- shot_en: tiếng Anh 35–70 từ, theo thứ tự: cỡ cảnh + chuyển động máy (wide / medium / close-up / over-the-shoulder; slow dolly-in, tracking, static, crane…) → nhân vật GỌI BẰNG TÊN (không tả lại ngoại hình, công cụ tự gắn mô tả cố định) → hành động cụ thể trong 10 giây → bối cảnh, thời điểm → ánh sáng, cảm xúc. Đổi cỡ cảnh liên tục giữa các cảnh cho phim có nhịp. Không chữ trên màn hình, không phụ đề.
- shot_vi: bản dịch tiếng Việt sát nghĩa của shot_en để người học hiểu.
- who: danh sách tên nhân vật XUẤT HIỆN trong khung hình (chỉ dùng đúng các tên: ${names.join(", ")}).
- lines: lời thoại tiếng Việt tự nhiên, đời thường. Mỗi cảnh 1–2 câu, TỔNG KHÔNG QUÁ 22 TỪ (nói vừa 10 giây). Người nói phải là một tên trong danh sách trên hoặc "${NARRATOR}". Cảnh nào cũng có ít nhất 1 câu.
- Cảnh 1: mở tập thật cuốn${n > 1 ? " và nối tiếp ngay móc câu của tập trước" : ""}. Cảnh cuối: móc câu dẫn sang tập sau${n >= bible.episodes.length ? " (đây là tập cuối: khép lại câu chuyện bằng một kết thúc trọn vẹn)" : ""}.
- Không nội dung nhạy cảm, không máu me.

ĐẦU RA: CHỈ TRẢ VỀ MỘT KHỐI JSON hợp lệ, không markdown, không giải thích:
{"title":"tên tập","recap_vi":"tóm tắt tập này 1–2 câu","scenes":[{"n":1,"shot_en":"…","shot_vi":"…","who":["${names[0] || "Tên"}"],"lines":[{"speaker":"${names[0] || "Tên"}","text":"…"}]}],"cliffhanger_vi":"móc câu cuối tập"}`;
    const user = [
      `PHIM: ${bible.title} — ${bible.logline_vi}`,
      `PHONG CÁCH HÌNH ẢNH: ${bible.style_en}`,
      `BỐI CẢNH CHÍNH: ${bible.setting_en}`,
      `NHÂN VẬT:\n${castLines(bible)}`,
      `DÀN Ý CẢ BỘ:\n${bible.episodes.map(e => `Tập ${e.n}${e.title ? " — " + e.title : ""}: ${e.summary_vi}`).join("\n")}`,
      tail ? `2 CẢNH CUỐI CỦA TẬP ${n - 1} (nối mạch từ đây):\n${tail}${prev.cliffhanger_vi ? "\nMóc câu: " + prev.cliffhanger_vi : ""}` : "",
      "",
      `VIẾT TẬP ${n}${ep.title ? " — " + ep.title : ""}: ${ep.summary_vi}${ep.cliffhanger_vi ? " (móc câu cuối tập: " + ep.cliffhanger_vi + ")" : ""}`,
      `Viết đủ ${scenes} cảnh × 10 giây. Trả về đúng JSON.`
    ].filter(Boolean).join("\n\n");
    return { system, user, n, scenes };
  }

  function normEpisode(j, bible, n) {
    const names = new Set(bible.characters.map(c => c.name));
    const scenes = (Array.isArray(j.scenes) ? j.scenes : []).map((c, i) => {
      const lines = (Array.isArray(c.lines) ? c.lines : []).map(l => ({ speaker: s(l.speaker) || NARRATOR, text: s(l.text || l.line) })).filter(l => l.text);
      return { n: i + 1, shot_en: s(c.shot_en || c.shot || c.prompt), shot_vi: s(c.shot_vi), who: (Array.isArray(c.who) ? c.who : []).map(s).filter(x => names.has(x)), lines };
    }).filter(c => c.shot_en);
    if (!scenes.length) throw new Error("AI chưa viết được cảnh nào. Bấm Viết lại.");
    return { n, title: s(j.title), recap_vi: s(j.recap_vi), scenes, cliffhanger_vi: s(j.cliffhanger_vi) };
  }
  function parseEpisode(text, bible, n) { return normEpisode(parseJson(text), bible, n); }

  /* ===================== XUẤT CHO MUSE STUDIO ===================== */
  // Mỗi cảnh: dòng CANH (phong cách + hình ảnh + ngoại hình cố định của nhân vật có mặt) và các dòng THOAI.
  function sceneCanh(bible, c) {
    const looks = c.who.map(nm => bible.characters.find(x => x.name === nm)).filter(Boolean).map(x => x.name + ": " + x.look_en);
    return s([bible.style_en.replace(/\.?$/, "."), c.shot_en.replace(/\.?$/, "."), looks.length ? "Characters — " + looks.join("; ") + "." : "", "No subtitles, no on-screen text."].filter(Boolean).join(" "));
  }
  function museText(bible, ep) {
    return ep.scenes.map(c => ["CANH: " + sceneCanh(bible, c), ...(c.lines.length ? c.lines : [{ speaker: NARRATOR, text: "…" }]).map(l => "THOAI: " + l.speaker + ": " + l.text)].join("\n")).join("\n\n");
  }
  // Prompt tạo ảnh định trang (cả dàn nhân vật đứng cạnh nhau) — dán vào ô "Ảnh định trang nhân vật".
  function castSheet(bible) {
    return `Character lineup reference sheet, ${bible.characters.length} characters standing side by side in a row, full body, front view, plain light-grey studio background, soft even lighting, sharp facial details, each in their signature outfit. ${bible.style_en.replace(/\.?$/, ".")} ` +
      bible.characters.map((c, i) => `${i + 1}) ${c.name}: ${c.look_en}`).join("; ") + ". No text, no labels.";
  }
  function castingTable(bible) {
    return bible.characters.map(c => `${c.name} — ${GENDERS[c.gender]} · ${AGES[c.age]}${c.role_vi ? " · " + c.role_vi : ""}`).join("\n");
  }

  /* ===================== TRÌNH VIẾT NHANH (không cần AI) ===================== */
  const DEFAULT_CAST = {
    live: [["Bà Tư","female","elder","a 65-year-old Vietnamese grandmother, kind wrinkled face, grey hair in a low bun, wearing a brown áo bà ba and a jade bracelet"],
           ["Anh Minh","male","adult","a 32-year-old Vietnamese man, short black hair, honest tanned face, wearing a faded navy shirt and khaki trousers, a silver wristwatch"],
           ["Chị Lan","female","adult","a 30-year-old Vietnamese woman, shoulder-length black hair, gentle eyes, wearing a mustard cardigan over a white blouse, small pearl earrings"],
           ["Bé Na","female","child","an 8-year-old Vietnamese girl, round cheerful face, two braids with red ribbons, wearing a yellow dress"]],
    anim: [["Mèo Mun","male","adult","a chubby black cat with big golden eyes, wearing a red scarf"],
           ["Cô Mèo Sữa","female","adult","a fluffy white cat with blue eyes, wearing a pink bow and a small pearl necklace"],
           ["Bé Cún","male","child","a small brown puppy with floppy ears and a blue collar with a bell"],
           ["Ông Rùa","male","elder","a wise old green tortoise with round glasses and a long white beard"]]
  };
  const ARC = [
    ["Mở đầu bình yên", "cuộc sống thường ngày của mọi người bị một chuyện bất ngờ làm xáo trộn"],
    ["Rắc rối lớn dần", "hiểu lầm và khó khăn chồng chất, các nhân vật bắt đầu mâu thuẫn"],
    ["Bí mật hé lộ", "một bí mật được hé lộ khiến mọi người nhìn nhau khác đi"],
    ["Thử thách", "nhân vật chính phải đưa ra một lựa chọn khó khăn"],
    ["Đối mặt", "những người trong cuộc đối mặt trực tiếp với nhau"],
    ["Bước ngoặt", "một biến cố làm mọi thứ đổi chiều"],
    ["Hàn gắn", "các nhân vật bắt đầu hiểu nhau và cùng nhau tìm cách giải quyết"]
  ];
  const SHOTS = [
    ["Wide establishing shot, slow dolly-in", "Toàn cảnh, máy đẩy chậm vào"], ["Medium shot, static camera", "Trung cảnh, máy đứng yên"],
    ["Close-up on the face, shallow depth of field", "Cận mặt, xoá phông"], ["Over-the-shoulder shot", "Góc qua vai"],
    ["Tracking shot following the character", "Máy bám theo nhân vật"], ["Low-angle medium shot", "Trung cảnh góc thấp"],
    ["Two-shot, slow push-in", "Hai người trong khung, máy đẩy chậm"], ["Extreme close-up on hands and an object", "Đặc tả tay và đồ vật"]
  ];
  const BEATS = [
    ["looks around, sensing something is different today", "nhìn quanh, cảm thấy hôm nay có gì đó khác lạ", "Hôm nay sao lạ quá, mọi người đi đâu hết rồi?"],
    ["walks in hurriedly holding something important", "vội vã bước vào, tay cầm một thứ quan trọng", "Có chuyện rồi, mọi người lại đây nghe này!"],
    ["listens in shock, eyes widening", "sững sờ lắng nghe, mắt mở to", "Thật sao? Sao không ai nói với tôi?"],
    ["argues firmly, gesturing with emotion", "tranh luận quyết liệt, tay chân đầy cảm xúc", "Tôi không đồng ý! Chuyện này phải làm cho rõ."],
    ["sits alone in silence, thinking deeply", "ngồi một mình im lặng, suy nghĩ", "Mình phải làm sao bây giờ đây…"],
    ["discovers a hidden clue and freezes", "phát hiện một manh mối giấu kín và khựng lại", "Cái này… sao lại ở đây?"],
    ["reaches out a hand to help, with a warm smile", "chìa tay giúp đỡ với nụ cười ấm áp", "Đừng lo, có tôi ở đây rồi."],
    ["turns back slowly as a stranger appears at the door", "chầm chậm quay lại khi một người lạ xuất hiện ở cửa", "Anh… anh là ai? Sao biết nhà này?"]
  ];

  function parseCastInput(text, anim) {
    const out = [];
    for (const raw of String(text || "").split(/\n|;/)) {
      const t = raw.trim(); if (!t) continue;
      const m = t.split(/\s*[-–:]\s*/); const name = s(m[0]).slice(0, 40); if (!name) continue;
      const low = t.toLowerCase();
      const gender = /(ông|anh|chú|cậu|bác trai|bố|vua|hoàng tử|nam|trai|mun|cún)/.test(low) && !/(bà|chị|cô|mẹ|nữ|gái|hậu|công chúa)/.test(low) ? "male" : "female";
      const age = /(bé|em bé|cháu|nhóc)/.test(low) ? "child" : /(ông|bà|cụ|già)/.test(low) ? "elder" : /(học sinh|teen|cậu|thiếu nữ)/.test(low) ? "teen" : "adult";
      const extra = m.slice(1).join(", ");
      out.push({ name, role_vi: extra, gender, age,
        look_en: anim ? `a stylized animated character named ${name}${extra ? " (" + extra + ")" : ""}, distinctive signature colors and outfit`
          : `a Vietnamese ${age === "elder" ? "elderly " : age === "child" ? "young " : ""}${gender === "male" ? (age === "child" ? "boy" : "man") : (age === "child" ? "girl" : "woman")}${extra ? " (" + extra + ")" : ""}, consistent face and hairstyle, wearing a signature outfit in one recognizable color` });
    }
    return out.slice(0, 6);
  }
  function quickBible(o) {
    const g = find(GENRES, o.genre), lk = find(LOOKS, o.look), anim = o.look !== "live" || o.genre === "animal";
    const eps = clampN(o.episodes, 2, 30, 8), idea = s(o.idea).slice(0, 200);
    let characters = parseCastInput(o.cast, anim);
    if (!characters.length) characters = DEFAULT_CAST[anim ? "anim" : "live"].map(([name, gender, age, look_en]) => ({ name, role_vi: "", gender, age, look_en }));
    const episodes = Array.from({ length: eps }, (_, i) => {
      const last = i === eps - 1, a = ARC[i === 0 ? 0 : last ? ARC.length - 1 : 1 + ((i - 1) % (ARC.length - 2))];
      return { n: i + 1, title: last ? "Kết thúc có hậu" : a[0],
        summary_vi: `${idea ? "Câu chuyện “" + idea + "”: " : ""}${last ? "mọi hiểu lầm được hoá giải, các nhân vật nhận ra bài học và câu chuyện khép lại trọn vẹn" : a[1]}.`,
        cliffhanger_vi: last ? "" : "Một chi tiết bất ngờ xuất hiện ở cuối tập, mở ra chuyện tiếp theo." };
    });
    return { title: idea ? idea.slice(0, 60) : "Phim dài tập mới", logline_vi: idea || g.guide, style_en: lk.style, setting_en: g.setting, characters, episodes, quick: true };
  }
  function quickEpisode(o, bible, n) {
    const scenes = clampN(o.scenes, 6, 15, 12), ep = bible.episodes[n - 1] || { title: "", summary_vi: "" }, cs = bible.characters;
    const list = [];
    for (let i = 0; i < scenes; i++) {
      const a = cs[(i + n) % cs.length], b = cs[(i + n + 1) % cs.length], shot = SHOTS[(i + n) % SHOTS.length];
      const beat = i === 0 ? BEATS[0] : i === scenes - 1 ? BEATS[7] : BEATS[1 + ((i + n) % 6)];
      const two = i % 3 === 1 && cs.length > 1;
      const lines = [{ speaker: a.name, text: beat[2] }];
      if (two) lines.push({ speaker: b.name, text: "Bình tĩnh đã, nghe tôi nói hết." });
      list.push({ n: i + 1, shot_en: `${shot[0]}. ${a.name} ${beat[0]}${two ? ", while " + b.name + " watches closely" : ""}, in ${bible.setting_en || "the main setting"}.`,
        shot_vi: `${shot[1]}. ${a.name} ${beat[1]}${two ? ", " + b.name + " chăm chú nhìn" : ""}.`, who: two ? [a.name, b.name] : [a.name], lines });
    }
    if (n === 1) list[0].lines = [{ speaker: NARRATOR, text: (bible.logline_vi || "Câu chuyện bắt đầu từ một ngày tưởng như bình thường.").split(/[.!?]/)[0].slice(0, 90) + "." }];
    return { n, title: ep.title, recap_vi: ep.summary_vi, scenes: list, cliffhanger_vi: ep.cliffhanger_vi || "", quick: true };
  }

  const api = { GENRES, LOOKS, AGES, GENDERS, NARRATOR, buildBibleBrief, parseBible, normBible, buildEpisodeBrief, parseEpisode, normEpisode, museText, castSheet, castingTable, quickBible, quickEpisode };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.StudioSeries = api;
})(typeof window !== "undefined" ? window : globalThis);
