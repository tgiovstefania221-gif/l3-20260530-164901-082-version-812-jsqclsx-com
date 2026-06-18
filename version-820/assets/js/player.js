(function() {
  function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var hls = null;

    if (!video || !button || !options.source) {
      return;
    }

    function attachMedia() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }

      video.setAttribute('data-ready', '1');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.source);
        hls.attachMedia(video);
      } else {
        button.innerHTML = '<span>播放暂时不可用</span>';
      }
    }

    function startPlayback() {
      attachMedia();
      button.classList.add('is-hidden');
      video.controls = true;

      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function() {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function() {
      if (video.paused) {
        startPlayback();
      }
    });
    window.addEventListener('beforeunload', function() {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
