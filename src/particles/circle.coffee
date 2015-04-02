do (p = Physics) ->
  class p.Circle extends p.Particle
    constructor: (x, y, @radius, opts) ->
      super x, y, opts

    leftEdge: ->
      @position.x - @radius

    rightEdge: ->
      @position.x + @radius

    topEdge: ->
      @position.y - @radius

    bottomEdge: ->
      @position.y + @radius
