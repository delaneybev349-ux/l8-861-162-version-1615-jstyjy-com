(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initializePlayer(playerBox, sourceUrl) {
        var video = playerBox.querySelector('[data-video-element]');
        var overlay = playerBox.querySelector('[data-player-trigger]');

        if (!video || !sourceUrl) {
            return;
        }

        if (playerBox.hlsInstance) {
            playerBox.hlsInstance.destroy();
            playerBox.hlsInstance = null;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            playerBox.hlsInstance = hls;
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            video.addEventListener('loadedmetadata', function () {
                video.play().catch(function () {});
            }, { once: true });
        } else {
            video.src = sourceUrl;
            video.play().catch(function () {});
        }

        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    function bindPlayerBox(playerBox) {
        var overlay = playerBox.querySelector('[data-player-trigger]');
        var sourceButtons = Array.prototype.slice.call(document.querySelectorAll('[data-source-url]'));

        if (overlay) {
            overlay.addEventListener('click', function () {
                initializePlayer(playerBox, playerBox.getAttribute('data-video-source'));
            });
        }

        sourceButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                sourceButtons.forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                playerBox.setAttribute('data-video-source', button.getAttribute('data-source-url'));
                initializePlayer(playerBox, button.getAttribute('data-source-url'));
            });
        });
    }

    ready(function () {
        var playerBox = document.querySelector('[data-player-box]');

        if (playerBox) {
            bindPlayerBox(playerBox);
        }
    });
}());
