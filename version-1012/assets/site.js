(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var opened = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));

    inputs.forEach(function (input) {
      var list = document.querySelector('[data-filter-list]');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';

      if (query && !input.value) {
        input.value = query;
      }

      function applyFilter() {
        if (!list) {
          return;
        }
        var value = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-genre') || ''
          ].join(' ').toLowerCase();
          card.classList.toggle('is-filtered-out', value && haystack.indexOf(value) === -1);
        });
      }

      input.addEventListener('input', applyFilter);
      applyFilter();
    });
  }

  function beginPlayback(button) {
    var videoId = button.getAttribute('data-video');
    var stream = button.getAttribute('data-stream');
    var video = document.getElementById(videoId);

    if (!video || !stream) {
      return;
    }

    button.classList.add('is-hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== stream) {
        video.src = stream;
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsPlayer) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        video._hlsPlayer = hls;
      } else {
        video.play().catch(function () {});
      }
      return;
    }

    if (video.src !== stream) {
      video.src = stream;
    }
    video.play().catch(function () {});
  }

  function setupPlayers() {
    var overlays = Array.prototype.slice.call(document.querySelectorAll('.video-overlay'));
    overlays.forEach(function (button) {
      button.addEventListener('click', function () {
        beginPlayback(button);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
