// Nội dung Module 16 — Tài nguyên & cập nhật: công cụ, nhạc, âm thanh, font, template, checklist.
// Phần [trong ngoặc vuông] là biến học viên tự thay.
module.exports = {
  'Link công cụ': {
    summary: `Danh sách công cụ AI cần thiết cho toàn bộ quy trình làm video: viết kịch bản → tạo ảnh → tạo video → lồng tiếng → nhạc → dựng phim. Bấm tab "Tài liệu" để mở nhanh từng link.

Nhiều công cụ có gói miễn phí hoặc tặng credit hằng ngày – hãy bắt đầu với gói miễn phí, chỉ nâng cấp công cụ bạn dùng nhiều nhất.`,
    keyPoints: [
      'Kịch bản & ý tưởng: ChatGPT, Gemini, Claude.',
      'Tạo ảnh: Midjourney, Ideogram, Leonardo, Krea, ChatGPT tạo ảnh.',
      'Tạo video: Google Flow (VEO3), Kling, Runway, Hailuo, Luma, Pika, Sora.',
      'Giọng nói & avatar: ElevenLabs, HeyGen. Nhạc: Suno, Udio.',
      'Dựng & xử lý: CapCut, Canva, Photoroom, remove.bg.',
    ],
    resources: [
      ['ChatGPT – viết kịch bản, tạo ảnh', 'https://chatgpt.com'],
      ['Gemini – viết kịch bản, VEO3', 'https://gemini.google.com'],
      ['Claude – viết kịch bản dài', 'https://claude.ai'],
      ['Google Flow – tạo video VEO3', 'https://labs.google/fx/tools/flow'],
      ['Kling AI – tạo video', 'https://klingai.com'],
      ['Runway – tạo & chỉnh video', 'https://runwayml.com'],
      ['Hailuo AI – tạo video', 'https://hailuoai.video'],
      ['Luma Dream Machine', 'https://lumalabs.ai/dream-machine'],
      ['Pika', 'https://pika.art'],
      ['Midjourney – tạo ảnh', 'https://www.midjourney.com'],
      ['Ideogram – ảnh có chữ', 'https://ideogram.ai'],
      ['Leonardo AI', 'https://leonardo.ai'],
      ['ElevenLabs – lồng tiếng, hiệu ứng âm thanh', 'https://elevenlabs.io'],
      ['HeyGen – avatar nói', 'https://www.heygen.com'],
      ['Suno – tạo nhạc', 'https://suno.com'],
      ['CapCut – dựng video', 'https://www.capcut.com'],
      ['Canva – thiết kế, thumbnail', 'https://www.canva.com'],
      ['Photoroom – tách nền', 'https://www.photoroom.com'],
    ],
    prompts: [
      ['Quy trình công cụ cho 1 video (copy để làm checklist)', `1. Ý tưởng & kịch bản: ChatGPT / Gemini / Claude
2. Thẻ nhân vật + ảnh tham chiếu: Midjourney / Ideogram / ChatGPT tạo ảnh
3. Tạo cảnh video: VEO3 (có thoại) – Kling (chuyển động, image-to-video) – Runway / Hailuo (dự phòng)
4. Lồng tiếng: ElevenLabs (hoặc giọng có sẵn trong VEO3)
5. Nhạc nền: Suno (tự tạo) hoặc thư viện nhạc miễn phí bản quyền
6. Hiệu ứng âm thanh: ElevenLabs Sound Effects / Pixabay
7. Dựng, phụ đề, logo, giá: CapCut
8. Thumbnail / ảnh bìa: Canva / Ideogram`],
      ['Nhờ AI chọn công cụ phù hợp', `Mình muốn làm video [loại video: quảng cáo bán hàng / kể chuyện / review] dài [thời lượng] cho kênh [nền tảng], ngân sách công cụ khoảng [số tiền] mỗi tháng.
Hãy gợi ý bộ công cụ AI tối ưu cho từng bước (kịch bản, ảnh, video, giọng nói, nhạc, dựng), ưu tiên công cụ có gói miễn phí, và giải thích ngắn lý do chọn từng công cụ.`],
    ],
  },

  'Prompt mới': {
    summary: `Các mẫu prompt theo xu hướng video AI mới nhất trên TikTok, Reels và YouTube Shorts: biến ảnh thành video, hiệu ứng biến hình, ASMR, mini-vlog động vật, phỏng vấn "nhân vật lịch sử", video thu nhỏ (miniature), đồ vật biết nói… Phần này sẽ được cập nhật thêm khi có xu hướng mới.`,
    keyPoints: [
      'Xu hướng thay đổi nhanh – hãy làm sớm trong 1–2 tuần đầu khi một kiểu video bắt đầu nổi.',
      'Lấy ý tưởng: lướt mục Khám phá / Xu hướng trên TikTok, lưu video hay và phân tích cấu trúc.',
      'Kết hợp xu hướng với sản phẩm / ngành của bạn để vừa viral vừa bán được hàng.',
    ],
    resources: [
      ['TikTok Creative Center – xu hướng', 'https://ads.tiktok.com/business/creativecenter'],
      ['Google Trends', 'https://trends.google.com'],
    ],
    prompts: [
      ['Đồ vật biết nói (talking object)', `A cute animated [đồ vật: avocado] with big expressive eyes and a tiny mouth sits on [bối cảnh: a kitchen counter], talking directly to the camera in a funny dramatic way.
It says in Vietnamese: "[câu thoại hài: Đừng để mình chín nẫu trong tủ lạnh nữa, làm sinh tố đi!]"
Style: 3D Pixar-style character on a realistic kitchen background, soft daylight.
Camera: close-up, static.
Audio: cartoon voice, light kitchen ambience. No subtitles.`],
      ['Phỏng vấn nhân vật lịch sử / nghề nghiệp xưa', `Street-interview style: a reporter holds a microphone toward [nhân vật: a Vietnamese scholar from the Ly dynasty in traditional robes] standing in [bối cảnh: front of the Temple of Literature in Hanoi].
The reporter asks in Vietnamese: "[câu hỏi]"
The scholar answers calmly in Vietnamese: "[câu trả lời ngắn, hài hước]"
Camera: handheld vlog style, realistic.
Audio: clear dialogue, ambient street sounds. No subtitles.`],
      ['Thế giới thu nhỏ (miniature)', `Tilt-shift miniature world: tiny people [hành động: harvesting giant strawberries] on [bối cảnh: a kitchen table], using ladders and tiny trucks to carry the fruit.
Camera: slow top-down glide, tilt-shift blur at the edges.
Lighting: bright soft daylight.
Style: realistic miniature diorama, playful, highly detailed.
Audio: tiny busy sounds, cheerful music.`],
      ['ASMR cắt đồ vật thủy tinh / trái cây pha lê', `Extreme close-up ASMR: a sharp knife slowly slices through [đồ vật: a glossy glass-like strawberry made of crystal] on a wooden cutting board, the slices revealing a sparkling layered interior.
Camera: macro, static, slow motion.
Lighting: soft studio light, glossy reflections.
Audio: crisp satisfying glass cutting sound, no music, no voice.`],
      ['Mini-vlog động vật', `Vertical vlog-style video: [con vật: a fluffy capybara] holds a tiny selfie camera while walking through [bối cảnh: a Japanese hot spring resort], showing its day: eating watermelon, relaxing in the warm water.
The capybara narrates in a calm Vietnamese voice: "[câu kể ngắn]"
Camera: selfie POV, handheld, cozy.
Style: realistic, cute, funny.
Audio: calm narration, water sounds, soft lo-fi music.`],
      ['Hiệu ứng biến hình (transformation)', `Start frame: [trạng thái trước: an empty messy old room]. End frame: [trạng thái sau: a bright, modern minimalist bedroom].
The room transforms smoothly: dust disappears, walls repaint themselves, furniture slides into place, lights turn on.
Camera: static wide shot.
Style: satisfying magical transformation, smooth.
Audio: whoosh and sparkle sound effects, upbeat music.`],
      ['Biến ảnh cũ thành video sống động', `[Đưa ảnh cũ / ảnh gia đình vào làm khung hình đầu]
The people in the photo come to life naturally: they smile, blink, and gently turn toward each other. Subtle movement of hair and clothes in a light breeze.
Camera: very slow push in.
Keep faces, clothes and the photo's colors exactly the same. Realistic, warm and emotional.`],
    ],
  },

  'Công cụ Video AI mới': {
    summary: `Tổng hợp nhanh điểm mạnh của các công cụ tạo video AI phổ biến để bạn chọn đúng công cụ cho từng loại cảnh. Công cụ AI cập nhật phiên bản liên tục – bài học này sẽ được bổ sung khi có công cụ hoặc tính năng mới đáng chú ý.

Nguyên tắc: không có công cụ "tốt nhất cho mọi thứ". Hãy dùng 2–3 công cụ, mỗi công cụ cho đúng việc nó làm tốt nhất.`,
    keyPoints: [
      'VEO3 (Google Flow / Gemini): mạnh nhất khi cần nhân vật nói thoại có âm thanh đồng bộ.',
      'Kling: chuyển động người và động vật tự nhiên, image-to-video, giữ nhân vật bằng Elements.',
      'Runway: nhiều công cụ chỉnh sửa video (đổi phong cách, xóa vật thể, mở rộng khung).',
      'Hailuo / Luma / Pika: thử nhanh ý tưởng, hiệu ứng sáng tạo, chi phí thấp.',
      'HeyGen: avatar người thật nói theo kịch bản – phù hợp video đào tạo, giới thiệu.',
    ],
    resources: [
      ['Google Flow (VEO3)', 'https://labs.google/fx/tools/flow'],
      ['Kling AI', 'https://klingai.com'],
      ['Runway', 'https://runwayml.com'],
      ['Hailuo AI', 'https://hailuoai.video'],
      ['Luma Dream Machine', 'https://lumalabs.ai/dream-machine'],
      ['Pika', 'https://pika.art'],
      ['Sora', 'https://sora.com'],
      ['HeyGen', 'https://www.heygen.com'],
    ],
    prompts: [
      ['Bảng chọn công cụ theo loại cảnh', `Nhân vật nói thoại, có âm thanh → VEO3
Ảnh có sẵn → chuyển thành video → Kling (image-to-video) / Runway
Sản phẩm xoay, bay, biến hình → Kling (start + end frame)
Cảnh hành động, chuyển động người phức tạp → Kling / Hailuo
Cảnh phong cảnh điện ảnh → VEO3 / Luma / Runway
Hiệu ứng vui, biến đổi sáng tạo → Pika / Hailuo
Avatar người thật đọc kịch bản dài → HeyGen
Chỉnh sửa video có sẵn (đổi nền, phong cách) → Runway`],
      ['Prompt kiểm tra công cụ mới (dùng chung để so sánh)', `Medium close-up of a young Vietnamese woman with long black hair, wearing a white shirt, sitting in a sunlit café by the window. She turns to the camera, smiles and lifts a cup of coffee.
Camera: slow push in, shallow depth of field.
Lighting: warm afternoon sunlight, soft shadows.
Style: realistic, cinematic, natural motion.
(Chạy cùng prompt này trên các công cụ khác nhau để so sánh: khuôn mặt, bàn tay, chuyển động, ánh sáng, tốc độ tạo, chi phí.)`],
      ['Nhờ AI tóm tắt công cụ mới', `Tóm tắt giúp mình công cụ tạo video AI [tên công cụ] (phiên bản mới nhất bạn biết):
1. Điểm mạnh và điểm yếu chính.
2. Phù hợp với loại video nào (quảng cáo, kể chuyện, UGC…).
3. Giá / gói miễn phí.
4. So sánh ngắn với VEO3 và Kling.
5. 3 mẹo viết prompt cho công cụ này.
Nếu thông tin có thể đã cũ, hãy ghi rõ để mình kiểm tra lại trên trang chủ.`],
    ],
  },

  'Sound Effect': {
    summary: `Hiệu ứng âm thanh (sound effect – SFX) làm video AI "sống" hơn hẳn: tiếng whoosh khi chuyển cảnh, tiếng ding khi hiện sản phẩm, tiếng mưa, tiếng đám đông… Bạn có thể tạo SFX bằng AI (ElevenLabs Sound Effects) hoặc tải từ thư viện miễn phí bản quyền.

Các thẻ bên dưới gồm prompt tạo SFX bằng AI và từ khóa tìm kiếm trong thư viện âm thanh.`,
    keyPoints: [
      'Âm thanh chuyển cảnh nên trùng đúng khung hình cắt – kéo SFX lên trước điểm cắt 2–3 khung hình.',
      'Giữ âm lượng SFX thấp hơn giọng nói; nhạc nền khoảng 15–25% âm lượng giọng.',
      'Kiểm tra giấy phép: Pixabay, Mixkit, YouTube Audio Library cho phép dùng miễn phí (đọc điều khoản từng file).',
      'Không lạm dụng: 1 video 30 giây chỉ cần 4–8 hiệu ứng.',
    ],
    resources: [
      ['ElevenLabs – Sound Effects (tạo SFX bằng AI)', 'https://elevenlabs.io/sound-effects'],
      ['Pixabay Sound Effects (miễn phí)', 'https://pixabay.com/sound-effects/'],
      ['Mixkit – SFX miễn phí', 'https://mixkit.co/free-sound-effects/'],
      ['Freesound', 'https://freesound.org'],
    ],
    prompts: [
      ['Bộ SFX chuyển cảnh (prompt ElevenLabs)', `Whoosh: Fast cinematic whoosh transition, airy swoosh moving from left to right, 1 second
Swipe: Short soft swipe sound like a phone screen swipe, clean, 0.5 seconds
Impact: Deep cinematic boom impact with long reverb tail, trailer style, 2 seconds
Riser: Tension riser building up for 3 seconds then cutting off sharply
Glitch: Short digital glitch stutter sound, electronic, 0.7 seconds`],
      ['SFX sản phẩm & bán hàng', `Ding: Bright magical sparkle chime, positive notification, 1 second
Cash: Cash register "cha-ching" sound with coins, 1 second
Pop: Cartoon bubble pop, playful, short
Unbox: Cardboard box opening and tissue paper rustling, ASMR, close-up, 3 seconds
Spray: Short perfume spray mist sound, close microphone, 1 second
Can open: Soda can opening with fizz and bubbles, crisp, 2 seconds`],
      ['SFX không khí / bối cảnh (ambience)', `Rain: Gentle rain on a window at night with distant thunder, 10 seconds loop
Café: Busy coffee shop ambience, people chatting softly, cups clinking, espresso machine, 15 seconds
Street Vietnam: Busy Vietnamese street with motorbikes honking and street vendors calling, 15 seconds
Nature: Peaceful forest morning with birds chirping and a small stream, 15 seconds
Ocean: Calm ocean waves on a sandy beach, seagulls in the distance, 15 seconds`],
      ['SFX hài hước / cảm xúc', `Laugh track: Small audience laughing, sitcom style, 2 seconds
Fail: Sad trombone "wah wah wah", comedic, 2 seconds
Surprise: Cartoon "boing" spring sound
Suspense: Dramatic suspense sting with low strings, 2 seconds
Heartbeat: Slow heavy heartbeat, tense, 4 seconds
Record scratch: Vinyl record scratch freeze-frame moment`],
      ['Từ khóa tìm SFX trên Pixabay / Mixkit', `whoosh, swoosh, transition, swipe, impact, boom, riser, glitch, pop, ding, sparkle, notification, cash register, click, typing, camera shutter, applause, crowd, laugh, rain, thunder, wind, ocean, birds, city ambience, footsteps, door open, unboxing, paper, sizzle, pouring water, ice cubes`],
      ['Template prompt SFX tự điền', `[Tên âm thanh], [nguồn phát / chất liệu: metal, wood, glass, paper…], [đặc điểm: short / long / echo / close-up / distant], [cảm xúc: playful / dramatic / calm], [thời lượng] seconds`],
    ],
  },

  'Nhạc': {
    summary: `Hướng dẫn tạo nhạc nền và bài hát bằng AI với Suno (hoặc Udio), cùng các nguồn nhạc miễn phí bản quyền. Nhạc đúng không khí giúp video giữ chân người xem và tăng cảm xúc.

Với Suno: ô "Style of Music" mô tả thể loại, nhạc cụ, tâm trạng, tốc độ (BPM), giọng hát; ô "Lyrics" là lời bài hát có đánh dấu cấu trúc [Verse], [Chorus]… Chọn "Instrumental" nếu chỉ cần nhạc nền không lời.`,
    keyPoints: [
      'Nhạc nền video bán hàng: 100–120 BPM, vui tươi; video cảm xúc: 60–80 BPM, piano / strings.',
      'Nhạc nền nên là bản không lời (instrumental) để không lấn át giọng nói.',
      'Đọc kỹ điều khoản thương mại của Suno / Udio (thường gói trả phí mới được dùng thương mại).',
      'Tránh dùng nhạc có bản quyền trong video quảng cáo – dễ bị tắt tiếng hoặc gỡ video.',
    ],
    resources: [
      ['Suno – tạo nhạc AI', 'https://suno.com'],
      ['Udio – tạo nhạc AI', 'https://www.udio.com'],
      ['YouTube Audio Library (miễn phí)', 'https://www.youtube.com/audiolibrary'],
      ['Pixabay Music (miễn phí)', 'https://pixabay.com/music/'],
      ['Mixkit Music', 'https://mixkit.co/free-stock-music/'],
    ],
    prompts: [
      ['Nhạc nền quảng cáo vui tươi (Suno – Instrumental)', `upbeat pop, bright acoustic guitar, claps, light synth, cheerful, energetic, positive, 115 bpm, instrumental, commercial background music`],
      ['Nhạc nền sang trọng (mỹ phẩm, BĐS)', `elegant cinematic ambient, soft piano, warm strings, subtle deep bass, luxury, calm, sophisticated, 80 bpm, instrumental`],
      ['Nhạc nền cảm động (kể chuyện)', `emotional cinematic, solo piano, slow strings swell, heartfelt, nostalgic, gentle build-up, 70 bpm, instrumental`],
      ['Nhạc nền chill (vlog, lifestyle)', `lofi hip hop, mellow electric piano, vinyl crackle, soft drums, relaxing, cozy, 85 bpm, instrumental`],
      ['Nhạc hành động / trailer', `epic trailer music, hybrid orchestra, powerful drums, deep brass hits, rising tension, heroic, 130 bpm, instrumental`],
      ['Nhạc truyền thống Việt hiện đại', `modern Vietnamese folk fusion, đàn tranh, bamboo flute, soft electronic beat, peaceful, cultural, 90 bpm, instrumental`],
      ['Jingle thương hiệu có lời (Suno – Custom)', `Style of Music: catchy pop jingle, bright female vocal, ukulele, claps, happy, 120 bpm

Lyrics:
[Intro]
[Verse]
[Câu 1 nói về vấn đề khách hàng]
[Câu 2 giới thiệu tên thương hiệu]
[Chorus]
[Tên thương hiệu] ơi, [lợi ích chính]!
[Câu slogan ngắn, dễ nhớ]
[Outro]
[Tên thương hiệu]!`],
      ['Nhờ ChatGPT viết lời bài hát cho Suno', `Viết lời bài hát tiếng Việt ngắn (khoảng 45 giây) cho thương hiệu [tên thương hiệu] bán [sản phẩm], phong cách [thể loại: pop vui tươi / ballad / rap].
Cấu trúc: [Verse] 4 câu – [Chorus] 4 câu có tên thương hiệu và slogan – [Outro] 1 câu.
Câu ngắn, có vần, dễ hát theo. Sau đó gợi ý 1 dòng "Style of Music" tiếng Anh cho Suno (thể loại, nhạc cụ, giọng hát, BPM).`],
    ],
  },

  'Font': {
    summary: `Gợi ý font chữ hỗ trợ đầy đủ tiếng Việt (có dấu) cho phụ đề, tiêu đề video và thumbnail, cùng các cặp font phối sẵn theo phong cách. Tất cả font trong danh sách đều có trên Google Fonts (miễn phí, dùng thương mại được) và phần lớn có sẵn trong CapCut / Canva.

Quy tắc: 1 video chỉ dùng tối đa 2 font – 1 font tiêu đề nổi bật + 1 font nội dung dễ đọc.`,
    keyPoints: [
      'Luôn kiểm tra font hiển thị đúng dấu tiếng Việt (ă, ơ, ư, ệ, ỗ…) trước khi xuất video.',
      'Phụ đề: font không chân (sans-serif), đậm vừa, có viền hoặc nền mờ để đọc được trên mọi cảnh.',
      'Cỡ chữ phụ đề trên video dọc: khoảng 5–7% chiều cao khung, đặt ở 1/3 dưới, tránh vùng nút của TikTok.',
      'Thumbnail: chữ thật to, ít chữ (3–5 từ), màu tương phản mạnh với nền.',
    ],
    resources: [
      ['Google Fonts – lọc font tiếng Việt', 'https://fonts.google.com/?subset=vietnamese'],
      ['Be Vietnam Pro', 'https://fonts.google.com/specimen/Be+Vietnam+Pro'],
      ['Montserrat', 'https://fonts.google.com/specimen/Montserrat'],
      ['Anton', 'https://fonts.google.com/specimen/Anton'],
      ['Playfair Display', 'https://fonts.google.com/specimen/Playfair+Display'],
    ],
    prompts: [
      ['Font tiếng Việt khuyên dùng theo mục đích', `Phụ đề, nội dung: Be Vietnam Pro, Inter, Roboto, Lexend, Nunito
Tiêu đề mạnh, quảng cáo: Anton, Oswald, Montserrat ExtraBold, Bungee
Sang trọng, mỹ phẩm, BĐS: Playfair Display, Lora, Cormorant Garamond
Dễ thương, trẻ em, đồ ăn: Baloo 2, Quicksand, Pacifico
Viết tay, cảm xúc: Dancing Script
Hiện đại, công nghệ: Lexend, Montserrat, Josefin Sans`],
      ['Cặp font phối sẵn', `Bán hàng sôi động: Anton (tiêu đề) + Be Vietnam Pro (nội dung)
Sang trọng, cao cấp: Playfair Display (tiêu đề) + Montserrat Light (nội dung)
Trẻ trung, dễ thương: Baloo 2 Bold (tiêu đề) + Nunito (nội dung)
Công nghệ, giáo dục: Lexend Bold (tiêu đề) + Inter (nội dung)
Cảm xúc, kể chuyện: Lora Italic (tiêu đề) + Be Vietnam Pro (nội dung)
Điện ảnh, trailer: Oswald (tiêu đề, giãn chữ rộng) + Montserrat (nội dung)`],
      ['Thông số phụ đề chuẩn (CapCut)', `Font: Be Vietnam Pro / Montserrat – độ đậm Bold (700)
Màu chữ: trắng #FFFFFF
Viền: đen #000000, độ dày 8–12%  (hoặc nền chữ đen mờ 60%)
Từ khóa nhấn mạnh: vàng #FFD60A hoặc màu thương hiệu
Vị trí: 1/3 dưới khung hình, cách mép dưới khoảng 20% (tránh nút TikTok)
Tối đa 2 dòng, mỗi dòng 5–7 từ`],
      ['Tạo chữ tiêu đề nghệ thuật bằng Ideogram', `Typography design of the Vietnamese text "[tiêu đề tiếng Việt có dấu]" in [phong cách: bold 3D glossy letters with a gold gradient and soft shadow], centered on [nền: a dark purple background with light sparkles].
Correct Vietnamese diacritics, clean, high contrast, YouTube thumbnail title style.
Aspect ratio 16:9.`],
      ['Nhờ AI gợi ý font theo thương hiệu', `Thương hiệu của mình là [tên], ngành [ngành], khách hàng [đối tượng], tính cách thương hiệu [ví dụ: trẻ trung, thân thiện / sang trọng, tinh tế].
Gợi ý 3 cặp font (tiêu đề + nội dung) trên Google Fonts có hỗ trợ tiếng Việt, kèm bảng màu chữ 3 màu (mã HEX) và cách dùng cho phụ đề video và thumbnail.`],
    ],
  },

  'Template': {
    summary: `Các mẫu (template) sẵn dùng để bạn sao chép và điền nhanh: kịch bản video ngắn, bảng phân cảnh (storyboard), prompt gốc cho ảnh và video, mô tả – hashtag đăng bài, và cấu trúc thumbnail. Dùng template giúp làm video nhanh và đều tay hơn.`,
    keyPoints: [
      'Lưu các template vào Google Docs / Notion để dùng lại cho mọi dự án.',
      'Có thể dán template vào ChatGPT kèm thông tin sản phẩm để AI điền giúp.',
      'Sau mỗi video, ghi lại prompt nào cho kết quả tốt để xây "kho prompt riêng" của bạn.',
    ],
    resources: [
      ['Canva – template thumbnail', 'https://www.canva.com'],
      ['CapCut – template video', 'https://www.capcut.com'],
    ],
    prompts: [
      ['Template kịch bản video ngắn 30 giây', `TÊN VIDEO: [tên]
MỤC TIÊU: [bán hàng / tăng follow / thương hiệu]   NỀN TẢNG: [TikTok / Reels / Shorts]

0–3s  HOOK: [câu mở đầu gây tò mò]          | HÌNH: [cảnh mở đầu]
3–10s VẤN ĐỀ: [nỗi đau của khách hàng]      | HÌNH: [cảnh minh họa vấn đề]
10–20s GIẢI PHÁP: [sản phẩm + 2–3 lợi ích]  | HÌNH: [demo sản phẩm]
20–26s BẰNG CHỨNG: [kết quả / đánh giá]     | HÌNH: [before–after / khách hàng]
26–30s CTA: [lời kêu gọi hành động]         | HÌNH: [sản phẩm + giá + logo]

NHẠC: [phong cách]   GIỌNG: [nam/nữ, giọng điệu]   PHỤ ĐỀ: có`],
      ['Template bảng phân cảnh (storyboard)', `CẢNH [số] – [thời lượng] giây
• Mô tả hình ảnh: [chuyện gì xảy ra]
• Nhân vật: [thẻ nhân vật]
• Bối cảnh: [địa điểm, thời gian]
• Góc máy / chuyển động: [cỡ cảnh + chuyển động camera]
• Lời thoại / lời kể: "[nội dung]"
• Âm thanh: [nhạc, SFX]
• Chữ trên màn hình: [nếu có]
• Công cụ: [VEO3 / Kling / …]
• Prompt: [prompt tiếng Anh]`],
      ['Template prompt video gốc (mọi công cụ)', `[Cỡ cảnh + góc máy] of [chủ thể + mô tả chi tiết] [hành động chính] in [bối cảnh + thời gian + thời tiết].
Camera: [chuyển động camera], [ống kính], [độ sâu trường ảnh].
Lighting: [ánh sáng].
Style: [phong cách], [tông màu].
Audio: [lời thoại "…" / âm thanh nền / nhạc].
Negative: no text, no watermark, no distorted faces, no extra limbs.`],
      ['Template mô tả + hashtag khi đăng video', `[Câu mở đầu gây tò mò hoặc câu hỏi cho người xem] 👀
[1–2 câu nói giá trị của video / sản phẩm]
👉 [CTA: Bấm giỏ hàng / Theo dõi để xem phần 2 / Bình luận "…" để nhận …]

#[từ khóa chính] #[ngành] #[sản phẩm] #videoai #[xu hướng] #fyp`],
      ['Template thumbnail', `BỐ CỤC: Mặt người cảm xúc mạnh (1/3 phải) + Tiêu đề lớn 3–5 chữ (2/3 trái) + 1 yếu tố gây tò mò (mũi tên / khoanh tròn / sản phẩm)
TIÊU ĐỀ: "[3–5 chữ]"
MÀU: Nền [màu đậm] – Chữ [trắng / vàng] viền đen
FONT: Anton / Montserrat ExtraBold
KIỂM TRA: Thu nhỏ còn 20% vẫn đọc được tiêu đề`],
      ['Nhờ ChatGPT điền template', `Dưới đây là template kịch bản của mình. Hãy điền đầy đủ cho sản phẩm [tên sản phẩm], khách hàng [đối tượng], ưu đãi [ưu đãi], giọng điệu [giọng điệu].
Sau đó viết prompt tiếng Anh cho từng cảnh dùng cho [VEO3 / Kling], giữ nhân vật đồng nhất.

[Dán template kịch bản vào đây]`],
    ],
  },

  'Checklist làm Video AI': {
    summary: `Checklist kiểm tra từng bước trước khi đăng video AI: chuẩn bị, tạo hình ảnh, tạo video, âm thanh, dựng phim, đăng tải. Sao chép từng checklist vào ghi chú và tích từng mục để không bỏ sót lỗi phổ biến (tay biến dạng, chữ lỗi, sai tỉ lệ, nhạc bản quyền…).`,
    keyPoints: [
      'Xem lại video ở tốc độ 0.5x để bắt lỗi khuôn mặt, bàn tay, vật thể biến dạng.',
      'Xem thử trên điện thoại, tắt tiếng một lần để kiểm tra phụ đề có đủ hiểu nội dung không.',
      'Lưu toàn bộ prompt và file gốc theo dự án để dễ sửa và làm lại.',
    ],
    resources: [],
    prompts: [
      ['1. Chuẩn bị trước khi làm', `☐ Xác định mục tiêu video (bán hàng / tăng follow / thương hiệu)
☐ Xác định khách hàng mục tiêu và nền tảng đăng
☐ Chọn tỉ lệ khung hình (9:16 / 16:9 / 1:1)
☐ Viết kịch bản có hook 3 giây đầu và CTA cuối
☐ Chia phân cảnh (storyboard) và thời lượng từng cảnh
☐ Viết thẻ mô tả nhân vật cố định
☐ Chuẩn bị ảnh sản phẩm thật / logo / thông tin giá`],
      ['2. Tạo hình ảnh & video', `☐ Tạo ảnh tham chiếu nhân vật và bối cảnh trước
☐ Mỗi prompt có: chủ thể, hành động, bối cảnh, ánh sáng, góc máy, phong cách
☐ Đúng tỉ lệ khung hình đã chọn
☐ Tạo 2–4 phiên bản mỗi cảnh, chọn bản tốt nhất
☐ Kiểm tra: khuôn mặt nhất quán giữa các cảnh
☐ Kiểm tra: bàn tay, ngón tay, chân không bị biến dạng
☐ Kiểm tra: sản phẩm, logo, bao bì không bị méo hoặc sai chữ
☐ Không có chữ lỗi, watermark trong khung hình`],
      ['3. Âm thanh', `☐ Lời thoại / lồng tiếng rõ ràng, đúng chính tả, đúng khẩu hình (nếu có)
☐ Nhạc nền phù hợp cảm xúc, có quyền sử dụng
☐ Âm lượng nhạc thấp hơn giọng nói
☐ Có hiệu ứng âm thanh ở chuyển cảnh / điểm nhấn
☐ Không có tiếng rè, tiếng ồn lạ, đoạn im lặng bất thường`],
      ['4. Dựng & hoàn thiện', `☐ 3 giây đầu đủ hấp dẫn, không có đoạn chậm
☐ Chuyển cảnh mượt, nhịp cắt theo nhạc
☐ Phụ đề đúng chính tả, đúng dấu tiếng Việt, không che nội dung chính
☐ Chữ và nút không nằm trong vùng bị che bởi giao diện TikTok/Reels
☐ Có logo / thông tin thương hiệu, giá, ưu đãi (nếu là quảng cáo)
☐ CTA rõ ràng ở cuối video
☐ Xuất video: 1080p trở lên, 30fps, đúng tỉ lệ`],
      ['5. Đăng tải', `☐ Ảnh bìa (thumbnail) rõ chữ, hấp dẫn
☐ Tiêu đề / mô tả có từ khóa và CTA
☐ 3–5 hashtag liên quan
☐ Gắn sản phẩm / giỏ hàng / link (nếu bán hàng)
☐ Đăng vào khung giờ khán giả hoạt động nhiều
☐ Ghi nhãn nội dung AI nếu nền tảng yêu cầu
☐ Sau 24–48h: xem số liệu (giữ chân, tương tác) và ghi lại bài học cho video sau`],
    ],
  },

  'Hướng dẫn bổ sung': {
    summary: `Các mẹo nâng cao và cách xử lý lỗi thường gặp khi làm video AI, cùng những prompt "trợ lý" giúp bạn tự viết, sửa và nâng cấp prompt bằng ChatGPT / Gemini. Khi gặp lỗi, hãy xem thẻ "Xử lý lỗi" trước khi tạo lại để tiết kiệm credit.`,
    keyPoints: [
      'Video lỗi → đừng tạo lại ngay: rút gọn prompt, bớt hành động, thêm negative prompt rồi mới thử lại.',
      'Ảnh đầu vào đẹp = video đẹp: đầu tư vào khâu tạo ảnh trước khi làm video.',
      'Lưu "prompt thành công" theo từng loại cảnh để tái sử dụng.',
      'Nội dung AI: không dùng hình ảnh người thật / người nổi tiếng khi chưa được phép, ghi nhãn nội dung AI khi nền tảng yêu cầu.',
    ],
    resources: [
      ['ChatGPT', 'https://chatgpt.com'],
      ['Gemini', 'https://gemini.google.com'],
    ],
    prompts: [
      ['Xử lý lỗi thường gặp', `Mặt biến dạng / đổi mặt giữa cảnh → dùng ảnh tham chiếu, giữ nguyên thẻ nhân vật, cảnh cận mặt dùng chế độ chất lượng cao
Tay, ngón tay lỗi → tránh hành động tay phức tạp, cho tay ra ngoài khung hoặc cầm vật đơn giản
Chuyển động giật, méo → giảm số hành động, thêm "smooth, steady, slow motion"
Chữ bị lỗi trong video → thêm "no text", chèn chữ bằng CapCut
Sản phẩm sai logo/bao bì → dùng ảnh thật làm khung đầu (image-to-video)
Thoại bị cắt / nói nhanh → rút lời thoại dưới 20 từ mỗi 8 giây
Màu sắc giữa các cảnh không khớp → ghi cùng một dòng "Lighting" và "Color grade" cho mọi cảnh, chỉnh màu lại trong CapCut`],
      ['Negative prompt dùng chung', `blurry, low quality, distorted face, deformed hands, extra fingers, extra limbs, missing limbs, morphing, flickering, jitter, unnatural motion, duplicate characters, text, subtitles, watermark, logo distortion, oversaturated, cartoonish (nếu muốn ảnh thật)`],
      ['Trợ lý viết prompt video (ChatGPT / Gemini)', `Bạn là chuyên gia viết prompt cho công cụ tạo video AI [VEO3 / Kling].
Mình sẽ mô tả ý tưởng cảnh bằng tiếng Việt, bạn hãy viết lại thành prompt tiếng Anh chi tiết gồm: cỡ cảnh & góc máy, chủ thể & hành động (1 hành động chính), bối cảnh, ánh sáng, chuyển động camera, phong cách, âm thanh (nếu là VEO3), và negative prompt (nếu là Kling).
Giữ prompt dưới 120 từ. Sau đó gợi ý 2 biến thể khác về góc máy.

Ý tưởng cảnh: [mô tả bằng tiếng Việt]`],
      ['Trợ lý sửa prompt khi video lỗi', `Mình dùng prompt sau trên [công cụ] nhưng kết quả bị lỗi: [mô tả lỗi: mặt biến dạng / chuyển động giật / sai sản phẩm…].
Prompt cũ: [dán prompt]
Hãy phân tích nguyên nhân có thể và viết lại prompt đã sửa, giải thích ngắn các thay đổi.`],
      ['Phân tích video viral để học cấu trúc', `Đây là mô tả một video viral mình xem được: [mô tả nội dung, thời lượng, cảnh mở đầu, cách kết thúc, số view].
Hãy phân tích: hook 3 giây đầu, cấu trúc nội dung, nhịp cắt, cảm xúc chính, lý do người xem chia sẻ.
Sau đó đề xuất 3 ý tưởng video tương tự cho [ngành / sản phẩm của mình], kèm kịch bản ngắn và prompt cảnh mở đầu.`],
      ['Lên kế hoạch nội dung 30 ngày', `Lập kế hoạch đăng video AI trong 30 ngày cho kênh [nền tảng] về [chủ đề / ngành], mục tiêu [mục tiêu].
Mỗi ngày gồm: định dạng video (UGC, kể chuyện, review, xu hướng…), ý tưởng chính, hook mở đầu, công cụ AI chính.
Chia đều tỉ lệ 70% nội dung giá trị – 20% xây dựng thương hiệu – 10% bán hàng trực tiếp. Trình bày dạng bảng.`],
    ],
  },
};
