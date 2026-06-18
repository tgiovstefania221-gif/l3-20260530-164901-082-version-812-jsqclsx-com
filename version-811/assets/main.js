(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      var parent = image.closest('.poster-frame, .hero-poster, .hero-thumb, .detail-poster, .poster-link');
      if (parent) {
        parent.classList.add('image-missing');
      }
    }, { once: true });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var currentIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === currentIndex);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('active', thumbIndex === currentIndex);
      });
    }

    function startHero() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5200);
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var index = Number(thumb.getAttribute('data-hero-thumb')) || 0;
        showSlide(index);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-grid] .movie-card'));

  function applyFilters() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var selectedType = typeSelect ? typeSelect.value : '';

    cards.forEach(function (card) {
      var searchText = (card.getAttribute('data-search') || '').toLowerCase();
      var typeText = card.getAttribute('data-type') || '';
      var keywordMatched = !keyword || searchText.indexOf(keyword) !== -1;
      var typeMatched = !selectedType || typeText.indexOf(selectedType) !== -1;
      card.classList.toggle('hidden', !(keywordMatched && typeMatched));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', applyFilters);
  }

  document.querySelectorAll('.js-player').forEach(function (player) {
    var video = player.querySelector('video');
    var playButton = player.querySelector('.js-play');
    var status = player.querySelector('[data-player-status]');
    var src = player.getAttribute('data-src');
    var hlsInstance = null;
    var loaded = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function loadSource() {
      if (!video || !src || loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        setStatus('正在使用原生 HLS 播放');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('片源已就绪');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源暂时无法加载');
          }
        });
        return;
      }

      setStatus('当前浏览器需要支持 HLS 播放');
    }

    function startPlay() {
      loadSource();
      if (!video) {
        return;
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          player.classList.add('playing');
          setStatus('正在播放');
        }).catch(function () {
          player.classList.remove('playing');
          setStatus('请再次点击播放');
        });
      } else {
        player.classList.add('playing');
      }
    }

    if (playButton) {
      playButton.addEventListener('click', startPlay);
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('playing');
        setStatus('正在播放');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          setStatus('已暂停');
        }
      });
      video.addEventListener('ended', function () {
        player.classList.remove('playing');
        setStatus('播放结束');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
