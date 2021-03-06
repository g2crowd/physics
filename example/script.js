(function() {
  (function(p, b) {
    var $signs, $world, data, radius, repelBehavior, signs, springBehavior, views, worldView;
    radius = 25;
    $signs = $('.circle, .square');
    $world = $('.world');
    signs = [];
    views = [];
    $signs.each(function(idx) {
      var $sign, particle;
      $sign = $(this);
      particle = $sign.hasClass('circle') ? new p.Circle($sign.data().x, $sign.data().y, $sign.data().radius || radius, $sign.data()) : new p.Rectangle($sign.data().x, $sign.data().y, $sign.data().width || radius * 2, $sign.data().height || radius * 2, $sign.data());
      $sign.html(idx);
      signs.push(particle);
      return views.push(new p.View(particle, $sign));
    });
    window.springs = (function() {
      var i, len, ref, results;
      ref = $world.data().springs;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        data = ref[i];
        results.push(new p.Spring(signs[data[0]], signs[data[1]], {
          stiffness: 2,
          desiredLength: data[2],
          dampening: 5
        }));
      }
      return results;
    })();
    window.repellers = signs;
    springBehavior = new b.Springs(springs);
    repelBehavior = new b.Repellers(repellers, {
      strength: 10,
      distance: 1.1
    });
    window.world = new p.World(signs, {
      width: 1000,
      height: 500
    });
    world.addBehavior(new b.NudgeOverlaidBodies(), springBehavior, new b.ParticleCollisions(), repelBehavior, new b.ConstantFriction(0.1), new b.EdgeCollisions(0.2));
    worldView = new p.WorldView(world, views, $world);
    worldView.on('render', function() {});
    springs.forEach(function(spring) {});
    window.timer = p.timer().on('tick', function(t) {
      return world.step(t);
    });
    timer.on('tick', function(time, sync) {
      if (!sync) {
        return worldView.render();
      }
    });
    timer.on('stop', function() {
      return worldView.render();
    });
    return timer.start();
  })(Physics, Physics.Behavior);

}).call(this);
