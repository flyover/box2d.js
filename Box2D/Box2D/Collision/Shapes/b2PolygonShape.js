/*
 * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

goog.provide('box2d.b2PolygonShape');

goog.require('box2d.b2Shape');

/**
 * A convex polygon. It is assumed that the interior of the
 * polygon is to the left of each edge.
 * Polygons have a maximum number of vertices equal to
 * box2d.b2_maxPolygonVertices. In most cases you should not
 * need many vertices for a convex polygon.
 * @export
 * @constructor
 * @extends {box2d.b2Shape}
 */
box2d.b2PolygonShape = function() {
  box2d.b2Shape.call(this, box2d.b2ShapeType.e_polygonShape, box2d.b2_polygonRadius); // base class constructor

  this.m_centroid = new box2d.b2Vec2(0, 0);
  this.m_vertices = box2d.b2Vec2.MakeArray(box2d.b2_maxPolygonVertices);
  this.m_normals = box2d.b2Vec2.MakeArray(box2d.b2_maxPolygonVertices);
}

goog.inherits(box2d.b2PolygonShape, box2d.b2Shape);

/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2PolygonShape.prototype.m_centroid = null;
/**
 * @export
 * @type {Array.<box2d.b2Vec2>}
 */
box2d.b2PolygonShape.prototype.m_vertices = null;
/**
 * @export
 * @type {Array.<box2d.b2Vec2>}
 */
box2d.b2PolygonShape.prototype.m_normals = null;
/**
 * @export
 * @type {number}
 */
box2d.b2PolygonShape.prototype.m_count = 0;

/**
 * Implement box2d.b2Shape.
 * @export
 * @return {box2d.b2Shape}
 */
box2d.b2PolygonShape.prototype.Clone = function() {
  return new box2d.b2PolygonShape().Copy(this);
}

/**
 * @export
 * @return {box2d.b2Shape}
 * @param {box2d.b2Shape} other
 */
box2d.b2PolygonShape.prototype.Copy = function(other) {
  box2d.b2Shape.prototype.Copy.call(this, other);

  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(other instanceof box2d.b2PolygonShape);
  }

  this.m_centroid.Copy(other.m_centroid);
  this.m_count = other.m_count;
  for (var i = 0, ict = this.m_count; i < ict; ++i) {
    this.m_vertices[i].Copy(other.m_vertices[i]);
    this.m_normals[i].Copy(other.m_normals[i]);
  }
  return this;
}

/**
 * Build vertices to represent an axis-aligned box centered on
 * the local origin.
 * @export
 * @return {box2d.b2PolygonShape}
 * @param {number} hx the half-width.
 * @param {number} hy the half-height.
 * @param {box2d.b2Vec2=} center the center of the box in local coordinates.
 * @param {number=} angle the rotation of the box in local coordinates.
 */
box2d.b2PolygonShape.prototype.SetAsBox = function(hx, hy, center, angle) {
  this.m_count = 4;
  this.m_vertices[0].Set((-hx), (-hy));
  this.m_vertices[1].Set(hx, (-hy));
  this.m_vertices[2].Set(hx, hy);
  this.m_vertices[3].Set((-hx), hy);
  this.m_normals[0].Set(0, (-1));
  this.m_normals[1].Set(1, 0);
  this.m_normals[2].Set(0, 1);
  this.m_normals[3].Set((-1), 0);
  this.m_centroid.SetZero();

  if (center instanceof box2d.b2Vec2) {
    angle = (typeof(angle) === 'number') ? (angle) : (0);

    this.m_centroid.Copy(center);

    var xf = new box2d.b2Transform();
    xf.SetPosition(center);
    xf.SetRotationAngle(angle);

    // Transform vertices and normals.
    for (var i = 0, ict = this.m_count; i < ict; ++i) {
      box2d.b2Mul_X_V2(xf, this.m_vertices[i], this.m_vertices[i]);
      box2d.b2Mul_R_V2(xf.q, this.m_normals[i], this.m_normals[i]);
    }
  }

  return this;
}

