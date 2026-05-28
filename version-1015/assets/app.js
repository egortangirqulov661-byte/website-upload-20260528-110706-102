(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
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

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5600);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          start();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    var filterList = document.querySelector('[data-filter-list]');

    if (filterList) {
      var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
      var keyword = document.querySelector('[data-filter-keyword]');
      var region = document.querySelector('[data-filter-region]');
      var year = document.querySelector('[data-filter-year]');
      var category = document.querySelector('[data-filter-category]');
      var empty = document.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q');

      if (initialQuery && keyword) {
        keyword.value = initialQuery;
      }

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function cardText(card) {
        return normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.category,
          card.textContent
        ].join(' '));
      }

      function applyFilters() {
        var q = normalize(keyword && keyword.value);
        var r = normalize(region && region.value);
        var y = normalize(year && year.value);
        var c = normalize(category && category.value);
        var shown = 0;

        cards.forEach(function (card) {
          var text = cardText(card);
          var ok = true;

          if (q && text.indexOf(q) === -1) {
            ok = false;
          }

          if (r && normalize(card.dataset.region) !== r) {
            ok = false;
          }

          if (y && normalize(card.dataset.year) !== y) {
            ok = false;
          }

          if (c && normalize(card.dataset.category) !== c) {
            ok = false;
          }

          card.style.display = ok ? '' : 'none';

          if (ok) {
            shown += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', shown === 0);
        }
      }

      [keyword, region, year, category].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });

      applyFilters();
    }
  });
})();
