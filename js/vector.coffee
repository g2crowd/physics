do (d = Physics) ->
  class p.Vector
    constructor: (@x, @y) ->

    add: (other) ->
      @x += other.x
      @y += other.y

    multiplyScalar: (value) ->
      @x *= value
      @y *= value

    magnitude: ->
      Math.sqrt @x * @x + @y * @y

    angle: ->
      Math.atan2 @y, @x

    fromAngle: (angle, magnitude) ->
      new p.Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle))