/**
 * Create a convex hull from the given array of local points.
 * The count must be in the range [3, b2_maxPolygonVertices].
 * warning the points may be re-ordered, even if they form a
 * convex polygon
 * warning collinear points are handled but not removed.
 * Collinear points may lead to poor stacking behavior.
 * @export
 * @return {box2d.b2PolygonShape}
 * @param {Array.<box2d.b2Vec2>} vertices
 * @param {number=} count
 * @param {number=} start
 */
box2d.b2PolygonShape.prototype.Set = function(vertices, count, start) {
  count = (typeof(count) === 'number') ? (count) : (vertices.length);
  start = (typeof(start) === 'number') ? (start) : (0);

  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(3 <= count && count <= box2d.b2_maxPolygonVertices);
  }
  if (count < 3) {
    return this.SetAsBox(1, 1);
  }

  var n = box2d.b2Min(count, box2d.b2_maxPolygonVertices);

  // Perform welding and copy vertices into local buffer.
  var ps = box2d.b2PolygonShape.prototype.Set.s_ps;
  var tempCount = 0;
  for (var i = 0; i < n; ++i) {
    var /*b2Vec2*/ v = vertices[start + i];

    var /*bool*/ unique = true;
    for (var /*int32*/ j = 0; j < tempCount; ++j) {
      if (box2d.b2DistanceSquared(v, ps[j]) < ((0.5 * box2d.b2_linearSlop) * (0.5 * box2d.b2_linearSlop))) {
        unique = false;
        break;
      }
    }

    if (unique) {
      ps[tempCount++].Copy(v); // ps[tempCount++] = v;
    }
  }

  n = tempCount;
  if (n < 3) {
    // Polygon is degenerate.
    if (box2d.ENABLE_ASSERTS) {
      box2d.b2Assert(false);
    }
    return this.SetAsBox(1.0, 1.0);
  }

  // Create the convex hull using the Gift wrapping algorithm
  // http://en.wikipedia.org/wiki/Gift_wrapping_algorithm

  // Find the right most point on the hull
  var i0 = 0;
  var x0 = ps[0].x;
  for (var i = 1; i < n; ++i) {
    var x = ps[i].x;
    if (x > x0 || (x === x0 && ps[i].y < ps[i0].y)) {
      i0 = i;
      x0 = x;
    }
  }

  var hull = box2d.b2PolygonShape.prototype.Set.s_hull;
  var m = 0;
  var ih = i0;

  for (;;) {
    hull[m] = ih;

    var ie = 0;
    for (var j = 1; j < n; ++j) {
      if (ie === ih) {
        ie = j;
        continue;
      }

      var r = box2d.b2Sub_V2_V2(ps[ie], ps[hull[m]], box2d.b2PolygonShape.prototype.Set.s_r);
      var v = box2d.b2Sub_V2_V2(ps[j], ps[hull[m]], box2d.b2PolygonShape.prototype.Set.s_v);
      var c = box2d.b2Cross_V2_V2(r, v);
      if (c < 0) {
        ie = j;
      }

      // Collinearity check
      if (c === 0 && v.LengthSquared() > r.LengthSquared()) {
        ie = j;
      }
    }

    ++m;
    ih = ie;

    if (ie === i0) {
      break;
    }
  }

  if (m < 3) {
    // Polygon is degenerate
    if (box2d.ENABLE_ASSERTS) {
      box2d.b2Assert(false);
    }
    return this.SetAsBox(1.0, 1.0);
  }

  this.m_count = m;

  // Copy vertices.
  for (var i = 0; i < m; ++i) {
    this.m_vertices[i].Copy(ps[hull[i]]);
  }

  // Compute normals. Ensure the edges have non-zero length.
  for (var i = 0, ict = m; i < ict; ++i) {
    var vertexi1 = this.m_vertices[i];
    var vertexi2 = this.m_vertices[(i + 1) % ict];
    var edge = box2d.b2Sub_V2_V2(vertexi2, vertexi1, box2d.b2Vec2.s_t0); // edge uses s_t0
    if (box2d.ENABLE_ASSERTS) {
      box2d.b2Assert(edge.LengthSquared() > box2d.b2_epsilon_sq);
    }
    box2d.b2Cross_V2_S(edge, 1.0, this.m_normals[i]).SelfNormalize();
  }

  // Compute the polygon centroid.
  box2d.b2PolygonShape.ComputeCentroid(this.m_vertices, m, this.m_centroid);

  return this;
}
box2d.b2PolygonShape.prototype.Set.s_ps = box2d.b2Vec2.MakeArray(box2d.b2_maxPolygonVertices);
box2d.b2PolygonShape.prototype.Set.s_hull = box2d.b2MakeNumberArray(box2d.b2_maxPolygonVertices);
box2d.b2PolygonShape.prototype.Set.s_r = new box2d.b2Vec2();
box2d.b2PolygonShape.prototype.Set.s_v = new box2d.b2Vec2();

