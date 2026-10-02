// Khóa học mẫu: Làm video bằng AI. Mỗi bài: [tiêu đề, thời lượng, tóm tắt, kiến thức chính, tài liệu]
module.exports = {
  slug: 'lam-video-bang-ai',
  title: 'Làm video bằng AI – Từ ý tưởng đến video hoàn chỉnh',
  description: 'Quy trình làm video ngắn bằng AI cho người không chuyên: viết kịch bản, tạo giọng đọc, hình ảnh, cảnh quay, người dẫn ảo và dựng video đăng TikTok, YouTube, Facebook.',
  level: 'Cơ bản',
  category: 'AI & Sáng tạo',
  color: '#E11D48',
  lessons: [
    [
      'Tổng quan: quy trình làm video bằng AI', '8:30',
      'Một video AI hoàn chỉnh đi qua 6 bước: ý tưởng → kịch bản → giọng đọc → hình ảnh & cảnh quay → dựng & phụ đề → đăng và đo hiệu quả. Bài này giúp bạn nhìn toàn cảnh, chọn công cụ phù hợp ngân sách và tránh các lỗi khiến video trông "giả".\n\nBạn không cần biết quay dựng chuyên nghiệp – chỉ cần biết ra lệnh (prompt) rõ ràng và kiểm soát chất lượng ở từng bước.',
      'Quy trình 6 bước làm video AI\nChọn công cụ miễn phí và trả phí theo nhu cầu\nĐịnh dạng dọc 9:16 và ngang 16:9\nNhững lỗi khiến video AI kém chuyên nghiệp',
      '',
    ],
    [
      'Lên ý tưởng & viết kịch bản với ChatGPT / Claude', '14:20',
      'Kịch bản quyết định 80% chất lượng video. Bạn sẽ học cách giao việc cho AI theo cấu trúc: vai trò – mục tiêu – khán giả – độ dài – giọng văn, và cách yêu cầu AI chia kịch bản thành từng cảnh kèm lời thoại và mô tả hình ảnh.\n\nMở Thư viện prompt → ngành "Làm video AI" để lấy prompt mẫu dùng ngay.',
      'Cấu trúc Hook – Nội dung – Kêu gọi hành động\nViết hook 3 giây giữ chân người xem\nChia kịch bản thành bảng phân cảnh (storyboard)\nYêu cầu AI viết lại theo nhiều phiên bản để A/B test',
      'ChatGPT | https://chatgpt.com\nClaude | https://claude.ai',
    ],
    [
      'Tạo giọng đọc AI tiếng Việt tự nhiên', '12:10',
      'So sánh các công cụ chuyển văn bản thành giọng nói (TTS) hỗ trợ tiếng Việt, cách chọn giọng hợp thương hiệu, điều chỉnh tốc độ, ngắt nghỉ và cảm xúc để giọng đọc không bị "robot".\n\nLưu ý: chỉ nhân bản giọng nói (voice clone) khi có sự đồng ý của chủ giọng.',
      'Chọn giọng nam/nữ, vùng miền phù hợp\nDùng dấu câu để điều khiển nhịp đọc\nXuất file âm thanh chất lượng cao\nQuy định về nhân bản giọng nói',
      'ElevenLabs | https://elevenlabs.io\nVbee | https://vbee.vn\nFPT.AI | https://fpt.ai',
    ],
    [
      'Tạo hình ảnh & nhân vật nhất quán', '16:45',
      'Cách viết prompt hình ảnh gồm: chủ thể – hành động – bối cảnh – ánh sáng – góc máy – phong cách. Bạn sẽ học kỹ thuật giữ nhân vật giống nhau qua nhiều cảnh bằng ảnh tham chiếu và mô tả cố định.',
      'Công thức prompt hình ảnh 6 thành phần\nGiữ nhân vật nhất quán bằng ảnh tham chiếu\nTỉ lệ khung hình cho từng nền tảng\nTránh lỗi tay, chữ và khuôn mặt bị méo',
      'Midjourney | https://www.midjourney.com\nIdeogram | https://ideogram.ai\nLeonardo AI | https://leonardo.ai',
    ],
    [
      'Biến ảnh và văn bản thành video', '18:30',
      'Dùng các công cụ tạo video từ văn bản (text-to-video) và từ ảnh (image-to-video) như Runway, Kling, Luma, Google Veo. Bài học hướng dẫn mô tả chuyển động máy quay (zoom, pan, dolly), chuyển động chủ thể và cách ghép nhiều clip ngắn thành một câu chuyện.',
      'Text-to-video và image-to-video khác nhau thế nào\nMô tả chuyển động máy quay trong prompt\nTạo nhiều phiên bản và chọn clip tốt nhất\nTiết kiệm credit khi tạo video',
      'Runway | https://runwayml.com\nKling AI | https://klingai.com\nLuma Dream Machine | https://lumalabs.ai',
    ],
    [
      'Người dẫn chương trình ảo (Avatar AI)', '13:40',
      'Tạo video có người dẫn nói chuyện trước ống kính mà không cần quay: chọn avatar có sẵn hoặc tạo avatar từ chính bạn, đồng bộ khẩu hình với giọng đọc tiếng Việt, dùng cho video giới thiệu sản phẩm, bài giảng và chăm sóc khách hàng.\n\nTuyệt đối không dùng hình ảnh, giọng nói của người khác khi chưa được cho phép.',
      'Avatar có sẵn và avatar từ chính bạn\nĐồng bộ khẩu hình với giọng tiếng Việt\nỨng dụng trong bán hàng và đào tạo\nĐạo đức và pháp lý khi dùng avatar AI',
      'HeyGen | https://www.heygen.com\nSynthesia | https://www.synthesia.io',
    ],
    [
      'Dựng video, phụ đề tự động & nhạc nền với CapCut', '17:15',
      'Ghép giọng đọc, clip AI, hình ảnh và nhạc nền thành video hoàn chỉnh trong CapCut: cắt theo nhịp lời thoại, thêm phụ đề tự động tiếng Việt, hiệu ứng chuyển cảnh vừa phải và xuất video đúng chuẩn nền tảng.',
      'Dựng theo nhịp giọng đọc\nPhụ đề tự động và chỉnh lỗi chính tả\nChọn nhạc có bản quyền phù hợp\nXuất video 1080p, 9:16, 30fps',
      'CapCut | https://www.capcut.com',
    ],
    [
      'Tối ưu cho TikTok, YouTube Shorts & Facebook Reels', '11:50',
      'Video hay chưa đủ – cần tối ưu để thuật toán phân phối: hook trong 3 giây đầu, độ dài phù hợp, tiêu đề và hashtag, ảnh bìa, khung giờ đăng và cách đọc số liệu để cải thiện video tiếp theo. Một số nền tảng yêu cầu gắn nhãn nội dung do AI tạo – hãy tuân thủ.',
      'Hook 3 giây và tỉ lệ xem hết\nTiêu đề, mô tả và hashtag\nGắn nhãn nội dung tạo bằng AI\nĐọc số liệu để tối ưu video sau',
      '',
    ],
    [
      'Dự án cuối khóa: video quảng cáo 30 giây', '20:00',
      'Thực hành toàn bộ quy trình: chọn một sản phẩm, viết kịch bản 30 giây, tạo giọng đọc, 4–6 cảnh AI, dựng hoàn chỉnh kèm phụ đề và kêu gọi hành động. Cuối bài có checklist tự chấm điểm trước khi đăng.',
      'Brief sản phẩm và khán giả mục tiêu\nKịch bản 30 giây 5 cảnh\nDựng hoàn chỉnh và tự kiểm tra theo checklist\nĐăng và theo dõi kết quả 7 ngày đầu',
      '',
    ],
  ],
};
