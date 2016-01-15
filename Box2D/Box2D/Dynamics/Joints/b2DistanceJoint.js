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

goog.provide('box2d.b2DistanceJoint');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Joint');
goog.require('box2d.b2Math');

/**
 * Distance joint definition. This requires defining an anchor
 * point on both bodies and the non-zero length of the distance
 * joint. The definition uses local anchor points so that the
 * initial configuration can violate the constraint slightly.
 * This helps when saving and loading a game.
 * warning Do not use a zero or short length.
 * @export
 * @constructor
 * @extends {box2d.b2JointDef}
 */
box2d.b2DistanceJointDef = function() {
  box2d.b2JointDef.call(this, box2d.b2JointType.e_distanceJoint); // base class constructor

  this.localAnchorA = new box2d.b2Vec2();
  this.localAnchorB = new box2d.b2Vec2();
}

goog.inherits(box2d.b2DistanceJointDef, box2d.b2JointDef);

/**
 * The local anchor point relative to bodyA's origin.
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2DistanceJointDef.prototype.localAnchorA = null;

/**
 * The local anchor point relative to bodyB's origin.
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2DistanceJointDef.prototype.localAnchorB = null;

/**
 * The natural length between the anchor points.
 * @export
 * @type {number}
 */
box2d.b2DistanceJointDef.prototype.length = 1;

/**
 * The mass-spring-damper frequency in Hertz. A value of 0
 * disables softness.
 * @export
 * @type {number}
 */
box2d.b2DistanceJointDef.prototype.frequencyHz = 0;

/**
 * The damping ratio. 0 = no damping, 1 = critical damping.
 * @export
 * @type {number}
 */
box2d.b2DistanceJointDef.prototype.dampingRatio = 0;

/**
 * @export
 * @return {void}
 * @param {box2d.b2Body} b1
 * @param {box2d.b2Body} b2
 * @param {box2d.b2Vec2} anchor1
 * @param {box2d.b2Vec2} anchor2
 */
box2d.b2DistanceJointDef.prototype.Initialize = function(b1, b2, anchor1, anchor2) {
  this.bodyA = b1;
  this.bodyB = b2;
  this.bodyA.GetLocalPoint(anchor1, this.localAnchorA);
  this.bodyB.GetLocalPoint(anchor2, this.localAnchorB);
  this.length = box2d.b2Distance(anchor1, anchor2);
  this.frequencyHz = 0;
  this.dampingRatio = 0;
}

/**
 * A distance joint constrains two points on two bodies to
 * remain at a fixed distance from each other. You can view this
 * as a massless, rigid rod.
 * @export
 * @constructor
 * @extends {box2d.b2Joint}
 * @param {box2d.b2DistanceJointDef} def
 */
box2d.b2DistanceJoint = function(def) {
  box2d.b2Joint.call(this, def); // base class constructor

  this.m_u = new box2d.b2Vec2();
  this.m_rA = new box2d.b2Vec2();
  this.m_rB = new box2d.b2Vec2();
  this.m_localCenterA = new box2d.b2Vec2();
  this.m_localCenterB = new box2d.b2Vec2();

  this.m_qA = new box2d.b2Rot();
  this.m_qB = new box2d.b2Rot();
  this.m_lalcA = new box2d.b2Vec2();
  this.m_lalcB = new box2d.b2Vec2();

  this.m_frequencyHz = def.frequencyHz;
  this.m_dampingRatio = def.dampingRatio;

  this.m_localAnchorA = def.localAnchorA.Clone();
  this.m_localAnchorB = def.localAnchorB.Clone();
  this.m_length = def.length;
}

goog.inherits(box2d.b2DistanceJoint, box2d.b2Joint);

/**
 * @export
 * @type {number}
 */
box2d.b2DistanceJoint.prototype.m_frequencyHz = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2DistanceJoint.prototype.m_dampingRatio = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2DistanceJoint.prototype.m_bias = 0;

