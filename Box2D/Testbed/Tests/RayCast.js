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

goog.provide('box2d.Testbed.RayCast');

goog.require('box2d.Testbed.Test');

// This test demonstrates how to use the world ray-cast feature.
// NOTE: we are intentionally filtering one of the polygons, therefore
// the ray will always miss one type of polygon.

// This callback finds the closest hit. Polygon 0 is filtered.
/**
 * @export 
 * @constructor 
 * @extends {box2d.b2RayCastCallback} 
 */
box2d.Testbed.RayCastClosestCallback = function ()
{
	box2d.b2RayCastCallback.call(this); // base class constructor

	this.m_point = new box2d.b2Vec2();
	this.m_normal = new box2d.b2Vec2();
}

goog.inherits(box2d.Testbed.RayCastClosestCallback, box2d.b2RayCastCallback);

/**
 * @export 
 * @type {boolean} 
 */
box2d.Testbed.RayCastClosestCallback.prototype.m_hit = false;
/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.Testbed.RayCastClosestCallback.prototype.m_point = null;
/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.Testbed.RayCastClosestCallback.prototype.m_normal = null;

/**
 * @export 
 * @return {number} 
 * @param {box2d.b2Fixture} fixture 
 * @param {box2d.b2Vec2} point 
 * @param {box2d.b2Vec2} normal 
 * @param {number} fraction 
 */
box2d.Testbed.RayCastClosestCallback.prototype.ReportFixture = function (fixture, point, normal, fraction)
{
	var body = fixture.GetBody();
	var userData = body.GetUserData();
	if (userData)
	{
		var index = userData.index;
		if (index === 0)
		{
			// By returning -1, we instruct the calling code to ignore this fixture and
			// continue the ray-cast to the next fixture.
			return -1;
		}
	}

	this.m_hit = true;
	this.m_point.Copy(point);
	this.m_normal.Copy(normal);

	// By returning the current fraction, we instruct the calling code to clip the ray and
	// continue the ray-cast to the next fixture. WARNING: do not assume that fixtures
	// are reported in order. However, by clipping, we can always get the closest fixture.
	return fraction;
}

// This callback finds any hit. Polygon 0 is filtered. For this type of query we are usually
// just checking for obstruction, so the actual fixture and hit point are irrelevant. 
/**
 * @export 
 * @constructor 
 * @extends {box2d.b2RayCastCallback} 
 */
box2d.Testbed.RayCastAnyCallback = function ()
{
	box2d.b2RayCastCallback.call(this); // base class constructor

	this.m_point = new box2d.b2Vec2();
	this.m_normal = new box2d.b2Vec2();
}

goog.inherits(box2d.Testbed.RayCastAnyCallback, box2d.b2RayCastCallback);

/**
 * @export 
 * @type {boolean} 
 */
box2d.Testbed.RayCastAnyCallback.prototype.m_hit = false;
/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.Testbed.RayCastAnyCallback.prototype.m_point = null;
/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.Testbed.RayCastAnyCallback.prototype.m_normal = null;

/**
 * @export 
 * @return {number} 
 * @param {box2d.b2Fixture} fixture 
 * @param {box2d.b2Vec2} point 
 * @param {box2d.b2Vec2} normal 
 * @param {number} fraction 
 */
box2d.Testbed.RayCastAnyCallback.prototype.ReportFixture = function (fixture, point, normal, fraction)
{
	var body = fixture.GetBody();
	var userData = body.GetUserData();
	if (userData)
	{
		var index = userData.index;
		if (index === 0)
		{
			// By returning -1, we instruct the calling code to ignore this fixture
			// and continue the ray-cast to the next fixture.
			return -1;
		}
	}

	this.m_hit = true;
	this.m_point.Copy(point);
	this.m_normal.Copy(normal);

	// At this point we have a hit, so we know the ray is obstructed.
	// By returning 0, we instruct the calling code to terminate the ray-cast.
	return 0;
}

// This ray cast collects multiple hits along the ray. Polygon 0 is filtered.
// The fixtures are not necessary reported in order, so we might not capture
// the closest fixture.
/**
 * @export 
 * @constructor
 * @extends {box2d.b2RayCastCallback} 
 */
box2d.Testbed.RayCastMultipleCallback = function ()
{
	box2d.b2RayCastCallback.call(this); // base class constructor

	this.m_points = box2d.b2Vec2.MakeArray(box2d.Testbed.RayCastMultipleCallback.e_maxCount);
	this.m_normals = box2d.b2Vec2.MakeArray(box2d.Testbed.RayCastMultipleCallback.e_maxCount);
}

