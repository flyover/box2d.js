/*
 * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
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

goog.provide('box2d.Testbed.Car');

goog.require('box2d.Testbed.Test');

// This is a fun demo that shows off the wheel joint
/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Car = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  this.m_hz = 4.0;
  this.m_zeta = 0.7;
  this.m_speed = 50.0;

  /*box2d.b2Body*/
  var ground = null; {
    /*box2d.b2BodyDef*/
    var bd = new box2d.b2BodyDef();
    ground = this.m_world.CreateBody(bd);

    /*box2d.b2EdgeShape*/
    var shape = new box2d.b2EdgeShape();

    /*box2d.b2FixtureDef*/
    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 0.0;
    fd.friction = 0.6;

    shape.SetAsEdge(new box2d.b2Vec2(-20.0, 0.0), new box2d.b2Vec2(20.0, 0.0));
    ground.CreateFixture(fd);

    /*float32[]*/
    var hs = [0.25, 1.0, 4.0, 0.0, 0.0, -1.0, -2.0, -2.0, -1.25, 0.0];

    /*float32*/
    var x = 20.0,
      y1 = 0.0,
      dx = 5.0;

    for ( /*int32*/ var i = 0; i < 10; ++i) {
      /*float32*/
      var y2 = hs[i];
      shape.SetAsEdge(new box2d.b2Vec2(x, y1), new box2d.b2Vec2(x + dx, y2));
      ground.CreateFixture(fd);
      y1 = y2;
      x += dx;
    }

    for ( /*int32*/ var i = 0; i < 10; ++i) {
      /*float32*/
      var y2 = hs[i];
      shape.SetAsEdge(new box2d.b2Vec2(x, y1), new box2d.b2Vec2(x + dx, y2));
      ground.CreateFixture(fd);
      y1 = y2;
      x += dx;
    }

    shape.SetAsEdge(new box2d.b2Vec2(x, 0.0), new box2d.b2Vec2(x + 40.0, 0.0));
    ground.CreateFixture(fd);

    x += 80.0;
    shape.SetAsEdge(new box2d.b2Vec2(x, 0.0), new box2d.b2Vec2(x + 40.0, 0.0));
    ground.CreateFixture(fd);

    x += 40.0;
    shape.SetAsEdge(new box2d.b2Vec2(x, 0.0), new box2d.b2Vec2(x + 10.0, 5.0));
    ground.CreateFixture(fd);

    x += 20.0;
    shape.SetAsEdge(new box2d.b2Vec2(x, 0.0), new box2d.b2Vec2(x + 40.0, 0.0));
    ground.CreateFixture(fd);

    x += 40.0;
    shape.SetAsEdge(new box2d.b2Vec2(x, 0.0), new box2d.b2Vec2(x, 20.0));
    ground.CreateFixture(fd);
  }

  // Teeter
  {
    /*box2d.b2BodyDef*/
    var bd = new box2d.b2BodyDef();
    bd.position.Set(140.0, 1.0);
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    /*box2d.b2Body*/
    var body = this.m_world.CreateBody(bd);

    /*box2d.b2PolygonShape*/
    var box = new box2d.b2PolygonShape();
    box.SetAsBox(10.0, 0.25);
    body.CreateFixture(box, 1.0);

    /*box2d.b2RevoluteJointDef*/
    var jd = new box2d.b2RevoluteJointDef();
    jd.Initialize(ground, body, body.GetPosition());
    jd.lowerAngle = -8.0 * box2d.b2_pi / 180.0;
    jd.upperAngle = 8.0 * box2d.b2_pi / 180.0;
    jd.enableLimit = true;
    this.m_world.CreateJoint(jd);

    body.ApplyAngularImpulse(100.0);
  }

  // Bridge
  {
    /*int32*/
    var N = 20;
    /*box2d.b2PolygonShape*/
    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(1.0, 0.125);

    /*box2d.b2FixtureDef*/
    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    fd.density = 1.0;
    fd.friction = 0.6;

    /*box2d.b2RevoluteJointDef*/
    var jd = new box2d.b2RevoluteJointDef();

    /*box2d.b2Body*/
    var prevBody = ground;
    for ( /*int32*/ var i = 0; i < N; ++i) {
      /*box2d.b2BodyDef*/
      var bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      bd.position.Set(161.0 + 2.0 * i, -0.125);
      /*box2d.b2Body*/
      var body = this.m_world.CreateBody(bd);
      body.CreateFixture(fd);

      /*box2d.b2Vec2*/
      var anchor = new box2d.b2Vec2(160.0 + 2.0 * i, -0.125);
      jd.Initialize(prevBody, body, anchor);
      this.m_world.CreateJoint(jd);

      prevBody = body;
    }

    /*box2d.b2Vec2*/
    var anchor = new box2d.b2Vec2(160.0 + 2.0 * N, -0.125);
    jd.Initialize(prevBody, ground, anchor);
    this.m_world.CreateJoint(jd);
  }

  // Boxes
  {
    /*box2d.b2PolygonShape*/
    var box = new box2d.b2PolygonShape();
    box.SetAsBox(0.5, 0.5);

    /*box2d.b2Body*/
    var body = null;
    /*box2d.b2BodyDef*/
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;

    bd.position.Set(230.0, 0.5);
    body = this.m_world.CreateBody(bd);
    body.CreateFixture(box, 0.5);

    bd.position.Set(230.0, 1.5);
    body = this.m_world.CreateBody(bd);
    body.CreateFixture(box, 0.5);

    bd.position.Set(230.0, 2.5);
    body = this.m_world.CreateBody(bd);
    body.CreateFixture(box, 0.5);

    bd.position.Set(230.0, 3.5);
    body = this.m_world.CreateBody(bd);
    body.CreateFixture(box, 0.5);

    bd.position.Set(230.0, 4.5);
    body = this.m_world.CreateBody(bd);
    body.CreateFixture(box, 0.5);
  }

  // Car
  {
    /*box2d.b2PolygonShape*/
    var chassis = new box2d.b2PolygonShape();
    /*box2d.b2Vec2[]*/
    var vertices = box2d.b2Vec2.MakeArray(8);
    vertices[0].Set(-1.5, -0.5);
    vertices[1].Set(1.5, -0.5);
    vertices[2].Set(1.5, 0.0);
    vertices[3].Set(0.0, 0.9);
    vertices[4].Set(-1.15, 0.9);
    vertices[5].Set(-1.5, 0.2);
    chassis.Set(vertices, 6);

    /*box2d.b2CircleShape*/
    var circle = new box2d.b2CircleShape();
    circle.m_radius = 0.4;

    /*box2d.b2BodyDef*/
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(0.0, 1.0);
    this.m_car = this.m_world.CreateBody(bd);
    this.m_car.CreateFixture(chassis, 1.0);

    /*box2d.b2FixtureDef*/
    var fd = new box2d.b2FixtureDef();
    fd.shape = circle;
    fd.density = 1.0;
    fd.friction = 0.9;

    bd.position.Set(-1.0, 0.35);
    this.m_wheel1 = this.m_world.CreateBody(bd);
    this.m_wheel1.CreateFixture(fd);

    bd.position.Set(1.0, 0.4);
    this.m_wheel2 = this.m_world.CreateBody(bd);
    this.m_wheel2.CreateFixture(fd);

    /*box2d.b2WheelJointDef*/
    var jd = new box2d.b2WheelJointDef();
    /*box2d.b2Vec2*/
    var axis = new box2d.b2Vec2(0.0, 1.0);

    jd.Initialize(this.m_car, this.m_wheel1, this.m_wheel1.GetPosition(), axis);
    jd.motorSpeed = 0.0;
    jd.maxMotorTorque = 20.0;
    jd.enableMotor = true;
    jd.frequencyHz = this.m_hz;
    jd.dampingRatio = this.m_zeta;
    this.m_spring1 = /** @type {box2d.b2WheelJoint} */ (this.m_world.CreateJoint(jd));

    jd.Initialize(this.m_car, this.m_wheel2, this.m_wheel2.GetPosition(), axis);
    jd.motorSpeed = 0.0;
    jd.maxMotorTorque = 10.0;
    jd.enableMotor = false;
    jd.frequencyHz = this.m_hz;
    jd.dampingRatio = this.m_zeta;
    this.m_spring2 = /** @type {box2d.b2WheelJoint} */ (this.m_world.CreateJoint(jd));
  }
}

