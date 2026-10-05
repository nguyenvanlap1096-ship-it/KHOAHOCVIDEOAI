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

  /* Form khóa học: hiện ô giá khi bật "Khóa chuyên sâu" */
  const premiumToggle = document.querySelector('[data-premium-toggle]');
  const premiumPrice = document.querySelector('[data-premium-price]');
  if (premiumToggle && premiumPrice) {
    premiumToggle.addEventListener('change', () => {
      premiumPrice.hidden = !premiumToggle.checked;
      if (premiumToggle.checked) premiumPrice.querySelector('input').focus();
    });
  }

  /* Tự cắt sát mã QR: tìm mã QR trong ảnh (jsQR) rồi cắt bỏ phần thừa,
     chỉ chừa viền trắng mỏng để điện thoại vẫn quét được. Trả về null nếu không tìm thấy. */
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Không đọc được ảnh')); };
      img.src = url;
    });
  }

  async function cropQr(file) {
    if (typeof window.jsQR !== 'function') return null;
    const img = await loadImage(file);
    // Dò mã trên bản thu nhỏ cho nhanh, sau đó cắt trên ảnh gốc để giữ độ nét.
    const scale = Math.min(1, 1200 / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const probe = document.createElement('canvas');
    probe.width = w;
    probe.height = h;
    const pctx = probe.getContext('2d', { willReadFrequently: true });
    pctx.drawImage(img, 0, 0, w, h);
    const code = window.jsQR(pctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'attemptBoth' });
    if (!code) return null;

    const pts = ['topLeftCorner', 'topRightCorner', 'bottomLeftCorner', 'bottomRightCorner'].map(k => code.location[k]);
    const xs = pts.map(p => p.x / scale);
    const ys = pts.map(p => p.y / scale);
    const side = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    const modules = 17 + 4 * (code.version || 1);
    const margin = (side / modules) * 1.5; // viền ~1,5 ô mã: đủ để quét, không thừa
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    const size = side + margin * 2;

    const out = document.createElement('canvas');
    const outSize = Math.min(800, Math.round(size));
    out.width = out.height = outSize;
    const octx = out.getContext('2d');
    octx.fillStyle = '#fff';
    octx.fillRect(0, 0, outSize, outSize);
    octx.imageSmoothingEnabled = outSize < size; // thu nhỏ thì làm mượt, giữ nguyên thì giữ nét ô vuông
    octx.drawImage(img, cx - size / 2, cy - size / 2, size, size, 0, 0, outSize, outSize);
    const blob = await new Promise(r => out.toBlob(r, 'image/png'));
    return blob ? new File([blob], 'zalo-qr.png', { type: 'image/png' }) : null;
  }

  /* Xem trước ảnh thumbnail trước khi lưu */
  document.querySelectorAll('[data-image-input]').forEach(input => {
    const name = input.dataset.imageInput;
    const preview = document.querySelector(`[data-image-preview="${name}"]`);
    const remove = document.querySelector(`[data-image-remove="${name}"]`);
    let processing = false;
    input.addEventListener('change', async () => {
      let f = input.files[0];
      if (!f || processing) return;
      if (name === 'zalo_qr') {
        processing = true;
        try {
          const cropped = await cropQr(f);
          if (cropped) {
            const dt = new DataTransfer();
            dt.items.add(cropped);
            input.files = dt.files;
            f = cropped;
            window.Demia.toast('Đã tự căn sát mã QR, bỏ phần lề thừa.');
          } else {
            window.Demia.toast('Không tìm thấy mã QR trong ảnh – giữ nguyên ảnh gốc. Hãy chọn ảnh rõ nét hơn.', 'error');
          }
        } catch {
          window.Demia.toast('Không đọc được ảnh, hãy thử ảnh khác.', 'error');
        } finally {
          processing = false;
        }
      }
      if (f.size > 5 * 1024 * 1024) {
        window.Demia.toast('Ảnh vượt quá 5 MB, hãy chọn ảnh nhỏ hơn.', 'error');
        input.value = '';
        return;
      }
      const img = document.createElement('img');
      img.alt = 'Ảnh mới chọn';
      img.src = URL.createObjectURL(f);
      preview.replaceChildren(img);
      preview.classList.remove('is-removed');
      if (remove) remove.checked = false;
    });
    remove?.addEventListener('change', () => preview.classList.toggle('is-removed', remove.checked));
  });

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

  const ratioField = form.querySelector('[data-ratio-field]');
  const ratioSelect = form.querySelector('#video_ratio');
  const detectedRatio = form.querySelector('#detected_ratio');
  const ratioHint = form.querySelector('[data-ratio-hint]');
  const RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:4', '4:5', '21:9'];
  const RATIO_NAME = { '16:9': 'ngang 16:9', '9:16': 'dọc 9:16', '1:1': 'vuông 1:1', '4:3': 'ngang 4:3', '3:4': 'dọc 3:4', '4:5': 'dọc 4:5', '21:9': 'siêu rộng 21:9' };
  const nearestRatio = (w, h) => RATIOS.reduce((best, r) => {
    const [a, b] = r.split(':').map(Number);
    const [c, d] = best.split(':').map(Number);
    return Math.abs(Math.log(a / b / (w / h))) < Math.abs(Math.log(c / d / (w / h))) ? r : best;
  }, RATIOS[0]);
  const showDetected = (ratio, source) => {
    if (ratioHint) ratioHint.innerHTML = `Đã nhận diện <strong>${RATIO_NAME[ratio]}</strong> ${source}. Khung phát sẽ tự căn theo tỉ lệ này.`;
  };

  form.querySelectorAll('input[name="video_type"]').forEach(r => r.addEventListener('change', () => {
    if (ratioField) ratioField.hidden = r.value === 'none';
  }));
  form.querySelector('#youtube_url')?.addEventListener('input', e => {
    if (ratioSelect && ratioSelect.value === 'auto') showDetected(/\/shorts\//i.test(e.target.value) ? '9:16' : '16:9', 'từ link YouTube');
  });

  function onFile() {
    const f = file.files[0];
    if (!f) return;
    fileName.textContent = `${f.name} · ${(f.size / 1024 / 1024).toFixed(1)} MB`;
    // Đọc thời lượng và kích thước video ngay trên trình duyệt (chỉ đọc phần đầu file, gần như tức thì).
    const url = URL.createObjectURL(f);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      const s = Math.round(v.duration);
      if (!duration.value && isFinite(s) && s > 0) duration.value = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      if (v.videoWidth && v.videoHeight && detectedRatio) {
        const r = nearestRatio(v.videoWidth, v.videoHeight);
        detectedRatio.value = r;
        showDetected(r, `(${v.videoWidth}×${v.videoHeight})`);
      }
      URL.revokeObjectURL(url);
    };
    v.src = url;
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
