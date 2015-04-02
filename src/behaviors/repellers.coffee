do (p = Physics, b = Physics.Behavior) ->
  class b.Repellers
    constructor: (@particles, opts = {}) ->
      {@strength, @distance} = opts

    add: (body) ->
      @particles.push body
      body

    update: (bodies) ->
      @repelClose repeller, bodies for repeller in @particles

    repelClose: (repeller, bodies) ->
      center = repeller.center()

      for other in bodies when other != repeller && !other.ethereal
        @correctPerfectOverlays(repeller, other)
        otherCenter = other.center()
        if (range = center.distanceTo otherCenter) <= @distance
          other.applyForce center.vectorTowards(otherCenter).scale(@strength)

    correctPerfectOverlays: (a, b) ->
      if a.center().x == b.center().x && a.center().y == b.center().y
        angle = Math.random() * 2 * Math.PI
        force = new p.Vector(Math.cos(angle), Math.sin(angle)).scale(a.rightEdge() - a.leftEdge())
        a.applyForce force
