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

goog.provide('box2d.Testbed.Prismatic');

goog.require('box2d.Testbed.Test');

// The motor in this test gets smoother with higher velocity iterations.
/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Prismatic = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  var ground = null; {
    var bd = new box2d.b2BodyDef();
    ground = this.m_world.CreateBody(bd);

    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
    ground.CreateFixture(shape, 0.0);
  }

  {
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(2.0, 0.5);

    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(-10.0, 10.0);
    bd.angle = 0.5 * box2d.b2_pi;
    bd.allowSleep = false;
    var body = this.m_world.CreateBody(bd);
    body.CreateFixture(shape, 5.0);

    var pjd = new box2d.b2PrismaticJointDef();

    // Bouncy limit
    var axis = new box2d.b2Vec2(2.0, 1.0);
    axis.Normalize();
    pjd.Initialize(ground, body, new box2d.b2Vec2(0.0, 0.0), axis);

    // Non-bouncy limit
    //pjd.Initialize(ground, body, new box2d.b2Vec2(-10.0, 10.0), new box2d.b2Vec2(1.0, 0.0));

    pjd.motorSpeed = 10.0;
    pjd.maxMotorForce = 10000.0;
    pjd.enableMotor = true;
    pjd.lowerTranslation = 0.0;
    pjd.upperTranslation = 20.0;
    pjd.enableLimit = true;

    this.m_joint = /** @type {box2d.b2PrismaticJoint} */ (this.m_world.CreateJoint(pjd));
  }
}

goog.inherits(box2d.Testbed.Prismatic, box2d.Testbed.Test);

/**
 * @export 
 * @type {box2d.b2PrismaticJoint} 
 */
box2d.Testbed.Prismatic.prototype.m_joint = null;

/**
 * @export 
 * @return {void} 
 * @param {number} key 
 */
box2d.Testbed.Prismatic.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.L:
      this.m_joint.EnableLimit(!this.m_joint.IsLimitEnabled());
      break;

    case goog.events.KeyCodes.M:
      this.m_joint.EnableMotor(!this.m_joint.IsMotorEnabled());
      break;

    case goog.events.KeyCodes.S:
      this.m_joint.SetMotorSpeed(-this.m_joint.GetMotorSpeed());
      break;
  }
}

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Prismatic.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);
  this.m_debugDraw.DrawString(5, this.m_textLine, "Keys: (l) limits, (m) motors, (s) speed");
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
  var force = this.m_joint.GetMotorForce(settings.hz);
  this.m_debugDraw.DrawString(5, this.m_textLine, "Motor Force = %4.0f", force);
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Prismatic.Create = function(canvas, settings) {
  return new box2d.Testbed.Prismatic(canvas, settings);
}
