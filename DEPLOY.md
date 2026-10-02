# Hướng dẫn đưa Demia lên GitHub và Hostinger

Tài liệu này dành cho người chưa có tài khoản GitHub lẫn Hostinger. Làm lần lượt từng phần.

> **Lưu ý bảo mật:** Không bao giờ đưa file `.env` (chứa mật khẩu) lên GitHub. File `.gitignore` đã chặn sẵn.

---

## Phần 1 – Đưa mã nguồn lên GitHub

### 1.1. Tạo tài khoản và repository

1. Vào https://github.com/signup và tạo tài khoản (miễn phí).
2. Vào https://github.com/new để tạo repository mới:
   - **Repository name:** `demia` (hoặc tên bạn muốn)
   - **Visibility:** chọn **Private** nếu không muốn người khác xem mã nguồn
   - **Không** tích *Add a README*, *.gitignore* hay *license* (dự án đã có sẵn)
3. Bấm **Create repository** và sao chép địa chỉ dạng `https://github.com/<tên-bạn>/demia.git`.

### 1.2. Đẩy mã nguồn lên

Mã nguồn đã được commit sẵn trên máy. Mở terminal trong thư mục dự án và chạy:

```bash
git remote add origin https://github.com/<tên-bạn>/demia.git
git push -u origin main
```

Lần đầu `git push`, Windows sẽ mở cửa sổ trình duyệt để bạn đăng nhập GitHub (Git Credential Manager). Đăng nhập xong, mã nguồn sẽ được tải lên.

Sau này mỗi lần sửa code:

```bash
git add -A
git commit -m "Mô tả thay đổi"
git push
```

---

## Phần 2 – Chọn gói Hostinger

Website dùng Node.js nên **cần gói hỗ trợ Node.js**:

| Gói | Chạy được Demia? | Ghi chú |
|-----|------------------|---------|
| **Business Web Hosting** / **Cloud Hosting** | Có | Có mục *Node.js Web App* trong hPanel, kết nối thẳng GitHub. **Khuyên dùng – dễ nhất.** |
| **VPS (KVM 1 trở lên)** | Có | Toàn quyền server, cần làm việc qua SSH. Linh hoạt nhất, phù hợp nếu upload nhiều video. |
| Premium / Single Web Hosting | Không | Chỉ chạy PHP/web tĩnh. |

Mua gói tại https://www.hostinger.com (bạn tự thanh toán). Gói Business thường kèm tên miền miễn phí năm đầu.

> Giao diện hPanel thay đổi theo thời gian; tên các mục bên dưới có thể hơi khác một chút.

---

## Phần 3A – Deploy trên Business / Cloud Hosting (khuyên dùng)

### 3A.1. Tạo cơ sở dữ liệu MySQL

1. hPanel → **Websites** → chọn website → **Databases** → **MySQL Databases**.
2. Tạo database mới, ghi lại 3 thông tin: **tên database**, **tên user**, **mật khẩu** (dạng `u123456789_demia`).
3. Ghi lại **MySQL host** hiển thị trên trang (thường là `localhost`; nếu khác thì dùng đúng giá trị hPanel ghi).

Không cần tạo bảng thủ công – website tự tạo bảng và nạp khóa học mẫu ở lần chạy đầu tiên.

### 3A.2. Tạo Node.js Web App từ GitHub

1. hPanel → **Websites** → **Add website** → chọn **Node.js Apps** (hoặc *Node.js Web App*).
2. Chọn **Import Git repository**, kết nối tài khoản GitHub và chọn repo `demia`, nhánh `main`.
3. Cấu hình build:
   - **Framework:** Express (hoặc *Other*)
   - **Node version:** 20 hoặc mới hơn
   - **Entry file / Start command:** `server.js` / `npm start`
   - **Build command:** để trống (hoặc `npm install`)
4. Mục **Environment variables**, thêm từng biến (lấy mẫu trong `.env.example`):

   | Biến | Giá trị |
   |------|---------|
   | `NODE_ENV` | `production` |
   | `SESSION_SECRET` | chuỗi ngẫu nhiên dài – tạo bằng lệnh bên dưới |
   | `DB_CLIENT` | `mysql` |
   | `DB_HOST` | host MySQL ở bước 3A.1 |
   | `DB_NAME` / `DB_USER` / `DB_PASSWORD` | thông tin ở bước 3A.1 |
   | `ADMIN_EMAIL` | email quản trị của bạn |
   | `ADMIN_PASSWORD` | mật khẩu quản trị mạnh (≥ 12 ký tự) |
   | `UPLOAD_DIR` | xem mục 3A.4 |

   Tạo `SESSION_SECRET` trên máy bạn:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   **Không** cần đặt `PORT` – Hostinger tự cấp.
