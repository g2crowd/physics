do (p = Physics) ->
  class p.Spring
    constructor: (@left, @right, options) ->
      @setOpts(options)

    setOpts: (options) ->
      {@stiffness, @desiredLength, @dampening, @defaultDegrees} = options
      @angleVector = p.Vector.fromDegrees (@defaultDegrees || 45), 1

    actualLength: ->
      Math.abs @left.distanceTo(@right)

    calc: (left, right) ->
      actual = @actualLength()
      norm = right.vectorTowards(left)
      norm = @angleVector if norm.isZero()
      vel = left.velocity.copy().vsub right.velocity

      fx = -@stiffness * (actual - @desiredLength) * (norm.x)
      dx = -@dampening * vel.x

      fy = -@stiffness * (actual - @desiredLength) * (norm.y)
      dy = -@dampening * vel.y

      new p.Vector(fx + dx, fy + dy)

    update: () ->
      leftForce = @calc(@left, @right)

      @left.applyForce leftForce
      @right.applyForce leftForce.scale(-1)
