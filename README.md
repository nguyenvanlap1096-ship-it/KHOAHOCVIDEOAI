# Demia – Nền tảng khóa học trực tuyến

Website học trực tuyến viết bằng **Node.js (Express + EJS)**, cơ sở dữ liệu **MySQL**.

## Tính năng

- **Học viên:** đăng ký / đăng nhập, xem danh sách khóa học, tìm kiếm & lọc theo trình độ, học qua video, tự động lưu tiến độ, tiếp tục học từ vị trí đang xem dở, lưu khóa học yêu thích.
- **Video:** nhúng YouTube *hoặc* tự upload file MP4/WebM lên server (chỉ người đã đăng nhập mới xem được).
- **Ảnh thumbnail:** admin tải lên / đổi / xóa ảnh bìa khóa học và ảnh thumbnail từng bài (JPG, PNG, WebP ≤ 5 MB).
- **Video mới cập nhật:** mục trên trang chủ và trang `/videos`, gắn nhãn "Mới" / "Cập nhật" trong 7 ngày.
- **Thư viện prompt theo ngành nghề (`/prompts`):** lọc theo ngành, tìm kiếm, sao chép một chạm, tô sáng phần cần điền `[trong ngoặc vuông]`. Có sẵn 23 prompt cho 10 ngành.
- **Chương trình Video AI:** 17 module (00 → 16), 169 bài học: ChatGPT, Gemini, Grok, AI tạo ảnh, VEO3, Kling, giọng nói, âm nhạc, dựng video và các module thực chiến (quảng cáo, affiliate, giải trí, giáo dục). Dữ liệu ở `src/db/seed-data/curriculum.js`.
- **Hỗ trợ Zalo:** nút Zalo nổi ở mọi trang, kèm mã QR và số điện thoại – cấu hình tại `/admin/settings`.
- **Trang quản trị (`/admin`):** thống kê, thêm/sửa/xóa khóa học và bài học, sắp xếp thứ tự bài, quản lý prompt & ngành nghề, cài đặt Zalo, cấp quyền admin cho người dùng.
- **Giao diện:** tiếng Việt, responsive (máy tính, tablet, điện thoại), tự chuyển chế độ tối theo hệ điều hành.
- **Bảo mật:** mật khẩu mã hóa bcrypt, chống CSRF, giới hạn số lần đăng nhập sai, HTTP security headers (Helmet), cookie phiên `httpOnly`.

## Chạy thử trên máy

Yêu cầu: Node.js 22 trở lên (để chạy thử bằng SQLite có sẵn; khi chạy thật với MySQL thì Node 20 là đủ).

```bash
npm install
cp .env.example .env     # rồi chỉnh .env: DB_CLIENT=sqlite, NODE_ENV=development, ADMIN_EMAIL, ADMIN_PASSWORD
npm run dev
```

Mở http://localhost:3000. Đăng nhập bằng `ADMIN_EMAIL` / `ADMIN_PASSWORD` trong `.env` để vào trang quản trị.

Khi chưa có MySQL, website tự dùng SQLite (`data/dev.sqlite`) và nạp sẵn 4 khóa học mẫu.

## Cấu trúc thư mục

```
server.js               Điểm khởi động
src/
  app.js                Cấu hình Express, bảo mật, session
  config.js             Đọc biến môi trường
  db/                   Kết nối CSDL, schema MySQL/SQLite, dữ liệu mẫu
  middleware/           Xác thực, CSRF
  routes/               public (trang học), auth, api (tiến độ), admin
  services/courses.js   Truy vấn khóa học & tiến độ
views/                  Giao diện EJS
public/                 CSS, JS, hình ảnh
docs/prototype.html     Bản mẫu giao diện tĩnh ban đầu
```

## Deploy

Xem hướng dẫn chi tiết từng bước trong [DEPLOY.md](DEPLOY.md).