/**
 * Implement box2d.b2Shape.
 * @export
 * @return {number}
 */
box2d.b2PolygonShape.prototype.GetChildCount = function() {
  return 1;
}

/**
 * @see box2d.b2Shape::TestPoint
 * @export
 * @return {boolean}
 * @param {box2d.b2Transform} xf
 * @param {box2d.b2Vec2} p
 */
box2d.b2PolygonShape.prototype.TestPoint = function(xf, p) {
  var pLocal = box2d.b2MulT_X_V2(xf, p, box2d.b2PolygonShape.prototype.TestPoint.s_pLocal);

  for (var i = 0, ict = this.m_count; i < ict; ++i) {
    var dot = box2d.b2Dot_V2_V2(this.m_normals[i], box2d.b2Sub_V2_V2(pLocal, this.m_vertices[i], box2d.b2Vec2.s_t0));
    if (dot > 0) {
      return false;
    }
  }

  return true;
}
box2d.b2PolygonShape.prototype.TestPoint.s_pLocal = new box2d.b2Vec2();

//#if B2_ENABLE_PARTICLE

/**
 * @see b2Shape::ComputeDistance
 * @export
 * @return {number}
 * @param {box2d.b2Transform} xf
 * @param {box2d.b2Vec2} p
 * @param {box2d.b2Vec2} normal
 * @param {number} childIndex
 */
box2d.b2PolygonShape.prototype.ComputeDistance = function(xf, p, normal, childIndex) {
  var pLocal = box2d.b2MulT_X_V2(xf, p, box2d.b2PolygonShape.prototype.ComputeDistance.s_pLocal);
  var maxDistance = -box2d.b2_maxFloat;
  var normalForMaxDistance = box2d.b2PolygonShape.prototype.ComputeDistance.s_normalForMaxDistance.Copy(pLocal);

  for (var i = 0; i < this.m_count; ++i) {
    var dot = box2d.b2Dot_V2_V2(this.m_normals[i], box2d.b2Sub_V2_V2(pLocal, this.m_vertices[i], box2d.b2Vec2.s_t0));
    if (dot > maxDistance) {
      maxDistance = dot;
      normalForMaxDistance.Copy(this.m_normals[i]);
    }
  }

  if (maxDistance > 0) {
    var minDistance = box2d.b2PolygonShape.prototype.ComputeDistance.s_minDistance.Copy(normalForMaxDistance);
    var minDistance2 = maxDistance * maxDistance;
    for (var i = 0; i < this.m_count; ++i) {
      var distance = box2d.b2Sub_V2_V2(pLocal, this.m_vertices[i], box2d.b2PolygonShape.prototype.ComputeDistance.s_distance);
      var distance2 = distance.LengthSquared();
      if (minDistance2 > distance2) {
        minDistance.Copy(distance);
        minDistance2 = distance2;
      }
    }

    box2d.b2Mul_R_V2(xf.q, minDistance, normal);
    normal.Normalize();
    return Math.sqrt(minDistance2);
  } else {
    box2d.b2Mul_R_V2(xf.q, normalForMaxDistance, normal);
    return maxDistance;
  }
}
box2d.b2PolygonShape.prototype.ComputeDistance.s_pLocal = new box2d.b2Vec2();
box2d.b2PolygonShape.prototype.ComputeDistance.s_normalForMaxDistance = new box2d.b2Vec2();
box2d.b2PolygonShape.prototype.ComputeDistance.s_minDistance = new box2d.b2Vec2();
box2d.b2PolygonShape.prototype.ComputeDistance.s_distance = new box2d.b2Vec2();

