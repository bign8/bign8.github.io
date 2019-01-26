!function() {
  // Thanks: https://github.com/twbs/bootstrap/blob/v4-dev/js/src/collapse.js
  // Thanks: http://youmightnotneedjquery.com/
  document.querySelectorAll('[data-toggle="collapse"]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      document.querySelectorAll('.collapse').forEach(function(el) {
        el.classList.toggle('show');
      });
    });
  });
}();
