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

goog.provide('box2d.Testbed.PolyShapes');

goog.require('box2d.Testbed.Test');

/**
 * This callback is called by box2d.b2World::QueryAABB. We find
 * all the fixtures that overlap an AABB. Of those, we use
 * b2TestOverlap to determine which fixtures overlap a circle.
 * Up to 4 overlapped fixtures will be highlighted with a yellow
 * border.
 * @export 
 * @constructor 
 * @extends {box2d.b2QueryCallback} 
 */
box2d.Testbed.PolyShapesCallback = function ()
{
	this.m_circle = new box2d.b2CircleShape();
	this.m_transform = new box2d.b2Transform();
}

goog.inherits(box2d.Testbed.PolyShapesCallback, box2d.b2QueryCallback);

/**
 * @export 
 * @const 
 * @type {number} 
 */
box2d.Testbed.PolyShapesCallback.e_maxCount = 4;

/**
 * @export 
 * @type {box2d.b2CircleShape} 
 */
box2d.Testbed.PolyShapesCallback.prototype.m_circle = null;
/**
 * @export 
 * @type {box2d.b2Transform} 
 */
box2d.Testbed.PolyShapesCallback.prototype.m_transform = null;
/**
 * @export 
 * @type {box2d.b2Draw} 
 */
box2d.Testbed.PolyShapesCallback.prototype.m_debug_draw = null;
/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.PolyShapesCallback.prototype.m_count = 0;

/** 
 * @param {box2d.b2Fixture} fixture 
 */
box2d.Testbed.PolyShapesCallback.prototype.DrawFixture = function (fixture)
{
	var color = new box2d.b2Color(0.95, 0.95, 0.6);
	var xf = fixture.GetBody().GetTransform();

	switch (fixture.GetType())
	{
	case box2d.b2ShapeType.e_circleShape:
		{
			//var circle = ((shape instanceof box2d.b2CircleShape ? shape : null));
			var circle = fixture.GetShape();

			var center = box2d.b2Mul_X_V2(xf, circle.m_p, new box2d.b2Vec2());
			var radius = circle.m_radius;

			this.m_debugDraw.DrawCircle(center, radius, color);
		}
		break;

	case box2d.b2ShapeType.e_polygonShape:
		{
			//var poly = ((shape instanceof box2d.b2PolygonShape ? shape : null));
			var poly = fixture.GetShape();
			var vertexCount = box2d.b2ParseInt(poly.m_count);
			if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(vertexCount <= box2d.b2_maxPolygonVertices); }
			var vertices = new Array(box2d.b2_maxPolygonVertices);

			for (var i = 0; i < vertexCount; ++i)
			{
				vertices[i] = box2d.b2Mul_X_V2(xf, poly.m_vertices[i], new box2d.b2Vec2());
			}

			this.m_debugDraw.DrawPolygon(vertices, vertexCount, color);
		}
		break;

	default:
		break;
	}
}

/** 
 * Called for each fixture found in the query AABB. 
 * @return {boolean} false to terminate the query.
 * @param {box2d.b2Fixture} fixture 
 */
box2d.Testbed.PolyShapesCallback.prototype.ReportFixture = function (fixture)
{
	if (this.m_count === box2d.Testbed.PolyShapesCallback.e_maxCount)
	{
		return false;
	}

	var body = fixture.GetBody();
	var shape = fixture.GetShape();

	var overlap = box2d.b2TestOverlap_Shape(shape, 0, this.m_circle, 0, body.GetTransform(), this.m_transform);

	if (overlap)
	{
		this.DrawFixture(fixture);
		++this.m_count;
	}

	return true;
}

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.PolyShapes = function (canvas, settings)
{
	box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

	this.m_bodyIndex = 0;
	this.m_bodies = new Array(box2d.Testbed.PolyShapes.e_maxBodies);
	this.m_polygons = new Array(4);
	for (var i = 0; i < 4; ++i)
	{
		this.m_polygons[i] = new box2d.b2PolygonShape();
	}
	this.m_circle = new box2d.b2CircleShape();

	// Ground body
	{
		var bd = new box2d.b2BodyDef();
		var ground = this.m_world.CreateBody(bd);

		var shape = new box2d.b2EdgeShape();
		shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
		ground.CreateFixture(shape, 0.0);
	}

	{
		var vertices = new Array(3);
		vertices[0] = new box2d.b2Vec2(-0.5, 0.0);
		vertices[1] = new box2d.b2Vec2(0.5, 0.0);
		vertices[2] = new box2d.b2Vec2(0.0, 1.5);
		this.m_polygons[0].Set(vertices, 3);
	}

	{
		var vertices = new Array(3);
		vertices[0] = new box2d.b2Vec2(-0.1, 0.0);
		vertices[1] = new box2d.b2Vec2(0.1, 0.0);
		vertices[2] = new box2d.b2Vec2(0.0, 1.5);
		this.m_polygons[1].Set(vertices, 3);
	}

	{
		var w = 1.0;
		var b = w / (2.0 + box2d.b2Sqrt(2.0));
		var s = box2d.b2Sqrt(2.0) * b;

		var vertices = new Array(8);
		vertices[0] = new box2d.b2Vec2(0.5 * s, 0.0);
		vertices[1] = new box2d.b2Vec2(0.5 * w, b);
		vertices[2] = new box2d.b2Vec2(0.5 * w, b + s);
		vertices[3] = new box2d.b2Vec2(0.5 * s, w);
		vertices[4] = new box2d.b2Vec2(-0.5 * s, w);
		vertices[5] = new box2d.b2Vec2(-0.5 * w, b + s);
		vertices[6] = new box2d.b2Vec2(-0.5 * w, b);
		vertices[7] = new box2d.b2Vec2(-0.5 * s, 0.0);

		this.m_polygons[2].Set(vertices, 8);
	}

	{
		this.m_polygons[3].SetAsBox(0.5, 0.5);
	}

	{
		this.m_circle.m_radius = 0.5;
	}

	for (var i = 0; i < box2d.Testbed.PolyShapes.e_maxBodies; ++i)
	{
		this.m_bodies[i] = null;
	}
}

