package wiki

// based on https://en.wikipedia.org/wiki/Quadtree

// XY is a coordinate object that represents a point.
type XY struct {
	x, y float64
}

// AABB is an Axis-aligned bounding box.
type AABB struct {
	center  XY
	halfDim float64
}

// QuadTree ...
type QuadTree struct {
	boundary AABB

	points         []XY
	nw, sw, ne, se *QuadTree
}
