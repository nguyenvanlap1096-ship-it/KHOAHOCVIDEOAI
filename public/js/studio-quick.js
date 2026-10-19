/* Trình viết nhanh — dựng kịch bản video / bộ ảnh hoàn chỉnh NGAY trong trình duyệt, không cần AI, không cần key.
   Dựa trên: ngành (bối cảnh, ánh sáng, đạo cụ đặc trưng) + mục đích (cấu trúc cảnh) + cú pháp riêng của từng phần mềm.
   Dùng khi khoá học chưa bật AI, hết lượt hoặc AI miễn phí đang quá tải. Kết quả cùng cấu trúc với bản AI viết. */
(function (root) {
  "use strict";

  // Hình ảnh đặc trưng của từng ngành (tiếng Anh cho prompt) + câu CTA tiếng Việt.
  const LOOK = {
    fnb:        { set:"a cozy Vietnamese restaurant kitchen and dining area", props:"steaming dishes, fresh herbs, sizzling pan", light:"warm 3200K tungsten light with soft steam haze", person:"a friendly Vietnamese chef in his 30s, white apron, short black hair", palette:"warm amber, deep red, fresh green", sfx:"sizzling oil, clinking bowls, lively chatter", cta:"Ghé quán hoặc gọi giao hàng ngay hôm nay!" },
    coffee:     { set:"a sunlit Vietnamese café with wooden tables and plants", props:"phin coffee filter dripping, iced glass with condensation, milk swirl", light:"golden morning sunlight through windows, soft shadows", person:"a young Vietnamese barista in her 20s, beige apron, hair in a low bun", palette:"coffee brown, cream, soft green", sfx:"coffee dripping, ice cubes clinking, soft café ambience", cta:"Ghé quán thưởng thức hoặc đặt online, combo ưu đãi đang chờ bạn!" },
    beauty:     { set:"a bright minimal bathroom vanity and spa room", props:"elegant beauty product bottles, fresh towel, water droplets, flowers", light:"soft diffused daylight, glowing skin highlights", person:"a Vietnamese woman in her late 20s, shoulder-length black hair, cream silk robe, natural makeup", palette:"blush pink, nude, white", sfx:"soft water sounds, gentle foam, calm piano", cta:"Đặt mua ngay hoặc nhắn tin để được tư vấn miễn phí!" },
    fashion:    { set:"a stylish city street and a clean white studio", props:"flowing fabric, clothing rack, accessories", light:"bright editorial light with crisp shadows", person:"a Vietnamese female model in her 20s, sleek long hair, confident posture", palette:"neutral beige, black, accent color of the outfit", sfx:"footsteps, fabric swish, upbeat fashion beat", cta:"Xem trọn bộ sưu tập và inbox ngay để chọn size!" },
    realestate: { set:"a modern apartment project with balcony city view, pool and green park", props:"open living room, large windows, infinity pool", light:"golden hour sunlight, warm and airy", person:"a young Vietnamese family, parents in their 30s and a small child", palette:"warm white, wood, sky blue", sfx:"birds, gentle wind, soft orchestral music", cta:"Đặt lịch tham quan nhà mẫu và nhận bảng giá ưu đãi!" },
    edu:        { set:"a bright modern classroom with whiteboard and laptops", props:"notebooks, whiteboard diagrams, certificates", light:"clean natural daylight", person:"an energetic Vietnamese teacher in her 30s, smart casual, and focused students", palette:"white, navy blue, warm yellow", sfx:"pen writing, light laughter, uplifting music", cta:"Đăng ký học thử miễn phí ngay hôm nay!" },
    travel:     { set:"a breathtaking Vietnamese landscape and a boutique resort", props:"ocean view, infinity pool, local food, curtains opening", light:"sunrise and sunset golden light", person:"a young Vietnamese couple in their late 20s, casual summer outfits", palette:"turquoise, sand gold, sunset orange", sfx:"waves, seagulls, gentle breeze", cta:"Đặt phòng ngay để giữ combo ưu đãi mùa này!" },
    auto:       { set:"a winding mountain road and a sleek showroom", props:"glossy car body, headlights, alloy wheels, leather interior", light:"dramatic rim light, wet reflective surfaces", person:"a confident Vietnamese man in his 30s, smart jacket", palette:"metallic silver, deep black, accent red", sfx:"engine start, tires on asphalt, deep bass", cta:"Đăng ký lái thử và nhận báo giá lăn bánh tốt nhất!" },
    tech:       { set:"a dark minimal studio and a modern workspace", props:"the device rotating, glowing screen interface, ports and details", light:"cool rim lighting, soft reflections", person:"a young Vietnamese office worker in his 20s, casual shirt", palette:"black, electric blue, silver", sfx:"soft UI clicks, whoosh transitions, electronic music", cta:"Mua ngay hoặc trả góp 0% — số lượng có hạn!" },
    health:     { set:"a clean bright modern clinic", props:"modern equipment, white uniforms, reception desk", light:"clean soft white light", person:"a friendly Vietnamese doctor in her 30s, white coat, gentle smile", palette:"white, mint green, light blue", sfx:"calm ambience, soft music", cta:"Đặt lịch khám và nhận tư vấn miễn phí!" },
    fitness:    { set:"a modern gym and a sunlit yoga studio", props:"dumbbells, yoga mat, water bottle, sweat drops", light:"high-contrast dramatic light, morning sun for yoga", person:"a fit Vietnamese trainer in his late 20s, black sportswear", palette:"black, neon accent, warm skin tones", sfx:"weights dropping, heavy breathing, energetic beat", cta:"Đăng ký tập thử miễn phí ngay hôm nay!" },
    baby:       { set:"a cozy tidy family living room and nursery", props:"soft toys, baby products, pastel blanket", light:"warm soft window light", person:"a gentle Vietnamese mother in her late 20s and her cheerful toddler", palette:"pastel cream, soft pink, baby blue", sfx:"baby giggles, soft lullaby", cta:"Mua cho bé ngay để nhận quà tặng kèm!" },
    furniture:  { set:"a stylish living room transformation before and after", props:"wood grain furniture, soft fabric sofa, home appliances", light:"warm sunlight through sheer curtains", person:"a young Vietnamese couple in their 30s, relaxed home clothes", palette:"warm wood, beige, olive green", sfx:"soft footsteps, gentle acoustic music", cta:"Ghé showroom hoặc nhận tư vấn thiết kế miễn phí!" },
    agri:       { set:"a lush Vietnamese farm at sunrise and a clean packing area", props:"fresh produce with dew, bamboo baskets, eco packaging", light:"soft sunrise light with morning mist", person:"a sunburnt Vietnamese farmer in his 50s, conical hat, warm smile", palette:"fresh green, earth brown, golden light", sfx:"birds, rustling leaves, folk melody", cta:"Đặt hàng tận vườn — tươi ngon, làm quà ý nghĩa!" },
    finance:    { set:"a modern bright office and a happy family home", props:"smartphone banking app, charts, documents", light:"clean natural light", person:"a professional Vietnamese advisor in her 30s, navy blazer", palette:"navy, white, gold", sfx:"soft piano, confident music", cta:"Nhận tư vấn miễn phí ngay hôm nay!" },
    wedding:    { set:"an elegant wedding venue with flowers and candles", props:"wedding dress, rings, champagne glasses, confetti", light:"warm candlelight bokeh, golden hour", person:"a Vietnamese bride and groom in their late 20s, white gown and black suit", palette:"ivory, blush, gold", sfx:"soft romantic strings, applause", cta:"Đặt lịch tư vấn và xem album mẫu ngay!" },
    pet:        { set:"a bright pet spa and a cozy home", props:"fluffy towel, pet food bowl, toys", light:"bright cheerful daylight", person:"a smiling Vietnamese pet owner in her 20s with a fluffy corgi", palette:"warm yellow, sky blue, white", sfx:"happy barks, playful music", cta:"Đặt lịch spa cho bé cưng ngay hôm nay!" },
    jewelry:    { set:"a luxurious black velvet display and an elegant boutique", props:"sparkling diamond ring, gold necklace, watch", light:"precise spotlight with sparkling highlights", person:"an elegant Vietnamese woman in her 30s, black evening dress", palette:"black, gold, diamond white", sfx:"soft chime, elegant piano", cta:"Ghé cửa hàng để xem trực tiếp và khắc tên miễn phí!" },
    affiliate:  { set:"a real home bedroom or desk filmed handheld, UGC style", props:"the product in hand, unboxing package, phone", light:"natural window light, authentic look", person:"a relatable Vietnamese girl in her early 20s, casual T-shirt, talking to camera", palette:"natural, bright, authentic", sfx:"package opening, casual talking, trending beat", cta:"Bấm giỏ hàng ngay để lấy voucher!" },
    story:      { set:"cinematic Vietnamese everyday locations", props:"meaningful object that ties the story together", light:"cinematic mood lighting that follows the emotion", person:"a Vietnamese main character in their 20s with a distinctive outfit", palette:"cinematic teal and orange", sfx:"emotional score, ambient sound", cta:"Theo dõi kênh để xem phần tiếp theo nhé!" },
    other:      { set:"a setting that matches the idea", props:"the key product or object of the idea", light:"soft cinematic light", person:"a Vietnamese main character in their 20s, neat casual outfit", palette:"harmonious natural colors", sfx:"ambient sound, light background music", cta:"Liên hệ ngay hôm nay để nhận ưu đãi!" }
  };

  // Bản tiếng Việt của hình ảnh ngành — dùng để dịch prompt cho người học dễ hiểu.
  const LOOK_VI = {
    fnb:        { set:"quán ăn Việt ấm cúng, có bếp và khu bàn ăn", props:"món ăn bốc khói, rau thơm tươi, chảo xèo xèo", light:"ánh đèn vàng ấm, hơi nước mờ ảo", person:"đầu bếp Việt Nam khoảng 30 tuổi, tạp dề trắng, tóc đen ngắn, thân thiện", palette:"vàng hổ phách, đỏ đậm, xanh lá tươi", sfx:"tiếng dầu xèo xèo, bát đĩa va nhẹ, tiếng khách trò chuyện" },
    coffee:     { set:"quán cà phê Việt ngập nắng, bàn gỗ, cây xanh", props:"phin cà phê nhỏ giọt, ly đá đọng nước, sữa xoáy", light:"nắng sớm vàng xuyên qua cửa sổ, bóng đổ mềm", person:"cô pha chế Việt Nam khoảng 20 tuổi, tạp dề be, tóc búi thấp", palette:"nâu cà phê, kem, xanh lá nhạt", sfx:"tiếng cà phê nhỏ giọt, đá va ly, không khí quán nhẹ nhàng" },
    beauty:     { set:"phòng tắm / phòng spa tối giản, sáng sủa", props:"chai mỹ phẩm sang trọng, khăn sạch, giọt nước, hoa", light:"ánh sáng ban ngày khuếch tán mềm, làn da sáng bóng", person:"cô gái Việt Nam cuối tuổi 20, tóc đen ngang vai, áo choàng lụa màu kem, trang điểm tự nhiên", palette:"hồng phấn, nude, trắng", sfx:"tiếng nước nhẹ, bọt êm, nhạc piano nhẹ nhàng" },
    fashion:    { set:"phố thời thượng và studio trắng tinh", props:"vải bay, giá treo đồ, phụ kiện", light:"ánh sáng tạp chí rõ nét, bóng đổ sắc", person:"người mẫu nữ Việt Nam tuổi 20, tóc dài suôn, dáng tự tin", palette:"be trung tính, đen, màu nhấn của trang phục", sfx:"tiếng bước chân, vải sột soạt, nhạc thời trang sôi động" },
    realestate: { set:"căn hộ hiện đại có ban công nhìn ra thành phố, hồ bơi, công viên", props:"phòng khách rộng mở, cửa kính lớn, hồ bơi vô cực", light:"nắng giờ vàng ấm áp, thoáng đãng", person:"gia đình trẻ Việt Nam, bố mẹ khoảng 30 tuổi và một bé nhỏ", palette:"trắng ấm, gỗ, xanh da trời", sfx:"tiếng chim, gió nhẹ, nhạc dàn dây nhẹ nhàng" },
    edu:        { set:"lớp học hiện đại sáng sủa, bảng trắng và máy tính", props:"vở ghi, sơ đồ trên bảng, chứng chỉ", light:"ánh sáng tự nhiên trong trẻo", person:"cô giáo Việt Nam khoảng 30 tuổi năng động cùng các học viên chăm chú", palette:"trắng, xanh navy, vàng ấm", sfx:"tiếng bút viết, tiếng cười nhẹ, nhạc truyền cảm hứng" },
    travel:     { set:"cảnh đẹp Việt Nam và khu nghỉ dưỡng boutique", props:"view biển, hồ bơi vô cực, món địa phương, rèm cửa mở ra", light:"ánh bình minh và hoàng hôn vàng", person:"cặp đôi trẻ Việt Nam cuối tuổi 20, trang phục mùa hè", palette:"xanh ngọc, vàng cát, cam hoàng hôn", sfx:"sóng biển, hải âu, gió nhẹ" },
    auto:       { set:"đường đèo uốn lượn và showroom bóng bẩy", props:"thân xe bóng loáng, đèn pha, mâm xe, nội thất da", light:"ánh sáng viền kịch tính, mặt đường ướt phản chiếu", person:"người đàn ông Việt Nam khoảng 30 tuổi, áo khoác lịch lãm", palette:"bạc ánh kim, đen sâu, đỏ nhấn", sfx:"tiếng nổ máy, lốp xe trên đường, tiếng bass trầm" },
    tech:       { set:"studio tối giản và góc làm việc hiện đại", props:"thiết bị xoay, màn hình phát sáng, cổng kết nối và chi tiết", light:"ánh sáng viền lạnh, phản chiếu mềm", person:"nhân viên văn phòng Việt Nam tuổi 20, áo sơ mi giản dị", palette:"đen, xanh điện, bạc", sfx:"tiếng bấm giao diện nhẹ, hiệu ứng lướt, nhạc điện tử" },
    health:     { set:"phòng khám hiện đại sạch sẽ, sáng sủa", props:"thiết bị hiện đại, đồng phục trắng, quầy lễ tân", light:"ánh sáng trắng mềm, sạch", person:"nữ bác sĩ Việt Nam khoảng 30 tuổi, áo blouse trắng, nụ cười hiền", palette:"trắng, xanh bạc hà, xanh nhạt", sfx:"không khí yên tĩnh, nhạc nhẹ" },
    fitness:    { set:"phòng gym hiện đại và phòng yoga ngập nắng", props:"tạ tay, thảm yoga, chai nước, giọt mồ hôi", light:"ánh sáng tương phản mạnh; nắng sớm cho cảnh yoga", person:"huấn luyện viên Việt Nam cuối tuổi 20, dáng khoẻ, đồ tập đen", palette:"đen, màu neon nhấn, tông da ấm", sfx:"tiếng tạ chạm sàn, hơi thở mạnh, nhạc sôi động" },
    baby:       { set:"phòng khách gia đình ấm cúng, gọn gàng và phòng của bé", props:"thú bông, đồ dùng cho bé, chăn màu pastel", light:"ánh sáng cửa sổ ấm, mềm", person:"người mẹ Việt Nam cuối tuổi 20 dịu dàng và bé nhỏ vui tươi", palette:"kem pastel, hồng nhạt, xanh baby", sfx:"tiếng bé cười khúc khích, nhạc ru nhẹ" },
    furniture:  { set:"phòng khách được biến đổi trước và sau", props:"đồ gỗ có vân, sofa vải mềm, đồ gia dụng", light:"nắng ấm xuyên qua rèm mỏng", person:"cặp vợ chồng trẻ Việt Nam khoảng 30 tuổi, đồ mặc nhà thoải mái", palette:"gỗ ấm, be, xanh ô liu", sfx:"tiếng bước chân nhẹ, nhạc guitar mộc" },
    agri:       { set:"nông trại Việt Nam xanh mướt lúc bình minh và khu đóng gói sạch", props:"nông sản tươi đọng sương, thúng tre, bao bì thân thiện", light:"ánh bình minh mềm cùng sương sớm", person:"bác nông dân Việt Nam khoảng 50 tuổi, đội nón lá, nụ cười hiền hậu", palette:"xanh tươi, nâu đất, nắng vàng", sfx:"tiếng chim, lá xào xạc, giai điệu dân gian" },
    finance:    { set:"văn phòng hiện đại sáng sủa và tổ ấm gia đình hạnh phúc", props:"ứng dụng ngân hàng trên điện thoại, biểu đồ, giấy tờ", light:"ánh sáng tự nhiên trong trẻo", person:"nữ chuyên viên tư vấn Việt Nam khoảng 30 tuổi, vest xanh navy", palette:"xanh navy, trắng, vàng", sfx:"piano nhẹ, nhạc tự tin" },
    wedding:    { set:"sảnh cưới sang trọng với hoa và nến", props:"váy cưới, nhẫn cưới, ly sâm panh, pháo giấy", light:"ánh nến bokeh ấm áp, giờ vàng", person:"cô dâu chú rể Việt Nam cuối tuổi 20, váy trắng và vest đen", palette:"trắng ngà, hồng phấn, vàng", sfx:"nhạc dây lãng mạn, tiếng vỗ tay" },
    pet:        { set:"spa thú cưng sáng sủa và ngôi nhà ấm áp", props:"khăn bông, bát thức ăn, đồ chơi", light:"ánh sáng ban ngày tươi vui", person:"cô chủ Việt Nam tuổi 20 tươi cười cùng chú corgi lông xù", palette:"vàng ấm, xanh trời, trắng", sfx:"tiếng sủa vui, nhạc tinh nghịch" },
    jewelry:    { set:"kệ trưng bày nhung đen sang trọng và cửa hàng thanh lịch", props:"nhẫn kim cương lấp lánh, dây chuyền vàng, đồng hồ", light:"đèn spot chính xác làm trang sức lấp lánh", person:"người phụ nữ Việt Nam khoảng 30 tuổi thanh lịch, váy dạ hội đen", palette:"đen, vàng, trắng kim cương", sfx:"tiếng chuông nhẹ, piano sang trọng" },
    affiliate:  { set:"phòng ngủ hoặc bàn làm việc thật, quay cầm tay kiểu người thật (UGC)", props:"sản phẩm cầm trên tay, hộp đang mở, điện thoại", light:"ánh sáng cửa sổ tự nhiên, chân thật", person:"cô gái Việt Nam đầu tuổi 20 gần gũi, áo thun giản dị, nói thẳng vào camera", palette:"tự nhiên, tươi sáng, chân thật", sfx:"tiếng mở hộp, giọng nói tự nhiên, nhạc đang thịnh hành" },
    story:      { set:"những địa điểm đời thường Việt Nam quay kiểu điện ảnh", props:"một đồ vật ý nghĩa xuyên suốt câu chuyện", light:"ánh sáng điện ảnh theo cảm xúc", person:"nhân vật chính Việt Nam tuổi 20 với trang phục đặc trưng", palette:"tông điện ảnh xanh ngọc – cam", sfx:"nhạc nền cảm xúc, âm thanh môi trường" },
    other:      { set:"bối cảnh phù hợp với ý tưởng", props:"sản phẩm hoặc đồ vật chính của ý tưởng", light:"ánh sáng điện ảnh mềm", person:"nhân vật chính Việt Nam tuổi 20, trang phục gọn gàng", palette:"màu sắc tự nhiên hài hoà", sfx:"âm thanh môi trường, nhạc nền nhẹ" }
  };
  // Dịch các cụm góc máy hay dùng.
  const CAM_VI = [
    [/extreme close-up/g,"cận cảnh rất sát"],[/medium close-up/g,"cận trung"],[/close-up/g,"cận cảnh"],[/medium shots?/g,"trung cảnh"],[/wide establishing shot/g,"toàn cảnh mở đầu"],[/wide shot/g,"toàn cảnh"],
    [/aerial drone shot/g,"flycam từ trên cao"],[/slow forward glide/g,"lướt chậm về phía trước"],[/fast push-in/g,"đẩy máy vào nhanh"],[/slow push-in/g,"đẩy máy vào chậm"],[/slight dolly-in/g,"đẩy máy nhẹ vào"],
    [/slow dolly-in/g,"đẩy máy chậm vào"],[/handheld/g,"máy cầm tay"],[/smooth tracking shot/g,"máy bám theo mượt"],[/low-angle tracking shot/g,"máy bám theo từ góc thấp"],[/macro shot/g,"chụp macro"],[/macro handheld shot/g,"macro cầm tay"],
    [/slow orbit around the product/g,"xoay chậm quanh sản phẩm"],[/slow orbit/g,"xoay chậm quanh chủ thể"],[/slow crane up/g,"cẩu máy lên chậm"],[/crane up/g,"cẩu máy lên"],[/quick montage of/g,"dựng nhanh nhiều"],
    [/static tripod, then slow push-in/g,"máy đứng yên trên chân rồi đẩy chậm vào"],[/static tripod/g,"máy đứng yên trên chân"],[/static wide shot, gentle fade/g,"toàn cảnh tĩnh, mờ dần"],[/static/g,"máy đứng yên"],
    [/selfie-style handheld close-up/g,"cận cảnh cầm tay kiểu selfie"],[/selfie-style medium shot/g,"trung cảnh kiểu selfie"],[/selfie-style close-up/g,"cận cảnh kiểu selfie"],[/top-down handheld shot/g,"quay từ trên xuống, cầm tay"],
    [/top-down close-up/g,"cận cảnh từ trên xuống"],[/natural movement/g,"chuyển động tự nhiên"],[/handheld medium shots, natural feel/g,"trung cảnh cầm tay, cảm giác tự nhiên"],[/split-feel quick cut/g,"cắt nhanh kiểu chia đôi"],
    [/slow lateral tracking/g,"lia ngang chậm"],[/macro to medium/g,"từ macro ra trung cảnh"],[/slow motion close-up, rack focus/g,"cận cảnh quay chậm, chuyển tiêu điểm"],[/shallow depth of field/g,"xoá phông"],
    [/on the face/g,"vào khuôn mặt"],[/slow pull out/g,"kéo máy ra chậm"],[/quick handheld push/g,"đẩy nhanh bằng máy cầm tay"],[/then/g,"rồi"]
  ];
  // Dịch cụm dài trước để không bị cụm ngắn ("close-up") ăn mất cụm dài ("selfie-style handheld close-up").
  CAM_VI.sort((a, b) => b[0].source.length - a[0].source.length);
  const camVi = cam => CAM_VI.reduce((t, [re, v]) => t.replace(re, v), String(cam));
  const low1 = t => String(t).charAt(0).toLowerCase() + String(t).slice(1);
  const ratioVi = r => r === "9:16" ? "dọc 9:16" : r === "1:1" ? "vuông 1:1" : r === "4:5" ? "dọc 4:5" : r === "3:4" ? "dọc 3:4" : "ngang 16:9";

  // Nhận ngành từ ý tưởng (ví dụ "dầu gội" → mỹ phẩm) để bối cảnh không lệch khi học viên chọn nhầm ngành.
  const KEYWORDS = {
    beauty:["dầu gội","dầu xả","sữa tắm","serum","kem dưỡng","kem chống nắng","mỹ phẩm","son ","son môi","spa","làm đẹp","chăm sóc da","nước hoa","sữa rửa mặt","toner","trang điểm","nail","tóc","da mặt","mặt nạ"],
    fnb:["phở","bún","cơm","nhà hàng","quán ăn","bánh mì","lẩu","nướng","món ăn","đồ ăn","gà rán","pizza","bánh"],
    coffee:["cà phê","cafe","coffee","trà sữa","trà chanh","nước ép","sinh tố","đồ uống","matcha"],
    fashion:["áo","quần","váy","đầm","giày","túi xách","thời trang","dép","mũ"],
    realestate:["căn hộ","nhà đất","bất động sản","chung cư","biệt thự","đất nền"],
    edu:["khoá học","khóa học","tiếng anh","trung tâm","lớp học","học online","luyện thi"],
    travel:["du lịch","khách sạn","homestay","resort","tour"],
    auto:["ô tô","xe máy","xe hơi","oto","xe điện"],
    tech:["điện thoại","laptop","phần mềm","tai nghe","máy tính","app ","ứng dụng","camera"],
    health:["nha khoa","phòng khám","bệnh viện","niềng răng","răng"],
    fitness:["gym","yoga","thể hình","giảm cân","tập luyện"],
    baby:["mẹ và bé","em bé","sữa bột","bỉm","đồ chơi","trẻ em"],
    furniture:["nội thất","sofa","bàn ghế","gia dụng","nồi","chảo","máy lọc"],
    agri:["nông sản","trái cây","gạo","đặc sản","ocop","mật ong","rau sạch"],
    finance:["bảo hiểm","ngân hàng","khoản vay","tài chính","đầu tư"],
    wedding:["đám cưới","tiệc cưới","sự kiện","studio ảnh","chụp cưới"],
    pet:["chó","mèo","thú cưng","pet"],
    jewelry:["trang sức","nhẫn","kim cương","dây chuyền","đồng hồ"]
  };
  function lookFor(o) {
    const text = (" " + (o.idea || "") + " " + (o.brand || "") + " ").toLowerCase();
    const hit = k => (KEYWORDS[k] || []).some(w => text.includes(w));
    const keep = ["affiliate","story","other"].includes(o.industry) || hit(o.industry);
    const found = keep ? null : Object.keys(KEYWORDS).find(hit);
    const key = LOOK[found || o.industry] ? (found || o.industry) : "other";
    return { look: LOOK[key], vi: LOOK_VI[key] || LOOK_VI.other, autoIndustry: found || "" };
  }
  // Tên sản phẩm cho prompt tiếng Anh: luôn kèm mô tả từ ý tưởng để AI tạo video hiểu đúng sản phẩm.
  function productEn(o, idea) {
    const brand = (o.brand || "").trim(), what = idea.slice(0, 110);
    return brand ? `"${brand}" (${what})` : `the product "${what}"`;
  }

  // Nhịp cảnh theo mục đích video: vai trò, mô tả tiếng Việt, hành động & góc máy (tiếng Anh), lời thoại mẫu.
  const BEATS = {
    ads: [
      { role:"Hook", vi:"Mở đầu gây chú ý: khoảnh khắc đẹp nhất của {sp} xuất hiện bất ngờ", act:"a striking reveal of {sp}, catching the viewer's attention in the first second", cam:"extreme close-up, fast push-in", say:"Khoan đã! Bạn đã thử {sp} chưa?" },
      { role:"Vấn đề", vi:"Nhân vật gặp đúng nỗi băn khoăn mà {sp} giải quyết", act:"{who} looks frustrated with the everyday problem that {sp} solves", cam:"medium shot, handheld, slight dolly-in", say:"Mình từng rất mệt mỏi vì chuyện này…" },
      { role:"Giải pháp", vi:"{sp} xuất hiện, nhân vật dùng thử", act:"{who} discovers and uses {sp}, a smile appears", cam:"medium close-up, smooth tracking shot", say:"Cho đến khi mình tìm ra {sp}." },
      { role:"Lợi ích", vi:"Cận cảnh chi tiết, chất lượng, điểm nổi bật của {sp}", act:"macro details of {sp}: texture, quality and standout features", cam:"macro shot, slow orbit around the product", say:"Chất lượng thấy rõ ngay từ lần đầu." },
      { role:"Cảm xúc", vi:"Nhân vật vui vẻ, tự tin sau khi dùng {sp}", act:"{who} enjoys the result, confident and happy in daily life", cam:"wide shot, slow crane up", say:"Giờ thì mình hoàn toàn yên tâm." },
      { role:"Chứng minh", vi:"Khách hàng hài lòng, đánh giá tốt", act:"several happy customers enjoying {sp}, genuine smiles", cam:"quick montage of medium shots", say:"Hàng nghìn khách đã tin chọn." },
      { role:"CTA", vi:"Sản phẩm đặt giữa khung hình, lời kêu gọi mua ngay", act:"{sp} placed hero-center as {who} gestures invitingly toward the camera", cam:"medium shot, static tripod, then slow push-in", say:"{cta}" }
    ],
    brand: [
      { role:"Hook", vi:"Toàn cảnh đẹp nhất của {sp}", act:"a breathtaking establishing view introducing {sp}", cam:"aerial drone shot, slow forward glide", say:"Câu chuyện của {sp} bắt đầu từ đây." },
      { role:"Câu chuyện", vi:"Người sáng lập kể về khởi đầu", act:"{who} reflects on the beginning of the brand, warm memories", cam:"medium shot, slow push-in", say:"Chúng tôi bắt đầu từ một ước mơ nhỏ." },
      { role:"Tay nghề", vi:"Bàn tay làm nghề tỉ mỉ, chăm chút từng chi tiết", act:"skilled hands carefully crafting {sp}, attention to every detail", cam:"close-up, slow lateral tracking", say:"Mỗi chi tiết đều được làm bằng cả tâm huyết." },
      { role:"Sản phẩm", vi:"{sp} hoàn thiện, đẹp và chất lượng", act:"the finished {sp} presented beautifully", cam:"macro to medium, slow orbit", say:"Đây là thành quả chúng tôi tự hào." },
      { role:"Khách hàng", vi:"Khách hàng hạnh phúc khi dùng {sp}", act:"happy customers sharing joyful moments with {sp}", cam:"handheld medium shots, natural feel", say:"Niềm vui của bạn là động lực của chúng tôi." },
      { role:"Giá trị", vi:"Thông điệp giá trị thương hiệu", act:"{who} looks toward the horizon, inspiring brand moment", cam:"wide shot, slow crane up", say:"Chất lượng thật — giá trị thật." },
      { role:"CTA", vi:"Kết bằng lời mời gọi", act:"{sp} in a clean hero composition, warm closing moment", cam:"static wide shot, gentle fade", say:"{cta}" }
    ],
    ugc: [
      { role:"Hook", vi:"Người thật cầm {sp} nói thẳng vào camera", act:"{who} holds {sp} up to the camera with an excited expression", cam:"selfie-style handheld close-up", say:"Mọi người ơi, món này đỉnh thật sự!" },
      { role:"Mở hộp", vi:"Mở hộp, cho xem bao bì và sản phẩm", act:"{who} unboxes {sp}, showing the packaging and contents", cam:"top-down handheld shot", say:"Mở hộp cùng mình nha, đóng gói xịn lắm." },
      { role:"Dùng thử", vi:"Dùng thử ngay trước camera", act:"{who} tries {sp} for the first time, genuine reaction", cam:"medium close-up, handheld, natural movement", say:"Thử luôn nè… ôi, khác hẳn luôn!" },
      { role:"Chi tiết", vi:"Cận chi tiết điểm thích nhất", act:"close-up of {who}'s favorite detail of {sp}", cam:"macro handheld shot", say:"Điểm mình thích nhất là chỗ này." },
      { role:"So sánh", vi:"So sánh trước – sau", act:"a quick before-and-after comparison using {sp}", cam:"split-feel quick cut, handheld", say:"Trước và sau khác biệt rõ ràng luôn." },
      { role:"Kết luận", vi:"Đánh giá thật lòng", act:"{who} gives an honest thumbs-up verdict", cam:"selfie-style medium shot", say:"Đánh giá thật: 10 điểm, không có nhưng." },
      { role:"CTA", vi:"Chỉ vào giỏ hàng", act:"{who} points down toward the shopping cart area of the screen", cam:"selfie-style close-up, static", say:"{cta}" }
    ],
    story: [
      { role:"Mở đầu", vi:"Bối cảnh và nhân vật chính", act:"{who} in a quiet everyday moment, setting the scene", cam:"wide establishing shot, slow dolly-in", say:"Ngày hôm ấy, mọi thứ vẫn bình thường như mọi ngày…" },
      { role:"Biến cố", vi:"Một sự việc bất ngờ xảy ra", act:"something unexpected happens to {who}, a moment of surprise", cam:"medium shot, quick handheld push", say:"Cho đến khi chuyện đó xảy ra." },
      { role:"Mâu thuẫn", vi:"Nhân vật đối mặt khó khăn", act:"{who} struggles with the challenge, emotional tension", cam:"close-up on the face, shallow depth of field", say:"Mình đã nghĩ mình không làm được." },
      { role:"Bước ngoặt", vi:"{sp} xuất hiện như chìa khoá", act:"{sp} appears and changes everything for {who}", cam:"slow motion close-up, rack focus", say:"Nhưng rồi một điều nhỏ đã thay đổi tất cả." },
      { role:"Cao trào", vi:"Nhân vật vượt qua thử thách", act:"{who} overcomes the challenge in an emotional peak moment", cam:"low-angle tracking shot, crane up", say:"Và mình đã làm được!" },
      { role:"Kết", vi:"Khoảnh khắc ấm áp, ý nghĩa", act:"a warm, meaningful ending moment for {who}", cam:"wide shot, slow pull out", say:"Hạnh phúc đôi khi chỉ đơn giản như vậy." },
      { role:"CTA", vi:"Lời mời theo dõi / hành động", act:"{who} turns toward the camera with a gentle smile", cam:"medium shot, static", say:"{cta}" }
    ],
    howto: [
      { role:"Hook", vi:"Nêu vấn đề nhiều người gặp", act:"{who} faces a common problem, looks at the camera knowingly", cam:"medium close-up, handheld", say:"Bạn có hay gặp chuyện này không?" },
      { role:"Bước 1", vi:"Bước 1 với {sp}", act:"{who} demonstrates step one with {sp}, clear hand movements", cam:"top-down close-up, static", say:"Bước một: chuẩn bị thế này." },
      { role:"Bước 2", vi:"Bước 2 chi tiết", act:"{who} demonstrates step two, precise and easy to follow", cam:"close-up, slow push-in", say:"Bước hai: làm nhẹ nhàng như vầy." },
      { role:"Bước 3", vi:"Bước 3 hoàn thiện", act:"{who} completes step three with a satisfying finish", cam:"medium shot, smooth tracking", say:"Bước ba: hoàn thiện là xong." },
      { role:"Kết quả", vi:"Khoe kết quả", act:"the impressive final result made with {sp}", cam:"macro reveal, slow orbit", say:"Kết quả đây, dễ không nào!" },
      { role:"Mẹo", vi:"Mẹo nhỏ thêm", act:"{who} shares a quick bonus tip with {sp}", cam:"medium close-up, static", say:"Mẹo nhỏ: làm thêm bước này sẽ đẹp hơn nữa." },
      { role:"CTA", vi:"Kêu gọi lưu lại / mua", act:"{who} smiles and points to the camera", cam:"medium shot, static", say:"{cta}" }
    ]
  };

  // Chọn n nhịp từ cấu trúc, giữ đúng thứ tự câu chuyện: Hook đầu, CTA cuối, các nhịp giữa trải đều
  // (ít cảnh thì bỏ bớt, nhiều cảnh thì nhịp giữa được kéo dài thành phần 1, phần 2…).
  function pickBeats(list, n) {
    if (n <= 1) return [list[0]];
    if (n === 2) return [list[0], list[list.length - 1]];
    const mid = list.slice(1, -1), take = n - 2, out = [list[0]], seen = {};
    for (let i = 0; i < take; i++) {
      const b = take <= mid.length ? mid[Math.round(i * (mid.length - 1) / Math.max(1, take - 1))] : mid[Math.floor(i * mid.length / take)];
      seen[b.role] = (seen[b.role] || 0) + 1;
      out.push(seen[b.role] > 1 ? Object.assign({}, b, { role: b.role + " (phần " + seen[b.role] + ")" }) : b);
    }
    out.push(list[list.length - 1]);
    return out;
  }
  const fill = (s, v) => String(s).replace(/\{(\w+)\}/g, (_, k) => v[k] != null ? v[k] : "");
  const ratioWord = r => r === "9:16" ? "vertical 9:16" : r === "1:1" ? "square 1:1" : r === "4:5" ? "portrait 4:5" : r === "3:4" ? "portrait 3:4" : "horizontal 16:9";

  // Cú pháp video riêng của từng phần mềm.
  function videoPrompt(target, c) {
    const st = c.style ? c.style + ", " : "";
    const talk = c.line ? c.line : "";
    switch (target) {
      case "veo3": return [
        `${cap(c.cam)}, 35mm lens. ${cap(c.act)}. Subject: ${c.char}. Scene: ${c.look.set}, with ${c.look.props}.`,
        `Lighting & style: ${c.look.light}, ${st}${c.look.palette} palette, photorealistic cinematic look, ${ratioWord(c.ratio)}.`,
        talk ? (c.voice === "vo" ? `Narration (Vietnamese voice-over): "${talk}"` : `Dialogue: The character says in Vietnamese: "${talk}"`) : "",
        `SFX: ${c.look.sfx}.`, `Ambience: natural ambient sound of ${c.look.set}.`,
        "No subtitles, no on-screen text, no watermark."
      ].filter(Boolean).join("\n");
      case "kling": return `${cap(c.act)}, ${c.char}, in ${c.look.set}, ${c.look.props}. Camera: ${c.cam}. ${cap(c.look.light)}, ${st}${c.look.palette} tones, cinematic realistic style, smooth natural motion.` + (talk ? ` Sound: ${c.look.sfx}; the character says in Vietnamese: "${talk}"` : ` Sound: ${c.look.sfx}.`);
      case "sora2": return [
        `Style: ${st}cinematic, photorealistic, ${c.look.palette} color grade, ${ratioWord(c.ratio)}.`,
        `${cap(c.char)} in ${c.look.set}, surrounded by ${c.look.props}. ${cap(c.look.light)}.`,
        `Cinematography: ${c.cam}, 35mm lens, shallow depth of field.`,
        `Actions:\n- Beat 1: ${c.act}.\n- Beat 2: the moment settles, natural body movement and expression.`,
        talk ? `Dialogue:\n- ${c.voice === "vo" ? "Narrator (Vietnamese)" : "Character (Vietnamese)"}: "${talk}"` : "",
        `Sound: ${c.look.sfx}.`
      ].filter(Boolean).join("\n");
      case "seedance": return [
        `${cap(c.char)} in ${c.look.set}, ${st}${c.look.light}, ${c.look.palette} palette, cinematic realism.`,
        `Shot 1: wide establishing shot, slow push in, revealing ${c.look.set} with ${c.look.props}.`,
        `Shot 2: ${c.cam}, ${c.act}.`,
        `Shot 3: close-up detail, slow push in, emotional reaction.`,
        `Sound: ${c.look.sfx}.` + (talk ? ` Vietnamese line: "${talk}"` : "")
      ].join("\n");
      case "grok": return `${cap(c.char)} — ${c.act}, in ${c.look.set}, ${c.cam}, ${c.look.light}, ${st}cinematic photoreal style, vivid ${c.look.palette} colors.` + `\nAudio: ${c.look.sfx}` + (talk ? `; Vietnamese line: "${talk}"` : "") + ".";
      case "hailuo": return `${cap(c.char)}, ${c.act} ${hailuoCmd(c.cam)}, in ${c.look.set} with ${c.look.props}, expressive face and realistic physics, ${c.look.light}, ${st}cinematic style, ${c.look.palette} tones.`;
      case "wan": return [
        `Subject: ${c.char}.`, `Scene: ${c.look.set}, ${c.look.props}.`, `Motion: ${c.act}.`,
        `Camera language: ${c.cam}.`, `Atmosphere: ${c.look.light}, ${c.look.palette} palette.`,
        `Style: ${st}photorealistic cinematic, ${ratioWord(c.ratio)}.`,
        `Audio: ${c.look.sfx}` + (talk ? `; Vietnamese line: "${talk}"` : "") + "."
      ].join("\n");
      default: return `${cap(c.act)}. ${c.char}. ${c.look.set}. ${c.cam}. ${c.look.light}.`;
    }
  }
  function hailuoCmd(cam) {
    const m = cam.toLowerCase();
    if (/orbit/.test(m)) return "[Truck left, Pan right]";
    if (/crane up|tilt up/.test(m)) return "[Pedestal up]";
    if (/pull out|fade/.test(m)) return "[Pull out]";
    if (/tracking|follow/.test(m)) return "[Tracking shot]";
    if (/static|tripod/.test(m)) return "[Static shot]";
    if (/handheld/.test(m)) return "[Shake]";
    if (/push|dolly-in|zoom/.test(m)) return "[Push in]";
    return "[Push in]";
  }
  const cap = s => String(s).charAt(0).toUpperCase() + String(s).slice(1);

  // Bản dịch tiếng Việt của prompt video (cùng bố cục với bản tiếng Anh để người học đối chiếu).
  function videoPromptVi(target, c) {
    const st = c.style ? c.style + ", " : "";
    const say = c.line ? (c.voice === "vo" ? `Lời dẫn (tiếng Việt): “${c.line}”` : `Lời thoại: nhân vật nói tiếng Việt “${c.line}”`) : "";
    const cam = camVi(c.cam);
    switch (target) {
      case "seedance": return [
        `${cap(c.vi.person)} trong ${c.vi.set}, ${c.vi.light}, tông màu ${c.vi.palette}, ${st}phong cách điện ảnh chân thực.`,
        `Shot 1: toàn cảnh mở đầu, đẩy máy chậm vào, cho thấy ${c.vi.set} với ${c.vi.props}.`,
        `Shot 2: ${cam}, ${low1(c.what)}.`,
        `Shot 3: cận cảnh chi tiết, đẩy máy chậm vào, biểu cảm cảm xúc.`,
        `Âm thanh: ${c.vi.sfx}.` + (c.line ? ` Câu thoại tiếng Việt: “${c.line}”` : "")
      ].join("\n");
      case "hailuo": return `${cap(c.vi.person)}, ${low1(c.what)} [lệnh máy quay: ${cam}], trong ${c.vi.set} với ${c.vi.props}, biểu cảm rõ và chuyển động vật lý chân thực, ${c.vi.light}, ${st}phong cách điện ảnh, tông ${c.vi.palette}.`;
      default: return [
        `Góc máy: ${cam}. Diễn biến: ${c.what}.`,
        `Nhân vật: ${c.vi.person}. Bối cảnh: ${c.vi.set}, có ${c.vi.props}.`,
        `Ánh sáng & phong cách: ${c.vi.light}, tông màu ${c.vi.palette}, ${st}chân thực kiểu điện ảnh, khung ${ratioVi(c.ratio)}.`,
        say,
        `Âm thanh: ${c.vi.sfx}.`,
        target === "veo3" ? "Không phụ đề, không chữ trên hình, không logo chìm." : ""
      ].filter(Boolean).join("\n");
    }
  }

  function quickVideo(o, T) {
    const { look, vi, autoIndustry } = lookFor(o);
    const tg = T.TARGETS.find(t => t.key === o.target) || T.TARGETS[0];
    const n = Math.min(12, Math.max(1, Number(o.scenes) || 5));
    const dur = tg.durs.includes(Number(o.dur)) ? Number(o.dur) : tg.dur;
    const idea = String(o.idea || "").trim();
    const sp = (o.brand || "").trim() || idea.slice(0, 60) || "sản phẩm";
    const spEn = productEn(o, idea);
    const char = look.person;
    const beats = pickBeats(BEATS[o.purpose] || BEATS.ads, n);
    const scenes = beats.map((b, i) => {
      const line = o.voice === "none" ? "" : fill(b.say, { sp, cta: look.cta });
      const act = fill(b.act, { sp: spEn, who: "the character" });
      const c = { act, cam: b.cam, char, look, style: o.style, ratio: o.ratio, voice: o.voice, line };
      return {
        n: i + 1, purpose: b.role,
        description_vi: fill(b.vi, { sp }) + ".",
        video_prompt_vi: videoPromptVi(tg.key, { what: fill(b.vi, { sp }), cam: b.cam, vi, style: o.style, ratio: o.ratio, voice: o.voice, line, sp }),
        image_prompt_vi: `Ảnh khung đầu: ${vi.person}; ${low1(fill(b.vi, { sp }))}; bối cảnh ${vi.set}, có ${vi.props}; ${vi.light}; tông màu ${vi.palette}${o.style ? "; phong cách " + o.style : ""}; ảnh chân thực, khung ${ratioVi(o.ratio)}.`,
        camera: b.cam, image_prompt: `${cap(char)}, ${act}, in ${look.set}, ${look.props}, ${look.light}, ${o.style ? o.style + ", " : ""}${look.palette} palette, photorealistic, ${ratioWord(o.ratio)} composition, first frame of a video scene.`,
        video_prompt: videoPrompt(tg.key, c),
        negative_prompt: tg.negative ? "blurry, distorted face, extra fingers, deformed hands, warped text, watermark, flicker, low quality" : "",
        dialogue_vi: line, sound: look.sfx
      };
    });
    return {
      title: (o.brand ? o.brand + " — " : "") + idea.slice(0, 60),
      hook: scenes[0].dialogue_vi || scenes[0].description_vi,
      character: char,
      scenes,
      caption_vi: `${sp === "sản phẩm" ? idea.slice(0, 80) : sp} ✨ ${look.cta}`,
      hashtags: ["#" + (o.brand || "video").replace(/[^\p{L}\p{N}]/gu, ""), "#xuhuong", "#review"],
      quick: true, dur, autoIndustry
    };
  }

  // Bộ ảnh: vai trò từng ảnh theo loại bộ ảnh.
  const SHOTS = {
    ads: [["Ảnh chủ đạo","hero shot of {sp} center frame with dramatic lighting, clean space at the top for headline","Sản phẩm giữa khung, chừa khoảng trên cho tiêu đề","{brand}"],
          ["Lợi ích chính","{sp} with visual cues of its main benefit, dynamic composition","Sản phẩm lệch trái, biểu tượng lợi ích bên phải","Lợi ích nổi bật"],
          ["Lifestyle","{who} happily using {sp} in daily life","Người dùng 2/3 khung, sản phẩm rõ nét","Dùng mỗi ngày"],
          ["Ưu đãi","{sp} with festive props and confetti, bold promotional mood","Sản phẩm dưới, khoảng trống lớn cho chữ ưu đãi","ƯU ĐÃI HÔM NAY"],
          ["Trước – sau","split composition before and after using {sp}","Chia đôi khung trái/phải","Trước / Sau"],
          ["Khách hàng","several happy customers holding {sp}, authentic smiles","Nhóm người, sản phẩm ở giữa","Hàng nghìn khách tin chọn"]],
    product: [["Chính diện nền trắng","front view of {sp} on a seamless pure white background, e-commerce packshot","Sản phẩm giữa khung, nền trắng trơn",""],
          ["Góc 3/4","three-quarter angle view of {sp}, showing depth and form","Sản phẩm xoay 45 độ",""],
          ["Cận chất liệu","macro close-up of {sp} texture and material details","Cận cảnh chi tiết, xoá phông",""],
          ["Trong bối cảnh","{sp} placed naturally in its real-use setting","Sản phẩm trong không gian sử dụng",""],
          ["Flatlay","top-down flatlay of {sp} with complementary props","Chụp từ trên xuống, bố cục cân đối",""],
          ["Combo","a set of {sp} variants arranged as a combo","Nhóm sản phẩm xếp tầng",""]],
    character: [["Ảnh tham chiếu toàn thân","full-body reference of {who}, standing straight facing camera, plain light grey background","Toàn thân, nền trơn",""],
          ["Chân dung cận","portrait close-up of {who}, neutral expression, soft key light","Cận mặt, ngang vai",""],
          ["Biểu cảm vui","{who} laughing joyfully, same outfit and hairstyle","Bán thân",""],
          ["Biểu cảm ngạc nhiên","{who} surprised expression, same outfit and hairstyle","Bán thân",""],
          ["Trong bối cảnh","{who} in the main setting, natural pose","Toàn cảnh, nhân vật 1/3 khung",""],
          ["Đang hành động","{who} interacting with {sp}","Trung cảnh",""]],
    thumbnail: [["Phương án 1","{who} with an exaggerated shocked face pointing at {sp}, high contrast","Mặt người bên trái, sản phẩm bên phải, chữ to phía trên","WOW!"],
          ["Phương án 2","{sp} glowing at the center with bold colorful background rays","Sản phẩm giữa, tia sáng toả","BÍ MẬT"],
          ["Phương án 3","{who} giving a thumbs up next to {sp}, bright saturated colors","Người bên phải, chữ bên trái","ĐÁNG MUA?"],
          ["Phương án 4","before-and-after split with {who} and {sp}","Chia đôi khung","TRƯỚC – SAU"]],
    carousel: [["Trang bìa","eye-catching cover featuring {sp}, bold layout","Tiêu đề lớn giữa trang","{brand}"],
          ["Ý 1","clean illustration of the first key point about {sp}","Số 1 lớn + hình minh hoạ","Điều 1"],
          ["Ý 2","clean illustration of the second key point about {sp}","Số 2 lớn + hình minh hoạ","Điều 2"],
          ["Ý 3","clean illustration of the third key point about {sp}","Số 3 lớn + hình minh hoạ","Điều 3"],
          ["Ý 4","clean illustration of the fourth key point about {sp}","Số 4 lớn + hình minh hoạ","Điều 4"],
          ["Trang CTA","closing page with {sp} and a clear call to action","Sản phẩm + nút kêu gọi","Lưu lại & chia sẻ"]],
    poster: [["Phương án 1","event poster with {sp} as the dramatic centerpiece","Tiêu đề trên, hình giữa, thông tin dưới","{brand}"],
          ["Phương án 2","minimal elegant poster featuring {sp} with lots of negative space","Tối giản, chữ nhỏ tinh tế","{brand}"],
          ["Phương án 3","energetic festive poster with {sp}, confetti and bold shapes","Bố cục chéo năng động","SỰ KIỆN ĐẶC BIỆT"]],
    storyboard: [["Khung 1","opening frame: {who} establishing the story","Toàn cảnh",""],
          ["Khung 2","{who} encounters {sp} for the first time","Trung cảnh",""],
          ["Khung 3","close-up emotional reaction of {who}","Cận mặt",""],
          ["Khung 4","{who} using {sp}, turning point","Trung cảnh",""],
          ["Khung 5","happy resolution with {sp}","Toàn cảnh",""],
          ["Khung 6","final hero frame of {sp}","Cận sản phẩm",""]]
  };

  function imagePrompt(target, c, ratio) {
    const st = c.style ? c.style + ", " : "";
    const text = c.text ? c.text : "";
    switch (target) {
      case "midjourney": return `${c.subject}, ${c.look.set}, ${c.look.light}, ${st}${c.look.palette} palette, editorial commercial photography, 85mm, ultra detailed --ar ${ratio} --v 7 --style raw --s 200 --no text, watermark, extra fingers`;
      case "nanobanana": return `A high-end commercial photo of ${c.subject}, set in ${c.look.set}. ${cap(c.look.light)}. Shot on an 85mm lens with shallow depth of field. ${st}${cap(c.look.palette)} color palette, photorealistic.` + (text ? ` Add the headline "${text}" in bold clean sans-serif text, clearly legible.` : "") + ` Aspect ratio ${ratio}.`;
      case "chatgpt": return `Create a ${ratio} image.\nSubject: ${c.subject}.\nScene: ${c.look.set}.\nComposition: ${c.layoutEn}.\nLighting: ${c.look.light}.\nStyle: ${st}photorealistic commercial photography, ${c.look.palette} palette.` + (text ? `\nText on image: "${text}" — bold sans-serif, high contrast, placed where the composition leaves space.` : "\nText on image: none.") + `\nAvoid: watermark, distorted hands, blurry details.`;
      case "seedream": return `${cap(c.subject)}, in ${c.look.set}, ${c.layoutEn}, ${c.look.light}, ${st}commercial photography, ultra detailed, realistic skin texture, ${c.look.palette} palette` + (text ? `, with the text "${text}" at the top` : "") + `, aspect ratio ${ratio}.`;
      case "flux": return `${cap(c.subject)} in ${c.look.set}, ${c.layoutEn}. ${cap(c.look.light)}, shot on 35mm at f/1.8, ${st}${c.look.palette} tones, photorealistic detail.` + (text ? ` The text "${text}" appears in a bold modern font.` : "") + ` Aspect ratio ${ratio}.`;
      case "grok": return `${cap(c.subject)} in ${c.look.set}, ${c.look.light}, ${st}photoreal commercial style, vivid ${c.look.palette} colors, aspect ratio ${ratio}.`;
      default: return c.subject;
    }
  }

  function quickImages(o, T) {
    const { look, vi, autoIndustry } = lookFor(o);
    const tg = T.IMAGE_TARGETS.find(t => t.key === o.target) || T.IMAGE_TARGETS[0];
    const n = Math.min(12, Math.max(1, Number(o.count) || 6));
    const ratio = ["1:1","4:5","9:16","16:9","3:4","2:3"].includes(o.ratio) ? o.ratio : "1:1";
    const idea = String(o.idea || "").trim();
    const spEn = productEn(o, idea);
    const list = SHOTS[o.purpose] || SHOTS.ads;
    const images = Array.from({ length: n }, (_, i) => {
      const [role, en, layout, text] = list[i % list.length];
      const round = Math.floor(i / list.length);
      const subject = fill(en, { sp: spEn, who: look.person, set: look.set }) + (round ? `, alternative variation ${round + 1}` : "");
      const t = fill(text, { brand: (o.brand || "").trim() || "ƯU ĐÃI" });
      return {
        n: i + 1, purpose: role + (round ? " (phương án " + (round + 1) + ")" : ""),
        description_vi: (o.brand || "").trim() ? role + " của " + o.brand.trim() + "." : role + " theo ý tưởng: " + idea.slice(0, 120) + ".", layout,
        prompt: imagePrompt(tg.key, { subject, look, style: o.style, text: t, layoutEn: layout ? "balanced composition, " + (role === "Ảnh chủ đạo" ? "product centered with headline space" : "clear focal point") : "balanced composition" }, ratio),
        prompt_vi: [
          `${role}${round ? " (phương án " + (round + 1) + ")" : ""} cho ${(o.brand || "").trim() ? "“" + o.brand.trim() + "” (" + idea.slice(0, 80) + ")" : "sản phẩm “" + idea.slice(0, 80) + "”"}.`,
          layout ? `Bố cục: ${layout}.` : "",
          o.purpose === "character" || o.purpose === "storyboard" ? `Nhân vật: ${vi.person}.` : "",
          `Bối cảnh: ${vi.set}. Ánh sáng: ${vi.light}. Tông màu: ${vi.palette}.`,
          `Phong cách: ${o.style ? o.style + ", " : ""}ảnh quảng cáo chân thực, nét cao. Tỉ lệ ${ratio}.`,
          t ? `Chữ trên ảnh: “${t}”.` : "",
          tg.key === "midjourney" ? "Phần tham số cuối (--ar, --v 7, --style raw, --s, --no …) giữ nguyên khi dán vào Midjourney." : ""
        ].filter(Boolean).join(" "),
        text_overlay: t
      };
    });
    return {
      title: (o.brand ? o.brand + " — " : "") + idea.slice(0, 60), concept: "Bộ ảnh " + (T.IMAGE_PURPOSES.find(p => p.key === o.purpose) || T.IMAGE_PURPOSES[0]).label.toLowerCase(),
      character: o.purpose === "character" ? look.person : "", palette: look.palette, images,
      caption_vi: `${(o.brand || "").trim() || idea.slice(0, 80)} ✨ ${look.cta}`, hashtags: ["#" + (o.brand || "anh").replace(/[^\p{L}\p{N}]/gu, ""), "#xuhuong"],
      quick: true, autoIndustry
    };
  }

  const api = { quickVideo, quickImages };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.StudioQuick = api;
})(typeof window !== "undefined" ? window : globalThis);
