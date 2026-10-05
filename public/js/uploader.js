// Trung tâm tải video: hàng chờ tải song song, chia file thành phần 5 MB, tự thử lại và tải tiếp
// từ chỗ dừng khi mạng lỗi; tải xong tự gắn video vào bài học.
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

  const fmtMb = b => `${(b / 1024 / 1024).toFixed(1)} MB`;
  const fmtSpeed = bps => (bps > 1024 * 1024 ? `${(bps / 1024 / 1024).toFixed(1)} MB/s` : `${Math.round(bps / 1024)} KB/s`);
  const fmtEta = s => (s > 90 ? `~${Math.ceil(s / 60)} phút` : `~${Math.max(1, Math.round(s))} giây`);
  const newToken = () => [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function api(url, opts = {}) {
    const res = await fetch(url, {
      ...opts,
      credentials: 'same-origin',
      headers: { 'X-CSRF-Token': csrf, ...(opts.body && !(opts.body instanceof Blob) ? { 'Content-Type': 'application/json' } : {}), ...(opts.headers || {}) },
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  function render(job) {
    const li = document.createElement('li');
    li.className = 'upload-item';
    li.innerHTML = `
      <div class="upload-top"><strong class="upload-title"></strong><span class="badge upload-state"></span></div>
      <div class="upload-file muted"></div>
      <div class="bar-progress"><span></span></div>
      <div class="upload-meta"><small class="upload-detail"></small><button type="button" class="btn btn-sm btn-ghost upload-action" hidden></button></div>`;
    li.querySelector('.upload-title').textContent = job.lessonTitle || `Bài học #${job.lessonId}`;
    li.querySelector('.upload-file').textContent = `${job.file.name} · ${fmtMb(job.file.size)}`;
    job.el = li;
    list.prepend(li);
    empty.hidden = true;
    update(job);
  }

  const STATE = {
    queued: ['Chờ tải', ''], uploading: ['Đang tải', 'badge-primary'], retrying: ['Mạng lỗi – đang thử lại', 'badge-warn'],
    done: ['Đã xong', 'badge-success'], error: ['Lỗi', 'badge-danger'], cancelled: ['Đã hủy', ''],
  };

  function update(job) {
    const [label, cls] = STATE[job.status];
    const badge = job.el.querySelector('.upload-state');
    badge.textContent = label;
    badge.className = `badge upload-state ${cls}`;
    const pct = job.file.size ? Math.min(100, (job.offset / job.file.size) * 100) : 0;
    job.el.querySelector('.bar-progress span').style.width = `${pct}%`;
    const detail = job.el.querySelector('.upload-detail');
    const action = job.el.querySelector('.upload-action');
    if (job.status === 'uploading' && job.speed) {
      detail.textContent = `${Math.floor(pct)}% · ${fmtSpeed(job.speed)} · còn ${fmtEta((job.file.size - job.offset) / job.speed)}`;
    } else if (job.status === 'done') {
      detail.textContent = 'Đã gắn video vào bài học.';
    } else if (job.status === 'error') {
      detail.textContent = job.error || 'Tải lên thất bại.';
    } else {
      detail.textContent = `${Math.floor(pct)}%`;
    }
    action.hidden = !['uploading', 'queued', 'retrying', 'error'].includes(job.status);
    action.textContent = job.status === 'error' ? 'Thử lại' : 'Hủy';
    action.onclick = () => (job.status === 'error' ? retry(job) : cancel(job));
    updateSummary();
  }

  function updateSummary() {
    const active = jobs.filter(j => ['queued', 'uploading', 'retrying'].includes(j.status)).length;
    const done = jobs.filter(j => j.status === 'done').length;
    summary.textContent = active
      ? `Đang tải ${active} video – giữ cửa sổ này mở. Bạn vẫn làm việc bình thường ở cửa sổ chính.`
      : (done ? `Đã tải xong ${done} video. Có thể đóng cửa sổ này.` : 'Chưa có video nào đang tải.');
    summary.classList.toggle('is-active', active > 0);
    document.title = active ? `(${active}) Đang tải video…` : 'Trung tâm tải video';
  }

  function addJob({ file, lessonId, lessonTitle, ratio, duration }) {
    const job = { token: newToken(), file, lessonId: Number(lessonId), lessonTitle, ratio, duration, offset: 0, status: 'queued' };
    jobs.push(job);
    render(job);
    pump();
    return job;
  }

  function pump() {
    while (jobs.filter(j => j.status === 'uploading' || j.status === 'retrying').length < PARALLEL) {
      const next = jobs.find(j => j.status === 'queued');
      if (!next) break;
      run(next);
    }
  }

  async function run(job) {
    job.status = 'uploading';
    job.cancelled = false;
    update(job);
    try {
      const init = await api('/admin/uploads/init', {
        method: 'POST',
        body: JSON.stringify({ token: job.token, size: job.file.size, mime: job.file.type, lessonId: job.lessonId }),
      });
      if (!init.ok) throw new Error(init.data.error || 'Không khởi tạo được.');
      job.offset = init.data.offset || 0;

      let retries = 0;
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
        if (r.ok || r.status === 409) {
          job.offset = r.data.offset;
          retries = 0;
          if (job.status === 'retrying') { job.status = 'uploading'; }
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
          if (++retries > MAX_RETRY) throw new Error('Mạng lỗi quá nhiều lần. Bấm "Thử lại" để tải tiếp từ chỗ dừng.');
          job.status = 'retrying';
          update(job);
          await sleep(Math.min(15000, 1000 * 2 ** retries));
        }
      }

      const done = await api(`/admin/uploads/${job.token}/complete`, {
        method: 'POST',
        body: JSON.stringify({ lessonId: job.lessonId, mime: job.file.type, size: job.file.size, ratio: job.ratio, duration: job.duration }),
      });
      if (!done.ok) throw new Error(done.data.error || 'Không gắn được video vào bài học.');
      job.status = 'done';
      update(job);
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
      const finish = () => {
        resolve({ duration: isFinite(v.duration) ? v.duration : 0, ratio: v.videoWidth ? nearest(v.videoWidth, v.videoHeight) : '' });
        URL.revokeObjectURL(url);
      };
      v.onloadedmetadata = () => {
        if (isFinite(v.duration) && v.duration > 0) return finish();
        v.ontimeupdate = () => { v.ontimeupdate = null; finish(); };
        v.currentTime = Number.MAX_SAFE_INTEGER;
      };
      v.onerror = () => { resolve({ duration: 0, ratio: '' }); URL.revokeObjectURL(url); };
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
    const files = [...fileInput.files];
    if (!lessonSelect.value || !files.length) return;
    const title = lessonSelect.selectedOptions[0].dataset.title;
    for (const file of files.slice(0, 1)) {
      const info = await probe(file);
      addJob({ file, lessonId: lessonSelect.value, lessonTitle: title, ...info });
    }
    fileInput.value = '';
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

  // Nhận file từ các trang quản trị
  channel.onmessage = e => {
    if (!isPrimary) return;
    const m = e.data || {};
    if (m.type === 'ping') channel.postMessage({ type: 'ready' });
    if (m.type === 'upload' && m.file) {
      addJob(m);
      channel.postMessage({ type: 'queued', ref: m.ref });
      window.focus();
    }
    if (m.type === 'select' && m.lessonId) {
      lessonSelect.value = String(m.lessonId);
      lessonSelect.scrollIntoView({ block: 'center' });
      fileInput.focus();
    }
  };
  if (isPrimary) channel.postMessage({ type: 'ready' });

  window.addEventListener('beforeunload', e => {
    if (jobs.some(j => ['queued', 'uploading', 'retrying'].includes(j.status))) {
      e.preventDefault();
      e.returnValue = 'Video đang tải lên. Đóng cửa sổ sẽ dừng tải.';
    }
  });
  updateSummary();
})();
