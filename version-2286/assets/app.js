(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function createSearchResult(item) {
    var link = document.createElement("a");
    link.className = "search-result-item";
    link.href = item.url;

    var img = document.createElement("img");
    img.src = item.image;
    img.alt = item.title;
    img.loading = "lazy";

    var text = document.createElement("div");
    var title = document.createElement("strong");
    title.textContent = item.title;
    var meta = document.createElement("span");
    meta.textContent = [item.year, item.region, item.type].filter(Boolean).join(" · ");

    text.appendChild(title);
    text.appendChild(meta);
    link.appendChild(img);
    link.appendChild(text);
    return link;
  }

  function bindGlobalSearch(input) {
    var box = input.parentElement.querySelector("[data-global-search-results]");
    if (!box || !window.siteMovieSearch) {
      return;
    }

    input.addEventListener("input", function () {
      var query = normalize(input.value);
      box.innerHTML = "";
      if (!query) {
        box.classList.remove("is-open");
        return;
      }

      var matches = window.siteMovieSearch.filter(function (item) {
        return normalize(item.title + " " + item.year + " " + item.region + " " + item.type + " " + item.genre + " " + item.tags).indexOf(query) !== -1;
      }).slice(0, 10);

      matches.forEach(function (item) {
        box.appendChild(createSearchResult(item));
      });

      box.classList.toggle("is-open", matches.length > 0);
    });

    document.addEventListener("click", function (event) {
      if (!input.parentElement.contains(event.target)) {
        box.classList.remove("is-open");
      }
    });
  }

  function bindLocalFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length) {
      return;
    }

    var search = document.querySelector("[data-local-search]");
    var year = document.querySelector("[data-local-year]");
    var type = document.querySelector("[data-local-type]");

    function apply() {
      var q = normalize(search && search.value);
      var y = year ? year.value : "";
      var t = type ? type.value : "";

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var visible = (!q || text.indexOf(q) !== -1) && (!y || cardYear === y) && (!t || cardType === t);
        card.classList.toggle("is-filtered-out", !visible);
      });
    }

    [search, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function bindMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var shell = document.querySelector("[data-hero-carousel]");
    if (!shell) {
      return;
    }
    var slides = Array.prototype.slice.call(shell.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(shell.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  window.initMoviePlayer = function (streamUrl, videoId, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !streamUrl) {
      return;
    }

    function load() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      video.setAttribute("data-ready", "1");
    }

    function play() {
      load();
      overlay.classList.add("is-hidden");
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };

  ready(function () {
    bindMenu();
    bindHero();
    bindLocalFilters();
    Array.prototype.slice.call(document.querySelectorAll("[data-global-search]")).forEach(bindGlobalSearch);
  });
})();
