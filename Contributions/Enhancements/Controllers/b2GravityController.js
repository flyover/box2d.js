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

//#if B2_ENABLE_CONTROLLER

goog.provide('box2d.b2GravityController');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Controller');
goog.require('box2d.b2Math');

/**
 * Applies simplified gravity between every pair of bodies
 * @export
 * @constructor
 * @extends {box2d.b2Controller}
 */
box2d.b2GravityController = function() {
  goog.base(this); // base class constructor
};

goog.inherits(box2d.b2GravityController, box2d.b2Controller);

/**
 * Specifies the strength of the gravitiation force
 * @export
 * @type {number}
 */
box2d.b2GravityController.prototype.G = 1;
/**
 * If true, gravity is proportional to r^-2, otherwise r^-1
 * @export
 * @type {boolean}
 */
box2d.b2GravityController.prototype.invSqr = true;

/**
 * @see b2Controller::Step
 * @export
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2GravityController.prototype.Step = function(step) {
  if (this.invSqr) {
    for (var i = this.m_bodyList; i; i = i.nextBody) {
      var body1 = i.body;
      var p1 = body1.GetWorldCenter();
      var mass1 = body1.GetMass();
      for (var j = this.m_bodyList; j !== i; j = j.nextBody) {
        var body2 = j.body;
        var p2 = body2.GetWorldCenter();
        var mass2 = body2.GetMass();
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        var r2 = dx * dx + dy * dy;
        if (r2 < box2d.b2_epsilon)
          continue;
        var f = box2d.b2GravityController.prototype.Step.s_f.Set(dx, dy);
        f.SelfMul(this.G / r2 / box2d.b2Sqrt(r2) * mass1 * mass2);
        if (body1.IsAwake())
          body1.ApplyForce(f, p1);
        if (body2.IsAwake())
          body2.ApplyForce(f.SelfMul(-1), p2);
      }
    }
  } else {
    for (var i = this.m_bodyList; i; i = i.nextBody) {
      var body1 = i.body;
      var p1 = body1.GetWorldCenter();
      var mass1 = body1.GetMass();
      for (var j = this.m_bodyList; j !== i; j = j.nextBody) {
        var body2 = j.body;
        var p2 = body2.GetWorldCenter();
        var mass2 = body2.GetMass();
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        var r2 = dx * dx + dy * dy;
        if (r2 < box2d.b2_epsilon)
          continue;
        var f = box2d.b2GravityController.prototype.Step.s_f.Set(dx, dy);
        f.SelfMul(this.G / r2 * mass1 * mass2);
        if (body1.IsAwake())
          body1.ApplyForce(f, p1);
        if (body2.IsAwake())
          body2.ApplyForce(f.SelfMul(-1), p2);
      }
    }
  }
}
box2d.b2GravityController.prototype.Step.s_f = new box2d.b2Vec2();

//#endif
