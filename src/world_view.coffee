do (p = Physics) ->
  animFn = window.requestAnimationFrame || (fn) -> window.setTimeout(fn, 16)

  class p.WorldView
    constructor: (@world, @particleViews, @$el) ->

    render: ->
      view.render() for view in @particleViews

    _loop: ->
      animFn =>
        if @running
          @render()
          @_loop()

    start: ->
      return if @running
      @running = true
      @_loop()

    stop: ->
      @running = false

    fpsToMs: (fps) ->
      1000 / fps