(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) return;
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) return;
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
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    restart();
  }

  function initGlobalSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-global-search]"));
    var index = window.SITE_SEARCH_INDEX || [];
    inputs.forEach(function (input) {
      var box = input.closest(".search-box");
      var results = box ? box.querySelector("[data-search-results]") : null;
      if (!results) return;
      input.addEventListener("input", function () {
        var value = input.value.trim().toLowerCase();
        if (!value) {
          results.classList.remove("is-open");
          results.innerHTML = "";
          return;
        }
        var matches = index.filter(function (item) {
          return item.key.indexOf(value) !== -1;
        }).slice(0, 9);
        results.innerHTML = matches.map(function (item) {
          return '<a href="' + item.url + '"><b>' + item.title + '</b><span>' + item.meta + '</span></a>';
        }).join("");
        results.classList.toggle("is-open", matches.length > 0);
      });
      document.addEventListener("click", function (event) {
        if (!box.contains(event.target)) results.classList.remove("is-open");
      });
    });
  }

  function initCardFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length) return;
    var search = document.querySelector("[data-page-search]");
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
    function apply() {
      var q = search ? search.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var ok = true;
        if (q && (card.getAttribute("data-search") || "").toLowerCase().indexOf(q) === -1) ok = false;
        selects.forEach(function (select) {
          var field = select.getAttribute("data-card-filter");
          var wanted = select.value;
          if (wanted && (card.getAttribute("data-" + field) || "") !== wanted) ok = false;
        });
        card.classList.toggle("card-hidden", !ok);
      });
    }
    if (search) search.addEventListener("input", apply);
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initCardFilters();
  });
})();
