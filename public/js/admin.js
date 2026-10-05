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

  /* Thời lượng tự quét: điền vào ô Thời lượng mỗi khi chọn video mới (vẫn sửa tay được). */
  const durationHint = form.querySelector('[data-duration-hint]');
  const fmtSec = sec => {
    const s = Math.round(sec);
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = String(s % 60).padStart(2, '0');
    return hh ? `${hh}:${String(mm).padStart(2, '0')}:${ss}` : `${mm}:${ss}`;
  };
  const setDuration = (sec, source) => {
    if (!(isFinite(sec) && sec > 0)) return;
    duration.value = fmtSec(sec);
    duration.classList.add('is-auto');
    if (durationHint) durationHint.textContent = `Đã quét tự động ${source}`;
  };
  const durationStatus = text => { if (durationHint) durationHint.textContent = text; };
  duration.addEventListener('input', () => {
    duration.classList.remove('is-auto');
    durationStatus('Đã nhập tay');
  });

  function onFile() {
    const f = file.files[0];
    if (!f) return;
    fileName.textContent = `${f.name} · ${(f.size / 1024 / 1024).toFixed(1)} MB`;
    durationStatus('Đang quét thời lượng…');
    // Đọc thời lượng và kích thước video ngay trên trình duyệt (chỉ đọc phần đầu file, gần như tức thì).
    const url = URL.createObjectURL(f);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    const done = () => { setDuration(v.duration, 'từ file'); URL.revokeObjectURL(url); };
    v.onloadedmetadata = () => {
      if (v.videoWidth && v.videoHeight && detectedRatio) {
        const r = nearestRatio(v.videoWidth, v.videoHeight);
        detectedRatio.value = r;
        showDetected(r, `(${v.videoWidth}×${v.videoHeight})`);
      }
      if (isFinite(v.duration) && v.duration > 0) return done();
      // Một số file WebM không ghi sẵn thời lượng: tua tới cuối để trình duyệt tự tính.
      v.ontimeupdate = () => { v.ontimeupdate = null; v.currentTime = 0; done(); };
      v.currentTime = Number.MAX_SAFE_INTEGER;
    };
    v.onerror = () => { durationStatus('Không đọc được thời lượng, hãy nhập tay (phút:giây)'); URL.revokeObjectURL(url); };
    v.src = url;
  }

  /* Link YouTube: hỏi trình phát YouTube (ẩn) để lấy thời lượng, không cần khóa API. */
  const ytInput = form.querySelector('#youtube_url');
  const ytId = s => {
    s = String(s || '').trim();
    if (/^[\w-]{11}$/.test(s)) return s;
    const m = s.match(/(?:youtu\.be\/|[?&]v=|\/(?:embed|shorts|live)\/)([\w-]{11})/);
    return m ? m[1] : null;
  };
  let ytApi = null;
  let ytProbe = null;
  let lastYtId = ytId(ytInput && ytInput.value);
  const loadYtApi = () => ytApi || (ytApi = new Promise(resolve => {
    if (window.YT && window.YT.Player) return resolve(window.YT);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }));
  async function probeYoutube(id) {
    durationStatus('Đang quét thời lượng từ YouTube…');
    const YT = await loadYtApi();
    const getDur = () => new Promise(resolve => {
      let tries = 0;
      const tick = () => {
        const d = ytProbe && ytProbe.getDuration ? ytProbe.getDuration() : 0;
        if (d > 0 || ++tries > 40) return resolve(d);
        setTimeout(tick, 250);
      };
      tick();
    });
    if (!ytProbe) {
      const box = document.createElement('div');
      box.style.cssText = 'position:fixed;left:-10000px;top:0;width:320px;height:180px';
      box.innerHTML = '<div id="ytProbe"></div>';
      document.body.appendChild(box);
      await new Promise(resolve => {
        ytProbe = new YT.Player('ytProbe', {
          host: 'https://www.youtube-nocookie.com', width: 320, height: 180, videoId: id,
          playerVars: { mute: 1 }, events: { onReady: resolve },
        });
      });
    } else {
      ytProbe.cueVideoById(id);
    }
    const d = await getDur();
    if (ytId(ytInput.value) !== id) return; // admin đã đổi link khác trong lúc quét
    if (d > 0) setDuration(d, 'từ YouTube');
    else durationStatus('Không lấy được thời lượng từ YouTube, hãy nhập tay (phút:giây)');
  }
  let ytTimer = null;
  ytInput?.addEventListener('input', () => {
    clearTimeout(ytTimer);
    ytTimer = setTimeout(() => {
      const id = ytId(ytInput.value);
      if (!id || id === lastYtId) return;
      lastYtId = id;
      probeYoutube(id).catch(() => durationStatus('Không lấy được thời lượng từ YouTube, hãy nhập tay (phút:giây)'));
    }, 500);
  });
  file?.addEventListener('change', onFile);
  ['dragenter', 'dragover'].forEach(ev => dropzone?.addEventListener(ev, e => { e.preventDefault(); dropzone.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(ev => dropzone?.addEventListener(ev, () => dropzone.classList.remove('is-over')));
  dropzone?.addEventListener('drop', e => {
    e.preventDefault();
    if (e.dataTransfer.files.length) { file.files = e.dataTransfer.files; onFile(); }
  });

  const toSeconds = v => String(v || '').trim().split(':').map(Number).reduce((acc, n) => acc * 60 + (n || 0), 0);

  /* Có file video: lưu bài học ngay (không kèm file), rồi tải video theo từng phần 5 MB.
     Ưu tiên chuyển file sang cửa sổ "Trung tâm tải video" (tải trong nền, rời trang vẫn tiếp tục);
     nếu trình duyệt chặn cửa sổ bật lên thì tải theo từng phần ngay tại trang, có % và các bước. */
  form.addEventListener('submit', async e => {
    const type = form.querySelector('input[name="video_type"]:checked')?.value;
    if (type !== 'upload' || !file.files.length || e.defaultPrevented) return;
    e.preventDefault();
    const videoFile = file.files[0];
    const bg = window.DemiaUploads;
    // Mở cửa sổ trung tâm ngay trong thao tác bấm (trình duyệt chỉ cho mở popup lúc người dùng bấm).
    const center = bg && bg.supported ? bg.openCenter() : null;
    const submitBtn = form.querySelector('[type="submit"]');
    const btnText = submitBtn.textContent;
    submitBtn.classList.add('is-loading');
    submitBtn.textContent = 'Đang lưu bài học...';

    const fd = new FormData(form);
    fd.delete('video_file');
    fd.set('video_pending', '1');
    let res;
    try {
      res = await fetch(form.action, { method: 'POST', body: fd, headers: { Accept: 'application/json' }, credentials: 'same-origin' });
    } catch {
      window.Demia.toast('Không lưu được bài học. Kiểm tra kết nối và thử lại.', 'error');
      submitBtn.classList.remove('is-loading');
      submitBtn.textContent = btnText;
      return;
    }
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) {
      // Lỗi nhập liệu: hiện lại form kèm thông báo lỗi (cần chọn lại file video).
      const html = await res.text();
      document.open(); document.write(html); document.close();
      return;
    }
    const saved = await res.json();
    const job = {
      file: videoFile, lessonId: saved.lessonId, lessonTitle: saved.title,
      ratio: detectedRatio ? detectedRatio.value : '', duration: toSeconds(duration.value),
    };

    if (center) {
      try {
        await bg.sendToCenter(job);
        window.location.href = saved.redirect;
        return;
      } catch { /* trung tâm không phản hồi → tải ngay tại trang */ }
    } else {
      window.Demia.toast('Trình duyệt chặn cửa sổ Trung tâm tải video – đang tải ngay tại trang này (giữ trang mở). Hãy cho phép popup để lần sau tải trong nền.', 'error');
    }
    submitBtn.textContent = 'Đang tải video...';
    uploadInPage(job, saved);
  });

  /* Tải theo từng phần ngay tại trang (dự phòng), hiển thị % và bước đang làm. */
  function uploadInPage(info, saved) {
    const core = window.DemiaUploadCore;
    const box = document.getElementById('uploadProgress');
    const bar = document.getElementById('uploadBar');
    const text = document.getElementById('uploadText');
    box.hidden = false;
    box.scrollIntoView({ block: 'center' });
    const job = core.createJob(info);
    const leaveGuard = ev => { ev.preventDefault(); ev.returnValue = 'Video đang tải lên.'; };
    window.addEventListener('beforeunload', leaveGuard);
    const show = j => {
      const pct = Math.floor(core.percent(j));
      bar.style.width = `${pct}%`;
      text.textContent = `${pct}% · ${core.stageText(j)}`;
      box.dataset.status = j.status;
    };
    const start = () => core.run(job, show).then(() => {
      if (job.status === 'done') {
        window.removeEventListener('beforeunload', leaveGuard);
        text.textContent = '100% · Hoàn tất – video đã sẵn sàng. Đang quay lại danh sách bài học…';
        setTimeout(() => { window.location.href = saved.redirect; }, 800);
      } else if (job.status === 'error') {
        const again = document.createElement('button');
        again.type = 'button';
        again.className = 'btn btn-sm btn-outline';
        again.textContent = 'Thử lại (tải tiếp từ chỗ dừng)';
        again.onclick = () => { again.remove(); start(); };
        text.after(again);
      }
    });
    start();
  }
})();
