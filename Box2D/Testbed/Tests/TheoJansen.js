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

// Inspired by a contribution by roman_m
// Dimensions scooped from APE (http://www.cove.org/ape/index.htm)

goog.provide('box2d.Testbed.TheoJansen');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.TheoJansen = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  this.m_offset = new box2d.b2Vec2();

  this.Construct();
}

goog.inherits(box2d.Testbed.TheoJansen, box2d.Testbed.Test);

/**
 * @export 
 * @type {box2d.b2Vec2} 
 */
box2d.Testbed.TheoJansen.prototype.m_offset = null;
/**
 * @export 
 * @type {box2d.b2Body} 
 */
box2d.Testbed.TheoJansen.prototype.m_chassis = null;
/**
 * @export 
 * @type {box2d.b2Body} 
 */
box2d.Testbed.TheoJansen.prototype.m_wheel = null;
/**
 * @export 
 * @type {box2d.b2Joint} 
 */
box2d.Testbed.TheoJansen.prototype.m_motorJoint = null;
/**
 * @export 
 * @type {boolean} 
 */
box2d.Testbed.TheoJansen.prototype.m_motorOn = false;
/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.TheoJansen.prototype.m_motorSpeed = 0;

/** 
 * @export 
 * @return {void} 
 * @param {number} s 
 * @param {box2d.b2Vec2} wheelAnchor 
 */
box2d.Testbed.TheoJansen.prototype.CreateLeg = function(s, wheelAnchor) {
  var p1 = new box2d.b2Vec2(5.4 * s, -6.1);
  var p2 = new box2d.b2Vec2(7.2 * s, -1.2);
  var p3 = new box2d.b2Vec2(4.3 * s, -1.9);
  var p4 = new box2d.b2Vec2(3.1 * s, 0.8);
  var p5 = new box2d.b2Vec2(6.0 * s, 1.5);
  var p6 = new box2d.b2Vec2(2.5 * s, 3.7);

  var fd1 = new box2d.b2FixtureDef();
  var fd2 = new box2d.b2FixtureDef();
  fd1.filter.groupIndex = -1;
  fd2.filter.groupIndex = -1;
  fd1.density = 1.0;
  fd2.density = 1.0;

  var poly1 = new box2d.b2PolygonShape();
  var poly2 = new box2d.b2PolygonShape();

  if (s > 0.0) {
    var vertices = new Array();

    vertices[0] = p1;
    vertices[1] = p2;
    vertices[2] = p3;
    poly1.Set(vertices);

    vertices[0] = box2d.b2Vec2_zero;
    vertices[1] = box2d.b2Sub_V2_V2(p5, p4, new box2d.b2Vec2());
    vertices[2] = box2d.b2Sub_V2_V2(p6, p4, new box2d.b2Vec2());
    poly2.Set(vertices);
  } else {
    var vertices = new Array();

    vertices[0] = p1;
    vertices[1] = p3;
    vertices[2] = p2;
    poly1.Set(vertices);

    vertices[0] = box2d.b2Vec2_zero;
    vertices[1] = box2d.b2Sub_V2_V2(p6, p4, new box2d.b2Vec2());
    vertices[2] = box2d.b2Sub_V2_V2(p5, p4, new box2d.b2Vec2());
    poly2.Set(vertices);
  }

  fd1.shape = poly1;
  fd2.shape = poly2;

  var bd1 = new box2d.b2BodyDef();
  var bd2 = new box2d.b2BodyDef();
  bd1.type = box2d.b2BodyType.b2_dynamicBody;
  bd2.type = box2d.b2BodyType.b2_dynamicBody;
  bd1.position.Copy(this.m_offset);
  bd2.position.Copy(box2d.b2Add_V2_V2(p4, this.m_offset, new box2d.b2Vec2()));

  bd1.angularDamping = 10.0;
  bd2.angularDamping = 10.0;

  var body1 = this.m_world.CreateBody(bd1);
  var body2 = this.m_world.CreateBody(bd2);

  body1.CreateFixture(fd1);
  body2.CreateFixture(fd2);

  var djd = new box2d.b2DistanceJointDef();

  // Using a soft distance constraint can reduce some jitter.
  // It also makes the structure seem a bit more fluid by
  // acting like a suspension system.
  djd.dampingRatio = 0.5;
  djd.frequencyHz = 10.0;

  djd.Initialize(body1, body2, box2d.b2Add_V2_V2(p2, this.m_offset, new box2d.b2Vec2()), box2d.b2Add_V2_V2(p5, this.m_offset, new box2d.b2Vec2()));
  this.m_world.CreateJoint(djd);

  djd.Initialize(body1, body2, box2d.b2Add_V2_V2(p3, this.m_offset, new box2d.b2Vec2()), box2d.b2Add_V2_V2(p4, this.m_offset, new box2d.b2Vec2()));
  this.m_world.CreateJoint(djd);

  djd.Initialize(body1, this.m_wheel, box2d.b2Add_V2_V2(p3, this.m_offset, new box2d.b2Vec2()), box2d.b2Add_V2_V2(wheelAnchor, this.m_offset, new box2d.b2Vec2()));
  this.m_world.CreateJoint(djd);

  djd.Initialize(body2, this.m_wheel, box2d.b2Add_V2_V2(p6, this.m_offset, new box2d.b2Vec2()), box2d.b2Add_V2_V2(wheelAnchor, this.m_offset, new box2d.b2Vec2()));
  this.m_world.CreateJoint(djd);

  var rjd = new box2d.b2RevoluteJointDef();

  rjd.Initialize(body2, this.m_chassis, box2d.b2Add_V2_V2(p4, this.m_offset, new box2d.b2Vec2()));
  this.m_world.CreateJoint(rjd);
}

