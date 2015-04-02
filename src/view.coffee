do (p = Physics) ->
  class p.View
    constructor: (@particle, @$el) ->
      p.pubsub this

    top: ->
      if @particle.radius
        @particle.position.y - @particle.radius
      else
        @particle.position.y

    left: ->
      if @particle.radius
        @particle.position.x - @particle.radius
      else
        @particle.position.x

    render: ->
      @$el.css
        position: 'absolute',
        top: @top() + 'px'
        left: @left() + 'px'

      @emit 'render'
