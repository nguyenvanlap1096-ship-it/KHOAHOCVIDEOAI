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

  // Video tải xong: cập nhật nhãn "đang chờ video" trên trang hiện tại.
  channel?.addEventListener('message', e => {
    if (!e.data || e.data.type !== 'done') return;
    document.querySelectorAll(`[data-pending-lesson="${e.data.lessonId}"]`).forEach(el => {
      el.textContent = 'Video đã tải xong';
      el.classList.replace('badge-warn', 'badge-success');
    });
  });

  window.DemiaUploads = { supported, openCenter, sendToCenter };
})();
