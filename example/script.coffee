radius = 25

$signs = $('.sign')
$world = $('.world')
signs = []
views = []

$signs.each ->
  $sign = $(this)
  particle = new Physics.Circle($sign.data().x, $sign.data().y, radius)
  signs.push particle
  views.push new Physics.View(particle, $sign)

# signs[0].frozen = true
springs = for sign in signs when sign != signs[0]
  new Physics.Spring(sign, signs[0], stiffness: 2, desiredLength: 50, dampening: 0.5)

world = new Physics.World(signs, springs, width: 800, height: 800, friction: 0.1)
worldView = new Physics.WorldView world, views, $world

worldView.start()
world.start(16)