5. Bấm **Deploy**. Khi xong, mở tên miền để kiểm tra, đăng nhập bằng `ADMIN_EMAIL`/`ADMIN_PASSWORD` rồi vào `/admin`.

Từ đây, mỗi lần `git push` lên nhánh `main`, bạn bấm **Redeploy** (hoặc bật tự động deploy nếu hPanel có tùy chọn này).

### 3A.3. HTTPS

hPanel → **Security** → **SSL**: bật SSL miễn phí cho tên miền. Website đã cấu hình cookie bảo mật và HSTS khi chạy `production`, nên **bắt buộc phải có HTTPS** – nếu truy cập bằng `http://` thì sẽ không đăng nhập được.

### 3A.4. Video tự upload

- Nên dùng **YouTube** (đặt video ở chế độ *Không công khai*) cho phần lớn bài giảng: không tốn dung lượng và băng thông hosting.
- Nếu tự upload, đặt `UPLOAD_DIR` trỏ ra **ngoài thư mục mã nguồn** (ví dụ `/home/u123456789/demia-uploads`) để video không bị mất khi redeploy. Kiểm tra đường dẫn thư mục home của bạn trong **File Manager**.
- Giới hạn mặc định 500 MB/video (`MAX_UPLOAD_MB`). Gói shared hosting có thể giới hạn kích thước request thấp hơn – nếu upload lỗi với file lớn, hãy dùng YouTube hoặc chuyển sang VPS.

---

## Phần 3B – Deploy trên VPS (Ubuntu)

Dành cho người quen dùng dòng lệnh. Kết nối SSH bằng thông tin trong hPanel → **VPS** → **SSH access**.

```bash
# 1. Cài Node.js 22, MySQL, Nginx, PM2
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs mysql-server nginx git
sudo npm install -g pm2

# 2. Tạo database
sudo mysql -e "CREATE DATABASE demia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'demia'@'localhost' IDENTIFIED BY 'MAT_KHAU_MANH';
GRANT ALL ON demia.* TO 'demia'@'localhost'; FLUSH PRIVILEGES;"

# 3. Lấy mã nguồn
git clone https://github.com/<tên-bạn>/demia.git ~/demia
cd ~/demia && npm ci --omit=dev
cp .env.example .env && nano .env      # điền thông tin, UPLOAD_DIR=/home/<user>/demia-uploads

# 4. Chạy nền và tự khởi động lại khi reboot
pm2 start server.js --name demia
pm2 save && pm2 startup
```

Cấu hình Nginx (`/etc/nginx/sites-available/demia`):

```nginx
server {
    server_name tenmien.com www.tenmien.com;
    client_max_body_size 600M;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/demia /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx && sudo certbot --nginx   # HTTPS miễn phí
```

Cập nhật sau mỗi lần `git push`:

```bash
cd ~/demia && git pull && npm ci --omit=dev && pm2 restart demia
```

---

## Phần 4 – Trỏ tên miền

Nếu mua tên miền ở Hostinger thì đã tự trỏ. Nếu mua nơi khác, đổi **nameserver** sang `ns1.dns-parking.com` / `ns2.dns-parking.com` (hoặc theo hướng dẫn trong hPanel), hoặc tạo bản ghi **A** trỏ về IP hosting/VPS. Có thể mất vài giờ để có hiệu lực.

## Xử lý sự cố

| Hiện tượng | Cách xử lý |
|------------|-----------|
| Trang báo lỗi 503 / không khởi động | Xem **Logs** của Node.js app trong hPanel. Thường do sai thông tin MySQL hoặc thiếu `SESSION_SECRET`. |
| Đăng nhập xong vẫn bị đá ra | Chưa bật HTTPS, hoặc đang mở bằng `http://`. |
| “Phiên làm việc đã hết hạn” | Tải lại trang rồi thử lại (token chống CSRF hết hạn sau khi đăng xuất/khởi động lại). |
| Không vào được `/admin` | Kiểm tra `ADMIN_EMAIL` đúng với email đăng nhập; khởi động lại app sau khi sửa biến môi trường. |