//#endif

/**
 * Implement box2d.b2Shape.
 * @export
 * @return {boolean}
 * @param {box2d.b2RayCastOutput} output
 * @param {box2d.b2RayCastInput} input
 * @param {box2d.b2Transform} xf
 * @param {number} childIndex
 */
box2d.b2PolygonShape.prototype.RayCast = function(output, input, xf, childIndex) {
  // Put the ray into the polygon's frame of reference.
  var p1 = box2d.b2MulT_X_V2(xf, input.p1, box2d.b2PolygonShape.prototype.RayCast.s_p1);
  var p2 = box2d.b2MulT_X_V2(xf, input.p2, box2d.b2PolygonShape.prototype.RayCast.s_p2);
  var d = box2d.b2Sub_V2_V2(p2, p1, box2d.b2PolygonShape.prototype.RayCast.s_d);

  var lower = 0,
    upper = input.maxFraction;

  var index = -1;

  for (var i = 0, ict = this.m_count; i < ict; ++i) {
    // p = p1 + a * d
    // dot(normal, p - v) = 0
    // dot(normal, p1 - v) + a * dot(normal, d) = 0
    var numerator = box2d.b2Dot_V2_V2(this.m_normals[i], box2d.b2Sub_V2_V2(this.m_vertices[i], p1, box2d.b2Vec2.s_t0));
    var denominator = box2d.b2Dot_V2_V2(this.m_normals[i], d);

    if (denominator === 0) {
      if (numerator < 0) {
        return false;
      }
    } else {
      // Note: we want this predicate without division:
      // lower < numerator / denominator, where denominator < 0
      // Since denominator < 0, we have to flip the inequality:
      // lower < numerator / denominator <==> denominator * lower > numerator.
      if (denominator < 0 && numerator < lower * denominator) {
        // Increase lower.
        // The segment enters this half-space.
        lower = numerator / denominator;
        index = i;
      } else if (denominator > 0 && numerator < upper * denominator) {
        // Decrease upper.
        // The segment exits this half-space.
        upper = numerator / denominator;
      }
    }

    // The use of epsilon here causes the assert on lower to trip
    // in some cases. Apparently the use of epsilon was to make edge
    // shapes work, but now those are handled separately.
    //if (upper < lower - box2d.b2_epsilon)
    if (upper < lower) {
      return false;
    }
  }

  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(0 <= lower && lower <= input.maxFraction);
  }

  if (index >= 0) {
    output.fraction = lower;
    box2d.b2Mul_R_V2(xf.q, this.m_normals[index], output.normal);
    return true;
  }

  return false;
}
box2d.b2PolygonShape.prototype.RayCast.s_p1 = new box2d.b2Vec2();
box2d.b2PolygonShape.prototype.RayCast.s_p2 = new box2d.b2Vec2();
box2d.b2PolygonShape.prototype.RayCast.s_d = new box2d.b2Vec2();

/**
 * @see box2d.b2Shape::ComputeAABB
 * @export
 * @return {void}
 * @param {box2d.b2AABB} aabb
 * @param {box2d.b2Transform} xf
 * @param {number} childIndex
 */
