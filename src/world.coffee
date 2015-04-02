do (p = Physics) ->
  class p.World
    constructor: (@bodies, options) ->
      @setParams options
      p.pubsub this

    changeSize: (@width, @height) ->
      @boundingBox.set(width: @width, height: @height)

    setParams: (options) ->
      {
        @width,
        @height,
        @animationDelay,
        @friction,
        @cap,
        @firmCollisions,
        @fps,
        @behaviors,
        @integrator
      } = options

      @fps ||= 60
      @behaviors ||= []
      @integrator ||= new p.Integrator.Euler(1 / @fps)
      @boundingBox = new p.Rectangle(0, 0, @width, @height)

    addBehavior: (items...) ->
      @behaviors.push item for item in items

    step: ->
      @integrator.update(@bodies)
      behavior.update(@bodies, this) for behavior in @behaviors

      @emit 'step'
