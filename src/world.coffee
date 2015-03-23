do (p = Physics) ->
  class p.World
    constructor: (@bodies, @springs, options) ->
      {@width, @height, @animationDelay, @friction, @cap} = options
      @boundingBox = new p.Rectangle(0, 0, @width, @height)

    changeSize: (@width, @height) ->
      @boundingBox.set(width: @width, height: @height)

    handleCollision: (left, right, collisionVector) ->
      collisionVector.scale 0.1 # will be tested twice, so don't overdo it

      left.applyForce collisionVector

    handleOutOfBounds: (item, collisionVector) ->
      item.position().x = 150
      item.position().y = 150
      item.velocity().scale(-1)

    testCollisions: (item) ->
      for other in @bodies when item != other
        if collisionVector = p.collisions.circles item, other
          @handleCollision item, other, collisionVector

    testBounds: (item) ->
      if collisionVector = p.collisions.circleOutOfBounds(item, @boundingBox)
        @handleOutOfBounds item, collisionVector

    updateLoop: ->
      spring.update() for spring in @springs

      for item in @bodies
        @testBounds item
        @testCollisions item

        item.move(friction: @friction, cap: @cap)

    start: (delay, iterations) ->
      @timer ||= new p.Timer(delay).run (=> @updateLoop()), iterations: iterations

    stop: ->
      @timer.stop()
      @timer = null
