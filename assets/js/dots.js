// Author: Nate Woods
// Inspired by: http://netengine.com.au/blog/deploying-your-static-site-with-travis-ci/
// Based on: http://vincentgarreau.com/particles.js - http://github.com/VincentGarreau/particles.js
// Dependencies:
//  Math: random, hypot, abs, cos, sin, floor, PI
//  Document: readyState, createElement
//  Window: requestAnimationFrame, addEventListener
//  canvas: height, width, style, getContext, classList
//  ctx: clearRect, lineWidth, strokeStyle, beginPath, moveTo, lineTo, stroke, arc, fill

(function(d, w, M) {
  "use strict";
  var dots = [], DIST = 150, G = 150, ctx = null, canvas = null;

  var map = function(n, a, b, c, d) { return ((n-a)/(b-a))*(d-c)+c; };

  // Vector is a 2-3 dimensional point class.
  var Vector = function(x, y, z) {
    this.x = x, this.y = y, this.z = z;
    this.add = function(x, y, z) {
      if (x instanceof Vector) this.x += x.x || 0, this.y += x.y || 0, this.z += x.z || 0;
      else throw 'Unsupported Add';
    };
    this.mult = function(n) {
      this.x *= n || 0, this.y *= n || 0, this.z *= n || 0;
    }
  };
  Vector.random2D = function() {
    var angle = M.random()*M.PI*2;
    return new Vector(M.cos(angle), M.sin(angle), 0);
  };

  // QuadTree bounding shapes.
  var Rect = function(x, y, w, h) {
    this.x = x, this.y = y, this.h = h, this.w = w;
    this.contains = function(pt) {
      return x - w <= pt.x && x + w >= pt.x && y - h <= pt.y && y + h >= pt.y;
    };
    this.intersects = function(r) {
      // Only need to deal with circular query ranges
      return (
        x - w <= r.x + r.r &&
        x + w >= r.x - r.r &&
        y - h <= r.y + r.r &&
        y + h >= r.y - r.r
      );
    };
  };
  var Circ = function(x, y, r) {
    this.x = x, this.y = y, this.r = r;
    this.contains = function(pt) {
      return M.hypot(x - pt.x, y - pt.y) <= r;
    };
  };

  // QuadTree based on psuedocode on https://en.wikipedia.org/wiki/Quadtree
  var QuadTree = function(bounds, limit) {
    limit = limit || 4;
    var points = [], nw, ne, se, sw;

    var subdivide = function() {
      var w2 = bounds.w / 2, h2 = bounds.h / 2;
      nw = new QuadTree(new Rect(bounds.x - w2, bounds.y - h2, w2, h2), limit);
      ne = new QuadTree(new Rect(bounds.x - w2, bounds.y + h2, w2, h2), limit);
      sw = new QuadTree(new Rect(bounds.x + w2, bounds.y - h2, w2, h2), limit);
      se = new QuadTree(new Rect(bounds.x + w2, bounds.y + h2, w2, h2), limit);
    };

    // Insert point into quadtree
    this.insert = function(pt) {
      if (!bounds.contains(pt)) return false; // not my problem
      if (points.length < limit) {
        points.push(pt); // fits just fine
        return true;
      }
      if (nw == undefined) subdivide(); // initialize sub-components
      return nw.insert(pt) || ne.insert(pt) || sw.insert(pt) || se.insert(pt); // defer to one of children
    };

    // Query a range of items from quadtree
    this.query = function(range, list) {
      if (list == undefined) list = [];
      if (bounds.intersects(range)) {
        for (let p of points) if (range.contains(p)) list.push(p);
        if (nw != undefined)
          list = se.query(range, sw.query(range, ne.query(range, nw.query(range, list))));
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

    this.draw = function() {
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

    // Event listeners
    w.addEventListener("resize", resize);
    w.requestAnimationFrame(draw);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var w2 = canvas.width / 2, h2 = canvas.height / 2,
      quad = new QuadTree(new Rect(w2, h2, w2, h2), 4); // center point and half width/height

    // Drawing + Updating Circles: O(n)
    for (let dot of dots) {
      dot.draw();
      quad.insert(dot.position);
    }

    // Drawing Lines: Worst = O(n*n), Average = O(n*log(n)), Best = O(n)
    for (let p of dots)                                                     // for all dots
      for (let q of quad.query(new Circ(p.position.x, p.position.y, DIST))) // find neighbors
        if (q.z > p.position.z)                                             // with index later than my own
          line(p.position, q);                                              // draw a line between them

    // redo the animation rendering
    w.requestAnimationFrame(draw);
  }

  function line(a, b) {
    var d = M.hypot(b.x - a.x, b.y - a.y);
    ctx.strokeStyle = "rgba("+G+", "+G+", "+G+", " + map(d, 0, DIST, 1, 0) + ")";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // Startup
  d.readyState === 'complete' ? setup() : w.addEventListener('load', setup , false);
})(document, window, Math);
