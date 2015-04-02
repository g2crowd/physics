do (p = Physics) ->
  p.timer = ->
    running = false
    count = 0
    iterations = null

    startTime = 0
    targetTime = null
    sync = false

    me =
      duration: (ms) ->
        targetTime = ms
        me

      times: (val) ->
        iterations = val
        me

      reset: ->
        iterations = null
        targetTime = null
        me.off()

      start: () ->
        me.running = true
        startTime = p.timer.now()
        count = 0

        me.emit 'start'
        me.ticker()
        me

      startSync: (timeStep = 16) ->
        if iterations? || targetTime?
          me.running = true
          sync = true
          startTime = p.timer.now()
          count = 0
          timePassed = startTime

          while me.running
            me.step(null, timePassed)
            timePassed += timeStep

          sync = false

        me

      stop: ->
        me.running = false
        me.emit 'stop'
        me

      step: (_, time = p.timer.now()) ->
        me.emit 'tick', [time, sync]

        if iterations
          count = count + 1
          me.stop() if count >= iterations

        if targetTime
          delta = time - startTime
          me.stop() if delta >= targetTime

        me

      ticker: (time) ->
        if me.running
          me.step(time)
          window.requestAnimationFrame me.ticker
        me

    p.pubsub me

    me

  perf = window.performance
  p.timer.now = ->
    if perf && perf.now
      perf.now() + perf.timing.navigationStart
    else
      Date.now()
