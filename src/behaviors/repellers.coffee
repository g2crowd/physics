do (p = Physics, b = Physics.Behavior) ->
  class b.Repellers
    constructor: (@particles, opts = {}) ->
      @setOpts opts

    add: (body) ->
      @particles.push body
      body

    setOpts: (opts) ->
      {@strength, @distance} = opts
      @distance ||= 1
      @strength ||= 0

    update: (bodies) ->
      @repelClose repeller, bodies for repeller in @particles

    repelClose: (repeller, bodies) ->
      center = repeller.center()
      diameters = @distance * repeller.width

      for other in bodies when other != repeller && !other.ethereal
        otherCenter = other.center()
        if (range = center.distanceTo otherCenter) <= diameters
          other.applyForce center.vectorTowards(otherCenter).scale(@strength * (diameters - range))
