---
layout: post
title: Dots QuadTree
categories:
- Projects
- Javascript
- Data Structure
tags:
- tree
- javascript
---
Some of you may have noticed the background of this website and how it kinda looks like animated clusters of stars.
This is a project I have been tinkering with for a while as a way to play around with `Canvas`, data-structures and performance optimization techniques.
Over this post, I will introduce this project, walk through a few versions of it, and show how it has improved over time.

<!--more-->

Before I go to far, I should note this background is visually inspired by a few banners that were popular a in the 20-teens which were primarily driven by Vincent Garreau's [particles.js](http://github.com/VincentGarreau/particles.js).
I realize this is not the most popular effect anymore and it might be removed from the site eventually (possibly following in the footsteps of the great [Paul Irish](https://www.paulirish.com/2010/my-harmonious-background-canvas/)).
As such, I figured I should write something quick to allow the project to live beyond todays current stylistic choices and maybe provide some educational insight to a few of my peers.
Quick disclaimer though, I am a terrible author, so any editing or modifications are welcome by pull request on [GitHub](https://github.com/bign8/bign8.github.io).
Also, I touch on "Big-O" notation here, if your a little rusty on that, checkout the [Wikipedia on Big O notation](https://en.wikipedia.org/wiki/Big_O_notation).

### Table Of Contents

* [Initial Design](#initial-design)
* [Quad Trees](#quad-trees)
* [Resource Pooling + Buffers](#resource-pooling--buffers)
* [Rendering in a Worker](#rendering-in-a-worker)
* [Updating instead of Rebuild](#updating-instead-of-rebuild)
* [Future Work](#future-work)
* [Conclusion](#conclusion)

### Initial Design

This was a while ago, so I'm going to keep it short and sweet.
I remember browsing a few sites and running across a banner image that had an animated network that you could interact with.
The site has long since disappeared and/or been updated, but I still remember that it being visually interesting.
After some research, I found their UI was driven by Vincent Garreau's [particles.js](http://github.com/VincentGarreau/particles.js) which seemed to do pretty much everything that was desired.
But, I wanted to learn and see how it worked, not just import a library, so I started a small sub-project called `dots` to try and play around with those things.

My initial implementation was just to get things ascetically to the point I wanted.
For this implementation, each `Dot` had a `position` and a `velocity` (something drilled into you by [The Coding Train](https://www.youtube.com/channel/UCvjgXvBlbQiydffZU7m1_aw) and his physics simulations).
Then each render frame, a `Dot` updated their `position` based on `velocity`, some bounce logic then ran to make sure the dots would stay on the screen.
Since all dots have to be updated each frame no matter what, this is considered a `O(n)` (pronounced "big-oh of n"), which is also known as linear time.
This means as the number of points grew in the system, the amount of time spent on updating them, would grow linearly with the number of dots in the system.

```js
this.position.add(this.velocity)
// <bounce logic removed for brevity>
ctx.beginPath()
ctx.arc(this.position.x, this.position.y, this.size, 0, PHI)
ctx.fill()
```

This was enough to get a starry night sky, but I wanted a bit of a network that would grow through the points.
To solve this naively, for each node, iterate the other nodes and see if any are close enough (within a threshold) to draw a line to.
This solution ended up being `O(n²)` (pronounced "big-oh of n-squared"), which is also known as polynomial time.
Generally speaking, folks look for better solutions than this because it means as the size of the problem grows, it becomes more difficult to process quicker than the rate by which it grows.

```js
for (let start of dots)
    for (let end of dots)
        if (distance(start, end) < threshold)
            drawLine(start, end)
```

All told, this was enough for a visual demonstration of what I was going for, even though the processing time of each frame was `O(n²)`.
I was able to choose a low enough `n` that this didn't seem to send my computer to space every time the page was loaded, so I shipped the first version like that.

After leaving the initial design on my site for quite some time, I started to get asked about it during interviews.
Folks wondering if I did anything smart to make it preformat enough to run in the browser or anything special to make it scale.
At the time, I had not, but after thinking about it for a while, I stumbled across a data-structure that could help the dots system scale to large values of `n`.


### Quad Trees

Quad Trees are a data-structure that allows efficient querying of neighbors based on the spacial relation to neighboring nodes.
Similar to how binary-trees have left and right children, Quad trees have 4 children, representing: top-left, top-right, bottom-left and bottom-right quadrants for a given cell.
Using this structure, nodes are stored on branches of the tree that are near one another.
With this property, the search space can be greatly reduced for each Dot when drawing lines between them!
For a much better explanation, checkout [Quadtree on Wikipedia](https://en.wikipedia.org/wiki/Quadtree); They have pseudoscope and everything already there!
Now for the alterations between their suggested design and mine.

The Wikipedia page references using AABB or "Axis Aligned Bounding Boxes", which work great in square use cases.
The AABB stores a center point and the "half-dimension" or the "radius" of the box.
This works great for square QuadTrees but, I don't think many users of my site have perfectly square browsers, so I need to store both half-width and half-height dimensions.
This changes some of the contains logic to be slightly more complicated, but nothing some entry-level geometry couldn't handle.

Once we had a quad tree, it was easy to query for each point to determine whose neighbors were candidates to be close enough to draw a line to.
Thats right, QuadTrees usually just return quads that intersect a query range, and the user has to verify the distances between candidates and subject directly.
I updated my implementation to handle this logic for us, but it's worth noting that there is "some" additional cost needed to verify candidates.

Another problem, was that once a quad tree existed, it was only really good for a frame, because once all the points move, it means they could be in a new quad next frame.
I explore ways to improve this later in the article, but at this point, I would just rebuild the quad each frame, and run the query on each point.
This "sounds" bad, but after analyzing the big-O, it's still better than polynomial time.
"But Nate, how bad is it?"

Alright, since we rebuild the tree on every frame, we perform an insert `O(log(n))` (Logarithmic time) for each node `n`, which gives `O(n) * O(log(n)) = O(n*log(n))` (Log-Linear complexity).
Querying the quad tree is another `O(log(n))` range query for each node, producing another `O(n*log(n))` (Log-Linear complexity).
And as we stated before, the update takes `O(n)` time, but since Log-Linear complexity dominates Linear complexity (denoted `O(n*log(n)) >> O(n)`) only the dominating factors are reported.
Adding it all together, in the distilled Big O Notation, the resulting algorithm is `O(n*log(n))`, but slightly expanded is actually: `2 * O(n*log(n)) + O(n)`.
While being better than polynomial time, there are a few large constant factors in there that could make things eventually drag as the size of the system grows (we will look to improve this shortly).
But first, since we are completely destroying the quad tree every frame, there is quite a bit of garbage that is generated, which we will look to improve in the next section.


### Resource Pooling + Buffers

Once all this was built, I did some profiling and I noticed quite a bit of memory was being allocated each frame.
This was because between frames, all the created quad nodes would be discarded as a new tree was created.
While most garbage collectors can handle this fine, I always feel a little bad just allocating memory for the heck of it.
So, I decided to start using a QuadTree Node [Pool](https://en.wikipedia.org/wiki/Pool_(computer_science)) so nodes could be recycled and re-used between frames.
With this logic, at the end of each frame, I cleared the contents of the node of dangling pointer (another possible memory leak) and stored the data on a buffer.
These can be implemented rather easily as an Array of nodes that are ready for use, I just added a `recycle` function on the QuadTree so all the trees nodes could be used when rebuilding from scratch.

```js
recycle() {
    QuadTree.pool.push(this)
    this.idx = 0 // array stays allocated, but points inside it are ignored
    if (!this.nw) return
    this.nw.recycle()
    this.ne.recycle()
    this.sw.recycle()
    this.se.recycle()
    this.nw = null
    this.ne = null
    this.sw = null
    this.se = null
}
```

Additionally, I noticed quite a bit of arrays were getting allocated and cleared.
So to fix that, I fixed the size of `points` arrays within the QuadTree nodes, since they will never hold more points than the system compiled limit of points per node.
And I created a buffer object that would re-use an underlying array, and grow it when necessary.

```js
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
```

Just to verify this was actually behaving as expected, I ran a profile against the old version and the pooled version of the quad tree.
And, as expected the growth in the JS heap went down significantly between frames!

| Branch | JS Heap Growth / Frame |
|--------|-----------------------:|
| master |        847,384         |
| pools  |         70,256         |
|--------|------------------------|
| % diff |            -91.7091%   |

Quick side note here, while this doesn't show up in the Time Complexity portion of the Big-O notation analysis, this would show up in the Space Complexity analysis.
This is slightly harder to argue for me, as I don't have a ton of history in this space, but...
Allocating the QuadTree on each frame resulted in a Space Complexity of `O(n/|QuadTree|)` where `|QuadTree|` is the limit to the number of points stored on a node in the quad tree.
Technically, `|QuadTree|` is fixed, so it can be excluded, but I think it's nice to get at least one layer of those constant factors to get a feeling that it's not AS BAD as `O(n)`.
Alright, After using resource Pooling, we can use an Amortized analysis, which looks at multiple invocations of the system to determine the "average" complexity.
Once the Quads have been created initially, since they are then recycled via the Pool, new nodes don't need to be created unless more than `|QuadTree|` Dots get too close together (happens, but is rare).
Thus, we get an Amortized Space Complexity Analysis of `O(1)` per frame, but still an overall space complexity of `O(n/|QuadTree|)`.
Overall, we still need the same amount of space, but we aren't re-allocating it each frame, which mean we are now friends again with the Garbage Collector! :yay:
(Sorry, this is a fun one to try an explain; reminder, contributions welcome)


### Rendering in a Worker

Alright, this one is kinda cool, because newer browsers started supporting `Worker` threads and `OffscreenCanvas`.
This means that instead of using the same thread that the browser is using to draw and update the screen for regular JS programs, we can draw the whole thing, in a `Worker` thread!
This frees the main-thread for other user tasks like rendering the [blog calender](/blog/2014/javascript-calendar.html).
I'll let the [Chrome](https://developers.google.com/web/updates/2018/08/offscreen-canvas) and [Mozilla](https://hacks.mozilla.org/2016/01/webgl-off-the-main-thread/) experts take the beef of this section, but... it's cool!
Furthermore, these changes move the primary render frame updates to a worker!

```js
// In script.js
let worker = new Worker('/dots.js', {name: 'dots'})
let message = {type: 'init'}
message.canvas = document.querySelector('canvas').transferControlToOffscreen()
worker.postMessage(message, [message.canvas])

// In dots.js
self.onmessage = message => {
	switch (message.data.type) {
		case 'init':
			console.log(self.name, 'got a sweet canvas', message.data.canvas)
		default:
			console.warn(self.name, 'received unknown message', message.data)
	}
}
```

Luckily, I don't do a ton of heavy work on the main thread anyway, but this makes sure that if I ever needed to, the dots background won't slow down the rest of the site.


### Updating instead of Rebuild

After watching the QuadTree with the debugger enabled, it finally dawned on me that a majority of the Quads will be staying the same from frame to frame.
After running a few tests, I found that between 0 and 10 Quads would be updated on any given frame (during normal operation).
Thus, to save a bit of time re-building the tree constantly, this change adds the ability to update points within the tree.

After reviewing the logic, there are two parts to this operation:

1. find the associated quad for a given dot
2. remove the dot from it's current quad
3. place the dot back into the tree

To be able to find a given quad from a dot, I added a pointer to the dot object that points to the quad that it's currently housed in.
This is used when dots are being iterated from the dots array and not as children of the quad tree.
A future refactor of this could move to a tree traversal based iteration of all the nodes instead of maintaining a separate array of all the dots on the screen.

To remove the dot from it's current node, `update` first removes the dot from it's points array (a constant sized buffer) and then determines if the node is empty.
If the quad is empty, it notifies it's parent of the situation, which can then merge it's 4 child quads into itself if the quad capacity is not exceeded when doing so.
This also allows all the children to be recycled for future use.
A few edge cases here that were just ignored and the process exits out early.
A side effect of this is that the quads now hold full dots rather than just their position so as quads are rebalanced, we can update dot's quad pointers appropriately.

To place the dot back into the tree, I just did the full quad insert starting from the root of the tree.
An alternative approach could have the quad call out to it's parent until the quad contains the dot, and then adding the dot to that quad (recursively).
Given the shallow depth of the trees in this scenario (from 4-7) depending on resolution, the overall distance traveled by these updates would be the same in big-O notation.
A few nuances here about the constant factor being removed, but since data locality isn't a problem (often seen in DBs), a re-insert from the root is fine.

As stated earlier, the full rebuild cost is `2 * O(n*log(n))`, where doing just these updates is around `O(10*log(n))` where 10 is the most Dots in a single frame that needed updating.
And again, yes, I'm aware the 10 does usually get ignored in Big-O notation, just trying to show that it's way better than before, even with the constant factors!

As for the code, it's chilling on the website your looking at, so check it out for the dirty details!


### Future Work

This has been a super fun project to tinker with as well as an awesome learning opportunity for some of these less-frequently-used data-structures.
I always am on the lookout for more fun things to try and experiment with on projects like these, so here are a few bullet points for future me to worry about.

* Remove the need for a Vector, just have a Dot be `x`, `y`, `vx`, `vy`, `idx` and `quad` and have `show` and the `constructor` do the real work. (it was nice for re-use and interfaces, but might be easier for...)
* WASM! Most of the logic is numbers based, see if you can write the QuadTrees [using hand-written WAT](https://blog.scottlogic.com/2018/04/26/webassembly-by-hand.html) (or be lame and compile to WASM from a higher level language.)
* Instead of updating from the root, experiment with walking back up the quad tree.
* GPU performance improvements.  IDK what to do here really, but when the node count gets high, the GPU rendering time gets really high, see if we can fix that!
* Real time velocity calculations.  Right now, each frame is adding a constant vx and vy to each dots position, to be "real time correct" this should be scaled by the difference in actual time between the frames.
* Middle node attempt merge, (for a non-leaf node, see if we can attempt a recursive merge... very rare [see debug logs], but is possible)


### Conclusion

So, in the end, what does all this mean?
Well, that is the age old question.
In this case, it means I can take an idea, rough something out to demonstrate value quickly, then iterate on a solution until it can work at scale.
If that sounds interesting to your organization, let's chat!

{% include contacts.html %}

Oh, and for your viewing pleasure, here is a full page block for your background viewing pleasure.

<div style="height:100vh"></div>