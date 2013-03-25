"use strict"

var X = 0
var Y = 1
var Z = 2

var WIDTH = 0
var HEIGHT = 1
var DEPTH = 2

var slice = Array.prototype.slice

/**
 * Like a VoxelJS chunk, but position is a Voxel number
 * offset rather than a voxelPosition / game.chunkSize.
 *
 * @api public
 */

function OffsetChunk(opts) {
	this.dims = opts.dims || []
	this.position = opts.position || [0,0,0]
}

/**
 * Positions of all the voxels in a Chunk/OffsetChunk
 *
 * Similar to game.blocks, but takes a `OffsetChunk` as generated
 * by voxelMerge.
 *
 * @return {Array} An Array of [X,Y,Z] points
 * @api private
 */

function voxelMerge(check, chunk, done) {
  var results = []
  voxelMerge.voxelsIn(chunk).forEach(function(pos) {
    var result = voxelMerge.findOne(check, pos, chunk)
    if (result) {
      done(result)
      results.push(result)
    }
  })
  return results
}

/**
 * Given a chunk, find the first contiguous
 * rectangular prism that matches `check`,
 * starting from `startPos`.
 *
 * @param {Function} check Filter function
 * @param {Array} startPos Start position in format [X,Y,Z]
 * @param {Chunk} chunk Chunk to search
 * @return {OffsetChunk}
 *
 * @api public
 */

voxelMerge.findOne = function findOne(check, startPos, chunk) {
  if (arguments.length === 2) {
    chunk = startPos
    startPos = chunk.position.map(function(v, i) {
      return v * chunk.dims[i]
    })
  }
  if (!chunk.voxels) throw new Error('Requires game chunk')

  var endPos = chunk.position.map(function(v, i) {
    return v * chunk.dims[i] + chunk.dims[i]
  })

  var box = new OffsetChunk({
    dims: startPos.map(function(v, i) {return endPos[i] - v}),
    position: slice.call(startPos)
  })

  if (!check(startPos)) {
    return false
  }
  var found = false
  for (var x = startPos[X]; !found && x < endPos[X]; x++) {
    var y = startPos[Y]
    var z = startPos[Z]
    if (check([x, y, z])) continue
		if (box.dims[WIDTH] > x - startPos[X]) box.dims[WIDTH] = x - startPos[X]
  }

	found = false
	for (var z = startPos[Z] + 1; !found && z < endPos[Z]; z++)
	for (var x = startPos[X]; !found && x < startPos[X] + box.dims[WIDTH]; x++) {
		var y = startPos[Y]
		if (check([x, y, z])) continue
		if (box.dims[DEPTH] > z - startPos[Z]) box.dims[DEPTH] = z - startPos[Z]
	}

  found = false
	for (var y = startPos[Y] + 1; !found && y < endPos[Y]; y++)
	for (var x = startPos[X]; !found && x < startPos[X] + box.dims[WIDTH]; x++)
	for (var z = startPos[Z]; !found && z < startPos[Z] + box.dims[DEPTH]; z++) {
		if (check([x, y, z])) continue
		if (box.dims[HEIGHT] > y - startPos[Y]) box.dims[HEIGHT] = y - startPos[Y]
	}

  box.dims[WIDTH] = box.dims[WIDTH] || 1
  box.dims[HEIGHT] = box.dims[HEIGHT] || 1
	box.dims[DEPTH] = box.dims[DEPTH] || 1

  return box
}

/**
 * Positions of all the voxels in a Chunk/OffsetChunk
 *
 * Similar to game.blocks, but takes a `OffsetChunk` as generated
 * by voxelMerge.
 *
 * @return {Array} An Array of [X,Y,Z] points
 * @api private
 */

voxelMerge.voxelsIn = function voxelsIn(box) {
  box = ensureBox(box)

  var points = []
  for (var x = box.position[X]; x < box.position[X] + box.dims[WIDTH]; x++)
  for (var y = box.position[Y]; y < box.position[Y] + box.dims[HEIGHT]; y++)
  for (var z = box.position[Z]; z < box.position[Z] + box.dims[DEPTH]; z++)
    points.push([x, y, z])
  return points
}

/**
 * Converts a VoxelJS chunk to a OffsetChunk if required.
 *
 * @return {OffsetChunk}
 * @api private
 *
 */

function ensureBox(chunk) {
  if (!isChunk(chunk)) return chunk
  return new OffsetChunk({
    dims: chunk.dims.map(function(v) {return v}),
    position: chunk.position.map(function(v, i) {return v * chunk.dims[i]})
  })

  function isChunk(potentialChunk) {
    return !!potentialChunk.voxels
  }
}

voxelMerge.OffsetChunk = OffsetChunk
module.exports = voxelMerge
