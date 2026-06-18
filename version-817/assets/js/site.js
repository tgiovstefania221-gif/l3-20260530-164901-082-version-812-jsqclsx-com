import { H as Hls } from './video-vendor-dru42stk.js';

const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

const normalize = (value) => String(value || '').trim().toLowerCase();

function initMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function initHeroCarousel() {
  document.querySelectorAll('[data-hero-carousel]').forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));

    if (slides.length <= 1) {
      return;
    }

    let current = 0;
    let timer = null;

    const show = (index) => {
      current = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const start = () => {
      timer = window.setInterval(() => show(current + 1), 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        stop();
        show(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });
}

function buildSelectOptions(scope, selector, attribute) {
  const select = scope.querySelector(selector);
  const cards = Array.from(scope.parentElement.querySelectorAll('.movie-card'));

  if (!select) {
    return;
  }

  const values = Array.from(new Set(
    cards
      .map((card) => card.getAttribute(attribute))
      .filter(Boolean)
  )).sort((a, b) => String(b).localeCompare(String(a), 'zh-CN'));

  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function initFilters() {
  document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
    const input = scope.querySelector('[data-filter-input]');
    const yearSelect = scope.querySelector('[data-filter-year]');
    const typeSelect = scope.querySelector('[data-filter-type]');
    const count = scope.querySelector('[data-filter-count]');
    const cards = Array.from(scope.parentElement.querySelectorAll('.movie-card'));

    if (!cards.length) {
      return;
    }

    buildSelectOptions(scope, '[data-filter-year]', 'data-year');
    buildSelectOptions(scope, '[data-filter-type]', 'data-type');

    const apply = () => {
      const keyword = normalize(input ? input.value : '');
      const year = yearSelect ? yearSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalize(card.getAttribute('data-search'));
        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesYear = !year || card.getAttribute('data-year') === year;
        const matchesType = !type || card.getAttribute('data-type') === type;
        const show = matchesKeyword && matchesYear && matchesType;

        card.hidden = !show;

        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = `当前显示 ${visible} / ${cards.length} 部影片`;
      }
    };

    [input, yearSelect, typeSelect].forEach((control) => {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
}

function initPlayer() {
  document.querySelectorAll('.js-player').forEach((shell) => {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.player-start');
    const status = shell.querySelector('[data-player-status]');
    const source = shell.getAttribute('data-src');
    let attached = false;
    let hls = null;

    if (!video || !button) {
      return;
    }

    const setStatus = (message) => {
      if (status) {
        status.textContent = message;
      }
    };

    const attach = () => {
      if (attached) {
        return Promise.resolve();
      }

      if (!source) {
        setStatus('播放源暂不可用');
        return Promise.reject(new Error('Missing video source'));
      }

      setStatus('正在加载播放源...');

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setStatus('播放源加载完成');
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('网络错误，正在重试');
            hls.startLoad();
            return;
          }

          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('媒体错误，正在恢复');
            hls.recoverMediaError();
            return;
          }

          setStatus('无法播放当前视频');
          hls.destroy();
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        setStatus('当前浏览器不支持 HLS 播放');
        return Promise.reject(new Error('Unsupported HLS'));
      }

      attached = true;
      return Promise.resolve();
    };

    button.addEventListener('click', async () => {
      try {
        await attach();
        await video.play();
        shell.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        setStatus('正在播放');
      } catch (error) {
        setStatus('播放失败，请稍后重试');
      }
    });

    video.addEventListener('pause', () => {
      if (!video.ended) {
        setStatus('已暂停');
      }
    });

    video.addEventListener('play', () => {
      shell.classList.add('is-playing');
      setStatus('正在播放');
    });

    video.addEventListener('ended', () => {
      shell.classList.remove('is-playing');
      setStatus('播放结束');
    });

    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

ready(() => {
  initMobileMenu();
  initHeroCarousel();
  initFilters();
  initPlayer();
});
