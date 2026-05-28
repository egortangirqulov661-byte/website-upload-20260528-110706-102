import { H as Hls } from './hls.js';

function setupPlayer(container) {
    var video = container.querySelector('video');
    var button = container.querySelector('[data-player-start]');
    var status = container.querySelector('[data-player-status]');
    var source = container.getAttribute('data-video-src');
    var hls = null;
    var ready = false;

    function setStatus(message, keep) {
        if (!status) {
            return;
        }
        status.textContent = message || '';
        status.classList.toggle('is-visible', Boolean(message));
        if (message && !keep) {
            window.setTimeout(function () {
                status.classList.remove('is-visible');
            }, 2200);
        }
    }

    function attachSource() {
        if (ready || !video || !source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            ready = true;
            setStatus('正在加载影片');
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus('影片已就绪');
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    setStatus('网络连接异常，正在重试', true);
                    hls.startLoad();
                    return;
                }
                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    setStatus('媒体加载异常，正在恢复', true);
                    hls.recoverMediaError();
                    return;
                }
                setStatus('当前浏览器无法播放该影片', true);
                hls.destroy();
            });
            ready = true;
            return;
        }

        setStatus('当前浏览器不支持播放', true);
    }

    function startPlayback() {
        attachSource();
        if (button) {
            button.classList.add('is-hidden');
        }
        if (video) {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                    setStatus('请再次点击播放按钮', true);
                });
            }
        }
    }

    if (button) {
        button.addEventListener('click', startPlayback);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
}

document.querySelectorAll('[data-video-player]').forEach(setupPlayer);
