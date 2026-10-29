// Đóng gói Muse Studio (chạy trên Windows): node tools/muse-studio/build.js [thư-mục-gói-offline]
//  - assets/muse/Muse-Studio-Cai-Dat.zip: bộ cài học viên tải ở /muse/tai-bo-cai — cài bộ chạy rồi mở Muse Studio trên web.
//  - (tuỳ chọn) gói offline: cùng bộ cài nhưng mở giao diện ngay trên máy (http://127.0.0.1:18610/batch).
// Giao diện dùng chung nguồn với trang web: public/css/muse-studio.css, public/js/muse-studio.js, views/partials/muse-body.ejs.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const SITE = (process.env.SITE_URL || 'https://khoahocvideoai.store').replace(/\/+$/, '');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

// Bản trên máy là 1 file HTML: Muse2API phục vụ nó ở /batch nên mọi thứ phải nằm gọn trong file.
function localHtml() {
  const js = read('public/js/muse-studio.js');
  if (js.includes('</script')) throw new Error('muse-studio.js chứa </script — không nhúng được');
  return `<!doctype html>
<html lang="vi" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Muse Studio — Tạo video & ảnh</title>
<style>
${read('public/css/muse-studio.css')}</style>
</head>
<body>
${read('views/partials/muse-body.ejs')}
<script type="application/json" id="museCfg">{}</script>
<script>
${js}</script>
</body>
</html>
`;
}

function launcher(webUrl) {
  const bat = fs.readFileSync(path.join(__dirname, 'MO_MUSE_STUDIO.bat'), 'utf8');
  if (!bat.includes('set "WEBURL="')) throw new Error('MO_MUSE_STUDIO.bat thiếu dòng set "WEBURL="');
  return bat.replace('set "WEBURL="', `set "WEBURL=${webUrl}"`);
}

function zip(dir, out) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (fs.existsSync(out)) fs.unlinkSync(out);
  execFileSync('powershell', ['-NoProfile', '-Command', `Compress-Archive -Path '${dir}' -DestinationPath '${out}'`], { stdio: 'inherit' });
}

function stage(files) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-pkg-'));
  const dir = path.join(base, 'Muse-Studio');
  fs.mkdirSync(dir);
  for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), body);
  return dir;
}

const html = localHtml();
const restore = fs.readFileSync(path.join(__dirname, 'KHOI_PHUC_GIAO_DIEN_CU.bat'));
const helper = fs.readFileSync(path.join(__dirname, 'muse-helper.ps1'));
const webReadme = [
  'MUSE STUDIO - BO CAI CHO MAY WINDOWS', '',
  '1. Bam doi MO_MUSE_STUDIO.bat (lan dau tu tai bo chay ~164 MB).',
  '2. Xong, Muse Studio tren web khoa hoc tu mo va tu ket noi.',
  `   ${SITE}/muse`, '',
  'Huong dan chi tiet tung buoc (co hinh minh hoa cach bam):',
  `   ${SITE}/muse/huong-dan`, '',
  'Khong gui file .env, thu muc data hay API key cho bat ky ai.', '',
].join('\r\n');

const webDir = stage({ 'MO_MUSE_STUDIO.bat': launcher(`${SITE}/muse`), 'studio.html': html, 'KHOI_PHUC_GIAO_DIEN_CU.bat': restore, 'muse-helper.ps1': helper, 'DOC_TRUOC.txt': webReadme });
const webZip = path.join(ROOT, 'assets', 'muse', 'Muse-Studio-Cai-Dat.zip');
zip(webDir, webZip);
console.log('Đã tạo', path.relative(ROOT, webZip), fs.statSync(webZip).size, 'byte');

const offlineDir = process.argv[2];
if (offlineDir) {
  const dir = stage({
    'MO_MUSE_STUDIO.bat': launcher(''), 'studio.html': html, 'KHOI_PHUC_GIAO_DIEN_CU.bat': restore, 'muse-helper.ps1': helper,
    'HUONG_DAN_HOC_VIEN.html': fs.readFileSync(path.join(__dirname, 'HUONG_DAN_HOC_VIEN.html')),
  });
  const out = path.join(offlineDir, 'Muse-Studio-Hoc-Vien.zip');
  zip(dir, out);
  fs.writeFileSync(path.join(offlineDir, 'studio.html'), html);
  console.log('Đã tạo gói offline', out);
}
