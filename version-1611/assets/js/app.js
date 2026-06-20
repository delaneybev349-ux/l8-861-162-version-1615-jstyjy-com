(function () {
  var header = document.querySelector('[data-site-header]');
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function syncHeader() {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showHero(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showHero(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showHero(current + 1);
        startHero();
      });
    }

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    startHero();
  }

  function filterCards(value, area) {
    var query = String(value || '').trim().toLowerCase();
    var cards = Array.prototype.slice.call((area || document).querySelectorAll('[data-movie-card]'));
    cards.forEach(function (card) {
      var text = String(card.getAttribute('data-search') || '').toLowerCase();
      card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
    });
  }

  var searchInput = document.getElementById('movieSearch');
  var searchArea = document.getElementById('searchResults');
  if (searchInput && searchArea) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      searchInput.value = initial;
      filterCards(initial, searchArea);
    }
    searchInput.addEventListener('input', function () {
      filterCards(searchInput.value, searchArea);
    });
  }

  var clearButton = document.querySelector('[data-search-clear]');
  if (clearButton && searchInput && searchArea) {
    clearButton.addEventListener('click', function () {
      searchInput.value = '';
      filterCards('', searchArea);
      searchInput.focus();
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]')).forEach(function (input) {
    var area = input.closest('.content-section').querySelector('[data-filter-area]');
    input.addEventListener('input', function () {
      filterCards(input.value, area);
    });
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.querySelector('[data-player-video]');
  var cover = document.querySelector('[data-play-cover]');
  var frame = document.querySelector('[data-video-frame]');
  var attached = false;
  var hls = null;

  if (!video || !streamUrl) {
    return;
  }

  function attachStream() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          hls = null;
          attached = false;
        }
      });
      return;
    }

    video.src = streamUrl;
  }

  function playVideo() {
    attachStream();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  if (frame) {
    frame.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      playVideo();
    });
  }

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (cover && video.currentTime === 0) {
      cover.classList.remove('is-hidden');
    }
  });
}
