(function () {
  window.initMoviePlayer = function (id, source) {
    var shell = document.getElementById(id);
    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var cover = shell.querySelector('.play-cover');
    var started = false;
    var hls = null;

    if (!video) {
      return;
    }

    function start() {
      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      video.play().catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  };
})();
