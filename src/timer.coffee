do (p = Physics) ->
  class p.TimerError extends Error

  class p.Timer
    constructor: (@delay) ->

    run: (fn, options = {}) ->
      {iterations} = options

      @running = true

      if @delay
        @runWithDelay(fn, iterations)
      else
        @runWithoutDelay(fn, iterations)

    stop: ->
      @running = false

    runWithDelay: (fn, iterations, count = 0) ->
      window.setTimeout =>
        return unless @running

        fn()

        if iterations
          count = count + 1
          @runWithDelay(fn, iterations, count) if count < iterations
        else
          @runWithDelay(fn)

      , @delay

    runWithoutDelay: (fn, iterations) ->
      throw p.TimerError unless iterations

      count = 0

      while count < iterations
        fn()
        count = count + 1
