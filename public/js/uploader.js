// Trung tâm tải video: hàng chờ tải song song (2 video), dùng lõi tải theo phần (upload-core.js);
// hiển thị % và từng bước, báo tiến độ cho các trang quản trị khác qua BroadcastChannel.
(() => {
  const core = window.DemiaUploadCore;
  const channel = new BroadcastChannel('demia-uploads');
  const PARALLEL = 2;
  const list = document.getElementById('uploadList');
  const empty = document.getElementById('uploadEmpty');
  const summary = document.getElementById('uploadSummary');
  const jobs = [];

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
    li.querySelector('.upload-file').textContent = `${job.file.name} · ${core.fmtMb(job.file.size)}`;
    li.querySelector('.bar-progress').setAttribute('aria-label', `Tiến độ ${job.lessonTitle}`);
    job.el = li;
    list.prepend(li);
    empty.hidden = true;
    update(job);
  }

  function update(job) {
    const [label, cls, step] = core.STATE[job.status];
    const pct = core.percent(job);
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
    job.el.querySelector('.upload-detail').textContent = core.stageText(job);
    const action = job.el.querySelector('.upload-action');
    action.hidden = !['uploading', 'queued', 'retrying', 'error'].includes(job.status);
    action.textContent = job.status === 'error' ? 'Thử lại' : 'Hủy';
    action.onclick = () => (job.status === 'error' ? retry(job) : cancel(job));
    updateSummary();
    broadcast();
  }

  function updateSummary() {
    const active = jobs.filter(j => core.ACTIVE.includes(j.status));
    const done = jobs.filter(j => j.status === 'done').length;
    if (active.length) {
      const total = active.reduce((s, j) => s + j.file.size, 0);
      const pct = active.reduce((s, j) => s + core.percent(j) * j.file.size, 0) / Math.max(1, total);
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
  function broadcast(force = false) {
    const now = Date.now();
    if (!force && now - lastBroadcast < 300) {
      if (!pendingBroadcast) pendingBroadcast = setTimeout(() => { pendingBroadcast = null; broadcast(true); }, 300);
      return;
    }
    lastBroadcast = now;
    channel.postMessage({
      type: 'status',
      jobs: jobs.filter(j => j.status !== 'cancelled').map(j => ({
        lessonId: j.lessonId, title: j.lessonTitle, status: j.status, label: core.STATE[j.status][0], pct: Math.floor(core.percent(j)),
      })),
    });
  }

  function addJob(info) {
    const job = core.createJob(info);
    jobs.push(job);
    render(job);
    pump();
    return job;
  }

  function pump() {
    while (jobs.filter(j => ['preparing', 'uploading', 'retrying', 'processing'].includes(j.status)).length < PARALLEL) {
      const next = jobs.find(j => j.status === 'queued');
      if (!next) break;
      next.status = 'preparing';
      core.run(next, update).then(() => {
        if (next.status === 'done') {
          broadcast(true);
          channel.postMessage({ type: 'done', lessonId: next.lessonId });
        }
        pump();
      });
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
    core.cancel(job);
    update(job);
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
    if (jobs.some(j => core.ACTIVE.includes(j.status))) {
      e.preventDefault();
      e.returnValue = 'Video đang tải lên. Đóng cửa sổ sẽ dừng tải.';
    }
  });
  window.addEventListener('pagehide', () => channel.postMessage({ type: 'status', jobs: [] }));
  updateSummary();
})();
