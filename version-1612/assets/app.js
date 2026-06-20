(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function bindHeader() {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (header) {
      var update = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 20);
      };
      update();
      window.addEventListener("scroll", update, { passive: true });
    }
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer;
    function show(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
        dot.setAttribute("aria-current", i === current ? "true" : "false");
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
    }
    if (prev) prev.addEventListener("click", function () { show(current - 1); start(); });
    if (next) next.addEventListener("click", function () { show(current + 1); start(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { show(i); start(); });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function bindFilters() {
    var form = document.querySelector("[data-filter]");
    if (!form) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var keyword = form.querySelector("[data-filter-keyword]");
    var year = form.querySelector("[data-filter-year]");
    var region = form.querySelector("[data-filter-region]");
    var type = form.querySelector("[data-filter-type]");
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && keyword) keyword.value = query;
    function update() {
      var q = normalize(keyword && keyword.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var match = true;
        if (q && haystack.indexOf(q) === -1) match = false;
        if (y && normalize(card.getAttribute("data-year")) !== y) match = false;
        if (r && normalize(card.getAttribute("data-region")) !== r) match = false;
        if (t && normalize(card.getAttribute("data-type")) !== t) match = false;
        card.hidden = !match;
        if (match) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    }
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      update();
    });
    update();
  }

  ready(function () {
    bindHeader();
    bindHero();
    bindFilters();
  });
})();