goog.inherits(box2d.Testbed.RayCastMultipleCallback, box2d.b2RayCastCallback);

/**
 * @export 
 * @const 
 * @type {number} 
 */
box2d.Testbed.RayCastMultipleCallback.e_maxCount = 3;

/**
 * @export 
 * @type {Array.<box2d.b2Vec2>} 
 */
box2d.Testbed.RayCastMultipleCallback.prototype.m_points = null;
/**
 * @export 
 * @type {Array.<box2d.b2Vec2>} 
 */
box2d.Testbed.RayCastMultipleCallback.prototype.m_normals = null;
/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.RayCastMultipleCallback.prototype.m_count = 0;

/**
 * @export 
 * @return {number} 
 * @param {box2d.b2Fixture} fixture 
 * @param {box2d.b2Vec2} point 
 * @param {box2d.b2Vec2} normal 
 * @param {number} fraction 
 */
box2d.Testbed.RayCastMultipleCallback.prototype.ReportFixture = function (fixture, point, normal, fraction)
{
	var body = fixture.GetBody();
	var userData = body.GetUserData();
	if (userData)
	{
		var index = userData.index;
		if (index === 0)
		{
			// By returning -1, we instruct the calling code to ignore this fixture
			// and continue the ray-cast to the next fixture.
			return -1;
		}
	}

	if (box2d.ENABLE_ASSERTS) { box2d.b2Assert(this.m_count < box2d.Testbed.RayCastMultipleCallback.e_maxCount); }

	this.m_points[this.m_count].Copy(point);
	this.m_normals[this.m_count].Copy(normal);
	++this.m_count;

	if (this.m_count === box2d.Testbed.RayCastMultipleCallback.e_maxCount)
	{
		// At this point the buffer is full.
		// By returning 0, we instruct the calling code to terminate the ray-cast.
		return 0;
	}

	// By returning 1, we instruct the caller to continue without clipping the ray.
	return 1;
}

/** 
 * @export 
 * @enum
 */
box2d.Testbed.RayCastMode = 
{
	e_closest	: 0,
	e_any		: 1,
	e_multiple	: 2
};
goog.exportProperty(box2d.Testbed.RayCastMode, 'e_closest' , box2d.Testbed.RayCastMode.e_closest );
goog.exportProperty(box2d.Testbed.RayCastMode, 'e_any'     , box2d.Testbed.RayCastMode.e_any     );
goog.exportProperty(box2d.Testbed.RayCastMode, 'e_multiple', box2d.Testbed.RayCastMode.e_multiple);

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.RayCast = function (canvas, settings)
{
	box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

	this.m_bodyIndex = 0;
	this.m_bodies = new Array(box2d.Testbed.RayCast.e_maxBodies);
	this.m_polygons = new Array(4);
	for (var i = 0; i < 4; ++i)
	{
		this.m_polygons[i] = new box2d.b2PolygonShape();
	}
	this.m_circle = new box2d.b2CircleShape();
	this.m_edge = new box2d.b2EdgeShape();

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

	{
		this.m_edge.SetAsEdge(new box2d.b2Vec2(-1, 0), new box2d.b2Vec2(1, 0));
	}

	for (var i = 0; i < box2d.Testbed.RayCast.e_maxBodies; ++i)
	{
		this.m_bodies[i] = null;
	}

	this.m_angle = 0.0;

	this.m_mode = box2d.Testbed.RayCastMode.e_closest;
}

goog.inherits(box2d.Testbed.RayCast, box2d.Testbed.Test);

/**
 * @export 
 * @const 
 * @type {number} 
 */
box2d.Testbed.RayCast.e_maxBodies = 256;

/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.RayCast.prototype.m_bodyIndex = 0;
/**
 * @export 
 * @type {Array.<box2d.b2Body>} 
 */
box2d.Testbed.RayCast.prototype.m_bodies = null;
/**
 * @export 
 * @type {Array.<box2d.b2PolygonShape>} 
 */
box2d.Testbed.RayCast.prototype.m_polygons = null;
/**
 * @export 
 * @type {box2d.b2CircleShape} 
 */
box2d.Testbed.RayCast.prototype.m_circle = null;
/**
 * @export 
 * @type {box2d.b2EdgeShape} 
 */
box2d.Testbed.RayCast.prototype.m_edge = null;

/** 
 * @export 
 * @return {void} 
 * @param {number} index 
 */
