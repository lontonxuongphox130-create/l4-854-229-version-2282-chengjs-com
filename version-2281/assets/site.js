(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img[data-cover]').forEach(function (image) {
        image.addEventListener('error', function () {
            image.remove();
        });
    });

    const slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        const slides = Array.from(slider.querySelectorAll('.hero-slide'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        const previous = slider.querySelector('[data-hero-prev]');
        const next = slider.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        const show = function (nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        };

        const start = function () {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5500);
        };

        const stop = function () {
            if (timer) {
                window.clearInterval(timer);
            }
        };

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.heroDot || 0));
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    const panels = document.querySelectorAll('[data-filter-panel]');

    panels.forEach(function (panel) {
        const search = panel.querySelector('[data-filter-search]');
        const genre = panel.querySelector('[data-filter-genre]');
        const region = panel.querySelector('[data-filter-region]');
        const year = panel.querySelector('[data-filter-year]');
        const reset = panel.querySelector('[data-filter-reset]');
        const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
        const empty = document.querySelector('[data-empty-state]');
        const params = new URLSearchParams(window.location.search);

        if (search && params.get('q')) {
            search.value = params.get('q');
        }

        if (genre && params.get('genre')) {
            genre.value = params.get('genre');
        }

        const apply = function () {
            const query = (search ? search.value : '').trim().toLowerCase();
            const genreValue = genre ? genre.value.trim().toLowerCase() : '';
            const regionValue = region ? region.value.trim().toLowerCase() : '';
            const yearValue = year ? year.value.trim().toLowerCase() : '';
            let shown = 0;

            cards.forEach(function (card) {
                const text = [
                    card.dataset.title || '',
                    card.dataset.genre || '',
                    card.dataset.region || '',
                    card.dataset.year || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();

                const matchesQuery = !query || text.indexOf(query) !== -1;
                const matchesGenre = !genreValue || (card.dataset.genre || '').toLowerCase().indexOf(genreValue) !== -1;
                const matchesRegion = !regionValue || (card.dataset.region || '').toLowerCase().indexOf(regionValue) !== -1;
                const matchesYear = !yearValue || (card.dataset.year || '').toLowerCase() === yearValue;
                const visible = matchesQuery && matchesGenre && matchesRegion && matchesYear;

                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.hidden = shown !== 0;
            }
        };

        [search, genre, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (search) search.value = '';
                if (genre) genre.value = '';
                if (region) region.value = '';
                if (year) year.value = '';
                apply();
            });
        }

        apply();
    });

    const setupPlayer = function (player) {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-player-button]');

        if (!video || !button) {
            return;
        }

        const hlsSource = video.dataset.hlsSrc;
        const mp4Source = video.dataset.mp4Src;
        let prepared = false;
        let preparing = null;

        const useMp4 = function () {
            if (mp4Source && !video.getAttribute('src')) {
                video.src = mp4Source;
            }
        };

        const prepare = function () {
            if (prepared) {
                return Promise.resolve();
            }

            if (preparing) {
                return preparing;
            }

            preparing = new Promise(function (resolve) {
                if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = hlsSource;
                    prepared = true;
                    resolve();
                    return;
                }

                if (hlsSource && 'MediaSource' in window) {
                    import('./hls.js').then(function (module) {
                        const Hls = module.H;
                        if (Hls && Hls.isSupported && Hls.isSupported()) {
                            const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
                            hls.loadSource(hlsSource);
                            hls.attachMedia(video);
                            player.hlsInstance = hls;
                            prepared = true;
                            resolve();
                        } else {
                            useMp4();
                            prepared = true;
                            resolve();
                        }
                    }).catch(function () {
                        useMp4();
                        prepared = true;
                        resolve();
                    });
                    return;
                }

                useMp4();
                prepared = true;
                resolve();
            });

            return preparing;
        };

        const play = function () {
            prepare().then(function () {
                video.play().catch(function () {});
            });
        };

        button.addEventListener('click', play);
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            player.classList.remove('is-playing');
        });
        video.addEventListener('ended', function () {
            player.classList.remove('is-playing');
        });
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    };

    document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();
