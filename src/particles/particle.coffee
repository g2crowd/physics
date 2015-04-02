do (p = Physics) ->
  class p.Particle
    constructor: (x, y, opts = {}) ->
      {velocity, acceleration, @role, @ethereal} = opts
      @position = new p.Vector(x, y)
      @velocity = velocity || new p.Vector(0, 0)
      @acceleration = acceleration || new p.Vector(0, 0)
      @setMass opts.mass
      @ethereal ?= false

    dynamic: -> (@role || 'dynamic') == 'dynamic'

    static: -> @role == 'static'

    setMass: (val) ->
      @mass = val || 1

      if @mass < 1
        throw new RangeError('mass must be >= 1')

    applyForce: (vector) ->
      return unless @dynamic()

      @acceleration.vadd vector.copy().div(@mass)

    translate: (vector) ->
      return unless @dynamic()

      @position.vadd vector

    distanceTo: (other) ->
      left = @position
      right = other.position

      Math.sqrt (left.x - right.x) * (left.x - right.x) + (left.y - right.y) * (left.y - right.y)

    vectorTowards: (other) ->
      new p.Vector(other.position.x - @position.x,
                   other.position.y - @position.y).normalize()

    occupiesSameSpaceAs: (other) ->
      @position.x == other.position.x && @position.y == other.position.y

    intersectWith: (other) ->
      xOverlap = Math.max(0, Math.min(@rightEdge(), other.rightEdge()) - Math.max(@leftEdge(), other.leftEdge()))
      yOverlap = Math.max(0, Math.min(@bottomEdge(), other.bottomEdge()) - Math.max(@topEdge(), other.topEdge()))

      new p.Vector xOverlap, yOverlap
