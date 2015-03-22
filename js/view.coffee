do (p = Physics) ->
  class p.View
    constructor: (@particle, @$el) ->
      @particle.on 'change', => @render()

    render: ->
      @$el.css
        position: 'absolute',
        top: @particle.get('y') + 'px',
        left: @particle.get('x') + 'px'
