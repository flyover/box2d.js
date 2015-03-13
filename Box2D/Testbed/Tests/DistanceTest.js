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

goog.provide('box2d.Testbed.DistanceTest');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.DistanceTest = function (canvas, settings)
{
	box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

	this.m_positionB = new box2d.b2Vec2();
	this.m_transformA = new box2d.b2Transform();
	this.m_transformB = new box2d.b2Transform();
	this.m_polygonA = new box2d.b2PolygonShape();
	this.m_polygonB = new box2d.b2PolygonShape();

	{
		this.m_transformA.SetIdentity();
		this.m_transformA.p.Set(0.0, -0.2);
		this.m_polygonA.SetAsBox(10.0, 0.2);
	}

	{
		this.m_positionB.Set(12.017401, 0.13678508);
		this.m_angleB = -0.0109265;
		this.m_transformB.SetPositionRotationAngle(this.m_positionB, this.m_angleB);

		this.m_polygonB.SetAsBox(2.0, 0.1);
	}
}

goog.inherits(box2d.Testbed.DistanceTest, box2d.Testbed.Test);

/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.Testbed.DistanceTest.prototype.m_positionB = null;
/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.DistanceTest.prototype.m_angleB = 0.0;
/**
 * @export 
 * @type {box2d.b2Transform} 
 */
box2d.Testbed.DistanceTest.prototype.m_transformA = null;
/**
 * @export 
 * @type {box2d.b2Transform} 
 */
box2d.Testbed.DistanceTest.prototype.m_transformB = null;
/**
 * @export 
 * @type {box2d.b2PolygonShape} 
 */
box2d.Testbed.DistanceTest.prototype.m_polygonA = null;
/**
 * @export 
 * @type {box2d.b2PolygonShape} 
 */
box2d.Testbed.DistanceTest.prototype.m_polygonB = null;

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.DistanceTest.prototype.Step = function (settings)
{
	box2d.Testbed.Test.prototype.Step.call(this, settings);

	var input = new box2d.b2DistanceInput();
	input.proxyA.SetShape(this.m_polygonA, 0);
	input.proxyB.SetShape(this.m_polygonB, 0);
	input.transformA.Copy(this.m_transformA);
	input.transformB.Copy(this.m_transformB);
	input.useRadii = true;
	var cache = new box2d.b2SimplexCache();
	cache.count = 0;
	var output = new box2d.b2DistanceOutput();
	box2d.b2ShapeDistance(output, cache, input);

	this.m_debugDraw.DrawString(5, this.m_textLine, "distance = %4.2f", output.distance);
	this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;

	this.m_debugDraw.DrawString(5, this.m_textLine, "iterations = %d", output.iterations);
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

	var x1 = output.pointA;
	var x2 = output.pointB;

	var c1 = new box2d.b2Color(1.0, 0.0, 0.0);
	this.m_debugDraw.DrawPoint(x1, 4.0, c1);

	var c2 = new box2d.b2Color(1.0, 1.0, 0.0);
	this.m_debugDraw.DrawPoint(x2, 4.0, c2);
}

/**
 * @export 
 * @return {void} 
 * @param {number} key 
 */
box2d.Testbed.DistanceTest.prototype.Keyboard = function (key)
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
box2d.Testbed.DistanceTest.Create = function (canvas, settings)
{
	return new box2d.Testbed.DistanceTest(canvas, settings);
}

