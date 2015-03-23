do (p = Physics) ->
  class p.Vector
    constructor: (@x, @y) ->

    add: (other) ->
      @x += other.x
      @y += other.y
      this

    sub: (other) ->
      @x -= other.x
      @y -= other.y
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

    magnitude: ->
      Math.sqrt @x * @x + @y * @y

    angle: ->
      Math.atan2 @y, @x

    fromAngle: (angle, magnitude) ->
      new p.Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle))

    normalized: ->
      mag = @magnitude()
      if mag != 0
        @x = @x / mag
        @y = @y / mag

      this

    toArray: -> [@x, @y]

    copy: ->
      new p.Vector(@x, @y)
