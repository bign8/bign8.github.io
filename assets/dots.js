// Author: Nate Woods
// Inspired by: http://netengine.com.au/blog/deploying-your-static-site-with-travis-ci/
// Based on: http://vincentgarreau.com/particles.js - http://github.com/VincentGarreau/particles.js
// Augmented using quad-trees: https://en.wikipedia.org/wiki/Quadtree
// Dependencies:
//  Math: random, hypot, abs, cos, sin, floor, PI
//  Document: readyState, createElement
//  Window: requestAnimationFrame, addEventListener
//  canvas: height, width, style, getContext, classList
//  ctx: clearRect, lineWidth, strokeStyle, beginPath, moveTo, lineTo, stroke, arc, fill

(function(d, w, M) {
  "use strict";
  var dots = [], // Each point that is rendered
    R = 150,     // Radius of interacting lines
    G = 150,     // The exact color of gray
    ctx, canvas, // html5 canvas and 2d drawing context
    kill, dead;  // dom button and boolean toggle for killing script.

  // Map converts n on the scale [a, b) to the scale [c, d).
  var map = function(n, a, b, c, d) { return ((n-a)/(b-a))*(d-c)+c; };

  // Vector is a 2-3 dimensional point class.
  var Vector = function(x, y, z) {
    this.x = x, this.y = y, this.z = z;
    this.add = function(v) {
      this.x += v.x || 0, this.y += v.y || 0, this.z += v.z || 0;
    };
    this.mult = function(n) {
      this.x *= n || 0, this.y *= n || 0, this.z *= n || 0;
    }
  };
  Vector.random2D = function() {
    var angle = M.random()*M.PI*2;
    return new Vector(M.cos(angle), M.sin(angle), 0);
  };

  // QuadTree based on psuedocode from https://en.wikipedia.org/wiki/Quadtree
  var QuadTree = function(x, y, w, h, cap) {
    var points = [], nw, ne, se, sw;

    // Initialize sub-trees (should only be called once);
    var subdivide = function() {
      var w2 = w / 2, h2 = h / 2;
      nw = new QuadTree(x - w2, y - h2, w2, h2, cap);
      ne = new QuadTree(x - w2, y + h2, w2, h2, cap);
      sw = new QuadTree(x + w2, y - h2, w2, h2, cap);
      se = new QuadTree(x + w2, y + h2, w2, h2, cap);
    };

    // Does this rectangle contain a given point. Arg: point vector.
    var contains = function(pt) {
      return x - w <= pt.x && x + w >= pt.x && y - h <= pt.y && y + h >= pt.y;
    };

    // Does a circle intersect with this Rectangle? Arg: center vector.
    var intersects = function(c) {
      return x - w <= c.x + R && x + w >= c.x - R && y - h <= c.y + R && y + h >= c.y - R;
    };

    // Does a circle contain a point. Args: center vector, point vector.
    var near = function(c, p) {
      return M.hypot(c.x - p.x, c.y - p.y) <= R;
    };

    // Insert point into quadtree
    this.add = function(pt) {
      if (!contains(pt)) return false; // not my problem
      if (points.length < cap) {       // if we have room
        points.push(pt);               // add to ourselves
        return true;                   // exit insertion stack
      }                                // otherwise
      if (!nw) subdivide();            // initialize sub-components
      return nw.add(pt) || ne.add(pt) || sw.add(pt) || se.add(pt); // defer to children
    };

    // Query a range of items from quadtree. Args: center for query (list is optional)
    this.ask = function(c, list) {
      if (list == undefined) list = []; // init list if it wasn't previously
      if (intersects(c)) {              // if we are worried about this point
        for (let p of points) if (near(c, p)) list.push(p); // check if it's near
        if (nw) list = se.ask(c, sw.ask(c, ne.ask(c, nw.ask(c, list)))); // or if kids have it
      }
      return list;
    };
  };

  // Dot is a visible point with velocity and position vectors.
  // The Z of the position vector is the index/identifier within the dots array.
  function Dot(idx) {
    this.position = new Vector(M.random() * canvas.width, M.random() * canvas.height, idx);
    this.velocity = Vector.random2D();
    this.velocity.mult(M.random());
    this.size = M.random() + 1;

    this.show = function() {
      this.position.add(this.velocity);

      // Absolute values allow for resizes, pushing particles back into view
      if      (this.position.x <= this.size) this.velocity.x = M.abs(this.velocity.x);
      else if (this.position.y <= this.size) this.velocity.y = M.abs(this.velocity.y);
      else if (this.position.x >= canvas.width - this.size) this.velocity.x = -M.abs(this.velocity.x);
      else if (this.position.y > canvas.height - this.size) this.velocity.y = -M.abs(this.velocity.y);

      // Draw Circle
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.size, 0, 2*M.PI);
      ctx.fill();
      return this.position;
    };
  }

  function resize() {
    var height = w.innerHeight || d.documentElement && d.documentElement.clientHeight || d.body && d.body.clientHeight || 0,
        width = w.innerWidth || d.documentElement && d.documentElement.clientWidth || d.body && d.body.clientWidth || 0;
    canvas.height = height * 2;
    canvas.width = width * 2;
    canvas.style.height = height + 'px';
    canvas.style.width = width + 'px';

    // TODO: deal with resize of dots
    if (dots.length > 0) return;
    var density = M.floor(height * width / 5e3);
    for (var i = 0; i < density; i++) dots.push(new Dot(dots.length));
  }

  function setup() {
    // Build and size canvas
    canvas = d.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.overflow = 'hidden';
    canvas.style.zIndex = -1;
    d.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    ctx.lineWidth = 0.5; // for lines
    ctx.fillStyle = "rgb("+G+", "+G+", "+G+")";

    // Add Close Button
    dead = false;
    kill = d.createElement('a');
    kill.className = 'kill-animation';
    kill.text = '×';
    kill.title = 'Stop background animation';
    kill.addEventListener('click', function() {
      dead = true;
      return false;
    })
    kill.href = '#kill-animation';
    d.body.appendChild(kill);

    // Event listeners
    w.addEventListener("resize", resize);
    w.requestAnimationFrame(draw);
  }

  function draw() {

    // if we have died, clean up after ourselves
    if (dead || localStorage.getItem("no-dots") == "true") {
      localStorage.setItem("no-dots", "true");
      canvas.remove();
      kill.remove();
      dots = null;
      w.removeEventListener("resize", resize);
      return;
    }

    // Regular render loop
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var w2 = canvas.width / 2, h2 = canvas.height / 2,
      quad = new QuadTree(w2, h2, w2, h2, 4); // center point and half width/height

    // Drawing + Updating Circles: O(n)
    for (let dot of dots) quad.add(dot.show());

    // Drawing Lines: Worst = O(n*n), Average = O(n*log(n)), Best = O(n)
    for (let p of dots)                   // for all dots
      for (let q of quad.ask(p.position)) // find neighbors : dist(p, q) <= R
        if (q.z > p.position.z)           // with index later than my own
          line(p.position, q);            // draw a line between them

    // redo the animation rendering
    w.requestAnimationFrame(draw);
  }

  function line(a, b) {
    var d = M.hypot(b.x - a.x, b.y - a.y);
    ctx.strokeStyle = "rgba("+G+", "+G+", "+G+", " + map(d, 0, R, 1, 0) + ")";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // Startup
  d.readyState === 'complete' ? setup() : w.addEventListener('load', setup , false);
})(document, window, Math);
