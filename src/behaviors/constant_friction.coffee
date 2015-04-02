do (b = Physics.Behavior) ->
  class b.ConstantFriction
    constructor: (@factor = 1) ->

    update: (bodies) ->
      @applyFriction body for body in bodies

    applyFriction: (body) ->
      body.velocity.scale @factor
