do (p = Physics) ->
  class p.Particle
    constructor: (@x, @y, velocity, acceleration) ->
      @position = new p.Vector(@x, @y)
      @velocity = velocity || new p.Vector(0, 0)
      @acceleration = acceleration || new p.Vector(0, 0)

    applyForce: (vector) ->
      @acceleration.add vector

    move: (friction = 1) ->
      @velocity.add @acceleration
      @velocity.scale friction
      @position.add @velocity
