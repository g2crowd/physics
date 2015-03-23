do (p = Physics) ->
  class p.View
    constructor: (@particle, @$el) ->

    render: ->
      @$el.css
        position: 'absolute',
        top: @particle.position().y - @particle.radius + 'px',
        left: @particle.position().x - @particle.radius + 'px'

      @particle.dirty = false
