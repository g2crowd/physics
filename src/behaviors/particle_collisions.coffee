do (p = Physics, b = Physics.Behavior) ->
  class b.ParticleCollisions
    constructor: (opts = {}) ->

    update: (bodies) ->
      @testCollisions body, bodies for body in bodies

    testCollisions: (body, bodies) ->
      return if body.ethereal

      for other in bodies when body != other && !other.ethereal
        @correctPerfectOverlays body, other

        if collisionVector = p.collisions.collide body, other
          @handleCollision body, collisionVector, other

    handleCollision: (body, collisionVector, other) ->
      @correct body, other, collisionVector

    correct: (a, b, collisionVector) ->
      a.translate collisionVector.scale(0.5)
      b.translate collisionVector.scale(-1)

    correctPerfectOverlays: (a, b) ->
      if a.occupiesSameSpaceAs b
        angle = Math.random() * 2 * Math.PI
        force = new p.Vector(Math.cos(angle), Math.sin(angle)).scale(a.rightEdge() - a.leftEdge())
        a.applyForce force
