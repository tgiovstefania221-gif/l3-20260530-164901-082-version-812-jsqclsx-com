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
    var nav = document.querySelector("[data-site-nav]");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var sliders = document.querySelectorAll("[data-slider]");
    sliders.forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
      var dots = Array.prototype.slice.call(document.querySelectorAll("[data-slide-dot]"));
      var prev = document.querySelector("[data-slide-prev]");
      var next = document.querySelector("[data-slide-next]");
      var index = 0;
      var timer = null;

      function show(pos) {
        if (!slides.length) {
          return;
        }
        index = (pos + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    var filterPanel = document.querySelector("[data-filter-panel]");
    if (filterPanel) {
      var keyword = filterPanel.querySelector("[data-filter-keyword]");
      var year = filterPanel.querySelector("[data-filter-year]");
      var type = filterPanel.querySelector("[data-filter-type]");
      var region = filterPanel.querySelector("[data-filter-region]");
      var category = filterPanel.querySelector("[data-filter-category]");
      var result = filterPanel.querySelector("[data-filter-result]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";

      if (keyword && initial) {
        keyword.value = initial;
      }

      function match(card) {
        var kw = keyword ? keyword.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        var r = region ? region.value : "";
        var c = category ? category.value : "";
        var text = card.getAttribute("data-search") || "";
        return (!kw || text.indexOf(kw) !== -1) &&
          (!y || card.getAttribute("data-year") === y) &&
          (!t || card.getAttribute("data-type") === t) &&
          (!r || card.getAttribute("data-region") === r) &&
          (!c || card.getAttribute("data-category") === c);
      }

      function apply() {
        var shown = 0;
        cards.forEach(function (card) {
          var ok = match(card);
          card.hidden = !ok;
          if (ok) {
            shown += 1;
          }
        });
        if (result) {
          result.textContent = "筛选结果：" + shown;
        }
      }

      [keyword, year, type, region, category].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      apply();
    }

    var players = document.querySelectorAll("[data-player]");
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector("button");
      var src = box.getAttribute("data-src");
      var attached = false;
      var hls = null;

      function attach() {
        if (!video || !src || attached) {
          return Promise.resolve();
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          return new Promise(function (resolve) {
            hls.on(Hls.Events.MANIFEST_PARSED, resolve);
          });
        }
        video.src = src;
        return Promise.resolve();
      }

      function play() {
        attach().then(function () {
          if (cover) {
            cover.hidden = true;
          }
          video.controls = true;
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              if (cover) {
                cover.hidden = false;
              }
            });
          }
        });
      }

      if (cover) {
        cover.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!attached || video.paused) {
            play();
          } else {
            video.pause();
          }
        });
      }
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
