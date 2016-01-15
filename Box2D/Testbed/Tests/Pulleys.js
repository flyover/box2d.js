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

goog.provide('box2d.Testbed.Pulleys');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Pulleys = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  var y = 16.0;
  var L = 12.0;
  var a = 1.0;
  var b = 2.0;

  var ground = null; {
    var bd = new box2d.b2BodyDef();
    ground = this.m_world.CreateBody(bd);

    var edge = new box2d.b2EdgeShape();
    edge.SetAsEdge(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
    //ground.CreateFixture(edge, 0.0);

    /*box2d.b2CircleShape*/
    var circle = new box2d.b2CircleShape();
    circle.m_radius = 2.0;

    circle.m_p.Set(-10.0, y + b + L);
    ground.CreateFixture(circle, 0.0);

    circle.m_p.Set(10.0, y + b + L);
    ground.CreateFixture(circle, 0.0);
  }

  {

    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(a, b);

    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;

    //bd.fixedRotation = true;
    bd.position.Set(-10.0, y);
    var body1 = this.m_world.CreateBody(bd);
    body1.CreateFixture(shape, 5.0);

    bd.position.Set(10.0, y);
    var body2 = this.m_world.CreateBody(bd);
    body2.CreateFixture(shape, 5.0);

    var pulleyDef = new box2d.b2PulleyJointDef();
    var anchor1 = new box2d.b2Vec2(-10.0, y + b);
    var anchor2 = new box2d.b2Vec2(10.0, y + b);
    var groundAnchor1 = new box2d.b2Vec2(-10.0, y + b + L);
    var groundAnchor2 = new box2d.b2Vec2(10.0, y + b + L);
    pulleyDef.Initialize(body1, body2, groundAnchor1, groundAnchor2, anchor1, anchor2, 1.5);

    this.m_joint1 = /** @type {box2d.b2PulleyJoint} */ (this.m_world.CreateJoint(pulleyDef));
  }
}

goog.inherits(box2d.Testbed.Pulleys, box2d.Testbed.Test);

/**
 * @export 
 * @type {box2d.b2PulleyJoint} 
 */
box2d.Testbed.Pulleys.prototype.m_joint1 = null;

/**
 * @export 
 * @return {void} 
 * @param {number} key 
 */
box2d.Testbed.Pulleys.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.ZERO:
      break;
  }
}

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Pulleys.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);

  var ratio = this.m_joint1.GetRatio();
  var L = this.m_joint1.GetCurrentLengthA() + ratio * this.m_joint1.GetCurrentLengthB();
  this.m_debugDraw.DrawString(5, this.m_textLine, "L1 + %4.2f * L2 = %4.2f", ratio, L);
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.Pulleys.Create = function(canvas, settings) {
  return new box2d.Testbed.Pulleys(canvas, settings);
}
