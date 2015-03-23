do (p = Physics) ->
  class p.Rectangle extends p.Circle
    constructor: (x, y, @width, @height) ->
      @particle = new p.Particle x, y
