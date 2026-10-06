// Bổ sung thư viện prompt theo ngành (phần 1: các ngành đã có). Phần trong [ngoặc vuông] là chỗ người dùng tự điền.
module.exports = [
  {
    name: 'Làm video AI', color: '#E11D48',
    prompts: [
      {
        title: 'Lên 30 ý tưởng video cho kênh mới',
        tool: 'ChatGPT, Gemini, Claude',
        description: 'Có ngay danh sách ý tưởng video chia theo nhóm nội dung để đăng đều mỗi ngày.',
        content: `Tôi đang xây kênh [TikTok / YouTube Shorts / Reels] về chủ đề [chủ đề kênh], khán giả là [mô tả khán giả].
Hãy đề xuất 30 ý tưởng video ngắn, chia thành 5 nhóm: Kiến thức nhanh, Kể chuyện, Xu hướng, Hậu trường, Bán hàng.
Với mỗi ý tưởng ghi: Tiêu đề hấp dẫn (dưới 10 chữ) | Hook 3 giây đầu | Định dạng (nói trước camera / video AI / slideshow) | Mức độ dễ làm (1–3).
Đánh dấu 5 ý tưởng có khả năng viral cao nhất và giải thích ngắn vì sao.`,
      },
      {
        title: 'Chia kịch bản thành prompt từng cảnh',
        tool: 'ChatGPT → VEO3, Kling',
        description: 'Biến kịch bản tiếng Việt thành danh sách prompt tiếng Anh cho từng cảnh, giữ nhân vật đồng nhất.',
        content: `Đây là kịch bản video của tôi:
[dán kịch bản]

Hãy:
1. Viết 1 "thẻ mô tả nhân vật" bằng tiếng Anh cho mỗi nhân vật (tuổi, khuôn mặt, tóc, trang phục).
2. Chia kịch bản thành các cảnh 5–8 giây.
3. Với mỗi cảnh, viết 1 prompt tiếng Anh cho [VEO3 / Kling] gồm: cỡ cảnh, góc máy, hành động, bối cảnh, ánh sáng, chuyển động camera, âm thanh. Luôn chèn nguyên thẻ mô tả nhân vật vào prompt.
4. Trình bày dạng bảng: Cảnh | Thời lượng | Lời thoại / lời kể | Prompt.`,
      },
      {
        title: 'Lời kể (voice-over) cảm xúc',
        tool: 'ChatGPT, ElevenLabs',
        description: 'Viết lời kể có nhịp ngắt nghỉ, dễ đọc cho giọng AI, khớp thời lượng video.',
        content: `Viết lời kể tiếng Việt cho video dài [thời lượng] giây về [chủ đề].
Giọng: [trầm ấm / truyền cảm hứng / hài hước], ngôi kể [thứ nhất / thứ ba].
Yêu cầu:
- Khoảng [số từ ≈ 2,3 từ/giây] từ, câu ngắn, dễ đọc thành tiếng.
- Đánh dấu chỗ ngắt nghỉ bằng dấu "…" và từ cần nhấn mạnh bằng CHỮ IN HOA.
- Câu đầu gây tò mò, câu cuối để lại cảm xúc hoặc lời kêu gọi.
- Chia đoạn theo từng cảnh để tôi dễ ghép hình.`,
      },
      {
        title: 'Phụ đề viral (caption) cho video',
        tool: 'ChatGPT, CapCut',
        description: 'Rút gọn lời thoại thành phụ đề ngắn, có từ khóa nhấn mạnh và emoji vừa phải.',
        content: `Đây là lời thoại video của tôi:
[dán lời thoại]

Hãy chuyển thành phụ đề hiển thị trên video dọc:
- Mỗi dòng tối đa 6 từ, mỗi lần hiện tối đa 2 dòng.
- Đánh dấu 1 từ khóa quan trọng mỗi câu bằng [ngoặc vuông] để tôi tô màu.
- Thêm emoji phù hợp ở không quá 20% số dòng.
- Giữ đúng chính tả và dấu tiếng Việt.`,
      },
      {
        title: 'Tiêu đề + mô tả + hashtag đăng video',
        tool: 'ChatGPT, Gemini',
        description: 'Tối ưu phần chữ khi đăng để tăng lượt tìm thấy và tương tác.',
        content: `Video của tôi nói về: [tóm tắt nội dung video]. Nền tảng: [TikTok / YouTube / Facebook].
Hãy viết:
1. 5 tiêu đề (dưới 60 ký tự) theo các kiểu: tò mò, con số, lợi ích, câu hỏi, gây tranh luận nhẹ.
2. 1 đoạn mô tả 2–3 câu có từ khóa chính "[từ khóa]" và lời kêu gọi bình luận.
3. 8 hashtag: 3 hashtag lớn, 3 hashtag ngách, 2 hashtag thương hiệu.
4. 3 câu hỏi để ghim ở phần bình luận kích thích tương tác.`,
      },
      {
        title: 'Phân tích video đối thủ',
        tool: 'ChatGPT, Gemini',
        description: 'Học cấu trúc từ video viral của đối thủ để làm phiên bản tốt hơn.',
        content: `Tôi xem được video của đối thủ với thông tin sau:
- Nội dung: [mô tả từng cảnh]
- Thời lượng: [x] giây, lượt xem: [số view], bình luận nổi bật: [một vài bình luận]

Hãy phân tích: hook, nhịp dựng, cảm xúc chính, điểm khiến người xem ở lại, CTA.
Sau đó đề xuất 3 cách làm khác biệt và tốt hơn cho thương hiệu [tên thương hiệu], kèm kịch bản ngắn cho cách tốt nhất.`,
      },
      {
        title: 'Thumbnail YouTube gây tò mò',
        tool: 'Ideogram, Midjourney, ChatGPT',
        description: 'Tạo ý tưởng và prompt ảnh thumbnail có tỉ lệ nhấp cao.',
        content: `Video YouTube của tôi có tiêu đề: "[tiêu đề video]".
1. Đề xuất 3 ý tưởng thumbnail khác nhau (bố cục, biểu cảm nhân vật, 3–5 chữ trên ảnh, màu chủ đạo).
2. Với ý tưởng tốt nhất, viết prompt tiếng Anh cho Ideogram để tạo ảnh 16:9, chữ lớn dễ đọc, tương phản cao.
3. Gợi ý cách kiểm tra: thu nhỏ còn 20% vẫn đọc được chữ và hiểu nội dung.`,
      },
      {
        title: 'Series video nhiều tập',
        tool: 'ChatGPT, Claude',
        description: 'Lên kế hoạch series để giữ chân người xem quay lại xem tập tiếp theo.',
        content: `Lên kế hoạch series video ngắn [số tập] tập về chủ đề [chủ đề] cho khán giả [khán giả].
Mỗi tập gồm: tên tập, nội dung chính, hook mở đầu, "cú móc" cuối tập để người xem chờ tập sau.
Giữ một nhân vật / người dẫn xuyên suốt và một câu mở đầu quen thuộc cho cả series.
Đề xuất lịch đăng và cách đặt tên series để dễ nhận diện.`,
      },
    ],
  },
  {
    name: 'Marketing', color: '#F97316',
    prompts: [
      {
        title: 'Chân dung khách hàng (persona)',
        tool: 'ChatGPT, Claude',
        description: 'Xác định rõ khách hàng mục tiêu: nhu cầu, nỗi đau, hành vi mua.',
        content: `Sản phẩm / dịch vụ của tôi: [mô tả sản phẩm], giá [mức giá], bán tại [kênh bán].
Hãy xây dựng 3 chân dung khách hàng (persona) khác nhau. Mỗi persona gồm:
- Tên giả định, tuổi, nghề nghiệp, thu nhập, nơi sống
- Mục tiêu và nỗi đau lớn nhất liên quan đến sản phẩm
- Thói quen dùng mạng xã hội, khung giờ online
- Rào cản khi mua và điều khiến họ quyết định mua
- 3 thông điệp quảng cáo phù hợp nhất với persona này`,
      },
      {
        title: 'Kế hoạch nội dung 1 tháng',
        tool: 'ChatGPT, Gemini',
        description: 'Lịch đăng bài 30 ngày cân bằng giữa giá trị, thương hiệu và bán hàng.',
        content: `Lập kế hoạch nội dung 30 ngày cho fanpage / kênh [tên thương hiệu], ngành [ngành], mục tiêu [tăng nhận diện / ra đơn / tuyển khách].
Tỉ lệ: 50% nội dung giá trị, 30% xây dựng thương hiệu, 20% bán hàng.
Trình bày dạng bảng: Ngày | Chủ đề | Định dạng (bài viết / video / ảnh / livestream) | Tiêu đề | CTA.
Đánh dấu các ngày lễ, ngày đôi (ví dụ 10.10, 11.11) trong tháng [tháng] để làm chương trình khuyến mãi.`,
      },
      {
        title: 'Bài viết Facebook theo công thức AIDA',
        tool: 'ChatGPT, Claude',
        description: 'Bài quảng cáo có cấu trúc thu hút – thích thú – mong muốn – hành động.',
        content: `Viết bài quảng cáo Facebook cho [sản phẩm] theo công thức AIDA.
Khách hàng mục tiêu: [mô tả]. Ưu đãi: [ưu đãi, thời hạn].
- Attention: 1 câu mở đầu gây chú ý (không quá 15 chữ)
- Interest: nêu vấn đề khách hàng gặp phải
- Desire: 3 lợi ích nổi bật + 1 bằng chứng (đánh giá, số liệu)
- Action: lời kêu gọi rõ ràng, tạo cảm giác khan hiếm hợp lý
Viết 2 phiên bản: một bản ngắn (dưới 80 chữ), một bản dài (150–200 chữ), dùng emoji vừa phải.`,
      },
      {
        title: '20 tiêu đề quảng cáo để A/B test',
        tool: 'ChatGPT, Gemini',
        description: 'Nhiều góc tiếp cận khác nhau để thử nghiệm quảng cáo nhanh.',
        content: `Viết 20 tiêu đề quảng cáo (dưới 40 ký tự) cho [sản phẩm], khách hàng [khách hàng mục tiêu].
Chia theo 5 góc tiếp cận, mỗi góc 4 tiêu đề: Lợi ích, Nỗi đau, Bằng chứng xã hội, Khan hiếm / ưu đãi, Tò mò.
Không dùng từ ngữ phóng đại sai sự thật. Đánh dấu 3 tiêu đề bạn dự đoán hiệu quả nhất.`,
      },
      {
        title: 'Phân tích đối thủ cạnh tranh',
        tool: 'ChatGPT, Claude',
        description: 'So sánh điểm mạnh – yếu với đối thủ để tìm lợi thế riêng.',
        content: `Tôi kinh doanh [sản phẩm] tại [khu vực]. Các đối thủ chính: [tên đối thủ 1], [tên đối thủ 2], [tên đối thủ 3].
Thông tin tôi biết về họ: [giá, kênh bán, điểm nổi bật].
Hãy lập bảng so sánh theo: giá, chất lượng, dịch vụ, kênh bán, thông điệp thương hiệu, điểm yếu.
Sau đó đề xuất 3 lợi thế cạnh tranh (USP) tôi nên nhấn mạnh và 3 việc cần cải thiện ngay.`,
      },
      {
        title: 'Kịch bản livestream bán hàng',
        tool: 'ChatGPT, Claude',
        description: 'Kịch bản phiên live 60 phút có mở màn, giới thiệu, chốt đơn, minigame.',
        content: `Viết kịch bản livestream bán hàng 60 phút cho [sản phẩm / danh mục sản phẩm] trên [TikTok / Facebook].
Gồm các phần theo phút: Khởi động kéo người xem – Giới thiệu sản phẩm (demo) – Trả lời câu hỏi thường gặp – Minigame / tặng quà – Chốt đơn theo khung giờ vàng – Kết thúc.
Viết sẵn câu nói mẫu cho người live ở từng phần, 5 câu xử lý khi khách chê đắt, và 3 kịch bản "flash sale" 5 phút.`,
      },
      {
        title: 'Email marketing chăm sóc khách',
        tool: 'ChatGPT, Claude',
        description: 'Chuỗi 3 email chào mừng, giới thiệu giá trị và ưu đãi đầu tiên.',
        content: `Viết chuỗi 3 email cho khách vừa đăng ký nhận tin của [tên thương hiệu] (ngành [ngành]).
- Email 1 (ngay khi đăng ký): chào mừng, câu chuyện thương hiệu, quà tặng.
- Email 2 (sau 2 ngày): chia sẻ kiến thức hữu ích liên quan đến [chủ đề].
- Email 3 (sau 5 ngày): ưu đãi đầu tiên [ưu đãi], có hạn dùng.
Mỗi email gồm: 3 tiêu đề email để chọn, nội dung dưới 150 chữ, 1 nút CTA.`,
      },
      {
        title: 'Slogan và tên chiến dịch',
        tool: 'ChatGPT, Gemini',
        description: 'Ý tưởng slogan ngắn gọn, dễ nhớ cho thương hiệu hoặc chiến dịch.',
        content: `Thương hiệu: [tên], ngành [ngành], tính cách thương hiệu [trẻ trung / sang trọng / gần gũi], giá trị cốt lõi [giá trị].
Hãy đề xuất 15 slogan tiếng Việt (dưới 8 chữ) và 5 tên chiến dịch cho dịp [dịp / mùa].
Với mỗi slogan, giải thích ngắn ý nghĩa và đánh giá độ dễ nhớ (1–5).`,
      },
      {
        title: 'Phản hồi bình luận tiêu cực',
        tool: 'ChatGPT, Claude',
        description: 'Trả lời khéo léo, chuyên nghiệp để giữ uy tín thương hiệu.',
        content: `Khách hàng bình luận công khai trên fanpage: "[nội dung bình luận]".
Bối cảnh thực tế: [chuyện gì đã xảy ra].
Hãy viết 3 phương án trả lời (lịch sự, đồng cảm, không đổ lỗi, dưới 60 chữ), mời khách nhắn tin riêng để xử lý.
Kèm theo tin nhắn riêng gửi khách để giải quyết và đề xuất bồi thường hợp lý.`,
      },
      {
        title: 'Ý tưởng hợp tác KOC / KOL',
        tool: 'ChatGPT, Gemini',
        description: 'Kế hoạch hợp tác người ảnh hưởng và tin nhắn mời hợp tác.',
        content: `Tôi muốn hợp tác KOC/KOL để quảng bá [sản phẩm] với ngân sách [ngân sách].
1. Đề xuất tiêu chí chọn KOC/KOL phù hợp (lượng follow, tỉ lệ tương tác, tệp khán giả).
2. Đề xuất 3 hình thức hợp tác (review, affiliate, series nội dung) kèm ưu nhược điểm.
3. Viết tin nhắn mời hợp tác ngắn gọn, chuyên nghiệp.
4. Gợi ý brief nội dung 1 trang để gửi KOC.`,
      },
    ],
  },
  {
    name: 'Bán hàng online', color: '#0D9488',
    prompts: [
      {
        title: 'Mô tả sản phẩm chuẩn SEO trên sàn',
        tool: 'ChatGPT, Gemini',
        description: 'Tiêu đề và mô tả sản phẩm cho Shopee, Lazada, TikTok Shop.',
        content: `Viết nội dung đăng sản phẩm lên [Shopee / Lazada / TikTok Shop]:
Sản phẩm: [tên], chất liệu / thành phần: [chi tiết], kích thước: [kích thước], điểm nổi bật: [điểm nổi bật].
1. Tiêu đề dưới 120 ký tự, có từ khóa chính "[từ khóa]" ở đầu.
2. Mô tả gồm: 5 gạch đầu dòng lợi ích, thông số kỹ thuật, hướng dẫn sử dụng, chính sách đổi trả, cam kết.
3. 10 từ khóa tìm kiếm liên quan.`,
      },
      {
        title: 'Kịch bản chốt đơn qua tin nhắn',
        tool: 'ChatGPT, Claude',
        description: 'Mẫu trả lời inbox từ lúc khách hỏi giá đến khi chốt đơn.',
        content: `Tôi bán [sản phẩm] giá [giá] qua Facebook / Zalo.
Viết kịch bản trả lời tin nhắn theo các bước: chào hỏi – hỏi nhu cầu – tư vấn – báo giá khéo léo – xử lý phân vân – chốt đơn – xin thông tin giao hàng.
Viết sẵn câu trả lời mẫu cho 8 tình huống: hỏi giá rồi im lặng, chê đắt, hỏi so sánh với shop khác, hỏi chất lượng, muốn xem thêm ảnh thật, hỏi phí ship, hẹn suy nghĩ thêm, muốn mua số lượng lớn.`,
      },
      {
        title: 'Trả lời đánh giá 1–2 sao',
        tool: 'ChatGPT',
        description: 'Phản hồi đánh giá xấu trên sàn một cách chuyên nghiệp.',
        content: `Khách để lại đánh giá [số sao] sao cho sản phẩm [tên sản phẩm]: "[nội dung đánh giá]".
Hãy viết 2 câu trả lời công khai (dưới 50 chữ): xin lỗi chân thành, giải thích ngắn nếu cần, đưa ra hướng xử lý cụ thể, mời khách liên hệ.
Không tranh cãi, không đổ lỗi cho khách.`,
      },
      {
        title: 'Chương trình khuyến mãi ngày đôi',
        tool: 'ChatGPT, Gemini',
        description: 'Ý tưởng combo, mã giảm giá và lịch truyền thông cho sale 9.9, 10.10, 11.11…',
        content: `Shop của tôi bán [ngành hàng], giá trung bình [giá], biên lợi nhuận khoảng [x]%.
Đề xuất kế hoạch khuyến mãi cho ngày [ngày đôi]:
- 3 phương án ưu đãi (combo, mua 2 giảm, quà tặng, freeship…) kèm cách tính để vẫn có lãi
- Lịch truyền thông 7 ngày trước sale và ngày sale
- 5 câu đăng bài / caption đếm ngược tạo cảm giác hồi hộp`,
      },
      {
        title: 'Tin nhắn chăm sóc sau bán',
        tool: 'ChatGPT',
        description: 'Tin nhắn hỏi thăm, xin đánh giá và mời mua lại.',
        content: `Viết 3 tin nhắn chăm sóc khách đã mua [sản phẩm]:
1. Sau khi giao hàng 1 ngày: hỏi thăm, hướng dẫn sử dụng ngắn.
2. Sau 5 ngày: xin đánh giá 5 sao kèm ảnh, tặng mã giảm giá lần sau.
3. Sau [số ngày] ngày (khi sản phẩm sắp dùng hết): mời mua lại với ưu đãi khách quen.
Giọng thân thiện, ngắn gọn, xưng hô [shop – bạn / em – anh chị].`,
      },
      {
        title: 'Ảnh sản phẩm bằng AI cho sàn TMĐT',
        tool: 'Midjourney, Ideogram, Photoroom',
        description: 'Prompt tạo bối cảnh ảnh sản phẩm đẹp từ ảnh chụp thật.',
        content: `Professional e-commerce product photo of [sản phẩm, mô tả bằng tiếng Anh] placed on [bề mặt: a light wooden table], with [đạo cụ phù hợp] around it.
Background: [nền: soft beige studio background / cozy living room, blurred].
Lighting: soft natural daylight from the side, gentle shadow, true-to-life colors.
Camera: 50mm, eye level, product centered and sharp.
Style: clean, bright, trustworthy, marketplace listing photo. Aspect ratio 1:1.
(Mẹo: tách nền ảnh thật bằng Photoroom rồi ghép vào bối cảnh này để giữ đúng sản phẩm.)`,
      },
      {
        title: 'Câu hỏi thường gặp (FAQ) cho shop',
        tool: 'ChatGPT, Claude',
        description: 'Bộ câu hỏi – trả lời mẫu để ghim trang hoặc cài trả lời tự động.',
        content: `Shop bán [sản phẩm], giao hàng [khu vực], thanh toán [hình thức], chính sách đổi trả [chính sách].
Viết 12 câu hỏi thường gặp và câu trả lời ngắn gọn (dưới 40 chữ) về: giá, chất lượng, size / cách chọn, giao hàng, thanh toán, đổi trả, bảo hành, ưu đãi.
Định dạng phù hợp để cài trả lời tự động trên [Facebook / Zalo OA / TikTok Shop].`,
      },
      {
        title: 'Tính giá bán và lợi nhuận',
        tool: 'ChatGPT, Gemini',
        description: 'Tính giá bán hợp lý có tính đủ phí sàn, ship, quảng cáo.',
        content: `Giúp tôi tính giá bán cho sản phẩm:
- Giá nhập: [giá nhập]
- Phí sàn: [x]%, phí thanh toán: [y]%
- Phí đóng gói: [số tiền], hỗ trợ ship: [số tiền]
- Chi phí quảng cáo dự kiến: [số tiền / đơn]
- Lợi nhuận mong muốn: [z]%
Trình bày bảng tính từng khoản, giá bán đề xuất, và giá sau khi áp mã giảm [mức giảm] thì còn lãi bao nhiêu.`,
      },
    ],
  },
  {
    name: 'Giáo dục', color: '#4F46E5',
    prompts: [
      {
        title: 'Giáo án theo phương pháp tích cực',
        tool: 'ChatGPT, Claude',
        description: 'Kế hoạch bài dạy có hoạt động nhóm, câu hỏi gợi mở, đánh giá.',
        content: `Soạn giáo án môn [môn học], bài "[tên bài]", lớp [lớp], thời lượng [số phút] phút.
Gồm: mục tiêu (kiến thức, kỹ năng, thái độ), chuẩn bị, tiến trình 4 hoạt động (khởi động – hình thành kiến thức – luyện tập – vận dụng), câu hỏi gợi mở cho từng hoạt động, hoạt động nhóm, phiếu học tập, cách đánh giá.
Gợi ý 1 trò chơi khởi động 5 phút liên quan đến bài.`,
      },
      {
        title: 'Đề kiểm tra trắc nghiệm có đáp án',
        tool: 'ChatGPT, Gemini',
        description: 'Tạo đề trắc nghiệm theo mức độ nhận biết – thông hiểu – vận dụng.',
        content: `Tạo đề kiểm tra [số câu] câu trắc nghiệm môn [môn học], chủ đề [chủ đề], lớp [lớp].
Tỉ lệ: 40% nhận biết, 30% thông hiểu, 20% vận dụng, 10% vận dụng cao.
Mỗi câu 4 đáp án A–D, chỉ 1 đáp án đúng, các đáp án nhiễu hợp lý.
Cuối đề có bảng đáp án và giải thích ngắn cho các câu vận dụng.`,
      },
      {
        title: 'Giải thích khái niệm khó cho học sinh',
        tool: 'ChatGPT, Claude',
        description: 'Giải thích dễ hiểu bằng ví dụ đời thường và câu hỏi kiểm tra.',
        content: `Hãy giải thích khái niệm "[khái niệm]" cho học sinh [độ tuổi / lớp].
- Dùng 1 ví dụ đời thường quen thuộc ở Việt Nam
- Chia thành 3 bước nhỏ, mỗi bước 2–3 câu
- Nêu 1 hiểu lầm phổ biến và cách tránh
- Kết thúc bằng 3 câu hỏi ngắn để học sinh tự kiểm tra (kèm đáp án)`,
      },
      {
        title: 'Nhận xét học sinh cuối kỳ',
        tool: 'ChatGPT',
        description: 'Lời nhận xét cá nhân hóa, tích cực và có hướng cải thiện.',
        content: `Viết lời nhận xét cuối kỳ cho học sinh [tên], lớp [lớp]:
- Điểm mạnh: [điểm mạnh]
- Điểm cần cố gắng: [điểm yếu]
- Thái độ học tập: [nhận xét]
Yêu cầu: 3–4 câu, giọng khích lệ, cụ thể, có 1 lời khuyên rõ ràng cho học kỳ tới. Viết 2 phiên bản: gửi phụ huynh và ghi học bạ.`,
      },
      {
        title: 'Lộ trình tự học trong 30 ngày',
        tool: 'ChatGPT, Gemini',
        description: 'Kế hoạch học có mục tiêu từng tuần, tài liệu và bài tập.',
        content: `Tôi muốn học [kỹ năng / môn học] từ trình độ [hiện tại] đến [mục tiêu] trong 30 ngày, mỗi ngày [số phút] phút.
Lập lộ trình theo tuần: mục tiêu tuần, nội dung từng ngày, bài tập thực hành, cách tự kiểm tra cuối tuần.
Gợi ý loại tài liệu miễn phí nên dùng và mẹo duy trì thói quen học.`,
      },
      {
        title: 'Bài nói tiếng Anh theo chủ đề',
        tool: 'ChatGPT, Claude',
        description: 'Đoạn văn mẫu, từ vựng và câu hỏi luyện nói.',
        content: `Tạo tài liệu luyện nói tiếng Anh chủ đề "[chủ đề]" cho trình độ [A2 / B1 / B2].
1. Đoạn văn mẫu 120–150 từ, kèm bản dịch tiếng Việt.
2. 10 từ vựng / cụm từ quan trọng (phiên âm, nghĩa, ví dụ).
3. 5 câu hỏi luyện nói từ dễ đến khó và gợi ý cách trả lời.
4. 3 lỗi người Việt hay mắc khi nói về chủ đề này.`,
      },
      {
        title: 'Thông báo gửi phụ huynh',
        tool: 'ChatGPT',
        description: 'Tin nhắn / thông báo lịch sự, rõ ràng gửi nhóm phụ huynh.',
        content: `Viết thông báo gửi nhóm Zalo phụ huynh lớp [lớp] về: [nội dung: họp phụ huynh / đóng học phí / hoạt động ngoại khóa].
Thông tin: thời gian [thời gian], địa điểm [địa điểm], cần chuẩn bị [chuẩn bị], hạn phản hồi [hạn].
Giọng lịch sự, ngắn gọn, có gạch đầu dòng, kết thúc bằng lời cảm ơn.`,
      },
      {
        title: 'Kịch bản video bài giảng ngắn',
        tool: 'ChatGPT, VEO3, HeyGen',
        description: 'Biến bài học thành video 3 phút có hình minh họa và câu hỏi cuối bài.',
        content: `Chuyển nội dung bài học sau thành kịch bản video bài giảng 3 phút cho [đối tượng học]:
[dán nội dung bài học]
Gồm: câu hỏi mở đầu gây tò mò, 3 ý chính (mỗi ý có ví dụ và gợi ý hình minh họa), tóm tắt, 2 câu hỏi củng cố.
Trình bày dạng bảng: Thời gian | Lời giảng | Hình ảnh / chữ trên màn hình.`,
      },
    ],
  },
  {
    name: 'Bất động sản', color: '#0EA5E9',
    prompts: [
      {
        title: 'Tin đăng bán / cho thuê hấp dẫn',
        tool: 'ChatGPT, Claude',
        description: 'Bài đăng nổi bật điểm mạnh, đủ thông tin pháp lý và giá.',
        content: `Viết tin đăng [bán / cho thuê] bất động sản:
- Loại: [căn hộ / nhà phố / đất nền], vị trí: [địa chỉ, khu vực]
- Diện tích: [m²], số phòng: [số phòng], hướng: [hướng]
- Pháp lý: [sổ hồng / hợp đồng mua bán…], giá: [giá]
- Tiện ích xung quanh: [trường học, chợ, bệnh viện…]
Viết 2 bản: bản ngắn cho Facebook (dưới 100 chữ, có emoji) và bản đầy đủ cho website / sàn BĐS (tiêu đề dưới 100 ký tự). Thông tin trung thực, không phóng đại.`,
      },
      {
        title: 'Kịch bản video giới thiệu nhà',
        tool: 'ChatGPT, VEO3, Kling',
        description: 'Video dẫn tham quan nhà 60 giây có lời dẫn và gợi ý góc quay.',
        content: `Viết kịch bản video 60 giây dẫn khách tham quan [loại BĐS] tại [vị trí].
Điểm nổi bật: [view, nội thất, tiện ích].
Chia cảnh theo đường đi: mặt tiền → phòng khách → bếp → phòng ngủ → ban công / view → tiện ích.
Mỗi cảnh: lời dẫn (giọng chuyên nghiệp, ấm áp), góc quay gợi ý, và 1 prompt tiếng Anh cho VEO3 nếu muốn tạo cảnh bằng AI.`,
      },
      {
        title: 'Tư vấn khách theo nhu cầu',
        tool: 'ChatGPT',
        description: 'Bộ câu hỏi khai thác nhu cầu và cách giới thiệu sản phẩm phù hợp.',
        content: `Tôi là môi giới bất động sản tại [khu vực]. Hãy soạn:
1. 10 câu hỏi khai thác nhu cầu khách (mục đích mua, ngân sách, khả năng vay, ưu tiên vị trí…).
2. Cách phân loại khách: mua ở / đầu tư / thuê, và gợi ý sản phẩm phù hợp từng nhóm.
3. Câu trả lời mẫu cho 5 lo ngại thường gặp: giá cao, pháp lý, lãi suất vay, thanh khoản, tiến độ dự án.`,
      },
      {
        title: 'Phân tích dòng tiền cho thuê',
        tool: 'ChatGPT, Gemini',
        description: 'Ước tính lợi suất cho thuê và thời gian hoàn vốn.',
        content: `Giúp tôi phân tích đầu tư cho thuê:
- Giá mua: [giá], vay ngân hàng: [số tiền] lãi suất [x]%/năm trong [số năm] năm
- Giá thuê dự kiến: [giá thuê]/tháng, tỉ lệ trống phòng: [y]%
- Chi phí quản lý, sửa chữa: [số tiền]/năm
Tính: dòng tiền hằng tháng, lợi suất cho thuê, thời gian hoàn vốn. Trình bày bảng và nêu rủi ro cần lưu ý. (Chỉ mang tính tham khảo.)`,
      },
      {
        title: 'Ảnh phối cảnh nội thất bằng AI',
        tool: 'Midjourney, Krea, ChatGPT',
        description: 'Tạo ảnh minh họa phong cách nội thất để tư vấn khách.',
        content: `Interior design render of a [loại phòng: living room] in a [loại nhà: modern Saigon apartment], style [phong cách: Japandi / Indochine / modern minimalist].
Features: [đồ nội thất chính], [vật liệu: oak wood, linen, rattan], large window with [view].
Lighting: warm natural afternoon light, soft shadows, cozy atmosphere.
Camera: wide 18mm, eye level, realistic architectural photography, 8K. --ar 16:9
(Lưu ý: ghi rõ "ảnh minh họa" khi đăng để khách không hiểu nhầm là ảnh thực tế.)`,
      },
      {
        title: 'Tin nhắn chăm sóc khách cũ',
        tool: 'ChatGPT',
        description: 'Giữ liên lạc với khách tiềm năng và khách đã giao dịch.',
        content: `Viết 4 tin nhắn Zalo ngắn để chăm sóc khách hàng bất động sản:
1. Khách đã xem nhà nhưng chưa quyết định (sau 3 ngày)
2. Gửi thông tin dự án / căn mới phù hợp nhu cầu [nhu cầu]
3. Chúc mừng dịp lễ Tết, không bán hàng
4. Khách đã mua: hỏi thăm sau khi nhận nhà, xin giới thiệu người quen
Giọng chuyên nghiệp, gần gũi, dưới 60 chữ mỗi tin.`,
      },
      {
        title: 'Bài viết phân tích thị trường khu vực',
        tool: 'ChatGPT, Claude',
        description: 'Bài viết chuyên môn xây dựng hình ảnh chuyên gia khu vực.',
        content: `Viết bài phân tích thị trường bất động sản khu vực [khu vực] cho fanpage môi giới.
Dựa trên các thông tin tôi cung cấp: [hạ tầng sắp có, giá tham khảo, nguồn cung, nhu cầu].
Cấu trúc: tổng quan – yếu tố tác động – nhóm khách phù hợp – lưu ý khi xuống tiền – kết luận.
Giọng khách quan, có số liệu (ghi rõ nguồn do tôi cung cấp), tránh cam kết lợi nhuận.`,
      },
    ],
  },
  {
    name: 'Nhà hàng & F&B', color: '#CA8A04',
    prompts: [
      {
        title: 'Thực đơn hấp dẫn có mô tả món',
        tool: 'ChatGPT, Claude',
        description: 'Tên món, mô tả ngắn gợi vị và cách sắp xếp thực đơn.',
        content: `Quán của tôi: [loại quán], phong cách [phong cách], khách chủ yếu [khách hàng].
Danh sách món: [liệt kê món và giá].
Hãy viết mô tả hấp dẫn cho từng món (dưới 20 chữ, gợi vị và nguyên liệu), đề xuất cách chia nhóm thực đơn, đánh dấu 3 món "bán chạy" nên làm nổi bật và gợi ý 2 combo tăng giá trị đơn.`,
      },
      {
        title: 'Video món ăn bốc khói (AI)',
        tool: 'VEO3, Kling',
        description: 'Cảnh quay món ăn hấp dẫn cho video quảng cáo quán.',
        content: `Extreme close-up of [món ăn, mô tả bằng tiếng Anh] being served on [bàn / đĩa], steam rising, [chi tiết: sauce glistening, herbs on top].
Camera: slow dolly in, macro lens, shallow depth of field.
Lighting: warm, appetizing side light, glossy highlights.
Style: premium food commercial, slow motion.
Audio: sizzling sound, soft background chatter, no music. No text on screen.`,
      },
      {
        title: 'Chương trình khai trương / tri ân',
        tool: 'ChatGPT, Gemini',
        description: 'Ý tưởng ưu đãi kéo khách và bài đăng truyền thông.',
        content: `Quán [tên quán] sắp [khai trương / kỷ niệm / tri ân khách hàng] vào ngày [ngày], ngân sách khuyến mãi [ngân sách].
Đề xuất 5 ý tưởng chương trình (check-in, combo, mời bạn, bốc thăm…), dự tính chi phí, cách đo hiệu quả.
Viết 1 bài đăng Facebook và 1 kịch bản video 30 giây quảng bá chương trình tốt nhất.`,
      },
      {
        title: 'Trả lời đánh giá Google Maps',
        tool: 'ChatGPT',
        description: 'Phản hồi cả đánh giá tốt và xấu để tăng uy tín quán.',
        content: `Viết câu trả lời cho các đánh giá Google Maps của quán [tên quán]:
1. Đánh giá 5 sao: "[nội dung]"
2. Đánh giá 3 sao: "[nội dung]"
3. Đánh giá 1 sao: "[nội dung]"
Mỗi câu trả lời dưới 50 chữ, cảm ơn chân thành, nhắc tên món khách khen, xử lý khéo léo lời chê và mời khách quay lại.`,
      },
      {
        title: 'Quy trình phục vụ cho nhân viên',
        tool: 'ChatGPT, Claude',
        description: 'Checklist phục vụ chuẩn từ đón khách đến tiễn khách.',
        content: `Soạn quy trình phục vụ chuẩn cho nhân viên [nhà hàng / quán cà phê] gồm các bước: đón khách, xếp chỗ, giới thiệu thực đơn, gợi ý món, ghi order, phục vụ món, xử lý phàn nàn, thanh toán, tiễn khách.
Mỗi bước: việc cần làm, câu nói mẫu, lỗi cần tránh. Thêm 5 tình huống khó và cách xử lý.`,
      },
      {
        title: 'Tính giá vốn món ăn (food cost)',
        tool: 'ChatGPT, Gemini',
        description: 'Tính giá vốn và đề xuất giá bán hợp lý.',
        content: `Công thức món [tên món] cho 1 phần: [liệt kê nguyên liệu, định lượng, giá mua].
Hãy tính giá vốn 1 phần, đề xuất giá bán để food cost khoảng [28–35]%, và so sánh với giá trung bình thị trường [giá tham khảo].
Gợi ý 3 cách giảm giá vốn mà không giảm chất lượng.`,
      },
      {
        title: 'Câu chuyện thương hiệu quán',
        tool: 'ChatGPT, Claude',
        description: 'Câu chuyện ngắn tạo cảm xúc để in menu, đăng fanpage.',
        content: `Viết câu chuyện thương hiệu cho quán [tên quán]: người sáng lập [tên], lý do mở quán [lý do], món đặc trưng [món], điều quán muốn mang đến [giá trị].
Viết 2 phiên bản: bản ngắn 50 chữ để in menu / biển hiệu và bản 200 chữ để đăng fanpage, giọng chân thành, gợi kỷ niệm.`,
      },
    ],
  },
  {
    name: 'Nhân sự', color: '#7C3AED',
    prompts: [
      {
        title: 'Mô tả công việc (JD) thu hút ứng viên',
        tool: 'ChatGPT, Claude',
        description: 'JD rõ ràng nhiệm vụ, yêu cầu, quyền lợi và văn hóa công ty.',
        content: `Viết bản mô tả công việc cho vị trí [vị trí] tại [tên công ty, lĩnh vực], làm việc tại [địa điểm], hình thức [toàn thời gian / bán thời gian].
Gồm: giới thiệu ngắn về công ty, 6–8 nhiệm vụ chính, yêu cầu bắt buộc và ưu tiên, quyền lợi (lương [mức lương], thưởng, bảo hiểm, đào tạo), quy trình ứng tuyển.
Giọng chuyên nghiệp, thân thiện, tránh yêu cầu phân biệt giới tính / tuổi.`,
      },
      {
        title: 'Bộ câu hỏi phỏng vấn theo năng lực',
        tool: 'ChatGPT, Claude',
        description: 'Câu hỏi hành vi (STAR) kèm tiêu chí chấm điểm.',
        content: `Soạn 12 câu hỏi phỏng vấn cho vị trí [vị trí], đánh giá các năng lực: [năng lực 1], [năng lực 2], [năng lực 3].
Mỗi câu hỏi theo dạng hành vi (STAR), kèm: điều cần lắng nghe, dấu hiệu câu trả lời tốt, dấu hiệu đáng lo.
Thêm thang chấm điểm 1–5 và 3 câu hỏi để ứng viên hỏi ngược lại.`,
      },
      {
        title: 'Kế hoạch đào tạo nhân viên mới (onboarding)',
        tool: 'ChatGPT, Gemini',
        description: 'Lộ trình 30–60–90 ngày cho nhân viên mới.',
        content: `Xây dựng kế hoạch onboarding cho nhân viên mới vị trí [vị trí] tại [công ty].
Chia theo: Tuần đầu (hội nhập), 30 ngày, 60 ngày, 90 ngày.
Mỗi giai đoạn: mục tiêu, việc cần học, người hướng dẫn, kết quả cần đạt, cách đánh giá.
Kèm checklist ngày làm việc đầu tiên.`,
      },
      {
        title: 'Thư mời nhận việc / thư từ chối',
        tool: 'ChatGPT',
        description: 'Thư chuyên nghiệp, lịch sự gửi ứng viên.',
        content: `Viết 2 email:
1. Thư mời nhận việc cho ứng viên [tên] vị trí [vị trí]: mức lương [lương], ngày bắt đầu [ngày], thời gian thử việc [thời gian], giấy tờ cần chuẩn bị, hạn xác nhận.
2. Thư từ chối khéo léo cho ứng viên chưa phù hợp: cảm ơn, ghi nhận điểm mạnh, mong hợp tác trong tương lai.
Giọng chuyên nghiệp, ấm áp.`,
      },
      {
        title: 'Bộ chỉ tiêu KPI theo vị trí',
        tool: 'ChatGPT, Claude',
        description: 'Đề xuất KPI đo lường được kèm trọng số.',
        content: `Đề xuất bộ KPI cho vị trí [vị trí] trong bộ phận [bộ phận], mục tiêu công ty năm nay là [mục tiêu].
Gồm 5–7 KPI theo tiêu chí SMART, mỗi KPI có: cách đo, tần suất đo, chỉ tiêu, trọng số %.
Thêm gợi ý cách review KPI hằng tháng và cách xử lý khi nhân viên không đạt.`,
      },
      {
        title: 'Khảo sát mức độ hài lòng nhân viên',
        tool: 'ChatGPT, Google Forms',
        description: 'Bảng câu hỏi ẩn danh đo mức độ gắn kết.',
        content: `Soạn bảng khảo sát ẩn danh về mức độ hài lòng của nhân viên công ty [quy mô, lĩnh vực].
Gồm 20 câu: 15 câu thang điểm 1–5 về công việc, quản lý, đồng nghiệp, phúc lợi, cơ hội phát triển; 5 câu hỏi mở.
Kèm hướng dẫn cách phân tích kết quả và mẫu email mời nhân viên tham gia.`,
      },
      {
        title: 'Nội quy và chính sách công ty',
        tool: 'ChatGPT, Claude',
        description: 'Khung nội quy rõ ràng, dễ hiểu cho doanh nghiệp nhỏ.',
        content: `Soạn khung nội quy làm việc cho doanh nghiệp [quy mô] ngành [ngành], gồm: giờ làm việc, nghỉ phép, trang phục, sử dụng tài sản, bảo mật thông tin, ứng xử, khen thưởng – kỷ luật.
Viết ngắn gọn, dễ hiểu. Ghi chú các điểm cần đối chiếu với Bộ luật Lao động hiện hành trước khi ban hành.`,
      },
    ],
  },
  {
    name: 'Kế toán & Tài chính', color: '#059669',
    prompts: [
      {
        title: 'Kế hoạch tài chính cá nhân',
        tool: 'ChatGPT, Gemini',
        description: 'Phân bổ thu nhập, quỹ dự phòng và mục tiêu tiết kiệm.',
        content: `Thu nhập hằng tháng của tôi: [số tiền]. Chi phí cố định: [liệt kê]. Mục tiêu: [mua nhà / quỹ dự phòng / du lịch] số tiền [số tiền] trong [thời gian].
Hãy lập kế hoạch phân bổ thu nhập (ví dụ quy tắc 50/30/20 hoặc 6 chiếc lọ), số tiền cần tiết kiệm mỗi tháng, 5 cách cắt giảm chi tiêu hợp lý.
(Chỉ mang tính tham khảo, không phải tư vấn đầu tư.)`,
      },
      {
        title: 'Bảng dòng tiền doanh nghiệp nhỏ',
        tool: 'ChatGPT, Excel',
        description: 'Mẫu bảng theo dõi thu – chi và dự báo dòng tiền 6 tháng.',
        content: `Tạo mẫu bảng dự báo dòng tiền 6 tháng cho [loại hình kinh doanh].
Các dòng thu: [doanh thu chính, thu khác]. Các dòng chi: nhập hàng, lương, mặt bằng, marketing, thuế, chi khác.
Trình bày dạng bảng có cột từng tháng, dòng tổng thu – tổng chi – chênh lệch – số dư cuối kỳ, kèm công thức Excel cho từng ô tổng.`,
      },
      {
        title: 'Giải thích báo cáo tài chính dễ hiểu',
        tool: 'ChatGPT, Claude',
        description: 'Đọc hiểu các chỉ số quan trọng cho chủ doanh nghiệp không chuyên.',
        content: `Đây là số liệu báo cáo của doanh nghiệp tôi:
[dán số liệu doanh thu, giá vốn, chi phí, lợi nhuận, tài sản, nợ…]
Hãy giải thích bằng ngôn ngữ đơn giản: doanh nghiệp đang lãi hay lỗ, biên lợi nhuận, khả năng thanh toán, điểm đáng lo.
Tính 5 chỉ số quan trọng và đề xuất 3 việc nên làm. (Nên đối chiếu thêm với kế toán chuyên môn.)`,
      },
      {
        title: 'Công thức Excel / Google Sheets',
        tool: 'ChatGPT, Gemini',
        description: 'Nhờ AI viết công thức và giải thích từng phần.',
        content: `Tôi có bảng tính với các cột: [liệt kê cột, ví dụ A: Ngày, B: Khách hàng, C: Số tiền, D: Trạng thái].
Tôi muốn: [mô tả việc cần làm, ví dụ: tổng tiền theo từng khách trong tháng 10 với trạng thái "Đã thu"].
Hãy viết công thức cho [Excel / Google Sheets], giải thích từng phần và cách sửa khi bảng có thêm dữ liệu.`,
      },
      {
        title: 'Email nhắc công nợ lịch sự',
        tool: 'ChatGPT',
        description: 'Chuỗi email nhắc thanh toán từ nhẹ nhàng đến cứng rắn.',
        content: `Viết 3 email nhắc thanh toán cho khách hàng [tên công ty] về hóa đơn số [số hóa đơn], số tiền [số tiền], hạn thanh toán [ngày]:
1. Trước hạn 3 ngày: nhắc nhẹ nhàng
2. Quá hạn 7 ngày: đề nghị xác nhận lịch thanh toán
3. Quá hạn 30 ngày: nêu rõ hậu quả theo hợp đồng, giọng chuyên nghiệp
Kèm thông tin chuyển khoản: [thông tin].`,
      },
      {
        title: 'Phân tích điểm hòa vốn',
        tool: 'ChatGPT, Gemini',
        description: 'Tính số lượng bán cần đạt để không lỗ.',
        content: `Giúp tôi tính điểm hòa vốn:
- Chi phí cố định hằng tháng: [mặt bằng, lương, khấu hao…] = [tổng]
- Giá bán 1 sản phẩm: [giá], chi phí biến đổi 1 sản phẩm: [chi phí]
Tính số sản phẩm cần bán / tháng và / ngày để hòa vốn, doanh thu hòa vốn, và lợi nhuận nếu bán được [số lượng]. Trình bày công thức và bảng kết quả.`,
      },
    ],
  },
  {
    name: 'Y tế & Làm đẹp', color: '#DB2777',
    prompts: [
      {
        title: 'Bài viết chăm sóc da theo loại da',
        tool: 'ChatGPT, Claude',
        description: 'Nội dung kiến thức cho spa / shop mỹ phẩm, dễ hiểu và an toàn.',
        content: `Viết bài chia sẻ kiến thức về chăm sóc da [loại da: dầu / khô / nhạy cảm / hỗn hợp] cho fanpage [tên spa / shop].
Gồm: dấu hiệu nhận biết, quy trình sáng – tối (các bước cơ bản), 5 sai lầm thường gặp, khi nào nên gặp bác sĩ da liễu.
Giọng thân thiện, không hứa hẹn kết quả tuyệt đối, không nêu tên thuốc điều trị.`,
      },
      {
        title: 'Kịch bản tư vấn dịch vụ spa',
        tool: 'ChatGPT',
        description: 'Tư vấn khách qua tin nhắn, giới thiệu liệu trình phù hợp.',
        content: `Spa của tôi có các dịch vụ: [liệt kê dịch vụ và giá].
Viết kịch bản tư vấn qua tin nhắn: hỏi tình trạng – tư vấn liệu trình phù hợp – báo giá – ưu đãi khách mới – đặt lịch.
Thêm câu trả lời mẫu cho các câu hỏi: có đau không, bao lâu thấy hiệu quả, có cần nghỉ dưỡng không, có an toàn cho da nhạy cảm không.`,
      },
      {
        title: 'Video before–after trung thực',
        tool: 'ChatGPT, CapCut',
        description: 'Kịch bản video kết quả liệu trình, tuân thủ quy định quảng cáo.',
        content: `Viết kịch bản video 30 giây giới thiệu kết quả liệu trình [tên liệu trình] của khách hàng thật (đã đồng ý cho đăng).
Gồm: tình trạng ban đầu, quá trình (số buổi), kết quả, cảm nhận của khách.
Lưu ý: không chỉnh sửa ảnh làm sai lệch kết quả, ghi chú "kết quả có thể khác nhau tùy cơ địa", không dùng từ "cam kết 100%".`,
      },
      {
        title: 'Lịch nhắc tái khám / chăm sóc',
        tool: 'ChatGPT',
        description: 'Tin nhắn nhắc lịch hẹn và hỏi thăm sau dịch vụ.',
        content: `Viết bộ tin nhắn tự động cho [phòng khám / spa / nha khoa]:
1. Xác nhận lịch hẹn (ngay khi đặt)
2. Nhắc lịch trước 1 ngày, kèm lưu ý chuẩn bị
3. Hỏi thăm sau dịch vụ 1 ngày, hướng dẫn chăm sóc tại nhà
4. Nhắc tái khám / liệu trình tiếp theo sau [số ngày] ngày
Giọng ân cần, ngắn gọn dưới 50 chữ mỗi tin.`,
      },
      {
        title: 'Thực đơn ăn uống lành mạnh 7 ngày',
        tool: 'ChatGPT, Gemini',
        description: 'Gợi ý thực đơn cân bằng, dễ nấu với món Việt.',
        content: `Lập thực đơn 7 ngày cho [đối tượng: người văn phòng muốn giảm cân / người tập gym / người cao tuổi], khoảng [số calo] kcal/ngày, ngân sách [số tiền]/ngày.
Mỗi ngày gồm 3 bữa chính + 1 bữa phụ, ưu tiên món Việt dễ nấu, ghi lượng ước tính.
Kèm danh sách đi chợ cho cả tuần. (Người có bệnh lý nên hỏi ý kiến bác sĩ / chuyên gia dinh dưỡng.)`,
      },
      {
        title: 'Ảnh quảng cáo mỹ phẩm (AI)',
        tool: 'Midjourney, Ideogram',
        description: 'Ảnh sản phẩm làm đẹp phong cách cao cấp.',
        content: `Luxury skincare advertising photo: [sản phẩm, mô tả bằng tiếng Anh] standing on [bề mặt: a smooth stone], surrounded by [thành phần: fresh aloe vera slices and water droplets].
Background: soft [màu] gradient, clean and premium.
Lighting: soft diffused light with gentle glossy highlights.
Style: high-end beauty brand campaign, minimal, ultra detailed. --ar 4:5 --no text`,
      },
      {
        title: 'Giải thích dịch vụ nha khoa cho bệnh nhân',
        tool: 'ChatGPT, Claude',
        description: 'Giải thích quy trình điều trị dễ hiểu, giảm lo lắng.',
        content: `Giải thích dịch vụ [tên dịch vụ: niềng răng / bọc sứ / cấy implant / tẩy trắng] cho bệnh nhân bằng ngôn ngữ dễ hiểu.
Gồm: dịch vụ là gì, ai phù hợp, quy trình các bước, thời gian, cảm giác khi làm, chăm sóc sau điều trị, câu hỏi thường gặp.
Không đưa ra chẩn đoán; khuyến khích bệnh nhân đến khám để bác sĩ tư vấn cụ thể.`,
      },
    ],
  },
  {
    name: 'Lập trình', color: '#334155',
    prompts: [
      {
        title: 'Giải thích đoạn code từng dòng',
        tool: 'ChatGPT, Claude',
        description: 'Hiểu nhanh code của người khác hoặc code cũ.',
        content: `Giải thích đoạn code [ngôn ngữ] sau cho người mới học:
[dán code]
- Mục đích tổng thể của đoạn code
- Giải thích từng khối / dòng quan trọng
- Chỉ ra lỗi tiềm ẩn hoặc chỗ có thể viết gọn hơn
- Viết lại phiên bản cải tiến có chú thích`,
      },
      {
        title: 'Tìm và sửa lỗi (debug)',
        tool: 'ChatGPT, Claude',
        description: 'Gửi lỗi kèm ngữ cảnh để AI chẩn đoán nguyên nhân.',
        content: `Tôi gặp lỗi khi chạy [ứng dụng / script] viết bằng [ngôn ngữ / framework, phiên bản].
Thông báo lỗi:
[dán lỗi]
Đoạn code liên quan:
[dán code]
Tôi đã thử: [những gì đã thử].
Hãy nêu các nguyên nhân có thể theo thứ tự khả năng, cách kiểm tra từng nguyên nhân, và đoạn code đã sửa.`,
      },
      {
        title: 'Viết unit test',
        tool: 'ChatGPT, Claude',
        description: 'Sinh test case bao phủ trường hợp bình thường và biên.',
        content: `Viết unit test bằng [Jest / Pytest / JUnit] cho hàm sau:
[dán hàm]
Bao gồm: trường hợp bình thường, giá trị biên, dữ liệu sai, trường hợp lỗi.
Đặt tên test rõ ràng theo dạng "nên … khi …" và giải thích ngắn mỗi nhóm test.`,
      },
      {
        title: 'Thiết kế cơ sở dữ liệu',
        tool: 'ChatGPT, Claude',
        description: 'Đề xuất bảng, khóa, quan hệ cho ứng dụng.',
        content: `Tôi đang xây ứng dụng [mô tả ứng dụng] với các chức năng: [liệt kê chức năng].
Hãy thiết kế cơ sở dữ liệu [MySQL / PostgreSQL]: danh sách bảng, cột (kiểu dữ liệu), khóa chính, khóa ngoại, chỉ mục cần thiết.
Viết câu lệnh CREATE TABLE và giải thích lý do thiết kế, các truy vấn hay dùng nhất.`,
      },
      {
        title: 'Review code như senior',
        tool: 'ChatGPT, Claude',
        description: 'Nhận xét về bảo mật, hiệu năng, khả năng bảo trì.',
        content: `Hãy review đoạn code sau như một lập trình viên senior:
[dán code]
Đánh giá theo: lỗi logic, bảo mật (SQL injection, XSS, lộ thông tin…), hiệu năng, cách đặt tên, khả năng bảo trì.
Xếp các góp ý theo mức độ: Nghiêm trọng / Nên sửa / Gợi ý, kèm code minh họa cách sửa.`,
      },
      {
        title: 'Viết tài liệu README cho dự án',
        tool: 'ChatGPT, Claude',
        description: 'README rõ ràng giúp người khác cài đặt và sử dụng dự án.',
        content: `Viết file README.md cho dự án [tên dự án]: [mô tả ngắn], công nghệ [công nghệ].
Gồm: giới thiệu, tính năng chính, yêu cầu hệ thống, cài đặt từng bước, cấu hình biến môi trường, cách chạy, cấu trúc thư mục, đóng góp, giấy phép.
Dùng định dạng Markdown, có khối lệnh mẫu.`,
      },
    ],
  },
];
