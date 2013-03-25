# voxel-merge

An algorithm for merging voxels into congruent, convex volumes
(rectangular prisms).


### Why?

Physics engines love convex shapes.

## Installation
Use browserify to bundle for the clientside.

```
npm install voxel-merge
```

## Example
```js

// from timoxley/voxel-real-physics
// TODO: make this better
var game = ... // VoxelJS game
var merge = require('voxel-merge')

merge(function(pos) {
	// supply a filter function
	return game.getBlock(pos) && !isProcessed(pos)
},
chunk, // the chunk to target
function(result) {
	// this callback is applies to each found convex volume
  // as they are found.

	merge.voxelsIn(result).forEach(function(pos) {
		markProcessed(pos)
	})

	// add to physics engine
	var position = result.position.map(function(v, i) {return v + result.dims[i] / 2})
	var boxShape = new CANNON.Box(new CANNON.Vec3(result.dims[WIDTH] / 2, result.dims[HEIGHT] / 2, result.dims[DEPTH] / 2))
	var box = new CANNON.RigidBody(0, boxShape)
	box.position.set.apply(box.position, position)
	self.world.add(box)

	if (!self.debug) return

	// highlight area with a wire mesh for debugging
	var mesh = new game.THREE.Mesh(
		new game.THREE.CubeGeometry(result.dims[WIDTH],result.dims[HEIGHT],result.dims[DEPTH]),
		new game.THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
	)

	chunkItems.push({
		mesh: mesh,
		body: box
	})

	box.position.copy(mesh.position)
	game.scene.add(mesh)
})

```

## Licence

MIT
