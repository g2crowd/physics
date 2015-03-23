do (p = Physics) ->
  class p.Spring
    constructor: (@left, @right, options) ->
      {@stiffness, @desiredLength, @dampening} = options

    actualLength: ->
      Math.abs @left.distanceTo(@right)

    resting: ->
      @actualLength() == @desiredLength

    stress: ->
      @actualLength() - @desiredLength

    attraction: ->
      -@stiffness * @stress()

    relativeVelocity: ->
      @left.velocity().copy().sub @right.velocity().copy()

    # based on
    # http://ghoscher.me/2013/03/02/simple-spring-physics/
    calcForce: (left, right) ->
      actual = @actualLength()
      norm = left.vectorTowards(right)
      vel = left.velocity().copy().sub right.velocity()

      fx = -@stiffness * (actual - @desiredLength) * (norm.x / actual) - @dampening * vel.x
      fy = -@stiffness * (actual - @desiredLength) * (norm.y / actual) - @dampening * vel.y

      new p.Vector(fx, fy)

    update: () ->
      leftForce = @calcForce(@left, @right)
      rightForce = @calcForce(@right, @left)

      # inverses?
      @left.applyForce leftForce
      @right.applyForce leftForce.scale(-1)
