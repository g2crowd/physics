(function() {
  var slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.Physics = {};

  window.Physics.Behavior = {};

  window.Physics.Integrator = {};

  (function(p) {
    return p.Particle = (function() {
      function Particle(x, y, opts) {
        var acceleration, velocity;
        if (opts == null) {
          opts = {};
        }
        velocity = opts.velocity, acceleration = opts.acceleration, this.role = opts.role, this.ethereal = opts.ethereal;
        this.position = new p.Vector(x, y);
        this.velocity = velocity || new p.Vector(0, 0);
        this.acceleration = acceleration || new p.Vector(0, 0);
        this.setMass(opts.mass);
        if (this.ethereal == null) {
          this.ethereal = false;
        }
      }

      Particle.prototype.dynamic = function() {
        return (this.role || 'dynamic') === 'dynamic';
      };

      Particle.prototype["static"] = function() {
        return this.role === 'static';
      };

      Particle.prototype.setMass = function(val) {
        this.mass = val || 1;
        if (this.mass < 1) {
          throw new RangeError('mass must be >= 1');
        }
      };

      Particle.prototype.applyForce = function(vector) {
        if (!this.dynamic()) {
          return;
        }
        return this.acceleration.vadd(vector.copy().div(this.mass));
      };

      Particle.prototype.translate = function(vector) {
        if (!this.dynamic()) {
          return;
        }
        return this.position.vadd(vector);
      };

      Particle.prototype.center = function() {
        return this.position;
      };

      Particle.prototype.distanceTo = function(other) {
        return this.position.distanceTo(other.position);
      };

      Particle.prototype.vectorTowards = function(other) {
        return this.position.vectorTowards(other.position);
      };

      Particle.prototype.occupiesSameSpaceAs = function(other) {
        return this.position.x === other.position.x && this.position.y === other.position.y;
      };

      Particle.prototype.intersectWith = function(other) {
        var xOverlap, yOverlap;
        xOverlap = Math.max(0, Math.min(this.rightEdge(), other.rightEdge()) - Math.max(this.leftEdge(), other.leftEdge()));
        yOverlap = Math.max(0, Math.min(this.bottomEdge(), other.bottomEdge()) - Math.max(this.topEdge(), other.topEdge()));
        return new p.Vector(xOverlap, yOverlap);
      };

      return Particle;

    })();
  })(Physics);

  (function(b) {
    return b.ConstantFriction = (function() {
      function ConstantFriction(factor) {
        this.factor = factor != null ? factor : 1;
      }

      ConstantFriction.prototype.update = function(bodies) {
        var body, j, len, results;
        results = [];
        for (j = 0, len = bodies.length; j < len; j++) {
          body = bodies[j];
          results.push(this.applyFriction(body));
        }
        return results;
      };

      ConstantFriction.prototype.applyFriction = function(body) {
        return body.velocity.scale(this.factor);
      };

      return ConstantFriction;

    })();
  })(Physics.Behavior);

  (function(p, b) {
    return b.EdgeCollisions = (function() {
      function EdgeCollisions(restitution) {
        this.restitution = restitution != null ? restitution : 0.5;
      }

      EdgeCollisions.prototype.update = function(bodies, world) {
        var body, bounds, j, len, results;
        bounds = world.boundingBox;
        results = [];
        for (j = 0, len = bodies.length; j < len; j++) {
          body = bodies[j];
          results.push(this.testCollisions(body, bounds));
        }
        return results;
      };

      EdgeCollisions.prototype.testCollisions = function(body, bounds) {
        var collisionVector;
        if (collisionVector = p.collisions.outOfBounds(body, bounds)) {
          return this.handleCollision(body, collisionVector);
        }
      };

      EdgeCollisions.prototype.handleCollision = function(item, collisionVector) {
        item.translate(collisionVector);
        if (collisionVector.x !== 0) {
          item.velocity.x *= -this.restitution;
        }
        if (collisionVector.y !== 0) {
          return item.velocity.y *= -this.restitution;
        }
      };

      return EdgeCollisions;

    })();
  })(Physics, Physics.Behavior);

  (function(p, b) {
    return b.Gravity = (function() {
      function Gravity(force1) {
        this.force = force1 != null ? force1 : new p.Vector(0, 9.81);
      }

      Gravity.prototype.update = function(bodies) {
        var body, j, len, results;
        results = [];
        for (j = 0, len = bodies.length; j < len; j++) {
          body = bodies[j];
          results.push(body.applyForce(this.force));
        }
        return results;
      };

      return Gravity;

    })();
  })(Physics, Physics.Behavior);

  (function(p, b) {
    return b.ParticleCollisions = (function() {
      function ParticleCollisions(opts) {
        if (opts == null) {
          opts = {};
        }
      }

      ParticleCollisions.prototype.update = function(bodies) {
        var body, j, len, results;
        results = [];
        for (j = 0, len = bodies.length; j < len; j++) {
          body = bodies[j];
          results.push(this.testCollisions(body, bodies));
        }
        return results;
      };

      ParticleCollisions.prototype.testCollisions = function(body, bodies) {
        var collisionVector, j, len, other, results;
        if (body.ethereal) {
          return;
        }
        results = [];
        for (j = 0, len = bodies.length; j < len; j++) {
          other = bodies[j];
          if (!(body !== other && !other.ethereal)) {
            continue;
          }
          this.correctPerfectOverlays(body, other);
          if (collisionVector = p.collisions.collide(body, other)) {
            results.push(this.handleCollision(body, collisionVector, other));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };

      ParticleCollisions.prototype.handleCollision = function(body, collisionVector, other) {
        return this.correct(body, other, collisionVector);
      };

      ParticleCollisions.prototype.correct = function(a, b, collisionVector) {
        a.translate(collisionVector.scale(0.5));
        return b.translate(collisionVector.scale(-1));
      };

      ParticleCollisions.prototype.correctPerfectOverlays = function(a, b) {
        var angle, force;
        if (a.occupiesSameSpaceAs(b)) {
          angle = Math.random() * 2 * Math.PI;
          force = new p.Vector(Math.cos(angle), Math.sin(angle)).scale(a.rightEdge() - a.leftEdge());
          return a.applyForce(force);
        }
      };

      return ParticleCollisions;

    })();
  })(Physics, Physics.Behavior);

  (function(p, b) {
    return b.Repellers = (function() {
      function Repellers(particles, opts) {
        this.particles = particles;
        if (opts == null) {
          opts = {};
        }
        this.strength = opts.strength, this.distance = opts.distance;
      }

      Repellers.prototype.add = function(body) {
        this.particles.push(body);
        return body;
      };

      Repellers.prototype.update = function(bodies) {
        var j, len, ref, repeller, results;
        ref = this.particles;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          repeller = ref[j];
          results.push(this.repelClose(repeller, bodies));
        }
        return results;
      };

      Repellers.prototype.repelClose = function(repeller, bodies) {
        var center, j, len, other, otherCenter, range, results;
        center = repeller.center();
        results = [];
        for (j = 0, len = bodies.length; j < len; j++) {
          other = bodies[j];
          if (!(other !== repeller && !other.ethereal)) {
            continue;
          }
          this.correctPerfectOverlays(repeller, other);
          otherCenter = other.center();
          if ((range = center.distanceTo(otherCenter)) <= this.distance) {
            results.push(other.applyForce(center.vectorTowards(otherCenter).scale(this.strength)));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };

      Repellers.prototype.correctPerfectOverlays = function(a, b) {
        var angle, force;
        if (a.center().x === b.center().x && a.center().y === b.center().y) {
          angle = Math.random() * 2 * Math.PI;
          force = new p.Vector(Math.cos(angle), Math.sin(angle)).scale(a.rightEdge() - a.leftEdge());
          return a.applyForce(force);
        }
      };

      return Repellers;

    })();
  })(Physics, Physics.Behavior);

  (function(p, b) {
    return b.Springs = (function() {
      function Springs(list) {
        this.list = list != null ? list : [];
      }

      Springs.prototype.addNew = function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return this.add((function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(p.Spring, args, function(){}));
      };

      Springs.prototype.add = function(spring) {
        this.list.push(spring);
        return spring;
      };

      Springs.prototype.setAll = function(opts) {
        var j, len, ref, results, spring;
        ref = this.list;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          spring = ref[j];
          results.push(spring.setOpts(opts));
        }
        return results;
      };

      Springs.prototype.update = function() {
        var j, len, ref, results, spring;
        ref = this.list;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          spring = ref[j];
          results.push(spring.update());
        }
        return results;
      };

      return Springs;

    })();
  })(Physics, Physics.Behavior);

  (function(p) {
    var circlesCollide, rectanglesCollide, rectanglesCorrect, shorterCollisionVector;
    circlesCollide = function(left, right) {
      var combinedSize, dx, dy;
      combinedSize = left.radius + right.radius;
      dx = left.position.x - right.position.x;
      dy = left.position.y - right.position.y;
      return dx * dx + dy * dy < combinedSize * combinedSize;
    };
    rectanglesCollide = function(left, right) {
      return left.leftEdge() < right.rightEdge() && left.rightEdge() > right.leftEdge() && left.topEdge() < right.bottomEdge() && left.bottomEdge() > right.topEdge();
    };
    shorterCollisionVector = function(a, b) {
      var intersection;
      intersection = a.intersectWith(b);
      if (intersection.x < intersection.y) {
        return new p.Vector(intersection.x, 0);
      } else {
        return new p.Vector(0, intersection.y);
      }
    };
    rectanglesCorrect = function(a, b) {
      var vector;
      vector = shorterCollisionVector(a, b);
      if (a.topEdge() < b.topEdge()) {
        vector.y *= -1;
      }
      if (a.leftEdge() < b.leftEdge()) {
        vector.x *= -1;
      }
      return vector;
    };
    return p.collisions = {
      collide: function(left, right) {
        var fnName;
        fnName = left.constructor.name === 'Rectangle' || right.constructor.name === 'Rectangle' ? 'rectangles' : 'circles';
        return this[fnName](left, right);
      },
      rectangles: function(left, right) {
        var xCorrection, yCorrection;
        xCorrection = yCorrection = 0;
        if (rectanglesCollide(left, right)) {
          return rectanglesCorrect(left, right);
        } else {
          return false;
        }
      },
      circles: function(left, right) {
        var collisionVector, combinedSize, overlap;
        if (circlesCollide(left, right)) {
          combinedSize = left.radius + right.radius;
          overlap = combinedSize - left.distanceTo(right);
          collisionVector = right.vectorTowards(left);
          collisionVector.scale(overlap);
          return collisionVector;
        } else {
          return false;
        }
      },
      outOfBounds: function(item, bounds) {
        var xCorrection, yCorrection;
        xCorrection = yCorrection = 0;
        if (item.leftEdge() < bounds.leftEdge()) {
          xCorrection = bounds.leftEdge() - item.leftEdge();
        }
        if (item.rightEdge() > bounds.rightEdge()) {
          xCorrection = bounds.rightEdge() - item.rightEdge();
        }
        if (item.topEdge() < bounds.topEdge()) {
          yCorrection = bounds.topEdge() - item.topEdge();
        }
        if (item.bottomEdge() > bounds.bottomEdge()) {
          yCorrection = bounds.bottomEdge() - item.bottomEdge();
        }
        if (xCorrection || yCorrection) {
          return new p.Vector(xCorrection, yCorrection);
        } else {
          return false;
        }
      }
    };
  })(Physics);

  (function(p, i) {
    return i.Euler = (function() {
      function Euler(timeStep1, minVel) {
        this.timeStep = timeStep1 != null ? timeStep1 : 1 / 60;
        this.minVel = minVel != null ? minVel : 0.1;
      }

      Euler.prototype.update = function(bodies, currentTime) {
        var body, j, len;
        for (j = 0, len = bodies.length; j < len; j++) {
          body = bodies[j];
          this.integrate(body, currentTime);
        }
        return this.resetAccels(bodies);
      };

      Euler.prototype.integrate = function(body, currentTime) {
        if (body.dynamic()) {
          body.velocity.vadd(body.acceleration.copy().scale(this.timeStep));
          this.capMinimums(body);
          return body.position.vadd(body.velocity);
        } else {
          return body.velocity.zero();
        }
      };

      Euler.prototype.resetAccels = function(bodies) {
        var body, j, len, results;
        results = [];
        for (j = 0, len = bodies.length; j < len; j++) {
          body = bodies[j];
          results.push(body.acceleration.zero());
        }
        return results;
      };

      Euler.prototype.capMinimums = function(body) {
        var ref;
        if ((0 < (ref = body.velocity.magnitude()) && ref < this.minVel)) {
          return body.velocity.scale(0);
        }
      };

      return Euler;

    })();
  })(Physics, Physics.Integrator);

  (function(p) {
    return p.Circle = (function(superClass) {
      extend(Circle, superClass);

      function Circle(x, y, radius, opts) {
        this.radius = radius;
        Circle.__super__.constructor.call(this, x, y, opts);
      }

      Circle.prototype.leftEdge = function() {
        return this.position.x - this.radius;
      };

      Circle.prototype.rightEdge = function() {
        return this.position.x + this.radius;
      };

      Circle.prototype.topEdge = function() {
        return this.position.y - this.radius;
      };

      Circle.prototype.bottomEdge = function() {
        return this.position.y + this.radius;
      };

      return Circle;

    })(p.Particle);
  })(Physics);

  (function(p) {
    return p.Rectangle = (function(superClass) {
      extend(Rectangle, superClass);

      function Rectangle(x, y, width, height, opts) {
        this.width = width;
        this.height = height;
        if (opts == null) {
          opts = {};
        }
        Rectangle.__super__.constructor.call(this, x, y, opts);
      }

      Rectangle.prototype.leftEdge = function() {
        return this.position.x;
      };

      Rectangle.prototype.rightEdge = function() {
        return this.position.x + this.width;
      };

      Rectangle.prototype.topEdge = function() {
        return this.position.y;
      };

      Rectangle.prototype.bottomEdge = function() {
        return this.position.y + this.height;
      };

      Rectangle.prototype.area = function() {
        return this.width * this.height;
      };

      Rectangle.prototype.center = function() {
        return new p.Vector(this.position.x + this.width / 2, this.position.y + this.height / 2);
      };

      return Rectangle;

    })(p.Particle);
  })(Physics);

  (function(p) {
    return p.pubsub = function(subject) {
      var functions;
      if (subject == null) {
        subject = {};
      }
      functions = {};
      subject.on = function(topic, callback) {
        if (!functions[topic]) {
          functions[topic] = [];
        }
        functions[topic].push(callback);
        return subject;
      };
      subject.emit = function(topic, args) {
        var fn, j, len, ref;
        if (!functions[topic]) {
          return;
        }
        ref = functions[topic];
        for (j = 0, len = ref.length; j < len; j++) {
          fn = ref[j];
          fn.apply(subject, args || []);
        }
        return subject;
      };
      subject.off = function(topic, func) {
        var fn, j, len, ref;
        if (!topic) {
          functions = {};
        } else if (!func) {
          functions[topic] = [];
        } else {
          ref = functions[topic];
          for (j = 0, len = ref.length; j < len; j++) {
            fn = ref[j];
            if (fn === func) {
              functions[topic].splice(i, 1);
            }
          }
        }
        return subject;
      };
      return subject;
    };
  })(Physics);

  (function(p) {
    return p.Spring = (function() {
      function Spring(left1, right1, options) {
        this.left = left1;
        this.right = right1;
        this.setOpts(options);
      }

      Spring.prototype.setOpts = function(options) {
        return this.stiffness = options.stiffness, this.desiredLength = options.desiredLength, this.dampening = options.dampening, options;
      };

      Spring.prototype.actualLength = function() {
        return Math.abs(this.left.distanceTo(this.right));
      };

      Spring.prototype.calc = function(left, right) {
        var actual, dx, dy, fx, fy, norm, vel;
        actual = this.actualLength();
        norm = right.vectorTowards(left);
        vel = left.velocity.copy().vsub(right.velocity);
        fx = -this.stiffness * (actual - this.desiredLength) * norm.x;
        dx = -this.dampening * vel.x;
        fy = -this.stiffness * (actual - this.desiredLength) * norm.y;
        dy = -this.dampening * vel.y;
        return new p.Vector(fx + dx, fy + dy);
      };

      Spring.prototype.update = function() {
        var leftForce;
        leftForce = this.calc(this.left, this.right);
        this.left.applyForce(leftForce);
        return this.right.applyForce(leftForce.scale(-1));
      };

      return Spring;

    })();
  })(Physics);

  (function(p) {
    return p.timePool = function(unit, opts) {
      var aggregator, lastTime, max, me;
      if (opts == null) {
        opts = {};
      }
      aggregator = 0;
      lastTime = null;
      max = opts.max;
      max || (max = 10);
      return me = {
        unitsLeft: function() {
          return Math.floor(aggregator / unit);
        },
        reset: function(time) {
          aggregator = 0;
          return lastTime = time;
        },
        addCurrentTime: function(time) {
          if (lastTime != null) {
            aggregator += time - lastTime;
            aggregator = Math.min(aggregator, max * unit);
          }
          return lastTime = time;
        },
        withdraw: function() {
          if (me.unitsLeft()) {
            aggregator -= unit;
            return true;
          } else {
            return false;
          }
        }
      };
    };
  })(Physics);

  (function(p) {
    var perf;
    p.timer = function() {
      var count, iterations, me, running, startTime, sync, targetTime;
      running = false;
      count = 0;
      iterations = null;
      startTime = 0;
      targetTime = null;
      sync = false;
      me = {
        duration: function(ms) {
          targetTime = ms;
          return me;
        },
        times: function(val) {
          iterations = val;
          return me;
        },
        reset: function() {
          iterations = null;
          targetTime = null;
          return me.off();
        },
        start: function() {
          me.running = true;
          startTime = p.timer.now();
          count = 0;
          me.emit('start');
          me.ticker();
          return me;
        },
        startSync: function(timeStep) {
          var timePassed;
          if (timeStep == null) {
            timeStep = 16;
          }
          if ((iterations != null) || (targetTime != null)) {
            me.running = true;
            sync = true;
            startTime = p.timer.now();
            count = 0;
            timePassed = startTime;
            while (me.running) {
              me.step(null, timePassed);
              timePassed += timeStep;
            }
            sync = false;
          }
          return me;
        },
        stop: function() {
          me.running = false;
          me.emit('stop');
          return me;
        },
        step: function(_, time) {
          var delta;
          if (time == null) {
            time = p.timer.now();
          }
          me.emit('tick', [time, sync]);
          if (iterations) {
            count = count + 1;
            if (count >= iterations) {
              me.stop();
            }
          }
          if (targetTime) {
            delta = time - startTime;
            if (delta >= targetTime) {
              me.stop();
            }
          }
          return me;
        },
        ticker: function(time) {
          if (me.running) {
            me.step(time);
            window.requestAnimationFrame(me.ticker);
          }
          return me;
        }
      };
      p.pubsub(me);
      return me;
    };
    perf = window.performance;
    return p.timer.now = function() {
      if (perf && perf.now) {
        return perf.now() + perf.timing.navigationStart;
      } else {
        return Date.now();
      }
    };
  })(Physics);

  (function(p) {
    var VectorError;
    VectorError = (function(superClass) {
      extend(VectorError, superClass);

      function VectorError() {
        return VectorError.__super__.constructor.apply(this, arguments);
      }

      return VectorError;

    })(Error);
    return p.Vector = (function() {
      function Vector(x1, y1) {
        this.x = x1;
        this.y = y1;
      }

      Vector.prototype.vadd = function(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
      };

      Vector.prototype.vsub = function(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
      };

      Vector.prototype.vscale = function(other) {
        this.x *= other.x;
        this.y *= other.y;
        return this;
      };

      Vector.prototype.div = function(value) {
        if (value !== 0) {
          this.x /= value;
          this.y /= value;
        }
        return this;
      };

      Vector.prototype.scale = function(value) {
        this.x *= value;
        this.y *= value;
        return this;
      };

      Vector.prototype.normalize = function() {
        var mag, num;
        if (mag = this.magnitude()) {
          num = 1.0 / mag;
          this.x *= num;
          this.y *= num;
        }
        return this;
      };

      Vector.prototype.dot = function(other) {
        return this.x * other.x + this.y * other.y;
      };

      Vector.prototype.fromAngle = function(angle, magnitude) {
        return new p.Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
      };

      Vector.prototype.distanceTo = function(other) {
        return Math.sqrt((this.x - other.x) * (this.x - other.x) + (this.y - other.y) * (this.y - other.y));
      };

      Vector.prototype.vectorTowards = function(other) {
        return new p.Vector(other.x - this.x, other.y - this.y).normalize();
      };

      Vector.prototype.magnitude = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
      };

      Vector.prototype.angle = function() {
        return Math.atan2(this.y, this.x);
      };

      Vector.prototype.toArray = function() {
        return [this.x, this.y];
      };

      Vector.prototype.copy = function() {
        return new p.Vector(this.x, this.y);
      };

      Vector.prototype.zero = function() {
        return this.scale(0);
      };

      return Vector;

    })();
  })(Physics);

  (function(p) {
    return p.View = (function() {
      function View(particle, $el) {
        this.particle = particle;
        this.$el = $el;
        p.pubsub(this);
      }

      View.prototype.top = function() {
        if (this.particle.radius) {
          return this.particle.position.y - this.particle.radius;
        } else {
          return this.particle.position.y;
        }
      };

      View.prototype.left = function() {
        if (this.particle.radius) {
          return this.particle.position.x - this.particle.radius;
        } else {
          return this.particle.position.x;
        }
      };

      View.prototype.render = function() {
        this.$el.css({
          position: 'absolute',
          top: this.top() + 'px',
          left: this.left() + 'px'
        });
        return this.emit('render');
      };

      return View;

    })();
  })(Physics);

  (function(p) {
    return p.World = (function() {
      function World(bodies1, options) {
        this.bodies = bodies1;
        this.setParams(options);
        p.pubsub(this);
      }

      World.prototype.changeSize = function(width, height) {
        this.width = width;
        this.height = height;
        return this.boundingBox.set({
          width: this.width,
          height: this.height
        });
      };

      World.prototype.setParams = function(options) {
        this.width = options.width, this.height = options.height, this.animationDelay = options.animationDelay, this.friction = options.friction, this.cap = options.cap, this.firmCollisions = options.firmCollisions, this.fps = options.fps, this.behaviors = options.behaviors, this.integrator = options.integrator;
        this.fps || (this.fps = 60);
        this.behaviors || (this.behaviors = []);
        this.integrator || (this.integrator = new p.Integrator.Euler(1 / this.fps));
        return this.boundingBox = new p.Rectangle(0, 0, this.width, this.height);
      };

      World.prototype.addBehavior = function() {
        var item, items, j, len, results;
        items = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        results = [];
        for (j = 0, len = items.length; j < len; j++) {
          item = items[j];
          results.push(this.behaviors.push(item));
        }
        return results;
      };

      World.prototype.step = function() {
        var behavior, j, len, ref;
        this.integrator.update(this.bodies);
        ref = this.behaviors;
        for (j = 0, len = ref.length; j < len; j++) {
          behavior = ref[j];
          behavior.update(this.bodies, this);
        }
        return this.emit('step');
      };

      return World;

    })();
  })(Physics);

  (function(p) {
    var animFn;
    animFn = window.requestAnimationFrame || function(fn) {
      return window.setTimeout(fn, 16);
    };
    return p.WorldView = (function() {
      function WorldView(world1, particleViews, $el) {
        this.world = world1;
        this.particleViews = particleViews;
        this.$el = $el;
        p.pubsub(this);
        this.world.on('stop', (function(_this) {
          return function() {
            _this.stop();
            return _this.render();
          };
        })(this));
      }

      WorldView.prototype.render = function() {
        var j, len, ref, view;
        ref = this.particleViews;
        for (j = 0, len = ref.length; j < len; j++) {
          view = ref[j];
          view.render();
        }
        return this.emit('render');
      };

      WorldView.prototype._loop = function() {
        return animFn((function(_this) {
          return function() {
            if (_this.running) {
              _this.render();
              return _this._loop();
            }
          };
        })(this));
      };

      WorldView.prototype.start = function() {
        if (this.running) {
          return;
        }
        this.running = true;
        return this._loop();
      };

      WorldView.prototype.stop = function() {
        return this.running = false;
      };

      WorldView.prototype.fpsToMs = function(fps) {
        return 1000 / fps;
      };

      return WorldView;

    })();
  })(Physics);

}).call(this);
