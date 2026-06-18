(function () {
  const menu = document.querySelector(".menu-toggle");
  if (menu) {
    menu.addEventListener("click", function () {
      document.body.classList.toggle("mobile-open");
    });
  }

  const globalSearch = document.querySelector("[data-global-search]");
  if (globalSearch) {
    globalSearch.addEventListener("submit", function (event) {
      event.preventDefault();
      const input = globalSearch.querySelector("input[type='search']");
      const keyword = input ? input.value.trim() : "";
      const url = keyword ? "./search.html?q=" + encodeURIComponent(keyword) : "./search.html";
      window.location.href = url;
    });
  }

  const carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-dots button"));
    let active = 0;
    let timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.slide || 0));
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    if (slides.length > 1) {
      start();
    }
  }

  const searchInput = document.querySelector(".movie-search");
  const sortSelect = document.querySelector(".movie-sort");
  const chips = Array.from(document.querySelectorAll(".filter-chip"));
  const grids = Array.from(document.querySelectorAll(".searchable-grid"));

  function queryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function activeFilter() {
    const chip = chips.find(function (item) {
      return item.classList.contains("active");
    });
    return chip ? chip.dataset.filter || "all" : "all";
  }

  function applyFilters() {
    const keyword = normalize(searchInput ? searchInput.value : "");
    const filter = activeFilter();
    grids.forEach(function (grid) {
      const cards = Array.from(grid.querySelectorAll(".movie-card"));
      cards.forEach(function (card) {
        const text = normalize(card.dataset.search + " " + card.textContent);
        const type = normalize(card.dataset.type + " " + card.dataset.genre + " " + card.dataset.region);
        const matchesText = !keyword || text.includes(keyword);
        const matchesFilter = filter === "all" || type.includes(normalize(filter));
        card.classList.toggle("search-hidden", !(matchesText && matchesFilter));
      });
    });
  }

  function applySort() {
    const value = sortSelect ? sortSelect.value : "default";
    grids.forEach(function (grid) {
      const cards = Array.from(grid.querySelectorAll(".movie-card"));
      cards.sort(function (a, b) {
        if (value === "rating") {
          return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
        }
        if (value === "year") {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (value === "views") {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        }
        return 0;
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    });
    applyFilters();
  }

  if (searchInput) {
    const keyword = queryFromUrl();
    if (keyword) {
      searchInput.value = keyword;
    }
    searchInput.addEventListener("input", applyFilters);
    applyFilters();
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (item) {
        item.classList.remove("active");
      });
      chip.classList.add("active");
      applyFilters();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener("change", applySort);
  }
})();