box2d.b2PolygonShape.prototype.ComputeAABB = function(aabb, xf, childIndex) {
  var lower = box2d.b2Mul_X_V2(xf, this.m_vertices[0], aabb.lowerBound);
  var upper = aabb.upperBound.Copy(lower);

  for (var i = 0, ict = this.m_count; i < ict; ++i) {
    var v = box2d.b2Mul_X_V2(xf, this.m_vertices[i], box2d.b2PolygonShape.prototype.ComputeAABB.s_v);
    box2d.b2Min_V2_V2(v, lower, lower);
    box2d.b2Max_V2_V2(v, upper, upper);
  }

  var r = this.m_radius;
  lower.SelfSubXY(r, r);
  upper.SelfAddXY(r, r);
}
box2d.b2PolygonShape.prototype.ComputeAABB.s_v = new box2d.b2Vec2();

/**
 * @see box2d.b2Shape::ComputeMass
 * @export
 * @return {void}
 * @param {box2d.b2MassData} massData
 * @param {number} density
 */
box2d.b2PolygonShape.prototype.ComputeMass = function(massData, density) {
  // Polygon mass, centroid, and inertia.
  // Let rho be the polygon density in mass per unit area.
  // Then:
  // mass = rho * int(dA)
  // centroid.x = (1/mass) * rho * int(x * dA)
  // centroid.y = (1/mass) * rho * int(y * dA)
  // I = rho * int((x*x + y*y) * dA)
  //
  // We can compute these integrals by summing all the integrals
  // for each triangle of the polygon. To evaluate the integral
  // for a single triangle, we make a change of variables to
  // the (u,v) coordinates of the triangle:
  // x = x0 + e1x * u + e2x * v
  // y = y0 + e1y * u + e2y * v
  // where 0 <= u && 0 <= v && u + v <= 1.
  //
  // We integrate u from [0,1-v] and then v from [0,1].
  // We also need to use the Jacobian of the transformation:
  // D = cross(e1, e2)
  //
  // Simplification: triangle centroid = (1/3) * (p1 + p2 + p3)
  //
  // The rest of the derivation is handled by computer algebra.

  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(this.m_count >= 3);
  }

  var center = box2d.b2PolygonShape.prototype.ComputeMass.s_center.SetZero();
  var area = 0;
  var I = 0;

  // s is the reference point for forming triangles.
  // It's location doesn't change the result (except for rounding error).
  var s = box2d.b2PolygonShape.prototype.ComputeMass.s_s.SetZero();

  // This code would put the reference point inside the polygon.
  for (var i = 0, ict = this.m_count; i < ict; ++i) {
    s.SelfAdd(this.m_vertices[i]);
  }
  s.SelfMul(1 / this.m_count);

  var k_inv3 = 1 / 3;

  for (var i = 0, ict = this.m_count; i < ict; ++i) {
    // Triangle vertices.
    var e1 = box2d.b2Sub_V2_V2(this.m_vertices[i], s, box2d.b2PolygonShape.prototype.ComputeMass.s_e1);
    var e2 = box2d.b2Sub_V2_V2(this.m_vertices[(i + 1) % ict], s, box2d.b2PolygonShape.prototype.ComputeMass.s_e2);

    var D = box2d.b2Cross_V2_V2(e1, e2);

    var triangleArea = 0.5 * D;
    area += triangleArea;

    // Area weighted centroid
    center.SelfAdd(box2d.b2Mul_S_V2(triangleArea * k_inv3, box2d.b2Add_V2_V2(e1, e2, box2d.b2Vec2.s_t0), box2d.b2Vec2.s_t1));

    var ex1 = e1.x;
    var ey1 = e1.y;
    var ex2 = e2.x;
    var ey2 = e2.y;

    var intx2 = ex1 * ex1 + ex2 * ex1 + ex2 * ex2;
    var inty2 = ey1 * ey1 + ey2 * ey1 + ey2 * ey2;

    I += (0.25 * k_inv3 * D) * (intx2 + inty2);
  }

  // Total mass
  massData.mass = density * area;

  // Center of mass
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(area > box2d.b2_epsilon);
  }
  center.SelfMul(1 / area);
  box2d.b2Add_V2_V2(center, s, massData.center);

  // Inertia tensor relative to the local origin (point s).
  massData.I = density * I;

  // Shift to center of mass then to original body origin.
  massData.I += massData.mass * (box2d.b2Dot_V2_V2(massData.center, massData.center) - box2d.b2Dot_V2_V2(center, center));
}
box2d.b2PolygonShape.prototype.ComputeMass.s_center = new box2d.b2Vec2();
box2d.b2PolygonShape.prototype.ComputeMass.s_s = new box2d.b2Vec2();
box2d.b2PolygonShape.prototype.ComputeMass.s_e1 = new box2d.b2Vec2();
box2d.b2PolygonShape.prototype.ComputeMass.s_e2 = new box2d.b2Vec2();

