QUnit.module 'particle'

QUnit.test '#vectorTowards', (assert) ->
  one = new Physics.Particle(0, 0)
  two = new Physics.Particle(0, 10)

  norm = one.vectorTowards(two)
  assert.deepEqual norm.toArray(), [0, 1]
  norm = two.vectorTowards(one)
  assert.deepEqual norm.toArray(), [0, -1]
