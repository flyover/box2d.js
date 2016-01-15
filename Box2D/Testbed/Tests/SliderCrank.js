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

goog.provide('box2d.Testbed.SliderCrank');

goog.require('box2d.Testbed.Test');

// A motor driven slider crank with joint friction.

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.SliderCrank = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  var ground = null; {
    var bd = new box2d.b2BodyDef();
    ground = this.m_world.CreateBody(bd);

    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
    ground.CreateFixture(shape, 0.0);
  }

  {
    var prevBody = ground;

    // Define crank.
    {
      var shape = new box2d.b2PolygonShape();
      shape.SetAsBox(0.5, 2.0);

      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(0.0, 7.0);
      var body = this.m_world.CreateBody(bd);
      body.CreateFixture(shape, 2.0);

      var rjd = new box2d.b2RevoluteJointDef();
      rjd.Initialize(prevBody, body, new box2d.b2Vec2(0.0, 5.0));
      rjd.motorSpeed = 1.0 * box2d.b2_pi;
      rjd.maxMotorTorque = 10000.0;
      rjd.enableMotor = true;
      this.m_joint1 = /** @type {box2d.b2RevoluteJoint} */ (this.m_world.CreateJoint(rjd));

      prevBody = body;
    }

    // Define follower.
    {
      var shape = new box2d.b2PolygonShape();
      shape.SetAsBox(0.5, 4.0);

      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(0.0, 13.0);
      var body = this.m_world.CreateBody(bd);
      body.CreateFixture(shape, 2.0);

      var rjd = new box2d.b2RevoluteJointDef();
      rjd.Initialize(prevBody, body, new box2d.b2Vec2(0.0, 9.0));
      rjd.enableMotor = false;
      this.m_world.CreateJoint(rjd);

      prevBody = body;
    }

    // Define piston
    {
      var shape = new box2d.b2PolygonShape();
      shape.SetAsBox(1.5, 1.5);

      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.fixedRotation = true;
      bd.position.Set(0.0, 17.0);
      var body = this.m_world.CreateBody(bd);
      body.CreateFixture(shape, 2.0);

      var rjd = new box2d.b2RevoluteJointDef();
      rjd.Initialize(prevBody, body, new box2d.b2Vec2(0.0, 17.0));
      this.m_world.CreateJoint(rjd);

      var pjd = new box2d.b2PrismaticJointDef();
      pjd.Initialize(ground, body, new box2d.b2Vec2(0.0, 17.0), new box2d.b2Vec2(0.0, 1.0));

      pjd.maxMotorForce = 1000.0;
      pjd.enableMotor = true;

      this.m_joint2 = /** @type {box2d.b2PrismaticJoint} */ (this.m_world.CreateJoint(pjd));
    }

    // Create a payload
    {
      var shape = new box2d.b2PolygonShape();
      shape.SetAsBox(1.5, 1.5);

      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(0.0, 23.0);
      var body = this.m_world.CreateBody(bd);
      body.CreateFixture(shape, 2.0);
    }
  }
}

goog.inherits(box2d.Testbed.SliderCrank, box2d.Testbed.Test);

/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.SliderCrank.e_count = 30;

/**
 * @export
 * @type {box2d.b2RevoluteJoint}
 */
box2d.Testbed.SliderCrank.prototype.m_joint1 = null;

/**
 * @export
 * @type {box2d.b2PrismaticJoint}
 */
box2d.Testbed.SliderCrank.prototype.m_joint2 = null;

/**
 * @export
 * @return {void}
 * @param {number} key
 */
box2d.Testbed.SliderCrank.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.F:
      this.m_joint2.EnableMotor(!this.m_joint2.IsMotorEnabled());
      this.m_joint2.GetBodyB().SetAwake(true);
      break;

    case goog.events.KeyCodes.M:
      this.m_joint1.EnableMotor(!this.m_joint1.IsMotorEnabled());
      this.m_joint1.GetBodyB().SetAwake(true);
      break;
  }
}

/**
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.SliderCrank.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);
  this.m_debugDraw.DrawString(5, this.m_textLine, "Keys: (f) toggle friction, (m) toggle motor");
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
  var torque = this.m_joint1.GetMotorTorque(settings.hz);
  this.m_debugDraw.DrawString(5, this.m_textLine, "Motor Torque = %5.0f", torque);
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.SliderCrank.Create = function(canvas, settings) {
  return new box2d.Testbed.SliderCrank(canvas, settings);
}
