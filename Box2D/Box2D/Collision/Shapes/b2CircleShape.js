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

goog.provide('box2d.b2CircleShape');

goog.require('box2d.b2Shape');

/** 
 * A circle shape. 
 * @export 
 * @constructor 
 * @extends {box2d.b2Shape} 
 * @param {number=} radius 
 */
box2d.b2CircleShape = function (radius)
{
	box2d.b2Shape.call(this, box2d.b2ShapeType.e_circleShape, radius || 0); // base class constructor

	this.m_p = new box2d.b2Vec2();
}

goog.inherits(box2d.b2CircleShape, box2d.b2Shape);

/**
 * @export 
 * @type {box2d.b2Vec2}
 */
box2d.b2CircleShape.prototype.m_p = null;

/** 
 * Implement box2d.b2Shape. 
 * @export 
 * @return {box2d.b2Shape}
 */
box2d.b2CircleShape.prototype.Clone = function ()
{
	return new box2d.b2CircleShape().Copy(this);
}

/**
 * @export 
 * @return {box2d.b2Shape} 
 * @param {box2d.b2Shape} other
 */
box2d.b2CircleShape.prototype.Copy = function (other)
{
	box2d.b2Shape.prototype.Copy.call(this, other);

	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(other instanceof box2d.b2CircleShape); }

	this.m_p.Copy(other.m_p);
	return this;
}

/** 
 * Implement box2d.b2Shape. 
 * @export 
 * @return {number}
 */
box2d.b2CircleShape.prototype.GetChildCount = function ()
{
	return 1;
}

/** 
 * Implement box2d.b2Shape. 
 * @export 
 * @return {boolean} 
 * @param {box2d.b2Transform} transform 
 * @param {box2d.b2Vec2} p 
 */
box2d.b2CircleShape.prototype.TestPoint = function (transform, p)
{
	var center = box2d.b2Mul_X_V2(transform, this.m_p, box2d.b2CircleShape.prototype.TestPoint.s_center);
	var d = box2d.b2Sub_V2_V2(p, center, box2d.b2CircleShape.prototype.TestPoint.s_d);
	return box2d.b2Dot_V2_V2(d, d) <= box2d.b2Sq(this.m_radius);
}
box2d.b2CircleShape.prototype.TestPoint.s_center = new box2d.b2Vec2();
box2d.b2CircleShape.prototype.TestPoint.s_d = new box2d.b2Vec2();

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
box2d.b2CircleShape.prototype.ComputeDistance = function (xf, p, normal, childIndex)
{
	var center = box2d.b2Mul_X_V2(xf, this.m_p, box2d.b2CircleShape.prototype.ComputeDistance.s_center);
	var d = box2d.b2Sub_V2_V2(p, center, normal);
	return normal.Normalize() - this.m_radius;
}
box2d.b2CircleShape.prototype.ComputeDistance.s_center = new box2d.b2Vec2();

//#endif

/** 
 * Implement box2d.b2Shape. 
 * Collision Detection in Interactive 3D Environments by Gino 
 * van den Bergen From Section 3.1.2 
 * x = s + a * r 
 * norm(x) = radius 
 * @export 
 * @return {boolean} 
 * @param {box2d.b2RayCastOutput} output 
 * @param {box2d.b2RayCastInput} input 
 * @param {box2d.b2Transform} transform 
 * @param {number} childIndex 
 */
box2d.b2CircleShape.prototype.RayCast = function (output, input, transform, childIndex)
{
	var position = box2d.b2Mul_X_V2(transform, this.m_p, box2d.b2CircleShape.prototype.RayCast.s_position);
	var s = box2d.b2Sub_V2_V2(input.p1, position, box2d.b2CircleShape.prototype.RayCast.s_s);
	var b = box2d.b2Dot_V2_V2(s, s) - box2d.b2Sq(this.m_radius);

	// Solve quadratic equation.
	var r = box2d.b2Sub_V2_V2(input.p2, input.p1, box2d.b2CircleShape.prototype.RayCast.s_r);
	var c = box2d.b2Dot_V2_V2(s, r);
	var rr = box2d.b2Dot_V2_V2(r, r);
	var sigma = c * c - rr * b;

	// Check for negative discriminant and short segment.
	if (sigma < 0 || rr < box2d.b2_epsilon)
	{
		return false;
	}

	// Find the point of intersection of the line with the circle.
	var a = (-(c + box2d.b2Sqrt(sigma)));

	// Is the intersection point on the segment?
	if (0 <= a && a <= input.maxFraction * rr)
	{
		a /= rr;
		output.fraction = a;
		box2d.b2AddMul_V2_S_V2(s, a, r, output.normal).SelfNormalize();
		return true;
	}

	return false;
}
box2d.b2CircleShape.prototype.RayCast.s_position = new box2d.b2Vec2();
box2d.b2CircleShape.prototype.RayCast.s_s = new box2d.b2Vec2();
box2d.b2CircleShape.prototype.RayCast.s_r = new box2d.b2Vec2();

