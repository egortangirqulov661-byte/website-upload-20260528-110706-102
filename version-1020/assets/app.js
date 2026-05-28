document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".mobile-menu-btn");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var searchInput = document.querySelector(".live-search-input");
  var resultCards = Array.prototype.slice.call(document.querySelectorAll(".search-card"));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
  var emptyState = document.querySelector(".empty-state");
  var activeFilter = "";

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function applySearch() {
    if (!resultCards.length) {
      return;
    }
    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var visible = 0;

    resultCards.forEach(function (card) {
      var key = (card.getAttribute("data-key") || "").toLowerCase();
      var matchedQuery = !query || key.indexOf(query) !== -1;
      var matchedFilter = !activeFilter || key.indexOf(activeFilter.toLowerCase()) !== -1;
      var show = matchedQuery && matchedFilter;
      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? "none" : "block";
    }
  }

  if (searchInput) {
    var initialQuery = readQuery();
    if (initialQuery) {
      searchInput.value = initialQuery;
    }
    searchInput.addEventListener("input", applySearch);
    applySearch();
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.getAttribute("data-filter") || "";
      filterButtons.forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      applySearch();
    });
  });

  Array.prototype.slice.call(document.querySelectorAll(".player-card")).forEach(function (player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".play-overlay");
    var stream = player.getAttribute("data-stream");
    var hlsInstance = null;
    var started = false;

    function begin() {
      if (!video || !stream) {
        return;
      }

      if (!started) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new Hls();
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        started = true;
      }

      video.setAttribute("controls", "controls");
      if (overlay) {
        overlay.classList.add("hidden");
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", begin);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