/**
 * Validate convexity. This is a very time consuming operation.
 * @export
 * @return {boolean} true if valid
 */
box2d.b2PolygonShape.prototype.Validate = function() {
  for (var i = 0; i < this.m_count; ++i) {
    var i1 = i;
    var i2 = (i + 1) % this.m_count;
    var p = this.m_vertices[i1];
    var e = box2d.b2Sub_V2_V2(this.m_vertices[i2], p, box2d.b2PolygonShape.prototype.Validate.s_e);

    for (var j = 0; j < this.m_count; ++j) {
      if (j === i1 || j === i2) {
        continue;
      }

      var v = box2d.b2Sub_V2_V2(this.m_vertices[j], p, box2d.b2PolygonShape.prototype.Validate.s_v);
      var c = box2d.b2Cross_V2_V2(e, v);
      if (c < 0) {
        return false;
      }
    }
  }

  return true;
}
box2d.b2PolygonShape.prototype.Validate.s_e = new box2d.b2Vec2();
box2d.b2PolygonShape.prototype.Validate.s_v = new box2d.b2Vec2();

/**
 * @return {void}
 * @param {box2d.b2DistanceProxy} proxy
 * @param {number} index
 */
box2d.b2PolygonShape.prototype.SetupDistanceProxy = function(proxy, index) {
  proxy.m_vertices = this.m_vertices;
  proxy.m_count = this.m_count;
  proxy.m_radius = this.m_radius;
}

/**
 * @export
 * @return {number}
 * @param {box2d.b2Vec2} normal
 * @param {number} offset
 * @param {box2d.b2Transform} xf
 * @param {box2d.b2Vec2} c
 */
