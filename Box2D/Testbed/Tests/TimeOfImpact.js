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

goog.provide('box2d.Testbed.TimeOfImpact');

goog.require('box2d.Testbed.Test');

/**
 * @export 
 * @constructor 
 * @extends {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.TimeOfImpact = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  this.m_shapeA = new box2d.b2PolygonShape();
  this.m_shapeB = new box2d.b2PolygonShape();

  this.m_shapeA.SetAsBox(25.0, 5.0);
  this.m_shapeB.SetAsBox(2.5, 2.5);
}

goog.inherits(box2d.Testbed.TimeOfImpact, box2d.Testbed.Test);

/**
 * @export 
 * @type {box2d.b2PolygonShape} 
 */
box2d.Testbed.TimeOfImpact.prototype.m_shapeA = null;
/**
 * @export 
 * @type {box2d.b2PolygonShape} 
 */
box2d.Testbed.TimeOfImpact.prototype.m_shapeB = null;

/**
 * @export
 * @return {void} 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.TimeOfImpact.prototype.Step = function(settings) {
  box2d.Testbed.Test.prototype.Step.call(this, settings);

  var sweepA = new box2d.b2Sweep;
  sweepA.c0.Set(24.0, -60.0);
  sweepA.a0 = 2.95;
  sweepA.c = sweepA.c0;
  sweepA.a = sweepA.a0;
  sweepA.localCenter.SetZero();

  var sweepB = new box2d.b2Sweep;
  sweepB.c0.Set(53.474274, -50.252514);
  sweepB.a0 = 513.36676; // - 162.0 * box2d.b2_pi;
  sweepB.c.Set(54.595478, -51.083473);
  sweepB.a = 513.62781; //  - 162.0 * box2d.b2_pi;
  sweepB.localCenter.SetZero();

  //sweepB.a0 -= 300.0 * box2d.b2_pi;
  //sweepB.a -= 300.0 * box2d.b2_pi;

  var input = new box2d.b2TOIInput();
  input.proxyA.SetShape(this.m_shapeA, 0);
  input.proxyB.SetShape(this.m_shapeB, 0);
  input.sweepA.Copy(sweepA);
  input.sweepB.Copy(sweepB);
  input.tMax = 1.0;

  var output = new box2d.b2TOIOutput();

  box2d.b2TimeOfImpact(output, input);

  var toi = output.t;

  this.m_debugDraw.DrawString(5, this.m_textLine, "toi = %4.2f", output.t);
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;

  this.m_debugDraw.DrawString(5, this.m_textLine, "max toi iters = %d, max root iters = %d", box2d.b2_toiMaxIters, box2d.b2_toiMaxRootIters);
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;

  var vertices = new Array(box2d.b2_maxPolygonVertices);

  var transformA = new box2d.b2Transform();
  sweepA.GetTransform(transformA, 0.0);
  for (var i = 0; i < this.m_shapeA.m_count; ++i) {
    vertices[i] = box2d.b2Mul_X_V2(transformA, this.m_shapeA.m_vertices[i], new box2d.b2Vec2());
  }
  this.m_debugDraw.DrawPolygon(vertices, this.m_shapeA.m_count, new box2d.b2Color(0.9, 0.9, 0.9));

  var transformB = new box2d.b2Transform();
  sweepB.GetTransform(transformB, 0.0);

  //box2d.b2Vec2 localPoint(2.0f, -0.1f);

  for (var i = 0; i < this.m_shapeB.m_count; ++i) {
    vertices[i] = box2d.b2Mul_X_V2(transformB, this.m_shapeB.m_vertices[i], new box2d.b2Vec2());
  }
  this.m_debugDraw.DrawPolygon(vertices, this.m_shapeB.m_count, new box2d.b2Color(0.5, 0.9, 0.5));

  sweepB.GetTransform(transformB, output.t);
  for (var i = 0; i < this.m_shapeB.m_count; ++i) {
    vertices[i] = box2d.b2Mul_X_V2(transformB, this.m_shapeB.m_vertices[i], new box2d.b2Vec2());
  }
  this.m_debugDraw.DrawPolygon(vertices, this.m_shapeB.m_count, new box2d.b2Color(0.5, 0.7, 0.9));

  sweepB.GetTransform(transformB, 1.0);
  for (var i = 0; i < this.m_shapeB.m_count; ++i) {
    vertices[i] = box2d.b2Mul_X_V2(transformB, this.m_shapeB.m_vertices[i], new box2d.b2Vec2());
  }
  this.m_debugDraw.DrawPolygon(vertices, this.m_shapeB.m_count, new box2d.b2Color(0.9, 0.5, 0.5));

  /*
  #if 0
  	for (float32 t = 0.0f; t < 1.0f; t += 0.1f)
  	{
  		sweepB.GetTransform(&transformB, t);
  		for (int32 i = 0; i < m_shapeB.m_count; ++i)
  		{
  			vertices[i] = b2Mul(transformB, m_shapeB.m_vertices[i]);
  		}
  		m_debugDraw.DrawPolygon(vertices, m_shapeB.m_count, box2d.b2Color(0.9f, 0.5f, 0.5f));
  	}
  #endif
  */
}

/** 
 * @export 
 * @return {box2d.Testbed.Test} 
 * @param {HTMLCanvasElement} canvas 
 * @param {box2d.Testbed.Settings} settings 
 */
box2d.Testbed.TimeOfImpact.Create = function(canvas, settings) {
  return new box2d.Testbed.TimeOfImpact(canvas, settings);
}
