(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function filterCards(root, query, type, year) {
    var cards = root.querySelectorAll('[data-movie-card]');
    var visible = 0;
    var q = normalize(query);
    var t = normalize(type);
    var y = normalize(year);

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type')
      ].join(' '));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var matchesQuery = !q || text.indexOf(q) !== -1;
      var matchesType = !t || cardType.indexOf(t) !== -1;
      var matchesYear = !y || cardYear === y;
      var show = matchesQuery && matchesType && matchesYear;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    var empty = document.querySelector('[data-empty-state]');
    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }

  var grid = document.querySelector('[data-catalog-grid]');
  if (grid) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var localSearch = document.querySelector('[data-local-search]');
    var globalSearch = document.querySelector('[data-global-search]');
    var searchInput = localSearch || globalSearch;
    var activeType = '';
    var activeYear = '';

    if (searchInput) {
      searchInput.value = initialQuery;
      searchInput.addEventListener('input', function () {
        filterCards(grid, searchInput.value, activeType, activeYear);
      });
    }

    document.querySelectorAll('[data-filter-type]').forEach(function (button) {
      button.addEventListener('click', function () {
        document.querySelectorAll('[data-filter-type]').forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        activeType = button.getAttribute('data-filter-type') || '';
        filterCards(grid, searchInput ? searchInput.value : '', activeType, activeYear);
      });
    });

    document.querySelectorAll('[data-filter-year]').forEach(function (button) {
      button.addEventListener('click', function () {
        document.querySelectorAll('[data-filter-year]').forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        activeYear = button.getAttribute('data-filter-year') || '';
        filterCards(grid, searchInput ? searchInput.value : '', activeType, activeYear);
      });
    });

    filterCards(grid, initialQuery, activeType, activeYear);
  }

  function startPlayer(wrap) {
    if (!wrap) {
      return;
    }
    var video = wrap.querySelector('video');
    var overlay = wrap.querySelector('[data-player-button]');
    var url = wrap.getAttribute('data-url');

    if (!video || !url) {
      return;
    }

    if (overlay) {
      overlay.classList.add('hidden');
    }

    if (!video.getAttribute('src')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        if (video._hls) {
          video._hls.destroy();
        }
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = url;
      }
    }

    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {});
    }
  }

  document.querySelectorAll('[data-player-wrap]').forEach(function (wrap) {
    var overlay = wrap.querySelector('[data-player-button]');
    var video = wrap.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayer(wrap);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!video.getAttribute('src')) {
          startPlayer(wrap);
        }
      });
    }
  });
})();
