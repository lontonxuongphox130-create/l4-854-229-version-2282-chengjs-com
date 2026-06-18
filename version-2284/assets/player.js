(function () {
  function startPlayer() {
    var video = document.querySelector("[data-player-video]");
    var button = document.querySelector("[data-player-play]");
    if (!video || !button) return;
    var url = video.getAttribute("data-stream");
    var loaded = false;
    function load() {
      if (loaded || !url) return;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      loaded = true;
    }
    function play() {
      load();
      button.classList.add("is-hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }
    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) play();
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      button.classList.remove("is-hidden");
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startPlayer);
  } else {
    startPlayer();
  }
})();
