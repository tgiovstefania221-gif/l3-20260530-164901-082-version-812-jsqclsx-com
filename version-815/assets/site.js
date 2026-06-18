(function () {
    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector('.menu-button');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        document.querySelectorAll('.search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                if (!value) {
                    event.preventDefault();
                    window.location.href = './search.html';
                }
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(index);
                start();
            });
        });
        show(0);
        start();
    }

    function setupFiltering() {
        var input = document.querySelector('[data-filter-input]');
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
        var empty = document.querySelector('[data-empty-state]');
        if (!cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var type = 'all';
        if (input) {
            input.value = query;
        }
        function apply() {
            var term = normalize(input ? input.value : query);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var cardType = card.getAttribute('data-card-type') || '';
                var passText = !term || haystack.indexOf(term) !== -1;
                var passType = type === 'all' || cardType === type;
                var show = passText && passType;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }
        if (input) {
            input.addEventListener('input', apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                type = button.getAttribute('data-filter-value') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                apply();
            });
        });
        apply();
    }

    function setupPlayers() {
        document.querySelectorAll('.player-shell').forEach(function (shell) {
            var video = shell.querySelector('video');
            var startButton = shell.querySelector('.player-start');
            var cover = shell.querySelector('.player-cover');
            if (!video || !startButton) {
                return;
            }
            function playVideo() {
                var stream = video.getAttribute('data-stream') || '';
                shell.classList.add('is-playing');
                if (video.getAttribute('data-ready') === '1') {
                    video.play().catch(function () {});
                    return;
                }
                video.setAttribute('data-ready', '1');
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        maxBufferLength: 30
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = stream;
                    video.play().catch(function () {});
                }
            }
            startButton.addEventListener('click', function (event) {
                event.stopPropagation();
                playVideo();
            });
            if (cover) {
                cover.addEventListener('click', playVideo);
            }
        });
    }

    onReady(function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupFiltering();
        setupPlayers();
    });
})();
