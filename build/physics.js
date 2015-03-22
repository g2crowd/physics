(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (function(p) {
    p.AnimationError = (function(superClass) {
      extend(AnimationError, superClass);

      function AnimationError() {
        return AnimationError.__super__.constructor.apply(this, arguments);
      }

      return AnimationError;

    })(Error);
    return p.Animation = (function() {
      function Animation(delay) {
        this.delay = delay;
      }

      Animation.prototype.run = function(fn, options) {
        var iterations;
        iterations = options.iterations;
        if (this.delay) {
          return this.runWithDelay(fn, iterations);
        } else {
          return this.runWithoutDelay(fn, iterations);
        }
      };

      Animation.prototype.runWithDelay = function(fn, iterations, count) {
        if (count == null) {
          count = 0;
        }
        return window.setTimeout((function(_this) {
          return function() {
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

      Animation.prototype.runWithoutDelay = function(fn, iterations) {
        var i, j, len, results;
        if (!iterations) {
          throw p.AnimationError;
        }
        results = [];
        for (j = 0, len = iterations.length; j < len; j++) {
          i = iterations[j];
          results.push(fn());
        }
        return results;
      };

      return Animation;

    })();
  })(Physics);

  (function(p) {
    return p.Circle = (function(superClass) {
      extend(Circle, superClass);

      function Circle(x, y, radius) {
        this.radius = radius;
        this.particle = new p.Particle(this.x, this.y);
      }

      return Circle;

    })(p.Particle);
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

      Particle.prototype.move = function(friction) {
        if (friction == null) {
          friction = 1;
        }
        this.velocity.add(this.acceleration);
        this.velocity.scale(friction);
        return this.position.add(this.velocity);
      };

      return Particle;

    })();
  })(Physics);

  (function(p) {
    return p.Rectangle = (function() {
      function Rectangle(x, y, width, height) {
        this.width = width;
        this.height = height;
        this.particle = new p.Particle(x, y);
      }

      return Rectangle;

    })();
  })(Physics);

  window.Physics || (window.Physics = {});

  (function(p) {
    return p.Spring = (function() {
      function Spring(left, right, options) {
        this.left = left;
        this.right = right;
        this.stiffness = options.stiffness, this.length = options.length;
      }

      return Spring;

    })();
  })(Physics);

  (function(d) {
    return p.Vector = (function() {
      function Vector(x1, y1) {
        this.x = x1;
        this.y = y1;
      }

      Vector.prototype.add = function(other) {
        this.x += other.x;
        return this.y += other.y;
      };

      Vector.prototype.multiplyScalar = function(value) {
        this.x *= value;
        return this.y *= value;
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

      return Vector;

    })();
  })(Physics);

  (function(p) {
    return p.View = (function() {
      function View(particle, $el) {
        this.particle = particle;
        this.$el = $el;
        this.particle.on('change', (function(_this) {
          return function() {
            return _this.render();
          };
        })(this));
      }

      View.prototype.render = function() {
        return this.$el.css({
          position: 'absolute',
          top: this.particle.get('y') + 'px',
          left: this.particle.get('x') + 'px'
        });
      };

      return View;

    })();
  })(Physics);

  (function(p) {
    return p.World = (function() {
      function World(positions, options) {
        this.width = options.width, this.height = options.height, this.animationDelay = options.animationDelay;
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

      World.prototype.animate = function() {};

      return World;

    })();
  })(Physics);

}).call(this);
