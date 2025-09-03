(function () {
  const grid = document.getElementById('grid');
  const tiles = Array.from(grid.querySelectorAll('.tile'));
  const videoModal = document.getElementById('videoModal');
  const rulesModal = document.getElementById('rulesModal');
  const closeVideo = document.getElementById('closeVideo');
  const closeRules = document.getElementById('closeRules');
  const videoContainer = document.getElementById('videoContainer');

  const KEYS = {
    LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13,
    BACK: 461, ESC: 27, BACKSPACE: 8
  };

  // Make tiles programmatically focusable for TV remotes
  let focusedIndex = 0;
  function setFocus(i) {
    focusedIndex = (i + tiles.length) % tiles.length;
    tiles.forEach((t, idx) => t.setAttribute('tabindex', idx === focusedIndex ? '0' : '-1'));
    tiles[focusedIndex].focus();
  }
  setFocus(0);

  // Click / OK handlers
  document.getElementById('tile-video').addEventListener('click', openVideo);
  document.getElementById('tile-rules').addEventListener('click', openRules);

  function openVideo() {
    openModal(videoModal);
    // Lazy-create the YouTube iframe on open
    const id = (window.YOUTUBE_VIDEO_ID || '').trim();
    const origin = encodeURIComponent(window.location.origin);
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('title', 'Hot Tub Instructions (YouTube)');
    // Use modest YouTube embed with no related videos after play
    iframe.src = id
      ? `https://www.youtube.com/embed/${id}?rel=0&autoplay=1&origin=${origin}`
      : '';
    // Fallback clickable link if ID not set
    if (!id) {
      const p = document.createElement('p');
      p.style.padding = '16px';
      p.innerHTML = 'Add your YouTube video ID in <code>index.html</code> (window.YOUTUBE_VIDEO_ID).';
      videoContainer.appendChild(p);
    } else {
      videoContainer.appendChild(iframe);
    }
  }

  function closeVideoModal() {
    closeModal(videoModal);
    // Stop playback by removing iframe
    while (videoContainer.firstChild) videoContainer.removeChild(videoContainer.firstChild);
  }

  function openRules() {
    openModal(rulesModal);
  }

  function openModal(modal) {
    modal.setAttribute('aria-hidden', 'false');
    // Keep focus on the close button
    const btn = modal.querySelector('.close');
    btn && btn.focus();
  }

  function closeModal(modal) {
    modal.setAttribute('aria-hidden', 'true');
    setFocus(focusedIndex); // return focus to last tile
  }

  closeVideo.addEventListener('click', closeVideoModal);
  closeRules.addEventListener('click', () => closeModal(rulesModal));

  // Keyboard navigation for TV remotes
  window.addEventListener('keydown', (e) => {
    const code = e.keyCode || e.which;

    // Close modals with BACK / ESC
    const anyOpen = videoModal.getAttribute('aria-hidden') === 'false' ||
                    rulesModal.getAttribute('aria-hidden') === 'false';
    if (anyOpen && (code === KEYS.BACK || code === KEYS.ESC || code === KEYS.BACKSPACE)) {
      e.preventDefault();
      if (videoModal.getAttribute('aria-hidden') === 'false') closeVideoModal();
      if (rulesModal.getAttribute('aria-hidden') === 'false') closeModal(rulesModal);
      return;
    }

    // Grid navigation (single row of 3)
    if (code === KEYS.LEFT)  { e.preventDefault(); setFocus(focusedIndex - 1); }
    if (code === KEYS.RIGHT) { e.preventDefault(); setFocus(focusedIndex + 1); }
    if (code === KEYS.UP || code === KEYS.DOWN) {
      // No vertical movement in single row; bounce with a subtle style if you like
      e.preventDefault();
    }
    if (code === KEYS.ENTER) {
      e.preventDefault();
      tiles[focusedIndex].click();
    }
  });

  // If the user wanders the pointer, keep focus styling sane
  tiles.forEach((tile, idx) => {
    tile.addEventListener('mouseover', () => setFocus(idx));
  });
})();
