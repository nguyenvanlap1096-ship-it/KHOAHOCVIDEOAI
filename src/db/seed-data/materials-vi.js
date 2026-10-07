// Bản dịch tiếng Việt cho các prompt tiếng Anh của Module 15 / 16 (theo tên bài → tên prompt).
// Hiện ở nút "Tiếng Việt" trên thẻ prompt để học viên hiểu nội dung; khi dùng với công cụ AI nên chép bản EN.
module.exports = {
  // ───────── Module 00 ─────────
  'Quy trình làm một video AI từ A–Z': {
    'Ví dụ hoàn chỉnh – Prompt cảnh 1 (VEO3)': `Video dọc 9:16, cận cảnh, ngang tầm mắt. Một cô gái văn phòng trẻ người Việt mặc áo sơ mi trắng, vẻ mệt mỏi, ngồi ở bàn làm việc trong văn phòng hiện đại sáng sủa, nhìn ly cà phê đá bằng nhựa đã tan hết đá. Cô thở dài và nói bằng tiếng Việt: "Mới 10 giờ sáng mà đá tan sạch rồi?"
Ánh sáng: ánh đèn văn phòng lạnh dịu. Máy quay: đứng yên, xóa phông nhẹ.
Âm thanh: giọng nói rõ, tiếng văn phòng yên tĩnh, không nhạc. Không phụ đề, không chữ trên màn hình.`,
    'Ví dụ hoàn chỉnh – Prompt cảnh 3 (Kling, từ ảnh)': `[Dùng ảnh ly giữ nhiệt thật làm khung hình đầu]
Nắp ly giữ nhiệt từ từ mở ra, để lộ những viên đá bên trong vẫn còn nguyên, hơi lạnh nhẹ nhàng bốc lên từ miệng ly. Nắng chiều chiếu qua cửa sổ.
Máy quay: tiến chậm vào miệng ly.
Giữ nguyên hình dáng, màu sắc và logo của ly giống hệt ảnh gốc.

Negative prompt (cần tránh): méo nhãn, biến hình, thêm vật thể, nhấp nháy, chữ`,
  },

  // ───────── Module 15 ─────────
  'Prompt tạo ảnh': {
    'Ảnh chân dung siêu thực (photorealistic)': `Ảnh chân dung siêu thực của [mô tả người: ví dụ một phụ nữ Việt Nam 28 tuổi, tóc đen ngang vai], mặc [trang phục], [biểu cảm: nụ cười nhẹ tự nhiên], ánh mắt hơi lệch khỏi máy ảnh.
Bối cảnh: [bối cảnh: một quán cà phê ấm cúng ở Hà Nội với nội thất gỗ ấm], hậu cảnh xóa phông nhẹ.
Ánh sáng: ánh sáng cửa sổ mềm từ bên trái, viền sáng nhẹ, màu da tự nhiên.
Máy ảnh: chụp bằng Sony A7 IV, ống kính 85mm f/1.4, độ sâu trường ảnh nông, góc ngang tầm mắt.
Phong cách: ảnh lifestyle kiểu tạp chí, kết cấu da tự nhiên, hạt phim nhẹ, chi tiết cao, nét căng ở mắt.
--ar [tỉ lệ: 4:5] --style raw`,
    'Ảnh phong cảnh điện ảnh': `Ảnh phong cảnh toàn cảnh rộng kiểu điện ảnh ở [địa điểm: ruộng bậc thang Mù Cang Chải] lúc [thời điểm: bình minh giờ vàng], [chi tiết: sương mỏng lơ lửng giữa các đồi, một ngôi nhà gỗ nhỏ ở xa].
Ánh sáng: mặt trời thấp ấm áp, bóng đổ dài mềm, các tia sáng xuyên qua sương.
Máy ảnh: quay bằng ARRI Alexa, ống kính rộng 24mm, nét sâu toàn khung, góc hơi cao.
Màu sắc: xanh lá đậm và vàng ấm, chỉnh màu điện ảnh xanh ngọc – cam.
Phong cách: nhiếp ảnh National Geographic, siêu chi tiết, 8K, chiều sâu không khí.
--ar 16:9`,
    'Ảnh sản phẩm trên nền studio': `Ảnh sản phẩm chụp studio chuyên nghiệp của [tên sản phẩm: một chai serum trà xanh cao cấp bằng thủy tinh] đặt trên [bề mặt: bệ đá cẩm thạch trắng mịn], xung quanh có [đạo cụ: lá trà xanh tươi và giọt nước].
Nền: dải màu chuyển liền mạch [màu nền: xanh xô thơm nhạt].
Ánh sáng: đèn softbox lớn chiếu chính từ trên bên trái, phản chiếu nhẹ trên thủy tinh, điểm sáng sắc nét, bóng mềm dưới sản phẩm.
Máy ảnh: ống macro 100mm, f/8, góc chéo 3/4 phía trước, sản phẩm ở chính giữa và nét hoàn toàn.
Phong cách: quảng cáo thương mại cao cấp, sạch sẽ, tối giản, thẩm mỹ thương hiệu mỹ phẩm sang trọng.
--ar [tỉ lệ: 1:1]`,
    'Ảnh minh họa phong cách 3D Pixar': `Ảnh minh họa nhân vật hoạt hình 3D phong cách Pixar / Disney: [nhân vật: một cậu bé Việt Nam vui vẻ quàng khăn đỏ] [hành động: cầm chiếc đèn lồng giấy phát sáng], đứng trong [bối cảnh: một con phố Hội An rực rỡ đèn lồng về đêm].
Mắt to biểu cảm, khối hình tròn mềm mại, nét mặt ấm áp thân thiện.
Ánh sáng: ánh đèn lồng ấm, chiếu sáng toàn cục mềm, đốm sáng bokeh nhẹ ở hậu cảnh.
Kết xuất: render 3D chất lượng cao, hiệu ứng tán xạ dưới da, màu sắc rực rỡ mà hài hòa, kết cấu siêu chi tiết.
--ar [tỉ lệ: 9:16]`,
    'Ảnh nền (background) cho video có chỗ chèn chữ': `Ảnh nền sạch cho thumbnail video: [chủ đề: góc làm việc hiện đại tối giản với laptop và tách cà phê], bố cục ở phía [vị trí: bên phải] khung hình, chừa khoảng trống lớn ở phía [vị trí trống: bên trái] để chèn chữ.
Bảng màu: [bảng màu: be nhạt, trắng và xanh dương dịu].
Ánh sáng: ánh sáng ban ngày mềm và sáng, không khí thoáng đãng, độ tương phản thấp.
Phong cách: tối giản, cao cấp, chuyên nghiệp, ảnh chụp thật.
--ar 16:9 --no chữ, ký tự, watermark`,
    'Ảnh có chữ (poster / thumbnail) – dùng Ideogram': `Thiết kế thumbnail YouTube nổi bật với dòng tiêu đề lớn "[tiêu đề ngắn, tối đa 5 chữ]" dùng [kiểu chữ: phông không chân dày màu trắng viền đen], đặt ở góc trên bên trái.
Bên phải: [chủ thể: một chàng trai ngạc nhiên đang chỉ tay vào dòng chữ], biểu cảm đầy năng lượng.
Nền: [nền: dải màu rực rỡ từ tím sang cam với các vệt sáng].
Phong cách: tương phản cao, bắt mắt, bố cục gọn gàng, thumbnail YouTube chuyên nghiệp.
Tỉ lệ khung hình 16:9.`,
    'Ảnh phong cách anime / hoạt hình 2D': `Tranh minh họa phong cách anime, [nhân vật: một cô gái tóc bạc dài mặc đồng phục học sinh], [hành động: đứng trên sân thượng nhìn ra thành phố], [bối cảnh: đường chân trời thành phố kiểu Tokyo lúc chạng vạng với mây hồng và tím].
Phong cách: lấy cảm hứng từ Makoto Shinkai, hậu cảnh rất chi tiết, bầu trời rực sáng, ánh sáng điện ảnh, lóe sáng ống kính nhẹ.
Cảm xúc: [cảm xúc: hoài niệm và đầy hy vọng].
--ar [tỉ lệ: 16:9] --niji 6`,
    'Prompt gốc (template) tự điền': `[Chủ thể chính + đặc điểm nhận dạng], [hành động / tư thế], [trang phục / chất liệu].
Bối cảnh: [bối cảnh + thời gian trong ngày + thời tiết].
Ánh sáng: [kiểu ánh sáng: ánh sáng ban ngày mềm / neon / giờ vàng / softbox studio].
Máy ảnh: [góc máy: ngang tầm mắt / góc thấp / từ trên xuống], [ống kính: 24mm / 50mm / 85mm], [độ sâu: xóa phông].
Phong cách: [phong cách: ảnh thật / điện ảnh / 3D Pixar / anime / màu nước].
Màu sắc: [tông màu chủ đạo].
Chất lượng: siêu chi tiết, nét căng, độ phân giải cao.
--ar [tỉ lệ] --no [những thứ không muốn xuất hiện: chữ, watermark, thừa ngón tay]`,
  },

  'Prompt nhân vật': {
    'Thẻ mô tả nhân vật (dán vào mọi prompt)': `NHÂN VẬT: [Tên nhân vật], [giới tính] [quốc tịch: Việt Nam] [tuổi] tuổi, [dáng người: mảnh khảnh, chiều cao trung bình], [khuôn mặt: mặt trái xoan, đường hàm mềm, mũi nhỏ], [mắt: mắt hạnh nhân màu nâu sẫm], [tóc: tóc đen thẳng buộc đuôi ngựa thấp], [đặc điểm nhận dạng: một nốt ruồi nhỏ dưới mắt trái].
TRANG PHỤC: [trang phục cố định: áo khoác oversize màu vàng mù tạt bên ngoài áo thun trắng, quần jean xanh nhạt, giày sneaker trắng].
TÍNH CÁCH (thể hiện qua biểu cảm): [tính cách: vui vẻ, tự tin, năng động].`,
    'Character sheet nhiều góc nhìn': `Bảng tham chiếu nhân vật của [dán thẻ mô tả nhân vật], toàn thân, thể hiện nhiều góc nhìn: chính diện, chéo 3/4, nghiêng một bên, phía sau, kèm 3 cận cảnh biểu cảm khuôn mặt (vui, ngạc nhiên, nghiêm túc).
Nền xám nhạt trung tính, ánh sáng studio đều, tỉ lệ cơ thể và trang phục nhất quán ở mọi góc.
Phong cách: [phong cách: ảnh thật / 3D Pixar / anime], gọn gàng, chi tiết cao, bố cục bảng thiết kế nhân vật.
--ar 16:9`,
    'Ảnh gốc chân dung để làm reference': `Ảnh chân dung chính diện của [dán thẻ mô tả nhân vật], từ đầu đến vai, nhìn thẳng vào máy ảnh, nét mặt thư thái trung tính.
Nền xám mềm trơn, ánh sáng studio mềm đều, không có bóng gắt.
Chụp ống 85mm, f/2.8, nét căng ở khuôn mặt, kết cấu da tự nhiên, siêu chân thực.
--ar 1:1 --style raw`,
    'Đưa nhân vật vào cảnh mới (giữ đồng nhất)': `[Dán thẻ mô tả nhân vật], [hành động mới: đi dạo qua khu chợ đêm đông đúc, tay cầm ly trà sữa], [biểu cảm: mỉm cười và tò mò nhìn xung quanh].
Bối cảnh: [bối cảnh: chợ đêm Bến Thành ở Sài Gòn, các sạp hàng nhiều màu sắc, dây đèn trang trí].
Ánh sáng: đèn neon ấm và dây đèn, ánh sáng dịu trên khuôn mặt.
Máy ảnh: trung cảnh, ống 35mm, ngang tầm mắt, cảm giác cầm tay nhẹ.
Giữ chính xác khuôn mặt, kiểu tóc và trang phục giống ảnh tham chiếu.
--ar 9:16 --cref [link ảnh gốc] --cw 100`,
    'Nhân vật hoạt hình kể chuyện (3D)': `Nhân vật 3D phong cách Pixar: [tên], [mô tả: một chú mèo cam mũm mĩm đeo chiếc ba lô nhỏ màu xanh], mắt tròn to màu xanh lá, lông xù mềm, lông mày biểu cảm.
Tư thế: [tư thế: đứng bằng hai chân và vui vẻ vẫy tay].
Nền: nền trơn màu pastel [màu] để làm tham chiếu.
Kết xuất: ánh sáng mềm, 3D chất lượng cao, thiết kế nhất quán phù hợp cho loạt phim hoạt hình thiếu nhi.
Tạo góc chính diện, nghiêng và sau lưng trên cùng một bảng.
--ar 16:9`,
    'Nhân vật KOL / người dẫn chương trình ảo': `Người dẫn chương trình ảo chuyên nghiệp: [dán thẻ mô tả nhân vật], mặc [trang phục: áo blazer xanh navy bên ngoài áo sơ mi trắng], đứng trong [bối cảnh: studio hiện đại sáng sủa với màn hình LED xóa phông phía sau].
Tư thế: hướng về máy quay, tay cử chỉ nhẹ như đang giải thích, nụ cười tự tin thân thiện.
Ánh sáng: ánh sáng studio 3 điểm mềm, sạch và tôn dáng.
Máy ảnh: trung cảnh từ thắt lưng trở lên, ống 50mm, ngang tầm mắt.
Phong cách: ảnh thật, chất lượng truyền hình.
--ar 9:16`,
    'Prompt video: nhân vật nói chuyện (VEO3)': `Cảnh cận trung của [dán thẻ mô tả nhân vật], ngồi [bối cảnh: tại bàn gỗ trong phòng làm việc tại nhà sáng sủa], nhìn thẳng vào máy quay và nói chuyện tự nhiên với cử chỉ tay thân thiện.
Cô ấy nói bằng tiếng Việt: "[câu thoại ngắn, dưới 20 từ]"
Máy quay: đứng yên, ngang tầm mắt, xóa phông nhẹ.
Ánh sáng: ánh sáng cửa sổ tự nhiên mềm.
Âm thanh: giọng nói rõ, tiếng phòng yên tĩnh, không nhạc nền.
Không phụ đề, không chữ trên màn hình.`,
  },

  'Prompt sản phẩm': {
    'Ảnh mỹ phẩm sang trọng': `Ảnh chụp sản phẩm mỹ phẩm sang trọng: [sản phẩm: hũ kem dưỡng da thủy tinh mờ nắp vàng] đặt trên [bề mặt: đá đen ướt], xung quanh có [đạo cụ: cánh lan trắng mỏng manh và những giọt nước nhỏ].
Nền: màu [màu: xanh ngọc lục bảo] đậm chuyển sắc mềm.
Ánh sáng: ánh sáng bên kịch tính, điểm sáng bóng trên thủy tinh, phản chiếu ánh vàng tinh tế, bóng mềm.
Máy ảnh: macro 100mm, f/11, ngang tầm mắt, sản phẩm ở giữa và cực nét.
Phong cách: quảng cáo làm đẹp cao cấp, thanh lịch, sang trọng.
--ar 4:5 --no chữ`,
    'Ảnh đồ uống bắn nước (splash)': `Ảnh quảng cáo tốc độ cao của [sản phẩm: một lon soda chanh lạnh] với [hiệu ứng: tia nước có ga và đá viên bắn tung tóe] xung quanh, [trái cây: lát chanh tươi và lá bạc hà] bay trong không khí.
Nền: dải màu sáng [màu: xanh chanh sang vàng].
Ánh sáng: đèn ngược mạnh làm giọt nước phát sáng, viền sáng sắc nét trên lon, giọt nước đọng trên bề mặt.
Máy ảnh: tốc độ 1/8000s đóng băng chuyển động, ống 70mm, góc hơi thấp.
Phong cách: quảng cáo đồ uống năng động, siêu chi tiết, rực rỡ.
--ar 9:16`,
    'Ảnh thời trang mặc trên người mẫu': `Ảnh thời trang thương mại điện tử: [người mẫu: một người mẫu nữ trẻ Việt Nam] mặc [sản phẩm: váy sơ mi linen oversize màu be cài cúc gỗ], [tư thế: đứng tự nhiên, một tay đút túi], thấy toàn thân.
Nền: [nền: tường studio trắng ngà ấm] / [hoặc: một con phố đầy nắng ở Đà Lạt].
Ánh sáng: ánh sáng ban ngày khuếch tán mềm, màu và chất vải trung thực.
Máy ảnh: ống 50mm, ngang tầm mắt, khung toàn thân có khoảng trống xung quanh.
Phong cách: catalog thời trang tối giản, tự nhiên, nếp vải chân thực.
--ar 3:4`,
    'Ảnh đồ ăn hấp dẫn (food)': `Ảnh món ăn hấp dẫn của [món ăn: một tô phở bò Việt Nam bốc khói với rau thơm, chanh và ớt], đặt trên [bề mặt: bàn gỗ mộc mạc], [đạo cụ: đôi đũa, đĩa giá đỗ nhỏ, hơi nóng bốc lên nhẹ].
Ánh sáng: ánh sáng cửa sổ ấm chiếu bên, điểm sáng đậm trên nước dùng, ánh lên ngon mắt.
Máy ảnh: góc 45 độ, ống 50mm, xóa phông, lấy nét vào lát thịt bò.
Phong cách: ảnh thực đơn nhà hàng chuyên nghiệp, ấm áp, mời gọi, siêu chi tiết.
--ar 4:5`,
    'Ảnh đồ công nghệ': `Ảnh sản phẩm công nghệ tinh tế: [sản phẩm: tai nghe không dây trong hộp sạc trắng nhám], hộp mở hé, một bên tai nghe lơ lửng phía trên.
Nền: màu [màu: xanh navy] tối với các đường sáng [màu ánh sáng: xanh lơ] mờ.
Ánh sáng: viền sáng chính xác, phản chiếu mềm trên bề mặt bóng, không khí tương lai.
Máy ảnh: 85mm, góc thấp, bố cục tôn vinh sản phẩm.
Phong cách: quảng cáo công nghệ tối giản kiểu Apple, sạch, cao cấp, cực nét.
--ar 16:9 --no chữ`,
    'Video sản phẩm xoay 360° (image-to-video)': `[Dùng ảnh sản phẩm làm khung hình đầu]
Sản phẩm xoay chậm 360 độ trên bàn xoay, chuyển động mượt và đều. Máy quay đứng yên ngang tầm mắt.
Ánh sáng studio mềm với phản chiếu di chuyển nhẹ trên bề mặt. Nền giữ sạch và không thay đổi.
Giữ nguyên hình dáng, nhãn và logo sản phẩm giống hệt ảnh gốc. Không biến dạng, không thêm vật thể.
Thời lượng: 5 giây, cảm giác chuyển động chậm.`,
    'Video sản phẩm – camera tiến sát (hero shot)': `Cảnh giới thiệu sản phẩm điện ảnh: máy quay tiến chậm từ toàn cảnh vào cận cảnh [sản phẩm] đứng trên [bề mặt], trong khi [hiệu ứng: làn sương mềm trôi ngang mặt bàn và các hạt sáng nhỏ lơ lửng trong không khí].
Ánh sáng: tông tối có chiều sâu, đèn spot mềm chiếu vào sản phẩm, viền phát sáng.
Máy quay: dolly in mượt, xóa phông, khóa nét vào sản phẩm.
Phong cách: quảng cáo truyền hình sang trọng, quay chậm, điện ảnh 24fps.
Giữ nguyên thiết kế và nhãn sản phẩm.`,
    'Flatlay sản phẩm (chụp từ trên xuống)': `Ảnh flat lay chụp từ trên xuống của [sản phẩm chính] sắp xếp gọn gàng cùng [phụ kiện liên quan: cuốn sổ, cặp kính râm, chậu cây nhỏ, tách cà phê] trên [nền: giấy màu hồng pastel].
Bố cục: cân đối, nhiều khoảng trống, sản phẩm ở giữa.
Ánh sáng: ánh sáng ban ngày sáng đều, bóng mềm.
Phong cách: flat lay lifestyle kiểu Instagram, sạch, hợp xu hướng, độ phân giải cao.
--ar 1:1`,
  },

  'Prompt VEO3': {
    'Người bán hàng giới thiệu sản phẩm (có thoại)': `Trung cảnh, ngang tầm mắt. Một phụ nữ Việt Nam thân thiện gần 30 tuổi, tóc đen dài, mặc áo sơ mi trắng, đứng sau quầy gỗ sạch sẽ trong một cửa hàng hiện đại sáng sủa. Cô giơ [sản phẩm] về phía máy quay và mỉm cười.
Cô nói bằng tiếng Việt với giọng hào hứng, ấm áp: "[câu thoại: Đây là chai serum mình dùng mỗi tối, da mịn hẳn sau hai tuần!]"
Ánh sáng: ánh sáng ban ngày sáng mềm, phong cách quảng cáo sạch sẽ.
Máy quay: đứng yên, xóa phông, lấy nét vào khuôn mặt và sản phẩm.
Âm thanh: giọng nói rõ, tiếng cửa hàng nhẹ, không nhạc nền.
Không phụ đề, không chữ trên màn hình.`,
    'Phỏng vấn đường phố (street interview)': `Cảnh phỏng vấn đường phố cầm tay trên vỉa hè đông đúc ở [thành phố: Sài Gòn] lúc chiều muộn. Một chàng trai Việt Nam mặc áo thun giản dị đưa micro về phía [người được hỏi: một phụ nữ trung niên vui vẻ đội nón lá].
Người phỏng vấn hỏi bằng tiếng Việt: "[câu hỏi ngắn]"
Cô ấy cười và trả lời bằng tiếng Việt: "[câu trả lời ngắn]"
Máy quay: cầm tay, hơi rung, phong cách vlog, ống 28mm.
Âm thanh: tiếng đường phố tự nhiên, xe máy phía sau, lời thoại rõ.
Không phụ đề.`,
    'Cảnh điện ảnh không thoại': `Toàn cảnh điện ảnh: [chủ thể: một ngư dân đơn độc] chèo chiếc thuyền gỗ nhỏ qua [bối cảnh: mặt hồ mờ sương bao quanh bởi núi đá vôi ở Ninh Bình] lúc bình minh.
Máy quay lướt chậm về phía trước, sát mặt nước.
Ánh sáng: ánh bình minh xanh dịu chuyển dần sang vàng, sương mỏng trên mặt nước, phản chiếu nhẹ.
Phong cách: điện ảnh, chất phim 35mm, chậm rãi và yên bình.
Âm thanh: tiếng nước gợn nhẹ, chim hót xa xa, gió nhẹ. Không thoại, không nhạc.`,
    'Vlog nói trước camera (selfie)': `Video dọc kiểu selfie: [nhân vật: một cô gái trẻ Việt Nam tóc bob ngắn] cầm điện thoại ngang tầm tay vừa đi vừa quay trong [bối cảnh: một công viên đầy nắng với hàng cây cao].
Cô hào hứng nói với máy quay bằng tiếng Việt: "[câu thoại: Hôm nay mình sẽ chỉ các bạn 3 mẹo làm video AI siêu nhanh!]"
Máy quay: camera trước của điện thoại, tay rung nhẹ tự nhiên, khung 9:16.
Ánh sáng: ánh sáng ban ngày tự nhiên, nắng lóe qua tán lá.
Âm thanh: giọng cô rõ ràng, tiếng chim và gió nhẹ. Không nhạc nền, không phụ đề.`,
    'Hội thoại 2 nhân vật': `Trung cảnh hai người bên trong [bối cảnh: một quán cà phê nhỏ ấm cúng ánh đèn vàng]. Bên trái là [nhân vật A: một chàng trai mặc áo hoodie xám]; bên phải là [nhân vật B: một cô gái mặc áo cardigan đỏ]. Họ ngồi đối diện nhau qua chiếc bàn nhỏ có hai tách cà phê.
Chàng trai nói bằng tiếng Việt: "[câu thoại A]"
Cô gái mỉm cười đáp bằng tiếng Việt: "[câu thoại B]"
Máy quay: đứng yên, ngang tầm mắt, xóa phông nhẹ.
Âm thanh: lời thoại rõ, tiếng quán cà phê nhẹ nhàng, tiếng tách chạm khẽ. Không nhạc, không phụ đề.`,
    'Quảng cáo đồ ăn (âm thanh ASMR)': `Đặc tả, quay chậm: [món ăn: một miếng gà rán vàng giòn] được nhấc lên khỏi rổ, nước sốt nhỏ giọt, hơi nóng bốc lên.
Sau đó một người cắn một miếng thật to giòn rụm.
Ánh sáng: ấm áp, ngon mắt, điểm sáng bóng bẩy.
Máy quay: ống macro, dolly in chậm.
Âm thanh: tiếng giòn rụm ASMR thật lớn đã tai, tiếng xèo xèo, không giọng nói, không nhạc.
Không chữ trên màn hình.`,
    'Template prompt VEO3 tự điền': `[Loại cảnh quay: trung cảnh / cận cảnh / toàn cảnh], [góc máy: ngang tầm mắt / góc thấp / từ trên xuống].
[Mô tả nhân vật: tuổi, giới tính, ngoại hình, trang phục] [hành động cụ thể] trong [bối cảnh chi tiết].
[Nhân vật] nói bằng tiếng Việt với giọng [giọng điệu: ấm áp / hào hứng / nghiêm túc]: "[câu thoại 15–20 từ]"
Ánh sáng: [ánh sáng].
Chuyển động máy quay: [đứng yên / dolly in chậm / cầm tay / xoay quanh].
Phong cách: [phong cách: quảng cáo chân thực / điện ảnh / vlog].
Âm thanh: [âm thanh nền + hiệu ứng], [không nhạc nền].
Không phụ đề, không chữ trên màn hình.`,
  },

  'Prompt Kling': {
    'Image-to-video: chân dung sống động': `[Nhân vật] từ từ quay đầu về phía máy quay và nở nụ cười nhẹ, mái tóc khẽ bay trong gió. Cô ấy chớp mắt tự nhiên.
Máy quay: tiến vào rất chậm.
Ánh sáng giữ nhất quán, mềm và ấm.
Chân thực, chuyển động tự nhiên tinh tế.

Negative prompt (những thứ cần tránh): mặt biến dạng, biến hình, thừa ngón tay, nhấp nháy, mờ, chữ, watermark`,
    'Text-to-video: người mẫu catwalk thời trang': `Một người mẫu nữ Việt Nam cao ráo mặc [trang phục: áo dài lụa đỏ bay bổng] tự tin bước về phía máy quay trên [bối cảnh: sàn diễn trắng tối giản], vạt áo tung bay thanh lịch theo từng bước chân.
Máy quay: lùi chậm theo người mẫu ngang tầm mắt, giữ cô ở giữa khung.
Ánh sáng: đèn sân khấu thời trang sáng rực, bóng mềm.
Phong cách: phim thời trang cao cấp, điện ảnh, 4K, chuyển động mượt.

Negative prompt: tay biến dạng, dáng đi không tự nhiên, quần áo biến hình, mờ, chữ`,
    'Sản phẩm bay ra khỏi hộp (start + end frame)': `Khung đầu: hộp quà đóng kín trên bàn. Khung cuối: [sản phẩm] lơ lửng phía trên hộp đã mở.
Nắp hộp bật mở, ánh sáng vàng dịu bừng lên, [sản phẩm] từ từ bay lên và lơ lửng phía trên hộp trong khi các hạt lấp lánh xoáy quanh.
Máy quay: tiến vào chậm nhẹ.
Phong cách: quảng cáo kỳ ảo, mượt mà, cao cấp.

Negative prompt: thay đổi hình dạng sản phẩm, méo nhãn, nhấp nháy, thêm vật thể`,
    'Cảnh hành động – chạy trong mưa': `Một chàng trai mặc áo khoác đen chạy qua [bối cảnh: con hẻm ngập ánh neon trong đêm mưa], giẫm tung nước trên các vũng, mưa rơi nặng hạt, ánh neon phản chiếu trên mặt đất ướt.
Máy quay: cầm tay bám theo từ bên cạnh, nhòe chuyển động nhẹ.
Ánh sáng: neon hồng và xanh, viền sáng mạnh, tương phản điện ảnh.
Phong cách: phim hành động, kịch tính, 24fps.

Negative prompt: cơ thể biến dạng, thừa chân, chuyển động đứng hình, mặt mờ`,
    'Động vật đáng yêu (viral)': `Một [con vật: chú chó golden retriever con] lông xù [hành động: đeo kính râm tí hon, ngồi trên ván lướt và lướt một con sóng nhỏ] ở [bối cảnh: bãi biển nhiệt đới đầy nắng], đuôi vẫy vui vẻ.
Máy quay: góc thấp bám theo, nước bắn về phía ống kính.
Ánh sáng: nắng trưa rực rỡ, mặt nước lấp lánh.
Phong cách: hài hước, chân thực, chi tiết cao, chuyển động mượt.

Negative prompt: con vật biến dạng, thừa chân, biến hình, mờ`,
    'Cảnh thiên nhiên timelapse': `Timelapse cảnh [bối cảnh: mây cuộn qua các đỉnh núi Fansipan], mây trôi nhanh như sóng, ánh nắng chuyển từ sáng sớm sang chiều vàng, bóng đổ quét qua các thung lũng.
Máy quay: toàn cảnh đứng yên trên chân máy.
Phong cách: phim tài liệu thiên nhiên điện ảnh, siêu chi tiết, 4K.

Negative prompt: nhấp nháy, rung giật, địa hình biến dạng`,
    'Hoạt hình 3D cho trẻ em': `Hoạt hình 3D phong cách Pixar: [nhân vật: một chú mèo cam nhỏ đeo ba lô xanh] tung tăng nhảy chân sáo trên [bối cảnh: con đường rừng đầy màu sắc với những cây nấm khổng lồ], rồi dừng lại và vẫy tay chào máy quay.
Máy quay: bám theo mượt mà, sau đó tiến vào nhẹ.
Ánh sáng: nắng ấm mềm, các hạt sáng kỳ ảo lơ lửng.
Phong cách: phim hoạt hình thiếu nhi, màu sắc rực rỡ, chuyển động hoạt hình nảy tưng tưng.

Negative prompt: phong cách ảnh thật, mặt biến dạng, nhấp nháy`,
    'Template prompt Kling tự điền': `[Chủ thể + đặc điểm ngắn gọn] [chuyển động chính, một hành động] trong [bối cảnh].
[Chuyển động phụ: tóc bay, khói, nước, lá rơi…].
Máy quay: [đứng yên / tiến vào chậm / bám theo / xoay quanh / cần cẩu nâng lên].
Ánh sáng: [ánh sáng].
Phong cách: [phong cách], chuyển động mượt tự nhiên.

Negative prompt: mờ, mặt biến dạng, thừa chân tay, biến hình, nhấp nháy, chữ, watermark`,
  },

  'Prompt Camera': {
    'Dolly in / Push in – tiến chậm vào chủ thể': `Máy quay: dolly in chậm và mượt từ trung cảnh vào cận cảnh [chủ thể], giữ chủ thể ở giữa, xóa phông, hậu cảnh mờ dần.
Ví dụ: Máy quay tiến chậm mượt về phía một cô gái đang đọc thư bên cửa sổ, kết thúc ở cận cảnh đôi mắt rưng rưng, ánh sáng ấm dịu.`,
    'Pull out / Dolly out – lùi ra hé lộ bối cảnh': `Máy quay: lùi chậm, bắt đầu từ cận cảnh [chi tiết] rồi kéo ra để hé lộ [toàn cảnh].
Ví dụ: Bắt đầu với cận cảnh tách cà phê bốc khói, máy quay từ từ lùi ra để hé lộ quán cà phê sân thượng ấm cúng nhìn xuống thành phố lúc hoàng hôn.`,
    'Orbit / Arc shot – xoay vòng quanh chủ thể': `Máy quay: xoay vòng 180 độ mượt quanh [chủ thể] ngang tầm mắt, khoảng cách không đổi, tốc độ đều.
Ví dụ: Xoay vòng mượt quanh chai nước hoa sang trọng đứng trên mặt kính đen, ánh phản chiếu trượt trên bề mặt chai, viền sáng kịch tính.`,
    'Tracking shot – đi theo chủ thể': `Máy quay: bám theo ổn định [chủ thể] từ [vị trí: phía sau / bên cạnh / phía trước] khi họ [hành động], giữ nguyên khoảng cách.
Ví dụ: Máy quay bám ngang ổn định theo một người đạp xe dọc đường ven biển lúc giờ vàng, mặt biển lấp lánh phía sau.`,
    'Crane up / Drone – nâng cao toàn cảnh': `Máy quay: cần cẩu nâng lên / drone bay lên từ mặt đất lên góc nhìn trên cao, hé lộ [toàn cảnh].
Ví dụ: Máy quay bay lên từ một quầy hàng ăn đường phố nhộn nhịp lên bầu trời, hé lộ toàn cảnh phố cổ Hà Nội rực sáng về đêm.`,
    'FPV drone – bay xuyên tốc độ cao': `Máy quay: drone FPV bay nhanh, sát thấp và lao xuyên qua [bối cảnh], những cú ngoặt rộng, nhòe chuyển động mạnh.
Ví dụ: Drone FPV bay nhanh qua hẻm núi có dòng sông hẹp, lướt sát mặt nước, rồi vút lên để hé lộ một thác nước.`,
    'Pan / Tilt – lia ngang, lia dọc': `Máy quay: lia ngang chậm từ trái sang phải qua [bối cảnh]. / Máy quay: lia dọc chậm từ [phần dưới] lên [phần trên].
Ví dụ: Lia dọc chậm từ đôi giày cao gót đỏ lên khuôn mặt cô gái khi cô quay lại mỉm cười, ánh đèn đường buổi tối thanh lịch.`,
    'Handheld / POV – cầm tay, góc nhìn thứ nhất': `Máy quay: cầm tay, rung nhẹ tự nhiên, góc nhìn thứ nhất qua mắt [nhân vật] khi họ [hành động].
Ví dụ: Cảnh POV cầm tay bước vào khu chợ đêm đông đúc, đôi tay vươn ra cầm lấy một xiên thịt nướng.`,
    'Whip pan / Crash zoom – chuyển cảnh nhanh': `Máy quay: lia vụt nhanh sang phải với nhòe chuyển động mạnh, hé lộ [chủ thể mới]. / Máy quay: zoom giật đột ngột vào [chi tiết].
Ví dụ: Zoom giật đột ngột vào khuôn mặt ngạc nhiên của một người đàn ông đang mở hộp hàng, tạo nhịp hài hước.`,
  },

  'Prompt quảng cáo': {
    'Cảnh 1 – Hook nêu vấn đề': `Cận cảnh một cô gái trẻ Việt Nam bực bội nhìn vào gương phòng tắm, chạm vào [vấn đề: làn da khô bong tróc], thở dài.
Cô nói bằng tiếng Việt: "[câu hook: Da khô bong tróc dù đã thử đủ loại kem?]"
Ánh sáng: ánh đèn phòng tắm lạnh và phẳng, màu hơi nhạt để thể hiện vấn đề.
Máy quay: đứng yên, quay qua hình phản chiếu trong gương.
Âm thanh: tiếng phòng tắm yên tĩnh, giọng cô rõ ràng. Không phụ đề.`,
    'Cảnh 2 – Giới thiệu giải pháp (sản phẩm xuất hiện)': `Cũng cô gái đó mở ngăn kéo và cầm lên [sản phẩm], gương mặt bừng sáng vẻ tò mò. Sản phẩm được quay cận cảnh sạch sẽ với vầng sáng dịu.
Máy quay: tiến vào mượt mà vào sản phẩm trên tay cô.
Ánh sáng: chuyển từ lạnh sang ấm, sáng sủa và đầy hy vọng.
Âm thanh: hiệu ứng "ding" nhẹ, nhạc nhẹ nhàng tươi sáng bắt đầu. Không phụ đề.`,
    'Cảnh 3 – Trải nghiệm / Demo sản phẩm': `Đặc tả macro: [hành động dùng sản phẩm: một giọt serum rơi lên đầu ngón tay rồi được massage nhẹ nhàng lên làn da căng bóng], thấy rõ kết cấu, ánh sáng phản chiếu trên da.
Máy quay: quay chậm, ống macro, xóa phông.
Ánh sáng: ánh sáng làm đẹp ấm và mềm.
Âm thanh: tiếng ASMR nhẹ của sản phẩm, nhạc êm. Không chữ.`,
    'Cảnh 4 – Kết quả / Before–After': `Cận trung cũng cô gái đó, giờ có [kết quả: làn da khỏe mạnh, căng bóng, đủ ẩm], tự tin mỉm cười với máy quay trong nắng sớm bên cửa sổ.
Cô nói bằng tiếng Việt: "[câu thoại kết quả: Chỉ sau 7 ngày, da mình mềm mịn hẳn luôn!]"
Máy quay: đứng yên, ngang tầm mắt, ánh sáng mềm tôn da.
Âm thanh: giọng nói rõ, nhạc tươi vui. Không phụ đề.`,
    'Cảnh 5 – CTA kêu gọi mua hàng': `Cô gái cầm [sản phẩm] cạnh khuôn mặt, chỉ tay vào sản phẩm và nháy mắt với máy quay.
Cô hào hứng nói bằng tiếng Việt: "[CTA: Đang giảm 30% hôm nay, bấm vào giỏ hàng ngay nhé!]"
Nền: sáng, sạch, màu thương hiệu [màu thương hiệu].
Máy quay: trung cảnh, đứng yên.
Âm thanh: nhạc sôi động kết thúc, giọng rõ. Chừa khoảng trống phía dưới để chèn chữ giá. Không phụ đề.`,
    'Quảng cáo kiểu TVC sang trọng (không thoại)': `Quảng cáo truyền hình sang trọng cho [sản phẩm]: các cảnh quay chậm [yếu tố gợi cảm xúc: dải lụa bay, chất lỏng vàng óng xoáy tròn, ánh sáng phản chiếu trên thủy tinh], kết thúc bằng sản phẩm đứng một mình trên mặt phản chiếu tối dưới một luồng đèn spot duy nhất.
Máy quay: dolly in chậm, chi tiết macro, chuyển cảnh thanh lịch.
Ánh sáng: tông tối kịch tính, điểm sáng vàng.
Âm thanh: nhạc giao hưởng thanh lịch với tiếng bass trầm nhấn mạnh. Không thoại, không chữ.`,
  },

  'Prompt Affiliate': {
    'Unbox sản phẩm (POV tay mở hộp)': `Cảnh POV từ trên xuống: hai bàn tay đang mở hộp [sản phẩm] trên [bề mặt: bàn làm việc trắng sạch sẽ cạnh laptop và chậu cây nhỏ]. Đôi tay từ từ bóc băng keo, mở hộp, lấy giấy lót ra và nâng sản phẩm về phía máy quay, xoay để khoe chi tiết.
Ánh sáng: ánh sáng ban ngày sáng mềm, thẩm mỹ sạch sẽ.
Máy quay: đứng yên từ trên cao, sau đó nghiêng nhẹ để hé lộ sản phẩm.
Âm thanh: tiếng ASMR mở hộp đã tai: bóc băng keo, sột soạt giấy. Không giọng nói, không nhạc, không chữ.`,
    'Review chân thật kiểu UGC (có thoại)': `Video selfie dọc: một [nhân vật: phụ nữ Việt Nam ngoài 30, mặc đồ ở nhà giản dị] ngồi trên sofa trong phòng khách ấm cúng, giơ [sản phẩm] lên trước máy quay.
Cô nói bằng tiếng Việt với giọng tự nhiên, chân thật: "[câu thoại: Mua thử con máy này 299 nghìn mà xài sướng thật, để mình chỉ các bạn nha.]"
Máy quay: camera trước điện thoại, cầm tay, chuyển động nhẹ.
Ánh sáng: ánh sáng cửa sổ tự nhiên, không khí gia đình ấm áp.
Âm thanh: giọng rõ, phòng yên tĩnh. Không nhạc, không phụ đề.`,
    'Demo tính năng sản phẩm': `Cận cảnh trình diễn [sản phẩm: máy hút bụi cầm tay mini] [hành động: hút sạch vụn bánh quy trên ghế sofa tối màu chỉ trong một lượt], vùng bẩn trở nên sạch hoàn toàn.
Máy quay: cận cảnh, đứng yên, sau đó tiến chậm vào kết quả sạch sẽ.
Ánh sáng: ánh sáng tự nhiên sáng, bối cảnh gia đình chân thực.
Âm thanh: tiếng máy hút bụi thật, đã tai. Không chữ trên màn hình.`,
    'So sánh A vs B': `Cảnh kiểu chia đôi màn hình: bên trái [sản phẩm A: con dao bếp thường khó khăn khi cắt quả cà chua], bên phải [sản phẩm B: con dao gốm mới cắt quả cà chua ngọt lịm chỉ trong một đường].
Máy quay: khung cận cảnh đứng yên giống hệt nhau ở hai bên.
Ánh sáng: ánh sáng bếp sáng sủa.
Âm thanh: tiếng bẹp bên trái, tiếng cắt ngọt bên phải. Không chữ.`,
    'Cảnh "món này đáng tiền" (lifestyle)': `Cảnh lifestyle một cặp đôi trẻ Việt Nam cùng dùng [sản phẩm] trong [bối cảnh: căn bếp nhỏ sáng sủa của căn hộ], cười đùa, sản phẩm khiến công việc trở nên dễ dàng và vui vẻ.
Máy quay: trung cảnh, cầm tay chuyển động chậm, cảm giác tự nhiên.
Ánh sáng: nắng sớm ấm áp.
Phong cách: quảng cáo lifestyle chân thực, không quá bóng bẩy.
Âm thanh: tiếng cười nhẹ, tiếng bếp, nhạc acoustic nhẹ nhàng.`,
  },

  'Prompt UGC': {
    'Testimonial – khách hàng kể trải nghiệm': `Video dọc phong cách UGC, quay bằng iPhone, cầm tay. Một [nhân vật: cô gái Việt Nam khoảng 25 tuổi, không trang điểm đậm, mặc áo thun oversize đơn giản] ngồi ở ghế lái trong xe hơi đang đỗ, ánh sáng ban ngày tự nhiên qua kính chắn gió.
Cô nói với camera điện thoại bằng tiếng Việt, tự nhiên và chân thật: "[câu thoại: Nói thật nha, mình xài [sản phẩm] được 1 tháng rồi, giờ không bỏ được luôn.]"
Khung hình tự nhiên không hoàn hảo, máy hơi rung.
Âm thanh: giọng cô, tiếng xe cộ bên ngoài văng vẳng. Không nhạc, không phụ đề.`,
    'Get Ready With Me (GRWM)': `Video dọc UGC: một [nhân vật: cô gái trẻ Việt Nam] ngồi trước bàn trang điểm hơi bừa bộn trong phòng ngủ buổi sáng, vừa dùng [sản phẩm] vừa trò chuyện với điện thoại dựng trên bàn.
Cô nói bằng tiếng Việt: "[câu thoại: Sáng nay đi học muộn nên make up 5 phút thôi, bí kíp là em này nè.]"
Máy quay: điện thoại đứng yên trên chân máy, góc hơi thấp, tự nhiên.
Ánh sáng: ánh sáng cửa sổ buổi sáng mềm.
Âm thanh: giọng tự nhiên, tiếng phòng nhẹ. Không nhạc, không phụ đề.`,
    'Phản ứng khi dùng lần đầu (reaction)': `Cận cảnh selfie UGC: một [nhân vật: chàng trai trẻ Việt Nam mặc hoodie] lần đầu thử [sản phẩm: một loại mì gói cay mới] ở quầy bếp. Anh ăn một miếng, mắt mở to, quạt quạt miệng và bật cười.
Anh nói bằng tiếng Việt: "[câu thoại: Trời ơi cay mà ngon dữ vậy trời!]"
Máy quay: điện thoại cầm tay, hơi rung, chân thực.
Ánh sáng: ánh đèn bếp ấm buổi tối.
Âm thanh: giọng tự nhiên, tiếng húp mì. Không nhạc, không phụ đề.`,
    'Một ngày của tôi (Day in my life)': `Cảnh dựng kiểu UGC: [nhân vật: một cô nhân viên văn phòng trẻ ở Sài Gòn] [hành động trong ngày: lấy [sản phẩm] từ túi xách trên xe buýt đông người buổi sáng, dùng nó ở bàn làm việc, và lần nữa ở phòng gym buổi tối].
Quay bằng điện thoại, cầm tay, những khoảnh khắc tự nhiên nhanh gọn, dọc 9:16.
Ánh sáng: ánh sáng ban ngày tự nhiên chuyển dần sang ánh sáng buổi tối.
Âm thanh: tiếng thành phố, nhạc lo-fi nhẹ.`,
    '"3 lý do mình mê…" (nói trước camera)': `Video dọc UGC nói trước camera: một [nhân vật: bà mẹ Việt Nam ngoài 30 thân thiện] đứng trong căn bếp sáng sủa, cầm [sản phẩm], đếm trên ngón tay.
Chị nói bằng tiếng Việt: "[câu thoại: 3 lý do mình mê cái nồi này: nấu nhanh, dễ rửa, mà giá rẻ bất ngờ!]"
Máy quay: điện thoại dựng trên quầy bếp, ngang tầm mắt, tự nhiên.
Ánh sáng: ánh sáng ban ngày từ cửa sổ.
Âm thanh: giọng rõ, tiếng bếp. Không phụ đề.`,
  },

  'Prompt Cinematic': {
    'Cổ trang Việt Nam sử thi': `Toàn cảnh sử thi điện ảnh: một nữ chiến binh Việt Nam mặc [trang phục: áo giáp cổ màu đỏ và vàng], tóc buộc cao, đứng trên ngọn đồi cầm giáo, nhìn xuống [bối cảnh: thung lũng mênh mông mờ sương với tòa thành cổ] lúc bình minh. Áo choàng của cô tung bay trong gió.
Máy quay: cần cẩu nâng lên chậm từ phía sau cô, hé lộ thung lũng.
Ánh sáng: ánh sáng vàng ngược, các tia sáng xuyên qua sương.
Phong cách: phim sử thi lịch sử, ống anamorphic, hạt phim 35mm, chỉnh màu ấm đậm.
Âm thanh: nhạc giao hưởng dâng trào với trống truyền thống Việt Nam, tiếng gió.`,
    'Film noir / thám tử': `Cảnh phim noir đen trắng: một thám tử mặc áo măng tô và đội mũ phớt đứng dưới ngọn đèn đường chập chờn trong [bối cảnh: con hẻm mưa những năm 1940], châm điếu thuốc, khói cuộn trong ánh đèn.
Máy quay: góc thấp, đứng yên, sau đó tiến chậm vào khuôn mặt.
Ánh sáng: một nguồn sáng cứng duy nhất, bóng đổ sâu, tương phản sáng tối mạnh, vệt mưa phát sáng.
Phong cách: phim noir kinh điển thập niên 1940, hạt phim.
Âm thanh: tiếng mưa, tiếng saxophone jazz xa xa.`,
    'Khoa học viễn tưởng (sci-fi)': `Cảnh khoa học viễn tưởng điện ảnh: [nhân vật: một phi hành gia trong bộ đồ du hành trắng cũ kỹ] chậm rãi bước qua [bối cảnh: hành tinh sa mạc đỏ với hai mặt trăng khổng lồ trên bầu trời], để lại dấu chân trên bụi, một con tàu vũ trụ rơi đang bốc khói ở đằng xa.
Máy quay: toàn cảnh bám theo, góc thấp.
Ánh sáng: ánh mặt trời ngoài hành tinh gay gắt, hạt bụi trong không khí, bóng đổ xanh lạnh.
Phong cách: lấy cảm hứng từ Dune, quy mô hoành tráng, anamorphic, chỉnh màu cam – xanh ngọc nhạt.
Âm thanh: tiếng ù nền trầm, tiếng gió, tiếng thở nặng nề trong mũ.`,
    'Lãng mạn – kiểu Wong Kar-wai': `Cảnh lãng mạn đầy tâm trạng: một cặp đôi trẻ đứng sát nhau dưới chiếc ô đỏ trên [bối cảnh: con phố ngập ánh neon ở Hồng Kông / Sài Gòn] về đêm, mưa rơi, họ nhìn nhau không nói.
Máy quay: quay chậm, hiệu ứng giật khung nhẹ, xóa phông.
Ánh sáng: neon đỏ và xanh lá rực, phản chiếu trên mặt đường ướt.
Phong cách: theo phong cách phim Vương Gia Vệ, hoài niệm, hạt phim, mơ màng.
Âm thanh: tiếng mưa nhẹ và tiếng piano u buồn.`,
    'Hành động – rượt đuổi': `Cảnh hành động tốc độ cao: [nhân vật: một tay lái mô tô mặc áo khoác da đen] phóng nhanh qua [bối cảnh: những con phố hẹp của phố cổ Hà Nội] về đêm, lạng lách giữa các xe hơi, tia lửa bắn ra khi xe nghiêng vào khúc cua gắt.
Máy quay: bám theo sát thấp bên cạnh xe, nhanh, nhòe chuyển động mạnh.
Ánh sáng: đèn đường và neon vụt qua, tương phản cao.
Phong cách: phim hành động Hollywood, dữ dội, 24fps, lóe sáng anamorphic.
Âm thanh: tiếng động cơ gầm rú, tiếng lốp rít, nhạc hành động dồn dập.`,
    'Kinh dị – không khí rùng rợn': `Cảnh kinh dị: một hành lang hẹp tối tăm trong [bối cảnh: một biệt thự Pháp cổ bỏ hoang ở Đà Lạt], giấy dán tường bong tróc, cánh cửa cuối hành lang từ từ tự kẽo kẹt mở ra, chỉ để lộ bóng tối.
Máy quay: dolly tiến chậm và đều ngang tầm mắt.
Ánh sáng: ánh trăng lạnh rất mờ qua ô cửa sổ vỡ, bóng tối sâu, bóng đèn chập chờn.
Phong cách: kinh dị tâm lý đầy không khí, tông lạnh nhạt màu, hạt phim.
Âm thanh: tiếng cửa kẽo kẹt, tiếng ù trầm đáng sợ, tiếng thì thầm xa xa.`,
    'Mở đầu phim (opening shot)': `Cảnh mở đầu một phim ngắn: drone từ từ hạ thấp trên [bối cảnh: một làng chài ven biển miền Trung Việt Nam] lúc chạng vạng xanh, đèn trong các ngôi nhà lần lượt bật sáng, những con thuyền trở về bờ.
Máy quay: drone hạ chậm, mượt mà.
Ánh sáng: hoàng hôn xanh thẫm với ánh đèn cửa sổ ấm áp.
Phong cách: điện ảnh, anamorphic, yên bình, hạt phim, cảm giác khung hình 2.39:1.
Âm thanh: tiếng sóng, tiếng người nói xa xa, giai điệu piano nhẹ bắt đầu.`,
    'Template cinematic tự điền': `[Cỡ cảnh] điện ảnh của [chủ thể + trang phục + cảm xúc] [hành động] trong [bối cảnh + thời gian].
Máy quay: [chuyển động: dolly in chậm / bám theo / cần cẩu], [ống kính: anamorphic 35mm / 85mm], xóa phông.
Ánh sáng: [ánh sáng có chủ đích: ngược sáng giờ vàng / tông tối / neon].
Chỉnh màu: [cam – xanh ngọc / cổ điển ấm / lạnh nhạt màu].
Phong cách: [thể loại / tham chiếu phim], hạt phim, 24fps.
Âm thanh: [âm thanh nền + nhạc].`,
  },

  'Prompt Storytelling': {
    'Cảnh mở đầu – giới thiệu nhân vật': `Cảnh điện ảnh: [dán thẻ nhân vật: một ông cụ bán hàng rong Việt Nam ngoài 70 tuổi với khuôn mặt hiền hậu nhiều nếp nhăn, mặc áo sơ mi xanh bạc màu và đội nón lá] đẩy chiếc xe bánh mì nhỏ dọc [bối cảnh: một con hẻm yên tĩnh ở Sài Gòn] lúc bình minh.
Máy quay: bám ngang chậm.
Ánh sáng: ánh sáng sớm mai mềm, sương ấm.
Phong cách: điện ảnh, giàu cảm xúc, hạt phim, 9:16.
Âm thanh: tiếng buổi sáng yên tĩnh, tiếng gà gáy, piano nhẹ.`,
    'Cảnh xung đột – khoảnh khắc khó khăn': `[Dán thẻ nhân vật] ngồi một mình trên chiếc ghế nhựa nhỏ dưới mưa bên cạnh xe hàng, không có khách nào, ông nhìn tấm ảnh cũ của gia đình trên tay.
Máy quay: tiến chậm vào cận cảnh khuôn mặt ông và tấm ảnh.
Ánh sáng: ánh sáng mưa xám lạnh, màu nhạt.
Phong cách: chính kịch cảm xúc, xóa phông.
Âm thanh: mưa nặng hạt, giai điệu cello buồn.`,
    'Cảnh cao trào – bước ngoặt': `Một nhóm [nhân vật phụ: học sinh mặc đồng phục trắng] chạy qua màn mưa về phía [nhân vật chính], che ô cho ông và mỉm cười, một em trao cho ông tấm thiệp viết tay.
Máy quay: toàn cảnh tiến chậm vào, rồi cận cảnh đôi mắt ngạc nhiên rưng rưng của ông.
Ánh sáng: mưa lấp lánh dưới ánh đèn đường ấm.
Phong cách: ấm lòng, quay chậm điện ảnh.
Âm thanh: mưa nhẹ dần, nhạc dâng lên đầy hy vọng.`,
    'Cảnh kết – thông điệp': `Sáng hôm sau: một hàng dài khách vui vẻ trước xe bánh mì của [nhân vật chính], ông cười rạng rỡ khi làm bánh, nắng chiếu khắp con hẻm.
Máy quay: cần cẩu nâng lên chậm hé lộ cả con hẻm nhộn nhịp.
Ánh sáng: nắng vàng ấm rực rỡ.
Phong cách: kết thúc điện ảnh đầy hy vọng.
Âm thanh: tiếng đường phố vui tươi, piano ấm áp kết thúc.`,
  },

  'Prompt theo ngành': {
    'Bất động sản – căn hộ': `Video dẫn tham quan bất động sản điện ảnh của [loại BĐS: căn hộ 2 phòng ngủ hiện đại] tại [vị trí: Quận 2, TP. Hồ Chí Minh]: máy quay lướt từ cửa vào qua phòng khách mở sáng sủa với cửa kính kịch trần, hé lộ [view: tầm nhìn sông và đường chân trời thành phố] lúc giờ vàng.
Máy quay: đi gimbal mượt, ống rộng 16mm, chậm và ổn định.
Ánh sáng: nắng hoàng hôn ấm tự nhiên tràn vào, bật toàn bộ đèn trong nhà.
Phong cách: phim bất động sản cao cấp, sạch sẽ, thoáng đãng.
Âm thanh: piano thanh lịch nhẹ nhàng, không thoại.`,
    'Nhà hàng – quán cà phê': `Cảnh điện ảnh ấm cúng bên trong [tên quán / phong cách: một quán cà phê Hà Nội cổ điển với nội thất gỗ và cây xanh]: barista rót chậm [đồ uống: cà phê trứng] vào tách sứ, hơi nóng bốc lên, khách trò chuyện nhẹ nhàng ở hậu cảnh.
Máy quay: cận cảnh dòng rót, rồi lùi chậm ra để thấy toàn bộ quán.
Ánh sáng: đèn sợi đốt ấm, nắng sớm qua cửa sổ.
Phong cách: quảng cáo lifestyle, ấm áp, mời gọi.
Âm thanh: tiếng quán cà phê, tiếng rót cà phê, guitar acoustic nhẹ.`,
    'Spa – thẩm mỹ': `Cảnh spa thư giãn: một phụ nữ nằm trên giường trị liệu với khăn trắng, mắt nhắm, trong khi kỹ thuật viên nhẹ nhàng đắp [liệu trình: mặt nạ thảo mộc xanh] trong [bối cảnh: phòng spa yên tĩnh với nến và hoa lan].
Máy quay: dolly in chậm, nét mềm.
Ánh sáng: ánh nến ấm mờ, mềm mại và yên bình.
Phong cách: quảng cáo chăm sóc sức khỏe sang trọng.
Âm thanh: tiếng nước nhẹ, nhạc nền thư giãn.`,
    'Giáo dục – trung tâm đào tạo': `Lớp học hiện đại sáng sủa tại [tên trung tâm]: một giáo viên trẻ thân thiện giảng [môn học: tiếng Anh giao tiếp] trước màn hình tương tác trong khi [học viên: các bạn học sinh tuổi teen] hăng hái giơ tay và cười đùa cùng nhau.
Máy quay: bám ngang chậm qua lớp học, rồi cận cảnh nụ cười tự tin của một học sinh.
Ánh sáng: ánh sáng ban ngày tự nhiên sáng, sạch sẽ và tràn năng lượng.
Phong cách: video quảng bá giáo dục, chân thực.
Âm thanh: tiếng lớp học, nhạc truyền cảm hứng sôi động.`,
    'Thời trang – shop quần áo': `Cảnh lookbook thời trang: một [người mẫu: người mẫu nữ trẻ Việt Nam] mặc [sản phẩm: bộ đồ linen màu pastel] dạo bước trên [bối cảnh: con phố vàng kiến trúc thuộc địa ở Hội An], quay lại mỉm cười về phía máy quay, vải bay trong gió nhẹ.
Máy quay: quay chậm bám theo, rồi cận trung.
Ánh sáng: nắng chiều muộn mềm.
Phong cách: phim thương hiệu thời trang, mơ màng, hạt phim.
Âm thanh: nhạc lo-fi thư giãn.`,
    'Du lịch – tour, resort': `Video quảng bá du lịch ấn tượng: drone bay trên [địa điểm: Vịnh Hạ Long] lúc bình minh, một du thuyền lướt giữa các đảo đá vôi, sau đó chuyển sang du khách chèo kayak qua đầm nước yên ả, cười vui vẻ.
Máy quay: drone bay quét rộng, rồi bám theo mượt sát mặt nước.
Ánh sáng: bình minh vàng, mặt nước lấp lánh.
Phong cách: quảng cáo du lịch, hoành tráng và vui tươi.
Âm thanh: nhạc điện ảnh hứng khởi, tiếng sóng nhẹ.`,
    'Gym – thể hình': `Cảnh phòng gym tràn năng lượng: một [nhân vật: chàng trai Việt Nam cơ bắp ngoài 20 tuổi] tập [bài tập: deadlift tạ nặng] trong [tên phòng gym: phòng gym phong cách công nghiệp tối], mồ hôi nhỏ giọt, bụi phấn bay quay chậm.
Máy quay: góc thấp, quay chậm, rồi cắt nhanh sang cận cảnh khuôn mặt quyết tâm.
Ánh sáng: đèn spot trên cao kịch tính, tương phản cao.
Phong cách: quảng cáo thể thao kiểu Nike.
Âm thanh: tiếng thở nặng, tiếng tạ va chạm, nhịp nhạc mạnh.`,
    'Ô tô – showroom': `Quảng cáo ô tô: [mẫu xe: một chiếc SUV điện màu trắng bóng bẩy] chạy dọc [cung đường: đèo núi quanh co ở Hà Giang] lúc hoàng hôn, rồi dừng trên vách núi nhìn xuống thung lũng.
Máy quay: drone bám đuổi, rồi góc thấp tôn vinh chiếc xe.
Ánh sáng: hoàng hôn vàng ấm phản chiếu trên thân xe.
Phong cách: quảng cáo ô tô cao cấp, điện ảnh.
Âm thanh: tiếng động cơ điện êm, nhạc hoành tráng.`,
    'Nông sản – đặc sản địa phương': `Cảnh nông trại chân thực: một [nông dân: người nông dân Việt Nam đội nón lá] tươi cười thu hoạch [nông sản: xoài chín] trong [địa điểm: vườn cây trĩu quả ở Đồng Tháp] lúc sáng sớm, đặt chúng vào chiếc giỏ tre đan.
Máy quay: cầm tay cận cảnh đôi tay hái quả, rồi trung cảnh người nông dân mỉm cười.
Ánh sáng: nắng sớm vàng mềm, sương đọng trên lá.
Phong cách: chân thực, ấm áp, phong cách tài liệu.
Âm thanh: tiếng chim, lá xào xạc, nhạc dân gian nhẹ nhàng.`,
    'Y tế – nha khoa': `Phòng khám nha khoa hiện đại sạch sẽ: một nha sĩ thân thiện mặc áo blouse trắng cho bệnh nhân xem [dịch vụ: kết quả tẩy trắng răng mới] qua chiếc gương cầm tay, bệnh nhân cười rạng rỡ.
Máy quay: trung cảnh, rồi cận cảnh nụ cười tự tin.
Ánh sáng: ánh sáng phòng khám sáng sạch, mềm mại và thân thiện.
Phong cách: quảng cáo y tế chuyên nghiệp, đáng tin cậy.
Âm thanh: nhạc tích cực nhẹ nhàng, không có tiếng dụng cụ y tế.`,
  },

  // ───────── Module 16 ─────────
  'Prompt mới': {
    'Đồ vật biết nói (talking object)': `Một [đồ vật: quả bơ] hoạt hình dễ thương với đôi mắt to biểu cảm và cái miệng nhỏ xíu ngồi trên [bối cảnh: mặt bếp], nói chuyện trực tiếp với máy quay một cách hài hước, đầy kịch tính.
Nó nói bằng tiếng Việt: "[câu thoại hài: Đừng để mình chín nẫu trong tủ lạnh nữa, làm sinh tố đi!]"
Phong cách: nhân vật 3D kiểu Pixar trên nền căn bếp thật, ánh sáng ban ngày mềm.
Máy quay: cận cảnh, đứng yên.
Âm thanh: giọng hoạt hình, tiếng bếp nhẹ. Không phụ đề.`,
    'Phỏng vấn nhân vật lịch sử / nghề nghiệp xưa': `Phong cách phỏng vấn đường phố: một phóng viên đưa micro về phía [nhân vật: một nho sĩ thời Lý mặc áo dài truyền thống] đang đứng ở [bối cảnh: trước Văn Miếu – Quốc Tử Giám, Hà Nội].
Phóng viên hỏi bằng tiếng Việt: "[câu hỏi]"
Nho sĩ điềm tĩnh trả lời bằng tiếng Việt: "[câu trả lời ngắn, hài hước]"
Máy quay: cầm tay kiểu vlog, chân thực.
Âm thanh: lời thoại rõ, tiếng đường phố xung quanh. Không phụ đề.`,
    'Thế giới thu nhỏ (miniature)': `Thế giới thu nhỏ tilt-shift: những người tí hon [hành động: thu hoạch những quả dâu tây khổng lồ] trên [bối cảnh: bàn bếp], dùng thang và xe tải tí hon để chở quả.
Máy quay: lướt chậm từ trên xuống, mép khung mờ kiểu tilt-shift.
Ánh sáng: ánh sáng ban ngày sáng mềm.
Phong cách: mô hình thu nhỏ chân thực, vui nhộn, rất chi tiết.
Âm thanh: tiếng lao xao tí hon, nhạc vui tươi.`,
    'ASMR cắt đồ vật thủy tinh / trái cây pha lê': `Đặc tả ASMR: một con dao sắc từ từ cắt qua [đồ vật: quả dâu tây bóng như thủy tinh làm bằng pha lê] trên thớt gỗ, các lát cắt hé lộ phần ruột nhiều lớp lấp lánh.
Máy quay: macro, đứng yên, quay chậm.
Ánh sáng: ánh sáng studio mềm, phản chiếu bóng bẩy.
Âm thanh: tiếng cắt thủy tinh giòn tan đã tai, không nhạc, không giọng nói.`,
    'Mini-vlog động vật': `Video dọc kiểu vlog: [con vật: một chú chuột lang nước (capybara) lông xù] cầm chiếc máy quay selfie tí hon khi đi dạo trong [bối cảnh: khu nghỉ dưỡng suối nước nóng Nhật Bản], kể về một ngày của mình: ăn dưa hấu, thư giãn trong làn nước ấm.
Chú capybara kể chuyện bằng giọng tiếng Việt điềm tĩnh: "[câu kể ngắn]"
Máy quay: POV selfie, cầm tay, ấm cúng.
Phong cách: chân thực, dễ thương, hài hước.
Âm thanh: lời kể điềm tĩnh, tiếng nước, nhạc lo-fi nhẹ.`,
    'Hiệu ứng biến hình (transformation)': `Khung đầu: [trạng thái trước: một căn phòng cũ trống trải bừa bộn]. Khung cuối: [trạng thái sau: một phòng ngủ tối giản hiện đại sáng sủa].
Căn phòng biến đổi mượt mà: bụi biến mất, tường tự sơn lại, đồ nội thất trượt vào đúng chỗ, đèn bật sáng.
Máy quay: toàn cảnh đứng yên.
Phong cách: biến hình kỳ diệu đã mắt, mượt mà.
Âm thanh: hiệu ứng vút và lấp lánh, nhạc sôi động.`,
    'Biến ảnh cũ thành video sống động': `[Đưa ảnh cũ / ảnh gia đình vào làm khung hình đầu]
Những người trong ảnh sống động lên một cách tự nhiên: họ mỉm cười, chớp mắt và nhẹ nhàng quay sang nhìn nhau. Tóc và quần áo chuyển động nhẹ trong làn gió.
Máy quay: tiến vào rất chậm.
Giữ nguyên chính xác khuôn mặt, quần áo và màu sắc của bức ảnh. Chân thực, ấm áp và xúc động.`,
  },

  'Công cụ Video AI mới': {
    'Prompt kiểm tra công cụ mới (dùng chung để so sánh)': `Cận trung một cô gái trẻ Việt Nam tóc đen dài, mặc áo sơ mi trắng, ngồi trong quán cà phê đầy nắng bên cửa sổ. Cô quay về phía máy quay, mỉm cười và nâng tách cà phê lên.
Máy quay: tiến vào chậm, xóa phông.
Ánh sáng: nắng chiều ấm, bóng mềm.
Phong cách: chân thực, điện ảnh, chuyển động tự nhiên.
(Chạy cùng prompt này trên các công cụ khác nhau để so sánh: khuôn mặt, bàn tay, chuyển động, ánh sáng, tốc độ tạo, chi phí.)`,
  },

  'Sound Effect': {
    'Bộ SFX chuyển cảnh (prompt ElevenLabs)': `Whoosh: Tiếng vút chuyển cảnh điện ảnh nhanh, tiếng gió lướt từ trái sang phải, 1 giây
Swipe: Tiếng vuốt nhẹ ngắn như vuốt màn hình điện thoại, sạch, 0,5 giây
Impact: Tiếng nổ trầm điện ảnh có vang dài, kiểu trailer, 2 giây
Riser: Tiếng dâng căng thẳng tăng dần trong 3 giây rồi cắt đột ngột
Glitch: Tiếng nhiễu kỹ thuật số giật cục ngắn, điện tử, 0,7 giây`,
    'SFX sản phẩm & bán hàng': `Ding: Tiếng chuông lấp lánh kỳ diệu trong trẻo, thông báo tích cực, 1 giây
Cash: Tiếng máy tính tiền "keng keng" kèm tiếng xu, 1 giây
Pop: Tiếng bong bóng vỡ kiểu hoạt hình, vui nhộn, ngắn
Unbox: Tiếng mở hộp carton và giấy lót sột soạt, ASMR, thu gần, 3 giây
Spray: Tiếng xịt nước hoa phun sương ngắn, thu sát micro, 1 giây
Can open: Tiếng bật lon soda kèm tiếng xèo và bọt ga, giòn, 2 giây`,
    'SFX không khí / bối cảnh (ambience)': `Rain: Mưa nhẹ rơi trên cửa sổ ban đêm, sấm xa xa, lặp 10 giây
Café: Không khí quán cà phê đông khách, người nói chuyện nhỏ, tiếng tách chạm, máy pha espresso, 15 giây
Street Vietnam: Đường phố Việt Nam nhộn nhịp với tiếng xe máy bấm còi và tiếng rao hàng rong, 15 giây
Nature: Buổi sáng yên bình trong rừng với tiếng chim hót và suối nhỏ, 15 giây
Ocean: Sóng biển êm vỗ bờ cát, hải âu xa xa, 15 giây`,
    'SFX hài hước / cảm xúc': `Laugh track: Khán giả nhỏ cười, kiểu sitcom, 2 giây
Fail: Tiếng kèn trombone buồn "oa oa oa", hài hước, 2 giây
Surprise: Tiếng lò xo "boing" kiểu hoạt hình
Suspense: Đoạn nhạc hồi hộp kịch tính với dây trầm, 2 giây
Heartbeat: Nhịp tim chậm và nặng, căng thẳng, 4 giây
Record scratch: Tiếng cào đĩa than – khoảnh khắc đứng hình`,
    'Từ khóa tìm SFX trên Pixabay / Mixkit': `whoosh/swoosh (tiếng vút), transition (chuyển cảnh), swipe (vuốt), impact/boom (va chạm, nổ trầm), riser (dâng căng thẳng), glitch (nhiễu số), pop (bụp), ding/sparkle (chuông, lấp lánh), notification (thông báo), cash register (máy tính tiền), click (nhấp), typing (gõ phím), camera shutter (màn trập máy ảnh), applause (vỗ tay), crowd (đám đông), laugh (tiếng cười), rain (mưa), thunder (sấm), wind (gió), ocean (biển), birds (chim), city ambience (không khí thành phố), footsteps (bước chân), door open (mở cửa), unboxing (mở hộp), paper (giấy), sizzle (xèo xèo), pouring water (rót nước), ice cubes (đá viên)`,
    'Template prompt SFX tự điền': `[Tên âm thanh], [nguồn phát / chất liệu: kim loại, gỗ, thủy tinh, giấy…], [đặc điểm: ngắn / dài / có vang / thu gần / ở xa], [cảm xúc: vui nhộn / kịch tính / êm dịu], [thời lượng] giây
(Khi dán vào ElevenLabs nên viết bằng tiếng Anh để kết quả chính xác hơn.)`,
  },

  'Nhạc': {
    'Nhạc nền quảng cáo vui tươi (Suno – Instrumental)': `Pop sôi động, guitar acoustic trong trẻo, tiếng vỗ tay, synth nhẹ, vui tươi, tràn năng lượng, tích cực, 115 BPM, không lời, nhạc nền quảng cáo`,
    'Nhạc nền sang trọng (mỹ phẩm, BĐS)': `Nhạc nền điện ảnh thanh lịch, piano nhẹ, dàn dây ấm áp, bass trầm tinh tế, sang trọng, êm dịu, tinh tế, 80 BPM, không lời`,
    'Nhạc nền cảm động (kể chuyện)': `Nhạc điện ảnh cảm xúc, piano độc tấu, dàn dây dâng chậm, chân thành, hoài niệm, cao trào nhẹ nhàng, 70 BPM, không lời`,
    'Nhạc nền chill (vlog, lifestyle)': `Lofi hip hop, piano điện êm dịu, tiếng lạo xạo đĩa than, trống nhẹ, thư giãn, ấm cúng, 85 BPM, không lời`,
    'Nhạc hành động / trailer': `Nhạc trailer hoành tráng, dàn nhạc kết hợp điện tử, trống mạnh mẽ, kèn đồng trầm dồn dập, căng thẳng tăng dần, anh hùng, 130 BPM, không lời`,
    'Nhạc truyền thống Việt hiện đại': `Nhạc dân gian Việt Nam kết hợp hiện đại, đàn tranh, sáo trúc, beat điện tử nhẹ, yên bình, đậm bản sắc văn hóa, 90 BPM, không lời`,
    'Jingle thương hiệu có lời (Suno – Custom)': `Phong cách nhạc (ô Style of Music): jingle pop bắt tai, giọng nữ trong sáng, đàn ukulele, vỗ tay, vui vẻ, 120 BPM

Lời bài hát (ô Lyrics) – giữ nguyên các nhãn [Intro], [Verse], [Chorus], [Outro] để Suno hiểu cấu trúc:
[Intro] – đoạn dạo đầu
[Verse] – đoạn kể:
[Câu 1 nói về vấn đề khách hàng]
[Câu 2 giới thiệu tên thương hiệu]
[Chorus] – điệp khúc:
[Tên thương hiệu] ơi, [lợi ích chính]!
[Câu slogan ngắn, dễ nhớ]
[Outro] – đoạn kết:
[Tên thương hiệu]!
(Ô Style of Music trên Suno nên dán bản tiếng Anh để ra nhạc chính xác hơn.)`,
  },

  'Font': {
    'Tạo chữ tiêu đề nghệ thuật bằng Ideogram': `Thiết kế chữ cho dòng chữ tiếng Việt "[tiêu đề tiếng Việt có dấu]" theo [phong cách: chữ 3D đậm bóng loáng với dải màu vàng kim và bóng đổ mềm], đặt ở giữa trên [nền: nền tím đậm với các đốm lấp lánh].
Dấu tiếng Việt chính xác, sạch sẽ, tương phản cao, phong cách tiêu đề thumbnail YouTube.
Tỉ lệ khung hình 16:9.`,
  },

  'Template': {
    'Template prompt video gốc (mọi công cụ)': `[Cỡ cảnh + góc máy] của [chủ thể + mô tả chi tiết] [hành động chính] trong [bối cảnh + thời gian + thời tiết].
Máy quay: [chuyển động camera], [ống kính], [độ sâu trường ảnh].
Ánh sáng: [ánh sáng].
Phong cách: [phong cách], [tông màu].
Âm thanh: [lời thoại "…" / âm thanh nền / nhạc].
Tránh: không chữ, không watermark, không mặt biến dạng, không thừa chân tay.`,
  },

  'Hướng dẫn bổ sung': {
    'Negative prompt dùng chung': `mờ, chất lượng thấp, mặt biến dạng, tay biến dạng, thừa ngón tay, thừa chân tay, thiếu chân tay, biến hình, nhấp nháy, rung giật, chuyển động không tự nhiên, nhân vật bị nhân đôi, chữ, phụ đề, watermark, logo bị méo, màu quá rực, kiểu hoạt hình (nếu muốn ảnh thật)`,
  },
};
