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

goog.provide('box2d.Testbed.Web');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Web = function (canvas, settings)
{
	box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

	this.m_bodies = new Array(4);
	this.m_joints = new Array(8);

	var ground = null;
	{
		var bd = new box2d.b2BodyDef();
		ground = this.m_world.CreateBody(bd);

		var shape = new box2d.b2EdgeShape();
		shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
		ground.CreateFixture(shape, 0.0);
	}

	{
		var shape = new box2d.b2PolygonShape();
		shape.SetAsBox(0.5, 0.5);

		var bd = new box2d.b2BodyDef();
		bd.type = box2d.b2BodyType.b2_dynamicBody;

		bd.position.Set(-5.0, 5.0);
		this.m_bodies[0] = this.m_world.CreateBody(bd);
		this.m_bodies[0].CreateFixture(shape, 5.0);

		bd.position.Set(5.0, 5.0);
		this.m_bodies[1] = this.m_world.CreateBody(bd);
		this.m_bodies[1].CreateFixture(shape, 5.0);

		bd.position.Set(5.0, 15.0);
		this.m_bodies[2] = this.m_world.CreateBody(bd);
		this.m_bodies[2].CreateFixture(shape, 5.0);

		bd.position.Set(-5.0, 15.0);
		this.m_bodies[3] = this.m_world.CreateBody(bd);
		this.m_bodies[3].CreateFixture(shape, 5.0);

		var jd = new box2d.b2DistanceJointDef();
		var p1, p2, d;

		jd.frequencyHz = 2.0;
		jd.dampingRatio = 0.0;

		jd.bodyA = ground;
		jd.bodyB = this.m_bodies[0];
		jd.localAnchorA.Set(-10.0, 0.0);
		jd.localAnchorB.Set(-0.5, -0.5);
		p1 = jd.bodyA.GetWorldPoint(jd.localAnchorA, new box2d.b2Vec2());
		p2 = jd.bodyB.GetWorldPoint(jd.localAnchorB, new box2d.b2Vec2());
		d = box2d.b2Sub_V2_V2(p2, p1, new box2d.b2Vec2());
		jd.length = d.Length();
		this.m_joints[0] = this.m_world.CreateJoint(jd);

		jd.bodyA = ground;
		jd.bodyB = this.m_bodies[1];
		jd.localAnchorA.Set(10.0, 0.0);
		jd.localAnchorB.Set(0.5, -0.5);
		p1 = jd.bodyA.GetWorldPoint(jd.localAnchorA, new box2d.b2Vec2());
		p2 = jd.bodyB.GetWorldPoint(jd.localAnchorB, new box2d.b2Vec2());
		d = box2d.b2Sub_V2_V2(p2, p1, new box2d.b2Vec2());
		jd.length = d.Length();
		this.m_joints[1] = this.m_world.CreateJoint(jd);

		jd.bodyA = ground;
		jd.bodyB = this.m_bodies[2];
		jd.localAnchorA.Set(10.0, 20.0);
		jd.localAnchorB.Set(0.5, 0.5);
		p1 = jd.bodyA.GetWorldPoint(jd.localAnchorA, new box2d.b2Vec2());
		p2 = jd.bodyB.GetWorldPoint(jd.localAnchorB, new box2d.b2Vec2());
		d = box2d.b2Sub_V2_V2(p2, p1, new box2d.b2Vec2());
		jd.length = d.Length();
		this.m_joints[2] = this.m_world.CreateJoint(jd);

		jd.bodyA = ground;
		jd.bodyB = this.m_bodies[3];
		jd.localAnchorA.Set(-10.0, 20.0);
		jd.localAnchorB.Set(-0.5, 0.5);
		p1 = jd.bodyA.GetWorldPoint(jd.localAnchorA, new box2d.b2Vec2());
		p2 = jd.bodyB.GetWorldPoint(jd.localAnchorB, new box2d.b2Vec2());
		d = box2d.b2Sub_V2_V2(p2, p1, new box2d.b2Vec2());
		jd.length = d.Length();
		this.m_joints[3] = this.m_world.CreateJoint(jd);

		jd.bodyA = this.m_bodies[0];
		jd.bodyB = this.m_bodies[1];
		jd.localAnchorA.Set(0.5, 0.0);
		jd.localAnchorB.Set(-0.5, 0.0);;
		p1 = jd.bodyA.GetWorldPoint(jd.localAnchorA, new box2d.b2Vec2());
		p2 = jd.bodyB.GetWorldPoint(jd.localAnchorB, new box2d.b2Vec2());
		d = box2d.b2Sub_V2_V2(p2, p1, new box2d.b2Vec2());
		jd.length = d.Length();
		this.m_joints[4] = this.m_world.CreateJoint(jd);

		jd.bodyA = this.m_bodies[1];
		jd.bodyB = this.m_bodies[2];
		jd.localAnchorA.Set(0.0, 0.5);
		jd.localAnchorB.Set(0.0, -0.5);
		p1 = jd.bodyA.GetWorldPoint(jd.localAnchorA, new box2d.b2Vec2());
		p2 = jd.bodyB.GetWorldPoint(jd.localAnchorB, new box2d.b2Vec2());
		d = box2d.b2Sub_V2_V2(p2, p1, new box2d.b2Vec2());
		jd.length = d.Length();
		this.m_joints[5] = this.m_world.CreateJoint(jd);

		jd.bodyA = this.m_bodies[2];
		jd.bodyB = this.m_bodies[3];
		jd.localAnchorA.Set(-0.5, 0.0);
		jd.localAnchorB.Set(0.5, 0.0);
		p1 = jd.bodyA.GetWorldPoint(jd.localAnchorA, new box2d.b2Vec2());
		p2 = jd.bodyB.GetWorldPoint(jd.localAnchorB, new box2d.b2Vec2());
		d = box2d.b2Sub_V2_V2(p2, p1, new box2d.b2Vec2());
		jd.length = d.Length();
		this.m_joints[6] = this.m_world.CreateJoint(jd);

		jd.bodyA = this.m_bodies[3];
		jd.bodyB = this.m_bodies[0];
		jd.localAnchorA.Set(0.0, -0.5);
		jd.localAnchorB.Set(0.0, 0.5);
		p1 = jd.bodyA.GetWorldPoint(jd.localAnchorA, new box2d.b2Vec2());
		p2 = jd.bodyB.GetWorldPoint(jd.localAnchorB, new box2d.b2Vec2());
		d = box2d.b2Sub_V2_V2(p2, p1, new box2d.b2Vec2());
		jd.length = d.Length();
		this.m_joints[7] = this.m_world.CreateJoint(jd);
	}
}

