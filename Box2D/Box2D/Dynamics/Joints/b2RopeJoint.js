/*
 * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
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

goog.provide('box2d.b2RopeJoint');

goog.require('box2d.b2Settings');
goog.require('box2d.b2Joint');
goog.require('box2d.b2Math');

/**
 * Rope joint definition. This requires two body anchor points
 * and a maximum lengths.
 * Note: by default the connected objects will not collide. see
 * collideConnected in box2d.b2JointDef.
 * @export
 * @constructor
 * @extends {box2d.b2JointDef}
 */
box2d.b2RopeJointDef = function() {
  box2d.b2JointDef.call(this, box2d.b2JointType.e_ropeJoint); // base class constructor

  this.localAnchorA = new box2d.b2Vec2(-1, 0);
  this.localAnchorB = new box2d.b2Vec2(1, 0);
}

goog.inherits(box2d.b2RopeJointDef, box2d.b2JointDef);

/**
 * The local anchor point relative to bodyA's origin.
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2RopeJointDef.prototype.localAnchorA = null;

/**
 * The local anchor point relative to bodyB's origin.
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2RopeJointDef.prototype.localAnchorB = null;

/**
 * The maximum length of the rope.
 * Warning: this must be larger than box2d.b2_linearSlop or the
 * joint will have no effect.
 * @export
 * @type {number}
 */
box2d.b2RopeJointDef.prototype.maxLength = 0;

/**
 * A rope joint enforces a maximum distance between two points
 * on two bodies. It has no other effect.
 * Warning: if you attempt to change the maximum length during
 * the simulation you will get some non-physical behavior. A
 * model that would allow you to dynamically modify the length
 * would have some sponginess, so I chose not to implement it
 * that way. See box2d.b2DistanceJoint if you want to
 * dynamically control length.
 * @export
 * @constructor
 * @extends {box2d.b2Joint}
 * @param {box2d.b2RopeJointDef} def
 */
box2d.b2RopeJoint = function(def) {
  box2d.b2Joint.call(this, def); // base class constructor

  this.m_localAnchorA = def.localAnchorA.Clone();
  this.m_localAnchorB = def.localAnchorB.Clone();
  this.m_maxLength = def.maxLength;

  this.m_u = new box2d.b2Vec2();
  this.m_rA = new box2d.b2Vec2();
  this.m_rB = new box2d.b2Vec2();
  this.m_localCenterA = new box2d.b2Vec2();
  this.m_localCenterB = new box2d.b2Vec2();

  this.m_qA = new box2d.b2Rot();
  this.m_qB = new box2d.b2Rot();
  this.m_lalcA = new box2d.b2Vec2();
  this.m_lalcB = new box2d.b2Vec2();
}

goog.inherits(box2d.b2RopeJoint, box2d.b2Joint);

// Solver shared
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2RopeJoint.prototype.m_localAnchorA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2RopeJoint.prototype.m_localAnchorB = null;
/**
 * @export
 * @type {number}
 */
box2d.b2RopeJoint.prototype.m_maxLength = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2RopeJoint.prototype.m_length = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2RopeJoint.prototype.m_impulse = 0;

// Solver temp
/**
 * @export
 * @type {number}
 */
box2d.b2RopeJoint.prototype.m_indexA = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2RopeJoint.prototype.m_indexB = 0;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2RopeJoint.prototype.m_u = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2RopeJoint.prototype.m_rA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2RopeJoint.prototype.m_rB = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2RopeJoint.prototype.m_localCenterA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2RopeJoint.prototype.m_localCenterB = null;
/**
 * @export
 * @type {number}
 */
box2d.b2RopeJoint.prototype.m_invMassA = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2RopeJoint.prototype.m_invMassB = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2RopeJoint.prototype.m_invIA = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2RopeJoint.prototype.m_invIB = 0;
/**
 * @export
 * @type {number}
 */
box2d.b2RopeJoint.prototype.m_mass = 0;
/**
 * @export
 * @type {box2d.b2LimitState}
 */
box2d.b2RopeJoint.prototype.m_state = box2d.b2LimitState.e_inactiveLimit;

