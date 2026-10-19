/* Viết kịch bản & prompt theo ngành và theo cú pháp riêng của từng model video.
   Dùng chung cho trình duyệt (Xưởng Video AI) và máy chủ (khi học viên dùng hạn mức của khoá học). */
(function (root) {
  "use strict";

  // Ngành: gợi ý hình ảnh, cách mở đầu (hook) và lời kêu gọi đặc trưng để AI viết đúng chất ngành.
  const INDUSTRIES = [
    { key:"fnb", label:"Ẩm thực / Nhà hàng / Quán ăn", guide:"Cận cảnh món ăn bốc khói, kết cấu giòn/mọng, rót nước sốt chậm, tay đầu bếp thao tác, ánh sáng ấm 3200K, khách ăn ngon miệng. Hook: âm thanh xèo xèo hoặc cú cắn đầu tiên. CTA: ghé quán, đặt bàn, gọi giao hàng." },
    { key:"coffee", label:"Cà phê / Trà sữa / Đồ uống", guide:"Rót cà phê phin từng giọt, đá va ly, giọt nước đọng thành ly, bọt sữa xoáy, không gian quán chill, nắng xiên. Hook: tiếng đá rơi hoặc slow-motion rót. CTA: ghé quán, đặt online, combo ưu đãi." },
    { key:"beauty", label:"Mỹ phẩm / Spa / Làm đẹp", guide:"Cận da căng bóng (macro), kết cấu kem/serum, before–after tinh tế, tay chuyên viên chăm sóc, ánh sáng mềm khuếch tán, tông hồng nude. Không hứa hẹn y khoa quá đà. CTA: đặt lịch, nhận tư vấn, mua ngay." },
    { key:"fashion", label:"Thời trang / Phụ kiện", guide:"Người mẫu bước đi, vải bay theo gió, chuyển cảnh thay đồ, cận chất liệu và đường may, phối đồ nhiều bối cảnh phố/studio. Hook: outfit transition. CTA: xem bộ sưu tập, inbox size, mua tại shop." },
    { key:"realestate", label:"Bất động sản / Nội thất", guide:"Flycam toàn cảnh dự án, dolly đi qua cửa vào phòng khách sáng, ánh nắng giờ vàng, tiện ích hồ bơi/công viên, gia đình sinh hoạt. Hook: góc nhìn từ ban công. CTA: đặt lịch tham quan, nhận bảng giá." },
    { key:"edu", label:"Giáo dục / Khoá học / Trung tâm", guide:"Học viên tập trung, giáo viên tương tác, bảng trắng, khoảnh khắc 'à ra thế', kết quả trước–sau, chứng chỉ. Hook: câu hỏi đánh trúng nỗi đau. CTA: đăng ký học thử, nhận tài liệu miễn phí." },
    { key:"travel", label:"Du lịch / Khách sạn / Homestay", guide:"Flycam cảnh đẹp Việt Nam, khách mở rèm thấy view biển/núi, hồ bơi vô cực, ẩm thực địa phương, hoàng hôn. Hook: cú mở cửa view đẹp. CTA: đặt phòng, xem combo tour." },
    { key:"auto", label:"Ô tô / Xe máy / Phụ tùng", guide:"Xe lướt đường đèo, cận đèn pha bật sáng, bánh xe quay chậm, nội thất da, tiếng động cơ, mưa phản chiếu. Hook: tiếng nổ máy. CTA: lái thử, nhận báo giá, ưu đãi lăn bánh." },
    { key:"tech", label:"Công nghệ / Điện tử / App", guide:"Sản phẩm xoay 360° trên nền tối, ánh sáng viền, cận cổng kết nối, giao diện màn hình mượt, người dùng thao tác đời thường. Hook: tính năng gây bất ngờ. CTA: tải app, mua ngay, trả góp 0%." },
    { key:"health", label:"Y tế / Nha khoa / Phòng khám", guide:"Không gian sạch sáng, bác sĩ áo blouse thân thiện, thiết bị hiện đại, bệnh nhân an tâm mỉm cười. Giọng điệu tin cậy, không phóng đại hiệu quả. CTA: đặt lịch khám, tư vấn miễn phí." },
    { key:"fitness", label:"Gym / Yoga / Thể hình", guide:"Mồ hôi lấp lánh, nâng tạ slow-motion, nhịp tim, động tác yoga trong nắng sớm, before–after thân hình. Hook: tiếng tạ chạm sàn. CTA: tập thử miễn phí, đăng ký PT." },
    { key:"baby", label:"Mẹ & bé / Đồ chơi", guide:"Ánh sáng ấm mềm, bé cười, tay mẹ chăm sóc, sản phẩm an toàn chất liệu mềm, không gian nhà gọn gàng. Giọng ấm áp, tin cậy. CTA: mua cho bé, nhận quà tặng." },
    { key:"furniture", label:"Nội thất / Gia dụng", guide:"Biến đổi căn phòng trước–sau, cận vân gỗ/chất vải, ánh nắng qua rèm, gia đình quây quần, sản phẩm gia dụng thao tác tiện lợi. CTA: tư vấn thiết kế, xem showroom." },
    { key:"agri", label:"Nông sản / Đặc sản / OCOP", guide:"Vườn/ruộng lúc bình minh, tay nông dân thu hoạch, sương trên lá, chế biến thủ công, đóng gói sạch, bữa cơm gia đình. Kể nguồn gốc. CTA: đặt hàng tận vườn, mua làm quà." },
    { key:"finance", label:"Tài chính / Bảo hiểm / Ngân hàng", guide:"Gia đình an tâm, biểu đồ tăng trưởng trực quan, tư vấn viên chuyên nghiệp, điện thoại thao tác app. Không cam kết lợi nhuận. CTA: nhận tư vấn, mở tài khoản." },
    { key:"wedding", label:"Sự kiện / Cưới hỏi / Studio ảnh", guide:"Khoảnh khắc cô dâu chú rể, ánh nến bokeh, hoa trang trí, váy cưới bay, khách nâng ly, bắn pháo giấy. CTA: đặt lịch tư vấn, xem album mẫu." },
    { key:"pet", label:"Thú cưng / Pet shop", guide:"Chó mèo đáng yêu cận mặt, chạy nhảy slow-motion, tắm sấy spa thú cưng, ăn ngon lành, chủ ôm thú cưng. Hook: biểu cảm hài hước. CTA: đặt lịch spa, mua thức ăn." },
    { key:"jewelry", label:"Trang sức / Đồng hồ", guide:"Macro kim cương lấp lánh, ánh sáng spotlight trên nhung đen, xoay sản phẩm chậm, đeo lên tay/cổ người mẫu, phản chiếu sang trọng. CTA: xem tại cửa hàng, khắc tên miễn phí." },
    { key:"affiliate", label:"Bán hàng online / Affiliate / TikTok Shop", guide:"Phong cách UGC: người thật cầm sản phẩm nói thẳng vào camera, unbox, dùng thử, phản ứng chân thật, chữ 'giỏ hàng'. Hook 2 giây đầu cực mạnh. CTA: bấm giỏ hàng, mua kèm voucher." },
    { key:"story", label:"Kể chuyện / Phim ngắn / Giải trí", guide:"Cốt truyện có nhân vật rõ, mâu thuẫn, cao trào, cú twist hoặc cảm xúc ở cuối, góc máy điện ảnh, ánh sáng theo cảm xúc. CTA: theo dõi kênh xem phần tiếp." },
    { key:"other", label:"Khác (tự mô tả trong ý tưởng)", guide:"Bám sát ý tưởng người dùng, hình ảnh rõ ràng, có hook mở đầu và lời kêu gọi hành động cuối video." }
  ];

  const PURPOSES = [
    { key:"ads", label:"Quảng cáo bán hàng" },
    { key:"brand", label:"Giới thiệu thương hiệu" },
    { key:"ugc", label:"Review / UGC kiểu người thật" },
    { key:"story", label:"Kể chuyện cảm xúc" },
    { key:"howto", label:"Hướng dẫn / Mẹo hay" }
  ];

  // Model video đích: độ dài cảnh hợp lệ + cú pháp prompt chuẩn của từng hãng + trang web để học viên dán prompt.
  const TARGETS = [
    { key:"veo3", label:"Veo 3.1 (Google Flow / Gemini)", url:"https://labs.google/fx/tools/flow", dur:8, durs:[8],
      guide:`VEO 3.1 — viết như một shot list điện ảnh, 90–150 từ tiếng Anh, theo đúng thứ tự:
1) Shot & camera: shot type (extreme wide / wide / medium / close-up / macro) + lens + camera movement (slow dolly-in, tracking shot, crane up, handheld, static tripod) + góc máy.
2) Subject: nhân vật mô tả cố định (tuổi, giới tính, tóc, trang phục, đặc điểm) — LẶP LẠI Y HỆT ở mọi cảnh để giữ nhân vật.
3) Action: hành động cụ thể diễn ra trong 8 giây, theo nhịp đầu–giữa–cuối.
4) Scene: bối cảnh, thời điểm, thời tiết, đạo cụ.
5) Lighting & style: ánh sáng (golden hour, soft key light, neon...), màu sắc, chất phim (cinematic, 35mm film, photorealistic).
6) Audio: dòng riêng "Dialogue:" với cú pháp: The woman says in Vietnamese: "..." (lời thoại tiếng Việt ≤ 18 từ cho 8 giây); "SFX:" tiếng động cụ thể; "Ambience:" âm thanh nền; nếu có nhạc ghi "Music:".
7) Kết thúc bằng: "No subtitles, no on-screen text, no watermark."`,
      negative:false },
    { key:"kling", label:"Kling 3.0", url:"https://app.klingai.com", dur:5, durs:[5,10],
      guide:`KLING 3.0 — prompt tiếng Anh 50–90 từ, súc tích, ĐỘNG TỪ CHUYỂN ĐỘNG đặt lên đầu:
Công thức: [Subject + mô tả ngắn] + [hành động chính, rõ biên độ và tốc độ] + [bối cảnh] + [camera movement: dolly in / orbit around / tilt up / follow shot / zoom out] + [lighting] + [style].
- Chỉ 1 hành động chính mỗi cảnh, mô tả vật lý rõ (tóc bay, vải chuyển động, nước bắn).
- Kling 3.0 có âm thanh: thêm câu cuối "Sound: ..." và lời thoại tiếng Việt ngắn trong ngoặc kép nếu cần.
- Viết thêm negative_prompt riêng: các lỗi cần tránh (blurry, distorted face, extra fingers, warped text, flicker).`,
      negative:true },
    { key:"sora2", label:"Sora 2 (OpenAI)", url:"https://sora.chatgpt.com", dur:8, durs:[4,8,12],
      guide:`SORA 2 — viết theo khối như kịch bản quay, tiếng Anh:
- Dòng 1 "Style:" phong cách hình ảnh tổng thể (ví dụ: handheld documentary, 35mm film, warm grade).
- Đoạn mô tả cảnh: nhân vật (mô tả cố định), bối cảnh, ánh sáng, chi tiết đạo cụ.
- "Cinematography:" camera shot, lens, movement, depth of field.
- "Actions:" liệt kê 2–4 nhịp hành động theo thời gian (beat 1, beat 2…), đúng độ dài cảnh.
- "Dialogue:" tên nhân vật: "lời thoại tiếng Việt" (ngắn, tự nhiên).
- "Sound:" tiếng động + không khí.
Sora hiểu vật lý tốt: mô tả lực, trọng lượng, va chạm.`,
      negative:false },
    { key:"seedance", label:"Seedance 2.5 (ByteDance)", url:"https://dreamina.capcut.com", dur:10, durs:[5,10,15],
      guide:`SEEDANCE 2.5 — mạnh về NHIỀU CÚ MÁY trong một video, tiếng Anh 80–140 từ:
- Mở đầu 1 câu tổng quát: subject + bối cảnh + style + lighting.
- Sau đó chia shot bằng nhãn "Shot 1:", "Shot 2:", "Shot 3:" (2–3 shot cho 10 giây), mỗi shot: góc máy (wide/medium/close-up), chuyển động máy (push in, pan, tracking, orbit), hành động.
- Giữ nhân vật và trang phục nhất quán giữa các shot (nhắc lại mô tả ngắn).
- Kết bằng "Sound:" và lời thoại tiếng Việt trong ngoặc kép nếu có.`,
      negative:false },
    { key:"grok", label:"Grok Imagine (xAI)", url:"https://grok.com/imagine", dur:6, durs:[6,10],
      guide:`GROK IMAGINE — prompt tiếng Anh 40–80 từ, trực quan, sinh động, ưu tiên chuyển động:
[Subject] [doing vivid action] in [setting], [camera movement], [lighting/mood], [style: cinematic / anime / 3D / photoreal].
- Mỗi cảnh 1 ý chính, động từ mạnh, màu sắc rõ.
- Thêm "Audio:" mô tả âm thanh và lời thoại tiếng Việt ngắn trong ngoặc kép.
- Tránh nội dung nhạy cảm, giữ chế độ normal.`,
      negative:false },
    { key:"hailuo", label:"Hailuo 2.3 (MiniMax)", url:"https://hailuoai.video", dur:6, durs:[6],
      guide:`HAILUO 2.3 — tiếng Anh 50–100 từ, dùng LỆNH CAMERA TRONG NGOẶC VUÔNG đúng chuẩn MiniMax, đặt ngay tại thời điểm chuyển động:
Lệnh hợp lệ: [Truck left], [Truck right], [Pan left], [Pan right], [Push in], [Pull out], [Pedestal up], [Pedestal down], [Tilt up], [Tilt down], [Zoom in], [Zoom out], [Shake], [Tracking shot], [Static shot]. Có thể ghép 2 lệnh: [Push in, Pan right].
Công thức: Subject + action chi tiết (Hailuo giỏi hành động, vật lý, biểu cảm) + scene + [camera command] + lighting + style.
Ví dụ: "A young chef flips a sizzling pan, flames rising [Push in], sparks glow in a dark kitchen, cinematic warm light."`,
      negative:false },
    { key:"wan", label:"Wan 3.0 (Alibaba)", url:"https://wan.video", dur:5, durs:[5,10],
      guide:`WAN 3.0 — tiếng Anh 70–120 từ theo công thức: Subject (mô tả) + Scene (mô tả) + Motion (mô tả chuyển động) + Camera language (shot size, angle, movement: e.g. low-angle tracking shot, slow push-in) + Atmosphere (ánh sáng, màu, cảm xúc) + Style (photoreal / cinematic / 3D animation).
- Wan có âm thanh: thêm "Audio:" tiếng động và lời thoại tiếng Việt trong ngoặc kép.
- Mô tả rõ thứ tự chuyển động trong cảnh.`,
      negative:false }
  ];

  const VOICES = [
    { key:"none", label:"Không lời, chỉ âm thanh & nhạc" },
    { key:"vo", label:"Lời dẫn (voice-over) tiếng Việt" },
    { key:"talk", label:"Nhân vật nói tiếng Việt" }
  ];

  const find = (list, k) => list.find(x => x.key === k) || list[0];

  // Tham chiếu: o.ref = { video: bool, images: số ảnh, mode: "copy" (làm giống) | "inspire" (lấy cảm hứng) }
  function refInfo(o) {
    const r = o.ref || {};
    const video = Boolean(r.video), images = Math.max(0, Number(r.images) || 0);
    return { has: video || images > 0, video, images, copy: r.mode !== "inspire" };
  }
  function refList(r) {
    return [r.video ? "1 video" : "", r.images ? r.images + " ảnh" : ""].filter(Boolean).join(" và ");
  }

  // Ghép lệnh cho AI. Trả về { system, user } — dùng được cho Gemini, GPT, DeepSeek… và để dán vào app Gemini.
  function buildBrief(o) {
    const ind = find(INDUSTRIES, o.industry), pur = find(PURPOSES, o.purpose), tg = find(TARGETS, o.target), vc = find(VOICES, o.voice);
    const n = Math.min(12, Math.max(1, Number(o.scenes) || 5));
    const dur = tg.durs.includes(Number(o.dur)) ? Number(o.dur) : tg.dur;
    const R = refInfo(o);
    const refRules = !R.has ? "" : R.copy ? `

THAM CHIẾU — LÀM GIỐNG: người dùng gửi kèm ${refList(R)} tham chiếu. Bước 1: xem thật kỹ${R.video ? " toàn bộ video từ đầu đến cuối" : ""}, phân tích: số cảnh/cú máy và thời lượng từng cảnh, thứ tự cảnh, cỡ cảnh và góc máy, chuyển động máy, bố cục, ánh sáng, bảng màu, nhịp dựng và chuyển cảnh, nhân vật (ngoại hình, trang phục, biểu cảm), bối cảnh, đạo cụ, chữ trên màn hình, âm thanh, nhạc và lời thoại. Bước 2: viết kịch bản BÁM SÁT GIỐNG tham chiếu — ${R.video ? "cùng số cảnh và thứ tự cảnh như video (bỏ qua số cảnh người dùng chọn nếu khác), " : ""}cùng góc máy, chuyển động, bố cục, ánh sáng, màu sắc, nhịp và phong cách; mỗi video_prompt mô tả lại đúng cảnh tương ứng chi tiết tới mức tái tạo được. Chỉ thay sản phẩm, thương hiệu, nhân vật và thông điệp theo Ý TƯỞNG của người dùng (nếu người dùng không ghi ý tưởng thì giữ nguyên nội dung tham chiếu). Không sao chép logo, chữ thương hiệu của người khác.${R.images ? " Ảnh tham chiếu là nhân vật/sản phẩm/phong cách cần giữ: mô tả nhân vật và sản phẩm trong prompt khớp đúng với ảnh." : ""}
Ghi kết quả phân tích ngắn gọn bằng tiếng Việt vào trường "reference_analysis" (từng cảnh: thời lượng, góc máy, chuyển động, nội dung; và phong cách chung).` : `

THAM CHIẾU — LẤY CẢM HỨNG: người dùng gửi kèm ${refList(R)} tham chiếu. Hãy phân tích phong cách hình ảnh, ánh sáng, màu sắc, nhịp dựng, kiểu góc máy và cảm xúc của tham chiếu rồi áp dụng vào kịch bản mới theo Ý TƯỞNG của người dùng (nội dung mới, không chép từng cảnh). Ghi tóm tắt phong cách đã học bằng tiếng Việt vào trường "reference_analysis".`;
    const system = `Bạn là đạo diễn quảng cáo và chuyên gia viết prompt cho AI tạo video tại Việt Nam. Bạn viết kịch bản chia cảnh và prompt ĐÚNG CHUẨN CÚ PHÁP của model được chỉ định, chi tiết tới mức dán vào là tạo được video đẹp ngay.

QUY TẮC CHUNG:
- Prompt ảnh và prompt video viết bằng TIẾNG ANH; lời thoại, lời dẫn và mô tả cho người đọc viết bằng TIẾNG VIỆT có dấu.
- Nhân vật chính (nếu có) phải có mô tả ngoại hình cố định và lặp lại y hệt ở mọi cảnh để AI giữ nhân vật nhất quán. Bối cảnh, bảng màu, ánh sáng nhất quán xuyên suốt.
- Mỗi cảnh dài đúng ${dur} giây: hành động và lời thoại phải vừa ${dur} giây (khoảng ${Math.round(dur * 2.3)} từ tiếng Việt nói được).
- Cảnh 1 là HOOK mạnh trong 2 giây đầu; cảnh cuối có lời kêu gọi hành động (CTA) rõ ràng.
- Không đưa chữ, logo, watermark vào hình (trừ khi người dùng yêu cầu). Không nội dung nhạy cảm, không hứa hẹn sai sự thật.
- image_prompt: prompt tiếng Anh 50–90 từ để tạo ẢNH KHUNG ĐẦU của cảnh (dùng cho Nano Banana / Midjourney / ChatGPT, rồi đưa ảnh vào chế độ ảnh → video): subject, composition, setting, lens, lighting, color palette, style, "photorealistic" hoặc phong cách đã chọn, tỉ lệ ${o.ratio || "16:9"}.

CÚ PHÁP BẮT BUỘC CHO video_prompt:
${tg.guide}${refRules}

ĐẦU RA: CHỈ TRẢ VỀ MỘT KHỐI JSON hợp lệ, không markdown, không giải thích, đúng cấu trúc:
{"title":"tên video tiếng Việt","hook":"câu hook tiếng Việt",${R.has ? '"reference_analysis":"phân tích tham chiếu bằng tiếng Việt",' : ''}"character":"mô tả nhân vật chính bằng tiếng Anh (để trống nếu không có)","scenes":[{"n":1,"purpose":"vai trò cảnh (Hook/Vấn đề/Giải pháp/Chứng minh/CTA…)","description_vi":"mô tả cảnh bằng tiếng Việt cho người đọc","camera":"góc máy & chuyển động (tiếng Việt)","image_prompt":"…","video_prompt":"…"${tg.negative ? ',"negative_prompt":"…"' : ''},"dialogue_vi":"lời thoại/lời dẫn tiếng Việt hoặc rỗng","sound":"âm thanh & nhạc (tiếng Việt)"}],"caption_vi":"caption đăng mạng xã hội kèm emoji","hashtags":["#…"]}`;
    const user = [
      `NGÀNH: ${ind.label}`,
      `ĐẶC TRƯNG NGÀNH: ${ind.guide}`,
      `MỤC ĐÍCH VIDEO: ${pur.label}`,
      `Ý TƯỞNG / SẢN PHẨM: ${String(o.idea || "").trim() || (R.has ? "(không ghi — giữ nội dung của tham chiếu)" : "")}`,
      o.brand ? `TÊN THƯƠNG HIỆU / SẢN PHẨM: ${o.brand}` : "",
      R.has ? `THAM CHIẾU GỬI KÈM: ${refList(R)} — chế độ ${R.copy ? "LÀM GIỐNG tham chiếu" : "LẤY CẢM HỨNG từ tham chiếu"}` : "",
      `MODEL TẠO VIDEO: ${tg.label}`,
      R.has && R.copy && R.video ? `SỐ CẢNH: bằng số cảnh của video tham chiếu (mỗi cảnh tối đa ${dur} giây theo giới hạn của model; cảnh dài hơn thì tách đôi)` : `SỐ CẢNH: ${n} — mỗi cảnh ${dur} giây (tổng ${n * dur} giây)`,
      `TỈ LỆ KHUNG HÌNH: ${o.ratio === "9:16" ? "dọc 9:16 (TikTok/Reels/Shorts)" : o.ratio === "1:1" ? "vuông 1:1" : "ngang 16:9 (YouTube/Facebook)"}`,
      o.style ? `PHONG CÁCH HÌNH ẢNH: ${o.style}` : "",
      `LỜI THOẠI: ${vc.label}${o.voice === "none" ? " — để dialogue_vi rỗng, video_prompt không có lời nói" : ""}`,
      "",
      R.has && R.copy && R.video ? `Phân tích video tham chiếu rồi viết đủ các cảnh giống video, mỗi video_prompt đúng cú pháp ${tg.label} ở trên. Trả về đúng JSON.` : `Viết đủ ${n} cảnh, mỗi video_prompt đúng cú pháp ${tg.label} ở trên. Trả về đúng JSON.`
    ].filter(Boolean).join("\n");
    return { system, user, target: tg, dur, n };
  }

  // Đọc kết quả AI: bóc JSON (kể cả khi có ```json hoặc chữ thừa), chuẩn hoá các trường.
  function parseScript(text) {
    let t = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    if (a < 0 || b <= a) throw new Error("AI không trả về đúng định dạng. Bấm Viết lại.");
    let j;
    try { j = JSON.parse(t.slice(a, b + 1)); }
    catch (e) {
      // Sửa lỗi phổ biến: dấu phẩy thừa trước } hoặc ]
      try { j = JSON.parse(t.slice(a, b + 1).replace(/,\s*([}\]])/g, "$1")); }
      catch { throw new Error("Không đọc được kết quả của AI. Bấm Viết lại."); }
    }
    const s = v => (v == null ? "" : String(v)).trim();
    const scenes = (Array.isArray(j.scenes) ? j.scenes : []).map((c, i) => ({
      n: Number(c.n) || i + 1, purpose: s(c.purpose), description_vi: s(c.description_vi || c.description), camera: s(c.camera),
      image_prompt: s(c.image_prompt), video_prompt: s(c.video_prompt || c.prompt), negative_prompt: s(c.negative_prompt),
      dialogue_vi: s(c.dialogue_vi || c.dialogue), sound: s(c.sound)
    })).filter(c => c.video_prompt);
    if (!scenes.length) throw new Error("AI chưa viết được cảnh nào. Thử viết rõ ý tưởng hơn rồi bấm Viết lại.");
    return { title: s(j.title), hook: s(j.hook), reference_analysis: s(j.reference_analysis), character: s(j.character), scenes, caption_vi: s(j.caption_vi), hashtags: Array.isArray(j.hashtags) ? j.hashtags.map(s).filter(Boolean) : [] };
  }

  /* ===================== KỊCH BẢN ẢNH ===================== */
  // Loại bộ ảnh: AI lên danh sách ảnh theo đúng nhu cầu (mỗi ảnh có vai trò riêng).
  const IMAGE_PURPOSES = [
    { key:"ads", label:"Ảnh quảng cáo / banner bán hàng", guide:"Mỗi ảnh một góc tiếp cận: lợi ích chính, cảm xúc khách hàng, ưu đãi, so sánh trước–sau, lifestyle. Chừa khoảng trống cho chữ quảng cáo." },
    { key:"product", label:"Ảnh sản phẩm nhiều góc (packshot)", guide:"Cùng một sản phẩm giữ y hệt hình dáng, màu, nhãn: chính diện nền trắng, 3/4, cận chi tiết chất liệu, đặt trong bối cảnh sử dụng, nhóm combo, flatlay." },
    { key:"character", label:"Bộ ảnh nhân vật nhất quán", guide:"Một nhân vật duy nhất với mô tả ngoại hình cố định lặp lại y hệt: ảnh tham chiếu toàn thân nền trơn, chân dung cận, nhiều biểu cảm, nhiều bối cảnh/tư thế — dùng làm nhân vật cho video." },
    { key:"thumbnail", label:"Thumbnail YouTube / TikTok", guide:"Bố cục mạnh, mặt người biểu cảm phóng đại, tương phản cao, chừa chỗ cho chữ to 3–5 từ, màu nổi bật, đọc được ở kích thước nhỏ. Mỗi ảnh một phương án khác nhau." },
    { key:"carousel", label:"Bài đăng carousel nhiều trang", guide:"Các trang nối tiếp nhau như một câu chuyện: trang bìa hook, các trang nội dung, trang CTA. Cùng bảng màu, phong cách đồ hoạ nhất quán, có chữ tiêu đề mỗi trang." },
    { key:"poster", label:"Poster sự kiện / khuyến mãi", guide:"Bố cục poster có tiêu đề lớn, thông tin thời gian/địa điểm/ưu đãi, hình ảnh chủ đạo ấn tượng; mỗi ảnh là một phương án thiết kế khác." },
    { key:"storyboard", label:"Ảnh khung hình cho video (storyboard)", guide:"Mỗi ảnh là khung đầu của một cảnh video, nối tiếp câu chuyện, nhân vật và bối cảnh nhất quán, góc máy điện ảnh — để đưa vào chế độ ảnh → video." }
  ];

  // Phần mềm tạo ảnh đích: cú pháp prompt chuẩn + trang web để dán prompt.
  const IMAGE_TARGETS = [
    { key:"midjourney", label:"Midjourney v7 / v8", url:"https://www.midjourney.com/imagine",
      guide:`MIDJOURNEY — tiếng Anh, cụm từ mô tả ngắn gọn cách nhau bằng dấu phẩy, ý quan trọng nhất đặt đầu:
[subject chính + chi tiết], [hành động/tư thế], [bối cảnh], [bố cục & góc máy], [ánh sáng], [màu sắc], [chất liệu/phong cách: editorial photography, 85mm, film grain…]
Kết thúc bằng THAM SỐ đúng chuẩn: --ar ${"{RATIO}"} --v 7 --style raw (ảnh thật) hoặc bỏ --style raw (nghệ thuật), --s 100–400 tuỳ mức nghệ thuật, thêm "--no text, watermark, extra fingers" khi cần loại bỏ. Không viết câu dài; không dùng từ thừa như "please, create".
Chữ trong ảnh: Midjourney vẽ chữ kém — để chữ cho phần mềm thiết kế, ghi text_overlay riêng.`, negative:false },
    { key:"nanobanana", label:"Nano Banana (Gemini)", url:"https://gemini.google.com/app",
      guide:`NANO BANANA / GEMINI — tiếng Anh, viết như mô tả cho nhiếp ảnh gia, 1 đoạn 60–110 từ, câu hoàn chỉnh:
"A [shot type] photo of [subject chi tiết], [action], in [setting]. [Lighting]. [Camera/lens]. [Mood, color palette]. [Style]. Aspect ratio ${"{RATIO}"}."
- Nano Banana vẽ CHỮ rất tốt: nếu cần chữ trên ảnh, ghi rõ: with the headline "…" in bold sans-serif at the top (chữ tiếng Việt giữ nguyên dấu trong ngoặc kép).
- Khi có ảnh mẫu (sản phẩm/nhân vật) học viên tải lên Gemini, thêm câu: "Keep the product/person exactly as in the reference image."`, negative:false },
    { key:"chatgpt", label:"ChatGPT (GPT Image)", url:"https://chatgpt.com",
      guide:`CHATGPT / GPT IMAGE — tiếng Anh hoặc tiếng Việt đều được, ưu tiên tiếng Anh, viết như brief thiết kế 70–130 từ, có cấu trúc:
"Create a ${"{RATIO}"} image. Subject: … Scene: … Composition: … Lighting: … Style: … Text on image: "…" (font, vị trí, màu). Details to avoid: …"
- GPT Image hiểu bố cục và chữ tốt: ghi chính xác chữ cần in (tiếng Việt có dấu trong ngoặc kép), vị trí, cỡ chữ.
- Nêu rõ "photorealistic" hoặc phong cách minh hoạ cụ thể.`, negative:false },
    { key:"seedream", label:"Seedream (Dreamina / CapCut)", url:"https://dreamina.capcut.com",
      guide:`SEEDREAM — tiếng Anh 50–100 từ theo thứ tự: chủ thể + hành động → bối cảnh → bố cục/góc máy → ánh sáng → phong cách & chất lượng (ultra detailed, realistic skin texture, commercial photography).
- Seedream vẽ người châu Á, da tự nhiên rất tốt: mô tả rõ dân tộc, độ tuổi, kiểu tóc.
- Chữ trên ảnh: ghi trong ngoặc kép, nói rõ vị trí. Ghi tỉ lệ ${"{RATIO}"} ở cuối.`, negative:false },
    { key:"flux", label:"Flux (Krea / BFL)", url:"https://www.krea.ai",
      guide:`FLUX — tiếng Anh, câu văn tự nhiên 50–100 từ, chủ thể đặt ngay đầu câu, mô tả cụ thể vật liệu, ánh sáng, ống kính (shot on 35mm, f/1.8). Flux KHÔNG dùng negative prompt và không dùng trọng số kiểu (word:1.2) — chỉ mô tả điều muốn có. Chữ trên ảnh: the text "…" in … font. Tỉ lệ ${"{RATIO}"}.`, negative:false },
    { key:"grok", label:"Grok Imagine (xAI)", url:"https://grok.com/imagine",
      guide:`GROK IMAGINE — tiếng Anh 40–80 từ, trực quan, màu sắc mạnh: [subject] [action/pose] in [setting], [lighting], [style: photoreal / anime / 3D / cinematic], [mood]. Ngắn gọn, mỗi ảnh một ý rõ ràng. Tỉ lệ ${"{RATIO}"}.`, negative:false }
  ];

  function buildImageBrief(o) {
    const ind = find(INDUSTRIES, o.industry), pur = find(IMAGE_PURPOSES, o.purpose), tg = find(IMAGE_TARGETS, o.target);
    const n = Math.min(12, Math.max(1, Number(o.count) || 6));
    const ratio = ["1:1","4:5","9:16","16:9","3:4","2:3"].includes(o.ratio) ? o.ratio : "1:1";
    const R = refInfo(o);
    const refRules = !R.has ? "" : R.copy ? `

THAM CHIẾU — LÀM GIỐNG: người dùng gửi kèm ${refList(R)} tham chiếu. Phân tích thật kỹ từng ảnh${R.video ? " (và các khung hình chính của video)" : ""}: chủ thể, tư thế, bố cục, góc chụp và tiêu cự, ánh sáng (hướng, độ mềm, nhiệt độ màu), bảng màu, chất liệu, hậu cảnh, phong cách hậu kỳ, chữ trên ảnh. Viết prompt để tạo ra ảnh GIỐNG tham chiếu nhất có thể (cùng bố cục, góc, ánh sáng, màu, phong cách) — ${R.images ? "mỗi ảnh tham chiếu ứng với ít nhất một ảnh trong bộ, " : ""}chỉ thay sản phẩm/nhân vật/chữ theo Ý TƯỞNG của người dùng (không ghi ý tưởng thì giữ nguyên nội dung). Không sao chép logo, chữ thương hiệu của người khác. Ghi phân tích ngắn gọn bằng tiếng Việt vào trường "reference_analysis".` : `

THAM CHIẾU — LẤY CẢM HỨNG: người dùng gửi kèm ${refList(R)} tham chiếu. Học phong cách, ánh sáng, bảng màu, cách bố cục của tham chiếu và áp dụng vào bộ ảnh mới theo Ý TƯỞNG của người dùng. Ghi tóm tắt phong cách đã học bằng tiếng Việt vào trường "reference_analysis".`;
    const system = `Bạn là giám đốc sáng tạo và chuyên gia viết prompt cho AI tạo ảnh tại Việt Nam. Bạn lên một BỘ ẢNH theo yêu cầu và viết prompt ĐÚNG CHUẨN CÚ PHÁP của phần mềm được chỉ định, chi tiết tới mức dán vào là ra ảnh đẹp ngay.

QUY TẮC CHUNG:
- prompt viết bằng TIẾNG ANH (riêng chữ cần in lên ảnh giữ nguyên tiếng Việt có dấu trong ngoặc kép); mô tả cho người đọc viết TIẾNG VIỆT.
- Nếu có nhân vật/sản phẩm: mô tả cố định (ngoại hình, trang phục / hình dáng, màu, nhãn) và LẶP LẠI Y HỆT trong mọi prompt để bộ ảnh nhất quán. Bảng màu và phong cách nhất quán.
- Mỗi ảnh có vai trò khác nhau, không trùng ý.
- Không nội dung nhạy cảm, không dùng logo/thương hiệu của người khác, không hứa hẹn sai sự thật.
- Tỉ lệ khung hình: ${ratio}.

CÚ PHÁP BẮT BUỘC CHO prompt:
${tg.guide.split("{RATIO}").join(ratio)}${refRules}

ĐẦU RA: CHỈ TRẢ VỀ MỘT KHỐI JSON hợp lệ, không markdown, không giải thích, đúng cấu trúc:
{"title":"tên bộ ảnh tiếng Việt","concept":"ý tưởng chung tiếng Việt",${R.has ? '"reference_analysis":"phân tích tham chiếu bằng tiếng Việt",' : ''}"character":"mô tả nhân vật/sản phẩm cố định bằng tiếng Anh (để trống nếu không có)","palette":"bảng màu chủ đạo","images":[{"n":1,"purpose":"vai trò ảnh","description_vi":"mô tả ảnh bằng tiếng Việt","layout":"bố cục & góc chụp (tiếng Việt)","prompt":"…","text_overlay":"chữ nên thêm lên ảnh (tiếng Việt) hoặc rỗng"}],"caption_vi":"caption đăng mạng xã hội kèm emoji","hashtags":["#…"]}`;
    const user = [
      `NGÀNH: ${ind.label}`,
      `ĐẶC TRƯNG NGÀNH: ${ind.guide}`,
      `LOẠI BỘ ẢNH: ${pur.label} — ${pur.guide}`,
      `Ý TƯỞNG / SẢN PHẨM: ${String(o.idea || "").trim() || (R.has ? "(không ghi — giữ nội dung của tham chiếu)" : "")}`,
      R.has ? `THAM CHIẾU GỬI KÈM: ${refList(R)} — chế độ ${R.copy ? "LÀM GIỐNG tham chiếu" : "LẤY CẢM HỨNG từ tham chiếu"}` : "",
      o.brand ? `TÊN THƯƠNG HIỆU / SẢN PHẨM: ${o.brand}` : "",
      o.style ? `PHONG CÁCH HÌNH ẢNH: ${o.style}` : "",
      `PHẦN MỀM TẠO ẢNH: ${tg.label}`,
      `SỐ ẢNH: ${n}`,
      `Viết đủ ${n} ảnh, mỗi prompt đúng cú pháp ${tg.label} ở trên. Trả về đúng JSON.`
    ].filter(Boolean).join("\n");
    return { system, user, target: tg, n, ratio };
  }

  function parseJson(text) {
    const t = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    if (a < 0 || b <= a) throw new Error("AI không trả về đúng định dạng. Bấm Viết lại.");
    try { return JSON.parse(t.slice(a, b + 1)); }
    catch { try { return JSON.parse(t.slice(a, b + 1).replace(/,\s*([}\]])/g, "$1")); } catch { throw new Error("Không đọc được kết quả của AI. Bấm Viết lại."); } }
  }
  function parseImageSet(text) {
    const j = parseJson(text);
    const s = v => (v == null ? "" : String(v)).trim();
    const images = (Array.isArray(j.images) ? j.images : []).map((c, i) => ({
      n: Number(c.n) || i + 1, purpose: s(c.purpose), description_vi: s(c.description_vi || c.description), layout: s(c.layout),
      prompt: s(c.prompt), text_overlay: s(c.text_overlay)
    })).filter(c => c.prompt);
    if (!images.length) throw new Error("AI chưa viết được ảnh nào. Thử viết rõ ý tưởng hơn rồi bấm Viết lại.");
    return { title: s(j.title), concept: s(j.concept), reference_analysis: s(j.reference_analysis), character: s(j.character), palette: s(j.palette), images, caption_vi: s(j.caption_vi), hashtags: Array.isArray(j.hashtags) ? j.hashtags.map(s).filter(Boolean) : [] };
  }

  const api = { INDUSTRIES, PURPOSES, TARGETS, VOICES, IMAGE_PURPOSES, IMAGE_TARGETS, buildBrief, buildImageBrief, parseScript, parseImageSet };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.StudioScripts = api;
})(typeof window !== "undefined" ? window : globalThis);
