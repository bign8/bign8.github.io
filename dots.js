// Author: Nate Woods
// Based on: http://github.com/VincentGarreau/particles.js
// Quad-Trees: https://en.wikipedia.org/wiki/Quadtree

"use strict";

self.onmessage = message => {
	switch (message.data.type) {
		case 'init':
			init(message.data.canvas)
			// fallthrough (init passes resize data)
		case 'resize':
			resize(message.data.height, message.data.width)
			break
		case 'click':
			spawn(message.data.x, message.data.y)
			break
		case 'stop':
			dead = true
			break
		default:
			console.warn('Worker received unknown message', message.data)
	}
}

const R = 75,        // radius of interacting lines
	RR = R*R,        // R squared (easier hypot calculations)
	PHI = 2*Math.PI, // physicists rejoyce!
	G = 150,         // the darkest shade of gray
	GS = `rgb(${G}, ${G}, ${G})`; // gray of a dot

var CAP = 4,     // max number of points per node (resize can adjust this)
	dots = [],   // Each point that is rendered
	ctx, canvas, // html5 canvas and 2d drawing context
	kill, dead;  // dom button and boolean toggle for killing script.

// Map converts n on the scale [a, b) to the scale [c, d).
const map = (n, a, b, c, d) => ((n-a)/(b-a))*(d-c)+c;

// Math.hypot, but wihout the square root (Math.hypot leaks memory)
const hypot = (a, b) => a * a + b * b

// Buffer allows some pre-allocation of an array that can grow, but maintains array over time
// Data: name, array, length
class Buffer {
	constructor(name, n) { this.name = name, this.arr=new Array(n), this.length=0 }
	reset() { this.length=0; return this }
	push(o) {
		// if we don't have space, double the underlying buffer (base2 growth)
		if (this.length >= this.arr.length) {
			this.arr = this.arr.concat(new Array(this.arr.length))
			console.debug('Growing', this.name, 'Buffer', this.arr.length)
		}
		this.arr[this.length] = o
		this.length++
	}
	pop() {
		if (!this.length) return undefined
		this.length--
		return this.arr[this.length]
	}
}

// Vector is a 2-3 dimensional point class.
// Data: x, y, z
class Vector {
	constructor(x, y, z) { this.x = x, this.y = y, this.z = z; }
	add(v) { this.x += v.x || 0, this.y += v.y || 0, this.z += v.z || 0; }
	mult(n) { this.x *= n || 0, this.y *= n || 0, this.z *= n || 0; }
	static random2D() {
		let angle = Math.random()*PHI;
		return new Vector(Math.cos(angle), Math.sin(angle), 0);
	}
}

// QuadTree based on psuedocode from https://en.wikipedia.org/wiki/Quadtree
// Data: x, y, w, h, List<*Points>[NODE_LIMIT], parent-pointer
class QuadTree {
	static debug = false // can be modified by the dev console
	static pool = new Buffer('QuadTree', 32) // buffer of objects to construct from
	constructor(x, y, w, h) { this.points=new Array(CAP), this.reset(x, y, w, h) }
	reset(x, y, w, h) { this.x=x, this.y=y, this.w=w, this.h=h, this.idx=0; return this }
	subdivide() {
		w2 = this.w/2, h2 = this.h/2;
		this.nw = QuadTree.make(this.x-w2, this.y-h2, w2, h2);
		this.ne = QuadTree.make(this.x-w2, this.y+h2, w2, h2);
		this.sw = QuadTree.make(this.x+w2, this.y-h2, w2, h2);
		this.se = QuadTree.make(this.x+w2, this.y+h2, w2, h2);
		this.nw.parent = this
		this.ne.parent = this
		this.sw.parent = this
		this.se.parent = this
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
		if (this.nw) this._recycle()
	}
	_recycle() {
		this.nw.recycle()
		this.ne.recycle()
		this.sw.recycle()
		this.se.recycle()
		this.nw = null
		this.ne = null
		this.sw = null
		this.se = null
	}

