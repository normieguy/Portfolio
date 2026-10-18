/* Bare visit counter — Abacus (https://abacus.jasoncameron.dev), keyless + CORS-enabled.
   Increments once per browser session; other page loads in the same session just read the value.
   Renders as plain digits with no label, by design. Hides itself if the service is unreachable. */
(function () {
  var out = document.getElementById('visitCount');
  if (!out) return;

  var BASE = 'https://abacus.jasoncameron.dev/';
  var NS = 'normieguy.github.io';
  var KEY = 'portfolio-visits';

  var counted = false;
  try { counted = sessionStorage.getItem('visitCounted') === '1'; } catch (e) {}

  var url = counted ? BASE + 'get/' + NS + '/' + KEY : BASE + 'hit/' + NS + '/' + KEY;

  fetch(url)
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      out.textContent = data.value;
      if (!counted) {
        try { sessionStorage.setItem('visitCounted', '1'); } catch (e) {}
      }
    })
    .catch(function () {
      out.style.display = 'none';
    });
})();