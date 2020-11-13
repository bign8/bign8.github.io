package raw

// Setup defines how all this is configured (probably passed via initial memory)
func Setup(numPoints, height, width, _, _, endOfMemory uint32) {

}

// Dependencies ...
func growMemory(size uint32) {

}

// Update advances all the points / updates quad tree / returns update result.
func Update(dt uint32) (start, length int) {
	return 0, 0 // pointers to a linear block of memory fro close pairs
}

var (
	// main binary memory from javascript.
	// points should be initialized within given range.
	// points velocity should be scaled using cos and sin of an angle.
	memory = []byte{}

	// field dimensions (for the edge bounce)
	// <can use globals for these>
	height = 900
	width  = 800

	// number of points from parent provider.
	// used when linearly updating points from velocity.
	numPoints = 10

	// garbage is a doubly linked ring of 4 ints [prev, XX, YY, next]
	garbage = -1 // points to un-used quadruples

	// pointer to the root of the quad tree.
	// this should be the first quad after all the points.
	tree = &node{}

	// if we need to add a node and there is no garbage...
	// we can add more quadruples to tail of memory.
	endOfMemory = 10000 // size of tree + garbage
)

func u(b []byte) uint32 {
	_ = b[3] // bounds check hint to compiler; see golang.org/issue/14808
	return uint32(b[0]) | uint32(b[1])<<8 | uint32(b[2])<<16 | uint32(b[3])<<24
}

// func f(b []byte) float32 {
// 	return math.Float32frombits(u(b))
// }

// 16 bytes for a 32 bit quad
func getQuad(off int) (a, b, c, d uint32) {
	a = u(memory[off : off+3])
	b = u(memory[off+3 : off+7])
	c = u(memory[off+7 : off+11])
	d = u(memory[off+11 : off+15])
	return a, b, c, d
}

type node struct {
	x, y, dim float32
	mode      uint32 // for byte alignment + other bits for pointer to block object

	// one or the other based on MODE of the node
	points [4]uint32 // 4 block pointing to point offsets
	quads  [4]*node  // 4 block pointing to nodes
}
