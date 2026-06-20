import { H as Hls } from './hls-vendor-dru42stk.js';

function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function setupHeader() {
  const header = document.querySelector('[data-site-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (header) {
    const updateHeader = () => {
      header.classList.toggle('scrolled', window.scrollY > 18);
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }
}

function setupHeroSlider() {
  const slider = document.querySelector('[data-hero-slider]');
  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
  const prevButton = slider.querySelector('[data-hero-prev]');
  const nextButton = slider.querySelector('[data-hero-next]');
  let currentIndex = 0;
  let timer = null;

  const showSlide = (index) => {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, offset) => {
      slide.classList.toggle('active', offset === currentIndex);
    });

    dots.forEach((dot, offset) => {
      dot.classList.toggle('active', offset === currentIndex);
    });
  };

  const nextSlide = () => showSlide(currentIndex + 1);
  const prevSlide = () => showSlide(currentIndex - 1);

  const startTimer = () => {
    stopTimer();
    timer = window.setInterval(nextSlide, 5200);
  };

  const stopTimer = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.heroDot || 0));
      startTimer();
    });
  });

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      prevSlide();
      startTimer();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      nextSlide();
      startTimer();
    });
  }

  slider.addEventListener('mouseenter', stopTimer);
  slider.addEventListener('mouseleave', startTimer);
  showSlide(0);
  startTimer();
}

function setupMovieFilters() {
  const lists = Array.from(document.querySelectorAll('[data-movie-list]'));
  if (!lists.length) {
    return;
  }

  const searchInput = document.querySelector('[data-filter-search]');
  const yearSelect = document.querySelector('[data-filter-select="year"]');
  const typeSelect = document.querySelector('[data-filter-select="type"]');
  const emptyState = document.querySelector('[data-empty-state]');

  const cards = lists.flatMap((list) => Array.from(list.querySelectorAll('[data-movie-card]')));

  const fillSelectOptions = (select, attribute) => {
    if (!select || select.options.length > 1) {
      return;
    }

    const values = Array.from(new Set(cards.map((card) => card.dataset[attribute]).filter(Boolean))).sort().reverse();
    values.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.append(option);
    });
  };

  fillSelectOptions(yearSelect, 'year');
  fillSelectOptions(typeSelect, 'type');

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q');
  if (initialQuery && searchInput) {
    searchInput.value = initialQuery;
  }

  const applyFilters = () => {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const year = yearSelect?.value || '';
    const type = typeSelect?.value || '';
    let visibleCount = 0;

    cards.forEach((card) => {
      const text = (card.dataset.title || '').toLowerCase();
      const matchesQuery = !query || text.includes(query);
      const matchesYear = !year || card.dataset.year === year;
      const matchesType = !type || (card.dataset.type || '').includes(type);
      const isVisible = matchesQuery && matchesYear && matchesType;

      card.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  };

  [searchInput, yearSelect, typeSelect].forEach((control) => {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  applyFilters();
}

function setupPlayers() {
  const videos = Array.from(document.querySelectorAll('video[data-src]'));

  videos.forEach((video) => {
    const shell = video.closest('.video-shell');
    const trigger = shell?.querySelector('[data-player-trigger]');
    const source = video.dataset.src;

    if (!source) {
      return;
    }

    const markPlaying = () => {
      if (shell) {
        shell.classList.add('is-playing');
      }
    };

    const playVideo = () => {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          if (shell) {
            shell.classList.remove('is-playing');
          }
        });
      }
    };

    const loadVideo = () => {
      if (video.dataset.loaded === 'true') {
        markPlaying();
        playVideo();
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.dataset.loaded = 'true';
        markPlaying();
        playVideo();
        return;
      }

      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video.dataset.loaded = 'true';
        video._hls = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          markPlaying();
          playVideo();
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      }
    };

    if (trigger) {
      trigger.addEventListener('click', loadVideo);
    }

    video.addEventListener('play', markPlaying);
    video.addEventListener('pause', () => {
      if (shell) {
        shell.classList.remove('is-playing');
      }
    });
  });
}

ready(() => {
  setupHeader();
  setupHeroSlider();
  setupMovieFilters();
  setupPlayers();
});
