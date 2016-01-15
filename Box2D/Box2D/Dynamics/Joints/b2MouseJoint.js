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

goog.provide('box2d.b2MouseJoint');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Joint');
goog.require('box2d.b2Math');

/**
 * Mouse joint definition. This requires a world target point,
 * tuning parameters, and the time step.
 * @export
 * @constructor
 * @extends {box2d.b2JointDef}
 */
box2d.b2MouseJointDef = function() {
  box2d.b2JointDef.call(this, box2d.b2JointType.e_mouseJoint); // base class constructor

  this.target = new box2d.b2Vec2();
}

goog.inherits(box2d.b2MouseJointDef, box2d.b2JointDef);

/**
 * The initial world target point. This is assumed to coincide
 * with the body anchor initially.
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2MouseJointDef.prototype.target = null;

/**
 * The maximum constraint force that can be exerted to move the
 * candidate body. Usually you will express as some multiple of
 * the weight (multiplier * mass * gravity).
 * @export
 * @type {number}
 */
box2d.b2MouseJointDef.prototype.maxForce = 0;

/**
 * The response speed.
 * @export
 * @type {number}
 */
box2d.b2MouseJointDef.prototype.frequencyHz = 5;

/**
 * The damping ratio. 0 = no damping, 1 = critical damping.
 * @export
 * @type {number}
 */
box2d.b2MouseJointDef.prototype.dampingRatio = 0.7;

/**
 * A mouse joint is used to make a point on a body track a
 * specified world point. This a soft constraint with a maximum
 * force. This allows the constraint to stretch and without
 * applying huge forces.
 * NOTE: this joint is not documented in the manual because it
 * was developed to be used in the testbed. If you want to learn
 * how to use the mouse joint, look at the testbed.
 * @export
 * @constructor
 * @extends {box2d.b2Joint}
 * @param {box2d.b2MouseJointDef} def
 */
box2d.b2MouseJoint = function(def) {
  box2d.b2Joint.call(this, def); // base class constructor

  this.m_localAnchorB = new box2d.b2Vec2();
  this.m_targetA = new box2d.b2Vec2();

  this.m_impulse = new box2d.b2Vec2();

  this.m_rB = new box2d.b2Vec2();
  this.m_localCenterB = new box2d.b2Vec2();
  this.m_mass = new box2d.b2Mat22();
  this.m_C = new box2d.b2Vec2();
  this.m_qB = new box2d.b2Rot();
  this.m_lalcB = new box2d.b2Vec2();
  this.m_K = new box2d.b2Mat22();

  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(def.target.IsValid());
  }
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(box2d.b2IsValid(def.maxForce) && def.maxForce >= 0);
  }
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(box2d.b2IsValid(def.frequencyHz) && def.frequencyHz >= 0);
  }
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(box2d.b2IsValid(def.dampingRatio) && def.dampingRatio >= 0);
  }

  this.m_targetA.Copy(def.target);
  box2d.b2MulT_X_V2(this.m_bodyB.GetTransform(), this.m_targetA, this.m_localAnchorB);

  this.m_maxForce = def.maxForce;
  this.m_impulse.SetZero();

  this.m_frequencyHz = def.frequencyHz;
  this.m_dampingRatio = def.dampingRatio;

  this.m_beta = 0;
  this.m_gamma = 0;
}

goog.inherits(box2d.b2MouseJoint, box2d.b2Joint);

/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2MouseJoint.prototype.m_localAnchorB = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2MouseJoint.prototype.m_targetA = null;
/**
 * @export
 * @type {number}
 */
box2d.b2MouseJoint.prototype.m_frequencyHz = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2MouseJoint.prototype.m_dampingRatio = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2MouseJoint.prototype.m_beta = 0;

// Solver shared
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2MouseJoint.prototype.m_impulse = null;
/**
 * @export
 * @type {number}
 */
box2d.b2MouseJoint.prototype.m_maxForce = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2MouseJoint.prototype.m_gamma = 0;

// Solver temp
/**
 * @export
 * @type {number}
 */
box2d.b2MouseJoint.prototype.m_indexA = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2MouseJoint.prototype.m_indexB = 0;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2MouseJoint.prototype.m_rB = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2MouseJoint.prototype.m_localCenterB = null;
/**
 * @export
 * @type {number}
 */
box2d.b2MouseJoint.prototype.m_invMassB = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2MouseJoint.prototype.m_invIB = 0;
/**
 * @export
 * @type {box2d.b2Mat22}
 */
box2d.b2MouseJoint.prototype.m_mass = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2MouseJoint.prototype.m_C = null;
/**
 * @export
 * @type {box2d.b2Rot}
 */
