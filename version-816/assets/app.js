(function () {
  const body = document.body;
  const toggle = document.querySelector('.menu-toggle');

  if (toggle) {
    toggle.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;
  let heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, n) {
      slide.classList.toggle('active', n === heroIndex);
    });

    dots.forEach(function (dot, n) {
      dot.classList.toggle('active', n === heroIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      window.clearInterval(heroTimer);
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      startHero();
    });
  });

  startHero();

  const searchInput = document.querySelector('.movie-search');
  const yearFilter = document.querySelector('.movie-filter');
  const searchableItems = Array.from(document.querySelectorAll('.movie-card, .rank-row'));
  const emptyState = document.querySelector('.empty-state');

  function applyFilter() {
    const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const year = yearFilter ? yearFilter.value : '';
    let visible = 0;

    searchableItems.forEach(function (item) {
      const haystack = [
        item.getAttribute('data-title'),
        item.getAttribute('data-year'),
        item.getAttribute('data-region'),
        item.getAttribute('data-genre'),
        item.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      const itemYear = item.getAttribute('data-year') || '';
      const matchTerm = !term || haystack.indexOf(term) !== -1;
      const matchYear = !year || itemYear.indexOf(year) === 0 || (year === '1990' && Number(itemYear) < 2020);
      const matched = matchTerm && matchYear;

      item.hidden = !matched;

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilter);
  }
})();

function initMoviePlayer(streamUrl) {
  const video = document.getElementById('movie-player');
  const overlay = document.querySelector('.player-overlay');

  if (!video || !overlay || !streamUrl) {
    return;
  }

  let prepared = false;

  function prepare() {
    if (prepared) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    prepared = true;
  }

  function startPlayback() {
    prepare();
    overlay.classList.add('is-hidden');
    video.controls = true;
    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  overlay.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (!prepared) {
      startPlayback();
    }
  });
}
