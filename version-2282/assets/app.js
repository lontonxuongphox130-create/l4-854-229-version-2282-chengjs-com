(function () {
  var ready = function (callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  };

  ready(function () {
    setupMenu();
    setupSearch();
    setupHero();
    setupFilters();
    setupPlayers();
  });

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupSearch() {
    var forms = document.querySelectorAll("form.header-search, form.mobile-search");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (!query) {
          return;
        }
        event.preventDefault();
        window.location.href = "./category-all.html?q=" + encodeURIComponent(query);
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector(".hero");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }

    var current = 0;
    var timer = null;

    var activate = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
        restart();
      });
    });

    activate(0);
    start();
  }

  function setupFilters() {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim().toLowerCase();
    var grid = document.querySelector("[data-catalog-grid]");
    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-title]"));
    var empty = document.querySelector(".empty-state");
    var searchInputs = document.querySelectorAll("input[name='q']");
    searchInputs.forEach(function (input) {
      input.value = query;
    });

    var apply = function (value) {
      var active = value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var match = !active || haystack.indexOf(active) !== -1;
        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    };

    if (query) {
      apply(query);
    }

    document.querySelectorAll("[data-filter-value]").forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter-value") || "";
        document.querySelectorAll("[data-filter-value]").forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply(value);
      });
    });
  }

  function setupPlayers() {
    var containers = document.querySelectorAll(".video-wrap[data-video]");
    containers.forEach(function (container) {
      var video = container.querySelector("video");
      var button = container.querySelector(".player-button");
      var status = container.parentElement ? container.parentElement.querySelector(".player-status") : null;
      var source = container.getAttribute("data-video");
      var attached = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      var setStatus = function (message) {
        if (status) {
          status.textContent = message || "";
        }
      };

      var attach = function () {
        if (attached) {
          return;
        }
        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
                return;
              }
              if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
                return;
              }
              setStatus("播放暂时不可用");
            }
          });
          return;
        }

        video.src = source;
      };

      var play = function () {
        attach();
        setStatus("");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            setStatus("点击视频区域继续播放");
          });
        }
      };

      if (button) {
        button.addEventListener("click", function () {
          play();
        });
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function () {
        container.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        container.classList.remove("is-playing");
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });

      attach();
    });
  }
})();
