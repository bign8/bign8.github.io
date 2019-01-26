!function() {

  // Thanks: http://youmightnotneedjquery.com/#toggle_class
  function toggleClass(el, className) {
    if (el.classList) {
      el.classList.toggle(className);
    } else {
      var classes = el.className.split(' ');
      var existingIndex = classes.indexOf(className);

      if (existingIndex >= 0)
        classes.splice(existingIndex, 1);
      else
        classes.push(className);

      el.className = classes.join(' ');
    }
  }

  // Thanks: https://github.com/twbs/bootstrap/blob/v4-dev/js/src/collapse.js
  document.querySelectorAll('[data-toggle="collapse"]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      document.querySelectorAll('.collapse').forEach(function(el) {
        toggleClass(el, 'show');
      });
    });
  });
}();
