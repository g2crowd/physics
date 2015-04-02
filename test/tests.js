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

  QUnit.test('given perfect overlay', function(assert) {
    var left, res, right;
    left = new Physics.Circle(10, 10, 5);
    right = new Physics.Circle(10, 10, 5);
    res = Physics.collisions.circles(left, right);
    return assert.deepEqual(res.toArray(), [0, 0], 'returns a dead vector');
  });

  QUnit.module('collisions.rectangles');

  QUnit.test('given non-colliders', function(assert) {
    var left, res, right;
    left = new Physics.Rectangle(10, 10, 10, 10);
    right = new Physics.Rectangle(20, 10, 10, 10);
    res = Physics.collisions.rectangles(left, right);
    return assert.equal(res, false);
  });

  QUnit.test('given shallow x collision', function(assert) {
    var left, res, right;
    left = new Physics.Rectangle(10, 10, 10, 10);
    right = new Physics.Rectangle(19, 15, 10, 10);
    res = Physics.collisions.rectangles(left, right);
    return assert.deepEqual(res.toArray(), [-1, 0], 'moves the rectangle away on x axis');
  });

  QUnit.test('given shallow y collision from above', function(assert) {
    var left, res, right;
    left = new Physics.Rectangle(10, 10, 10, 10);
    right = new Physics.Rectangle(15, 19, 10, 10);
    res = Physics.collisions.rectangles(left, right);
    return assert.deepEqual(res.toArray(), [0, -1], 'moves the rectangle away on y axis');
  });

  QUnit.test('given shallow y collision from below', function(assert) {
    var left, res, right;
    left = new Physics.Rectangle(15, 19, 10, 10);
    right = new Physics.Rectangle(10, 10, 10, 10);
    res = Physics.collisions.rectangles(left, right);
    return assert.deepEqual(res.toArray(), [0, 1], 'moves the rectangle away on y axis');
  });

  QUnit.test('given perfect overlay', function(assert) {
    var left, res, right;
    left = new Physics.Rectangle(10, 10, 10, 10);
    right = new Physics.Rectangle(10, 10, 10, 10);
    res = Physics.collisions.rectangles(left, right);
    return assert.deepEqual(res.toArray(), [0, 10], 'returns directed vector');
  });

  QUnit.module('collisions.outOfBounds');

  QUnit.test('given inside', function(assert) {
    var bound, circle, res;
    bound = new Physics.Rectangle(0, 0, 200, 200);
    circle = new Physics.Circle(55, 45, 10);
    res = Physics.collisions.outOfBounds(circle, bound);
    return assert.equal(res, false);
  });

  QUnit.test('given outside x', function(assert) {
    var bound, circle, res;
    bound = new Physics.Rectangle(0, 0, 100, 100);
    circle = new Physics.Circle(9, 50, 10);
    res = Physics.collisions.outOfBounds(circle, bound);
    return assert.deepEqual(res.toArray(), [1, 0]);
  });

  QUnit.test('given outside y', function(assert) {
    var bound, circle, res;
    bound = new Physics.Rectangle(0, 0, 100, 100);
    circle = new Physics.Circle(50, 9, 10);
    res = Physics.collisions.outOfBounds(circle, bound);
    return assert.deepEqual(res.toArray(), [0, 1]);
  });

  QUnit.test('given outside x and y', function(assert) {
    var bound, circle, res;
    bound = new Physics.Rectangle(0, 0, 100, 100);
    circle = new Physics.Circle(100, 100, 10);
    res = Physics.collisions.outOfBounds(circle, bound);
    return assert.deepEqual(res.toArray(), [-10, -10]);
  });

  QUnit.test('with a rectangle', function(assert) {
    var bound, rectangle, res;
    bound = new Physics.Rectangle(0, 0, 100, 100);
    rectangle = new Physics.Rectangle(100, 100, 10, 10);
    res = Physics.collisions.outOfBounds(rectangle, bound);
    return assert.deepEqual(res.toArray(), [-10, -10]);
  });

  QUnit.test('with a rectangle', function(assert) {
    var bound, rectangle, res;
    bound = new Physics.Rectangle(0, 0, 100, 100);
    rectangle = new Physics.Rectangle(-10, -10, 10, 10);
    res = Physics.collisions.outOfBounds(rectangle, bound);
    return assert.deepEqual(res.toArray(), [10, 10]);
  });

  QUnit.module('collisions.collide');

  QUnit.test('with circles', function(assert) {
    var left, res, right;
    left = new Physics.Circle(10, 10, 5);
    right = new Physics.Circle(19, 10, 5);
    res = Physics.collisions.collide(left, right);
    assert.deepEqual(res.toArray(), [-1, 0], 'returns a vector pointing towards the left vector');
    return assert.equal(res.magnitude(), 1, 'returns a vector equal to the overlap');
  });

  QUnit.test('with rectangles', function(assert) {
    var left, res, right;
    left = new Physics.Rectangle(10, 10, 10, 10);
    right = new Physics.Rectangle(19, 15, 10, 10);
    res = Physics.collisions.collide(left, right);
    return assert.deepEqual(res.toArray(), [-1, 0], 'moves the rectangle away on x axis');
  });

  QUnit.test('with a rectangle and a circle', function(assert) {
    var left, res, right;
    left = new Physics.Rectangle(10, 10, 10, 10);
    right = new Physics.Circle(24, 10, 5);
    res = Physics.collisions.rectangles(left, right);
    assert.deepEqual(res.toArray(), [-1, 0], 'collides using the circles bounding box as a rectangle');
    res = Physics.collisions.rectangles(right, left);
    return assert.deepEqual(res.toArray(), [1, 0], 'collides using the circles bounding box as a rectangle');
  });

  QUnit.test('#integrate', function(assert) {
    var body;
    body = new Physics.Particle(0, 0, {
      acceleration: new Physics.Vector(0, 2)
    });
    this.subject = new Physics.Integrator.Euler(1);
    this.subject.update([body], 1);
    assert.equal(body.position.y, 2, 'once pos');
    assert.equal(body.velocity.y, 2, 'once vel');
    assert.equal(body.acceleration.y, 0);
    this.subject = new Physics.Integrator.Euler(1);
    body = new Physics.Particle(0, 0, {
      acceleration: new Physics.Vector(0, 2)
    });
    this.subject.update([body], 1);
    body.acceleration = new Physics.Vector(0, 2);
    this.subject.update([body], 1);
    assert.equal(body.position.y, 6, 'twice pos');
    return assert.equal(body.velocity.y, 4, 'twice vel');
  });

  QUnit.module('particle');

  QUnit.test('#vectorTowards', function(assert) {
    var norm, one, two;
    one = new Physics.Particle(0, 0);
    two = new Physics.Particle(0, 10);
    norm = one.vectorTowards(two);
    assert.deepEqual(norm.toArray(), [0, 1]);
    norm = two.vectorTowards(one);
    return assert.deepEqual(norm.toArray(), [0, -1]);
  });

  QUnit.module('timePool');

  QUnit.test('#unitsLeft', function(assert) {
    var pool;
    pool = Physics.timePool(10);
    pool.addCurrentTime(10000);
    assert.equal(pool.unitsLeft(), 0, 'First number sets the base');
    pool.addCurrentTime(10010);
    assert.equal(pool.unitsLeft(), 1, 'next number takes the difference');
    pool.addCurrentTime(10011);
    return assert.equal(pool.unitsLeft(), 1, 'units tracks full numbers');
  });

  QUnit.test('#withdraw', function(assert) {
    var pool;
    pool = Physics.timePool(10);
    pool.addCurrentTime(10000);
    pool.addCurrentTime(10015);
    assert.equal(pool.unitsLeft(), 1);
    assert.equal(pool.withdraw(), true);
    assert.equal(pool.unitsLeft(), 0);
    assert.equal(pool.withdraw(), false);
    assert.equal(pool.unitsLeft(), 0);
    pool.addCurrentTime(10020);
    return assert.equal(pool.unitsLeft(), 1);
  });

  QUnit.module('Timer');

  QUnit.test('async with iterations', function(assert) {
    var count, done, timer;
    done = assert.async();
    count = 0;
    timer = Physics.timer();
    timer.on('tick', function() {
      return count += 1;
    });
    timer.on('stop', function() {
      assert.equal(count, 10);
      return done();
    });
    timer.times(10);
    return timer.start();
  });

  QUnit.test('async with duration', function(assert) {
    var done, start, timer;
    done = assert.async();
    start = new Date();
    timer = Physics.timer();
    timer.on('stop', function() {
      var timePassed;
      timePassed = new Date() - start;
      assert.ok(timePassed > 200);
      return done();
    });
    timer.duration(200);
    return timer.start();
  });

  QUnit.test('synchronous with iterations', function(assert) {
    var count, timer;
    timer = Physics.timer();
    count = 0;
    timer.on('tick', function() {
      return count += 1;
    });
    timer.on('stop', function() {
      return assert.equal(count, 10);
    });
    timer.times(10);
    return timer.startSync();
  });

  QUnit.test('synchronous with duration', function(assert) {
    var agg, lastTime, start, timer;
    start = new Date();
    timer = Physics.timer();
    agg = 0;
    lastTime = null;
    timer.on('tick', function(time) {
      if (lastTime) {
        agg = agg + (time - lastTime);
      }
      return lastTime = time;
    });
    timer.duration(200);
    timer.startSync(10);
    return assert.equal(agg, 200);
  });

}).call(this);
