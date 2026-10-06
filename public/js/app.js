(() => {
  const csrf = document.querySelector('meta[name="csrf-token"]').content;

  async function post(url, data = {}) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      body: JSON.stringify(data),
      credentials: 'same-origin',
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Có lỗi xảy ra.');
    return json;
  }

  const RING_C = 97.39;
  function setRing(el, value) {
    if (!el) return;
    const v = Math.max(0, Math.min(100, Math.round(value)));
    el.dataset.value = v;
    el.setAttribute('aria-label', `Hoàn thành ${v}%`);
    el.querySelector('.bar').setAttribute('stroke-dashoffset', (RING_C * (1 - v / 100)).toFixed(2));
    el.querySelector('.label').textContent = v + '%';
  }

  function toast(message, type = 'success') {
    const el = document.createElement('div');
    el.className = `flash flash-${type} toast`;
    el.setAttribute('role', 'status');
    el.innerHTML = '<span></span>';
    el.querySelector('span').textContent = message;
    Object.assign(el.style, { position: 'fixed', right: '16px', bottom: '16px', zIndex: 60, margin: 0, boxShadow: 'var(--shadow)', maxWidth: 'calc(100vw - 32px)' });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  window.Demia = { csrf, post, setRing, toast };

  /* Drawer menu on small screens */
  const app = document.getElementById('app');
  const menuBtn = document.getElementById('menuBtn');
  const setPanel = open => {
    app.classList.toggle('panel-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    if (open) document.querySelector('#panel input, #panel a')?.focus();
  };
  menuBtn?.addEventListener('click', () => setPanel(!app.classList.contains('panel-open')));
  document.getElementById('scrim')?.addEventListener('click', () => setPanel(false));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && app.classList.contains('panel-open')) { setPanel(false); menuBtn.focus(); }
  });

  /* Collapsible sidebar sections (remembered per browser) */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  };
  document.querySelectorAll('.section-toggle').forEach(btn => {
    const id = btn.getAttribute('aria-controls');
    const body = document.getElementById(id);
    const apply = open => { btn.setAttribute('aria-expanded', String(open)); body.hidden = !open; };
    if (store.get('sec:' + id) === '0') apply(false);
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      apply(open);
      store.set('sec:' + id, open ? '1' : '0');
    });
  });

  /* Flash messages */
  document.querySelectorAll('.flash-close').forEach(b => b.addEventListener('click', () => b.closest('.flash').remove()));

  /* Confirm destructive forms + loading state on submit */
  document.addEventListener('submit', e => {
    const form = e.target;
    if (form.dataset.confirm && !confirm(form.dataset.confirm)) { e.preventDefault(); return; }
    if (e.defaultPrevented) return;
    const btn = form.querySelector('[data-loading-text]');
    if (btn) {
      btn.classList.add('is-loading');
      btn.setAttribute('aria-busy', 'true');
      btn.textContent = btn.dataset.loadingText;
    }
  });

  /* Show / hide password */
  document.querySelectorAll('[data-pw-toggle]').forEach(btn => btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.pwToggle);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.setAttribute('aria-label', show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
  }));

  /* Bookmark toggle */
  document.querySelectorAll('[data-bookmark]').forEach(btn => btn.addEventListener('click', async () => {
    btn.disabled = true;
    try {
      const { bookmarked } = await post(`/api/bookmarks/${btn.dataset.bookmark}`);
      btn.setAttribute('aria-pressed', String(bookmarked));
      const label = btn.querySelector('[data-bookmark-label]');
      if (label) label.textContent = bookmarked ? 'Đã lưu' : 'Lưu khóa học';
      toast(bookmarked ? 'Đã lưu khóa học.' : 'Đã bỏ lưu khóa học.');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  }));

  /* Share: native sheet on mobile, copy link elsewhere */
  document.querySelectorAll('[data-share]').forEach(btn => btn.addEventListener('click', async () => {
    const url = location.href;
    if (navigator.share) {
      try { await navigator.share({ title: document.title, url }); } catch { /* cancelled */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast('Đã sao chép liên kết.');
    } catch {
      prompt('Sao chép liên kết:', url);
    }
  }));

  /* Nút chuyển sáng / tối (ghi nhớ trong trình duyệt) */
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    const isDark = () => {
      const t = document.documentElement.dataset.theme;
      return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    const sync = () => {
      const dark = isDark();
      themeBtn.setAttribute('aria-pressed', String(dark));
      themeBtn.setAttribute('aria-label', dark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối');
      themeBtn.title = dark ? 'Chế độ sáng' : 'Chế độ tối';
    };
    themeBtn.addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      store.set('theme', next);
      sync();
    });
    sync();
  }

  /* Nút Zalo hỗ trợ */
  const zaloFab = document.getElementById('zaloFab');
  const zaloCard = document.getElementById('zaloCard');
  if (zaloFab && zaloCard) {
    const setZalo = open => {
      zaloCard.hidden = !open;
      zaloFab.setAttribute('aria-expanded', String(open));
      if (open) zaloCard.querySelector('.btn-zalo')?.focus();
    };
    zaloFab.addEventListener('click', () => setZalo(zaloCard.hidden));
    zaloCard.querySelector('[data-zalo-close]')?.addEventListener('click', () => { setZalo(false); zaloFab.focus(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !zaloCard.hidden) { setZalo(false); zaloFab.focus(); } });
    document.addEventListener('click', e => { if (!zaloCard.hidden && !e.target.closest('#zalo')) setZalo(false); });
  }

  /* Prompt: sao chép và xem đầy đủ */
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* fallback bên dưới */ }
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
  document.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const text = document.getElementById(btn.dataset.copy).innerText.trim();
    const label = btn.querySelector('span');
    const original = label.textContent;
    if (await copyText(text)) {
      btn.classList.add('is-copied');
      label.textContent = 'Đã chép';
      toast(btn.dataset.copyMsg || `Đã sao chép: ${text}`);
      setTimeout(() => { btn.classList.remove('is-copied'); label.textContent = original; }, 2000);
    } else {
      toast('Không sao chép được, hãy bôi đen và sao chép thủ công.', 'error');
    }
  }));

  /* Thẻ prompt có bản dịch: chuyển EN / Tiếng Việt, nút Sao chép chép đúng bản đang xem */
  document.querySelectorAll('[data-lang-for]').forEach(btn => btn.addEventListener('click', () => {
    const id = `lp-${btn.dataset.langFor}`;
    const lang = btn.dataset.lang;
    document.querySelectorAll(`[data-lang-for="${btn.dataset.langFor}"]`).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    ['en', 'vi'].forEach(l => { document.getElementById(`${id}-${l}`).hidden = l !== lang; });
    document.getElementById(`${id}-copy`).dataset.copy = `${id}-${lang}`;
    // Bản dịch dài/ngắn hơn: tính lại nút "Xem đầy đủ".
    const box = document.getElementById(id);
    const more = document.querySelector(`[data-expand="${id}"]`);
    if (more && !box.classList.contains('is-open')) {
      box.classList.remove('no-overflow');
      const fits = box.scrollHeight <= box.clientHeight + 4;
      box.classList.toggle('no-overflow', fits);
      more.hidden = fits;
    }
  }));

  /* Khung "Hướng dẫn học": bấm ra ngoài hoặc nhấn Esc thì tự thu lại */
  const guide = document.getElementById('studyGuide');
  if (guide) {
    document.addEventListener('click', e => { if (guide.open && !guide.contains(e.target)) guide.open = false; });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && guide.open) { guide.open = false; guide.querySelector('summary').focus(); }
    });
  }

  /* Trang đơn hàng đang chờ: tự tải lại định kỳ để thấy ngay khi admin xác nhận */
  const autoRefresh = document.querySelector('[data-auto-refresh]');
  if (autoRefresh) setTimeout(() => location.reload(), Number(autoRefresh.dataset.autoRefresh) * 1000);
  document.querySelectorAll('[data-expand]').forEach(btn => {
    const box = document.getElementById(btn.dataset.expand);
    if (box.scrollHeight <= box.clientHeight + 4) { box.classList.add('no-overflow'); btn.hidden = true; }
    btn.addEventListener('click', () => {
      const open = box.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Thu gọn' : 'Xem đầy đủ';
    });
  });

  /* Tabs (ARIA, arrow keys) */
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(tab, focus = true) {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length]);
      if (e.key === 'ArrowLeft') selectTab(tabs[(i - 1 + tabs.length) % tabs.length]);
    });
  });
})();
