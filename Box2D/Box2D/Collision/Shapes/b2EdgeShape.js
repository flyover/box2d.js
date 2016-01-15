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

goog.provide('box2d.b2EdgeShape');

goog.require('box2d.b2Shape');

/** 
 * A line segment (edge) shape. These can be connected in chains 
 * or loops to other edge shapes. The connectivity information 
 * is used to ensure correct contact normals. 
 * @export 
 * @constructor
 * @extends {box2d.b2Shape} 
 */
box2d.b2EdgeShape = function() {
  box2d.b2Shape.call(this, box2d.b2ShapeType.e_edgeShape, box2d.b2_polygonRadius); // base class constructor

  this.m_vertex1 = new box2d.b2Vec2();
  this.m_vertex2 = new box2d.b2Vec2();

  this.m_vertex0 = new box2d.b2Vec2();
  this.m_vertex3 = new box2d.b2Vec2();
}

goog.inherits(box2d.b2EdgeShape, box2d.b2Shape);

/** 
 * These are the edge vertices 
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2EdgeShape.prototype.m_vertex1 = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2EdgeShape.prototype.m_vertex2 = null;

/** 
 * Optional adjacent vertices. These are used for smooth 
 * collision. 
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2EdgeShape.prototype.m_vertex0 = null;
/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2EdgeShape.prototype.m_vertex3 = null;
/**
 * @export 
 * @type {boolean}
 */
box2d.b2EdgeShape.prototype.m_hasVertex0 = false;
/**
 * @export 
 * @type {boolean}
 */
box2d.b2EdgeShape.prototype.m_hasVertex3 = false;

/** 
 * Set this as an isolated edge. 
 * @export 
 * @return {box2d.b2EdgeShape} 
 * @param {box2d.b2Vec2} v1
 * @param {box2d.b2Vec2} v2 
 */
box2d.b2EdgeShape.prototype.Set = function(v1, v2) {
  this.m_vertex1.Copy(v1);
  this.m_vertex2.Copy(v2);
  this.m_hasVertex0 = false;
  this.m_hasVertex3 = false;
  return this;
}

box2d.b2EdgeShape.prototype.SetAsEdge = box2d.b2EdgeShape.prototype.Set;

/** 
 * Implement box2d.b2Shape. 
 * @export 
 * @return {box2d.b2Shape} 
 */
box2d.b2EdgeShape.prototype.Clone = function() {
  return new box2d.b2EdgeShape().Copy(this);
}

/**
 * @export 
 * @return {box2d.b2Shape} 
 * @param {box2d.b2Shape} other
 */
box2d.b2EdgeShape.prototype.Copy = function(other) {
  box2d.b2Shape.prototype.Copy.call(this, other);

  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(other instanceof box2d.b2EdgeShape);
  }

  this.m_vertex1.Copy(other.m_vertex1);
  this.m_vertex2.Copy(other.m_vertex2);
  this.m_vertex0.Copy(other.m_vertex0);
  this.m_vertex3.Copy(other.m_vertex3);
  this.m_hasVertex0 = other.m_hasVertex0;
  this.m_hasVertex3 = other.m_hasVertex3;

  return this;
}

/** 
 * @see box2d.b2Shape::GetChildCount 
 * @export 
 * @return {number}
 */
box2d.b2EdgeShape.prototype.GetChildCount = function() {
  return 1;
}

/** 
 * @see box2d.b2Shape::TestPoint 
 * @export 
 * @return {boolean}
 * @param {box2d.b2Transform} xf
 * @param {box2d.b2Vec2} p
 */
