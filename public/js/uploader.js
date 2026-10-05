// Trung tâm tải video: hàng chờ tải song song, chia file thành phần 5 MB, tự thử lại và tải tiếp
// từ chỗ dừng khi mạng lỗi; tải xong tự gắn video vào bài học.
// Hiển thị % và từng bước (Tải lên → Xử lý → Sẵn sàng), đồng thời báo tiến độ cho các trang quản trị khác.
(() => {
  const csrf = document.querySelector('meta[name="csrf-token"]').content;
  const channel = new BroadcastChannel('demia-uploads');
  const CHUNK = 5 * 1024 * 1024;
  const PARALLEL = 2;
  const MAX_RETRY = 6;
  const list = document.getElementById('uploadList');
  const empty = document.getElementById('uploadEmpty');
  const summary = document.getElementById('uploadSummary');
  const jobs = [];

  const fmtMb = b => `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
  const fmtSpeed = bps => (bps > 1024 * 1024 ? `${(bps / 1024 / 1024).toFixed(1).replace('.', ',')} MB/s` : `${Math.round(bps / 1024)} KB/s`);
  const fmtEta = s => (s > 90 ? `~${Math.ceil(s / 60)} phút` : `~${Math.max(1, Math.round(s))} giây`);
  const newToken = () => [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const ACTIVE = ['queued', 'preparing', 'uploading', 'retrying', 'processing'];

  async function api(url, opts = {}) {
    const res = await fetch(url, {
      ...opts,
      credentials: 'same-origin',
      headers: { 'X-CSRF-Token': csrf, ...(opts.body && !(opts.body instanceof Blob) ? { 'Content-Type': 'application/json' } : {}), ...(opts.headers || {}) },
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  // Trạng thái → [nhãn, màu nhãn, bước đang ở (1 tải lên, 2 xử lý, 3 sẵn sàng)]
  const STATE = {
    queued: ['Chờ tới lượt', '', 1],
    preparing: ['Chuẩn bị', 'badge-primary', 1],
    uploading: ['Đang tải lên', 'badge-primary', 1],
    retrying: ['Mất mạng – thử lại', 'badge-warn', 1],
    processing: ['Đang xử lý', 'badge-primary', 2],
    done: ['Hoàn tất', 'badge-success', 3],
    error: ['Lỗi', 'badge-danger', 1],
    cancelled: ['Đã hủy', '', 0],
  };

  // Phần trăm tổng: tải lên chiếm 95%, xử lý trên máy chủ 5% còn lại.
  function percent(job) {
    if (job.status === 'done') return 100;
    if (job.status === 'processing') return 97;
    return job.file.size ? Math.min(95, (job.offset / job.file.size) * 95) : 0;
  }

  function stageText(job) {
    const parts = Math.max(1, Math.ceil(job.file.size / CHUNK));
    const part = Math.min(parts, Math.floor(job.offset / CHUNK) + 1);
    switch (job.status) {
      case 'queued': return 'Đang chờ tới lượt (mỗi lần tải song song 2 video).';
      case 'preparing': return 'Đang chuẩn bị: kiểm tra file và bài học…';
      case 'uploading': {
        const speed = job.speed ? ` · ${fmtSpeed(job.speed)} · còn ${fmtEta((job.file.size - job.offset) / job.speed)}` : '';
        return `Đang tải lên phần ${part}/${parts} · ${fmtMb(job.offset)}/${fmtMb(job.file.size)}${speed}`;
      }
      case 'retrying': return `Mất kết nối – đang thử lại (lần ${job.retries}). Khi có mạng sẽ tải tiếp từ ${fmtMb(job.offset)}, không tải lại từ đầu.`;
      case 'processing': return 'Đang xử lý: ghép các phần thành file hoàn chỉnh và gắn vào bài học…';
      case 'done': return 'Hoàn tất – video đã sẵn sàng cho học viên.';
      case 'error': return job.error || 'Tải lên thất bại.';
      default: return 'Đã hủy.';
    }
  }

  function render(job) {
    const li = document.createElement('li');
    li.className = 'upload-item';
    li.innerHTML = `
      <div class="upload-top">
        <div class="upload-names"><strong class="upload-title"></strong><span class="upload-file muted"></span></div>
        <span class="upload-pct" aria-hidden="true">0%</span>
      </div>
      <div class="bar-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
      <ol class="upload-steps" aria-label="Các bước">
        <li data-step="1">Tải lên</li><li data-step="2">Xử lý</li><li data-step="3">Sẵn sàng</li>
      </ol>
      <div class="upload-meta">
        <span class="badge upload-state"></span>
        <small class="upload-detail"></small>
        <button type="button" class="btn btn-sm btn-ghost upload-action" hidden></button>
      </div>`;
    li.querySelector('.upload-title').textContent = job.lessonTitle || `Bài học #${job.lessonId}`;
    li.querySelector('.upload-file').textContent = `${job.file.name} · ${fmtMb(job.file.size)}`;
    li.querySelector('.bar-progress').setAttribute('aria-label', `Tiến độ ${job.lessonTitle}`);
    job.el = li;
    list.prepend(li);
    empty.hidden = true;
    update(job);
  }

  function update(job) {
    const [label, cls, step] = STATE[job.status];
    const pct = percent(job);
    const badge = job.el.querySelector('.upload-state');
    badge.textContent = label;
    badge.className = `badge upload-state ${cls}`;
    job.el.querySelector('.upload-pct').textContent = `${Math.floor(pct)}%`;
    const bar = job.el.querySelector('.bar-progress');
    bar.setAttribute('aria-valuenow', String(Math.floor(pct)));
    bar.querySelector('span').style.width = `${pct}%`;
    job.el.dataset.status = job.status;
    job.el.querySelectorAll('.upload-steps li').forEach(li => {
      const n = Number(li.dataset.step);
      li.className = job.status === 'done' || n < step ? 'is-done' : n === step && job.status !== 'error' && job.status !== 'cancelled' ? 'is-current' : '';
    });
    job.el.querySelector('.upload-detail').textContent = stageText(job);
    const action = job.el.querySelector('.upload-action');
    action.hidden = !['uploading', 'queued', 'retrying', 'error'].includes(job.status);
    action.textContent = job.status === 'error' ? 'Thử lại' : 'Hủy';
    action.onclick = () => (job.status === 'error' ? retry(job) : cancel(job));
    updateSummary();
    broadcast();
  }

  function updateSummary() {
    const active = jobs.filter(j => ACTIVE.includes(j.status));
    const done = jobs.filter(j => j.status === 'done').length;
    if (active.length) {
      const total = active.reduce((s, j) => s + j.file.size, 0);
      const pct = active.reduce((s, j) => s + percent(j) * j.file.size, 0) / Math.max(1, total);
      summary.textContent = `Đang tải ${active.length} video · tổng ${Math.floor(pct)}% – giữ cửa sổ này mở, bạn vẫn làm việc bình thường ở cửa sổ chính.`;
      document.title = `${Math.floor(pct)}% · Đang tải ${active.length} video`;
    } else {
      summary.textContent = done ? `Đã tải xong ${done} video. Có thể đóng cửa sổ này.` : 'Chưa có video nào đang tải.';
      document.title = 'Trung tâm tải video';
    }
    summary.classList.toggle('is-active', active.length > 0);
  }

  // Báo tiến độ cho các trang quản trị (khung tiến độ góc trái, nhãn ở danh sách bài học). Giới hạn ~3 lần/giây.
  let lastBroadcast = 0;
  let pendingBroadcast = null;
  function snapshot() {
    return jobs.filter(j => j.status !== 'cancelled').map(j => ({
      lessonId: j.lessonId, title: j.lessonTitle, status: j.status, label: STATE[j.status][0], pct: Math.floor(percent(j)),
    }));
  }
  function broadcast(force = false) {
    const now = Date.now();
    if (!force && now - lastBroadcast < 300) {
      if (!pendingBroadcast) pendingBroadcast = setTimeout(() => { pendingBroadcast = null; broadcast(true); }, 300);
      return;
    }
    lastBroadcast = now;
    channel.postMessage({ type: 'status', jobs: snapshot() });
  }

  function addJob({ file, lessonId, lessonTitle, ratio, duration }) {
    const job = { token: newToken(), file, lessonId: Number(lessonId), lessonTitle, ratio, duration, offset: 0, retries: 0, status: 'queued' };
    jobs.push(job);
    render(job);
    pump();
    return job;
  }

  function pump() {
    while (jobs.filter(j => ['preparing', 'uploading', 'retrying', 'processing'].includes(j.status)).length < PARALLEL) {
      const next = jobs.find(j => j.status === 'queued');
      if (!next) break;
      run(next);
    }
  }

  async function run(job) {
    job.status = 'preparing';
    job.cancelled = false;
    update(job);
    try {
      const init = await api('/admin/uploads/init', {
        method: 'POST',
        body: JSON.stringify({ token: job.token, size: job.file.size, mime: job.file.type, lessonId: job.lessonId }),
      });
      if (!init.ok) throw new Error(init.data.error || 'Không khởi tạo được.');
      job.offset = init.data.offset || 0;
      job.status = 'uploading';
      update(job);

      job.retries = 0;
      let lastT = performance.now();
      let lastOffset = job.offset;
      while (job.offset < job.file.size) {
        if (job.cancelled) return;
        const blob = job.file.slice(job.offset, Math.min(job.offset + CHUNK, job.file.size));
        let r;
        try {
          r = await api(`/admin/uploads/${job.token}?offset=${job.offset}`, {
            method: 'PUT', body: blob, headers: { 'Content-Type': 'application/octet-stream' },
          });
        } catch {
          r = { status: 0, ok: false, data: {} };
        }
        if (job.cancelled) return;
        if (r.ok || r.status === 409) {
          job.offset = r.data.offset;
          job.retries = 0;
          job.status = 'uploading';
          const now = performance.now();
          if (now - lastT > 400) {
            const inst = ((job.offset - lastOffset) * 1000) / (now - lastT);
            job.speed = job.speed ? job.speed * 0.6 + inst * 0.4 : inst;
            lastT = now;
            lastOffset = job.offset;
          }
          update(job);
        } else if (r.status >= 400 && r.status < 500 && r.status !== 408 && r.status !== 429) {
          throw new Error(r.data.error || `Máy chủ từ chối (mã ${r.status}).`);
        } else {
          if (++job.retries > MAX_RETRY) throw new Error('Mạng lỗi quá nhiều lần. Bấm "Thử lại" để tải tiếp từ chỗ dừng.');
          job.status = 'retrying';
          update(job);
          await sleep(Math.min(15000, 1000 * 2 ** job.retries));
          lastT = performance.now();
          lastOffset = job.offset;
        }
      }

      job.status = 'processing';
      update(job);
      const done = await api(`/admin/uploads/${job.token}/complete`, {
        method: 'POST',
        body: JSON.stringify({ lessonId: job.lessonId, mime: job.file.type, size: job.file.size, ratio: job.ratio, duration: job.duration }),
      });
      if (!done.ok) throw new Error(done.data.error || 'Không gắn được video vào bài học.');
      job.status = 'done';
      update(job);
      broadcast(true);
      channel.postMessage({ type: 'done', lessonId: job.lessonId });
    } catch (err) {
      if (job.cancelled) return;
      job.status = 'error';
      job.error = err.message;
      update(job);
    } finally {
      pump();
    }
  }

  function retry(job) {
    job.status = 'queued';
    job.error = '';
    update(job);
    pump();
  }

  function cancel(job) {
    if (!confirm(`Hủy tải video cho “${job.lessonTitle}”?`)) return;
    job.cancelled = true;
    job.status = 'cancelled';
    update(job);
    api(`/admin/uploads/${job.token}/cancel`, { method: 'POST', body: '{}' });
    pump();
  }

  // Đọc thời lượng + tỉ lệ khung hình ngay trên trình duyệt (khi thêm file trực tiếp tại trung tâm).
  const RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:4', '4:5', '21:9'];
  const nearest = (w, h) => RATIOS.reduce((best, r) => {
    const [a, b] = r.split(':').map(Number);
    const [c, d] = best.split(':').map(Number);
    return Math.abs(Math.log(a / b / (w / h))) < Math.abs(Math.log(c / d / (w / h))) ? r : best;
  }, RATIOS[0]);
  function probe(file) {
    return new Promise(resolve => {
      const url = URL.createObjectURL(file);
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.muted = true;
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        resolve({ duration: isFinite(v.duration) ? v.duration : 0, ratio: v.videoWidth ? nearest(v.videoWidth, v.videoHeight) : '' });
        URL.revokeObjectURL(url);
      };
      v.onloadedmetadata = () => {
        if (isFinite(v.duration) && v.duration > 0) return finish();
        v.ontimeupdate = () => { v.ontimeupdate = null; finish(); };
        v.currentTime = Number.MAX_SAFE_INTEGER;
      };
      v.onerror = finish;
      v.src = url;
      setTimeout(finish, 5000);
    });
  }

  // Thêm file trực tiếp tại trung tâm
  const form = document.getElementById('addForm');
  const lessonSelect = document.getElementById('addLesson');
  const fileInput = document.getElementById('addFile');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const file = fileInput.files[0];
    if (!lessonSelect.value || !file) return;
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Đang đọc thông tin video…';
    const info = await probe(file);
    addJob({ file, lessonId: lessonSelect.value, lessonTitle: lessonSelect.selectedOptions[0].dataset.title, ...info });
    fileInput.value = '';
    btn.disabled = false;
    btn.textContent = 'Tải lên';
  });

  // Chỉ một cửa sổ trung tâm được nhận file (tránh tải trùng nếu lỡ mở hai cửa sổ).
  let isPrimary = true;
  if (navigator.locks) {
    isPrimary = false;
    navigator.locks.request('demia-upload-center', { ifAvailable: true }, lock => {
      if (!lock) {
        document.getElementById('secondaryNote').hidden = false;
        return undefined;
      }
      isPrimary = true;
      channel.postMessage({ type: 'ready' });
      return new Promise(() => {}); // giữ quyền "trung tâm chính" tới khi đóng cửa sổ
    });
  }

  // Nhận file và câu hỏi tiến độ từ các trang quản trị
  channel.onmessage = e => {
    if (!isPrimary) return;
    const m = e.data || {};
    if (m.type === 'ping') channel.postMessage({ type: 'ready' });
    if (m.type === 'status?') broadcast(true);
    if (m.type === 'upload' && m.file) {
      addJob(m);
      channel.postMessage({ type: 'queued', ref: m.ref });
    }
    if (m.type === 'select' && m.lessonId) {
      lessonSelect.value = String(m.lessonId);
      lessonSelect.scrollIntoView({ block: 'center' });
      fileInput.focus();
    }
  };
  if (isPrimary) channel.postMessage({ type: 'ready' });

  window.addEventListener('beforeunload', e => {
    if (jobs.some(j => ACTIVE.includes(j.status))) {
      e.preventDefault();
      e.returnValue = 'Video đang tải lên. Đóng cửa sổ sẽ dừng tải.';
    }
  });
  window.addEventListener('pagehide', () => channel.postMessage({ type: 'status', jobs: [] }));
  updateSummary();
})();
