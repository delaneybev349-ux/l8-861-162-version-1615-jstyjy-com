(function () {
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  if (!results || !Array.isArray(window.SEARCH_INDEX)) {
    return;
  }

  if (input) {
    input.value = query;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function card(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '<a class="movie-poster" href="' + escapeHtml(item.url) + '">',
      '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="duration-badge">' + escapeHtml(item.year) + '</span>',
      '<span class="poster-play">▶</span>',
      '</a>',
      '<div class="movie-body">',
      '<a href="' + escapeHtml(item.url) + '" class="movie-title">' + escapeHtml(item.title) + '</a>',
      '<p>' + escapeHtml(item.summary) + '</p>',
      '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.category) + '</span></div>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function render(value) {
    var term = normalize(value);
    var matches;

    if (!term) {
      matches = window.SEARCH_INDEX.slice(0, 36);
    } else {
      matches = window.SEARCH_INDEX.filter(function (item) {
        var haystack = normalize([item.title, item.year, item.region, item.type, item.genre, item.category, item.summary, (item.tags || []).join(' ')].join(' '));
        return haystack.indexOf(term) !== -1;
      }).slice(0, 80);
    }

    if (!matches.length) {
      results.innerHTML = '<div class="empty-state is-visible">没有找到匹配内容</div>';
      return;
    }

    results.innerHTML = matches.map(card).join('');
  }

  render(query);

  if (input) {
    input.addEventListener('input', function () {
      render(input.value);
    });
  }
})();