box2d.b2EdgeShape.prototype.TestPoint = function(xf, p) {
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
box2d.b2EdgeShape.prototype.ComputeDistance = function(xf, p, normal, childIndex) {
  var v1 = box2d.b2Mul_X_V2(xf, this.m_vertex1, box2d.b2EdgeShape.prototype.ComputeDistance.s_v1);
  var v2 = box2d.b2Mul_X_V2(xf, this.m_vertex2, box2d.b2EdgeShape.prototype.ComputeDistance.s_v2);

  var d = box2d.b2Sub_V2_V2(p, v1, box2d.b2EdgeShape.prototype.ComputeDistance.s_d);
  var s = box2d.b2Sub_V2_V2(v2, v1, box2d.b2EdgeShape.prototype.ComputeDistance.s_s);
  var ds = box2d.b2Dot_V2_V2(d, s);
  if (ds > 0) {
    var s2 = box2d.b2Dot_V2_V2(s, s);
    if (ds > s2) {
      box2d.b2Sub_V2_V2(p, v2, d);
    } else {
      d.SelfMulSub(ds / s2, s);
    }
  }
  normal.Copy(d);
  return normal.Normalize();
}
box2d.b2EdgeShape.prototype.ComputeDistance.s_v1 = new box2d.b2Vec2();
box2d.b2EdgeShape.prototype.ComputeDistance.s_v2 = new box2d.b2Vec2();
box2d.b2EdgeShape.prototype.ComputeDistance.s_d = new box2d.b2Vec2();
box2d.b2EdgeShape.prototype.ComputeDistance.s_s = new box2d.b2Vec2();

//#endif

/** 
 * Implement box2d.b2Shape.
 * p = p1 + t * d
 * v = v1 + s * e
 * p1 + t * d = v1 + s * e
 * s * e - t * d = p1 - v1
 * @export 
 * @return {boolean} 
 * @param {box2d.b2RayCastOutput} output 
 * @param {box2d.b2RayCastInput} input 
 * @param {box2d.b2Transform} xf 
 * @param {number} childIndex 
 */
box2d.b2EdgeShape.prototype.RayCast = function(output, input, xf, childIndex) {
  // Put the ray into the edge's frame of reference.
  var p1 = box2d.b2MulT_X_V2(xf, input.p1, box2d.b2EdgeShape.prototype.RayCast.s_p1);
  var p2 = box2d.b2MulT_X_V2(xf, input.p2, box2d.b2EdgeShape.prototype.RayCast.s_p2);
  var d = box2d.b2Sub_V2_V2(p2, p1, box2d.b2EdgeShape.prototype.RayCast.s_d);

  var v1 = this.m_vertex1;
  var v2 = this.m_vertex2;
  var e = box2d.b2Sub_V2_V2(v2, v1, box2d.b2EdgeShape.prototype.RayCast.s_e);
  var normal = output.normal.Set(e.y, -e.x).SelfNormalize();

  // q = p1 + t * d
  // dot(normal, q - v1) = 0
  // dot(normal, p1 - v1) + t * dot(normal, d) = 0
  var numerator = box2d.b2Dot_V2_V2(normal, box2d.b2Sub_V2_V2(v1, p1, box2d.b2Vec2.s_t0));
  var denominator = box2d.b2Dot_V2_V2(normal, d);

  if (denominator === 0) {
    return false;
  }

  var t = numerator / denominator;
  if (t < 0 || input.maxFraction < t) {
    return false;
  }

  var q = box2d.b2AddMul_V2_S_V2(p1, t, d, box2d.b2EdgeShape.prototype.RayCast.s_q);

  // q = v1 + s * r
  // s = dot(q - v1, r) / dot(r, r)
  var r = box2d.b2Sub_V2_V2(v2, v1, box2d.b2EdgeShape.prototype.RayCast.s_r);
  var rr = box2d.b2Dot_V2_V2(r, r);
  if (rr === 0) {
    return false;
  }

  var s = box2d.b2Dot_V2_V2(box2d.b2Sub_V2_V2(q, v1, box2d.b2Vec2.s_t0), r) / rr;
  if (s < 0 || 1 < s) {
    return false;
  }

  output.fraction = t;
  box2d.b2Mul_R_V2(xf.q, output.normal, output.normal);
  if (numerator > 0) {
    output.normal.SelfNeg();
  }
  return true;
}
box2d.b2EdgeShape.prototype.RayCast.s_p1 = new box2d.b2Vec2();
box2d.b2EdgeShape.prototype.RayCast.s_p2 = new box2d.b2Vec2();
box2d.b2EdgeShape.prototype.RayCast.s_d = new box2d.b2Vec2();
box2d.b2EdgeShape.prototype.RayCast.s_e = new box2d.b2Vec2();
box2d.b2EdgeShape.prototype.RayCast.s_q = new box2d.b2Vec2();
box2d.b2EdgeShape.prototype.RayCast.s_r = new box2d.b2Vec2();

/** 
 * @see box2d.b2Shape::ComputeAABB 
 * @export 
 * @return {void} 
 * @param {box2d.b2AABB} aabb 
 * @param {box2d.b2Transform} xf 
 * @param {number} childIndex 
 */
box2d.b2EdgeShape.prototype.ComputeAABB = function(aabb, xf, childIndex) {
  var v1 = box2d.b2Mul_X_V2(xf, this.m_vertex1, box2d.b2EdgeShape.prototype.ComputeAABB.s_v1);
  var v2 = box2d.b2Mul_X_V2(xf, this.m_vertex2, box2d.b2EdgeShape.prototype.ComputeAABB.s_v2);

  box2d.b2Min_V2_V2(v1, v2, aabb.lowerBound);
  box2d.b2Max_V2_V2(v1, v2, aabb.upperBound);

  var r = this.m_radius;
  aabb.lowerBound.SelfSubXY(r, r);
  aabb.upperBound.SelfAddXY(r, r);
}
box2d.b2EdgeShape.prototype.ComputeAABB.s_v1 = new box2d.b2Vec2();
box2d.b2EdgeShape.prototype.ComputeAABB.s_v2 = new box2d.b2Vec2();

/** 
 * @see box2d.b2Shape::ComputeMass 
 * @export 
 * @return {void} 
 * @param {box2d.b2MassData} massData 
 * @param {number} density 
 */
box2d.b2EdgeShape.prototype.ComputeMass = function(massData, density) {
  massData.mass = 0;
  box2d.b2Mid_V2_V2(this.m_vertex1, this.m_vertex2, massData.center);
  massData.I = 0;
}

/**
 * @return {void} 
 * @param {box2d.b2DistanceProxy} proxy 
 * @param {number} index 
 */
box2d.b2EdgeShape.prototype.SetupDistanceProxy = function(proxy, index) {
  proxy.m_vertices = proxy.m_buffer;
  proxy.m_vertices[0].Copy(this.m_vertex1);
  proxy.m_vertices[1].Copy(this.m_vertex2);
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
box2d.b2EdgeShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  c.SetZero();
  return 0;
}

/** 
 * Dump this shape to the log file. 
 * @export 
 * @return {void}
 */
box2d.b2EdgeShape.prototype.Dump = function() {
  box2d.b2Log("    /*box2d.b2EdgeShape*/ var shape = new box2d.b2EdgeShape();\n");
  box2d.b2Log("    shape.m_radius = %.15f;\n", this.m_radius);
  box2d.b2Log("    shape.m_vertex0.Set(%.15f, %.15f);\n", this.m_vertex0.x, this.m_vertex0.y);
  box2d.b2Log("    shape.m_vertex1.Set(%.15f, %.15f);\n", this.m_vertex1.x, this.m_vertex1.y);
  box2d.b2Log("    shape.m_vertex2.Set(%.15f, %.15f);\n", this.m_vertex2.x, this.m_vertex2.y);
  box2d.b2Log("    shape.m_vertex3.Set(%.15f, %.15f);\n", this.m_vertex3.x, this.m_vertex3.y);
  box2d.b2Log("    shape.m_hasVertex0 = %s;\n", this.m_hasVertex0);
  box2d.b2Log("    shape.m_hasVertex3 = %s;\n", this.m_hasVertex3);
}
