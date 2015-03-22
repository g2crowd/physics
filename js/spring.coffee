do (p = Physics) ->
  class p.Spring
    constructor: (@left, @right, options) ->
      {@stiffness, @length} = options
