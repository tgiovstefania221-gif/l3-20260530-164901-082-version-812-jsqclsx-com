(function () {
    var header = document.querySelector("[data-header]");
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    var backTop = document.querySelector("[data-back-top]");

    function updateScrollState() {
        var scrolled = window.scrollY > 24;

        if (header) {
            header.classList.toggle("is-scrolled", scrolled);
        }

        if (backTop) {
            backTop.classList.toggle("is-visible", window.scrollY > 500);
        }
    }

    if (menuToggle && mobilePanel) {
        menuToggle.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    if (backTop) {
        backTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }
    }

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
        var section = panel.closest("section") || document;
        var list = section.querySelector("[data-filter-list]");
        var empty = section.querySelector("[data-empty-state]");
        var input = panel.querySelector("[data-filter-input]");
        var region = panel.querySelector("[data-region-filter]");
        var type = panel.querySelector("[data-type-filter]");
        var sort = panel.querySelector("[data-sort-filter]");

        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

        function applyFilters() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var regionValue = region ? region.value : "";
            var typeValue = type ? type.value : "";
            var visibleCount = 0;

            cards.forEach(function (card) {
                var searchText = card.getAttribute("data-search") || "";
                var cardRegion = card.getAttribute("data-region") || "";
                var cardType = card.getAttribute("data-type") || "";
                var matched = true;

                if (keyword && searchText.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                    matched = false;
                }

                if (typeValue && cardType.indexOf(typeValue) === -1) {
                    matched = false;
                }

                card.style.display = matched ? "" : "none";

                if (matched) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visibleCount === 0);
            }
        }

        function applySort() {
            if (!sort) {
                applyFilters();
                return;
            }

            var mode = sort.value;
            var sortedCards = cards.slice().sort(function (a, b) {
                if (mode === "year-asc") {
                    return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
                }

                if (mode === "title") {
                    return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                }

                return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
            });

            sortedCards.forEach(function (card) {
                list.appendChild(card);
            });

            cards = sortedCards;
            applyFilters();
        }

        [input, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        if (sort) {
            sort.addEventListener("change", applySort);
            applySort();
        } else {
            applyFilters();
        }
    });

    var searchPage = document.getElementById("searchPage");

    if (searchPage && window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var searchInput = document.getElementById("searchInput");
        var searchRegion = document.getElementById("searchRegion");
        var searchType = document.getElementById("searchType");
        var searchSort = document.getElementById("searchSort");
        var results = document.getElementById("searchResults");
        var empty = document.getElementById("searchEmpty");

        if (searchInput) {
            searchInput.value = params.get("q") || "";
        }

        function escapeHtml(value) {
            return String(value || "").replace(/[&<>"']/g, function (item) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "\"": "&quot;",
                    "'": "&#39;"
                }[item];
            });
        }

        function createCard(movie) {
            var article = document.createElement("article");
            var safeTitle = escapeHtml(movie.title);
            var safeRegion = escapeHtml(movie.region);
            var safeType = escapeHtml(movie.type);
            var safeGenre = escapeHtml(movie.genre);
            var safeYear = escapeHtml(movie.yearText);
            var safeLine = escapeHtml(movie.oneLine);
            var safeTags = movie.tags.slice(0, 4).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join("");

            article.className = "movie-card";
            article.innerHTML = [
                '<a class="poster-link" href="' + movie.href + '" aria-label="观看' + safeTitle + '">',
                '<img src="' + movie.cover + '" alt="' + safeTitle + '" loading="lazy" onerror="this.classList.add(\'image-missing\')">',
                '<span class="region-badge">' + safeRegion + '</span>',
                '</a>',
                '<div class="movie-card-body">',
                '<div class="movie-card-tags">' + safeTags + '</div>',
                '<h3><a href="' + movie.href + '">' + safeTitle + '</a></h3>',
                '<p>' + safeLine + '</p>',
                '<div class="movie-card-meta"><span>' + safeYear + '</span><span>' + safeType + '</span><span>' + safeGenre + '</span></div>',
                '</div>'
            ].join("");

            return article;
        }

        function renderSearch() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var regionValue = searchRegion ? searchRegion.value : "";
            var typeValue = searchType ? searchType.value : "";
            var mode = searchSort ? searchSort.value : "year-desc";
            var list = window.SEARCH_MOVIES.filter(function (movie) {
                var matched = true;

                if (keyword && movie.search.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (regionValue && movie.region.indexOf(regionValue) === -1) {
                    matched = false;
                }

                if (typeValue && movie.type.indexOf(typeValue) === -1) {
                    matched = false;
                }

                return matched;
            });

            list.sort(function (a, b) {
                if (mode === "year-asc") {
                    return Number(a.year) - Number(b.year);
                }

                if (mode === "score") {
                    return Number(b.score) - Number(a.score);
                }

                return Number(b.year) - Number(a.year);
            });

            results.innerHTML = "";
            list.slice(0, 240).forEach(function (movie) {
                results.appendChild(createCard(movie));
            });

            if (empty) {
                empty.classList.toggle("is-visible", list.length === 0);
            }
        }

        [searchInput, searchRegion, searchType, searchSort].forEach(function (control) {
            if (control) {
                control.addEventListener("input", renderSearch);
                control.addEventListener("change", renderSearch);
            }
        });

        renderSearch();
    }
})();
