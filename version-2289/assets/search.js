(function () {
  var input = document.querySelector("[data-search-input]");
  var typeSelect = document.querySelector("[data-search-type]");
  var yearSelect = document.querySelector("[data-search-year]");
  var button = document.querySelector("[data-search-button]");
  var grid = document.querySelector("[data-search-results]");
  var empty = document.querySelector("[data-search-empty]");

  if (!grid || !window.searchIndex) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initial = params.get("q") || "";

  if (input) {
    input.value = initial;
  }

  function norm(value) {
    return String(value || "").trim().toLowerCase();
  }

  function makeCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      '<a class="movie-card" href="' + escapeHtml(item.url) + '" data-card>',
      '  <div class="poster-wrap">',
      '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" />',
      '    <div class="poster-gradient"></div>',
      '    <div class="play-chip">播放</div>',
      '  </div>',
      '  <div class="card-body">',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(item.year) + '</span>',
      '      <span>' + escapeHtml(item.region) + '</span>',
      '      <span>' + escapeHtml(item.type) + '</span>',
      '    </div>',
      '    <h3>' + escapeHtml(item.title) + '</h3>',
      '    <p>' + escapeHtml(item.line) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</a>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function run() {
    var q = norm(input ? input.value : "");
    var typeValue = norm(typeSelect ? typeSelect.value : "");
    var yearValue = norm(yearSelect ? yearSelect.value : "");

    var result = window.searchIndex.filter(function (item) {
      var text = [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.line,
        (item.tags || []).join(" ")
      ].join(" ").toLowerCase();

      var okKeyword = !q || text.indexOf(q) !== -1;
      var okType = !typeValue || norm(item.type) === typeValue;
      var okYear = !yearValue || norm(item.year) === yearValue;

      return okKeyword && okType && okYear;
    }).slice(0, 120);

    grid.innerHTML = result.map(makeCard).join("");

    if (empty) {
      empty.style.display = result.length ? "none" : "block";
    }
  }

  if (button) {
    button.addEventListener("click", run);
  }

  [input, typeSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", run);
      control.addEventListener("change", run);
    }
  });

  run();
})();
