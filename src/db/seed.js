// Tạo tài khoản admin từ biến môi trường và nạp khóa học mẫu khi cơ sở dữ liệu còn trống.
const bcrypt = require('bcryptjs');
const db = require('./index');
const config = require('../config');
const { slugify } = require('../helpers');
const AI_VIDEO_COURSE = require('./seed-data/ai-video-course');
const PROMPT_LIBRARY = require('./seed-data/prompts');

const SAMPLE_COURSES = [
  {
    slug: 'react-cho-nguoi-moi-bat-dau',
    title: 'React cho người mới bắt đầu – Xây dựng web app đầu tiên',
    description: 'Học React từ con số 0: component, JSX, props và cách ghép chúng thành một ứng dụng web hoàn chỉnh.',
    level: 'Cơ bản', category: 'Frontend', color: '#4F46E5',
    lessons: [
      ['Giới thiệu về React', '5:12', 'React là thư viện JavaScript giúp xây dựng giao diện người dùng từ những khối nhỏ gọi là component.', 'React là gì và dùng để làm gì\nSo sánh React với JavaScript thuần\nCài đặt môi trường với Vite'],
      ['React hoạt động như thế nào', '8:24', 'Tìm hiểu Virtual DOM, quá trình render và cách React cập nhật giao diện hiệu quả.', 'Virtual DOM\nRender và re-render\nOne-way data flow'],
      ['Component là gì?', '11:02', 'Trong bài này, chúng ta tìm hiểu khối xây dựng cơ bản của React: Component. Component là những đoạn mã độc lập và có thể tái sử dụng. Chúng giống hàm JavaScript nhưng hoạt động riêng biệt và trả về HTML.', 'Cách tạo và export một function component\nHiểu các quy tắc cú pháp JSX (JavaScript XML)\nLỗi thường gặp của người mới (ví dụ: các phần tử JSX liền kề)\nRender component bên trong component khác'],
      ['JSX cơ bản & cú pháp', '14:32', 'JSX cho phép viết HTML ngay trong JavaScript. Bài này đi qua các quy tắc quan trọng nhất.', 'Biểu thức trong dấu ngoặc nhọn\nclassName thay cho class\nFragment <></>'],
      ['Component tái sử dụng', '23:12', 'Tách giao diện thành các component nhỏ, dễ bảo trì và dùng lại ở nhiều nơi.', 'Chia nhỏ giao diện\nĐặt tên component\nTổ chức thư mục'],
      ['Props trong React', '31:02', 'Props giúp truyền dữ liệu từ component cha xuống component con.', 'Truyền và nhận props\nGiá trị mặc định\nprops.children'],
    ],
  },
  {
    slug: 'python-can-ban',
    title: 'Python căn bản',
    description: 'Làm quen với Python – ngôn ngữ dễ học nhất cho người mới: biến, vòng lặp, hàm và làm việc với dữ liệu.',
    level: 'Cơ bản', category: 'Lập trình', color: '#0D9488',
    lessons: [
      ['Cài đặt Python và VS Code', '6:40', 'Chuẩn bị môi trường lập trình Python trên Windows và macOS.', 'Cài Python\nCài VS Code và extension Python\nChạy chương trình đầu tiên'],
      ['Biến và kiểu dữ liệu', '12:15', 'Số, chuỗi, boolean và cách Python xử lý kiểu dữ liệu.', 'int, float, str, bool\nÉp kiểu\nf-string'],
      ['Câu lệnh điều kiện và vòng lặp', '15:30', 'Điều khiển luồng chương trình với if, for và while.', 'if / elif / else\nVòng lặp for và range()\nbreak và continue'],
      ['Hàm', '13:05', 'Viết hàm để tái sử dụng mã nguồn.', 'Định nghĩa hàm với def\nTham số và giá trị trả về\nPhạm vi biến'],
    ],
  },
  {
    slug: 'cau-truc-du-lieu-va-giai-thuat',
    title: 'Cấu trúc dữ liệu & Giải thuật',
    description: 'Nền tảng để viết code nhanh hơn và vượt qua vòng phỏng vấn kỹ thuật.',
    level: 'Trung cấp', category: 'Khoa học máy tính', color: '#E11D48',
    lessons: [
      ['Độ phức tạp thuật toán (Big-O)', '18:20', 'Cách đánh giá tốc độ và bộ nhớ của một thuật toán.', 'O(1), O(n), O(log n), O(n²)\nPhân tích vòng lặp lồng nhau'],
      ['Mảng và danh sách liên kết', '21:45', 'So sánh hai cấu trúc dữ liệu tuyến tính cơ bản.', 'Truy cập ngẫu nhiên\nChèn và xóa phần tử'],
      ['Stack và Queue', '16:10', 'Hai cấu trúc LIFO và FIFO cùng các ứng dụng thực tế.', 'push / pop\nenqueue / dequeue\nỨng dụng trong trình duyệt'],
    ],
  },
  {
    slug: 'thiet-ke-ui-voi-figma',
    title: 'Thiết kế UI với Figma',
    description: 'Từ wireframe đến prototype: thiết kế giao diện web và mobile chuyên nghiệp bằng Figma.',
    level: 'Cơ bản', category: 'Thiết kế', color: '#F97316',
    lessons: [
      ['Làm quen giao diện Figma', '9:30', 'Frame, layer và các công cụ cơ bản.', 'Frame và Group\nThanh công cụ\nPhím tắt hữu ích'],
      ['Auto Layout', '17:05', 'Tạo bố cục co giãn tự động như CSS Flexbox.', 'Hướng và khoảng cách\nPadding\nHug và Fill'],
      ['Component và Variant', '19:40', 'Xây dựng thư viện component có thể tái sử dụng.', 'Main component và instance\nVariant\nThuộc tính component'],
    ],
  },
];

