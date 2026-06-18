(function () {
  window.startMoviePlayer = function (url) {
    const video = document.getElementById("videoPlayer");
    const overlay = document.querySelector(".player-overlay");
    const button = document.querySelector(".play-button");
    if (!video || !overlay || !button || !url) {
      return;
    }

    let prepared = false;
    let hls = null;

    function showVideo() {
      overlay.classList.add("is-hidden");
      video.controls = true;
      const action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    function prepare(playNow) {
      if (prepared) {
        if (playNow) {
          showVideo();
        }
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        if (playNow) {
          showVideo();
        }
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (playNow) {
            showVideo();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            hls.destroy();
            hls = null;
            video.src = url;
            if (playNow) {
              showVideo();
            }
          }
        });
        return;
      }
      video.src = url;
      if (playNow) {
        showVideo();
      }
    }

    function launch() {
      prepare(true);
    }

    button.addEventListener("click", launch);
    overlay.addEventListener("click", launch);
    video.addEventListener("click", function () {
      if (video.paused) {
        launch();
      }
    });
    prepare(false);
  };
})();
