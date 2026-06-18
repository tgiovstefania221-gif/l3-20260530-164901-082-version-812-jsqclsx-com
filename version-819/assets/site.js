function $(selector, root) {
  return (root || document).querySelector(selector);
}

function $all(selector, root) {
  return Array.from((root || document).querySelectorAll(selector));
}

function escapeHTML(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initMobileNav() {
  const button = $('[data-mobile-toggle]');
  const nav = $('[data-mobile-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', function () {
    nav.classList.toggle('is-open');
  });
}

function initHero() {
  const hero = $('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = $all('.hero-slide', hero);
  const prev = $('[data-hero-prev]', hero);
  const next = $('[data-hero-next]', hero);
  let index = 0;

  function show(nextIndex) {
    slides[index].classList.remove('is-active');
    index = (nextIndex + slides.length) % slides.length;
    slides[index].classList.add('is-active');
  }

  if (prev) {
    prev.addEventListener('click', function () {
      show(index - 1);
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(index + 1);
    });
  }

  if (slides.length > 1) {
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }
}

function initFilters() {
  $all('[data-filter-bar]').forEach(function (bar) {
    const section = bar.closest('.content-section');
    const list = section ? $('[data-filter-list]', section) : null;

    if (!list) {
      return;
    }

    const yearSelect = $('[data-filter-year]', bar);
    const regionSelect = $('[data-filter-region]', bar);
    const typeSelect = $('[data-filter-type]', bar);
    const resetButton = $('[data-filter-reset]', bar);
    const cards = $all('.movie-card', list);

    function applyFilters() {
      const year = yearSelect ? yearSelect.value : '';
      const region = regionSelect ? regionSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';

      cards.forEach(function (card) {
        const visible = (!year || card.dataset.year === year)
          && (!region || card.dataset.region === region)
          && (!type || card.dataset.type === type);
        card.classList.toggle('is-hidden', !visible);
      });
    }

    [yearSelect, regionSelect, typeSelect].forEach(function (select) {
      if (select) {
        select.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (yearSelect) yearSelect.value = '';
        if (regionSelect) regionSelect.value = '';
        if (typeSelect) typeSelect.value = '';
        applyFilters();
      });
    }
  });
}

function initPlayer() {
  $all('[data-player]').forEach(function (player) {
    const video = $('.movie-video', player);
    const button = $('[data-player-start]', player);
    const message = $('[data-player-message]', player);

    if (!video || !button) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function playVideo() {
      const source = video.dataset.src;

      if (!source) {
        setMessage('暂无可用播放源。');
        return;
      }

      button.classList.add('is-hidden');
      setMessage('正在加载播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            setMessage('播放源已加载，可点击播放器开始播放。');
          });
          setMessage('播放源已加载。');
        });

        hls.on(window.Hls.Events.ERROR, function () {
          setMessage('播放加载遇到网络限制，可刷新页面后重试。');
        });
      } else {
        video.src = source;
        video.play().catch(function () {
          setMessage('播放源已加载，可点击播放器开始播放。');
        });
      }
    }

    button.addEventListener('click', playVideo);
  });
}

function movieCardHTML(movie) {
  return [
    '<article class="movie-card">',
    '  <a href="' + escapeHTML(movie.url) + '" class="movie-cover">',
    '    <div class="poster" data-title="' + escapeHTML(movie.title) + '">',
    '      <img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy" onerror="this.closest(\'.poster\').classList.add(\'poster--fallback\'); this.remove();">',
    '      <span class="poster-fallback">' + escapeHTML(movie.title) + '</span>',
    '    </div>',
    '    <span class="movie-year">' + escapeHTML(movie.year) + '</span>',
    '    <span class="play-badge">播放</span>',
    '  </a>',
    '  <div class="movie-card-body">',
    '    <h3><a href="' + escapeHTML(movie.url) + '">' + escapeHTML(movie.title) + '</a></h3>',
    '    <p>' + escapeHTML(movie.oneLine) + '</p>',
    '    <div class="movie-meta">',
    '      <span>' + escapeHTML(movie.region) + '</span>',
    '      <span>' + escapeHTML(movie.type) + '</span>',
    '      <span>' + escapeHTML(movie.category) + '</span>',
    '    </div>',
    '  </div>',
    '</article>'
  ].join('');
}

function initSearchPage() {
  const results = $('[data-search-results]');

  if (!results || !window.MOVIE_INDEX) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const input = $('[data-search-input]');
  const title = $('[data-search-title]');
  const count = $('[data-search-count]');
  const keyword = (params.get('q') || '').trim();

  if (input) {
    input.value = keyword;
  }

  const normalized = keyword.toLowerCase();
  const movies = window.MOVIE_INDEX.filter(function (movie) {
    if (!normalized) {
      return true;
    }

    return [movie.title, movie.region, movie.type, movie.year, movie.category, movie.tags, movie.oneLine]
      .join(' ')
      .toLowerCase()
      .indexOf(normalized) !== -1;
  }).slice(0, 240);

  if (title) {
    title.textContent = keyword ? '“' + keyword + '”的搜索结果' : '全部影片入口';
  }

  if (count) {
    count.textContent = movies.length + ' 部影片';
  }

  results.innerHTML = movies.map(movieCardHTML).join('');
}

function initHeaderSearch() {
  $all('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');

      if (!input || !input.value.trim()) {
        event.preventDefault();
        input && input.focus();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initMobileNav();
  initHeaderSearch();
  initHero();
  initFilters();
  initPlayer();
  initSearchPage();
});
