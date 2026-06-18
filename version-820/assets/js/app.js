(function() {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mainNav = document.querySelector('[data-main-nav]');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function() {
      mainNav.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function(scope) {
    var searchInput = scope.querySelector('[data-search-input]');
    var genreFilter = scope.querySelector('[data-genre-filter]');
    var regionFilter = scope.querySelector('[data-region-filter]');
    var typeFilter = scope.querySelector('[data-type-filter]');
    var status = scope.querySelector('[data-filter-status]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

    function applyFilters() {
      var query = normalize(searchInput && searchInput.value);
      var genre = normalize(genreFilter && genreFilter.value);
      var region = normalize(regionFilter && regionFilter.value);
      var type = normalize(typeFilter && typeFilter.value);
      var matched = 0;

      cards.forEach(function(card) {
        var title = normalize(card.getAttribute('data-title'));
        var cardGenre = normalize(card.getAttribute('data-genre'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var haystack = [title, cardGenre, cardRegion, cardType, normalize(card.textContent)].join(' ');
        var ok = true;

        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }

        if (genre && cardGenre.indexOf(genre) === -1) {
          ok = false;
        }

        if (region && cardRegion.indexOf(region) === -1) {
          ok = false;
        }

        if (type && cardType.indexOf(type) === -1) {
          ok = false;
        }

        card.classList.toggle('is-filtered-out', !ok);

        if (ok) {
          matched += 1;
        }
      });

      if (status) {
        status.textContent = matched > 0 ? '筛选结果已更新' : '没有找到匹配的影片';
      }
    }

    [searchInput, genreFilter, regionFilter, typeFilter].forEach(function(control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });
})();