// Solver shared
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2DistanceJoint.prototype.m_localAnchorA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2DistanceJoint.prototype.m_localAnchorB = null;
/**
 * @export
 * @type {number}
 */
box2d.b2DistanceJoint.prototype.m_gamma = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2DistanceJoint.prototype.m_impulse = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2DistanceJoint.prototype.m_length = 0;

// Solver temp
/**
 * @export
 * @type {number}
 */
box2d.b2DistanceJoint.prototype.m_indexA = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2DistanceJoint.prototype.m_indexB = 0;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2DistanceJoint.prototype.m_u = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2DistanceJoint.prototype.m_rA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2DistanceJoint.prototype.m_rB = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2DistanceJoint.prototype.m_localCenterA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2DistanceJoint.prototype.m_localCenterB = null;
/**
 * @export
 * @type {number}
 */
box2d.b2DistanceJoint.prototype.m_invMassA = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2DistanceJoint.prototype.m_invMassB = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2DistanceJoint.prototype.m_invIA = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2DistanceJoint.prototype.m_invIB = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2DistanceJoint.prototype.m_mass = 0;

/**
 * @export
 * @type {box2d.b2Rot}
 */
box2d.b2DistanceJoint.prototype.m_qA = null;
/**
 * @export
 * @type {box2d.b2Rot}
 */
box2d.b2DistanceJoint.prototype.m_qB = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2DistanceJoint.prototype.m_lalcA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2DistanceJoint.prototype.m_lalcB = null;

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2DistanceJoint.prototype.GetAnchorA = function(out) {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2DistanceJoint.prototype.GetAnchorB = function(out) {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
}

/**
 * Get the reaction force given the inverse time step.
 * Unit is N.
 * @export
 * @return {box2d.b2Vec2}
 * @param {number} inv_dt
 * @param {box2d.b2Vec2} out
 */
box2d.b2DistanceJoint.prototype.GetReactionForce = function(inv_dt, out) {
  return out.Set(inv_dt * this.m_impulse * this.m_u.x, inv_dt * this.m_impulse * this.m_u.y);
}

/**
 * Get the reaction torque given the inverse time step.
 * Unit is N*m. This is always zero for a distance joint.
 * @export
 * @return {number}
 * @param {number} inv_dt
 */
box2d.b2DistanceJoint.prototype.GetReactionTorque = function(inv_dt) {
  return 0;
}

/**
 * The local anchor point relative to bodyA's origin.
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2DistanceJoint.prototype.GetLocalAnchorA = function(out) {
  return out.Copy(this.m_localAnchorA);
}

/**
 * The local anchor point relative to bodyB's origin.
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2DistanceJoint.prototype.GetLocalAnchorB = function(out) {
  return out.Copy(this.m_localAnchorB);
}

/**
 * @export
 * @return {void}
 * @param {number} length
 */
box2d.b2DistanceJoint.prototype.SetLength = function(length) {
  this.m_length = length;
}

/**
 * @export
 * @return {number}
 */
box2d.b2DistanceJoint.prototype.GetLength = function() {
  return this.m_length;
}

/**
 * Set/get frequency in Hz.
 * @export
 * @return {void}
 * @param {number} hz
 */
box2d.b2DistanceJoint.prototype.SetFrequency = function(hz) {
  this.m_frequencyHz = hz;
}

/**
 * @export
 * @return {number}
 */
box2d.b2DistanceJoint.prototype.GetFrequency = function() {
  return this.m_frequencyHz;
}

/**
 * Set/get damping ratio.
 * @export
 * @return {void}
 * @param {number} ratio
 */
box2d.b2DistanceJoint.prototype.SetDampingRatio = function(ratio) {
  this.m_dampingRatio = ratio;
}

/**
 * @export
 * @return {number}
 */
box2d.b2DistanceJoint.prototype.GetDampingRatio = function() {
  return this.m_dampingRatio;
}

/**
 * Dump joint to dmLog
 * @export
 * @return {void}
 */
box2d.b2DistanceJoint.prototype.Dump = function() {
  if (box2d.DEBUG) {
    var indexA = this.m_bodyA.m_islandIndex;
    var indexB = this.m_bodyB.m_islandIndex;

    box2d.b2Log("  /*box2d.b2DistanceJointDef*/ var jd = new box2d.b2DistanceJointDef();\n");
    box2d.b2Log("  jd.bodyA = bodies[%d];\n", indexA);
    box2d.b2Log("  jd.bodyB = bodies[%d];\n", indexB);
    box2d.b2Log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ('true') : ('false'));
    box2d.b2Log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
    box2d.b2Log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
    box2d.b2Log("  jd.length = %.15f;\n", this.m_length);
    box2d.b2Log("  jd.frequencyHz = %.15f;\n", this.m_frequencyHz);
    box2d.b2Log("  jd.dampingRatio = %.15f;\n", this.m_dampingRatio);
    box2d.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
  }
}

