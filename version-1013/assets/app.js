(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                restart();
            });
        });

        show(0);
        restart();
    });

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards(scope, keyword, category) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-item'));
        var needle = normalize(keyword);
        var cat = normalize(category);

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-index-text') || card.textContent);
            var cardCategory = normalize(card.getAttribute('data-category') || '');
            var keywordMatch = !needle || text.indexOf(needle) !== -1;
            var categoryMatch = !cat || cardCategory === cat;
            card.setAttribute('data-filter-hidden', keywordMatch && categoryMatch ? 'false' : 'true');
        });
    }

    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
        var scopeSelector = form.getAttribute('data-filter-form');
        var scope = document.querySelector(scopeSelector) || document;
        var input = form.querySelector('[data-filter-input]');
        var select = form.querySelector('[data-filter-select]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function apply() {
            filterCards(scope, input ? input.value : '', select ? select.value : '');
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            apply();
        });

        if (input) {
            input.addEventListener('input', apply);
        }

        if (select) {
            select.addEventListener('change', apply);
        }

        apply();
    });

    var video = document.querySelector('video[data-stream]');

    if (video) {
        var cover = document.querySelector('[data-player-cover]');
        var sourceUrl = video.getAttribute('data-stream');
        var playerReady = false;
        var hlsInstance = null;

        function startPlayer() {
            if (!sourceUrl) {
                return;
            }

            if (!playerReady) {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(sourceUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = sourceUrl;
                }
                video.controls = true;
                playerReady = true;
            }

            if (cover) {
                cover.classList.add('is-hidden');
            }

            video.play().catch(function () {});
        }

        if (cover) {
            cover.addEventListener('click', startPlayer);
        }

        video.addEventListener('click', function () {
            if (!playerReady) {
                startPlayer();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
