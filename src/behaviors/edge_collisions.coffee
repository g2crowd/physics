do (p = Physics, b = Physics.Behavior) ->
  class b.EdgeCollisions
    constructor: (@restitution = 0.5) ->

    update: (bodies, world) ->
      bounds = world.boundingBox
      @testCollisions body, bounds for body in bodies

    testCollisions: (body, bounds) ->
      if collisionVector = p.collisions.outOfBounds(body, bounds)
        @handleCollision body, collisionVector

    handleCollision: (item, collisionVector) ->
      item.translate collisionVector
      if collisionVector.x != 0
        item.velocity.x *= -@restitution
      if collisionVector.y != 0
        item.velocity.y *= -@restitution