box2d.b2PolygonShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  // Transform plane into shape co-ordinates
  var normalL = box2d.b2MulT_R_V2(xf.q, normal, box2d.b2PolygonShape.prototype.ComputeSubmergedArea.s_normalL);
  var offsetL = offset - box2d.b2Dot_V2_V2(normal, xf.p);

  var depths = box2d.b2PolygonShape.prototype.ComputeSubmergedArea.s_depths;
  var diveCount = 0;
  var intoIndex = -1;
  var outoIndex = -1;

  var lastSubmerged = false;
  for (var i = 0, ict = this.m_count; i < ict; ++i) {
    depths[i] = box2d.b2Dot_V2_V2(normalL, this.m_vertices[i]) - offsetL;
    var isSubmerged = depths[i] < (-box2d.b2_epsilon);
    if (i > 0) {
      if (isSubmerged) {
        if (!lastSubmerged) {
          intoIndex = i - 1;
          diveCount++;
        }
      } else {
        if (lastSubmerged) {
          outoIndex = i - 1;
          diveCount++;
        }
      }
    }
    lastSubmerged = isSubmerged;
  }
  switch (diveCount) {
    case 0:
      if (lastSubmerged) {
        // Completely submerged
        var md = box2d.b2PolygonShape.prototype.ComputeSubmergedArea.s_md;
        this.ComputeMass(md, 1);
        box2d.b2Mul_X_V2(xf, md.center, c);
        return md.mass;
      } else {
        //Completely dry
        return 0;
      }
      break;
    case 1:
      if (intoIndex === (-1)) {
        intoIndex = this.m_count - 1;
      } else {
        outoIndex = this.m_count - 1;
      }
      break;
  }
  var intoIndex2 = ((intoIndex + 1) % this.m_count);
  var outoIndex2 = ((outoIndex + 1) % this.m_count);
  var intoLamdda = (0 - depths[intoIndex]) / (depths[intoIndex2] - depths[intoIndex]);
  var outoLamdda = (0 - depths[outoIndex]) / (depths[outoIndex2] - depths[outoIndex]);

  var intoVec = box2d.b2PolygonShape.prototype.ComputeSubmergedArea.s_intoVec.Set(
    this.m_vertices[intoIndex].x * (1 - intoLamdda) + this.m_vertices[intoIndex2].x * intoLamdda,
    this.m_vertices[intoIndex].y * (1 - intoLamdda) + this.m_vertices[intoIndex2].y * intoLamdda);
  var outoVec = box2d.b2PolygonShape.prototype.ComputeSubmergedArea.s_outoVec.Set(
    this.m_vertices[outoIndex].x * (1 - outoLamdda) + this.m_vertices[outoIndex2].x * outoLamdda,
    this.m_vertices[outoIndex].y * (1 - outoLamdda) + this.m_vertices[outoIndex2].y * outoLamdda);

  // Initialize accumulator
  var area = 0;
  var center = box2d.b2PolygonShape.prototype.ComputeSubmergedArea.s_center.SetZero();
  var p2 = this.m_vertices[intoIndex2];
  var p3 = null;

  // An awkward loop from intoIndex2+1 to outIndex2
  var i = intoIndex2;
  while (i !== outoIndex2) {
    i = (i + 1) % this.m_count;
    if (i === outoIndex2)
      p3 = outoVec;
    else
      p3 = this.m_vertices[i];

    var triangleArea = 0.5 * ((p2.x - intoVec.x) * (p3.y - intoVec.y) - (p2.y - intoVec.y) * (p3.x - intoVec.x));
    area += triangleArea;
    // Area weighted centroid
    center.x += triangleArea * (intoVec.x + p2.x + p3.x) / 3;
    center.y += triangleArea * (intoVec.y + p2.y + p3.y) / 3;

    p2 = p3;
  }

  //Normalize and transform centroid
  center.SelfMul(1 / area);
  box2d.b2Mul_X_V2(xf, center, c);

  return area;
}
box2d.b2PolygonShape.prototype.ComputeSubmergedArea.s_normalL = new box2d.b2Vec2();
box2d.b2PolygonShape.prototype.ComputeSubmergedArea.s_depths = box2d.b2MakeNumberArray(box2d.b2_maxPolygonVertices);
box2d.b2PolygonShape.prototype.ComputeSubmergedArea.s_md = new box2d.b2MassData();
box2d.b2PolygonShape.prototype.ComputeSubmergedArea.s_intoVec = new box2d.b2Vec2();
box2d.b2PolygonShape.prototype.ComputeSubmergedArea.s_outoVec = new box2d.b2Vec2();
box2d.b2PolygonShape.prototype.ComputeSubmergedArea.s_center = new box2d.b2Vec2();

/**
 * Dump this shape to the log file.
 * @export
 * @return {void}
 */
