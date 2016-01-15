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

goog.provide('box2d.Testbed.BodyTypes');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.BodyTypes = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  /*box2d.b2Body*/
  var ground = null; {
    /*box2d.b2BodyDef*/
    var bd = new box2d.b2BodyDef();
    ground = this.m_world.CreateBody(bd);

    /*box2d.b2EdgeShape*/
    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-20.0, 0.0), new box2d.b2Vec2(20.0, 0.0));

    /*box2d.b2FixtureDef*/
    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;

    ground.CreateFixture(fd);
  }

  // Define attachment
  {
    /*box2d.b2BodyDef*/
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(0.0, 3.0);
    this.m_attachment = this.m_world.CreateBody(bd);

    /*box2d.b2PolygonShape*/
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.5, 2.0);
    this.m_attachment.CreateFixture(shape, 2.0);
  }

  // Define platform
  {
    /*box2d.b2BodyDef*/
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(-4.0, 5.0);
    this.m_platform = this.m_world.CreateBody(bd);

    /*box2d.b2PolygonShape*/
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.5, 4.0, new box2d.b2Vec2(4.0, 0.0), 0.5 * box2d.b2_pi);

    /*box2d.b2FixtureDef*/
    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.friction = 0.6;
    fd.density = 2.0;
    this.m_platform.CreateFixture(fd);

    /*box2d.b2RevoluteJointDef*/
    var rjd = new box2d.b2RevoluteJointDef();
    rjd.Initialize(this.m_attachment, this.m_platform, new box2d.b2Vec2(0.0, 5.0));
    rjd.maxMotorTorque = 50.0;
    rjd.enableMotor = true;
    this.m_world.CreateJoint(rjd);

    /*box2d.b2PrismaticJointDef*/
    var pjd = new box2d.b2PrismaticJointDef();
    pjd.Initialize(ground, this.m_platform, new box2d.b2Vec2(0.0, 5.0), new box2d.b2Vec2(1.0, 0.0));

    pjd.maxMotorForce = 1000.0;
    pjd.enableMotor = true;
    pjd.lowerTranslation = -10.0;
    pjd.upperTranslation = 10.0;
    pjd.enableLimit = true;

    this.m_world.CreateJoint(pjd);

    this.m_speed = 3.0;
  }

  // Create a payload
  {
    /*box2d.b2BodyDef*/
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(0.0, 8.0);
    /*box2d.b2Body*/
    var body = this.m_world.CreateBody(bd);

    /*box2d.b2PolygonShape*/
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.75, 0.75);

    /*box2d.b2FixtureDef*/
    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.friction = 0.6;
    fd.density = 2.0;

    body.CreateFixture(fd);
  }
}

goog.inherits(box2d.Testbed.BodyTypes, box2d.Testbed.Test);

/**
 * @export 
 * @type {box2d.b2Body} 
 */
box2d.Testbed.BodyTypes.prototype.m_attachment = null;
/**
 * @export 
 * @type {box2d.b2Body} 
 */
box2d.Testbed.BodyTypes.prototype.m_platform = null;
/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.BodyTypes.prototype.m_speed = 0;

/**
 * @export 
 * @return {void} 
 * @param {number} key 
 */
box2d.Testbed.BodyTypes.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.D:
      this.m_platform.SetType(box2d.b2BodyType.b2_dynamicBody);
      break;

    case goog.events.KeyCodes.S:
      this.m_platform.SetType(box2d.b2BodyType.b2_staticBody);
      break;

    case goog.events.KeyCodes.K:
      this.m_platform.SetType(box2d.b2BodyType.b2_kinematicBody);
      this.m_platform.SetLinearVelocity(new box2d.b2Vec2(-this.m_speed, 0.0));
      this.m_platform.SetAngularVelocity(0.0);
      break;
  }
}

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.BodyTypes.prototype.Step = function(settings) {
  // Drive the kinematic body.
  if (this.m_platform.GetType() === box2d.b2BodyType.b2_kinematicBody) {
    /*box2d.b2Vec2*/
    var p = this.m_platform.GetTransform().p;
    /*box2d.b2Vec2*/
    var v = this.m_platform.GetLinearVelocity();

    if ((p.x < -10.0 && v.x < 0.0) ||
      (p.x > 10.0 && v.x > 0.0)) {
      v.x = -v.x;
      this.m_platform.SetLinearVelocity(v);
    }
  }

  box2d.Testbed.Test.prototype.Step.call(this, settings);
  this.m_debugDraw.DrawString(5, this.m_textLine, "Keys: (d) dynamic, (s) static, (k) kinematic");
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.BodyTypes.Create = function(canvas, settings) {
  return new box2d.Testbed.BodyTypes(canvas, settings);
}
