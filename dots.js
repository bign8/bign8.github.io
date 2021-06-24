// Author: Nate Woods
// Based on: http://github.com/VincentGarreau/particles.js
// Quad-Trees: https://en.wikipedia.org/wiki/Quadtree

(function(d, w, M) {
  "use strict";
  const CAP = 4,  // max number of points per node
    PHI = 2*M.PI, // physicists rejoyce!
    R = 150,      // radius of interacting lines
    G = 150,      // the darkest shade of gray
    GS = `rgb(${G}, ${G}, ${G})`; // gray of a dot

  var dots = [], // Each point that is rendered
    ctx, canvas, // html5 canvas and 2d drawing context
    kill, dead;  // dom button and boolean toggle for killing script.

  dead = localStorage.getItem('no-dots') == 'true'; // can only check once

  // Map converts n on the scale [a, b) to the scale [c, d).
  var map = (n, a, b, c, d) => ((n-a)/(b-a))*(d-c)+c;

  // Buffer allows some pre-allocation of an array that can grow, but maintains array over time
  class Buffer {
    constructor(n) { this.arr=new Array(n), this.length=0 }
    reset() { this.length=0; return this }
    push(o) {
      if (this.length >= this.arr.length) {
        console.log('Extending buffer!!!')
        this.length++
        return this.arr.push(o) // growing underlying buffer
      }
      this.arr[this.length] = o
      this.length++
    }
    pop() {
      if (!this.length) return undefined
      this.length--
      return this.arr[this.length]
    }
    *[Symbol.iterator]() {
      for (let i = 0; i < this.length; i++) yield this.arr[i]
    }
  }

  // Vector is a 2-3 dimensional point class.
  class Vector {
    constructor(x, y, z) { this.x = x, this.y = y, this.z = z; }
    add(v) { this.x += v.x || 0, this.y += v.y || 0, this.z += v.z || 0; }
    mult(n) { this.x *= n || 0, this.y *= n || 0, this.z *= n || 0; }
    static random2D() {
      let angle = M.random()*PHI;
      return new Vector(M.cos(angle), M.sin(angle), 0);
    }
  }

  // QuadTree based on psuedocode from https://en.wikipedia.org/wiki/Quadtree
  class QuadTree {
    static pool = new Buffer(32) // buffer of objects to construct from
    constructor(x, y, w, h) { this.points=new Buffer(CAP), this.reset(x, y, w, h) }
    reset(x, y, w, h) { this.x=x, this.y=y, this.w=w, this.h=h, this.idx=0; return this }
    subdivide() {
      w2 = this.w/2, h2 = this.h/2;
      this.nw = QuadTree.make(this.x-w2, this.y-h2, w2, h2);
      this.ne = QuadTree.make(this.x-w2, this.y+h2, w2, h2);
      this.sw = QuadTree.make(this.x+w2, this.y-h2, w2, h2);
      this.se = QuadTree.make(this.x+w2, this.y+h2, w2, h2);
    }

    // make a new QuadTree node (use pool to recycle if possible)
    static make(x, y, w, h) {
      if (QuadTree.pool.length) return QuadTree.pool.pop().reset(x, y, w, h)
      return new QuadTree(x, y, w, h)
    }

    // recycle deconstructs the QuadTree into a pool for re-use
    recycle() {
      QuadTree.pool.push(this)
      this.idx = 0 // array stays allocated, but points inside it are ignored
      if (this.nw) {
        this.nw.recycle()
        this.ne.recycle()
        this.sw.recycle()
        this.se.recycle()
        this.nw = null
        this.ne = null
        this.sw = null
        this.se = null
      }
    }

    // Does this rectangle contain a given point. Arg: point vector.
    contains(pt) { return this.x - this.w <= pt.x && this.x + this.w >= pt.x && this.y - this.h <= pt.y && this.y + this.h >= pt.y; }

    // Does a circle intersect with this Rectangle? Arg: center vector.
    intersects(c) { return this.x - this.w <= c.x + R && this.x + this.w >= c.x - R && this.y - this.h <= c.y + R && this.y + this.h >= c.y - R; }

    // Does a circle contain a point. Args: center vector, point vector.
    near(c, p) { return M.hypot(c.x - p.x, c.y - p.y) <= R; }

    // Insert point into quadtree
    add(pt) {
      if (!this.contains(pt)) return false; // not my problem
      if (this.idx < CAP) {                 // if we have room
        this.points[this.idx] = pt          // add to ourselves
        this.idx++                          // increment idx cursor
        return true                         // exit insertion stack
      }                                     // otherwise
      if (!this.nw) this.subdivide();       // initialze sub-components
      return this.nw.add(pt) || this.ne.add(pt) || this.sw.add(pt) || this.se.add(pt); // defer to children
    }

    // QuadTree based on psuedocode from https://en.wikipedia.org/wiki/Quadtree
    ask(c, list) {
      if (this.intersects(c)) {         // if we are worried about this point
        for (let i = 0; i < this.idx; i++) // iterate over the points we have and...
          if (this.near(c, this.points[i])) list.push(this.points[i]); // check if it's near
        if (this.nw) list = this.se.ask(c, this.sw.ask(c, this.ne.ask(c, this.nw.ask(c, list)))); // or if kids have it
      }
      return list;
    }
  }

  // Dot is a visible point with velocity and position vectors.
  // The Z of the position vector is the index/identifier within the dots array.
  class Dot {
    constructor(idx) {
      this.position = new Vector(M.random()*canvas.width, M.random()*canvas.height, idx);
      this.velocity = Vector.random2D();
      this.velocity.mult(M.random());
      this.size = M.random()+1;
    }
    show() {
      this.position.add(this.velocity);

      // Absolute values allow for resizes, pushing particles back into view
      if      (this.position.x <= this.size) this.velocity.x = M.abs(this.velocity.x);
      else if (this.position.y <= this.size) this.velocity.y = M.abs(this.velocity.y);
      else if (this.position.x >= canvas.width-this.size) this.velocity.x = -M.abs(this.velocity.x);
      else if (this.position.y > canvas.height-this.size) this.velocity.y = -M.abs(this.velocity.y);

      // Draw Circle
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.size, 0, PHI);
      ctx.fill();
      return this.position;
    }
  }

  function resize() {
    var height = w.innerHeight || d.documentElement && d.documentElement.clientHeight || d.body && d.body.clientHeight || 0,
        width = w.innerWidth || d.documentElement && d.documentElement.clientWidth || d.body && d.body.clientWidth || 0;
    canvas.height = height*2;
    canvas.width = width*2;
    canvas.style.height = height+'px';
    canvas.style.width = width+'px';

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
    w.addEventListener('resize', resize);
    w.requestAnimationFrame(draw);
  }

  // vars used in draw every time
  var w2, h2, quad, dot, p, q, buffer = new Buffer(32);

  function draw() {

    // if we have died, clean up after ourselves
    if (dead) {
      localStorage.setItem('no-dots', 'true');
      canvas.remove();
      kill.remove();
      dots = null;
      w.removeEventListener('resize', resize);
      return;
    }

    // Regular render loop
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = GS;
    w2 = canvas.width/2
    h2 = canvas.height/2
    quad = QuadTree.make(w2, h2, w2, h2) // center point and half width/height

    // Drawing + Updating Circles: O(n)
    for (dot of dots) quad.add(dot.show());

    // Drawing Lines: Worst = O(n*n), Average = O(n*log(n)), Best = O(n)
    for (p of dots)                   // for all dots
      for (q of quad.ask(p.position, buffer.reset())) // find neighbors : dist(p, q) <= R
        if (q.z > p.position.z)           // with index later than my own
          line(p.position, q);            // draw a line between them

    // Re-hydrate the pool with quad nodes for next render frame
    quad.recycle()

    // redo the animation rendering
    w.requestAnimationFrame(draw);
  }

  function line(a, b) {
    var d = M.hypot(b.x-a.x, b.y-a.y);
    d = map(d, 0, R, 1, 0);
    if (d < 0.05) return; // skip nearly transparent lines
    ctx.strokeStyle = `rgba(${G}, ${G}, ${G}, ${d.toFixed(2)})`;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // Startup
  d.readyState === 'complete' ? setup() : w.addEventListener('load', setup, false);
})(document, window, Math);