box2d.b2PolygonShape.prototype.Dump = function() {
  box2d.b2Log("    /*box2d.b2PolygonShape*/ var shape = new box2d.b2PolygonShape();\n");
  box2d.b2Log("    /*box2d.b2Vec2[]*/ var vs = box2d.b2Vec2.MakeArray(%d);\n", box2d.b2_maxPolygonVertices);
  for (var i = 0; i < this.m_count; ++i) {
    box2d.b2Log("    vs[%d].Set(%.15f, %.15f);\n", i, this.m_vertices[i].x, this.m_vertices[i].y);
  }
  box2d.b2Log("    shape.Set(vs, %d);\n", this.m_count);
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {Array.<box2d.b2Vec2>} vs
 * @param {number} count
 * @param {box2d.b2Vec2} out
 */
box2d.b2PolygonShape.ComputeCentroid = function(vs, count, out) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(count >= 3);
  }

  var c = out;
  c.SetZero();
  var area = 0;

  // s is the reference point for forming triangles.
  // It's location doesn't change the result (except for rounding error).
  var pRef = box2d.b2PolygonShape.ComputeCentroid.s_pRef.SetZero();
  /*
  #if 0
  	// This code would put the reference point inside the polygon.
  	for (var i = 0; i < count; ++i)
  	{
      	pRef.SelfAdd(vs[i]);
  	}
  	pRef.SelfMul(1 / count);
  #endif
  */

  var inv3 = 1 / 3;

  for (var i = 0; i < count; ++i) {
    // Triangle vertices.
    var p1 = pRef;
    var p2 = vs[i];
    var p3 = vs[(i + 1) % count];

    var e1 = box2d.b2Sub_V2_V2(p2, p1, box2d.b2PolygonShape.ComputeCentroid.s_e1);
    var e2 = box2d.b2Sub_V2_V2(p3, p1, box2d.b2PolygonShape.ComputeCentroid.s_e2);

    var D = box2d.b2Cross_V2_V2(e1, e2);

    var triangleArea = 0.5 * D;
    area += triangleArea;

    // Area weighted centroid
    c.x += triangleArea * inv3 * (p1.x + p2.x + p3.x);
    c.y += triangleArea * inv3 * (p1.y + p2.y + p3.y);
  }

  // Centroid
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(area > box2d.b2_epsilon);
  }
  c.SelfMul(1 / area);
  return c;
}
box2d.b2PolygonShape.ComputeCentroid.s_pRef = new box2d.b2Vec2();
box2d.b2PolygonShape.ComputeCentroid.s_e1 = new box2d.b2Vec2();
box2d.b2PolygonShape.ComputeCentroid.s_e2 = new box2d.b2Vec2();

/*
box2d.b2PolygonShape.ComputeOBB = function (obb, vs, count)
{
	var i = 0;
	var p = new Array(count + 1);
	for (i = 0; i < count; ++i)
	{
		p[i] = vs[i];
	}
	p[count] = p[0];
	var minArea = box2d.b2_maxFloat;
	for (i = 1; i <= count; ++i)
	{
		var root = p[i - 1];
		var uxX = p[i].x - root.x;
		var uxY = p[i].y - root.y;
		var length = box2d.b2Sqrt(uxX * uxX + uxY * uxY);
		uxX /= length;
		uxY /= length;
		var uyX = (-uxY);
		var uyY = uxX;
		var lowerX = box2d.b2_maxFloat;
		var lowerY = box2d.b2_maxFloat;
		var upperX = (-box2d.b2_maxFloat);
		var upperY = (-box2d.b2_maxFloat);
		for (var j = 0; j < count; ++j)
		{
			var dX = p[j].x - root.x;
			var dY = p[j].y - root.y;
			var rX = (uxX * dX + uxY * dY);
			var rY = (uyX * dX + uyY * dY);
			if (rX < lowerX) lowerX = rX;
			if (rY < lowerY) lowerY = rY;
			if (rX > upperX) upperX = rX;
			if (rY > upperY) upperY = rY;
		}
		var area = (upperX - lowerX) * (upperY - lowerY);
		if (area < 0.95 * minArea)
		{
			minArea = area;
			obb.R.ex.x = uxX;
			obb.R.ex.y = uxY;
			obb.R.ey.x = uyX;
			obb.R.ey.y = uyY;
			var center_x = 0.5 * (lowerX + upperX);
			var center_y = 0.5 * (lowerY + upperY);
			var tMat = obb.R;
			obb.center.x = root.x + (tMat.ex.x * center_x + tMat.ey.x * center_y);
			obb.center.y = root.y + (tMat.ex.y * center_x + tMat.ey.y * center_y);
			obb.extents.x = 0.5 * (upperX - lowerX);
			obb.extents.y = 0.5 * (upperY - lowerY);
		}
	}
}
*/
