(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 420) {
        backTop.classList.add('is-visible');
      } else {
        backTop.classList.remove('is-visible');
      }
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dotsWrap = slider.querySelector('[data-hero-dots]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
      }
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (dotsWrap && slides.length) {
      slides.forEach(function (_, index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换推荐影片');
        dot.addEventListener('click', function () {
          showSlide(index);
          startTimer();
        });
        dotsWrap.appendChild(dot);
      });
    }

    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var searchInput = filterPanel.querySelector('[data-filter-search]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var genreSelect = filterPanel.querySelector('[data-filter-genre]');
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-filter-item]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var query = normalize(searchInput && searchInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var genre = normalize(genreSelect && genreSelect.value);
      var visible = 0;

      items.forEach(function (item) {
        var title = normalize(item.getAttribute('data-title'));
        var itemYear = normalize(item.getAttribute('data-year'));
        var itemGenre = normalize(item.getAttribute('data-genre'));
        var itemCategory = normalize(item.getAttribute('data-category'));
        var matchQuery = !query || title.indexOf(query) !== -1 || itemGenre.indexOf(query) !== -1 || itemCategory.indexOf(query) !== -1;
        var matchYear = !year || itemYear.indexOf(year) !== -1;
        var matchGenre = !genre || itemGenre.indexOf(genre) !== -1;
        var show = matchQuery && matchYear && matchGenre;

        item.style.display = show ? '' : 'none';

        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    if (genreSelect) {
      genreSelect.addEventListener('change', applyFilter);
    }
  }
})();
