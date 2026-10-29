// Hẹn giờ chạy nền cho Muse Studio: Chrome làm chậm hẹn giờ của tab bị ẩn (tới 1 phút/lần),
// còn worker thì không — nhờ vậy theo dõi tiến độ tạo cảnh vẫn đều khi học viên chuyển sang tab khác.
onmessage = e => { setTimeout(() => postMessage(e.data), e.data.ms); };
