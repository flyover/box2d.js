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

goog.provide('box2d.b2TimeStep');

goog.require('box2d.b2Settings');

/**
 * Profiling data. Times are in milliseconds.
 * @export
 * @constructor
 */
box2d.b2Profile = function() {};

/**
 * @export
 * @type {number}
 */
box2d.b2Profile.prototype.step = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2Profile.prototype.collide = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2Profile.prototype.solve = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2Profile.prototype.solveInit = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2Profile.prototype.solveVelocity = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2Profile.prototype.solvePosition = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2Profile.prototype.broadphase = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2Profile.prototype.solveTOI = 0;

/**
 * @export
 * @return {box2d.b2Profile}
 */
box2d.b2Profile.prototype.Reset = function() {
  this.step = 0;
  this.collide = 0;
  this.solve = 0;
  this.solveInit = 0;
  this.solveVelocity = 0;
  this.solvePosition = 0;
  this.broadphase = 0;
  this.solveTOI = 0;
  return this;
}

/**
 * This is an internal structure.
 * @export
 * @constructor
 */
box2d.b2TimeStep = function() {};

/**
 * @export
 * @type {number}
 */
box2d.b2TimeStep.prototype.dt = 0; // time step
/**
 * @export
 * @type {number}
 */
box2d.b2TimeStep.prototype.inv_dt = 0; // inverse time step (0 if dt === 0).
/**
 * @export
 * @type {number}
 */
box2d.b2TimeStep.prototype.dtRatio = 0; // dt * inv_dt0
/**
 * @export
 * @type {number}
 */
box2d.b2TimeStep.prototype.velocityIterations = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2TimeStep.prototype.positionIterations = 0;
//#if B2_ENABLE_PARTICLE
/**
 * @export
 * @type {number}
 */
box2d.b2TimeStep.prototype.particleIterations = 0;
//#endif
/**
 * @export
 * @type {boolean}
 */
box2d.b2TimeStep.prototype.warmStarting = false;

/**
 * @export
 * @return {box2d.b2TimeStep}
 * @param {box2d.b2TimeStep} step
 */
box2d.b2TimeStep.prototype.Copy = function(step) {
  this.dt = step.dt; // time step
  this.inv_dt = step.inv_dt; // inverse time step (0 if dt === 0).
  this.dtRatio = step.dtRatio; // dt * inv_dt0
  this.positionIterations = step.positionIterations;
  this.velocityIterations = step.velocityIterations;
  //#if B2_ENABLE_PARTICLE
  this.particleIterations = step.particleIterations;
  //#endif
  this.warmStarting = step.warmStarting;
  return this;
}

/**
 * This is an internal structure.
 * @export
 * @constructor
 */
box2d.b2Position = function() {
  this.c = new box2d.b2Vec2();
};

/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2Position.prototype.c = null;
/**
 * @export
 * @type {number}
 */
box2d.b2Position.prototype.a = 0;

/**
 * @export
 * @return {Array.<box2d.b2Position>}
 * @param {number} length
 */
box2d.b2Position.MakeArray = function(length) {
  return box2d.b2MakeArray(length, function(i) {
    return new box2d.b2Position();
  });
}

/**
 * This is an internal structure.
 * @export
 * @constructor
 */
box2d.b2Velocity = function() {
  this.v = new box2d.b2Vec2();
};

/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2Velocity.prototype.v = null;
/**
 * @export
 * @type {number}
 */
box2d.b2Velocity.prototype.w = 0;

/**
 * @export
 * @return {Array.<box2d.b2Velocity>}
 * @param {number} length
 */
box2d.b2Velocity.MakeArray = function(length) {
  return box2d.b2MakeArray(length, function(i) {
    return new box2d.b2Velocity();
  });
}

/**
 * Solver Data
 * @export
 * @constructor
 */
box2d.b2SolverData = function() {
  this.step = new box2d.b2TimeStep();
};

/**
 * @export
 * @type {box2d.b2TimeStep}
 */
box2d.b2SolverData.prototype.step = null;
/**
 * @export
 * @type {Array.<box2d.b2Position>}
 */
box2d.b2SolverData.prototype.positions = null;
/**
 * @export
 * @type {Array.<box2d.b2Velocity>}
 */
box2d.b2SolverData.prototype.velocities = null;
