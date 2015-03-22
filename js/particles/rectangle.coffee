do (p = Physics) ->
  class p.Rectangle
    constructor: (x, y, @width, @height) ->
      @particle = new p.Particle x, y
