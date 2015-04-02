do (p = Physics, b = Physics.Behavior) ->
  radius = 25

  $signs = $('.circle, .square')
  $world = $('.world')
  signs = []
  views = []

  $signs.each (idx) ->
    $sign = $(this)

    particle = if $sign.hasClass('circle')
      new p.Circle(
        $sign.data().x, $sign.data().y,
        $sign.data().radius || radius,
        $sign.data())

    else
      new p.Rectangle(
        $sign.data().x, $sign.data().y,
        $sign.data().width  || radius * 2,
        $sign.data().height || radius * 2,
        $sign.data())

    $sign.html(idx)
    signs.push particle
    views.push new p.View(particle, $sign)

  window.springs = for data in $world.data().springs
    new p.Spring(signs[data[0]], signs[data[1]],
      stiffness: 2, desiredLength: data[2], dampening: 5)

  window.repellers = signs
  #for data in $world.data().repellers
    #$($signs[data]).addClass('emp')
    #signs[data]

  springBehavior = new b.Springs springs
  repelBehavior = new b.Repellers repellers, strength: 50, distance: 100

  window.world = new p.World(signs, width: 1000, height: 500)
  world.addBehavior(
    springBehavior,
    new b.ParticleCollisions(),
    repelBehavior,
    new b.ConstantFriction(0.1),
    new b.EdgeCollisions(0.2),
    )

  worldView = new p.WorldView world, views, $world

  worldView.on 'render', ->
    #$world.find('.line').remove()
  springs.forEach (spring) ->
    #worldView.on 'render', ->
      #if spring.left.distanceTo(spring.right) < 1000
        #$world.line(spring.left.position.x, spring.left.position.y, spring.right.position.x, spring.right.position.y)


  window.timer = p.timer().on('tick', (t) -> world.step(t))
  timer.on 'tick', (time, sync) -> worldView.render() unless sync
  timer.on 'stop', () -> worldView.render()
  timer.start()
