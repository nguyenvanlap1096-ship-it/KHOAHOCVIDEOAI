// Theo dõi tiến độ xem video (YouTube hoặc file upload) và đồng bộ lên server.
(() => {
  const player = document.getElementById('player');
  if (!player) return;
  const { post, setRing, toast, csrf } = window.Demia;

  const lessonId = Number(player.dataset.lessonId);
  const startAt = Number(player.dataset.start) || 0;
  const completeBtn = document.getElementById('completeBtn');
  const rowRing = document.querySelector(`[data-lesson-row="${lessonId}"] .ring`);
  const courseRing = document.querySelector('.side .progress-card .ring');

  let lastSent = 0;
  let done = completeBtn?.getAttribute('aria-pressed') === 'true';

  function applyResult(r) {
    setRing(rowRing, r.percent);
    setRing(courseRing, r.coursePercent);
    if (r.completed && !done) {
      done = true;
      markButtonDone();
      toast('Bạn đã hoàn thành bài học này!');
    }
  }

  function markButtonDone() {
    if (!completeBtn) return;
    completeBtn.classList.replace('btn-outline', 'btn-success');
    completeBtn.setAttribute('aria-pressed', 'true');
    completeBtn.querySelector('span').textContent = 'Đã hoàn thành';
  }

  async function send(position, duration, completed = false) {
    lastSent = Date.now();
    try {
      applyResult(await post('/api/progress', { lessonId, position, duration, completed }));
    } catch { /* mạng lỗi: lần gửi sau sẽ bù lại */ }
  }

  // Khi rời trang: dùng sendBeacon để không mất tiến độ.
  function beacon(position, duration) {
    const body = new Blob([JSON.stringify({ lessonId, position, duration, _csrf: csrf })], { type: 'application/json' });
    navigator.sendBeacon?.('/api/progress', body);
  }

  completeBtn?.addEventListener('click', () => {
    if (done) return;
    send(getPosition(), getDuration(), true);
  });

  let getPosition = () => 0;
  let getDuration = () => Number(player.dataset.duration) || 0;
  let isPlaying = () => false;

  function track() {
    setInterval(() => {
      if (isPlaying() && Date.now() - lastSent > 10000) send(getPosition(), getDuration());
    }, 2000);
    const flush = () => { if (getPosition() > 0) beacon(getPosition(), getDuration()); };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
    window.addEventListener('pagehide', flush);
  }

  /* ---------- File video upload ---------- */
  const video = document.getElementById('videoEl');
  if (video) {
    getPosition = () => video.currentTime;
    getDuration = () => video.duration || Number(player.dataset.duration) || 0;
    isPlaying = () => !video.paused && !video.ended;
    video.addEventListener('loadedmetadata', () => {
      if (startAt > 0 && startAt < video.duration - 5) video.currentTime = startAt;
    }, { once: true });
    video.addEventListener('pause', () => send(getPosition(), getDuration()));
    video.addEventListener('ended', () => send(getDuration(), getDuration(), true));
    track();
  }

  /* ---------- YouTube ---------- */
  const yt = document.getElementById('ytPlayer');
  if (yt) {
    let ytp = null;
    getPosition = () => (ytp && ytp.getCurrentTime ? ytp.getCurrentTime() : 0);
    getDuration = () => (ytp && ytp.getDuration ? ytp.getDuration() : 0) || Number(player.dataset.duration) || 0;
    isPlaying = () => ytp && ytp.getPlayerState && ytp.getPlayerState() === 1;

    window.onYouTubeIframeAPIReady = () => {
      ytp = new YT.Player('ytPlayer', {
        host: 'https://www.youtube-nocookie.com',
        videoId: yt.dataset.videoId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1, start: Math.floor(startAt) },
        events: {
          onStateChange: e => {
            if (e.data === YT.PlayerState.PAUSED) send(getPosition(), getDuration());
            if (e.data === YT.PlayerState.ENDED) send(getDuration(), getDuration(), true);
          },
        },
      });
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    document.head.appendChild(s);
    track();
  }
})();
