do (p = Physics, b = Physics.Behavior) ->
  # My simple collision detection schemes fail if items are stacked perfectly
  # on top of eachother. This applies gentle pressure to perfect overlays
  # so that the collision detection will catch it the next time around.

  class b.NudgeOverlaidBodies
    constructor: (@force = 1) ->
      @nudgeCounter = -1

    update: (bodies) ->
      for a in bodies
        for b in bodies when a != b && !b.ethereal && !a.ethereal
          @nudge a, b

    nudge: (a, b) ->
      if a.occupiesSameSpaceAs b
        @nudgeCounter += 0.1
        @nudgeCounter = -1 if @nudgeCounter > 1

        angle = @nudgeCounter * Math.PI
        force = new p.Vector(Math.cos(angle), Math.sin(angle)).scale(a.rightEdge() - a.leftEdge())
        a.translate force
