// Nội dung Module 00 — Bắt đầu làm Video AI: 4 bài đọc mở đầu khóa học.
// Phần [trong ngoặc vuông] là biến học viên tự thay.
module.exports = {
  'Quy trình làm một video AI từ A–Z': {
    summary: `Chào mừng bạn đến với khóa học! Bài đầu tiên giúp bạn nhìn thấy toàn bộ "bản đồ" làm một video AI trước khi đi vào từng công cụ. Mọi video AI – quảng cáo, affiliate, giải trí hay giáo dục – đều đi qua 8 bước giống nhau: Ý tưởng → Kịch bản → Chia cảnh → Tạo ảnh → Tạo video → Giọng nói & âm thanh → Dựng phim → Xuất & đăng.

Điểm khác biệt lớn nhất giữa video AI "nghiệp dư" và "chuyên nghiệp" không nằm ở công cụ đắt tiền, mà ở việc làm đúng thứ tự: có kịch bản rõ ràng trước, giữ nhân vật đồng nhất, mỗi cảnh chỉ một hành động, và dựng lại có nhịp. Các module 01 → 09 sẽ dạy kỹ từng bước, Module 10 ghép tất cả thành một quy trình hoàn chỉnh.

Đọc các thẻ bên dưới theo thứ tự 1 → 8. Cuối bài có một ví dụ hoàn chỉnh (video quảng cáo 20 giây) để bạn hình dung kết quả.`,
    keyPoints: [
      'Luôn đi đúng thứ tự: kịch bản trước, hình ảnh sau – đừng "tạo video thử" khi chưa biết video nói gì.',
      'Một video ngắn 20–30 giây thường gồm 4–6 cảnh, mỗi cảnh 3–8 giây và chỉ 1 hành động chính.',
      'Tạo ảnh trước rồi biến ảnh thành video giúp kiểm soát nhân vật, sản phẩm và bố cục tốt hơn nhiều.',
      'Lưu lại mọi prompt đã dùng theo từng dự án – video sau sẽ nhanh gấp đôi.',
      'Video đầu tiên chỉ cần "xong", chưa cần hoàn hảo. Chất lượng đến từ số lượng video bạn làm.',
    ],
    resources: [
      ['ChatGPT – viết kịch bản', 'https://chatgpt.com'],
      ['Google Flow – tạo video VEO3', 'https://labs.google/fx/tools/flow'],
      ['Kling AI – biến ảnh thành video', 'https://klingai.com'],
      ['CapCut – dựng video', 'https://www.capcut.com'],
    ],
    prompts: [
      ['Sơ đồ 8 bước làm video AI', `BƯỚC 1 – Ý TƯỞNG: chọn chủ đề, khán giả, mục tiêu (bán hàng / tăng follow / giải trí)        → Module 01, 02, 06
BƯỚC 2 – KỊCH BẢN: hook 3 giây đầu + nội dung chính + lời kêu gọi (CTA)                       → Module 01, 02, 06
BƯỚC 3 – CHIA CẢNH: mỗi cảnh 3–8 giây, ghi rõ hình ảnh + lời thoại + góc máy                 → Module 01, 02
BƯỚC 4 – TẠO ẢNH: nhân vật, sản phẩm, bối cảnh cho từng cảnh (giữ nhân vật đồng nhất)        → Module 03
BƯỚC 5 – TẠO VIDEO: biến ảnh thành video hoặc tạo video từ prompt                            → Module 04 (VEO3), 05 (Kling)
BƯỚC 6 – GIỌNG NÓI & ÂM THANH: lồng tiếng, nhạc nền, hiệu ứng âm thanh                       → Module 07, 08
BƯỚC 7 – DỰNG PHIM: ghép cảnh, phụ đề, chữ, logo, chuyển cảnh                                → Module 09
BƯỚC 8 – XUẤT & ĐĂNG: xuất đúng tỉ lệ, viết tiêu đề, hashtag, đăng đúng giờ                  → Module 09, 10`],
      ['Bước 1 – Chốt ý tưởng trong 1 câu', `Trước khi mở bất kỳ công cụ nào, hãy điền câu này:
"Video của tôi dành cho [ai – khán giả], giúp họ [biết / muốn / làm điều gì], trong [số giây] giây, đăng trên [TikTok / Reels / YouTube Shorts / Facebook], tỉ lệ [9:16 / 16:9]."

Ví dụ: "Video của tôi dành cho dân văn phòng 25–35 tuổi, giúp họ muốn mua ly giữ nhiệt, trong 20 giây, đăng trên TikTok, tỉ lệ 9:16."`],
      ['Bước 2 – Nhờ ChatGPT viết kịch bản', `Bạn là biên kịch video ngắn. Viết kịch bản video [số giây] giây cho [chủ đề / sản phẩm], khán giả [mô tả khán giả], mục tiêu [mục tiêu].
Yêu cầu: 3 giây đầu là hook gây tò mò; chia 4–6 cảnh; mỗi cảnh ghi Thời lượng | Hình ảnh | Lời thoại / lời kể | Chữ trên màn hình; kết thúc bằng lời kêu gọi hành động rõ ràng.`],
      ['Bước 3 – Bảng chia cảnh (mẫu điền)', `CẢNH | THỜI LƯỢNG | HÌNH ẢNH | LỜI THOẠI / LỜI KỂ | GÓC MÁY | CÔNG CỤ
1 | 3s | [hook – hình gây chú ý] | "[câu hook]" | [cận cảnh] | [VEO3 / Kling]
2 | 5s | [vấn đề của khách hàng] | "[lời thoại]" | [trung cảnh] | [ ]
3 | 5s | [sản phẩm / giải pháp xuất hiện] | "[lời thoại]" | [dolly in] | [ ]
4 | 4s | [kết quả / cảm xúc] | "[lời thoại]" | [cận mặt] | [ ]
5 | 3s | [CTA + logo + giá] | "[lời kêu gọi]" | [tĩnh] | [CapCut]`],
      ['Bước 4 – Thẻ nhân vật dùng cho mọi cảnh', `Viết 1 lần, dán vào MỌI prompt ảnh / video để nhân vật không bị đổi mặt:
CHARACTER: a [tuổi]-year-old Vietnamese [giới tính], [khuôn mặt], [kiểu tóc + màu tóc], wearing [trang phục cố định có 1 chi tiết dễ nhận, ví dụ: a mustard-yellow jacket].
Mẹo: tạo 1 ảnh chân dung gốc đẹp nhất → dùng làm ảnh tham chiếu cho các cảnh sau (học kỹ ở Module 03).`],
      ['Bước 5 – Chọn VEO3 hay Kling cho từng cảnh', `Nhân vật NÓI THOẠI, cần âm thanh đồng bộ khẩu hình → VEO3 (Module 04)
Đã có ảnh đẹp, muốn ảnh CHUYỂN ĐỘNG tự nhiên → Kling image-to-video (Module 05)
Sản phẩm xoay, bay, biến hình (khung đầu – khung cuối) → Kling
Cảnh phong cảnh, điện ảnh có âm thanh nền → VEO3
Quy tắc vàng: mỗi clip chỉ 1 hành động chính + 1 chuyển động camera.`],
      ['Bước 6–7 – Âm thanh & dựng phim', `☐ Lồng tiếng / lời thoại rõ, đúng chính tả (Module 07)
☐ Nhạc nền đúng cảm xúc, âm lượng thấp hơn giọng nói (Module 08)
☐ 3–6 hiệu ứng âm thanh ở chuyển cảnh và điểm nhấn
☐ Ghép cảnh theo nhịp nhạc, cắt bỏ đoạn thừa đầu/cuối mỗi clip (Module 09)
☐ Phụ đề tối đa 2 dòng, đặt ở 1/3 dưới khung hình
☐ Thêm logo, giá, ưu đãi ở cảnh cuối`],
      ['Bước 8 – Checklist trước khi đăng', `☐ Đúng tỉ lệ: 9:16 (TikTok, Reels, Shorts) hoặc 16:9 (YouTube)
☐ Xuất 1080p, 30fps
☐ Xem lại ở tốc độ 0.5x: không có mặt / tay / sản phẩm bị biến dạng
☐ Xem 1 lần tắt tiếng: phụ đề vẫn đủ hiểu nội dung
☐ Tiêu đề + mô tả + 3–5 hashtag + lời kêu gọi
☐ Ghi nhãn "nội dung AI" nếu nền tảng yêu cầu`],
      ['Ví dụ hoàn chỉnh – Kịch bản quảng cáo 20 giây', `SẢN PHẨM: ly giữ nhiệt [tên thương hiệu] – giữ đá 24 giờ. KHÁN GIẢ: dân văn phòng. TỈ LỆ: 9:16.
Cảnh 1 (3s) – Hook: cô gái nhìn ly cà phê đá đã tan hết, thở dài: "Mới 10 giờ sáng mà đá tan sạch rồi?"
Cảnh 2 (5s) – Giải pháp: cô lấy ly giữ nhiệt màu pastel từ túi, rót cà phê đá vào.
Cảnh 3 (5s) – Chứng minh: cảnh 4 giờ chiều, mở nắp ly, đá vẫn còn nguyên, hơi lạnh bốc lên.
Cảnh 4 (4s) – Cảm xúc: cô uống một ngụm, mỉm cười sảng khoái nhìn camera.
Cảnh 5 (3s) – CTA: ly đặt trên bàn làm việc + chữ "Giữ lạnh 24h – Giảm 20% hôm nay" + logo.`],
      ['Ví dụ hoàn chỉnh – Prompt cảnh 1 (VEO3)', `Vertical 9:16, close-up, eye level. A tired young Vietnamese office woman in a white blouse sits at her desk in a bright modern office, looking at a plastic cup of iced coffee where all the ice has melted. She sighs and says in Vietnamese: "Mới 10 giờ sáng mà đá tan sạch rồi?"
Lighting: soft cool office light. Camera: static, shallow depth of field.
Audio: clear voice, quiet office ambience, no music. No subtitles, no text on screen.`],
      ['Ví dụ hoàn chỉnh – Prompt cảnh 3 (Kling, từ ảnh)', `[Dùng ảnh ly giữ nhiệt thật làm khung hình đầu]
The lid of the tumbler slowly opens, revealing ice cubes still intact inside, cold mist gently rising from the top. Afternoon sunlight from the window.
Camera: slow push in toward the opening.
Keep the tumbler shape, color and logo exactly the same as the input image.

Negative prompt: label distortion, morphing, extra objects, flickering, text`],
    ],
  },

  'Các công cụ sẽ dùng trong khóa học': {
    summary: `Khóa học dùng một bộ công cụ AI gọn nhẹ, mỗi công cụ đảm nhận đúng một việc trong quy trình. Bạn KHÔNG cần mua tất cả ngay từ đầu: hầu hết công cụ đều có gói miễn phí hoặc tặng credit để học và thực hành. Chỉ nâng cấp khi bạn đã làm video đều và biết mình dùng công cụ nào nhiều nhất.

Bài này giới thiệu từng nhóm công cụ, học ở module nào, và gợi ý bộ công cụ "khởi đầu miễn phí" để bạn có thể làm video đầu tiên ngay trong tuần này. Giá và gói dịch vụ của các công cụ AI thay đổi thường xuyên – hãy xem trang giá chính thức của từng công cụ trước khi nâng cấp.`,
    keyPoints: [
      'Viết kịch bản & prompt: ChatGPT (Module 01), Gemini (Module 02), Grok (Module 06).',
      'Tạo ảnh: công cụ tạo ảnh AI như ChatGPT tạo ảnh, Gemini, Midjourney, Ideogram (Module 03).',
      'Tạo video: VEO3 trên Google Flow / Gemini (Module 04) và Kling AI (Module 05).',
      'Giọng nói: ElevenLabs hoặc giọng có sẵn trong CapCut (Module 07). Nhạc: Suno (Module 08).',
      'Dựng & hoàn thiện: CapCut trên máy tính hoặc điện thoại (Module 09). Thumbnail: Canva.',
    ],
    resources: [
      ['ChatGPT', 'https://chatgpt.com'],
      ['Gemini', 'https://gemini.google.com'],
      ['Grok', 'https://grok.com'],
      ['Google Flow (VEO3)', 'https://labs.google/fx/tools/flow'],
      ['Kling AI', 'https://klingai.com'],
      ['Midjourney', 'https://www.midjourney.com'],
      ['Ideogram', 'https://ideogram.ai'],
      ['ElevenLabs', 'https://elevenlabs.io'],
      ['Suno', 'https://suno.com'],
      ['CapCut', 'https://www.capcut.com'],
      ['Canva', 'https://www.canva.com'],
    ],
    prompts: [
      ['Bản đồ công cụ theo từng bước', `Ý tưởng & kịch bản ........ ChatGPT · Gemini · Grok             (Module 01, 02, 06)
Phân tích ảnh / sản phẩm .... Gemini                               (Module 02)
Tạo ảnh ...................... ChatGPT tạo ảnh · Gemini · Midjourney · Ideogram   (Module 03)
Tạo video có thoại ........... VEO3 (Google Flow / Gemini)          (Module 04)
Ảnh → video, chuyển động ..... Kling AI                             (Module 05)
Giọng nói .................... ElevenLabs · giọng AI trong CapCut   (Module 07)
Nhạc & hiệu ứng âm thanh ..... Suno · ElevenLabs Sound Effects · thư viện miễn phí   (Module 08)
Dựng, phụ đề, xuất video ..... CapCut                               (Module 09)
Ảnh bìa / thumbnail .......... Canva · Ideogram`],
      ['Bộ công cụ khởi đầu (ưu tiên miễn phí)', `Để làm video đầu tiên, chỉ cần:
1. ChatGPT hoặc Gemini (bản miễn phí) – viết kịch bản, prompt
2. 1 công cụ tạo ảnh có gói miễn phí / tặng credit
3. 1 công cụ tạo video có credit miễn phí hằng ngày (Kling) hoặc gói dùng thử VEO3
4. CapCut (miễn phí) – dựng, phụ đề, giọng AI, nhạc có sẵn
→ Học hết Module 01–05 và 09 với bộ này rồi mới cân nhắc nâng cấp.`],
      ['Khi nào nên nâng cấp gói trả phí?', `Nâng cấp công cụ khi bạn gặp ít nhất 2 dấu hiệu:
☐ Đã làm đều đặn từ 3 video/tuần trở lên
☐ Hết credit miễn phí trước khi xong video
☐ Cần chất lượng cao hơn (độ phân giải, không watermark, thời lượng dài hơn)
☐ Cần quyền dùng thương mại cho video quảng cáo / bán hàng
Ưu tiên nâng cấp: công cụ tạo VIDEO trước → ảnh → giọng nói → nhạc.
Lưu ý: luôn đọc điều khoản sử dụng thương mại của từng công cụ.`],
      ['Nhờ AI so sánh và chọn công cụ', `Tôi là người mới học làm video AI, muốn làm video [loại video: quảng cáo bán hàng / affiliate / kể chuyện / giáo dục], đăng trên [nền tảng], ngân sách công cụ khoảng [số tiền]/tháng.
Hãy gợi ý bộ công cụ cho từng bước (kịch bản, ảnh, video, giọng nói, nhạc, dựng), ưu tiên gói miễn phí, giải thích ngắn lý do chọn, và nhắc tôi kiểm tra lại giá mới nhất trên trang chủ của từng công cụ.`],
      ['Checklist tài khoản cần có trước Module 01', `☐ 1 tài khoản Google (dùng cho Gemini, Google Flow / VEO3)
☐ Tài khoản ChatGPT
☐ Tài khoản Kling AI
☐ 1 công cụ tạo ảnh (Midjourney / Ideogram / dùng luôn ChatGPT hoặc Gemini)
☐ CapCut (cài trên máy tính hoặc điện thoại)
☐ (Tuỳ chọn) ElevenLabs, Suno, Canva
Mẹo: dùng chung 1 email cho tất cả và lưu mật khẩu trong trình quản lý mật khẩu để không quên.`],
    ],
  },

  'Cách học nhanh nhất': {
    summary: `Khóa học có 17 module, nhưng bạn không cần học "cho hết" mới bắt đầu làm video. Cách học nhanh nhất là HỌC ĐẾN ĐÂU LÀM ĐẾN ĐÓ: xem bài ngắn → làm theo ngay trên công cụ → lưu lại kết quả và prompt. Sau mỗi module, bạn phải có một "sản phẩm" cụ thể (một kịch bản, một bộ ảnh, một clip…), không chỉ là kiến thức.

Hãy học theo đúng thứ tự Module 00 → 14 vì mỗi module dùng kết quả của module trước. Module 15 (Kho Prompt) và Module 16 (Tài nguyên) là "tủ đồ nghề" – mở ra bất cứ lúc nào bạn cần. Bên dưới là lộ trình 30 ngày, nhịp học mỗi buổi và cách dùng AI như một trợ giảng riêng.`,
    keyPoints: [
      'Quy tắc 30/70: 30% thời gian xem bài, 70% thời gian thực hành trên công cụ.',
      'Mỗi buổi chỉ cần 45–60 phút, nhưng học đều mỗi ngày tốt hơn học dồn cuối tuần.',
      'Làm bài "Thực hành" cuối mỗi module – đó là phần giúp bạn tiến bộ nhanh nhất.',
      'Tạo "sổ tay prompt" riêng: lưu mọi prompt cho kết quả tốt để dùng lại.',
      'Bí ở đâu hỏi ngay qua Zalo hỗ trợ – đừng để một lỗi nhỏ làm bạn dừng cả tuần.',
    ],
    resources: [
      ['Google Docs – làm sổ tay prompt', 'https://docs.google.com'],
      ['Notion – sổ tay & quản lý dự án', 'https://www.notion.so'],
    ],
    prompts: [
      ['Lộ trình 30 ngày (mỗi ngày 45–60 phút)', `Ngày 1 ........ Module 00 – nắm quy trình, chuẩn bị tài khoản
Ngày 2–4 ...... Module 01 – ChatGPT: ý tưởng, hook, kịch bản, chia scene, prompt
Ngày 5–6 ...... Module 02 – Gemini: phân tích ảnh / sản phẩm, kết hợp với ChatGPT
Ngày 7–9 ...... Module 03 – Tạo ảnh: nhân vật, sản phẩm, bối cảnh, giữ nhân vật đồng nhất
Ngày 10–13 .... Module 04 – VEO3: video có thoại, nối nhiều scene
Ngày 14–16 .... Module 05 – Kling: biến ảnh thành video, camera, sản phẩm
Ngày 17 ....... Module 06 – Grok (hỗ trợ ý tưởng, kịch bản)
Ngày 18 ....... Module 07 – Giọng nói AI
Ngày 19 ....... Module 08 – Nhạc & hiệu ứng âm thanh
Ngày 20–21 .... Module 09 – Ghép & hoàn thiện video trên CapCut
Ngày 22–23 .... Module 10 – Làm trọn 1 video từ A–Z
Ngày 24–30 .... Chọn hướng của bạn: Module 11 (Quảng cáo) / 12 (Affiliate) / 13 (Giải trí) / 14 (Giáo dục) – mỗi ngày làm 1 video thật
Luôn mở Module 15, 16 khi cần prompt và tài nguyên.`],
      ['Nhịp học mỗi buổi (45–60 phút)', `5 phút  – Xem lại sổ tay: hôm qua học gì, còn lỗi gì
15 phút – Xem bài mới, ghi chú 3 ý quan trọng nhất
25 phút – Làm theo ngay trên công cụ (bắt buộc!)
5 phút  – Lưu kết quả + prompt tốt nhất vào sổ tay
5 phút  – Ghi 1 câu hỏi / lỗi gặp phải để hỏi trên Zalo hỗ trợ`],
      ['Mẫu sổ tay prompt cá nhân', `DỰ ÁN: [tên video]          NGÀY: [ngày]          CÔNG CỤ: [VEO3 / Kling / …]
MỤC ĐÍCH CẢNH: [cảnh này để làm gì]
PROMPT ĐÃ DÙNG: [dán prompt]
KẾT QUẢ: [tốt / tạm / lỗi] – [lỗi gì: mặt biến dạng, tay lỗi, sai sản phẩm…]
ĐÃ SỬA BẰNG CÁCH: [thay đổi gì trong prompt]
PROMPT CUỐI CÙNG (DÙNG LẠI ĐƯỢC): [dán prompt tốt nhất]
GHI CHÚ: [mẹo rút ra]`],
      ['Biến ChatGPT thành trợ giảng riêng', `Bạn là trợ giảng khóa học làm video bằng AI. Tôi là người mới, đang học [tên module / bài học].
Hôm nay tôi đã học: [tóm tắt điều đã học].
Hãy: (1) giải thích lại phần tôi chưa hiểu: [phần chưa hiểu] bằng ví dụ đơn giản; (2) giao cho tôi 1 bài tập thực hành 20 phút; (3) đặt 3 câu hỏi kiểm tra kèm đáp án để tôi tự chấm.`],
      ['Checklist hoàn thành mỗi module', `☐ Đã xem hết các bài của module
☐ Đã làm bài "Thực hành" và lưu kết quả (file / link)
☐ Đã lưu ít nhất 3 prompt tốt vào sổ tay
☐ Đã ghi lại 1–2 lỗi gặp phải và cách sửa
☐ Đã bấm "Đánh dấu hoàn thành" cho từng bài để theo dõi tiến độ
→ Đủ 5 mục mới chuyển sang module tiếp theo.`],
    ],
  },

  'Link công cụ & tài nguyên': {
    summary: `Bài này tổng hợp tất cả đường link bạn cần trong suốt khóa học – bấm tab "Tài liệu" để mở nhanh từng công cụ. Bạn nên đăng ký tài khoản theo đúng thứ tự module để không bị "ngợp", và tạo sẵn một thư mục lưu trữ dự án gọn gàng ngay từ video đầu tiên.

Ngoài ra, khóa học còn có 3 "kho" luôn mở cho bạn: Module 15 – Kho Prompt Video AI (prompt chi tiết có bản dịch tiếng Việt), Module 16 – Tài nguyên & cập nhật (nhạc, hiệu ứng âm thanh, font, template, checklist) và Thư viện prompt theo ngành nghề ở menu bên trái.`,
    keyPoints: [
      'Đăng ký tài khoản theo thứ tự module: ChatGPT → Gemini → công cụ tạo ảnh → VEO3 → Kling → CapCut.',
      'Lưu mỗi dự án video vào 1 thư mục riêng theo cấu trúc chuẩn (xem thẻ bên dưới).',
      'Chỉ dùng nhạc, hiệu ứng âm thanh, font, video có giấy phép rõ ràng.',
      'Module 15, Module 16 và Thư viện prompt theo ngành luôn mở – dùng như "tủ đồ nghề".',
    ],
    resources: [
      ['ChatGPT', 'https://chatgpt.com'],
      ['Gemini', 'https://gemini.google.com'],
      ['Grok', 'https://grok.com'],
      ['Google Flow (VEO3)', 'https://labs.google/fx/tools/flow'],
      ['Kling AI', 'https://klingai.com'],
      ['Midjourney', 'https://www.midjourney.com'],
      ['Ideogram', 'https://ideogram.ai'],
      ['Leonardo AI', 'https://leonardo.ai'],
      ['ElevenLabs – giọng nói & hiệu ứng âm thanh', 'https://elevenlabs.io'],
      ['Suno – tạo nhạc', 'https://suno.com'],
      ['CapCut – dựng video', 'https://www.capcut.com'],
      ['Canva – thumbnail', 'https://www.canva.com'],
      ['Photoroom – tách nền ảnh sản phẩm', 'https://www.photoroom.com'],
      ['Pixabay – nhạc & hiệu ứng miễn phí', 'https://pixabay.com/sound-effects/'],
      ['Google Fonts – font tiếng Việt', 'https://fonts.google.com/?subset=vietnamese'],
      ['Pexels – video & ảnh miễn phí', 'https://www.pexels.com/videos/'],
    ],
    prompts: [
      ['Thứ tự đăng ký tài khoản', `Tuần 1:  ChatGPT (Module 01) → Gemini bằng tài khoản Google (Module 02)
Tuần 2:  Công cụ tạo ảnh (Module 03) → Google Flow / VEO3 (Module 04) → Kling AI (Module 05)
Tuần 3:  Grok (Module 06) → ElevenLabs (Module 07) → Suno (Module 08) → CapCut (Module 09)
Không cần đăng ký tất cả ngay hôm nay – học tới module nào, mở tài khoản công cụ của module đó.`],
      ['Cấu trúc thư mục cho mỗi video', `📁 [Ngày]_[Tên video]
   📁 01_Kich-ban        – kịch bản, bảng chia cảnh
   📁 02_Prompt          – file prompt ảnh / video đã dùng
   📁 03_Anh             – ảnh nhân vật, sản phẩm, bối cảnh
   📁 04_Video-canh      – các clip từ VEO3 / Kling (đặt tên canh01, canh02…)
   📁 05_Am-thanh        – giọng nói, nhạc nền, hiệu ứng
   📁 06_Xuat-ban        – video hoàn chỉnh + thumbnail
Mẹo: lưu thư mục này trên Google Drive để mở được cả trên điện thoại.`],
      ['Nguồn tài nguyên miễn phí', `Nhạc nền:            Thư viện âm thanh YouTube, Pixabay Music, nhạc có sẵn trong CapCut
Hiệu ứng âm thanh:   Pixabay Sound Effects, Mixkit, ElevenLabs Sound Effects
Font tiếng Việt:     Google Fonts (lọc "Vietnamese")
Video / ảnh nền:     Pexels, Pixabay
Tách nền ảnh:        Photoroom, remove.bg
⚠ Luôn đọc giấy phép của từng file trước khi dùng cho video quảng cáo.`],
      ['Các kho có sẵn trong khóa học', `🗂 Module 15 – Kho Prompt Video AI: prompt ảnh, nhân vật, sản phẩm, VEO3, Kling, camera, quảng cáo, affiliate, UGC, cinematic, storytelling, theo ngành – có nút EN / Tiếng Việt và file Word.
🧰 Module 16 – Tài nguyên & cập nhật: link công cụ, prompt mới, công cụ mới, hiệu ứng âm thanh, nhạc, font, template, checklist, hướng dẫn xử lý lỗi.
💼 Thư viện prompt theo ngành nghề (menu bên trái): hơn 100 prompt cho marketing, bán hàng, giáo dục, bất động sản, F&B…
💬 Zalo hỗ trợ: hỏi trực tiếp khi gặp lỗi.`],
    ],
  },
};