box2d.Testbed.RayCast.prototype.CreateBody = function (index)
{
	if (this.m_bodies[this.m_bodyIndex] !== null)
	{
		this.m_world.DestroyBody(this.m_bodies[this.m_bodyIndex]);
		this.m_bodies[this.m_bodyIndex] = null;
	}

	var bd = new box2d.b2BodyDef();

	var x = box2d.b2RandomRange(-10.0, 10.0);
	var y = box2d.b2RandomRange(0.0, 20.0);
	bd.position.Set(x, y);
	bd.angle = box2d.b2RandomRange(-box2d.b2_pi, box2d.b2_pi);

	bd.userData = new Object();
	bd.userData.index = index;

	if (index === 4)
	{
		bd.angularDamping = 0.02;
	}

	this.m_bodies[this.m_bodyIndex] = this.m_world.CreateBody(bd);

	if (index < 4)
	{
		var fd = new box2d.b2FixtureDef();
		fd.shape = this.m_polygons[index];
		fd.friction = 0.3;
		this.m_bodies[this.m_bodyIndex].CreateFixture(fd);
	}
	else if (index < 5)
	{
		var fd = new box2d.b2FixtureDef();
		fd.shape = this.m_circle;
		fd.friction = 0.3;

		this.m_bodies[this.m_bodyIndex].CreateFixture(fd);
	}
	else
	{
		var fd = new box2d.b2FixtureDef();
		fd.shape = this.m_edge;
		fd.friction = 0.3;

		this.m_bodies[this.m_bodyIndex].CreateFixture(fd);
	}

	this.m_bodyIndex = (this.m_bodyIndex + 1) % box2d.Testbed.RayCast.e_maxBodies;
}

/**
 * @export 
 * @return {void} 
 */
