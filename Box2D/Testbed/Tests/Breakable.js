/*
* Copyright (c) 2008-2009 Erin Catto http://www.box2d.org
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

goog.provide('box2d.Testbed.Breakable');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Breakable = function (canvas, settings)
{
	box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

	this.m_velocity = new box2d.b2Vec2();
	this.m_shape1 = new box2d.b2PolygonShape();
	this.m_shape2 = new box2d.b2PolygonShape();

	// Ground body
	{
		/*box2d.b2BodyDef*/ var bd = new box2d.b2BodyDef();
		/*box2d.b2Body*/ var ground = this.m_world.CreateBody(bd);
	
		/*box2d.b2EdgeShape*/ var shape = new box2d.b2EdgeShape();
		shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
		ground.CreateFixture(shape, 0.0);
	}

	// Breakable dynamic body
	{
		/*box2d.b2BodyDef*/ var bd = new box2d.b2BodyDef();
		bd.type = box2d.b2BodyType.b2_dynamicBody;
		bd.position.Set(0.0, 40.0);
		bd.angle = 0.25 * box2d.b2_pi;
		this.m_body1 = this.m_world.CreateBody(bd);

		this.m_shape1 = new box2d.b2PolygonShape();
		this.m_shape1.SetAsBox(0.5, 0.5, new box2d.b2Vec2(-0.5, 0.0), 0.0);
		this.m_piece1 = this.m_body1.CreateFixture(this.m_shape1, 1.0);

		this.m_shape2 = new box2d.b2PolygonShape();
		this.m_shape2.SetAsBox(0.5, 0.5, new box2d.b2Vec2(0.5, 0.0), 0.0);
		this.m_piece2 = this.m_body1.CreateFixture(this.m_shape2, 1.0);
	}
}

goog.inherits(box2d.Testbed.Breakable, box2d.Testbed.Test);

/**
 * @export 
 * @const 
 * @type {number} 
 */
box2d.Testbed.Breakable.e_count = 7;

/**
 * @export 
 * @type {box2d.b2Body} 
 */
box2d.Testbed.Breakable.prototype.m_body1 = null;
/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.Testbed.Breakable.prototype.m_velocity = null;
/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.Breakable.prototype.m_angularVelocity = 0;
/**
 * @export 
 * @type {box2d.b2PolygonShape} 
 */
box2d.Testbed.Breakable.prototype.m_shape1 = null;
/**
 * @export 
 * @type {box2d.b2PolygonShape} 
 */
box2d.Testbed.Breakable.prototype.m_shape2 = null;
/**
 * @export 
 * @type {box2d.b2Fixture} 
 */
box2d.Testbed.Breakable.prototype.m_piece1 = null;
/**
 * @export 
 * @type {box2d.b2Fixture} 
 */
box2d.Testbed.Breakable.prototype.m_piece2 = null;
/**
 * @export 
 * @type {boolean} 
 */
box2d.Testbed.Breakable.prototype.m_broke = false;
/**
 * @export 
 * @type {boolean} 
 */
box2d.Testbed.Breakable.prototype.m_break = false;

/**
 * @export
 * @return {void} 
 * @param {box2d.b2Contact} contact 
 * @param {box2d.b2ContactImpulse} impulse 
 */
box2d.Testbed.Breakable.prototype.PostSolve = function (contact, impulse)
{
	if (this.m_broke)
	{
		// The body already broke.
		return;
	}

	// Should the body break?
	/*int*/ var count = contact.GetManifold().pointCount;

	/*float32*/ var maxImpulse = 0.0;
	for (/*int*/ var i = 0; i < count; ++i)
	{
		maxImpulse = box2d.b2Max(maxImpulse, impulse.normalImpulses[i]);
	}

	if (maxImpulse > 40.0)
	{
		// Flag the body for breaking.
		this.m_break = true;
	}
}

/** 
 * @export 
 * @return {void} 
 */
box2d.Testbed.Breakable.prototype.Break = function ()
{
	// Create two bodies from one.
	/*box2d.b2Body*/ var body1 = this.m_piece1.GetBody();
	/*box2d.b2Vec2*/ var center = body1.GetWorldCenter();

	body1.DestroyFixture(this.m_piece2);
	this.m_piece2 = null;

	/*box2d.b2BodyDef*/ var bd = new box2d.b2BodyDef();
	bd.type = box2d.b2BodyType.b2_dynamicBody;
	bd.position = body1.GetPosition();
	bd.angle = body1.GetAngle();

	/*box2d.b2Body*/ var body2 = this.m_world.CreateBody(bd);
	this.m_piece2 = body2.CreateFixture(this.m_shape2, 1.0);

	// Compute consistent velocities for new bodies based on
	// cached velocity.
	/*box2d.b2Vec2*/ var center1 = body1.GetWorldCenter();
	/*box2d.b2Vec2*/ var center2 = body2.GetWorldCenter();
	
	/*box2d.b2Vec2*/ var velocity1 = box2d.b2AddCross_V2_S_V2(this.m_velocity, this.m_angularVelocity, box2d.b2Sub_V2_V2(center1, center, box2d.b2Vec2.s_t0), new box2d.b2Vec2());
	/*box2d.b2Vec2*/ var velocity2 = box2d.b2AddCross_V2_S_V2(this.m_velocity, this.m_angularVelocity, box2d.b2Sub_V2_V2(center2, center, box2d.b2Vec2.s_t0), new box2d.b2Vec2());

	body1.SetAngularVelocity(this.m_angularVelocity);
	body1.SetLinearVelocity(velocity1);

	body2.SetAngularVelocity(this.m_angularVelocity);
	body2.SetLinearVelocity(velocity2);
}

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Breakable.prototype.Step = function (settings)
{
	if (this.m_break)
	{
		this.Break();
		this.m_broke = true;
		this.m_break = false;
	}

	// Cache velocities to improve movement on breakage.
	if (!this.m_broke)
	{
		this.m_velocity = this.m_body1.GetLinearVelocity();
		this.m_angularVelocity = this.m_body1.GetAngularVelocity();
	}

	box2d.Testbed.Test.prototype.Step.call(this, settings);
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Breakable.Create = function (canvas, settings)
{
	return new box2d.Testbed.Breakable(canvas, settings);
}

