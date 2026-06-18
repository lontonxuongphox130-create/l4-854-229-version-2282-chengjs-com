(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initSearchForms() {
    var forms = document.querySelectorAll(".nav-search, .big-search");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          return;
        }
        event.preventDefault();
        var target = form.getAttribute("action") || "search.html";
        window.location.href = target + "?q=" + encodeURIComponent(value);
      });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function initFilters() {
    var scopes = document.querySelectorAll("[data-filter-scope]");
    scopes.forEach(function (scope) {
      var input = scope.querySelector(".filter-input");
      var type = scope.querySelector(".filter-type");
      var region = scope.querySelector(".filter-region");
      var year = scope.querySelector(".filter-year");
      var count = scope.querySelector(".filter-count");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      if (!cards.length) {
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      if (input && q) {
        input.value = q;
      }

      function update() {
        var keyword = normalize(input ? input.value.trim() : "");
        var typeValue = type ? type.value : "";
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var search = normalize(card.getAttribute("data-search"));
          var ok = true;
          if (keyword && search.indexOf(keyword) === -1) {
            ok = false;
          }
          if (typeValue && card.getAttribute("data-type") !== typeValue) {
            ok = false;
          }
          if (regionValue && card.getAttribute("data-region") !== regionValue) {
            ok = false;
          }
          if (yearValue && card.getAttribute("data-year") !== yearValue) {
            ok = false;
          }
          card.classList.toggle("is-filter-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = "共 " + visible + " 部";
        }
      }

      [input, type, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", update);
          control.addEventListener("change", update);
        }
      });
      update();
    });
  }

  function initPlayer() {
    var box = document.querySelector("[data-player]");
    if (!box) {
      return;
    }
    var video = box.querySelector("video");
    var overlay = box.querySelector(".player-overlay");
    if (!video || !overlay) {
      return;
    }
    var source = video.getAttribute("data-src");
    var attached = false;
    var hlsInstance = null;

    function attachSource() {
      if (attached || !source) {
        return Promise.resolve();
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        box.hlsInstance = hlsInstance;
        return new Promise(function (resolve) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          window.setTimeout(resolve, 1200);
        });
      }
      video.src = source;
      return Promise.resolve();
    }

    function play() {
      overlay.classList.add("is-hidden");
      attachSource().then(function () {
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }).catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initNavigation();
    initSearchForms();
    initHero();
    initFilters();
    initPlayer();
  });
})();
