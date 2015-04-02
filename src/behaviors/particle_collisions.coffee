do (p = Physics, b = Physics.Behavior) ->
  class b.ParticleCollisions
    constructor: (opts = {}) ->
      {@firm, @restitution} = opts
      @restitution ||= 10

    update: (bodies) ->
      @testCollisions body, bodies for body in bodies

    testCollisions: (body, bodies) ->
      return if body.ethereal

      for other in bodies when body != other && !other.ethereal
        @correctPerfectOverlays body, other

        if collisionVector = p.collisions.collide body, other
          @handleCollision body, collisionVector, other

    handleCollision: (body, collisionVector, other) ->
      if @firm
        @bounceOff body, other, collisionVector
      else
        # will be applied on both sides of collision
        body.applyForce collisionVector.scale(@restitution)

    bounceOff: (a, b, collisionVector) ->
      a.translate collisionVector.scale(0.5)
      a.applyForce collisionVector
      b.translate collisionVector.scale(-1)
      b.applyForce collisionVector

      if collisionVector.x != 0
        a.velocity.x *= -@restitution
        b.velocity.x *= -@restitution
      if collisionVector.y != 0
        a.velocity.y *= -@restitution
        b.velocity.y *= -@restitution

    correctPerfectOverlays: (a, b) ->
      if a.occupiesSameSpaceAs b
        angle = Math.random() * 2 * Math.PI
        force = new p.Vector(Math.cos(angle), Math.sin(angle)).scale(a.rightEdge() - a.leftEdge())
        console.log(force)
        a.applyForce force
