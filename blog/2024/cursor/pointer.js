var canvas = null  // canvas element
var ctx    = null  // drawing context
var next   = null  // current pointer position {x, y}
var prev   = null  // previous pointer position {x, y}
var frame  = null  // ID of the requested animation frame
const cursors = {} // collection of cursors
const lookup  = {} // cursor for specific elements on the page (TODO: LRU?)

function newCursor(name, dx, dy, dt) {
	return new Promise((resolve, reject) => {
		let img = new Image()
		img.src = `${name}.png`
		let draw = ctx => {
			ctx.rotate( dt )
			ctx.drawImage(
				img, 0, 0, img.width, img.height, -dy, -dx, img.width, img.height,
			)
		}
		img.onload = e => resolve( draw )
		img.onerror = e => reject( e )
	})
}

async function init() {
	cursors['default'] = await newCursor('default', 10, 10, 5 * Math.PI / 8)
	cursors['pointer'] = await newCursor('pointer', 10, 26, Math.PI / 2)
	// TODO: data uri?

	canvas = document.createElement('canvas')
	Object.assign(canvas.style, {
		position: 'fixed',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		pointerEvents: 'none',
	})
	document.body.append(canvas)
	resize()
	ctx = canvas.getContext('2d')
}

function resize() {
	let rect = canvas.getBoundingClientRect()
	canvas.height = rect.height
	canvas.width = rect.width
}

function draw() {
	if ( !ctx || !prev || !next ) {
		console.log('something is null, skipping render')
		prev = next
		return
	}

	let drawCursor = getCursorDrawer( next.t )

	// delta between previous and next events
	let dy = next.y - prev.y
	let dx = next.x - prev.x
	let hypot = Math.hypot( dy, dx )
	let angle = Math.atan2( dy, dx )
	if ( hypot == 0 ) return // ESCAPE: nearby mouse moves need no render update
	if ( hypot <= 0 ) console.error('hypot is negative') // logical assertion

	// Convert length of the mouse move to adjust the moving weighted average.
	// Kinda like having the "force" being scaled based on the length of a lever arm.
	let strength = Math.min( hypot / 20, 1 ) // cap ratio to 1
	angle = movingAverage( angle, prev, strength )
	prev = { a: angle, ...next } // remember for next time

	ctx.clearRect( 0, 0, canvas.width, canvas.height )
	ctx.save()
	ctx.translate( next.x, next.y )
	ctx.rotate( angle )
	drawCursor( ctx )
	ctx.restore()

	// debugging circle
	ctx.beginPath()
	ctx.arc(next.x, next.y, 10, 0, 2*Math.PI)
	ctx.stroke() //*/
}

function getCursorDrawer(target) {

	// short circuit for previously seen elements
	if ( lookup.hasOwnProperty( next.t ) ) {
		return cursors[ lookup[ next.t ] ]
	}

	// determine the cursor for a given element
	// WARNING: getComputedStyle won't work once the cursor is none
	document.documentElement.style.cssText = 'cursor: default !important'
	let style = window.getComputedStyle(next.t)['cursor']
	document.documentElement.style.cssText = 'cursor: none !important'
	
	// do we need to do per-element overrides?
	if ( window.getComputedStyle(next.t)['cursor'] != 'none' ) {
		next.t.style.cssText = `cursor: none !important`
	}

	if (!cursors.hasOwnProperty(style)) {
		console.error(`unknown cursor type: ${style}`)
		style = 'default'
	}
	lookup[ next.t ] = style // remember computed styles
	return cursors[ style ]  // getting draw function
}

function movingAverage(angle, prev, smoothing) {
	if ( !prev.hasOwnProperty('a') ) return angle // EDGE CASE: first draw (no prev angle)

	// now... motion smooth previous angle with desired angle
	// WARNING: traditional smoothing doesn't work due to mod 2-pi
	// https://stackoverflow.com/a/491784
	// create unit vectors + add their components + calculate the smoothed angle
	let nx = Math.cos( angle ) * smoothing
	let ny = Math.sin( angle ) * smoothing
	nx += Math.cos( prev.a ) * (1 - smoothing)
	ny += Math.sin( prev.a ) * (1 - smoothing)
	return Math.atan2( ny, nx )
}

document.addEventListener('mousemove', e => {
	next = { x: e.clientX, y: e.clientY, t: e.target } // a is "angle"
	frame = requestAnimationFrame( draw )
})
document.addEventListener('mouseleave', e => { // clear + stop drawing
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	prev = null
	cancelAnimationFrame( frame )
})
window.addEventListener('resize', resize)

function ready( fn ) {
	if ( document.readyState !== 'loading' ) fn()
	else document.addEventListener('DOMContentLoaded', fn)
}
ready( init )
