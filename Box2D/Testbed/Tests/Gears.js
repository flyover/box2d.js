/*
 * Copyright (c) 2007-2009 Erin Catto http://www.box2d.org
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

goog.provide('box2d.Testbed.Gears');

goog.require('box2d.Testbed.Test');

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Gears = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  var ground = null; {
    var bd = new box2d.b2BodyDef();
    ground = this.m_world.CreateBody(bd);

    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-50.0, 0.0), new box2d.b2Vec2(50.0, 0.0));
    ground.CreateFixture(shape, 0.0);
  }

  {
    var circle1 = new box2d.b2CircleShape();
    circle1.m_radius = 1.0;

    var box = new box2d.b2PolygonShape();
    box.SetAsBox(0.5, 5.0);

    var circle2 = new box2d.b2CircleShape();
    circle2.m_radius = 2.0;

    var bd1 = new box2d.b2BodyDef();
    bd1.type = box2d.b2BodyType.b2_staticBody;
    bd1.position.Set(10.0, 9.0);
    var body1 = this.m_world.CreateBody(bd1);
    body1.CreateFixture(circle1, 5.0);

    var bd2 = new box2d.b2BodyDef();
    bd2.type = box2d.b2BodyType.b2_dynamicBody;
    bd2.position.Set(10.0, 8.0);
    var body2 = this.m_world.CreateBody(bd2);
    body2.CreateFixture(box, 5.0);

    var bd3 = new box2d.b2BodyDef();
    bd3.type = box2d.b2BodyType.b2_dynamicBody;
    bd3.position.Set(10.0, 6.0);
    var body3 = this.m_world.CreateBody(bd3);
    body3.CreateFixture(circle2, 5.0);

    var jd1 = new box2d.b2RevoluteJointDef();
    jd1.Initialize(body2, body1, bd1.position);
    var joint1 = this.m_world.CreateJoint(jd1);

    var jd2 = new box2d.b2RevoluteJointDef();
    jd2.Initialize(body2, body3, bd3.position);
    var joint2 = this.m_world.CreateJoint(jd2);

    var jd4 = new box2d.b2GearJointDef();
    jd4.bodyA = body1;
    jd4.bodyB = body3;
    jd4.joint1 = joint1;
    jd4.joint2 = joint2;
    jd4.ratio = circle2.m_radius / circle1.m_radius;
    this.m_world.CreateJoint(jd4);
  }

  {
    var circle1 = new box2d.b2CircleShape();
    circle1.m_radius = 1.0;

    var circle2 = new box2d.b2CircleShape();
    circle2.m_radius = 2.0;

    var box = new box2d.b2PolygonShape();
    box.SetAsBox(0.5, 5.0);

    var bd1 = new box2d.b2BodyDef();
    bd1.type = box2d.b2BodyType.b2_dynamicBody;
    bd1.position.Set(-3.0, 12.0);
    var body1 = this.m_world.CreateBody(bd1);
    body1.CreateFixture(circle1, 5.0);

    var jd1 = new box2d.b2RevoluteJointDef();
    jd1.bodyA = ground;
    jd1.bodyB = body1;
    ground.GetLocalPoint(bd1.position, jd1.localAnchorA);
    body1.GetLocalPoint(bd1.position, jd1.localAnchorB);
    jd1.referenceAngle = body1.GetAngle() - ground.GetAngle();
    this.m_joint1 = /** @type {box2d.b2RevoluteJoint} */ (this.m_world.CreateJoint(jd1));

    var bd2 = new box2d.b2BodyDef();
    bd2.type = box2d.b2BodyType.b2_dynamicBody;
    bd2.position.Set(0.0, 12.0);
    var body2 = this.m_world.CreateBody(bd2);
    body2.CreateFixture(circle2, 5.0);

    var jd2 = new box2d.b2RevoluteJointDef();
    jd2.Initialize(ground, body2, bd2.position);
    this.m_joint2 = /** @type {box2d.b2RevoluteJoint} */ (this.m_world.CreateJoint(jd2));

    var bd3 = new box2d.b2BodyDef();
    bd3.type = box2d.b2BodyType.b2_dynamicBody;
    bd3.position.Set(2.5, 12.0);
    var body3 = this.m_world.CreateBody(bd3);
    body3.CreateFixture(box, 5.0);

    var jd3 = new box2d.b2PrismaticJointDef();
    jd3.Initialize(ground, body3, bd3.position, new box2d.b2Vec2(0.0, 1.0));
    jd3.lowerTranslation = -5.0;
    jd3.upperTranslation = 5.0;
    jd3.enableLimit = true;

    this.m_joint3 = /** @type {box2d.b2PrismaticJoint} */ (this.m_world.CreateJoint(jd3));

    var jd4 = new box2d.b2GearJointDef();
    jd4.bodyA = body1;
    jd4.bodyB = body2;
    jd4.joint1 = this.m_joint1;
    jd4.joint2 = this.m_joint2;
    jd4.ratio = circle2.m_radius / circle1.m_radius;
    this.m_joint4 = /** @type {box2d.b2GearJoint} */ (this.m_world.CreateJoint(jd4));

    var jd5 = new box2d.b2GearJointDef();
    jd5.bodyA = body2;
    jd5.bodyB = body3;
    jd5.joint1 = this.m_joint2;
    jd5.joint2 = this.m_joint3;
    jd5.ratio = -1.0 / circle2.m_radius;
    this.m_joint5 = /** @type {box2d.b2GearJoint} */ (this.m_world.CreateJoint(jd5));
  }
}

goog.inherits(box2d.Testbed.Gears, box2d.Testbed.Test);

/**
 * @export
 * @type {box2d.b2RevoluteJoint}
 */
box2d.Testbed.Gears.prototype.m_joint1 = null;
/**
 * @export
 * @type {box2d.b2RevoluteJoint}
 */
box2d.Testbed.Gears.prototype.m_joint2 = null;
/**
 * @export
 * @type {box2d.b2PrismaticJoint}
 */
box2d.Testbed.Gears.prototype.m_joint3 = null;
/**
 * @export
 * @type {box2d.b2GearJoint}
 */
box2d.Testbed.Gears.prototype.m_joint4 = null;
/**
 * @export
 * @type {box2d.b2GearJoint}
 */
box2d.Testbed.Gears.prototype.m_joint5 = null;

/**
 * @export
 * @return {void}
 * @param {number} key
 */
box2d.Testbed.Gears.prototype.Keyboard = function(key) {
  switch (key) {
    case 0:
      break;
  }
}

/**
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Gears.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);

  var ratio, value;

  ratio = this.m_joint4.GetRatio();
  value = this.m_joint1.GetJointAngle() + ratio * this.m_joint2.GetJointAngle();
  this.m_debugDraw.DrawString(5, this.m_textLine, "theta1 + %4.2f * theta2 = %4.2f", ratio, value);
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;

  ratio = this.m_joint5.GetRatio();
  value = this.m_joint2.GetJointAngle() + ratio * this.m_joint3.GetJointTranslation();
  this.m_debugDraw.DrawString(5, this.m_textLine, "theta2 + %4.2f * delta = %4.2f", ratio, value);
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Gears.Create = function(canvas, settings) {
  return new box2d.Testbed.Gears(canvas, settings);
}
