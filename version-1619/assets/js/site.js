(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function bindMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');

        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', menu.classList.contains('is-open'));
        });
    }

    function bindSearchForms() {
        var forms = document.querySelectorAll('[data-search-form]');

        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');

                if (input && !input.value.trim()) {
                    event.preventDefault();
                    input.focus();
                }
            });
        });
    }

    function bindCurrentPageFilter() {
        var input = document.querySelector('[data-filter-input]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
        var total = document.querySelector('[data-filter-total]');
        var empty = document.querySelector('[data-empty-state]');

        if (!input || cards.length === 0) {
            return;
        }

        function applyFilter() {
            var query = normalize(input.value);
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var isMatch = !query || haystack.indexOf(query) !== -1;

                card.hidden = !isMatch;
                if (isMatch) {
                    visibleCount += 1;
                }
            });

            if (total) {
                total.textContent = String(visibleCount);
            }

            if (empty) {
                empty.hidden = visibleCount !== 0;
            }
        }

        input.addEventListener('input', applyFilter);
        applyFilter();
    }

    function bindBackToTop() {
        var button = document.querySelector('[data-back-to-top]');

        if (!button) {
            return;
        }

        window.addEventListener('scroll', function () {
            button.classList.toggle('is-visible', window.scrollY > 560);
        }, { passive: true });

        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function bindImageFallback() {
        document.addEventListener('error', function (event) {
            var target = event.target;

            if (!target || target.tagName !== 'IMG') {
                return;
            }

            var wrapper = target.closest('.poster-frame, .hero-card, .category-tile, .overview-card, .podium-card');
            if (wrapper) {
                wrapper.classList.add('is-missing-image');
            }
        }, true);
    }

    function hydrateSearchForm(form, params) {
        Array.prototype.slice.call(form.elements).forEach(function (element) {
            if (!element.name) {
                return;
            }

            var value = params.get(element.name);
            if (value !== null) {
                element.value = value;
            }
        });
    }

    function movieMatches(movie, filters) {
        var query = normalize(filters.q);
        var category = normalize(filters.category);
        var type = normalize(filters.type);
        var year = normalize(filters.year);
        var haystack = normalize([
            movie.title,
            movie.description,
            movie.summary,
            movie.category,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            (movie.tags || []).join(' ')
        ].join(' '));

        if (query && haystack.indexOf(query) === -1) {
            return false;
        }

        if (category && normalize(movie.category) !== category) {
            return false;
        }

        if (type && normalize(movie.type) !== type) {
            return false;
        }

        if (year && normalize(movie.year) !== year) {
            return false;
        }

        return true;
    }

    function renderSearchResults() {
        var root = document.querySelector('[data-search-results]');
        var summary = document.querySelector('[data-search-summary]');
        var form = document.querySelector('[data-search-page-form]');
        var movies = window.MOVIE_INDEX || [];

        if (!root || !summary) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var filters = {
            q: params.get('q') || '',
            category: params.get('category') || '',
            type: params.get('type') || '',
            year: params.get('year') || ''
        };

        if (form) {
            hydrateSearchForm(form, params);
        }

        var results = movies.filter(function (movie) {
            return movieMatches(movie, filters);
        });
        var prefix = root.getAttribute('data-root-prefix') || '';
        var limit = 2000;
        var visible = results.slice(0, limit);

        if (results.length === 0) {
            summary.textContent = '没有找到匹配影片，请调整关键词或筛选条件。';
            root.innerHTML = '';
            return;
        }

        summary.textContent = '找到 ' + results.length + ' 部影片，当前显示 ' + visible.length + ' 部。';
        root.innerHTML = visible.map(function (movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span class="tag-small">' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="movie-card movie-card-grid">',
                '    <a class="movie-card-link" href="' + prefix + 'video/' + movie.id + '.html">',
                '        <figure class="poster-frame">',
                '            <img src="' + prefix + movie.cover + '" alt="' + escapeHtml(movie.title) + '海报" loading="lazy">',
                '            <span class="category-badge">' + escapeHtml(movie.category) + '</span>',
                '            <span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
                '            <span class="play-hover" aria-hidden="true">▶</span>',
                '        </figure>',
                '        <div class="movie-card-body">',
                '            <h3>' + escapeHtml(movie.title) + '</h3>',
                '            <p>' + escapeHtml(movie.description) + '</p>',
                '            <div class="movie-meta-row">',
                '                <span>' + escapeHtml(movie.year) + '</span>',
                '                <span>' + escapeHtml(movie.region) + '</span>',
                '                <span>★ ' + escapeHtml(movie.rating) + '</span>',
                '            </div>',
                '            <div class="mini-tags">' + tags + '</div>',
                '        </div>',
                '    </a>',
                '</article>'
            ].join('');
        }).join('');
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    ready(function () {
        bindMobileMenu();
        bindSearchForms();
        bindCurrentPageFilter();
        bindBackToTop();
        bindImageFallback();
        renderSearchResults();
    });
}());
