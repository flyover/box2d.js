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

goog.provide('box2d.Testbed.Tumbler');

goog.require('box2d.Testbed.Test');

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Tumbler = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  /*b2Body*/
  var ground = null; {
    /*b2BodyDef*/
    var bd = new box2d.b2BodyDef();
    ground = this.m_world.CreateBody(bd);
  }

  {
    /*b2BodyDef*/
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.allowSleep = false;
    bd.position.Set(0.0, 10.0);
    /*b2Body*/
    var body = this.m_world.CreateBody(bd);

    /*b2PolygonShape*/
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.5, 10.0, new box2d.b2Vec2(10.0, 0.0), 0.0);
    body.CreateFixture(shape, 5.0);
    shape.SetAsBox(0.5, 10.0, new box2d.b2Vec2(-10.0, 0.0), 0.0);
    body.CreateFixture(shape, 5.0);
    shape.SetAsBox(10.0, 0.5, new box2d.b2Vec2(0.0, 10.0), 0.0);
    body.CreateFixture(shape, 5.0);
    shape.SetAsBox(10.0, 0.5, new box2d.b2Vec2(0.0, -10.0), 0.0);
    body.CreateFixture(shape, 5.0);

    /*b2RevoluteJointDef*/
    var jd = new box2d.b2RevoluteJointDef();
    jd.bodyA = ground;
    jd.bodyB = body;
    jd.localAnchorA.Set(0.0, 10.0);
    jd.localAnchorB.Set(0.0, 0.0);
    jd.referenceAngle = 0.0;
    jd.motorSpeed = 0.05 * box2d.b2_pi;
    jd.maxMotorTorque = 1e8;
    jd.enableMotor = true;
    this.m_joint = /** @type {box2d.b2RevoluteJoint} */ (this.m_world.CreateJoint(jd));
  }

  this.m_count = 0;
}

goog.inherits(box2d.Testbed.Tumbler, box2d.Testbed.Test);

/**
 * @export
 * @const
 * @type {number}
 */
box2d.Testbed.Tumbler.e_count = 800;

/**
 * @export
 * @type {box2d.b2RevoluteJoint}
 */
box2d.Testbed.Tumbler.prototype.m_joint = null;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.Tumbler.prototype.m_count = 0;

/**
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Tumbler.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);

  if (this.m_count < box2d.Testbed.Tumbler.e_count) {
    /*b2BodyDef*/
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(0.0, 10.0);
    /*b2Body*/
    var body = this.m_world.CreateBody(bd);

    /*b2PolygonShape*/
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.125, 0.125);
    body.CreateFixture(shape, 1.0);

    ++this.m_count;
  }
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Tumbler.Create = function(canvas, settings) {
  return new box2d.Testbed.Tumbler(canvas, settings);
}
