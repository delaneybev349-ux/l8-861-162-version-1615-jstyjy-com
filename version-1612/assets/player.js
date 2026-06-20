(function () {
  function initVideoPlayer(videoUrl) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var message = document.querySelector("[data-player-message]");
    var loaded = false;
    var hls = null;
    if (!video || !videoUrl) return;

    function showMessage(text) {
      if (!message) return;
      message.textContent = text;
      message.classList.add("is-visible");
    }

    function load() {
      if (loaded) return;
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            showMessage("播放暂时不可用，请稍后再试");
            hls.destroy();
          }
        });
      } else {
        showMessage("播放暂时不可用，请稍后再试");
      }
    }

    function start() {
      load();
      if (cover) cover.classList.add("is-hidden");
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          if (cover) cover.classList.remove("is-hidden");
        });
      }
    }

    if (cover) cover.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) start();
    });
    video.addEventListener("play", function () {
      if (cover) cover.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hls) hls.destroy();
    });
  }

  window.initVideoPlayer = initVideoPlayer;
})();
