do (p = Physics) ->
  class p.Particle
    constructor: (@x, @y, velocity, acceleration) ->
      @position = new p.Vector(@x, @y)
      @velocity = velocity || new p.Vector(0, 0)
      @acceleration = acceleration || new p.Vector(0, 0)

    applyForce: (vector) ->
      @acceleration.add vector

    move: (opts = {}) ->
      {friction, cap} = opts
      @velocity.add @acceleration
      @velocity.scale friction
      @velocity.normalized().scale(cap) if cap && @velocity.magnitude() > cap
      @position.add @velocity