	// Does this rectangle contain a given point. Arg: point vector.
	contains(pt) { return this.x - this.w <= pt.x && this.x + this.w >= pt.x && this.y - this.h <= pt.y && this.y + this.h >= pt.y; }

	// Does a circle intersect with this Rectangle? Arg: center vector.
	intersects(c) { return this.x - this.w <= c.x + R && this.x + this.w >= c.x - R && this.y - this.h <= c.y + R && this.y + this.h >= c.y - R; }

	// Does a circle contain a point. Args: center vector, point vector.
	near(c, p) { return hypot(c.x - p.x, c.y - p.y) <= RR; }

	// Insert point into quadtree
	add(p) {
		if (!this.contains(p.position)) return false // not my problem
		if (this.idx < CAP) return this._add(p) // add the node to ourselves
		if (!this.nw) this.subdivide(); // initialze sub-components
		return this.nw.add(p) || this.ne.add(p) || this.sw.add(p) || this.se.add(p) // defer to children
	}
	_add(p) {
		this.points[this.idx] = p
		this.idx++
		p.quad = this // link the quad to the point (for direct updating)
		return true
	}

	// Update a node within a given quad tree
	update(p) {
		if (this.contains(p.position)) return // still here

		// Remove the node from myself by shifting trailing nodes in-place
		// this.points = this.points.filter(o => o.position.z != p.position.z) // logically what the below code would be doing if we didn't have buffers
		e = p.position.z
		var found = false
		for (i = 0; i < this.idx; i++) {
			if (this.points[i].z == e) {
				found = true
				continue
			}
			if (found) this.points[i-1] = this.points[i]
		}
		this.points[this.idx] = null // not needed, but useful for debugging
		this.idx--

		// Re-insert p from the root, should be the same big-O time scale, but might not "technically" be optimal
		quad.add(p)
		if (this.idx != 0) return // there are still peers on this node, exit normally
		this.points[0] = null // we wern't able to reset the points array properly above (Again, not needed, but nice for debugging)

		// Middle node in the tree has emptied, can try and notify children to merge up? (see how often this occurs and maybe implement)
		if (this.nw) {
			console.debug('middle node: attempt a merge?')
			return // not quite sure what to do here....
		}
		this.parent._update()
	}
	_update() {
		let count = this.idx + this.nw.idx + this.ne.idx + this.se.idx + this.sw.idx
		if (count > CAP) return // too large to merge into one node

		// pull all child pointers onto myself
		for (i = 0; i < this.ne.idx; i++) this._add(this.ne.points[i])
		for (i = 0; i < this.nw.idx; i++) this._add(this.nw.points[i])
		for (i = 0; i < this.se.idx; i++) this._add(this.se.points[i])
		for (i = 0; i < this.sw.idx; i++) this._add(this.sw.points[i])

		// relieve children of their burden
		this._recycle()
	}

	// QuadTree based on psuedocode from https://en.wikipedia.org/wiki/Quadtree
	ask(c, list) {
		if (this.intersects(c)) {          // if we are worried about this point
			for (i = 0; i < this.idx; i++) // iterate over the points we have and...
				if (this.near(c, this.points[i].position)) list.push(this.points[i].position) // check if it's near
			if (this.nw) list = this.se.ask(c, this.sw.ask(c, this.ne.ask(c, this.nw.ask(c, list)))); // or if kids have it
		}
		return list;
	}

	// visualize what is going on with the quads
	render() {
		if (!QuadTree.debug) return
		if (this.nw) {
			this.nw.render()
			this.sw.render()
			this.ne.render()
			this.se.render()
			return
		}
		ctx.strokeStyle = 'rgba(255,0,0,0.25)'
		ctx.strokeRect(this.x-this.w, this.y-this.h, this.w*2, this.h*2)
	}
}

