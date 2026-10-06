// Nội dung Module 15 — Kho Prompt Video AI: mỗi bài là bộ prompt đầy đủ để học viên sao chép.
// Phần [trong ngoặc vuông] là biến học viên tự thay.
module.exports = {
  'Prompt tạo ảnh': {
    summary: `Bộ prompt tạo ảnh tĩnh chất lượng cao dùng cho Midjourney, Flux, Ideogram, Leonardo hoặc ChatGPT (tạo ảnh). Ảnh đẹp là "nguyên liệu" đầu vào cho video AI: bạn tạo ảnh trước rồi đưa sang Kling / VEO3 / Runway để chuyển thành video (image-to-video), giúp kiểm soát bố cục và nhân vật tốt hơn nhiều so với tạo video trực tiếp từ chữ.

Mỗi prompt được viết theo công thức: Chủ thể + Hành động + Bối cảnh + Ánh sáng + Góc máy/ống kính + Phong cách + Thông số kỹ thuật. Bạn chỉ cần thay các phần trong ngoặc vuông.`,
    keyPoints: [
      'Viết prompt bằng tiếng Anh cho kết quả ổn định nhất; có thể nhờ ChatGPT dịch phần mô tả tiếng Việt.',
      'Luôn ghi tỉ lệ khung hình: --ar 9:16 cho TikTok/Reels, --ar 16:9 cho YouTube, --ar 1:1 hoặc 4:5 cho Facebook.',
      'Tạo 4 biến thể, chọn ảnh tốt nhất rồi mới upscale / đưa sang công cụ làm video.',
      'Muốn ảnh "thật" hơn: thêm tên máy ảnh, ống kính, "natural skin texture", "film grain".',
      'Tránh mô tả quá nhiều chủ thể trong một ảnh – AI dễ làm lẫn chi tiết.',
    ],
    resources: [
      ['Midjourney', 'https://www.midjourney.com'],
      ['Ideogram (ảnh có chữ)', 'https://ideogram.ai'],
      ['Leonardo AI', 'https://leonardo.ai'],
      ['Krea AI', 'https://www.krea.ai'],
    ],
    prompts: [
      ['Ảnh chân dung siêu thực (photorealistic)', `Ultra-realistic portrait photo of [mô tả người: ví dụ a 28-year-old Vietnamese woman with shoulder-length black hair], wearing [trang phục], [biểu cảm: soft natural smile], looking slightly off-camera.
Setting: [bối cảnh: a cozy coffee shop in Hanoi with warm wooden interior], background softly blurred.
Lighting: soft window light from the left, gentle rim light, natural skin tones.
Camera: shot on Sony A7 IV, 85mm f/1.4 lens, shallow depth of field, eye-level angle.
Style: editorial lifestyle photography, natural skin texture, subtle film grain, high detail, sharp focus on the eyes.
--ar [tỉ lệ: 4:5] --style raw`],
      ['Ảnh phong cảnh điện ảnh', `Cinematic wide landscape of [địa điểm: terraced rice fields in Mu Cang Chai] at [thời điểm: golden hour sunrise], [chi tiết: low mist floating between the hills, a small wooden house in the distance].
Lighting: warm low sun, long soft shadows, volumetric light rays through the mist.
Camera: shot on ARRI Alexa, 24mm wide lens, deep focus, slightly elevated angle.
Color: rich greens and warm golds, teal-and-orange cinematic grade.
Style: National Geographic photography, ultra detailed, 8K, atmospheric depth.
--ar 16:9`],
      ['Ảnh sản phẩm trên nền studio', `Professional studio product photo of [tên sản phẩm: a glass bottle of premium green tea serum] placed on [bề mặt: a smooth white marble pedestal], surrounded by [đạo cụ: fresh green tea leaves and water droplets].
Background: seamless [màu nền: soft sage green] gradient.
Lighting: large softbox key light from top-left, subtle reflection on the glass, crisp highlights, soft shadow under the product.
Camera: 100mm macro lens, f/8, front three-quarter view, product perfectly centered and in sharp focus.
Style: high-end commercial advertising, clean, minimal, luxury cosmetic brand aesthetic.
--ar [tỉ lệ: 1:1]`],
      ['Ảnh minh họa phong cách 3D Pixar', `3D animated character illustration in Pixar / Disney style: [nhân vật: a cheerful little Vietnamese boy wearing a red scarf] [hành động: holding a glowing paper lantern], standing in [bối cảnh: a colorful Hoi An street at night with lanterns].
Big expressive eyes, soft rounded shapes, warm friendly expression.
Lighting: warm lantern glow, soft global illumination, gentle bokeh lights in the background.
Render: high-quality 3D render, subsurface scattering on skin, vibrant but harmonious colors, ultra detailed textures.
--ar [tỉ lệ: 9:16]`],
      ['Ảnh nền (background) cho video có chỗ chèn chữ', `Clean background image for a video thumbnail: [chủ đề: a modern minimal workspace with a laptop and a cup of coffee], composed on the [vị trí: right] side of the frame, leaving large empty negative space on the [vị trí trống: left] side for text overlay.
Color palette: [bảng màu: soft beige, white and muted blue].
Lighting: bright soft daylight, airy mood, low contrast.
Style: minimal, premium, professional, photographic.
--ar 16:9 --no text, letters, watermark`],
      ['Ảnh có chữ (poster / thumbnail) – dùng Ideogram', `A bold YouTube thumbnail design with the large headline text "[tiêu đề ngắn, tối đa 5 chữ]" in [kiểu chữ: thick white sans-serif font with a black outline], placed at the top left.
On the right: [chủ thể: a surprised young man pointing at the text], high energy expression.
Background: [nền: vivid gradient from purple to orange with light streaks].
Style: high contrast, eye-catching, clean composition, professional YouTube thumbnail.
Aspect ratio 16:9.`],
      ['Ảnh phong cách anime / hoạt hình 2D', `Anime style illustration, [nhân vật: a young girl with long silver hair in a school uniform], [hành động: standing on a rooftop looking at the city], [bối cảnh: Tokyo-like city skyline at dusk with pink and purple clouds].
Style: Makoto Shinkai inspired, highly detailed background, glowing sky, cinematic light, soft lens flare.
Mood: [cảm xúc: nostalgic and hopeful].
--ar [tỉ lệ: 16:9] --niji 6`],
      ['Prompt gốc (template) tự điền', `[Chủ thể chính + đặc điểm nhận dạng], [hành động / tư thế], [trang phục / chất liệu].
Setting: [bối cảnh + thời gian trong ngày + thời tiết].
Lighting: [kiểu ánh sáng: soft daylight / neon / golden hour / studio softbox].
Camera: [góc máy: eye-level / low angle / top-down], [ống kính: 24mm / 50mm / 85mm], [độ sâu: shallow depth of field].
Style: [phong cách: photorealistic / cinematic / 3D Pixar / anime / watercolor].
Color: [tông màu chủ đạo].
Quality: ultra detailed, sharp focus, high resolution.
--ar [tỉ lệ] --no [những thứ không muốn xuất hiện: text, watermark, extra fingers]`],
    ],
  },

  'Prompt nhân vật': {
    summary: `Bộ prompt giúp tạo và giữ nhân vật đồng nhất (character consistency) xuyên suốt nhiều cảnh video – yếu tố quan trọng nhất để video AI trông chuyên nghiệp.

Quy trình chuẩn: (1) Tạo "character sheet" – bảng nhân vật nhiều góc nhìn; (2) Chọn 1 ảnh gốc đẹp nhất làm ảnh tham chiếu; (3) Dùng ảnh tham chiếu (character reference / --cref / Elements) cho mọi cảnh tiếp theo; (4) Luôn lặp lại đúng đoạn mô tả nhân vật trong mỗi prompt.`,
    keyPoints: [
      'Viết một "thẻ mô tả nhân vật" cố định (tuổi, khuôn mặt, tóc, trang phục) và dán y nguyên vào mọi prompt.',
      'Midjourney: dùng --cref [link ảnh] --cw 100 để giữ cả khuôn mặt lẫn trang phục; --cw 0 chỉ giữ khuôn mặt.',
      'Kling: dùng tính năng Elements / Multi-image reference để đưa ảnh nhân vật vào video.',
      'Trang phục nên có 1–2 chi tiết dễ nhận (ví dụ áo khoác vàng, khăn đỏ) để người xem nhận ra ngay.',
      'Không đổi ánh sáng / phong cách quá mạnh giữa các cảnh – nhân vật sẽ bị "trôi" khuôn mặt.',
    ],
    resources: [
      ['Midjourney – Character Reference', 'https://docs.midjourney.com'],
      ['Kling AI', 'https://klingai.com'],
      ['Leonardo AI', 'https://leonardo.ai'],
    ],
    prompts: [
      ['Thẻ mô tả nhân vật (dán vào mọi prompt)', `CHARACTER: [Tên nhân vật], a [tuổi]-year-old [giới tính] [quốc tịch: Vietnamese], [dáng người: slim, medium height], [khuôn mặt: oval face, soft jawline, small nose], [mắt: dark brown almond-shaped eyes], [tóc: straight black hair in a low ponytail], [đặc điểm nhận dạng: a small mole under the left eye].
OUTFIT: [trang phục cố định: a mustard-yellow oversized jacket over a white T-shirt, light blue jeans, white sneakers].
PERSONALITY (thể hiện qua biểu cảm): [tính cách: cheerful, confident, energetic].`],
      ['Character sheet nhiều góc nhìn', `Character reference sheet of [dán thẻ mô tả nhân vật], full body, shown in multiple views: front view, three-quarter view, side profile, back view, plus 3 close-up facial expressions (happy, surprised, serious).
Neutral light grey background, even studio lighting, consistent proportions and outfit across all views.
Style: [phong cách: photorealistic / 3D Pixar / anime], clean, highly detailed, model sheet layout.
--ar 16:9`],
      ['Ảnh gốc chân dung để làm reference', `Front-facing portrait of [dán thẻ mô tả nhân vật], head and shoulders, looking directly at the camera, neutral relaxed expression.
Plain soft grey background, soft even studio lighting, no harsh shadows.
Shot on 85mm lens, f/2.8, sharp focus on the face, natural skin texture, ultra realistic.
--ar 1:1 --style raw`],
      ['Đưa nhân vật vào cảnh mới (giữ đồng nhất)', `[Dán thẻ mô tả nhân vật], [hành động mới: walking through a busy night market while holding a bubble tea], [biểu cảm: smiling and looking around curiously].
Setting: [bối cảnh: Ben Thanh night market in Saigon, colorful stalls, string lights].
Lighting: warm neon and string lights, soft glow on the face.
Camera: medium shot, 35mm lens, eye level, slight handheld feel.
Keep the exact same face, hairstyle and outfit as the reference image.
--ar 9:16 --cref [link ảnh gốc] --cw 100`],
      ['Nhân vật hoạt hình kể chuyện (3D)', `3D Pixar-style character: [tên], a [mô tả: chubby orange cat wearing a tiny blue backpack], big round green eyes, fluffy fur, expressive eyebrows.
Pose: [tư thế: standing on two legs and waving happily].
Background: simple pastel [màu] background for reference.
Render: soft lighting, high-quality 3D, consistent design suitable for a children's animated series.
Create front, side and back views on one sheet.
--ar 16:9`],
      ['Nhân vật KOL / người dẫn chương trình ảo', `Professional virtual presenter: [dán thẻ mô tả nhân vật], wearing [trang phục: a navy blazer over a white blouse], standing in [bối cảnh: a modern bright studio with a softly blurred LED screen behind].
Pose: facing the camera, hands gently gesturing as if explaining something, confident friendly smile.
Lighting: soft three-point studio lighting, clean and flattering.
Camera: medium shot from waist up, 50mm lens, eye level.
Style: photorealistic, broadcast quality.
--ar 9:16`],
      ['Prompt video: nhân vật nói chuyện (VEO3)', `A medium close-up shot of [dán thẻ mô tả nhân vật], sitting [bối cảnh: at a wooden desk in a bright home office], looking directly into the camera and speaking naturally with friendly hand gestures.
She says in Vietnamese: "[câu thoại ngắn, dưới 20 từ]"
Camera: static, eye level, shallow depth of field.
Lighting: soft natural window light.
Audio: clear voice, quiet room tone, no background music.
No subtitles, no text on screen.`],
    ],
  },

  'Prompt sản phẩm': {
    summary: `Bộ prompt chụp ảnh và quay video sản phẩm bằng AI: mỹ phẩm, đồ uống, thời trang, đồ gia dụng, công nghệ, thực phẩm. Dùng cho ảnh đăng sàn TMĐT, ảnh quảng cáo và cảnh quay sản phẩm (product shot) trong video bán hàng.

Mẹo quan trọng: nếu có ảnh sản phẩm thật, hãy dùng chế độ image-to-video (đưa ảnh thật vào Kling / VEO3 / Runway) để giữ đúng bao bì, logo – AI tự tạo sản phẩm từ chữ thường sai chữ và logo.`,
    keyPoints: [
      'Có ảnh thật → tách nền (Photoroom / remove.bg) → ghép bối cảnh AI → chuyển thành video.',
      'Mô tả rõ chất liệu: glass, matte plastic, brushed metal, glossy… để ánh sáng phản chiếu đúng.',
      'Chuyển động sản phẩm nên chậm và đơn giản: xoay 360°, camera orbit, dolly in, nước bắn, khói bay.',
      'Thêm "no text, no logo distortion" và tự chèn logo/giá bằng CapCut sau.',
    ],
    resources: [
      ['Photoroom – tách nền ảnh sản phẩm', 'https://www.photoroom.com'],
      ['remove.bg', 'https://www.remove.bg'],
      ['Runway', 'https://runwayml.com'],
    ],
    prompts: [
      ['Ảnh mỹ phẩm sang trọng', `Luxury cosmetic product photography of [sản phẩm: a frosted glass skincare jar with a gold lid] resting on [bề mặt: wet black stone], with [đạo cụ: delicate white orchid petals and tiny water droplets] around it.
Background: deep [màu: emerald green] with soft gradient.
Lighting: dramatic side light, glossy highlights on the glass, subtle golden reflections, soft shadow.
Camera: 100mm macro, f/11, eye-level, product centered and razor sharp.
Style: high-end beauty advertising, elegant, premium.
--ar 4:5 --no text`],
      ['Ảnh đồ uống bắn nước (splash)', `High-speed commercial photo of [sản phẩm: a cold can of lime soda] with [hiệu ứng: a dynamic splash of sparkling water and ice cubes] exploding around it, [trái cây: fresh lime slices and mint leaves] flying in the air.
Background: bright [màu: lime green to yellow] gradient.
Lighting: strong backlight making the droplets glow, crisp rim light on the can, condensation drops on the surface.
Camera: 1/8000s freeze motion, 70mm lens, slightly low angle.
Style: energetic beverage advertising, ultra detailed, vibrant.
--ar 9:16`],
      ['Ảnh thời trang mặc trên người mẫu', `Fashion e-commerce photo of a [người mẫu: young Vietnamese female model] wearing [sản phẩm: a beige linen oversized shirt dress with wooden buttons], [tư thế: standing naturally with one hand in the pocket], full body visible.
Background: [nền: clean warm off-white studio wall] / [hoặc: a sunny street in Da Lat].
Lighting: soft diffused daylight, true-to-life fabric color and texture.
Camera: 50mm lens, eye level, full body framing with space around.
Style: minimalist fashion catalog, natural, realistic fabric folds.
--ar 3:4`],
      ['Ảnh đồ ăn hấp dẫn (food)', `Mouth-watering food photography of [món ăn: a steaming bowl of Vietnamese beef pho with fresh herbs, lime and chili], placed on [bề mặt: a rustic wooden table], [đạo cụ: chopsticks, a small dish of bean sprouts, soft steam rising].
Lighting: warm side window light, rich highlights on the broth, appetizing glow.
Camera: 45-degree angle, 50mm lens, shallow depth of field, focus on the beef slices.
Style: professional restaurant menu photography, warm, inviting, ultra detailed.
--ar 4:5`],
      ['Ảnh đồ công nghệ', `Sleek tech product shot of [sản phẩm: wireless earbuds in a matte white charging case], case slightly open, one earbud floating above it.
Background: dark [màu: navy] with subtle glowing [màu ánh sáng: cyan] light lines.
Lighting: precise rim lighting, soft reflections on the glossy surfaces, futuristic atmosphere.
Camera: 85mm, low angle, product hero composition.
Style: Apple-style minimal tech advertising, clean, premium, ultra sharp.
--ar 16:9 --no text`],
      ['Video sản phẩm xoay 360° (image-to-video)', `[Dùng ảnh sản phẩm làm khung hình đầu]
The product slowly rotates 360 degrees on a turntable, smooth and steady motion. The camera stays fixed at eye level.
Soft studio lighting with gentle moving reflections on the surface. Background stays clean and unchanged.
Keep the product shape, label and logo exactly the same as the input image. No morphing, no extra objects.
Duration: 5 seconds, slow motion feel.`],
      ['Video sản phẩm – camera tiến sát (hero shot)', `Cinematic product reveal: the camera slowly dollies in from a wide shot to a close-up of [sản phẩm] standing on [bề mặt], while [hiệu ứng: soft mist drifts across the table and small light particles float in the air].
Lighting: moody low-key light, a soft spotlight hitting the product, glowing edges.
Camera: smooth dolly in, shallow depth of field, focus locked on the product.
Style: luxury TV commercial, slow motion, 24fps cinematic.
Keep the product design and label unchanged.`],
      ['Flatlay sản phẩm (chụp từ trên xuống)', `Top-down flat lay photo of [sản phẩm chính] arranged neatly with [phụ kiện liên quan: a notebook, a pair of sunglasses, a small plant, a coffee cup] on [nền: a pastel pink paper background].
Composition: balanced, plenty of space, product in the center.
Lighting: bright even daylight, soft shadows.
Style: Instagram lifestyle flat lay, clean, trendy, high resolution.
--ar 1:1`],
    ],
  },

  'Prompt VEO3': {
    summary: `Bộ prompt dành riêng cho Google VEO3 (trên Gemini / Google Flow). Điểm mạnh của VEO3 là tạo video có âm thanh và lời thoại đồng bộ khẩu hình, nên prompt cần mô tả cả hình ảnh lẫn âm thanh.

Cấu trúc prompt VEO3 hiệu quả: [Cảnh quay & góc máy] + [Nhân vật & hành động] + [Bối cảnh] + [Ánh sáng & phong cách] + [Lời thoại: nhân vật nói "..."] + [Âm thanh nền / hiệu ứng]. Mỗi clip dài khoảng 8 giây nên lời thoại chỉ nên 15–20 từ.`,
    keyPoints: [
      'Lời thoại đặt trong ngoặc kép và ghi rõ ngôn ngữ: says in Vietnamese: "...".',
      'Mỗi clip 8 giây ≈ 15–20 từ thoại; dài hơn sẽ bị nói vội hoặc cắt câu.',
      'Ghi "no subtitles, no text on screen" để VEO3 không tự chèn chữ lỗi.',
      'Mô tả âm thanh: ambient sound, footsteps, music style… hoặc "no background music" nếu muốn tự ghép nhạc.',
      'Muốn nối nhiều cảnh: giữ nguyên thẻ mô tả nhân vật và bối cảnh, dùng Extend / Frames to video trong Flow.',
    ],
    resources: [
      ['Google Flow (VEO3)', 'https://labs.google/fx/tools/flow'],
      ['Gemini', 'https://gemini.google.com'],
    ],
    prompts: [
      ['Người bán hàng giới thiệu sản phẩm (có thoại)', `Medium shot, eye level. A friendly Vietnamese woman in her late 20s with long black hair, wearing a white blouse, stands behind a clean wooden counter in a bright modern shop. She holds up [sản phẩm] toward the camera and smiles.
She says in Vietnamese with an enthusiastic, warm tone: "[câu thoại: Đây là chai serum mình dùng mỗi tối, da mịn hẳn sau hai tuần!]"
Lighting: soft bright daylight, clean commercial look.
Camera: static, shallow depth of field, focus on her face and the product.
Audio: clear voice, light shop ambience, no background music.
No subtitles, no text on screen.`],
      ['Phỏng vấn đường phố (street interview)', `Handheld street interview style shot on a busy sidewalk in [thành phố: Saigon] at late afternoon. A young Vietnamese man in a casual T-shirt is holding a microphone toward a [người được hỏi: cheerful middle-aged woman with a conical hat].
The interviewer asks in Vietnamese: "[câu hỏi ngắn]"
She laughs and answers in Vietnamese: "[câu trả lời ngắn]"
Camera: handheld, slightly shaky, vlog style, 28mm lens.
Audio: natural street noise, motorbikes in the background, clear dialogue.
No subtitles.`],
      ['Cảnh điện ảnh không thoại', `Cinematic wide shot: [chủ thể: a lone fisherman] rows a small wooden boat across [bối cảnh: a misty lake surrounded by limestone mountains in Ninh Binh] at dawn.
The camera slowly glides forward low above the water.
Lighting: soft blue dawn light turning golden, thin mist on the surface, gentle reflections.
Style: cinematic, 35mm film look, slow and peaceful.
Audio: gentle water ripples, distant birds, soft ambient wind. No dialogue, no music.`],
      ['Vlog nói trước camera (selfie)', `Selfie-style vertical video: a [nhân vật: young Vietnamese woman with a short bob haircut] holds the phone at arm's length while walking through [bối cảnh: a sunny park with tall trees].
She talks to the camera excitedly in Vietnamese: "[câu thoại: Hôm nay mình sẽ chỉ các bạn 3 mẹo làm video AI siêu nhanh!]"
Camera: front phone camera, slight natural hand movement, 9:16 framing.
Lighting: natural daylight with sun flares through the leaves.
Audio: her clear voice, birds and light wind. No background music, no subtitles.`],
      ['Hội thoại 2 nhân vật', `Medium two-shot inside [bối cảnh: a cozy small coffee shop with warm lights]. On the left, [nhân vật A: a young man in a grey hoodie]; on the right, [nhân vật B: a young woman in a red cardigan]. They sit facing each other across a small table with two cups of coffee.
The man says in Vietnamese: "[câu thoại A]"
The woman smiles and replies in Vietnamese: "[câu thoại B]"
Camera: static, eye level, soft shallow depth of field.
Audio: clear dialogue, soft café ambience, quiet cups clinking. No music, no subtitles.`],
      ['Quảng cáo đồ ăn (âm thanh ASMR)', `Extreme close-up, slow motion: [món ăn: a crispy golden fried chicken piece] is lifted from a basket, sauce dripping, steam rising.
Then a person takes a big crunchy bite.
Lighting: warm, appetizing, glossy highlights.
Camera: macro lens, slow dolly in.
Audio: loud satisfying ASMR crunch, sizzling sound, no voice, no music.
No text on screen.`],
      ['Template prompt VEO3 tự điền', `[Loại cảnh quay: medium shot / close-up / wide shot], [góc máy: eye level / low angle / top-down].
[Mô tả nhân vật: tuổi, giới tính, ngoại hình, trang phục] [hành động cụ thể] in [bối cảnh chi tiết].
[Nhân vật] says in Vietnamese with a [giọng điệu: warm / excited / serious] tone: "[câu thoại 15–20 từ]"
Lighting: [ánh sáng].
Camera movement: [static / slow dolly in / handheld / orbit].
Style: [phong cách: realistic commercial / cinematic / vlog].
Audio: [âm thanh nền + hiệu ứng], [no background music].
No subtitles, no text on screen.`],
    ],
  },

  'Prompt Kling': {
    summary: `Bộ prompt cho Kling AI – công cụ mạnh về chuyển động tự nhiên, image-to-video và giữ nhân vật bằng Elements. Kling hiểu tốt prompt tiếng Anh ngắn gọn, tập trung vào CHUYỂN ĐỘNG (thay vì mô tả lại toàn bộ hình ảnh khi đã có ảnh đầu vào).

Công thức Kling: [Chủ thể] + [Chuyển động của chủ thể] + [Bối cảnh] + [Chuyển động camera] + [Ánh sáng / không khí] + [Phong cách]. Với image-to-video: chỉ mô tả cái gì chuyển động và camera di chuyển thế nào.`,
    keyPoints: [
      'Image-to-video: đừng mô tả lại ảnh, chỉ mô tả chuyển động. Prompt càng ngắn càng ít bị biến dạng.',
      'Dùng ô Negative prompt: blurry, distorted face, extra limbs, morphing, flickering, text, watermark.',
      'Chế độ Professional / High quality cho cảnh có người; Standard để thử ý tưởng nhanh, tiết kiệm credit.',
      'Start frame + End frame giúp điều khiển chuyển cảnh chính xác (ví dụ sản phẩm từ hộp bay ra).',
      'Mỗi clip một hành động chính – nhiều hành động trong 5 giây sẽ rất dễ lỗi.',
    ],
    resources: [
      ['Kling AI', 'https://klingai.com'],
    ],
    prompts: [
      ['Image-to-video: chân dung sống động', `The [nhân vật] slowly turns her head toward the camera and gives a gentle smile, her hair moving softly in the breeze. She blinks naturally.
Camera: very slow push in.
Lighting stays consistent, soft and warm.
Realistic, subtle natural motion.

Negative prompt: distorted face, morphing, extra fingers, flickering, blurry, text, watermark`],
      ['Text-to-video: người mẫu catwalk thời trang', `A tall Vietnamese female model wearing [trang phục: a flowing red silk ao dai] walks confidently toward the camera on a [bối cảnh: minimalist white runway], fabric flowing elegantly with each step.
Camera: slow tracking backward at eye level, keeping her centered.
Lighting: bright fashion-show spotlights, soft shadows.
Style: high fashion film, cinematic, 4K, smooth motion.

Negative prompt: deformed hands, unnatural walk, morphing clothes, blurry, text`],
      ['Sản phẩm bay ra khỏi hộp (start + end frame)', `Start frame: closed gift box on a table. End frame: [sản phẩm] floating above the open box.
The lid of the box pops open, soft golden light bursts out, and [sản phẩm] slowly rises and floats above the box while sparkling particles swirl around it.
Camera: slight slow push in.
Style: magical commercial, smooth, premium.

Negative prompt: product shape change, label distortion, flickering, extra objects`],
      ['Cảnh hành động – chạy trong mưa', `A young man in a black jacket runs through [bối cảnh: a neon-lit rainy alley at night], splashing through puddles, rain falling heavily, neon reflections on the wet ground.
Camera: handheld tracking shot from the side, slight motion blur.
Lighting: pink and blue neon, strong rim light, cinematic contrast.
Style: action movie, dramatic, 24fps.

Negative prompt: distorted body, extra legs, frozen motion, blurry face`],
      ['Động vật đáng yêu (viral)', `A fluffy [con vật: golden retriever puppy] [hành động: wearing tiny sunglasses, sits on a surfboard and rides a small wave] at [bối cảnh: a sunny tropical beach], tail wagging happily.
Camera: low angle tracking shot, water splashes toward the lens.
Lighting: bright midday sun, sparkling water.
Style: funny, realistic, high detail, smooth motion.

Negative prompt: deformed animal, extra legs, morphing, blurry`],
      ['Cảnh thiên nhiên timelapse', `Timelapse of [bối cảnh: clouds rolling over the peaks of Fansipan mountain], fast-moving clouds flowing like waves, sunlight shifting from morning to golden afternoon, shadows sweeping across the valleys.
Camera: static wide shot on a tripod.
Style: cinematic nature documentary, ultra detailed, 4K.

Negative prompt: flickering, jitter, distorted terrain`],
      ['Hoạt hình 3D cho trẻ em', `3D Pixar-style animation: [nhân vật: a small orange cat with a blue backpack] skips happily along [bối cảnh: a colorful forest path with giant mushrooms], then stops and waves at the camera.
Camera: smooth tracking shot, then gentle push in.
Lighting: warm soft sunlight, magical floating particles.
Style: children's animated film, vibrant colors, bouncy cartoon motion.

Negative prompt: realistic style, distorted face, flickering`],
      ['Template prompt Kling tự điền', `[Chủ thể + đặc điểm ngắn gọn] [chuyển động chính, một hành động] in [bối cảnh].
[Chuyển động phụ: tóc bay, khói, nước, lá rơi…].
Camera: [static / slow push in / tracking / orbit / crane up].
Lighting: [ánh sáng].
Style: [phong cách], smooth natural motion.

Negative prompt: blurry, distorted face, extra limbs, morphing, flickering, text, watermark`],
    ],
  },

  'Prompt Camera': {
    summary: `Từ điển chuyển động camera và góc máy dùng được cho mọi công cụ video AI (VEO3, Kling, Runway, Hailuo, Sora…). Biết gọi đúng tên chuyển động camera là cách nhanh nhất để video AI trông "có đạo diễn" thay vì nghiệp dư.

Mỗi thẻ dưới đây gồm cụm từ chuẩn tiếng Anh + một prompt mẫu để bạn ghép vào phần mô tả cảnh của mình.`,
    keyPoints: [
      'Mỗi clip chỉ nên dùng 1 chuyển động camera chính.',
      'Dolly / Push in: tạo cảm xúc, tập trung. Pull out: hé lộ bối cảnh. Orbit: khoe sản phẩm. Crane up: mở cảnh hoành tráng.',
      'Thêm tốc độ: slow, smooth, steady hoặc fast, whip – AI hiểu rất tốt.',
      'Kết hợp ống kính: 24mm (rộng, hùng vĩ), 50mm (tự nhiên), 85mm (chân dung, xóa phông), macro (cận cảnh chi tiết).',
    ],
    resources: [
      ['Runway', 'https://runwayml.com'],
      ['Hailuo AI', 'https://hailuoai.video'],
    ],
    prompts: [
      ['Dolly in / Push in – tiến chậm vào chủ thể', `Camera: slow smooth dolly in from a medium shot to a close-up of [chủ thể], keeping it centered, shallow depth of field, background gradually blurring.
Ví dụ: Slow smooth dolly in toward a young woman reading a letter by the window, ending on a close-up of her teary eyes, soft warm light.`],
      ['Pull out / Dolly out – lùi ra hé lộ bối cảnh', `Camera: slow dolly out starting from a close-up of [chi tiết] and pulling back to reveal [toàn cảnh].
Ví dụ: Starting on a close-up of a steaming cup of coffee, the camera slowly pulls back to reveal a cozy rooftop café overlooking the city at sunset.`],
      ['Orbit / Arc shot – xoay vòng quanh chủ thể', `Camera: smooth 180-degree orbit around [chủ thể] at eye level, constant distance, steady speed.
Ví dụ: Smooth orbit around a luxury perfume bottle standing on black glass, reflections sliding across its surface, dramatic rim light.`],
      ['Tracking shot – đi theo chủ thể', `Camera: steady tracking shot following [chủ thể] from [vị trí: behind / the side / the front] as they [hành động], keeping the same distance.
Ví dụ: Steady side tracking shot following a cyclist riding along a coastal road at golden hour, sea sparkling in the background.`],
      ['Crane up / Drone – nâng cao toàn cảnh', `Camera: crane up / drone rising from ground level to a high aerial view, revealing [toàn cảnh].
Ví dụ: The camera rises from a busy street food stall up into the sky, revealing the glowing night skyline of Hanoi Old Quarter.`],
      ['FPV drone – bay xuyên tốc độ cao', `Camera: fast FPV drone shot flying low and diving through [bối cảnh], sweeping turns, dynamic motion blur.
Ví dụ: Fast FPV drone flying through a narrow canyon river, skimming over the water, then rising to reveal a waterfall.`],
      ['Pan / Tilt – lia ngang, lia dọc', `Camera: slow pan from left to right across [bối cảnh]. / Camera: slow tilt up from [phần dưới] to [phần trên].
Ví dụ: Slow tilt up from a woman's red high heels to her face as she turns and smiles, elegant evening street lights.`],
      ['Handheld / POV – cầm tay, góc nhìn thứ nhất', `Camera: handheld, slight natural shake, POV from the eyes of [nhân vật] as they [hành động].
Ví dụ: Handheld POV shot walking into a crowded night market, hands reaching out to pick up a skewer of grilled meat.`],
      ['Whip pan / Crash zoom – chuyển cảnh nhanh', `Camera: fast whip pan to the right with heavy motion blur, revealing [chủ thể mới]. / Camera: sudden crash zoom into [chi tiết].
Ví dụ: Sudden crash zoom into the surprised face of a man opening a delivery box, comedic timing.`],
      ['Góc máy & cỡ cảnh (ghép nhanh)', `Extreme wide shot – toàn cảnh rất rộng | Wide shot – toàn cảnh | Medium shot – trung cảnh (ngang hông) | Medium close-up – cận trung (ngang ngực) | Close-up – cận mặt | Extreme close-up – đặc tả (mắt, chi tiết sản phẩm)
Low angle – góc thấp (chủ thể quyền lực) | High angle – góc cao (chủ thể nhỏ bé) | Top-down / Bird's eye – từ trên xuống | Dutch angle – nghiêng (căng thẳng) | Over-the-shoulder – qua vai (hội thoại)`],
    ],
  },

  'Prompt quảng cáo': {
    summary: `Bộ prompt và kịch bản làm video quảng cáo bán hàng bằng AI: từ ý tưởng, kịch bản 15–30 giây, đến prompt từng cảnh. Áp dụng công thức quảng cáo kinh điển AIDA (Chú ý – Thích thú – Mong muốn – Hành động) và PAS (Vấn đề – Khuấy động – Giải pháp).

Gợi ý quy trình: dùng prompt "Kịch bản" với ChatGPT/Gemini để có phân cảnh → dùng prompt "Cảnh" cho VEO3/Kling → ghép trong CapCut, thêm logo, giá, nhạc.`,
    keyPoints: [
      '3 giây đầu quyết định người xem có ở lại không: mở bằng vấn đề, kết quả bất ngờ hoặc câu hỏi.',
      'Video bán hàng ngắn: 15–30 giây, 4–6 cảnh, mỗi cảnh 3–5 giây.',
      'Luôn kết thúc bằng lời kêu gọi hành động rõ ràng (CTA): "Bấm vào giỏ hàng", "Nhắn tin ngay"…',
      'Tự chèn giá, khuyến mãi, logo bằng CapCut – không nhờ AI vẽ chữ trong video.',
    ],
    resources: [
      ['ChatGPT', 'https://chatgpt.com'],
      ['Gemini', 'https://gemini.google.com'],
      ['CapCut', 'https://www.capcut.com'],
    ],
    prompts: [
      ['Nhờ AI viết kịch bản quảng cáo (ChatGPT / Gemini)', `Bạn là chuyên gia viết kịch bản quảng cáo video ngắn cho TikTok và Facebook Reels tại Việt Nam.
Hãy viết kịch bản video quảng cáo dài [thời lượng: 20] giây cho sản phẩm: [tên sản phẩm].
- Điểm nổi bật: [3 lợi ích chính]
- Khách hàng mục tiêu: [độ tuổi, giới tính, nỗi đau / mong muốn]
- Giọng điệu: [vui tươi / sang trọng / chân thật]
- Ưu đãi: [khuyến mãi]
Yêu cầu:
1. Áp dụng công thức PAS, 3 giây đầu phải có hook gây tò mò.
2. Chia thành 5 cảnh, mỗi cảnh ghi: thời lượng, hình ảnh, lời thoại / voice-over, chữ trên màn hình.
3. Viết thêm cho mỗi cảnh 1 prompt tiếng Anh để tạo video bằng VEO3 (có mô tả góc máy, ánh sáng, âm thanh).
4. Kết thúc bằng CTA rõ ràng.`],
      ['Cảnh 1 – Hook nêu vấn đề', `Close-up of a frustrated young Vietnamese woman looking in the bathroom mirror, touching [vấn đề: her dry, flaky skin], sighing.
She says in Vietnamese: "[câu hook: Da khô bong tróc dù đã thử đủ loại kem?]"
Lighting: cool flat bathroom light, slightly desaturated colors to show the problem.
Camera: static, mirror reflection shot.
Audio: quiet bathroom ambience, her voice clear. No subtitles.`],
      ['Cảnh 2 – Giới thiệu giải pháp (sản phẩm xuất hiện)', `The same woman opens a drawer and picks up [sản phẩm], her face brightening with curiosity. The product is shown in a clean close-up with a soft light glow.
Camera: smooth push in on the product in her hand.
Lighting: transitions from cool to warm, bright and hopeful.
Audio: a soft "ding" sound effect, light uplifting music begins. No subtitles.`],
      ['Cảnh 3 – Trải nghiệm / Demo sản phẩm', `Macro close-up: [hành động dùng sản phẩm: a drop of serum falls onto fingertips and is gently massaged into glowing skin], texture visible, light reflecting on the skin.
Camera: slow motion, macro lens, shallow depth of field.
Lighting: warm soft beauty light.
Audio: gentle ASMR sound of the product, soft music. No text.`],
      ['Cảnh 4 – Kết quả / Before–After', `Medium close-up of the same woman, now with [kết quả: healthy, glowing, hydrated skin], smiling confidently at the camera in bright morning sunlight by a window.
She says in Vietnamese: "[câu thoại kết quả: Chỉ sau 7 ngày, da mình mềm mịn hẳn luôn!]"
Camera: static, eye level, flattering soft light.
Audio: clear voice, uplifting music. No subtitles.`],
      ['Cảnh 5 – CTA kêu gọi mua hàng', `The woman holds [sản phẩm] next to her face, points at it and winks at the camera.
She says in Vietnamese with excitement: "[CTA: Đang giảm 30% hôm nay, bấm vào giỏ hàng ngay nhé!]"
Background: bright, clean, branded colors [màu thương hiệu].
Camera: medium shot, static.
Audio: energetic music ending, clear voice. Leave empty space at the bottom for price text overlay. No subtitles.`],
      ['Quảng cáo kiểu TVC sang trọng (không thoại)', `Luxury TV commercial for [sản phẩm]: slow-motion shots of [yếu tố gợi cảm xúc: silk fabric flowing, golden liquid swirling, light reflecting on glass], ending with the product standing alone on a dark reflective surface under a single spotlight.
Camera: slow dolly in, macro details, elegant transitions.
Lighting: dramatic low-key, golden highlights.
Audio: elegant orchestral music with deep bass hits. No dialogue, no text.`],
      ['Ý tưởng 10 hook mở đầu (ChatGPT)', `Hãy viết 10 câu hook mở đầu (dưới 12 chữ mỗi câu) cho video TikTok bán [sản phẩm] dành cho [khách hàng mục tiêu].
Dùng đa dạng kiểu: câu hỏi gây tò mò, nêu nỗi đau, kết quả bất ngờ, phản biện niềm tin sai, con số cụ thể, so sánh trước–sau, "đừng mua … nếu chưa xem video này".
Sau mỗi hook, gợi ý 1 cảnh hình ảnh tương ứng trong 3 giây đầu.`],
    ],
  },

  'Prompt Affiliate': {
    summary: `Bộ prompt làm video tiếp thị liên kết (affiliate) cho TikTok Shop, Shopee, Lazada: review sản phẩm, unbox, so sánh, top danh sách, "món này đáng mua". Mục tiêu là video tự nhiên như người dùng thật chia sẻ, có lý do mua rõ ràng và dẫn về link/giỏ hàng.

Lưu ý: luôn trung thực về công dụng sản phẩm, không hứa hẹn quá mức; với mỹ phẩm, thực phẩm chức năng cần tuân thủ quy định quảng cáo.`,
    keyPoints: [
      'Định dạng hiệu quả: Review nhanh 15s, Unbox, Top 3/Top 5, So sánh A vs B, "Mua gì với 100k".',
      'Nói lý do mua cụ thể (giá, tiện, giải quyết vấn đề gì) thay vì khen chung chung.',
      'Có thể dùng ảnh sản phẩm thật từ shop + image-to-video để giữ đúng sản phẩm.',
      'CTA affiliate: "Link mình để ở giỏ hàng / bio", "Săn mã giảm giá trong giỏ".',
    ],
    resources: [
      ['TikTok Shop Affiliate', 'https://affiliate.tiktok.com'],
      ['Shopee Affiliate', 'https://affiliate.shopee.vn'],
    ],
    prompts: [
      ['Kịch bản review affiliate 30s (ChatGPT)', `Bạn là một TikToker review đồ gia dụng có giọng văn gần gũi, hài hước.
Viết kịch bản video review 30 giây cho sản phẩm affiliate: [tên sản phẩm], giá [giá], link trong giỏ hàng.
Thông tin: [đặc điểm sản phẩm, ưu điểm, nhược điểm nhỏ].
Cấu trúc:
- 0–3s: Hook gây tò mò (nêu vấn đề hằng ngày).
- 3–20s: Demo 3 tính năng, mỗi tính năng 1 câu ngắn + mô tả cảnh quay.
- 20–25s: 1 nhược điểm nhỏ để tăng độ tin cậy.
- 25–30s: CTA mua qua giỏ hàng.
Ghi rõ lời thoại và cảnh quay cho từng đoạn, kèm prompt tiếng Anh cho VEO3.`],
      ['Unbox sản phẩm (POV tay mở hộp)', `Top-down POV shot of two hands unboxing [sản phẩm] on [bề mặt: a clean white desk next to a laptop and a small plant]. The hands slowly peel the tape, open the box, remove the tissue paper and lift the product toward the camera, turning it to show details.
Lighting: bright soft daylight, clean aesthetic.
Camera: static overhead, then slight tilt to reveal the product.
Audio: satisfying ASMR unboxing sounds: tape peeling, paper rustling. No voice, no music, no text.`],
      ['Review chân thật kiểu UGC (có thoại)', `Vertical selfie video: a [nhân vật: Vietnamese woman in her early 30s, casual home clothes] sits on her sofa in a cozy living room, holding [sản phẩm] up to the camera.
She says in Vietnamese in a natural, honest tone: "[câu thoại: Mua thử con máy này 299 nghìn mà xài sướng thật, để mình chỉ các bạn nha.]"
Camera: front phone camera, handheld, slight movement.
Lighting: natural window light, warm home atmosphere.
Audio: clear voice, quiet room. No music, no subtitles.`],
      ['Demo tính năng sản phẩm', `Close-up demonstration of [sản phẩm: a mini handheld vacuum cleaner] [hành động: sucking up cookie crumbs from a dark sofa in one smooth pass], the dirty area becomes perfectly clean.
Camera: close-up, static, then slow push in on the clean result.
Lighting: bright natural light, realistic home setting.
Audio: realistic vacuum sound, satisfying. No text on screen.`],
      ['So sánh A vs B', `Split-screen style shot: on the left [sản phẩm A: a regular kitchen knife struggling to cut a tomato], on the right [sản phẩm B: a new ceramic knife slicing the tomato cleanly in one motion].
Camera: identical static close-up framing on both sides.
Lighting: bright kitchen light.
Audio: squishing sound on the left, clean slicing sound on the right. No text.`],
      ['Top 5 món đồ (ChatGPT lên ý tưởng)', `Gợi ý cho mình 5 sản phẩm [ngành hàng: đồ dùng nhà bếp] giá dưới [mức giá] phù hợp làm video "Top 5 món đồ đáng mua" trên TikTok Shop cho đối tượng [đối tượng].
Với mỗi sản phẩm: tên gợi ý, vấn đề nó giải quyết, 1 câu thoại 10 giây, và 1 prompt tiếng Anh tạo cảnh demo bằng VEO3 (có âm thanh, không chữ trên màn hình).
Cuối cùng viết 1 câu CTA chung dẫn về giỏ hàng.`],
      ['Cảnh "món này đáng tiền" (lifestyle)', `Lifestyle shot of a young Vietnamese couple using [sản phẩm] together in [bối cảnh: their small bright apartment kitchen], laughing, the product making the task easy and fun.
Camera: medium shot, slow handheld movement, natural feel.
Lighting: warm morning sunlight.
Style: authentic lifestyle commercial, not overly polished.
Audio: light laughter, kitchen ambience, soft acoustic music.`],
    ],
  },

  'Prompt UGC': {
    summary: `UGC (User Generated Content) là video trông như do khách hàng thật tự quay bằng điện thoại: chân thật, gần gũi, không quá bóng bẩy. Đây là định dạng có tỉ lệ chuyển đổi cao nhất trên TikTok và Facebook Ads.

Bí quyết để AI tạo UGC "thật": mô tả máy quay là điện thoại (phone camera, selfie, handheld), bối cảnh đời thường (phòng ngủ, xe hơi, bếp), ánh sáng tự nhiên, trang phục giản dị và lời nói tự nhiên có từ đệm.`,
    keyPoints: [
      'Thêm "shot on iPhone, handheld, natural imperfect framing" để bớt cảm giác quảng cáo.',
      'Lời thoại nên có từ đệm tự nhiên: "trời ơi", "nói thật nha", "mấy bà ơi".',
      'Đa dạng nhân vật (tuổi, giới tính, vùng miền) để test quảng cáo nhiều phiên bản.',
      'Định dạng UGC phổ biến: Testimonial, Get Ready With Me, Day in my life, "3 lý do mình mê…", Reaction.',
    ],
    resources: [
      ['Google Flow (VEO3)', 'https://labs.google/fx/tools/flow'],
      ['HeyGen (avatar nói)', 'https://www.heygen.com'],
    ],
    prompts: [
      ['Testimonial – khách hàng kể trải nghiệm', `Vertical UGC-style video, shot on iPhone, handheld. A [nhân vật: Vietnamese woman in her mid-20s, no heavy makeup, wearing a simple oversized T-shirt] sits in her car in the driver's seat, parked, natural daylight through the windshield.
She talks to the phone camera in Vietnamese, casual and genuine: "[câu thoại: Nói thật nha, mình xài [sản phẩm] được 1 tháng rồi, giờ không bỏ được luôn.]"
Natural imperfect framing, slight camera shake.
Audio: her voice, faint outside traffic. No music, no subtitles.`],
      ['Get Ready With Me (GRWM)', `UGC vertical video: a [nhân vật: young Vietnamese woman] sits at a messy vanity table in her bedroom in the morning, applying [sản phẩm] while chatting to the camera propped on the table.
She says in Vietnamese: "[câu thoại: Sáng nay đi học muộn nên make up 5 phút thôi, bí kíp là em này nè.]"
Camera: static phone on a tripod, slightly low angle, natural.
Lighting: soft morning window light.
Audio: natural voice, light room sounds. No music, no subtitles.`],
      ['Phản ứng khi dùng lần đầu (reaction)', `Close-up UGC selfie shot: a [nhân vật: young Vietnamese man in a hoodie] tries [sản phẩm: a new spicy instant noodle] for the first time at his kitchen counter. He takes a bite, his eyes widen, he fans his mouth and laughs.
He says in Vietnamese: "[câu thoại: Trời ơi cay mà ngon dữ vậy trời!]"
Camera: handheld phone, slightly shaky, authentic.
Lighting: warm kitchen light at night.
Audio: natural voice, slurping sound. No music, no subtitles.`],
      ['Một ngày của tôi (Day in my life)', `UGC montage style shot: [nhân vật: a young office worker in Saigon] [hành động trong ngày: grabs [sản phẩm] from her bag on a crowded bus in the morning, uses it at her desk, and again at the gym in the evening].
Shot on phone, handheld, quick natural moments, vertical 9:16.
Lighting: natural changing daylight to evening light.
Audio: ambient city sounds, light lo-fi music.`],
      ['"3 lý do mình mê…" (nói trước camera)', `Vertical UGC talking-head video: a [nhân vật: friendly Vietnamese mom in her 30s] stands in her bright kitchen holding [sản phẩm], counting on her fingers.
She says in Vietnamese: "[câu thoại: 3 lý do mình mê cái nồi này: nấu nhanh, dễ rửa, mà giá rẻ bất ngờ!]"
Camera: phone propped on the counter, eye level, natural.
Lighting: daylight from a window.
Audio: clear voice, kitchen ambience. No subtitles.`],
      ['Viết 5 kịch bản UGC để test quảng cáo (ChatGPT)', `Viết 5 kịch bản video UGC 15 giây khác nhau cho sản phẩm [tên sản phẩm], đối tượng [khách hàng mục tiêu].
Mỗi kịch bản dùng 1 kiểu: Testimonial, Reaction, GRWM, Vấn đề–Giải pháp, Phản biện ("Mình từng nghĩ … nhưng").
Mỗi kịch bản gồm: mô tả nhân vật (tuổi, ngoại hình, bối cảnh đời thường), lời thoại tự nhiên có từ đệm tiếng Việt, và 1 prompt tiếng Anh cho VEO3 theo phong cách "shot on iPhone, handheld, natural".`],
    ],
  },

  'Prompt Cinematic': {
    summary: `Bộ prompt tạo cảnh quay điện ảnh (cinematic) – dùng cho phim ngắn, MV, trailer, video thương hiệu. Yếu tố tạo cảm giác điện ảnh: tỉ lệ khung hình rộng, ánh sáng có chủ đích, chuyển động camera chậm, độ sâu trường ảnh nông, màu sắc được "grade" và hạt phim.

Mỗi prompt bên dưới là một "phong cách" khác nhau: noir, sci-fi, cổ trang Việt, hành động, lãng mạn, kinh dị, sử thi.`,
    keyPoints: [
      'Từ khóa điện ảnh: anamorphic lens, 35mm film, film grain, shallow depth of field, color graded, 24fps.',
      'Ánh sáng: golden hour, blue hour, low-key, chiaroscuro, volumetric light, practical lights, neon.',
      'Bảng màu: teal & orange, desaturated, warm vintage, cold blue, monochrome.',
      'Tham chiếu phong cách đạo diễn / phim (ví dụ "in the style of a Wong Kar-wai film") giúp AI hiểu nhanh không khí.',
    ],
    resources: [
      ['Google Flow (VEO3)', 'https://labs.google/fx/tools/flow'],
      ['Runway', 'https://runwayml.com'],
      ['Luma Dream Machine', 'https://lumalabs.ai/dream-machine'],
    ],
    prompts: [
      ['Cổ trang Việt Nam sử thi', `Epic cinematic wide shot: a Vietnamese female warrior in [trang phục: ancient red and gold armor], long hair tied high, stands on a hill holding a spear, overlooking [bối cảnh: a vast misty valley with an ancient citadel] at sunrise. Her cape flutters in the wind.
Camera: slow crane up from behind her, revealing the valley.
Lighting: golden backlight, volumetric god rays through the mist.
Style: historical epic film, anamorphic lens, 35mm film grain, rich warm color grade.
Audio: rising orchestral music with traditional Vietnamese drums, wind.`],
      ['Film noir / thám tử', `Black-and-white film noir scene: a detective in a trench coat and fedora stands under a flickering street lamp in [bối cảnh: a rainy 1940s alley], lighting a cigarette, smoke curling in the light.
Camera: low angle, static, then slow push in on his face.
Lighting: hard single light source, deep shadows, high contrast chiaroscuro, rain streaks glowing.
Style: classic 1940s noir, film grain.
Audio: rain, distant jazz saxophone.`],
      ['Khoa học viễn tưởng (sci-fi)', `Cinematic sci-fi shot: [nhân vật: an astronaut in a worn white spacesuit] walks slowly across [bối cảnh: a red desert planet with two giant moons in the sky], leaving footprints in the dust, a crashed spaceship smoking in the distance.
Camera: wide tracking shot, low angle.
Lighting: harsh alien sunlight, dust particles in the air, cool blue shadows.
Style: Dune-inspired, epic scale, anamorphic, desaturated orange and teal grade.
Audio: deep ambient drone, wind, heavy breathing in the helmet.`],
      ['Lãng mạn – kiểu Wong Kar-wai', `Romantic moody shot: a young couple stands close under a red umbrella on [bối cảnh: a neon-lit street in Hong Kong / Saigon] at night, rain falling, they look at each other without speaking.
Camera: slow motion, slight step-printing effect, shallow depth of field.
Lighting: saturated red and green neon, wet reflections.
Style: in the style of a Wong Kar-wai film, nostalgic, film grain, dreamy.
Audio: soft rain and melancholic piano.`],
      ['Hành động – rượt đuổi', `High-octane action shot: [nhân vật: a motorcyclist in a black leather jacket] speeds through [bối cảnh: narrow streets of Hanoi Old Quarter] at night, weaving between cars, sparks flying as the bike leans into a sharp turn.
Camera: low tracking shot alongside the bike, fast, dynamic motion blur.
Lighting: streetlights and neon streaking past, high contrast.
Style: Hollywood action movie, intense, 24fps, anamorphic flares.
Audio: roaring engine, screeching tires, pulsing action score.`],
      ['Kinh dị – không khí rùng rợn', `Horror scene: a narrow dark hallway in [bối cảnh: an abandoned old French villa in Da Lat], peeling wallpaper, a door at the end slowly creaks open by itself, revealing only darkness.
Camera: slow, steady dolly forward at eye level.
Lighting: very dim cold moonlight through a broken window, deep shadows, flickering light bulb.
Style: atmospheric psychological horror, desaturated cold tones, film grain.
Audio: creaking door, low ominous drone, distant whisper.`],
      ['Mở đầu phim (opening shot)', `Opening shot of a short film: an aerial drone shot slowly descending over [bối cảnh: a small coastal fishing village in central Vietnam] at blue hour, lights turning on in houses, boats returning to shore.
Camera: slow descending drone, smooth.
Lighting: deep blue twilight with warm window lights.
Style: cinematic, anamorphic, peaceful, film grain, 2.39:1 framing feel.
Audio: waves, distant voices, soft piano theme starts.`],
      ['Template cinematic tự điền', `Cinematic [cỡ cảnh] of [chủ thể + trang phục + cảm xúc] [hành động] in [bối cảnh + thời gian].
Camera: [chuyển động: slow dolly in / tracking / crane], [ống kính: anamorphic 35mm / 85mm], shallow depth of field.
Lighting: [ánh sáng có chủ đích: golden hour backlight / low-key / neon].
Color grade: [teal & orange / warm vintage / cold desaturated].
Style: [thể loại / tham chiếu phim], film grain, 24fps.
Audio: [âm thanh nền + nhạc].`],
    ],
  },

  'Prompt Storytelling': {
    summary: `Bộ prompt kể chuyện bằng video AI: truyện ngắn cảm động, truyện cổ tích, câu chuyện thương hiệu, video "một ngày của…", truyện kinh dị, bài học cuộc sống. Kể chuyện tốt giúp video được xem hết và chia sẻ nhiều.

Quy trình: (1) Nhờ AI viết câu chuyện theo cấu trúc 3 hồi; (2) Chia thành 6–10 cảnh; (3) Tạo thẻ nhân vật cố định; (4) Viết prompt từng cảnh; (5) Lồng tiếng kể chuyện (voice-over) + nhạc nền cảm xúc.`,
    keyPoints: [
      'Cấu trúc 3 hồi: Mở đầu (giới thiệu nhân vật + mong muốn) → Xung đột (khó khăn) → Kết (thay đổi / bài học).',
      'Video 60 giây ≈ 8–12 cảnh × 5–8 giây; lời kể khoảng 120–150 từ.',
      'Giữ nhân vật đồng nhất bằng thẻ mô tả + ảnh tham chiếu (xem bài Prompt nhân vật).',
      'Câu mở đầu phải gợi tò mò: "Năm 10 tuổi, tôi đã làm một việc khiến mẹ khóc suốt đêm…"',
    ],
    resources: [
      ['ElevenLabs (lồng tiếng)', 'https://elevenlabs.io'],
      ['CapCut', 'https://www.capcut.com'],
    ],
    prompts: [
      ['Viết truyện + chia cảnh (ChatGPT / Gemini)', `Bạn là biên kịch phim ngắn. Hãy viết một câu chuyện cảm động dài 60 giây chủ đề: [chủ đề: tình cha con / vượt khó / lòng tốt].
Nhân vật chính: [mô tả nhân vật]. Bối cảnh: [bối cảnh Việt Nam].
Yêu cầu:
1. Cấu trúc 3 hồi, câu mở đầu gây tò mò, kết thúc có bài học hoặc twist bất ngờ.
2. Lời kể (voice-over) tiếng Việt khoảng 130 từ, giọng trầm ấm.
3. Chia thành 10 cảnh, mỗi cảnh: thời lượng, lời kể tương ứng, mô tả hình ảnh.
4. Viết 1 thẻ mô tả nhân vật cố định bằng tiếng Anh.
5. Viết prompt tiếng Anh cho từng cảnh (cinematic, 9:16, có góc máy và ánh sáng), lặp lại thẻ nhân vật trong mỗi prompt.`],
      ['Cảnh mở đầu – giới thiệu nhân vật', `Cinematic shot: [dán thẻ nhân vật: an old Vietnamese street vendor in his 70s with a kind wrinkled face, wearing a faded blue shirt and a conical hat] pushes his small bánh mì cart along [bối cảnh: a quiet Saigon alley] at dawn.
Camera: slow side tracking shot.
Lighting: soft early morning light, warm haze.
Style: cinematic, emotional, film grain, 9:16.
Audio: quiet morning sounds, roosters, soft piano.`],
      ['Cảnh xung đột – khoảnh khắc khó khăn', `[Dán thẻ nhân vật] sits alone on a small plastic stool under the rain beside his cart, no customers around, he looks at an old photo of his family in his hand.
Camera: slow push in to a close-up of his face and the photo.
Lighting: grey cold rainy light, desaturated colors.
Style: emotional drama, shallow depth of field.
Audio: heavy rain, sad cello melody.`],
      ['Cảnh cao trào – bước ngoặt', `A group of [nhân vật phụ: young students in white school uniforms] run through the rain toward [nhân vật chính], holding umbrellas over him and smiling, one hands him a handwritten card.
Camera: wide shot slowly pushing in, then close-up on his surprised, teary eyes.
Lighting: rain glowing in a warm streetlight.
Style: heartwarming, cinematic slow motion.
Audio: rain softening, uplifting music swell.`],
      ['Cảnh kết – thông điệp', `Next morning: a long line of happy customers in front of [nhân vật chính]'s bánh mì cart, he laughs while making sandwiches, sunlight shining on the alley.
Camera: slow crane up revealing the whole lively alley.
Lighting: bright warm golden sunlight.
Style: hopeful, cinematic ending.
Audio: cheerful street ambience, warm piano ending.`],
      ['Truyện cổ tích hoạt hình cho trẻ em', `Viết lại truyện cổ tích [tên truyện: Tấm Cám / Cây khế / Sự tích dưa hấu] thành kịch bản video hoạt hình 3D phong cách Pixar dài 90 giây cho trẻ 4–8 tuổi.
- Lời kể tiếng Việt vui nhộn, câu ngắn, dễ hiểu, khoảng 200 từ.
- 12 cảnh, mỗi cảnh có prompt tiếng Anh: "3D Pixar-style animation, …", màu tươi sáng, không bạo lực.
- Thẻ mô tả cố định cho từng nhân vật.
- Kết thúc bằng 1 câu bài học.`],
      ['Câu chuyện thương hiệu (brand story)', `Hãy viết câu chuyện thương hiệu dạng video 45 giây cho [tên thương hiệu], ngành [ngành], được thành lập bởi [người sáng lập] vì [lý do / trăn trở ban đầu].
Kể theo hành trình: khó khăn ban đầu → bước ngoặt → sản phẩm ra đời → khách hàng thay đổi cuộc sống → sứ mệnh.
Viết lời kể ngôi thứ nhất (người sáng lập), chân thành, khoảng 100 từ, chia 8 cảnh kèm prompt tiếng Anh cinematic cho từng cảnh.`],
    ],
  },

  'Prompt theo ngành': {
    summary: `Bộ prompt video mẫu cho từng ngành nghề phổ biến: bất động sản, nhà hàng – quán cà phê, spa – thẩm mỹ, giáo dục, thời trang, du lịch, gym – thể hình, ô tô, nông sản, y tế – nha khoa. Mỗi prompt là một cảnh "chủ lực" có thể dùng ngay cho video giới thiệu hoặc quảng cáo của ngành đó.

Thay các phần trong ngoặc vuông bằng thông tin doanh nghiệp của bạn, sau đó ghép 4–6 cảnh thành video hoàn chỉnh.`,
    keyPoints: [
      'Mỗi ngành có "khoảnh khắc đắt giá" riêng: món ăn bốc khói, căn hộ ngập nắng, làn da sau liệu trình…',
      'Dùng ảnh thật của cửa hàng / sản phẩm làm ảnh đầu vào khi có thể để video đúng thực tế.',
      'Với ngành y tế, thẩm mỹ, tài chính: không hứa hẹn kết quả tuyệt đối, tuân thủ quy định quảng cáo.',
      'Xem thêm thư viện "Prompt theo ngành nghề" trên web để có thêm prompt ảnh và nội dung.',
    ],
    resources: [],
    prompts: [
      ['Bất động sản – căn hộ', `Cinematic real estate walkthrough of [loại BĐS: a modern 2-bedroom apartment] in [vị trí: District 2, Ho Chi Minh City]: the camera glides from the entrance through a bright open living room with floor-to-ceiling windows, revealing [view: a river and city skyline view] at golden hour.
Camera: smooth gimbal walkthrough, wide 16mm lens, slow and steady.
Lighting: warm natural sunset light flooding in, all interior lights on.
Style: luxury real estate film, clean, airy.
Audio: soft elegant piano, no dialogue.`],
      ['Nhà hàng – quán cà phê', `Cozy cinematic shot inside [tên quán / phong cách: a vintage Hanoi coffee shop with wooden furniture and plants]: a barista pours [đồ uống: egg coffee] slowly into a ceramic cup, steam rising, customers chatting softly in the background.
Camera: close-up on the pour, then slow pull out to show the whole café.
Lighting: warm tungsten lights, morning sun through the windows.
Style: lifestyle commercial, warm, inviting.
Audio: café ambience, coffee pouring, soft acoustic guitar.`],
      ['Spa – thẩm mỹ', `Relaxing spa scene: a woman lies on a treatment bed with a white towel, eyes closed, while a therapist gently applies [liệu trình: a green herbal facial mask] in [bối cảnh: a calm spa room with candles and orchids].
Camera: slow dolly in, soft focus.
Lighting: warm dim candlelight, soft and peaceful.
Style: luxury wellness commercial.
Audio: soft water sounds, calming ambient music.`],
      ['Giáo dục – trung tâm đào tạo', `Bright modern classroom at [tên trung tâm]: a friendly young teacher explains [môn học: English speaking] in front of an interactive screen while [học viên: teenage students] raise their hands eagerly and laugh together.
Camera: slow tracking shot across the class, then close-up on a student's confident smile.
Lighting: bright natural daylight, clean and energetic.
Style: educational promo, authentic.
Audio: classroom chatter, upbeat inspiring music.`],
      ['Thời trang – shop quần áo', `Fashion lookbook shot: a [người mẫu: young Vietnamese female model] wearing [sản phẩm: a pastel linen set] walks along [bối cảnh: a yellow colonial street in Hoi An], turns and smiles toward the camera, fabric moving in the breeze.
Camera: slow motion tracking, then medium close-up.
Lighting: soft late afternoon sun.
Style: fashion brand film, dreamy, film grain.
Audio: chill lo-fi music.`],
      ['Du lịch – tour, resort', `Stunning travel promo: aerial drone shot over [địa điểm: Ha Long Bay] at sunrise, a cruise ship gliding between limestone islands, then cut to tourists kayaking through a calm lagoon, laughing.
Camera: sweeping drone shot, then smooth tracking at water level.
Lighting: golden sunrise, sparkling water.
Style: tourism commercial, epic and joyful.
Audio: uplifting cinematic music, gentle waves.`],
      ['Gym – thể hình', `High-energy gym shot: a muscular [nhân vật: Vietnamese man in his 20s] performs [bài tập: heavy deadlifts] in [tên phòng gym: a dark industrial gym], sweat dripping, chalk dust flying in slow motion.
Camera: low angle, slow motion, then fast cut close-up on his determined face.
Lighting: dramatic overhead spotlights, high contrast.
Style: Nike-style sports commercial.
Audio: heavy breathing, weights clanking, intense beat.`],
      ['Ô tô – showroom', `Car commercial: [mẫu xe: a sleek white electric SUV] drives along [cung đường: a winding mountain road in Ha Giang] at sunset, then stops on a cliff overlooking the valley.
Camera: drone chase shot, then low angle hero shot of the car.
Lighting: warm golden sunset reflecting on the car body.
Style: premium automotive advertising, cinematic.
Audio: smooth electric hum, epic music.`],
      ['Nông sản – đặc sản địa phương', `Authentic farm shot: a smiling [nông dân: Vietnamese farmer in a conical hat] harvests [nông sản: ripe mangoes] in [địa điểm: a lush orchard in Dong Thap] at early morning, placing them into a woven bamboo basket.
Camera: handheld close-up on hands picking fruit, then medium shot of the farmer smiling.
Lighting: soft golden morning light, dew on leaves.
Style: authentic, warm, documentary.
Audio: birds, rustling leaves, gentle folk music.`],
      ['Y tế – nha khoa', `Clean modern dental clinic: a friendly dentist in a white coat shows a patient [dịch vụ: her new teeth whitening result] in a hand mirror, the patient smiles brightly.
Camera: medium shot, then close-up on the confident smile.
Lighting: bright clean clinical light, soft and welcoming.
Style: professional healthcare commercial, trustworthy.
Audio: soft positive music, no medical sounds.`],
    ],
  },
};
