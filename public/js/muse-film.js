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
  ];
  const find = (list, k) => list.find(x => x.key === k) || list[0];
  const clampN = (v, lo, hi, d) => Math.min(hi, Math.max(lo, Number(v) || d));
  const s = v => (v == null ? "" : String(v)).replace(/\s+/g, " ").trim();

  function buildBrief(o) {
    const st = find(STYLES, o.style), n = clampN(o.scenes, 2, 12, 4);
    const ratio = o.ratio === "16:9" ? "16:9 horizontal" : o.ratio === "1:1" ? "1:1 square" : "9:16 vertical";
    const talk = o.dialogue !== "none";
    const system = `Bạn là đạo diễn kiêm biên kịch phim ngắn làm bằng AI tạo video (muse.ai). Mỗi lần AI chỉ tạo được 1 cảnh dài 10 giây, rồi các cảnh được NỐI LIỀN: khung hình cuối của cảnh trước được dùng làm khung mở đầu của cảnh sau. Nhiệm vụ: viết ${n} cảnh sao cho ghép lại thành MỘT bộ phim liền mạch như quay một mạch, có ý nghĩa, người xem không nhận ra là ghép.

QUY TẮC BẮT BUỘC:
1. HỒ SƠ NHÂN VẬT CỐ ĐỊNH (tối đa 3 nhân vật chính): look_en tiếng Anh 22–32 từ, súc tích, chỉ nét nhận diện: loài/tuổi/giới tính, dáng người, khuôn mặt, mắt, tóc/lông, MÀU SẮC cụ thể, trang phục đặc trưng, 1 món đồ nhận diện. voice_en tiếng Anh tối đa 16 từ: giới tính, tuổi giọng, cao độ (high/medium/low), âm sắc, tốc độ nói, "speaks Vietnamese". Không bao giờ đổi ngoại hình hay giọng giữa các cảnh.
2. BỐI CẢNH & ÁNH SÁNG LIÊN TỤC: setting_en tối đa 25 từ, tả 1 không gian chính (có thể đi dần sang chỗ kế bên nhưng phải hợp lý), thời gian trôi tự nhiên (sáng → trưa → chiều), ánh sáng đổi dần, không nhảy cóc.
3. NỐI CẢNH: start_en của cảnh k PHẢI mô tả lại CHÍNH XÁC end_en của cảnh k-1 (cùng tư thế, vị trí, hướng nhìn, cỡ cảnh, góc máy). end_en tối đa 28 từ, tả thật cụ thể khung hình cuối cùng (ai ở đâu, tư thế gì, biểu cảm, máy quay ở đâu) để cảnh sau nối vào; start_en tối đa 28 từ. Cảnh 1 có start_en là khung mở đầu phim.
4. MỖI CẢNH 10 GIÂY = 1 CÚ MÁY LIỀN, KHÔNG CẮT: action_en 45–70 từ tiếng Anh: hành động theo nhịp đầu–giữa–cuối, CẢM XÚC hiện trên mặt và cử chỉ (run rẩy, mắt rưng rưng, mỉm cười…), một chuyển động máy (dolly, tracking, pan, crane…), chỉ gọi nhân vật bằng TÊN. mood_en tối đa 8 từ: cảm xúc chủ đạo và sự chuyển biến (vd "lonely and scared, turning hopeful").
5. CÂU CHUYỆN CÓ Ý NGHĨA: cảnh đầu giới thiệu nhân vật + mong muốn; giữa là trở ngại/xung đột tăng dần; cao trào; cảnh cuối giải quyết và để lại cảm xúc hoặc bài học. Mỗi cảnh phải đẩy câu chuyện tiến lên, không lặp lại.
6. ÂM THANH ĐỒNG BỘ: music_en tối đa 12 từ, nhạc nền chung cả phim (nhạc cụ, cảm xúc); mỗi cảnh sound_en tối đa 12 từ: âm thanh nền liên tục + 1 tiếng động cụ thể.
7. ${talk ? `LỜI THOẠI: tiếng Việt tự nhiên, mỗi cảnh 1–3 câu, TỔNG KHÔNG QUÁ 22 TỪ (vừa 10 giây). Nhiều nhân vật CÓ THỂ nói trong cùng một cảnh (đối đáp qua lại); mỗi câu chỉ MỘT người nói, ghi đúng tên người nói (tên trong hồ sơ hoặc "Người kể chuyện"), người nói phải CÓ MẶT trong cảnh đó; thứ tự câu khớp với diễn biến hành động; lời thoại nối tiếp nhau thành mạch truyện, đúng tính cách từng nhân vật.` : "KHÔNG CÓ LỜI THOẠI: dialogue để mảng rỗng, kể chuyện bằng hình ảnh và âm thanh."}
8. VIẾT CÓ HỒN NHƯ ĐẠO DIỄN: mỗi hành động gắn với một cảm xúc cụ thể thể hiện trên khuôn mặt và cơ thể (ánh mắt, tai cụp, vai run, nụ cười run run…); thêm 1 chi tiết giác quan đắt giá (giọt mưa đọng trên ria, hơi thở mờ trong gió lạnh, lá khô xào xạc); ánh sáng phản chiếu tâm trạng; chuyển động máy có lý do cảm xúc (tiến sát khi xúc động, lùi xa khi cô đơn). Dùng từ gợi hình, cụ thể; tránh từ chung chung (beautiful, nice, amazing). Gọn nhưng giàu cảm xúc.
9. AN TOÀN ĐỂ MUSE KHÔNG TỪ CHỐI: không tả trẻ nhỏ hay con non (sơ sinh, vài tháng tuổi) một mình gặp nguy hiểm, bị bỏ rơi, sợ hãi tột độ, bị thương hay ngã đau; xung đột nhẹ nhàng, hợp mọi lứa tuổi; không bạo lực, không máu me.
10. Phong cách hình ảnh giữ nguyên cả phim. Khung hình ${ratio}. Không chữ, không phụ đề, không logo/watermark. Không nội dung nhạy cảm.

ĐẦU RA: CHỈ MỘT KHỐI JSON hợp lệ, không markdown, không giải thích:
{"title":"tên phim tiếng Việt","logline_vi":"tóm tắt 1–2 câu và ý nghĩa","style_en":"…","setting_en":"…","music_en":"…","characters":[{"name":"tên tiếng Việt","look_en":"…","voice_en":"…"}],"scenes":[{"n":1,"summary_vi":"cảnh này kể gì (tiếng Việt)","start_en":"…","action_en":"…","end_en":"…","mood_en":"…","sound_en":"…","dialogue":[{"speaker":"tên","text_vi":"…"},{"speaker":"tên khác (nếu đối đáp)","text_vi":"…"}]}]}`;
    const user = [
      `Ý TƯỞNG PHIM: ${s(o.idea)}`,
      o.cast ? `NHÂN VẬT NGƯỜI DÙNG MUỐN (giữ đúng tên/đặc điểm, bổ sung phần thiếu): ${s(o.cast)}` : "",
      `PHONG CÁCH HÌNH ẢNH: ${st.label} — style_en bắt đầu bằng: "${st.en}"`,
      `SỐ CẢNH: ${n} cảnh × 10 giây (phim ${n * 10} giây)`,
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
    const characters = (Array.isArray(j.characters) ? j.characters : []).map(c => ({ name: s(c.name).slice(0, 40), look_en: s(c.look_en || c.look), voice_en: s(c.voice_en || c.voice) })).filter(c => c.name).slice(0, 4);
    const scenes = (Array.isArray(j.scenes) ? j.scenes : []).map((c, i) => ({
      n: i + 1, summary_vi: s(c.summary_vi || c.summary), start_en: s(c.start_en), action_en: s(c.action_en || c.action), end_en: s(c.end_en), mood_en: s(c.mood_en || c.mood), sound_en: s(c.sound_en || c.sound),
      dialogue: (Array.isArray(c.dialogue) ? c.dialogue : []).map(d => ({ speaker: s(d.speaker) || "Người kể chuyện", text_vi: s(d.text_vi || d.text) })).filter(d => d.text_vi),
    })).filter(c => c.action_en);
    if (!scenes.length) throw new Error("AI chưa viết được cảnh nào. Thử viết rõ ý tưởng hơn.");
    return { ratio: (o && o.ratio) || "16:9", title: s(j.title), logline_vi: s(j.logline_vi), style_en: s(j.style_en) || st.en, setting_en: s(j.setting_en), music_en: s(j.music_en), characters, scenes };
  }
  function parse(text, o) { return normalize(parseJson(text), o); }

  // Prompt tiếng Anh cho từng cảnh — GỌN mà đủ hồn. muse.ai từ chối prompt quá dài (thử thật: >2.800 ký tự bị từ chối,
  // ≤1.300 đều tạo được), nên ghép theo thứ tự ưu tiên rồi tự co cho vừa ngân sách:
  // giữ trọn hành động + cảm xúc + khung kết (làm nên độ liền mạch), rút gọn phong cách/bối cảnh/ngoại hình/khung đầu,
  // chỉ gắn nhân vật có mặt trong cảnh. Ngân sách tính cả lời thoại (giọng do Studio gắn thêm sau).
  const words = (t, n) => { const w = s(t).split(" "); return w.length > n ? w.slice(0, n).join(" ").replace(/[,;:]$/, "") + "…" : s(t); };
  const end = t => s(t).replace(/[.…]?$/, ".");
  const BUDGET = 820; // Studio còn gắn thêm: chú thích ảnh tham chiếu, nhận diện + giọng ngay tại từng câu thoại
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
      const cast = inScene(film, c).map(x => x.name + " (" + words(x.look_en, lk) + ")").join("; ");
      out = s([
        end(fullStyle ? words(film.style_en, 22) : styleShort),
        st && film.setting_en && "Setting: " + end(words(film.setting_en, st)),
        "Characters, same look in every scene: " + end(cast),
        "Scene " + c.n + "/" + total + ", one continuous 10-second shot, no cuts.",
        c.n === 1 && op && c.start_en && "Opens on: " + end(words(c.start_en, op)),
        "Action: " + end(words(c.action_en, act)),
        c.mood_en && "Mood: " + end(words(c.mood_en, 10)),
        c.end_en && "Ends exactly on: " + end(words(c.end_en, en)),
        snd && (c.sound_en || film.music_en) && "Sound: " + end(words([c.sound_en, film.music_en && "music " + film.music_en].filter(Boolean).join("; "), snd)),
        "No text, no subtitles, no watermark.",
      ].filter(Boolean).join(" "));
      // từ cảnh 2 Studio thêm câu nối cảnh (~120 ký tự) và ảnh khung cuối đã mang sẵn ngoại hình → chừa chỗ.
      if (out.length + lines.length <= BUDGET - (c.n > 1 ? 150 : 0)) break;
    }
    return out;
  }
  function toCanhThoai(film) {
    return film.scenes.map(c => ["CANH: " + scenePrompt(film, c, film.scenes.length), ...c.dialogue.map(d => "THOAI: " + d.speaker + ": " + d.text_vi)].join("\n")).join("\n\n");
  }
  function voiceNote(film) { return film.characters.filter(c => c.voice_en).map(c => c.name + ": " + c.voice_en).join("\n"); }
  function castSheet(film) {
    const cs = film.characters;
    if (!cs.length) return "";
    return `${cs.length > 1 ? `Character lineup reference sheet, ${cs.length} characters standing side by side` : "Character reference sheet of one character"}, full body, front view, plain light-grey studio background, soft even lighting, sharp details. ${film.style_en.replace(/\.?$/, ".")} ` +
      cs.map((c, i) => (cs.length > 1 ? (i + 1) + ") " : "") + c.name + ": " + c.look_en).join("; ") + ". No text, no labels.";
  }

  // Ảnh tham chiếu nhiều góc cho MỘT nhân vật (mỗi nhân vật 1 ảnh) — để muse giữ đúng nhân vật ở mọi cảnh.
  function turnaround(film, ch) {
    return s(`Character turnaround reference sheet of ONE single character: ${ch.name}, ${ch.look_en}. The same character shown five times side by side on one sheet: front view, three-quarter view, side profile, back view, all full body in a neutral standing pose, plus one close-up of the face with a gentle neutral expression. ${s(film.style_en).split(",").slice(0, 3).join(",")}. Plain light-grey background, even soft studio lighting, identical proportions, colors and outfit in every view, sharp clean details. Only this one character, no other characters, no text, no labels.`);
  }

  // Trình viết nhanh (không cần AI): khung 4 nhịp mở – thắt – cao trào – mở nút, nối khung cuối → khung đầu.
  function quick(o) {
    const st = find(STYLES, o.style), n = clampN(o.scenes, 2, 12, 4), idea = s(o.idea) || "một ngày phiêu lưu";
    const names = String(o.cast || "").split(/[,;\n]/).map(x => s(x.split(/[-–:]/)[0])).filter(Boolean).slice(0, 3);
    const hero = names[0] || "Nhân vật chính";
    const characters = (names.length ? names : [hero]).map(nm => ({ name: nm, look_en: `${nm}, the main character of "${idea}", with a distinctive face, consistent hairstyle and one signature outfit in a single recognizable color, always the same in every scene`, voice_en: "a clear, warm, medium-pitched voice, natural pace, speaks Vietnamese" }));
    const beats = [
      ["giới thiệu nhân vật và mong muốn", "is introduced in a calm wide shot, notices something important and decides to go after it", "walks forward toward the camera, determined, in a medium shot", "Hôm nay mình nhất định phải làm được!"],
      ["gặp trở ngại đầu tiên", "keeps moving forward and runs into a first obstacle that blocks the way, reacting with surprise", "stands still facing the obstacle, thinking, in a medium close-up", "Ơ… khó hơn mình nghĩ rồi."],
      ["cố gắng và cao trào", "tries a clever idea, struggles, nearly fails, then pushes through with a final effort as the camera circles around", "stands up victorious, breathing hard, in a low-angle medium shot", "Cố lên… làm được rồi!"],
      ["kết thúc và ý nghĩa", "looks back at the journey, smiles warmly and shares the result as the camera slowly cranes up", "smiles at the camera in a wide shot as the light turns golden", "Cứ kiên trì là sẽ tới đích!"],
    ];
    const pick = i => i === 0 ? beats[0] : i === n - 1 ? beats[3] : beats[1 + ((i - 1) % 2)];
    const scenes = [];
    for (let i = 0; i < n; i++) {
      const b = pick(i), prevEnd = i ? `${hero} ${pick(i - 1)[2]}` : `A wide establishing shot of the setting with ${hero} in the distance`;
      scenes.push({ n: i + 1, summary_vi: `${hero}: ${b[0]}.`, start_en: prevEnd, action_en: `${hero} ${b[1]}.`, end_en: `${hero} ${b[2]}`, sound_en: "the same gentle ambience continues, soft footsteps", dialogue: o.dialogue === "none" ? [] : [{ speaker: hero, text_vi: b[3] }] });
    }
    return { ratio: o.ratio || "16:9", title: idea.slice(0, 60), logline_vi: idea, style_en: st.en, setting_en: "one consistent location that matches the story, natural light changing gradually", music_en: "one soft cinematic theme played throughout", characters, scenes, quick: true };
  }

  const api = { STYLES, buildBrief, parse, normalize, scenePrompt, toCanhThoai, voiceNote, castSheet, turnaround, quick };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MuseFilm = api;
})(typeof window !== "undefined" ? window : globalThis);
