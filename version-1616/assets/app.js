(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    document.querySelectorAll('[data-search]').forEach(function (input) {
      var scope = input.closest('[data-search-scope]') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var empty = scope.querySelector('[data-empty]');

      input.addEventListener('input', function () {
        var value = input.value.trim().toLowerCase();
        var visibleCount = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
          var visible = !value || text.indexOf(value) !== -1;
          card.style.display = visible ? '' : 'none';
          if (visible) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visibleCount === 0);
        }
      });
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('[data-player-cover]');
      var playButtons = Array.prototype.slice.call(player.querySelectorAll('[data-player-toggle]'));
      var muteButton = player.querySelector('[data-player-mute]');
      var fullButton = player.querySelector('[data-player-full]');
      var url = player.getAttribute('data-video');
      var loaded = false;
      var hlsInstance = null;

      function loadVideo() {
        if (loaded || !video || !url) {
          return;
        }
        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function setPlayingState(isPlaying) {
        player.classList.toggle('is-playing', isPlaying);
        playButtons.forEach(function (button) {
          button.textContent = isPlaying ? '❚❚' : '▶';
        });
        if (cover) {
          cover.classList.toggle('is-hidden', isPlaying);
        }
      }

      function togglePlay() {
        if (!video) {
          return;
        }
        loadVideo();
        if (video.paused) {
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
          }
        } else {
          video.pause();
        }
      }

      playButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          togglePlay();
        });
      });

      if (cover) {
        cover.addEventListener('click', function (event) {
          event.preventDefault();
          togglePlay();
        });
      }

      if (video) {
        video.addEventListener('click', togglePlay);
        video.addEventListener('play', function () {
          setPlayingState(true);
        });
        video.addEventListener('pause', function () {
          setPlayingState(false);
        });
      }

      if (muteButton && video) {
        muteButton.addEventListener('click', function (event) {
          event.preventDefault();
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? '🔇' : '🔊';
        });
      }

      if (fullButton) {
        fullButton.addEventListener('click', function (event) {
          event.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
