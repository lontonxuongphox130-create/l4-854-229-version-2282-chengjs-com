(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  var sliders = document.querySelectorAll("[data-hero-slider]");

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);

    show(0);
    start();
  });

  var panels = document.querySelectorAll("[data-local-filter]");

  panels.forEach(function (panel) {
    var input = panel.querySelector("[data-filter-search]");
    var year = panel.querySelector("[data-filter-year]");
    var region = panel.querySelector("[data-filter-region]");
    var button = panel.querySelector("[data-filter-button]");
    var grid = document.querySelector(panel.getAttribute("data-target"));
    var empty = document.querySelector(panel.getAttribute("data-empty"));

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

    function norm(value) {
      return String(value || "").trim().toLowerCase();
    }

    function runFilter() {
      var keyword = norm(input ? input.value : "");
      var yearValue = norm(year ? year.value : "");
      var regionValue = norm(region ? region.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();

        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okYear = !yearValue || norm(card.getAttribute("data-year")) === yearValue;
        var okRegion = !regionValue || norm(card.getAttribute("data-region")).indexOf(regionValue) !== -1;
        var matched = okKeyword && okYear && okRegion;

        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    [input, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", runFilter);
        control.addEventListener("change", runFilter);
      }
    });

    if (button) {
      button.addEventListener("click", runFilter);
    }

    runFilter();
  });
})();
