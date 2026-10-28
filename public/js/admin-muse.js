// Trang quản trị Muse Studio: tìm học viên, chọn tất cả những người đang hiện, đếm số đã chọn.
(() => {
  const rows = [...document.querySelectorAll('[data-filter-row]')];
  const items = () => [...document.querySelectorAll('[data-check-item]')];
  const count = document.querySelector('[data-checked-count]');
  const all = document.querySelector('[data-check-all]');
  const visible = r => !r.hidden;
  const sync = () => { if (count) count.textContent = 'Đã chọn ' + items().filter(c => c.checked).length; };

  const input = document.querySelector('[data-filter-input]');
  const filter = () => {
    const q = (input.value || '').trim().toLowerCase();
    rows.forEach(r => { r.hidden = q && !r.dataset.text.includes(q); });
    if (all) all.checked = false;
  };
  if (input) { input.addEventListener('input', filter); filter(); }

  if (all) all.addEventListener('change', () => {
    rows.filter(visible).forEach(r => { const c = r.querySelector('[data-check-item]'); if (c) c.checked = all.checked; });
    sync();
  });
  document.addEventListener('change', e => { if (e.target.matches('[data-check-item]')) sync(); });
  // Nút hàng loạt có hỏi lại (data-confirm đặt trên nút, không phải trên form).
  const bulk = document.getElementById('museBulk');
  if (bulk) bulk.addEventListener('submit', e => {
    const b = e.submitter;
    if (b && b.dataset.confirm && !confirm(b.dataset.confirm)) e.preventDefault();
  });
  sync();
})();
