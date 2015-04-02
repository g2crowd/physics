QUnit.test '#integrate', (assert) ->
  # given downward accel
  body = new Physics.Particle 0, 0, acceleration: new Physics.Vector(0, 2)

  # when integrated for 1 seconds
  @subject = new Physics.Integrator.Euler 1
  @subject.update [body], 1

  assert.equal body.position.y, 2, 'once pos'
  assert.equal body.velocity.y, 2, 'once vel'
  # reset accel
  assert.equal body.acceleration.y, 0

  # when integrated by 1 second twice
  @subject = new Physics.Integrator.Euler 1
  body = new Physics.Particle 0, 0, acceleration: new Physics.Vector(0, 2)
  @subject.update [body], 1
  body.acceleration = new Physics.Vector(0, 2)
  @subject.update [body], 1

  assert.equal body.position.y, 6, 'twice pos'
  assert.equal body.velocity.y, 4, 'twice vel'
