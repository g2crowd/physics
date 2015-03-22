do (p = Physics) ->
  class p.Circle extends p.Particle
    constructor: (x, y, @radius) ->
      @particle = new p.Particle @x, @y
