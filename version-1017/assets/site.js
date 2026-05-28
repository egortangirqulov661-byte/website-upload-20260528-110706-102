(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')));
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        startTimer();
    }

    var filterInput = document.querySelector('[data-card-filter]');
    var sortSelect = document.querySelector('[data-card-sort]');
    var list = document.querySelector('[data-card-list]');

    function applyCardTools() {
        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-year')
            ].join(' ').toLowerCase();
            card.classList.toggle('is-hidden-card', keyword && text.indexOf(keyword) === -1);
        });

        if (sortSelect) {
            var sortValue = sortSelect.value;
            var sorted = cards.slice();

            if (sortValue === 'score') {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
                });
            }

            if (sortValue === 'year') {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                });
            }

            sorted.forEach(function (card) {
                list.appendChild(card);
            });
        }
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyCardTools);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', applyCardTools);
    }

    applyCardTools();

    var searchData = window.MOVIE_SEARCH_DATA || null;
    var searchResults = document.querySelector('[data-search-results]');

    if (searchData && searchResults) {
        var input = document.querySelector('[data-search-input]');
        var form = document.querySelector('[data-search-form]');
        var regionSelect = document.querySelector('[data-search-region]');
        var yearSelect = document.querySelector('[data-search-year]');
        var searchSort = document.querySelector('[data-search-sort]');
        var count = document.querySelector('[data-result-count]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (input) {
            input.value = initialQuery;
        }

        function uniqueValues(key) {
            return searchData.map(function (item) {
                return item[key];
            }).filter(function (value, position, array) {
                return value && array.indexOf(value) === position;
            }).sort();
        }

        if (regionSelect) {
            uniqueValues('region').forEach(function (region) {
                var option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                regionSelect.appendChild(option);
            });
        }

        if (yearSelect) {
            uniqueValues('year').sort(function (a, b) {
                return Number(b) - Number(a);
            }).forEach(function (year) {
                var option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function renderCard(item) {
            return [
                '<article class="movie-card">',
                '<a href="' + escapeHtml(item.url) + '">',
                '<div class="poster-wrap">',
                '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '<span class="duration-badge">' + escapeHtml(item.duration) + '</span>',
                '<span class="score-badge">' + escapeHtml(item.score) + '</span>',
                '<span class="play-float">▶</span>',
                '</div>',
                '<div class="card-body">',
                '<div class="card-line"><span class="card-category">' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
                '<h3>' + escapeHtml(item.title) + '</h3>',
                '<p>' + escapeHtml(item.oneLine) + '</p>',
                '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + Number(item.views).toLocaleString() + ' 热度</span></div>',
                '</div>',
                '</a>',
                '</article>'
            ].join('');
        }

        function runSearch() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var region = regionSelect ? regionSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var sortValue = searchSort ? searchSort.value : 'relevance';

            var results = searchData.filter(function (item) {
                var text = [
                    item.title,
                    item.region,
                    item.type,
                    item.genre,
                    item.tags,
                    item.year,
                    item.category,
                    item.oneLine
                ].join(' ').toLowerCase();
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchRegion = !region || item.region === region;
                var matchYear = !year || String(item.year) === String(year);
                return matchQuery && matchRegion && matchYear;
            });

            if (sortValue === 'score') {
                results.sort(function (a, b) {
                    return Number(b.score) - Number(a.score);
                });
            }

            if (sortValue === 'year') {
                results.sort(function (a, b) {
                    return Number(b.year) - Number(a.year);
                });
            }

            if (sortValue === 'relevance') {
                results.sort(function (a, b) {
                    return Number(b.score) - Number(a.score) || Number(b.views) - Number(a.views);
                });
            }

            var limited = results.slice(0, 120);
            searchResults.innerHTML = limited.map(renderCard).join('');

            if (count) {
                count.textContent = '找到 ' + results.length + ' 部影片，当前展示前 ' + limited.length + ' 部。';
            }
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var nextUrl = new URL(window.location.href);
                nextUrl.searchParams.set('q', input ? input.value.trim() : '');
                window.history.replaceState(null, '', nextUrl.toString());
                runSearch();
            });
        }

        [input, regionSelect, yearSelect, searchSort].forEach(function (control) {
            if (control) {
                control.addEventListener('input', runSearch);
                control.addEventListener('change', runSearch);
            }
        });

        runSearch();
    }
})();
