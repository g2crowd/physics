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
        velocity = opts.velocity, acceleration = opts.acceleration, this.mass = opts.mass, this.role = opts.role;
        this.position = new p.Vector(x, y);
        this.velocity = velocity || new p.Vector(0, 0);
        this.acceleration = acceleration || new p.Vector(0, 0);
        this.mass || (this.mass = 1);
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

      Particle.prototype.distanceTo = function(other) {
        var left, right;
        left = this.position;
        right = other.position;
        return Math.sqrt((left.x - right.x) * (left.x - right.x) + (left.y - right.y) * (left.y - right.y));
      };

      Particle.prototype.vectorTowards = function(other) {
        return new p.Vector(this.position.x - other.position.x, this.position.y - other.position.y).normalize();
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
        body.velocity.scale(this.factor);
        return body.acceleration.scale(this.factor);
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
        return item.applyForce(collisionVector.scale(this.restitution));
      };

      return EdgeCollisions;

    })();
  })(Physics, Physics.Behavior);

  (function(p, b) {
    return b.Gravity = (function() {
      function Gravity(force) {
        this.force = force != null ? force : new p.Vector(0, 9.81);
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
        this.firm = opts.firm, this.restitution = opts.restitution;
        this.restitution || (this.restitution = 10);
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
        results = [];
        for (j = 0, len = bodies.length; j < len; j++) {
          other = bodies[j];
          if (!(body !== other)) {
            continue;
          }
          this.correctPerfectOverlays(body, other);
          if (collisionVector = p.collisions.collide(body, other)) {
            results.push(this.handleCollision(body, collisionVector));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };

      ParticleCollisions.prototype.handleCollision = function(body, collisionVector) {
        if (this.firm) {
          body.translate(collisionVector);
          return body.applyForce(collisionVector.scale(this.restitution));
        } else {
          return body.applyForce(collisionVector.scale(this.restitution));
        }
      };

      ParticleCollisions.prototype.correctPerfectOverlays = function(a, b) {
        if (a.occupiesSameSpaceAs(b)) {
          return a.translate(new p.Vector(1, 1));
        }
      };

      return ParticleCollisions;

    })();
  })(Physics, Physics.Behavior);

  (function(b) {
    return b.Springs = (function() {
      function Springs(list) {
        this.list = list;
      }

      Springs.prototype.addNew = function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return this.list.push((function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(p.Physics.Spring, args, function(){}));
      };

      Springs.prototype.add = function(spring) {
        return this.list.push(spring);
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
  })(Physics.Behavior);

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
          collisionVector = left.vectorTowards(right);
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

  (function(i) {
    return i.Euler = (function() {
      function Euler(min) {
        this.min = min != null ? min : 0.1;
      }

      Euler.prototype.update = function(bodies, timeStep) {
        var body, j, len, results;
        results = [];
        for (j = 0, len = bodies.length; j < len; j++) {
          body = bodies[j];
          results.push(this.integrate(body, timeStep));
        }
        return results;
      };

      Euler.prototype.integrate = function(body, timeStep) {
        if (body.dynamic()) {
          body.velocity.vadd(body.acceleration.copy().scale(timeStep));
          this.capMinimums(body);
          return body.position.vadd(body.velocity.copy().scale(timeStep));
        } else {
          body.velocity.scale(0);
          return body.acceleration.scale(0);
        }
      };

      Euler.prototype.capMinimums = function(body) {
        var ref, ref1;
        if ((0 < (ref = body.velocity.magnitude()) && ref < this.min)) {
          body.velocity.scale(0);
        }
        if ((0 < (ref1 = body.acceleration.magnitude()) && ref1 < this.min)) {
          return body.acceleration.scale(0);
        }
      };

      return Euler;

    })();
  })(Physics.Integrator);

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

      return Rectangle;

    })(p.Particle);
  })(Physics);

  (function(p) {
    return p.pubsub = function(subject) {
      var me;
      if (subject == null) {
        subject = {};
      }
      me = {
        functions: {},
        on: function(topic, callback) {
          if (!me.functions[topic]) {
            me.functions[topic] = [];
          }
          return me.functions[topic].push(callback);
        },
        emit: function(topic, args) {
          var fn, j, len, ref, results;
          if (!me.functions[topic]) {
            return;
          }
          ref = me.functions[topic];
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            fn = ref[j];
            results.push(fn.apply(me, args || []));
          }
          return results;
        },
        off: function(topic, func) {
          var fn, j, len, ref, results;
          if (!topic) {
            return me.functions = {};
          } else if (!func) {
            return me.functions[topic] = [];
          } else {
            ref = me.functions[topic];
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
              fn = ref[j];
              if (fn === func) {
                results.push(me.functions[topic].splice(i, 1));
              }
            }
            return results;
          }
        }
      };
      subject.on = me.on;
      subject.off = me.off;
      subject.emit = me.emit;
      return me;
    };
  })(Physics);

  (function(p) {
    return p.Spring = (function() {
      function Spring(left1, right1, options) {
        this.left = left1;
        this.right = right1;
        this.stiffness = options.stiffness, this.desiredLength = options.desiredLength, this.dampening = options.dampening;
      }

      Spring.prototype.actualLength = function() {
        return Math.abs(this.left.distanceTo(this.right));
      };

      Spring.prototype.resting = function() {
        return this.actualLength() === this.desiredLength;
      };

      Spring.prototype.stress = function() {
        return this.actualLength() - this.desiredLength;
      };

      Spring.prototype.attraction = function() {
        return -this.stiffness * this.stress();
      };

      Spring.prototype.relativeVelocity = function() {
        return this.left.velocity.copy().sub(this.right.velocity.copy());
      };

      Spring.prototype.calc = function(left, right) {
        var actual, dx, dy, fx, fy, norm, vel;
        actual = this.actualLength();
        norm = left.vectorTowards(right);
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
    p.TimerError = (function(superClass) {
      extend(TimerError, superClass);

      function TimerError() {
        return TimerError.__super__.constructor.apply(this, arguments);
      }

      return TimerError;

    })(Error);
    return p.Timer = (function() {
      function Timer(delay1) {
        this.delay = delay1;
        p.pubsub(this);
      }

      Timer.prototype.run = function(fn, options) {
        var iterations;
        if (options == null) {
          options = {};
        }
        iterations = options.iterations;
        this.running = true;
        this.emit('start');
        if (this.delay) {
          return this.runWithDelay(fn, iterations);
        } else {
          return this.runWithoutDelay(fn, iterations);
        }
      };

      Timer.prototype.stop = function() {
        return this.running = false;
      };

      Timer.prototype.runWithDelay = function(fn, iterations, count) {
        if (count == null) {
          count = 0;
        }
        return window.setTimeout((function(_this) {
          return function() {
            if (!_this.running) {
              return;
            }
            fn();
            if (iterations) {
              count = count + 1;
              if (count < iterations) {
                return _this.runWithDelay(fn, iterations, count);
              } else {
                return _this.emit('stop');
              }
            } else {
              return _this.runWithDelay(fn);
            }
          };
        })(this), this.delay);
      };

      Timer.prototype.runWithoutDelay = function(fn, iterations) {
        var count;
        if (!iterations) {
          throw p.TimerError;
        }
        count = 0;
        while (count < iterations) {
          fn();
          count = count + 1;
        }
        return this.emit('stop');
      };

      return Timer;

    })();
  })(Physics);

  (function(p) {
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
        this.integrator || (this.integrator = new p.Integrator.Euler);
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

      World.prototype.updateLoop = function() {
        var behavior, j, len, ref, timeStep;
        timeStep = this.fps / 1000;
        ref = this.behaviors;
        for (j = 0, len = ref.length; j < len; j++) {
          behavior = ref[j];
          behavior.update(this.bodies, this);
        }
        this.integrator.update(this.bodies, timeStep);
        return this.emit('step');
      };

      World.prototype.setFps = function(val) {
        this._delay = null;
        return this.fps = val;
      };

      World.prototype.delay = function() {
        return this._delay != null ? this._delay : this._delay = 1000 / this.fps;
      };

      World.prototype.start = function(iterations, delay) {
        if (!this.timer) {
          this.timer = new p.Timer(delay || this.delay());
          this.timer.on('start', (function(_this) {
            return function() {
              return _this.emit('start');
            };
          })(this));
          this.timer.on('stop', (function(_this) {
            return function() {
              return _this.emit('stop');
            };
          })(this));
          return this.timer.run((function(_this) {
            return function() {
              return _this.updateLoop();
            };
          })(this), {
            iterations: iterations
          });
        }
      };

      World.prototype.stop = function() {
        this.timer.stop();
        return this.timer = null;
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
