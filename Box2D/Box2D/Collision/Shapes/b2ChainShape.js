/*
 * Copyright (c) 2006-2010 Erin Catto http://www.box2d.org
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

goog.provide('box2d.b2ChainShape');

goog.require('box2d.b2Shape');
goog.require('box2d.b2EdgeShape');

/**
 * A chain shape is a free form sequence of line segments.
 * The chain has two-sided collision, so you can use inside and outside collision.
 * Therefore, you may use any winding order.
 * Since there may be many vertices, they are allocated using b2Alloc.
 * Connectivity information is used to create smooth collisions.
 * WARNING: The chain will not collide properly if there are self-intersections.
 * @export
 * @constructor
 * @extends {box2d.b2Shape}
 */
box2d.b2ChainShape = function() {
  box2d.b2Shape.call(this, box2d.b2ShapeType.e_chainShape, box2d.b2_polygonRadius); // base class constructor

  this.m_prevVertex = new box2d.b2Vec2();
  this.m_nextVertex = new box2d.b2Vec2();
}

goog.inherits(box2d.b2ChainShape, box2d.b2Shape);

/**
 * The vertices. Owned by this class.
 * @export
 * @type {Array.<box2d.b2Vec2>}
 */
box2d.b2ChainShape.prototype.m_vertices = null;

/**
 * The vertex count.
 * @export
 * @type {number}
 */
box2d.b2ChainShape.prototype.m_count = 0;

/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2ChainShape.prototype.m_prevVertex = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2ChainShape.prototype.m_nextVertex = null;
/**
 * @export
 * @type {boolean}
 */
box2d.b2ChainShape.prototype.m_hasPrevVertex = false;
/**
 * @export
 * @type {boolean}
 */
box2d.b2ChainShape.prototype.m_hasNextVertex = false;

/**
 * Clear all data.
 * @export
 * @return {void}
 */
box2d.b2ChainShape.prototype.Clear = function() {
  this.m_vertices = null;
  this.m_count = 0;
}

/**
 * Create a loop. This automatically adjusts connectivity.
 * @export
 * @return {box2d.b2ChainShape}
 * @param {Array.<box2d.b2Vec2>} vertices an array of vertices, these are copied
 * @param {number=} count the vertex count
 */
box2d.b2ChainShape.prototype.CreateLoop = function(vertices, count) {
  count = count || vertices.length;
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(this.m_vertices === null && this.m_count === 0);
  }
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(count >= 3);
  }
  if (box2d.ENABLE_ASSERTS) {
    for (var i = 1; i < count; ++i) {
      // If the code crashes here, it means your vertices are too close together.
      box2d.b2Assert(box2d.b2DistanceSquared(vertices[i - 1], vertices[i]) > box2d.b2_linearSlop * box2d.b2_linearSlop);
    }
  }

  this.m_count = count + 1;
  this.m_vertices = box2d.b2Vec2.MakeArray(this.m_count);
  for (var i = 0; i < count; ++i) {
    this.m_vertices[i].Copy(vertices[i]);
  }
  this.m_vertices[count].Copy(this.m_vertices[0]);
  this.m_prevVertex.Copy(this.m_vertices[this.m_count - 2]);
  this.m_nextVertex.Copy(this.m_vertices[1]);
  this.m_hasPrevVertex = true;
  this.m_hasNextVertex = true;
  return this;
}

/**
 * Create a chain with isolated end vertices.
 * @export
 * @return {box2d.b2ChainShape}
 * @param {Array.<box2d.b2Vec2>} vertices an array of vertices, these are copied
 * @param {number=} count the vertex count
 */
box2d.b2ChainShape.prototype.CreateChain = function(vertices, count) {
  count = count || vertices.length;
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(this.m_vertices === null && this.m_count === 0);
  }
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(count >= 2);
  }
  if (box2d.ENABLE_ASSERTS) {
    for (var i = 1; i < count; ++i) {
      var v1 = vertices[i - 1];
      var v2 = vertices[i];
      // If the code crashes here, it means your vertices are too close together.
      box2d.b2Assert(box2d.b2DistanceSquared(v1, v2) > box2d.b2_linearSlop * box2d.b2_linearSlop);
    }
  }

  this.m_count = count;
  this.m_vertices = box2d.b2Vec2.MakeArray(count);
  for (var i = 0; i < count; ++i) {
    this.m_vertices[i].Copy(vertices[i]);
  }
  this.m_hasPrevVertex = false;
  this.m_hasNextVertex = false;

  this.m_prevVertex.SetZero();
  this.m_nextVertex.SetZero();

  return this;
}