box2d.Testbed.RayCast.prototype.DestroyBody = function ()
{
	for (var i = 0; i < box2d.Testbed.RayCast.e_maxBodies; ++i)
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
box2d.Testbed.RayCast.prototype.Keyboard = function (key)
{
	switch (key)
	{
	case goog.events.KeyCodes.ONE:
	case goog.events.KeyCodes.TWO:
	case goog.events.KeyCodes.THREE:
	case goog.events.KeyCodes.FOUR:
	case goog.events.KeyCodes.FIVE:
	case goog.events.KeyCodes.SIX:
		this.CreateBody(key - goog.events.KeyCodes.ONE);
		break;

	case goog.events.KeyCodes.D:
		this.DestroyBody();
		break;

	case goog.events.KeyCodes.M:
		if (this.m_mode === box2d.Testbed.RayCastMode.e_closest)
		{
			this.m_mode = box2d.Testbed.RayCastMode.e_any;
		}
		else if (this.m_mode === box2d.Testbed.RayCastMode.e_any)
		{
			this.m_mode = box2d.Testbed.RayCastMode.e_multiple;
		}
		else if (this.m_mode === box2d.Testbed.RayCastMode.e_multiple)
		{
			this.m_mode = box2d.Testbed.RayCastMode.e_closest;
		}
	}
}

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.RayCast.prototype.Step = function (settings)
{
	var advanceRay = !settings.pause || settings.singleStep;

	box2d.Testbed.Test.prototype.Step.call(this, settings);

	this.m_debugDraw.DrawString(5, this.m_textLine, "Press 1-6 to drop stuff, m to change the mode");
	this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
	switch (this.m_mode)
	{
	case box2d.Testbed.RayCastMode.e_closest:
		this.m_debugDraw.DrawString(5, this.m_textLine, "Ray-cast mode: closest - find closest fixture along the ray");
		break;

	case box2d.Testbed.RayCastMode.e_any:
		this.m_debugDraw.DrawString(5, this.m_textLine, "Ray-cast mode: any - check for obstruction");
		break;

	case box2d.Testbed.RayCastMode.e_multiple:
		this.m_debugDraw.DrawString(5, this.m_textLine, "Ray-cast mode: multiple - gather multiple fixtures");
		break;
	}

	this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;

	var L = 11.0;
	var point1 = new box2d.b2Vec2(0.0, 10.0);
	var d = new box2d.b2Vec2(L * box2d.b2Cos(this.m_angle), L * box2d.b2Sin(this.m_angle));
	var point2 = box2d.b2Add_V2_V2(point1, d, new box2d.b2Vec2());

	if (this.m_mode === box2d.Testbed.RayCastMode.e_closest)
	{
		var callback = new box2d.Testbed.RayCastClosestCallback();
		this.m_world.RayCast(callback, point1, point2);
	
		if (callback.m_hit)
		{
			this.m_debugDraw.DrawPoint(callback.m_point, 5.0, new box2d.b2Color(0.4, 0.9, 0.4));
			this.m_debugDraw.DrawSegment(point1, callback.m_point, new box2d.b2Color(0.8, 0.8, 0.8));
			var head = box2d.b2Add_V2_V2(callback.m_point, box2d.b2Mul_S_V2(0.5, callback.m_normal, box2d.b2Vec2.s_t0), new box2d.b2Vec2());
			this.m_debugDraw.DrawSegment(callback.m_point, head, new box2d.b2Color(0.9, 0.9, 0.4));
		}
		else
		{
			this.m_debugDraw.DrawSegment(point1, point2, new box2d.b2Color(0.8, 0.8, 0.8));
		}
	}
	else if (this.m_mode === box2d.Testbed.RayCastMode.e_any)
	{
		var callback = new box2d.Testbed.RayCastAnyCallback();
		this.m_world.RayCast(callback, point1, point2);
	
		if (callback.m_hit)
		{
			this.m_debugDraw.DrawPoint(callback.m_point, 5.0, new box2d.b2Color(0.4, 0.9, 0.4));
			this.m_debugDraw.DrawSegment(point1, callback.m_point, new box2d.b2Color(0.8, 0.8, 0.8));
			var head = box2d.b2Add_V2_V2(callback.m_point, box2d.b2Mul_S_V2(0.5, callback.m_normal, box2d.b2Vec2.s_t0), new box2d.b2Vec2());
			this.m_debugDraw.DrawSegment(callback.m_point, head, new box2d.b2Color(0.9, 0.9, 0.4));
		}
		else
		{
			this.m_debugDraw.DrawSegment(point1, point2, new box2d.b2Color(0.8, 0.8, 0.8));
		}
	}
	else if (this.m_mode === box2d.Testbed.RayCastMode.e_multiple)
	{
		var callback = new box2d.Testbed.RayCastMultipleCallback();
		this.m_world.RayCast(callback, point1, point2);
		this.m_debugDraw.DrawSegment(point1, point2, new box2d.b2Color(0.8, 0.8, 0.8));
	
		for (var i = 0; i < callback.m_count; ++i)
		{
			var p = callback.m_points[i];
			var n = callback.m_normals[i];
			this.m_debugDraw.DrawPoint(p, 5.0, new box2d.b2Color(0.4, 0.9, 0.4));
			this.m_debugDraw.DrawSegment(point1, p, new box2d.b2Color(0.8, 0.8, 0.8));
			var head = box2d.b2Add_V2_V2(p, box2d.b2Mul_S_V2(0.5, n, box2d.b2Vec2.s_t0), new box2d.b2Vec2());
			this.m_debugDraw.DrawSegment(p, head, new box2d.b2Color(0.9, 0.9, 0.4));
		}
	}

	if (advanceRay)
	{
		this.m_angle += 0.25 * box2d.b2_pi / 180.0;
	}

/*
#if 0
	// This case was failing.
	{
		box2d.b2Vec2 vertices[4];
		//vertices[0].Set(-22.875f, -3.0f);
		//vertices[1].Set(22.875f, -3.0f);
		//vertices[2].Set(22.875f, 3.0f);
		//vertices[3].Set(-22.875f, 3.0f);

		box2d.b2PolygonShape shape;
		//shape.Set(vertices, 4);
		shape.SetAsBox(22.875f, 3.0f);

		box2d.b2RayCastInput input;
		input.p1.Set(10.2725f,1.71372f);
		input.p2.Set(10.2353f,2.21807f);
		//input.maxFraction = 0.567623f;
		input.maxFraction = 0.56762173f;

		box2d.b2Transform xf;
		xf.SetIdentity();
		xf.p.Set(23.0f, 5.0f);

		box2d.b2RayCastOutput output;
		bool hit;
		hit = shape.RayCast(&output, input, xf);
		hit = false;

		box2d.b2Color color(1.0f, 1.0f, 1.0f);
		box2d.b2Vec2 vs[4];
		for (int32 i = 0; i < 4; ++i)
		{
			vs[i] = b2Mul(xf, shape.m_vertices[i]);
		}

		m_debugDraw.DrawPolygon(vs, 4, color);
		m_debugDraw.DrawSegment(input.p1, input.p2, color);
	}
#endif
*/
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.RayCast.Create = function (canvas, settings)
{
	return new box2d.Testbed.RayCast(canvas, settings);
}

