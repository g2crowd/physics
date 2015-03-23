(function() {
  QUnit.module('collisions.circles');

  QUnit.test('given non-colliders', function(assert) {
    var left, res, right;
    left = new Physics.Circle(10, 10, 5);
    right = new Physics.Circle(20, 10, 5);
    res = Physics.collisions.circles(left, right);
    return assert.equal(res, false);
  });

  QUnit.test('given colliders', function(assert) {
    var left, res, right;
    left = new Physics.Circle(10, 10, 5);
    right = new Physics.Circle(19, 10, 5);
    res = Physics.collisions.circles(left, right);
    assert.deepEqual(res.toArray(), [-1, 0], 'returns a vector pointing towards the left vector');
    return assert.equal(res.magnitude(), 1, 'returns a vector equal to the overlap');
  });

  QUnit.module('collisions.outOfBounds');

  QUnit.test('given inside', function(assert) {
    var bound, circle, res;
    bound = new Physics.Rectangle(0, 0, 200, 200);
    circle = new Physics.Circle(55, 45, 10);
    res = Physics.collisions.circleOutOfBounds(circle, bound);
    return assert.equal(res, false);
  });

  QUnit.test('given outside x', function(assert) {
    var bound, circle, res;
    bound = new Physics.Rectangle(0, 0, 100, 100);
    circle = new Physics.Circle(9, 50, 10);
    res = Physics.collisions.circleOutOfBounds(circle, bound);
    return assert.deepEqual(res.toArray(), [1, 0]);
  });

  QUnit.test('given outside y', function(assert) {
    var bound, circle, res;
    bound = new Physics.Rectangle(0, 0, 100, 100);
    circle = new Physics.Circle(50, 9, 10);
    res = Physics.collisions.circleOutOfBounds(circle, bound);
    return assert.deepEqual(res.toArray(), [0, 1]);
  });

  QUnit.test('given outside x and y', function(assert) {
    var bound, circle, res;
    bound = new Physics.Rectangle(0, 0, 100, 100);
    circle = new Physics.Circle(100, 100, 10);
    res = Physics.collisions.circleOutOfBounds(circle, bound);
    return assert.deepEqual(res.toArray(), [-10, -10]);
  });

}).call(this);