box2d.b2MouseJoint.prototype.m_qB = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2MouseJoint.prototype.m_lalcB = null;
/**
 * @export
 * @type {box2d.b2Mat22}
 */
box2d.b2MouseJoint.prototype.m_K = null;

/**
 * @export
 * @return {void}
 * @param {box2d.b2Vec2} target
 */
box2d.b2MouseJoint.prototype.SetTarget = function(target) {
  if (!this.m_bodyB.IsAwake()) {
    this.m_bodyB.SetAwake(true);
  }
  this.m_targetA.Copy(target);
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2MouseJoint.prototype.GetTarget = function(out) {
  return out.Copy(this.m_targetA);
}

/**
 * @export
 * @return {void}
 * @param {number} maxForce
 */
box2d.b2MouseJoint.prototype.SetMaxForce = function(maxForce) {
  this.m_maxForce = maxForce;
}

/**
 * @export
 * @return {number}
 */
box2d.b2MouseJoint.prototype.GetMaxForce = function() {
  return this.m_maxForce;
}

/**
 * @export
 * @return {void}
 * @param {number} hz
 */
box2d.b2MouseJoint.prototype.SetFrequency = function(hz) {
  this.m_frequencyHz = hz;
}

/**
 * @export
 * @return {number}
 */
box2d.b2MouseJoint.prototype.GetFrequency = function() {
  return this.m_frequencyHz;
}

/**
 * @export
 * @return {void}
 * @param {number} ratio
 */
box2d.b2MouseJoint.prototype.SetDampingRatio = function(ratio) {
  this.m_dampingRatio = ratio;
}

/**
 * @export
 * @return {number}
 */
box2d.b2MouseJoint.prototype.GetDampingRatio = function() {
  return this.m_dampingRatio;
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2SolverData} data
 */
box2d.b2MouseJoint.prototype.InitVelocityConstraints = function(data) {
  this.m_indexB = this.m_bodyB.m_islandIndex;
  this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
  this.m_invMassB = this.m_bodyB.m_invMass;
  this.m_invIB = this.m_bodyB.m_invI;

  /*box2d.b2Vec2&*/
  var cB = data.positions[this.m_indexB].c;
  /*float32*/
  var aB = data.positions[this.m_indexB].a;
  /*box2d.b2Vec2&*/
  var vB = data.velocities[this.m_indexB].v;
  /*float32*/
  var wB = data.velocities[this.m_indexB].w;

  var qB = this.m_qB.SetAngle(aB);

  /*float32*/
  var mass = this.m_bodyB.GetMass();

  // Frequency
  /*float32*/
  var omega = 2 * box2d.b2_pi * this.m_frequencyHz;

  // Damping coefficient
  /*float32*/
  var d = 2 * mass * this.m_dampingRatio * omega;

  // Spring stiffness
  /*float32*/
  var k = mass * (omega * omega);

  // magic formulas
  // gamma has units of inverse mass.
  // beta has units of inverse time.
  /*float32*/
  var h = data.step.dt;
  if (box2d.ENABLE_ASSERTS) {
    box2d.b2Assert(d + h * k > box2d.b2_epsilon);
  }
  this.m_gamma = h * (d + h * k);
  if (this.m_gamma !== 0) {
    this.m_gamma = 1 / this.m_gamma;
  }
  this.m_beta = h * k * this.m_gamma;

  // Compute the effective mass matrix.
  box2d.b2Sub_V2_V2(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
  box2d.b2Mul_R_V2(qB, this.m_lalcB, this.m_rB);

  // K    = [(1/m1 + 1/m2) * eye(2) - skew(r1) * invI1 * skew(r1) - skew(r2) * invI2 * skew(r2)]
  //      = [1/m1+1/m2     0    ] + invI1 * [r1.y*r1.y -r1.x*r1.y] + invI2 * [r1.y*r1.y -r1.x*r1.y]
  //        [    0     1/m1+1/m2]           [-r1.x*r1.y r1.x*r1.x]           [-r1.x*r1.y r1.x*r1.x]
  var K = this.m_K;
  K.ex.x = this.m_invMassB + this.m_invIB * this.m_rB.y * this.m_rB.y + this.m_gamma;
  K.ex.y = -this.m_invIB * this.m_rB.x * this.m_rB.y;
  K.ey.x = K.ex.y;
  K.ey.y = this.m_invMassB + this.m_invIB * this.m_rB.x * this.m_rB.x + this.m_gamma;

  K.GetInverse(this.m_mass);

  //	m_C = cB + m_rB - m_targetA;
  this.m_C.x = cB.x + this.m_rB.x - this.m_targetA.x;
  this.m_C.y = cB.y + this.m_rB.y - this.m_targetA.y;
  //	m_C *= m_beta;
  this.m_C.SelfMul(this.m_beta);

  // Cheat with some damping
  wB *= 0.98;

  if (data.step.warmStarting) {
    this.m_impulse.SelfMul(data.step.dtRatio);
    //		vB += m_invMassB * m_impulse;
    vB.x += this.m_invMassB * this.m_impulse.x;
    vB.y += this.m_invMassB * this.m_impulse.y;
    wB += this.m_invIB * box2d.b2Cross_V2_V2(this.m_rB, this.m_impulse);
  } else {
    this.m_impulse.SetZero();
  }

  //	data.velocities[this.m_indexB].v = vB;
  data.velocities[this.m_indexB].w = wB;
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2SolverData} data
 */
box2d.b2MouseJoint.prototype.SolveVelocityConstraints = function(data) {
  /*box2d.b2Vec2&*/
  var vB = data.velocities[this.m_indexB].v;
  /*float32*/
  var wB = data.velocities[this.m_indexB].w;

  // Cdot = v + cross(w, r)
  //	b2Vec2 Cdot = vB + b2Cross(wB, m_rB);
  var Cdot = box2d.b2AddCross_V2_S_V2(vB, wB, this.m_rB, box2d.b2MouseJoint.prototype.SolveVelocityConstraints.s_Cdot);
  //	b2Vec2 impulse = b2Mul(m_mass, -(Cdot + m_C + m_gamma * m_impulse));
  var impulse = box2d.b2Mul_M22_V2(
    this.m_mass,
    box2d.b2Add_V2_V2(
      Cdot,
      box2d.b2Add_V2_V2(this.m_C,
        box2d.b2Mul_S_V2(this.m_gamma, this.m_impulse, box2d.b2Vec2.s_t0),
        box2d.b2Vec2.s_t0),
      box2d.b2Vec2.s_t0).SelfNeg(),
    box2d.b2MouseJoint.prototype.SolveVelocityConstraints.s_impulse);

  //	b2Vec2 oldImpulse = m_impulse;
  var oldImpulse = box2d.b2MouseJoint.prototype.SolveVelocityConstraints.s_oldImpulse.Copy(this.m_impulse);
  //	m_impulse += impulse;
  this.m_impulse.SelfAdd(impulse);
  /*float32*/
  var maxImpulse = data.step.dt * this.m_maxForce;
  if (this.m_impulse.LengthSquared() > maxImpulse * maxImpulse) {
    this.m_impulse.SelfMul(maxImpulse / this.m_impulse.Length());
  }
  //	impulse = m_impulse - oldImpulse;
  box2d.b2Sub_V2_V2(this.m_impulse, oldImpulse, impulse);

  //	vB += m_invMassB * impulse;
  vB.SelfMulAdd(this.m_invMassB, impulse);
  wB += this.m_invIB * box2d.b2Cross_V2_V2(this.m_rB, impulse);

  //	data.velocities[this.m_indexB].v = vB;
  data.velocities[this.m_indexB].w = wB;
}
box2d.b2MouseJoint.prototype.SolveVelocityConstraints.s_Cdot = new box2d.b2Vec2();
box2d.b2MouseJoint.prototype.SolveVelocityConstraints.s_impulse = new box2d.b2Vec2();
box2d.b2MouseJoint.prototype.SolveVelocityConstraints.s_oldImpulse = new box2d.b2Vec2();

/**
 * @export
 * @return {boolean}
 * @param {box2d.b2SolverData} data
 */
box2d.b2MouseJoint.prototype.SolvePositionConstraints = function(data) {
  return true;
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2MouseJoint.prototype.GetAnchorA = function(out) {
  return out.Copy(this.m_targetA);
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2MouseJoint.prototype.GetAnchorB = function(out) {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {number} inv_dt
 * @param {box2d.b2Vec2} out
 */
box2d.b2MouseJoint.prototype.GetReactionForce = function(inv_dt, out) {
  return box2d.b2Mul_S_V2(inv_dt, this.m_impulse, out);
}

/**
 * @export
 * @return {number}
 * @param {number} inv_dt
 */
box2d.b2MouseJoint.prototype.GetReactionTorque = function(inv_dt) {
  return 0;
}

/**
 * The mouse joint does not support dumping.
 * @export
 */
box2d.b2MouseJoint.prototype.Dump = function() {
  if (box2d.DEBUG) {
    box2d.b2Log("Mouse joint dumping is not supported.\n");
  }
}

/**
 * Implement b2Joint::ShiftOrigin
 * @export
 * @return {void}
 * @param {box2d.b2Vec2} newOrigin
 */
box2d.b2MouseJoint.prototype.ShiftOrigin = function(newOrigin) {
  this.m_targetA.SelfSub(newOrigin);
}
