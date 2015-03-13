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

goog.provide('box2d.Testbed.ConvexHull');

goog.require('box2d.Testbed.Test');

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.ConvexHull = function (canvas, settings)
{
	box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

	this.m_test_points = box2d.b2Vec2.MakeArray(box2d.b2_maxPolygonVertices);

	this.Generate();
	this.m_auto = false;
}

goog.inherits(box2d.Testbed.ConvexHull, box2d.Testbed.Test);

/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.ConvexHull.e_count = box2d.b2_maxPolygonVertices;

/**
 * @export
 * @type {Array.<box2d.b2Vec2>}
 */
box2d.Testbed.ConvexHull.prototype.m_test_points = null;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.ConvexHull.prototype.m_count = 0;
/**
 * @export
 * @type {boolean}
 */
box2d.Testbed.ConvexHull.prototype.m_auto = false;

/**
 * @export
 * @return {void}
 */
box2d.Testbed.ConvexHull.prototype.Generate = function ()
{
	for (var i = 0; i < box2d.Testbed.ConvexHull.e_count; ++i)
	{
		var x = box2d.b2RandomRange(-10.0, 10.0);
		var y = box2d.b2RandomRange(-10.0, 10.0);

		// Clamp onto a square to help create collinearities.
		// This will stress the convex hull algorithm.
		x = box2d.b2Clamp(x, -8.0, 8.0);
		y = box2d.b2Clamp(y, -8.0, 8.0);
		this.m_test_points[i].Set(x, y);
	}

	this.m_count = box2d.Testbed.ConvexHull.e_count;
}

/**
 * @export
 * @return {void}
 * @param {number} key
 */
box2d.Testbed.ConvexHull.prototype.Keyboard = function (key)
{
	switch (key)
	{
	case goog.events.KeyCodes.A:
		this.m_auto = !this.m_auto;
		break;

	case goog.events.KeyCodes.G:
		this.Generate();
		break;
	}
}

/**
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.ConvexHull.prototype.Step = function (settings)
{
	box2d.Testbed.Test.prototype.Step.call(this, settings);

	var shape = new box2d.b2PolygonShape();
	shape.Set(this.m_test_points, this.m_count);

	this.m_debugDraw.DrawString(5, this.m_textLine, "Press g to generate a new random convex hull");
	this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;

	this.m_debugDraw.DrawPolygon(shape.m_vertices, shape.m_count, new box2d.b2Color(0.9, 0.9, 0.9));

	for (var i = 0; i < this.m_count; ++i)
	{
		this.m_debugDraw.DrawPoint(this.m_test_points[i], 3.0, new box2d.b2Color(0.3, 0.9, 0.3));
		this.m_debugDraw.DrawStringWorld(this.m_test_points[i].x + 0.05, this.m_test_points[i].y + 0.05, "%d", i);
	}

	if (!shape.Validate())
	{
		this.m_textLine += 0;
	}

	if (this.m_auto)
	{
		this.Generate();
	}
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.ConvexHull.Create = function (canvas, settings)
{
	return new box2d.Testbed.ConvexHull(canvas, settings);
}

