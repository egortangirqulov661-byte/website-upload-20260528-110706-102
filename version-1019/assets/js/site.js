(function() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function() {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  document.querySelectorAll('[data-autofill-query]').forEach(function(input) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      input.value = query;
      window.setTimeout(function() {
        input.dispatchEvent(new Event('input'));
      }, 0);
    }
  });

  document.querySelectorAll('.filter-area').forEach(function(area) {
    var input = area.querySelector('[data-filter-input]');
    var buttons = Array.prototype.slice.call(area.querySelectorAll('[data-filter-type]'));
    var cards = Array.prototype.slice.call(area.querySelectorAll('[data-card]'));
    var activeType = '全部';

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      cards.forEach(function(card) {
        var haystack = normalize(card.getAttribute('data-search') || card.textContent);
        var type = card.getAttribute('data-type') || '';
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = activeType === '全部' || type === activeType;
        card.classList.toggle('is-filtered', !(matchQuery && matchType));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function(button) {
      button.addEventListener('click', function() {
        activeType = button.getAttribute('data-filter-type') || '全部';
        buttons.forEach(function(item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilter();
      });
    });

    if (buttons.length) {
      buttons[0].classList.add('is-active');
    }
  });
})();