/**
 * Establish connectivity to a vertex that precedes the first vertex.
 * Don't call this for loops.
 * @export
 * @return {box2d.b2ChainShape}
 * @param {box2d.b2Vec2} prevVertex
 */
box2d.b2ChainShape.prototype.SetPrevVertex = function(prevVertex) {
  this.m_prevVertex.Copy(prevVertex);
  this.m_hasPrevVertex = true;
  return this;
}

/**
 * Establish connectivity to a vertex that follows the last vertex.
 * Don't call this for loops.
 * @export
 * @return {box2d.b2ChainShape}
 * @param {box2d.b2Vec2} nextVertex
 */
box2d.b2ChainShape.prototype.SetNextVertex = function(nextVertex) {
  this.m_nextVertex.Copy(nextVertex);
  this.m_hasNextVertex = true;
  return this;
}

/**
 * Implement box2d.b2Shape. Vertices are cloned using b2Alloc.
 * @export
 * @return {box2d.b2Shape}
 */
box2d.b2ChainShape.prototype.Clone = function() {
  return new box2d.b2ChainShape().Copy(this);
}

/**
 * @export
 * @return {box2d.b2Shape}
 * @param {box2d.b2Shape} other
 */
box2d.b2ChainShape.prototype.Copy = function(other) {
  box2d.b2Shape.prototype.Copy.call(this, other);

  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(other instanceof box2d.b2ChainShape);
  }

  this.CreateChain(other.m_vertices, other.m_count);
  this.m_prevVertex.Copy(other.m_prevVertex);
  this.m_nextVertex.Copy(other.m_nextVertex);
  this.m_hasPrevVertex = other.m_hasPrevVertex;
  this.m_hasNextVertex = other.m_hasNextVertex;

  return this;
}

/**
 * @see box2d.b2Shape::GetChildCount
 * @export
 * @return {number}
 */
box2d.b2ChainShape.prototype.GetChildCount = function() {
  // edge count = vertex count - 1
  return this.m_count - 1;
}

/**
 * Get a child edge.
 * @export
 * @return {void}
 * @param {box2d.b2EdgeShape} edge
 * @param {number} index
 */
box2d.b2ChainShape.prototype.GetChildEdge = function(edge, index) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(0 <= index && index < this.m_count - 1);
  }
  edge.m_type = box2d.b2ShapeType.e_edgeShape;
  edge.m_radius = this.m_radius;

  edge.m_vertex1.Copy(this.m_vertices[index]);
  edge.m_vertex2.Copy(this.m_vertices[index + 1]);

  if (index > 0) {
    edge.m_vertex0.Copy(this.m_vertices[index - 1]);
    edge.m_hasVertex0 = true;
  } else {
    edge.m_vertex0.Copy(this.m_prevVertex);
    edge.m_hasVertex0 = this.m_hasPrevVertex;
  }

  if (index < this.m_count - 2) {
    edge.m_vertex3.Copy(this.m_vertices[index + 2]);
    edge.m_hasVertex3 = true;
  } else {
    edge.m_vertex3.Copy(this.m_nextVertex);
    edge.m_hasVertex3 = this.m_hasNextVertex;
  }
}


/**
 * This always return false.
 * @see box2d.b2Shape::TestPoint
 * @export
 * @return {boolean}
 * @param {box2d.b2Transform} xf
 * @param {box2d.b2Vec2} p
 */
box2d.b2ChainShape.prototype.TestPoint = function(xf, p) {
  return false;
}

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
box2d.b2ChainShape.prototype.ComputeDistance = function(xf, p, normal, childIndex) {
  /** @type {box2d.b2EdgeShape} */
  var edge = box2d.b2ChainShape.prototype.ComputeDistance.s_edgeShape;
  this.GetChildEdge(edge, childIndex);
  return edge.ComputeDistance(xf, p, normal, 0);
}
box2d.b2ChainShape.prototype.ComputeDistance.s_edgeShape = new box2d.b2EdgeShape();

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
box2d.b2ChainShape.prototype.RayCast = function(output, input, xf, childIndex) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(childIndex < this.m_count);
  }

  /** @type {box2d.b2EdgeShape} */
  var edgeShape = box2d.b2ChainShape.prototype.RayCast.s_edgeShape;

  edgeShape.m_vertex1.Copy(this.m_vertices[childIndex]);
  edgeShape.m_vertex2.Copy(this.m_vertices[(childIndex + 1) % this.m_count]);

  return edgeShape.RayCast(output, input, xf, 0);
}
box2d.b2ChainShape.prototype.RayCast.s_edgeShape = new box2d.b2EdgeShape();

