// Thư viện prompt mẫu theo ngành nghề. Phần trong [ngoặc vuông] là chỗ người dùng tự điền.
module.exports = [
  {
    name: 'Làm video AI', color: '#E11D48',
    prompts: [
      {
        title: 'Kịch bản video ngắn 60 giây',
        tool: 'ChatGPT, Claude',
        description: 'Viết kịch bản TikTok/Reels chia theo cảnh, có lời thoại và mô tả hình ảnh.',
        content: `Bạn là biên kịch video ngắn chuyên nghiệp cho TikTok và Facebook Reels.
Hãy viết kịch bản video dài 60 giây về chủ đề: [chủ đề video].
Khán giả: [mô tả khán giả, ví dụ: nữ 25–35 tuổi, nhân viên văn phòng].
Mục tiêu: [mục tiêu, ví dụ: bán sản phẩm / tăng theo dõi].

Yêu cầu:
- 3 giây đầu là câu hook gây tò mò, không chào hỏi.
- Chia thành 6–8 cảnh, trình bày dạng bảng gồm: Thời gian | Lời thoại | Hình ảnh trên màn hình | Chữ hiển thị.
- Giọng văn: [thân thiện / hài hước / chuyên gia].
- Kết thúc bằng 1 lời kêu gọi hành động rõ ràng.
- Viết thêm 3 phương án hook khác để tôi thử nghiệm.`,
      },
      {
        title: 'Prompt tạo cảnh quay (text-to-video)',
        tool: 'Runway, Kling, Veo, Luma',
        description: 'Chuyển một cảnh trong kịch bản thành prompt tiếng Anh chi tiết cho công cụ tạo video.',
        content: `Act as a cinematographer. Convert the scene below into ONE detailed English prompt for an AI video generator.

Scene (Vietnamese): [mô tả cảnh bằng tiếng Việt]
Aspect ratio: [9:16 hoặc 16:9]
Style: [cinematic / realistic / 3D animation / anime]

The prompt must include: subject, action, setting, lighting, camera movement (e.g. slow dolly in, handheld, aerial), lens, mood and colour palette. Keep it under 80 words. Then give 2 alternative versions with different camera movements.`,
      },
      {
        title: 'Mô tả nhân vật nhất quán',
        tool: 'Midjourney, Ideogram, Leonardo',
        description: 'Tạo "hồ sơ nhân vật" cố định để dùng lại ở mọi cảnh, giúp nhân vật không bị đổi mặt.',
        content: `Tạo hồ sơ nhân vật cho video AI của tôi để dùng lặp lại trong mọi cảnh.
Nhân vật: [vai trò, ví dụ: cô giáo dạy tiếng Anh trẻ trung]
Phong cách hình ảnh: [chân thực / hoạt hình 3D / minh họa]

Hãy trả về:
1. Đoạn mô tả ngoại hình cố định bằng tiếng Anh (tuổi, khuôn mặt, kiểu tóc, màu tóc, trang phục, phụ kiện) – dưới 50 từ.
2. 5 prompt hình ảnh tiếng Anh đặt nhân vật này vào 5 bối cảnh: [liệt kê bối cảnh], luôn chèn nguyên văn đoạn mô tả ở (1).
3. Gợi ý cách dùng ảnh tham chiếu để giữ khuôn mặt giống nhau.`,
      },
      {
        title: '10 câu hook 3 giây',
        tool: 'ChatGPT, Claude',
        description: 'Sinh nhanh nhiều câu mở đầu giữ chân người xem.',
        content: `Viết 10 câu hook mở đầu video (đọc trong tối đa 3 giây) cho chủ đề: [chủ đề].
Dùng đa dạng kiểu: đặt câu hỏi, con số gây sốc, sai lầm phổ biến, bí mật, so sánh trước/sau.
Mỗi câu dưới 15 từ, không dùng từ ngữ giật tít sai sự thật. Đánh dấu 3 câu bạn cho là mạnh nhất và giải thích ngắn gọn vì sao.`,
      },
    ],
  },
  {
    name: 'Marketing', color: '#F97316',
    prompts: [
      {
        title: 'Lịch nội dung 30 ngày',
        tool: 'ChatGPT, Claude',
        description: 'Lập kế hoạch đăng bài cả tháng cho fanpage hoặc TikTok.',
        content: `Bạn là chuyên gia content marketing. Lập lịch nội dung 30 ngày cho thương hiệu [tên thương hiệu] bán [sản phẩm/dịch vụ] trên kênh [Facebook / TikTok / Instagram].
Khách hàng mục tiêu: [mô tả].
Tỉ lệ nội dung: 40% giá trị/kiến thức, 30% câu chuyện thương hiệu, 20% tương tác, 10% bán hàng.
Trình bày dạng bảng: Ngày | Chủ đề | Định dạng (video/ảnh/carousel) | Ý chính | Lời kêu gọi hành động.`,
      },
      {
        title: 'Bài quảng cáo Facebook theo AIDA',
        tool: 'ChatGPT, Claude',
        description: 'Viết 3 mẫu quảng cáo theo công thức Chú ý – Thích thú – Mong muốn – Hành động.',
        content: `Viết 3 mẫu bài quảng cáo Facebook cho [sản phẩm] theo công thức AIDA.
Điểm khác biệt của sản phẩm: [USP].
Ưu đãi: [ưu đãi, thời hạn].
Mỗi mẫu gồm: tiêu đề (dưới 40 ký tự), nội dung chính (dưới 125 từ), lời kêu gọi hành động. Dùng emoji vừa phải, không hứa hẹn sai sự thật, tuân thủ chính sách quảng cáo của Meta.`,
      },
    ],
  },
  {
    name: 'Bán hàng online', color: '#0D9488',
    prompts: [
      {
        title: 'Mô tả sản phẩm Shopee / TikTok Shop',
        tool: 'ChatGPT, Claude',
        description: 'Mô tả chuẩn SEO sàn thương mại điện tử, dễ đọc trên điện thoại.',
        content: `Viết mô tả sản phẩm cho sàn [Shopee / TikTok Shop / Lazada].
Sản phẩm: [tên sản phẩm]
Thông số: [chất liệu, kích thước, màu sắc...]
Khách hàng: [đối tượng]

Yêu cầu: tiêu đề chứa từ khóa chính (dưới 120 ký tự), 5 gạch đầu dòng lợi ích nổi bật, phần thông số, hướng dẫn sử dụng/bảo quản, chính sách đổi trả. Câu ngắn, dễ đọc trên điện thoại. Gợi ý thêm 10 từ khóa tìm kiếm liên quan.`,
      },
      {
        title: 'Kịch bản livestream bán hàng 30 phút',
        tool: 'ChatGPT, Claude',
        description: 'Kịch bản chia theo mốc thời gian, có mini game giữ chân người xem.',
        content: `Viết kịch bản livestream bán [sản phẩm] dài 30 phút trên [TikTok / Facebook].
Chia theo mốc thời gian: mở đầu giữ chân, giới thiệu sản phẩm, demo, trả lời câu hỏi thường gặp, chốt đơn có ưu đãi giới hạn, mini game tương tác.
Viết sẵn câu nói mẫu cho người livestream ở từng phần và 5 câu trả lời khi khách chê giá đắt.`,
      },
      {
        title: 'Trả lời khách hàng phàn nàn',
        tool: 'ChatGPT, Claude',
        description: 'Soạn tin nhắn xoa dịu khách khó tính, giữ uy tín shop.',
        content: `Khách hàng phàn nàn: "[dán nội dung tin nhắn/đánh giá của khách]".
Hãy soạn 2 phương án trả lời: lịch sự, thấu hiểu, không đổ lỗi, đưa ra giải pháp cụ thể ([đổi hàng / hoàn tiền / tặng mã giảm giá]). Độ dài dưới 80 từ, xưng hô "shop – bạn".`,
      },
    ],
  },
  {
    name: 'Giáo dục', color: '#4F46E5',
    prompts: [
      {
        title: 'Soạn giáo án một buổi học',
        tool: 'ChatGPT, Claude',
        description: 'Giáo án có mục tiêu, hoạt động và đánh giá cho 45–90 phút.',
        content: `Bạn là giáo viên giàu kinh nghiệm. Soạn giáo án môn [môn học] cho [lớp/độ tuổi], chủ đề "[chủ đề]", thời lượng [45/90] phút.
Gồm: mục tiêu bài học (kiến thức – kỹ năng – thái độ), chuẩn bị, tiến trình theo phút (khởi động, hình thành kiến thức, luyện tập, vận dụng), câu hỏi kiểm tra cuối giờ và bài tập về nhà. Ưu tiên hoạt động tương tác và làm việc nhóm.`,
      },
      {
        title: 'Tạo bộ câu hỏi trắc nghiệm',
        tool: 'ChatGPT, Claude',
        description: 'Câu hỏi 4 đáp án kèm giải thích, chia mức độ dễ – khó.',
        content: `Từ nội dung dưới đây, tạo [10] câu hỏi trắc nghiệm 4 đáp án (A, B, C, D):
[dán nội dung bài học]

Chia mức độ: 40% nhận biết, 30% thông hiểu, 20% vận dụng, 10% vận dụng cao. Sau mỗi câu ghi đáp án đúng và giải thích ngắn. Các đáp án nhiễu phải hợp lý, không quá dễ loại trừ.`,
      },
    ],
  },
  {
    name: 'Bất động sản', color: '#0EA5E9',
    prompts: [
      {
        title: 'Tin đăng bán / cho thuê',
        tool: 'ChatGPT, Claude',
        description: 'Tin đăng hấp dẫn, đầy đủ thông tin pháp lý và tiện ích.',
        content: `Viết tin đăng [bán / cho thuê] bất động sản:
- Loại: [căn hộ / nhà phố / đất nền], diện tích [m²], [số phòng ngủ]
- Vị trí: [địa chỉ, khu vực]
- Giá: [giá], pháp lý: [sổ hồng / hợp đồng mua bán]
- Tiện ích: [liệt kê]

Viết 1 bản ngắn (đăng Facebook, dưới 100 từ) và 1 bản đầy đủ (đăng web). Nêu rõ điểm mạnh về vị trí và tiện ích, thông tin trung thực, không phóng đại.`,
      },
      {
        title: 'Kịch bản video giới thiệu căn hộ',
        tool: 'ChatGPT, Claude',
        description: 'Video tham quan nhà 60 giây theo lộ trình từng phòng.',
        content: `Viết kịch bản video tham quan [loại bất động sản] dài 60 giây, dạng dọc 9:16.
Đi theo lộ trình: [cổng/sảnh → phòng khách → bếp → phòng ngủ → ban công/view].
Mỗi cảnh ghi: góc quay gợi ý, lời thoại, chữ trên màn hình. Mở đầu bằng điểm nổi bật nhất ([view sông / giá tốt / gần trường học]) và kết thúc bằng thông tin liên hệ.`,
      },
    ],
  },
  {
    name: 'Nhà hàng & F&B', color: '#CA8A04',
    prompts: [
      {
        title: 'Mô tả món ăn trong thực đơn',
        tool: 'ChatGPT, Claude',
        description: 'Mô tả ngắn, gợi cảm giác ngon miệng cho menu và app giao đồ ăn.',
        content: `Viết mô tả cho các món sau trong thực đơn của [tên quán, phong cách quán]:
[liệt kê tên món + nguyên liệu chính]

Mỗi món 1–2 câu (dưới 30 từ), gợi hương vị, kết cấu và cảm giác khi ăn. Viết thêm phiên bản tiếng Anh ngắn gọn cho khách nước ngoài.`,
      },
      {
        title: 'Phản hồi đánh giá Google Maps',
        tool: 'ChatGPT, Claude',
        description: 'Trả lời review tốt và xấu chuyên nghiệp, cá nhân hóa.',
        content: `Viết phản hồi cho đánh giá sau của khách trên Google Maps:
"[dán nội dung đánh giá]" – số sao: [1–5]

Yêu cầu: cảm ơn khách, nhắc đúng chi tiết khách đề cập, nếu là góp ý thì xin lỗi chân thành và nêu hành động khắc phục cụ thể, mời khách quay lại. Dưới 70 từ, giọng ấm áp, không sao chép rập khuôn.`,
      },
    ],
  },
  {
    name: 'Nhân sự', color: '#7C3AED',
    prompts: [
      {
        title: 'Viết mô tả công việc (JD)',
        tool: 'ChatGPT, Claude',
        description: 'JD rõ ràng, hấp dẫn ứng viên phù hợp.',
        content: `Viết mô tả công việc cho vị trí [tên vị trí] tại [tên công ty, lĩnh vực].
Cấp bậc: [thực tập / nhân viên / trưởng nhóm]. Mức lương: [khoảng lương hoặc thỏa thuận]. Hình thức: [toàn thời gian / remote / hybrid].
Gồm: giới thiệu ngắn về công ty, trách nhiệm chính (5–7 ý), yêu cầu bắt buộc, yêu cầu ưu tiên, quyền lợi, cách ứng tuyển. Ngôn ngữ trung lập, không phân biệt giới tính hay tuổi tác.`,
      },
      {
        title: 'Bộ câu hỏi phỏng vấn',
        tool: 'ChatGPT, Claude',
        description: 'Câu hỏi hành vi và chuyên môn kèm tiêu chí chấm điểm.',
        content: `Tạo 12 câu hỏi phỏng vấn cho vị trí [tên vị trí]: 5 câu chuyên môn, 4 câu hành vi (theo phương pháp STAR), 3 câu về văn hóa phù hợp.
Với mỗi câu, ghi: mục đích của câu hỏi, dấu hiệu câu trả lời tốt, dấu hiệu cần cân nhắc. Cuối cùng gợi ý thang điểm 1–5 để đánh giá ứng viên.`,
      },
    ],
  },
  {
    name: 'Kế toán & Tài chính', color: '#059669',
    prompts: [
      {
        title: 'Phân tích nhanh báo cáo kinh doanh',
        tool: 'ChatGPT, Claude',
        description: 'Tóm tắt số liệu doanh thu – chi phí, chỉ ra điểm bất thường.',
        content: `Bạn là chuyên viên phân tích tài chính. Dưới đây là số liệu kinh doanh [tháng/quý] của tôi:
[dán bảng số liệu: doanh thu, giá vốn, chi phí theo từng khoản]

Hãy: (1) tính biên lợi nhuận gộp và ròng, (2) so sánh với kỳ trước nếu có, (3) chỉ ra 3 khoản chi phí bất thường hoặc tăng mạnh, (4) đề xuất 3 hành động cụ thể. Trình bày ngắn gọn, có bảng. Không bịa thêm số liệu không có trong dữ liệu.`,
      },
      {
        title: 'Email nhắc công nợ lịch sự',
        tool: 'ChatGPT, Claude',
        description: 'Ba mức nhắc nợ từ nhẹ nhàng đến kiên quyết.',
        content: `Soạn 3 email nhắc thanh toán gửi [tên khách hàng/công ty] cho hóa đơn số [số hóa đơn], số tiền [số tiền], đến hạn ngày [ngày]:
1. Nhắc nhẹ trước hạn 3 ngày.
2. Nhắc khi quá hạn 7 ngày.
3. Nhắc kiên quyết khi quá hạn 30 ngày, nêu bước xử lý tiếp theo.
Giọng chuyên nghiệp, giữ quan hệ hợp tác, kèm thông tin chuyển khoản: [thông tin tài khoản].`,
      },
    ],
  },
  {
    name: 'Y tế & Làm đẹp', color: '#DB2777',
    prompts: [
      {
        title: 'Bài viết tư vấn chăm sóc da',
        tool: 'ChatGPT, Claude',
        description: 'Nội dung giáo dục khách hàng cho spa/thẩm mỹ viện, có lưu ý an toàn.',
        content: `Viết bài đăng Facebook cho [tên spa/phòng khám] về chủ đề "[ví dụ: chăm sóc da mụn mùa hè]".
Gồm: nguyên nhân phổ biến, 5 bước chăm sóc tại nhà, những sai lầm nên tránh, khi nào cần gặp bác sĩ da liễu.
Thông tin mang tính tham khảo, không chẩn đoán hay cam kết kết quả điều trị, không nêu tên thuốc kê đơn. Cuối bài mời khách đặt lịch soi da miễn phí.`,
      },
      {
        title: 'Tin nhắn nhắc lịch hẹn',
        tool: 'ChatGPT, Claude',
        description: 'Tin nhắn Zalo/SMS ngắn gọn nhắc khách đến đúng hẹn.',
        content: `Soạn 3 mẫu tin nhắn nhắc lịch hẹn cho [phòng khám / spa / salon] gửi qua Zalo:
- Trước 1 ngày: nhắc giờ hẹn [giờ], dịch vụ [dịch vụ], địa chỉ [địa chỉ], cách đổi lịch.
- Trước 2 giờ: nhắc ngắn gọn.
- Sau buổi hẹn: cảm ơn và hỏi thăm trải nghiệm.
Mỗi tin dưới 50 từ, thân thiện, có tên khách [Tên khách].`,
      },
    ],
  },
  {
    name: 'Lập trình', color: '#334155',
    prompts: [
      {
        title: 'Review code',
        tool: 'ChatGPT, Claude',
        description: 'Tìm lỗi, lỗ hổng bảo mật và đề xuất cải thiện cho đoạn code.',
        content: `Bạn là senior developer. Review đoạn code [ngôn ngữ] dưới đây:
[dán code]

Liệt kê theo thứ tự ưu tiên: (1) lỗi logic có thể gây sai kết quả, (2) lỗ hổng bảo mật, (3) vấn đề hiệu năng, (4) cải thiện dễ đọc. Với mỗi vấn đề: trích dòng code, giải thích ngắn, đưa code đã sửa. Không viết lại toàn bộ nếu không cần.`,
      },
      {
        title: 'Giải thích lỗi và cách sửa',
        tool: 'ChatGPT, Claude',
        description: 'Dán thông báo lỗi để được giải thích dễ hiểu cho người mới.',
        content: `Tôi đang học lập trình [ngôn ngữ/framework] và gặp lỗi sau:
[dán thông báo lỗi]

Đoạn code liên quan:
[dán code]

Hãy giải thích lỗi bằng ngôn ngữ dễ hiểu cho người mới, nêu nguyên nhân có khả năng nhất, cách sửa từng bước và cách phòng tránh lần sau.`,
      },
    ],
  },
];
