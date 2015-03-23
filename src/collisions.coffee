do (p = Physics) ->
  circlesCollide = (left, right) ->
    combinedSize = left.radius + right.radius
    dx = left.position().x - right.position().x
    dy = left.position().y - right.position().y

    dx * dx + dy * dy < combinedSize * combinedSize

  p.collisions =
    circles: (left, right) ->
      if circlesCollide left, right
        combinedSize = left.radius + right.radius
        overlap = combinedSize - left.distanceTo(right)

        collisionVector = left.vectorTowards(right)
        collisionVector.scale overlap
        collisionVector
      else
        false

    circleOutOfBounds: (circle, bounds) ->
      # for the love of...
      edgeLeft   = circle.position().x - circle.radius
      edgeRight  = circle.position().x + circle.radius
      edgeTop    = circle.position().y - circle.radius
      edgeBottom = circle.position().y + circle.radius

      rectLeft   = bounds.position().x
      rectRight  = bounds.position().x + bounds.width
      rectTop    = bounds.position().y
      rectBottom = bounds.position().y + bounds.height

      xCorrection = yCorrection = 0

      xCorrection = rectLeft - edgeLeft if edgeLeft < rectLeft
      xCorrection = rectRight - edgeRight if edgeRight > rectRight

      yCorrection = rectTop - edgeTop if edgeTop < rectTop
      yCorrection = rectBottom - edgeBottom if edgeBottom > rectBottom

      if xCorrection || yCorrection
        new p.Vector(xCorrection, yCorrection)
      else
        false