/**
 * @export
 * @return {void}
 * @param {box2d.b2SolverData} data
 */
box2d.b2DistanceJoint.prototype.InitVelocityConstraints = function(data) {
  this.m_indexA = this.m_bodyA.m_islandIndex;
  this.m_indexB = this.m_bodyB.m_islandIndex;
  this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
  this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
  this.m_invMassA = this.m_bodyA.m_invMass;
  this.m_invMassB = this.m_bodyB.m_invMass;
  this.m_invIA = this.m_bodyA.m_invI;
  this.m_invIB = this.m_bodyB.m_invI;

  /*box2d.b2Vec2&*/
  var cA = data.positions[this.m_indexA].c;
  /*float32*/
  var aA = data.positions[this.m_indexA].a;
  /*box2d.b2Vec2&*/
  var vA = data.velocities[this.m_indexA].v;
  /*float32*/
  var wA = data.velocities[this.m_indexA].w;

  /*box2d.b2Vec2&*/
  var cB = data.positions[this.m_indexB].c;
  /*float32*/
  var aB = data.positions[this.m_indexB].a;
  /*box2d.b2Vec2&*/
  var vB = data.velocities[this.m_indexB].v;
  /*float32*/
  var wB = data.velocities[this.m_indexB].w;

  //	var qA = new box2d.b2Rot(aA), qB = new box2d.b2Rot(aB);
  var qA = this.m_qA.SetAngle(aA),
    qB = this.m_qB.SetAngle(aB);

  //	m_rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
  box2d.b2Sub_V2_V2(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
  box2d.b2Mul_R_V2(qA, this.m_lalcA, this.m_rA);
  //	m_rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
  box2d.b2Sub_V2_V2(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
  box2d.b2Mul_R_V2(qB, this.m_lalcB, this.m_rB);
  //	m_u = cB + m_rB - cA - m_rA;
  this.m_u.x = cB.x + this.m_rB.x - cA.x - this.m_rA.x;
  this.m_u.y = cB.y + this.m_rB.y - cA.y - this.m_rA.y;

  // Handle singularity.
  var length = this.m_u.Length();
  if (length > box2d.b2_linearSlop) {
    this.m_u.SelfMul(1 / length);
  } else {
    this.m_u.SetZero();
  }

  //	float32 crAu = b2Cross(m_rA, m_u);
  var crAu = box2d.b2Cross_V2_V2(this.m_rA, this.m_u);
  //	float32 crBu = b2Cross(m_rB, m_u);
  var crBu = box2d.b2Cross_V2_V2(this.m_rB, this.m_u);
  //	float32 invMass = m_invMassA + m_invIA * crAu * crAu + m_invMassB + m_invIB * crBu * crBu;
  var invMass = this.m_invMassA + this.m_invIA * crAu * crAu + this.m_invMassB + this.m_invIB * crBu * crBu;

  // Compute the effective mass matrix.
  this.m_mass = invMass !== 0 ? 1 / invMass : 0;

  if (this.m_frequencyHz > 0) {
    var C = length - this.m_length;

    // Frequency
    var omega = 2 * box2d.b2_pi * this.m_frequencyHz;

    // Damping coefficient
    var d = 2 * this.m_mass * this.m_dampingRatio * omega;

    // Spring stiffness
    var k = this.m_mass * omega * omega;

    // magic formulas
    /*float32*/
    var h = data.step.dt;
    this.m_gamma = h * (d + h * k);
    this.m_gamma = this.m_gamma !== 0 ? 1 / this.m_gamma : 0;
    this.m_bias = C * h * k * this.m_gamma;

    invMass += this.m_gamma;
    this.m_mass = invMass !== 0 ? 1 / invMass : 0;
  } else {
    this.m_gamma = 0;
    this.m_bias = 0;
  }

  if (data.step.warmStarting) {
    // Scale the impulse to support a variable time step.
    this.m_impulse *= data.step.dtRatio;

    //		box2d.b2Vec2 P = m_impulse * m_u;
    var P = box2d.b2Mul_S_V2(this.m_impulse, this.m_u, box2d.b2DistanceJoint.prototype.InitVelocityConstraints.s_P);

    //		vA -= m_invMassA * P;
    vA.SelfMulSub(this.m_invMassA, P);
    //		wA -= m_invIA * b2Cross(m_rA, P);
    wA -= this.m_invIA * box2d.b2Cross_V2_V2(this.m_rA, P);
    //		vB += m_invMassB * P;
    vB.SelfMulAdd(this.m_invMassB, P);
    //		wB += m_invIB * b2Cross(m_rB, P);
    wB += this.m_invIB * box2d.b2Cross_V2_V2(this.m_rB, P);
  } else {
    this.m_impulse = 0;
  }

  //	data.velocities[this.m_indexA].v = vA;
  data.velocities[this.m_indexA].w = wA;
  //	data.velocities[this.m_indexB].v = vB;
  data.velocities[this.m_indexB].w = wB;
}
box2d.b2DistanceJoint.prototype.InitVelocityConstraints.s_P = new box2d.b2Vec2();

/**
 * @export
 * @return {void}
 * @param {box2d.b2SolverData} data
 */
box2d.b2DistanceJoint.prototype.SolveVelocityConstraints = function(data) {
  /*box2d.b2Vec2&*/
  var vA = data.velocities[this.m_indexA].v;
  /*float32*/
  var wA = data.velocities[this.m_indexA].w;
  /*box2d.b2Vec2&*/
  var vB = data.velocities[this.m_indexB].v;
  /*float32*/
  var wB = data.velocities[this.m_indexB].w;

  //	box2d.b2Vec2 vpA = vA + b2Cross(wA, m_rA);
  var vpA = box2d.b2AddCross_V2_S_V2(vA, wA, this.m_rA, box2d.b2DistanceJoint.prototype.SolveVelocityConstraints.s_vpA);
  //	box2d.b2Vec2 vpB = vB + b2Cross(wB, m_rB);
  var vpB = box2d.b2AddCross_V2_S_V2(vB, wB, this.m_rB, box2d.b2DistanceJoint.prototype.SolveVelocityConstraints.s_vpB);
  //	float32 Cdot = b2Dot(m_u, vpB - vpA);
  var Cdot = box2d.b2Dot_V2_V2(this.m_u, box2d.b2Sub_V2_V2(vpB, vpA, box2d.b2Vec2.s_t0));

  var impulse = (-this.m_mass * (Cdot + this.m_bias + this.m_gamma * this.m_impulse));
  this.m_impulse += impulse;

  //	box2d.b2Vec2 P = impulse * m_u;
  var P = box2d.b2Mul_S_V2(impulse, this.m_u, box2d.b2DistanceJoint.prototype.SolveVelocityConstraints.s_P);

  //	vA -= m_invMassA * P;
  vA.SelfMulSub(this.m_invMassA, P);
  //	wA -= m_invIA * b2Cross(m_rA, P);
  wA -= this.m_invIA * box2d.b2Cross_V2_V2(this.m_rA, P);
  //	vB += m_invMassB * P;
  vB.SelfMulAdd(this.m_invMassB, P);
  //	wB += m_invIB * b2Cross(m_rB, P);
  wB += this.m_invIB * box2d.b2Cross_V2_V2(this.m_rB, P);

  //	data.velocities[this.m_indexA].v = vA;
  data.velocities[this.m_indexA].w = wA;
  //	data.velocities[this.m_indexB].v = vB;
  data.velocities[this.m_indexB].w = wB;
}
box2d.b2DistanceJoint.prototype.SolveVelocityConstraints.s_vpA = new box2d.b2Vec2();
box2d.b2DistanceJoint.prototype.SolveVelocityConstraints.s_vpB = new box2d.b2Vec2();
box2d.b2DistanceJoint.prototype.SolveVelocityConstraints.s_P = new box2d.b2Vec2();

/**
 * @export
 * @return {boolean}
 * @param {box2d.b2SolverData} data
 */
box2d.b2DistanceJoint.prototype.SolvePositionConstraints = function(data) {
  if (this.m_frequencyHz > 0) {
    // There is no position correction for soft distance constraints.
    return true;
  }

  /*box2d.b2Vec2&*/
  var cA = data.positions[this.m_indexA].c;
  /*float32*/
  var aA = data.positions[this.m_indexA].a;
  /*box2d.b2Vec2&*/
  var cB = data.positions[this.m_indexB].c;
  /*float32*/
  var aB = data.positions[this.m_indexB].a;

  //	var qA = new box2d.b2Rot(aA), qB = new box2d.b2Rot(aB);
  var qA = this.m_qA.SetAngle(aA),
    qB = this.m_qB.SetAngle(aB);

  //	box2d.b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
  var rA = box2d.b2Mul_R_V2(this.m_qA, this.m_lalcA, this.m_rA); // use m_rA
  //	box2d.b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
  var rB = box2d.b2Mul_R_V2(this.m_qB, this.m_lalcB, this.m_rB); // use m_rB
  //	box2d.b2Vec2 u = cB + rB - cA - rA;
  var u = this.m_u; // use m_u
  u.x = cB.x + rB.x - cA.x - rA.x;
  u.y = cB.y + rB.y - cA.y - rA.y;

  //	float32 length = u.Normalize();
  var length = this.m_u.Normalize();
  //	float32 C = length - m_length;
  var C = length - this.m_length;
  C = box2d.b2Clamp(C, (-box2d.b2_maxLinearCorrection), box2d.b2_maxLinearCorrection);

  var impulse = (-this.m_mass * C);
  //	box2d.b2Vec2 P = impulse * u;
  var P = box2d.b2Mul_S_V2(impulse, u, box2d.b2DistanceJoint.prototype.SolvePositionConstraints.s_P);

  //	cA -= m_invMassA * P;
  cA.SelfMulSub(this.m_invMassA, P);
  //	aA -= m_invIA * b2Cross(rA, P);
  aA -= this.m_invIA * box2d.b2Cross_V2_V2(rA, P);
  //	cB += m_invMassB * P;
  cB.SelfMulAdd(this.m_invMassB, P);
  //	aB += m_invIB * b2Cross(rB, P);
  aB += this.m_invIB * box2d.b2Cross_V2_V2(rB, P);

  //	data.positions[this.m_indexA].c = cA;
  data.positions[this.m_indexA].a = aA;
  //	data.positions[this.m_indexB].c = cB;
  data.positions[this.m_indexB].a = aB;

  return box2d.b2Abs(C) < box2d.b2_linearSlop;
}
box2d.b2DistanceJoint.prototype.SolvePositionConstraints.s_P = new box2d.b2Vec2();
