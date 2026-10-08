// Định dạng chuẩn cho kịch bản video AI trong thư viện prompt theo ngành.
// Mỗi kịch bản: thông số → nhân vật cố định → từng cảnh (thời gian, prompt EN cho VEO3/Kling, lời thoại) → âm thanh → chữ → CTA.

const LINE = '━━━━━━━━━━━━━━━━━━━━';

/**
 * @param {object} s
 * @param {string} s.info      Thời lượng · tỉ lệ · công cụ
 * @param {string} [s.character] Thẻ mô tả nhân vật (EN) – dán vào mọi cảnh
 * @param {Array<{time: string, label: string, tool?: string, prompt: string, voice?: string}>} s.scenes
 * @param {string} s.audio     Nhạc + hiệu ứng âm thanh
 * @param {string} [s.text]    Chữ trên màn hình
 * @param {string} s.cta       Lời kêu gọi hành động
 */
function script(s) {
  const out = [`THÔNG SỐ: ${s.info}`];
  if (s.character) out.push(`NHÂN VẬT (đã chèn sẵn vào prompt từng cảnh để giữ nhân vật đồng nhất): ${s.character}`);
  // Tên nhân vật viết HOA trong thẻ (LAN, MOM…): cảnh nào nhắc tới thì prompt tự kèm mô tả, chép là dùng được ngay.
  const tags = s.character ? [...s.character.matchAll(/\b([A-Z]{2,}):/g)].map(m => m[1]) : [];
  s.scenes.forEach((sc, i) => {
    out.push(LINE, `CẢNH ${i + 1} · ${sc.time} · ${sc.label}${sc.tool ? ` · ${sc.tool}` : ''}`);
    const usesCharacter = tags.some(t => new RegExp(`\\b${t}\\b`).test(sc.prompt));
    out.push(`Prompt: ${sc.prompt}${usesCharacter ? ` Character reference – ${s.character}` : ''}`);
    if (sc.voice) out.push(`Thoại / lời kể: ${sc.voice}`);
  });
  out.push(LINE, `ÂM THANH: ${s.audio}`);
  if (s.text) out.push(`CHỮ TRÊN MÀN HÌNH: ${s.text}`);
  out.push(`CTA: ${s.cta}`);
  return out.join('\n');
}

// Prompt "đạo diễn": nhờ ChatGPT / Gemini viết kịch bản video AI chuẩn cho một ngành.
function director({ role, product, audience, goals, styles, notes }) {
  return `Bạn là ${role} kiêm chuyên gia viết prompt cho công cụ tạo video AI (VEO3, Kling).
Hãy viết kịch bản video ngắn cho: ${product}.
- Khán giả: ${audience}
- Mục tiêu video: ${goals}
- Thời lượng: [15 / 30 / 60] giây · Tỉ lệ: [9:16 / 16:9] · Nền tảng: [TikTok / Reels / YouTube / Facebook]
- Phong cách gợi ý: ${styles}

YÊU CẦU ĐẦU RA:
1. 3 phương án hook cho 3 giây đầu (gây tò mò, không chào hỏi).
2. 1 "thẻ nhân vật" bằng tiếng Anh (tuổi, khuôn mặt, tóc, trang phục cố định) để giữ nhân vật đồng nhất.
3. Bảng phân cảnh 4–8 cảnh: Thời gian | Hình ảnh | Lời thoại / lời kể tiếng Việt | Chữ trên màn hình.
4. Với MỖI cảnh, viết 1 prompt tiếng Anh cho VEO3 (cảnh có thoại) hoặc Kling (cảnh chuyển động / sản phẩm), gồm: cỡ cảnh, góc máy, chủ thể + 1 hành động chính, bối cảnh, ánh sáng, chuyển động camera, phong cách, âm thanh; luôn chèn thẻ nhân vật; thêm "No subtitles, no text on screen".
5. Gợi ý nhạc nền, 3–5 hiệu ứng âm thanh và lời kêu gọi hành động (CTA) cuối video.${notes ? `\nLƯU Ý: ${notes}` : ''}`;
}

const NO_TEXT = 'No subtitles, no text on screen.';

// Viết gọn: sc('0–3s', 'HOOK', 'VEO3', 'prompt EN', 'lời thoại') → một cảnh.
const sc = (time, label, tool, prompt, voice) => ({ time, label, tool, prompt, voice });

// Viết gọn một mục kịch bản: v(tiêu đề, công cụ, mô tả, { info, character, scenes, audio, text, cta }).
const v = (title, tool, description, spec) => ({ title, tool, description, content: script(spec) });

module.exports = { script, director, sc, v, NO_TEXT };
