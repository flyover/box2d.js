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

goog.provide('box2d.Testbed.ContinuousTest');

goog.require('box2d.Testbed.Test');

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.ContinuousTest = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  {
    var bd = new box2d.b2BodyDef();
    bd.position.Set(0.0, 0.0);
    var body = this.m_world.CreateBody(bd);

    var edge = new box2d.b2EdgeShape();

    edge.SetAsEdge(new box2d.b2Vec2(-10.0, 0.0), new box2d.b2Vec2(10.0, 0.0));
    body.CreateFixture(edge, 0.0);

    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(0.2, 1.0, new box2d.b2Vec2(0.5, 1.0), 0.0);
    body.CreateFixture(shape, 0.0);
  }

  {
    var bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;
    bd.position.Set(0.0, 20.0);
    //bd.angle = 0.1;

    var shape = new box2d.b2PolygonShape();
    shape.SetAsBox(2.0, 0.1);

    this.m_body = this.m_world.CreateBody(bd);
    this.m_body.CreateFixture(shape, 1.0);

    this.m_angularVelocity = box2d.b2RandomRange(-50.0, 50.0);
    //this.m_angularVelocity = 46.661274;
    this.m_body.SetLinearVelocity(new box2d.b2Vec2(0.0, -100.0));
    this.m_body.SetAngularVelocity(this.m_angularVelocity);
  }
  /*
  else
  {
  	var bd = new box2d.b2BodyDef();
  	bd.type = box2d.b2BodyType.b2_dynamicBody;
  	bd.position.Set(0.0, 2.0);
  	var body = this.m_world.CreateBody(bd);

  	var shape = new box2d.b2CircleShape();
  	shape.m_p.SetZero();
  	shape.m_radius = 0.5;
  	body.CreateFixture(shape, 1.0);

  	bd.bullet = true;
  	bd.position.Set(0.0, 10.0);
  	body = this.m_world.CreateBody(bd);
  	body.CreateFixture(shape, 1.0);
  	body.SetLinearVelocity(new box2d.b2Vec2(0.0, -100.0));
  }
  */

  box2d.b2_gjkCalls = 0;
  box2d.b2_gjkIters = 0;
  box2d.b2_gjkMaxIters = 0;
  box2d.b2_toiCalls = 0;
  box2d.b2_toiIters = 0;
  box2d.b2_toiRootIters = 0;
  box2d.b2_toiMaxRootIters = 0;
  box2d.b2_toiTime = 0.0;
  box2d.b2_toiMaxTime = 0.0;
}

goog.inherits(box2d.Testbed.ContinuousTest, box2d.Testbed.Test);

/**
 * @export
 * @type {box2d.b2Body}
 */
box2d.Testbed.ContinuousTest.prototype.m_body = null;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.ContinuousTest.prototype.m_angularVelocity = 0.0;

/**
 * @export
 * @return {void}
 */
box2d.Testbed.ContinuousTest.prototype.Launch = function() {
  box2d.b2_gjkCalls = 0;
  box2d.b2_gjkIters = 0;
  box2d.b2_gjkMaxIters = 0;
  box2d.b2_toiCalls = 0;
  box2d.b2_toiIters = 0;
  box2d.b2_toiRootIters = 0;
  box2d.b2_toiMaxRootIters = 0;
  box2d.b2_toiTime = 0.0;
  box2d.b2_toiMaxTime = 0.0;

  this.m_body.SetTransform_V2_A(new box2d.b2Vec2(0.0, 20.0), 0.0);
  this.m_angularVelocity = box2d.b2RandomRange(-50.0, 50.0);
  this.m_body.SetLinearVelocity(new box2d.b2Vec2(0.0, -100.0));
  this.m_body.SetAngularVelocity(this.m_angularVelocity);
}

/**
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.ContinuousTest.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);

  if (box2d.b2_gjkCalls > 0) {
    this.m_debugDraw.DrawString(5, this.m_textLine, "gjk calls = %d, ave gjk iters = %3.1f, max gjk iters = %d",
      box2d.b2_gjkCalls, box2d.b2_gjkIters / box2d.b2_gjkCalls, box2d.b2_gjkMaxIters);
    this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
  }

  if (box2d.b2_toiCalls > 0) {
    this.m_debugDraw.DrawString(5, this.m_textLine, "toi [max] calls = %d, ave toi iters = %3.1f [%d]",
      box2d.b2_toiCalls, box2d.b2_toiIters / box2d.b2_toiCalls, box2d.b2_toiMaxRootIters);
    this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;

    this.m_debugDraw.DrawString(5, this.m_textLine, "ave [max] toi root iters = %3.1f [%d]",
      box2d.b2_toiRootIters / box2d.b2_toiCalls, box2d.b2_toiMaxRootIters);
    this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;

    this.m_debugDraw.DrawString(5, this.m_textLine, "ave [max] toi time = %.1f [%.1f] (microseconds)",
      1000.0 * box2d.b2_toiTime / box2d.b2_toiCalls, 1000.0 * box2d.b2_toiMaxTime);
    this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
  }

  if (this.m_stepCount % 60 === 0) {
    this.Launch();
  }
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.ContinuousTest.Create = function(canvas, settings) {
  return new box2d.Testbed.ContinuousTest(canvas, settings);
}
