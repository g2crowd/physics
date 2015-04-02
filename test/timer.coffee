QUnit.module 'Timer'

QUnit.test 'async with iterations', (assert) ->
  done = assert.async()
  count = 0
  timer = Physics.timer()
  timer.on 'tick', -> count += 1
  timer.on 'stop', ->
    assert.equal count, 10
    done()

  timer.times(10)
  timer.start()

QUnit.test 'async with duration', (assert) ->
  done = assert.async()
  start = new Date()
  timer = Physics.timer()
  timer.on 'stop', ->
    timePassed = new Date() - start
    assert.ok timePassed > 200
    done()

  timer.duration(200)
  timer.start()

QUnit.test 'synchronous with iterations', (assert) ->
  timer = Physics.timer()

  count = 0
  timer.on 'tick', -> count += 1
  timer.on 'stop', -> assert.equal count, 10

  timer.times(10)
  timer.startSync()

QUnit.test 'synchronous with duration', (assert) ->
  start = new Date()
  timer = Physics.timer()
  agg = 0
  lastTime = null
  timer.on 'tick', (time) ->
    if lastTime
      agg = agg + (time - lastTime)

    lastTime = time

  timer.duration(200)
  timer.startSync(10)

  assert.equal agg, 200
