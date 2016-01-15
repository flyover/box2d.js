/*
 * Copyright (c) 2014 Google, Inc.
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

//#if B2_ENABLE_PARTICLE

goog.provide('box2d.Testbed.SoupStirrer');

goog.require('box2d.Testbed.Soup');

/**
 * Soup stirred by a circular dynamic body.
 *
 * A force vector (following a circle) is continuously applied
 * to the body while by default the body is attached to a joint
 * restricting motion to the x-axis.
 *
 * @export
 * @constructor
 * @extends {box2d.Testbed.Soup}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.SoupStirrer = function(canvas, settings) {
  box2d.Testbed.Soup.call(this, canvas, settings); // base class constructor

  this.m_particleSystem.SetDamping(1.0);

  // Shape of the stirrer.
  var shape = new box2d.b2CircleShape();
  shape.m_p.Set(0, 0.7);
  shape.m_radius = 0.4;

  // Create the stirrer.
  var bd = new box2d.b2BodyDef();
  bd.type = box2d.b2BodyType.b2_dynamicBody;
  this.m_stirrer = this.m_world.CreateBody(bd);
  this.m_stirrer.CreateFixture(shape, 1.0);

  // Destroy all particles under the stirrer.
  var xf = new box2d.b2Transform();
  xf.SetIdentity();
  this.m_particleSystem.DestroyParticlesInShape(shape, xf);

  // By default attach the body to a joint to restrict movement.
  this.CreateJoint();
}

goog.inherits(box2d.Testbed.SoupStirrer, box2d.Testbed.Soup);

/**
 * @type {box2d.b2Body}
 */
box2d.Testbed.SoupStirrer.prototype.m_stirrer = null;
/**
 * @type {box2d.b2Joint}
 */
box2d.Testbed.SoupStirrer.prototype.m_joint = null;
/**
 * @type {number}
 */
box2d.Testbed.SoupStirrer.prototype.m_oscillationOffset = 0.0;

/**
 * Create a joint to fix the stirrer to a single axis of
 * movement.
 * @return {void}
 */
box2d.Testbed.SoupStirrer.prototype.CreateJoint = function() {
  box2d.b2Assert(!this.m_joint);
  // Create a prismatic joint and connect to the ground, and have it
  // slide along the x axis.
  // Disconnect the body from this joint to have more fun.
  var prismaticJointDef = new box2d.b2PrismaticJointDef();
  prismaticJointDef.bodyA = this.m_ground;
  prismaticJointDef.bodyB = this.m_stirrer;
  prismaticJointDef.collideConnected = true;
  prismaticJointDef.localAxisA.Set(1, 0);
  prismaticJointDef.localAnchorA.Copy(this.m_stirrer.GetPosition());
  this.m_joint = this.m_world.CreateJoint(prismaticJointDef);
}

/**
 * Enable the joint if it's disabled, disable it if it's
 * enabled.
 * @return {void}
 */
box2d.Testbed.SoupStirrer.prototype.ToggleJoint = function() {
  if (this.m_joint) {
    this.m_world.DestroyJoint(this.m_joint);
    this.m_joint = null;
  } else {
    this.CreateJoint();
  }
}

/**
 * Press "t" to enable / disable the joint restricting the
 * stirrer's movement.
 * @export
 * @return {void}
 * @param {number} key
 */
box2d.Testbed.SoupStirrer.prototype.Keyboard = function(key) {
  switch (key) {
    case goog.events.KeyCodes.T:
      this.ToggleJoint();
      break;
    default:
      box2d.Testbed.Test.prototype.Keyboard.call(this, key);
      break;
  }
}

/**
 * Click the soup to toggle between enabling / disabling the
 * joint.
 * @export
 * @return {void}
 * @param {box2d.b2Vec2} p
 */
box2d.Testbed.SoupStirrer.prototype.MouseUp = function(p) {
  box2d.Testbed.Test.prototype.MouseUp.call(this, p);
  if (this.InSoup(p)) {
    this.ToggleJoint();
  }
}

/**
 * Determine whether a point is in the soup.
 * @return {boolean}
 * @param {box2d.b2Vec2} pos
 */
box2d.Testbed.SoupStirrer.prototype.InSoup = function(pos) {
  // The soup dimensions are from the container initialization in the
  // Soup test.
  return pos.y > -1.0 && pos.y < 2.0 && pos.x > -3.0 && pos.x < 3.0;
}

/**
 * Apply a force to the stirrer.
 * @export
 * @return {void}
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.SoupStirrer.prototype.Step = function(settings) {
  // Magnitude of the force applied to the body.
  var k_forceMagnitude = 10.0;
  // How often the force vector rotates.
  var k_forceOscillationPerSecond = 0.2;
  var k_forceOscillationPeriod = 1.0 / k_forceOscillationPerSecond;
  // Maximum speed of the body.
  var k_maxSpeed = 2.0;

  this.m_oscillationOffset += (1.0 / settings.hz);
  if (this.m_oscillationOffset > k_forceOscillationPeriod) {
    this.m_oscillationOffset -= k_forceOscillationPeriod;
  }

  // Calculate the force vector.
  var forceAngle = this.m_oscillationOffset * k_forceOscillationPerSecond * 2.0 * box2d.b2_pi;
  var forceVector = new box2d.b2Vec2(Math.sin(forceAngle), Math.cos(forceAngle)).SelfMul(k_forceMagnitude);

  // Only apply force to the body when it's within the soup.
  if (this.InSoup(this.m_stirrer.GetPosition()) &&
    this.m_stirrer.GetLinearVelocity().Length() < k_maxSpeed) {
    this.m_stirrer.ApplyForceToCenter(forceVector, true);
  }
  box2d.Testbed.Test.prototype.Step.call(this, settings);
}

/**
 * @export
 * @return {box2d.Testbed.Test}
 * @param {HTMLCanvasElement} canvas
 * @param {box2d.Testbed.Settings} settings
 */
box2d.Testbed.SoupStirrer.Create = function(canvas, settings) {
  return new box2d.Testbed.SoupStirrer(canvas, settings);
}

//#endif
