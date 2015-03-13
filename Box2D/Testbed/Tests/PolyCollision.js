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

goog.provide('box2d.Testbed.PolyCollision');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.PolyCollision = function (canvas, settings)
{
	box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

	this.m_polygonA = new box2d.b2PolygonShape();
	this.m_polygonB = new box2d.b2PolygonShape();
	this.m_transformA = new box2d.b2Transform();
	this.m_transformB = new box2d.b2Transform();
	this.m_positionB = new box2d.b2Vec2();

	{
		this.m_polygonA.SetAsBox(0.2, 0.4);
		this.m_transformA.SetPositionRotationAngle(new box2d.b2Vec2(0.0, 0.0), 0.0);
	}

	{
		this.m_polygonB.SetAsBox(0.5, 0.5);
		this.m_positionB.Set(19.345284, 1.5632932);
		this.m_angleB = 1.9160721;
		this.m_transformB.SetPositionRotationAngle(this.m_positionB, this.m_angleB);
	}
}

goog.inherits(box2d.Testbed.PolyCollision, box2d.Testbed.Test);

/**
 * @export 
 * @type {box2d.b2PolygonShape} 
 */
box2d.Testbed.PolyCollision.prototype.m_polygonA = null;
/**
 * @export 
 * @type {box2d.b2PolygonShape} 
 */
box2d.Testbed.PolyCollision.prototype.m_polygonB = null;
/**
 * @export 
 * @type {box2d.b2Transform} 
 */
box2d.Testbed.PolyCollision.prototype.m_transformA = null;
/**
 * @export 
 * @type {box2d.b2Transform} 
 */
box2d.Testbed.PolyCollision.prototype.m_transformB = null;
/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.Testbed.PolyCollision.prototype.m_positionB = null;
/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.PolyCollision.prototype.m_angleB = 0;

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.PolyCollision.prototype.Step = function (settings)
{
	var manifold = new box2d.b2Manifold();
	box2d.b2CollidePolygons(manifold, this.m_polygonA, this.m_transformA, this.m_polygonB, this.m_transformB);

	var worldManifold = new box2d.b2WorldManifold();
	worldManifold.Initialize(manifold, this.m_transformA, this.m_polygonA.m_radius, this.m_transformB, this.m_polygonB.m_radius);

	this.m_debugDraw.DrawString(5, this.m_textLine, "point count = %d", manifold.pointCount);
	this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;

	{
		var color = new box2d.b2Color(0.9, 0.9, 0.9);
		var v = new Array(box2d.b2_maxPolygonVertices);
		for (var i = 0; i < this.m_polygonA.m_count; ++i)
		{
			v[i] = box2d.b2Mul_X_V2(this.m_transformA, this.m_polygonA.m_vertices[i], new box2d.b2Vec2());
		}
		this.m_debugDraw.DrawPolygon(v, this.m_polygonA.m_count, color);

		for (var i = 0; i < this.m_polygonB.m_count; ++i)
		{
			v[i] = box2d.b2Mul_X_V2(this.m_transformB, this.m_polygonB.m_vertices[i], new box2d.b2Vec2());
		}
		this.m_debugDraw.DrawPolygon(v, this.m_polygonB.m_count, color);
	}

	for (var i = 0; i < manifold.pointCount; ++i)
	{
		this.m_debugDraw.DrawPoint(worldManifold.points[i], 4.0, new box2d.b2Color(0.9, 0.3, 0.3));
	}
}

/**
 * @export 
 * @return {void} 
 * @param {number} key 
 */
box2d.Testbed.PolyCollision.prototype.Keyboard = function (key)
{
	switch (key)
	{
	case goog.events.KeyCodes.A:
		this.m_positionB.x -= 0.1;
		break;

	case goog.events.KeyCodes.D:
		this.m_positionB.x += 0.1;
		break;

	case goog.events.KeyCodes.S:
		this.m_positionB.y -= 0.1;
		break;

	case goog.events.KeyCodes.W:
		this.m_positionB.y += 0.1;
		break;

	case goog.events.KeyCodes.Q:
		this.m_angleB += 0.1 * box2d.b2_pi;
		break;

	case goog.events.KeyCodes.E:
		this.m_angleB -= 0.1 * box2d.b2_pi;
		break;
	}

	this.m_transformB.SetPositionRotationAngle(this.m_positionB, this.m_angleB);
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.PolyCollision.Create = function (canvas, settings)
{
	return new box2d.Testbed.PolyCollision(canvas, settings);
}