/**
 * @export 
 * @return {void} 
 */
box2d.Testbed.TheoJansen.prototype.Construct = function() {
  this.m_offset.Set(0.0, 8.0);
  this.m_motorSpeed = 2.0;
  this.m_motorOn = true;
  var pivot = new box2d.b2Vec2(0.0, 0.8);

  // Ground
  {
    var bd = new box2d.b2BodyDef();
    var ground = this.m_world.CreateBody(bd);

    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-50.0, 0.0), new box2d.b2Vec2(50.0, 0.0));
    ground.CreateFixture(shape, 0.0);

    shape.SetAsEdge(new box2d.b2Vec2(-50.0, 0.0), new box2d.b2Vec2(-50.0, 10.0));
    ground.CreateFixture(shape, 0.0);

    shape.SetAsEdge(new box2d.b2Vec2(50.0, 0.0), new box2d.b2Vec2(50.0, 10.0));
    ground.CreateFixture(shape, 0.0);
  }

  // Balls
  for (var i = 0; i < 40; ++i) {
    var shape = new box2d.b2CircleShape();
    shape.m_radius = 0.25;

    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(-40.0 + 2.0 * i, 0.5);

    var body = this.m_world.CreateBody(bd);
    body.CreateFixture(shape, 1.0);
  }

  // Chassis
  {
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(2.5, 1.0);

    var sd = new box2d.b2FixtureDef();
    sd.density = 1.0;
    sd.shape = shape;
    sd.filter.groupIndex = -1;
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position = box2d.b2Add_V2_V2(pivot, this.m_offset, new box2d.b2Vec2());
    this.m_chassis = this.m_world.CreateBody(bd);
    this.m_chassis.CreateFixture(sd);
  }

  {
    var shape = new box2d.b2CircleShape();
    shape.m_radius = 1.6;

    var sd = new box2d.b2FixtureDef();
    sd.density = 1.0;
    sd.shape = shape;
    sd.filter.groupIndex = -1;
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position = box2d.b2Add_V2_V2(pivot, this.m_offset, new box2d.b2Vec2());
    this.m_wheel = this.m_world.CreateBody(bd);
    this.m_wheel.CreateFixture(sd);
  }

  {
    var jd = new box2d.b2RevoluteJointDef();
    jd.Initialize(this.m_wheel, this.m_chassis, box2d.b2Add_V2_V2(pivot, this.m_offset, new box2d.b2Vec2()));
    jd.collideConnected = false;
    jd.motorSpeed = this.m_motorSpeed;
    jd.maxMotorTorque = 400.0;
    jd.enableMotor = this.m_motorOn;
    this.m_motorJoint = this.m_world.CreateJoint(jd);
  }

  var wheelAnchor = box2d.b2Add_V2_V2(pivot, new box2d.b2Vec2(0.0, -0.8), new box2d.b2Vec2());

  this.CreateLeg(-1.0, wheelAnchor);
  this.CreateLeg(1.0, wheelAnchor);

  this.m_wheel.SetTransform_V2_A(this.m_wheel.GetPosition(), 120.0 * box2d.b2_pi / 180.0);
  this.CreateLeg(-1.0, wheelAnchor);
  this.CreateLeg(1.0, wheelAnchor);

  this.m_wheel.SetTransform_V2_A(this.m_wheel.GetPosition(), -120.0 * box2d.b2_pi / 180.0);
  this.CreateLeg(-1.0, wheelAnchor);
  this.CreateLeg(1.0, wheelAnchor);
}

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.TheoJansen.prototype.Step = function(settings) {
  this.m_debugDraw.DrawString(5, this.m_textLine, "Keys: left = a, brake = s, right = d, toggle motor = m");
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;

  box2d.Testbed.Test.prototype.Step.call(this, settings);
}

/**
 * @export 
 * @return {void} 
 * @param {number} key 
 */
box2d.Testbed.TheoJansen.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.A:
      this.m_motorJoint.SetMotorSpeed(-this.m_motorSpeed);
      break;

    case goog.events.KeyCodes.S:
      this.m_motorJoint.SetMotorSpeed(0.0);
      break;

    case goog.events.KeyCodes.D:
      this.m_motorJoint.SetMotorSpeed(this.m_motorSpeed);
      break;

    case goog.events.KeyCodes.M:
      this.m_motorJoint.EnableMotor(!this.m_motorJoint.IsMotorEnabled());
      break;
  }
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.TheoJansen.Create = function(canvas, settings) {
  return new box2d.Testbed.TheoJansen(canvas, settings);
}
