QUnit.module 'collisions.circles'

QUnit.test 'given non-colliders', (assert) ->
  left = new Physics.Circle 10, 10, 5
  right = new Physics.Circle 20, 10, 5

  res = Physics.collisions.circles(left, right)
  assert.equal res, false

QUnit.test 'given colliders', (assert) ->
  left = new Physics.Circle 10, 10, 5
  right = new Physics.Circle 19, 10, 5

  res = Physics.collisions.circles(left, right)
  assert.deepEqual res.toArray(), [-1, 0], 'returns a vector pointing towards the left vector'
  assert.equal res.magnitude(), 1, 'returns a vector equal to the overlap'

QUnit.test 'given perfect overlay', (assert) ->
  left = new Physics.Circle 10, 10, 5
  right = new Physics.Circle 10, 10, 5

  res = Physics.collisions.circles(left, right)
  assert.deepEqual res.toArray(), [0, 0], 'returns a dead vector'

QUnit.module 'collisions.rectangles'

QUnit.test 'given non-colliders', (assert) ->
  left = new Physics.Rectangle 10, 10, 10, 10
  right = new Physics.Rectangle 20, 10, 10, 10

  res = Physics.collisions.rectangles(left, right)
  assert.equal res, false

QUnit.test 'given shallow x collision', (assert) ->
  left = new Physics.Rectangle 10, 10, 10, 10
  right = new Physics.Rectangle 19, 15, 10, 10

  res = Physics.collisions.rectangles(left, right)
  assert.deepEqual res.toArray(), [-1, 0], 'moves the rectangle away on x axis'

QUnit.test 'given shallow y collision from above', (assert) ->
  left = new Physics.Rectangle 10, 10, 10, 10
  right = new Physics.Rectangle 15, 19, 10, 10

  res = Physics.collisions.rectangles(left, right)
  assert.deepEqual res.toArray(), [0, -1], 'moves the rectangle away on y axis'

QUnit.test 'given shallow y collision from below', (assert) ->
  left = new Physics.Rectangle 15, 19, 10, 10
  right = new Physics.Rectangle 10, 10, 10, 10

  res = Physics.collisions.rectangles(left, right)
  assert.deepEqual res.toArray(), [0, 1], 'moves the rectangle away on y axis'

QUnit.test 'given perfect overlay', (assert) ->
  left = new Physics.Rectangle 10, 10, 10, 10
  right = new Physics.Rectangle 10, 10, 10, 10

  res = Physics.collisions.rectangles(left, right)
  assert.deepEqual res.toArray(), [0, 10], 'returns directed vector'

QUnit.module 'collisions.outOfBounds'

QUnit.test 'given inside', (assert) ->
  bound = new Physics.Rectangle(0, 0, 200, 200)
  circle = new Physics.Circle(55, 45, 10)
  res = Physics.collisions.outOfBounds(circle, bound)
  assert.equal res, false

QUnit.test 'given outside x', (assert) ->
  bound = new Physics.Rectangle(0, 0, 100, 100)
  circle = new Physics.Circle(9, 50, 10)
  res = Physics.collisions.outOfBounds(circle, bound)
  assert.deepEqual res.toArray(), [1, 0]

QUnit.test 'given outside y', (assert) ->
  bound = new Physics.Rectangle(0, 0, 100, 100)
  circle = new Physics.Circle(50, 9, 10)
  res = Physics.collisions.outOfBounds(circle, bound)
  assert.deepEqual res.toArray(), [0, 1]

QUnit.test 'given outside x and y', (assert) ->
  bound = new Physics.Rectangle(0, 0, 100, 100)
  circle = new Physics.Circle(100, 100, 10)
  res = Physics.collisions.outOfBounds(circle, bound)
  assert.deepEqual res.toArray(), [-10, -10]

QUnit.test 'with a rectangle', (assert) ->
  bound = new Physics.Rectangle(0, 0, 100, 100)
  rectangle = new Physics.Rectangle(100, 100, 10, 10)
  res = Physics.collisions.outOfBounds(rectangle, bound)
  assert.deepEqual res.toArray(), [-10, -10]

QUnit.test 'with a rectangle', (assert) ->
  bound = new Physics.Rectangle(0, 0, 100, 100)
  rectangle = new Physics.Rectangle(-10, -10, 10, 10)
  res = Physics.collisions.outOfBounds(rectangle, bound)
  assert.deepEqual res.toArray(), [10, 10]

QUnit.module 'collisions.collide'

QUnit.test 'with circles', (assert) ->
  left = new Physics.Circle 10, 10, 5
  right = new Physics.Circle 19, 10, 5

  res = Physics.collisions.collide(left, right)
  assert.deepEqual res.toArray(), [-1, 0], 'returns a vector pointing towards the left vector'
  assert.equal res.magnitude(), 1, 'returns a vector equal to the overlap'

QUnit.test 'with rectangles', (assert) ->
  left = new Physics.Rectangle 10, 10, 10, 10
  right = new Physics.Rectangle 19, 15, 10, 10

  res = Physics.collisions.collide(left, right)
  assert.deepEqual res.toArray(), [-1, 0], 'moves the rectangle away on x axis'

QUnit.test 'with a rectangle and a circle', (assert) ->
  left = new Physics.Rectangle 10, 10, 10, 10
  right = new Physics.Circle 24, 10, 5

  res = Physics.collisions.rectangles(left, right)
  assert.deepEqual res.toArray(), [-1, 0], 'collides using the circles bounding box as a rectangle'

  res = Physics.collisions.rectangles(right, left)
  assert.deepEqual res.toArray(), [1, 0], 'collides using the circles bounding box as a rectangle'