// Dot is a visible point with velocity and position vectors.
// The Z of the position vector is the index/identifier within the dots array.
// Data: X, Y, VX, VY, IDX, SIZE, quad-pointer
class Dot {
	constructor(idx) {
		this.position = new Vector(Math.random()*canvas.width, Math.random()*canvas.height, idx);
		this.velocity = Vector.random2D();
		this.velocity.mult(Math.random()+0.2);
		this.size = Math.random()+1;
	}
	show() {
		this.position.add(this.velocity);

		// Absolute values allow for resizes, pushing particles back into view
		if      (this.position.x <= this.size) this.velocity.x = Math.abs(this.velocity.x);
		else if (this.position.y <= this.size) this.velocity.y = Math.abs(this.velocity.y);
		else if (this.position.x >= canvas.width-this.size) this.velocity.x = -Math.abs(this.velocity.x);
		else if (this.position.y > canvas.height-this.size) this.velocity.y = -Math.abs(this.velocity.y);

		// Draw Circle
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.size, 0, PHI);
		ctx.fill();

		// tell the quad-tree to update my position in it
		this.quad.update(this)
	}
}

function resize(height, width) {
	canvas.height = height;
	canvas.width = width;

	// Grow the number of dots if size permits
	let density = Math.floor(height * width / 1e4)
	for (var i = dots.length; i < density; i++) dots.push(new Dot(dots.length));
	CAP = Math.ceil(Math.max(4, Math.log(density))) // danymically size nodes to keep semi-consistent depth of tree

	// rebuild quad tree from scratch
	if (quad) quad.recycle()
	quad = QuadTree.make(width/2, height/2, width/2, height/2) // center point and half width/height
	quad.parent = quad // fun null-pointer work-around
	for (p of dots) quad.add(p)
}

// Instead of flooding dot creation, this just re-positions 4 dots to the cursor postion
function spawn(x, y) {
	for (var i = 0; i < 4; i++) {
		let dot = dots[Math.trunc(Math.random() * dots.length)]
		dot.position.x = x
		dot.position.y = y
	}
}

function init(c) {
	canvas = c
	ctx = canvas.getContext('2d');
	ctx.lineWidth = 0.5; // for lines
	requestAnimationFrame(draw);
}

// vars used in draw every time
var w2, h2, quad, p, q, e, i, buffer = new Buffer('Query', 32);

function draw_dots() {
	// Drawing + Updating Circles: O(n)
	for (p of dots) p.show()
}

function draw_lines() {
	// Drawing Lines: Worst = O(n*n), Average = O(n*log(n)), Best = O(n)
	for (p of dots) {                         // for all dots
		quad.ask(p.position, buffer.reset())  // ask for peers within blast radius
		for (i = 0; i < buffer.length; i++) { // find neighbors : dist(p, q) <= R
			q = buffer.arr[i]                 // store peer as q
			if (q.z > p.position.z)           // with index later than my own
				line(p.position, q);          // draw a line between them
		}
	}
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = GS

	// if we have died, clean up after ourselves
	if (dead) {
		dots = null;
		close()
		return;
	}

	// Drawing with functions to show up in profileers
	draw_dots()
	draw_lines()
	quad.render()

	// redo the animation rendering
	requestAnimationFrame(draw);
}

// Precompute some gray strings (Question: do we need 100 grays?)
var GRAYS = [];
for (i = 0; i < 100; i++) GRAYS.push(`rgba(${G}, ${G}, ${G}, ${i/100})`)

function line(a, b) {
	e = hypot(b.x-a.x, b.y-a.y);
	e = map(e, 0, RR, GRAYS.length, 0);
	if (e < 5) return; // skip nearly transparent lines
	ctx.strokeStyle = GRAYS[Math.trunc(e)]
	ctx.beginPath();
	ctx.moveTo(a.x, a.y);
	ctx.lineTo(b.x, b.y);
	ctx.stroke();
}
