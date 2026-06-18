(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('active', idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('active', idx === current);
            });
        }
        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            play();
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                restart();
            });
        });
        hero.addEventListener('mouseenter', function () {
            if (timer) {
                window.clearInterval(timer);
            }
        });
        hero.addEventListener('mouseleave', restart);
        show(0);
        play();
    }

    function matchesSearch(card, query) {
        if (!query) {
            return true;
        }
        var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        return text.indexOf(query) !== -1;
    }

    function initSearchAndFilter() {
        var input = document.getElementById('siteSearch');
        var cards = selectAll('.movie-card-item');
        var buttons = selectAll('[data-filter]');
        var activeFilter = 'all';
        if (!cards.length) {
            return;
        }
        function update() {
            var query = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var category = card.getAttribute('data-category') || '';
                var filterOk = activeFilter === 'all' || category === activeFilter;
                var searchOk = matchesSearch(card, query);
                card.classList.toggle('is-hidden', !(filterOk && searchOk));
            });
        }
        if (input) {
            input.addEventListener('input', update);
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                update();
            });
        });
        update();
    }

    function initPlayers() {
        selectAll('[data-player]').forEach(function (frame) {
            var video = frame.querySelector('video');
            var trigger = frame.querySelector('.js-play-trigger');
            if (!video) {
                return;
            }
            var streamUrl = video.getAttribute('data-stream');
            var hlsInstance = null;
            var hlsReady = false;
            var playPending = false;
            function playVideo() {
                frame.classList.add('is-playing');
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }
            function startNative() {
                if (!video.src) {
                    video.src = streamUrl;
                }
                playVideo();
            }
            function startHls() {
                playPending = true;
                frame.classList.add('is-playing');
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                        hlsInstance.loadSource(streamUrl);
                    });
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        hlsReady = true;
                        if (playPending) {
                            playVideo();
                        }
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        }
                    });
                } else if (hlsReady) {
                    playVideo();
                }
            }
            function start() {
                if (!streamUrl) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    startNative();
                } else if (window.Hls && window.Hls.isSupported()) {
                    startHls();
                } else {
                    startNative();
                }
            }
            if (trigger) {
                trigger.addEventListener('click', start);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                frame.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0) {
                    frame.classList.remove('is-playing');
                }
            });
            video.addEventListener('ended', function () {
                playPending = false;
                frame.classList.remove('is-playing');
                if (hlsInstance && hlsInstance.stopLoad) {
                    hlsInstance.stopLoad();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initSearchAndFilter();
        initPlayers();
    });
}());
