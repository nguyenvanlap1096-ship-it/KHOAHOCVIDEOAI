(() => {
  /* Tự gợi ý slug từ tên khóa học (chỉ khi admin chưa tự sửa slug) */
  const src = document.querySelector('[data-slug-source]');
  const target = document.querySelector('[data-slug-target]');
  if (src && target) {
    let touched = Boolean(target.value);
    const slugify = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
    target.addEventListener('input', () => { touched = Boolean(target.value); });
    src.addEventListener('input', () => { if (!touched) target.placeholder = slugify(src.value) || 'tu-dong-tao-tu-ten'; });
  }

  /* Form bài học */
  const form = document.getElementById('lessonForm');
  if (!form) return;

  const panels = form.querySelectorAll('[data-video-panel]');
  const showPanel = type => panels.forEach(p => { p.hidden = p.dataset.videoPanel !== type; });
  form.querySelectorAll('input[name="video_type"]').forEach(r => r.addEventListener('change', () => showPanel(r.value)));

  const file = form.querySelector('#video_file');
  const fileName = form.querySelector('[data-file-name]');
  const duration = form.querySelector('#duration');
  const dropzone = form.querySelector('.dropzone');

  function onFile() {
    const f = file.files[0];
    if (!f) return;
    fileName.textContent = `${f.name} · ${(f.size / 1024 / 1024).toFixed(1)} MB`;
    // Đọc thời lượng video ngay trên trình duyệt để điền sẵn.
    if (!duration.value) {
      const url = URL.createObjectURL(f);
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => {
        const s = Math.round(v.duration);
        if (isFinite(s) && s > 0) duration.value = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
        URL.revokeObjectURL(url);
      };
      v.src = url;
    }
  }
  file?.addEventListener('change', onFile);
  ['dragenter', 'dragover'].forEach(ev => dropzone?.addEventListener(ev, e => { e.preventDefault(); dropzone.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(ev => dropzone?.addEventListener(ev, () => dropzone.classList.remove('is-over')));
  dropzone?.addEventListener('drop', e => {
    e.preventDefault();
    if (e.dataTransfer.files.length) { file.files = e.dataTransfer.files; onFile(); }
  });

  /* Upload có thanh tiến trình khi gửi kèm file video */
  form.addEventListener('submit', e => {
    const type = form.querySelector('input[name="video_type"]:checked')?.value;
    if (type !== 'upload' || !file.files.length || e.defaultPrevented) return;
    e.preventDefault();
    const box = document.getElementById('uploadProgress');
    const bar = document.getElementById('uploadBar');
    const text = document.getElementById('uploadText');
    box.hidden = false;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', form.action);
    xhr.upload.onprogress = ev => {
      if (!ev.lengthComputable) return;
      const pct = Math.round((ev.loaded / ev.total) * 100);
      bar.style.width = pct + '%';
      text.textContent = pct < 100 ? `Đang tải lên... ${pct}%` : 'Đang xử lý...';
    };
    xhr.onload = () => {
      // Server trả về trang mới (redirect đã được trình duyệt theo) → hiển thị kết quả.
      if (xhr.responseURL && xhr.status < 400) { window.location.href = xhr.responseURL; return; }
      document.open(); document.write(xhr.responseText); document.close();
    };
    xhr.onerror = () => { text.textContent = 'Tải lên thất bại. Kiểm tra kết nối và thử lại.'; };
    xhr.send(new FormData(form));
  });
})();
