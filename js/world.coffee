do (p = Physics) ->
  class p.World
    constructor: (positions, options) ->
      {@width, @height, @animationDelay} = options
      @boundingBox = new p.Rectangle(0, 0, @width, @height)

    changeSize: (@width, @height) ->
      @boundingBox.set(width: @width, height: @height)

    animate: () ->
