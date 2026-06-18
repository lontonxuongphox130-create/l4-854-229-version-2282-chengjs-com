(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-player-button]");
    var stream = player.getAttribute("data-stream");
    var hls = null;
    var loaded = false;

    function loadVideo() {
      if (!video || !stream || loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      loaded = true;
    }

    function startPlayback() {
      loadVideo();
      if (button) {
        button.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          startPlayback();
        }
      });
      video.addEventListener("ended", function () {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  });
})();
