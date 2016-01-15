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

goog.provide('box2d.Testbed.Revolute');

goog.require('box2d.Testbed.Test');

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Revolute = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  var ground = null; {
    var bd = new box2d.b2BodyDef();
    ground = this.m_world.CreateBody(bd);

    var shape = new box2d.b2EdgeShape();
    shape.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));

    /*box2d.b2FixtureDef*/
    var fd = new box2d.b2FixtureDef();
    fd.shape = shape;
    //fd.filter.categoryBits = 2;

    ground.CreateFixture(fd);
  }

  {
    var shape = new box2d.b2CircleShape();
    shape.m_radius = 0.5;

    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;

    var rjd = new box2d.b2RevoluteJointDef();

    bd.position.Set(-10.0, 20.0);
    var body = this.m_world.CreateBody(bd);
    body.CreateFixture(shape, 5.0);

    var w = 100.0;
    body.SetAngularVelocity(w);
    body.SetLinearVelocity(new box2d.b2Vec2(-8.0 * w, 0.0));

    rjd.Initialize(ground, body, new box2d.b2Vec2(-10.0, 12.0));
    rjd.motorSpeed = 1.0 * box2d.b2_pi;
    rjd.maxMotorTorque = 10000.0;
    rjd.enableMotor = false;
    rjd.lowerAngle = -0.25 * box2d.b2_pi;
    rjd.upperAngle = 0.5 * box2d.b2_pi;
    rjd.enableLimit = true;
    rjd.collideConnected = true;

    this.m_joint = /** @type {box2d.b2RevoluteJoint} */ (this.m_world.CreateJoint(rjd));
  }

  {
    /*box2d.b2CircleShape*/
    var circle_shape = new box2d.b2CircleShape();
    circle_shape.m_radius = 3.0;

    var circle_bd = new box2d.b2BodyDef();
    circle_bd.type = box2d.b2BodyType.b2_dynamicBody;
    circle_bd.position.Set(5.0, 30.0);

    /*box2d.b2FixtureDef*/
    var fd = new box2d.b2FixtureDef();
    fd.density = 5.0;
    fd.filter.maskBits = 1;
    fd.shape = circle_shape;

    this.m_ball = this.m_world.CreateBody(circle_bd);
    this.m_ball.CreateFixture(fd);

    /*box2d.b2PolygonShape*/
    var polygon_shape = new box2d.b2PolygonShape();
    polygon_shape.SetAsBox(10.0, 0.2, new box2d.b2Vec2(-10.0, 0.0), 0.0);

    var polygon_bd = new box2d.b2BodyDef();
    polygon_bd.position.Set(20.0, 10.0);
    polygon_bd.type = box2d.b2BodyType.b2_dynamicBody;
    polygon_bd.bullet = true;
    /*box2d.b2Body*/
    var polygon_body = this.m_world.CreateBody(polygon_bd);
    polygon_body.CreateFixture(polygon_shape, 2.0);

    var rjd = new box2d.b2RevoluteJointDef();
    rjd.Initialize(ground, polygon_body, new box2d.b2Vec2(20.0, 10.0));
    rjd.lowerAngle = -0.25 * box2d.b2_pi;
    rjd.upperAngle = 0.0 * box2d.b2_pi;
    rjd.enableLimit = true;
    this.m_world.CreateJoint(rjd);
  }

  // Tests mass computation of a small object far from the origin
  {
    var bodyDef = new box2d.b2BodyDef();
    bodyDef.type = box2d.b2BodyType.b2_dynamicBody;
    /*box2d.b2Body*/
    var body = this.m_world.CreateBody(bodyDef);

    /*box2d.b2PolygonShape*/
    var polyShape = new box2d.b2PolygonShape();
    /*box2d.b2Vec2*/
    var verts = box2d.b2Vec2.MakeArray(3);
    verts[0].Set(17.63, 36.31);
    verts[1].Set(17.52, 36.69);
    verts[2].Set(17.19, 36.36);
    polyShape.Set(verts, 3);

    /*box2d.b2FixtureDef*/
    var polyFixtureDef = new box2d.b2FixtureDef();
    polyFixtureDef.shape = polyShape;
    polyFixtureDef.density = 1;

    body.CreateFixture(polyFixtureDef); //assertion hits inside here
  }

}

goog.inherits(box2d.Testbed.Revolute, box2d.Testbed.Test);

/**
 * @export
 * @type {box2d.b2Body}
 */
box2d.Testbed.Revolute.prototype.m_ball = null;
/**
 * @export
 * @type {box2d.b2RevoluteJoint}
 */
box2d.Testbed.Revolute.prototype.m_joint = null;

/**
 * @export
 * @return {void}
 * @param {number} key
 */
box2d.Testbed.Revolute.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.L:
      this.m_joint.EnableLimit(!this.m_joint.IsLimitEnabled());
      break;

    case goog.events.KeyCodes.M:
      this.m_joint.EnableMotor(!this.m_joint.IsMotorEnabled());
      break;
  }
}

/**
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Revolute.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);
  this.m_debugDraw.DrawString(5, this.m_textLine, "Keys: (l) limits, (m) motor");
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;

  //if (m_stepCount === 360)
  //{
  //  m_ball.SetTransform(box2d.b2Vec2(0.0, 0.5f), 0.0);
  //}

  //var torque1 = this.m_joint1.GetMotorTorque(settings.hz);
  //this.m_debugDraw.DrawString(5, this.m_textLine, "Motor Torque = %4.0, %4.0 : Motor Force = %4.0", (float) torque1, (float) torque2, (float) force3);
  //this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Revolute.Create = function(canvas, settings) {
  return new box2d.Testbed.Revolute(canvas, settings);
}
