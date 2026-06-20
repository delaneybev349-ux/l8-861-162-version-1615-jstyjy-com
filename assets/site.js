
(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function debounce(fn, delay) {
    let timer;
    return function () {
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function setActiveNav() {
    const path = location.pathname.split("/").pop() || "index.html";
    qsa(".nav a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href === path || (path === "" && href === "index.html")) {
        link.classList.add("active");
      }
    });
  }

  function setupMenu() {
    const toggle = qs("[data-menu-toggle]");
    const nav = qs("[data-nav]");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      toggle.setAttribute(
        "aria-expanded",
        nav.classList.contains("open") ? "true" : "false"
      );
    });
  }

  function setupBackToTop() {
    const btn = qs("[data-back-to-top]");
    if (!btn) return;
    const onScroll = () => {
      if (window.scrollY > 480) btn.classList.add("show");
      else btn.classList.remove("show");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function setupCarousel() {
    const strip = qs("[data-hero-strip]");
    if (!strip) return;
    let timer = setInterval(() => {
      const max = strip.scrollWidth - strip.clientWidth;
      if (max <= 0) return;
      const next = strip.scrollLeft + 2;
      strip.scrollTo({
        left: next >= max ? 0 : next,
        behavior: "smooth"
      });
    }, 40);
    strip.addEventListener("mouseenter", () => clearInterval(timer));
    strip.addEventListener("mouseleave", () => {
      timer = setInterval(() => {
        const max = strip.scrollWidth - strip.clientWidth;
        if (max <= 0) return;
        const next = strip.scrollLeft + 2;
        strip.scrollTo({
          left: next >= max ? 0 : next,
          behavior: "smooth"
        });
      }, 40);
    });
  }

  function setupLocalFilter() {
    const input = qs("[data-local-filter]");
    const cards = qsa("[data-filter-item]");
    if (!input || cards.length === 0) return;

    function filterCards() {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach((card) => {
        const text = (card.getAttribute("data-search") || "").toLowerCase();
        const ok = !q || text.includes(q);
        card.style.display = ok ? "" : "none";
        if (ok) shown += 1;
      });
      const result = qs("[data-local-filter-count]");
      if (result) result.textContent = String(shown);
    }

    input.addEventListener("input", debounce(filterCards, 90));
    filterCards();
  }

  function createCard(movie) {
    const a = document.createElement("a");
    a.className = "movie-card";
    a.href = movie.link;
    a.setAttribute("data-filter-item", "1");
    a.setAttribute("data-search", [movie.title, movie.region, movie.type, movie.genre, movie.oneLine, movie.tags.join(" ")].join(" "));
    a.innerHTML = `
      <div class="movie-cover" style="--c1:${movie.c1};--c2:${movie.c2};">
        <img src="${movie.poster}" alt="${movie.title}" loading="lazy" />
        <div class="poster-fallback">${movie.title}</div>
      </div>
      <div class="movie-body">
        <h3>${movie.title}</h3>
        <div class="meta-row">
          <span class="meta-pill">${movie.year}</span>
          <span class="meta-pill">${movie.region}</span>
          <span class="meta-pill">${movie.type}</span>
        </div>
        <p>${movie.oneLine || movie.summary || ""}</p>
        <div class="tag-row">
          ${movie.tags.slice(0, 3).map((tag) => `<span class="tag-pill">${tag}</span>`).join("")}
        </div>
      </div>
    `;
    return a;
  }

  function setupSearchPage() {
    const mount = qs("[data-search-results]");
    if (!mount || !window.MOVIES) return;

    const params = new URLSearchParams(location.search);
    const q = (params.get("q") || "").trim();
    const region = (params.get("region") || "").trim();
    const type = (params.get("type") || "").trim();

    qsa("[data-search-input]").forEach((input) => {
      input.value = q;
    });

    const termBadge = qs("[data-query-badge]");
    if (termBadge) {
      termBadge.textContent = q || "全部影片";
    }

    const list = Array.isArray(window.MOVIES) ? window.MOVIES.slice() : [];
    const filtered = list.filter((movie) => {
      const haystack = [movie.title, movie.region, movie.type, movie.genre, movie.oneLine, movie.summary, (movie.tags || []).join(" ")].join(" ").toLowerCase();
      const qOk = !q || haystack.includes(q.toLowerCase());
      const rOk = !region || movie.region === region;
      const tOk = !type || movie.type === type;
      return qOk && rOk && tOk;
    });

    const info = qs("[data-search-info]");
    if (info) {
      info.textContent = `找到 ${filtered.length} 条结果`;
    }

    mount.innerHTML = "";
    if (!filtered.length) {
      mount.innerHTML = `
        <div class="search-empty">
          <h3>没有找到匹配影片</h3>
          <p>试试用地区、类型或更短的关键词继续检索。</p>
        </div>
      `;
      return;
    }

    filtered.slice(0, 300).forEach((movie) => mount.appendChild(createCard(movie)));
  }

  function setupPlayer() {
    const video = qs("[data-video-player]");
    if (!video) return;
    const btn = qs("[data-play-button]");
    const m3u8 = video.getAttribute("data-m3u8");
    const mp4 = video.getAttribute("data-mp4");

    function attachSource() {
      if (window.Hls && Hls.isSupported() && m3u8) {
        const hls = new Hls({
          maxBufferLength: 30
        });
        hls.loadSource(m3u8);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (btn) btn.textContent = "开始播放";
        });
        window.__currentHls = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl") && m3u8) {
        video.src = m3u8;
      } else if (mp4) {
        video.src = mp4;
      }
    }

    if (!video.src) attachSource();

    if (btn) {
      btn.addEventListener("click", async () => {
        try {
          if (!video.src) attachSource();
          await video.play();
          btn.style.display = "none";
        } catch (err) {
          console.warn(err);
        }
      });
    }

    video.addEventListener("play", () => {
      if (btn) btn.style.display = "none";
    });
    video.addEventListener("pause", () => {
      if (btn) btn.style.display = "";
    });
    video.addEventListener("ended", () => {
      if (btn) btn.style.display = "";
    });
  }

  function setupSearchForm() {
    qsa("form[data-search-form]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = qs("[data-search-input]", form);
        const q = input ? input.value.trim() : "";
        const url = new URL("search.html", location.href);
        if (q) url.searchParams.set("q", q);
        location.href = url.toString();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setActiveNav();
    setupMenu();
    setupBackToTop();
    setupCarousel();
    setupLocalFilter();
    setupSearchPage();
    setupPlayer();
    setupSearchForm();
  });
})();
