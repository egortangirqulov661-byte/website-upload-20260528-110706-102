(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFiltering() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    if (!inputs.length) {
      return;
    }
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          card.style.display = text.indexOf(query) === -1 ? "none" : "";
        });
      });
    });
  }

  function setupSorting() {
    var select = document.querySelector("[data-sort-select]");
    var grid = document.querySelector("[data-grid]");
    if (!select || !grid) {
      return;
    }
    var original = Array.prototype.slice.call(grid.children);
    select.addEventListener("change", function () {
      var value = select.value;
      var items = Array.prototype.slice.call(grid.children);
      if (value === "rank-default") {
        items = original.slice();
      } else if (value === "year-desc") {
        items.sort(function (a, b) {
          return (Number(b.getAttribute("data-year")) || 0) - (Number(a.getAttribute("data-year")) || 0);
        });
      } else if (value === "year-asc") {
        items.sort(function (a, b) {
          return (Number(a.getAttribute("data-year")) || 0) - (Number(b.getAttribute("data-year")) || 0);
        });
      } else if (value === "title-asc") {
        items.sort(function (a, b) {
          return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
        });
      }
      items.forEach(function (item) {
        grid.appendChild(item);
      });
    });
  }

  window.startVideoPlayer = function (streamUrl) {
    var video = document.getElementById("movieVideo");
    var layer = document.getElementById("playLayer");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-play-button]"));
    var attached = false;
    var player = null;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        player.loadSource(streamUrl);
        player.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      video.controls = true;
    }

    function play() {
      attach();
      if (layer) {
        layer.hidden = true;
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          if (layer) {
            layer.hidden = false;
          }
        });
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    window.addEventListener("pagehide", function () {
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFiltering();
    setupSorting();
  });
})();
