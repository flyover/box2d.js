/*
* Copyright (c) 2006-2012 Erin Catto http://www.box2d.org
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

goog.provide('box2d.Testbed.MotorJoint');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.MotorJoint = function (canvas, settings)
{
	box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

	/*b2Body*/ var ground = null;
	{
		var bd = new box2d.b2BodyDef();
		ground = this.m_world.CreateBody(bd);

		var shape = new box2d.b2EdgeShape();
		shape.SetAsEdge(new box2d.b2Vec2(-20.0, 0.0), new box2d.b2Vec2(20.0, 0.0));

		var fd = new box2d.b2FixtureDef();
		fd.shape = shape;

		ground.CreateFixture(fd);
	}

	// Define motorized body
	{
		var bd = new box2d.b2BodyDef();
		bd.type = box2d.b2BodyType.b2_dynamicBody;
		bd.position.Set(0.0, 8.0);
		/*b2Body*/ var body = this.m_world.CreateBody(bd);

		var shape = new box2d.b2PolygonShape();
		shape.SetAsBox(2.0, 0.5);

		var fd = new box2d.b2FixtureDef();
		fd.shape = shape;
		fd.friction = 0.6;
		fd.density = 2.0;
		body.CreateFixture(fd);

		var mjd = new box2d.b2MotorJointDef();
		mjd.Initialize(ground, body);
		mjd.maxForce = 1000.0;
		mjd.maxTorque = 1000.0;
		this.m_joint = /** @type {box2d.b2MotorJoint} */ (this.m_world.CreateJoint(mjd));
	}

	this.m_go = false;
	this.m_time = 0.0;
}

goog.inherits(box2d.Testbed.MotorJoint, box2d.Testbed.Test);

/**
 * @export 
 * @type {box2d.b2MotorJoint} 
 */
box2d.Testbed.MotorJoint.prototype.m_joint = null;
/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.MotorJoint.prototype.m_time = 0.0;
/**
 * @export 
 * @type {boolean} 
 */
box2d.Testbed.MotorJoint.prototype.m_go = false;

/**
 * @export 
 * @return {void} 
 * @param {number} key 
 */
box2d.Testbed.MotorJoint.prototype.Keyboard = function (key)
{
	switch (key)
	{
	case goog.events.KeyCodes.S:
		this.m_go = !this.m_go;
		break;
	}
}

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.MotorJoint.prototype.Step = function (settings)
{
	if (this.m_go && settings.hz > 0.0)
	{
		this.m_time += 1.0 / settings.hz;
	}

	/*b2Vec2*/ var linearOffset = new box2d.b2Vec2();
	linearOffset.x = 6.0 * box2d.b2Sin(2.0 * this.m_time);
	linearOffset.y = 8.0 + 4.0 * box2d.b2Sin(1.0 * this.m_time);

	/*float32*/ var angularOffset = 4.0 * this.m_time;

	this.m_joint.SetLinearOffset(linearOffset);
	this.m_joint.SetAngularOffset(angularOffset);

	this.m_debugDraw.DrawPoint(linearOffset, 4.0, new box2d.b2Color(0.9, 0.9, 0.9));

	box2d.Testbed.Test.prototype.Step.call(this, settings);
	this.m_debugDraw.DrawString(5, this.m_textLine, "Keys: (s) pause");
	this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.MotorJoint.Create = function (canvas, settings)
{
	return new box2d.Testbed.MotorJoint(canvas, settings);
}

