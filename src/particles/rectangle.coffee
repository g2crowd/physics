do (p = Physics) ->
  class p.Rectangle extends p.Particle
    constructor: (x, y, @width, @height, opts = {}) ->
      super x, y, opts

    leftEdge: ->
      @position.x

    rightEdge: ->
      @position.x + @width

    topEdge: ->
      @position.y

    bottomEdge: ->
      @position.y + @height

    area: ->
      @width * @height

    center: ->
      new p.Vector(@position.x + @width / 2, @position.y + @height / 2)
