// Lõi tải video theo từng phần (5 MB): dùng chung cho Trung tâm tải video và cách tải dự phòng ngay tại trang.
// Mỗi phần là một yêu cầu nhỏ → không bị hosting chặn vì file lớn, mất mạng thì thử lại và tải tiếp từ chỗ dừng.
(() => {
  const CHUNK = 5 * 1024 * 1024;
  const MAX_RETRY = 6;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const csrf = () => document.querySelector('meta[name="csrf-token"]').content;

  const fmtMb = b => `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
  const fmtSpeed = bps => (bps > 1024 * 1024 ? `${(bps / 1024 / 1024).toFixed(1).replace('.', ',')} MB/s` : `${Math.round(bps / 1024)} KB/s`);
  const fmtEta = s => (s > 90 ? `~${Math.ceil(s / 60)} phút` : `~${Math.max(1, Math.round(s))} giây`);
  const newToken = () => [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');

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
  const ACTIVE = ['queued', 'preparing', 'uploading', 'retrying', 'processing'];

  // Phần trăm tổng: tải lên chiếm 95%, xử lý trên máy chủ 5% còn lại.
  function percent(job) {
    if (job.status === 'done') return 100;
    if (job.status === 'processing') return 97;
    return job.file.size ? Math.min(95, (job.offset / job.file.size) * 95) : 0;
  }

  function stageText(job) {
    const size = job.chunk || CHUNK;
    const parts = Math.max(1, Math.ceil(job.file.size / size));
    const part = Math.min(parts, Math.floor(job.offset / size) + 1);
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

  async function api(url, opts = {}) {
    const res = await fetch(url, {
      ...opts,
      credentials: 'same-origin',
      headers: { 'X-CSRF-Token': csrf(), ...(opts.body && !(opts.body instanceof Blob) ? { 'Content-Type': 'application/json' } : {}), ...(opts.headers || {}) },
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  function createJob({ file, lessonId, lessonTitle, ratio, duration }) {
    return { token: newToken(), file, lessonId: Number(lessonId), lessonTitle, ratio, duration, offset: 0, retries: 0, chunk: CHUNK, status: 'queued' };
  }

  // Tải một video; gọi onUpdate(job) mỗi khi tiến độ/bước thay đổi. Không ném lỗi: kết quả nằm ở job.status.
  async function run(job, onUpdate = () => {}) {
    const set = status => { job.status = status; onUpdate(job); };
    job.cancelled = false;
    job.error = '';
    set('preparing');
    try {
      const init = await api('/admin/uploads/init', {
        method: 'POST',
        body: JSON.stringify({ token: job.token, size: job.file.size, mime: job.file.type, lessonId: job.lessonId }),
      });
      if (!init.ok) throw new Error(init.data.error || 'Không khởi tạo được.');
      job.offset = init.data.offset || 0;
      set('uploading');

      job.retries = 0;
      let lastT = performance.now();
      let lastOffset = job.offset;
      while (job.offset < job.file.size) {
        if (job.cancelled) return;
        const blob = job.file.slice(job.offset, Math.min(job.offset + job.chunk, job.file.size));
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
          const now = performance.now();
          if (now - lastT > 400) {
            const inst = ((job.offset - lastOffset) * 1000) / (now - lastT);
            job.speed = job.speed ? job.speed * 0.6 + inst * 0.4 : inst;
            lastT = now;
            lastOffset = job.offset;
          }
          set('uploading');
        } else if (r.status === 413 && !r.data.error && job.chunk > 512 * 1024) {
          // Hosting chặn phần quá lớn: chia nhỏ hơn rồi tải tiếp.
          job.chunk = Math.floor(job.chunk / 2);
        } else if (r.status >= 400 && r.status < 500 && r.status !== 408 && r.status !== 429) {
          throw new Error(r.data.error || `Máy chủ từ chối (mã ${r.status}).`);
        } else {
          if (++job.retries > MAX_RETRY) throw new Error('Mạng lỗi quá nhiều lần. Bấm "Thử lại" để tải tiếp từ chỗ dừng.');
          set('retrying');
          await sleep(Math.min(15000, 1000 * 2 ** job.retries));
          lastT = performance.now();
          lastOffset = job.offset;
        }
      }

      set('processing');
      const done = await api(`/admin/uploads/${job.token}/complete`, {
        method: 'POST',
        body: JSON.stringify({ lessonId: job.lessonId, mime: job.file.type, size: job.file.size, ratio: job.ratio, duration: job.duration }),
      });
      if (!done.ok) throw new Error(done.data.error || 'Không gắn được video vào bài học.');
      set('done');
    } catch (err) {
      if (job.cancelled) return;
      job.error = err.message;
      set('error');
    }
  }

  function cancel(job) {
    job.cancelled = true;
    job.status = 'cancelled';
    api(`/admin/uploads/${job.token}/cancel`, { method: 'POST', body: '{}' });
  }

  window.DemiaUploadCore = { CHUNK, STATE, ACTIVE, percent, stageText, createJob, run, cancel, fmtMb };
})();
