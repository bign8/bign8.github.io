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

  function Dot() {
    this.position = new Vector(M.random() * canvas.width, M.random() * canvas.height);
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
    for (var i = 0; i < density; i++) dots.push(new Dot());
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

    // Drawing + Updating Circles: O(n)
    for (var i = 0; i < dots.length; i++) dots[i].draw();

    // Drawing Lines: Worst = O(n*n), Average = O(n*log(n)), Best = O(n)
    for (var i = 0; i < dots.length; i++)
      for (var j = i+1; j < dots.length; j++)
        line(dots[i].position, dots[j].position);

    // redo the animation rendering
    w.requestAnimationFrame(draw);
  }

  function line(a, b) {
    var d = M.hypot(b.x - a.x, b.y - a.y);
    if (d > DIST) return;

    ctx.strokeStyle = "rgba("+G+", "+G+", "+G+", " + map(d, 0, DIST, 1, 0) + ")";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // Startup
  d.readyState === 'complete' ? setup() : w.addEventListener('load', setup , false);
})(document, window, Math);
