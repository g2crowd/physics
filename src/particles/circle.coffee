do (p = Physics) ->
  class p.Circle
    constructor: (x, y, @radius) ->
      @particle = new p.Particle x, y

    position: ->
      @particle.position

    acceleration: ->
      new p.Vector(0, 0) if @frozen
      @particle.acceleration

    velocity: ->
      new p.Vector(0, 0) if @frozen
      @particle.velocity

    applyForce: (vector) ->
      @acceleration().add(vector)

    frozen: false

    collidesWith: (circle) ->

    move: (args...) ->
      return if @frozen
      @particle.move(args...)

    distanceTo: (other) ->
      left = @position()
      right = other.position()

      Math.sqrt (left.x - right.x) * (left.x - right.x) + (left.y - right.y) * (left.y - right.y)

    vectorTowards: (other) ->
      new p.Vector(@position().x - other.position().x,
                   @position().y - other.position().y).normalized()