/**
 * @see box2d.b2Shape::ComputeAABB
 * @export
 * @return {void}
 * @param {box2d.b2AABB} aabb
 * @param {box2d.b2Transform} xf
 * @param {number} childIndex
 */
box2d.b2ChainShape.prototype.ComputeAABB = function(aabb, xf, childIndex) {
    if (box2d.ENABLE_ASSERTS) {
      box2d.b2Assert(childIndex < this.m_count);
    }

    /** @type {box2d.b2Vec2} */
    var vertexi1 = this.m_vertices[childIndex];
    /** @type {box2d.b2Vec2} */
    var vertexi2 = this.m_vertices[(childIndex + 1) % this.m_count];

    /** @type {box2d.b2Vec2} */
    var v1 = box2d.b2Mul_X_V2(xf, vertexi1, box2d.b2ChainShape.prototype.ComputeAABB.s_v1);
    /** @type {box2d.b2Vec2} */
    var v2 = box2d.b2Mul_X_V2(xf, vertexi2, box2d.b2ChainShape.prototype.ComputeAABB.s_v2);

    box2d.b2Min_V2_V2(v1, v2, aabb.lowerBound);
    box2d.b2Max_V2_V2(v1, v2, aabb.upperBound);
  }
  /**
   * @export
   * @type {box2d.b2Vec2}
   */
box2d.b2ChainShape.prototype.ComputeAABB.s_v1 = new box2d.b2Vec2();
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2ChainShape.prototype.ComputeAABB.s_v2 = new box2d.b2Vec2();

/**
 * @see box2d.b2Shape::ComputeMass
 * @export
 * @return {void}
 * @param {box2d.b2MassData} massData
 * @param {number} density
 */
box2d.b2ChainShape.prototype.ComputeMass = function(massData, density) {
  massData.mass = 0;
  massData.center.SetZero();
  massData.I = 0;
}

/**
 * @return {void}
 * @param {box2d.b2DistanceProxy} proxy
 * @param {number} index
 */
box2d.b2ChainShape.prototype.SetupDistanceProxy = function(proxy, index) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(0 <= index && index < this.m_count);
  }

  proxy.m_buffer[0].Copy(this.m_vertices[index]);
  if (index + 1 < this.m_count) {
    proxy.m_buffer[1].Copy(this.m_vertices[index + 1]);
  } else {
    proxy.m_buffer[1].Copy(this.m_vertices[0]);
  }

  proxy.m_vertices = proxy.m_buffer;
  proxy.m_count = 2;
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
box2d.b2ChainShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  c.SetZero();
  return 0;
}

/**
 * Dump this shape to the log file.
 * @export
 * @return {void}
 */
box2d.b2ChainShape.prototype.Dump = function() {
  box2d.b2Log("    /*box2d.b2ChainShape*/ var shape = new box2d.b2ChainShape();\n");
  box2d.b2Log("    /*box2d.b2Vec2[]*/ var vs = box2d.b2Vec2.MakeArray(%d);\n", box2d.b2_maxPolygonVertices);
  for (var i = 0; i < this.m_count; ++i) {
    box2d.b2Log("    vs[%d].Set(%.15f, %.15f);\n", i, this.m_vertices[i].x, this.m_vertices[i].y);
  }
  box2d.b2Log("    shape.CreateChain(vs, %d);\n", this.m_count);
  box2d.b2Log("    shape.m_prevVertex.Set(%.15f, %.15f);\n", this.m_prevVertex.x, this.m_prevVertex.y);
  box2d.b2Log("    shape.m_nextVertex.Set(%.15f, %.15f);\n", this.m_nextVertex.x, this.m_nextVertex.y);
  box2d.b2Log("    shape.m_hasPrevVertex = %s;\n", (this.m_hasPrevVertex) ? ('true') : ('false'));
  box2d.b2Log("    shape.m_hasNextVertex = %s;\n", (this.m_hasNextVertex) ? ('true') : ('false'));
}
