do (p = Physics, b = Physics.Behavior) ->
  class b.Gravity
    constructor: (@force = new p.Vector(0, 9.81)) ->

    update: (bodies) ->
      body.applyForce @force for body in bodies
