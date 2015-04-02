do (p = Physics, i = Physics.Integrator) ->
  class i.Euler
    constructor: (@timeStep = 1 / 60, @minVel = 0.1) ->

    update: (bodies, currentTime) ->
      @integrate body, currentTime for body in bodies

      @resetAccels bodies

    integrate: (body, currentTime) ->
      if body.dynamic()
        body.velocity.vadd body.acceleration.copy().scale @timeStep
        @capMinimums body

        body.position.vadd body.velocity
      else
        body.velocity.zero()

    resetAccels: (bodies) ->
      body.acceleration.zero() for body in bodies

    capMinimums: (body) ->
      body.velocity.scale(0) if 0 < body.velocity.magnitude() < @minVel
