// Áp dụng chế độ sáng/tối đã chọn trước khi trang hiển thị, tránh bị nháy màu.
// Nạp đồng bộ trong <head>; chưa chọn thì theo cài đặt của hệ điều hành.
(function () {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  } catch (e) { /* trình duyệt chặn localStorage: dùng theo hệ điều hành */ }
})();
