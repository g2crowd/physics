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
      @left.velocity().copy().add @right.velocity().copy().scale(-1)

    springCalc: (normalizedVector) ->
      # -stiffness * (distance - desired) * (normalizedVector / distance) - (relativeVelocity * dampener)
      normalizedVector.div(@actualLength()).scale(@attraction())
      normalizedVector.sub @relativeVelocity().scale(-@dampening)

    update: () ->
      normal = @left.vectorTowards(@right)
      leftForce = @springCalc(normal).copy()
      normal = @right.vectorTowards(@left)
      rightForce = @springCalc(normal).copy()

      @left.applyForce leftForce
      @right.applyForce rightForce
