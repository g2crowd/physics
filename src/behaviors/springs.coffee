do (p = Physics, b = Physics.Behavior) ->
  class b.Springs
    constructor: (@list = []) ->

    addNew: (args...) ->
      @add new p.Spring(args...)

    add: (spring) ->
      @list.push spring
      spring

    setAll: (opts) ->
      spring.setOpts opts for spring in @list

    update: ->
      spring.update() for spring in @list
