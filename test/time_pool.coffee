QUnit.module 'timePool'

QUnit.test '#unitsLeft', (assert) ->
  pool = Physics.timePool 10

  pool.addCurrentTime 10000
  assert.equal pool.unitsLeft(), 0, 'First number sets the base'

  pool.addCurrentTime 10010
  assert.equal pool.unitsLeft(), 1, 'next number takes the difference'

  pool.addCurrentTime 10011
  assert.equal pool.unitsLeft(), 1, 'units tracks full numbers'

QUnit.test '#withdraw', (assert) ->
  pool = Physics.timePool 10
  pool.addCurrentTime 10000
  pool.addCurrentTime 10015
  assert.equal pool.unitsLeft(), 1

  assert.equal pool.withdraw(), true
  assert.equal pool.unitsLeft(), 0
  assert.equal pool.withdraw(), false
  assert.equal pool.unitsLeft(), 0
  pool.addCurrentTime 10020
  assert.equal pool.unitsLeft(), 1
