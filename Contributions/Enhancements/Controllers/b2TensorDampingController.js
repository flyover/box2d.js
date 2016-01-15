/*
 * Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
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

goog.provide('box2d.b2TensorDampingController');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Controller');
goog.require('box2d.b2Math');

/**
 * Applies top down linear damping to the controlled bodies
 * The damping is calculated by multiplying velocity by a matrix
 * in local co-ordinates.
 * @export
 * @constructor
 * @extends {box2d.b2Controller}
 */
box2d.b2TensorDampingController = function() {
  goog.base(this); // base class constructor

  /// Tensor to use in damping model
  /** @type {box2d.b2Mat22} */
  this.T = new box2d.b2Mat22();
  /*Some examples (matrixes in format (row1; row2))
  (-a 0; 0 -a)    Standard isotropic damping with strength a
  ( 0 a; -a 0)    Electron in fixed field - a force at right angles to velocity with proportional magnitude
  (-a 0; 0 -b)    Differing x and y damping. Useful e.g. for top-down wheels.
  */
  //By the way, tensor in this case just means matrix, don't let the terminology get you down.

  /// Set this to a positive number to clamp the maximum amount of damping done.
  /** @type {number} */
  this.maxTimestep = 0;
  // Typically one wants maxTimestep to be 1/(max eigenvalue of T), so that damping will never cause something to reverse direction
};

goog.inherits(box2d.b2TensorDampingController, box2d.b2Controller);

/**
 * Tensor to use in damping model
 * @export
 * @type {box2d.b2Mat22}
 */
box2d.b2TensorDampingController.prototype.T = new box2d.b2Mat22();
/*Some examples (matrixes in format (row1; row2))
(-a 0; 0 -a)    Standard isotropic damping with strength a
( 0 a; -a 0)    Electron in fixed field - a force at right angles to velocity with proportional magnitude
(-a 0; 0 -b)    Differing x and y damping. Useful e.g. for top-down wheels.
*/
//By the way, tensor in this case just means matrix, don't let the terminology get you down.

/**
 * Set this to a positive number to clamp the maximum amount of
 * damping done.
 * @export
 * @type {number}
 */
box2d.b2TensorDampingController.prototype.maxTimestep = 0;
// Typically one wants maxTimestep to be 1/(max eigenvalue of T), so that damping will never cause something to reverse direction

/**
 * @see b2Controller::Step
 * @return {void}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2TensorDampingController.prototype.Step = function(step) {
  var timestep = step.dt;
  if (timestep <= box2d.b2_epsilon)
    return;
  if (timestep > this.maxTimestep && this.maxTimestep > 0)
    timestep = this.maxTimestep;
  for (var i = this.m_bodyList; i; i = i.nextBody) {
    var body = i.body;
    if (!body.IsAwake())
      continue;
    var damping = body.GetWorldVector(
      box2d.b2Mul_M22_V2(
        this.T,
        body.GetLocalVector(
          body.GetLinearVelocity(),
          box2d.b2Vec2.s_t0),
        box2d.b2Vec2.s_t1),
      box2d.b2TensorDampingController.prototype.Step.s_damping);
    //    body->SetLinearVelocity(body->GetLinearVelocity() + timestep * damping);
    body.SetLinearVelocity(box2d.b2Add_V2_V2(body.GetLinearVelocity(), box2d.b2Mul_S_V2(timestep, damping, box2d.b2Vec2.s_t0), box2d.b2Vec2.s_t1));
  }
}
box2d.b2TensorDampingController.prototype.Step.s_damping = new box2d.b2Vec2();

/**
 * Sets damping independantly along the x and y axes
 * @return {void}
 * @param {number} xDamping
 * @param {number} yDamping
 */
box2d.b2TensorDampingController.prototype.SetAxisAligned = function(xDamping, yDamping) {
  this.T.ex.x = (-xDamping);
  this.T.ex.y = 0;
  this.T.ey.x = 0;
  this.T.ey.y = (-yDamping);
  if (xDamping > 0 || yDamping > 0) {
    this.maxTimestep = 1 / box2d.b2Max(xDamping, yDamping);
  } else {
    this.maxTimestep = 0;
  }
}

//#endif
