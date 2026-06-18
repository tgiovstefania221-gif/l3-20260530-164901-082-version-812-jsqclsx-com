(function () {
    var frames = document.querySelectorAll(".video-frame");

    frames.forEach(function (frame) {
        var video = frame.querySelector("video");
        var button = frame.querySelector("[data-player-button]");
        var message = frame.querySelector(".player-message");
        var playUrl = frame.getAttribute("data-play");
        var loaded = false;
        var hlsInstance = null;

        function setMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }

        function loadNative() {
            video.src = playUrl;
            loaded = true;
            return Promise.resolve();
        }

        function loadWithHls() {
            return new Promise(function (resolve) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hlsInstance.loadSource(playUrl);
                hlsInstance.attachMedia(video);

                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    loaded = true;
                    resolve();
                });

                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                        return;
                    }

                    setMessage("播放暂时不可用");
                    resolve();
                });
            });
        }

        function ensureLoaded() {
            if (loaded) {
                return Promise.resolve();
            }

            if (!playUrl || !video) {
                setMessage("播放暂时不可用");
                return Promise.resolve();
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                return loadNative();
            }

            if (window.Hls && window.Hls.isSupported()) {
                return loadWithHls();
            }

            setMessage("播放暂时不可用");
            return Promise.resolve();
        }

        function startPlay() {
            frame.classList.add("is-playing");
            ensureLoaded().then(function () {
                var playTask = video.play();

                if (playTask && typeof playTask.catch === "function") {
                    playTask.catch(function () {
                        frame.classList.remove("is-playing");
                    });
                }
            });
        }

        if (button) {
            button.addEventListener("click", startPlay);
        }

        video.addEventListener("click", function () {
            if (!loaded) {
                startPlay();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
