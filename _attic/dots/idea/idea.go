package idea

var (
	bounds = point{100, 100} // size of the bounding window
	memory []*page           // actual offset into memory
	root   pointer           // point to root page and root node

	// output (points allocated by javascript, lines allocated by this)
	pointArray [][2]uint16 // tuples of points x,y shared with environment

	// page this response to fixed length array and allow multiple next() calls to update
	linesArray []struct { // line pairs and opacity at which they should be drawn
		a, b    point
		opacity uint8
	}

	// canvas  js.Value // TODO: keep reference on the environment injection side
	// ctx     js.Value // TODO: keep reference on the environment injection side
)

type pointer struct { // 4 bytes
	value uint32
	// 5 bits for node pointer = 32
	// 26 bits for page pointer
	// 1 bit for null
}

// page holds 255 quad tree nodes, and manages them for reuse
type page struct {
	freeMask uint32   // bitmask of free nodes
	nodes    [32]node // max 254
}

type node struct {
	parent   pointer
	center   point
	bounds   point
	values   [4]dot
	children [4]pointer
}

type dot struct { // 8 bytes
	position point
	velocity point
}

// physical points, from -32768 to +32768
type point [2]int16 // 4 bytes
