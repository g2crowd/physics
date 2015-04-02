do (p = Physics) ->
  circlesCollide = (left, right) ->
    combinedSize = left.radius + right.radius
    dx = left.position.x - right.position.x
    dy = left.position.y - right.position.y

    dx * dx + dy * dy < combinedSize * combinedSize

  rectanglesCollide = (left, right) ->
    left.leftEdge() < right.rightEdge() && left.rightEdge() > right.leftEdge() &&
    left.topEdge() < right.bottomEdge() && left.bottomEdge() > right.topEdge()

  shorterCollisionVector = (a, b) ->
    intersection = a.intersectWith b

    if intersection.x < intersection.y
      new p.Vector intersection.x, 0
    else
      new p.Vector 0, intersection.y

  rectanglesCorrect = (a, b) ->
    vector = shorterCollisionVector(a, b)
    # above
    if a.topEdge() < b.topEdge()
      vector.y *= -1

    # to left
    if a.leftEdge() < b.leftEdge()
      vector.x *= -1

    vector

  p.collisions =
    collide: (left, right) ->
      fnName =
        if left.constructor.name == 'Rectangle' || right.constructor.name == 'Rectangle'
          'rectangles'
        else
          'circles'
      @[fnName](left, right)

    rectangles: (left, right) ->
      xCorrection = yCorrection = 0

      if rectanglesCollide left, right
        rectanglesCorrect(left, right)
      else
        false

    circles: (left, right) ->
      if circlesCollide left, right
        combinedSize = left.radius + right.radius
        overlap = combinedSize - left.distanceTo(right)

        collisionVector = right.vectorTowards(left)

        collisionVector.scale overlap
        collisionVector
      else
        false

    outOfBounds: (item, bounds) ->
      xCorrection = yCorrection = 0

      xCorrection = bounds.leftEdge() - item.leftEdge() if item.leftEdge() < bounds.leftEdge()
      xCorrection = bounds.rightEdge() - item.rightEdge() if item.rightEdge() > bounds.rightEdge()

      yCorrection = bounds.topEdge() - item.topEdge() if item.topEdge() < bounds.topEdge()
      yCorrection = bounds.bottomEdge() - item.bottomEdge() if item.bottomEdge() > bounds.bottomEdge()

      if xCorrection || yCorrection
        new p.Vector(xCorrection, yCorrection)
      else
        false
