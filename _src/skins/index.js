// TODO build gulp file for compiling these scripts as follows
// from source (/_src/styles/) to (/styles/)
// winter/*.js > (concat and uglify) > winter/js.js
// winter/*.less > (concat and less-ify and uglify) > winter/css.css
// winter/*.(png|jpg|...) > (minify and web optimize) > winter/*.(png|jpg|...)

(function (d) {

  // CONSTANTS
  var JS = 'js', CSS = 'css';


  // DYNAMIC JS + CSS LOADER
  var loader = function(path, type) {
    var tag = null;

    path = path + '/' + type + '.' + type; // naming convention

    if (type == JS) {
      tag = d.createElement('script');
      tag.setAttribute('type', 'text/javascript');
      tag.setAttribute('src', path);
    } else if (type == CSS) {
      tag = d.createElement('link');
      tag.setAttribute('rel', 'stylesheet');
      tag.setAttribute('type', 'text/css');
      tag.setAttribute('href', path);
    }

    if (tag) d.getElementsByTagName('head')[0].appendChild(tag);
  };


  // THEME OBJECT
  var Theme = function (name, is_active, scripts) {
    this.name = name; // Directory of skin
    this.is_active = is_active || function (now) { return false; };
    this.scripts = scripts || [];
  };

  Theme.prototype.load = function (now) {
    if (this.is_active(now))
      for (var i = 0; i < this.scripts.length; i++)
        loader(this.name, this.scripts[i]);
  }


  // STYLES AND THEIR CONDITIONS
  var cases = [
    new Theme('winter', function(a) {
      return a.getMonth() == 11 || a.getMonth() == 0; // January or December
    }, [JS])
  ];


  // MAIN
  var now = new Date();
  for (var i = 0; i < cases.length; i++) cases[i].load(now);
})(document);
