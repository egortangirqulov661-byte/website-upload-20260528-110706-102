(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panelNode) {
    var section = panelNode.parentElement;
    var list = section ? section.querySelector('[data-filter-list]') : null;
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
    var search = panelNode.querySelector('[data-local-search]');
    var selects = Array.prototype.slice.call(panelNode.querySelectorAll('[data-filter-key]'));
    var sort = panelNode.querySelector('[data-sort-select]');

    function textOf(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
    }

    function applyFilters() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var rules = selects.map(function (select) {
        return {
          key: select.getAttribute('data-filter-key'),
          value: select.value
        };
      });

      cards.forEach(function (card) {
        var matchedText = !keyword || textOf(card).indexOf(keyword) !== -1;
        var matchedSelects = rules.every(function (rule) {
          return !rule.value || card.getAttribute('data-' + rule.key) === rule.value;
        });
        card.classList.toggle('is-hidden', !(matchedText && matchedSelects));
      });
    }

    function applySort() {
      if (!sort || !list) {
        return;
      }
      var sorted = cards.slice();
      var value = sort.value;
      sorted.sort(function (a, b) {
        if (value === 'hot') {
          return Number(b.getAttribute('data-hot') || 0) - Number(a.getAttribute('data-hot') || 0);
        }
        if (value === 'year') {
          return String(b.getAttribute('data-year') || '').localeCompare(String(a.getAttribute('data-year') || ''), 'zh-Hans-CN');
        }
        if (value === 'rating') {
          return Number(b.getAttribute('data-rating') || 0) - Number(a.getAttribute('data-rating') || 0);
        }
        return 0;
      });
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    if (search) {
      search.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    if (sort) {
      sort.addEventListener('change', function () {
        applySort();
        applyFilters();
      });
    }
  });

  var results = document.querySelector('[data-search-results]');

  if (results && window.searchMovies) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-page-input]');

    if (input) {
      input.value = query;
    }

    var normalized = query.toLowerCase();
    var pool = window.searchMovies.filter(function (movie) {
      if (!normalized) {
        return movie.hot;
      }
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(' ').toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 120);

    if (!pool.length) {
      results.innerHTML = '<div class="detail-block"><h2>暂无匹配内容</h2><p>可以尝试更换片名、类型、地区或年份继续搜索。</p></div>';
      return;
    }

    results.innerHTML = pool.map(function (movie) {
      var tags = movie.tags.split(' ').filter(Boolean).slice(0, 3).map(function (tag) {
        return '<span>#' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-year="' + escapeHtml(movie.year) + '" data-genre="' + escapeHtml(movie.genre) + '" data-tags="' + escapeHtml(movie.tags) + '">' +
        '<a class="poster" href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-badge">' + escapeHtml(movie.rating) + '</span>' +
        '</a>' +
        '<div class="card-body">' +
          '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
          '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>' +
          '<p>' + escapeHtml(movie.summary) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (item) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[item];
    });
  }
})();
