(function () {
  var root = document.body ? (document.body.getAttribute("data-root") || "") : "";
  var index = window.SEARCH_INDEX || [];

  function resolve(path) {
    if (!path) {
      return root;
    }
    if (/^https?:\/\//.test(path) || path.charAt(0) === "#") {
      return path;
    }
    return root + path;
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function pickResults(query, limit) {
    var q = text(query).trim();
    if (!q) {
      return [];
    }
    return index.filter(function (item) {
      var body = [item.title, item.category, item.region, item.year, item.genre, item.tags, item.oneLine].join(" ");
      return text(body).indexOf(q) !== -1;
    }).slice(0, limit || 8);
  }

  function renderPanel(panel, results) {
    if (!panel) {
      return;
    }
    if (!results.length) {
      panel.classList.remove("is-open");
      panel.innerHTML = "";
      return;
    }
    panel.innerHTML = results.map(function (item) {
      return [
        '<a class="search-result-link" href="' + resolve(item.url) + '">',
        '<img src="' + resolve(item.cover) + '" alt="' + escapeHtml(item.title) + '">',
        '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.category + " · " + item.year) + '</span></span>',
        '</a>'
      ].join("");
    }).join("");
    panel.classList.add("is-open");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initSiteSearch() {
    document.querySelectorAll("[data-site-search]").forEach(function (input) {
      var wrap = input.parentElement;
      var panel = wrap ? wrap.querySelector("[data-search-panel]") : null;
      input.addEventListener("input", function () {
        renderPanel(panel, pickResults(input.value, 8));
      });
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && input.value.trim()) {
          window.location.href = resolve("search.html?q=" + encodeURIComponent(input.value.trim()));
        }
      });
      document.addEventListener("click", function (event) {
        if (wrap && !wrap.contains(event.target) && panel) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initFilters() {
    var list = document.querySelector("[data-filter-list]");
    if (!list) {
      return;
    }
    var keyword = document.querySelector("[data-filter-keyword]");
    var year = document.querySelector("[data-filter-year]");
    var order = document.querySelector("[data-filter-order]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

    function apply() {
      var q = text(keyword && keyword.value).trim();
      var y = year ? year.value : "";
      var sorted = cards.slice();
      var mode = order ? order.value : "default";
      if (mode === "views") {
        sorted.sort(function (a, b) {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        });
      } else if (mode === "year") {
        sorted.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      } else if (mode === "title") {
        sorted.sort(function (a, b) {
          return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
        });
      }
      sorted.forEach(function (card) {
        list.appendChild(card);
        var body = text([card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year].join(" "));
        var visible = (!q || body.indexOf(q) !== -1) && (!y || card.dataset.year === y);
        card.classList.toggle("is-filter-hidden", !visible);
      });
    }
    [keyword, year, order].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function initSearchPage() {
    var input = document.querySelector("[data-search-page-input]");
    var button = document.querySelector("[data-search-page-button]");
    var results = document.querySelector("[data-search-results]");
    if (!input || !results) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function card(item) {
      return [
        '<article class="movie-card standard">',
        '<a class="card-cover" href="' + resolve(item.url) + '">',
        '<img src="' + resolve(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="play-pill">播放</span>',
        '</a>',
        '<div class="card-body">',
        '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.category) + '</span></div>',
        '<h3><a href="' + resolve(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
        '<p>' + escapeHtml(item.oneLine) + '</p>',
        '<div class="card-foot"><span>' + escapeHtml(item.genre) + '</span><span>' + Number(item.views || 0).toLocaleString() + ' 观看</span></div>',
        '</div>',
        '</article>'
      ].join("");
    }

    function render() {
      var q = input.value.trim();
      var items = q ? pickResults(q, 80) : index.slice(0, 24);
      if (!items.length) {
        results.innerHTML = '<div class="search-empty">没有找到匹配的影片</div>';
        return;
      }
      results.innerHTML = items.map(card).join("");
    }

    input.addEventListener("input", render);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        render();
      }
    });
    if (button) {
      button.addEventListener("click", render);
    }
    render();
  }

  function initPlayer() {
    var video = document.querySelector("[data-player]");
    var button = document.querySelector("[data-play-button]");
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute("data-stream") || "";
    var ready = false;
    var preparing = null;
    var hlsInstance = null;

    function prepare() {
      if (ready) {
        return Promise.resolve();
      }
      if (preparing) {
        return preparing;
      }
      preparing = new Promise(function (resolvePrepare) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          ready = true;
          resolvePrepare();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            ready = true;
            resolvePrepare();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          });
          return;
        }
        video.src = stream;
        ready = true;
        resolvePrepare();
      });
      return preparing;
    }

    function start() {
      button.classList.add("is-loading");
      prepare().then(function () {
        button.classList.add("is-hidden");
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      }).finally(function () {
        button.classList.remove("is-loading");
      });
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      start();
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initSiteSearch();
    initMobileMenu();
    initFilters();
    initSearchPage();
    initPlayer();
  });
})();
