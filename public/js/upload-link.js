// Cầu nối giữa các trang quản trị và cửa sổ "Trung tâm tải video" (BroadcastChannel).
// Trang bài học chỉ chuyển file sang trung tâm rồi đi tiếp; trung tâm tự tải và gắn video vào bài.
(() => {
  const NAME = 'demia-uploads';
  const supported = 'BroadcastChannel' in window;
  const channel = supported ? new BroadcastChannel(NAME) : null;

  // Mở cửa sổ trung tâm nếu chưa có. Không dùng window.open(url, name) trực tiếp vì nếu cửa sổ
  // đang mở, lệnh đó sẽ tải lại trang và làm hỏng các file đang tải.
  function openCenter(query = '') {
    const w = window.open('', NAME, 'popup,width=480,height=760');
    if (!w) return null;
    let blank = true;
    try { blank = w.location.href === 'about:blank'; } catch { blank = false; }
    if (blank) w.location.href = `/admin/uploads${query}`;
    return w;
  }

  // Chờ trung tâm báo sẵn sàng (tối đa ~15 giây).
  function waitReady() {
    return new Promise((resolve, reject) => {
      if (!channel) return reject(new Error('unsupported'));
      let done = false;
      const onMsg = e => {
        if (e.data && e.data.type === 'ready' && !done) {
          done = true;
          channel.removeEventListener('message', onMsg);
          clearInterval(ping);
          resolve();
        }
      };
      channel.addEventListener('message', onMsg);
      const ping = setInterval(() => channel.postMessage({ type: 'ping' }), 300);
      channel.postMessage({ type: 'ping' });
      setTimeout(() => {
        if (done) return;
        clearInterval(ping);
        channel.removeEventListener('message', onMsg);
        reject(new Error('timeout'));
      }, 15000);
    });
  }

  // Gửi file sang trung tâm và chờ trung tâm xác nhận đã nhận vào hàng chờ.
  async function sendToCenter(job) {
    await waitReady();
    return new Promise((resolve, reject) => {
      const ref = Math.random().toString(36).slice(2);
      const onMsg = e => {
        if (e.data && e.data.type === 'queued' && e.data.ref === ref) {
          channel.removeEventListener('message', onMsg);
          resolve();
        }
      };
      channel.addEventListener('message', onMsg);
      channel.postMessage({ type: 'upload', ref, ...job });
      setTimeout(() => { channel.removeEventListener('message', onMsg); reject(new Error('no-ack')); }, 8000);
    });
  }

  // Nút "Tải video" ở danh sách bài học: mở trung tâm và chọn sẵn bài học đó.
  document.querySelectorAll('[data-upload-lesson]').forEach(btn => btn.addEventListener('click', async () => {
    const id = btn.dataset.uploadLesson;
    if (!openCenter(`?lesson=${id}`)) {
      window.Demia?.toast('Trình duyệt chặn cửa sổ bật lên. Hãy cho phép popup cho trang này.', 'error');
      return;
    }
    try { await waitReady(); channel.postMessage({ type: 'select', lessonId: Number(id) }); } catch { /* trung tâm tự chọn qua ?lesson= */ }
  }));

  // Khung tiến độ nhỏ ở góc trái dưới mọi trang quản trị: % và bước đang làm của từng video.
  // Khung ở góc phải (trên nút Zalo); khi tất cả video đã xong thì tự ẩn sau 30 giây
  // và không hiện lại thông báo cũ đó khi chuyển trang.
  const HIDE_AFTER = 30000;
  let dock = null;
  let hideTimer = null;
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* bỏ qua */ } },
  };
  function renderDock(jobs) {
    const active = jobs.filter(j => !['done', 'error'].includes(j.status));
    const recent = jobs.filter(j => j.status === 'done' || j.status === 'error');
    const finishedKey = recent.map(j => `${j.lessonId}:${j.status}`).join(',');
    clearTimeout(hideTimer);
    if (!jobs.length || (!active.length && store.get('uploadDockSeen') === finishedKey)) {
      if (dock) dock.hidden = true;
      return;
    }
    if (!active.length) {
      hideTimer = setTimeout(() => {
        if (dock) dock.hidden = true;
        store.set('uploadDockSeen', finishedKey);
      }, HIDE_AFTER);
    }
    if (!dock) {
      dock = document.createElement('button');
      dock.type = 'button';
      dock.className = 'upload-dock';
      dock.setAttribute('aria-live', 'polite');
      dock.title = 'Mở Trung tâm tải video';
      dock.addEventListener('click', () => { const w = openCenter(); if (w) w.focus(); });
      document.body.appendChild(dock);
    }
    dock.hidden = false;
    const total = active.length ? Math.floor(active.reduce((s, j) => s + j.pct, 0) / active.length) : 100;
    const head = active.length
      ? `Đang tải ${active.length} video · ${total}%`
      : `Đã tải xong ${recent.filter(j => j.status === 'done').length} video`;
    dock.classList.toggle('is-done', !active.length);
    dock.innerHTML = `<strong></strong><span class="bar-progress"><span style="width:${total}%"></span></span><ul></ul>`;
    dock.querySelector('strong').textContent = head;
    const ul = dock.querySelector('ul');
    jobs.slice(0, 4).forEach(j => {
      const li = document.createElement('li');
      li.textContent = `${j.title || 'Bài học'} — ${j.label}${j.status === 'done' ? '' : ` ${j.pct}%`}`;
      if (j.status === 'error') li.className = 'is-error';
      ul.appendChild(li);
    });
  }

  // Nhãn "đang chờ video" ở danh sách bài học chạy theo %, và dòng tiến độ ngay dưới tên bài đang tải.
  function updateBadges(jobs) {
    jobs.forEach(j => {
      const row = document.querySelector(`[data-upload-lesson="${j.lessonId}"]`)?.closest('.admin-lesson');
      const body = row && row.querySelector('.body');
      if (body && !body.querySelector('[data-pending-lesson]')) {
        let tag = body.querySelector('.upload-inline');
        if (!tag) {
          tag = document.createElement('span');
          tag.className = 'badge upload-inline';
          body.appendChild(tag);
        }
        tag.textContent = j.status === 'done' ? 'Video mới đã tải xong' : `${j.label} ${j.pct}%`;
        tag.className = `badge upload-inline ${j.status === 'done' ? 'badge-success' : j.status === 'error' ? 'badge-danger' : 'badge-primary'}`;
      }
      document.querySelectorAll(`[data-pending-lesson="${j.lessonId}"]`).forEach(el => {
        if (j.status === 'done') {
          el.textContent = 'Video đã tải xong';
          el.classList.replace('badge-warn', 'badge-success');
        } else {
          el.textContent = `${j.label} ${j.pct}%`;
        }
      });
    });
  }

  channel?.addEventListener('message', e => {
    const m = e.data || {};
    if (m.type === 'status') {
      renderDock(m.jobs || []);
      updateBadges(m.jobs || []);
    }
  });
  // Trang vừa mở: hỏi trung tâm (nếu đang mở) tiến độ hiện tại.
  channel?.postMessage({ type: 'status?' });

  window.DemiaUploads = { supported, openCenter, sendToCenter };
})();
