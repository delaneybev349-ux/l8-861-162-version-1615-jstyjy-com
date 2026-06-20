(function () {
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var startButton = document.querySelector('[data-player-start]');
  var hlsInstance = null;

  if (!video || !startButton) {
    return;
  }

  var streamUrl = video.getAttribute('data-stream');

  function attachStream() {
    if (!streamUrl) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = streamUrl;
      }
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      }
      return;
    }

    if (!video.src) {
      video.src = streamUrl;
    }
  }

  function startPlayback() {
    attachStream();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    video.controls = true;

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  startButton.addEventListener('click', startPlayback);

  if (overlay && overlay !== startButton) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (!video.ended && video.currentTime === 0 && overlay) {
      overlay.classList.remove('is-hidden');
    }
  });
})();
