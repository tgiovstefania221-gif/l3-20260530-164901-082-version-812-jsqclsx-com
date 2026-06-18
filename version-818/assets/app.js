(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var heroIndex = 0;
        var heroTimer = null;

        function showHero(index) {
            if (!slides.length) {
                return;
            }
            heroIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === heroIndex);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === heroIndex);
            });
        }

        function startHero() {
            if (slides.length < 2) {
                return;
            }
            window.clearInterval(heroTimer);
            heroTimer = window.setInterval(function () {
                showHero(heroIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showHero(i);
                startHero();
            });
        });
        showHero(0);
        startHero();

        var filterState = new Map();

        function applyFilter(scope) {
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var input = scope.querySelector("[data-search-input]");
            var empty = scope.querySelector("[data-empty-state]");
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var group = filterState.get(scope) || "all";
            var shown = 0;

            cards.forEach(function (card) {
                var title = (card.getAttribute("data-title") || "").toLowerCase();
                var tags = (card.getAttribute("data-tags") || "").toLowerCase();
                var cardGroup = card.getAttribute("data-filter-group") || "all";
                var matchedText = !keyword || title.indexOf(keyword) !== -1 || tags.indexOf(keyword) !== -1;
                var matchedGroup = group === "all" || cardGroup === group;
                var visible = matchedText && matchedGroup;
                card.classList.toggle("is-hidden", !visible);
                if (visible) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("show", shown === 0);
            }
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-control]"));

            if (input) {
                input.addEventListener("input", function () {
                    applyFilter(scope);
                });
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    filterState.set(scope, button.getAttribute("data-filter-control") || "all");
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    applyFilter(scope);
                });
            });

            applyFilter(scope);
        });
    });
})();