/** 
 * @see box2d.b2Shape::ComputeAABB 
 * @export 
 * @return {void} 
 * @param {box2d.b2AABB} aabb 
 * @param {box2d.b2Transform} transform 
 * @param {number} childIndex 
 */
box2d.b2CircleShape.prototype.ComputeAABB = function (aabb, transform, childIndex)
{
	var p = box2d.b2Mul_X_V2(transform, this.m_p, box2d.b2CircleShape.prototype.ComputeAABB.s_p);
	aabb.lowerBound.Set(p.x - this.m_radius, p.y - this.m_radius);
	aabb.upperBound.Set(p.x + this.m_radius, p.y + this.m_radius);
}
box2d.b2CircleShape.prototype.ComputeAABB.s_p = new box2d.b2Vec2();

/** 
 * @see box2d.b2Shape::ComputeMass 
 * @export 
 * @return {void} 
 * @param {box2d.b2MassData} massData 
 * @param {number} density 
 */
box2d.b2CircleShape.prototype.ComputeMass = function (massData, density)
{
	var radius_sq = box2d.b2Sq(this.m_radius);
	massData.mass = density * box2d.b2_pi * radius_sq;
	massData.center.Copy(this.m_p);

	// inertia about the local origin
	massData.I = massData.mass * (0.5 * radius_sq + box2d.b2Dot_V2_V2(this.m_p, this.m_p));
}

/**
 * @return {void} 
 * @param {box2d.b2DistanceProxy} proxy 
 * @param {number} index 
 */
box2d.b2CircleShape.prototype.SetupDistanceProxy = function (proxy, index)
{
	proxy.m_vertices = proxy.m_buffer;
	proxy.m_vertices[0].Copy(this.m_p);
	proxy.m_count = 1;
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
box2d.b2CircleShape.prototype.ComputeSubmergedArea = function (normal, offset, xf, c)
{
	/** @type {box2d.b2Vec2} */ var p = box2d.b2Mul_X_V2(xf, this.m_p, new box2d.b2Vec2());
	/** @type {number} */ var l = (-(box2d.b2Dot_V2_V2(normal, p) - offset));

	if (l < (-this.m_radius) + box2d.b2_epsilon)
	{
		//Completely dry
		return 0;
	}
	if (l > this.m_radius)
	{
		//Completely wet
		c.Copy(p);
		return box2d.b2_pi * this.m_radius * this.m_radius;
	}

	//Magic
	/** @type {number} */ var r2 = this.m_radius * this.m_radius;
	/** @type {number} */ var l2 = l * l;
	/** @type {number} */ var area = r2 * (box2d.b2Asin(l / this.m_radius) + box2d.b2_pi / 2) + l * box2d.b2Sqrt(r2 - l2);
	/** @type {number} */ var com = (-2 / 3 * box2d.b2Pow(r2 - l2, 1.5) / area);

	c.x = p.x + normal.x * com;
	c.y = p.y + normal.y * com;

	return area;
}

/** 
 * Dump this shape to the log file. 
 * @export 
 * @return {void}
 */
box2d.b2CircleShape.prototype.Dump = function ()
{
	box2d.b2Log("    /*box2d.b2CircleShape*/ var shape = new box2d.b2CircleShape();\n");
	box2d.b2Log("    shape.m_radius = %.15f;\n", this.m_radius);
	box2d.b2Log("    shape.m_p.Set(%.15f, %.15f);\n", this.m_p.x, this.m_p.y);
}

