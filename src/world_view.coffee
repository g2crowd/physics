do (p = Physics) ->
  class p.WorldView
    constructor: (@world, @particleViews, @$el) ->
      p.pubsub this

    render: ->
      view.render() for view in @particleViews
      @emit 'render'
