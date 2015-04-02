do (p = Physics) ->
  class VectorError extends Error
  class p.Vector
    constructor: (@x, @y) ->

    vadd: (other) ->
      @x += other.x
      @y += other.y

      this

    vsub: (other) ->
      @x -= other.x
      @y -= other.y
      this

    vscale: (other) ->
      @x *= other.x
      @y *= other.y
      this

    div: (value) ->
      if value != 0
        @x /= value
        @y /= value

      this

    scale: (value) ->
      @x *= value
      @y *= value
      this

    normalize: ->
      if mag = @magnitude()
        num = 1.0 / mag
        this.x *= num
        this.y *= num

      this

    dot: (other) ->
      @x * other.x + @y * other.y

    fromAngle: (angle, magnitude) ->
      new p.Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle))

    distanceTo: (other) ->
      Math.sqrt (@x - other.x) * (@x - other.x) + (@y - other.y) * (@y - other.y)

    vectorTowards: (other) ->
      new p.Vector(other.x - @x, other.y - @y).normalize()

    magnitude: ->
      Math.sqrt @x * @x + @y * @y

    angle: ->
      Math.atan2 @y, @x

    toArray: -> [@x, @y]

    copy: ->
      new p.Vector(@x, @y)

    zero: -> @scale 0
