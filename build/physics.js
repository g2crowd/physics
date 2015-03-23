(function() {
  var Physics,
    slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.Physics = Physics = {};

  (function(p) {
    var circlesCollide;
    circlesCollide = function(left, right) {
      var combinedSize, dx, dy;
      combinedSize = left.radius + right.radius;
      dx = left.position().x - right.position().x;
      dy = left.position().y - right.position().y;
      return dx * dx + dy * dy < combinedSize * combinedSize;
    };
    return p.collisions = {
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
      circleOutOfBounds: function(circle, bounds) {
        var edgeBottom, edgeLeft, edgeRight, edgeTop, rectBottom, rectLeft, rectRight, rectTop, xCorrection, yCorrection;
        edgeLeft = circle.position().x - circle.radius;
        edgeRight = circle.position().x + circle.radius;
        edgeTop = circle.position().y - circle.radius;
        edgeBottom = circle.position().y + circle.radius;
        rectLeft = bounds.position().x;
        rectRight = bounds.position().x + bounds.width;
        rectTop = bounds.position().y;
        rectBottom = bounds.position().y + bounds.height;
        xCorrection = yCorrection = 0;
        if (edgeLeft < rectLeft) {
          xCorrection = rectLeft - edgeLeft;
        }
        if (edgeRight > rectRight) {
          xCorrection = rectRight - edgeRight;
        }
        if (edgeTop < rectTop) {
          yCorrection = rectTop - edgeTop;
        }
        if (edgeBottom > rectBottom) {
          yCorrection = rectBottom - edgeBottom;
        }
        if (xCorrection || yCorrection) {
          return new p.Vector(xCorrection, yCorrection);
        } else {
          return false;
        }
      }
    };
  })(Physics);

  (function(p) {
    return p.Circle = (function() {
      function Circle(x, y, radius) {
        this.radius = radius;
        this.particle = new p.Particle(x, y);
      }

      Circle.prototype.position = function() {
        return this.particle.position;
      };

      Circle.prototype.acceleration = function() {
        if (this.frozen) {
          new p.Vector(0, 0);
        }
        return this.particle.acceleration;
      };

      Circle.prototype.velocity = function() {
        if (this.frozen) {
          new p.Vector(0, 0);
        }
        return this.particle.velocity;
      };

      Circle.prototype.applyForce = function(vector) {
        return this.acceleration().add(vector);
      };

      Circle.prototype.frozen = false;

      Circle.prototype.collidesWith = function(circle) {};

      Circle.prototype.move = function() {
        var args, ref;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        if (this.frozen) {
          return;
        }
        return (ref = this.particle).move.apply(ref, args);
      };

      Circle.prototype.distanceTo = function(other) {
        var left, right;
        left = this.position();
        right = other.position();
        return Math.sqrt((left.x - right.x) * (left.x - right.x) + (left.y - right.y) * (left.y - right.y));
      };

      Circle.prototype.vectorTowards = function(other) {
        return new p.Vector(this.position().x - other.position().x, this.position().y - other.position().y).normalized();
      };

      return Circle;

    })();
  })(Physics);

  (function(p) {
    return p.Particle = (function() {
      function Particle(x1, y1, velocity, acceleration) {
        this.x = x1;
        this.y = y1;
        this.position = new p.Vector(this.x, this.y);
        this.velocity = velocity || new p.Vector(0, 0);
        this.acceleration = acceleration || new p.Vector(0, 0);
      }

      Particle.prototype.applyForce = function(vector) {
        return this.acceleration.add(vector);
      };

      Particle.prototype.move = function(opts) {
        var cap, friction;
        if (opts == null) {
          opts = {};
        }
        friction = opts.friction, cap = opts.cap;
        this.velocity.add(this.acceleration);
        this.velocity.scale(friction);
        this.acceleration.scale(friction);
        if (cap && this.velocity.magnitude() > cap) {
          this.velocity.normalized().scale(cap);
        }
        return this.position.add(this.velocity);
      };

      return Particle;

    })();
  })(Physics);

  (function(p) {
    return p.Rectangle = (function(superClass) {
      extend(Rectangle, superClass);

      function Rectangle(x, y, width, height) {
        this.width = width;
        this.height = height;
        this.particle = new p.Particle(x, y);
      }

      return Rectangle;

    })(p.Circle);
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
        return this.left.velocity().copy().sub(this.right.velocity().copy());
      };

      Spring.prototype.calcForce = function(left, right) {
        var actual, fx, fy, norm, vel;
        actual = this.actualLength();
        norm = left.vectorTowards(right);
        vel = left.velocity().copy().sub(right.velocity());
        fx = -this.stiffness * (actual - this.desiredLength) * (norm.x / actual) - this.dampening * vel.x;
        fy = -this.stiffness * (actual - this.desiredLength) * (norm.y / actual) - this.dampening * vel.y;
        return new p.Vector(fx, fy);
      };

      Spring.prototype.update = function() {
        var leftForce, rightForce;
        leftForce = this.calcForce(this.left, this.right);
        rightForce = this.calcForce(this.right, this.left);
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
      }

      Timer.prototype.run = function(fn, options) {
        var iterations;
        if (options == null) {
          options = {};
        }
        iterations = options.iterations;
        this.running = true;
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
              }
            } else {
              return _this.runWithDelay(fn);
            }
          };
        })(this), this.delay);
      };

      Timer.prototype.runWithoutDelay = function(fn, iterations) {
        var count, results;
        if (!iterations) {
          throw p.TimerError;
        }
        count = 0;
        results = [];
        while (count < iterations) {
          fn();
          results.push(count = count + 1);
        }
        return results;
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

      Vector.prototype.add = function(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
      };

      Vector.prototype.sub = function(other) {
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

      Vector.prototype.magnitude = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
      };

      Vector.prototype.angle = function() {
        return Math.atan2(this.y, this.x);
      };

      Vector.prototype.fromAngle = function(angle, magnitude) {
        return new p.Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
      };

      Vector.prototype.normalized = function() {
        var mag, num;
        if (mag = this.magnitude()) {
          num = 1.0 / mag;
          this.x *= num;
          this.y *= num;
        }
        return this;
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
      }

      View.prototype.render = function() {
        this.$el.css({
          position: 'absolute',
          top: this.particle.position().y - this.particle.radius + 'px',
          left: this.particle.position().x - this.particle.radius + 'px'
        });
        return this.particle.dirty = false;
      };

      return View;

    })();
  })(Physics);

  (function(p) {
    return p.World = (function() {
      function World(bodies, springs, options) {
        this.bodies = bodies;
        this.springs = springs;
        this.width = options.width, this.height = options.height, this.animationDelay = options.animationDelay, this.friction = options.friction, this.cap = options.cap;
        this.boundingBox = new p.Rectangle(0, 0, this.width, this.height);
      }

      World.prototype.changeSize = function(width, height) {
        this.width = width;
        this.height = height;
        return this.boundingBox.set({
          width: this.width,
          height: this.height
        });
      };

      World.prototype.handleCollision = function(left, right, collisionVector) {
        if (this.firmCollisions || true) {
          left.position().add(collisionVector);
        }
        collisionVector.normalized().scale(1);
        return left.applyForce(collisionVector);
      };

      World.prototype.handleOutOfBounds = function(item, collisionVector) {
        return item.acceleration().add(collisionVector);
      };

      World.prototype.testCollisions = function(item) {
        var collisionVector, i, len, other, ref, results;
        ref = this.bodies;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          other = ref[i];
          if (item !== other) {
            if (collisionVector = p.collisions.circles(item, other)) {
              results.push(this.handleCollision(item, other, collisionVector));
            } else {
              results.push(void 0);
            }
          }
        }
        return results;
      };

      World.prototype.testBounds = function(item) {
        var collisionVector;
        if (collisionVector = p.collisions.circleOutOfBounds(item, this.boundingBox)) {
          return this.handleOutOfBounds(item, collisionVector);
        }
      };

      World.prototype.updateLoop = function() {
        var i, item, j, len, len1, ref, ref1, results, spring;
        ref = this.springs;
        for (i = 0, len = ref.length; i < len; i++) {
          spring = ref[i];
          spring.update();
        }
        ref1 = this.bodies;
        results = [];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          item = ref1[j];
          this.testBounds(item);
          this.testCollisions(item);
          results.push(item.move({
            friction: this.friction,
            cap: this.cap
          }));
        }
        return results;
      };

      World.prototype.start = function(delay, iterations) {
        return this.timer || (this.timer = new p.Timer(delay).run(((function(_this) {
          return function() {
            return _this.updateLoop();
          };
        })(this)), {
          iterations: iterations
        }));
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
      function WorldView(world, particleViews, $el) {
        this.world = world;
        this.particleViews = particleViews;
        this.$el = $el;
      }

      WorldView.prototype.render = function() {
        var i, len, ref, results, view;
        ref = this.particleViews;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          view = ref[i];
          results.push(view.render());
        }
        return results;
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
