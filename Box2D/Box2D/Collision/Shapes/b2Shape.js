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

goog.provide('box2d.b2Shape');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Math');
goog.require('box2d.b2ShapeDistance');

/** 
 * This holds the mass data computed for a shape. 
 * @export 
 * @constructor
 */
box2d.b2MassData = function() {
  this.center = new box2d.b2Vec2(0, 0);
};

/** 
 * The mass of the shape, usually in kilograms. 
 * @export 
 * @type {number}
 */
box2d.b2MassData.prototype.mass = 0;

/** 
 * The position of the shape's centroid relative to the shape's 
 * origin. 
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2MassData.prototype.center = null;

/** 
 * The rotational inertia of the shape about the local origin. 
 * @export 
 * @type {number}
 */
box2d.b2MassData.prototype.I = 0;

/** 
 * @export 
 * @enum
 */
box2d.b2ShapeType = {
  e_unknown: -1,
  e_circleShape: 0,
  e_edgeShape: 1,
  e_polygonShape: 2,
  e_chainShape: 3,
  e_shapeTypeCount: 4
};
goog.exportProperty(box2d.b2ShapeType, 'e_unknown', box2d.b2ShapeType.e_unknown);
goog.exportProperty(box2d.b2ShapeType, 'e_circleShape', box2d.b2ShapeType.e_circleShape);
goog.exportProperty(box2d.b2ShapeType, 'e_edgeShape', box2d.b2ShapeType.e_edgeShape);
goog.exportProperty(box2d.b2ShapeType, 'e_polygonShape', box2d.b2ShapeType.e_polygonShape);
goog.exportProperty(box2d.b2ShapeType, 'e_chainShape', box2d.b2ShapeType.e_chainShape);
goog.exportProperty(box2d.b2ShapeType, 'e_shapeTypeCount', box2d.b2ShapeType.e_shapeTypeCount);

/** 
 * A shape is used for collision detection. You can create a 
 * shape however you like. 
 * Shapes used for simulation in box2d.b2World are created 
 * automatically when a box2d.b2Fixture is created. Shapes may 
 * encapsulate a one or more child shapes. 
 * @export 
 * @constructor 
 * @param {box2d.b2ShapeType} type 
 * @param {number} radius 
 */
box2d.b2Shape = function(type, radius) {
  this.m_type = type;
  this.m_radius = radius;
}

/**
 * @export 
 * @type {box2d.b2ShapeType}
 */
box2d.b2Shape.prototype.m_type = box2d.b2ShapeType.e_unknown;
/**
 * @export 
 * @type {number}
 */
box2d.b2Shape.prototype.m_radius = 0;

/** 
 * Clone the concrete shape using the provided allocator. 
 * @export 
 * @return {box2d.b2Shape}
 */
box2d.b2Shape.prototype.Clone = function() {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(false);
  }
  return null;
}

/**
 * @export 
 * @return {box2d.b2Shape} 
 * @param {box2d.b2Shape} other 
 */
box2d.b2Shape.prototype.Copy = function(other) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(this.m_type === other.m_type);
  }
  this.m_radius = other.m_radius;
  return this;
}

/** 
 * Get the type of this shape. You can use this to down cast to 
 * the concrete shape. 
 * @export 
 * @return {box2d.b2ShapeType} the shape type.
 */
box2d.b2Shape.prototype.GetType = function() {
  return this.m_type;
}

/** 
 * Get the number of child primitives. 
 * @export 
 * @return {number}
 */
box2d.b2Shape.prototype.GetChildCount = function() {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(false, "pure virtual");
  }
  return 0;
}

/** 
 * Test a point for containment in this shape. This only works 
 * for convex shapes. 
 * @export 
 * @return {boolean} 
 * @param {box2d.b2Transform} xf the shape world transform.
 * @param {box2d.b2Vec2} p a point in world coordinates.
 */
box2d.b2Shape.prototype.TestPoint = function(xf, p) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(false, "pure virtual");
  }
  return false;
}

//#if B2_ENABLE_PARTICLE

/** 
 * Compute the distance from the current shape to the specified 
 * point. This only works for convex shapes. 
 * @export 
 * @return {number} returns the distance from the current shape.
 * @param {box2d.b2Transform} xf the shape world transform.
 * @param {box2d.b2Vec2} p a point in world coordinates.
 * @param {box2d.b2Vec2} normal returns the direction in which 
 *  	  the distance increases.
 * @param {number} childIndex 
 */
box2d.b2Shape.prototype.ComputeDistance = function(xf, p, normal, childIndex) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(false, "pure virtual");
  }
  return 0;
}

//#endif

/** 
 * Cast a ray against a child shape. 
 * @export 
 * @return {boolean} 
 * @param {box2d.b2RayCastOutput} output the ray-cast results.
 * @param {box2d.b2RayCastInput} input the ray-cast input parameters.
 * @param {box2d.b2Transform} transform the transform to be applied to the shape.
 * @param {number} childIndex the child shape index
 */
box2d.b2Shape.prototype.RayCast = function(output, input, transform, childIndex) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(false, "pure virtual");
  }
  return false;
}

/** 
 * Given a transform, compute the associated axis aligned 
 * bounding box for a child shape. 
 * @export 
 * @return {void} 
 * @param {box2d.b2AABB} aabb returns the axis aligned box.
 * @param {box2d.b2Transform} xf the world transform of the shape.
 * @param {number} childIndex the child shape
 */
box2d.b2Shape.prototype.ComputeAABB = function(aabb, xf, childIndex) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(false, "pure virtual");
  }
}

/** 
 * Compute the mass properties of this shape using its 
 * dimensions and density. 
 * The inertia tensor is computed about the local origin.
 * @export 
 * @return {void} 
 * @param {box2d.b2MassData} massData returns the mass data for this shape.
 * @param {number} density the density in kilograms per meter squared.
 */
box2d.b2Shape.prototype.ComputeMass = function(massData, density) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(false, "pure virtual");
  }
}

/**
 * @return {void} 
 * @param {box2d.b2DistanceProxy} proxy 
 * @param {number} index 
 */
box2d.b2Shape.prototype.SetupDistanceProxy = function(proxy, index) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(false, "pure virtual");
  }
}

/**
 * @export 
 * @return {number}
 * @param {box2d.b2Vec2} normal
 * @param {number} offset
 * @param {box2d.b2Transform} xf
 * @param {box2d.b2Vec2} c
 */
box2d.b2Shape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(false, "pure virtual");
  }
  return 0;
}

/** 
 * Dump this shape to the log file. 
 * @export 
 * @return {void}
 */
box2d.b2Shape.prototype.Dump = function() {
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(false, "pure virtual");
  }
}
