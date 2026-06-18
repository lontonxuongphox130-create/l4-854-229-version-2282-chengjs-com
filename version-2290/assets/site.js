(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var menuPanel = document.querySelector("[data-menu-panel]");

  if (menuButton && menuPanel) {
    menuButton.addEventListener("click", function () {
      menuPanel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function schedule() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        schedule();
      });
    }

    if (slides.length > 1) {
      schedule();
    }
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterSelect = document.querySelector("[data-filter-select]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

  function applyLocalFilter() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var year = filterSelect ? filterSelect.value : "";

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-region")
      ].join(" ").toLowerCase();
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesYear = !year || card.getAttribute("data-year") === year;
      card.style.display = matchesKeyword && matchesYear ? "" : "none";
    });
  }

  if (filterInput) {
    filterInput.addEventListener("input", applyLocalFilter);
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", applyLocalFilter);
  }

  var globalInput = document.getElementById("globalSearchInput");
  var globalSelect = document.getElementById("globalSearchSelect");
  var resultBox = document.getElementById("searchResults");

  function movieCard(movie) {
    return [
      '<article class="movie-card" data-card data-title="' + escapeAttr(movie.title) + '" data-year="' + escapeAttr(movie.year) + '" data-genre="' + escapeAttr(movie.genre) + '" data-region="' + escapeAttr(movie.region) + '">',
      '  <a class="movie-poster" href="./movies/' + movie.file + '" aria-label="观看 ' + escapeAttr(movie.title) + '">',
      '    <img src="./' + movie.cover + '.jpg" alt="' + escapeAttr(movie.title) + '" loading="lazy">',
      '    <span class="card-category">' + escapeHtml(movie.categoryName) + '</span>',
      '    <span class="card-duration">' + escapeHtml(movie.duration) + '</span>',
      '    <span class="play-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M8 5v14l11-7L8 5Z"></path></svg></span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-title" href="./movies/' + movie.file + '">' + escapeHtml(movie.title) + '</a>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.primaryGenre) + '</span></div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[character];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }

  function renderSearch() {
    if (!resultBox || !window.SITE_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var urlKeyword = params.get("q") || "";
    if (globalInput && !globalInput.value && urlKeyword) {
      globalInput.value = urlKeyword;
    }

    var keyword = globalInput ? globalInput.value.trim().toLowerCase() : "";
    var category = globalSelect ? globalSelect.value : "";
    var matches = window.SITE_MOVIES.filter(function (movie) {
      var haystack = [movie.title, movie.year, movie.region, movie.genre, movie.tags, movie.categoryName].join(" ").toLowerCase();
      return (!keyword || haystack.indexOf(keyword) !== -1) && (!category || movie.categorySlug === category);
    }).slice(0, 120);

    resultBox.innerHTML = matches.map(movieCard).join("");
  }

  if (globalInput) {
    globalInput.addEventListener("input", renderSearch);
  }

  if (globalSelect) {
    globalSelect.addEventListener("change", renderSearch);
  }

  renderSearch();
})();