/**
 * @export
 * @type {box2d.b2Rot}
 */
box2d.b2RopeJoint.prototype.m_qA = null;
/**
 * @export
 * @type {box2d.b2Rot}
 */
box2d.b2RopeJoint.prototype.m_qB = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2RopeJoint.prototype.m_lalcA = null;
/**
 * @export
 * @type {box2d.b2Vec2}
 */
box2d.b2RopeJoint.prototype.m_lalcB = null;

/**
 * @export
 * @return {void}
 * @param {box2d.b2SolverData} data
 */
box2d.b2RopeJoint.prototype.InitVelocityConstraints = function(data) {
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

  /*box2d.b2Rot*/
  var qA = this.m_qA.SetAngle(aA),
    qB = this.m_qB.SetAngle(aB);

  //  this.m_rA = b2Mul(qA, this.m_localAnchorA - this.m_localCenterA);
  box2d.b2Sub_V2_V2(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
  box2d.b2Mul_R_V2(qA, this.m_lalcA, this.m_rA);
  //  this.m_rB = b2Mul(qB, this.m_localAnchorB - this.m_localCenterB);
  box2d.b2Sub_V2_V2(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
  box2d.b2Mul_R_V2(qB, this.m_lalcB, this.m_rB);
  //  this.m_u = cB + this.m_rB - cA - this.m_rA;
  this.m_u.Copy(cB).SelfAdd(this.m_rB).SelfSub(cA).SelfSub(this.m_rA);

  this.m_length = this.m_u.Length();

  /*float32*/
  var C = this.m_length - this.m_maxLength;
  if (C > 0) {
    this.m_state = box2d.b2LimitState.e_atUpperLimit;
  } else {
    this.m_state = box2d.b2LimitState.e_inactiveLimit;
  }

  if (this.m_length > box2d.b2_linearSlop) {
    this.m_u.SelfMul(1 / this.m_length);
  } else {
    this.m_u.SetZero();
    this.m_mass = 0;
    this.m_impulse = 0;
    return;
  }

  // Compute effective mass.
  /*float32*/
  var crA = box2d.b2Cross_V2_V2(this.m_rA, this.m_u);
  /*float32*/
  var crB = box2d.b2Cross_V2_V2(this.m_rB, this.m_u);
  /*float32*/
  var invMass = this.m_invMassA + this.m_invIA * crA * crA + this.m_invMassB + this.m_invIB * crB * crB;

  this.m_mass = invMass !== 0 ? 1 / invMass : 0;

  if (data.step.warmStarting) {
    // Scale the impulse to support a variable time step.
    this.m_impulse *= data.step.dtRatio;

    //    b2Vec2 P = m_impulse * m_u;
    var P = box2d.b2Mul_S_V2(this.m_impulse, this.m_u, box2d.b2RopeJoint.prototype.InitVelocityConstraints.s_P);
    //    vA -= m_invMassA * P;
    vA.SelfMulSub(this.m_invMassA, P);
    wA -= this.m_invIA * box2d.b2Cross_V2_V2(this.m_rA, P);
    //    vB += m_invMassB * P;
    vB.SelfMulAdd(this.m_invMassB, P);
    wB += this.m_invIB * box2d.b2Cross_V2_V2(this.m_rB, P);
  } else {
    this.m_impulse = 0;
  }

  //  data.velocities[this.m_indexA].v = vA;
  data.velocities[this.m_indexA].w = wA;
  //  data.velocities[this.m_indexB].v = vB;
  data.velocities[this.m_indexB].w = wB;
}
box2d.b2RopeJoint.prototype.InitVelocityConstraints.s_P = new box2d.b2Vec2();

/**
 * @export
 * @return {void}
 * @param {box2d.b2SolverData} data
 */
box2d.b2RopeJoint.prototype.SolveVelocityConstraints = function(data) {
  /*box2d.b2Vec2&*/
  var vA = data.velocities[this.m_indexA].v;
  /*float32*/
  var wA = data.velocities[this.m_indexA].w;
  /*box2d.b2Vec2&*/
  var vB = data.velocities[this.m_indexB].v;
  /*float32*/
  var wB = data.velocities[this.m_indexB].w;

  // Cdot = dot(u, v + cross(w, r))
  //  b2Vec2 vpA = vA + b2Cross(wA, m_rA);
  var vpA = box2d.b2AddCross_V2_S_V2(vA, wA, this.m_rA, box2d.b2RopeJoint.prototype.SolveVelocityConstraints.s_vpA);
  //  b2Vec2 vpB = vB + b2Cross(wB, m_rB);
  var vpB = box2d.b2AddCross_V2_S_V2(vB, wB, this.m_rB, box2d.b2RopeJoint.prototype.SolveVelocityConstraints.s_vpB);
  //  float32 C = m_length - m_maxLength;
  /*float32*/
  var C = this.m_length - this.m_maxLength;
  //  float32 Cdot = b2Dot(m_u, vpB - vpA);
  /*float32*/
  var Cdot = box2d.b2Dot_V2_V2(this.m_u, box2d.b2Sub_V2_V2(vpB, vpA, box2d.b2Vec2.s_t0));

  // Predictive constraint.
  if (C < 0) {
    Cdot += data.step.inv_dt * C;
  }

  /*float32*/
  var impulse = -this.m_mass * Cdot;
  /*float32*/
  var oldImpulse = this.m_impulse;
  this.m_impulse = box2d.b2Min(0, this.m_impulse + impulse);
  impulse = this.m_impulse - oldImpulse;

  //  b2Vec2 P = impulse * m_u;
  var P = box2d.b2Mul_S_V2(impulse, this.m_u, box2d.b2RopeJoint.prototype.SolveVelocityConstraints.s_P);
  //  vA -= m_invMassA * P;
  vA.SelfMulSub(this.m_invMassA, P);
  wA -= this.m_invIA * box2d.b2Cross_V2_V2(this.m_rA, P);
  //  vB += m_invMassB * P;
  vB.SelfMulAdd(this.m_invMassB, P);
  wB += this.m_invIB * box2d.b2Cross_V2_V2(this.m_rB, P);

  //  data.velocities[this.m_indexA].v = vA;
  data.velocities[this.m_indexA].w = wA;
  //  data.velocities[this.m_indexB].v = vB;
  data.velocities[this.m_indexB].w = wB;
}
box2d.b2RopeJoint.prototype.SolveVelocityConstraints.s_vpA = new box2d.b2Vec2();
box2d.b2RopeJoint.prototype.SolveVelocityConstraints.s_vpB = new box2d.b2Vec2();
box2d.b2RopeJoint.prototype.SolveVelocityConstraints.s_P = new box2d.b2Vec2();

/**
 * @export
 * @return {boolean}
 * @param {box2d.b2SolverData} data
 */
box2d.b2RopeJoint.prototype.SolvePositionConstraints = function(data) {
  /*box2d.b2Vec2&*/
  var cA = data.positions[this.m_indexA].c;
  /*float32*/
  var aA = data.positions[this.m_indexA].a;
  /*box2d.b2Vec2&*/
  var cB = data.positions[this.m_indexB].c;
  /*float32*/
  var aB = data.positions[this.m_indexB].a;

  /*box2d.b2Rot*/
  var qA = this.m_qA.SetAngle(aA),
    qB = this.m_qB.SetAngle(aB);

  //  b2Vec2 rA = b2Mul(qA, this.m_localAnchorA - this.m_localCenterA);
  box2d.b2Sub_V2_V2(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
  var rA = box2d.b2Mul_R_V2(qA, this.m_lalcA, this.m_rA);
  //  b2Vec2 rB = b2Mul(qB, this.m_localAnchorB - this.m_localCenterB);
  box2d.b2Sub_V2_V2(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
  var rB = box2d.b2Mul_R_V2(qB, this.m_lalcB, this.m_rB);
  //  b2Vec2 u = cB + rB - cA - rA;
  /*box2d.b2Vec2*/
  var u = this.m_u.Copy(cB).SelfAdd(rB).SelfSub(cA).SelfSub(rA);

  /*float32*/
  var length = u.Normalize();
  /*float32*/
  var C = length - this.m_maxLength;

  C = box2d.b2Clamp(C, 0, box2d.b2_maxLinearCorrection);

  /*float32*/
  var impulse = -this.m_mass * C;
  //  b2Vec2 P = impulse * u;
  var P = box2d.b2Mul_S_V2(impulse, u, box2d.b2RopeJoint.prototype.SolvePositionConstraints.s_P);

  //  cA -= m_invMassA * P;
  cA.SelfMulSub(this.m_invMassA, P);
  aA -= this.m_invIA * box2d.b2Cross_V2_V2(rA, P);
  //  cB += m_invMassB * P;
  cB.SelfMulAdd(this.m_invMassB, P);
  aB += this.m_invIB * box2d.b2Cross_V2_V2(rB, P);

  //  data.positions[this.m_indexA].c = cA;
  data.positions[this.m_indexA].a = aA;
  //  data.positions[this.m_indexB].c = cB;
  data.positions[this.m_indexB].a = aB;

  return length - this.m_maxLength < box2d.b2_linearSlop;
}
box2d.b2RopeJoint.prototype.SolvePositionConstraints.s_P = new box2d.b2Vec2();

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2RopeJoint.prototype.GetAnchorA = function(out) {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2RopeJoint.prototype.GetAnchorB = function(out) {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
}

/**
 * @export
 * @return {box2d.b2Vec2}
 * @param {number} inv_dt
 * @param {box2d.b2Vec2} out
 */
box2d.b2RopeJoint.prototype.GetReactionForce = function(inv_dt, out) {
  /*box2d.b2Vec2*/
  var F = box2d.b2Mul_S_V2((inv_dt * this.m_impulse), this.m_u, out);
  return F;
  //  return out.Set(inv_dt * this.m_linearImpulse.x, inv_dt * this.m_linearImpulse.y);
}

/**
 * @export
 * @return {number}
 * @param {number} inv_dt
 */
box2d.b2RopeJoint.prototype.GetReactionTorque = function(inv_dt) {
  return 0;
}

/**
 * The local anchor point relative to bodyA's origin.
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2RopeJoint.prototype.GetLocalAnchorA = function(out) {
  return out.Copy(this.m_localAnchorA);
}

/**
 * The local anchor point relative to bodyB's origin.
 * @export
 * @return {box2d.b2Vec2}
 * @param {box2d.b2Vec2} out
 */
box2d.b2RopeJoint.prototype.GetLocalAnchorB = function(out) {
  return out.Copy(this.m_localAnchorB);
}

/**
 * Set/Get the maximum length of the rope.
 * @export
 * @return {void}
 * @param {number} length
 */
box2d.b2RopeJoint.prototype.SetMaxLength = function(length) {
    this.m_maxLength = length;
  }
  /**
   * @export
   * @return {number}
   */
box2d.b2RopeJoint.prototype.GetMaxLength = function() {
  return this.m_maxLength;
}

/**
 * @export
 * @return {box2d.b2LimitState}
 */
box2d.b2RopeJoint.prototype.GetLimitState = function() {
  return this.m_state;
}

/**
 * Dump joint to dmLog
 * @export
 * @return {void}
 */
box2d.b2RopeJoint.prototype.Dump = function() {
  if (box2d.DEBUG) {
    var indexA = this.m_bodyA.m_islandIndex;
    var indexB = this.m_bodyB.m_islandIndex;

    box2d.b2Log("  /*box2d.b2RopeJointDef*/ var jd = new box2d.b2RopeJointDef();\n");
    box2d.b2Log("  jd.bodyA = bodies[%d];\n", indexA);
    box2d.b2Log("  jd.bodyB = bodies[%d];\n", indexB);
    box2d.b2Log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ('true') : ('false'));
    box2d.b2Log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
    box2d.b2Log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
    box2d.b2Log("  jd.maxLength = %.15f;\n", this.m_maxLength);
    box2d.b2Log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
  }
}
