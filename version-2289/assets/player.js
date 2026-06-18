(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movieVideo");
    var overlay = document.querySelector("[data-play-overlay]");
    var button = document.querySelector("[data-play-button]");
    var initialized = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function setup() {
      if (initialized) {
        return;
      }

      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
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
    }

    function showOverlay() {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function play() {
      setup();
      hideOverlay();

      var request = video.play();

      if (request && typeof request.catch === "function") {
        request.catch(function () {
          showOverlay();
        });
      }
    }

    function pause() {
      if (!video.paused) {
        video.pause();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        play();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        pause();
      }
    });

    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", showOverlay);
    video.addEventListener("ended", showOverlay);

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
})();
