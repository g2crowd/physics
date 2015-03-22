do (p = Physics) ->
  class p.AnimationError extends Error

  class p.Animation
    constructor: (@delay) ->

    run: (fn, options) ->
      {iterations} = options

      if @delay
        @runWithDelay(fn, iterations)
      else
        @runWithoutDelay(fn, iterations)

    runWithDelay: (fn, iterations, count = 0) ->
      window.setTimeout =>
        fn()

        if iterations
          count = count + 1
          @runWithDelay(fn, iterations, count) if count < iterations
        else
          @runWithDelay(fn)

      , @delay

    runWithoutDelay: (fn, iterations) ->
      throw p.AnimationError unless iterations

      for i in iterations
        fn()