goog.inherits(box2d.Testbed.Car, box2d.Testbed.Test);

/**
 * @export 
 * @type {box2d.b2Body} 
 */
box2d.Testbed.Car.prototype.m_car = null;
/**
 * @export 
 * @type {box2d.b2Body} 
 */
box2d.Testbed.Car.prototype.m_wheel1 = null;
/**
 * @export 
 * @type {box2d.b2Body} 
 */
box2d.Testbed.Car.prototype.m_wheel2 = null;

/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.Car.prototype.m_hz = 0.0;
/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.Car.prototype.m_zeta = 0.0;
/**
 * @export 
 * @type {number} 
 */
box2d.Testbed.Car.prototype.m_speed = 0.0;
/**
 * @export 
 * @type {box2d.b2WheelJoint} 
 */
box2d.Testbed.Car.prototype.m_spring1 = null;
/**
 * @export 
 * @type {box2d.b2WheelJoint} 
 */
box2d.Testbed.Car.prototype.m_spring2 = null;

/**
 * @export 
 * @return {void} 
 * @param {number} key 
 */
box2d.Testbed.Car.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.A:
      this.m_spring1.SetMotorSpeed(this.m_speed);
      break;

    case goog.events.KeyCodes.S:
      this.m_spring1.SetMotorSpeed(0.0);
      break;

    case goog.events.KeyCodes.D:
      this.m_spring1.SetMotorSpeed(-this.m_speed);
      break;

    case goog.events.KeyCodes.Q:
      this.m_hz = box2d.b2Max(0.0, this.m_hz - 1.0);
      this.m_spring1.SetSpringFrequencyHz(this.m_hz);
      this.m_spring2.SetSpringFrequencyHz(this.m_hz);
      break;

    case goog.events.KeyCodes.E:
      this.m_hz += 1.0;
      this.m_spring1.SetSpringFrequencyHz(this.m_hz);
      this.m_spring2.SetSpringFrequencyHz(this.m_hz);
      break;
  }
}

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Car.prototype.Step = function(settings) {
  this.m_debugDraw.DrawString(5, this.m_textLine, "Keys: left = a, brake = s, right = d, hz down = q, hz up = e");
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
  this.m_debugDraw.DrawString(5, this.m_textLine, "frequency = %4.2f hz, damping ratio = %4.2f", this.m_hz, this.m_zeta);
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;

  settings.viewCenter.x = this.m_car.GetPosition().x;
  box2d.Testbed.Test.prototype.Step.call(this, settings);
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Car.Create = function(canvas, settings) {
  return new box2d.Testbed.Car(canvas, settings);
}