goog.inherits(box2d.Testbed.Web, box2d.Testbed.Test);

/**
 * @export 
 * @type {Array.<box2d.b2Body>} 
 */
box2d.Testbed.Web.prototype.m_bodies = null;
/**
 * @export 
 * @type {Array.<box2d.b2Joint>} 
 */
box2d.Testbed.Web.prototype.m_joints = null;

/**
 * @export 
 * @return {void} 
 * @param {number} key 
 */
box2d.Testbed.Web.prototype.Keyboard = function (key)
{
	switch (key)
	{
	case goog.events.KeyCodes.B:
		for (var i = 0; i < 4; ++i)
		{
			if (this.m_bodies[i])
			{
				this.m_world.DestroyBody(this.m_bodies[i]);
				this.m_bodies[i] = null;
				break;
			}
		}
		break;

	case goog.events.KeyCodes.J:
		for (var i = 0; i < 8; ++i)
		{
			if (this.m_joints[i])
			{
				this.m_world.DestroyJoint(this.m_joints[i]);
				this.m_joints[i] = null;
				break;
			}
		}
		break;
	}
}

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Web.prototype.Step = function (settings)
{
	box2d.Testbed.Test.prototype.Step.call(this, settings);
	this.m_debugDraw.DrawString(5, this.m_textLine, "This demonstrates a soft distance joint.");
	this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
	this.m_debugDraw.DrawString(5, this.m_textLine, "Press: (b) to delete a body, (j) to delete a joint");
	this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
}

/** 
 * @export 
 * @return {void} 
 * @param {box2d.b2Joint} joint 
 */
box2d.Testbed.Web.prototype.JointDestroyed = function (joint)
{
	for (var i = 0; i < 8; ++i)
	{
		if (this.m_joints[i] === joint)
		{
			this.m_joints[i] = null;
			break;
		}
	}
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Web.Create = function (canvas, settings)
{
	return new box2d.Testbed.Web(canvas, settings);
}

