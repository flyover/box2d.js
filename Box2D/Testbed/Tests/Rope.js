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

//#if B2_ENABLE_ROPE

goog.provide('box2d.Testbed.Rope');

goog.require('box2d.Testbed.Test');

/**
 * @export
 * @constructor
 * @extends {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Rope = function(canvas, settings) {
  box2d.Testbed.Test.call(this, canvas, settings); // base class constructor

  this.m_rope = new box2d.b2Rope();

  /*const int32*/
  var N = 40;
  /*box2d.b2Vec2[]*/
  var vertices = box2d.b2Vec2.MakeArray(N);
  /*float32[]*/
  var masses = box2d.b2MakeNumberArray(N);

  for ( /*int32*/ var i = 0; i < N; ++i) {
    vertices[i].Set(0.0, 20.0 - 0.25 * i);
    masses[i] = 1.0;
  }
  masses[0] = 0.0;
  masses[1] = 0.0;

  /*box2d.b2RopeDef*/
  var def = new box2d.b2RopeDef();
  def.vertices = vertices;
  def.count = N;
  def.gravity.Set(0.0, -10.0);
  def.masses = masses;
  def.damping = 0.1;
  def.k2 = 1.0;
  def.k3 = 0.5;

  this.m_rope.Initialize(def);

  this.m_angle = 0.0;
  this.m_rope.SetAngle(this.m_angle);
}

goog.inherits(box2d.Testbed.Rope, box2d.Testbed.Test);

/**
 * @export
 * @type {box2d.b2Rope}
 */
box2d.Testbed.Rope.prototype.m_rope = null;
/**
 * @export
 * @type {number}
 */
box2d.Testbed.Rope.prototype.m_angle = 0.0;

/**
 * @export
 * @return {void}
 * @param {number} key
 */
box2d.Testbed.Rope.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.Q:
      this.m_angle = box2d.b2Max(-box2d.b2_pi, this.m_angle - 0.05 * box2d.b2_pi);
      this.m_rope.SetAngle(this.m_angle);
      break;

    case goog.events.KeyCodes.E:
      this.m_angle = box2d.b2Min(box2d.b2_pi, this.m_angle + 0.05 * box2d.b2_pi);
      this.m_rope.SetAngle(this.m_angle);
      break;
  }
}

/**
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Rope.prototype.Step = function(settings) {
  /*float32*/
  var dt = settings.hz > 0.0 ? 1.0 / settings.hz : 0.0;

  if (settings.pause && !settings.singleStep) {
    dt = 0.0;
  }

  this.m_rope.Step(dt, 1);

  box2d.Testbed.Test.prototype.Step.call(this, settings);

  this.m_rope.Draw(this.m_debugDraw);

  this.m_debugDraw.DrawString(5, this.m_textLine, "Press (q,e) to adjust target angle");
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
  this.m_debugDraw.DrawString(5, this.m_textLine, "Target angle = %4.2f degrees", this.m_angle * 180.0 / box2d.b2_pi);
  this.m_textLine += box2d.Testbed.DRAW_STRING_NEW_LINE;
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.Rope.Create = function(canvas, settings) {
  return new box2d.Testbed.Rope(canvas, settings);
}

//#endif
