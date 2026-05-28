document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      var url = "library.html";
      if (value) {
        url += "?q=" + encodeURIComponent(value);
      }
      window.location.href = url;
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var activate = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        activate(index + 1);
      }, 5200);
    }
  }

  var params = new URLSearchParams(window.location.search);
  var queryValue = params.get("q") || "";
  var queryInput = document.querySelector("[data-filter-input]");
  if (queryInput && queryValue) {
    queryInput.value = queryValue;
  }

  var runFilter = function () {
    var list = document.querySelector("[data-card-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var input = document.querySelector("[data-filter-input]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var categorySelect = document.querySelector("[data-filter-category]");
    var keyword = input ? input.value.trim().toLowerCase() : "";
    var year = yearSelect ? yearSelect.value : "";
    var category = categorySelect ? categorySelect.value : "";
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = (card.getAttribute("data-search") || "").toLowerCase();
      var cardYear = card.getAttribute("data-year") || "";
      var cardCategory = card.getAttribute("data-category") || "";
      var okKeyword = !keyword || haystack.indexOf(keyword) >= 0;
      var okYear = !year || cardYear === year;
      var okCategory = !category || cardCategory === category;
      var shown = okKeyword && okYear && okCategory;
      card.style.display = shown ? "" : "none";
      if (shown) {
        visible += 1;
      }
    });

    var empty = document.querySelector("[data-empty-state]");
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  };

  document.querySelectorAll("[data-filter-input], [data-filter-year], [data-filter-category]").forEach(function (control) {
    control.addEventListener("input", runFilter);
    control.addEventListener("change", runFilter);
  });

  runFilter();
});

window.startVideoPlayer = function (videoId, overlayId, buttonId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var button = document.getElementById(buttonId);

  if (!video || !overlay || !button || !source) {
    return;
  }

  var started = false;
  var start = function () {
    overlay.classList.add("is-hidden");
    if (!started) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      started = true;
    }
    var playResult = video.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {});
    }
  };

  overlay.addEventListener("click", start);
  button.addEventListener("click", function (event) {
    event.stopPropagation();
    start();
  });
  video.addEventListener("click", function () {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });
};
