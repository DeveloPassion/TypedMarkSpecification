(function () {
  var menu = document.getElementById("menu");
  var sidebar = document.getElementById("sidebar");
  if (menu && sidebar) {
    menu.addEventListener("click", function () {
      sidebar.classList.toggle("open");
    });
  }

  var input = document.getElementById("search");
  var results = document.getElementById("search-results");
  if (!input || !results) return;

  var index = null;

  function load() {
    if (index) return Promise.resolve(index);
    return fetch("search-index.json")
      .then(function (r) { return r.json(); })
      .then(function (data) { index = data; return index; });
  }

  function render(matches) {
    if (matches.length === 0) {
      results.hidden = true;
      results.innerHTML = "";
      return;
    }
    results.innerHTML = matches
      .slice(0, 12)
      .map(function (m) {
        var label = m.heading || m.page;
        var where = m.heading ? m.page : "Page";
        return '<a href="' + m.url + '">' + label + '<span class="where">' + where + "</span></a>";
      })
      .join("");
    results.hidden = false;
  }

  input.addEventListener("input", function () {
    var query = input.value.trim().toLowerCase();
    if (query.length < 2) {
      results.hidden = true;
      return;
    }
    load().then(function (data) {
      var matches = data.filter(function (entry) {
        var hay = (entry.page + " " + (entry.heading || "")).toLowerCase();
        return query.split(/\s+/).every(function (part) { return hay.indexOf(part) !== -1; });
      });
      render(matches);
    });
  });

  document.addEventListener("click", function (event) {
    if (!results.contains(event.target) && event.target !== input) {
      results.hidden = true;
    }
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      results.hidden = true;
      input.blur();
    }
  });
})();
