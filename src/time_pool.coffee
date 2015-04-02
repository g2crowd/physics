do (p = Physics) ->
  p.timePool = (unit, opts = {}) ->
    aggregator = 0
    lastTime = null
    {max} = opts
    max ||= 10

    me =
      unitsLeft: -> Math.floor(aggregator / unit)

      reset: (time) ->
        aggregator = 0
        lastTime = time

      addCurrentTime: (time) ->
        if lastTime?
          aggregator += time - lastTime
          aggregator = Math.min aggregator, max * unit

        lastTime = time

      withdraw: () ->
        if me.unitsLeft()
          aggregator -= unit
          true
        else
          false
