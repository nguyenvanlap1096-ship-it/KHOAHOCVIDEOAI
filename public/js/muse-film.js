/* Viết kịch bản phim liền mạch cho Muse Studio — dùng chung cho trình duyệt (Muse Studio) và máy chủ (/api/muse/script).
   Một phim = N cảnh × 10 giây quay như một mạch: hồ sơ nhân vật cố định (ngoại hình + giọng), khung mở đầu của cảnh sau
   chính là khung kết của cảnh trước, cùng bối cảnh / ánh sáng / âm thanh nền, câu chuyện có mở – thắt – mở nút. */
(function (root) {
  "use strict";

  const STYLES = [
    { key:"pixar", label:"Hoạt hình 3D kiểu Pixar", en:"Cinematic Pixar-style 3D animated film, soft global illumination, expressive characters, rich warm colors, shallow depth of field" },
    { key:"live", label:"Người thật điện ảnh", en:"Photorealistic live-action cinematic film, shot on 35mm, natural skin texture, soft natural light, filmic color grade" },
    { key:"anime", label:"Anime 2D", en:"2D anime film, clean line art, cel shading, cinematic lighting, richly painted backgrounds" },
    { key:"storybook", label:"Tranh truyện cổ tích", en:"Storybook illustration film, soft watercolor textures, warm golden light, whimsical fairy-tale mood" },
    { key:"clay", label:"Hoạt hình đất sét (stop-motion)", en:"Stop-motion claymation film, handmade clay textures, miniature sets, warm practical lighting" },
    { key:"commercial", label:"Quảng cáo điện ảnh (TVC)", en:"High-end TV commercial cinematography, crisp studio lighting, glossy product highlights, smooth slow motion, premium color grade" },
    { key:"ugc", label:"Quay điện thoại kiểu TikTok (UGC)", en:"Authentic smartphone UGC video, handheld vertical framing, natural home daylight, casual real-life feel, true-to-life colors" },
  ];
  // Loại video: mỗi loại có vai trò người viết, cấu trúc câu chuyện và cách viết lời thoại riêng.
  const GENRES = [
    { key:"film", label:"🎬 Phim truyện", style:"pixar", scenes:4, narrator:"Gentle warm storyteller voice, medium pitch, soft timbre, slow soothing pace, speaks Vietnamese",
      role:"đạo diễn kiêm biên kịch phim ngắn", goal:"MỘT bộ phim liền mạch như quay một mạch, có ý nghĩa",
      cast:"tối đa 3 nhân vật chính",
      story:"CÂU CHUYỆN CÓ Ý NGHĨA: cảnh đầu giới thiệu nhân vật + mong muốn; giữa là trở ngại/xung đột tăng dần; cao trào; cảnh cuối giải quyết và để lại cảm xúc hoặc bài học. Mỗi cảnh phải đẩy câu chuyện tiến lên, không lặp lại.",
      talk:"LỜI THOẠI: tiếng Việt tự nhiên, mỗi cảnh 1–3 câu, TỔNG KHÔNG QUÁ 22 TỪ (vừa 10 giây). Nhiều nhân vật CÓ THỂ nói trong cùng một cảnh (đối đáp qua lại); mỗi câu chỉ MỘT người nói, ghi đúng tên người nói (tên trong hồ sơ hoặc \"Người kể chuyện\"), người nói phải CÓ MẶT và được nhắc tên trong action_en của cảnh đó; KHÔNG câu nào lặp lại hay na ná câu ở cảnh khác; thứ tự câu khớp với diễn biến hành động; lời thoại nối tiếp nhau thành mạch truyện, đúng tính cách từng nhân vật." },
    { key:"ad", label:"📢 Quảng cáo sản phẩm", style:"commercial", scenes:3, product:true, narrator:"Warm confident female commercial announcer, medium-low pitch, smooth clear timbre, upbeat lively pace, speaks Vietnamese",
      role:"đạo diễn quảng cáo truyền hình (TVC) kiêm copywriter", goal:"MỘT video quảng cáo liền mạch, đẹp như quảng cáo truyền hình, khiến người xem muốn mua",
      cast:"tối đa 2 người dùng/người mẫu, cộng với SẢN PHẨM",
      story:"CẤU TRÚC QUẢNG CÁO: cảnh 1 là HOOK trong 2 giây đầu (hình ảnh bất ngờ, đẹp mắt hoặc một vấn đề quen thuộc khiến người xem dừng lướt); các cảnh giữa để SẢN PHẨM xuất hiện như người hùng (cận cảnh macro, ánh sáng lướt trên bề mặt, chuyển động chậm) và CHỨNG MINH CÔNG DỤNG bằng hình ảnh khi dùng thật, mỗi cảnh 1 lợi ích rõ ràng; cảnh cuối là hero shot sản phẩm đẹp nhất + lời kêu gọi hành động. Cảm xúc tích cực, khơi khát khao sở hữu. Chỉ nói điều đúng sự thật về sản phẩm, không hứa hẹn quá mức, không chê thương hiệu khác.",
      talk:"LỜI BÌNH/LỜI THOẠI: tiếng Việt, chủ yếu là \"Người dẫn\" (giọng lời bình truyền cảm) hoặc người đang dùng sản phẩm; mỗi cảnh 1–2 câu ngắn, TỔNG ≤ 20 từ, sắc gọn như slogan; nhắc TÊN SẢN PHẨM ít nhất 2 lần trong cả video; câu cuối là lời kêu gọi rõ ràng (vd \"Đặt ngay hôm nay!\"), kèm ưu đãi nếu người dùng có cung cấp." },
    { key:"affiliate", label:"🛒 Video affiliate (review bán hàng)", style:"ugc", scenes:3, product:true, ratio:"9:16", narrator:"Friendly casual young female voice, medium pitch, bright natural timbre, chatty pace, speaks Vietnamese",
      role:"nhà sáng tạo nội dung TikTok/Shopee affiliate chuyên làm video review bán hàng chân thật", goal:"MỘT video review bán hàng liền mạch, chân thật như người thật quay bằng điện thoại, khiến người xem bấm vào giỏ hàng",
      cast:"1 người review chính (có thể thêm 1 người phụ), cộng với SẢN PHẨM",
      story:"CẤU TRÚC VIDEO AFFILIATE: cảnh 1 là HOOK: người review nhìn thẳng camera nói ra một nỗi khổ quen thuộc hoặc một kết quả gây tò mò; tiếp theo mở hộp/cầm sản phẩm khoe cận cảnh; dùng thử thật, cho thấy kết quả rõ ràng (trước – sau); nói 1–2 điểm thích nhất thật chân thành; cảnh cuối người review cầm sản phẩm mỉm cười và kêu gọi bấm giỏ hàng/link bên dưới. Kiểu điện thoại cầm tay, ánh sáng tự nhiên trong nhà, người thật việc thật. Chỉ nói điều có thật, không bịa công dụng chữa bệnh, không cam kết kết quả tuyệt đối.",
      talk:"LỜI THOẠI: người review nói trực tiếp với người xem bằng tiếng Việt đời thường, thân thiện, hào hứng vừa phải; mỗi cảnh 1–2 câu, TỔNG ≤ 22 từ; mỗi câu ghi đúng tên người nói; câu cuối là lời kêu gọi kiểu \"Link mình để ở giỏ hàng nha!\"." },
    { key:"psa", label:"📣 Video tuyên truyền", style:"live", scenes:4, narrator:"Calm sincere male narrator, low warm pitch, deep resonant timbre, steady unhurried pace, speaks Vietnamese",
      role:"đạo diễn phim tuyên truyền vì cộng đồng", goal:"MỘT video tuyên truyền liền mạch, cảm động, dễ nhớ, khiến người xem thay đổi hành vi",
      cast:"tối đa 3 nhân vật đời thường",
      story:"CẤU TRÚC VIDEO TUYÊN TRUYỀN: cảnh đầu là khoảnh khắc đời thường gần gũi với người xem; tiếp theo là hành vi chưa đúng hoặc nguy cơ, hậu quả được gợi ra nhẹ nhàng mà thấm (không ghê rợn, không máu me); bước ngoặt nhân vật nhận ra và làm đúng; cảnh cuối là kết quả tốt đẹp, đầy hy vọng + THÔNG ĐIỆP chính nói thật rõ. Nội dung tích cực, đúng sự thật, đúng pháp luật, không công kích cá nhân hay nhóm người nào.",
      talk:"LỜI THOẠI: tiếng Việt, nhân vật nói tự nhiên, mỗi cảnh 1–2 câu, TỔNG ≤ 22 từ; mỗi câu ghi đúng tên người nói; cảnh cuối kết bằng \"Người kể chuyện\" đọc thông điệp/khẩu hiệu ngắn gọn, dễ nhớ (≤ 12 từ)." },
  ];
  const find = (list, k) => list.find(x => x.key === k) || list[0];
  const clampN = (v, lo, hi, d) => Math.min(hi, Math.max(lo, Number(v) || d));
  const s = v => (v == null ? "" : String(v)).replace(/\s+/g, " ").trim();

  function buildBrief(o) {
    const g = find(GENRES, o.genre), st = find(STYLES, o.style || g.style), n = clampN(o.scenes, 2, 12, g.scenes);
    const ratio = o.ratio === "16:9" ? "16:9 horizontal" : o.ratio === "1:1" ? "1:1 square" : "9:16 vertical";
    const talk = o.dialogue !== "none";
    const product = g.product ? `
   SẢN PHẨM là một mục trong "characters" với "kind":"product": name = tên sản phẩm, look_en 20–32 từ tả CHÍNH XÁC hình dáng, kích thước, màu sắc, chất liệu, bao bì, màu nhãn; voice_en để rỗng. Sản phẩm giống hệt nhau ở mọi cảnh, luôn gọi đúng tên.` : "";
    const system = `Bạn là ${g.role}, làm video bằng AI tạo video (muse.ai). Mỗi lần AI chỉ tạo được 1 cảnh dài 10 giây, rồi các cảnh được NỐI LIỀN: khung hình cuối của cảnh trước được dùng làm khung mở đầu của cảnh sau. Nhiệm vụ: viết ${n} cảnh sao cho ghép lại thành ${g.goal}, như quay một mạch, người xem không nhận ra là ghép.

QUY TẮC BẮT BUỘC:
1. HỒ SƠ NHÂN VẬT CỐ ĐỊNH (${g.cast}): look_en tiếng Anh 22–32 từ, súc tích, chỉ nét nhận diện: loài/tuổi/giới tính, dáng người, khuôn mặt, mắt, tóc/lông, MÀU SẮC cụ thể, trang phục đặc trưng, 1 món đồ nhận diện. voice_en tiếng Anh tối đa 16 từ: giới tính, tuổi giọng, cao độ (high/medium/low), âm sắc, tốc độ nói, "speaks Vietnamese". Không bao giờ đổi ngoại hình hay giọng giữa các cảnh.${product}
   GIỌNG NGƯỜI DẪN: nếu có lời của "Người dẫn" hoặc "Người kể chuyện" (giọng ngoài hình, không xuất hiện trên hình), viết narrator_voice_en tiếng Anh tối đa 16 từ theo cùng cách tả giọng ở trên, hợp với loại video; giọng này giữ nguyên cả video.
2. BỐI CẢNH & ÁNH SÁNG LIÊN TỤC: setting_en tối đa 25 từ, tả 1 không gian chính (có thể đi dần sang chỗ kế bên nhưng phải hợp lý), thời gian trôi tự nhiên (sáng → trưa → chiều), ánh sáng đổi dần, không nhảy cóc.
3. NỐI CẢNH: start_en của cảnh k PHẢI mô tả lại CHÍNH XÁC end_en của cảnh k-1 (cùng tư thế, vị trí, hướng nhìn, cỡ cảnh, góc máy). end_en tối đa 28 từ, tả thật cụ thể khung hình cuối cùng (ai ở đâu, tư thế gì, biểu cảm, máy quay ở đâu) để cảnh sau nối vào; start_en tối đa 28 từ. Cảnh 1 có start_en là khung mở đầu phim.
4. MỖI CẢNH 10 GIÂY = 1 CÚ MÁY LIỀN, KHÔNG CẮT: action_en 45–70 từ tiếng Anh: hành động theo nhịp đầu–giữa–cuối, CẢM XÚC hiện trên mặt và cử chỉ (run rẩy, mắt rưng rưng, mỉm cười…), một chuyển động máy (dolly, tracking, pan, crane…), chỉ gọi nhân vật bằng TÊN. mood_en tối đa 8 từ: cảm xúc chủ đạo và sự chuyển biến (vd "lonely and scared, turning hopeful").
5. ${g.story}
6. ÂM THANH ĐỒNG BỘ: music_en tối đa 12 từ, nhạc nền chung cả phim (nhạc cụ, cảm xúc); mỗi cảnh sound_en tối đa 12 từ: âm thanh nền liên tục + 1 tiếng động cụ thể.
7. ${talk ? g.talk : "KHÔNG CÓ LỜI THOẠI: dialogue để mảng rỗng, kể chuyện bằng hình ảnh và âm thanh."}
8. VIẾT CÓ HỒN NHƯ ĐẠO DIỄN: mỗi hành động gắn với một cảm xúc cụ thể thể hiện trên khuôn mặt và cơ thể (ánh mắt, tai cụp, vai run, nụ cười run run…); thêm 1 chi tiết giác quan đắt giá (giọt mưa đọng trên ria, hơi thở mờ trong gió lạnh, lá khô xào xạc); ánh sáng phản chiếu tâm trạng; chuyển động máy có lý do cảm xúc (tiến sát khi xúc động, lùi xa khi cô đơn). Dùng từ gợi hình, cụ thể; tránh từ chung chung (beautiful, nice, amazing). Gọn nhưng giàu cảm xúc.
9. AN TOÀN ĐỂ MUSE KHÔNG TỪ CHỐI: không tả trẻ nhỏ hay con non (sơ sinh, vài tháng tuổi) một mình gặp nguy hiểm, bị bỏ rơi, sợ hãi tột độ, bị thương hay ngã đau; xung đột nhẹ nhàng, hợp mọi lứa tuổi; không bạo lực, không máu me.
10. Phong cách hình ảnh giữ nguyên cả phim. Khung hình ${ratio}. Không chèn chữ, phụ đề, logo hay watermark lên hình${g.product ? " (sản phẩm giữ đúng thiết kế bao bì của nó)" : ""}. Không nội dung nhạy cảm.

ĐẦU RA: CHỈ MỘT KHỐI JSON hợp lệ, không markdown, không giải thích:
{"title":"tên phim tiếng Việt","logline_vi":"tóm tắt 1–2 câu và ý nghĩa","style_en":"…","setting_en":"…","music_en":"…","narrator_voice_en":"… (bỏ trống nếu không có người dẫn)","characters":[{"name":"tên tiếng Việt","look_en":"…","voice_en":"…"}${g.product ? ',{"name":"tên sản phẩm","kind":"product","look_en":"…","voice_en":""}' : ""}],"scenes":[{"n":1,"summary_vi":"cảnh này kể gì (tiếng Việt)","start_en":"…","action_en":"…","end_en":"…","mood_en":"…","sound_en":"…","dialogue":[{"speaker":"tên","text_vi":"…"},{"speaker":"tên khác (nếu đối đáp)","text_vi":"…"}]}]}`;
    const user = [
      `LOẠI VIDEO: ${g.label.replace(/^\S+\s/, "")}`,
      `Ý TƯỞNG: ${s(o.idea)}`,
      o.product ? (g.product ? `SẢN PHẨM / THƯƠNG HIỆU (tả sản phẩm đúng như sau, không bịa thêm công dụng): ${s(o.product)}` : `THÔNG ĐIỆP CẦN TRUYỀN TẢI: ${s(o.product)}`) : "",
      o.productPhoto && g.product ? `NGƯỜI DÙNG CÓ ẢNH SẢN PHẨM THẬT (đính kèm khi tạo video): look_en của sản phẩm CHỈ được ghi những gì người dùng tả (hoặc LOOK_EN đã có); phần nào người dùng không tả thì ghi "exactly as shown in the real product photo". TUYỆT ĐỐI không tự bịa màu sắc, kiểu dáng, chất liệu của sản phẩm.` : "",
      o.cast ? (o.castFixed ? `NHÂN VẬT / SẢN PHẨM CỐ ĐỊNH (đã có ảnh tham chiếu thật — dùng ĐÚNG những mục này, giữ nguyên TÊN, không thêm nhân vật chính nào khác; mục có LOOK_EN thì chép nguyên LOOK_EN vào look_en; sản phẩm có "kind":"product"):\n${String(o.cast).trim()}` : `NHÂN VẬT NGƯỜI DÙNG MUỐN (giữ đúng tên/đặc điểm, bổ sung phần thiếu): ${s(o.cast)}`) : "",
      `PHONG CÁCH HÌNH ẢNH: ${st.label} — style_en bắt đầu bằng: "${st.en}"`,
      `SỐ CẢNH: ${n} cảnh × 10 giây (video ${n * 10} giây)`,
      `KHUNG HÌNH: ${ratio}`,
      "", `Viết đủ ${n} cảnh nối liền theo đúng quy tắc. Trả về đúng JSON.`,
    ].filter(Boolean).join("\n");
    return { system, user, n };
  }

  function parseJson(text) {
    const t = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    if (a < 0 || b <= a) throw new Error("AI không trả về đúng định dạng. Bấm viết lại.");
    try { return JSON.parse(t.slice(a, b + 1)); }
    catch { try { return JSON.parse(t.slice(a, b + 1).replace(/,\s*([}\]])/g, "$1")); } catch { throw new Error("Không đọc được kết quả của AI. Bấm viết lại."); } }
  }
  function normalize(j, o) {
    const st = find(STYLES, o && o.style);
    const characters = (Array.isArray(j.characters) ? j.characters : []).map(c => Object.assign({ name: s(c.name).slice(0, 40), look_en: s(c.look_en || c.look), voice_en: c.kind === "product" ? "" : s(c.voice_en || c.voice) }, c.kind === "product" ? { kind:"product" } : {})).filter(c => c.name).slice(0, 5);
    const scenes = (Array.isArray(j.scenes) ? j.scenes : []).map((c, i) => ({
      n: i + 1, summary_vi: s(c.summary_vi || c.summary), start_en: s(c.start_en), action_en: s(c.action_en || c.action), end_en: s(c.end_en), mood_en: s(c.mood_en || c.mood), sound_en: s(c.sound_en || c.sound),
      dialogue: (Array.isArray(c.dialogue) ? c.dialogue : []).map(d => ({ speaker: s(d.speaker) || "Người kể chuyện", text_vi: s(d.text_vi || d.text) })).filter(d => d.text_vi),
    })).filter(c => c.action_en);
    if (!scenes.length) throw new Error("AI chưa viết được cảnh nào. Thử viết rõ ý tưởng hơn.");
    const g = find(GENRES, o && o.genre);
    const narrator = scenes.some(c => c.dialogue.some(d => isNarrator(d.speaker, characters))) ? (s(j.narrator_voice_en).replace(/^….*$/, "") || g.narrator) : "";
    return tidy({ genre: g.key, narrator_voice_en: narrator, ratio: (o && o.ratio) || "16:9", title: s(j.title), logline_vi: s(j.logline_vi), style_en: s(j.style_en) || st.en, setting_en: s(j.setting_en), music_en: s(j.music_en), characters, scenes });
  }
  // Dọn lời thoại cho cả video: người nói phải là nhân vật thật (không để sản phẩm "nói", tên lệch → tên đúng trong hồ sơ)
  // hoặc người dẫn; bỏ câu lặp lại ở cảnh khác; mỗi cảnh tối đa ~30 từ để vừa 10 giây.
  const key = t => s(t).toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ").trim();
  function tidy(film) {
    const people = film.characters.filter(c => c.kind !== "product");
    const fallback = film.genre === "ad" ? "Người dẫn" : film.genre === "psa" ? "Người kể chuyện" : (people[0] && people[0].name) || "Người kể chuyện";
    const seen = new Set();
    film.scenes.forEach(c => {
      let words = 0;
      c.dialogue = c.dialogue.map(d => {
        const who = people.find(p => p.name.toLowerCase() === s(d.speaker).toLowerCase());
        return { speaker: who ? who.name : isNarrator(d.speaker, film.characters) ? s(d.speaker) : fallback, text_vi: s(d.text_vi) };
      }).filter(d => {
        const k = key(d.text_vi), n = d.text_vi.split(" ").length;
        if (!k || seen.has(k) || (words && words + n > 30)) return false;
        seen.add(k); words += n; return true;
      });
    });
    if (film.scenes.some(c => c.dialogue.some(d => isNarrator(d.speaker, film.characters))) && !film.narrator_voice_en) film.narrator_voice_en = find(GENRES, film.genre).narrator;
    return film;
  }
  // Người dẫn / người kể chuyện: giọng ngoài hình, không phải nhân vật trong hồ sơ.
  function isNarrator(name, characters) {
    return !characters.some(c => c.name.toLowerCase() === s(name).toLowerCase()) && /người dẫn|người kể|dẫn chuyện|lời bình|narrator/i.test(s(name));
  }
  function parse(text, o) { return normalize(parseJson(text), o); }

  // Prompt tiếng Anh cho từng cảnh — GỌN mà đủ hồn. muse.ai từ chối prompt quá dài (thử thật: >2.800 ký tự bị từ chối,
  // ≤1.300 đều tạo được), nên ghép theo thứ tự ưu tiên rồi tự co cho vừa ngân sách:
  // giữ trọn hành động + cảm xúc + khung kết (làm nên độ liền mạch), rút gọn phong cách/bối cảnh/ngoại hình/khung đầu,
  // chỉ gắn nhân vật có mặt trong cảnh. Ngân sách tính cả lời thoại (giọng do Studio gắn thêm sau).
  const words = (t, n) => { const w = s(t).split(" "); return w.length > n ? w.slice(0, n).join(" ").replace(/[,;:]$/, "") + "…" : s(t); };
  const end = t => s(t).replace(/[.…]?$/, ".");
  const BUDGET = 760; // Studio còn gắn thêm: chú thích ảnh tham chiếu, nhận diện + giọng ngay tại từng câu thoại
  function inScene(film, c) {
    const txt = [c.start_en, c.action_en, c.end_en, ...c.dialogue.map(d => d.speaker)].join(" ").toLowerCase();
    const hit = film.characters.filter(x => txt.includes(x.name.toLowerCase()));
    return hit.length ? hit : film.characters.slice(0, 1);
  }
  function scenePrompt(film, c, total) {
    const styleShort = s(film.style_en).split(",").slice(0, 3).join(",");
    const lines = c.dialogue.map(d => d.speaker + ": " + d.text_vi).join(" ");
    // các mức rút gọn: [ngoại hình, bối cảnh, khung đầu, phong cách đủ?, âm thanh, hành động, khung kết]
    // ngoại hình và hành động giữ lâu nhất; hành động vẫn đủ nhịp đầu–giữa–cuối + cảm xúc ở mức thấp nhất.
    const levels = [[34, 24, 24, true, 14, 90, 30], [30, 16, 18, false, 10, 90, 30], [28, 10, 14, false, 0, 80, 28], [24, 0, 10, false, 0, 70, 24], [18, 0, 0, false, 0, 62, 22], [14, 0, 0, false, 0, 55, 20]];
    let out = "";
    for (const [lk, st, op, fullStyle, snd, act, en] of levels) {
      const here = inScene(film, c), people = here.filter(x => x.kind !== "product"), items = here.filter(x => x.kind === "product");
      const cast = people.map(x => x.name + " (" + words(x.look_en, lk) + ")").join("; ");
      const prod = items.map(x => x.name + " (" + words(x.look_en, lk) + ")").join("; ");
      out = s([
        end(fullStyle ? words(film.style_en, 22) : styleShort),
        st && film.setting_en && "Setting: " + end(words(film.setting_en, st)),
        cast && "Characters, same look in every scene: " + end(cast),
        prod && "Product, identical shape, colors and label in every shot: " + end(prod),
        "Scene " + c.n + "/" + total + ", one continuous 10-second shot, no cuts.",
        c.n === 1 && op && c.start_en && "Opens on: " + end(words(c.start_en, op)),
        "Action: " + end(words(c.action_en, act)),
        c.mood_en && "Mood: " + end(words(c.mood_en, 10)),
        c.end_en && "Ends exactly on: " + end(words(c.end_en, en)),
        snd && (c.sound_en || film.music_en) && "Sound: " + end(words([c.sound_en, film.music_en && "music " + film.music_en].filter(Boolean).join("; "), snd)),
        items.length ? "No added text overlays, no subtitles, no watermark." : "No text, no subtitles, no watermark.",
      ].filter(Boolean).join(" "));
      // từ cảnh 2 Studio thêm câu nối cảnh (~120 ký tự) và ảnh khung cuối đã mang sẵn ngoại hình → chừa chỗ.
      if (out.length + lines.length <= BUDGET - (c.n > 1 ? 150 : 0)) break;
    }
    return out;
  }
  function toCanhThoai(film) {
    return film.scenes.map(c => ["CANH: " + scenePrompt(film, c, film.scenes.length), ...c.dialogue.map(d => "THOAI: " + d.speaker + ": " + d.text_vi)].join("\n")).join("\n\n");
  }
  function voiceNote(film) {
    const lines = film.characters.filter(c => c.voice_en).map(c => c.name + ": " + c.voice_en);
    const voice = film.narrator_voice_en || (film.genre && find(GENRES, film.genre).narrator);
    const narr = [...new Set(film.scenes.flatMap(c => c.dialogue.map(d => d.speaker)).filter(n => isNarrator(n, film.characters)))];
    if (voice) narr.forEach(n => lines.push(n + ": " + voice));
    return lines.join("\n");
  }
  function castSheet(film) {
    const cs = film.characters;
    if (!cs.length) return "";
    return `${cs.length > 1 ? `Character lineup reference sheet, ${cs.length} characters standing side by side` : "Character reference sheet of one character"}, full body, front view, plain light-grey studio background, soft even lighting, sharp details. ${film.style_en.replace(/\.?$/, ".")} ` +
      cs.map((c, i) => (cs.length > 1 ? (i + 1) + ") " : "") + c.name + ": " + c.look_en).join("; ") + ". No text, no labels.";
  }

  // Ảnh tham chiếu nhiều góc cho MỘT nhân vật (mỗi nhân vật 1 ảnh) — để muse giữ đúng nhân vật ở mọi cảnh.
  function turnaround(film, ch) {
    if (ch.kind === "product") return s(`Product reference sheet of ONE single product: ${ch.name}, ${ch.look_en}. The same product shown side by side on one sheet: front view, three-quarter view, side view, back view, plus one macro close-up of the label and material details. Professional e-commerce product photography, plain light-grey background, soft even studio lighting, true colors, identical shape, colors and packaging in every view, sharp clean details. Only this one product, no people, no extra text.`);
    return s(`Character turnaround reference sheet of ONE single character: ${ch.name}, ${ch.look_en}. The same character shown five times side by side on one sheet: front view, three-quarter view, side profile, back view, all full body in a neutral standing pose, plus one close-up of the face with a gentle neutral expression. ${s(film.style_en).split(",").slice(0, 3).join(",")}. Plain light-grey background, even soft studio lighting, identical proportions, colors and outfit in every view, sharp clean details. Only this one character, no other characters, no text, no labels.`);
  }

  // Trình viết nhanh (không cần AI): khung 4 nhịp mở – thắt – cao trào – mở nút, nối khung cuối → khung đầu.
  const QUICK = {
    ad: [["hook gây chú ý", "faces a small everyday frustration in a striking close-up, then notices something glowing nearby", "turns toward the camera, curious, in a medium close-up", "Bạn cũng từng gặp chuyện này?"],
      ["sản phẩm xuất hiện và chứng minh công dụng", "picks up the product as soft light sweeps across it in slow motion, then uses it and the problem visibly disappears", "smiles, holding the product near the face, in a medium shot", "Có sản phẩm này, mọi thứ thật dễ dàng."],
      ["hero shot và lời kêu gọi", "places the product in the center as the camera glides into a glossy hero shot with gentle sparkles of light", "the product stands alone in a perfect hero shot, softly lit", "Đặt ngay hôm nay!"]],
    affiliate: [["hook nói thẳng vào camera", "looks straight into the handheld phone camera and describes a common daily struggle with a relatable sigh", "lifts the product box into the frame, excited, in a close-up", "Mọi người ơi, cái này cứu mình luôn!"],
      ["mở hộp và dùng thử", "opens the box, shows the product up close in the hand, then tries it for real and shows the clear result", "holds the product next to the result, impressed, in a close-up", "Dùng thử thấy khác hẳn, mình thích lắm."],
      ["kêu gọi mua hàng", "smiles at the camera holding the product and points down toward the bottom of the screen", "waves goodbye holding the product, in a cozy medium shot", "Link mình để ở giỏ hàng nha!"]],
    psa: [["khoảnh khắc đời thường", "goes about a normal day in a familiar place, relaxed and smiling", "pauses, about to make a careless choice, in a medium shot", "Chắc không sao đâu…"],
      ["hậu quả được gợi ra", "makes the careless choice and a gentle near-miss happens, everyone freezes in worry", "stands still, shaken and thoughtful, in a close-up", "Suýt nữa thì…"],
      ["thay đổi và thông điệp", "chooses to do the right thing, others follow, and warm light fills the scene as the camera cranes up", "smiles at the camera in a wide hopeful shot", "Hành động nhỏ, an toàn lớn."]],
  };
  function quick(o) {
    const g = find(GENRES, o.genre), st = find(STYLES, o.style || g.style), n = clampN(o.scenes, 2, 12, g.scenes), idea = s(o.idea) || "một ngày phiêu lưu";
    const names = (o.castNames != null ? String(o.castNames).split("\n").map(s) : String(o.cast || "").split(/[,;\n]/).map(x => s(x.split(/[-–:]/)[0]))).filter(Boolean).slice(0, 3);
    const hero = names[0] || (g.key === "affiliate" ? "Người review" : g.key === "ad" ? "Người dùng" : "Nhân vật chính");
    const productName = g.product && (s(o.productName) || s(String(o.product || "").split(/[\n,:–-]/)[0])).slice(0, 40);
    const characters = (names.length ? names : [hero]).map(nm => ({ name: nm, look_en: `${nm}, the main character of "${idea}", with a distinctive face, consistent hairstyle and one signature outfit in a single recognizable color, always the same in every scene`, voice_en: "a clear, warm, medium-pitched voice, natural pace, speaks Vietnamese" }));
    const beats = QUICK[g.key] ? QUICK[g.key].concat([QUICK[g.key][2]]) : [
      ["giới thiệu nhân vật và mong muốn", "is introduced in a calm wide shot, notices something important and decides to go after it", "walks forward toward the camera, determined, in a medium shot", "Hôm nay mình nhất định phải làm được!"],
      ["gặp trở ngại đầu tiên", "keeps moving forward and runs into a first obstacle that blocks the way, reacting with surprise", "stands still facing the obstacle, thinking, in a medium close-up", "Ơ… khó hơn mình nghĩ rồi."],
      ["cố gắng và cao trào", "tries a clever idea, struggles, nearly fails, then pushes through with a final effort as the camera circles around", "stands up victorious, breathing hard, in a low-angle medium shot", "Cố lên… làm được rồi!"],
      ["kết thúc và ý nghĩa", "looks back at the journey, smiles warmly and shares the result as the camera slowly cranes up", "smiles at the camera in a wide shot as the light turns golden", "Cứ kiên trì là sẽ tới đích!"],
    ];
    const pick = i => i === 0 ? beats[0] : i === n - 1 ? beats[3] : beats[1 + ((i - 1) % 2)];
    const scenes = [];
    for (let i = 0; i < n; i++) {
      const b = pick(i), prevEnd = i ? `${hero} ${productName ? pick(i - 1)[2].replace(/the product/g, productName) : pick(i - 1)[2]}` : `A wide establishing shot of the setting with ${hero} in the distance`;
      const named = x => productName ? x.replace(/the product/g, productName) : x, act = named(b[1]);
      scenes.push({ n: i + 1, summary_vi: `${hero}: ${b[0]}.`, start_en: prevEnd, action_en: `${hero} ${act}.`, end_en: `${hero} ${named(b[2])}`, sound_en: "the same gentle ambience continues, soft footsteps", dialogue: o.dialogue === "none" ? [] : [{ speaker: g.key === "ad" ? "Người dẫn" : g.key === "psa" && i === n - 1 ? "Người kể chuyện" : hero, text_vi: b[3] }] });
    }
    if (productName) characters.push({ name: productName, kind:"product", look_en: `${s(String(o.product).replace(/^[^\n,:–-]*[\n,:–-]\s*/, "")).slice(0, 160) || "the product"}, exactly the same shape, colors and packaging in every shot`, voice_en: "" });
    return { genre: g.key, narrator_voice_en: scenes.some(c => c.dialogue.some(d => isNarrator(d.speaker, characters))) ? g.narrator : "", ratio: o.ratio || g.ratio || "16:9", title: idea.slice(0, 60), logline_vi: idea, style_en: st.en, setting_en: "one consistent location that matches the story, natural light changing gradually", music_en: "one soft cinematic theme played throughout", characters, scenes, quick: true };
  }

  const api = { STYLES, GENRES, isNarrator, tidy, buildBrief, parse, normalize, scenePrompt, toCanhThoai, voiceNote, castSheet, turnaround, quick };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MuseFilm = api;
})(typeof window !== "undefined" ? window : globalThis);
