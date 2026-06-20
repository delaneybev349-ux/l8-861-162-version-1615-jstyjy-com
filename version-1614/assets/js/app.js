(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 6200);
    }

    function setupSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        inputs.forEach(function (input) {
            var scopeSelector = input.getAttribute("data-search-input");
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));
            var count = document.querySelector(input.getAttribute("data-count-target") || "");
            var empty = document.querySelector(input.getAttribute("data-empty-target") || "");
            function apply() {
                var value = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || card.textContent || "";
                    var match = !value || text.toLowerCase().indexOf(value) !== -1;
                    card.classList.toggle("is-hidden", !match);
                    if (match) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = visible + " 部匹配";
                }
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            input.addEventListener("input", apply);
            apply();
        });
    }

    function setupPlayer() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".player-card"));
        players.forEach(function (player) {
            var video = player.querySelector("video[data-stream]");
            var trigger = player.querySelector(".player-trigger");
            if (!video) {
                return;
            }
            var streamUrl = video.getAttribute("data-stream");
            var attached = false;
            var hlsInstance = null;
            function attach() {
                if (attached || !streamUrl) {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                attached = true;
            }
            function play() {
                attach();
                player.classList.add("is-started");
                var request = video.play();
                if (request && typeof request.catch === "function") {
                    request.catch(function () {});
                }
            }
            if (trigger) {
                trigger.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-started");
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance && typeof hlsInstance.destroy === "function") {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayer();
    });
})();
