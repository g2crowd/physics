do (p = Physics, b = Physics.Behavior) ->
  class b.ParticleCollisions
    constructor: (opts = {}) ->

    update: (bodies) ->
      @testCollisions body, bodies for body in bodies

    testCollisions: (body, bodies) ->
      return if body.ethereal

      for other in bodies when body != other && !other.ethereal
        if collisionVector = p.collisions.collide body, other
          @correct body, other, collisionVector

    correct: (a, b, collisionVector) ->
      if @firm
        a.translate collisionVector.scale(0.5)
        b.translate collisionVector.scale(-1)
