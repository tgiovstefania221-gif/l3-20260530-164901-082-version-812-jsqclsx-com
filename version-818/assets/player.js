(function () {
    function initMoviePlayer(src) {
        var video = document.getElementById("moviePlayer");
        var cover = document.querySelector("[data-player-cover]");
        var button = document.querySelector("[data-play-button]");
        var hlsInstance = null;
        var loaded = false;

        if (!video || !src) {
            return;
        }

        function loadVideo() {
            if (loaded) {
                return;
            }
            loaded = true;
            video.setAttribute("playsinline", "");
            video.setAttribute("webkit-playsinline", "");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function startVideo() {
            loadVideo();
            video.controls = true;
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", startVideo);
        }
        if (button) {
            button.addEventListener("click", startVideo);
        }
        video.addEventListener("click", function () {
            if (!loaded) {
                startVideo();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
