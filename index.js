"use strict"

var X = 0
var Y = 1
var Z = 2

var WIDTH = 0
var HEIGHT = 1
var DEPTH = 2

function voxelMerge(check, startPos, chunk) {
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

  var box = {
    dims: startPos.map(function(v, i) {return endPos[i] - v}),
    position: [0,0,0]
  }
  if (!check(startPos)) {
    return false
  }
  var found = false
  for (var x = startPos[X]; !found && x < endPos[X]; x++) {
    var y = startPos[Y]
    var z = startPos[Z]
    if (!check([x, y, z])) {
      if (box.dims[WIDTH] > x - startPos[X]) box.dims[WIDTH] = x - startPos[X]
    }
  }

  var found = false
  for (var z = startPos[Z] + 1; !found && z < endPos[Z]; z++) {
    for (var x = startPos[X]; !found && x < startPos[X] + box.dims[WIDTH]; x++) {
      var y = startPos[Y]
      if (!check([x, y, z])) {
        if (box.dims[DEPTH] > z - startPos[Z]) box.dims[DEPTH] = z - startPos[Z]
      }
    }
  }

  var found = false
  for (var y = startPos[Y] + 1; !found && y < endPos[Y]; y++) {
    for (var x = startPos[X]; !found && x < startPos[X] + box.dims[WIDTH]; x++) {
      for (var z = startPos[Z]; !found && z < startPos[Z] + box.dims[DEPTH]; z++) {
        if (!check([x, y, z])) {
          if (box.dims[HEIGHT] > y - startPos[Y]) box.dims[HEIGHT] = y - startPos[Y]
        }
      }
    }
  }

  if (box.dims[WIDTH] == 0) box.dims[WIDTH] = 1;
  if (box.dims[HEIGHT] == 0) box.dims[HEIGHT] = 1;
  if (box.dims[DEPTH] == 0) box.dims[DEPTH] = 1;
  box.position[X] = startPos[X] //+ box.dims[WIDTH]
  box.position[Y] = startPos[Y] //+ box.dims[HEIGHT]
  box.position[Z] = startPos[Z] //+ box.dims[DEPTH]
  return box
}

voxelMerge.all = function(check, chunk, done) {
  var results = []
  voxelMerge.voxelsIn(chunk).forEach(function(pos) {
    var result = voxelMerge(check, pos, chunk)
    if (result) {
      done(result)
      results.push(result)
    }
  })
  return results
}

/**
 * Returns
 * Similar to game.blocks
 */
voxelMerge.voxelsIn = function voxelsIn(subChunk) {
  subChunk = ensureSubChunk(subChunk)

  var points = []
  for (var x = subChunk.position[X]; x < subChunk.position[X] + subChunk.dims[WIDTH]; x++)
  for (var y = subChunk.position[Y]; y < subChunk.position[Y] + subChunk.dims[HEIGHT]; y++)
  for (var z = subChunk.position[Z]; z < subChunk.position[Z] + subChunk.dims[DEPTH]; z++)
    points.push([x, y, z])
  return points
}



function ensureSubChunk(chunk) {
  if (!isChunk(chunk)) return chunk
  return {
    dims: chunk.dims.map(function(v) {return v}),
    position: chunk.position.map(function(v, i) {return v * chunk.dims[i]})
  }

  function isChunk(potentialChunk) {
    return !!potentialChunk.voxels
  }
}

module.exports = voxelMerge