goog.inherits(box2d.Testbed.PolyShapes, box2d.Testbed.Test);

/**
 * @export 
 * @const 
 * @type {number} 
 */
box2d.Testbed.PolyShapes.e_maxBodies = 256;

/** 
 * @export 
 * @return {void} 
 * @param {number} index 
 */
box2d.Testbed.PolyShapes.prototype.CreateBody = function (index)
{
	if (this.m_bodies[this.m_bodyIndex] !== null)
	{
		this.m_world.DestroyBody(this.m_bodies[this.m_bodyIndex]);
		this.m_bodies[this.m_bodyIndex] = null;
	}

	var bd = new box2d.b2BodyDef();
	bd.type = box2d.b2BodyType.b2_dynamicBody;

	var x = box2d.b2RandomRange(-2.0, 2.0);
	bd.position.Set(x, 10.0);
	bd.angle = box2d.b2RandomRange(-box2d.b2_pi, box2d.b2_pi);

	if (index === 4)
	{
		bd.angularDamping = 0.02;
	}

	this.m_bodies[this.m_bodyIndex] = this.m_world.CreateBody(bd);

	if (index < 4)
	{
		var fd = new box2d.b2FixtureDef();
		fd.shape = this.m_polygons[index];
		fd.density = 1.0;
		fd.friction = 0.3;
		this.m_bodies[this.m_bodyIndex].CreateFixture(fd);
	}
	else
	{
		var fd = new box2d.b2FixtureDef();
		fd.shape = this.m_circle;
		fd.density = 1.0;
		fd.friction = 0.3;

		this.m_bodies[this.m_bodyIndex].CreateFixture(fd);
	}

	this.m_bodyIndex = (this.m_bodyIndex + 1) % box2d.Testbed.PolyShapes.e_maxBodies;
}

/** 
 * @export 
 * @return {void} 
 */
box2d.Testbed.PolyShapes.prototype.DestroyBody = function ()
{
	for (var i = 0; i < box2d.Testbed.PolyShapes.e_maxBodies; ++i)
	{
		if (this.m_bodies[i] !== null)
		{
			this.m_world.DestroyBody(this.m_bodies[i]);
			this.m_bodies[i] = null;
			return;
		}
	}
}

/**
 * @export 
 * @return {void} 
 * @param {number} key 
 */
box2d.Testbed.PolyShapes.prototype.Keyboard = function (key)
{
	switch (key)
	{
	case goog.events.KeyCodes.ONE:
	case goog.events.KeyCodes.TWO:
	case goog.events.KeyCodes.THREE:
	case goog.events.KeyCodes.FOUR:
	case goog.events.KeyCodes.FIVE:
		this.CreateBody(key - goog.events.KeyCodes.ONE);
		break;

	case goog.events.KeyCodes.A:
		for (var i = 0; i < box2d.Testbed.PolyShapes.e_maxBodies; i += 2)
		{
			if (this.m_bodies[i])
			{
				var active = this.m_bodies[i].IsActive();
				this.m_bodies[i].SetActive(!active);
			}
		}
		break;

	case goog.events.KeyCodes.D:
		this.DestroyBody();
		break;
	}
}

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.PolyShapes.prototype.Step = function (settings)
{
	box2d.Testbed.Test.prototype.Step.call(this, settings);

	var callback = new box2d.Testbed.PolyShapesCallback();
	callback.m_circle.m_radius = 2.0;
	callback.m_circle.m_p.Set(0.0, 1.1);
	callback.m_transform.SetIdentity();
	callback.m_debugDraw = this.m_debugDraw;

	var aabb = new box2d.b2AABB();
	callback.m_circle.ComputeAABB(aabb, callback.m_transform, 0);

	this.m_world.QueryAABB(callback, aabb);

	var color = new box2d.b2Color(0.4, 0.7, 0.8);
	this.m_debugDraw.DrawCircle(callback.m_circle.m_p, callback.m_circle.m_radius, color);

	this.m_debugDraw.DrawString(5, this.m_textLine, "Press 1-5 to drop stuff");
	this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
	this.m_debugDraw.DrawString(5, this.m_textLine, "Press 'a' to (de)activate some bodies");
	this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
	this.m_debugDraw.DrawString(5, this.m_textLine, "Press 'd' to destroy a body");
	this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.PolyShapes.Create = function (canvas, settings)
{
	return new box2d.Testbed.PolyShapes(canvas, settings);
}

