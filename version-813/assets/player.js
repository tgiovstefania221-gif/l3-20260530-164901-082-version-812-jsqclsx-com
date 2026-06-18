(function() {
  function setupMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var source = options.source;
    var triggerClass = options.triggerClass;
    var ready = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function requestPlay() {
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function() {});
      }
    }

    function attachSource(thenPlay) {
      if (ready) {
        if (thenPlay) {
          requestPlay();
        }
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        ready = true;
        if (thenPlay) {
          requestPlay();
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
          if (thenPlay) {
            requestPlay();
          }
        });
        ready = true;
        return;
      }

      video.src = source;
      ready = true;
      if (thenPlay) {
        requestPlay();
      }
    }

    function start() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      attachSource(true);
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function() {
      if (video.paused) {
        start();
      }
    });

    if (triggerClass) {
      document.querySelectorAll("." + triggerClass).forEach(function(button) {
        button.addEventListener("click", function() {
          video.scrollIntoView({ behavior: "smooth", block: "center" });
          start();
        });
      });
    }

    window.addEventListener("pagehide", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
