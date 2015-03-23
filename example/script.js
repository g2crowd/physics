(function() {
  var $signs, $world, radius, sign, signs, springs, views, world, worldView;

  radius = 25;

  $signs = $('.sign');

  $world = $('.world');

  signs = [];

  views = [];

  $signs.each(function() {
    var $sign, particle;
    $sign = $(this);
    particle = new Physics.Circle($sign.data().x, $sign.data().y, radius);
    signs.push(particle);
    return views.push(new Physics.View(particle, $sign));
  });

  springs = (function() {
    var i, len, results;
    results = [];
    for (i = 0, len = signs.length; i < len; i++) {
      sign = signs[i];
      if (sign !== signs[0]) {
        results.push(new Physics.Spring(sign, signs[0], {
          stiffness: 2,
          desiredLength: 50,
          dampening: 0.5
        }));
      }
    }
    return results;
  })();

  world = new Physics.World(signs, springs, {
    width: 800,
    height: 800,
    friction: 0.1
  });

  worldView = new Physics.WorldView(world, views, $world);

  worldView.start();

  world.start(16);

}).call(this);