function toSeconds(mmss) {
  const [m, s] = mmss.split(':').map(Number);
  return m * 60 + s;
}

async function ensureAdmin() {
  const { email, password, name } = config.admin;
  if (!email || !password) return;
  const existing = await db.get('SELECT id, role FROM users WHERE email = ?', [email]);
  if (existing) {
    if (existing.role !== 'admin') await db.run("UPDATE users SET role = 'admin' WHERE id = ?", [existing.id]);
    return;
  }
  const hash = await bcrypt.hash(password, 12);
  await db.run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')", [name, email, hash]);
  console.log(`[demia] Đã tạo tài khoản admin: ${email}`);
}

async function insertCourse(c) {
  const { insertId } = await db.run(
    'INSERT INTO courses (slug, title, description, level, category, color, published) VALUES (?, ?, ?, ?, ?, ?, 1)',
    [c.slug, c.title, c.description, c.level, c.category, c.color],
  );
  let position = 1;
  for (const [title, dur, summary, keyPoints, resources = ''] of c.lessons) {
    await db.run(
      "INSERT INTO lessons (course_id, position, title, duration_sec, summary, key_points, resources, video_type) VALUES (?, ?, ?, ?, ?, ?, ?, 'none')",
      [insertId, position++, title, toSeconds(dur), summary, keyPoints, resources],
    );
  }
}

// Mỗi gói dữ liệu mẫu chỉ nạp một lần (đánh dấu trong bảng settings),
// để admin xóa nội dung mẫu thì nó không tự xuất hiện lại.
async function once(flag, fn) {
  if (await db.get('SELECT 1 AS x FROM settings WHERE name = ?', [flag])) return;
  await fn();
  await db.run('INSERT INTO settings (name, value) VALUES (?, ?)', [flag, new Date().toISOString()]);
}

async function ensureSampleCourses() {
  await once('seed:sample-courses', async () => {
    const { n } = await db.get('SELECT COUNT(*) AS n FROM courses');
    if (Number(n) > 0) return;
    // Chèn ngược để khóa học đầu danh sách hiển thị đầu tiên (danh mục sắp xếp mới nhất trước).
    for (const c of [...SAMPLE_COURSES].reverse()) await insertCourse(c);
    console.log('[demia] Đã nạp khóa học mẫu.');
  });
  await once('seed:ai-video-course', async () => {
    if (await db.get('SELECT 1 AS x FROM courses WHERE slug = ?', [AI_VIDEO_COURSE.slug])) return;
    await insertCourse(AI_VIDEO_COURSE);
    console.log('[demia] Đã nạp khóa học "Làm video bằng AI".');
  });
}

async function ensurePromptLibrary() {
  await once('seed:prompts', async () => {
    const { n } = await db.get('SELECT COUNT(*) AS n FROM prompt_categories');
    if (Number(n) > 0) return;
    let position = 1;
    for (const cat of PROMPT_LIBRARY) {
      const { insertId } = await db.run(
        'INSERT INTO prompt_categories (slug, name, color, position) VALUES (?, ?, ?, ?)',
        [slugify(cat.name), cat.name, cat.color, position++],
      );
      for (const p of cat.prompts) {
        await db.run(
          'INSERT INTO prompts (category_id, title, description, content, tool) VALUES (?, ?, ?, ?, ?)',
          [insertId, p.title, p.description, p.content, p.tool],
        );
      }
    }
    console.log('[demia] Đã nạp thư viện prompt mẫu.');
  });
}

async function ensureSeed() {
  await ensureAdmin();
  await ensureSampleCourses();
  await ensurePromptLibrary();
}

module.exports = { ensureSeed };
