(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  const slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll(".hero-dot"));
    const prev = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  document.querySelectorAll("[data-filter-scope='cards']").forEach(function (filterBar) {
    const area = filterBar.parentElement.querySelector(".cards-filter-area");
    const empty = filterBar.parentElement.querySelector(".empty-state");

    if (!area) {
      return;
    }

    const cards = Array.from(area.querySelectorAll(".movie-card"));

    filterBar.addEventListener("click", function (event) {
      const button = event.target.closest(".filter-btn");

      if (!button) {
        return;
      }

      const value = button.getAttribute("data-filter-value");
      filterBar.querySelectorAll(".filter-btn").forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });

      let visible = 0;
      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute("data-type") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-search") || ""
        ].join(" ");
        const match = value === "all" || haystack.indexOf(value) !== -1;
        card.classList.toggle("is-hidden", !match);
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible === 0 ? "block" : "none";
      }
    });
  });

  const searchPage = document.querySelector("[data-search-page]");

  if (searchPage) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim().toLowerCase();
    const inputs = document.querySelectorAll("input[name='q']");

    inputs.forEach(function (input) {
      input.value = query;
    });

    const cards = Array.from(searchPage.querySelectorAll(".movie-card"));
    const empty = searchPage.querySelector(".empty-state");

    if (query) {
      const terms = query.split(/\s+/).filter(Boolean);
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = (card.getAttribute("data-search") || "").toLowerCase();
        const match = terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
        card.classList.toggle("is-hidden", !match);
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible === 0 ? "block" : "none";
      }
    }
  }
}());
