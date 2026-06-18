(function() {
  var header = document.querySelector("[data-header]");
  var mobileToggle = document.querySelector("[data-mobile-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");
  var backTop = document.querySelector("[data-back-top]");

  function updateScrollState() {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    }
    if (backTop) {
      backTop.classList.toggle("is-visible", window.scrollY > 420);
    }
  }

  window.addEventListener("scroll", updateScrollState, { passive: true });
  updateScrollState();

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", function() {
      mobilePanel.classList.toggle("is-open");
    });
  }

  if (backTop) {
    backTop.addEventListener("click", function() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.querySelectorAll(".search-form").forEach(function(form) {
    form.addEventListener("submit", function(event) {
      var input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = "movies.html";
      }
    });
  });

  var hero = document.querySelector("[data-hero-slider]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        showSlide(index);
      });
    });

    window.setInterval(function() {
      showSlide(active + 1);
    }, 5200);
  }

  var panel = document.querySelector("[data-filter-panel]");
  var list = document.querySelector("[data-card-list]");
  if (panel && list) {
    var input = panel.querySelector("[data-filter-input]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var category = panel.querySelector("[data-filter-category]");
    var sort = panel.querySelector("[data-filter-sort]");
    var empty = document.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input && query) {
      input.value = query;
    }

    function getText(card) {
      return [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-tags") || "",
        card.querySelector("p") ? card.querySelector("p").textContent : ""
      ].join(" ").toLowerCase();
    }

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      var categoryValue = category ? category.value : "";
      var visible = 0;

      cards.forEach(function(card) {
        var matched = true;
        if (keyword && getText(card).indexOf(keyword) === -1) {
          matched = false;
        }
        if (regionValue && card.getAttribute("data-region") !== regionValue) {
          matched = false;
        }
        if (typeValue && card.getAttribute("data-type") !== typeValue) {
          matched = false;
        }
        if (yearValue && card.getAttribute("data-year") !== yearValue) {
          matched = false;
        }
        if (categoryValue && card.getAttribute("data-category") !== categoryValue) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    function applySort() {
      var mode = sort ? sort.value : "default";
      var ordered = cards.slice();
      if (mode === "newest") {
        ordered.sort(function(a, b) {
          return Number(b.querySelector(".movie-meta span").textContent.match(/\d{4}/) || 0) - Number(a.querySelector(".movie-meta span").textContent.match(/\d{4}/) || 0);
        });
      }
      if (mode === "oldest") {
        ordered.sort(function(a, b) {
          return Number(a.querySelector(".movie-meta span").textContent.match(/\d{4}/) || 0) - Number(b.querySelector(".movie-meta span").textContent.match(/\d{4}/) || 0);
        });
      }
      ordered.forEach(function(card) {
        list.appendChild(card);
      });
      cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
      applyFilters();
    }

    [input, region, type, year, category].forEach(function(control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    if (sort) {
      sort.addEventListener("change", applySort);
    }

    applyFilters();
  }
})();
