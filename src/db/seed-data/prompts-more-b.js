// Bổ sung thư viện prompt theo ngành (phần 2: các ngành mới). Phần trong [ngoặc vuông] là chỗ người dùng tự điền.
module.exports = [
  {
    name: 'Du lịch & Khách sạn', color: '#0891B2',
    prompts: [
      {
        title: 'Lịch trình du lịch chi tiết',
        tool: 'ChatGPT, Gemini',
        description: 'Lịch trình theo ngày có giờ giấc, chi phí và mẹo đi lại.',
        content: `Lập lịch trình du lịch [điểm đến] [số ngày] ngày [số đêm] đêm cho [số người, đối tượng: gia đình có trẻ nhỏ / cặp đôi / nhóm bạn], ngân sách [ngân sách], phong cách [nghỉ dưỡng / khám phá / ăn uống].
Mỗi ngày: lịch theo khung giờ, điểm tham quan, món ăn nên thử, chi phí ước tính, cách di chuyển.
Kèm danh sách đồ cần mang và 5 lưu ý quan trọng khi đến [điểm đến].`,
      },
      {
        title: 'Mô tả phòng khách sạn / homestay',
        tool: 'ChatGPT, Claude',
        description: 'Nội dung đăng trên Booking, Agoda, Airbnb hấp dẫn và trung thực.',
        content: `Viết mô tả cho [loại phòng] tại [tên khách sạn / homestay], [vị trí].
Thông tin: diện tích [m²], giường [loại giường], view [view], tiện nghi [tiện nghi], khoảng cách tới [điểm nổi bật].
Viết: tiêu đề dưới 60 ký tự, đoạn mô tả 120 chữ gợi trải nghiệm, danh sách tiện nghi, nội quy ngắn. Có bản tiếng Việt và tiếng Anh.`,
      },
      {
        title: 'Trả lời đánh giá của khách lưu trú',
        tool: 'ChatGPT',
        description: 'Phản hồi đánh giá trên OTA chuyên nghiệp, cá nhân hóa.',
        content: `Viết phản hồi cho đánh giá của khách trên [Booking / Agoda / Google]: "[nội dung đánh giá]" ([số điểm] điểm).
Yêu cầu: cảm ơn bằng tên khách, nhắc lại điểm khách hài lòng, xử lý khéo điểm chưa tốt kèm hành động khắc phục cụ thể, mời quay lại. Dưới 80 chữ, viết bằng ngôn ngữ của khách [tiếng Việt / tiếng Anh].`,
      },
      {
        title: 'Video quảng bá điểm đến (AI)',
        tool: 'VEO3, Kling',
        description: 'Cảnh quay du lịch hoành tráng cho video quảng bá tour / resort.',
        content: `Cinematic travel shot: aerial drone flying over [điểm đến, mô tả bằng tiếng Anh] at [thời điểm: sunrise / golden hour], then gliding down to [chi tiết: a couple walking on the beach / a boat on the river].
Camera: smooth sweeping drone movement, then slow tracking shot.
Lighting: warm golden light, vivid but natural colors.
Style: tourism commercial, uplifting, 4K.
Audio: inspiring cinematic music, gentle waves / nature sounds.`,
      },
      {
        title: 'Bài viết review điểm đến',
        tool: 'ChatGPT, Claude',
        description: 'Bài chia sẻ kinh nghiệm du lịch chuẩn SEO cho blog / fanpage.',
        content: `Viết bài "Kinh nghiệm du lịch [điểm đến] tự túc [năm]" khoảng 800 chữ.
Gồm: thời điểm đẹp nhất, cách di chuyển, nơi ở theo ngân sách, 8 điểm tham quan, món ăn đặc sản, chi phí tham khảo, lưu ý.
Có các tiêu đề phụ rõ ràng, từ khóa chính "[từ khóa]" xuất hiện tự nhiên. Ghi chú để tôi tự cập nhật giá mới nhất.`,
      },
      {
        title: 'Kịch bản tư vấn tour qua điện thoại',
        tool: 'ChatGPT',
        description: 'Câu hỏi khai thác nhu cầu và cách giới thiệu tour phù hợp.',
        content: `Tôi bán tour [loại tour] với các gói: [liệt kê gói và giá].
Viết kịch bản tư vấn: chào hỏi – hỏi số người, thời gian, ngân sách, sở thích – giới thiệu gói phù hợp – xử lý lo ngại (giá, thời tiết, an toàn, trẻ nhỏ) – chốt đặt cọc.
Kèm tin nhắn xác nhận đặt tour gửi khách.`,
      },
    ],
  },
  {
    name: 'Thời trang', color: '#C026D3',
    prompts: [
      {
        title: 'Caption bộ sưu tập mới',
        tool: 'ChatGPT, Gemini',
        description: 'Bài đăng ra mắt bộ sưu tập gợi cảm hứng phối đồ.',
        content: `Viết bài đăng ra mắt bộ sưu tập [tên BST] của [tên thương hiệu], chủ đề [chủ đề / mùa], chất liệu chính [chất liệu], khách hàng [khách hàng].
Gồm: 3 caption ngắn cho Instagram (dưới 30 chữ), 1 bài Facebook 120 chữ kể cảm hứng thiết kế, 10 hashtag.
Giọng [trẻ trung / thanh lịch / cá tính].`,
      },
      {
        title: 'Gợi ý phối đồ theo dáng người',
        tool: 'ChatGPT, Claude',
        description: 'Tư vấn phối đồ cho khách theo vóc dáng và dịp sử dụng.',
        content: `Tư vấn phối đồ cho khách: [giới tính], cao [chiều cao], nặng [cân nặng], dáng [dáng người], dịp [đi làm / dự tiệc / dạo phố], phong cách thích [phong cách].
Đề xuất 5 set đồ (áo, quần/váy, giày, phụ kiện), giải thích vì sao hợp dáng, màu sắc nên chọn và nên tránh.
Gợi ý sản phẩm tương ứng trong shop: [danh sách sản phẩm của shop].`,
      },
      {
        title: 'Ảnh lookbook người mẫu AI',
        tool: 'Midjourney, Kling',
        description: 'Ảnh người mẫu mặc sản phẩm cho lookbook / quảng cáo.',
        content: `Fashion lookbook photo of a [người mẫu: young Vietnamese female model] wearing [sản phẩm, mô tả chi tiết bằng tiếng Anh: màu, chất liệu, kiểu dáng], [tư thế: walking naturally / leaning on a wall], in [bối cảnh: a sunny street in Hoi An].
Lighting: soft late afternoon sunlight.
Camera: 85mm, full body, shallow depth of field.
Style: editorial fashion photography, natural, film grain. --ar 3:4
(Mẹo: dùng ảnh sản phẩm thật làm tham chiếu để giữ đúng màu và form.)`,
      },
      {
        title: 'Bảng size và hướng dẫn chọn size',
        tool: 'ChatGPT',
        description: 'Hướng dẫn chọn size dễ hiểu để giảm đổi trả.',
        content: `Sản phẩm: [loại sản phẩm], form [form dáng], bảng số đo: [dán bảng số đo].
Viết hướng dẫn chọn size dễ hiểu: cách đo cơ thể, bảng quy đổi chiều cao – cân nặng sang size, lời khuyên khi ở giữa 2 size, lưu ý về độ co giãn chất liệu.
Kèm 5 câu trả lời mẫu khi khách hỏi "mình [cao, nặng] mặc size gì".`,
      },
      {
        title: 'Video thử đồ (try-on) bán hàng',
        tool: 'ChatGPT, CapCut',
        description: 'Kịch bản video thử đồ nhanh, nhiều set, có CTA.',
        content: `Viết kịch bản video TikTok 30 giây "1 chiếc [sản phẩm] – [số] cách phối".
Mỗi set: thời lượng, mô tả set đồ, chuyển cảnh gợi ý (búng tay, xoay người, che camera), chữ trên màn hình.
Mở đầu bằng hook gây tò mò, kết thúc bằng CTA bấm giỏ hàng, gợi ý nhạc nền phù hợp.`,
      },
      {
        title: 'Câu chuyện chất liệu & quy trình',
        tool: 'ChatGPT, Claude',
        description: 'Nội dung nâng giá trị sản phẩm qua chất liệu, tay nghề.',
        content: `Viết bài giới thiệu chất liệu [chất liệu] và quy trình làm ra sản phẩm [sản phẩm] của [thương hiệu].
Gồm: nguồn gốc chất liệu, ưu điểm khi mặc, các bước sản xuất / may thủ công, cách bảo quản để bền lâu.
Giọng chân thành, có chi tiết cụ thể để khách hiểu vì sao sản phẩm đáng giá [mức giá].`,
      },
    ],
  },
  {
    name: 'Gym & Thể hình', color: '#DC2626',
    prompts: [
      {
        title: 'Giáo án tập luyện 4 tuần',
        tool: 'ChatGPT, Gemini',
        description: 'Lịch tập theo mục tiêu, trình độ và số buổi mỗi tuần.',
        content: `Lập giáo án tập 4 tuần cho: [giới tính], [tuổi] tuổi, trình độ [mới tập / trung bình], mục tiêu [giảm mỡ / tăng cơ / sức bền], tập [số buổi] buổi/tuần, mỗi buổi [số phút] phút, tại [phòng gym / nhà].
Mỗi buổi: khởi động, bài tập chính (số hiệp × số lần, thời gian nghỉ), giãn cơ. Tăng độ khó dần mỗi tuần.
(Người có bệnh lý / chấn thương nên hỏi ý kiến bác sĩ hoặc huấn luyện viên.)`,
      },
      {
        title: 'Bài đăng tuyển hội viên',
        tool: 'ChatGPT',
        description: 'Quảng cáo gói tập hấp dẫn, có ưu đãi và lời kêu gọi.',
        content: `Viết bài quảng cáo phòng gym [tên phòng] tại [địa chỉ]: cơ sở vật chất [mô tả], dịch vụ [PT, yoga, group class…], ưu đãi [ưu đãi] đến [ngày].
Viết 3 phiên bản: nhắm người mới tập, nhân viên văn phòng bận rộn, người muốn giảm cân sau sinh. Mỗi bản dưới 100 chữ, có CTA đăng ký tập thử miễn phí.`,
      },
      {
        title: 'Video động lực tập luyện (AI)',
        tool: 'VEO3, Kling',
        description: 'Cảnh quay thể thao kịch tính cho quảng cáo phòng tập.',
        content: `Cinematic sports shot: [nhân vật: a determined young Vietnamese woman] doing [bài tập: battle ropes] in [bối cảnh: a dark modern gym with dramatic spotlights], sweat flying in slow motion.
Camera: low angle, slow motion, then quick push in to her focused face.
Lighting: high contrast, rim light, moody.
Style: Nike-style motivational commercial.
Audio: heavy breathing, rope impacts, powerful beat.`,
      },
      {
        title: 'Tin nhắn giữ chân hội viên',
        tool: 'ChatGPT',
        description: 'Nhắc hội viên lâu không đến tập, gia hạn gói.',
        content: `Viết 3 tin nhắn cho phòng gym [tên phòng]:
1. Hội viên 2 tuần không đến tập: hỏi thăm, động viên, gợi ý lớp phù hợp
2. Gói tập sắp hết hạn trong 7 ngày: nhắc gia hạn, ưu đãi gia hạn sớm [ưu đãi]
3. Chúc mừng hội viên đạt mục tiêu [mục tiêu]: khen ngợi, mời chia sẻ câu chuyện
Giọng năng lượng, thân thiện, dưới 50 chữ mỗi tin.`,
      },
      {
        title: 'Hướng dẫn kỹ thuật bài tập',
        tool: 'ChatGPT, Claude',
        description: 'Mô tả đúng kỹ thuật, lỗi thường gặp và cách sửa.',
        content: `Hướng dẫn kỹ thuật bài [tên bài tập: squat / deadlift / push-up / plank] cho người mới.
Gồm: nhóm cơ tác động, tư thế chuẩn từng bước, cách thở, 5 lỗi thường gặp và cách sửa, biến thể dễ hơn và khó hơn, số hiệp/lần gợi ý.
Viết ngắn gọn, dễ làm theo, có thể dùng làm lời thoại video hướng dẫn.`,
      },
    ],
  },
  {
    name: 'Ô tô & Xe máy', color: '#475569',
    prompts: [
      {
        title: 'Tin đăng bán xe cũ',
        tool: 'ChatGPT',
        description: 'Tin đăng đầy đủ thông tin, trung thực, tạo niềm tin.',
        content: `Viết tin đăng bán xe: [hãng, dòng xe, đời], số km đã đi [số km], màu [màu], tình trạng [tình trạng], lịch sử bảo dưỡng [chi tiết], giấy tờ [giấy tờ], giá [giá], khu vực [khu vực].
Viết tiêu đề dưới 80 ký tự và nội dung có gạch đầu dòng, nêu rõ ưu điểm và các điểm cần lưu ý (nếu có), lời mời xem xe và lái thử.`,
      },
      {
        title: 'So sánh 2 mẫu xe cho khách',
        tool: 'ChatGPT, Gemini',
        description: 'Bảng so sánh giúp khách chọn xe phù hợp nhu cầu.',
        content: `Khách hàng phân vân giữa [mẫu xe A] và [mẫu xe B], nhu cầu: [đi phố / đi tỉnh / gia đình / kinh doanh], ngân sách [ngân sách].
Lập bảng so sánh: giá lăn bánh tham khảo, động cơ, mức tiêu hao nhiên liệu, trang bị an toàn, tiện nghi, chi phí bảo dưỡng, giữ giá.
Đưa ra gợi ý phù hợp với nhu cầu khách. (Ghi chú: thông số cần đối chiếu lại với hãng.)`,
      },
      {
        title: 'Video giới thiệu xe (AI)',
        tool: 'VEO3, Kling',
        description: 'Cảnh quay xe lăn bánh điện ảnh cho quảng cáo showroom.',
        content: `Cinematic car commercial: [mẫu xe, mô tả bằng tiếng Anh: a red compact SUV] driving along [cung đường: a coastal road in central Vietnam] at sunset, sunlight reflecting on the body.
Camera: drone tracking shot, then low-angle close-up of the front wheel and headlights.
Style: premium automotive advertising, smooth, 4K.
Audio: engine sound, wind, epic music. Keep the car design consistent, no text.`,
      },
      {
        title: 'Nhắc lịch bảo dưỡng định kỳ',
        tool: 'ChatGPT',
        description: 'Tin nhắn chăm sóc khách sau mua, nhắc bảo dưỡng.',
        content: `Viết bộ tin nhắn cho [showroom / garage] [tên]:
1. Cảm ơn khách sau khi nhận xe
2. Nhắc bảo dưỡng định kỳ ([số km] km hoặc [số tháng] tháng), kèm ưu đãi đặt lịch sớm
3. Nhắc kiểm tra xe trước chuyến đi xa dịp lễ Tết
Giọng chuyên nghiệp, thân thiện, dưới 50 chữ mỗi tin.`,
      },
    ],
  },
  {
    name: 'Nông nghiệp & Đặc sản', color: '#65A30D',
    prompts: [
      {
        title: 'Câu chuyện sản phẩm nông sản',
        tool: 'ChatGPT, Claude',
        description: 'Kể chuyện vùng trồng, người nông dân để tăng giá trị sản phẩm.',
        content: `Viết câu chuyện cho sản phẩm [nông sản / đặc sản] từ [vùng trồng].
Thông tin: cách trồng / chế biến [chi tiết], người làm ra sản phẩm [chi tiết], điểm khác biệt [điểm khác biệt], chứng nhận (nếu có) [chứng nhận].
Viết bản 150 chữ cho bao bì / fanpage và bản 50 chữ cho mô tả sàn TMĐT. Giọng mộc mạc, chân thật.`,
      },
      {
        title: 'Video vườn trái cây (AI)',
        tool: 'VEO3, Kling',
        description: 'Cảnh quay thu hoạch chân thực cho video bán nông sản.',
        content: `Authentic farm video: a smiling Vietnamese farmer in a conical hat harvests [nông sản bằng tiếng Anh: ripe durians] in [địa điểm: an orchard in the Mekong Delta] in the early morning, placing them into a bamboo basket.
Camera: handheld close-up of the hands, then medium shot of the farmer.
Lighting: soft golden morning light, dew on the leaves.
Style: documentary, warm and genuine.
Audio: birds, rustling leaves, light folk music.`,
      },
      {
        title: 'Hướng dẫn bảo quản và chế biến',
        tool: 'ChatGPT',
        description: 'Nội dung hữu ích gửi kèm đơn hàng hoặc đăng bài.',
        content: `Viết hướng dẫn bảo quản và 3 cách chế biến / thưởng thức [sản phẩm] để gửi kèm đơn hàng.
Gồm: cách nhận biết sản phẩm ngon, bảo quản nhiệt độ thường / tủ lạnh / tủ đông (thời gian), 3 món ăn hoặc cách dùng đơn giản (nguyên liệu, các bước).
Ngắn gọn, vừa 1 trang A5.`,
      },
      {
        title: 'Kế hoạch bán đặc sản mùa vụ',
        tool: 'ChatGPT, Gemini',
        description: 'Lên kế hoạch bán hàng online cho mùa thu hoạch ngắn.',
        content: `Tôi có [sản lượng] [sản phẩm] thu hoạch trong khoảng [thời gian], giá bán [giá], giao hàng [khu vực].
Lập kế hoạch bán online: nhận đặt trước, kênh bán (Facebook, Zalo, TikTok Shop), nội dung đăng mỗi ngày, cách đóng gói và vận chuyển giữ tươi, xử lý hàng hư hỏng, chăm sóc khách để mùa sau mua lại.`,
      },
      {
        title: 'Thư chào hàng đại lý / cửa hàng',
        tool: 'ChatGPT',
        description: 'Thư giới thiệu sản phẩm và chính sách cho đối tác phân phối.',
        content: `Viết thư chào hàng gửi [cửa hàng thực phẩm sạch / siêu thị mini / đại lý] để giới thiệu sản phẩm [sản phẩm] của [cơ sở sản xuất].
Gồm: giới thiệu cơ sở, sản phẩm và chứng nhận, chính sách chiết khấu [chiết khấu], hỗ trợ vận chuyển, đổi trả, mẫu thử miễn phí, thông tin liên hệ.
Giọng chuyên nghiệp, ngắn gọn trong 1 trang.`,
      },
    ],
  },
  {
    name: 'Văn phòng & Năng suất', color: '#2563EB',
    prompts: [
      {
        title: 'Viết email công việc chuyên nghiệp',
        tool: 'ChatGPT, Claude',
        description: 'Email rõ ràng, lịch sự cho mọi tình huống công việc.',
        content: `Viết email gửi [người nhận, chức vụ] về việc [mục đích email].
Thông tin cần nêu: [các ý chính].
Giọng [trang trọng / thân thiện chuyên nghiệp], dưới 150 chữ, có tiêu đề email rõ ràng, kết thúc bằng hành động cụ thể mong muốn người nhận làm và thời hạn.
Viết thêm 1 phiên bản ngắn hơn để gửi qua Zalo / Teams.`,
      },
      {
        title: 'Tóm tắt cuộc họp thành biên bản',
        tool: 'ChatGPT, Claude',
        description: 'Từ ghi chú lộn xộn thành biên bản có việc cần làm.',
        content: `Đây là ghi chú / bản ghi cuộc họp:
[dán ghi chú]
Hãy viết biên bản họp gồm: thông tin chung (ngày, thành phần), các nội dung đã thảo luận, quyết định đã thống nhất, bảng việc cần làm (Việc | Người phụ trách | Hạn chót), vấn đề còn bỏ ngỏ.
Ngắn gọn, dùng gạch đầu dòng.`,
      },
      {
        title: 'Lập kế hoạch công việc trong tuần',
        tool: 'ChatGPT, Gemini',
        description: 'Sắp xếp ưu tiên theo ma trận khẩn cấp – quan trọng.',
        content: `Đây là danh sách việc tuần này của tôi: [liệt kê công việc, hạn chót nếu có].
Thời gian làm việc: [giờ làm], các cuộc họp cố định: [lịch họp].
Hãy phân loại theo ma trận Eisenhower, sắp lịch cụ thể từng ngày (khung giờ tập trung buổi sáng cho việc quan trọng), và gợi ý việc nên ủy quyền hoặc bỏ bớt.`,
      },
      {
        title: 'Slide thuyết trình từ nội dung có sẵn',
        tool: 'ChatGPT, Gamma, Canva',
        description: 'Chuyển tài liệu dài thành dàn ý slide ngắn gọn.',
        content: `Chuyển nội dung sau thành dàn ý bài thuyết trình [số slide] slide cho [đối tượng nghe], thời lượng [số phút] phút:
[dán nội dung]
Mỗi slide: tiêu đề, 3–4 gạch đầu dòng ngắn (dưới 8 chữ), gợi ý hình ảnh / biểu đồ, lời nói của người thuyết trình.
Slide đầu có câu mở đầu thu hút, slide cuối tóm tắt và kêu gọi hành động.`,
      },
      {
        title: 'Báo cáo công việc tuần / tháng',
        tool: 'ChatGPT',
        description: 'Báo cáo gọn gàng, nêu kết quả và đề xuất.',
        content: `Viết báo cáo công việc [tuần / tháng] gửi [quản lý] từ các thông tin:
- Việc đã hoàn thành: [liệt kê]
- Kết quả số liệu: [số liệu]
- Khó khăn: [khó khăn]
- Kế hoạch kỳ tới: [kế hoạch]
Trình bày ngắn gọn theo các mục, làm nổi bật kết quả, nêu đề xuất cần hỗ trợ cụ thể.`,
      },
      {
        title: 'Chuẩn bị cho buổi phỏng vấn xin việc',
        tool: 'ChatGPT, Claude',
        description: 'Luyện trả lời câu hỏi phỏng vấn theo vị trí ứng tuyển.',
        content: `Tôi ứng tuyển vị trí [vị trí] tại [công ty / ngành]. Kinh nghiệm của tôi: [tóm tắt kinh nghiệm].
Hãy đóng vai nhà tuyển dụng, đưa ra 10 câu hỏi phỏng vấn thường gặp cho vị trí này, gợi ý cách trả lời theo mô hình STAR dựa trên kinh nghiệm của tôi, và 3 câu hỏi tôi nên hỏi lại nhà tuyển dụng.`,
      },
    ],
  },
  {
    name: 'Pháp lý & Hợp đồng', color: '#78716C',
    prompts: [
      {
        title: 'Khung hợp đồng dịch vụ',
        tool: 'ChatGPT, Claude',
        description: 'Bản nháp hợp đồng để tham khảo trước khi nhờ luật sư rà soát.',
        content: `Soạn bản nháp hợp đồng cung cấp dịch vụ [loại dịch vụ] giữa [bên A] và [bên B].
Gồm các điều khoản: phạm vi công việc, thời gian thực hiện, giá trị và phương thức thanh toán, quyền và nghĩa vụ hai bên, nghiệm thu, bảo mật, vi phạm và bồi thường, chấm dứt hợp đồng, giải quyết tranh chấp.
Ghi chú rõ: đây là bản tham khảo, cần luật sư / chuyên gia pháp lý rà soát theo quy định hiện hành trước khi ký.`,
      },
      {
        title: 'Giải thích điều khoản hợp đồng dễ hiểu',
        tool: 'ChatGPT, Claude',
        description: 'Đọc hiểu hợp đồng và phát hiện điều khoản bất lợi.',
        content: `Giải thích bằng ngôn ngữ dễ hiểu các điều khoản sau trong hợp đồng [loại hợp đồng] mà tôi chuẩn bị ký:
[dán điều khoản]
Chỉ ra: nghĩa vụ chính của tôi, rủi ro tiềm ẩn, điều khoản có thể bất lợi, câu hỏi nên hỏi lại đối tác.
(Chỉ mang tính tham khảo, không thay thế tư vấn pháp lý chuyên nghiệp.)`,
      },
      {
        title: 'Chính sách bảo mật & điều khoản website',
        tool: 'ChatGPT, Claude',
        description: 'Khung chính sách cho website bán hàng / khóa học online.',
        content: `Soạn khung "Chính sách bảo mật" và "Điều khoản sử dụng" cho website [loại website: bán hàng / khóa học online] của [tên doanh nghiệp].
Website thu thập: [thông tin thu thập: họ tên, email, số điện thoại…], dùng để [mục đích], thanh toán qua [hình thức].
Viết rõ ràng theo từng mục, dễ hiểu với người dùng. Ghi chú các điểm cần đối chiếu quy định về bảo vệ dữ liệu cá nhân hiện hành.`,
      },
      {
        title: 'Thư yêu cầu / khiếu nại chính thức',
        tool: 'ChatGPT',
        description: 'Văn bản lịch sự, chặt chẽ gửi đối tác hoặc nhà cung cấp.',
        content: `Viết văn bản [yêu cầu thanh toán / khiếu nại chất lượng / đề nghị chấm dứt hợp tác] gửi [bên nhận].
Thông tin: hợp đồng số [số hợp đồng] ký ngày [ngày], vấn đề [mô tả vấn đề], yêu cầu cụ thể [yêu cầu], thời hạn phản hồi [thời hạn].
Giọng chính thức, lịch sự, dẫn chiếu điều khoản liên quan, nêu bước tiếp theo nếu không được phản hồi.`,
      },
    ],
  },
];
